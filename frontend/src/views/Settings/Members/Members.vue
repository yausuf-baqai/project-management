<!--
    IMPORTANT NOTE: 

    IF YOU HAVE CHANGES IN THIS FILE, PLEASE VERIFY THE CHANGES BECAUSE THIS FILE IS CONNECTED TO THE PAYMENT MODULE.
    AND YOUR CHANGES ARE REQUIRED. ALSO ADD YOUR CHANGES TO THE 'CHARGEBEE-SETUP' AND 'PADDLE-SETUP' FOLDER.
-->
<template>
    <div class="member-management-settings projectPeopleMain p-1">
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <div v-if="
            (checkPermission('settings.settings_role_management') !== null &&
            checkPermission('settings.settings_designation') !== null && checkPermission('settings.settings_member_list') === true)
        ">
            <form class="d-flex align-items-center justify-content-between">
                <div v-if="checkPermission('settings.settings_member_list') !== null" class="searchByEmail">
                    <InputText
                        placeholder="Search by name or email"
                        :isOutline="false"
                        :modelValue="searchField"
                        class="searchByEmail"
                        @update:modelValue="assignSearchField"
                    />
                </div>
                <div class="form-mianDiv d-flex align-items-center position-re" v-if="checkPermission('settings.settings_invite_member') === true && checkPermission('settings.settings_member_list') === true">
                    <InputText
                        placeholder="Invite by email"
                        class="invireByEmail"
                        :isOutline="false"
                        v-model="formData.email.value"
                        @input="formData.email.value = formData.email.value.toLowerCase()"
                        @keyup="checkErrors({'field':formData.email,
                        'name':formData.email.name,
                        'validations':formData.email.rules,
                        'type':formData.email.type,
                        'event':$event.event})"
                    />
                    <div class="invalid-feedback red position-ab">{{formData.email.error}}</div>
                    <DropDown :bodyClass="{'members-dropdown' : true}" :id="designationKey" class="dropdownMember member__rol-one" v-if="checkPermission('settings.settings_designation') !== null">
                        <template #button>
                            <div class="d-flex text-ellipsis text-nowrap">
                                <div class="font-size-16 text-ellipsis text-nowrap d-block color94" :ref="designationKey" @click="openDesignationEditor()">
                                    {{designationArr && designation !== null && designationArr.filter((x) => x.key === designation).length ? designationArr.filter((x) => x.key === designation)[0].name : "Select designation"}}
                                </div>
                                <img :src="arrowIcon" alt="arrowIcon" class="arrowIcon">
                            </div>
                        </template>
                        <template #head>
                            <div class="search-box-member">
                                <input type="text" class="search_box" placeholder="Search" v-model="desSearch">
                            </div>
                        </template>
                        <template #options>
                            <span v-if="desSearch.length > 0 && searchDesignationArr.length === 0" class="no-data">No Data found</span>
                            <DropDownOption
                                v-for="(desObj, index) in desSearch === '' ? designationArr : searchDesignationArr"
                                :key="'user'+index" 
                                @click="designation = desObj.key"
                                :class="{'border-top': desObj.key === null}">
                                <div class="w-95 m-7px"  :title="desObj.label" :class=" desObj.key == null ? 'main_roleName  AddNow_designation' : ' main_roleName' ">
                                    <div v-if="desObj.key !== null">
                                        <div v-if="!desObj.showDesignationInput" class="roleName  text-ellipsis d-flex justify-content-between" @click="$refs[designationKey].click()">
                                            <span class="text-ellipsis mw-50">{{ desObj.label }}</span>
                                            <span class="edit text-ellipsis mw-50">
                                                <img v-if="desObj.key !== null && checkPermission('settings.settings_designation') === true" class="erp_app" :src="editImg" alt="edit" @click.stop.prevent="openDesignationEditor(desObj.key)">
                                                <img v-if="desObj.key !== null && checkPermission('settings.settings_designation') === true" class="erp_app ml-10px" :src="deleteIcon" alt="delete" @click.stop.prevent="deleteDesignation(desObj)">
                                            </span> 
                                        </div>
                                        <div v-else class="d-flex justify-content-between position-re">
                                            <span class="w-100">
                                                <InputText :isOutline="false" placeholder="Enter designation" v-model="designationName" @enter="desObj.showDesignationInput = false,handleDesignationChanges(desObj.key === null ? 'add' : 'update', desObj.key,designationName,designations,designationArr,null)" />
                                            </span>
                                            <span class="position-ab bg-white pl-15px pr-15px update__wrapper" :style="[{height : clientWidth > 767 ? '24px' : '30px' }]">
                                                <img class="position-re green__icon" :style="[{top : clientWidth > 767 ? '5px' : '2px' }]" :src="greenmark" alt="greenmark" @click.stop.prevent="desObj.showDesignationInput = false,handleDesignationChanges(desObj.key === null ? 'add' : 'update', desObj.key,designationName,designations,designationArr,index)">
                                                <img class="position-re close__icon" :style="[{top : clientWidth > 767 ? '5px' : '2px' }]" :src="helpClose" alt="Close" @click.stop.prevent="desObj.showDesignationInput = false">
                                            </span>
                                        </div>
                                    </div>
                                    <div v-if="checkPermission('settings.settings_designation') === true && desObj.key === null" @click.stop.prevent="openDesignationEditor(desObj.key), designation = ''">
                                        <span v-if="!desObj.showDesignationInput" class="roleName text-ellipsis addNewRole blue">{{ desObj.label }}</span>
                                        <div v-else class="d-flex justify-content-between position-re">
                                            <span class="w-100">
                                                <InputText :isOutline="false" placeholder="Enter designation" v-model="designationName" @enter="desObj.showDesignationInput = false,handleDesignationChanges(desObj.key === null ? 'add' : 'update', desObj.key,designationName,designations,designationArr,index)" />
                                            </span>
                                            <span class="position-ab bg-white pl-15px pr-15px update__wrapper" :style="[{height : clientWidth > 767 ? '24px' : '30px' }]">
                                                <img class="position-re green__icon" :style="[{top : clientWidth > 767 ? '5px' : '2px' }]" :src="greenmark" alt="greenmark" @click.stop.prevent="desObj.showDesignationInput = false,handleDesignationChanges(desObj.key === null ? 'add' : 'update', desObj.key,designationName,designations,designationArr,index)">
                                                <img class="position-re close__icon" :style="[{top : clientWidth > 767 ? '5px' : '2px' }]" :src="helpClose" alt="Close" @click.stop.prevent="desObj.showDesignationInput = false">
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </DropDownOption>
                        </template>
                    </DropDown>
                    <DropDown :bodyClass="{'members-dropdown-roll' : true}" :id="roleKey" class="dropdownMember members-dropdown-load" v-if="checkPermission('settings.settings_role_management') !== null">
                        <template #button>
                            <div class="d-flex text-ellipsis text-nowrap">
                                <div :ref="roleKey" class="font-size-16 text-ellipsis text-nowrap d-block color94" @click="openRoleEditor()">
                                    {{roles && role !==null && roles.filter((x) => x.key === role).length ? roles.filter((x) => x.key === role)[0].name : "Select role"}}
                                </div>
                                <img :src="arrowIcon" alt="arrowIcon" class="arrowIcon">
                            </div>
                        </template>
                        <template #options>
                            <DropDownOption
                                v-for="(roleObj, index) in roles"
                                :key="'user'+index"
                                @click="role = roleObj.key"
                                :class="{'border-top':roleObj.key == null}"
                            >
                                <div class="w-95 m-2px" :title="roleObj.label"  :style="roleObj.key == null ?'width: 100%;' :'' " :class=" roleObj.key == null ? 'main_roleName  AddNow_roll' : ' main_roleName' ">
                                    <div v-if="roleObj.key !== null" >
                                        <div v-if="!roleObj.showRoleInput" class="text-ellipsis roleName d-flex justify-content-between" @click="$refs[roleKey].click()">
                                            <span class="text-ellipsis mw-62">
                                                {{ roleObj.label }}
                                            </span>
                                            <span class="text-ellipsis mw-38">
                                                <img v-if="![null, 1, 2, 3].includes(roleObj.key) && checkPermission('settings.settings_role_management') === true" class="erp_app" :src="editImg" alt="edit" @click.stop.prevent="openRoleEditor(roleObj.key)">
                                                <img v-if="![null, 0, 1, 2, 3].includes(roleObj.key) && checkPermission('settings.settings_role_management') === true" class="erp_app ml-10px" :src="deleteIcon" alt="edit" @click.stop.prevent="deleteRole(roleObj)">
                                            </span>
                                        </div>
                                        <div v-else class="d-flex justify-content-between position-re">
                                            <InputText :isOutline="false" placeholder="Enter role" v-model="roleName" @enter="roleObj.showRoleInput = false,handleRoleChanges(roleObj.key === null ? 'add' : 'update', roleObj.key,null,roleName,roles,rolesGetter)" />
                                            <span class="position-ab bg-white pl-15px pr-15px green__close-wrapper" :style="[{height : clientWidth > 767 ? '24px' : '30px' }]">
                                                <img class="position-re green__icon-img" :style="[{top : clientWidth > 767 ? '7px' : '2px' }]" :src="greenmark" alt="edit" @click.stop.prevent="roleObj.showRoleInput = false,handleRoleChanges(roleObj.key === null ? 'add' : 'update', roleObj.key, index,roleName,roles,rolesGetter)">
                                                <img class="position-re close__icon" :style="[{top : clientWidth > 767 ? '7px' : '2px' }]" :src="helpClose" alt="edit" @click.stop.prevent="roleObj.showRoleInput = false">
                                            </span>
                                        </div>
                                    </div>
                                    <div v-if="checkPermission('settings.settings_role_management') === true && roleObj.key === null">
                                        <span v-if="!roleObj.showRoleInput" class="text-ellipsis roleName addNewRole blue" @click.stop.prevent="() => {openRoleEditor(roleObj.key); $forceUpdate()}">{{roleObj.label}}</span>
                                        <span v-else class="d-flex justify-content-between position-re">
                                            <InputText :isOutline="false" placeholder="Enter role" v-model="roleName" @enter="roleObj.showRoleInput = false,handleRoleChanges(roleObj.key === null ? 'add' : 'update', roleObj.key, index,roleName,roles,rolesGetter)" />
                                            <span class="position-ab bg-white pl-15px pr-15px green__close-wrapper" :style="[{height : clientWidth > 767 ? '24px' : '30px' }]">
                                                <img class="position-re green__icon-img" :style="[{top : clientWidth > 767 ? '7px' : '2px' }]" :src="greenmark" alt="edit" @click.stop.prevent="roleObj.showRoleInput = false,handleRoleChanges(roleObj.key === null ? 'add' : 'update', roleObj.key, index,roleName,roles,rolesGetter)">
                                                <img class="position-re close__icon" :style="[{top : clientWidth > 767 ? '7px' : '2px' }]" :src="helpClose" alt="edit" @click.stop.prevent="roleObj.showRoleInput = false">
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </DropDownOption>
                        </template>
                    </DropDown>
                    <button v-if="!isSpinner" type="button" class="blue_btn invite-blue-top cursor-pointer font-roboto-sans ml-0" id="blue_btn" @click.prevent="sendInvitation()">Invite</button>
                    <button v-else type="button" class="blue_btn invite-blue-top else__invite font-roboto-sans ml-0">Invite</button>
                </div>
            </form>
            <div class="totalCount d-flex justify-content-between position-re" v-if="checkPermission('settings.settings_member_list') !== null">
                <div class="d-flex">
                    <span class="tab-option text-nowrap" @click="activeTab = 0, page= 0" :class="{'activeTab': activeTab === 0}">All members ({{filteredList.length}})</span>
                    <span class="tab-option text-nowrap" @click="activeTab = 1, page= 0" :class="{'activeTab': activeTab === 1}">Removed members ({{filteredRemovedList.length}})</span>
                </div>
            </div>
            
            <MemberberTable v-if="checkPermission('settings.settings_member_list') !== null" :filteredList="filteredList" :filteredRemovedList="filteredRemovedList" :activeTab="activeTab" :page="page" :perPage="filteredList.length" @pageClick="(val)=>{page = val}" :listingArray="listingArray"  @inviteUserParent="(email,type,designation,flag,isFromRemove) => sendInvitation(email,type,designation,flag,isFromRemove)" @arrayCheck="(data) => listingArray = getCompanyUsers(data)"/>
        </div>
        <div v-else class="text-center">
            <img :src="accesDenied" />
        </div>
    </div>
</template>

<script setup>
    import { defineComponent, computed, watch, ref, onMounted, inject } from "vue";
    import { useStore } from 'vuex';
    import { useCustomComposable } from "@/composable";
    import { useValidation } from "@/composable/Validation.js";
    import { memberData } from "./helperMember.js"

    import InputText from "@/components/atom/InputText/InputText.vue"
    import DropDown from '@/components/molecules/DropDown/DropDown.vue'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    import MemberberTable from '@/components/molecules/MemberTable/MemberTable.vue'
    // 
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import { useToast } from 'vue-toast-notification';
    import Swal from 'sweetalert2';

    const editImg = require("@/assets/images/editing.png");
    const deleteIcon = require("@/assets/images/svg/delete-red.svg");
    const helpClose = require("@/assets/images/close.png");
    const greenmark = require("@/assets/images/greenmark.png");
    const arrowIcon=require('@/assets/images/dd-full-arrow.png');
    import axios from 'axios'
    import * as env from '@/config/env';
    import { apiRequest } from "@/services/index.js";
    import { dbCollections, settingsCollectionDocs } from "../../../utils/FirebaseCollections.js";
    import * as mongoQuery from '@/utils/MongoQueries/crudOperations/crudOperations';

    defineComponent({
        name: "MembersComponent"
    })

    const companyId = inject("$companyId");
    const clientWidth = inject("$clientWidth");
    const designationArr = ref([]);
    const roles = ref([]);
    const designationKey = ref('');
    const paginationKey = ref('');
    const listingArray = ref([]);
    const activeTab = ref(0);
    const page = ref(0);
    const searchField = ref('');
    const designation = ref(null);
    const roleKey = ref('');
    const inviteUserData = ref({});
    const role = ref(null);
    const designationName = ref('');
    const roleName = ref('');
    const $toast = useToast();
    const formData = ref({
        email: {
            value: "",
            rules:
            "required | regex: \\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+",
            name: "Email",
            error: "",
        },
    })
    const isSpinner = ref(false)
    const desSearch = ref('')
    const accesDenied = require("@/assets/images/access_denied_img.png");
    const { getters } = useStore();
    const {makeUniqueId, checkPermission,debounce} = useCustomComposable();
    const  { checkErrors } = useValidation();
    const {getCompanyUsers, handleDesignationChanges, handleRoleChanges} = memberData();
    const searchDesignationArr = ref([]);
    // 


    const designations = computed(() => {
        return getters['settings/designations'].filter((x) => !x.isDelete);
    });

    const withoutOwnerRoles = computed(() => {
        return getters['settings/withoutOwnerRoles'].filter((x) => !x.isDelete);
    });
    const companies = computed(() => {
        return getters["settings/companies"];
    })

    const designationSearch = () => {
        searchDesignationArr.value = designationArr.value.filter((x) => x.name.toLowerCase().includes(desSearch.value.toLowerCase()));
    }

    const assignSearchField = debounce((val) => {
        searchField.value = val;
    },1000)


    watch(() => desSearch.value, () => {
        designationSearch();
    })
    onMounted(() => {
        getDesignations(designations.value);
        getRoles(withoutOwnerRoles.value);
        listingArray.value = getCompanyUsers();
        designationKey.value = 'designations'+makeUniqueId(6);
        paginationKey.value = 'pagination'+makeUniqueId(6);
        roleKey.value = 'role'+makeUniqueId(6);
    })

    watch(() => designations.value, (val) => {
        getDesignations(val);
    })

    watch(()=> withoutOwnerRoles.value, (val) => {
        getRoles(val)
    })
    const rolesGetter = computed(() => {
        return getters['settings/roles'];
    });

    const getDesignations = (value) => {
        if(!value) {
            return;
        }
        let arr = [...JSON.parse(JSON.stringify(value)),{key: null, name: "+ Add New Designation", showDesignationInput: false} ].filter((x) => x.key !== 0);
        designationArr.value = arr.map((x)=>({...x,label:x.name}));
    }

    const getRoles = (value) => {
        if(!value) {
            return;
        }
        let arr = [...JSON.parse(JSON.stringify(value)),{key: null, name: "+ Add New Role", showRoleInput: false} ];
        roles.value = arr.map((x)=>({...x,label:x.name}));
    }

    const filteredList = computed(() => {
        let list = listingArray.value.filter((user) => !user.isDelete);
        return list.filter((user) => (user.Employee_Name !== undefined && user.Employee_Name.toLowerCase().includes(searchField.value.toLowerCase())) || (user.userEmail !== undefined && user.userEmail.toLowerCase().includes(searchField.value.toLowerCase())));
    })

    const filteredRemovedList = computed(() => {
        let list = listingArray.value.filter((user) => user.isDelete);
        return list.filter((user) => (user.Employee_Name !== undefined && user.Employee_Name.toLowerCase().includes(searchField.value.toLowerCase())) || (user.userEmail !== undefined && user.userEmail.toLowerCase().includes(searchField.value.toLowerCase())));
    })

    const selectedCompany = computed(() => {return companies.value.find((company) => company._id === companyId.value)})

    const openDesignationEditor = (key) => {
        designationArr.value.forEach((data) => {
            if(data.key === key) {
                data.showDesignationInput = true;
                 if(key !== null) {
                    designationName.value = data.name;
                } else {
                    designationName.value = "";
                }
            }
            else {
                data.showDesignationInput = false;
            }
        })
    }
    
    const openRoleEditor = (key) => {
        roles.value.forEach((data) => {
            if(data.key === key) {
                data.showRoleInput = true;
                if(key !== null) {
                    roleName.value = data.name;
                } else {
                    roleName.value = "";
                }
            } else {
                data.showRoleInput = false;
            }
        })
    }

    const sendInvitation = (email = "", roleType = null, designationKey = null,isResend = null,isFromRemove = null) => {
        let userEmail;
        let userDesignation;
        let userRole;

        if(email !== "") {
            userEmail = email;
        } else if(formData.value.email.value && formData.value.email.value.length) {
            userEmail = formData.value.email.value;
        }
        else {
            $toast.error("Please provide an email id",{position: 'top-right'});
            return;
        }

        if(designationKey !== null && designationKey !== "") {
            userDesignation = designationKey;
        } else if(designation.value !== null && designation.value !== "") {
            userDesignation = designation.value;
        }else{
            $toast.error("Please provide a designation",{position: 'top-right'});
            isSpinner.value = false;
            return;
        }

        if(roleType !== null && roleType !== "") {
            userRole= roleType;
        } else if(role.value !== null && role.value !== "") {
            userRole = role.value;
        }else{
            $toast.error("Please provide a role",{position: 'top-right'});
            isSpinner.value = false;
            return;
        }
        isSpinner.value = true;
        if(formData.value.email.error!== ''){
            isSpinner.value = false;
            return;
        }
        if (!isResend) {
            if (isFromRemove) {
                // 
                inviteUserData.value = {
                    userEmail: userEmail,
                    userDesignation: userDesignation,
                    userRole: userRole,
                }
            } else {
                apiRequest("post", env.CHECKSENDINVITATION, {
                    companyId: companyId.value,
                    email: userEmail,
                }).then((resp) => {
                    if(resp.data.status == true) {
                        if (resp.data.furtherProceed) {
                            // 
                            inviteUserData.value = {
                                userEmail: userEmail,
                                userDesignation: userDesignation,
                                userRole: userRole,
                            }
                            // 
                            sendMail(userEmail, userDesignation, userRole ,isResend);
                        } else {
                            isSpinner.value = false;
                            $toast.warning(resp.data.statusText,{position: 'top-right'});
                        }
                    } else {
                        isSpinner.value = false;
                        $toast.error("Something went wrong. Please try again.",{position: 'top-right'});
                        console.error('error',resp.data.statusText);
                    }
                }).catch((error) => {
                    isSpinner.value = false;
                    $toast.error("Something went wrong. Please try again.",{position: 'top-right'});
                    console.error(error);
                })
            }
        } else {
            sendMail(userEmail, userDesignation, userRole ,isResend);
        }
    }

    function sendMail(userEmail,userDesignation,userRole,isResend) {
        axios.post(`${env.API_URI}${env.SEND_INVITATION_EMAIL}`, {
            companyId: companyId.value,
            companyName: selectedCompany.value.Cst_CompanyName,
            email: userEmail,
            designation: userDesignation,
            role: userRole,
            isResend: isResend
        }).then((res)=>{
            isSpinner.value = false;
            formData.value.email.value="";
            designation.value = "";
            role.value = null;
            if(res.data.status){
                listingArray.value = getCompanyUsers();
                $toast.success(res.data.statusText,{position: 'top-right'});
            }else{
                $toast.error(res.data.statusText,{position: 'top-right'});
            }
        }).catch((err)=>{
            isSpinner.value = false;
            console.error(err,"ERROR IN SENDING INVITATION");
        })
    }

    // 

    function deleteDesignation (obj) {
        const query = {
            type: "findOne",
            collection: dbCollections.COMPANY_USERS,
            data: [
                {
                    designation : obj.key
                }
            ]
        }
        mongoQuery.mongodbCrudOperations(query).then((result) =>{
            if(result){
                $toast.error("The designation is already in use, so it can't be deleted.",{position: 'top-right'});
                return;
            }else{
                Swal.fire({
                    title: 'Are you sure?',
                    text: `Are you sure you want to delete ${obj.name} designation?`,
                    showCancelButton: true,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'No',
                    confirmButtonText: 'Yes',
                }).then((result) => {
                    if(result.value){
                        let field = 'isDelete';
                        let queryObj = [
                            { 'name': settingsCollectionDocs.DESIGNATIONS },
                            {$set: {[`settings.$[elementIndex].${field}`]: true}},
                            {arrayFilters: [{ "elementIndex.key": obj.key }]}
                        ];
                        const queryUpdate = {
                            type: "updateOne",
                            collection: dbCollections.SETTINGS,
                            data: queryObj
                        };
                        mongoQuery.mongodbCrudOperations(queryUpdate).then(() => {
                            $toast.success("Designation deleted successfully",{position: 'top-right'});
                        })
                    }
                })
            }
        })
    }

    function deleteRole (obj) {
        const query = {
            type: "findOne",
            collection: dbCollections.COMPANY_USERS,
            data: [
                {
                    roleType : obj.key
                }
            ]
        }
        mongoQuery.mongodbCrudOperations(query).then((result) =>{
            if(result){
                $toast.error("The role is already in use, so it can't be deleted.",{position: 'top-right'});
                return;
            }else{
                Swal.fire({
                    title: 'Are you sure?',
                    text: `Are you sure you want to delete ${obj.name} role?`,
                    showCancelButton: true,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'No',
                    confirmButtonText: 'Yes',
                }).then((result) => {
                    if(result.value){
                        let field = 'isDelete';
                        let queryObj = [
                            { 'name': settingsCollectionDocs.ROLES },
                            {$set: {[`settings.$[elementIndex].${field}`]: true}},
                            {arrayFilters: [{ "elementIndex.key": obj.key }]}
                        ];
                        const queryUpdate = {
                            type: "updateOne",
                            collection: dbCollections.SETTINGS,
                            data: queryObj
                        };
                        mongoQuery.mongodbCrudOperations(queryUpdate).then(() => {
                            $toast.success("Role deleted successfully",{position: 'top-right'});
                        })
                    }
                })
            }
        })
    }
</script>
<style scoped>
@import './style.css'
</style> 