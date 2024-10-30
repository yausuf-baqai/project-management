<template>
    <div v-if="(searchedTask ? filteredTask : tasksGetter)?.length"  class="task__groups">
        <div class="view-status" v-if="data?.searchKey == 'statusKey'  " :style="[{'background-color':data?.bgColor , 'color':data?.textColor}]">
            {{data?.name}}
        </div>
        <div class="view-status p-0" v-if="data?.searchKey == 'DueDate'" >
            <span :style="[{'color':data?.name == 'Today' ? '#FF9600' : data?.textColor}]" class="font-weight-bold">  {{data?.name}} </span>
            <span class="ml-1">{{(searchedTask ? filteredTask : tasksGetter)?.length}} Tasks</span>
        </div>
        <div class="view-status p-0" v-if="data?.searchKey == 'Task_Priority'">
            <WasabiImage
                class="priority__wasabi-image"
                :data="{ url: data?.statusImage }"
                v-if="!data?.statusImage.includes('http')"
            />
            <img :src="data?.statusImage" alt="" v-else>
            <span class="font-weight-bold ml-1">{{data?.name}}</span>
            <span class="ml-1">{{(searchedTask ? filteredTask : tasksGetter)?.length}} Tasks</span>
        </div>
        <div v-if="data?.searchKey == 'AssigneeUserId'">
            <div class="d-flex view-status" v-if="data.users?.length" @click.stop="">
                <Assignee
                v-if="checkPermission('task.task_assignee',project?.isGlobalPermission) === true && checkPermission('task.task_list',project?.isGlobalPermission) == true"
                :users="users"
                :num-of-users="4"
                :options="project?.AssigneeUserId"
                imageWidth="30px"
                :addUser="false"
                />
                <span v-for="(item,index) in data?.users" class="font-weight-bold" :key="index">
                    {{index!== 0 ? ", " : "" }} {{ item?.Employee_Name}} 
                </span>
                <span class="ml-1">{{(searchedTask ? filteredTask : tasksGetter)?.length}} Tasks</span>
            </div>
            <span class="d-flex align-items-center" v-else>
                <img :src="unassigned" alt="unassigned"/>
                <h5 class="text-ellipse item-title ml-1">Unassigned</h5>
                <span class="ml-1">{{(searchedTask ? filteredTask : tasksGetter)?.length}} Tasks</span>      
            </span>
        </div>
    </div>
    <tbody class="list_view_table">
        <template v-for="(task, index) in (searchedTask ? filteredTask : tasksGetter)" :key="index">
            <tr>
                <TableViewRow :taskData="taskData"  :data="task" :index="index+1" :parentAssignee="task?.AssigneeUserId"/>
            </tr>
        </template>
        <div :id="`table_list_item_${sprintId}_${data.key}`" class="table__list-task-id w-100"></div>                                    
    </tbody>
    
</template>
<script setup>
// COMPONENTS
import TableViewRow from '@/components/atom/TableViewRow/TableViewRow.vue'
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";

// UTILS
import { useCustomComposable} from "@/composable";
import { taskListHelper } from '@/views/Projects/helper.js';

// PACKAGES
import {useStore} from 'vuex'
import {ref,watch , inject , computed,onUnmounted ,onMounted} from 'vue'

const unassigned = require("@/assets/images/png/unassigned-black.png")
const {checkPermission} = useCustomComposable();
const searchedTask = inject('searchedTask');
const observerRef = ref(null);
const {checkCase} = taskListHelper();
const {getters,dispatch} = useStore()
const users = ref([])
const filteredTask = ref([])
const props = defineProps({
    data : {
        type:Object
    },
    group:{
        type: Number,
        default: 0
    },
    sprintId:{
        type:String
    },
    globalSortKey:{
        default:'',
        type:String
    },
    keys:{
        default:'',
        type:String
    }
})


const taskData = ref(props.data)
const project = inject("selectedProject")
const companyId = inject("$companyId")
const userId = inject('$userId')
const permit = checkPermission("task.show_tasks",project?.value?.isGlobalPermission);

watch(()=> props.globalSortKey, () => {
    if (observerRef.value) {
        observerRef.value.disconnect();
    }
    dispatch("projectData/setTableTasksFromTypesense", {
        cid: companyId.value,
        pid: project.value._id,
        sprintId: props.sprintId,
        item : props.data,
        fetchNew : true,
        userId: userId.value,
        sortKey : props.globalSortKey,
        isFirst : true,
        showAllTasks: project.value.isGlobalPermission === false ? permit : true,
    }).then(()=>{
        addIntersections()
    })
})

function addIntersections() {
    setTimeout(() => {
        let options = {
            root: document.getElementById("tableview_scroll"),
            rootMargin: "0px",
            threshold: 0,
        };
        let obs = new IntersectionObserver((e) => {
            if(e[0].isIntersecting) {
                let item = JSON.parse(JSON.stringify(props.data))
                dispatch("projectData/setTableTasksFromTypesense", {
                    cid: companyId.value,
                    pid: project.value._id,
                    sprintId: props.sprintId,
                    item : item,
                    userId: userId.value,
                    fetchNew: true,
                    sortKey : props.globalSortKey,
                    isFirst: false,
                    showAllTasks: project.value.isGlobalPermission === false ? permit : true
                })
            }
        }, options);

        let target = document.getElementById(`table_list_item_${props.sprintId}_${props.data.key}`);
        if(target) {
            obs.observe(target)
        }
        observerRef.value = obs;
    })
}


const getTaskData = () => {
    taskData.value = props.data;
    if(props.data?.searchKey == 'AssigneeUserId') { users.value = ((taskData.value?.conditions[0])?.split(':')[1]?.split(','))?.map((item) => {return item?.trim()}) }
    if(searchedTask){ fetchFilteredTasks() }
    addIntersections()
}
watch(()=> props.sprintId, (newValue,oldValue) => {
    if(newValue.key === oldValue.key){
        if(observerRef.value){
            observerRef.value.disconnect();
        }
        getTaskData()
    }
})

const filteredTasksGetter = computed(() => {
    if(getters['projectData/searchedTasks']?.length && props.sprintId) {
        if(taskData.value.searchKey === "DueDate") {
            return getters['projectData/searchedTasks'].filter((x) => {
                return (x.sprintId === props.sprintId) && (x.DueDate ? checkCase(taskData.value.operation, taskData.value.searchValue, new Date(x[taskData.value.searchKey]).getTime()/1000) : taskData.value.operation === "non")
            });
        } else if(taskData.value.searchKey === "AssigneeUserId") {
            return getters['projectData/searchedTasks'].filter((x) => {
                return x.sprintId === props.sprintId && x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === taskData.value.value;
            })
        } else {
            return getters['projectData/searchedTasks'].filter((x) => x.sprintId === props.sprintId && x[taskData.value.searchKey] === taskData.value.searchValue);
        }
    } else {
        return [];
    }
});

const fetchFilteredTasks = () =>{
    if(filteredTasksGetter.value && filteredTasksGetter.value.length){
        let array = [...filteredTasksGetter.value]
        filteredTasksGetter.value  = filteredTasksGetter.value.forEach((item) =>{ array = array.concat(item?.subtaskArray) })
        
        filteredTask.value = array
        if(!filteredTask.value?.length){ taskData.value = props.data }
    }else{
        return [];
    }
}

watch(filteredTasksGetter,() =>{
    fetchFilteredTasks()
})

const tasksGetter = computed(() => {
    if(getters['projectData/tableTasks'][project.value._id] && getters['projectData/tableTasks'][project.value._id][props.sprintId]) {
        const store = JSON.parse(JSON.stringify(getters['projectData/tableTasks'][project.value._id][props.sprintId]))
        let tmp = [];
        if(props.data.searchKey === "DueDate") {
            tmp = store.tasks.filter((x) => {
                return (x.DueDate ? checkCase(props.data.operation, props.data.searchValue, new Date(x["DueDate"]).getTime()/1000) : props.data.operation === "non") && !x?.deletedStatusKey
            });
        } else if(props.data.searchKey === "AssigneeUserId") {
            tmp = store.tasks.filter((x) => {
                return x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === props.data.value && !x?.deletedStatusKey;
            })
        } else {
            tmp = store.tasks.filter((x) => x[props.data.searchKey] === props.data.searchValue && !x?.deletedStatusKey)
        }

        return tmp;
    } else {
        return [];
    }
});
onMounted(() => {
    if(observerRef.value){
        observerRef.value.disconnect();
    }
    getTaskData()
})
onUnmounted(() => {
   // Disconnect the observer when the component is unmounted
   if (observerRef.value) {
      observerRef.value.disconnect();
   }
});


</script>
<style>
@import "./style.css"
</style>