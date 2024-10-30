<template>
    <div class="projectInfoDiv bg-white" :class="[{'opacity-5 pointer-event-none' : item?.isRestrict === true}]">
        <div class="projectInfoTopLine d-flex align-items-center justify-content-between font-roboto-sans">
            <div class="d-flex align-items-center project__inToplinetextimg-wrapper">
                <img :class="[{'cursor-pointer' : activeTab === 0}]" :src="item?.favouriteTasks?.filter((x) => x.userId === userId)?.length ? projectStar : blankStar" @click="!item.isRestrict ? updateFavourite(item) : ''" title="favorite"/>
                <span class="ProjectFirstLatter light-purple d-flex align-items-center justify-content-center font-weight-400 font-roboto-sans white font-size-13 text-uppercase" v-if="item.projectIcon.type === 'color'" :style="[{'background-color': item.projectIcon.type === 'color' ? item.projectIcon.data : ''}]">{{item.ProjectName ? item.ProjectName.charAt(0) : ''}}</span>
                <WasabiImage
                    v-else
                    :style="[{'height': '20px','width': '20px','border-radius': '20px','margin-left': '5px'}]"
                    :data="{url: item.projectIcon.data}"
                />
                <p class="font-weight-500 dark-gray d-block font-size-14 text-ellipsis"><span>{{item.ProjectCode}}</span> | <span>{{item.ProjectName}}</span></p>
                <a v-if="activeTab === 0" class="d-flex font-weight-400 font-size-13 text-decoration-none font-roboto-sans cursor-pointer" href.prevent="#" @click="!item.isRestrict ? redirectProjectList(item) : ''"><img :src="projectGoToLink">Go to Projects</a>
            </div>
            <DropDown v-if="checkPermission('settings.settings_project_list') == true && checkPermission('project.project_details') == true && checkPermission('project.project_close') == true" :bodyClass="{'setting__project-dropdown' : true}">
                <template #button>
                    <img ref="setting" :src="dots" alt="dots" class="position-re ml-20px setting__dots">
                </template>
                <template #options>
                    <DropDownOption v-if="item.deletedStatusKey === 2">
                        <div class="d-flex align-items-center font-size-14 GunPowder setting__close-project" @click="!item.isRestrict ? unarchiveProject(item) : ''">
                            Restore Project
                        </div>
                    </DropDownOption>
                    <DropDownOption v-if="item.deletedStatusKey === 2">
                        <div class="d-flex align-items-center font-size-14 GunPowder setting__close-project" @click="!item.isRestrict ? deleteProject(item, 1) : ''">
                            Delete Project
                        </div>
                    </DropDownOption>
                    <DropDownOption v-if="item.statusType !== 'close' && item.deletedStatusKey !== 2" @click="!item.isRestrict ? colseProject(item,'close') : ''">
                        <div class="d-flex align-items-center font-size-14 GunPowder setting__close-project">
                            Close Project
                        </div>
                    </DropDownOption>
                    <DropDownOption @click="!item.isRestrict ? colseProject(item,'reopen') : ''" v-if="item.statusType === 'close'">
                        <div class="d-flex align-items-center font-size-14 GunPowder setting__close-project">
                            Reopen Project
                        </div>
                    </DropDownOption>
                </template>
            </DropDown>
        </div>
        <div class="project_status_info_area d-flex">
            <div class="p_owner">
                <div class="p__owner-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Owner</span>
                    <Assignee class="Assignee-component"
                        :users="item.LeadUserId"
                        :options="users.map((x) => x._id)"
                        :imageWidth="'30px'" 
                        :showDot="false"
                        @selected="changeAssignee('add', $event,item)"
                        @removed="changeAssignee('remove', $event,item)"
                        :numOfUsers="1"
                        :addUser="checkPermission('project.project_assignee') === true && activeTab === 0"
                        :isDisplayTeam="false"
                    />
                </div>
            </div>
            <div class="p_sharewith" :class="[{'pointer-event-none' : isSpinner === true}]">
                <div class="p__sharewith-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Share With</span>
                    <div class="share-with-wrapperdata d-flex align-items-center justify-content-start">
                        <button class="border-radius-8-px font-size-13 d-flex align-items-center justify-content-center mr-010 font-roboto-sans"  @click="!item.isRestrict ? updateProjectSpace(item,'public') : ''" :class="[{'outline-primary share__everyone' : item.isPrivateSpace === false,'outline-secondary share__private':item.isPrivateSpace !== false,'cursor-pointer': activeTab === 0}]">Everyone</button>                    
                        <button class="border-radius-8-px font-size-13 d-flex align-items-center justify-content-center font-roboto-sans"  @click="!item.isRestrict ? updateProjectSpace(item,'private') : ''" :class="[{'outline-primary share__everyone' : item.isPrivateSpace === true,'outline-secondary share__private':item.isPrivateSpace !== true,'cursor-pointer': activeTab === 0}]">Private</button>
                    </div>
                </div>
            </div>
            <div class="p_status" v-if="checkPermission('project.project_status_change') != null">
                <div class="p_status-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Project Status</span>
                    <ul class="pro_block d-flex align-items-center justify-content-start flex-wrap" @click="!item.isRestrict ? openEditSidebar(item,'projectStatus') : ''">
                        <li class="projectDataColorli" v-for="(statusObj,statusKey) in item.projectStatusData"
                        :key="statusKey">
                            <span class="font-roboto-sans font-weight-400 font-size-13 white" :class="[{'cursor-pointer' : activeTab === 0}]" :style="[{'color': statusObj.textColor+'!important','background-color': statusObj.backgroundColor}]">
                                {{statusObj.name}}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="task_type_status">
                <div class="task__type-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Task Type</span>
                    <ul class="d-flex task_type_statusul" @click="!item.isRestrict ? openEditSidebar(item,'taskType') : ''">
                        <li class="projectDataColorli" v-for="(taskType,taskTypeKey) in item.taskTypeCounts" :key="taskTypeKey">
                            <div class="task_type d-flex align-items-center border-radius-6-px bg-lightgray" :class="[{'cursor-pointer' : activeTab === 0}]">
                                <img v-if="taskType?.taskImage?.includes('http')" :src="taskType.taskImage" alt="task_type" :style="[{'height':'13.85px','width':'13.85px'}]">
                                <WasabiImage
                                    v-else
                                    :style="[{'height':'13.85px','width':'13.85px'}]"
                                    :data="{url: taskType.taskImage}"
                                />
                                <span class="font-size-13 font-roboto-sans font-weight-400 GunPowder ml-8px" :class="[{'cursor-pointer' : activeTab === 0}]">{{taskType.name}}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="task_type_status_todo" v-if="checkPermission('task.task_status') != null">
                <div class="task__typestatustodo-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Task Status</span>
                    <ul class="d-flex task_type_statusul" @click="!item.isRestrict ? openEditSidebar(item,'taskStatus') : ''">
                        <li class="cursor_pointer projectDataColorli" v-for="(statusObj,statusKey) in item.taskStatusData" :key="statusKey">
                            <span class="font-roboto-sans font-weight-400 font-size-13 bg-black white" :style="[{'background-color': statusObj.bgColor, 'color': statusObj.textColor+'!important'}]" :class="[{'cursor-pointer' : activeTab === 0}]">
                                {{statusObj.name}}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="p_erpApp">
                <div class="p__erpApp-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Apps</span>
                    <ul class="pro_block d-flex align-items-center justify-content-start flex-wrap" v-if="item.apps && item.apps.length > 0">
                        <li class="image_apps cursor_pointer projectDataColorli black" :class="[{'cursor-pointer' : activeTab === 0}]" v-for="(appObj,appKey) in item.apps" :key="appKey">
                            <img v-if="appObj.appStatus" :src="projectAppsIcons(appObj.key)?.afterIcon" @click="!item.isRestrict ? updateApp(item,appObj) : ''" :title="appObj.name ? appObj.name :'N/A'" class="erp_app mr-4px">
                            <img v-else :src="projectAppsIcons(appObj.key)?.beforeIcon" @click="!item.isRestrict ? updateApp(item,appObj) : ''" :title="appObj.name ? appObj.name :'N/A'" class="erp_app mr-4px">
                        </li>
                    </ul>
                    <ul class="d-flex" v-else>
                        <li class="projectDataColorli black font-size-13">
                            N/A
                        </li>
                    </ul>
                </div>
            </div>
            <div class="p_requiredViews">
                <div class="p__requiredViews-wrapper">
                    <span class="sub-title-span d-block font-roboto-sans font-weight-400 gray81 font-size-13">Required Views</span>
                    <ul class="d-flex flex-wrap" v-if="requireComp && requireComp.length > 0" >
                        <li class="pro_block cursor_pointer projectDataColorli" :class="[{'cursor-pointer' : activeTab === 0}]" v-for="(requireObj,requireKey) in requireComp" :key="requireKey">
                            <img v-if="item.ProjectRequiredComponent.filter((x) => x.keyName === requireObj.keyName).length > 0" :src="projectComponentsIcons(requireObj.keyName).activeIcon"
                            @click="!item.isRestrict ? updateTabs(item,requireObj,'unRead') : ''" :title="requireObj.name ? requireObj.name :'N/A'" class="erp_app def_req mr-10px">
                            <img v-else :src="projectComponentsIcons(requireObj.keyName).icon" @click="!item.isRestrict ? updateTabs(item,requireObj,'read') : ''" :title="'45'+requireObj.name ? requireObj.name :'N/A'" class="erp_app tab_req mr-10px">
                        </li>
                    </ul>
                    <ul class="d-flex" v-else>
                        <li class="projectDataColorli font-size-13">
                            N/A
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <ProjectSettingSidebar v-if="openSidebarInProject" :sidebarTitle="sidebarTitle" :projectData="item" :openSidebarInProject="openSidebarInProject" @isSidebarProjectSetting="openSidebarInProject = false" />
</template>

<script setup>
import { defineProps, inject, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useProjects } from '@/composable/projects';
import Assignee from "@/components/molecules/Assignee/Assignee.vue";
import ProjectSettingSidebar from '@/components/atom/ProjectSettingSidebar/ProjectSettingSidebar.vue'
import { useStore } from 'vuex';
import { useToast } from 'vue-toast-notification';
import { dbCollections } from '@/utils/FirebaseCollections';
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
const companyId = inject('$companyId');
const userId = inject("$userId");
import { useCustomComposable, useGetterFunctions } from "@/composable";
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import { projectComponentsIcons, projectAppsIcons } from '@/composable/commonFunction';
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { BSON } from "realm-web";
import { apiRequest } from "@/services";
import * as env from '@/config/env';

const props = defineProps({
    item: {
        type: Object,
        default: () => {}
    },
    activeTab:{
        type: Number
    }
});
const {markFavourite} = useProjects();
const {getters,commit} = useStore();
const {checkPermission} = useCustomComposable();
const {getUser} = useGetterFunctions();
const router = useRouter();
const $toast = useToast();
const projectGoToLink = require("@/assets/images/svg/projectGoToLink.svg");
const blankStar = require("@/assets/images/svg/blankStar.svg");
const projectStar = require("@/assets/images/svg/start13.svg");
const sidebarTitle = ref('');
const openSidebarInProject = ref(false);
const dots =require('@/assets/images/svg/setting_project_threedots.svg')
const isSpinner = ref(false);

const users = computed(() => getters["users/users"]);
const user = getUser(userId.value);
const userData = {
    id: user.id,
    Employee_Name: user.Employee_Name,
    companyOwnerId: user.companyOwnerId
}
const requireComp = computed(() => {
    let arr = getters['settings/projectTabComponents'];
    const removeArr = ["gantt", "timeline","embed"];
    arr= arr.filter((item) => {
        if(!removeArr.includes(item.value)) {
            return item;
        }
    });
    return arr;
});
const {checkSpecificTypeCount} = useProjects();

const settingPermission = computed(() => checkPermission("settings.settings_project_list",true, {gettersVal: getters}))
const projectDetailPremission = computed(() => checkPermission("project.project_details",true, {gettersVal: getters}))
const taskStatusPermission = computed(() => checkPermission("task.task_status", true, {gettersVal: getters}))
const projectStatusPermission = computed(() => checkPermission("project.project_status_change", true, {gettersVal: getters}))

function redirectProjectList (data) {
    router.push({ name: 'Project', params: {cid: companyId.value, id: data._id}});
}
function updateFavourite(projectData) {
    if(settingPermission.value !== true || projectDetailPremission.value !== true){
        return;
    }
    if(props.activeTab === 1){
        return;
    }
    if(!projectData.favouriteTasks || !projectData.favouriteTasks.find((x) => x.userId === userId.value)) {
        markFavourite({
            cid: companyId.value,
            projectId: projectData._id,
            userId: userId.value
        })
    } else {
        markFavourite({
            cid: companyId.value,
            projectId: projectData._id,
            userId: userId.value,
            data: projectData.favouriteTasks.find((x) => x.userId === userId.value)
        })
    }
}
const changeAssignee = (type, user,projectData) => {
    if(props.activeTab === 1){
        return;
    }
    let queryObj;
    if (type === "add") {
        queryObj = [
            { _id: BSON.ObjectID(projectData._id) },
            { $addToSet: { AssigneeUserId: user.id, LeadUserId : user.id} }
        ];
    } else {
        queryObj = [
            { _id: BSON.ObjectID(projectData._id) },
            { $pull: {
                AssigneeUserId: user.id,
                    ...(projectData.LeadUserId.includes(user.id) && { LeadUserId: user.id })
                }
            }
        ];
    }

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongodbCrudOperations(query)
    .then(() => {
        $toast.success(`Assignee ${type === "add" ? 'added' : 'removed'} successfully`,{position: 'top-right'});
    })
    .catch((error)=>{
        console.error("ERROR in update project assignee: ", error);
    })
}

function updateProjectSpace (projectObj,type) {
    let checkPlan;
    isSpinner.value = true;
    if(type === 'public'){
        checkPlan = checkSpecificTypeCount('public');
    }else{
        checkPlan = checkSpecificTypeCount('private');
    }
    if(checkPlan === true){
        if((type === 'private' && projectObj.isPrivateSpace === true)|| (type === 'public' && projectObj.isPrivateSpace === false)){
            return;
        }
        if(settingPermission.value !== true || projectDetailPremission.value !== true){
            return;
        }
        if(props.activeTab === 1){
            return;
        }
        let space = type == 'public' ? false : true;
        updateProjectType(projectObj,space)
    }else{
        isSpinner.value = false;
        $toast.error('Upgrade Your Plan',{position: 'top-right'})
    }
}

function updateApp (item,appObj) {
    if(settingPermission.value !== true || projectDetailPremission.value !== true){
        return;
    }
    if(props.activeTab === 1){
        return;
    }
    let fInd = item.apps.findIndex((x) => {
        return x.key === appObj.key;
    })
    item.apps[fInd].appStatus = item.apps[fInd].appStatus === true ? false : true;
    let queryObj = [
        { _id: BSON.ObjectID(item._id) },
        {
            $set: {
                apps: item.apps
            }
        }
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };
    mongodbCrudOperations(query).then(() => {
        $toast.success('Updated successfully',{position: 'top-right'});
    })
    .catch((error) => {
        console.error("ERROR in update project assignee: ", error);
    })
}

function updateTabs (item,appObj,type) {
    if(settingPermission.value !== true || projectDetailPremission.value !== true){
        return;
    }
    if(props.activeTab === 1){
        return;
    }
    if((appObj.setAsDefault == true && type == 'unRead')){
        return;
    }
    let fInd = item.ProjectRequiredComponent.findIndex((x) => {
        return x.keyName === appObj.keyName
    })
    if(type === 'read'){
        if(fInd === -1){
            appObj.viewStatus = true;
            item.ProjectRequiredComponent.push(appObj);
        }else{
            item.ProjectRequiredComponent[fInd].viewStatus = true
        }
    }
    if(type === 'unRead'){
        item.ProjectRequiredComponent.splice(fInd,1)
    }

    let queryObj = [
        { _id: BSON.ObjectID(item._id) },
        { $set: {
            ProjectRequiredComponent: item.ProjectRequiredComponent
        }}
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    }
    mongodbCrudOperations(query).then(() => {
        $toast.success('Updated successfully',{position: 'top-right'});
    })
    .catch((error) => {
        console.error("ERROR in update project assignee: ", error);
    })
}

function openEditSidebar(projectObj, type){
    try{ 
        if(props.activeTab === 1){
            return;
        }
        if(settingPermission.value !== true || projectDetailPremission.value !== true){
            return
        }
        if(type == 'projectStatus' && projectStatusPermission.value !== true){
            return;
        }
        if(type == 'taskStatus' && taskStatusPermission.value !== true){
            return;
        }
        openSidebarInProject.value = true;
        sidebarTitle.value = type;
    }catch(error){
        console.error(error);
    }
}

function colseProject (project,type) {
    if(settingPermission.value !== true || projectDetailPremission.value !== true){
        return;
    }
    let updateObject = {}
    let status;
    if(type === 'close'){
        status = project.projectStatusData.find((x) => x.type === "close");
        updateObject.status = status.value;
        updateObject.statusType = status.type;
    }else{
        status = project.projectStatusData.find((x) => x.default === true);
        if (!status) {
            status = project.projectStatusData.find((x) => x.type === "default_active");
            if (!status) {
                status = project.projectStatusData[0];
            }
        }
        updateObject.status = status.value;
        updateObject.statusType = status.type;
       

    }
    let queryObj = [
        { _id: BSON.ObjectID(project._id) },
        { $set: updateObject}
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    }
    mongodbCrudOperations(query)
    .then(()=>{
        if(type === 'reopen') {
            restoreChildTasks(project._id);
            let historyObj = {
                key : "Project_EndDate",
                message : `<b>${userData.Employee_Name}</b> has reopen <b>${project.ProjectName}</b> project</b>.`
            }
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": project._id,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })
        } else {
            restoreChildTasks(project._id, 8);
        }
        $toast.success('Updated successfully',{position: 'top-right'});
    }).catch((error) => {
        console.error("ERROR in update project assignee: ", error);
    })
}


function deleteProject(project, deletedStatusKey) {
    let updateObject = {};
    updateObject.deletedStatusKey = deletedStatusKey;

    let queryObj = [
        { _id: BSON.ObjectID(project._id) },
        { $set: updateObject }
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    }
    mongodbCrudOperations(query)
        .then(() => {
            deleteChildTasks(project, true);
            commit('projectData/mutateProjects', [{ op: "modified", data: { ...project, ...updateObject } }]);
            let historyObj = {
                key: "Project_EndDate",
                message: `<b>${userData.Employee_Name}</b> has deleted <b>${project.ProjectName}</b> project</b>.`
            }
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": project._id,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })

            $toast.success('Deleted successfully', { position: 'top-right' });
        }).catch((error) => {
            console.error("ERROR in delete project : ", error);
        })
}

function deleteChildTasks(project, update = false) {
    if (update) {

        try {
            const taskStatusUpdateQuery = {
                type: "updateMany",
                collection: dbCollections.TASKS,
                data: [
                    {
                        ProjectID: BSON.ObjectID(project._id),
                        deletedStatusKey: { $in: [0, undefined] }
                    },
                    { $set: { deletedStatusKey: 1 } },
                ]
            }
            mongodbCrudOperations(taskStatusUpdateQuery)
                .catch((error) => {
                    console.error(error)
                })
        } catch (error) {
            console.error(error)
        }
    }
}

function unarchiveProject(project) {
    try {
        const query = {
            type: "findOneAndUpdate",
            collection: dbCollections.PROJECTS,
            data: [
                {
                    _id: BSON.ObjectID(project._id)
                }, {
                    $set: {
                        deletedStatusKey: 0
                    }
                }
            ]
        }
        mongodbCrudOperations(query).then(()=>{
            restoreChildTasks(project._id, 7);
            let historyObj = {
                key : "Project_EndDate",
                message : `<b>${userData.Employee_Name}</b> has unarchived <b>${project.ProjectName}</b> project</b>.`
            }
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": project._id,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })
            $toast.success('Updated successfully',{position: 'top-right'});
        }).catch((error) => {
            console.error("ERROR in unarchive project: ", error);
        })
    } catch (error) {
        console.error("ERROR in unarchive project: ", error);
    }
}

function restoreChildTasks(projectId, restoreKey = 8) {
    // UPDATE CHILD TASKS | TYPESENE
    try {
        let taskDeleteStatusKey = 0;
        const taskStatusUpdateQuery = {
            type: "updateMany",
            collection: dbCollections.TASKS,
            data: [
                {
                    ProjectID: BSON.ObjectID(projectId),
                    deletedStatusKey: restoreKey
                },
                { $set: {deletedStatusKey: taskDeleteStatusKey}},
            ]
        }

        mongodbCrudOperations(taskStatusUpdateQuery)
        .catch((error) =>{
            console.error(error)
        })
    } catch (error) {
        console.error(`ERROR in update sprint tasks: `, error);
    }
}

function updateProjectType (projectObj,isPrivate) {
    let obj = {
        type: 'findOneAndUpdate',
        collection : dbCollections.COMPANIES,
        global: true,
        data: [
            { _id : BSON.ObjectID(companyId.value)},
            { $inc: {}},
            { returnNewDocument: true }
        ]
    }
    if(isPrivate === true){
        obj.data[1].$inc = {'projectCount.privateCount':1, 'projectCount.publicCount':-1};
    }else{
        obj.data[1].$inc = {'projectCount.publicCount':1, 'projectCount.privateCount':-1};
    }
    mongodbCrudOperations(obj).then(() => {
        let type = isPrivate === true ? 'private' : 'public';
        if(checkSpecificTypeCount(type) === true){
            // Update project type
            let queryObj = [
                { _id: BSON.ObjectID(projectObj._id) },
                { $set: {
                    isPrivateSpace: isPrivate
                }}
            ];
        
            const query = {
                type: "updateOne",
                collection: dbCollections.PROJECTS,
                data: queryObj
            };
        
            mongodbCrudOperations(query).then(() => {
                let historyObj = {
                    key : "Project_EndDate",
                    message : `<b>${userData.Employee_Name}</b> has changed <b>Share with option</b> as <b>${type}</b></b>.`
                }
                apiRequest("post", env.HANDLE_HISTORY, {
                    "type": 'project',
                    "companyId": companyId.value,
                    "projectId": projectObj._id,
                    "taskId": null,
                    "object": historyObj,
                    "userData": userData
                })
                $toast.success('Updated successfully',{position: 'top-right'});
            })
        }
        //If you don't have plans to update private or public projects, that time count is decresed
        else{
            isSpinner.value = false;
            $toast.error('Upgrade Your Plan',{position: 'top-right'})
            let obj = {
                type: 'findOneAndUpdate',
                collection : dbCollections.COMPANIES,
                global: true,
                data: [
                    { _id : BSON.ObjectID(companyId.value)},
                    { $inc: {}},
                    { returnNewDocument: true }
                ]
            }
            if(isPrivate === true){
                obj.data[1].$inc = {'projectCount.privateCount':-1, 'projectCount.publicCount':1};
            }else{
                obj.data[1].$inc = {'projectCount.publicCount':-1, 'projectCount.privateCount':1};
            }
            mongodbCrudOperations(obj).catch((error) => {
                console.error("ERROR ", error);
            })
        }
    })
}

</script>

<style scoped>
@import "./style.css";
</style>