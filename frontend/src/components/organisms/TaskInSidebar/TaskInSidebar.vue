<template>
    <SpinnerComp :is-spinner="isSpiner" v-if="isSpiner"/>
    <div :style="`${!data.isParentTask ? 'height: 45px;' : ''}`" class="dark-gray task__name-sidebar d-flex align-items-center justify-content-between" v-if="(props.fromWhich !== ''  && props.fromWhich == 'dashboard') || (data._id !== task._id && task.ParentTaskId !== data._id)">
        <div class="d-flex align-items-center task__desckey-wrapper w-100">
            <div class="d-flex align-items-center task__desc-wrapper text-ellipsis" :class="[{'pointer-event-none' : isSpiner == true}]" :style="[{width : clientWidth > 767 ? '59%' : '50%'}]"  @click="selectTask(data)">
                <div class="taskStatusInSidebar" :style="[{'background-color': taskStatus && taskStatus.textColor,'color':taskStatus && taskStatus.textColor}]"></div>
                <div class="text-ellipsis pr-10px pl-2px">
                    <!-- <div v-if="data.isParentTask === false"><span class="text-ellipsis gray parent-taskname-merge font-size-12">{{taskData.filter((x) => x.id === data.ParentTaskId)[0]?.TaskName}}</span></div> -->
                    <div v-if="data.isParentTask === false" class="text-ellipsis d-block w-100 data__is-parenttask"><span class="text-ellipsis gray parent-taskname-merge font-size-11 font-weight-400 text-capitalize">{{taskData.filter((x) => x._id === data.ParentTaskId)[0]?.TaskName || data.parentTaskName}}</span></div>
                    <div class="text-ellipsis d-block w-100 mt--1px">
                        <img v-if="data.isParentTask === false" :src="subTaskDefineArrowImg">
                        <span class="text-ellipsis converted__subtask-nam font-size-14 font-weight-400 ml-5px text-capitalize">{{data.TaskName}}</span>
                    </div>
                </div>
            </div>
            <div class="d-flex align-items-center justify-content-start task__key-wrapper">
                <span class="text-ellipsis converted__subtask-key gray81 pr-15px" :class="{'font-size-12' : clientWidth > 767, 'font-size-14' : clientWidth <= 767}">{{data.TaskKey}}</span>       
            </div>
            <div class="task__userimage-wrapper d-flex align-items-center justify-content-end task__assignee-wrapper" v-if="getAssignes.length > 0">
                    <UserProfile
                        v-for="user in getAssignes.filter((x, index) => index < 1)"
                        :key="user._id"
                        :showDot="true" :data="{ image: user.Employee_profileImage,title: user.Employee_Name}"
                        width="25px" class="cursor-pointer converted__subtask-image"
                        :thumbnail="'25x25'"
                    />
                    <DropDown :id="'timeloguser_'" v-if="getAssignes.length > 1">
                        <template #button>
                            <div class="d-flex align-items-center justify-content-center profile-image GunPowder black text-nowrap font-size-12 border-2px-blue ml--5px bg-colorlightgray">
                                +{{getAssignes.length - 1}}
                            </div>
                        </template>
                        <template #options>
                            <DropDownOption
                                v-for="(user, index) in getAssignes.filter((x, index) => index >= 1).map((x) => ({...x,label: x.Employee_Name, image: x.profileImage}))"
                                :key="'user'+index" @click="usersFilter(user)"
                            >
                                <div class="d-flex align-items-center" :title="user.label">
                                    <!-- <img :src="user.image" class="profile-image" alt="user image"> -->
                                    <UserProfile
                                        :showDot="true"
                                        :data="{ image: user.Employee_profileImage, title: user.Employee_Name}"
                                        width="25px" class="cursor-pointer converted__subtask-image"
                                    />
                                    <span class="ml-10px">{{ user.label }}</span>
                                </div>
                            </DropDownOption>
                        </template>
                    </DropDown>
            </div>
            <div class="gray81 font-size-12 ml-auto" v-else>N/A</div>
        </div>
        <ConfirmationsInTask
            :subTaskConfirm="subTaskConfirm"
            :taskConfirm = "taskConfirm"
            :taskTypeConfirm="taskTypeConfirm"
            v-model="showSidebar"
            :statusConfirm="statusConfirm"
            :oldStatus="oldStatus"
            :oldTaskType="oldTaskType"
            @checkAllModel="checkAllModel"
            @checkTaskType="checkTaskType"
            :task="task"
            :selectedConvertTask="selectedConvertTask"
            :selectedProjectData="selectedProjectData"
            :data="data"
            :errorMsgType="errorMsgType"
            @changeStatus="changeStatus"
            @changeTaskType="changeTaskType"
            @finalConfirm="confirmData"
         />
    </div>
</template>

<script setup>
import { defineProps, computed, ref, inject, watch, nextTick, defineEmits } from 'vue';
import { useStore } from 'vuex';
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import taskClass from "@/utils/TaskOperations";
// import { useDocument } from 'vuefire';
import { dbCollections } from '@/utils/FirebaseCollections';
import ConfirmationsInTask from "@/components/atom/ConfirmationsInTask/ConfirmationsInTask.vue"
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';

import { useRoute, useRouter } from 'vue-router';
import { useToast } from "vue-toast-notification";
import { BSON } from 'realm-web';
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { useGetterFunctions } from '@/composable';
const emit = defineEmits([
    'dataToParent','closeTaskSidebar'
])

const route = useRoute();
const router = useRouter();
const { getters } = useStore();
const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    selectedProjectData: {
        type: Object,
    },
    selectedSprintData: {
        type: Object,
    },
    isMergeTask: {
        type: Boolean,
        default:false
    },
    taskData: {
        type:Array
    },
    task : {
        type:Object
    },
    fromWhich : {
        type:String,
        default:''
    }
})
const companyId = inject('$companyId');
const clientWidth = inject("$clientWidth");
const userId = inject("$userId");
const usersData = ref(getters["users/users"]);
const showSidebar = ref(false);
const selectedConvertTask = ref({});
const subTaskConfirm = ref(false);
const statusConfirm = ref(false);
const projectData = (props.fromWhich == undefined || props.fromWhich == '') ? inject("selectedProject") : {};
const convertedSubTask = ref([]);
const $toast = useToast();
const isConfirm = ref(false);
const errorMsg = ref('');
const taskTypeConfirm = ref(false);
const isTest = ref(false);
const errorMsgType = ref('');
const toggleTaskDetail = (props.fromWhich == undefined || props.fromWhich == '') ? inject('toggleTaskDetail') : {};
const isSpiner = ref(false);
const subTaskDefineArrowImg = require("@/assets/images/svg/sub_task_define_arrow.svg");
const taskConfirm = ref(false)
const {getUser} = useGetterFunctions()

const getAssignes = computed(() => {
    let finalArray = []
    let tempTaskAssigne = Object.keys(props.data).length > 0 ? props.data.AssigneeUserId : [];
    if(Object.keys(usersData.value).length && usersData.value && usersData.value.length > 0){
        let tempArray = [];
        usersData.value.map((item)=>{
            if(tempTaskAssigne.includes(item._id)){
                tempArray.push({...item,'profileImage':item.Employee_profileImageURL ? item.Employee_profileImageURL : ''})
            }
        })
        finalArray = tempArray
    }
    return finalArray
})

const checkSubTask = () => {
    return new Promise((resolve, reject) => {
        try {
            let queryObj = [
                {
                    ProjectID:BSON.ObjectID(route.params.id),
                    isParentTask: false,
                    sprintId: BSON.ObjectID(props.task.sprintId)
                }
            ];
            const query = {
                type: "find",
                collection: dbCollections.TASKS,
                data: queryObj
            };
            mongodbCrudOperations(query)
            .then((result) => {
            if(result.length === 0){
                if(props.isMergeTask === false){
                    resolve(false);
                    showSidebar.value = true;
                    taskConfirm.value = true;
                }else{
                    resolve('noSubTask');
                }
            }
            result.filter((x)=>{
                if(x.ParentTaskId === props.task._id){
                    subTaskConfirm.value = true;
                    showSidebar.value = true;
                    const doc = x;
                    convertedSubTask.value.push(doc);
                    if(isConfirm.value === true){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }else{
                    if(props.isMergeTask === false){
                        resolve(false);
                        showSidebar.value = true;
                        taskConfirm.value = true;
                    }else{
                        resolve('noSubTask');
                    }
                }
            })
        }).catch((error) => {
            console.error(error, "error");
        })
        } catch (error) {
            reject(false);
            console.error(error,"error");
        }
    })
}

const oldStatus = computed(() => {
    let data = [];
    let uniqueArray = [];
    if(projectData.value && Object.keys(projectData.value).length) {
        projectData.value.taskStatusData.filter((x) => {
            x.convertStatus = ''
            convertedSubTask.value.filter((y)=>{
                if(x.key === y.statusKey){
                    data.push(x);
                }
            })
            uniqueArray = [...new Set(data)];
        })
    }
    return uniqueArray;
})

const oldTaskType = computed(() => {
    let data = [];
    let uniqueArray = [];
    if(projectData.value && Object.keys(projectData.value).length) {
        projectData.value.taskTypeCounts.filter((x) => {
            x.convertType = ''
            convertedSubTask.value.filter((y)=>{
                if(x.value === y.TaskType){
                    data.push(x);
                }
            })
            uniqueArray = [...new Set(data)];
        })
    }
    return uniqueArray;
})

const checkAllModel = () => {
    return new Promise((resolve, reject) => {
        try {
            isConfirm.value = true;
            convertedSubTask.value = props.isMergeTask === false ?  [...convertedSubTask.value, props.task] : convertedSubTask.value;
            if(selectedConvertTask.value.ProjectID !== props.task.ProjectID){
                showSidebar.value = true;
                statusConfirm.value = true;
                subTaskConfirm.value = false;
                taskConfirm.value = false;
                if(isTest.value === true){
                    resolve(true);
                }else{
                    resolve(false);
                }
            }else{
                showSidebar.value = false;
                resolve(true);
                if(props.isMergeTask === true && isSpiner.value == false){
                    mergeTask();
                }else{
                    convertTaskToSub();
                }
            }
        } catch (error) {
            reject(false);
            console.error(error,"error");
        }
    })
}

const checkTaskType = () => {
    return new Promise((resolve, reject) => {
        try {
            isTest.value = true;
            if(selectedConvertTask.value.ProjectID !== props.task.ProjectID){
                oldStatus.value.filter((x) => {
                    if(x.convertStatus === undefined || x.convertStatus === ''){
                        errorMsg.value = 'Please Select Status';
                    }else{
                        errorMsg.value = '';
                    }
                })
                if(errorMsg.value !== ''){
                    return false;
                }
                statusConfirm.value = false;
                showSidebar.value = true;
                taskTypeConfirm.value = true;
                resolve(true);
            }else{
                showSidebar.value = false;
                resolve(true);
                if(props.isMergeTask === true){
                    mergeTask();
                }else{
                    convertTaskToSub();
                }
            }
        } catch (error) {
            reject(false);
        }
    })
}
const taskStatus = computed(() => {
    return props.selectedProjectData.taskStatusData.find((x) => x.key === props.data.statusKey)
})

const selectTask = (data) => {
    selectedConvertTask.value = data;
    if(props.fromWhich !== undefined && props.fromWhich == 'dashboard') {
        emit('dataToParent', {...data});
    } else {
        if(selectedConvertTask.value.status && typeof selectedConvertTask.value.status === "string"){
            selectedConvertTask.value.status = JSON.parse(selectedConvertTask.value.status)
        }
        if(props.isMergeTask === true){
            isTest.value = false;
            isConfirm.value = false;
            checkSubTask(data).then((res) => {
                if(res === true){
                    checkAllModel();
                }
                if(res === 'noSubTask'){
                    mergeTask();
                }
            }).catch((err) => {
                console.error(err,"err");
            })
        }else{
            isTest.value = false;
            isConfirm.value = false;
            checkSubTask(data).then((res) => {
                if(res === true){
                    checkAllModel();
                }
            }).catch((err) => {
                convertTaskToSub()
                console.error(err,"err");
            })
        }
    }
}

const changeStatus = (st,st1) => {
    projectData.value.taskStatusData.filter((val) => {
        if(val.key === st1.key){
            val['convertStatus'] = st;
        }
    })
}

const changeTaskType = (type,type1) => {
    projectData.value.taskTypeCounts.filter((val) => {
        if(val.value === type1.value){
            val['convertType'] = type;
        }
    })
}

const convertTaskToSub = () => {
    if(selectedConvertTask.value.ProjectID !== props.task.ProjectID){
        oldTaskType.value.filter((x) => {
            if(x.convertType === undefined || x.convertType === ''){
                errorMsgType.value = 'Please Select Task Type';
            }else{
                errorMsgType.value = '';
            }
        })
    }
    if(errorMsgType.value !== ''){
        return false;
    }
    if(isSpiner.value == true){
        return;
    }
    const user = getUser(userId.value)

    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId,
    }
    isSpiner.value = true;
    taskClass.convertToSubTask({
        companyId: companyId.value,
        projectData: {
            id:props.selectedProjectData._id,
            ProjectName :props.selectedProjectData.ProjectName
        },
        sprintId: selectedConvertTask.value.sprintId,
        selectedTaskId:props.task._id,
        taskId: selectedConvertTask.value._id,
        oldProject : {
            id : projectData.value._id,
            taskTypeCounts : projectData.value.taskTypeCounts,
            taskStatusData : projectData.value.taskStatusData,
            ProjectName : projectData.value.ProjectName
        },
        isSubTask : convertedSubTask.value.length > 1 ? true : false,
        userData : userData
    })
    .then(() => {
        toggleTaskDetail(selectedConvertTask.value);
        let paramsObj = {};
        if(selectedConvertTask.value.sprintId && !selectedConvertTask.value.folderObjId){
            paramsObj = {
                cid: companyId.value,
                id: selectedConvertTask.value.ProjectID,
                sprintId: selectedConvertTask.value.sprintId,
                taskId: selectedConvertTask.value._id
            }
        }else if(selectedConvertTask.value.folderObjId){
            paramsObj = {
                cid: companyId.value,
                id: selectedConvertTask.value.ProjectID,
                sprintId: selectedConvertTask.value.sprintId,
                folderId: selectedConvertTask.value.folderObjId,
                taskId: selectedConvertTask.value._id
            }
        }
        nextTick(() => {
            isSpiner.value = false;
            router.push({
                name: selectedConvertTask.value.folderObjId ? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
                params: paramsObj,
                query: {...route.query, detailTab: 'task-detail-tab'}
            })
        })
        emit("closeTaskSidebar",false);
        $toast.success("Task converted sucessfully",{position: 'top-right'});
    })
    .catch((err) => {
        console.error(err);
        isSpiner.value = false;
    })
}

const mergeTask = () => {
    if(isSpiner.value == true){
        return;
    }
    isSpiner.value = true;
    const user = getUser(userId.value)

    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId,
    }
    taskClass.mergeTask({
        companyId: companyId.value,
        projectData: {
            id : props.selectedProjectData._id,
            ProjectName : props.selectedProjectData.ProjectName
        },
        taskId: props.task._id,
        mergeTaskId: selectedConvertTask.value._id,
        oldProject : {
            id : projectData.value._id,
            taskTypeCounts : projectData.value.taskTypeCounts,
            taskStatusData : projectData.value.taskStatusData,
            ProjectName : projectData.value.ProjectName
        },
        isSubTask : convertedSubTask.value.length > 0 ? true : false,
        userData : userData
    }).then(()=>{
        toggleTaskDetail(selectedConvertTask.value);
        let paramsObj = {};
        if(selectedConvertTask.value.sprintId && !selectedConvertTask.value.folderObjId){
            paramsObj = {
                cid: companyId.value,
                id: selectedConvertTask.value.ProjectID,
                sprintId: selectedConvertTask.value.sprintId,
                taskId: selectedConvertTask.value._id
            }
        }else if(selectedConvertTask.value.folderObjId){
            paramsObj = {
                cid: companyId.value,
                id: selectedConvertTask.value.ProjectID,
                folderId: selectedConvertTask.value.folderObjId,
                sprintId: selectedConvertTask.value.sprintId,
                taskId: selectedConvertTask.value._id
            }
        }
        nextTick(() => {
            isSpiner.value = false;
            router.push({
                name:selectedConvertTask.value.folderObjId ? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
                params: paramsObj,
                query: {...route.query, detailTab: 'task-detail-tab'}
            })
        })
        $toast.success("Task merged sucessfully",{position: 'top-right'});
        emit("closeTaskSidebar",false);
    })
    .catch((err) => {
        isSpiner.value = false;
        console.error(err);
    })
}

function confirmData (){
    if(props.isMergeTask === true && isSpiner.value === false){
        mergeTask();
    }else{
        convertTaskToSub();
    }
}

watch(() => errorMsg.value, () => {})

</script>
<style src="./style.css"></style>