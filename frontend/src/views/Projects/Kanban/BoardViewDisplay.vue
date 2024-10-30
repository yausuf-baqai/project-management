<template>
    <div class="boardViewDisplayWrapper style-scroll">
        <template v-for="(task,index) in taskData" :key="index">
            <Transition v-if="!isLoading">
                <div :key="index" class="postition-re boardViewDisplayColumn" v-if="groupValue !== 1 || task.tasksArray?.length || !task?.users?.length"> 
                    <div v-if="groupValue === 1" class="d-flex justify-content-between mb-10px">
                        <div class="cursor-default position-re d-flex align-items-center mw-78" v-if="task.value?.length">
                            <Assignee
                                :users="task.value.split('_')"
                                :num-of-users="3"
                                imageWidth="30px"
                                :addUser="false"
                                class="mr-5px"
                            />
                            <h5 class="text-ellipse item-title" :style="`color: ${task.textColor ? task.textColor : '#818181'}; background-color: ${task.backColor ? task.backColor : 'transparent'};`">
                                <span v-for="(user, userIndex) in task.users" :key="userIndex">
                                    {{userIndex !== 0 ? ", " : "" }}{{user.Employee_Name}}
                                </span>
                            </h5>
                        </div>
                        <div class="position-re d-flex align-items-center" v-else>
                            <img src="@/assets/images/Assign.png" alt="unassigned"/>
                            <h5 class="text-ellipse item-title" :style="`color: ${task.textColor ? task.textColor : '#818181'}; background-color: ${task.backColor ? task.backColor : 'transparent'}; margin-left: 5px;`">Unassigned</h5>
                        </div>
                         <span class="cursor-pointer mr-10px add__task-iconwrapper">
                            <img src="@/assets/images/svg/PlusIconWithSquareBorder.svg" alt="addTask" @click="toggleCreateTask(task.key)">
                        </span>
                    </div>
                    <div v-else class="d-flex justify-content-between mb-10px">
                        <span class="boardViewDisplayWrapper__columnName text-ellipse status-sprint font-weight-500 align-items-center" :style="`color: ${task.textColor ? task.textColor : ''}; background-color: ${task.bgColor ? task.bgColor : 'transparent'}; display: flex;`">
                            <!-- <img v-if="task.image" :src="task.image" :alt="task.name" :title="task.name"> -->
                            <WasabiImage v-if="task.image" :data="{url: task.image, title: task.name}" class="mr-5px"/>
                            {{task.name}}
                        </span>
                        <span v-if="groupValue === 0 ? task.key === 1 : groupValue === 3 ? (task.key !== '0_4_Next' && task.key !== '0_1_Overdue') : true" class="cursor-pointer mr-10px add__task-iconwrapper">
                            <img src="@/assets/images/svg/PlusIconWithSquareBorder.svg" alt="addTask" @click="toggleCreateTask(task.key)">
                        </span>
                    </div>
                    <div class="list-group-kanban style-scroll kanban-first-scroll">
                        <div v-if="taskCreateDisplay === task.key" :id="task.key" class="bg-white border-radius-5-px mb-1">
                            <BoardViewTaskCreateVue :data="task" :groupValue="groupValue" @toggle="(val) => toggleCreateTask(val)" :sprintData="{}"/>
                        </div>
                        <draggable
                            :class="{'isDisabled': task.disabled ? task.disabled : false }"
                            :list="task.tasksArray"
                            class="list-group-kanban style-scroll"
                            group="tasks"
                            :move="checkMove"
                            @change="log($event,task)"
                            @scroll="checkScroll($event,task)"
                            item-key="id"
                            :sort="true"
                            :disabled="isLoading || showArchiveVar && checkPermission('task.task_list',projectData?.isGlobalPermission)!==true || checkPermission('task.task_status',projectData?.isGlobalPermission) !== true || showArchiveVar !== false"
                        >
                            <template #item="{ element }">
                                <div class="list-group-kanban-item-wrapper">
                                    <div class="list-group-kanban-item">
                                        <BoardViewDisplayCardComponent  :data="element" :groupValue="groupValue" @subtaskOpen="getSubTask(element,task)" :isSubTask="false"/>
                                    </div>
                                    <div v-if="element.isExpanded && element?.subtaskArray?.length">
                                        <div class="subTaskShow" v-for="(subTask,index) in element.subtaskArray" :key="index">
                                            <BoardViewDisplayCardComponent :data="subTask" :groupValue="groupValue" :isSubTask="true" :parentAssignee="element.AssigneeUserId"/>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                    <!-- <div v-if="loading === task.key" class="position-fi" style="height: 100%; width: 100%; background-color: #00000035"> -->
                        <!-- <SpinnerComp class="position-ab" :is-spinner="true"/> -->
                    <!-- </div> -->
                </div>
            </Transition>
            <div v-else class="postition-re boardViewDisplayColumn">
                <div class="d-flex justify-content-between w-100 mb-10px">
                    <Skelaton class="border-radius-5-px" style="height: 24px; width: 65px;"/>
                    <span class="cursor-pointer mr-10px add__task-iconwrapper" v-if="groupValue === 0 ? task.key === 1 : groupValue === 3">
                        <img src="@/assets/images/svg/PlusIconWithSquareBorder.svg" alt="addTask">
                    </span>
                </div>
                <div class="list-group-kanban style-scroll">
                    <div class="list-group-kanban-item-wrapper">
                        <div class="list-group-kanban-item pt-10px pl-10px pr-10px pb-5px w-100" style="margin-bottom: 10px;" v-for="i in Math.round(Math.random() * (5-2) + 2)" :key="i">
                            <Skelaton class="border-radius-5-px" style="height: 15px; width: 60px;"/>
                            <Skelaton class="border-radius-5-px mt-5px" style="height: 22px; width: 140px;"/>
                            <div class="d-flex align-items-center mt-5px">
                                <Skelaton class="border-radius-3-px mr-8px" style="height: 14px; width: 14px;"/>
                                <Skelaton class="border-radius-5-px" style="height: 15px; width: 90px;"/>
                            </div>
                            <div class="d-flex align-items-center mt-5px justify-content-between">
                                <div class="d-flex align-items-center">
                                    <Skelaton class="mr-8px border-radius-50-per" style="height: 21px; width: 21px;"/>
                                    <Skelaton class="mr-8px border-radius-50-per" style="height: 21px; width: 21px;"/>
                                </div>
                                <Skelaton class="border-radius-50-per" style="height: 21px; width: 21px;"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <SpinnerComp :is-spinner="isLoading" v-if="isLoading"/> -->
        </template>
    </div>
</template>
<script setup>
    import {ref,watch,inject,computed, nextTick, onMounted} from "vue";
    import { useStore } from "vuex";
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import BoardViewDisplayCardComponent from '@/views/Projects/Kanban/BoardViewDisplayCardComponent'
    import BoardViewTaskCreateVue from "@/views/Projects/Kanban/BoardViewTaskCreate"
    // import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import Assignee from "@/components/molecules/Assignee/Assignee.vue"
    import draggable from "vuedraggable";
    import { useUpdateTasks } from "../helper";
    import { useCustomComposable } from "@/composable";
    import * as env from '@/config/env';
    import { apiRequest } from "../../../services";
    import Skelaton from "@/components/atom/Skelaton/Skelaton.vue";

    const props = defineProps({
        data: {
            type: Array,
            default: () => []
        },
        group: {
            type: Number
        }
    })
    const searchedTask = inject('searchedTask');
    const companyId = inject("$companyId");
    const taskCollapsed = inject("taskCollapsed");
    const {checkPermission} = useCustomComposable();
    const {getters,dispatch,commit} = useStore();
    const showArchiveVar = inject("showArchived");
    const {updateTaskByGroup} = useUpdateTasks();
    const taskData = ref(props.data)
    const groupValue = ref(props.group)
    const projectData = inject("selectedProject");
    const isLoading = ref(false);
    const taskCreateDisplay = ref(false);
    const userId = inject("$userId")

    watch(() => (props.data) ,(value)  => {
        taskData.value = value;
        propareData();
    },{deep:true})
    watch(() => (props.group) ,(value)  => {
        groupValue.value = value;
    })
    const currentProjectTasks = computed(() => getters['projectData/tasks']);
    watch([taskCollapsed], ([newVal], [oldVal]) => {
        if(newVal !== oldVal && !searchedTask.value) {
            taskData.value.forEach((data)=>{
                if(newVal === false) {
                    data.tasksArray.filter((x) => x.isParentTask).forEach((x) => {
                        x.isExpanded = true;
                        fetchSubTask(x, true,data);
                    })
                } else {
                    data.tasksArray.filter((x) => x.isParentTask).forEach((x) => {
                        x.isExpanded = false;
                    })
                }
            })
        }
    })

    onMounted(() => {
        propareData();
    })

    const checkMove = (e) => {
        return !e.to.className.includes('isDisabled')
    }

    function propareData () {
        // setTimeout(() => {
            let taskWithoutFilter = []
            let taskArray = [];
                taskData.value.forEach((data)=> {
                    let withoutIndexTask = data.tasksArray?.filter((x) => {
                        return (x[data.indexName] === undefined || x[data.indexName] === null) && x.TaskKey !== '--'
                    })
                    if (withoutIndexTask?.length > 0) {
                        withoutIndexTask.map((x) => taskWithoutFilter.push({data: x._id, item: data, taskKey: x.TaskKey}))
                        withoutIndexTask.map((x) => taskArray.push(x));
                    }
                })
            if (!(taskWithoutFilter.length === 0 && taskArray.length === 0)) {
                var newObj = {pid: projectData.value._id, sprintId: taskData.value[0].sprintId, tasksArray: taskArray, indexName: taskData.value[0].indexName};
                commit("projectData/mutateTaskIndex",newObj)
                let count = 0;
                if (taskArray.length !== 1) {
                    isLoading.value = true;
                }
                let countFunction = (row) => {
                    if (count >= taskWithoutFilter.length) {
                        isLoading.value = false;
                        return;
                    } else {
                        if (row.taskKey != '--') {
                            apiRequest("post", env.ONLOAD_UPDATE_TASK_INDEX, {
                                taskUpdate : row,
                                companyId: companyId.value,
                            }).then(()=>{
                                count++;
                                countFunction(taskWithoutFilter[count])
                            })
                            .catch((error) => {
                                console.error("ERROR in update project history: ", error);
                                count++;
                                countFunction(taskWithoutFilter[count])
                            })
                        } else {
                            count++;
                            countFunction(taskWithoutFilter[count]);
                        }
                    }
                }
                countFunction(taskWithoutFilter[count])
            }
        // }, 2000);

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

    function toggleCreateTask(id) {
        if(taskCreateDisplay.value) {
            taskCreateDisplay.value = "";
        } else {
            taskCreateDisplay.value = id;
        }

        if(taskCreateDisplay.value) {
            nextTick(() => {
                document.getElementById(id).scrollIntoView();
            })
        }
    }

    function checkScroll(e,task) {
        debouncer(50)
        .then(() => {
            if(e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight) - 200) {
                getPaginatedTasks({
                    cid: companyId.value,
                    pid: projectData.value._id,
                    sprintId: task.sprintId,
                    item: task,
                    fetchNew: true
                });
            }
        })
        .catch((err) => {
            console.error("error", err);
        })
    }

    const getSubTask = (element,task) => {
        element.isExpanded = !element.isExpanded;
        if(element && (!element.subtaskArray || element.subtaskArray.length < 25)) {
            let fetchNew = currentProjectTasks.value?.[element.ProjectID]?.[element.sprintId].index[`${element.id}_${task.searchKey}_${task.searchValue}`] === undefined;
            fetchSubTask(element, fetchNew,task);
        }
    }
    const log = (event,task) => {
        let element = null;
        let index = null;
        if (event.added) {
            element = event.added.element
            index = event.added.newIndex
        }
        else if (event.moved) {
            element = event.moved.element
            index = event.moved.newIndex
        }
        if (element) {
            if (event.added) {
                updateTaskByGroup(element, task, groupValue.value,null,false);
            }
            let relevantIndex
            let tempIndex;
            let taskDt = taskData.value.find((x) => x.searchValue === task.searchValue);
            if (index === 0 && taskDt.tasksArray.length === 1) {
                tempIndex = 0
            }
            else if ((index+1) === taskDt.tasksArray.length) {
                tempIndex = taskDt.tasksArray[taskDt.tasksArray.length - 2][task.indexName] + 65536
            } else {
                if (index === 0) {
                    tempIndex = taskDt.tasksArray[1][task.indexName] - 65536
                } else {
                    tempIndex = (taskDt.tasksArray[index - 1][task.indexName] + taskDt.tasksArray[index + 1][task.indexName]) / 2
                }
            }
            if (taskDt.tasksArray.length !== 1 && taskDt.tasksArray.length !== 0) {
                if (index === 0) {
                    relevantIndex = taskDt.tasksArray[1][task.indexName]
                } else {
                    relevantIndex = taskDt.tasksArray[index - 1][task.indexName]
                }         
            } else {
                relevantIndex = 0
            }
            let UpdateData
            let uniqueeTime = new Date().getTime()
            if (groupValue.value === 0) {
                const updatedStatus = {
                    'text': task.name,
                    'key': task.key,
                    'type': task.type,
                }
                UpdateData = {
                    status: updatedStatus,
                    'statusType': task.type,
                    'statusKey': task.key,
                    'updateToken': {user: localStorage.getItem('token'),timeStamp: uniqueeTime},
                    'islocalSnapStop': true
                }
            }
            if (groupValue.value ===2) {
                UpdateData ={
                    Task_Priority : task.value,
                    'updateToken': {user: localStorage.getItem('updateToken'),timeStamp: uniqueeTime},
                    'islocalSnapStop': true,
                    Updated_At: new Date()
                }
            }
            if (groupValue.value === 1) {
                UpdateData = {
                    AssigneeUserId : task.value !== '' ? task.value.split("_") : [],
                    'updateToken': {user: localStorage.getItem('updateToken'),timeStamp: uniqueeTime},
                    'islocalSnapStop': true
                }
            }
            if (groupValue.value === 3) {
                UpdateData = {
                    DueDate: new Date(task.searchValue * 1000),
                    'updateToken': {user: localStorage.getItem('updateToken'),timeStamp: uniqueeTime},
                    Updated_At: new Date(),
                    'islocalSnapStop': true
                }
            }
            apiRequest("post", env.UPDATA_TASK_INDEX, {
                relevantIndex: relevantIndex,
                projectId: element.ProjectID,
                companyId: element.CompanyId,
                taskId: element._id,
                isFirst: index === 0 ? true : false,
                isFirstWithRecord: (index === 0 && taskDt.tasksArray.length !== 1 && taskDt.tasksArray.length !== 0) ? true : false,
                indexName: task.indexName,
                sprintId: element.sprintId,
                relevantKey: task.searchValue,
                searchKey: task.searchKey,
                taskKey: element.TaskKey,
                updateData: UpdateData
            }).then(()=>{
                element = {...element, ...UpdateData,  [task.indexName]: tempIndex}
                element.updateTimeStamp = uniqueeTime;
                var newObj = {pid: projectData.value._id, sprintId: taskData.value[0].sprintId, task: element};
                commit("projectData/mutateTaskForDragAndDrop",newObj)
            })
            .catch((error) => {
                console.error("ERROR in update project history: ", error);
            })
        }
    }


    function getPaginatedTasks(params) {
        dispatch("projectData/getPaginatedTasks", params)
        .catch((error) => {
            console.error(`ERROR in get tasks  `, error);
        })
    }

    function fetchSubTask(task, fetchNew = false,data) {
        getPaginatedTasks({
            cid: companyId.value,
            pid: projectData.value._id,
            sprintId: task.sprintId,
            item: data,
            userId: userId.value,
            fetchNew: fetchNew,
            parentId: task.isParentTask ? task._id : "",
        });
    }
</script>
<style src="./style.css" scopped></style>