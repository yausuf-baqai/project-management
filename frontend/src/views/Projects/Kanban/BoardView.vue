<template>
    <div>
        <template v-if="loading">
            <div class="boardViewDisplayWrapper style-scroll">
                <div class="postition-re boardViewDisplayColumn" v-for="(j, ind) in Math.round(Math.random() * (5-2) + 2)" :key="j">
                    <div class="d-flex justify-content-between w-100 mb-10px">
                        <Skelaton class="border-radius-5-px" style="height: 24px; width: 65px;"/>
                        <span class="cursor-pointer mr-10px add__task-iconwrapper" v-if="ind === 0">
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
            </div>
        </template>
        <template v-else>
            <div v-if="searchedTask ? filteredTasksGetter?.length : getTaskArray?.length">
                <BoardViewDisplay :data="searchedTask ? filteredTasksGetter : getTaskArray" :group="grouped" :loading="loading"/>
            </div>
            <div v-else>
                <div class="d-flex align-items-center justify-content-center flex-column">
                    <img src="@/assets/images/svg/No-Search-Result.svg" alt="noSearchResult">
                    <h3 class="mt-1">No Data Found</h3>
                </div> 
            </div>
        </template>
    </div>
</template>

<script setup>
    import { ref, defineProps, defineEmits, computed, 
        onMounted,
        watch, inject
    } from 'vue';
    import { useStore } from 'vuex';
    import isEqual from 'lodash/isEqual';

    import BoardViewDisplay from '@/views/Projects/Kanban/BoardViewDisplay'
    import { taskListHelper } from '@/views/Projects/helper.js';
    import Skelaton from '@/components/atom/Skelaton/Skelaton.vue';

    const props = defineProps({
        grouped: {
            type: Number,
            default: 0
        },
        commonDateFormatForDate: {
            type: String,
            default: "DD/MM/YYYY"
        },
        sprints: {
            type: Array,
            default: () => []
        },
        projectData: {
            type: Object,
            default: () => {}
        },
    })
    const { getters} = useStore();
    const searchKey = ref("");
    const {
        groupBy,
        checkCase
    } = taskListHelper();
    const showArchiveVar = inject("showArchived");
    const searchedTask = inject('searchedTask');
    const project = inject('selectedProject');
    const taskFields = ref(project.value?.taskFields || {});
    const filteredTaskFields = ref(Object.values(taskFields.value));
    const taskData = computed(() => getters["projectData/tasks"])
    const searchData = computed(()=>  getters['projectData/searchedTasks'])
    const loading = ref(false);
    const groupedTasks = ref([]);
    const getTaskArray = ref([]);
    const filteredTasksGetter = ref([]);
    const headers = ref([
        {
            label: "Chat",
            key: "commentCounts"
        },
        {
            label: "Assignee",
            key: "AssigneeUserId",
            funcPermission: 'task.task_assignee',
        },
        {
            label: "Due Date",
            key: "DueDate",
            funcPermission: 'task.task_due_date',
        },
        {
            label: "Priority",
            key: "Task_Priority",
            funcPermission: 'task.task_priority',
            appPermission: 'Priority'
        },
        {
            label: "Key",
            key: "TaskKey"
        },
    ])
    const filterHeaders = ref(headers.value.filter((x) => filteredTaskFields.value.find((y) => y.key === x.key && y.visible)));

    defineEmits(['change'])

    function getTaskArrayFunction () {
        if (!searchedTask.value && Object.keys(taskData.value).length > 0) {
            let proTaskObj = taskData.value[`${project.value._id}`]
            let taskArray = [];
            taskArray = proTaskObj?.[props.sprints[0]?.id]?.tasks
            groupedTasks.value[0]?.items.forEach((ele) => {
                ele.sprintId = groupedTasks.value[0].id
                ele.tasksArray = [];
                if(ele.searchKey === "DueDate") {
                    if (ele.name === "Next" || ele.name === "Overdue" || ele.name === "No Due Date") {
                        ele.disabled = true;
                    }
                    ele.tasksArray =  taskArray?.filter((x) => {
                        return x.DueDate ? checkCase(ele.operation, ele.searchValue,(new Date(x[ele.searchKey]).getTime() / 1000)) : ele.operation === "non" && (showArchiveVar.value ?  x?.deletedStatusKey : !x?.deletedStatusKey)
                    })?.sort((a,b)=> a.groupByDueDateIndex - b.groupByDueDateIndex);
                } else if(ele.searchKey === "AssigneeUserId") {
                    ele.tasksArray = taskArray?.filter((x) => {
                        return x?.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === ele.value && (showArchiveVar.value ?  x?.deletedStatusKey :!x?.deletedStatusKey);
                    })?.sort((a,b)=> a.groupByAssigneeIndex - b.groupByAssigneeIndex);
                } else {
                    if (ele.searchKey === "statusKey") {         
                        ele.tasksArray = taskArray?.filter((x) => {
                            return x[ele.searchKey] === ele.searchValue && (showArchiveVar.value ?  x?.deletedStatusKey :!x?.deletedStatusKey)
                        })?.sort((a,b)=> a.groupByStatusIndex - b.groupByStatusIndex);
                    } else if (ele.searchKey === "Task_Priority") {
                        ele.tasksArray = taskArray?.filter((x) => {
                            return x[ele.searchKey] === ele.searchValue && (showArchiveVar.value ?  x?.deletedStatusKey :!x?.deletedStatusKey)
                        })?.sort((a,b)=> a.groupByPriorityIndex - b.groupByPriorityIndex);
                    }
                    else {
                        ele.tasksArray = taskArray?.filter((x) => {
                            return x[ele.searchKey] === ele.searchValue && (showArchiveVar.value ?  x?.deletedStatusKey :!x?.deletedStatusKey)
                        });
                    }
                }
                ele.tasksArray = ele.tasksArray?.map((x) => {
                    if(x?.subtaskArray) {
                        x.subtaskArray = x.subtaskArray.filter((y) => !y?.deletedStatusKey);
                    }
                    return x;
                })
            })
            getTaskArray.value =  groupedTasks.value[0]?.items;
        } else {
            getTaskArray.value =  [];
        }
    }

    function filteredTasksGetterFunction () {
        if(searchData.value?.length && Object.keys(searchData.value).length > 0) {
            groupedTasks.value[0]?.items.forEach((ele) => {
                ele.tasksArray = [];
                if(ele.searchKey === "DueDate") {
                    if (ele.name === "Next" || ele.name === "Overdue" || ele.name === "No Due Date") {
                        ele.disabled = true;
                    }
                    ele.tasksArray =  searchData.value.filter((x) => {
                        return  x.sprintId === props.sprints[0]?.id && x.DueDate ? checkCase(ele.operation, ele.searchValue, (new Date(x[ele.searchKey]).getTime() / 1000)) : ele.operation === "non"
                    })?.sort((a,b)=> a.groupByDueDateIndex - b.groupByDueDateIndex);
                } else if(ele.searchKey === "AssigneeUserId") {
                    ele.tasksArray = searchData.value.filter((x) => {
                        return x.sprintId === props.sprints[0]?.id && x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === ele.value
                    })?.sort((a,b)=> a.groupByAssigneeIndex - b.groupByAssigneeIndex);
                } else {
                    if (ele.searchKey === "statusKey") {         
                        ele.tasksArray = searchData.value.filter((x) => {
                            return x[ele.searchKey] === ele.searchValue && x.sprintId === props.sprints[0]?.id
                        })?.sort((a,b)=> a.groupByStatusIndex - b.groupByStatusIndex);
                    } else if (ele.searchKey === "Task_Priority") {
                        ele.tasksArray = searchData.value.filter((x) => {
                            return x[ele.searchKey] === ele.searchValue && x.sprintId === props.sprints[0]?.id
                        })?.sort((a,b)=> a.groupByPriorityIndex - b.groupByPriorityIndex);
                    } else {
                        ele.tasksArray = searchData.value.filter((x) => {
                            return x[ele.searchKey] === ele.searchValue && x.sprintId === props.sprints[0]?.id
                        });
                    }
                }
            })
            filteredTasksGetter.value =  groupedTasks.value[0]?.items
        } else {
            filteredTasksGetter.value =  []
        }
    }
    function prepareArray() {
        if (!searchedTask.value && Object.keys(taskData.value).length > 0) {
            getTaskArrayFunction();
        }
        if (searchData.value?.length && Object.keys(searchData.value).length > 0) {
            filteredTasksGetterFunction();
        }
    }

    watch([headers, filteredTaskFields], ([val]) => {
        filterHeaders.value = val.filter((x) => filteredTaskFields.value.find((y) => y.key === x.key && y.visible));
    })

    watch(project, () => {
        taskFields.value = project.value?.taskFields || {}
    })

    watch([searchKey, taskFields], () => {
        filteredTaskFields.value = Object.values(taskFields.value).filter((x) => x.label.toLowerCase().includes(searchKey.value.toLowerCase()));
    })

    watch([() => props.grouped, () => props.sprints], ([newGroup, newSprints], [oldGroup, oldSprints]) => {
        if(project.value && Object.keys(project.value).length) {
            loading.value = true;
            groupBy(props.grouped, !isEqual(newGroup,oldGroup) || JSON.stringify(newSprints) !== JSON.stringify(oldSprints),project,props.sprints,groupedTasks,true,'board',(resp)=>{
                groupedTasks.value = resp;
                setTimeout(() => {
                    loading.value = false;
                }, 500)
            });
        }
    })

    watch([searchedTask,searchData,taskData,groupedTasks],()=>{
        prepareArray();
    })

    onMounted(() => {
        if(project.value && Object.keys(project.value).length) {
            loading.value = true;
            if (!taskData.value || !Object.keys(taskData.value).length) {
                groupBy(props.grouped,true,project,props.sprints,groupedTasks,true,'board',(resp)=>{
                    groupedTasks.value = resp;
                    setTimeout(() => {
                        loading.value = false;
                    }, 500)
                });
            } else {
                groupBy(props.grouped,false,project,props.sprints,groupedTasks,true,'board',(resp)=>{
                    groupedTasks.value = resp;
                    setTimeout(() => {
                        loading.value = false;
                    }, 500)
                });
            }
        }
        prepareArray();
    })
</script>