<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div v-if="checkPermission('settings.settings_custom_field') !== null">
        <div v-if="!currentCompany?.planFeature?.customFields">
            <UpgradePlan 
                buttonText="Upgrade Your Plan"
                lastTitle="To Unlock Custom Field"
                secondTitle="Unlimited"
                firstTitle="Upgrade To"
                message="That feature isn’t available on your current plan"
            />
        </div>
        <div v-if="!isSpinner" :class="[{'pointer-event-none opacity-5 blur-3-px':!currentCompany?.planFeature?.customFields}]">
            <div class="addcustomfield-btn d-flex mb-20px justify-content-between">
                <InputText
                    v-model.trim="search"
                    placeHolder="Search"
                    autocomplete="off"
                    class="form-control"
                    type="text"
                    @keyup="handleSearch"
                    :width="'392px'"
                />
                <button v-if="checkPermission('settings.settings_custom_field') === true" class="btn btn-primary" @click="emit('isVisible')">+ Add New Custom Field</button>
            </div>
            <div v-if="finalCustomFieldData && finalCustomFieldData.length" class="custom-field__table-wrapper">
                <div class="custome-field-table style-scroll w-full">
                    <table border>
                        <thead>
                            <tr>
                                <th class="">Field Name</th>
                                <th class="">Date Created</th>
                                <th class="">Type</th>
                                <th class="">Created by</th>
                                <th class="">Projects</th>
                                <th v-if="checkPermission('settings.settings_custom_field') !== null" class="">Status</th>
                                <th class=""></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in finalCustomFieldData" :key="index" :class="[{'disable':!item.isDelete}]">
                                <td>
                                    <span class="field__title text-capitalize">{{item?.fieldTitle}}</span>
                                </td>
                                <td>
                                    <span>{{convertDateFormat(item?.createdAt,'',{showDayName: false})}}</span>
                                </td>
                                <td>
                                    <span class="type d-flex" :style="[{background:item?.fieldBackgroundColor}]">
                                        <img :src="item.fieldImage" style="height:12px;width:12px" />
                                        <span class="text-capitalize pl-5px" :style="[{color:item?.fieldPrimaryColor}]">{{item?.fieldType}}</span>
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center created_by">
                                        <UserProfile :data="{title: getUser(item?.userId)?.Employee_Name, image: (getUser(item?.userId)?.Employee_profileImageURL)}" width="30px" :showDot="false" :thumbnail="'30x30'"/>
                                        <span class="text-capitalize pl-5px">{{getUser(item?.userId)?.Employee_Name}}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="project_bg GunPowder font-size-13">{{item?.global ? 'All Projects' : projectList?.find((e) => e._id === item.projectId) ? projectList?.find((e) => e._id === item.projectId)?.ProjectName : 'N/A'}}</span>
                                </td>
                                <td v-if="checkPermission('settings.settings_custom_field') !== null">
                                    <span>
                                        <Toggle :disabled="checkPermission('settings.settings_custom_field') !== true || currentCompany?.planFeature?.customFields === false" v-model="item.isDelete" width="34" activeColor="rgba(78, 209, 100, 1)" @click="deleteField(item._id,item?.isDelete)"/>
                                    </span>
                                </td>
                                <td>
                                    <span class="cursor-pointer edit__item" v-if="item.isDelete && checkPermission('settings.settings_custom_field') === true && currentCompany?.planFeature?.customFields === true" @click="handleEditCustomField(item)">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.86644 0.365642C10.3535 -0.121881 11.1465 -0.121881 11.634 0.365642C11.8699 0.601556 12 0.915575 12 1.24959C12 1.5836 11.8699 1.89763 11.634 2.13312L10.942 2.82519L9.17449 1.0576L9.86644 0.365642Z" fill="#818181"/>
                                            <path d="M4.68792 5.54428C4.65292 5.57925 4.62948 5.6238 4.61942 5.67174L4.26601 7.4399C4.24948 7.52183 4.27551 7.60633 4.33442 7.66581C4.38196 7.71334 4.44594 7.73878 4.51149 7.73878C4.52746 7.73878 4.54399 7.73734 4.56051 7.73384L6.32802 7.38036C6.37695 7.37027 6.42145 7.34684 6.45598 7.31176L10.412 3.35566L8.64447 1.58818L4.68792 5.54428Z" fill="#818181"/>
                                            <path d="M9.49992 5.99978C9.22342 5.99978 9 6.22385 9 6.49977V10.4999C9 10.7755 8.77594 10.9999 8.49998 10.9999H1.49995C1.224 10.9999 1.00002 10.7755 1.00002 10.4999V3.49971C1.00002 3.22419 1.224 2.99972 1.49995 2.99972H5.49998C5.77649 2.99972 6 2.77566 6 2.49968C6 2.22366 5.77649 1.99965 5.49998 1.99965H1.49995C0.673024 1.99965 0 2.67266 0 3.49971V10.4999C0 11.327 0.673024 12 1.49995 12H8.49998C9.327 12 10 11.327 10 10.4999V6.49977C10 6.22327 9.77643 5.99978 9.49992 5.99978Z" fill="#818181"/>
                                        </svg>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-if="finalCustomFieldData.length <= 0 && currentCompany?.planFeature?.customFields === true" class="custom__field-error">
                <div class="position-ab">
                    <img src="@/assets/images/svg/No-Search-Result.svg" alt="aliansoftware"/>
                    <div class="error-text text-center">
                        <h2>No data found</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="d-flex align-items-center justify-content-center customField__accesdenied">
        <img :src="accesDenied">
    </div>
</template>

<script setup>
    // components
    import { useStore } from 'vuex';
    import { useConvertDate,useCustomComposable, useGetterFunctions } from "@/composable";
    import Toggle from "@/components/atom/Toggle/Toggle.vue"
    import InputText from "@/components/atom/InputText/InputText.vue";
    import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';

    //utils
    import { dbCollections } from "@/utils/FirebaseCollections";
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";

    // packages
    import { ref, watch,computed,onMounted } from 'vue'
    import { useToast } from 'vue-toast-notification';
    import { BSON } from "realm-web";
    // store
    const toast = useToast();
    const {dispatch,getters} = useStore();
    const { convertDateFormat } = useConvertDate();
    const { checkPermission } = useCustomComposable();
    //require 
    const accesDenied = require("@/assets/images/access_denied_img.png");
    //props
    const props = defineProps({
        finalCustomFields:{
            type:Array,
            default:() => {}
        }
    });
    // emit
    const emit = defineEmits(['editCustomField','isVisible']);

    //ref
    const search = ref('');
    const projectList = ref([]);
    const isSpinner = ref(false);
    const finalCustomFieldData = ref(props.finalCustomFields || []);
    
    //watch
    watch(()=> props.finalCustomFields,(val)=>{
        finalCustomFieldData.value = val
    });

    // computed
        const projectsGetter = computed(() => getters["projectData/allProjects"]);
    const currentCompany = computed(() => getters["settings/selectedCompany"]);
    const companyUserDetail = computed(() => getters["settings/companyUserDetail"]);
    const showCustomField = computed(() => checkPermission("settings.settings_custom_field", true, {gettersVal: getters}))

    const {getTeamsData, getUser} = useGetterFunctions();

    // mounted
    onMounted(()=>{
        try{
            if(!projectsGetter.value || !Object.keys(projectsGetter.value).length) {
                getTeamsData().then((response) => {
                    isSpinner.value = true;
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
                    dispatch('projectData/setProjects', {publicQuery, privateQuery, roleType,uid})
                    .then(() => {
                        projectList.value = projectsGetter.value.data;
                        isSpinner.value = false;
                    })
                    .catch((error)=>{
                        isSpinner.value = false;
                        console.error(error);
                    })
                }).catch((error) => {
                    console.error(error,"ERROR IN GET TEAMS DATA");
                });
            } else {
                projectList.value = projectsGetter.value.data;
                isSpinner.value = false;
            }
        } catch(err){
            console.error('ERROR',err);
            isSpinner.value = false;
        }
    });
    // soft delete
    const deleteField = (id,val) =>{
        if(showCustomField.value === true && currentCompany.value?.planFeature?.customFields === true){
            let getQuery = {
                type : "updateOne",
                collection : dbCollections.CUSTOM_FIELDS,
                data: [
                    {
                        _id: BSON.ObjectId(id)
                    },
                    {
                        $set:{isDelete:val}
                    }
                ]
            }
            mongoQuery.mongodbCrudOperations(getQuery).then(() => {
                if(val){
                    toast.success("Field Enable Successfully", {position: 'top-right' });
                }else{
                    toast.success("Field Disable Successfully", {position: 'top-right' });
                }
            }).catch((error) => {
                toast.error(error,{position: 'top-right' })
            })
        }
    };

    const handleEditCustomField = (item) => {
        if(showCustomField.value === true && currentCompany.value?.planFeature?.customFields === true){
            emit('editCustomField',item);
        }
    };
    
    const handleSearch = () => {
        if(currentCompany.value?.planFeature?.customFields === true){
            finalCustomFieldData.value = props.finalCustomFields;
            if(search.value){
                const filters = finalCustomFieldData.value.filter(x => x.fieldTitle.toLowerCase().includes(search.value.toLowerCase()));
                finalCustomFieldData.value = filters;
            }
        }
    };
</script>
<style scoped src="./style.css"></style>
