<template>
    <div>
        <div @click.stop.prevent="!showArchiveVar ? toggleTaskDetail(element) : ''">
            <div class="pl-10px pr-10px pb-5px">
                <span v-if="element.sprintArray.folderName && !isSubTask" class="list-group-kanban-item__sprintName">
                    <img src="@/assets/images/svg/blue_folder.svg" class="mr-5px">{{element.sprintArray.folderName}}
                </span>
                <span v-if="element.sprintArray.folderName && !isSubTask" class="list-group-kanban-item__sprintName ml-5px mr-5px">/</span>
                <span class="list-group-kanban-item__sprintName" v-if="!isSubTask">{{element.sprintArray.name}}</span>
                <div class="d-flex justify-content-between">
                    <div class="list-group-kanban-item__taskName text-ellipsis font-weight-500 font-size-14">
                        <img v-if="element.deletedStatusKey === 2" :src="inventoryIcon" alt="inventory"  class="ml-5px"/>
                        <img v-if="element.deletedStatusKey === 1" :src="deleteIcon" alt="delete" class="ml-5px" />
                        <img v-if="!showArchiveVar" :src="favourite ? filledStar : blankStar" @click.stop.prevent="markAsFavourite(element)" alt="favourite star" class="cursor-pointer">
                        <img v-else :src="favourite ? filledStar : blankStar" alt="favourite star">
                        <!-- <img :src="favourite ? filledStar : blankStar" @click.stop="markAsFavourite(element)" alt="favourite star" class="cursor-pointer"> -->
                        {{ element.TaskName }}
                        <!-- <span v-if="groupValue === 0">{{element.groupByStatusIndex}}</span>
                        <span v-if="groupValue === 1">{{element.groupByAssigneeIndex}}</span>
                        <span v-if="groupValue === 2">{{element.groupByPriorityIndex}}</span>
                        <span v-if="groupValue === 3">{{element.groupByDueDateIndex}}</span> -->

                    </div>
                    <div :style="{'margin-top' : isSubTask ? '5px' : ''}" class="count-block cursor-pointer mr-12px" v-if="showCount(element)">
                        <span @click.stop.prevent="changeRoute()">{{showCount(element)}}</span>
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-5px">
                    <div>
                        <!-- <img :src="taskType.taskImage" alt="task_type" :title="taskType.name" class="vertical-middle task__type-image"> -->
                        <img v-if="taskType?.taskImage !== undefined ? taskType.taskImage.includes('http') : ''" v-bind:src="taskType?.taskImage !== undefined ? taskType.taskImage : ''" alt="task_type"  class="border-radius-2-px mt-2px ml-8px task__selected-type">
                            <WasabiImage 
                                v-else
                                class="border-radius-2-px mt-2px ml-8px task__selected-type"
                                :data="{url: taskType?.taskImage !== undefined ? taskType.taskImage : ''}"
                            />
                        <span class="font-size-13 ml-9px element__task-key">
                            {{element.TaskKey}}
                        </span>
                    </div>
                    <div v-if="groupValue !== 0 || isSubTask" class="font-size-13">
                        <TaskStatus
                            :id="element.id+'status'"
                            :modelValue="taskStatus"
                            :options="projectStatus"
                            :showLabel="true"
                            :disabled="showArchiveVar && checkPermission('task.task_list',projectData?.isGlobalPermission)!==true || checkPermission('task.task_status',projectData?.isGlobalPermission) !== true || showArchiveVar !== false"
                            @select="changeStatus($event)"
                        />
                    </div>
                </div>
                <div class="d-flex mt-10px" v-if="!showArchiveVar && tagChipArray.length && checkApps('tags')">
                    <!-- Tags -->
                    <div v-for="(item, index) in tagChipArray" :key="index" @click.stop.prevent="">
                        <div v-if="(index < chipCount)" class="tagList">
                            <TagChip  :data="item" :isBorder="false"  :ids="ids" :tagsArray="projectData.tagsArray"/>
                        </div>
                        <div v-if="index == chipCount" class="tagcount"> +{{tagChipArray.length - chipCount}} </div>         
                    </div>
                    <div>
                        <CreateTagPopup :task="element" @send:tagChipArray="(val)=>tagChipArray = val" @send:ids="(val)=>ids = val" :project="projectData" :chipCount="chipCount" :isTaskList="false" />
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-5px">
                    <div class="d-flex align-items-center">
                        <span v-if="checkPermission('task.task_due_date',projectData?.isGlobalPermission) !== null && element?.DueDate && (groupValue !== 3 || isSubTask)">
                            <DueDateCompo
                                id="due-date-task"
                                class="d-flex align-items-center"
                                :displyDate="dueDate? new Date(dueDate) : ''"
                                :disabledDates="element.dueDateDeadLine"
                                @SelectedDate="($event) => updateDueDate($event)"
                                v-if="!showArchiveVar && checkPermission('task.task_due_date',projectData?.isGlobalPermission) === true && checkPermission('task.task_list',projectData?.isGlobalPermission) == true && showArchiveVar === false"
                            />
                            <template v-else>
                                <span>{{convertDateFormat(element.DueDate,'',{showDayName:false})}}</span>
                            </template>
                        </span>
                        <!-- Priority -->
                        <span class="subtaskShape mr-5px priority__compo" v-if="groupValue !== 2 || isSubTask">
                            <div v-if="checkPermission('task.task_priority',projectData?.isGlobalPermission) !== null && checkApps('Priority')" class="mb-2px">
                                <Priority
                                    :priorityVal="element.Task_Priority"
                                    @select="updatePriority"
                                    :permission="!showArchiveVar && checkPermission('task.task_priority',projectData?.isGlobalPermission) === true"
                                />
                            </div>
                        </span>
                        <!-- SubTask -->
                        <span v-if="!isSubTask" @click.stop.prevent="getSubTask" class="task-options-image board_substasks" :class="{'bluesubTaskShape' :element.isExpanded && element?.subtaskArray?.length > 0 , 'cursor-pointer': element?.subTasks > 0}">
                            <img v-if="element.isExpanded && element?.subtaskArray?.length > 0" src="@/assets/images/png/subtaskShapeBlue.png"/>
                            <img v-else src="@/assets/images/png/subTaskShape.png"/>
                            <span class="font-size-11" :style="{'color': (element.isExpanded && element?.subtaskArray?.length > 0) ? '#2F3990' : ''}">
                                {{(showArchiveVar || searchedTask) ? (element?.subtaskArray?.length > 0 ? (element?.subtaskArray?.length > 99 ? '99+': element?.subtaskArray?.length) : '') : element?.subTasks > 0 ? (element?.subTasks > 99 ? '99+' : element?.subTasks) : ''}}
                            </span>
                        </span>
                    </div>
                    <div class="boardassignee__component-wrapper">
                        <!-- Assignee -->
                        <span v-if="checkPermission('task.task_assignee',projectData?.isGlobalPermission) !== null && (groupValue !== 1 || isSubTask)">
                            <Assignee
                                v-if="checkPermission('task.task_assignee',projectData?.isGlobalPermission) === true && checkPermission('task.task_list',projectData?.isGlobalPermission) == true"
                                :users="element.AssigneeUserId"
                                :options="permittedOptions"
                                :num-of-users="2"
                                imageWidth="22px"
                                :addUser="!showArchiveVar"
                                @selected="changeAssignee(checkApps('MultipleAssignees',projectData) ? 'add' : 'replace', $event)"
                                @removed="changeAssignee('remove', $event)"
                                :isDisplayTeam="true"
                                :multiSelect="checkApps('MultipleAssignees')"
                            />
                            <Assignee
                                v-else
                                :users="element.AssigneeUserId"
                                :options="nonPermittedOptions"
                                :num-of-users="2"
                                imageWidth="22px"
                                :addUser="!showArchiveVar"
                                @selected="changeAssignee(checkApps('MultipleAssignees',projectData) ? 'add' : 'replace', $event)"
                                @removed="changeAssignee('remove', $event)"
                                :isDisplayTeam="true"
                                :multiSelect="checkApps('MultipleAssignees')"
                            />
                        </span>
                    </div>
                </div>
            </div>
            <BoardViewTaskCreate
                v-if="isSubtaskCreate && !showArchiveVar"
                :sprintData="element.sprintArray"
                :data="itemData"
                :taskId="element._id"
                :assigneeOptionsData="element.AssigneeUserId"
                @toggle="isSubtaskCreate = false"
                :isSubTask="true"
            />
            <Transition>
                <div class="list-group-kanban-item__hover">
                    <div class="d-flex align-items-center">
                        <span v-if="!isSubTask && !showArchiveVar" @click.stop.prevent="isSubtaskCreate = true" class="cursor-pointer">
                            <img src="@/assets/images/svg/plusIconWithBorder.svg" class="vertical-middle"/>
                        </span>
                        <span v-if="checkPermission('task.task_due_date',projectData?.isGlobalPermission) !== null && !element?.DueDate" class="ml-5px">
                            <DueDateCompo
                                id="due-date-task"
                                class="d-flex align-items-center"
                                :displyDate="dueDate? dueDate.seconds : ''"
                                :disabledDates="element.dueDateDeadLine"
                                @SelectedDate="($event) => updateDueDate($event)"
                                v-if="!showArchiveVar && checkPermission('task.task_due_date',projectData?.isGlobalPermission) === true && checkPermission('task.task_list',projectData?.isGlobalPermission) == true && showArchiveVar === false"
                            />
                            <template v-else>
                                <span v-if="element.DueDate">{{convertDateFormat(task.DueDate,'',{showDayName:false})}}</span>
                                <span v-else>No Due Date</span>
                            </template>
                        </span>
                        <span v-if="!showArchiveVar && tagChipArray.length === 0" class="ml-5px">
                            <CreateTagPopup :task="element" @send:tagChipArray="(val)=>tagChipArray = val" @send:ids="(val)=>ids = val" :project="projectData" :chipCount="chipCount" :isTaskList="false" />
                        </span>
                    </div>
                    <div>
                    <div id="modelListComponent">
                            <DropDown :title="element.TaskName" v-if="showArchiveVar ? element.deletedStatusKey === 2 : element.deletedStatusKey === 0">
                                <template #button>
                                    <img :ref="element.id+'options'" :src="horizontalDots" alt="horizontalDots">
                                </template>
                                <template #options>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),copyTaskLink()">
                                        <div class="d-flex align-items-center">
                                            <img :src="linkIcon" alt="inventoryIcon" class="mr-10px">
                                            Copy Task Link
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),copyTaskKey()">
                                        <div class="d-flex align-items-center">
                                            <img :src="splitScreen" alt="inventoryIcon" class="mr-10px">
                                            Copy Task Key
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="element.deletedStatusKey === undefined || element.deletedStatusKey === 0" @click="$refs[element.id+`options`].click(), showSidebar = true, archive = true">
                                        <div class="d-flex align-items-center">
                                            <img :src="inventoryIcon" alt="inventoryIcon" class="mr-10px">
                                            Archive
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="element.deletedStatusKey === 2" @click="$refs[element.id+`options`].click(), updateTask(0)">
                                        <div class="d-flex align-items-center">
                                            <img :src="inventoryIcon" alt="restoreInventoryIcon" class="mr-10px">
                                            Restore
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(), showSidebar = true, archive = false">
                                        <div class="d-flex align-items-center">
                                            <img :src="deleteIcon" alt="deleteIcon" class="mr-10px">
                                            Delete
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),convertToSubTask()">
                                        <div class="d-flex align-items-center">
                                            <img :src="subTaskIcon" alt="deleteIcon" class="mr-10px">
                                            Convert to Subtask
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),convertToList()">
                                        <div>
                                            <img :src="combinedIcon" />
                                            <span class="dropdown-label">Convert to List</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),duplicateTask()">
                                        <div>
                                            <img :src="copyIcon" class="copyIcon"/>
                                            <span class="dropdown-label">Duplicate</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),moveTask()">
                                        <div>
                                            <img :src="moveIcon" />
                                            <span class="dropdown-label">Move</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[element.id+`options`].click(),mergeTask()">
                                        <div>
                                            <img :src="mergeIcon" />
                                            <span class="dropdown-label">Merge</span>
                                        </div>
                                    </DropDownOption>
                                </template>
                            </DropDown>
                    </div>
                    </div>
                </div>
            </Transition>
            <ConfirmationSidebar
                v-model="showSidebar"
                :title="`${archive ? 'Archive' : 'Delete'} Task`"
                :message="archive ? 'A List can be archived to hide it from view but be restored at any time. All tasks are kept and remain searchable when you archive a List.' : `This Project's tasks and templates will all be erased. Type project name to confirm that you really do wish to delete all tasks, templates, and this project.`"
                :confirmationString="`${archive ? 'archive' : 'delete'}`"
                :acceptButtonClass="archive ? 'btn-primary': 'btn-danger'"
                :acceptButton="`${archive ? 'Archive' : 'Delete'}`"
                @confirm="updateTask(), showSidebar = false"
            />
            <ConvertToSubTaskSidebar v-if="openConvertSubTaskSidebar === true" :closeSideBar="openConvertSubTaskSidebar"  @isConvertSubtaskOPen="(val) => {sidebarOPen(val)}" :isMoveTask="openMoveSidebar" :openMoveSubTask="openMoveSubTask" :isMergeTask="openMergeTask" :isDuplicate="duplicateTaskSidebar" :task="element"/>
            <ConvertToList v-if="converrtToListSidebar === true" :openSidebar="converrtToListSidebar" @closeSidebar="(val) => {converrtToListSidebar = val}" :task="element" />
        </div> 
    </div>
</template>
<script setup>
    import {ref,inject,computed,watch,onMounted} from "vue";
    import { useStore } from "vuex";
    import { useToast } from "vue-toast-notification";
    import { useRoute,useRouter } from "vue-router"

    import { useUpdateTasks } from "@/views/Projects/helper"
    import TagChip from '@/components/atom/TagChip/TagChip.vue'
    import Priority from "@/components/molecules/PriorityCompo/PriorityComp.vue"
    import taskClass from "@/utils/TaskOperations";
    import { Timestamp } from "firebase/firestore"
    import BoardViewTaskCreate from "@/views/Projects/Kanban/BoardViewTaskCreate.vue"
    import Assignee from "@/components/molecules/Assignee/Assignee.vue"
    import TaskStatus from "@/components/atom/TaskStatus/TaskStatus.vue"
    import {useConvertDate,useCustomComposable,useGetterFunctions } from "@/composable";
    import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
    import CreateTagPopup from "@/components/molecules/TagList/CreateTagPopup.vue";
    import DropDown from '@/components/molecules/DropDown/DropDown.vue'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
    import ConvertToSubTaskSidebar from '@/components/molecules/ConvertToSubTaskSidebar/ConvertToSubTaskSidebar.vue';
    import ConvertToList from '@/components/molecules/ConvertToList/ConvertToList.vue';
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    const props = defineProps({
        data: Object,
        groupValue: Number,
        itemData: Object,
        isSubTask: Boolean,
        parentAssignee: Array
    })

    const {checkPermission,checkApps} = useCustomComposable();
    const {convertDateFormat} = useConvertDate();
    const showArchiveVar = inject("showArchived");
    const userId = inject('$userId')
    const toggleTaskDetail = inject('toggleTaskDetail')
    const companyId = inject("$companyId");
    const {getters} = useStore();
    const isSubtaskCreate = ref(false);
    const {getUser} = useGetterFunctions();
    const projectData = inject("selectedProject");
    const $toast = useToast()
    const tagChipArray = ref([])
    const element = ref(props.data)
    const {updateTaskByGroup} = useUpdateTasks();
    const chipCount = ref(4)
    const showSidebar = ref(false);
    const archive = ref(false);
    const filledStar = require("@/assets/images/svg/start10.svg");
    const blankStar = require("@/assets/images/svg/blankStar.svg");
    const horizontalDots = require("@/assets/images/svg/horizontalDots.svg");
    const linkIcon = require("@/assets/images/png/link.png");
    const splitScreen = require("@/assets/images/png/splitscreen.png");
    const inventoryIcon = require("@/assets/images/inventory_2.png");
    const deleteIcon = require("@/assets/images/DeleteIcon.png");
    const moveIcon = require("@/assets/images/png/moveIcon.png");
    const mergeIcon = require("@/assets/images/png/mergeIcon.png");
    const combinedIcon = require("@/assets/images/png/Combined_shape.png");
    const subTaskIcon = require("@/assets/images/png/subTaskIcon.png");
    const copyIcon = require("@/assets/images/copy.png");
    const route = useRoute()
    const searchedTask = inject('searchedTask');
    const openConvertSubTaskSidebar = ref(false);
    const converrtToListSidebar = ref(false);
    const openMoveSubTask = ref(false);
    const openMoveSidebar = ref(false);
    const taskCollapsed = inject("taskCollapsed");
    const openMergeTask = ref(false);
    const duplicateTaskSidebar = ref(false);
    const router = useRouter()
    const statusSearch = ref("");

    const companyUsers = computed(() => getters["settings/companyUsers"]?.map((x) => x.userId))
    const dueDate = computed(() => element.value.DueDate)
    const favourite = computed(() => {
        return element.value.favouriteTasks && element.value.favouriteTasks.length && element.value.favouriteTasks.filter((x) => userId.value && x.userId === userId.value).length;
    })
    const projectStatus = computed(() => {
        return projectData.value.taskStatusData.filter((x) => x.name.toLowerCase().includes(statusSearch.value.toLowerCase()))
    })
    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    })
    const sprintData = computed(() => {
        let sprintData = false;
        if (projectData.value && element.value) {
            sprintData = element.value.folderObjId ? projectData.value?.sprintsfolders?.[element.value.folderObjId]?.sprintsObj?.[element.value.sprintId] : projectData.value?.sprintsObj?.[element.value.sprintId]
        }
        return sprintData || null;
    })
    const permittedOptions = computed(() => {
        let users = [];
        if(sprintData.value) {
            if(element.value.isParentTask) {
                if(sprintData.value?.private) {
                    users = sprintData.value?.AssigneeUserId || [];
                } else {
                    if(projectData.value?.isPrivateSpace) {
                        users = projectData.value?.AssigneeUserId || [];
                    } else {
                        users = companyUsers.value;
                    }
                }
            } else {
                if(sprintData.value?.private) {
                    users = (props.parentAssignee || []).filter((x) => sprintData.value?.AssigneeUserId?.includes(x))
                } else {
                    users = (props.parentAssignee || [])
                }
            }
        }
        if(projectData.value?.isPrivateSpace) {
            users = users.filter((x) => projectData.value?.AssigneeUserId.includes(x));
            return Array.from(new Set([...users, ...(props.data?.AssigneeUserId || [])]));
        } else {
            return users;
        }
    })
    const nonPermittedOptions = computed(() => {
        let users = [];
        if(sprintData.value) {
            if(element.value.isParentTask) {
                if(sprintData.value?.private) {
                    users = (sprintData.value?.AssigneeUserId || []).filter((x) => x === userId.value);
                } else {
                    if(projectData.value?.isPrivateSpace) {
                        users = (projectData.value?.AssigneeUserId || []).filter((x) => x === userId.value);
                    } else {
                        users = [userId.value];
                    }
                }
            } else {
                users = (props.parentAssignee || [])?.filter((x) => x === userId.value)
                if(sprintData.value?.private) {
                    users = users.filter((x) => sprintData.value?.AssigneeUserId?.includes(x))
                }
            }
        }
        if(projectData.value?.isPrivateSpace) {
            users = users.filter((x) => projectData.value?.AssigneeUserId.includes(x));
            return users;
        } else {
            return users;
        }
    })
    const taskStatus = computed(() => {
        return projectData.value.taskStatusData.find((x) => x.key === element.value.statusKey)
    });
    const taskType = computed(() => {
        return projectData.value.taskTypeCounts.find((x) => x.key === element.value.TaskTypeKey)
    })

    const emit = defineEmits(["subtaskOpen"]);

    watch(() => props.data, (newVal, oldVal) => {
        if(JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            element.value = newVal;
        }
    })

    onMounted(()=> {
        if (!taskCollapsed.value) {
            emit("subtaskOpen")
        }
    })
    const showCount = () => {
        return projectData.value?.taskComments?.[`${element.value.sprintId}_${element.value._id}`]?.[userId.value] || 0;
    }
    function markAsFavourite(data) {
        taskClass.markAsFavourite({
            companyId: projectData.value.CompanyId,
            projectId: projectData.value._id,
            sprintId: data.sprintId,
            taskData: data,
            userId: userId.value,
        })
        .then(() => {
            $toast.success(`Mark as favorite successfully`, {position: "top-right"})
        })
        .catch((error) => {
            console.error("ERROR in markAsFavourite: ", error);
        })
    }
    function updatePriority(val = null) {
        if(!val) return;
        updateTaskByGroup(props.data, val, 2);
    }
    function getUserData() {
        const user = getUser(userId.value);
        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: companyOwner.value.userId,
        }
        return userData;
    }
    function changeAssignee(type, value) {
        if(!value?.id) return;
        const userData = getUserData();
        let operation = ""

        if(type === "add") {
            operation = "assigneeAdd"
        } else if(type === 'remove') {
            operation = "assigneRemove"
        } else if(type === 'replace') {
            operation = "replace"
        }

        let updateObject = {
            AssigneeUserId : value.id
        }

        const project = {
            _id: projectData.value._id,
            CompanyId: projectData.value.CompanyId,
            lastTaskId: projectData.value.lastTaskId,
            ProjectName: projectData.value.ProjectName,
            ProjectCode: projectData.value.ProjectCode
        }

        taskClass.updateAssignee({
            firebaseObj: updateObject,
            projectData: project,
            taskData: props.data,
            employeeName: getUser(value.id).Employee_Name,
            type: operation,
            userData
        })
        .then(() => {
            $toast.success(`Assignee ${type === "add" || type === "replace" ? 'added' : 'removed'} successfully`, {position: "top-right"})
        })
        .catch((error) => {
            console.error("ERROR in changeAssignee: ", error);
        })
    }
    const updateDueDate = (event) => {
        try {
            if(!event?.dateVal) return;
            updateTaskByGroup(props.data, Timestamp.fromDate(new Date(event.dateVal)), 3);
        } catch (error) {
            console.error("ERROR in updateDueDate: ", error);
        }
    }
    const copyTaskLink = () => {
        let path;
        let navigation = window.location.href;
        let modifiedUrl;
        let newnavigation = navigation.replace(/\?tab.*$/, '');

        if (route.name === "Project") {
        if (element.value.folderObjId) {
            modifiedUrl = newnavigation.slice(0, -2);
            path = `${modifiedUrl}/fs/${element.value.folderObjId}/${element.value.sprintId}/${element.value._id}`;
        } else {
            modifiedUrl = newnavigation.slice(0, -2);
            path = `${modifiedUrl}/s/${element.value.sprintId}/${element.value._id}`;
        }
        }
        if (route.name === "ProjectSprint" || route.name === "ProjectFolderSprint") {
            path = `${newnavigation}/${element.value._id}`;
        }
        if (route.name === "ProjectFolder") {
            modifiedUrl = newnavigation.replace(/\/f(.*)/, '');
            path = `${modifiedUrl}/fs/${element.value.folderObjId}/${element.value.sprintId}/${element.value._id}`;
        }
        
        const tabParamIndex = navigation.indexOf('?tab');
        if (tabParamIndex !== -1) {
            const tabParam = navigation.slice(tabParamIndex);
            path += tabParam;
        }

        navigator.clipboard.writeText(path);
        $toast.success("Link is Copied to clipboard", { position: 'top-right' });
    }
    const copyTaskKey = () => {
        navigator.clipboard.writeText(element.value.TaskKey);
        $toast.success("Task Key is Copied to clipboard",{position: 'top-right'});
    }
    function updateTask(value = null) {
        const deletedStatusKey = value !== null ? value : archive.value ? 2 : 1;
        const userData = getUserData();
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
            sprintId: element.value.sprintId,
            folderId : element.value.folderObjId ? element.value.folderObjId : '',
            task: element.value,
            userData,
            deletedStatusKey
        })
        .then((res) => {
            if(res.status) {
                $toast.success(`Task ${value !== null ? 'restored' : archive.value ? 'archived' : 'deleted'} successfully`, { position: "top-right" })
            }
        })
        .catch((err) => {
            console.error(err);
        })
    }
    const convertToSubTask = () => {
        openConvertSubTaskSidebar.value = true;
    }
    const sidebarOPen = (val) => {
        openConvertSubTaskSidebar.value = val;
        openMoveSubTask.value = false;
        openMoveSidebar.value = false;
        duplicateTaskSidebar.value = false;
    }
    const convertToList = () => {
        converrtToListSidebar.value = true;
    }
    const moveTask = () => {
        if(props.data.isParentTask === true){
            openMoveSidebar.value = true;
        }else if(props.data.isParentTask === false){
            openMoveSubTask.value = true;
        }
        openConvertSubTaskSidebar.value = true;
    }
    const mergeTask= () => {
        openConvertSubTaskSidebar.value = true;
        openMergeTask.value = true;
    }
    const duplicateTask = () => {
        openConvertSubTaskSidebar.value = true;
        duplicateTaskSidebar.value = true;
    }
    function changeRoute() {
        const paramsObj = {
            cid: companyId.value,
            id: projectData.value.id,
            sprintId: element.value.sprintId,
            taskId: element.value._id
        }

        if(element.value.folderObjId) {
            paramsObj.folderId = element.value.folderObjId;
        }
        router.push({
            name: element.value.folderObjId? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
            params: paramsObj,
            query: {...route.query, detailTab: "comment"}
        })
    }
    function changeStatus(status) {
        const statusIndex = projectData.value.taskStatusData.findIndex((x) => x.key === element.value.statusKey);
        if(statusIndex === -1) return;
        updateTaskByGroup(element.value, status, 0);
    }
    const getSubTask = () => {
        if (element.value?.subTasks > 0) {
            emit("subtaskOpen");
        }
    }
</script>
<style src="./style.css" scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.list-group-kanban-item__taskName{
    line-height: 21px;
}
.priority__compo{
    min-width:22px;
}
.task__type-image{
    height:14px; 
    width:14px;
}
.element__task-key{
    line-height: 19px;
}
.boardassignee__component-wrapper{
    max-width:73px;
    max-height:22px;
    min-width:22px;
    min-height:22px;
}
</style>