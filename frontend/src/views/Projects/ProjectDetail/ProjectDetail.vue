<template>
    
    <div class="project__detail-component"  v-if="clientWidth > 767 || isvisible === true">
        <Description
            v-if="checkPermission('project.project_description',projectData.isGlobalPermission) !== null"
            :editPermission="checkPermission('project.project_description',projectData.isGlobalPermission) === true"
            :description="projectData?.descriptionBlock ? projectData?.descriptionBlock : projectData?.description"
            :maxlength="5000"
            :minlength="10"
            @update:description="(val) => updateProjectDescription(val)"
            :projectData="projectData"
            :from="'project'"
        />
        <CheckListComponent 
            v-if="checkPermission('project.project_checklist',projectData.isGlobalPermission) !== null"
            :data="checkList"
            :permission="checkPermission('project.project_checklist',projectData?.isGlobalPermission) === true"
        />
        <Attachments
            class="mt-20px"
            v-if="checkPermission('project.project_attachments',projectData.isGlobalPermission) !== null"
            :permission="checkPermission('project.project_attachments',projectData.isGlobalPermission)"
            :extensions="fileExtentions"
            :attachments="projectData.attachments"
            @update:add="(files) => newAttachments(files)"
            @update:delete="(file) => deleteAttachments(file)"
            :isSpinner="isSpinner"
            :selectedData="projectData"
            @seAll="(val)=>{openSeeAll(val)}"
        />
        <div class="milestone__fixhourly-wrapper" v-if="checkApps('Milestones')">
            <h5 v-if="projectData.ProjectType === 'Fix' && checkPermission('project.project_milestone',projectData.isGlobalPermission) !== null ||
                projectData.ProjectType === 'Hourly' && checkPermission('project.project_milestone',projectData.isGlobalPermission) !== null" class="milestone_font">
                Milestone
            </h5>
            <FixMilestone
                v-if="projectData.ProjectType === 'Fix' && checkPermission('project.project_milestone',projectData.isGlobalPermission) !== null"
                :permissionData="checkPermission('project.project_milestone',projectData.isGlobalPermission)"
                :currency="projectData.ProjectCurrency"
                :projectId="projectData._id"
                :ProjectName="projectData.ProjectName"
                :planCondition="currentCompany?.planFeature?.milestone"
            />

            <HourlyMilestone
                v-if="projectData.ProjectType === 'Hourly' && checkPermission('project.project_milestone',projectData.isGlobalPermission) !== null"
                :projectDataMilestone="projectData"
                :permissionData="checkPermission('project.project_milestone',projectData.isGlobalPermission)"
                :billingPeriodHourly="billingPeriodPro"
                :startDate="startDateProject"
                :planCondition="currentCompany?.planFeature?.milestone"
            />
        </div>
    </div>
</template>

<script setup>
    import { defineProps , inject , computed,watch, ref} from 'vue';
    import { useStore } from 'vuex';
    import { useToast } from 'vue-toast-notification';
    import Description  from '@/components/atom/Description/Description.vue';
    import Attachments from '@/components/atom/Attachments/Attachments.vue';
    import FixMilestone from '@/components/organisms/FixMilestone/FixMilestone.vue';
    import HourlyMilestone from '@/components/organisms/HourlyMilestone/HourlyMilestone.vue';
    import CheckListComponent from '@/components/molecules/CheckList/CheckList.vue'
    import { dbCollections } from "@/utils/FirebaseCollections"
    import * as env from '@/config/env';
    import { apiRequest, apiRequestWithoutCompnay } from '../../../services'
    import Swal from 'sweetalert2';
    import { useCustomComposable, useGetterFunctions } from '@/composable';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
    import { BSON } from "realm-web";

    const companyId = inject('$companyId');
    const $toast = useToast();
    const isSpinner = ref(false);
    const userId = inject('$userId');
    const props = defineProps({
        billingPeriod:{type:String,required: true},
        startDate:{type:Object,required:false},
        isvisible:{type:Boolean,default:() => true}
    });
    const projectData = inject('selectedProject');
    const { checkPermission, makeUniqueId, checkApps, checkBucketStorage } = useCustomComposable();
    const { getters } = useStore();
    const checkList = computed(() => projectData.value.checklistArray)
    const currentCompany = computed(() => getters["settings/selectedCompany"])
    const clientWidth = inject("$clientWidth");
    const emit = defineEmits(["openSeeAllProject"])
    const billingPeriodPro = ref('');
    const startDateProject = ref({});
    const {getUser} = useGetterFunctions();
    const user = getUser(userId.value);
    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId
    }
    watch(() => props.billingPeriod, (newval) => {
        billingPeriodPro.value = newval;
    });
    watch(() => props.startDate,(newValue) => {
        startDateProject.value = newValue;
    });
    watch(
      () => projectData.value._id,(newVal,oldVal) => {
        if (oldVal !== newVal) {
          isSpinner.value = false;
        }
      }
    );
    const fileExtentions = computed(() => {
        return getters['settings/fileExtentions'];
    });

    const updateProjectDescription = (val) => {
        let historyObj = {};
        if(projectData.value.description == ""){
            historyObj.message = `Description of <b>${projectData.value.ProjectName
                }</b> is added as <b title="${val.text}" class="inline-text-ellipsis">"${val.text.length > 20 ? val.text.slice(0, 20) + "..." : val.text
                }"</b>.`;
            historyObj.key = "Project_Description_Added";
        }else{
            historyObj.message = `Description of <b>${projectData.value.ProjectName
                }</b> is changed as <b title="${val.text}" class="inline-text-ellipsis">"${val.text.length > 20 ? val.text.slice(0, 20) + "..." : val.text
                }"</b>.`;
            historyObj.key = "Project_Description_Changed";
        }
        let obj = [
            { _id: BSON.ObjectID(projectData.value._id) },
            { $set: { descriptionBlock: val.blocks } },
            true, // Upsert
            false
        ];

        const query = {
            type: "updateOne",
            collection: dbCollections.PROJECTS,
            data: obj
        };

        const queryRef = mongoQuery.mongodbCrudOperations(query);
        queryRef.then(() => {
            $toast.success('Description updated successfully',{position: 'top-right'});
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": projectData.value._id,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })
        })
        .catch((err) => {
            console.error(err,"Error in Project Description Update");
        })
    }

    const newAttachments = (files) => {
        if(!files.length) {
            return;
        }
        let fileList = Array.from(files);
        if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters}) !== true){
            return;
        }
        let projectdata = JSON.parse(JSON.stringify(projectData.value));
        const count = ref(0);
        let isUpload = true;
        isSpinner.value = true;
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
                const uniqueId = parseInt(Date.now() * Math.random());
                const fileName = uniqueId + "_" + file.name;
                const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
                const fileType = file.type;
                const endIndex = fileType.indexOf("/");
                const result = fileType.substring(0, endIndex);
                let imagObj = {
                    filename: file.name,
                    extension: extension,
                    size: file.size,
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
                formData.append("path", `Project/${projectdata._id}/ProjectAttachment/${fileName}`);
                try {
                    apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, formData, "form").then(async (response)=>{
                        if(response.data.status === true) {
                            try {
                                if(file.type.includes("image")) {
                                    imagObj.url = response.data.statusText[0];
                                } else {
                                    imagObj.url = response.data.statusText;
                                }
                                let attchments = projectdata.attachments || [];
                                let queryObj = [
                                    { _id: BSON.ObjectID(projectdata._id) },
                                    { $set: { attachments:  [...attchments, imagObj] } },
                                    true, // Upsert
                                    false
                                ];

                                const query = {
                                    type: "updateOne",
                                    collection: dbCollections.PROJECTS,
                                    data: queryObj
                                };

                                await mongoQuery.mongodbCrudOperations(query)
                                .then(() => {
                                    projectdata.attachments.push(imagObj)
                                    let historyObj = {
                                        key : "Project_Attachment",
                                        message : `<b>${userData.Employee_Name}</b> has attached <b>${file.name}</b> on <b>${projectdata.ProjectName}</b>.`
                                    }
                                    apiRequest("post", env.HANDLE_HISTORY, {
                                        "type": 'project',
                                        "companyId": companyId.value,
                                        "projectId": projectdata._id,
                                        "taskId": null,
                                        "object": historyObj,
                                        "userData": userData
                                    }).then(() => {
                                        count.value++;
                                        countFun(fileList[count.value]);
                                    })
                                })
                                .catch((err) => {
                                    count.value++;
                                    countFun(fileList[count.value]);
                                    console.error(err,"Error in Project Description Update");
                                })
                                isUpload = true;
                            } catch (error) {
                                console.error("ERROR: ", error);
                            }
                        } else {
                            isUpload = false;
                            count.value++;
                            countFun(fileList[count.value]);
                            isSpinner.value = false;
                            console.error(response,"Error");
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
    }

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
                apiRequest("post", env.WASABI_DELETE_FILE, formData).then(async (response)=>{
                    if(response.data.status === true){
                        let queryObj = [
                            { _id: BSON.ObjectID(projectData.value._id) },
                            { $set: { attachments:  projectData.value.attachments.filter((x) => x.id !== attachment.id) } },
                            true, // Upsert
                            false
                        ];

                        const query = {
                            type: "updateOne",
                            collection: dbCollections.PROJECTS,
                            data: queryObj
                        };

                        await mongoQuery.mongodbCrudOperations(query)
                        .then(() => {
                            isSpinner.value = false;
                            let historyObj = {
                                key : "Project_Attachment",
                                message : `<b>${userData.Employee_Name}</b> has deleted <b>${attachment.filename}</b> on <b>${projectData.value.ProjectName}</b>.`
                            }
                            apiRequest("post", env.HANDLE_HISTORY, {
                                "type": 'project',
                                "companyId": companyId.value,
                                "projectId": projectData.value._id,
                                "taskId": null,
                                "object": historyObj,
                                "userData": userData
                            })
                            $toast.success('Attchments deleted successfully',{position: 'top-right'});
                        })
                        .catch((err) => {
                            console.error(err,"Error in Attchments Update");
                        })
                    }else{
                        isSpinner.value = false;
                        $toast.error('Something went wrong',{position: 'top-right'});
                    }
                }).catch((err)=>{
                    isSpinner.value = false;
                    console.error(err,"ERROR IN DELETE ATTACHMENTS");
                })
            }
        })
    }

    function openSeeAll(data) {
        if(data === 'project'){
            emit("openSeeAllProject" )
        }
    }
</script>
<style scoped>
.project__detail-component{
    padding: 20px 18.5px;
}
</style>