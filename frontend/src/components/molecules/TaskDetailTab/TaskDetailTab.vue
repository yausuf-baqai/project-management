<template>
    <div>
        <div class="createProjectListSidebarContentWrapper" v-if="task._id">
            <div class="d-flex mobile__bg--withPadding" v-if="checkApps('tags')">
                <div class="d-flex align-items-center overflow-auto style-scroll tagList__main-wrapper-sidebar pb-1px">
                    <div v-for="(item, index) in tagChipArray" :key="index" @click.stop="">
                        <div class="tagList taglist__mobile-margin">
                            <TagChip  :data="item" :isBorder="false" :ids="ids"  :tagsArray="project.tagsArray" :taskId="task._id" :sprintId="task.sprintId" :taskName="task.TaskName"/>
                        </div>
                    </div>
                </div>
                <CreateTagPopup :task="task" @send:tagChipArray="(val)=>tagChipArray = val"  @send:ids="(val)=>ids = val" :project="project" :isTaskList="false" />
            </div>
            <Description
                v-if="checkPermission('task.task_description',project?.isGlobalPermission) !== null && checkApps('AI',project) !== undefined && checkPermission('task.task_description',project?.isGlobalPermission) !== undefined && Object.keys(project).length > 0"
                :isShowAi="checkApps('AI',project) && checkPermission('task.task_description',project?.isGlobalPermission) == true"
                :description="task?.descriptionBlock ? task.descriptionBlock : task.description"
                :editPermission="checkPermission('task.task_description',project?.isGlobalPermission)"
                :maxlength="5000"
                :minlength="10"
                @update:description="(val) => updateTaskDescription(val)"
                :projectData="project"
                :from="'task'"
            />
            <SubTasks
                v-if="task.isParentTask && checkPermission('task.sub_task_create',project?.isGlobalPermission) !== null"
                :task="task"
                class="mt-1"
                :parentAssignee="task.AssigneeUserId"
            />
            <div class="position-re">
                <div v-if="checkPermission('task.task_custom_field',project?.isGlobalPermission) !== null && checkApps('CustomFields')">
                    <div :class="[{'pointer-event-none opacity-5 blur-3-px':!currentCompany?.planFeature?.customFields}]">
                        <CustomFieldRender
                            @blurUpdate="submitHandler"
                            @editCustomField="editCustomField"
                            :task="props.task"
                            @isCustomField="isCustomField = true"
                            :editPermission="checkPermission('task.task_custom_field',project?.isGlobalPermission)"
                            :planPermission="currentCompany?.planFeature?.customFields"
                        />
                    </div>
                    <div v-if="!currentCompany?.planFeature?.customFields">
                        <UpgradePlan
                            :isImage="false"
                            buttonText="Upgrade Your Plan"
                            lastTitle="To Unlock Custom Field"
                            secondTitle="Unlimited"
                            firstTitle="Upgrade To"
                            message="That feature isn’t available on your current plan"
                        />
                    </div>
                </div>
            </div>
            <CheckListComponent 
                v-if="checkPermission('task.task_checklist',project?.isGlobalPermission) !== null"
                :taskId="task._id"
                :sprintId="task.sprintId"
                :data="checkList"
                :task="task"
                :permission="checkPermission('task.task_checklist',project?.isGlobalPermission) === true"
                :isSpinnerAi="isSpinnerAi"
            />
            <Attachments
                class="mt-20px"
                v-if="checkPermission('task.task_attachments',project?.isGlobalPermission) !== null"
                :permission="checkPermission('task.task_attachments',project?.isGlobalPermission)"
                :attachments="task.attachments"
                :extensions="fileExtentions"
                @update:add="(files) => newAttachments(files)"
                @update:delete="(file) => deleteAttachments(file)"
                @seAll="(val)=>{openSeeAll(val)}"
                :isSpinner="isSpinner"
                :selectedData="task"
            />
        </div>
    </div>
    <Sidebar
        width="374px"
        :defaultLayout="false"
        :visible="isCustomField"
        :zIndex="8"
        :className="'customFieldSidebar'"
    >
        <template #head-left>
            <span class="font-weight-bold font-size-18">Create Custom Field</span>
        </template>
        <template #head-right>
            <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="isCustomField = false,componentDetail={},customFieldObject={}"/>
        </template>
        <template #body>
            <CustomField
                @customFieldStore="customFieldStore"
                @closeSidebar="handleCloseSidebar"
                :componentDetails="componentDetail && Object.keys(componentDetail).length ? componentDetail : {}"
                :pageInd="componentDetail && Object.keys(componentDetail).length ? 1 : 0"
                :customFieldObject="componentDetail && Object.keys(componentDetail).length ? customFieldObject : {}"
            />
        </template>
    </Sidebar>
    <PromptSidebar v-if="isOpenPromptDeatil" @closePrompt="isOpenPromptDeatil = false" :selectedPrompt="selectedPrompt" @closeMainSidebar="isOpenPromptDeatil = false" :project="project" :task="task" />
</template>

<script setup>
// PACKAGES
import Swal from 'sweetalert2';
import { useStore } from 'vuex';
import { BSON } from 'realm-web';
import { useToast } from 'vue-toast-notification';
import { computed, defineProps, inject, ref, nextTick,onMounted } from 'vue';
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';

// COMPONENTS
import CustomField from '@/components/atom/CustomField/CustomField.vue'
import { dbCollections } from '@/utils/FirebaseCollections';
import Description from '@/components/atom/Description/Description.vue'
import Attachments from '@/components/atom/Attachments/Attachments.vue'
import CheckListComponent from '@/components/molecules/CheckList/CheckList.vue'
import SubTasks from '@/components/organisms/SubTasks/SubTasks.vue'
import CreateTagPopup from "@/components/molecules/TagList/CreateTagPopup.vue";
import TagChip from '@/components/atom/TagChip/TagChip.vue'
import PromptSidebar from "@/components/molecules/PromptSidebar/PromptSidebar.vue";
import { apiRequest, apiRequestWithoutCompnay } from '../../../services';
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue'
import * as env from '@/config/env';
import CustomFieldRender from '@/components/atom/CustomFieldRender/CustomFieldRender.vue';
import axios from 'axios';

// UTILS
import { useCustomComposable, useGetterFunctions } from '@/composable';
import taskClass from '@/utils/TaskOperations';
import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';


const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");
const $toast = useToast();
const { getters,commit } = useStore();
const { getUser } = useGetterFunctions();
const { checkPermission, makeUniqueId, checkBucketStorage,checkApps } = useCustomComposable();

// props
const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
    isSupport:{
        type:Boolean,
        default:false
    }
});

// emit
const emit = defineEmits(["openSeeAll"]);

//computed
const fileExtentions = computed(() => {
    return getters['settings/fileExtentions'];
});
const project = computed(() => {
    return getters["projectData/currentProjectDetails"]
});
const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
});
const checkList = computed(() => props.task.checklistArray);
const currentCompany = computed(() => getters["settings/selectedCompany"]);
const projectsGetter = computed(() => getters["projectData/onlyActiveProjects"]);
const showCustomField = computed(() => checkPermission("task.task_custom_field", project.value?.isGlobalPermission, {gettersVal: getters}));

// ref
const ids = ref();
const tagChipArray = ref();
const isSpinner = ref(false);
const submitted = ref(false);
const componentDetail = ref({});
const customFieldObject = ref({});
const isCustomField = ref(false);
const allProjectsArrayFilter = ref([]);
const CustomFieldData = ref(JSON.parse(JSON.stringify(getters["settings/customFields"])));
const selectedProject = ref([])
const isOpenPromptDeatil = ref(false);
const selectedPrompt = ref({})
const isSpinnerAi = ref(false);

// inject
const userId = inject('$userId');
const companyId = inject('$companyId');

//getUser
const user = getUser(userId.value);

onMounted(() => {
    let data = {
        type: dbCollections.PROJECTS,
        data: [{ _id: process.env.VUE_APP_SUPPORT_PROJECTID}],
    };
    const axiosData = {
        dataObj: data.data,
        dbName: process.env.VUE_APP_SUPPORT_COMPANYID,
        collection: data.type,
        methodName: "findOne",
    };
    axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then((response) => {
        selectedProject.value.push(response.data.statusText)
    });
    if(props.isSupport === true){
        allProjectsArrayFilter.value = selectedProject.value;
    }else{
        allProjectsArrayFilter.value = JSON.parse(JSON.stringify(projectsGetter.value.data))
    }
})

// function
const updateTaskDescription = (val) => {
    let findIndex = allProjectsArrayFilter.value?.findIndex((ele)=>{return ele._id === props?.task?.ProjectID});
    const projectData = {
        id: findIndex == -1 ? project.value._id : allProjectsArrayFilter.value[findIndex]._id,
        ProjectName: findIndex == -1 ? project.value.ProjectName : allProjectsArrayFilter.value[findIndex].ProjectName
    }

    taskClass.updateDescription({
        companyId: companyId.value,
        projectData: projectData,
        sprintId: props.task.sprintId,
        task: props.task,
        userData: {
            id: user.id,
            name: user.Employee_Name,
            companyOwnerId: companyOwner.value._id,
        },
        text: val
    }).then(() => {
        $toast.success('Description updated successfully',{position: 'top-right'});
    })
    .catch((error) => {
        console.error("Error in updating Description: ", error);
        $toast.error('Description not updated',{position: 'top-right'});
    })
};

const newAttachments = (files) => {
    if(!files.length) {
        return;
    }
    let fileList = Array.from(files);
    if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters}) !== true){
        return;
    }
    const count = ref(0);
    let isUpload = true;
    const countFun = (file) => {
        if(count.value >= fileList.length) {
            if(isUpload === true){
                $toast.success('Attachments uploaded successfully',{position: 'top-right'});
            }else{
                $toast.error('Please try again',{position: 'top-right'});
            }
            isSpinner.value = false;
            return;
        } else {
            isSpinner.value = true;
            const uniqueId = parseInt(Date.now() * Math.random());
            const fileName = uniqueId + "_" + file.name;
            const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
            const fileType = file.type;
            const endIndex = fileType.indexOf("/");
            const result = fileType.substring(0, endIndex);

            let imagObj = {
                filename: file.name,
                extension: extension,
                size:file.size,
                id: makeUniqueId(17),
                createdAt: new Date(),
                userId: userId.value,
                type: result
            }
            const formData = new FormData();
            formData.append("file", file);
            formData.append("companyId", companyId.value);
            if(file.type.includes("image")) {
                formData.append("key", "attachmentIcon");
            }
            formData.append("path", `Project/${props.task.ProjectID}/Sprint/${props.task._id}/Attachment/${fileName}`);
            try {
                apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, formData, "form").then((response)=>{
                    if(response.data.status === true){
                        let findIndex = allProjectsArrayFilter.value.findIndex((ele)=>{return ele.id === props?.task?.ProjectID});
                        isUpload = true;
                        if(file.type.includes("image")) {
                            imagObj.url = response.data.statusText[0];
                        } else {
                            imagObj.url = response.data.statusText;
                        }
                        taskClass.updateAttachments({
                            companyId: companyId.value,
                            sprintId: props.task.sprintId,
                            taskId: props.task._id,
                            taskData: props.task,
                            operation: "add",
                            data: imagObj,
                            userData: {
                                id: user.id,
                                name: user.Employee_Name,
                                companyOwnerId: companyOwner.value._id,
                            },
                            projectData: {
                                id: findIndex == -1 ? project.value._id : allProjectsArrayFilter.value[findIndex]._id,
                                ProjectName: findIndex == -1 ? project.value.ProjectName : allProjectsArrayFilter.value[findIndex].ProjectName
                            }
                        }).then(() => {
                            count.value++;
                            countFun(fileList[count.value]);
                        }).catch((error) => {
                            console.error("Error in updating Attachment: ", error);
                            count.value++;
                            countFun(fileList[count.value]);
                        });
                    }else{
                        isUpload = false;
                        count.value++;
                        countFun(fileList[count.value]);
                        isSpinner.value = false;
                    }
                }).catch((err)=>{
                    isUpload = false;
                    count.value++;
                    countFun(fileList[count.value]);
                    isSpinner.value = false;
                    console.error(err,"Error");
                })
            } catch (error) {
                isUpload = false;
                isSpinner.value = false;
                count.value++;
                countFun(fileList[count.value]);
                console.error("Error uploading file:", error);
            }

        }
    }
    countFun(fileList[count.value]);
};

const deleteAttachments = (attachment) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure to delete this file?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result)=>{
        if (result.isConfirmed) {
            isSpinner.value = true;
            const formData = {
                companyId: companyId.value,
                path : attachment.url
            }
            apiRequest("post", env.WASABI_DELETE_FILE, formData).then((response)=>{
                if(response.data.status === true){
                    let findIndex = allProjectsArrayFilter.value.findIndex((ele)=>{return ele._id === props?.task?.ProjectID});
                    taskClass.updateAttachments({
                        companyId: companyId.value,
                        sprintId: props.task.sprintId,
                        taskId: props.task._id,
                        taskData: props.task,
                        operation: "remove",
                        id: attachment.id,
                        data: attachment,
                        userData: {
                            id: user.id,
                            name: user.Employee_Name,
                            companyOwnerId: companyOwner.value._id,
                        },
                        projectData: {
                            id: findIndex == -1 ? project.value._id : allProjectsArrayFilter.value[findIndex]._id,
                            ProjectName: findIndex == -1 ? project.value.ProjectName : allProjectsArrayFilter.value[findIndex].ProjectName
                        }
                    }).then(() => {
                        isSpinner.value = false;
                        $toast.success('Attachment removed successfully',{position: 'top-right'});
                    }).catch((error) => {
                        console.error("Error in removing Attachment: ", error);
                        $toast.error('Attachment not removed',{position: 'top-right'});
                    })
                }else{
                    isSpinner.value = false;
                    $toast.success('Something went wrong',{position: 'top-right'});
                }
            }).catch((err)=>{
                isSpinner.value = false;
                console.error(err,"ERROR IN DELETE ATTACHMENTS");
            })
        }
    })
};
// The custom field value will be submitted to the task collection once all the validations are satisfied.
const submitHandler = async (value,detail,id,edit) => {
    if(showCustomField.value === true){
        if(value && detail.fieldType !== 'checkbox'){
            if(detail.fieldType === 'date'){
                try{
                    detail.fieldValue = new Date(value);
                    insertCustomField(detail,value);
                } catch(error){
                    console.error('ERROR',error);
                }
            }else if(detail.fieldType === 'dropdown'){
                detail.fieldValue = [value.id];
                try {
                    insertCustomField(detail,value);
                } catch(error){
                    console.error('ERROR',error);
                }
            }else if(detail.fieldType === 'number' || detail.fieldType === 'money'){
                try{
                    detail.fieldValue = String(value);
                    insertCustomField(detail,value);
                } catch(error){
                    console.error('ERROR',error);
                }
            }else{
                nextTick(() => {
                    const input = document.getElementById(`${id}`);
                    const ariaDescribedByValue = input.getAttribute('aria-describedby');
                    if(value && ariaDescribedByValue === null){
                        try{
                            if(detail.fieldType === "phone"){
                                if(edit){
                                    detail.fieldValue = "";
                                    detail.fieldCode = value.dialCode;
                                    detail.fieldPattern = value.maskWithDialCode;
                                    detail.fieldFlag = value.code;
                                }else{
                                    detail.fieldValue = detail.fieldValue?.replace(/^\+(\d+)\s|\s|\(|\)|-/g, '');
                                    detail.fieldCode = detail.fieldCode ? detail.fieldCode : detail.fieldCountryCode;
                                    detail.fieldPattern = detail.fieldPattern ? detail.fieldPattern : detail.fieldCountryObject.maskWithDialCode;
                                    detail.fieldFlag = detail.fieldFlag ? detail.fieldFlag : detail.fieldCountryObject.code;
                                }
                            }
                            insertCustomField(detail,value);
                        } catch(error){
                            console.error('ERROR',error);
                        }
                    }
                });
            }
        } else if(detail.fieldType === 'checkbox'){
            try{
                detail.fieldValue = value;
                insertCustomField(detail,value);
            } catch(error){
                console.error('ERROR',error);
            }
        }
    }
};
const insertCustomField = (detail,data) => {
    let updateDetail = {};
    let userData = {
        id: user.id,
        name: user.Employee_Name,
        companyOwnerId: companyOwner.value._id,
    }
    updateDetail.fieldValue = detail.fieldValue;
    if(detail.fieldType === "phone"){
        updateDetail.fieldCode = detail?.fieldCode;
        updateDetail.fieldPattern = detail?.fieldPattern;
        updateDetail.fieldFlag = detail?.fieldFlag;
    }
    updateDetail._id = detail._id;
    let object = {
        type:'updateOne',
        collection: dbCollections.TASKS,
        data: [
            { _id: BSON.ObjectID(props.task._id) },
            { 
                $set: { [`customField.${detail._id}`]: updateDetail }
            }
        ]
    }
    mongodbCrudOperations(object).then(() => {
        let historyObj = {
            'message': `<b>${userData.name}</b> has added value in <b> ${detail.fieldTitle}</b> Custom Field as <b>${data.value ? data.value : data}</b>.`,
            'key' : 'Project_Category',
            'sprintId' : props.task.sprintId
        }
        apiRequest("post", env.HANDLE_HISTORY, {
            "type": 'task',
            "companyId": companyId.value,
            "projectId": props.task.ProjectID,
            "taskId": props.task._id,
            "object": historyObj,
            "userData": userData
        })
        $toast.success("Custom field updated successfully", {position: 'top-right' });
        submitted.value = true
    }).catch((err)=>{
        console.error('ERROR',err);
    });
} 
const customFieldStore = (object,isEdit) => {
    let value = JSON.parse(JSON.stringify(object))
    let userData = {
        id: user.id,
        name: user.Employee_Name,
        companyOwnerId: companyOwner.value._id,
    }
    if(!isEdit){
        value.global = false;
        value.projectId = props.task.ProjectID;
        value.createdAt = new Date();
        value.updatedAt = new Date();
        value.userId = userId.value;
        const query = {
            type: "insertOne",
            collection: dbCollections.CUSTOM_FIELDS,
            data: [value]
        };
        mongodbCrudOperations(query).then((result)=>{
            value._id = result.insertedId
            commit("settings/mutateFinalCustomFields", {data: value || {},op: "added"});
            isCustomField.value = false;
            $toast.success("Field Added Successfully", {position: 'top-right' });
            let historyObj = {
                'message': `<b>${userData.name}</b> has Created <b> Custom Field </b> as <b>${value.fieldTitle}</b>.`,
                'key' : 'Project_CustomField',
            }
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": props.task.ProjectID,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })
            componentDetail.value={};
            customFieldObject.value={};
        }).catch((err)=>{
            $toast.error(err, { position: 'top-right' })
        });
    }else{
        const oldFieldValue = customFieldObject.value.fieldTitle
        value.updatedAt = new Date();
        const query = {
            type: "updateOne",
            collection: dbCollections.CUSTOM_FIELDS,
            data: [
                {
                    _id: BSON.ObjectId(customFieldObject.value._id)
                },
                {
                    $set:{...value}
                }
            ]
        };
        mongodbCrudOperations(query).then(()=>{
            commit("settings/mutateFinalCustomFields", {data: {...customFieldObject.value,...value} || {},op: "modified"});
            if(oldFieldValue !== value.fieldTitle){
                let historyObj = {
                    'message': `<b>${userData.name}</b> has Edited <b> Custom Field </b> from <b>${oldFieldValue}</b> to <b>${value.fieldTitle}</b>.`,
                    'key' : 'Project_CustomField',
                }
                apiRequest("post", env.HANDLE_HISTORY, {
                    "type": 'project',
                    "companyId": companyId.value,
                    "projectId": props.task.ProjectID,
                    "taskId": null,
                    "object": historyObj,
                    "userData": userData
                })
            }
            isCustomField.value = false;
            componentDetail.value={};
            customFieldObject.value={};
            $toast.success("Field Updated Successfully", {position: 'top-right' })
        }).catch((err)=>{
            $toast.error(err, { position: 'top-right' })
        });
    }
};
const handleCloseSidebar = (val,pageIndex) => {
    if(pageIndex === 0) isCustomField.value = val;
    componentDetail.value={};
    customFieldObject.value={};
};
function openSeeAll (value) {
    if(value === 'task'){
        emit("openSeeAll" )
    }
}
const editCustomField = (val) => {
    if(showCustomField.value === true && currentCompany.value?.planFeature?.customFields === true){
        componentDetail.value = CustomFieldData.value.find((x)=> x.cfType === val.fieldType);
        customFieldObject.value = val;
        if(componentDetail.value && Object.keys(componentDetail.value).length){
            isCustomField.value = true;
        }
    }
}
</script>