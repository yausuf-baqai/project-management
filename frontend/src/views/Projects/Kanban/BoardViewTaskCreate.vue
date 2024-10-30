<template>
    <div class="BoardViewTaskCreate p-10px">
        <div class="d-flex justify-content-between" v-if="!isSubTask">
            <div>
                <DropDown @isVisible="(val) => isOpend = val">
                    <template #button>
                        <div ref="sprintName" class="align-items-center cursor-pointer">
                            <span class="font-size-13" >{{selectedSprint.name}}</span>
                            <span class="ml-5px"><img src="@/assets/images/table_arrow.png" alt="" :style="`transform: rotateZ(${isOpend ? '90' : '0'}deg); opacity:0.5`"/></span>
                        </div>
                    </template>

                    <template #options>
                    <div v-for="(item,index) in taskOption" :key="index" class="task__option">
                        <div v-if="item.isFolderSprint">
                            <DropDownOption>
                                <div @click="() => item.isFolderExpand = !item.isFolderExpand">
                                    <span>
                                        <span class="mr-5px"><img src="@/assets/images/table_arrow.png" alt="" :style="`transform: rotateZ(${item.isFolderExpand ? '90' : '0'}deg);`"/></span>
                                        <span class="m-5px">
                                            <img class="mr-5px" src="@/assets/images/svg/blue_folder.svg">
                                            <span class="text-ellipsis">{{item.folderName}}</span>
                                        </span>
                                    </span>
                                </div>
                            </DropDownOption>
                        </div>
                        <div v-if="!item.isFolderSprint">
                            <DropDownOption>
                                <div @click="() => {selectedSprint = item,$refs.sprintName.click()}">
                                    {{item.name}}
                                </div>
                            </DropDownOption>
                        </div>
                        <div v-if="item.isFolderSprint && item.isFolderExpand">
                            <div v-for="(foldSprint,index) in item.sprints" :key="index">
                                <DropDownOption>
                                    <div @click="() => {selectedSprint = foldSprint,$refs.sprintName.click()}">
                                        {{foldSprint.name}}
                                    </div>
                                </DropDownOption>
                            </div>
                        </div>
                    </div>
                    </template>
                </DropDown>
            </div>
            <div class="pr-10px"  @click="() => {$emit('toggle', data.key)}">
                <img class="cursor-pointer" src="@/assets/images/crossBoardTaskIcon.png" alt="close"/>
            </div>
        </div>
        <div class="d-flex align-items-center mt-10px w-100">
            <div class="mr-10px">
                <TaskType
                    :id="selectedSprint.id+taskId+'create_taskType'"
                    v-model="taskType"
                    :options="taskTypes"
                    :isBoardView="true"
                />
            </div>
            <div class="position-re w-100">
                <InputText
                    v-model="taskName.value"
                    placeholder="Task name"
                    :maxLength="250"
                    class="input__type-taskname"
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
                <div v-if="isSubTask">
                    <button class="btn-primary position-ab ifsub__save" @click.stop.prevent="saveTask()">Save</button>
                </div>
                <div v-if="save" class="red position-ab z-index-1 save__error" :style="[{fontSize : clientWidth > 480 ? '11px' : '10px', left : clientWidth > 480 ? '0px' : '0px',width : clientWidth > 480 ? '100%' : '320px'},]" >{{taskName.error}}</div>
            </div>
        </div>
        <div class="d-flex justify-content-between mt-15px">
            <div class="d-flex justify-content-between align-items-center">
                <Assignee
                    v-if="groupValue !== 1"
                    :users="assignee"
                    :options="checkPermission('task.task_assignee',projectData?.isGlobalPermission) === true ? assigneeOptions : assigneeOptions.filter((x) => x === userId)"
                    :num-of-users="3"
                    @selected="changeAssignee(checkApps('MultipleAssignees',projectData) ? 'add' : 'replace', $event)"
                    @removed="changeAssignee('remove', $event)"
                    imageWidth="25px"
                    class="mr-4px"
                    :isDisplayTeam="true"
                    :multiSelect="checkApps('MultipleAssignees')"
                />

                <!-- DUE DATE -->
                <DueDateCompo
                    v-if="groupValue !== 3"
                    id="due-date-task"
                    :allowTillCurrentDate="true"
                    :displyDate="new Date(dueDate).getTime()/1000"
                    @SelectedDate="dueDate = $event?.dateVal"
                    :position="`right`"
                    :autoposition="false"
                    class="mr-4px d-flex align-items-center"

                />

                <!-- PRIORITY -->
                <span class="subtaskShape" v-if="groupValue !== 2">
                    <Priority
                        :priorityVal="priority"
                        @select="changePriority"
                    />
                </span>
            </div>
        <div v-if="!isSubTask">
            <button class="btn-primary mr-10px p0x-10px not__subtask-savebtn" @click.stop.prevent="saveTask()">Save</button>
        </div>
        <div v-if="isSubTask" class="pr-0px" @click.stop.prevent="() => {$emit('toggle')}">
            <img class="cursor-pointer" src="@/assets/images/crossBoardTaskIcon.png" alt="close"/>
        </div>
        </div>
    </div>
</template>
<script setup>
    /* eslint-disable */ 
    import { computed, inject, onMounted, ref } from "vue";
    import { doc } from "firebase/firestore";
    import { useStore } from "vuex";

    import DropDown from '@/components/molecules/DropDown/DropDown.vue'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
    import Assignee from "@/components/molecules/Assignee/Assignee.vue"
    import InputText from "@/components/atom/InputText/InputText.vue"
    import Priority from "@/components/molecules/PriorityCompo/PriorityComp.vue"
    import TaskType from "@/components/atom/TaskType/TaskType.vue"



    import { dbCollections } from "@/utils/FirebaseCollections";
    import { useCustomComposable, useFirebase, useGetterFunctions } from "@/composable";
    import taskClass from "@/utils/TaskOperations"
    import { useValidation } from "@/composable/Validation";
    import { useToast } from "vue-toast-notification";
    const clientWidth = inject("$clientWidth");
    const companyId = inject("$companyId");
    const $toast = useToast()
    const {generatePath} = useFirebase()
    const {getUser} = useGetterFunctions()
    const userId = inject("$userId")
    const {getters} = useStore();
    const {checkPermission,checkApps} = useCustomComposable();
    const  { checkErrors , checkAllFields } = useValidation();
    const props = defineProps({
        data: {
            type:Object,
        },
        taskId: {
            type: String,
            default: ""
        },
        assigneeOptionsData: {
            type: Array,
            default: () => []
        },
        sprintData: {
            type: Object,
            default: () => {}
        },
        isSubTask: {
            type: Boolean,
            default: false
        },
        groupValue: {
            type: Number,
            default: 0
        }
    })
    const projectData = inject("selectedProject");
    const assigneeOptions = ref([]);
    let taskOption = ref([]);
    const isOpend = ref(false);
    const selectedSprint = ref({});
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
    // const emit = defineEmits(["toggle"]);
    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    })
    const project = computed(() => {
        // if(props.projectProp) {
        //     return props.projectProp;
        // } else {
        //     return projectRef.value;
        // }
        return projectData.value
    })

    onMounted(() => {
        let sprints = [...(Object.values(projectData.value?.sprintsObj || {}))];
        Object.values(projectData.value?.sprintsfolders || {}).forEach((folder) => {
            // sprints.push({sprints: [], isFolderExpand:false, folderName: folder.name})
            let sprintsArray = [];
            Object.values(folder?.sprintsObj || {}).forEach((sprint)=>{
               sprintsArray.push({...sprint})
            })
            sprints.push({sprints: sprintsArray, isFolderExpand:false, folderName: folder.name, isFolderSprint: true})
        })
        taskOption.value = sprints
        if (props.sprintData && Object.keys(props.sprintData).length > 0) {
            selectedSprint.value = props.sprintData
        } else {
            let sp = {}
            taskOption.value.forEach((x) => {
                if (x.isFolderSprint) {
                    let ind = x.sprints.findIndex((x) => x.id === props.data.sprintId)
                    if (ind !== -1) {
                        sp = x.sprints[ind]
                    }
                } else {
                    if (x.id == props.data.sprintId) {
                        sp = x
                    }
                }
            })
            selectedSprint.value = sp
        }

        const taskTypeIndex = taskTypes.value && taskTypes.value.length ? 0 : -1
        if(taskTypeIndex !== -1) {
            taskType.value = taskTypes.value[taskTypeIndex]
        }

        // SELECT DEFAULT STATUS
        let statusIndex = project.value.taskStatusData && project.value.taskStatusData.length ? project.value.taskStatusData.findIndex((x) => x.type === "default_active") : -1
        if(statusIndex !== -1) {
            status.value = project.value.taskStatusData[statusIndex];
        }

        if(projectData.value?._id === '6571e7195470e64b1203295c') {
            assignee.value.push(userId.value);
        }

        if (!props.assigneeOptionsData && props.assigneeOptionsData.length) {
            assigneeOptions.value = props.assigneeOptionsData
        } else {
            assigneeOptions.value = projectData.value.AssigneeUserId
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

                // const path = `${companyId}/${companyId}/${dbCollections.PROJECTS}/${project.value._id}/${selectedSprint.value.id}`
                // const {pathRef} = generatePath(path)
                // const docId = doc(pathRef);

                let sprintObj = {
                    id: selectedSprint.value.id,
                    name: selectedSprint.value.name,
                    value: selectedSprint.value.value
                }

                if(selectedSprint.value.folderId) {
                    sprintObj.folderId = selectedSprint.value.folderId;
                    sprintObj.folderName = selectedSprint.value.folderName;
                }

                const obj = {
                    // 'id': docId.id,
                    'TaskName': name,
                    'TaskKey': '--',
                    'AssigneeUserId': assignee.value,
                    'watchers': [...assignee.value, userId.value],
                    'DueDate': new Date(dueDate.value),
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
                    'isParentTask':  props.taskId === "",
                    'Task_Leader': userId.value,
                    'sprintArray': sprintObj,
                    'Task_Priority': priority.value,
                    'deletedStatusKey': 0,
                    'sprintId': selectedSprint.value.id,
                    'statusType': status.value.type,
                    'statusKey': status.value.key,
                }
                if(selectedSprint.value.folderId) {
                    obj.folderObjId = selectedSprint.value.folderId;
                }
                if (props.taskId === "") {     
                    obj[props.data.indexName] = -999999999999999
                    if (!(props.data.searchKey === "AssigneeUserId" && props.data.searchValue === "[]")) {
                        if (props.data.searchKey === "DueDate" && props.data.searchValue !== 0) {
                            obj[props.data.searchKey] = new Date(props.data.searchValue * 1000)
                        } else {
                            obj[props.data.searchKey] = props.data.searchValue
                        }
                    }
                }
                const projectData = {
                    id: project.value._id,
                    CompanyId: project.value.CompanyId,
                    lastTaskId: project.value.lastTaskId,
                    ProjectName: project.value.ProjectName,
                    ProjectCode: project.value.ProjectCode
                }
                let indexObj = {}
                if (props.taskId === "") {        
                    indexObj = {
                        indexName: props.data.indexName,
                        searchKey: props.data.searchKey,
                        searchValue: props.data.searchValue,
                    }
                }
                resetTaskFields();
                taskClass.create({data: obj, user: userData, projectData , indexObj})
                .then(() => {
                    $toast.success(`Task created successfully`, {position: "top-right"});
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
</script>
<style scoped>
.input__type-taskname{
   height: 30px!important;
}
.task__option{
    min-width:239px;
    max-width:239px;
}
.ifsub__save{
   height: 26px; 
   padding: 0px 12px; 
   top: 2px; 
   right:2px;
}
.task__error
{
    bottom: -15px;
}
.not__subtask-savebtn{
    height: 25px;
}
</style>