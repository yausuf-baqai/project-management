<template>
    <Transition>
        <div v-if="groupType === 1 ? ((searchedTask ? filteredTasksGetter.length : items?.length) || !item?.users?.length) : (!searchedTask || filteredTasksGetter.length)" class="item_wrapper" @scroll="checkScroll">
            <div class="new-row item_head">
                <div class="new-col1" :style="`${clientWidth > sideScrollWidth ? 'border:0px' : ''};`">
                    <div class="common-section head" @click="() => {$emit('toggle', item); $forceUpdate();}">
                        <template v-if="groupType === 1">
                            <img src="@/assets/images/svg/triangleBlack.svg" alt="traingle" :style="`margin-right: 5px; transform: rotateZ(${item.isExpanded ? 90 : 0}deg)`">
                            <div class="cursor-default position-re d-flex align-items-center ml-8px assignee__wrapper" v-if="item.value?.length">
                                <Assignee
                                    :users="item.value.split('_')"
                                    :num-of-users="3"
                                    imageWidth="30px"
                                    :addUser="false"
                                    class="mr-5px"
                                />
                                <h5 v-if="clientWidth > 767" class="text-ellipse item-title font-size-14" :style="`color: ${item.textColor ? item.textColor : '#3a3a3a'}; background-color: ${item.backColor ? item.backColor : 'transparent'};`">
                                    <span v-for="(user, userIndex) in item.users" :key="userIndex">
                                        {{userIndex !== 0 ? ", " : "" }}{{user.Employee_Name}}
                                    </span>
                                </h5>
                            </div>
                            <div class="position-re d-flex align-items-center" v-else>
                                <img src="@/assets/images/Assign.png" alt="unassigned"/>
                                <h5 class="text-ellipse item-title" :style="`color: ${item.textColor ? item.textColor : '#818181'}; background-color: ${item.backColor ? item.backColor : 'transparent'}; margin-left: 5px;`">Unassigned</h5>
                            </div>
                            <!-- <span>{{getTaskCount(item)}} Tasks</span> -->
                            <span class="font-size-14 ml-6px dark-gray">{{searchedTask ? filteredTasksGetter.length : tasksFound}} Tasks</span>
                        </template>
                        <template v-else>
                            <img src="@/assets/images/svg/triangleBlack.svg" alt="traingle" class="mr-5px" :style="`transform: rotateZ(${item.isExpanded ? 90 : 0}deg); width: 6px;`">
                            <span class="text-ellipse status-sprint font-weight-500" :style="`color: ${item.textColor ? item.textColor : ''}; background-color: ${item.bgColor ? item.bgColor : 'transparent'}`">
                                <WasabiImage v-if="item.image" :data="{url: item.image, title: item.name}" class="mr-5px"/>
                                {{item.name}}
                            </span>
                            <!-- <span>{{getTaskCount(item)}} Tasks</span> -->
                            <span class="dark-gray font-size-13 font-weight-400 ml-6px tasks__title">{{searchedTask ? filteredTasksGetter.length : tasksFound}} Tasks</span>
                        </template>
                    </div>
                </div>
                <div class="new-col2">
                    <div class="common-section head">
                        <draggable v-model="headers" :disabled="true" class="span_wrapper" tag="div" @update:modelValue="updateItem($event)" @change="updateItem($event)" item-key="TaskName" :group="`itemheader_${props.sprintId}_${item._id}}`">
                            <template #item="{element: head}">
                                <span
                                    :title="head.label"
                                    class="task_right dark-gray font-weight-500 font-size-12 text-ellipse"
                                    :class="{
                                        'item-head-draggable-div' : false,
                                        'custom__field_list_view':head.key !== 'AssigneeUserId' && head.key !== 'commentCounts' && head.key !== 'DueDate' && head.key !== 'Task_Priority' && head.key !== 'TaskKey' && head.key !== 'created_date' && head.key !== 'created_by'
                                    }"
                                    v-if="(head.funcPermission ? checkPermission(head.funcPermission,projectData.isGlobalPermission) !== null : true ) && (head.appPermission ? checkApps(head.appPermission) : true ) && head.show"
                                >
                                    {{ head.label }}
                                </span>
                            </template>
                        </draggable>
                        <span class="span_wrapper task_right cursor-pointer" v-if="!projectData?.deletedStatusKey">
                            <DropDown>
                                <template #button>
                                    <img :src="addCustomField" :alt="addCustomField" v-if="props.statusIndex === 0" />
                                </template>
                                <template #options>
                                    <DropDownOption>
                                        <input type="text" class="customfield__form-control" placeholder="search" v-model="search" @input="handleInput">
                                    </DropDownOption>
                                    <DropDownOption v-if="checkPermission('task.task_custom_field',project?.isGlobalPermission) !== null && checkApps('CustomFields')">
                                        <span class="font-weight-500 line-height-19 font-roboto-sans blue" @click="isCustomField = true">+ Custom Field</span>
                                    </DropDownOption>
                                    <template v-if="headerHideShow && headerHideShow.length">
                                        <DropDownOption
                                            v-for="(obj, index) in headerHideShow.filter((head)=> (head.funcPermission ? checkPermission(head.funcPermission,projectData.isGlobalPermission) !== null : true ) && (head.appPermission ? checkApps(head.appPermission) : true ))"
                                            :key="index"
                                        >
                                            <div class="d-flex align-items-center justify-content-between w-100">
                                                <span class="font-weight-400 line-height-19 font-roboto-sans">
                                                    {{obj.label}}
                                                </span>
                                                <span>
                                                    <Toggle
                                                        v-model="obj.show"
                                                        width="20"
                                                        activeColor="rgba(78, 209, 100, 1)"
                                                        @click="toggleButton(obj.show,obj.key,obj)"
                                                    />
                                                </span>
                                            </div>
                                        </DropDownOption>
                                    </template>
                                    <template v-else>
                                        <div class="text-center p-3px">
                                            no record found
                                        </div>
                                    </template>
                                </template>
                            </DropDown>
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="item.isExpanded">
                <draggable
                    handle=".draggable_icon"
                    :class="{'isDisabled': item.isDisabled}"
                    :clone="clone"
                    :move="checkMove"
                    :list="(!searchedTask ? items : filteredTasksGetter)"
                    tag="div"
                    @change="draggedTaskId = '',updateItem('task',$event, item)"
                    item-key="TaskName"
                    :group="{name: 'task'}"
                    :sortable="false"
                    :id="'subtasklist_driver'"
                >
                    <template #item="{ element: task }">
                        <div @dragend="dragEnd" @dragstart="dragStart" @dragover="changeExpanded($event, task, true)">
                            <Task
                                :data="task"
                                :key="task._id"
                                @toggle="toggleTask(task)"
                                @createTask="createTask = task._id"
                                class="Task main-task"
                                v-if="(showArchived ? true : !task.deletedStatusKey)"
                            />
                            <CreateTask
                                v-if="createTask === task._id"
                                :sprint="{...task.sprintArray, id: task.sprintId, folderId: task.folderObjId}"
                                :taskId="task._id"
                                :assigneeOptions="task.AssigneeUserId"
                                @cancel="createTask = ''"
                                class="create__task-id"
                            />

                            <div class="subtask-wrapper position-re" @scroll="checkSubTaskScroll($event, task)">
                                <template v-if="task.isExpanded && (showArchived ? task.deletedStatusKey !== 2 : true)">
                                    <!--  -->
                                    <draggable 
                                        :list="task?.subtaskArray"
                                        tag="div"
                                        :move="checkMove"
                                        @change="draggedTaskId = '',updateItem('subTask', $event, task)"
                                        item-key="TaskName"
                                        :group="{name: 'task'}"
                                        class="subTaskAddRemove"
                                        :class="{'SubTaskAdd':task.isExpanded, 'SubTaskAddRemove':!task.isExpanded}"
                                        :sortable="false"
                                    >
                                        <template #item="{ element: subTask, index }">
                                            <div @dragend="dragEnd">
                                                <Task
                                                    :data="subTask"
                                                    :key="subTask._id"
                                                    :lastChild="(task.subtaskArray.length - 1) === index"
                                                    :parentAssignee="task.AssigneeUserId"
                                                    @toggle="toggleTask(subTask)"
                                                    @createTask="createTask = subTask._id"
                                                    class="Task sub-task"
                                                />
                                            </div>
                                        </template>
                                    </draggable>
                                    <div :id="`listItem_${sprintId}_${item.key}_${task._id}`" class="table__list-id w-100"></div>
                                </template>
                            </div>
                        </div>
                    </template>
                </draggable>
                <div :id="`listItem_${sprintId}_${item.key}`" class="table__list-id w-100"></div>
            </div>
        </div>
    </Transition>
    <Sidebar
        width="374px"
        :defaultLayout="false"
        :visible="isCustomField"
        :zIndex="8"
        :className="'customFieldSidebar'"
    >
        <template #head-left>
            <span class="font-weight-bold font-size-18">Create Custom Field</span>
        </template>
        <template #head-right>
            <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="isCustomField = false"/>
        </template>
        <template #body>
            <CustomField
                @customFieldStore="customFieldStore"
                @closeSidebar="handleCloseSidebar"
                :componentDetails="{}"
                :pageInd="0"
                :customFieldObject="{}"
            />
        </template>
    </Sidebar>
</template>

<script setup>
// PACKAGES
import { computed, ref, watch, defineProps, unref, onMounted, inject, defineEmits, nextTick } from 'vue';
import { useStore } from 'vuex';
import draggable from 'vuedraggable';
import { useCustomComposable } from '@/composable';
import { taskListHelper, useUpdateTasks } from '@/views/Projects/helper';
import taskClass from "@/utils/TaskOperations";

// COMPONENTS
import Task from '../Task/Task.vue';
import { useToast } from 'vue-toast-notification';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import CreateTask from "@/components/atom/CreateTask/CreateTask.vue";
import Assignee from "@/components/molecules/Assignee/Assignee.vue";
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
import Toggle from "@/components/atom/Toggle/Toggle.vue";
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';
import { dbCollections } from '@/utils/FirebaseCollections';
import CustomField from '@/components/atom/CustomField/CustomField.vue'
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
// UTILS
const {getters,commit} = useStore();
const $toast = useToast();
const userId = inject("$userId")
const {getSprintTasks} = taskListHelper();
const {checkPermission, checkApps} = useCustomComposable();
const clientWidth = inject('$clientWidth');
const searchedTask = inject('searchedTask');
const projectData = inject('selectedProject');
const taskCollapsed = inject("taskCollapsed");
const showArchived = inject("showArchived");
const companyId = inject("$companyId");
const {updateTaskByGroup} = useUpdateTasks();

// IMAGES
const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");
const addCustomField = require('@/assets/images/svg/add_circle_plus.svg');

const props = defineProps({
    item: Object,
    groupType: Number,
    sprintId: String,
    projectId: String,
    commonDateFormatForDate: String,
    statusIndex:{
        type:Number,
        default:0
    },
    project:{
        type:Object,
        default:() => {}
    },
    sprintObject:{
        type:Object,
        default:() => {}
    }
});

defineEmits(["toggle"])

const customFieldList = computed(() => (getters['settings/finalCustomFields'] && getters['settings/finalCustomFields'].length) ? JSON.parse(JSON.stringify(getters['settings/finalCustomFields'])) : []);

onMounted(() => {
    setHeader(customFieldList.value);
    if(tasksGetter.value && tasksGetter.value.length) {
        items.value =  JSON.parse(JSON.stringify(tasksGetter.value));
    }

    nextTick(() => {
        let options = {
            root: document.querySelector("#list_scroll"),
            rootMargin: "0px",
            threshold: 0.1,
        };
        let obs = new IntersectionObserver((e) => {
            if(e[0] && e[0]?.isIntersecting) {
                if(getters['projectData/tasks']?.[props.projectId]?.[props.sprintId]?.tasks.length) {
                    getSprintTasks({
                        projectId: props.projectId,
                        sprintId: props.sprintId,
                        item: props.item,
                        fetchNew: true,
                        projectData: projectData.value
                    })
                }
            }
        }, options);
        let target = document.querySelector(`#listItem_${props.sprintId}_${props.item.key}`);
        if(obs && target){
            obs.observe(target);
        }
    })
});

watch(()=> projectData.value.viewColumn,(newValue,oldValue)=>{
    if(newValue != oldValue){
        headers.value = newValue;
        headerHideShow.value = headers.value; 
        if(props.statusIndex === 0){
            setHeader(getters['settings/finalCustomFields']);
        }
    }
});

const headers = ref(projectData.value.viewColumn);
const headerHideShow = ref(headers.value);
const search = ref('');
const searchKey = ref("");
const isCustomField = ref(false);
const sideScrollWidth= 765;
const taskFields = ref(projectData.value?.taskFields || {});
const filteredTaskFields = ref(Object.values(taskFields.value));
const draggedTaskId = ref('');

watch(projectData, () => {
    taskFields.value = projectData.value?.taskFields || {}
})

const filterHeaders = ref(headers.value.filter((x) => filteredTaskFields.value.find((y) => y.key === x.key && y.visible)));
watch([headers, filteredTaskFields], ([val]) => {
    filterHeaders.value = val.filter((x) => filteredTaskFields.value.find((y) => y.key === x.key && y.visible));
})

watch([searchKey, taskFields], () => {
    filteredTaskFields.value = Object.values(taskFields.value).filter((x) => x.label.toLowerCase().includes(searchKey.value.toLowerCase()));
})

function checkMove(evt){
    try {
        draggedTaskId.value = evt.draggedContext.element ? evt.draggedContext.element._id : "";
    } catch (error) {
        console.error("ERROR: ", error);
        return;
    }

    if(evt.willInsertAfter) {
        evt.dragged.style.borderBottom = "none";
        evt.dragged.style.borderTop = "1px solid #614add";
    } else {
        evt.dragged.style.borderBottom = "1px solid #614add";
        evt.dragged.style.borderTop = "none";
    }
    return true;
}
function clone(element) {
    return {...element};
}
function dragEnd(e) {
    if (e.target.classList.contains('dragTask')) {
        e.target.classList.remove('dragTask');
    }
    e.target.style.border = "none";
}
function dragStart (e) {
    e.target.classList.add('dragTask');
}
function changeExpanded(e, field) {
    field.subtaskArray = field.subtaskArray && field.subtaskArray.length ? field.subtaskArray : []
    if(!field.isExpanded){
        toggleTask(field);
    }
}
const tasksFound = computed(() => {
    if(getters['projectData/tasks'][props.projectId] && getters['projectData/tasks'][props.projectId][props.sprintId]) {
        const found = JSON.parse(JSON.stringify(getters['projectData/tasks'][props.projectId][props.sprintId]?.found))
        return found?.[`${props.item.searchKey}_${props.item.searchValue}`] || 0
    } else {
        return 0;
    }
})

const tasksGetter = computed(() => {
    if(getters['projectData/tasks'][props.projectId] && getters['projectData/tasks'][props.projectId][props.sprintId]) {
        const store = JSON.parse(JSON.stringify(getters['projectData/tasks'][props.projectId][props.sprintId]))
        let tmp = [];
        if(props.item.searchKey === "DueDate") {
            tmp = store.tasks.filter((x) => {
                return (x.DueDate ? checkCase(props.item.operation, props.item.searchValue, (new Date(x?.[props.item.searchKey]).getTime() / 1000)) : props.item.operation === "non") && !x?.deletedStatusKey
            });
        } else if(props.item.searchKey === "AssigneeUserId") {
            tmp = store.tasks.filter((x) => {
                return x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === props.item.value && !x?.deletedStatusKey;
            })
        } else {
            tmp = store.tasks.filter((x) => x[props.item.searchKey] === props.item.searchValue && !x?.deletedStatusKey)
        }

        tmp = tmp.map((x) => {
            if(x?.subtaskArray) {
                x.subtaskArray = x.subtaskArray.filter((y) => !y?.deletedStatusKey);
            }
            return x;
        })

        return tmp;
    } else {
        return [];
    }
});
const currentProjectTasks = computed(() => getters['projectData/tasks']);
const filteredTasksGetter = computed(() => {
    if(getters['projectData/searchedTasks']?.length && props.sprintId) {
        if(props.item.searchKey === "DueDate") {
            return getters['projectData/searchedTasks'].filter((x) => {
                if(x.DueDate?.seconds) {
                    return x.sprintId === props.sprintId && x.DueDate?.seconds ? checkCase(props.item.operation, props.item.searchValue, x[props.item.searchKey].seconds) : props.item.operation === "non"
                } else {
                    return (x.sprintId === props.sprintId) && (x.DueDate ? checkCase(props.item.operation, props.item.searchValue, new Date(x.DueDate).getTime() / 1000) : props.item.operation === "non")
                }
            });
        } else if(props.item.searchKey === "AssigneeUserId") {
            return getters['projectData/searchedTasks'].filter((x) => {
                return x.sprintId === props.sprintId && x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === props.item.value;
            })
        } else {
            return getters['projectData/searchedTasks'].filter((x) => x.sprintId === props.sprintId && x[props.item.searchKey] === props.item.searchValue);
        }
    } else {
        return [];
    }
});

// CHECK DUE DATE FOR GROUP BY
function checkCase(op, todayS, seconds) {
    const dayHrs = 24 * 60 * 60 * 1000;

    switch(op) {
        case "eq":
            return todayS <= seconds && (((todayS * 1000) + dayHrs)/1000) > seconds;

        case "lt":
            return todayS >= seconds; // compared second less than todayS

        case "gt":
            return todayS <= seconds; // compared second greater than todayS
    }
}

watch([taskCollapsed], ([newVal], [oldVal]) => {
    if(newVal !== oldVal && !searchedTask.value) {
        let tmp = items.value;
        if(newVal === false) {
            tmp.filter((x) => x.isParentTask).forEach((x) => {
                x.isExpanded = true;
                fetchSubTask(x, true);
            })
        } else {
            tmp.filter((x) => x.isParentTask).forEach((x) => {
                x.isExpanded = false;
            })
        }
    }
})

const items = ref([]);
watch(() => unref(tasksGetter), (newVal) => {
    items.value = newVal.map((x) => {
        let index = items.value.findIndex((y) => x._id === y._id);

        if(index !== -1) {
            x.isExpanded = items.value[index].isExpanded;
        }

        return x;
    });
})

const createTask = ref(false);

let subObserver = {};
function toggleTask(task) {
    task.isExpanded = !task.isExpanded;

    if(task.isExpanded) {
        nextTick(() => {
            let options = {
                root: document.querySelector("#list_scroll"),
                rootMargin: "0px",
                threshold: 0.1,
            };
            let obs = new IntersectionObserver((e) => {
                if(e[0] && e[0]?.isIntersecting) {
                    let storeSprintTasks = getters['projectData/tasks']?.[props.projectId]?.[props.sprintId]?.tasks || [];
                    if(storeSprintTasks.length && storeSprintTasks.find((x) => x._id === task._id)) {
                        fetchSubTask(task, true);
                    }
                }
            }, options);

            let target = document.querySelector(`#listItem_${props.sprintId}_${props.item.key}_${task._id}`);

            if(obs && target){
                subObserver[task._id] = obs
                obs.observe(target);
            }
        })
    } else {
        subObserver?.[task._id]?.disconnect();
        subObserver[task._id] = null;
    }

    if(task.isExpanded === true && (!task.subtaskArray || task.subtaskArray.length < 25)) {
        let fetchNew = currentProjectTasks.value?.[props.projectId]?.[props.sprintId].index[`${task._id}_${props.item.searchKey}_${props.item.searchValue}`] === undefined;
        fetchSubTask(task, fetchNew);
    }
}

// DEBOUNCE
const timer = ref(null);
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

function checkScroll(e) {
    debouncer(50)
    .then(() => {
        if(e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight) - 200) {
            getSprintTasks({
                projectId: props.projectId,
                sprintId: props.sprintId,
                item: props.item,
                userId: userId.value,
                fetchNew: true,
                projectData: projectData.value,
            })
        }
    })
    .catch((err) => {
        console.error("error", err);
    })
}
function updateItem(type,e, item) {
    if(
        (e.added && (!e.added.element || !Object.keys(e.added.element).length)) ||
        (e.moved && (!e.moved.element || !Object.keys(e.moved.element).length)) ||
        (e.removed && (!e.removed.element || !Object.keys(e.removed.element).length))
    ){
        return;
    }
    if(e?.added?.element) {
        const pid = JSON.parse(JSON.stringify(props.project))._id
        const snap = '';
        const sprintId = props.sprintObject.id
        const showAllTasks = true;
        const taskObject = JSON.parse(JSON.stringify(e?.added?.element))
        if(type === 'subTask'){
            if(e?.added?.element?.subTasks <= 0 || e?.added?.element?.subTasks === undefined){
                if(e?.added?.element?.ParentTaskId){
                    commit("projectData/mutateUpdateFirebaseTasks",{
                        snap, 
                        op: "modified",
                        pid,
                        sprintId,
                        data: {...taskObject,isParentTask:false,ParentTaskId:e?.added?.element?.ParentTaskId},
                        showAllTasks,
                        updatedFields:{
                            deletedStatusKey:1,
                            updatedAt:new Date(),
                            ParentTaskId: e?.added?.element?.ParentTaskId,
                            isParentTask: false,
                            subTasks:item?.subTasks ? item?.subTasks + 1 : 1
                        },
                        convertSubTaskToTask:true
                    });
                }
                commit("projectData/mutateUpdateFirebaseTasks",{
                    snap, 
                    op: "modified",
                    pid,
                    sprintId,
                    data: {...taskObject,isParentTask:false,ParentTaskId:item._id},
                    showAllTasks,
                    updatedFields:{
                        deletedStatusKey:1,
                        updatedAt:new Date(),
                        ParentTaskId: item._id,
                        isParentTask: false,
                        subTasks:item?.subTasks ? item?.subTasks + 1 : 1
                    },
                    dragDropcheck:true
                });
            }else{
                if(e?.added?.element?.subtaskArray && e?.added?.element?.subtaskArray.length){
                    commit("projectData/mutateUpdateFirebaseTasks",{
                        snap, 
                        op: "modified",
                        pid,
                        sprintId,
                        data: {...e?.added?.element,isParentTask:false,ParentTaskId:item._id},
                        showAllTasks,
                        updatedFields:{
                            deletedStatusKey:1,
                            updatedAt:new Date(),
                            ParentTaskId: item._id,
                            isParentTask: false,
                            subTasks:item?.subTasks ? item?.subTasks + 1 : 0
                        },
                        dragDropcheck:true
                    });
                    e?.added?.element?.subtaskArray.forEach((x)=>{
                        commit("projectData/mutateUpdateFirebaseTasks",{
                            snap, 
                            op: "modified",
                            pid,
                            sprintId,
                            data: {...x,isParentTask:false,ParentTaskId:item._id},
                            showAllTasks,
                            updatedFields:{
                                deletedStatusKey:1,
                                updatedAt:new Date(),
                                ParentTaskId: item._id,
                                isParentTask: false,
                                subTasks:item?.subTasks ? item?.subTasks + 1 : 0
                            },
                            dragDropcheck:true
                        });
                    })
                }
            }

            taskClass.convertToSubTask({
                companyId: companyId.value,
                projectData: {
                    id:pid
                },
                sprintId: item.sprintId,
                selectedTaskId:e?.added?.element._id,
                taskId: item._id,
                oldProject : {
                    id : pid,
                    taskTypeCounts : props.project.taskTypeCounts,
                    taskStatusData : props.project.taskStatusData
                },
                isSubTask : e?.added?.element?.subTasks <= 0 ? false : true
            }).then(()=>{
            }).catch((error) => {
                console.error("ERROR: ", error);
            });
        }else if(type === "task"){
            if(e?.added?.element.isParentTask === false){
                commit("projectData/mutateUpdateFirebaseTasks",{
                    snap, 
                    op: "modified",
                    pid,
                    sprintId,
                    data: {...taskObject,isParentTask:false,ParentTaskId:e?.added?.element?.ParentTaskId},
                    showAllTasks,
                    convertSubTaskToTask:true
                });
                commit("projectData/mutateUpdateFirebaseTasks",{
                    snap, 
                    op: "modified",
                    pid,
                    sprintId,
                    data: {
                        ...taskObject,
                        status:{
                            key:item.key,
                            text:item.name,
                            type:item.type
                        },
                        statusKey:item.key,
                        statusType:item.type,
                        isParentTask:true,
                        ParentTaskId:''
                    },
                    showAllTasks,
                    updatedFields:{
                        deletedStatusKey:1,
                        updatedAt:new Date(),
                        status:{
                            key:item.key,
                            text:item.name,
                            type:item.type
                        },
                        statusKey:item.key,
                        statusType:item.type,
                        ParentTaskId: '',
                        isParentTask: true,
                        sprintArray:props.sprintObject
                    }
                });
                taskClass.convertToTask({
                    companyId: companyId.value,
                    projectData: {
                        id:pid
                    },
                    taskId : e?.added?.element._id,
                    parentTaskId:e?.added?.element.ParentTaskId,
                    sprintObj: props.sprintObject,
                    oldSprintObj :{
                        id:props.sprintObject.id,
                        folderId:null
                    },
                    oldProject: {
                        id : pid,
                        taskTypeCounts : props.project.taskTypeCounts,
                        taskStatusData : props.project.taskStatusData
                    }
                }).then(() => {
                }).catch((error) => {
                    console.error("ERROR: ", error);
                });
            }
            updateTaskByGroup(e.added.element, item, props.groupType)
            .catch((error) => {
                console.error("ERROR: ", error);
            });
        }
        
    }else{
        console.info('NO Event Found');
    }
    // it will needed in future so it is commented
    // else if (e?.moved && e?.moved?.element){
    // }else if(e?.removed && e?.removed?.element) {
    // }
}
function checkSubTaskScroll(e, task) {
    debouncer(50)
    .then(() => {
        if(e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight) - 150) {
            fetchSubTask(task, true);
        }
    })
    .catch((err) => {
        console.error("error", err);
    })
}

function fetchSubTask(task, fetchNew = false) {
    getSprintTasks({
        projectId: props.projectId,
        sprintId: props.sprintId,
        item: props.item,
        userId: userId.value,
        fetchNew: fetchNew,
        projectData: projectData.value,
        parentId: task.isParentTask ? task._id : ""
    })
}

const handleInput = () => {
    headerHideShow.value = headers.value;
    if(search.value){
        const filters = headerHideShow.value.filter(x => x?.label?.toLowerCase()?.includes(search.value?.toLowerCase()));
        headerHideShow.value = filters;
    }
}
const toggleButton = (value,index,obj) => {
    let queryObj = [
        { _id : BSON.ObjectID(projectData.value._id) }
    ];
    if(obj?.newAdded === true){
        delete obj?.newAdded;
        queryObj.push(
            { $push: { viewColumn: obj } }
        )
    }else{
        queryObj.push(
            {$set: {[`viewColumn.$[elementIndex].show`]: value }},
            {arrayFilters: [{ "elementIndex.key": index }]}
        )
    }
    
    const queryUpdate = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };
    mongodbCrudOperations(queryUpdate).then(()=>{
    }).catch((error) => {
        console.error('ERROR:', error);
    });
};

const customFieldStore = (object) => {
    let value = JSON.parse(JSON.stringify(object))
    value.global = false;
    value.projectId = props.projectId;
    value.createdAt = new Date();
    value.updatedAt = new Date();
    value.userId = userId.value;
    const query = {
        type: "insertOne",
        collection: dbCollections.CUSTOM_FIELDS,
        data: [value]
    };
    mongodbCrudOperations(query).then((result)=>{
        value._id = result.insertedId;
        commit("settings/mutateFinalCustomFields", {data: value || {},op: "added"});
        isCustomField.value = false;
        $toast.success("Field Added Successfully", {position: 'top-right' });
        let queryObj = [
            { _id: BSON.ObjectID(props.projectId) },
            { $push: {
                    viewColumn:  {
                        label: value.fieldTitle,
                        key: result.insertedId,
                        postition: projectData?.value?.viewColumn.length ? projectData?.value?.viewColumn.length + 1 : 0,
                        show: true
                    }
                }
            }
        ];

        const query = {
            type: "updateOne",
            collection: dbCollections.PROJECTS,
            data: queryObj
        };

        mongodbCrudOperations(query).then(()=>{
            // headerHideShow.value.push({
            //     label:x?.fieldTitle,
            //     key:x?._id,
            //     postition:headerHideShow.value.length + 1,
            //     show:false,
            //     newAdded:true
            // })
        }).catch((error)=>{
            console.error('ERROR',error);
        });
    }).catch((err)=>{
        $toast.error(err, { position: 'top-right' })
    });
    
};

const handleCloseSidebar = (val,pageIndex) => {
    if(pageIndex === 0) isCustomField.value = val;
};

const setHeader = (customFieldArray) => {
    if(customFieldArray && customFieldArray.length && props.statusIndex === 0){
        customFieldArray.forEach((x)=>{
            let checkId = headerHideShow.value.findIndex((e) => e.key === x._id);
            let headerIndex = headers.value?.findIndex((ele) => ele.key === x._id)
            if(headerIndex !== -1){
                headers.value[headerIndex].label = x.fieldTitle;
                headers.value[headerIndex].funcPermission = 'task.task_custom_field';
                headers.value[headerIndex].appPermission = 'CustomFields';
            }
            if(checkId !== -1){
                if(!(x?.isDelete)){
                    headerHideShow.value.splice(checkId,1);
                }
            }else{
                if((x?.isDelete) && (x?.global || x?.projectId === props?.projectId)){
                    headerHideShow.value.push({
                        label:x?.fieldTitle,
                        key:x?._id,
                        postition:headerHideShow.value.length + 1,
                        show:false,
                        newAdded:true,
                        funcPermission: 'task.task_custom_field',
                        appPermission: 'CustomFields'
                    })
                }
            }
        });
    }
}
</script>

<style>
@import "./style.css";
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.assignee__wrapper{
    max-width: 78%;
}
.table__list-id{
    height: 100px;
    /* margin-top: -100px; */
    position: absolute;
    bottom: 0;
    z-index: -1;
}
.tasks__title{
    line-height:20px !important;
}
.create__task-id{
    margin: 0px 0px 10px 20px !important;
}
</style>