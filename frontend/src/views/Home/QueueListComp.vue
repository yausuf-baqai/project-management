<template>
    <div class="queue__list-wrapper pb-28px">
        <div class="queue__title-wrapper d-flex align-items-center mb-10px">
            <h2 class="font-size-22 font-weight-500 black font-roboto-sans m-0 d-flex align-items-center position-re quelist__title">Queue List<span class="font-size-13 font-weight-400 GunPowder ml-10px">({{ searchResultTotal }})</span></h2>
            <button class="btn__task ml-10px border-radius-4-px black font-weight-400 border-0 font-size-12 cursor-pointer bg-colorlightgray mr-2px vertical-middle" @click="queueButtonClick"> + Add to Queue</button>
            <div v-if="allProjectsArrayFilter.length">
                <ConvertToSubTaskSidebar @dataToMainComp="(ele)=>{taskOperations(ele,'add')}" :allProjectsArrayFilter="allProjectsArrayFilter" v-if="openConvertSubTaskSidebar === true" :closeSideBar="openConvertSubTaskSidebar"  @isConvertSubtaskOPen="(val) => {openConvertSubTaskSidebar = val}" :openMoveSubTask="false" :isMergeTask="false" :isDuplicate="false" :selectedProjectObject="allProjectsArrayFilter[0]" :fromWhich="'dashboard'"/>   
            </div>
        </div>
        <div class="queue__list-task d-flex style-scroll-6-px d-flex" v-if="searchResults.length && !isSpinner" @scroll="scrollFunction" @mousewheel="handleMouseWheel">
            <singleQueueList v-for="data in searchResults" @openTaskDetailSidebar="sidebarDataMange" :key="data._id" :Taskdata="data" @removeTaskFromQueueData="(ele)=>{taskOperations(ele,'remove')}"/>
        </div>
        <div class="text-center" v-else-if="!searchResults.length && !isSpinner">
            No queue list found
        </div>
        <div class="queue__list-task d-flex style-scroll-6-px d-flex" v-else>
            <SkelatonVue :style="{width: '313px', height: '40px', margin: '5px 0px 5px 5px'}" :class="{}"/>
            <SkelatonVue :style="{width: '313px', height: '40px', margin: '5px 0px 5px 5px'}" :class="{}"/>
            <!-- <SkelatonVue :style="{width: '313px', height: '30px', margin: '5px 0px 5px 5px'}" :class="{}"/> -->
        </div>
    </div>
</template>
<script setup>
import {defineComponent, ref,computed, inject, onMounted } from 'vue';
// import SkelatonVue from '../Skelaton/Skelaton.vue';
import SkelatonVue from '../../components/atom/Skelaton/Skelaton.vue';
import singleQueueList from './singleQueueList.vue';
import ConvertToSubTaskSidebar from '@/components/molecules/ConvertToSubTaskSidebar/ConvertToSubTaskSidebar.vue';
import { dbCollections } from '@/utils/FirebaseCollections';
import { useStore } from 'vuex';
import { useToast } from "vue-toast-notification"
import taskClass from "@/utils/TaskOperations";
import { BSON } from 'realm-web';
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { useGetterFunctions } from '@/composable';
const $toast = useToast();
const { getters } = useStore();
defineComponent({
    name: 'QueueList',
	components: {
        singleQueueList
	}
})
const emit = defineEmits([
    'openTaskDetail'
])
//Computed
const projectsGetter = computed(() => getters["projectData/onlyActiveProjects"]);

//Define Var
const allProjectsArrayFilter = ref([]);
const searchResults = ref([]);
const searchResultTotal = ref(0);
const isSpinner = ref(false);
const timer = ref(null);
const pageNumber = ref(1);
const addcount = ref(0);
const remcount = ref(0);
const companyId = inject("$companyId");
const userId = inject('$userId');
const openConvertSubTaskSidebar = ref(false);
const {getUser} = useGetterFunctions();
const taskOperations = (obj, action) => {
    if (action === 'add') {
        searchResults.value.push(obj);
        searchResultTotal.value += 1;
        openConvertSubTaskSidebar.value = false;
        addcount.value += 1;
    } else if (action === 'remove') {
        let findIndex = searchResults.value.findIndex((ele) => {
            return ele._id == obj._id;
        });
        if (findIndex !== -1) {
            searchResults.value.splice(findIndex, 1);
            searchResultTotal.value -= 1;
            remcount.value += 1;
        }
    }
    const user = getUser(userId.value);
    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId
    }
    taskClass.updateQueueList({CompanyId:obj.CompanyId, projectId:obj.ProjectID, sprintId:obj.sprintId, taskId:obj._id,userId:userId.value,actionType:action,taskName:obj.TaskName,userData:userData})
    .then(() => {
        if(searchResults.value.length == 9 && searchResultTotal.value - searchResults.value.length > 0) {
            if(addcount.value == 10) {
                addcount.value = 0;
                pageNumber.value += 1;
            }
            if(remcount.value == 10){
                remcount.value = 0;
                pageNumber.value -= 1;
            }
            getAllQueueListData(false);
        }
        $toast.success(`Queue list ${action == 'add' ? 'added' : 'removed'} successfully`,{position: 'top-right'});
    })
    .catch((error) => {
        console.error("ERROR in update QueueList: ", error);
        $toast.error('QueueList not updated',{position: 'top-right'});
    })
};
const queueButtonClick = () =>{
    if(projectsGetter.value && projectsGetter.value.data.length){
        openConvertSubTaskSidebar.value = true;
        allProjectsArrayFilter.value = projectsGetter.value.data.filter((x) => x.id !== '6571e7195470e64b1203295c')
    }
}

onMounted(()=>{
    getAllQueueListData();
})
const getAllQueueListData = (reset = true) => {
    try {
        isSpinner.value = true;
        if(reset) {
            searchResults.value = [];
            pageNumber.value = 1;
        }

   let obj = [
            {$match: {$and: [
                {CompanyId: BSON.ObjectId(companyId.value)},
                {AssigneeUserId: {$in: [userId.value]}},
                {queueListArray: {$in: [userId.value]}},
                {deletedStatusKey: 0},
            ]}},
        ]

        const query = {
                type: 'aggregate',
                collection: dbCollections.TASKS,
                data: [obj]
            }
        mongodbCrudOperations(query)
        .then((result) => {
            if(reset) {
                searchResultTotal.value = result.length;
            }
            if(!result.length) {
                isSpinner.value = false;
                return;
            }
            pageNumber.value = pageNumber.value + 1;
            result.forEach(x => {
                let findIndex = searchResults.value.findIndex((ele)=>{return ele._id == x._id});
                if(findIndex == -1) {
                    searchResults.value.push({...x});
                }
            });
            isSpinner.value = false;
        }).catch((error) => {
            isSpinner.value = false;
            console.error("ERROR in: ", error);
        })
    } catch (error) {
        isSpinner.value = false;
        console.error(error);
    }
}

const scrollFunction = (e) => {
    debouncer(50).then(() => {
        if (e.target.scrollLeft >= (e.target.scrollWidth - e.target.clientWidth) - 200) {
            getAllQueueListData(false)
        }
    })
}

function debouncer(timeout = 1000) {
    return new Promise((resolve) => {
        if(timer.value) {
            clearTimeout(timer.value);
        }
        timer.value = setTimeout(() => {
            resolve();
        }, timeout);
    })
}
function handleMouseWheel(event) {
    const delta = event.deltaY;
    const scrollContainer = document.querySelector('.queue__list-task');
    scrollContainer.scrollLeft += delta;
    event.preventDefault();
}
function sidebarDataMange(taskObj) {
    emit('openTaskDetail',taskObj);
}
</script>

<style scoped src="../Home/style.css"></style>