<template>
    <div class="sprint position-re" :id="`sprint_${sprint?.id}`">
        <!-- FOLDER NAME LEGEND -->
        <div
            v-if="sprint && sprint.folderName"
            class="cursor-default black position-ab bg-white border border-radius-5-px text-capitalize color52 p0x-10px sprint__foldername"
        >
            {{sprint.folderName}}
        </div>

        <div class="sprint_name TaskName d-flex justify-content-between align-items-center flex-wrap"  :class="{'mb-20px': sprint.isExpanded , 'flex-column align-items-start' : clientWidth<=512}" >
            <div @click="sprint.deletedStatusKey === 0 || sprint.deletedStatusKey === undefined ? $emit('change',sprint?.id) : ''" class="d-flex align-items-center">
                <img v-if="sprint.deletedStatusKey === 0 || sprint.deletedStatusKey === undefined" :src="triangleBlack" alt="traingle" :style="`transform: rotateZ(${sprint.isExpanded ? 90 : 0}deg); width: 6px;`" class="cursor-pointer">
                <img v-if="sprint.deletedStatusKey === 2" :src="inventory_2" class="pr-10px" />
                <img v-if="sprint.isFolder === true" :src="folder">
                <span class="text-ellipse font-weight-bold text-capitalize ml-10px cursor-pointer font-size-14 color52">{{ sprint.name }}</span>
                <template v-if="$route?.query?.tab !== 'Calendar'">
                    <button
                        v-if="sprint.isExpanded && !searchedTask && checkPermission('task.task_create',project.isGlobalPermission) === true && checkPermission('task.task_list',project.isGlobalPermission) == true && showArchiveVar === false"
                        class="outline-secondary-bg-gray ml-10px"
                        id="createtask_driver"
                        @click.stop="createTask = !createTask,hanldeTaskTour
                        (sprint.isExpanded ? '' : $emit('change',sprint?.id))"
                    >
                        + New Task
                    </button>
                </template>
                <div class="d-flex align-items-center ml-10px cursor-pointer" :class="[{'pointer-event-none' : isSpinner}]" v-if="checkApps('AI',project) && 
                    checkPermission('task.task_list',project?.isGlobalPermission) === true && 
                    checkPermission('task.task_create',project?.isGlobalPermission) === true">
                    <img :src="aiIcon" class="mr-3px" />
                    <span @click.stop="suggestTask()" class="ai-color font-size-14 font-weight-500 ai-border-bottom" :class="[{'pointer-event-none' : isSpinner}]">Suggest Tasks</span>
                </div>
            </div>

            <div v-if="!project?.deletedStatusKey && showArchiveVar && sprint?.deletedStatusKey === 2 && checkPermission('project.project_list',project.isGlobalPermission) === true">
                <DropDown>
                    <template #button>
                        <img :ref="sprint.id+'archievDelete'" :src="horizontalDots" alt="horizontalDots" class="vertical-middle">
                    </template>
                    <template #options>
                        <DropDownOption v-if="!sprint.isFolder" @click="$refs[sprint.id+'archievDelete'].click(), showSidebar = true, close = true">
                            Close
                        </DropDownOption>
                        <DropDownOption @click="$refs[sprint.id+'archievDelete'].click(), updateItem(0)">
                            Restore
                        </DropDownOption>
                        <DropDownOption @click="$refs[sprint.id+'archievDelete'].click(), showSidebar = true, archive = false">
                            Delete
                        </DropDownOption>
                    </template>
                </DropDown>
            </div>
            <div v-if="!showArchiveVar" class="d-flex align-items-center sharewith__status-toggle" :style="[{paddingTop : clientWidth <=512 ? '15px' : '' }]">
                <div class="position-re mr-10px">
                    <DropDown>
                        <template #button>
                            <a href="#" class="d-flex align-items-center justify-content-center border border-radius-5-px eye__icon-wrapper">
                                <img :src="eyeIcon">
                            </a>
                            <span class="sprint-watcher-count">{{ sprint?.watchers?.length || 0 }}</span>
                        </template>
                        <template #head>
                            <div :class="{'border-bottom' : clientWidth > 767}" :style="`padding: ${clientWidth <= 767 ? 0 : 10}px;`">
                                <InputText
                                    v-model="searchWatcher"
                                    place-holder="search"
                                    type="text"
                                    height="30px !important"
                                    :isOutline="false"
                                />
                            </div>
                        </template>
                        <template #options>
                            <DropDownOption
                                v-for="user in filteredWatchers"
                                :key="user._id"
                                :item="user"
                                :class="{ 'selected-watcher': user.isWatcher == true }"
                            >
                                    <div class="d-flex align-items-center justify-content-between w-100">
                                        <div class="d-flex align-items-center" @click="updateWatchers(user._id, 'add')">
                                            <img class="cursor-pointer emp__profile-imgurl"
                                                v-if="!getUser(user._id).Employee_profileImageURL"
                                                :src="user.Employee_profileImage"
                                                alt="userImg"
                                               
                                            >
                                            <WasabiIamgeCompp v-else :userImage="true" :thumbnail="'26x26'" :data="{title:getUser(user._id).Employee_Name, url: getUser(user._id).Employee_profileImageURL}" class="cursor-pointer emp__profile-imgurl"/>
                                            <span 
                                                class="cursor-pointer ml-5px"
                                            >
                                                {{ user.Employee_Name }}
                                            </span>
                                        </div>
                                        <img
                                            class="cursor-pointer"
                                            src="@/assets/images/svg/deletered.svg"
                                            v-if="user.isWatcher && user.isLoggedUser"
                                            @click="updateWatchers(user._id, 'remove')"
                                        />
                                    </div>
                            </DropDownOption>
                        </template>
                    </DropDown>
                </div>
                <div  class="d-flex align-items-center">
                    <span class="dark-gray font-weight-500" :class="clientWidth <=767 ? 'font-size-11' : 'font-size-12'">Share with :</span>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="cursor-default share__everyone-private font-size-12 gray81 text-capitalize" :class="clientWidth <=767 ? 'mr-5px ml-5px' : 'ml-10px mr-10px'">Everyone</span>
                        <Toggle :modelValue="sprint?.private" inActiveColor="#8591F9" width="20" @click="togglePrivatePublic(!sprint?.private)"/>
                        <span class="cursor-default share__everyone-private font-size-12 gray81 text-capitalize" :class="clientWidth <=767 ? 'ml-5px' : 'ml-10px'">Private</span>

                        <Assignee
                            :style="[{marginLeft : clientWidth > 767 ? '35px' : '10px'}]"
                            class="share__with-assignee"
                            v-if="sprint?.private"
                            :users="sprint?.AssigneeUserId || []"
                            :options="project?.isPrivateSpace ? (project?.AssigneeUserId || []) : (companyUsers || [])"
                            :num-of-users="2"
                            imageWidth="20px"
                            @selected="changeAssignee('add', $event.id)"
                            @removed="changeAssignee('remove', $event.id)"
                            :isDisplayTeam="true"
                        />
                    </div>
                </div>
            </div>
        </div>

        <Transition>
            <div v-if="sprint.isExpanded">
                <CreateTask
                    v-if="createTask && checkPermission('task.task_create',project.isGlobalPermission) === true && checkPermission('task.task_list',project.isGlobalPermission) == true"
                    :sprint="sprint"
                    :assigneeOptions="project.AssigneeUserId"
                    :startDate="modalStartDate"
                    :endDate="modalEndDate"
                    @cancel="createTask = false"
                    @submit="taskSubmit"
                    :addDefaultAssignee="project?._id === '6571e7195470e64b1203295c'"
                />
                <div v-if="taskListAi && taskListAi.length">
                    <div class="ai-generated-task-div">
                        <div v-for="(sub,index) in taskListAi" :key="index" class="border-bottom px-1 subtask__item-input d-flex align-items-center">
                            <img :src="aiIcon" class="mr-3px" />
                            <label class="d-flex align-items-center font-weight-400 font-size-13">
                                {{sub.title}}
                            </label>
                            <input type="checkbox" v-model="sub.isSelected" @click="handleChecked(sub)" class="ml-auto" />
                        </div>
                    </div>
                    <div class="d-flex justify-content-end p15x-0px">
                        <button v-if="taskListAi.length" class="outline-primary mr-10-px font-size-16 font-weight-400" @click="taskListAi = []">Cancel</button>
                        <button v-if="taskListAi.filter((x) => x.isSelected===true).length" class="btn-primary mr-10-px font-size-16 font-weight-400" @click="createTaskWithAi()">{{`Create ${taskListAi.filter((x) => x.isSelected===true).length} Task`}}</button>
                    </div>
                </div>
                <div v-if="isSpinner">
                    <Skelaton v-for="i in 5" :key="i" class="border-radius-5-px skelaton__option m-5px border-bottom"/>
                </div>
                <span v-if="isError" class="red">Something went wrong</span>
                <div class="itemSprintWrapper style-scroll-6-px" id="tasklist_driver">
                    <template v-if="$route?.query?.tab !== 'Calendar'">
                        <ItemList
                            v-for="(item,index) in sprint.items"
                            :statusIndex="index"
                            :key="item.key"
                            :item="item"
                            :sprintId="sprint?.id"
                            :projectId="project._id"
                            :groupType="groupType"
                            :commonDateFormatForDate="commonDateFormatForDate"
                            @toggle="item.isExpanded = !item.isExpanded"
                            :project="project"
                            :sprintObject="sprint"
                        />
                    </template>
                    <template v-else>
                        <CalendarViewComponent
                            :projectData="project"
                            :sprint="sprint"
                            :newTaskData="newTaskData"
                            :calendarDate="initialDate"
                            @openTaskModel="openTaskModel"
                        />
                    </template>
                </div>
            </div>
        </Transition>

        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${close ? 'Close' : archive ? 'Archive' : 'Delete'}`"
            :message="close ? 'Type sprint name to confirm that you really do wish to close this sprint' : archive ? 'A List can be archived to hide it from view but be restored at any time. All tasks are kept and remain searchable when you archive a List.' : `This Project's tasks and templates will all be erased. Type project name to confirm that you really do wish to delete all tasks, templates, and this project.`"
            :confirmationString="`${close ? 'close' : archive ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive && !close ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${close ? 'Close' : archive ? 'Archive' : 'Delete'}`"
            @confirm="updateItem()"
            :showSpinner="showSpinner"
            @selected="changeAssignee('add', $event.id)"
            @removed="changeAssignee('remove', $event.id)"
        />
        <SpinnerComp :is-spinner="isCreateSpinner" />
    </div>
</template>

<script setup>
// PACKAGES
import { computed, defineComponent, defineEmits, defineProps, inject, onMounted, ref, watch } from 'vue';
import { useCustomComposable, useGetterFunctions } from '@/composable';
import { useToast } from 'vue-toast-notification';

// COMPONENTS
import WasabiIamgeCompp from '@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue';
import ItemList from '../ItemList/ItemList.vue';
import InputText from '@/components/atom/InputText/InputText.vue';
import CreateTask from "@/components/atom/CreateTask/CreateTask.vue"
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import Toggle from "@/components/atom/Toggle/Toggle.vue"
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import CalendarViewComponent from '@/views/Projects/ProjectCalendarView/CalendarViewComponent.vue';
import Skelaton from "@/components/atom/Skelaton/AiSkelaton.vue"
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp'
import * as env from '@/config/env';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { apiRequest } from '../../../services'
import { useAiApiFunction } from "@/composable/aiHelper";
import taskClass from "@/utils/TaskOperations"

// UTILS
const project = inject("selectedProject");
const searchedTask = inject("searchedTask");
const clientWidth = inject("$clientWidth");
const { checkPermission, debouncerWithPromise, checkApps} = useCustomComposable();
const showArchiveVar = inject("showArchived");
const companyId = inject("$companyId");
const userId = inject("$userId");
const modalStartDate = ref(null);
const modalEndDate = ref(null);
const initialDate = ref(0);
const $toast = useToast();
const {getters, commit} = useStore();
const route = useRoute()
const {getUser} = useGetterFunctions()
const hanldeTaskTour = inject('hanldeTaskTour');
const {generateAiRequestForFunction} = useAiApiFunction();

// IMAGES
const triangleBlack = require('@/assets/images/svg/triangleBlack.svg');
const folder = require('@/assets/images/folder.png');
const eyeIcon = require('@/assets/images/svg/PriorityIcon/watchProjectEye.svg');
const inventory_2 = require('@/assets/images/inventory_2.png');
const horizontalDots = require("@/assets/images/svg/horizontalDots.svg");
const aiIcon = require("@/assets/images/svg/ai_image.svg");

defineComponent({
    name: "SprintsList",

    components: {
        ItemList,
        CreateTask,
        DropDown,
        DropDownOption,
        Toggle,
        Assignee,
        ConfirmationSidebar
    }
})

defineEmits(['change']);

const props = defineProps({
    sprint: Object,
    groupType: Number,
    commonDateFormatForDate: String,
    calendarDate: Number
})

watch(route, () => {
    if (createTask.value) {
        createTask.value = false;
        modalStartDate.value = null;
        modalEndDate.value = null;
    }
})
const companyUsers = computed(() => {
    return getters["settings/companyUsers"]?.map((x) => x.userId)
})

const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
})

const companyOwnerId = computed(() => getters["settings/companyOwnerDetail"]?.userId)

const createTask = ref(false);
const assigneeInProgress = ref(false);
const showSpinner = ref(false);
const archive = ref(false);
const close = ref(false);
const showSidebar = ref(false);
const newTaskData = ref({});
const searchWatcher = ref("");
const watcherUsers = ref([]);
const timer = ref(null);
const taskListAi = ref([]);
const isSpinner = ref(false);
const isCreateSpinner = ref(false);
const isError = ref(false);
watch(props.sprint, (val) => {
    if(val.isExpanded === false && createTask.value === true) {
        createTask.value = false;
    }
})
watch([() => props.calendarDate], (data) => {
    if (data && data.length) {
        const selectedDate = data[0];
        if (selectedDate) {
            initialDate.value = new Date(selectedDate).getTime()
        } else {
            initialDate.value = new Date().getTime()
        }
    } else {
        initialDate.value = new Date().getTime()
    }
})
const openTaskModel = (data) => {
    createTask.value = true;
    modalStartDate.value = data.modalStartDate;
    modalEndDate.value = data.modalEndDate;
}
const taskSubmit = (taskData) => {
    const data = taskData.data;
    newTaskData.value = data;
}
function getUserData() {
    const user = getUser(userId.value);
    const userData = {
        id: user._id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId,
    }

    return userData;
}

function updateItem(value = null) {
    showSpinner.value = true;

    let obj = {};
    let updatedValue = '';
    if(props.sprint.isFolder) {
        obj.$set = {deletedStatusKey: value !== null ? value : archive.value ? 2 : 1}
        updatedValue = value !== null ? value : archive.value ? 2 : 1
    } else {
        obj.$set = {deletedStatusKey: value !== null ? value : close.value ? 5 : archive.value ? 2 : 1};
        updatedValue = value !== null ? value : close.value ? 5 : archive.value ? 2 : 1
    }

    const userData = getUserData();

    const axiosData = {
        type: !props.sprint.isFolder ? "updateSprint" : "updateFolder",
        companyId: companyId.value,
        projectId: project.value._id,
        folderId: props.sprint.isFolder ? props.sprint.folderId : props.sprint.id,
        updateObject: {
            ...obj
        },
        updatedValueDeleteStatusKey: updatedValue,
        userData,
        sprintName: !props.sprint.isFolder ? props.sprint.name : null,
        projectData: {
            id: project.value._id,
            ProjectName: project.value.ProjectName
        },
        folderName: props.sprint.isFolder ? props.sprint?.name : "",
    }

    if (props.sprint.isFolder) {
        axiosData.sprints = Object.values(props.sprint.archivedSprintList).filter((x) => !x.deletedStatusKey || x.deletedStatusKey === 6)?.map((x) => x.id)
    }
    let reqUrl = env.SPRINT+"/"+props.sprint.id;
    if (props.sprint.isFolder) {
        reqUrl = env.FOLDER+"/"+props.sprint.id;
    }
    apiRequest("patch", reqUrl, axiosData)
    .then(() => {
        $toast.success(`${props.sprint.isFolder ? 'Folder' : 'Sprint'} ${value !== null ? 'restored' : close.value ? 'closed' : archive.value ? 'archived' : 'deleted'} successfully`, {position: "top-right"})
        showSidebar.value = false;
        showSpinner.value = false;
        close.value = false;
    })
    .catch((error) => {
        close.value = false;
        showSidebar.value = false;
        showSpinner.value = false;
        $toast.error(`Something went wrong.`, {position: "top-right"});
        console.error("ERROR in updateItem: ", error);
    })
}

// CHANGE ASSIGNEE OF PRIVATE SPRINTS
function togglePrivatePublic(value = true) {
    if(assigneeInProgress.value) return;
    assigneeInProgress.value = true;

    let updateData = {};
    if(value) {
        updateData.$addToSet = {
            'AssigneeUserId': userId.value,
        }
        updateData.$set = {
            'private': value,
        }
    } else {
        updateData.$set = {
            'AssigneeUserId': [],
            'private': value,
        }
    }
    let obj = {
        type : value === true ? 'private' : 'public',
    }

    updateSprintAPICALL(updateData,obj);
}
// CHANGE ASSIGNEE OF PRIVATE SPRINTS
function changeAssignee(type, uid) {
    if(assigneeInProgress.value) return;
    assigneeInProgress.value = true;

    let updateData = {};
    if(type === "add") {
        if(!props.sprint?.AssigneeUserId?.includes(uid)) {
            updateData.$addToSet = {
                'AssigneeUserId': uid,
                'watchers': uid
            }
        }
    } else {
        if(props.sprint?.AssigneeUserId?.includes(uid)) {
            updateData.$pull = {
                AssigneeUserId: uid,
                watchers: uid
            }

            if(props.sprint?.AssigneeUserId?.length === 1) {
                updateData.$set = {
                    private: false
                }
            }
        }
    }
    let obj = {
        type : type === 'add' ? 'added' : 'removed',
        userName : getUser(uid)?.Employee_Name
    }

    updateSprintAPICALL(updateData,obj)
}
// CALL SPRINT UPDATE
function updateSprintAPICALL(updateData = null,historyObj) {
    if(updateData) {
        try {
            const userData = getUserData();
            apiRequest("patch", `${env.SPRINT}/${props.sprint?.id ? props.sprint?.id : props.sprint?._id}`, {
                companyId: companyId.value,
                projectId: project.value._id,
                folderId: props.sprint?.folderId || null,
                type: "updateSprint",
                updateObject: updateData,
                userData,
                sprintName: !props.sprint.isFolder ? props.sprint.name : null,
                projectData: {
                    id: project.value._id,
                    ProjectName: project.value.ProjectName
                },
                folderName: props.sprint.isFolder ? props.sprint?.folderName : "",
                historyData : historyObj
            })
            .then((resp) => {
                if(resp.data.status) {
                    // let historyObj = {
                    //     message: `<b>${userData.Employee_Name}</b> has ${type} <b>${props.sprint.name}</b> sprint ${props.sprint?.folderId === null ? '' : `in <b>${props.sprint.isFolder ? props.sprint?.folderName : ""}</b> folder`} in <b>${project.value.ProjectName}</b> project.`,
                    //     key: "project_sprint_removed",
                    //     sprintId: props.sprint.id,
                    // }
                    // apiRequest("post", env.HANDLE_HISTORY, {
                    //     "type": 'project',
                    //     "companyId": companyId.value,
                    //     "projectId": props.projectData._id,
                    //     "taskId": null,
                    //     "object": historyObj,
                    //     "userData": userData
                    // })
                    $toast.success(`Sprint updated successfully`, {position: "top-right"})
                }
                assigneeInProgress.value = false;
            })
            .catch((error) => {
                console.error('ERROR in update Sprint: ', error);
                $toast.error(`Something went wrong`, {position: "top-right"})
                assigneeInProgress.value = false;
            })
        } catch (error) {
            $toast.error(`Something went wrong`, {position: "top-right"})
            console.error('ERROR in update Sprint: ', error);
            assigneeInProgress.value = false;
        }
    } else {
        assigneeInProgress.value = false;
    }
}

// WATCHERS
onMounted(() => {
    handleWatcherList();
})
function handleWatcherList() {
    watcherUsers.value = [];
    let allUsers = JSON.parse(JSON.stringify(project.value?.isPrivateSpace ? !props.sprint?.private ? (project.value?.AssigneeUserId || []) : (props.sprint?.AssigneeUserId || []) : companyUsers.value));

    if(!allUsers.includes(companyOwnerId.value)) {
        allUsers.push(companyOwnerId.value);
    }

    if(props.sprint?.watchers?.length) {
        props.sprint.watchers.forEach(element => {
            if (!getUser(element).ghostUser) {
                watcherUsers.value.push({
                    ...getUser(element),
                    isWatcher: true,
                    isLoggedUser: element === userId.value
                });
            }
        });
    } else {
        if (!getUser(userId.value).ghostUser) {     
            watcherUsers.value = [{
                ...getUser(userId.value),
                isWatcher: false,
                isLoggedUser: true
            }];
        }
    }

    allUsers.forEach((uid) => {
        if(!watcherUsers.value.filter((x) => x.id === uid).length) {
            if (!getUser(uid).ghostUser) {  
                watcherUsers.value.push({
                    ...getUser(uid),
                    isWatcher: false,
                    isLoggedUser: true
                });
            }
        }
    })
}
watch(() => props.sprint?.watchers, () => {
    handleWatcherList();
})

const filteredWatchers = computed(() => {
    if(searchWatcher.value) {
        return watcherUsers.value.filter(user => user.Employee_Name.toLowerCase().includes(searchWatcher.value.toLowerCase()));
    } else {
        return watcherUsers.value;
    }
});

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
function updateWatchers(uid, type) {
    debouncer().then(()=>{
        if(uid !== userId.value ||(type == 'add' && props.sprint?.watchers?.includes(uid)) || (type == 'remove' && !props.sprint?.watchers?.includes(uid))) return;
        let updateObj = {};
        if(type == 'add') {
            updateObj.$addToSet = {
                watchers: uid
            }
        } else if(type == 'remove') {
            updateObj.$pull = {
                watchers: uid
            }
        }
        updateSprintAPICALL(updateObj);
    })
}

function suggestTask () {
    if(!isSpinner.value){
        taskListAi.value = [];
        isSpinner.value = true;
        debouncerWithPromise(1000).then(() => {
            isError.value = false;
            let data = {
                userId: userId.value,
                uniqueUserId: userId.value,
                companyId: companyId.value
            }
            generateAiRequestForFunction(data,project.value.ProjectName,project.value.rawDescription,'Create Task',true,'single',project.value?.isGlobalPermission).then((result) => {
                if(result.status === true){
                    try {
                        isSpinner.value = false;
                        taskListAi.value = JSON.parse(JSON.stringify(result.statusText.data.statusText));
                        taskListAi.value = taskListAi.value.replace(/\n|\r/g, '').trim();
                        taskListAi.value = eval(taskListAi.value);
                        if(isArrayOfObjects(taskListAi.value) == true){
                            taskListAi.value = eval(taskListAi.value).map((x) => ({...x,isSelected: true}));
                        }else{
                            isSpinner.value = false;
                            isError.value = true;
                            taskListAi.value = [];
                        }
                    } catch (error) {
                        isSpinner.value = false;
                        isError.value = true;
                        console.error(error,"ERROR IN GENERAE PROMPTS:");
                    }
                }else{
                    if(result.isReachedLimit){
                        $toast.error("You have reached your limit.",{position: 'top-right'});
                    }else if(result.isNotAi){
                        $toast.error(result.statusText,{position: 'top-right'});
                    }
                    isSpinner.value = false;
                }
            }).catch((error) => {
                isSpinner.value = false;
                isError.value = true;
                console.error(error,"ERROR IN GENERAE PROMPTS:");
            })
        })
    }
}


function createTaskWithAi () {
    let array = taskListAi.value.filter((data) => data.isSelected);
    if(array.length > 0){
        isCreateSpinner.value = true;
        taskListAi.value = [];
        let sprintObj = {
            id: props.sprint._id,
            name: props.sprint.name,
        }
        if(props.sprint.folderId){
            sprintObj.folderId = props.sprint.folderId;
            sprintObj.folderName = props.sprint.folderName;
        }

        const projectData = {
            _id: project.value._id,
            CompanyId: companyId.value,
            lastTaskId: project.value.lastTaskId,
            ProjectName: project.value.ProjectName,
            ProjectCode: project.value.ProjectCode
        }
        const user = getUser(userId.value)
        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: companyOwner.value.userId,
        }
        taskClass.createSubTaskWithAi({
            companyId:companyId.value,
            userId: userId.value,
            subTitles: array,
            sprintObj: sprintObj,
            projectData: projectData,
            userData:userData,
            parentTask: {ProjectID: project.value._id},
            type: 'task'
        })
        .then((res) => {
            if(res.status === true){
                let taskArray = res.data;
                const showAllTasks = true;
                const pid = project.value._id;
                const sprintId = props.sprint._id;
                let snap = props.sprint._id;

                taskArray.forEach((x)=>{
                    commit("projectData/mutateUpdateFirebaseTasks",{
                        snap, 
                        op: "added",
                        pid,
                        sprintId,
                        data: x,
                        showAllTasks,
                        updatedFields: x,
                    });
                })
                isCreateSpinner.value = false;
                $toast.success(`Task created successfully`, {position: "top-right"});
            }
        })
        .catch((error) => {
            isCreateSpinner.value = false;
            console.error("ERROR in create task: ", error);
        })
    }else{
        $toast.error(`Please select task.`, {position:"top-right"});
    }

}

function handleChecked (item) {
    item.isChecked = !item.isChecked;
}

function isArrayOfObjects(arr) {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.every(item => item !== null && typeof item === 'object');
}

</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.sprint__foldername{
    top: -10px;
    left: 10px;
}
.eye__icon-wrapper{
    height: 30px; 
    width: 30px;
}
.emp__profile-imgurl{
    width: 30px; 
    height: 30px;
    border-radius: 30px;
    border: 2px solid #fff;
}
.ai-generated-task-div{
    border: 1px solid #DFE1E6;
}

</style>
<style scoped src="./style.css"></style>