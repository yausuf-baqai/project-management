<template>
    <div :class="[{'position-re':!props.planCondition}]">
        <div v-if="!props.planCondition">
            <UpgradePlan 
                :isImage="false"
                buttonText="Upgrade Your Plan"
                lastTitle="To Unlock Milestone"
                secondTitle="Unlimited"
                firstTitle="Upgrade To"
                message="That feature isn’t available on your current plan"
            />
        </div>
        <div class="fix-milestone-wrapper" :class="[{'bg-colorlightgray pointer-event-none opacity-5 blur-3-px':!props.planCondition}]">
            <table class="table-responsive hourly_milestone" :class="[{'bg-colorlightgray':!props.planCondition,'bg-light-gray':props.planCondition}]">
                <SpinnerComp :is-spinner="isSpinner" />
                <thead :class="[{'pointer-event-none':isSpinner}]">
                    <tr>
                        <th>Milestone<br>Name</th>
                        <th>Date</th>
                        <th>Logged Hours</th>
                        <th>Billing<br>Hours</th>
                        <th>Amount<br>(Per Hour)</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Status Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody v-if="milestoneArray && milestoneArray.length">
                    <template v-for="(element,index) in milestoneArray" :key="index">
                        <HourlyMilestoneTr
                            :permission="props.permissionData"
                            :projectId="projectId"
                            :currency="currency"
                            :billingPeriod="billingPeriod"
                            :milestoneArray="element"
                            :settingMilestoneStatus="settingStatus"
                            :edithourlyMilestone="props.planCondition ? edithourlyindex : 0.1" 
                            :hourlyMilestoneIndex="index"
                            :refundId="refundId"
                            @editMilestone="handleEditMilestone"
                            @setRefundId="refundId = $event,edithourlyindex=0.1,addNew=false"
                            @deleteMilestone="deleteMilestone"
                            :userArray="userArray"
                            :planCondition="props.planCondition"
                        />
                    </template>
                </tbody>
                <tfoot @click.stop.prevent v-if="addNew" :class="[{'pointer-event-none':isSpinner}]">
                    <HourlyMilestoneInput @sidebar="handleSidebar" :currency="currency" @addHourlyMilestone="handleAddMilestone" :billingPeriod="billingPeriod" :rangeObject="rangeObject" :disableStartEndDate="rangeArrayWeekly" :startDate="startDate" :settingMilestoneStatusAdd="settingStatus" :companyId="companyId" :projectId="projectId" />
                </tfoot>
            </table>
            <div :class="[{'pointer-event-none':isSpinner}]">
                <div class="d-flex align-items-center justify-content-between wrapper_add_amount">
                    <div class="add_new_width monthly-calendar-add" v-if="props.permissionData">
                        <button type="button" @click="handleAddNew" class="add_new cursor-pointer" :disabled="isSpinner">Add a New</button>
                    </div>
                    <div class="add_new_width" v-if="!props.permissionData"></div>
                    <div class="total_amount_width">
                        <span class="total_amount">Total Amount :- {{totalAmountRefundedForFix ? `${getCommaSeperatedNumber(fixAmountTotal)} - ${getCommaSeperatedNumber(totalAmountRefundedForFix)} =` : '' }} {{currency.symbol}} {{getCommaSeperatedNumber(totalDiffernece)}}</span>
                    </div>
                </div>
            </div>
            <ConfirmModal :modelValue="showConfirmModal" acceptButtonText="Confirm" cancelButtonText="Cancel" maxlength="150" :header="true" :showCloseIcon="false" @accept="handleConfirm" @close="showConfirmModal = false">
                <template #header><h3 class="m-0">Confirm</h3></template>
                <template #body><span>Are you sure want to delete milestone ?</span></template>
            </ConfirmModal>
        </div>
    </div>
</template>
<script setup>
    import { useStore } from "vuex";
    import {useToast} from 'vue-toast-notification';
    import { useGetterFunctions } from "@/composable";
    import ConfirmModal from '@/components/atom/Modal/Modal.vue';
    import '@/components/organisms/HourlyMilestone/HourlyMilestone.css';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import { calendar } from '@/components/organisms/HourlyMilestone/helper.js';
    import { milestoneData } from '@/components/organisms/FixMilestone/helper.js';
    import HourlyMilestoneTr from '@/components/atom/HourlyMilestoneTr/HourlyMilestoneTr.vue';
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
    import HourlyMilestoneInput from '@/components/atom/HourlyMilestoneInput/HourlyMilestoneInput.vue';
    import { ref,defineProps,computed,inject,onMounted,onUnmounted, watch,onBeforeUnmount } from 'vue';
    import { mongodbSnapshot } from '@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot';

    const $toast = useToast();
    const { getters } = useStore();
    const {getUser} = useGetterFunctions();
    const { calendarRange,calendarRangeWeekly,gettingTotalHours } = calendar();
    const { 
        addMilestoneHelper,
        editMilestoneHelper,
        cancelMilestoneHelper,
        refundMilestoneHelper,
        deleteMilestoneHelper,
        clearMilestoneHelper 
    } = milestoneData();
    //props
    const props = defineProps({
        projectDataMilestone: {type: Object,required: true},
        permissionData:{type: Boolean,default: false},
        billingPeriodHourly:{type: String,required:true},
        startDate:{type:Object,required:false},
        planCondition:{type: Boolean,default: false}
    });
    // computed
    const settingStatus = computed(() => getters['settings/projectMilestoneStatus']);
    const companyOwner = computed(() => {return getters["settings/companyOwnerDetail"]});
    const milestoneWeeklyRange = computed(() => getters["settings/milestoneweeklyrange"]);
        
    // total for refundamount
    const totalAmountRefundedForFix = computed(() =>{
        var totalRefunded = null;
        if(milestoneArray.value.length > 0){
            milestoneArray.value.forEach((val)=>{
                if(val?.refundedAmount && val.refundedAmount?.length > 0 && val.statusArray[val.statusArray.length - 1]?.milestoneStatusColor !== "CANCELLED"){
                    val.refundedAmount.forEach((temp)=>{
                        return totalRefunded += temp.amount
                    })
                }
            })
        }
        return totalRefunded 
    });
    // total amount for milestone
    const fixAmountTotal = computed(()=>{
        var sum = 0;
        if(milestoneArray.value && milestoneArray.value.length){
            milestoneArray.value.forEach(e => {
                let cancelValue = e.statusArray && e.statusArray.length > 0 ? e.statusArray[e.statusArray.length - 1].milestoneStatusColor.includes('CANCELLED') : ''
                if(cancelValue !== true){
                    sum += Number(e.amount);
                }
            });
            return (sum);
        }
        return (sum);
    });
    // total Differnece between totalamount and refundamount
    const totalDiffernece = computed(()=>{return (fixAmountTotal.value - totalAmountRefundedForFix.value)});
    // variable
    const refundId = ref('');
    const addNew = ref(false);
    const userArray = ref([]);
    const rangeObject = ref({});
    const deleteIndex = ref(0.1);
    const isSpinner = ref(false);
    const milestoneArray = ref([]);
    const detchSnapShot = ref(null);
    const rangeArrayWeekly = ref({});
    const userId = inject("$userId");
    const edithourlyindex = ref(0.1);
    const sidebarPrevent = ref(false);
    const user = getUser(userId.value);
    const showConfirmModal = ref(false);
    const deleteMilestoneName = ref('');
    const milestoneObjForDelete = ref({});
    const companyId = inject('$companyId');
    const currency = ref(props.projectDataMilestone.ProjectCurrency);
    const projectId = ref(props.projectDataMilestone._id ? props.projectDataMilestone._id : "");
    const startDate = ref(props.projectDataMilestone.StartDate ? props.projectDataMilestone.StartDate : '');
    const projectName = ref(props.projectDataMilestone.ProjectName ? props.projectDataMilestone.ProjectName : "");
    const billingPeriod = ref(props.billingPeriodHourly ? props.billingPeriodHourly : props.projectDataMilestone.BillingPeriod ? props.projectDataMilestone.BillingPeriod : '');    
    // snapshot detach
    function detach() {
        try {
            if(detchSnapShot.value !== null){
                detchSnapShot.value.return();
            }
        } catch (error) {
            console.error("ER", error);
        }
    }
    onBeforeUnmount(() => {
        detach()
    });
    // watch
    watch(()=> props.billingPeriodHourly,(newValue) =>{
        if(newValue){
            billingPeriod.value = newValue;
        }
    });
    // watch
    watch(()=> props.startDate,(newValue) =>{
        if(newValue){
            startDate.value = newValue;
        }
    });
    watch(() => props?.projectDataMilestone?._id ,(newValue,oldValue) =>{
        if(newValue !== oldValue){
            projectId.value = newValue;
            getHourlyMilestoneData();
            handleSnaphot(true);
            document.body.addEventListener('click', handleClickOutside);
        }
    })
    onMounted(() => {
        getHourlyMilestoneData();
        handleSnaphot();
        document.body.addEventListener('click', handleClickOutside);}
    );
    onUnmounted(() => {
        if(detchSnapShot.value !== null) {
            detchSnapShot.value.return();
        }
        document.body.removeEventListener('click', handleClickOutside);
    });
    
    // getting data for hourly milestone
    const getHourlyMilestoneData = async () => {
        milestoneArray.value = [];
        let obj = {
            type:'find',
            collection:'milestone',
            data:[{projectId:projectId.value}]
        }
        mongodbCrudOperations(obj).then((res)=>{
            if(res && res?.length){
                res.forEach((e) => {
                    e.startDate = e.startDate !== 0 ? new Date(e.startDate) : '';
                    e.endDate = e.endDate !== 0 ? new Date(e.endDate) : '';
                    milestoneArray.value.push(e);
                });
                milestoneArray.value.sort((a, b) => {
                    if (a.milestoneName < b.milestoneName) return -1;
                    if (a.milestoneName > b.milestoneName) return 1;
                    return 0;
                });
                gettingTotalHours(milestoneArray.value,projectId.value).then((value)=>{
                    userArray.value = value;
                });
            }else{
                milestoneArray.value = [];
            }
        });
    };
    // getting data for hourly milestone from mongo on sanpshot only the new one which is been added
    const handleSnaphot = (detach) =>{
        let options = {
            subCollection:'milestone',
            watchFilter: {
                filter: {
                    $or: [
                        {
                            'operationType': 'delete'
                        },
                        {
                            'operationType': { $in: ['insert', 'update', 'replace'] },
                            'fullDocument.projectId': projectId.value
                        }
                    ]
                }
            }
        }
        if(detach) {
            if(detchSnapShot.value !== null) {
                detchSnapShot.value.return();
                detchSnapShot.value = null;
            }
        }
        mongodbSnapshot(options,(value)=>{
            if(value.error === null){
                detchSnapShot.value = value.snap;
                if (value.type === 'insert') {
                    milestoneArray.value.push(value.data.fullDocument);
                } else if (value.type === 'update') {
                    let ind = milestoneArray.value.findIndex((x) => (x._id === value.data.fullDocument._id));
                    if(ind > -1){
                        milestoneArray.value[ind] = value.data.fullDocument;
                    }
                } else if (value.type === 'delete') {
                    let ind = milestoneArray.value.findIndex((x) => (x._id === value.data.documentKey._id));
                    if(ind > -1){
                        milestoneArray.value.splice(ind,1);
                    }
                }
                if(milestoneArray.value && milestoneArray.value?.length){
                    milestoneArray.value.sort((a, b) => {
                        if (a.milestoneName < b.milestoneName) return -1;
                        if (a.milestoneName > b.milestoneName) return 1;
                        return 0;
                    });
                    milestoneArray.value.forEach((e) => {
                        e.startDate = e.startDate !== 0 ? new Date(e.startDate) : '';
                        e.endDate = e.endDate !== 0 ? new Date(e.endDate) : '';
                    });
                    gettingTotalHours(milestoneArray.value,projectId.value).then((value)=>{
                        userArray.value = value;
                    });
                }
            }else{
                console.error("ERROR",value.error)
            }
        });
    };
    // add new click
    const handleAddNew = () => {
        if(!props?.planCondition){
            return;
        }else{
            let projectStartDate = startDate.value ? new Date(startDate.value) : '';
            if(projectStartDate){
                if(projectStartDate.getTime() > new Date().getTime()){
                    $toast.error("Start date of project should be smaller than current date",{position: 'top-right'});
                    addNew.value = false;
                }else{
                    addNew.value = true;
                    edithourlyindex.value = 0.1;
                    refundId.value = '';
                    if(billingPeriod.value === "Monthly"){
                        calendarRange(projectStartDate,milestoneArray.value,billingPeriod.value,false,'').then((value)=>{
                            if(Object.keys(value).length){
                                rangeObject.value = value;
                            }else{
                                addNew.value = false;
                                $toast.error("All the range is included in milestone",{position: 'top-right'});
                                rangeObject.value = {};
                            }
                        }).catch((err)=>{
                            console.error('err',err);
                        });
                    }else{
                        calendarRangeWeekly(projectStartDate,milestoneArray.value,milestoneWeeklyRange.value).then((value)=>{
                            if(Object.keys(value.monthlyOrweeklyRanges).length){
                                rangeArrayWeekly.value = value;
                            }else{
                                addNew.value = false;
                                $toast.error("All the range is included in milestone",{position: 'top-right'});
                                rangeArrayWeekly.value = {};
                            }
                        }).catch((err)=>{
                            console.error('err',err);
                        })
                    }
                }
            }else if(!projectStartDate){
                $toast.error("Please enter start date of project",{position: 'top-right'});
                addNew.value = false;
            }
        }
    };
    const handleSidebar = (action) => {
        sidebarPrevent.value = action
    }
    const handleAddMilestone = (action,milestoneObj,statusObj) => {
        if(action === 'clear'){
            addNew.value = false;
        }
        if (action === 'add') {
            addNew.value = false;
            isSpinner.value = true;
            user.companyOwnerId = companyOwner.value.userId
            addMilestoneHelper(projectId.value,companyId.value,user,projectName.value,milestoneObj,statusObj,true).then(() => {
                isSpinner.value = false;
            });
        }
    };
    
    const getCommaSeperatedNumber = (n)=> {
        let numVal = Number(n)
        return numVal.toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: true});
    };
    // delete mielstone emit
    const deleteMilestone = (index,name) =>{
        showConfirmModal.value = true;
        deleteIndex.value = index;
        deleteMilestoneName.value = name;
        milestoneObjForDelete.value = milestoneArray.value[index];
    };
    // api for delete milestone
    const handleConfirm = () => {
        let amount = 0;
        isSpinner.value = true;
        user.companyOwnerId = companyOwner.value.userId;
        showConfirmModal.value = false;
        if(milestoneObjForDelete.value.statusArray && milestoneObjForDelete.value.statusArray.length && milestoneObjForDelete.value.statusArray[milestoneObjForDelete.value.statusArray.length -1].milestoneStatusColor === 'CANCELLED'){
            amount = 0;
        }else if(milestoneObjForDelete.value.refundedAmount && milestoneObjForDelete.value.refundedAmount.length){
            let refundAmount = 0;
            milestoneObjForDelete.value.refundedAmount.forEach((temp)=>{
                refundAmount += temp.amount;
            });
            amount = milestoneObjForDelete.value.amount - refundAmount;
        }else{
            amount = milestoneObjForDelete.value.amount;
        }
        deleteMilestoneHelper(projectId.value,companyId.value,user,milestoneObjForDelete.value,projectName.value,true,amount).then(()=>{
            isSpinner.value = false
        }).catch((err)=>{
            console.error("ERROR",err)
        });
    };
    const handleEditMilestone = (action,val,data,status,prevMilestoneName) => {
        if(props.planCondition){
            if(action === 'edit'){
                edithourlyindex.value = val;
                addNew.value = false;
                refundId.value = '';
            }
            // edit milestone api
            if(action === 'editMil'){
                let diffamount = 0;
                let amount = 0;
                edithourlyindex.value = 0.1;
                isSpinner.value = true;
                user.companyOwnerId = companyOwner.value.userId
                let obj = [];
                let settingKey = '';
                if(status && milestoneArray.value[data].statusArray && milestoneArray.value[data].statusArray.length){
                    settingKey = milestoneArray.value[data].statusArray[milestoneArray.value[data].statusArray.length - 1].milestoneStatusColor;
                    obj = settingStatus.value.filter((e)=>{
                        return e.value === settingKey
                    });
                }else{
                    if(val.statusArray.length){
                        settingKey = val.statusArray[0].milestoneStatusColor;
                        obj = settingStatus.value.filter((e)=>{
                            return e.value === settingKey
                        });
                    }
                }
                if(val.statusArray && val.statusArray.length && val.statusArray[val.statusArray.length - 1].milestoneStatusColor === "CANCELLED"){
                    amount = 0;
                }else if(milestoneArray.value[data].statusArray && milestoneArray.value[data].statusArray.length && milestoneArray.value[data].statusArray[milestoneArray.value[data].statusArray.length - 1].milestoneStatusColor !== val.statusArray[val.statusArray.length - 1].milestoneStatusColor && milestoneArray.value[data].statusArray[milestoneArray.value[data].statusArray.length - 1].milestoneStatusColor === "CANCELLED"){
                    let refundAmount = 0;
                    val.refundedAmount.forEach((temp)=>{
                        refundAmount += temp.amount;
                    });
                    amount = val.amount - refundAmount;
                }else{
                    diffamount = milestoneArray.value[data].amount - val.amount;
                    amount = -(diffamount);
                }
                editMilestoneHelper(projectId.value,companyId.value,user,projectName.value,val,status,prevMilestoneName,obj,true,amount).then(() => {
                    isSpinner.value = false;
                });
            }
            if(action === 'clear') {
                edithourlyindex.value = 0.1;
            }
            // cancelstatus milestone api
            if(action === 'cancelstatus'){
                let amount = 0;
                isSpinner.value = true;
                user.companyOwnerId = companyOwner.value.userId
                let obj = settingStatus.value.filter((e)=>{
                    return e.value === 'CANCELLED'
                });
                status.statusArray.forEach((ele,index)=>{
                    if(ele.milestoneStatusColor === 'CANCELLED'){
                        status.statusArray.splice(index,1);
                    }
                });
                status.statusArray.push({
                    statusDateValue: new Date(),
                    milestoneStatusColor:obj[0].value
                });
                if(status.refundedAmount && status.refundedAmount.length){
                    let refundAmount = 0;
                    status.refundedAmount.forEach((temp)=>{
                        refundAmount += temp.amount;
                    });
                    amount = status.amount - refundAmount;
                }else{
                    amount = status.amount;
                }
                cancelMilestoneHelper(projectId.value,companyId.value,user,projectName.value,status,obj,true,amount).then(() => {
                    isSpinner.value = false;
                });
            }
            // api for refund milestone
            if(action === "refund"){
                isSpinner.value = true;
                user.companyOwnerId = companyOwner.value.userId
                milestoneArray.value[val].refundedAmount.push({
                    'amount':Number(data),
                    'date':status
                });
                refundMilestoneHelper(projectId.value,companyId.value,milestoneArray.value[val],true,data).then(() => {
                    isSpinner.value = false;
                });
            }
            // api for clear milestone status
            if(action === "clearStatus"){
                edithourlyindex.value = 0.1;
                isSpinner.value = true;
                user.companyOwnerId = companyOwner.value.userId;
                clearMilestoneHelper(projectId.value,companyId.value,user,projectName.value,status).then(() => {
                    isSpinner.value = false;
                });
            }
        }
    }
    const handleClickOutside = (event) => {
        if(addNew.value && !event.target.closest('.monthly-calendar-add') && !sidebarPrevent.value) {
            addNew.value = false;
        }else{
            sidebarPrevent.value = false;
        }
    };
</script>