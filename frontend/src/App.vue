<template>
	<div v-if="!underMaintainance">
		<template v-if="$route.meta.requiresAuth">
			<template v-if="logged && (rules && Object.keys(rules).length && companyUserDetail && Object.keys(companyUserDetail).length)">
                <HeaderComponent v-if="!$route.meta.hideHeader" @change="changeCompany($event)" @filter="handleFilter"/>
                <div :style="`height: calc(100dvh - ${$route.meta.hideHeader ? '0' : '47'}px);`" class="billing__history-wrapper">
                    <AdvanceSearchModal
                        v-if="!$route.meta.preventAdvanceSearch"
                        headerClasses="border-0"
                        :modelValue="isAdvanceSearch"
                        :header="false"
                        :footer="false"
                        :showCloseIcon="false"
                        :className="`advance_search_modal advanced__model-css`"
                        @removeListners="removeKeyListner"
                    >
                        <template #body>
                        <MainSearchComponent @closeModel="removeKeyListner"/>
                        </template>
                    </AdvanceSearchModal>
                    <router-view/>
                </div>
			</template>
			<div v-else-if="!companyId?.length && $route.name === 'Create_Company'" class="d-flex align-items-center justify-content-center lds-roller h-100dvh">
				<router-view/>
			</div>
			<div v-else class="d-flex align-items-center justify-content-center lds-roller h-100dvh">
				<img :src="logo" alt="logo" class="position-ab z-index-1 company__logo">
				<div class="spinner"></div>
			</div>
		</template>
		<div v-else class="overflow-data h-100vh">
			<router-view/>
		</div>

        <!-- NOTIFICATION REQUEST MODAL -->
        <Modal
            v-model="requestPermission"
            title="Notification Request"
            cancelButtonText="No"
            acceptButtonText="Yes"
            :close-on-backdrop="false"
            :closeIcon="false"
            className="topAligned"
            @close="requestPermission = false"
            @accept="notificationPermissionRequest(), requestPermission = false"
        >
            <template #body>
                <div class="d-flex align-items-center flex-column px-2">
                    Do you want to enable browser notifications?
                </div>
            </template>
        </Modal>
	</div>
	<div v-else class="d-flex align-items-center justify-content-center w-100vw h-100dvh">
		<img :src="underMaintainanceImg" alt="underMaintainance">
	</div>
</template>
<script setup>
// PACKAGES
import { computed, defineComponent, onMounted, provide, ref, watch} from 'vue'
import { App } from "realm-web";
// COMPONENTS
import HeaderComponent from '@/components/organisms/Header/Header.vue'
import AdvanceSearchModal from '@/components/atom/Modal/Modal.vue'
import Modal from "@/components/atom/Modal/Modal.vue"
import MainSearchComponent from '@/components/molecules/AdvanceSearch/MainComponent.vue'
import { useStore } from 'vuex';
import axios from 'axios'
import { fcmToken } from '@/composable/commonFunction';
import { dbCollections } from '@/utils/FirebaseCollections';
// 
import { useToast } from "vue-toast-notification"

// COMPOSABLES
const { getters, dispatch, commit } = useStore();
const $toast = useToast();

// IMAGES
// import logo from '@/assets/images/png/logo.png'
const logo = "/api/v1/getlogo?key=logo&type=desktop";
import underMaintainanceImg from '@/assets/images/under_maintenance.png'
import { useRoute, useRouter } from 'vue-router';
// import { getRawSnapshot } from './utils/FirebaseQueries/Get/getQueries';
import { mongoConnection, mongoGLOBALConnection , mongoSUBSCRIPTIONConnection } from './utils/MongoQueries/mongoAuth';
import { mongodbCrudOperations } from './utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';
import { useCustomComposable } from '@/composable';


// COMPONENT
defineComponent({
	name: 'App',

	components: {
		HeaderComponent,
        AdvanceSearchModal
	}
})

const { checkPermission } = useCustomComposable();

const companyId = ref(localStorage.getItem('selectedCompany') !== null ? localStorage.getItem('selectedCompany') : "")
const underMaintainance = ref(false);
const logged = ref(false);
const requestPermission = ref(false);
const showSpinner = ref(true);
const clientWidth = ref(document.documentElement.clientWidth);
const userId = ref('');
const router = useRouter();
const route = useRoute();
const dateFormat = ref("DD/MM/YYYY");
const isAdvanceSearch = ref(false);
const defaultImageUser = require("@/assets/images/default_user.png")

const rules = ref({});
const projectList = computed(() => checkPermission('project.project_list'));
const taskList = computed(() => checkPermission('task.task_list'));
watch(() => projectList.value, (val) => {
    projectList.value = val;
})
watch(() => taskList.value, (val) => {
    taskList.value = val;
})
watch(() => getters['settings/rules'], (val) => {
	rules.value = val;
})
function checkUserCompany (uid,forDisable = false) {
    return new Promise((resolve,reject) => {
        try {
            const userQuery = {
                type: "findOne",
                collection: dbCollections.USERS,
                global: true,
                data: [
                    {
                        _id: BSON.ObjectID(uid)
                    }
                ]
            }
            mongodbCrudOperations(userQuery)
            .then((result) => {
                if(result?.AssignCompany.length === 0){
                    resolve("");
                    rules.value = {};
                    localStorage.removeItem("selectedCompany");
                    commit("settings/mutateSelectedCompany", companyId.value);
                    companyId.value = '';
                    router.push('/business');
                    return;
                }else{
                    if(forDisable){
                        const comapnyValue = getters['settings/companies'].filter((cmp) => result?.AssignCompany.includes(cmp._id)).find((x) => x.isDisable == false);
                        if(comapnyValue){
                            resolve(comapnyValue._id || "");
                        }else{
                            resolve("");
                        }
                    }else{
                        resolve(result?.AssignCompany[0] || "");
                    }
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

const companyUserDetail = ref({});
watch(() => getters['settings/companyUserDetail'], async(val) => {
    if(val.isDelete === true){
        await checkUserCompany(userId.value).then((response) => {
            localStorage.removeItem("selectedCompany");
            companyId.value = '';
            if(!Object.keys(companyId.value).length){
                companyId.value = response;
                commit("settings/mutateSelectedCompany", companyId.value);
                if(response !== ""){
                    localStorage.setItem("selectedCompany",companyId.value);
                }
            }
            return true;
        }).catch((err) => {
            console.error(err,"errerr");
        })
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
	companyUserDetail.value = val;
})

watch(() => getters['settings/selectedCompany'], async(val) => {
    if(val.isDisable === true){
        await checkUserCompany(userId.value,true).then((response) => {
            if(response === ''){
                companyId.value = '';
                localStorage.removeItem("selectedCompany");
            }else{
                companyId.value = response;
                commit("settings/mutateSelectedCompany", companyId.value);
                if(response !== ""){
                    localStorage.setItem("selectedCompany",companyId.value);
                }
            }
            return true;
        }).catch((err) => {
            console.error(err,"errerr");
        })
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
})

async function getFirebaseData() {
    if(getters['settings/companies'] && !getters['settings/companies'].length) {
        const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
        if (app.currentUser !== null && app.currentUser !== undefined) {
            let user = app.currentUser
            if(user) {
                userId.value = user.id;
                logged.value = true;

                await mongoGLOBALConnection();

                const userQuery = {
                    type: "findOne",
                    collection: dbCollections.USERS,
                    global: true,
                    data: [
                        {
                            _id: BSON.ObjectID(userId.value)
                        }
                    ]
                }
                const userData = await mongodbCrudOperations(userQuery);

                await dispatch('settings/setCompanies', userData?.AssignCompany)
                .catch((error) => {
                    console.error("ERROR in set companies: ", error)
                    return;
                })

                if(userData?.AssignCompany.length > 0){
                    const testFunction = async () => {
                        const urlCid = route?.params?.cid || window.location.hash?.replace("#/", "")?.split("/")?.[0];
                        if (urlCid) {
                            if(userData?.AssignCompany.includes(urlCid)) {
                                companyId.value = urlCid;
                            } else {
                                let findCompany = getters['settings/companies'].filter((x) => userData?.AssignCompany.includes(x._id)).filter((y) => y.isDisable === undefined || y.isDisable === false);
                                if(findCompany.length > 0){
                                    // await changeCompany(findCompany[0]._id)
                                    if(findCompany.includes(companyId.value)) {
                                        await changeCompany(findCompany[0]._id)
                                    } else {
                                        router.push('/');
                                    }
                                }else{
                                    router.push('/business');
                                }
                            }
                        } else {
                            router.push('/');
                        }
                    }
                    if (userData?.AssignCompany.includes(companyId.value)) {
                        testFunction();
                    } else {
                        testFunction();
                    }
                } else {
                    router.push('/business');
                }


                // if(userData?.AssignCompany.length > 0){
                //     if(!userData?.AssignCompany.includes(companyId.value)) {
                //         let findCompany = getters['settings/companies'].filter((x) => userData?.AssignCompany.includes(x._id)).filter((y) => y.isDisable === undefined || y.isDisable === false);
                //         if(findCompany.length > 0){
                //             await changeCompany(findCompany[0]._id)
                //         }else{
                //             router.push('/business');
                //         }
                //     }
                // }else{
                //     router.push('/business');
                // }

                await mongoConnection({database: companyId.value});

                if(!companyId.value?.length){
                    checkUserCompany(userId.value)
                    return;
                }
                commit("settings/mutateSelectedCompany", companyId.value);

                dispatch("users/setUsers", {cid: companyId.value}).catch((error) => {
                    console.error("ERROR in setUsers: ", error);
                });
                dispatch("users/myCounts", {uid: userId.value})
                .catch((error) => {
                    console.error("ERROR in myCounts: ", error);
                });

                if(getters['settings/rules'] && !getters['settings/rules'].length) {
                    dispatch("settings/setRules", companyId.value).then(() => {
                        if(getters['settings/allCurrencyArray'] && !(getters['settings/allCurrencyArray']).length){
                            dispatch('settings/setCurrencyArray', companyId.value).catch((error) =>{
                                console.error('ERROR in set AllProjectStatus',error)
                            })
                        }
                        if(getters['settings/roles'] && !getters['settings/roles'].length) {
                            dispatch('settings/setRoles', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set roles: ", error)
                            })
                        }
                        if(getters['settings/designations'] && !getters['settings/designations'].length) {
                            dispatch('settings/setDesignations', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set designations: ", error)
                            })
                        }
                        if(getters['settings/companyUserStatus'] && !getters['settings/companyUserStatus'].length) {
                            dispatch('settings/setCompanyUserStatus', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set company user status: ", error)
                            })
                        }
                        if(getters['settings/fileExtentions'] && !Object.keys(getters['settings/fileExtentions']).length) {
                            dispatch('settings/setFileExtentions', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set file extentions: ", error)
                            })
                        }
                        if(getters['settings/companyUsers'] && !getters['settings/companyUsers'].length) {
                            dispatch('settings/setCompanyUsers', {companyName: companyId.value, userId: userId.value}).then(async()=>{
                                    await mongoSUBSCRIPTIONConnection();
                                    if(getters['settings/chargeBeePrice'] && !(getters['settings/chargeBeePrice']).length){
                                        dispatch('settings/setChargeBeePrice').catch((error) =>{
                                            console.error('ERROR in set Set Chargebee',error)
                                        })
                                    }
                                    if(getters['settings/planFeatureDisplay'] && !(getters['settings/planFeatureDisplay']).length){
                                        dispatch('settings/setplanFeatureDisplay').catch((error) =>{
                                            console.error('ERROR in set Set Chargebee',error)
                                        })
                                    }
                            })
                            .catch((error) => {
                                console.error("ERROR in set file extentions: ", error)
                            })
                        }
                        if(getters['settings/category'] && !getters['settings/category'].length) {
                            dispatch('settings/setCategory',companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set file extentions: ", error)
                            })
                        }
                        // STORE IMPLEMENTATION PENFINDING
                        // if(self.users && !Object.keys(self.users).length) {
                        //     let whereQueries= [
                        //         {
                        //             field: "AssignCompany",
                        //             operation: "array-contains",
                        //             value: Vue.prototype.$companyId
                        //         },
                        //         {
                        //             field: "isDeleted",
                        //             operation: "==",
                        //             value: false
                        //         },
                        //         {
                        //             field: "isActive",
                        //             operation: "==",
                        //             value: true
                        //         },
                        //     ]
                        //     self.setUsers({
                        //         whereQueries: whereQueries
                        //     })
                        //     .catch((error) => {
                        //         console.error("ERROR in get users: ", error);
                        //     })
                        // }
                        // if(self.teams && !Object.keys(self.teams).length) {
                        //     self.setTeams({"cid":Vue.prototype.$companyId});
                        // }
                        if(getters['settings/projectTabComponents'] && !getters['settings/projectTabComponents'].length) {
                            dispatch('settings/setProjectTabComponents', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set project tab components: ", error)
                            })
                        }
                        if(getters['settings/companyDateFormat'] && !getters['settings/companyDateFormat'].length) {
                            dispatch('settings/setCompayDateFormat', companyId.value)
                            .then((res) => {
                                dateFormat.value = res?.settings[0].dateFormat || "DD-MM-YYYY"
                            })
                            .catch((error) => {
                                console.error("ERROR in set Compay Date Format: ", error)
                            })
                        }
                        if(getters['settings/companyPriority'] && !(getters['settings/companyPriority']).length) {
                            dispatch('settings/setCompanyPriority', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set setCompanyPriority: ", error)
                            })
                        }
                        if(getters['settings/milestoneweeklyrange'] && !(getters['settings/milestoneweeklyrange']).length) {
                            dispatch('settings/setMileStoneWeeklyRange', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set setMileStoneWeeklyRange: ", error)
                            })
                        }
                        if(getters['settings/teams'] && !(getters['settings/teams']).length) {
                            dispatch('settings/setTeams', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set setTeams: ", error)
                            })
                        }
                        if(getters['settings/customFields'] && !(getters['settings/customFields']).length) {
                            dispatch('settings/setCustomFields', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set setCustomFields: ", error)
                            })
                        }
                        if(getters['settings/restrictedExtensions'] && !(getters['settings/restrictedExtensions']).length) {
                            dispatch('settings/setRestrictedExtensions', companyId.value)
                            .catch((error) => {
                            console.error("ERROR in set setTeams: ", error)
                            })
                        }
                        if(getters['settings/projectMilestoneStatus'] && !(getters['settings/projectMilestoneStatus']).length) {
                            dispatch('settings/setMileStoneStatus', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set setTeams: ", error)
                            })
                        }
                        if(getters['settings/finalCustomFields'] && !(getters['settings/finalCustomFields']).length) {
                            dispatch('settings/setfinalCustomFields', companyId.value) .catch((error) => {
                                console.error("ERROR in set finalCustomFields: ", error)
                            })
                        }
                        if(getters['settings/AllTaskStatus'] && !(getters['settings/AllTaskStatus']).length){
                            dispatch('settings/setTaskStatusArray', companyId.value).catch((error) =>{
                                console.error('ERROR in set AllTaskStatus',error)
                            })
                        }
                        if(getters['settings/AllProjectStatus'] && !(getters['settings/AllProjectStatus']).length){
                            dispatch('settings/setProjectStatusArray', companyId.value).catch((error) =>{
                                console.error('ERROR in set AllProjectStatus',error)
                            })
                        }
                        if(getters['settings/AllTaskType'] && !(getters['settings/AllTaskType']).length){
                            dispatch('settings/setTaskTypeArray', companyId.value).catch((error) =>{
                                console.error('ERROR in set AllTaskType',error)
                            })
                        }
                        if(getters['settings/projectStaus'] && !(getters['settings/projectStaus']).length) {
                            dispatch('settings/setProjectStatus', companyId.value).then(()=>{
                            }).catch((err)=>{
                                console.error(err,"Error in set project status template")
                            })
                        }
                        if(getters['settings/taskType'] && !(getters['settings/taskType']).length) {
                            dispatch('settings/setTaskType', companyId.value).then(() => {
                            })
                            .catch((error) => {
                                console.error("ERROR in set setTaskType: ", error)
                            })
                        }
                        if(getters['settings/taskStatus'] && !(getters['settings/taskStatus']).length) {
                            dispatch('settings/setTaskStatus', companyId.value)
                            .catch((error) => {
                                console.error("ERROR in set setTaskStatus: ", error)
                            })
                        }
                    }).catch((error) => {
                        console.error("ERROR in get rules: ", error);
                    })
                }

                if ('Notification' in window) {
                    if(Notification.permission === "default") {
                        requestPermission.value = true;
                    } else if(Notification.permission === "granted") {
                        generateFcmToken();
                    }
                }
            }
        } else {
            logged.value = false;
            showSpinner.value = false;
        }
	}
}
function changeCompany(cid) {
    let checkCompany = getters['settings/companies'].find((x) => x._id === cid)?.isDisable || false;
    if(checkCompany === false){
        companyId.value = cid;
        commit("settings/mutateSelectedCompany", companyId.value);

        localStorage.setItem('selectedCompany', companyId.value);
        let routeObj = {name: route.name, params: {cid: ""}};
        if(route?.params?.cid) {
            routeObj.params.cid = cid;
            routeObj.params.id = route?.params?.id || "";
        }
        router.replace(routeObj)
        .then(() => {
            window.location.reload();
        })
        .catch((error) => {
            console.error("ERROR in change company: ", error);
        })
    }else{
        $toast.error("Company is disable",{position: 'top-right'});
        let availableCompany = getters['settings/companies'].find((x) => !x.isDisable);
        if(availableCompany){
            router.replace({name: route.name, params: {cid: availableCompany._id}});
        }else{
            router.push({name : 'Create_Company'});
        }
    }
}
const handleFilter = () => {
    isAdvanceSearch.value = true;
}
// This function is used for the handle advance search modal key press event
const _keyListener = (e) => {
    if (e.key === "k" && (e.ctrlKey)) {
        if(taskList.value !== null && projectList.value !== null){
            e.preventDefault();
            isAdvanceSearch.value = true;
        }
        else{
            $toast.error("Access Denied.",{position: 'top-right'});
        }
    }
    if(e.key === "Escape"){
        isAdvanceSearch.value = false;
    }
}

// This function is used for the remove event listners for the advance search modal on modal close
const removeKeyListner = () => {
  isAdvanceSearch.value = false;
  document.removeEventListener('keydown', _keyListener);
  document.addEventListener('keydown', _keyListener);
}

function notificationPermissionRequest() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            generateFcmToken();
        } else if (Notification.permission === 'denied') {
            generateFcmToken(true);
        } else {
            Notification.requestPermission()
            .then(permission => {
                if (permission === 'granted') {
                    generateFcmToken();
                } else {
                    generateFcmToken(true);
                }
            })
            .catch(error => {
                console.error('Error occurred while requesting notification permission:', error);
            });
        }
    } else {
        $toast.error("To receive notifications, please allow Notification permission in site settings and reload page again.",{position: 'top-right'});
        // generateFcmToken();
    }
}

function generateFcmToken(type=false) {
    try{
        if(type == false) {
            const userQuery = {
                type: "findOne",
                collection: dbCollections.USERS,
                global: true,
                data: [
                    {
                        _id: BSON.ObjectID(userId.value)
                    }
                ]
            }
            const userData = mongodbCrudOperations(userQuery)
            userData.then((user) => {
                if(!user) {
                    return;
                }
                fcmToken().then((result) => {
                    if(result.status && result.token !== '') {
                        if(localStorage.getItem('webTokens') == null) {
                            const query = {
                                type: "updateOne",
                                collection: dbCollections.USERS,
                                global: true,
                                data: [
                                    { _id: BSON.ObjectID(userId.value) },
                                    { $push: { webTokens: result.token } }
                                ]
                            }
                            const userRef = mongodbCrudOperations(query)
                            userRef.then(() => {
                                localStorage.setItem('webTokens',result.token);
                            })

                        } else if((localStorage.getItem('webTokens') && localStorage.getItem('webTokens') !== result.token)) {
                            let token = localStorage.getItem('webTokens');
                            if(token) {
                                const query = {
                                    type: "updateOne",
                                    collection: dbCollections.USERS,
                                    global: true,
                                    data: [
                                        { _id: BSON.ObjectID(userId.value) },
                                        { $pull: { webTokens: token } }
                                    ]
                                }
                                const userRef = mongodbCrudOperations(query)
                                userRef.then(() => {

                                    const q = {
                                        type: "updateOne",
                                        collection: dbCollections.USERS,
                                        global: true,
                                        data: [
                                            { _id: BSON.ObjectID(userId.value) },
                                            { $push: { webTokens: result.token } }
                                        ]
                                    }
                                    const userData = mongodbCrudOperations(q)
                                    userData.then(() => {
                                        localStorage.setItem('webTokens',result.token);
                                    })
                                })
                            }
                        }
                    }
                })
            })
        } 
        else {
            let token = localStorage.getItem('webTokens');
            if(token) {
                const query = {
                    type: "updateOne",
                    collection: dbCollections.USERS,
                    global: true,
                    data: [
                        { _id: BSON.ObjectID(userId.value) },
                        { $pull: { webTokens: token } }
                    ]
                }
                const userRef = mongodbCrudOperations(query)
                userRef.then(() => {
                    localStorage.removeItem('webTokens',token);
                })
            }
        }
    } catch(e) {
        console.error(e);
    }
}

watch(underMaintainance, (newVal, oldVal) => {
	if(newVal !== oldVal && newVal === false)  {
		window.location.reload();
	}
})

onMounted(() => {
    if(getters['brandSettingTab/brandSettings'] && !(getters['brandSettingTab/brandSettings']).length){
        dispatch('brandSettingTab/setBrandSettings').catch((error) =>{
            console.error('ERROR in set Set Brand Settings',error)
        })
    }
    userId.value = localStorage.getItem("userId") !== null ? localStorage.getItem("userId") :  '';
    getFirebaseData();
    // 
	window.onresize = (e) => {
		clientWidth.value = e.target.innerWidth;
	}
	document.addEventListener('keydown', _keyListener);
})

const urlRegex = ref(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g)
// const urlRegex = ref(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g)

provide("$urlRegex", urlRegex);
provide("$dateFormat", dateFormat);
provide("$companyId", companyId);
provide("$axios", axios);
provide("$userId", userId);
provide("$moneysymbol", '');
provide("$isLogginedIn", logged.value);
provide("$clientWidth", clientWidth);
provide("$selectedCompanyName", '');
provide("$defaultUserAvatar", defaultImageUser);
provide("$defaultTaskStatusImg", "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/defaut_task_status_img.png?alt=media&token=570a9fca-e23a-41ee-a47b-d82fb766b1fd");
provide("$currentLoggedInUserDetails", '');
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
.company__logo{
    width: 150px; 
    height: 150px; 
    border: 2px solid #2F399035;
    border-radius: 50%;
}
.advanced__model-css{
    width:100%; 
    height:100%; 
    max-width: 100%!important; 
    border-radius:0!important;
}
</style>
