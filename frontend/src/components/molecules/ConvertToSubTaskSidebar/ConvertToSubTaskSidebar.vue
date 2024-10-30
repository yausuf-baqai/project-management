<template>
    <div class="mainConverToSubTask">
    <Sidebar width="607px"  :top="clientWidth <= 767 ? '0px' : '46px'" className="converted__sidebar">
            <template #head-left >
                <div class="blue font-roboto-sans screenShotPreview text-ellipsis text-nowrap pr-15px" :class="clientWidth>767 ? 'font-size-18' : 'font-size-16'"  v-if="(props.fromWhich == undefined || props.fromWhich !== 'dashboard')">{{props.isMoveTask === true || props.openMoveSubTask === true ? 'Move Task' : isMergeTask === true ? 'Merge Task Into' : isDuplicate === true ? 'Duplicate Task' : isConvertTask ? 'Convert to Task' : isCreteTask ? 'Create Task' :'Convert to Subtask'}}</div>
                <div class="blue font-roboto-sans screenShotPreview text-ellipsis text-nowrap pr-15px" :class="clientWidth>767 ? 'font-size-18' : 'font-size-16'" v-else>Add to Queue</div>
            </template>
            <template #head-right>
                <button class="outline-primary d-flex align-items-center font-roboto-sans" @click="closeSidebar()" :class="clientWidth>767 ? 'font-size-16' : 'font-size-14'" :style="[{padding : clientWidth ? '3px 13.2px' : '3px 5px' , marginRight : clientWidth ? '0px' : '5px'}]">Cancel</button>
                <template v-if="isDuplicate === true || isCreteTask === true">
                    <button v-if="Object.keys(selectedSprintData).length > 0 && isDisable === false" class="btn-primary font-roboto-sans ml-10px"  :class="clientWidth>767 ? 'font-size-16' : 'font-size-14'"  :style="[{padding : clientWidth ? '3px 14.4px' : '3px 5px'}]"  @click="duplicateTaskButton()">{{isDuplicate ? 'Duplicate Task' : 'Create Task'}}</button>
                    <button v-else class="btn-secondary font-roboto-sans ml-10px"  :class="clientWidth>767 ? 'font-size-16' : 'font-size-11'"  :style="[{padding : clientWidth>767 ? '3px 14.4px' : '3px 3px'}]">{{isDuplicate ? 'Duplicate Task' : 'Create Task'}}</button>
                </template>
            </template>
            <template #body>
                <div :class="[{'duplicatetask__converttask--wrapper': (props.isDuplicate === true || isCreteTask === true)}]">
                    <DuplicateCompo v-if="props.isDuplicate === true" @selctedItems="selectedItems" :task="task" :selectedProjectData="selectedProjectData" :selectedSprint="selectedSprintData" @assignee="assigneFun" @watcher="watcherFun" @taskName="taskFun" :from="props.isMoveTask ? 'move' : 'duplicate'"/>
                    <div class="bg-white create__component--wrapper">
                        <div v-if="isCreteTask" class="create__task-title form-group d-flex align-items-center border-bottom-mobiledrop">
                            <InputText
                                v-model="taskData.value"
                                class="form-control login-input text-capitalize"
                                placeHolder="Enter Task Name"
                                :maxLength="250"
                                :minLength="3"
                                autocomplete="off"
                                type="text"
                                @keyup="checkErrors({'field':taskData,
                                'name':taskData.name,
                                'validations':taskData.rules,
                                'type':taskData.type,
                                    'event':$event.event}),$emit('taskData',taskData.value)"
                            />
                            <div class="red font-size-12">{{taskData.error}}</div>
                        </div>
                    </div>
                    <div class="bg-white overflow-x-visible overflow-y-auto overflow-y-auto::-webkit-scrollbar p15x-20px" :class="{'border-radius-12-px' : clientWidth > 767, 'border-radius-0 ' : clientWidth <= 767 , 'convert__projecttask-wrapper':props.isDuplicate === true || isCreteTask === true }"  :style="[{margin : clientWidth > 767 ? '15px' : '0px' , height : clientWidth <= 767 ?  '100%' : '' , maxHeight :  clientWidth > 767 ? 'calc(100vh - 46px)' : '100%' }]">
                        <span v-if="props.isDuplicate === true || isCreteTask === true" class="font-size-16 font-weight-500 dark-gray mb-20px">Location</span>
                        <div :class="[{'duplicate__component-with--convertlist':props.isDuplicate === true || isCreteTask === true,'duplicate_component_only' : props.isDuplicate === true}]">
                            <div class="gray" :class="{'font-size-12' : clientWidth > 767, 'font-size-16' : clientWidth <= 767}">Project</div>
                            <div class="d-flex align-items-center justify-content-between project__title-browsewrapper" v-if="isShowProjectList === false" :style="[{paddingTop : clientWidth > 767 ? '7px' : '15px'}]">
                                <div class="d-flex align-items-center text-ellipsis" :style="[{width : clientWidth > 767 ? '78%' : '50%'}]">
                                    <span v-if="selectedProjectData.projectIcon && selectedProjectData.projectIcon.type === 'color'" class="d-flex align-items-center justify-content-center font-weight-400 inital-box" :style="[{'background-color': selectedProjectData.projectIcon.data}]">{{ selectedProjectData.ProjectName.charAt(0).toUpperCase()}}</span>
                                    <template v-else-if="selectedProjectData.projectIcon && selectedProjectData.projectIcon.type === 'image'">
                                        <WasabiImage class="profile-sm-square project__icon" v-if="!selectedProjectData.projectIcon.data.includes('http')" :data="{url: selectedProjectData.projectIcon.data, filename: selectedProjectData.projectIcon.data.split('/').pop(), extension: selectedProjectData.projectIcon.data.split('/').pop().split('.').pop()}"/>
                                        <img v-else class="profile-sm-square project__icon" :src="selectedProjectData.projectIcon.data" alt=""/>
                                    </template>
                                    <span class="text-ellipsis Project-name-sidebar font-weight-500" :class="{'font-size-13' : clientWidth > 767, 'font-size-16' : clientWidth <= 767}">{{selectedProjectData.ProjectName}}</span>
                                </div>
                                <span class="blue text-decoration-underline font-weight-500 cursor-pointer" @click="isShowProjectList = true" :class="{'font-size-14' : clientWidth > 767, 'font-size-16' : clientWidth <= 767}">Browse Projects</span>
                            </div>
                            <template v-if="isShowProjectList === true">
                                <InputText :placeHolder="'Search'" v-model="projectSearch" class="input__Search"/>
                                <template v-if="projectDatas.length > 0">
                                    <div class="overflow-x-visible overflow-y-auto overflow-y-auto::-webkit-scrollbar duplicate__convertTask" :style="[{ maxHeight : clientWidth > 767 ? 'calc(100vh - 214px)' : 'calc(100vh - 240px)'}]">
                                        <div v-for="project in projectDatas" :key="project" class="browse__Categotyproject-wrapper">
                                            <div class="d-flex align-items-center browse__project-wrapper" @click="changeProject(project)">
                                                <span v-if="project.projectIcon && project.projectIcon.type === 'color'" class="d-flex align-items-center justify-content-center font-weight-400 inital-box ml-6px" :style="[{'background-color': project.projectIcon.data}]">{{ project.ProjectName.charAt(0).toUpperCase()}}</span>
                                                <template v-else-if="project.projectIcon && project.projectIcon.type === 'image'">
                                                    <WasabiImage class="profile-sm-square project__icon" v-if="!project.projectIcon.data.includes('http')" :data="{url: project.projectIcon.data, filename: project.projectIcon.data.split('/').pop(), extension: project.projectIcon.data.split('/').pop().split('.').pop()}"/>
                                                    <img v-else class="profile-sm-square project__icon" :src="project.projectIcon.data" alt=""/>
                                                </template>
                                                <span class="text-ellipsis Project-name-sidebar font-weight-500" :class="{'font-size-14' : clientWidth > 767, 'font-size-16' : clientWidth <= 767}">{{project.ProjectName}}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <div v-else>No Result Found</div>
                            </template>
                            <div v-if="isShowProjectList === false">
                                <InputText :placeHolder="'Search'" v-model="taskSearch" class="input__Search"/>
                                <div class="overflow-x-visible overflow-y-auto overflow-y-auto::-webkit-scrollbar"  :class="[{'duplicatetask__project--sprintList':props.isDuplicate === true}]" :style="[{maxHeight : clientWidth > 767 ? 'calc(100vh - 241px)' : 'calc(100vh - 275px)'}]">
                                    <template v-if="filterFoldersSprints && Object.keys(filterFoldersSprints).length">
                                        <SideBarSprintFolderData v-for="subItem in filterFoldersSprints" :key="subItem.folderId" :data="subItem" :folder="true" @change="toggleSubItem($event)" :selectedProjectData="selectedProjectData" :searchData="searchData" :taskSearch="taskSearch" :isMoveTask="props.isMoveTask" 
                                            @clickSprint="clickSprint"
                                            :isDuplicate="props.isDuplicate || isCreteTask"
                                            :isMergeTask="props.isMergeTask"
                                            :fromWhich="props.fromWhich"
                                            :task="task"
                                            @dataToGrandParent="(ele)=>{getDataFromChild(ele)}"
                                            :isConvertTask="isConvertTask"
                                            @closeTaskSidebar="closeSidebar()"
                                        />
                                    </template>
                                    <template v-if="filterSprints && filterSprints.length">
                                        <SideBarSprintFolderData v-for="subItem in isMoveTask === true ? filterSprints.filter((x)=>x.id !== task.sprintId) : filterSprints" :key="subItem.id" :data="subItem" :selectedProjectData="selectedProjectData" :searchData="searchData" :taskSearch="taskSearch"
                                            :isMoveTask="props.isMoveTask"
                                            :isDuplicate="props.isDuplicate || isCreteTask"
                                            :isMergeTask="props.isMergeTask"
                                            :fromWhich="props.fromWhich"
                                            @click="props.isMoveTask === true || props.isDuplicate === true || props.isConvertTask === true || isCreteTask ? clickSprint(subItem) : ''"
                                            :task="task"
                                            @dataToGrandParent="(ele)=>{getDataFromChild(ele)}"
                                            :isConvertTask="isConvertTask"
                                            @closeTaskSidebar="closeSidebar()"
                                        />
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
                <ConfirmationsInTask v-if="showSidebar" :statusConfirm="statusConfirm" :taskTypeConfirm="taskTypeConfirm" v-model="showSidebar" :oldStatus="oldStatus" :oldTaskType="oldTaskType" @checkAllModel="checkAllModel" @checkTaskType="checkTaskType"
                    :selectedProjectData="selectedProjectData"
                    :data="task"
                    @changeStatus="(st,st1) => changeStatus(st,st1,projectData)"
                    @changeTaskType="(type,type1) => changeTaskType(type,type1,projectData)"
                    @finalConfirm="confirmData"
                    :errorMsg="errorMsg"
                    :errorMsgType="errorMsgType"
                    :assigneeSidebar="assigneeSidebar"
                    @assigneeConfirm="assigneeConfirm"
                    :selectedSprintData="selectedSprintData"
                    @closeModel="closeSidebar()"
                />

            </template>
    </Sidebar>
    </div>
</template>

<script setup>
    import { defineProps, ref, computed, inject, watch, nextTick, onMounted } from 'vue'
    import { useStore } from 'vuex';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import InputText from '@/components/atom/InputText/InputText.vue';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import SideBarSprintFolderData from "@/components/organisms/SideBarSprintFolderData/SideBarSprintFolderData.vue"
    import { useCustomComposable, useGetterFunctions } from '@/composable';
    import { useRoute, useRouter } from 'vue-router';
    import taskClass from "@/utils/TaskOperations";
    import { useToast } from "vue-toast-notification"
    import ConfirmationsInTask from "@/components/atom/ConfirmationsInTask/ConfirmationsInTask.vue"
    import {useHelperFun} from "./helper"
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import DuplicateCompo from '@/components/atom/DuplicateCompo/DuplicateCompo.vue';
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    const {getters,dispatch} = useStore();
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
    import { BSON } from 'realm-web';
    import { useValidation } from "@/composable/Validation";
    const props = defineProps({
        closeSideBar: {
            type: Boolean,
        },
        isMoveTask: {
            type: Boolean,
            default: false
        },
        openMoveSubTask: {
            type: Boolean,
            default: false
        },
        isMergeTask: {
            type: Boolean,
            default: false
        },
        isDuplicate:{
            type: Boolean,
            default: false
        },
        task: { 
            type: Object,
            default:()=>{}
        },
        selectedProjectObject: { 
            type: Object,
            default:()=>{}
        },
        fromWhich: {
            type: String,
            default:''
        },
        allProjectsArrayFilter: {
            type: Array,
            default:()=>[]
        },
        isConvertTask:{
            type: Boolean,
            default: false
        },
        isCreteTask: {
            type: Boolean,
            default: false
        },
        content: {
            type: String,
            default: ''
        },
        isDisableButton: {
            type: Boolean,
            default: false
        }
    });
    const isDisable = computed(() => props.isDisableButton)
    const {changeTaskType, changeStatus, filterSprintData, filterFolderSprintData, oldStatusData, oldTaskTypeData} = useHelperFun();
    const {getUser} = useGetterFunctions()
    const  { checkErrors  } = useValidation();
    const companyId = inject("$companyId");
    const clientWidth = inject("$clientWidth");
    const route = useRoute();
    const router = useRouter();
    // eslint-disable-next-line
    const task = ref({});
    const {debounce} = useCustomComposable();
    const toggleTaskDetail = (props.fromWhich == undefined || props.fromWhich == '') ? inject("toggleTaskDetail") : '';
    const $toast = useToast();
    const projectsGetter = computed(() => getters["projectData/onlyActiveProjects"]);
    const projectSearch = ref("");
    const userId = inject("$userId");
    const duplicateTaskName = ref('')
    const taskData = ref({
        value: props.content,
        rules:
        "min: 3",
        name: "name",
        error: "",
    });


    onMounted(() => {
        task.value = props.task;
        if(props.isMoveTask === true){
            if(filterFoldersSprints.value.length === 0 && filterSprints.value.filter((x) => x.id !== task.value.sprintId)?.length ===0){
                isShowProjectList.value = true;
            }
        }
    })

    const projectDatas = computed(() => {
        if(props.fromWhich !== undefined && props.fromWhich == 'dashboard') {
            if(projectSearch.value) {return props.allProjectsArrayFilter.filter((x) => x.ProjectName.toLowerCase().includes(projectSearch.value.toLowerCase()));} 
            else { return props.allProjectsArrayFilter }
        } else {
            if(projectSearch.value) {return projectsGetter.value.data.filter((x) => x.ProjectName.toLowerCase().includes(projectSearch.value.toLowerCase()));} 
            else { return projectsGetter.value.data; }
        }
    });
    const emit = defineEmits(["isConvertSubtaskOPen","dataToMainComp","createTask"])
    const projectData = (props.selectedProjectObject == undefined || Object.keys(props.selectedProjectObject).length == 0) ? inject("selectedProject") : '';
    const isSidebarOPen = ref(props.closeSideBar);
    const selectedProjectData = ref(props.selectedProjectObject == undefined ? projectData.value : props.selectedProjectObject);
    const sprints = ref(JSON.parse(JSON.stringify(Object.values(selectedProjectData.value.sprintsObj || {}).filter((x)=>x.deletedStatusKey === undefined || x.deletedStatusKey === 0)|| {})));
    const sprintFolders = ref(JSON.parse(JSON.stringify(Object.values(selectedProjectData.value.sprintsfolders || {}).filter((x)=>x.deletedStatusKey === undefined || x.deletedStatusKey === 0))));
    const isShowProjectList = ref(false);
    const taskSearch = ref("");
    const searchData = ref([]);
    const selectedTaskSubTask = ref([]);
    const showSidebar = ref(false);
    const statusConfirm = ref(false);
    const isType = ref(false);
    const taskTypeConfirm = ref(false);
    const errorMsg = ref("");
    const errorMsgType = ref("");
    const selectedSprintData = ref({});
    const isSpinner = ref(false);
    const duplicateSubTask = ref([]);
    const selectedDuplicatedItems = ref([]);
    const selectedAssigneeId = ref(props.task?.AssigneeUserId);
    const selectedWatcherId = ref(props.task?.watchers);
    const assigneeSidebar = ref(false);
    const sprintData = ref([])
    const folderData = ref({})
    const sprintFoldersValue = ref({})

    const closeSidebar = () => {
        isSidebarOPen.value = false;
        emit("isConvertSubtaskOPen",isSidebarOPen.value)
    }

    function toggleSubItem(data) {
        sprintFolders.value.map((x) => {
            if(x.folderId === data.folderId) {
               x.isExpanded = !x.isExpanded;
            } else if(x.isExpanded === true) {
                if(data?.sprintsObj && Object.keys(data.sprintsObj || {}).length) {
                    for (const key in data.sprintsObj) {
                        if (Object.prototype.hasOwnProperty.call(data.sprintsObj, key)) {
                            data.sprintsObj[key].isTaskExpanded = false;
                        }
                    }
                }
                x.isExpanded = false;
            }
            return x;
        })
    }

    const changeProject =  async(event) => {
        selectedProjectData.value = event;
        await getSprintFolderData(selectedProjectData.value._id);
        sprints.value = JSON.parse(JSON.stringify(Object.values(selectedProjectData.value.sprintsObj || {}).filter((x)=>x.deletedStatusKey === undefined || x.deletedStatusKey === 0)|| {}))
        sprintFolders.value = JSON.parse(JSON.stringify(Object.values(selectedProjectData.value.sprintsfolders || {}).filter((x)=>x.deletedStatusKey === undefined || x.deletedStatusKey === 0)));
        isShowProjectList.value = false;
        selectedSprintData.value = {};
    }
    const getSearchTaskData = () => {
        let taskData = [];
        searchData.value = [];
        let obj = {};
        if(props.fromWhich == '' || props.fromWhich !== 'dashboard'){
            obj = [{
                ProjectID : BSON.ObjectID(selectedProjectData.value?._id),
                isParentTask : true,
                deletedStatusKey : 0
            }]
        }else{
            obj = {
                ProjectID: selectedProjectData.value?._id,
                deletedStatusKey: 0,  
                AssigneeUserId : {
                    $in: [userId.value]
                },
                queueListArray : {
                    $nin: [userId.value]
                }
            }
        }
        const query = {
            type: "find",
            collection: dbCollections.TASKS,
            data : obj
        }
        mongodbCrudOperations(query).then((result) => {
            let array = []
            result.filter((x) => {
                array.push(x);
                if(x.TaskName.toLowerCase().includes(taskSearch.value.toLowerCase())) {
                    taskData.push(x);
                    searchData.value = taskData;
                }
            })
            searchData.value.map(async(x) =>{
                if(!x.isParentTask) {
                    let findIndex = array.findIndex((ele)=>{return x.ParentTaskId == ele._id})
                    if(findIndex !== -1) {
                        x.parentTaskName = array[findIndex].TaskName
                    } else {
                        const findObj = {
                            type : "findOne",
                            collection: dbCollections.TASKS,
                            data : [
                                {
                                    _id : x.ParentTaskId
                                }
                            ]
                        }
                        const res = await mongodbCrudOperations(findObj);
                        x.parentTaskName = res.TaskName
                    }
                } 
                return x;
            })
        })
    }

    const filterSprints = computed(() => {
        return filterSprintData(taskSearch.value,props.isMoveTask,sprints.value,searchData.value,props.isDuplicate)
    })

    const filterFoldersSprints = computed(() => {
        return filterFolderSprintData(taskSearch.value,props.isMoveTask,sprintFolders.value.filter((x) => Object.keys(x.sprintsObj || {}).length > 0),searchData.value,props.isDuplicate)
    })

    watch(taskSearch, debounce(() => {
        if(props.isMoveTask === false && props.isDuplicate === false) {
            getSearchTaskData();
        }},1000));

    const oldStatus = computed(() => {
        if(props.fromWhich == undefined || props.fromWhich == '') {
            return oldStatusData(projectData.value,selectedTaskSubTask.value);
        } else {
            return [];
        }
    })

    const oldTaskType = computed(() => {
        if(props.fromWhich == undefined || props.fromWhich == '') {
            return oldTaskTypeData(projectData.value,selectedTaskSubTask.value);
        } else {
            return [];
        }
    })

    const checkSubTask = () => {
        return new Promise((resolve, reject) => {
            try {
                let queryObj = [
                    {
                        ProjectID:BSON.ObjectID(route.params.id),
                        isParentTask: false,
                        sprintId: BSON.ObjectId(task.value.sprintId)
                    }
                ];
                const query = {
                    type: "find",
                    collection: dbCollections.TASKS,
                    data: queryObj
                };
                mongodbCrudOperations(query).then((result) => {
                    if(result.length === 0){
                        resolve(true);
                    }
                    result.filter((x) => {
                        if(x.ParentTaskId === task.value._id){
                            selectedTaskSubTask.value.push(x);
                            resolve(true);
                        }else{
                            resolve(true);
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

    const checkAllModel = () => {
        return new Promise((resolve, reject) => {
            try {
                selectedTaskSubTask.value = [...selectedTaskSubTask.value, task.value];  
                if(selectedProjectData.value._id !== route.params.id){
                    showSidebar.value = true;
                    statusConfirm.value = true;
                    if(isType.value === true){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }else{
                    showSidebar.value = false;
                    resolve(true);
                    moveTask();
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
            isType.value = true;
            if(selectedProjectData.value._id !== route.params.id){
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
                moveTask();
            }
        } catch (error) {
            reject(false);
        }
    })
}

    const clickSprint = (data) => {
        if(Object.keys(selectedSprintData.value).length > 0 && selectedSprintData.value.id !== data.id){
            selectedSprintData.value.isDuplicateSprint = false;
        }
        selectedSprintData.value = data;
        selectedSprintData.value.isDuplicateSprint = true;
        if(props.isConvertTask === true && isSpinner.value === false) {
            if(selectedProjectData.value._id !== route.params.id){
                checkAllModel();
            }else{
                convertToTask();
            }
        }
        if(props.isMoveTask === true && isSpinner.value === false){
            checkSubTask().then(async(res) => {
                if(res === true){
                    await checkAssignee().then((asgn) => {
                        // "If the user has 'asgn' set to true, it means that the required task assignee sidebar should not be opened, allowing us to check other models."
                        if(asgn === true){
                            checkAllModel();
                        }
                    })
                }
            })
        }
    }

    const moveTask = () => {
        if(selectedProjectData.value._id !== route.params.id){
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
        if(isSpinner.value == true){
            return;
        }
        const user = getUser(userId.value)

        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: user.companyOwnerId,
        }
        isSpinner.value = true;
        taskClass.moveTask({
            companyId: companyId.value,
            projectData: {
                id : selectedProjectData.value._id,
                ProjectCode : selectedProjectData.value.ProjectCode,
                ProjectName : selectedProjectData.value.ProjectName
            },
            sprintObj: selectedSprintData.value,
            moveTaskId : task.value._id,
            oldSprintObj : {
                id : task.value.sprintId,
                folderId : task.value.folderObjId || null,
                name : task.value.sprintArray?.name,
                folderName : task.value.sprintArray?.folderName || ''
            },
            oldProject : {
                id : projectData.value._id,
                taskTypeCounts : projectData.value.taskTypeCounts,
                taskStatusData : projectData.value.taskStatusData,
                ProjectName : projectData.value.ProjectName
            },
            isSubTask : selectedTaskSubTask.value.length > 1 ? true : false,
            assignee : selectedAssigneeId.value,
            watcher : selectedWatcherId.value,
            userData : userData
        }).then((result) => {
            if(result.status === true){
                isSpinner.value = false;
                toggleTaskDetail(task.value);
                let paramsObj = {};
                if(selectedSprintData.value.folderId){
                    paramsObj = {
                        cid: companyId.value,
                        id: selectedProjectData.value._id,
                        sprintId: selectedSprintData.value.id,
                        folderId: selectedSprintData.value.folderId,
                        taskId: task.value._id
                    }
                }else{
                    paramsObj = {
                        cid: companyId.value,
                        id: selectedProjectData.value._id,
                        sprintId: selectedSprintData.value.id,
                        taskId: task.value._id
                    }
                }
                nextTick(() => {
                    router.push({
                        name: selectedSprintData.value.folderId ? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
                        params: paramsObj,
                        query: {...route.query, detailTab: 'task-detail-tab'}
                    })
                })
                $toast.success("Task moved sucessfully",{position: 'top-right'});
                closeSidebar();
            }else{
                isSpinner.value = false;
                $toast.error("Task not moved",{position: 'top-right'});
            }
        }).catch((error) => {
            isSpinner.value = false;
            console.error("error",error);
        })
    }

    const duplicateTask = () => {
        if(selectedProjectData.value._id !== route.params.id){
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
        if(isSpinner.value == true){
            return;
        }
        isSpinner.value = true;
        const user = getUser(userId.value)

        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: user.companyOwnerId,
        }
        taskClass.duplicateTask({
            companyId: companyId.value,
            projectData: {
                id : selectedProjectData.value._id,
                ProjectCode : selectedProjectData.value.ProjectCode,
                ProjectName : selectedProjectData.value.ProjectName
            },
            sprintObj: selectedSprintData.value,
            selectedTaskId : task.value._id,
            oldProject : {
                id : projectData.value._id,
                taskTypeCounts : projectData.value.taskTypeCounts,
                taskStatusData : projectData.value.taskStatusData,
                ProjectName : projectData.value.ProjectName
            },
            userData : userData,
            isSubTask : duplicateSubTask.value.length > 0 ?  true : false,
            duplicateData:selectedDuplicatedItems.value,
            assignee : selectedAssigneeId.value,
            watcher : selectedWatcherId.value,
            taskName:duplicateTaskName.value ? duplicateTaskName.value : '',
            oldSprintObj : {
                folderId : task.value.folderObjId || null,
                name : task.value.sprintArray?.name,
                folderName : task.value.sprintArray?.folderName || ''
            },
        }).then((result) => {
            if(result.status === true){
                isSpinner.value = false;
                toggleTaskDetail(task.value);
                let paramsObj = {};
                if(selectedSprintData.value.folderId){
                    paramsObj = {
                        cid: companyId.value,
                        id: selectedProjectData.value._id,
                        sprintId: selectedSprintData.value.id,
                        folderId: selectedSprintData.value.folderId,
                        taskId: result.taskId
                    }
                }else{
                    paramsObj = {
                        cid: companyId.value,
                        id: selectedProjectData.value._id,
                        sprintId: selectedSprintData.value.id,
                        taskId: result.taskId
                    }
                }
                nextTick(() => {
                    router.push({
                        name: selectedSprintData.value.folderId ? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
                        params: paramsObj,
                        query: {...route.query, detailTab: 'task-detail-tab'}
                    })
                })
                $toast.success("Task duplicate sucessfully",{position: 'top-right'});
                closeSidebar();
            }else{
                isSpinner.value = false;
                $toast.error("Task not moved",{position: 'top-right'});
            }
        }).catch((error) => {
            isSpinner.value = false;
            console.error("error",error);
        })
    }

    function confirmData (){
        if(props.isMoveTask === true && isSpinner.value === false){
            moveTask();
        }
        if(props.isDuplicate === true && isSpinner.value === false){
            duplicateTask();
        }
        if(props.isConvertTask === true && isSpinner.value === false){
            convertToTask();
        }
    }

    function selectedItems (event) {
        selectedDuplicatedItems.value = event;
    }

    function taskFun (data) {
        duplicateTaskName.value = data;
    }

    const getDataFromChild = (ele) => {
        emit('dataToMainComp',ele)
    }

    const convertToTask = () => {
        if(selectedProjectData.value._id !== route.params.id){
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
        if(isSpinner.value == true){
            return;
        }
        isSpinner.value = true;
        taskClass.convertToTask({
            companyId: companyId.value,
            projectData: {
                id:selectedProjectData.value._id
            },
            taskId : task.value._id,
            parentTaskId:task.value.ParentTaskId,
            sprintObj: selectedSprintData.value,
            oldSprintObj :{
                id:task.value.sprintId,
                folderId:task.value.folderObjId || null
            },
            oldProject: {
                id :projectData.value._id,
                taskTypeCounts : projectData.value.taskTypeCounts,
                taskStatusData : projectData.value.taskStatusData
            }
        }).then((result) => {
            if(result.status === true){
                isSpinner.value = false;
                toggleTaskDetail(task.value);
                let paramsObj = {};
                if(selectedSprintData.value.folderId){
                    paramsObj = {
                        cid: companyId.value,
                        id: selectedProjectData.value._id,
                        sprintId: selectedSprintData.value.id,
                        folderId: selectedSprintData.value.folderId,
                        taskId: task.value._id
                    }
                }else{
                    paramsObj = {
                        cid: companyId.value,
                        id: selectedProjectData.value._id,
                        sprintId: selectedSprintData.value.id,
                        taskId: task.value._id
                    }
                }
                nextTick(() => {
                    router.push({
                        name: selectedSprintData.value.folderId ? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
                        params: paramsObj,
                        query: {...route.query, detailTab: 'task-detail-tab'}
                    })
                })
                closeSidebar();
                $toast.success("Convert in to task sucessfully",{position: 'top-right'});
            }else{
                isSpinner.value = false;
                $toast.error("Task not moved",{position: 'top-right'});
            }
        }).catch((error) => {
            isSpinner.value = false;
            console.error("error",error);
        })
    }

    const duplicateTaskButton = () => {
        if(props.isDuplicate === true && isSpinner.value === false) {
            checkSubTask().then((res) => {
                duplicateSubTask.value = selectedTaskSubTask.value;
                if(selectedProjectData.value._id !== route.params.id){
                    if(res === true) {
                        checkAllModel();
                    }
                }else{
                    duplicateTask();
                }
            })
        }else{
            if(isDisable.value === false){
                if(taskData.value.value){
                    emit('createTask',{sprints: selectedSprintData.value,project: selectedProjectData.value,taskName:taskData.value.value})
                }
            }
        }
    }

    function checkAssignee() {
        return new Promise((resolve, reject) => {
            try {
                statusConfirm.value = false;
                taskTypeConfirm.value = false;
                let taskAssignee = task.value.AssigneeUserId || [];
                // if project id is diffrent
                if(selectedProjectData.value._id !== route.params.id){
                    resolve(false)
                    showSidebar.value = true;
                    assigneeSidebar.value = true;
                }else{
                    // if project is same but sprint is private
                    if(selectedSprintData.value.private === true){
                        let sprintsUserIds = taskAssignee.filter(userId => !selectedSprintData.value.AssigneeUserId.includes(userId));
                        if(sprintsUserIds.length > 0){
                            resolve(false)
                            showSidebar.value = true;
                            assigneeSidebar.value = true;
                        }else{
                            resolve(true);
                        }
                    }else{
                        resolve(true);
                    }
                }
            }catch (error) {
                reject(false);
                console.error("error",error);
            }
        })
    }

    function assigneeConfirm (assignee,watcher) {
        assigneeSidebar.value = false;
        selectedAssigneeId.value = assignee;
        selectedWatcherId.value = watcher?.map((x) => x._id) || [];
        checkAllModel();
    }

    function getSprintData(id) {
        return new Promise((resolve, reject) => {
            try {
                if(Object.keys(getters["projectData/sprints"]).includes(id)){
                    sprintData.value = getters["projectData/sprints"][id];
                    resolve(sprintData.value,true);
                    return;
                }
                let projectId = id;
                dispatch("projectData/setSprints",{projectId}).then((sprintss) => {
                    sprintData.value = sprintss;
                    resolve(sprintss);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

function getFolderData(id) {
    return new Promise((resolve, reject) => {
        try {
            if(Object.keys(getters["projectData/folders"]).includes(id)){
                folderData.value = getters["projectData/folders"][id];
                resolve(folderData.value,true);
                return;
            }
            let projectId = id;
            dispatch("projectData/setFolders",{projectId}).then((folders) => {
                resolve(folders);
                folderData.value = folders;
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getSprintFolderData = async (id) => {
    try {
        return new Promise((resolve,reject) => {
            Promise.allSettled([getSprintData(id), getFolderData(id)])
            .then((results) => {
                const resolvedPromises = results.filter((result) => result.status === 'fulfilled');
                if (resolvedPromises.length === 2) {
                    const [sprintsResult, foldersResult] = resolvedPromises.map((result) => result.value);
                    const sprintsArray = sprintsResult?.filter(sprint => sprint.projectId === id && !sprint.folderId).map((x) => ({ ...x, id:x._id }));
    
                    const foldersObject = foldersResult?.reduce((acc, folder) => {
                        if (folder.projectId === id) {
                            let folId = folder._id
                            acc[folId] = {
                                folderId: folId,
                                name: folder.name,
                                sprintsObj: {},
                                deletedStatusKey: folder.deletedStatusKey,
                                id: folder._id,
                                _id: folder._id,
                            };
                        }
                        return acc;
                    }, {});
    
                    sprintsResult.filter((x) => x.deletedStatusKey === undefined || x.deletedStatusKey === 0)?.forEach(sprint => {
                        if (sprint.projectId === id && sprint.folderId && foldersObject[sprint.folderId]) {
                            sprint.folderName = foldersObject[sprint.folderId].name;
                            sprint.id = sprint._id;
                            foldersObject[sprint.folderId].sprintsObj[sprint.id] = sprint;
                        }
                    });
                    sprintFoldersValue.value = {
                        [id]: {
                            folders: foldersObject,
                            sprints: sprintsArray,
                        }
                    };
                    let allSprints = sprintFoldersValue.value !== undefined && sprintFoldersValue.value && sprintFoldersValue.value[selectedProjectData.value._id] ? sprintFoldersValue.value[selectedProjectData.value._id]?.sprints : []
                    allSprints = [...allSprints];
    
                    let allFolders = sprintFoldersValue.value && sprintFoldersValue.value[selectedProjectData.value._id] ? sprintFoldersValue.value[selectedProjectData.value._id]?.folders : {}
                    allFolders = {...(selectedProjectData.value?.sprintsfolders && Object.keys(selectedProjectData.value?.sprintsfolders).length ? selectedProjectData.value?.sprintsfolders || {} : {}), ...allFolders}
    
                    const sprintIdToObject = {};
                    allSprints.forEach(item => {sprintIdToObject[item.id] = item;});
                    selectedProjectData.value.sprintsObj = sprintIdToObject;
                    selectedProjectData.value.sprintsfolders = allFolders;
                    resolve();
                } else {
                    console.error("One or more promises were rejected");
                }
            })
            .catch((error) => {
                reject(error);
                console.error("Error in Promise.allSettled", error);
            });
        })
    } catch (error) {
        console.error("ERROR", error);
    }
}
</script>
<style scoped src="./style.css"></style>