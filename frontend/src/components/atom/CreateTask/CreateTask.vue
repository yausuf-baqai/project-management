<template>
    <div class="d-flex justify-content-between border-primary mb-1 border-radius-5-px create__task-div" id="createtaskinput_driver">
        <template v-if="sprint && Object.keys(sprint).length">
            <div class="d-flex align-items-center position-re w-50">
                <TaskType
                    :tourId="'createtaskstatus_driver'"
                    :id="sprint.id+taskId+'create_taskType'"
                    v-model="taskType"
                    :options="taskTypes"
                />
                <InputText
                    v-model="taskName.value"
                    placeholder="Task name"
                    class="border-0 create__task-inputtext"
                    :maxLength="250"
                    :minLength="3"
                    :isOutline="false"
                    @enter="saveTask()"
                    :isDirectFocus="true"
                    @keyup="checkErrors({'field':taskName,
                    'name':taskName.name,
                    'validations':taskName.rules,
                    'type':taskName.type,
                    'event':$event.event})"
                />
                <div v-if="save" class="red position-ab z-index-1 save__error" :style="[{fontSize : clientWidth > 480 ? '11px' : '10px', left : clientWidth > 480 ? '30px' : '0px',width : clientWidth > 480 ? '100%' : '320px'},]">{{taskName.error}}</div>
            </div>
            <div class="d-flex align-items-center">
                <!-- checklist -->

                <!-- <img style="margin-right: 5px;" :src="checklist" class="cursor-pointer" alt="dateImage"/> -->

                <!-- ASSIGNEE -->
                <Assignee
                    :tourId="'createtaskassignee_driver'"
                    :users="assignee"
                    :options="checkPermission('task.task_assignee',project.isGlobalPermission) === true ? assigneeOptions : assigneeOptions.filter((x) => x === userId)"
                    :num-of-users="3"
                    @selected="changeAssignee(checkApps('MultipleAssignees',projectData) ? 'add' : 'replace', $event)"
                    @removed="changeAssignee('remove', $event)"
                    imageWidth="25px"
                    class="mr-5px"
                    :isDisplayTeam="true"
                    :multiSelect="checkApps('MultipleAssignees')"
                />

                <!-- DUE DATE -->
                <DueDateCompo
                    :tourId="'createtaskduedate_driver'"
                    v-if="$route?.query?.tab !== 'Calendar'"
                    id="due-date-task"
                    :allowTillCurrentDate="true"
                    :displyDate="dueDate"
                    @SelectedDate="dueDate = $event?.dateVal"
                    :position="`right`"
                    :autoposition="false"
                />

                <!-- PRIORITY -->
                <Priority
                    :tourId="'createtaskpriority_driver'"
                    :priorityVal="priority"
                    @select="changePriority"
                    class="ml-5px"
                />

                <!-- SAVE CLOSE -->
                <div class="d-flex align-items-center">
                    <button class="btn-primary save__btn-primary ml-10px p0x-10px"  @click.stop.prevent="saveTask()">Save</button>
                    <img :src="closeRedIcon" alt="closeRedIcon" class="cursor-pointer m-10px" @click.stop.prevent="$emit('cancel')">
                </div>
            </div>
        </template>
        <template v-else>
            <span class="red">SPRINT DATA REQUIRED</span>
        </template>
    </div>
</template>

<script setup>
// PACKAGES
import { ref, defineProps, defineEmits, onMounted, inject, computed, onBeforeUnmount } from "vue";
import { useStore } from "vuex";

// COMPONENTS
import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import InputText from "@/components/atom/InputText/InputText.vue"
import Priority from "@/components/molecules/PriorityCompo/PriorityComp.vue"
import TaskType from "@/components/atom/TaskType/TaskType.vue"

// UTILS
import { useCustomComposable, useGetterFunctions } from "@/composable";
import taskClass from "@/utils/TaskOperations"
const projectRef = inject("selectedProject");
import { useValidation } from "@/composable/Validation";
import { useToast } from "vue-toast-notification";
const clientWidth = inject("$clientWidth");
const companyId = inject("$companyId");
const $toast = useToast()
const {getUser} = useGetterFunctions()
const userId = inject("$userId")
const {getters} = useStore();
const {checkPermission, checkApps} = useCustomComposable();
const  { checkErrors , checkAllFields } = useValidation();

// IMAGES
const closeRedIcon = require("@/assets/images/svg/closeBlack.svg");
// PROPS
const props = defineProps({
    sprint: {
        type: Object,
        required: true
    },
    taskId: {
        type: String,
        default: ""
    },
    assigneeOptions: {
        type: Array,
        default: () => []
    },
    projectProp: {
        type: Object,
        default: null
    },
    addDefaultAssignee: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
})

// EMITS

const emits = defineEmits(["cancel", "submit"]);
const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
})

const taskName = ref({
    value: "",
    rules:
    "required | min: 3",
    name: "name",
    error: "",
});
const taskType = ref({});
const taskTypes = computed(() => project.value.taskTypeCounts)
const status = ref({});
const save = ref(false);
const dueDate = ref("");
const priority = ref("MEDIUM");
const assignee = ref([]);
const project = computed(() => {
    if(props.projectProp) {
        return props.projectProp;
    } else {
        return projectRef.value;
    }
})

onMounted(() => {
    // SELECT DEFAULT TASK TYPE
    const taskTypeIndex = taskTypes.value && taskTypes.value.length ? 0 : -1
    if(taskTypeIndex !== -1) {
        taskType.value = taskTypes.value[taskTypeIndex]
    }

    // SELECT DEFAULT STATUS
    let statusIndex = project.value.taskStatusData && project.value.taskStatusData.length ? project.value.taskStatusData.findIndex((x) => x.type === "default_active") : -1
    if(statusIndex !== -1) {
        status.value = project.value.taskStatusData[statusIndex];
    }

    if(props.addDefaultAssignee) {
        assignee.value.push(userId.value);
    }
})

function changePriority(val) {
    priority.value = val.value
}

function changeAssignee(type, user) {
    if(type === "add") {
        assignee.value.push(user.id)
    } else if(type === 'remove') {
        const userIndex = assignee.value.findIndex((x) => x === user.id);

        if(userIndex !== -1) {
            assignee.value.splice(userIndex, 1);
        }
    } else if(type === 'replace') {
        assignee.value = [];
        assignee.value.push(user.id);
    }
}

function resetTaskFields() {
    dueDate.value = "";
    taskName.value.value = "";
    taskName.value.error = "";
    priority.value = "MEDIUM";
    assignee.value = [];
}

function saveTask() {
    save.value = true;
    checkAllFields({taskName: taskName.value}).then((valid)=>{
        if(valid){
            save.value = false;
            if(taskName.value.value.trim().length < 3 || taskName.value.value.trim().length > 250) return;

            const name = taskName.value.value.trim();

            const user = getUser(userId.value)

            const userData = {
                id: user.id,
                Employee_Name: user.Employee_Name,
                companyOwnerId: companyOwner.value.userId,
            }

            let sprintObj = {
                id: props.sprint.id,
                name: props.sprint.name,
                value: props.sprint.value
            }

            if(props.sprint.folderId) {
                sprintObj.folderId = props.sprint.folderId;
                sprintObj.folderName = props.sprint.folderName;
            }

            let obj = {
                'TaskName': name,
                'TaskKey': '-',
                'AssigneeUserId': assignee.value,
                'watchers': [...assignee.value, userId.value],
                'DueDate': new Date(props.endDate ? props.endDate : dueDate.value),
                'dueDateDeadLine': [],
                'TaskType': taskType.value.value,
                'TaskTypeKey': taskType.value.key,
                'ParentTaskId': props.taskId,
                'ProjectID': project.value._id,
                'CompanyId': companyId.value,
                'status': {
                    "text": status.value.name,
                    "key": status.value.key,
                    "value": status.value.value,
                    'type': status.value.type
                },
                'isParentTask': props.taskId === "",
                'Task_Leader': userId.value,
                'sprintArray': sprintObj,
                'Task_Priority': priority.value,
                'deletedStatusKey': 0,
                'sprintId': props.sprint.id,
                'statusType': status.value.type,
                'statusKey': status.value.key,
            }
            if(props.sprint.folderId) {
                obj.folderObjId = props.sprint.folderId;
            }
            if (props.startDate) {
                obj.startDate = new Date(props.startDate)
            }
            const projectData = {
                _id: project.value._id,
                CompanyId: project.value.CompanyId,
                lastTaskId: project.value.lastTaskId,
                ProjectName: project.value.ProjectName,
                ProjectCode: project.value.ProjectCode
            }

            resetTaskFields();
            let indexObj
            if (props.taskId === "") {
                indexObj = {
                    indexName : "groupByStatusIndex",
                    searchKey : "statusKey",
                    searchValue : "1"
                }
            }
            taskClass.create({data: obj, user: userData, projectData, indexObj})
            .then((data) => {
                $toast.success(`Task created successfully`, {position: "top-right"});
                emits('submit', {data: {...obj, _id: data.id}})
            })
            .catch((error) => {
                console.error("ERROR in create task: ", error);
            })
        }
    })
    .catch((error)=>{
        console.error("ERROR in creat task: ", error);
    })
}
onBeforeUnmount(() => {
    resetTaskFields()
})
</script>

<style scoped>
input#inputId::placeholder {
    color: #959595;
    font-size: 12px;
    font-weight: 400;
    text-transform: capitalize;
}
.create__task-div{
    height: 34px;
    padding: 0px 10px 0px 0px;
}
.save__error{
    bottom: -15px;
}
.save__btn-primary{
    height: 25px !important;
}
.create__task-inputtext{
    height: 28px !important;
}
</style>