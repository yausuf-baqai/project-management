<template>
    <SpinnerComp :is-spinner="loading" />
    <div class="milestone-report-wrapper" v-if="!loading" :class="[{'error_404':!error404}]">
        <div v-if="error404">
            <div v-if="!currentCompany?.planFeature?.milstoneReport">
                <UpgradePlan
                    buttonText="Upgrade Your Plan"
                    lastTitle="To Unlock Milestone Report"
                    secondTitle="Unlimited"
                    firstTitle="Upgrade To"
                    message="That feature isn’t available on your current plan"
                />
            </div>
            <div :class="[{'pointer-event-none opacity-5 blur-3-px':!currentCompany?.planFeature?.milstoneReport}]">
                <div class="product_top_bar d-flex justify-content-between align-items-center">
                    <div class="product_top_bar_left milestone-report-backarrow d-flex align-items-center">
                        <div class="prev_mile_report padding_right_report">
                            <router-link to="/">
                                <img src="../../assets/images/svg/Home.svg" alt="backarrow" />
                            </router-link>
                        </div>
                        <div class="breadcrumb d-flex align-items-center">
                            <div class="pipeline padding_right_report" v-if="clientWidth > 767">
                                <router-link class="milestone_reports_family blue text-decoration-underline" :to="`/${companyId}/project`" >Back to Projects</router-link>
                                <!-- <a href="#" >Back to Projects</a> -->
                            </div>
                            <div class="pipeline padding_right_report">
                                <span class="milestone_reports_family black">Milestone Reports</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="filter_table_wrapper">
                    <div class="dateFilterWrapper">
                        <div class="filterSection">
                            <div class="wf_filter" @click.stop="$refs.filter_ut_click_empty.click()">
                                <span class="timesheet_user_filter">
                                    <DropDown id="FilterDropDownSheet" :title="`status`" :dropDownClass="true" class="status_change_dropdown">
                                        <template #button>
                                            <button class="btn-white border cursor-pointer dot-btn" ref="filter_ut_click_empty">
                                                <a href="#" class="link_disable_css">Filter by Status</a>
                                            </button>
                                        </template>
                                        <template #head v-if="clientWidth > 767">
                                            <div class="statusHeader">
                                                <span>Status</span>
                                            </div>
                                        </template>
                                        <template #options>
                                            <template v-for="(status,index) in settingStatusFilter && settingStatusFilter.length ? settingStatusFilter : settingNotFound" :key="index">
                                                <DropDownOption @click="handleFilter(status,index,'add')">
                                                    <span>{{status.name}}</span>
                                                </DropDownOption>
                                            </template>
                                        </template>
                                    </DropDown>
                                </span>
                                <span class="d-flex style-scroll mr-40px overflow-auto">
                                    <span v-for="(chip,chipKey) in selectedFilters" :key="chipKey" class="chipusername_wrapper">
                                        <span @click.stop.prevent class="user_name" :title="chip.name">
                                            {{chip.name}}
                                        </span>
                                        <button @click.stop.prevent="handleFilter(chip,chipKey,'remove')" type="button" class="btn-close vs-chip--close cursor-pointer">
                                            <img src="@/assets/images/cancel.png" alt="cancel"/>
                                        </button>
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="milestone_table_filter_wrapper">
                        <div>
                            <table class="milestone-report-table">
                                <thead>
                                    <MilestoneReportThead
                                        @yearEmit="getYearData"
                                        @monthDate="handleMonthDate"
                                    />
                                </thead>
                                <tbody class="border_left_right">
                                    <template v-if="objectProjectCurrency && Object.keys(objectProjectCurrency).length">
                                        <template v-for="(value,index) in objectProjectCurrency" :key="index">
                                            <MilestoneReportTbody
                                                :objectProjectCurrencyBody="value"
                                                :index="index"
                                                :daysOrMonth="daysOrMonth"
                                                :yearSelected="startDateFilter ? startDateFilter : `${new Date().getFullYear()}`"
                                            />
                                        </template>
                                    </template>
                                    <template v-else>
                                        <tr>
                                            <td class="border_none">no record found</td>
                                        </tr>
                                    </template>
                                </tbody>
                                <tfoot>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="h-100">
            <NotFound />
        </div>
    </div>
</template>

<script setup>
    //import
    import { useStore } from "vuex";
    import { useCustomComposable, useGetterFunctions } from '@/composable';
    import { ref,inject,computed, watch, onMounted } from 'vue';
    import '@/views/MilestoneReport/MilestoneReport.css';
    import MilestoneReportThead from '@/components/atom/MilestoneReportThead/MilestoneReportThead.vue'
    import MilestoneReportTbody from '@/components/atom/MilestoneReportTbody/MilestoneReportTbody.vue'
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import DropDown from '@/components/molecules/DropDown/DropDown.vue'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
    import NotFound from '../NotFound.vue'
    import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
    // getter and permission
    const { getters,dispatch} = useStore();
    const { checkPermission } = useCustomComposable();
    // computed
    const currentCompany = computed(() => getters["settings/selectedCompany"])
    const projectsGetter = computed(() => getters["projectData/allProjects"]);
    const companyUserDetail = computed(() => getters["settings/companyUserDetail"]);
    const settingStatus = computed(() => getters['settings/projectMilestoneStatus']);
    const settingStatusFilter = ref(settingStatus.value);
    // watch
    watch(settingStatus, (val) => {
        settingStatusFilter.value = JSON.parse(JSON.stringify(val.filter((x) => x.value !== 'CANCELLED' && x.value !== "REFUNDED").sort((a, b) => {if (a.value < b.value) return -1;if (a.value > b.value) return 1;return 0;})));
    });
    // inject
    const clientWidth = inject("$clientWidth");
    const companyId = inject('$companyId');
    // Variable 
    const projects = ref([]);
    const loading = ref(false);
    const objectProjectCurrency = ref({});
    const daysOrMonth = ref([]);
    const settingNotFound =ref([{'name':'no Filter'}]);
    const selectedFilters = ref([]);
    const statusNameArray = ref([]);
    const endDateFilter = ref('');
    const startDateFilter = ref('');
    const error404 = ref(true);
    onMounted(()=>{
        settingStatusFilter.value = JSON.parse(JSON.stringify(settingStatus.value.filter((x) => x.value !== 'CANCELLED' && x.value !== "REFUNDED").sort((a, b) => {if (a.value < b.value) return -1;if (a.value > b.value) return 1;return 0;})));
        if(checkPermission('sheet_settings.milestone_report') !== null){
            getAllData();
        }else{
            error404.value = false;
        }
    })
    const {getTeamsData} = useGetterFunctions();

    const getAllData = (startFilter,endFilter) => {
        loading.value = true;
        if(!projectsGetter.value || !Object.keys(projectsGetter.value).length) {
            getTeamsData().then((response) => {
                const uid = companyUserDetail.value.userId;
                const filterteam = response.filter((x) => x.assigneeUsersArray.indexOf(uid) !== -1);
                const teamIds = filterteam.map((x) => 'tId_'+x._id);
                let publicQuery = {
                    isPrivateSpace:false
                }
                if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2 && !getters["settings/rules"].toggle.showAllProjects) {
                    publicQuery.AssigneeUserId = {
                        $in:[uid]
                    }
                    if (teamIds && teamIds.length) {
                        publicQuery.AssigneeUserId.$in = [...publicQuery.AssigneeUserId.$in.concat(teamIds)]
                    }
                }
                let privateQuery = {
                    isPrivateSpace:true
                }
                if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2) {
                    privateQuery.AssigneeUserId = {
                        $in:[uid]
                    }
                    if (teamIds && teamIds.length) {
                        privateQuery.AssigneeUserId.$in = [...privateQuery.AssigneeUserId.$in.concat(teamIds)]
                    }
                }
                const roleType = companyUserDetail.value.roleType;
                if(checkPermission('project.project_list') !== null) {
                    dispatch("projectData/setProjects", {
                        publicQuery,
                        privateQuery,
                        roleType,
                        uid
                    }).then(()=>{
                        projects.value = projectsGetter.value?.data && projectsGetter.value?.data?.length ? JSON.parse(JSON.stringify(projectsGetter.value.data)) : [];
                        projects.value = projects.value.filter((x) => !x.isRestrict);
                        if(projects.value && projects.value.length){
                            const fetchData = (element) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        let startDate = new Date(`01-jan-${startFilter ? startFilter : new Date().getFullYear()}`).setHours(0,0,0);
                                        let endDate = new Date(`31-dec-${endFilter ? endFilter : new Date().getFullYear()}`).setHours(23,59,59);
                                        let cancel = 'CANCELLED'
                                        const mongoQuery = [
                                            {
                                                $match: {
                                                    $or: [
                                                        {
                                                            $and :[
                                                                { statusDate: { $gt: startDate }},
                                                                { statusDate: {$lt: endDate}},
                                                                {projectId: {$in: element.map(e=>e._id)}},
                                                                {statusId:{ $ne: cancel }}
                                                            ]
                                                        },
                                                        {
                                                            $and : [
                                                                {minRefundDate:{$lt: endDate}}, 
                                                                {maxRefundDate:{ $gt: startDate}}, 
                                                                {projectId: {$in: element.map(e=>e._id)}},
                                                                {statusId:{ $ne: cancel }}
                                                            ] 
                                                        }
                                                    ]
                                                }
                                            }
                                        ];
                                        let obj = {
                                            type:'aggregate',
                                            collection:'milestone',
                                            data:[mongoQuery]
                                        }
                                        mongodbCrudOperations(obj).then((result)=>{
                                            if(result && result?.length){
                                                try {
                                                    const uniqueValues = new Set();
                                                    objectProjectCurrency.value = {};
                                                    element.forEach(object => {
                                                        let obj = object
                                                        obj.milestoneArray = result.filter((e)=>{return e.projectId === object._id}) || [];
                                                        if (obj && obj.ProjectCurrency && Object.keys(obj.ProjectCurrency).length) {
                                                            const fieldValue = obj.ProjectCurrency.name;
                                                            if (!uniqueValues.has(fieldValue)) {
                                                                objectProjectCurrency.value = {
                                                                    ...objectProjectCurrency.value,
                                                                    [`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`]: {
                                                                        'projectDeatil': [obj],
                                                                        'allMilestoneArray':obj.milestoneArray,
                                                                        'currencySymbol':obj.ProjectCurrency.symbol
                                                                    }
                                                                }
                                                                uniqueValues.add(fieldValue);
                                                            }else{
                                                                objectProjectCurrency.value[`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`].projectDeatil.push(obj);
                                                                objectProjectCurrency.value[`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`].allMilestoneArray = objectProjectCurrency.value[`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`].allMilestoneArray.concat(obj.milestoneArray) ;
                                                            }
                                                        }
                                                    });
                                                    loading.value = false;
                                                    resolve();
                                                }catch(error){
                                                    loading.value = false;
                                                    reject()
                                                    console.error("error",error)
                                                }
                                            }else{
                                                loading.value = false;
                                                reject();
                                            }
                                        }).catch(()=>{
                                            loading.value = false;
                                            reject();
                                        });
                                    } catch (error) {
                                        loading.value = false;
                                        console.error(error)
                                        reject()
                                    }
                                })
                            }
                            fetchData(projects.value).catch((error)=>{
                                loading.value = false;
                                console.error(error)
                            })
                        } else {
                            loading.value = false;
                        }
                    })
                    .catch((error) => {
                        loading.value = false;
                        console.error("ERROR in setProjects: ", error);
                    })
                }
            }).catch((error) => {
                loading.value = false;
                console.error(error,"ERROR IN GET TEAMS DATA");
            });
        } else {
            projects.value = projectsGetter.value?.data && projectsGetter.value?.data?.length ? JSON.parse(JSON.stringify(projectsGetter.value.data)) : [];
            projects.value = projects.value.filter((x) => !x.isRestrict);
            if(projects.value && projects.value.length){
                mongoGetData(startFilter,endFilter);
            }
            loading.value = false;
        }
    };
    const mongoGetData = (startFilter,endFilter) => {
        const fetchData = (element) => {
            return new Promise((resolve, reject) => {
                try {
                    let startDate = new Date(`01-jan-${startFilter ? startFilter : new Date().getFullYear()}`).setHours(0,0,0);
                    let endDate = new Date(`31-dec-${endFilter ? endFilter : new Date().getFullYear()}`).setHours(23,59,59);
                    let mongoQuery = []
                    if(statusNameArray.value && statusNameArray.value.length){
                        mongoQuery = [
                            {
                                $match: {
                                    $or: [
                                        {
                                            $and :[
                                                { statusDate: { $gt: startDate }},
                                                { statusDate: {$lt: endDate}},
                                                {projectId: {$in : element.map(e=>e._id)}},
                                                {statusId:{ $in: statusNameArray.value }}
                                            ]
                                        },
                                        {
                                            $and : [
                                                {minRefundDate:{$lt: endDate}}, 
                                                {maxRefundDate:{ $gt: startDate}}, 
                                                {projectId: {$in : element.map(e=>e._id)}},
                                                {statusId:{ $in: statusNameArray.value }}
                                            ] 
                                        }
                                    ]
                                }
                            }
                        ];
                    }else{
                        let cancel = 'CANCELLED'
                        mongoQuery = [
                            {
                                $match: {
                                    $or: [
                                        {
                                            $and :[
                                                { statusDate: { $gt: startDate }},
                                                { statusDate: {$lt: endDate}},
                                                {projectId: {$in : element.map(e=>e._id)}},
                                                {statusId:{ $ne: cancel }}
                                            ]
                                        },
                                        {
                                            $and : [
                                                {minRefundDate:{$lt: endDate}}, 
                                                {maxRefundDate:{ $gt: startDate}}, 
                                                {projectId: {$in : element.map(e=>e._id)}},
                                                {statusId:{ $ne: cancel }}
                                            ] 
                                        }
                                    ]
                                }
                            }
                        ];
                    }
                    let obj = {
                        type:'aggregate',
                        collection:'milestone',
                        data:[mongoQuery]
                    }
                    mongodbCrudOperations(obj).then((result)=>{
                        if(result && result?.length){
                            try {
                                const uniqueValues = new Set();
                                objectProjectCurrency.value = {};
                                element.forEach(object => {
                                    let obj = object
                                    obj.milestoneArray = result.filter((e)=>{return e.projectId === object._id}) || [];
                                    if (obj && obj.ProjectCurrency && Object.keys(obj.ProjectCurrency).length) {
                                        const fieldValue = obj.ProjectCurrency.name;
                                        if (!uniqueValues.has(fieldValue)) {
                                            objectProjectCurrency.value = {
                                                ...objectProjectCurrency.value,
                                                [`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`]: {
                                                    'projectDeatil': [obj],
                                                    'allMilestoneArray':obj.milestoneArray,
                                                    'currencySymbol':obj.ProjectCurrency.symbol
                                                }
                                            }
                                            uniqueValues.add(fieldValue);
                                        }else{
                                            objectProjectCurrency.value[`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`].projectDeatil.push(obj);
                                            objectProjectCurrency.value[`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`].allMilestoneArray = objectProjectCurrency.value[`${obj.ProjectCurrency.symbol} - ${obj.ProjectCurrency.code}`].allMilestoneArray.concat(obj.milestoneArray) ;
                                        }
                                    }else{
                                        objectProjectCurrency.value = {};
                                    }
                                });
                                loading.value = false;
                                resolve();
                            }catch(error){
                                loading.value = false;
                                reject()
                                console.error("error",error)
                            }
                        }else{
                            loading.value = false;
                            reject();
                        }
                    }).catch(()=>{
                        loading.value = false;
                        reject();
                    });
                } catch (error) {
                    loading.value = false;
                    console.error(error)
                    reject()
                }
            })
        }
        fetchData(projects.value).catch((error)=>{
            loading.value = false;
            console.error(error)
        });
    };
    const getYearData = (startFilter,endFilter) => {
        startDateFilter.value = startFilter;
        endDateFilter.value = endFilter;
        getAllData(startFilter,endFilter);
    };
    const handleMonthDate = (value) => {
        daysOrMonth.value = value;
    };
    const handleFilter = (ele,ind,action) => {
        if(ele.name == "no Filter"){
            return;
        }
        if(action === 'add'){
            let statusWithoutFilter = settingStatusFilter.value.filter((x) => x.value !== ele.value);
            settingStatusFilter.value = statusWithoutFilter
            selectedFilters.value.push(ele);
            statusNameArray.value.push(ele.value);
        }else{
            settingStatusFilter.value.push(ele);
            let selectStatus = selectedFilters.value.filter((x) => x.value !== ele.value);
            selectedFilters.value = selectStatus
            statusNameArray.value.splice(ind,1);
        }
        settingStatusFilter.value.sort((a, b) => {if (a.value < b.value) return -1;if (a.value > b.value) return 1;return 0;});
        mongoGetData(startDateFilter.value,endDateFilter.value);
    };
</script>
<style scoped>
.dateFilterWrapper{
    cursor:text!important;
}
</style>