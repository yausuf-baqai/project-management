<template>
    <div v-if="clientWidth <= 767" class="task-body-buttons w-100">
        <button :class="isVisible == false ? 'outline-secondary' : 'btn-primary'" @click="emit('description',true),isVisible = true" class="font-size-16 desc__btn">Description</button>
        <button :class="isVisible == false ? 'btn-primary' : 'outline-secondary'" @click="emit('description',false),isVisible = false" class="font-size-16 desc__btn">Details</button>
    </div>  
    <div class="projectRightside overflow-y-auto style-scroll" v-if="clientWidth > 767 || isVisible === false">
        <div :class="{'border-bottom-mobiledrop' : clientWidth > 767}" :style="[{paddingBottom : clientWidth > 767 ? '5px' : '0px'}]" v-if="checkPermission('project.project_details',projectData?.isGlobalPermission)!== null">
            <h4 class="black font-roboto-sans detailsHead" v-if="clientWidth > 767" :class="{'font-size-14 font-weight-700' : clientWidth > 767}">Details</h4>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_status_change',projectData?.isGlobalPermission)!== null">
                <h4 :class="{'font-size-14 font-weight-500 status__title' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Status</h4>
                <ProjectStatus
                    class="d-flex nohover__project-rightside d-inline-block text-ellipsis"
                    :projectKey="projectData.status"
                    @update:projectstatus="(val,val1) => updateStatus(val,val1)"
                />
            </div>
            <div class="d-flex project-right-side-label" v-if="projectData?.isPrivateSpace && checkPermission('project.project_assignee',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500 status__title' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Assignee</h4>
                <Assignee
                    class="nohover__project-rightside ml-5px"
                    :numOfUsers="2"
                    imageWidth="30px"
                    :showAddUser="true"
                    :users="projectData.AssigneeUserId"
                    :addUser="checkPermission('project.project_assignee',projectData?.isGlobalPermission) === true"
                    :options="[...users.map((x) => x._id), ...teams.map((x) => 'tId_'+x._id)]"
                    @selected="updateAssignee('add', $event)"
                    @removed="updateAssignee('remove', $event)"
                />
            </div>
            <div class="d-flex project-right-side-label">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Key</h4>
                <span class="black projectKeyClass hover__on-projectrightside text-ellipsis cursor-default" :class="{'font-size-13 font-weight-400' : clientWidth > 767 ,'font-size-16' : clientWidth <=767}"
                    :style="[{padding : clientWidth > 767 ? '10px 10px 10px 0' : '10px 0px'}]"
                    :title="projectData.ProjectCode"
                >{{projectData.ProjectCode ? projectData.ProjectCode : 'N/A'}}</span>
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_category',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Category</h4>
                <ProjectCategory
                    class="hover__on-projectrightside text-ellipsis"
                    @selected="updateCategory($event)"
                    :projectData="projectData"
                />
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_source',projectData?.isGlobalPermission)!== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Source</h4>
                <span class="black projectKeyClass cursor-pointer hover__on-projectrightside text-ellipsis" :class="{'font-size-13 font-weight-400' : clientWidth > 767 ,'font-size-16' : clientWidth <=767}" 
                    :style="[{padding : clientWidth > 767 ? '10px 10px 10px 0' : '10px 0px'}]"
                 v-if="sourceEditable === false" @click="openInput()" :title="projectData.ProjectSource ? projectData.ProjectSource : ''">{{projectData.ProjectSource ? projectData.ProjectSource : "N/A"}}</span>
                <span v-else @keyup.enter="saveProjectSource()">
                    <input ref="sourceInp" @focusout="closeInpEditing('source')" v-model="proSource" class="hover__on-projectrightside--input" :maxlength="25"/>
                </span>
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_type',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Type</h4>
                <ProjectType
                    class="hover__on-projectrightside text-ellipsis"
                    :projectData="projectData"
                    @selected="updateType($event)"
                />
            </div>
            <div class="d-flex project-right-side-label" v-if="projectData.ProjectType === 'Hourly'">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Billing Period</h4>
                <BillingPeriod :projectData="projectData" @selected="updateBillingPeriod($event)" class="hover__on-projectrightside text-ellipsis"/>
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_currency',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Currency</h4>
                <Currency :projectData="projectData" @selected="updateCurrency($event)"  class="hover__on-projectrightside text-ellipsis" />
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_amount',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Amount</h4>
                <span class="black project-amount cursor-pointer  hover__on-projectrightside text-ellipsis" :class="{'font-size-13 font-weight-400' : clientWidth > 767 ,'font-size-16' : clientWidth <=767}"
                :style="[{padding : clientWidth > 767 ? '2px' : '10px 0px'}]" :title="projectData.ProjectCurrency.symbol + ' ' + (projectData.milestoneAmount ? getCommaSeperatedNumber(projectData.milestoneAmount) : 0) ">{{projectData.ProjectCurrency.symbol}} {{projectData.milestoneAmount ? getCommaSeperatedNumber(projectData.milestoneAmount) : 0}}</span>
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_start_date',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">Start Date</h4>
                <StartEndDate
                    v-if="checkPermission('project.project_start_date',projectData?.isGlobalPermission) === true"
                    class="hover__on-projectrightside text-ellipsis"
                    id="start-date-project"
                    :displyDate="projectData.StartDate"
                    :isShowDateAndicon="true"
                    :minDate="''"
                    :maxDate="projectData.EndDate ? projectData.EndDate.seconds ? new Date(projectData.EndDate.seconds * 1000) : new Date(projectData.EndDate) : ''"
                    :calenderImage="false"
                    :InputDesign="false"
                    @SelectedDate="($event) => updateStartDate($event)"
                    :startDateChanges="startDateWarning"
                    :position="`right`"
                    :autoposition="false"
                ></StartEndDate>
                <template v-else>
                    <span class="font-size-13 font-weight-400 black hover__on-projectrightside" v-if="projectData.StartDate">{{convertDateFormat(projectData.StartDate)}}</span>
                    <span class="font-size-13 font-weight-400 black hover__on-projectrightside" v-else>No Start Date</span>
                </template>
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_end_date',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767 ,'font-size-16 font-weight-400' : clientWidth <=767}">End Date</h4>
                <StartEndDate
                    v-if="checkPermission('project.project_end_date',projectData?.isGlobalPermission) === true"
                    class="hover__on-projectrightside text-ellipsis"
                    id="end-date-project"
                    :displyDate="projectData.EndDate? projectData.EndDate : ''"
                    :isShowDateAndicon="true"
                    :minDate="projectData.StartDate ? projectData.StartDate.seconds ? new Date(projectData.StartDate.seconds * 1000) : new Date(projectData.StartDate) : ''"
                    :maxDate="''"
                    :calenderImage="false"
                    :InputDesign="false"
                    @SelectedDate="($event) => updateEndDate($event)"
                    :position="`right`"
                    :autoposition="false"
                ></StartEndDate>
                <template v-else>
                    <span class="font-size-13 font-weight-400 black hover__on-projectrightside" v-if="projectData.EndDate">{{convertDateFormat(projectData.EndDate)}}</span>
                    <span class="font-size-13 font-weight-400 black hover__on-projectrightside" v-else>No End Date</span>
                </template>
            </div>
            <div class="d-flex project-right-side-label" v-if="checkPermission('project.project_due_date',projectData?.isGlobalPermission) !== null">
                <h4 :class="{'font-size-14 font-weight-500' : clientWidth > 767, 'font-size-16 font-weight-400' : clientWidth <=767}">Due Date</h4>
                <DueDateCompo
                    v-if="checkPermission('project.project_due_date',projectData?.isGlobalPermission) === true"
                    class="hover__on-projectrightside text-ellipsis"
                    id="due-date-project"
                    :displyDate="projectData.DueDate ? projectData.DueDate : ''"
                    :isShowDateAndicon="true"
                    @SelectedDate="($event) => updateDueDate($event)"
                    :position="`right`"
                    :autoposition="false"
                />
                <template v-else>
                    <span class="font-size-13 font-weight-400 black hover__on-projectrightside" v-if="projectData.DueDate">{{convertDateFormat(projectData.DueDate)}}</span>
                    <span class="font-size-13 font-weight-400 black hover__on-projectrightside" v-else>No Due Date</span>
                </template>
            </div>
        </div>
        <ConfirmModal :modelValue="showConfirmModal" acceptButtonText="Confirm" cancelButtonText="Cancel" maxlength="150" :header="false" :showCloseIcon="false" @close="showConfirmModal = false">
            <template #body>
                <div class="text-center">
                    <div>
                        <img class="warning__yellow-img" src="@/assets/images/gif/warning-yellow.gif" alt="warning">
                    </div>
                    <span>The start date can't be modify because it is already <br> within a milestone range.</span>
                </div>
            </template>
            <template #footer>
                <div class="text-right">
                    <button class="btn-primary p0x-15px" @click="showConfirmModal = false">ok</button>
                </div>
            </template>
        </ConfirmModal>
    </div>
</template>

<script setup>
import ProjectStatus from '@/components/molecules/ProjectStatus/ProjectStatus.vue'
import Assignee from '@/components/molecules/Assignee/Assignee.vue';
import ProjectCategory from '@/components/atom/ProjectCategory/ProjectCategory.vue'; 
import ProjectType from '@/components/atom/ProjectType/ProjectType.vue';
import Currency from '@/components/atom/Currency/Currency.vue';
import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
import BillingPeriod from '@/components/atom/BillingPeriod/BillingPeriod.vue';
import StartEndDate from '@/components/molecules/FixMilestoneDate/FixMilestoneDate.vue';
import { defineProps , inject ,computed,ref,nextTick,defineEmits } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toast-notification';
import { dbCollections } from "@/utils/FirebaseCollections"
import ConfirmModal from '@/components/atom/Modal/Modal.vue';
import { useConvertDate, useCustomComposable, useGetterFunctions } from '@/composable';
const { checkPermission } = useCustomComposable();
const {convertDateFormat} = useConvertDate();
import { BSON } from "realm-web";
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import { apiRequest } from '@/services';
import * as env from '@/config/env';
import moment from 'moment';
const $toast = useToast();
const {getters} = useStore();

const props = defineProps({
    projectData: {
        type: Object,
    },
});
const {getUser} = useGetterFunctions();
const emit = defineEmits(['rightSideBarEmit','startDateChanges','description'])
const sourceEditable = ref(false);
const sourceInp = ref("");
const proSource = ref("");
const showConfirmModal = ref(false);
const clientWidth = inject("$clientWidth");
const startDateWarning = ref('');
const users = computed(() => getters["users/users"]);
const teams = computed(() => getters["settings/teams"])
const isVisible = ref(true);
const userId = inject('$userId');
const companyId = inject('$companyId');
const dateFormat = inject('$dateFormat');
const user = getUser(userId.value);
const userData = {
    id: user.id,
    Employee_Name: user.Employee_Name,
    companyOwnerId: user.companyOwnerId
}
// const warning = ('@/assets/images/gif/warning-yellow.gif');
const getCommaSeperatedNumber = (n)=> {
    let numVal = Number(n)
    return numVal.toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: true});
};

const projectSourcePermission = computed(() => checkPermission("project.project_source", props.projectData.isGlobalPermission, {gettersVal: getters}))
const updateStatus = (oldVal, newval) => {
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: {
                status: newval.value,
                statusType : newval.type
            }
        }
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        $toast.success('Updated successfully',{position: 'top-right'});
        let historyObj = {
            'message': `<b>${userData.Employee_Name}</b> has changed <b> Status</b> as <b>${newval.name}</b>.`,
            'key' : 'Project_Status',
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
    })
    .catch((err)=>{
        console.error(err,"Error in Project Status Update");
    })
}

const updateAssignee = (type, user) => {
    let queryObj;
    var historyObj = {};
    if (type === "add") {
        queryObj = [
            { _id: BSON.ObjectID(props.projectData._id) },
            { $addToSet: { AssigneeUserId: user.id } },
            true, // Upsert
            false
        ];
        historyObj.key = "Project_Assignee_Add";
        historyObj.message = `<b>${userData.Employee_Name}</b> has added the <b>${getUser(user.id).Employee_Name}</b> to <b>Assignee</b>.`;
    } else {
        queryObj = [
            { _id: BSON.ObjectID(props.projectData._id) },
            { $pull: {
                    AssigneeUserId: user.id,
                    ...(props.projectData.LeadUserId.includes(user.id) && { LeadUserId: user.id })
                }
            },
            true, // Upsert
            false
        ];
        historyObj.key = "Project_Assignee_Removed";
        historyObj.message = `<b>${userData.Employee_Name}</b> has removed the <b>${getUser(user.id).Employee_Name}</b> to <b>Assignee</b>.`;
    }

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        $toast.success(`Assignee ${type === "add" ? 'added' : 'removed'} successfully`,{position: 'top-right'});
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
    })
    .catch((error)=>{
        console.error("ERROR in update project assignee: ", error);
    })
}

const updateCategory = (cat) => {
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: { ProjectCategory: cat.label }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        let historyObj = {
            'message': `<b>${userData.Employee_Name}</b> has changed <b> Category </b> as <b>${cat.label}</b>.`,
            'key' : 'Project_Category',
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
        $toast.success('Updated successfully',{position: 'top-right'});
    })
    .catch((err)=>{
        console.error(err,"Error in Project Category Update");
    })
}

const closeInpEditing = (type) =>{
    if(type == 'source'){
        sourceEditable.value = false;
    }
}

const openInput = () => {
    if(projectSourcePermission.value === true) {
        sourceEditable.value = !sourceEditable.value;
        nextTick(() => {
            sourceInp.value.focus();
        })
        proSource.value = props.projectData.ProjectSource;
    }
}

const saveProjectSource = () => {
    if(proSource.value == ""){
        $toast.error('Enter valid project source',{position: 'top-right'});
        return;
    }
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: { ProjectSource: proSource.value }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        sourceEditable.value = false;
        $toast.success('Updated successfully',{position: 'top-right'});
        let historyObj = {
            'message': `<b>${userData.Employee_Name}</b> has changed <b> Source</b> as <b>${proSource.value}</b>.`,
            'key' : 'Project_Source',
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
    })
    .catch((err)=>{
        console.error(err,"Error in Project Source Update");
    })
}

const updateType = (type) => {
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: { 
            ProjectType: type.label,
            ...((type.label === 'Hourly' && !props.projectData.BillingPeriod) && {BillingPeriod: "Monthly" })
        }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        sourceEditable.value = false;
        let historyObj = {
            'message': `<b>${userData.Employee_Name}</b> has changed <b> Type</b> as <b>${type.label}</b>.`,
            'key' : 'Project_Type',
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
        $toast.success('Updated successfully',{position: 'top-right'});
    })
    .catch((err)=>{
        console.error(err,"Error in Project Source Update");
    })
}

const updateCurrency = (currency) => {
    if (props.projectData && props.projectData.ProjectCurrency) {
        if (currency.code !== props.projectData.ProjectCurrency.code) {
            const query = {
                type: "updateOne",
                collection: dbCollections.CURRENCY_LIST,
                data: [
                    { _id: BSON.ObjectId(props.projectData.ProjectCurrency._id) },
                    {$inc: {"count": -1}}
                ]
            };
            mongoQuery.mongodbCrudOperations(query).then(() => {
            })
            .catch((err)=>{
                console.error(err,"Error in updateCurrency");
            })
            const queryIncre = {
                type: "updateOne",
                collection: dbCollections.CURRENCY_LIST,
                data: [
                    { _id: BSON.ObjectId(currency._id) },
                    {$inc: {"count": 1}}
                ]
            };
            mongoQuery.mongodbCrudOperations(queryIncre).then(() => {
            })
            .catch((err)=>{
                console.error(err,"Error in updateCurrency");
            });
        }
    }
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: {
            ProjectCurrency: currency
        }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        $toast.success('Updated successfully',{position: 'top-right'});
        let historyObj = {
            'message': `<b>${userData.Employee_Name}</b> has changed <b> Currency</b> as <b>${currency.name}</b>.`,
            'key' : 'Project_Currency',
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
    })
    .catch((err)=>{
        console.error(err,"Error in Project Source Update");
    })
}

const updateDueDate = (event) => {
    let newdueDateDeadLine = [];
    if(props.projectData.dueDateDeadLine && props.projectData.dueDateDeadLine.length > 0) {
        props.projectData.dueDateDeadLine.forEach((date) => {
            newdueDateDeadLine.push({ date: new Date(date.date) })
        })
        newdueDateDeadLine.push({ date: new Date(event.dateVal)});
    } else {
        newdueDateDeadLine.push({ date: new Date(event.dateVal)});
    }

    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: {
            DueDate: event.dateVal,
            dueDateDeadLine: newdueDateDeadLine,
        }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        $toast.success('Updated successfully',{position: 'top-right'});
        let historyObj = {
            key : "Project_DueDate",
            message : `<b>${userData.Employee_Name}</b> has changed <b> Due Date</b> as <b>${moment(new Date(event.dateVal)).format(dateFormat.value)}</b>.`
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
    })
    .catch((err)=>{
        console.error(err,"Error in Project Due Date Update");
    })
}

const updateStartDate = (event) => {
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: {
            StartDate: event.dateVal
        }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };
    let historyObj = {
        key : "Project_StartDate",
        message : `<b>${userData.Employee_Name}</b> has changed <b> Start Date</b> as <b>${moment(new Date(event.dateVal)).format(dateFormat.value)}</b>.`
    }
    if(props.projectData.ProjectType === 'Hourly'){
        let getStartDate = new Date(event.dateVal).getTime()
        const getQuery = [
            {
                $match: {
                    $and: [
                        {
                            projectId: props.projectData._id,  
                        }
                    ]
                }
            }
        ];
        let obj = {
            type:'aggregate',
            collection:'milestone',
            data:[getQuery]
        }
        mongoQuery.mongodbCrudOperations(obj).then((res)=>{
            if(res && res.length){
                let smallestValue = res.reduce((min, obj) => obj.startDate < min ? obj.startDate : min, res[0].startDate);
                let smallest = new Date(smallestValue)
                let currentMonthEnd = null;
                if(props.projectData.BillingPeriod === "Weekly"){
                    currentMonthEnd = new Date(smallest).getTime();
                }else{
                    currentMonthEnd = new Date(smallest.getFullYear(),smallest.getMonth() + 1,1).getTime();
                }
                if(currentMonthEnd < getStartDate){
                    showConfirmModal.value = true;
                    emit('startDateChanges',props.projectData.StartDate)
                    startDateWarning.value = props.projectData.StartDate
                    return;
                }else{
                    mongoQuery.mongodbCrudOperations(query)
                    .then(() => {
                        emit('rightSideBarEmit','startDate', event.dateVal);
                        $toast.success('Updated successfully',{position: 'top-right'});
                        apiRequest("post", env.HANDLE_HISTORY, {
                            "type": 'project',
                            "companyId": companyId.value,
                            "projectId": props.projectData._id,
                            "taskId": null,
                            "object": historyObj,
                            "userData": userData
                        })
                    })
                    .catch((err)=>{
                        console.error(err,"Error in Project End Date Update");
                    });
                }
            }else{
                mongoQuery.mongodbCrudOperations(query)
                .then(() => {
                    emit('rightSideBarEmit','startDate', event.dateVal);
                    $toast.success('Updated successfully',{position: 'top-right'});
                    apiRequest("post", env.HANDLE_HISTORY, {
                        "type": 'project',
                        "companyId": companyId.value,
                        "projectId": props.projectData._id,
                        "taskId": null,
                        "object": historyObj,
                        "userData": userData
                    })
                })
                .catch((err)=>{
                    console.error(err,"Error in Project End Date Update");
                });
            }
        }).catch((err)=>{
            console.error("ERROR",err)
            mongoQuery.mongodbCrudOperations(query)
            .then(() => {
                emit('rightSideBarEmit','startDate', event.dateVal);
                $toast.success('Updated successfully',{position: 'top-right'});
                apiRequest("post", env.HANDLE_HISTORY, {
                    "type": 'project',
                    "companyId": companyId.value,
                    "projectId": props.projectData._id,
                    "taskId": null,
                    "object": historyObj,
                    "userData": userData
                })
            })
            .catch((err)=>{
                console.error(err,"Error in Project End Date Update");
            });
        });
    }else{
        mongoQuery.mongodbCrudOperations(query)
        .then(() => {
            emit('rightSideBarEmit','startDate', event.dateVal);
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": props.projectData._id,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })
            $toast.success('Updated successfully',{position: 'top-right'});
        })
        .catch((err)=>{
            console.error(err,"Error in Project End Date Update");
        });
    }
}

const updateEndDate = (event) => {
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: {
            EndDate: event.dateVal
        }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        let historyObj = {
            key : "Project_EndDate",
            message : `<b>${userData.Employee_Name}</b> has changed <b> End Date</b> as <b>${moment(new Date(event.dateVal)).format(dateFormat.value)}</b>.`
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'project',
            "companyId": companyId.value,
            "projectId": props.projectData._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        })
        $toast.success('Updated successfully',{position: 'top-right'});
    })
    .catch((err)=>{
        console.error(err,"Error in Project End Date Update");
    })
}

const updateBillingPeriod = (event) => {
    let queryObj = [
        { _id: BSON.ObjectID(props.projectData._id) },
        { $set: {
            BillingPeriod: event.label
        }},
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        emit('rightSideBarEmit','billingPeriod',event.label);
        $toast.success('Updated successfully',{position: 'top-right'});
    })
    .catch((err)=>{
        console.error(err,"Error in Project Billing Period Update");
    })
}
</script>
<style src='./style.css'>
</style>
