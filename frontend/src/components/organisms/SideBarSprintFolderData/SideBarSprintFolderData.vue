<template>
    <div class="project-item-wrapper position-re sidebar__sprint-task">
        <div class="project-item border-radius-5-px cursor-pointer ml-016" :class="[{'convert__sprint--projectitem': folder === true,'duplicate_task_hover' : data.isDuplicateSprint}]">
            <div class="position-ab subtask__down-arrow">
                <img @click.stop="$emit('change', data)" v-if="data.sprintsObj && Object.keys(data.sprintsObj).length && props.isShowIcon === true" :src="triangleBlack" alt="" :style="`transform: rotateZ(${data.isExpanded ? '90' : '0'}deg)`">
            </div>
            <div class="item-left">
                <div class="text-ellipsis">
                    <img v-if="data.deletedStatusKey !== undefined && data.deletedStatusKey === 2" :src="inventoryIcon" alt="inventoryIcon" class="inventory__Icon ml-8px">
                    <img v-else-if="data.deletedStatusKey !== undefined && data.deletedStatusKey === 1" :src="deleteIcon" alt="deleteIcon" class="delete__Icon ml-8px">
                    <img v-if="folder" :src="folderIcon" alt="folderIcon" class="convert__subtask-foldericon ml-6px">
                    <span class="text-ellipsis project-sb-desc text-capitalize ml-8px mw-40" :class="{'font-size-13' : clientWidth > 767, 'font-size-16' : clientWidth <= 767}" :title="data.name">
                        <img v-if="props.isMoveTask === false && isDuplicate === false && isConvertTask === false ? !folder : false" :src="triangleBlack" alt="" :style="`transform: rotateZ(${allData.isTaskExpanded ? '90' : '0'}deg)`" @click="expandTask()"> 
                        {{data.name}}
                    </span>
                </div>
            </div>
        </div>
        <div v-if="data.isExpanded && data.sprintsObj && Object.keys(data.sprintsObj).length > 0" class="pl-10px"  :class="[{'covert__folder-sprint': data.isExpanded && data.sprintsObj && Object.keys(data.sprintsObj).length}]">
            <SideBarSprintFolderData
                v-for="subItem in isMoveTask === true ? Object.values(data.sprintsObj).filter((x)=> (x.deletedStatusKey == undefined || x.deletedStatusKey === 0) && x.id !== task.sprintId) : Object.values(data.sprintsObj).filter((x)=> (x.deletedStatusKey === undefined || x.deletedStatusKey === 0))"
                :key="subItem.id"
                :data="subItem"
                :selectedProjectData="props.selectedProjectData"
                @change="toggleSubItem($event)"
                :taskSearch="props.taskSearch"
                :searchData="props.searchData"
                @click="props.isMoveTask === true || props.isDuplicate === true || props.isConvertTask === true ? $emit('clickSprint', subItem) : ''"
                :isMergeTask="props.isMergeTask"
                :isMoveTask="props.isMoveTask"
                :isDuplicate="props.isDuplicate"
                :task="props.task"
                :fromWhich="props.fromWhich"
                @dataToGrandParent="(ele)=>{getDataFromTaskComp(ele)}"
                :isConvertTask="props.isConvertTask"
                :isDup="props.isDup"
            />
        </div>
        <div v-if="allData.isTaskExpanded && props.isMoveTask === false && props.isDuplicate === false && isConvertTask === false" class="scrollClass" @scroll="onScroll">
            <!-- <div v-for="(task, taskIndex) in taskSearch === '' ? items : searchData.filter((x) => x.sprintId === data.id)" :key="taskIndex" class="taskin__Sidebar-wrapper"> -->
                <TaskInSidebar
                    v-for="(task, taskIndex) in taskSearch === '' ? items : searchData.filter((x) => x.sprintId === data.id)"
                    :key="taskIndex"
                    :data="task"
                    :selectedProjectData="props.selectedProjectData"
                    :selectedSprintData="selectedSprintData"
                    :isMergeTask="isMergeTask"
                    :taskData="taskSearch === '' ? items : searchData.filter((x) => x.sprintId === data._id)"
                    :fromWhich="props.fromWhich"
                    :task="props.task"
                    @dataToParent="(ele)=>{getDataFromTaskComp(ele)}"
                    @closeTaskSidebar="$emit('closeTaskSidebar',false)"
                />
            <!-- </div> -->
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, inject } from 'vue';
import SideBarSprintFolderData from './SideBarSprintFolderData'
import TaskInSidebar from '@/components/organisms/TaskInSidebar/TaskInSidebar.vue';

import { dbCollections } from '@/utils/FirebaseCollections';

import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';


const emit = defineEmits(["change", "clickSprint","dataToGrandParent","closeTaskSidebar"])

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    folder: {
        type: Boolean,
        default: false
    },
    selectedProjectData: {
        type: Object,
    },
    taskSearch: {
        type: String,
        default: ""
    },
    searchData: {
        type: Array,
    },
    isShowIcon: {
        type: Boolean,
        default: true
    },
    isMoveTask: {
        type: Boolean,
        default: false
    },
    isMergeTask: {
        type: Boolean,
        default: false
    },
    task: {
        type: Object,
    },
    isDuplicate: {
        type: Boolean,
        default: false
    },
    fromWhich: {
        type: String,
        default: ''
    },
    isConvertTask: {
        type:Boolean,
        default:false
    },
    isDup : {
        type:Boolean,
        default:false
    }
})

const inventoryIcon = require("@/assets/images/inventory_2.png");
const deleteIcon = require("@/assets/images/DeleteIcon.png");
const folderIcon = require("@/assets/images/svg/blue_folder.svg");
const allData = ref(props.data);
const clientWidth = inject("$clientWidth");
const selectedSprintData = ref({});
const items = ref([]);
const userId = inject("$userId");
const triangleBlack = require("@/assets/images/svg/triangleBlack.svg");
const expandTask = () => {
    if(props.isMoveTask === false){
        allData.value.isTaskExpanded = !allData.value.isTaskExpanded;
        selectedSprintData.value = allData.value; 
        getMongodbData();
    }
}
const batchSize = ref(10);
const skip = ref(0)


const getMongodbData = () => {
    return new Promise((resolve, reject) => {
        try {
            let defaultFilterPrivate = {};
            if(props.fromWhich !== '' && props.fromWhich == 'dashboard') {
                defaultFilterPrivate = {
                    AssigneeUserId : { $in: [userId.value] },
                    queueListArray : { $nin: [userId.value] }
                }
            }else{
                if(props.isMergeTask === false){
                    defaultFilterPrivate = {
                        isParentTask : true,
                    }
                }else{
                    defaultFilterPrivate = {
                        ParentTaskId : {$ne : props.task._id},
                    }
                }
            }
            let searchResult = {
                $match: {
                    $and:[
                        {ProjectID: BSON.ObjectID(props.selectedProjectData?._id)},
                        {sprintId: BSON.ObjectID(selectedSprintData.value.id)},
                        {deletedStatusKey: 0},
                        defaultFilterPrivate
                    ]
                }
            };
            const query = [
                {
                    $facet: {
                        "results": [
                            searchResult,
                            {
                                $skip: skip.value,
                            },
                            {
                                $limit: batchSize.value,
                            }
                        ]
                    }
                }
            ];
            let obj = {
                type:"aggregate",
                collection:dbCollections.TASKS,
                data:[query]
            }; 
            mongodbCrudOperations(obj)
            .then((result) => {
                if(result[0]?.results.length > 0){
                    let arrayData = result[0].results;
                    items.value = items.value.concat(arrayData.filter(newItem => !items.value.some(existingItem => existingItem._id === newItem._id)));
                    items.value.map(async(x) =>{
                        if(!x.isParentTask) {
                            let findIndex = arrayData.findIndex((ele)=>{return x.ParentTaskId == ele._id})
                            if(findIndex !== -1) {
                                x.parentTaskName = arrayData[findIndex].TaskName
                            } 
                            else {
                                const query = {
                                    type : 'findOne',
                                    collection : dbCollections.TASKS,
                                    data : [
                                        {
                                            _id : BSON.ObjectId(x.ParentTaskId),
                                            deletedStatusKey: 0,
                                        }
                                    ]
                                }
                                await mongodbCrudOperations(query).then((res) => {
                                    x.parentTaskName = res.TaskName
                                }).catch((err) => {
                                    console.error(err,"Error")
                                });
                            }
                        } 
                        return x;
                    })
                    if(props.isMergeTask === true){
                        let parentData = []
                        items.value.forEach((y) => {
                            if(y.isParentTask === false){
                                let testIndex = items.value.findIndex((x) => x._id === y.ParentTaskId);
                                if(testIndex === -1) {
                                    const query = {
                                        type : "find",
                                        collection: dbCollections.TASKS,
                                        data : [
                                            {
                                                ProjectID: BSON.ObjectId(y.ProjectID),
                                                sprintId: BSON.ObjectId(y.sprintId),
                                                deletedStatusKey: 0,
                                                _id: y.ParentTaskId
                                            }
                                        ]
                                    }
                                    mongodbCrudOperations(query)
                                    .then((res) => {
                                        res.forEach((hit) => {
                                            parentData.push(hit);
                                        })
                                        items.value = items.value.concat(parentData.filter(newItem => !items.value.some(existingItem => existingItem._id === newItem._id)));
                                    })
                                }
                            }
                        })
                    }
                    resolve(result);
                }
            }).catch((error) => {
                console.error(error, "error");
            })
        } catch (error) {
            reject(error);
            console.error(error,"error");
        }
    })
}

function toggleSubItem(data) {
    Object.keys(data.sprintsObj).forEach((key) => {
        if(data.sprintsObj[key].id === data.id) {
            data.sprintsObj[key].isExpanded = !data.sprintsObj[key].isExpanded;
        } else {
            data.sprintsObj[key].isExpanded = false;
        }
    })
}

const onScroll = (e) => {
    const { scrollTop, offsetHeight, scrollHeight } = e.target
    if ((scrollTop + offsetHeight) >= scrollHeight) {
        skip.value += batchSize.value
        getMongodbData();
    }
}

const getDataFromTaskComp = (data) => {
    emit('dataToGrandParent',data);
}

</script>
<style scoped src="./style.css"></style>