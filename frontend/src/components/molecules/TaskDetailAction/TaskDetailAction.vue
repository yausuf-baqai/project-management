<template>
    <div class="task-detail-action">
        <ul class="task-detail-action-ul">
            <li>
                <img @click="$emit('open', 'filesLinks')" src="@/assets/images/svg/Fileslinks.svg" />
            </li>
            <li>
                <img @click="$emit('open', 'audio')" src="@/assets/images/svg/audio.svg" />
            </li>
            <li class="horizontalDocs">
                <DropDown
                    :maxHeight="clientWidth > 765 ? 'fit-content' : '40dvh'"
                    id="horizontalDocs"
                    :zIndex="10"
                    class="h-100 w-100"
                    :bodyClassHeader="{'h-100 w-100 red': true}"
                >
                    <template #button>
                        <div class="h-100 w-100 d-flex align-items-center">
                            <img :src="horizontalDots" ref="horizontalDocs">
                        </div>
                    </template> 
                    <template #options>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),copyTaskLink()">
                            <div>
                                <img :src="linkIcon" />
                                <span class="dropdown-label">Copy Task Link</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),copyTaskKey()">
                            <div>
                                <img :src="splitScreen" />
                                <span class="dropdown-label">Copy Task Key</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption v-if="(task.queueListArray == undefined || (task.queueListArray && task.queueListArray.indexOf(userId) == -1)) && (task.AssigneeUserId && task.AssigneeUserId.indexOf(userId) !== -1)" @click="$refs['horizontalDocs'].click(),addToQueue('add')">
                            <div>
                                <img :src="cancelIcon" />
                                <span class="dropdown-label">Add to Queue List</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption v-if="(task.queueListArray && task.queueListArray.indexOf(userId) !== -1) && (task.AssigneeUserId && task.AssigneeUserId.indexOf(userId) !== -1)" @click="$refs['horizontalDocs'].click(),addToQueue('remove')">
                            <div>
                                <img :src="cancelIcon" />
                                <span class="dropdown-label">Remove to Queue List</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),convertToList()" v-if="checkPermission('project.project_sprint_create',projectData.isGlobalPermission) === true">
                            <div>
                                <img :src="combinedIcon" />
                                <span class="dropdown-label">Convert to List</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),convertToSubTask()" v-if="checkPermission('task.sub_task_create',projectData.isGlobalPermission) === true">
                            <div>
                                <img :src="subTaskIcon" />
                                <span class="dropdown-label">Convert to Subtask</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),duplicateTask()">
                            <div>
                                <img :src="copyIcon" class="copyIcon"/>
                                <span class="dropdown-label">Duplicate</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),mergeTask()">
                            <div>
                                <img :src="mergeIcon" />
                                <span class="dropdown-label">Merge</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),moveTask()">
                            <div>
                                <img :src="moveIcon" />
                                <span class="dropdown-label">Move</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(),convertToTask()" v-if="task.isParentTask === false && checkPermission('task.task_create',projectData.isGlobalPermission)">
                            <div>
                                <img :src="deleteIcon" />
                                <span class="dropdown-label">Convert to Task</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(), showSidebar = true, archive = true">
                            <div>
                                <img :src="inventoryIcon" />
                                <span class="dropdown-label">Archive</span>
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs['horizontalDocs'].click(), showSidebar = true, archive = false">
                            <div>
                                <img :src="deleteIcon" />
                                <span class="dropdown-label red">Delete</span>
                            </div>
                        </DropDownOption>
                    </template>
                </DropDown>
            </li>
            <li class="watcher-action">
                <DropDown
                    id="watcher"
                    :bodyClass="{'watcher__action-dropdown border-radius-12-px border-0' : true}"
                    :zIndex="10"
                >
                    <template #button>
                        <a href="#">
                            <img src="@/assets/images/svg/PriorityIcon/watchProjectEye.svg">
                        </a>
                        <span class="watcher-count">{{ watchers && watchers.length ? watchers.length : 0 }}</span>
                    </template>
                    <template #head>
                        <div :class="{'border-bottom' : clientWidth > 767}" :style="`padding: ${clientWidth <= 767 ? 0 : 10}px;`">
                            <InputText
                                v-model="search"
                                class="search__text font-size-14"
                                place-holder="Search"
                                type="text"
                                height="30px !important"
                                :isOutline="false"
                            />
                        </div>
                    </template>
                    <template #options>
                        <DropDownOption
                            v-for="user in filteredWatchers"
                            :key="user.id"
                            :item="user"
                            :class="{ 'selected-watcher': user.isWatcher == true }"
                        >
                            <template #default>
                                <img class="cursor-pointer employee__profile-img"
                                    v-if="!user.Employee_profileImageURL"
                                    :src="user.Employee_profileImage"
                                    alt="userImg"
                                    @click="updateWatchers(user.id, 'add')"
                                >
                                <WasabiIamgeCompp v-else :userImage="true" :data="{title: user.Employee_Name, url: user.Employee_profileImageURL}" :thumbnail="'30x30'" class="cursor-pointer wasabi__emp-image"/>
                                <span 
                                    class="cursor-pointer ml-10px" 
                                    @click="updateWatchers(user.id, 'add')"
                                >
                                    {{ user.Employee_Name }}
                                </span>
                                <img
                                    class="cursor-pointer deleted__icon ml-auto"
                                    src="@/assets/images/svg/deletered.svg"
                                    v-if="user.isWatcher && user.isLoggedUser"
                                    @click="updateWatchers(user.id, 'remove')"
                                />
                            </template>
                        </DropDownOption>
                    </template>
                </DropDown>
            </li>
            <li class="close-icon" @click="$emit('close')">
                <img src="@/assets/images/svg/delete.svg" />
            </li>
        </ul>
        <ConvertToSubTaskSidebar v-if="openConvertSubTaskSidebar === true" :closeSideBar="openConvertSubTaskSidebar"  @isConvertSubtaskOPen="(val) => {sidebarOPen(val)}" :isMoveTask="openMoveSidebar" :openMoveSubTask="openMoveSubTask" :isMergeTask="openMergeTask" :isDuplicate="duplicateTaskSidebar" :task="props.task" :isConvertTask="openConvertToTask"/>        
        <ConvertToList v-if="converrtToListSidebar === true" :openSidebar="converrtToListSidebar" @closeSidebar="(val) => {converrtToListSidebar = val}" :task="props.task" />
        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${archive ? 'Archive' : 'Delete'}`"
            :message="archive ? 'A List can be archived to hide it from view but be restored at any time. All tasks are kept and remain searchable when you archive a List.' : `This Project's tasks and templates will all be erased. Type project name to confirm that you really do wish to delete all tasks, templates, and this project.`"
            :confirmationString="`${archive ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${archive ? 'Archive' : 'Delete'}`"
            @confirm="updateTask()"
            :showSpinner="showSpinner"
        />
    </div>
</template>

<script setup>
    import DropDown from '@/components/molecules/DropDown/DropDown'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption'
    import InputText from '@/components/atom/InputText/InputText.vue';
    import ConvertToSubTaskSidebar from '@/components/molecules/ConvertToSubTaskSidebar/ConvertToSubTaskSidebar.vue';
    import ConvertToList from '@/components/molecules/ConvertToList/ConvertToList.vue';
    import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
    import WasabiIamgeCompp from '@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue';

    import { computed, defineProps,defineEmits, ref, inject, watch } from 'vue';
    import taskClass from "@/utils/TaskOperations"
    import { useGetterFunctions, useCustomComposable } from '@/composable';
    const { getUser } = useGetterFunctions();
    const { checkPermission, debounce } = useCustomComposable();

    import { useToast } from 'vue-toast-notification';
    import { useStore } from 'vuex';
    import { useRoute, useRouter } from 'vue-router';
    const router = useRouter();
    const route = useRoute();

    const $toast = useToast();

    const props = defineProps({
        watchers: Array,
        task: {
            type: Object,
        },
        sprints: {
            type: Array,
        },
    });

    const horizontalDots = require("@/assets/images/svg/horizontalDots.svg");
    const linkIcon = require("@/assets/images/png/link.png");
    const splitScreen = require("@/assets/images/png/splitscreen.png");
    const subTaskIcon = require("@/assets/images/png/subTaskIcon.png");
    const cancelIcon = require("@/assets/images/svg/arrow_circle_up.svg");
    const combinedIcon = require("@/assets/images/png/Combined_shape.png");
    const copyIcon = require("@/assets/images/copy.png");
    const mergeIcon = require("@/assets/images/png/mergeIcon.png");
    const moveIcon = require("@/assets/images/png/moveIcon.png");
    // const inventoryIcon = require("@/assets/images/inventory_2.png");
    // const deleteIcon = require("@/assets/images/DeleteIcon.png");
    const inventoryIcon = require("@/assets/images/inventory_2.png");
    const deleteIcon = require("@/assets/images/DeleteIcon.png");

    const emit = defineEmits(['update:watchers', 'open', 'close']);

    const {getters} = useStore();
    const companyUsers = computed(() => getters["settings/companyUsers"]?.map((x) => x.userId))
    const projectData = inject("selectedProject")
    const watchers = ref(props.watchers || []);
    const watcherUsers = ref([]);
    const search = ref('');
    const userId = inject('$userId')
    const companyId = inject('$companyId')
    const clientWidth = inject('$clientWidth');
    const openConvertSubTaskSidebar = ref(false);
    const converrtToListSidebar = ref(false);
    const openMoveSidebar = ref(false);
    const openMoveSubTask = ref(false);
    const openMergeTask = ref(false);
    const duplicateTaskSidebar = ref(false);
    const openConvertToTask = ref(false);

    const showSidebar = ref(false);
    const showSpinner = ref(false);
    const archive = ref(true);

    //watchers user details
    const getWatcherUsers = () => {
        let allUsers = (projectData.value && Object.keys(projectData.value || {}).length && projectData.value.sprintsObj?.[props.task?.sprintId]?.private) ?
                        projectData.value.sprintsObj?.[props.task.sprintId]?.AssigneeUserId :
                        projectData.value.isPrivateSpace ?
                        projectData.value.AssigneeUserId :
                        companyUsers.value;

        watcherUsers.value = [];
        if(watchers.value && watchers.value.length) {
            watchers.value.forEach(element => {
                watcherUsers.value.push({
                    ...getUser(element),
                    isWatcher: true,
                    isLoggedUser: element === userId.value
                });
            });

            if(!watchers.value.includes(userId.value)) {
                watcherUsers.value.push({
                    ...getUser(userId.value),
                    isWatcher: false,
                    isLoggedUser: true
                });
            }

        } else {
            watcherUsers.value = [{
                ...getUser(userId.value),
                isWatcher: false,
                isLoggedUser: true
            }];
        }

        allUsers.forEach((uid) => {
            if(!watcherUsers.value.filter((x) => x.id === uid).length) {
                watcherUsers.value.push({
                    ...getUser(uid),
                    isWatcher: false,
                    isLoggedUser: true
                });
            }
        })
        watcherUsers.value = watcherUsers.value.filter((ele) =>  !ele.ghostUser)
    }
    debounce(() => {
        getWatcherUsers();
    }, 100)

    watch(() => props.watchers, debounce(() => {
        watchers.value = props.watchers;
        getWatcherUsers();
    }), 50)

    const filteredWatchers = computed(() => {
        if(search.value) {
            return watcherUsers.value.filter(user => user.Employee_Name.toLowerCase().includes(search.value.toLowerCase()));
        } else {
            return watcherUsers.value;
        }
    });

    const updateWatchers = (uid, type) => {
        if(uid !== userId.value) return;
        let index = watcherUsers.value.findIndex(user => user.id == uid);
        if(type == 'add') {
            if(watchers.value.includes(uid)) {
                return;
            }
            watchers.value.push(uid);
            if(index != -1) {
                watcherUsers.value[index].isWatcher = true;
            }
        } else if(type == 'remove') {
            if(!watchers.value.includes(uid)) {
                return;
            }
            watchers.value = watchers.value.filter(user => user != uid);
            if(index != -1) {
                watcherUsers.value[index].isWatcher = false;
            }
        }
        emit('update:watchers', uid, type);
    }
    // copy task link
    const copyTaskLink = () => {
        navigator.clipboard.writeText(window.location.href);
        $toast.success("Link is Copied to clipboard",{position: 'top-right'});
    }
    // copy task key
    const copyTaskKey = () => {
        navigator.clipboard.writeText(props.task.TaskKey);
        $toast.success("Task Key is Copied to clipboard",{position: 'top-right'});
    }
    // convert to subtask
    const convertToSubTask = () => {
        openConvertSubTaskSidebar.value = true;
    }
    // move Task
    const moveTask = () => {
        if(props.task.isParentTask === true){
            openMoveSidebar.value = true;
        }else if(props.task.isParentTask === false){
            openMoveSubTask.value = true;
        }
        openConvertSubTaskSidebar.value = true;
    }
    // convert to list
    const convertToList = () => {
        converrtToListSidebar.value = true;
    }
    const mergeTask= () => {
        openConvertSubTaskSidebar.value = true;
        openMergeTask.value = true;
    }

    const sidebarOPen = (val) => {
        openConvertSubTaskSidebar.value = val;
        openMoveSubTask.value = false;
        openMoveSidebar.value = false;
        openMergeTask.value = false;
        duplicateTaskSidebar.value = false;
        openConvertToTask.value = false;
    }

    const duplicateTask = () => {
        openConvertSubTaskSidebar.value = true;
        duplicateTaskSidebar.value = true;
    }

    function updateTask(value = null) {
        showSpinner.value = true;

        const deletedStatusKey = value !== null ? value : archive.value ? 2 : 1;
        let usr = getUser(userId.value);
        const userData = {
            id: usr.id,
            Employee_Name: usr.Employee_Name,
            companyOwnerId: usr.companyOwnerId
        };
        const project = {
            _id: projectData.value._id,
            CompanyId: projectData.value.CompanyId,
            lastTaskId: projectData.value.lastTaskId,
            ProjectName: projectData.value.ProjectName,
            ProjectCode: projectData.value.ProjectCode
        }
        taskClass.updateArchiveDelete({
            companyId: companyId.value,
            projectData: project,
            sprintId: props.task.sprintId,
            task: props.task,
            folderId : props.task.folderObjId ? props.task.folderObjId : '',
            userData,
            deletedStatusKey
        })
        .then((res) => {
            if(res.status) {
                $toast.success(`Task ${value !== null ? 'restored' : archive.value ? 'archived' : 'deleted'} successfully`, { position: "top-right" })
            }
            showSpinner.value = false;
            showSidebar.value = false;

            let params = {...route.params}
            delete params.taskId;
            router.replace({name: route.name.replace("Task", ""), params: {...params}})
        })
        .catch((err) => {
            console.error(err);
        })
    }

    const convertToTask = () => {
        openConvertSubTaskSidebar.value = true;
        openConvertToTask.value = true;
    }
    const addToQueue = (action) => {
        try {
            taskClass.updateQueueList({CompanyId:companyId.value, projectId:projectData.value._id, sprintId:props.task.sprintId, taskId:props.task._id,userId:userId.value,actionType:action})
                .then(() => {
                    $toast.success(`Queue list ${action == 'add' ? 'added' : 'removed'} successfully`,{position: 'top-right'});
                })
                .catch((error) => {
                    console.error("ERROR in update addToQueue: ", error);
                    $toast.error('Queue list not updated',{position: 'top-right'});
                })
        } catch (error) {
            console.error("ERROR in update addToQueue: ", error);
        }
    };
</script>

<style src="./style.css"></style>