 <template>
    <div>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <Sidebar width="607px" :top ="clientWidth > 767 ? '46px' : '0px' " >
             <template #head-left>
                <div class="blue font-roboto-sans text-ellipsis text-nowrap pr-15px">{{sidebarTitle === 'projectStatus' ? `${projectData.ProjectName} Status` : sidebarTitle === 'taskType' ? `${projectData.ProjectName} Task Type` : sidebarTitle === 'taskStatus' ? `${projectData.ProjectName} Task Status` : ''}}</div>
            </template>
            <template #head-right>
                <button class="bg-white cancelButtonProject blue mr-010 cursor-pointer" @click="closeSidebarFun()">Cancel</button>
                <button class="bg-blue cancelButtonProject white cursor-pointer" @click="submitData()" :disabled="isSpinnerTaskType || isSpinnerTaskStatus">Submit</button>
            </template>
            <template #body>
                <div :class="{'bg-white' : clientWidth <=767}" class="h-100">
                    <div v-if="sidebarTitle === 'projectStatus'" class="bg-white m-015 project__setting--blankproject border-radius-8-px createProjectWizardSlider" :class="{'mobile-project-taskstatus-section task-detail-mobile' : clientWidth<=767}"  :style="[{margin : clientWidth > 767 ? '15px' : '0'}]">
                        <ProjectStatusForm v-model="formData.projectStatusForm" :from="'setting'" :projectData="JSON.parse(JSON.stringify(props.projectData))" @setTemplateData="setTemplateData()" @saveTemplate="saveTemplate"/>
                    </div>
                    <div v-if="sidebarTitle === 'taskType'" class="bg-white m-015 project__setting--blankproject border-radius-8-px createProjectWizardSlider" :class="{'mobile-project-taskstatus-section task-detail-mobile' : clientWidth<=767}" :style="[{margin : clientWidth > 767 ? '15px' : '0'}]">
                        <ProjectTaskTypeForm v-model="formData.taskTypeForm" :from="'setting'" :projectData="JSON.parse(JSON.stringify(props.projectData))" @setTemplateDataTaskType="setTemplateTaskType" @saveTemplate="saveTemplate" @spinnerOn="isSpinnerTaskType = true"/>
                    </div>
                    <div v-if="sidebarTitle === 'taskStatus'" class="bg-white m-015 project__setting--blankproject border-radius-8-px createProjectWizardSlider" :class="{'mobile-project-taskstatus-section task-detail-mobile' : clientWidth<=767}" :style="[{margin : clientWidth > 767 ? '15px' : '0'}]">
                        <TaskStatusForm v-model="formData.taskStatusForm" :from="'setting'" :projectData="JSON.parse(JSON.stringify(props.projectData))" @setTemplateDataTaskStatus="setTemplateTaskStatus" @saveTemplate="saveTemplate" @spinnerOn="isSpinnerTaskStatus = true"/>
                    </div>
                </div>
                <SpinnerComp :is-spinner="isSpinnerTaskType || isSpinnerTaskStatus" v-if="isSpinnerTaskType || isSpinnerTaskStatus"/>
            </template>
        </Sidebar>
            <ConfirmationsInTask :projectStatusConfirm="projectStatusConfirm" v-model="showSidebar"
                :selectedProjectData="props.projectData"
                :newProjectStausData="newProjectStausData"
                :oldProjectStatus="oldProjectStatus"
                :newTaskTypeData="newTaskTypeData"
                :oldTaskType="oldTaskType"
                :taskTypeConfirm="taskTypeConfirm"
                :statusConfirm="statusConfirm"
                :oldStatus="oldTaskStatus"
                @changeStatus="changeStatus"
                @changeTaskType="changeTaskType"
                @finalConfirm="finalConfirm"
                @checkTaskType="checkTaskType"
                :newTaskStatusData="newTaskStatusData"
                :errorMsg="errorMsg"
                :errorMsgType="errorMsgType"
            />
    </div>
</template>

<script setup>
 
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue";
import ProjectStatusForm from '@/components/templates/CreateProject/ProjectStatusForm.vue';
import {computed, defineProps, inject, ref} from 'vue';
import { dbCollections } from '@/utils/FirebaseCollections';
import ProjectTaskTypeForm from '@/components/templates/CreateProject/ProjectTaskTypeForm.vue'
import TaskStatusForm from '@/components/templates/CreateProject/TaskStatusForm.vue';
import ConfirmationsInTask from "@/components/atom/ConfirmationsInTask/ConfirmationsInTask.vue"
import { useStore } from "vuex";
import cloneDeep from 'lodash/cloneDeep'; // Import a cloning library
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import * as env from '@/config/env';
import { apiRequest } from '../../../services';
import { BSON } from "realm-web";

const props = defineProps({
    projectData: {
        type: Object,
        required: true
    },
    sidebarTitle: {
        type: String,
        default: ""
    },
    openSidebarInProject: {
        type: Boolean,
    }
})

const emit = defineEmits(["isSidebarProjectSetting"]);
const projectStatusConfirm = ref(false);
const showSidebar = ref(false);
const isSpinner = ref(false);
const statusConfirm = ref(false)
const { getters } = useStore();

const isOpen = ref(props.openSidebarInProject);
const projectStatus = ref(props.projectData);
const newProjectStausData=  ref([]);
const newTaskTypeData=  ref([]);
const newTaskStatusData=  ref([]);

const formData = ref({
    projectStatusForm : {
        projectStatusField : {
            value: {},
            rules:
            "required",
            name: "projectStatusField",
            error: "",
        } 
    },
    taskTypeForm : {
        taskTypeField : {
            value: {},
            rules:
            "required",
            name: "taskTypeField",
            error: "",
        }
    },
    taskStatusForm : {
        taskStatusField : {
            value: {},
            rules:
            "required",
            name: "taskStatusField",
            error: "",
        }
    },
})
const companyId = inject("$companyId");
const oldProjectStatus = ref([]);
const oldTaskType = ref([]);
const oldTaskStatus = ref([]);
const taskTypeConfirm = ref(false);
const taskTypeKeys = ref([])
const taskStatusKey = ref([]);
const errorMsg = ref('')
const errorMsgType = ref('')
const isSpinnerTaskType = ref(false);
const isSpinnerTaskStatus = ref(false);

const projectStaus = computed(() => {
    return cloneDeep(getters['settings/projectStaus']);
})
const taskType = computed(() => {
    return cloneDeep(getters['settings/taskType']);
})
const taskStatus = computed(() => {
    return cloneDeep(getters['settings/taskStatus']);
})
function setTemplateData () {
    newProjectStausData.value =  [...formData.value.projectStatusForm.projectStatusField.value.projectActiveStatus, ...formData.value.projectStatusForm.projectStatusField.value.projectDoneStatus, {...formData.value.projectStatusForm.projectStatusField.value.projectCompletedStatus}];
    if(newProjectStausData.value.filter((y) => y.value === props.projectData.status).length === 0){
        oldProjectStatus.value = props.projectData.projectStatusData.filter((y) => y.value === props.projectData.status);
    }
}

function setTemplateTaskType (data,data1) {
    isSpinnerTaskType.value = false;
    newTaskTypeData.value = formData.value.taskTypeForm.taskTypeField.value.taskTypes;
    if(data.length === 0 || data[0] === null) {
        oldTaskType.value = [];
        return;
    }
    taskTypeKeys.value = data.map(type => type.TaskTypeKey);
    const notMatchedProjects = data1.filter((x) => {
        return taskTypeKeys.value.some((y) => y === x.key);
    });
    oldTaskType.value = notMatchedProjects;
}

function setTemplateTaskStatus (data,data1) {
    isSpinnerTaskStatus.value = false;
    newTaskStatusData.value = [{...formData.value.taskStatusForm.taskStatusField.value.defaultActive}, ...formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList, ...formData.value.taskStatusForm.taskStatusField.value.DoneStatusList, {...formData.value.taskStatusForm.taskStatusField.value.defaultComplete}];
    if(data.length === 0 || data[0] === null) {
        oldTaskStatus.value = [];
        return;
    }
    taskStatusKey.value = data.map(status => status.statusKey);
    const notMatchedProjects = data1.filter((x) => {
        return taskStatusKey.value.some((y) => y === x.key);
    });
    oldTaskStatus.value = notMatchedProjects;
}
const clientWidth = inject("$clientWidth");
function closeSidebarFun() {
    isOpen.value = false;
    emit("isSidebarProjectSetting",isOpen.value);
}

function checkStatus() {
    return new Promise((resolve, reject) => {
        try {
            if(props.sidebarTitle === 'projectStatus'){
                if(formData.value.projectStatusForm.projectStatusField.value._id !== props.projectData.projectStatusTemplateId && oldProjectStatus.value.length > 0){
                    showSidebar.value = true;
                    projectStatusConfirm.value = true;
                    resolve(false);
                }else{
                    resolve(true);
                }
            }else if(props.sidebarTitle === 'taskType'){
                if(formData.value.taskTypeForm.taskTypeField.value._id !== props.projectData.TaskTypeTemplateId && oldTaskType.value.length > 0){
                    showSidebar.value = true;
                    taskTypeConfirm.value = true;
                    resolve(false);
                }else{
                    resolve(true);
                }
            }else if(props.sidebarTitle === 'taskStatus'){
                if(formData.value.taskStatusForm.taskStatusField.value._id !== props.projectData.TemplateTaskStatusId && oldTaskStatus.value.length > 0){
                    showSidebar.value = true;
                    statusConfirm.value = true;
                    resolve(false);
                }else{
                    resolve(true);
                }
            }
        } catch (error) {
            reject(false);
        }
    })
}

function finalConfirm() {
    if(props.sidebarTitle === 'projectStatus'){
        finalSubmit();
    }
    if(props.sidebarTitle === 'taskType'){
        finalSubmitTaskType(true);  
    }
}

function checkTaskType() {
    if(props.sidebarTitle === 'taskStatus'){
        finalSubmitTaskStatus(true);  
    }
}

function submitData () {
    checkStatus().then((res) => {
        if(res === true && props.sidebarTitle === 'projectStatus'){
            finalSubmit();
        }
        if(res === true && props.sidebarTitle === 'taskType'){
            finalSubmitTaskType(false);
        }
        if(res === true && props.sidebarTitle === 'taskStatus'){
            finalSubmitTaskStatus(false);
        }
    })
}
function finalSubmit()  {
    if(oldProjectStatus.value.length > 0){
        oldProjectStatus.value.filter((x) => {
            if(x.convertStatus === undefined || x.convertStatus === ''){
                errorMsg.value = 'Please Select Project Status';
            }else{
                errorMsg.value = '';
            }
        })
    }
    if(errorMsg.value !== ''){
        return false;
    }
    let updateObj = {};
    if(props.sidebarTitle === 'projectStatus'){
        updateObj = {
            'projectStatusData' : [...formData.value.projectStatusForm.projectStatusField.value.projectActiveStatus, ...formData.value.projectStatusForm.projectStatusField.value.projectDoneStatus, {...formData.value.projectStatusForm.projectStatusField.value.projectCompletedStatus}]
        }
    }
    let index = projectStaus.value.findIndex((x) => {
        return x._id === formData.value.projectStatusForm.projectStatusField.value._id
    })
    let projectStausValue;
    if(index !== -1){
        projectStausValue = projectStaus.value[index];
    }
    if(projectStausValue!== undefined && formData.value.projectStatusForm.projectStatusField.value._id === props.projectData.projectStatusTemplateId){
        let obj = {
            projectStatusTemplateId: formData.value.projectStatusForm.projectStatusField.value.projectActiveStatus.length === projectStausValue.projectActiveStatus.length && formData.value.projectStatusForm.projectStatusField.value.projectDoneStatus.length === projectStausValue.projectDoneStatus.length ? formData.value.projectStatusForm.projectStatusField.value._id : ''
        }
        let queryObj = [
            { _id: BSON.ObjectID(props.projectData._id)},
            { $set: obj},
        ]; 
        const query = {
            type: "updateOne",
            collection: dbCollections.PROJECTS,
            data: queryObj
        };
        mongodbCrudOperations(query)
        .catch((err)=>{
            console.error(err,"Error in update project status");
        })
    }
    if(formData.value.projectStatusForm.projectStatusField.value._id !== props.projectData.projectStatusTemplateId && projectStausValue!== undefined){
        let obj = {
            projectStatusTemplateId: formData.value.projectStatusForm.projectStatusField.value.projectActiveStatus.length === projectStausValue.projectActiveStatus.length && formData.value.projectStatusForm.projectStatusField.value.projectDoneStatus.length === projectStausValue.projectDoneStatus.length ? formData.value.projectStatusForm.projectStatusField.value._id : ''
        }
        let queryObj = [
            { _id: BSON.ObjectID(props.projectData._id)},
            { $set: obj},
        ]; 
        if(oldProjectStatus.value.length > 0){
            let newStatus = props.projectData.projectStatusData.filter((y) => y.value === props.projectData.status)[0].convertStatus;
            queryObj.push({$push: {projectStatusData : newStatus}})
            queryObj[1].$set = {...obj,statusType :  newStatus.type,status : newStatus.value}
        }
        const query = {
            type: "updateOne",
            collection: dbCollections.PROJECTS,
            data: queryObj
        };
        mongodbCrudOperations(query)
        .catch((err)=>{
            console.error(err,"Error in update project status");
        })
    }
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: updateObj}
    ];
    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };
    mongodbCrudOperations(query).then(() => {
        emit("isSidebarProjectSetting",false);
    })
    .catch((error) => {
        console.error("ERROR in update project assignee: ", error);
    })
}

function finalSubmitTaskType(value)  {
    if(oldTaskType.value.length > 0){
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
    let updateObj = {};
    let taskTypeindex = taskType.value.findIndex((x) => {
        return x._id === formData.value.taskTypeForm.taskTypeField.value._id
    })
    let taskTypeValue = taskType.value[taskTypeindex];
    updateObj = {
        'taskTypeCounts' : formData.value.taskTypeForm.taskTypeField.value.taskTypes,
    }
    if(taskTypeValue !== undefined){
        updateObj.TaskTypeTemplateId = formData.value.taskTypeForm.taskTypeField.value.taskTypes.length === taskTypeValue.taskTypes.length ?  formData.value.taskTypeForm.taskTypeField.value._id : ''
    }

    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: updateObj},
        // true, // Upsert
        // false
    ];
    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };
    mongodbCrudOperations(query).then(() => {
        if(value === true) {
            isSpinner.value = true;
            let axiosData = {
                companyId : companyId.value,
                projectId : props.projectData._id,
                taskTypeKey : oldTaskType.value.map(status => status.key),
                oldTaskType : oldTaskType.value
            }

            apiRequest("post", env.TASKTYPE, axiosData).then(() => {
                isSpinner.value = false;
                emit("isSidebarProjectSetting",false);
            }).catch((error) => {
                isSpinner.value = false;
                emit("isSidebarProjectSetting",false);
                console.error(error,"ERROR");
            })

        }else{
            emit("isSidebarProjectSetting",false);
        }
    })
    .catch((error) => {
        console.error("ERROR in update project assignee: ", error);
    })
}

function finalSubmitTaskStatus(value)  {
    if(oldTaskStatus.value.length > 0){
        oldTaskStatus.value.filter((x) => {
            if(x.convertStatus === undefined || x.convertStatus === ''){
                errorMsg.value = 'Please Select Task Status';
            }else{
                errorMsg.value = '';
            }
        })
    }
    if(errorMsg.value !== ''){
        return false;
    }
    let updateObj = {};
    let taskStatusindex = taskStatus.value.findIndex((x) => {
        return x._id === formData.value.taskStatusForm.taskStatusField.value._id
    })
    let taskStausValue = taskStatus.value[taskStatusindex];
    updateObj = {
        'taskStatusData' : [{...formData.value.taskStatusForm.taskStatusField.value.defaultActive}, ...formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList, ...formData.value.taskStatusForm.taskStatusField.value.DoneStatusList, {...formData.value.taskStatusForm.taskStatusField.value.defaultComplete}],
    }
    if(taskStausValue !== undefined){
        updateObj.TemplateTaskStatusId = formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList.length === taskStausValue.ActiveStatusList.length && formData.value.taskStatusForm.taskStatusField.value.DoneStatusList.length === taskStausValue.DoneStatusList.length ?  formData.value.taskStatusForm.taskStatusField.value._id : ''
    }
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: updateObj},
    ];
    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };
    mongodbCrudOperations(query).then(() => {
        if(value === true) {
            isSpinner.value = true;
            let axiosData = {
                companyId : companyId.value,
                projectId : props.projectData._id,
                taskStatusKey : oldTaskStatus.value.map(status => status.key),
                oldTaskStatus : oldTaskStatus.value
            }

            apiRequest("post", env.TASKSTATUS, axiosData).then(() => {
                isSpinner.value = false;
                emit("isSidebarProjectSetting",false);
            }).catch((error) => {
                isSpinner.value = false;
                emit("isSidebarProjectSetting",false);
                console.error(error,"ERROR");
            })

        }else{
            emit("isSidebarProjectSetting",false);
        }
    })
    .catch((error) => {
        console.error("ERROR in update project assignee: ", error);
    })
}

function saveTemplate(newId,oldId,type) {
    if(type === 'taskstatus'){
        if(projectStatus.value.TemplateTaskStatusId === oldId){
            projectStatus.value.TemplateTaskStatusId = newId;
        }
    }else if(type === 'tasktype'){
        if(projectStatus.value.TaskTypeTemplateId === oldId){
            projectStatus.value.TaskTypeTemplateId = newId;
        }
    }else if(type === 'projectstatus'){
        if(projectStatus.value.projectStatusTemplateId === oldId){
            projectStatus.value.projectStatusTemplateId = newId;
        }
    }
}

const changeStatus = (st,st1,type) => {
    if(type === 'projectStatus'){
        props.projectData.projectStatusData.filter((val) => {
            if(val.key === st1.key){
                val['convertStatus'] = st;
            }
        })
    }
    if(type === 'taskStatus'){
        oldTaskStatus.value.filter((val) => {
            if(val.key === st1.key){
                val['convertStatus'] = st;
            }
        })
    }
}

const changeTaskType = (type,type1) => {
    oldTaskType.value.filter((val) => {
        if(val.value === type1.value){
            val['convertType'] = type;
        }
    })
}
</script>

<style>
.cancelButtonProject{
    border: 1px solid #2F3990;
    border-radius: 4px;
    height: 30px;
    padding: 3px 14px;
    font-size: 16px;
    line-height: 24px;
    font-family: 'Roboto', sans-serif;
}
.project__setting--blankproject{
    padding: 20px;
}
.dragImage  {
    left: -17px;
    top: 0px;
    cursor: grab;
}
.practice-customer {
    margin-left: auto;
}
input.statusInputText.form-control.edit-input:focus-visible{outline-color: none !important;}

@media(max-width: 767px){
    .project__setting--blankproject {padding: 20px !important;border-radius: 0 !important;}
    .project__setting--blankproject .taskStatusRight ul.status_ul li {height: 40px !important;}
    .project__setting--blankproject .taskStatusRight.taskyou_need_right ul.status_ul li{height: 40px !important;}
    .project__setting--blankproject  .activeStatus ul.status_ul li {padding-top: 4px !important;padding-bottom: 4px !important;}
    .project__setting--blankproject .mobile-project-taskstatus-section.task-detail-mobile .bg-light-gray{padding: 18.5px 10px !important;}
    .project__setting--blankproject img.ignore-drag.project__setting-ignoredrag {height: 16px !important;width: 16px !important;}
    .project__setting--blankproject .taskStatusSection.style-scroll {max-height: 500px !important;}
    .project__setting--blankproject .taskStatusRight ul.status_ul li.d-flex.align-items-center.justify-content-between {padding-top: 4px !important;padding-bottom: 4px !important;}
}
</style>