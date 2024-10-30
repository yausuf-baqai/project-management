<template>
    <div class="task-detail-right-side">
        <div class="pb-2px">
            <h4 class="details-heading">Details</h4>
            <div class="d-flex task-detail-right-side-label" v-if="checkPermission('task.task_list',project?.isGlobalPermission)!==null && checkPermission('task.task_status',project?.isGlobalPermission) !== null">
                <h4>Status</h4>
                <TaskStatus
                    :task-key="task.statusKey"
                    :sprintId="task.sprintId"
                    :taskId="task._id"
                    :projectId="task.ProjectID"
                    @update:status="(oldVal,newVal)=>{updateStatus(oldVal,newVal)}"
                    class="d-flex taskdetail-label task-detail-right-wrapper"
                    :taskStatusIndex="props.taskStatusIndex"
                />
            </div>
            <div class="d-flex task-detail-right-side-label" v-if="checkPermission('task.task_assignee',project?.isGlobalPermission) !== null">
                <h4>Assignee</h4>
                <Assignee
                    v-if="checkPermission('task.task_assignee',project?.isGlobalPermission) === true && checkPermission('task.task_list',project?.isGlobalPermission) == true"
                    class="taskdetail-label task-detail-right-wrapper ml-5px"
                    :numOfUsers="2"
                    :users="task.AssigneeUserId"
                    :addUser="checkPermission('task.task_assignee',project?.isGlobalPermission) === true"
                    :options="permittedOptions"
                    @selected="updateAssignee($event, checkApps('MultipleAssignees',project) ? 'add' : 'replace')"
                    @removed="updateAssignee($event, 'remove')"
                    imageWidth="30px"
                    :showAddUser="true"
                    :zIndexAssigne="props.zIndexAssigne"
                    :isDisplayTeam="true"
                    :multiSelect="checkApps('MultipleAssignees')"
                />
                <Assignee
                    v-else
                    class="taskdetail-label task-detail-right-wrapper ml-5px"
                    :numOfUsers="2"
                    :showAddUser="true"
                    @selected="updateAssignee($event, checkApps('MultipleAssignees',project) ? 'add' : 'replace')"
                    @removed="updateAssignee($event, 'remove')"
                    :users="task.AssigneeUserId"
                    :options="nonPermittedOptions"
                    imageWidth="30px"
                    :zIndexAssigne="props.zIndexAssigne"
                    :isDisplayTeam="true"
                    :multiSelect="checkApps('MultipleAssignees')"
                />
            </div>
            <div class="d-flex task-detail-right-side-label">
                <h4>Reporter</h4>
                <div class="d-flex align-items-center task-detail-right-wrapper">
                    <UserProfile
                        :data="{
                            image: taskLeaderData.Employee_profileImageURL, 
                            title: taskLeaderData.Employee_Name
                        }"
                        :showDot="false"
                        width="30px"
                        :thumbnail="'30x30'"
                    />
                </div>
            </div>
            <div class="d-flex task-detail-right-side-label" v-if="checkPermission('task.task_priority',project?.isGlobalPermission) !== null && checkApps('Priority')">
                <h4>Priority</h4>
                <PriorityComp
                    :priorityVal="task.Task_Priority"
                    :showName="true"
                    @select="updatePriority($event)"
                    class="priority-comp taskdetail-label task-detail-right-wrapper ml-0"
                    :zIndexPriority="props.zIndexPriority"
                    :permission="checkPermission('task.task_priority',project?.isGlobalPermission) === true"
                />
            </div>
            <div class="d-flex task-detail-right-side-label" v-if="isSupport === false">
                <h4>Start Date</h4>
                <DueDateCompo
                    id="due-date-task"
                    class="taskdetail-label task-detail-right-wrapper"
                    :displyDate="task?.startDate? task.startDate : ''"
                    :isShowDateAndicon="true"
                    @SelectedDate="($event) => updateStartDate($event)"
                    :position="`right`"
                    :autoposition="false"
                    v-if="checkPermission('task.task_list',project?.isGlobalPermission) == true"
                />
                <template v-else>
                    <span v-if="task.startDate">{{convertDateFormat(task.startDate,'',{showDayName:false})}}</span>
                    <span v-else>No Start Date</span>
                </template>
            </div>
            <div class="d-flex task-detail-right-side-label" v-if="checkPermission('task.task_due_date',project?.isGlobalPermission) !== null">
                <h4>Due Date</h4>
                <DueDateCompo
                    id="due-date-task"
                    class="taskdetail-label task-detail-right-wrapper"
                    :displyDate="task.DueDate? task.DueDate : ''"
                    :isShowDateAndicon="true"
                    :disabledDates="task.dueDateDeadLine"
                    @SelectedDate="($event) => updateDueDate($event)"
                    :position="`right`"
                    :autoposition="false"
                    v-if="checkPermission('task.task_due_date',project?.isGlobalPermission) === true && checkPermission('task.task_list',project?.isGlobalPermission) == true"
                />
                <template v-else>
                    <span v-if="task.DueDate">{{convertDateFormat(task.DueDate,'',{showDayName:false})}}</span>
                    <span v-else>No Due Date</span>
                </template>
            </div>
            <div class="d-flex task-detail-right-side-label" v-if="checkApps('TimeEstimates') && checkPermission('task.task_estimated_hours',project?.isGlobalPermission) !== null">
                <h4>Estimated</h4>
                <EstimateHours
                    v-if="Object.keys(task || {}).length"
                    :permission="checkPermission('task.task_estimated_hours',project?.isGlobalPermission)"
                    :task="task"
                    class="d-flex taskdetail-label"
                    @update:dueDate="($event) => updateDueDate($event)"
                    @update:startDate="($event) => updateStartDate($event)"
                    :zIndexEstimate="props.zIndexEstimate"
                />
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, defineProps, inject, ref, watch } from 'vue';
import { useStore } from 'vuex';

import EstimateHours from '@/components/molecules/EstimateHours/EstimateHours.vue';
import TaskStatus from '@/components/molecules/TaskStatus/TaskStatus.vue';
import Assignee from '@/components/molecules/Assignee/Assignee.vue';
import UserProfile from '@/components/atom/UserProfile/UserProfile.vue';
import PriorityComp from '@/components/molecules/PriorityCompo/PriorityComp.vue';
import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';

import { useConvertDate, useCustomComposable, useGetterFunctions, useMoment } from '@/composable'
import taskClass from "@/utils/TaskOperations";
import { taskDueDateAdd, taskDueDateChange } from '@/utils/NotificationTemplate';
import { useToast } from 'vue-toast-notification';

const {convertDateFormat} = useConvertDate();
const { getUser, getPriority } = useGetterFunctions();
const { checkPermission, checkApps, getWasabiImageLink } = useCustomComposable();
const { changeDateFormate } = useMoment();
const { getters } = useStore();

//inject
const userId = inject('$userId');
const dateFormat = inject('$dateFormat');
const project = inject('selectedProject');

const $toast = useToast();
const props = defineProps({
    task: {
        type: Object,
        required: true
    },
    parentTask: {
        type: Object,
        required: false
    },
    taskStatusIndex: {
        type: Number,
        default: 7
    },
    zIndexAssigne: {
        type: Number,
        default: 7
    },
    zIndexPriority: {
        type: Number,
        default: 7
    },
    zIndexEstimate: {
        type: Number,
        default: 7
    },
    isSupport: {
        type: Boolean,
        default: false
    }
})

//ref
const taskLeaderData = ref(getUser(props.task?.Task_Leader));
const assigneeInProgress = ref({});
watch(() => props.task,(val) => {
    taskLeaderData.value = getUser(val?.Task_Leader);
});

const companyOwner = computed(() => {return getters["settings/companyOwnerDetail"]});
const companyUsers = computed(() => getters["settings/companyUsers"]?.map((x) => x.userId));

const sprintData = computed(() => {
    let sprintData = false;
    if (project.value && props.task && Object.keys(props.task).length > 0) {
        sprintData = props.task.folderObjId ? project.value?.sprintsfolders?.[props.task?.folderObjId]?.sprintsObj?.[props.task?.sprintId] : project.value?.sprintsObj?.[props.task?.sprintId]
    }
    return sprintData || null;
});

const permittedOptions = computed(() => {
    let users = [];
    if(sprintData.value) {
        if(props.task.isParentTask) {
            if(sprintData.value?.private) {
                users = sprintData.value?.AssigneeUserId || [];
            } else {
                if(project.value?.isPrivateSpace) {
                    users = project.value?.AssigneeUserId || [];
                } else {
                    users = companyUsers.value;
                }
            }
        } else {
            if(sprintData.value?.private) {
                users = (props.parentTask?.AssigneeUserId || []).filter((x) => sprintData.value?.AssigneeUserId?.includes(x))
            } else {
                users = (props.parentTask?.AssigneeUserId || [])
            }
        }
    }
    if(project.value?.isPrivateSpace) {
        users = users.filter((x) => project.value?.AssigneeUserId.includes(x));
        return Array.from(new Set([...users, ...(props.task?.AssigneeUserId || [])]));
    } else {
        return users;
    }
})
const nonPermittedOptions = computed(() => {
    let users = [];
    if(sprintData.value) {
        if(props.task.isParentTask) {
            if(sprintData.value?.private) {
                users = (sprintData.value?.AssigneeUserId || []).filter((x) => x === userId.value);
            } else {
                if(project.value?.isPrivateSpace) {
                    users = (project.value?.AssigneeUserId || []).filter((x) => x === userId.value);
                } else {
                    users = [userId.value];
                }
            }
        } else {
            users = (props.parentTask?.AssigneeUserId || [])?.filter((x) => x === userId.value)
            if(sprintData.value?.private) {
                users = users.filter((x) => sprintData.value?.AssigneeUserId?.includes(x))
            }
        }
    }
    if(project.value?.isPrivateSpace) {
        users = users.filter((x) => project.value?.AssigneeUserId.includes(x));
        return users;
    } else {
        return users;
    }
})

function getUserData() {
    const user = getUser(userId.value);
    return {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: companyOwner.value.userId,
    };
}

const updateAssignee = (event, type) =>{
    try {
        if(assigneeInProgress.value[event?.id] && assigneeInProgress.value[event?.id] === type) return;
        assigneeInProgress.value[event?.id] = type;
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
            AssigneeUserId : event.id
        }

        const projectData = {
            _id: project.value._id,
            CompanyId: project.value.CompanyId,
            lastTaskId: project.value.lastTaskId,
            ProjectName: project.value.ProjectName,
            ProjectCode: project.value.ProjectCode
        }

        taskClass.updateAssignee({
            firebaseObj: updateObject,
            projectData: projectData,
            taskData: props.task,
            employeeName: getUser(event.id).Employee_Name,
            type: operation,
            userData
        })
        .then(() => {
            delete assigneeInProgress.value[event?.id];
            $toast.success(`Assignee ${type === "add" || type === "replace"? 'added' : 'removed'} successfully`,{position: 'top-right'});
        })
        .catch((error) => {
            delete assigneeInProgress.value[event?.id];
            console.error("ERROR in updateAssignee: ", error);
            $toast.error('Assignee not updated',{position: 'top-right'});
        })
    } catch (error) {
        console.error(error);
        $toast.error('Assignee not updated',{position: 'top-right'});
    }
}

const updatePriority = async(val) => {
    try {
        const userData = getUserData();

        let updateObj = {
            Task_Priority : val.value
        }

        let projectData = {
            '_id': project.value._id ? project.value._id : "",
            'ProjectName' : project.value.ProjectName,
            "CompanyId": project.value.CompanyId,
        }


        const priority = getPriority(props.task.Task_Priority)

        let priorityObj = {
            'statusImage' : await getWasabiImageLink(project.value.CompanyId,priority.image),
            'priorityName' : priority.name,
            'taskId': props.task._id,
            'taskName': props.task.TaskName,
            'userName' : userData.Employee_Name,
            'newStatusImage' : await getWasabiImageLink(project.value.CompanyId,val.statusImage),
            'newPriorityName' : val.name
        }

        taskClass.updatePriority({firebaseObj: updateObj, projectData: projectData, taskData: props.task, priorityObj, userData})
        .then(() => {
            $toast.success('Priority updated successfully',{position: 'top-right'});
        })
        .catch((error) => {
            console.error("ERROR in update priority: ", error);
            $toast.error('Priority not updated',{position: 'top-right'});
        })
    } catch (error) {
        console.error('updatePriority error', error);
        $toast.error('Priority not updated',{position: 'top-right'});
    }
}

const updateStatus = (oldVal, newval) => {
    try {
        const userData = getUserData();
        const prev = {
            backColor: oldVal.bgColor ,
            color: oldVal.textColor,
            statusName: oldVal.name,
        }
        const updatedStatus = {
            'text': newval.name,
            'key': newval.key,
            'type': newval.type,
            'value': newval.value,
        }
        const newStatus = {
            status: updatedStatus,
            'statusType': newval.type,
            'statusKey': newval.key
        }
        let prevStatus = {
            ...prev,
            'taskName': props.task.TaskName,
            'bgColor': newval.bgColor,
            'textColor': newval.textColor,
            'taskId': props.task._id,
            'updatedTaskName': newval.name,
        }
        const projectData = {
            _id: project.value._id,
            CompanyId: project.value.CompanyId,
            lastTaskId: project.value.lastTaskId,
            ProjectName: project.value.ProjectName,
            ProjectCode: project.value.ProjectCode
        }
        taskClass.updateStatus({ newStatus, prevStatus, projectData: projectData, task: props.task, userData})
        .then(() => {
            $toast.success('Status updated successfully',{position: 'top-right'});
        })
        .catch(() => {
            $toast.error('Status not updated',{position: 'top-right'});
        })
    } catch (error) {
        console.error('updateStatus error', error);
        $toast.error('Status not updated',{position: 'top-right'});
    }
}

const updateDueDate = (event) => {
    try {
        const userData = getUserData();
        let newdueDateDeadLine = [];
        if(props.task.dueDateDeadLine.length > 0) {
            props.task.dueDateDeadLine.forEach((date) => {
                newdueDateDeadLine.push({ date: new Date(date.date) })
            })
            newdueDateDeadLine.push({ date: new Date(event.dateVal)});
        } else {
            newdueDateDeadLine.push({ date: new Date(event.dateVal)});
        }
        const updateobj = {
            DueDate: event.dateVal,
            dueDateDeadLine: newdueDateDeadLine,
        }
        let notificationObj = {
            key: "task_due_date",
            projectId: props.task.ProjectID,
            taskId: props.task._id,
            sprintId: props.task.sprintId
        }
        let obj = {
            'ProjectName' : project.value.ProjectName,
            'TaskName' : props.task.TaskName,
        }
        if(props.task.dueDateDeadLine.length > 0 ) {
            obj.previousDate = changeDateFormate(new Date(props.task.dueDateDeadLine[props.task.dueDateDeadLine.length - 1].date))
            obj.changedDate = changeDateFormate(event.dateVal)
            notificationObj.message = taskDueDateChange(obj);
        } else  {
            obj.lastDate = changeDateFormate(event.dateVal)
            notificationObj.message = taskDueDateAdd(obj);
        }
        const projectData = {
            _id: project.value._id,
            CompanyId: project.value.CompanyId,
            lastTaskId: project.value.lastTaskId,
            ProjectName: project.value.ProjectName,
            ProjectCode: project.value.ProjectCode
        }

        taskClass.updateDueDate({
            commonDateFormatString: dateFormat.value,
            firebaseObj: updateobj,
            project: projectData,
            task: props.task,
            obj: notificationObj,
            userData
        }).then(() => {
            $toast.success('Due date updated successfully',{position: 'top-right'});
        }).catch((error) => {
            console.error("ERROR in updateDueDate: ", error);
            $toast.error('Due date not updated',{position: 'top-right'});
        })
    } catch (error) {
        console.error("ERROR in updateDueDate: ", error);
        $toast.error('Due date not updated',{position: 'top-right'});
    }
}

const updateStartDate = (event) => {
    try {
        const userData = getUserData();

        const updateobj = {
            startDate: event.dateVal,
        }
        let notificationObj = {
            key: "task_due_date",
            projectId: props.task.ProjectID,
            taskId: props.task._id,
            sprintId: props.task.sprintId
        }
        let obj = {
            'ProjectName' : project.value.ProjectName,
            'TaskName' : props.task.TaskName,
        }
        if(props.task?.startDate) {
            obj.previousDate = changeDateFormate(new Date(props.task?.startDate.seconds * 1000))
            obj.changedDate = changeDateFormate(event.dateVal)
            notificationObj.message = taskDueDateChange(obj);
        } else  {
            obj.lastDate = changeDateFormate(event.dateVal)
            notificationObj.message = taskDueDateAdd(obj);
        }
        const projectData = {
            _id: project.value._id,
            CompanyId: project.value.CompanyId,
            lastTaskId: project.value.lastTaskId,
            ProjectName: project.value.ProjectName,
            ProjectCode: project.value.ProjectCode
        }

        taskClass.updateStartDate({
            commonDateFormatString: dateFormat.value,
            firebaseObj: updateobj,
            project: projectData,
            task: props.task,
            obj: notificationObj,
            userData
        }).then(() => {
            $toast.success('Start date updated successfully',{position: 'top-right'});
        }).catch((error) => {
            console.error("ERROR in updateStartDate: ", error);
            $toast.error('Start date not updated',{position: 'top-right'});
        })
    } catch (error) {
        console.error("ERROR in updateStartDate: ", error);
        $toast.error('Start date not updated',{position: 'top-right'});
    }
}
</script>
<style scoped src='./style.css'>
</style>