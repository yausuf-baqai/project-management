<template>
<div class="createProjectSidebarWrapper commonProjectSidebar">
    <Sidebar  :visible="createTemplateSidebar" :grouped="true" :enable-search="false"
        :multi-select="false" @clear="items = []" :width="!isDisplayTemplate ? '607px' : '1329px'" @update:visible="$emit('closeSidebar',$event)" :top="clientWidth <= 767 ? '0px' : '46px'">
        <template #head-left>
                <div class="blue font-roboto-sans">Create Template</div>
            </template>
            <template #head-right>
                <button class="bg-white cancelButtonTeam blue font-roboto-sans cursor-pointer" @click="emit('closeSidebar',false);">Cancel</button>
            </template>
        <template #body>
            <div class="sidbar-bodytamplate">
                <div id="create-project-loading" v-if="activeIndex === 0" class="createProjectWizardSlider">
                    <TemplateBasicDetail v-if="activeIndex === 0" v-model="formData" :defaultMainTemplate="defaultMainTemplate"/>
                </div>
                <div id="create-project-loading" v-if="activeIndex === 1" class="createProjectWizardSlider">
                    <ProjectTaskTypeForm v-if="activeIndex === 1" v-model="formData.taskTypeForm" :from="'Template'"/>
                </div>
                <div id="create-project-loading" v-if="activeIndex === 2" class="createProjectWizardSlider">
                    <ProjectStatusForm v-if="activeIndex === 2" v-model="formData.projectStatusForm" :from="'Template'"/>
                </div>
                <div id="create-project-loading" v-if="activeIndex === 3" class="createProjectWizardSlider">
                    <TaskStatusForm v-if="activeIndex === 3" v-model="formData.taskStatusForm" :from="'Template'"/>
                </div>
                <div id="create-project-loading" v-if="activeIndex === 4" class="createProjectWizardSlider">
                    <ProjectAlianAppsForm v-if="activeIndex === 4" v-model="formData.alianAppsObj"/>
                </div>
                <div id="create-project-loading" v-if="currentCompany?.planFeature?.customFields === true && activeIndex === 5 && JSON.parse(JSON.stringify(formData?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus === true && currentCompany?.planFeature?.customFields === true" class="createProjectWizardSlider">
                    <CustomFieldComp :customField="customFiedlsValue" @manageCustomField="(val)=>{customFiedlsValue = val}"/>
                </div>
                <div id="create-project-loading" v-if="activeIndex === (JSON.parse(JSON.stringify(formData?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus === true && currentCompany?.planFeature?.customFields === true ? 6 : 5)" class="createProjectWizardSlider">
                    <ProjectRequiredViewForm v-if="activeIndex === (JSON.parse(JSON.stringify(formData?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus === true && currentCompany?.planFeature?.customFields === true ? 6 : 5)" v-model="formData.requiredViewobj"/>
                </div>
                <div id="create-project-loading" v-if="activeIndex === (JSON.parse(JSON.stringify(formData?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus === true && currentCompany?.planFeature?.customFields === true ? 7 : 6)" class="createProjectWizardSlider">
                    <TemplateAllDetailPage v-if="activeIndex === (JSON.parse(JSON.stringify(formData?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus === true && currentCompany?.planFeature?.customFields === true ? 7 : 6)" v-model="formData"/>
                </div>
                <div class="conditional-btn-wrapper d-flex justify-content-end mt-29px">
                    <button v-if="activeIndex > 0 && !isSpinner"  @click="prevStep()" class="cursor-pointer conditional-previous-step btn border-primary border-radius-4-px blue bg-white">Previous</button>
                    <button v-if="activeIndex < (JSON.parse(JSON.stringify(formData?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus === true && currentCompany?.planFeature?.customFields === true ? 7 : 6) && activeIndex !== -1" @click="nextStep()" class="cursor-pointer conditional__template-project outline-primary font-roboto-sans font-size-16 border-radius-4-px white border-0 btn-bg-blue" :class="[{'conditional__template-projectstepOne' : activeIndex === 0}]">Next</button>
                    <button v-else-if="activeIndex !== -1 && !isSpinner" @click="submitData()" class="submit-btn cursor-pointer create__template btn border-radius-4-px white border-0 btn-bg-blue" >Create Template</button>
                    <button v-else-if="isSpinner" type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans btn-bg-blue white cursor-pointer font-weight-500 pointer-event-none" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
            </div>
        </template>
    </Sidebar>
</div>
</template>
<script setup>
import { useStore } from "vuex";
import { defineComponent, ref, inject, defineEmits,computed } from "vue";
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue";
import TemplateBasicDetail from "@/views/Settings/Template/TemplateBasicDetail.vue";
import ProjectTaskTypeForm from '@/components/templates/CreateProject/ProjectTaskTypeForm.vue';
import ProjectStatusForm from '@/components/templates/CreateProject/ProjectStatusForm.vue';
import TaskStatusForm from '@/components/templates/CreateProject/TaskStatusForm.vue';
import ProjectAlianAppsForm from '@/components/templates/CreateProject/ProjectAlianAppsForm.vue';
import ProjectRequiredViewForm from '@/components/templates/CreateProject/ProjectRequiredViewForm.vue';
import TemplateAllDetailPage from "@/views/Settings/Template/TemplateAllDetailPage.vue";
import { useValidation } from "@/composable/Validation";
import { dbCollections } from "@/utils/FirebaseCollections";
import * as env from '@/config/env';
import {useToast} from 'vue-toast-notification';
import cloneDeep from 'lodash/cloneDeep';
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { apiRequestWithoutCompnay } from "../../../services";
import CustomFieldComp from "@/components/molecules/CustomFieldComp/CustomFieldComp.vue";
const $toast = useToast();
const { getters,commit } = useStore();
const  { checkAllFields } = useValidation();

    defineComponent({
        name: "CreateProject-Component",
        components: {
            Sidebar
        },
    })
    defineProps({
        createTemplateSidebar : {
            type : Boolean,
            default: false
        },
        defaultMainTemplate : {
            type : Array,
            default : ()=>([])
        }
    })
    const formData = ref({
        templateDetail : {
            templateName: {
                value: "",
                rules:
                "required",
                name: "templateName",
                error: "",
            },
            description : {
                value: "",
                rules:
                "required",
                name: "description",
                error: "",
            },
            uploadedImage : {
                value: "",
                rules:
                "required",
                name: "uploadedImage",
                error: "",
            },
            previewImage : {
                value: "",
                rules:
                "required",
                name: "previewImage",
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
        projectStatusForm : {
            projectStatusField : {
                value: {},
                rules:
                "required",
                name: "projectStatusField",
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
        alianAppsObj :{
            value: [],
            rules:
            "required",
            name: "alianAppsObj",
            error: "",
        },
        requiredViewobj: {
            value: [],
            rules:
            "required",
            name: "requiredViewobj",
            error: "",
        }
    })
    const activeIndex = ref(0);
    const isSpinner = ref(false);
    const clientWidth = inject("$clientWidth");
    const CompanyDatabase = inject("$companyId");
    const companyUser = ref(getters['settings/companyUserDetail']);
    const proIconData = ref({});
    const isDisplayTemplate = ref(false);
    const customFiedlsValue = ref([]);
    const emit = defineEmits(["update:visible", "click:closeSidebar", "closeSidebar"]);
    function nextStep(){
        if(activeIndex.value === 0){
            checkAllFields({templateName : formData.value.templateDetail.templateName,description : formData.value.templateDetail.description}).then((valid)=>{
                if(valid){
                    activeIndex.value += 1;
                }
            })
        }
        else{
            if(activeIndex.value === 4) {
                if(JSON.parse(JSON.stringify(formData.value?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData.value?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus == false) {
                    customFiedlsValue.value = [];
                }
            }
            activeIndex.value += 1;
        }
    }
    const projectStaus = computed(() => {
        return cloneDeep(getters['settings/projectStaus']);
    })
    const taskType = computed(() => {
        return cloneDeep(getters['settings/taskType']);
    })
    const taskStatus = computed(() => {
        return cloneDeep(getters['settings/taskStatus']);
    })
    const currentCompany = computed(() => getters["settings/selectedCompany"]);
    function prevStep(){
        activeIndex.value -= 1;
    }
    async function submitData(){
        try {
            isSpinner.value = true;
            var templateProjectStatus = [];
            let activeTemp = [1];
            let doneTemp = [];
            let taskcloseStatus = 2;
            if(Object.keys(formData.value.taskStatusForm.taskStatusField.value).length>0){
                if(formData.value.taskStatusForm.taskStatusField.value.defaultActive && Object.keys(formData.value.taskStatusForm.taskStatusField.value.defaultActive).length > 0){
                    templateProjectStatus.push({
                        'name': formData.value.taskStatusForm.taskStatusField.value.defaultActive.name,
                        'bgColor': formData.value.taskStatusForm.taskStatusField.value.defaultActive.textColor + '35',
                        'textColor': formData.value.taskStatusForm.taskStatusField.value.defaultActive.textColor,
                        'key' : formData.value.taskStatusForm.taskStatusField.value.defaultActive.key,
                        'statusImage': "",
                        'isDeleted' : true,
                        'type': 'default_active'
                    })
                }
                if(formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList && formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList.length > 0){
                    for(let j=0;j<formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList.length;j++){
                        templateProjectStatus.push({
                            'name': formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList[j].name,
                            'bgColor': formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList[j].textColor + '35',
                            'textColor': formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList[j].textColor,
                            'key' : formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList[j].key,
                            'statusImage': "",
                            'isDeleted' : true,
                            'type': 'active'
                        })
                        activeTemp.push(formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList[j].key);
                    }
                }
                if(formData.value.taskStatusForm.taskStatusField.value.DoneStatusList && formData.value.taskStatusForm.taskStatusField.value.DoneStatusList.length > 0){
                    for(let j=0;j<formData.value.taskStatusForm.taskStatusField.value.DoneStatusList.length;j++){
                        templateProjectStatus.push({
                            'name': formData.value.taskStatusForm.taskStatusField.value.DoneStatusList[j].name,
                            'bgColor': formData.value.taskStatusForm.taskStatusField.value.DoneStatusList[j].textColor + '35',
                            'textColor': formData.value.taskStatusForm.taskStatusField.value.DoneStatusList[j].textColor,
                            'key' : formData.value.taskStatusForm.taskStatusField.value.DoneStatusList[j].key,
                            'statusImage': "",
                            'isDeleted' : true,
                            'type': 'done'
                        })
                        doneTemp.push(formData.value.taskStatusForm.taskStatusField.value.DoneStatusList[j].key);
                    }
                }
                if(formData.value.taskStatusForm.taskStatusField.value.defaultComplete && Object.keys(formData.value.taskStatusForm.taskStatusField.value.defaultComplete).length > 0){
                    templateProjectStatus.push({
                        'name': formData.value.taskStatusForm.taskStatusField.value.defaultComplete.name,
                        'bgColor': formData.value.taskStatusForm.taskStatusField.value.defaultComplete.textColor + '35',
                        'textColor': formData.value.taskStatusForm.taskStatusField.value.defaultComplete.textColor,
                        'key' : formData.value.taskStatusForm.taskStatusField.value.defaultComplete.key,
                        'statusImage': "",
                        'isDeleted' : true,
                        'type': 'close'
                    })
                }
            }
            let index = projectStaus.value.findIndex((x) => {
                return x._id === formData.value.projectStatusForm.projectStatusField.value._id
            })

            let taskTypeindex = taskType.value.findIndex((x) => {
                return x._id === formData.value.taskTypeForm.taskTypeField.value._id
            })
            let taskTypeValue = taskType.value[taskTypeindex];

            let taskStatusindex = taskStatus.value.findIndex((x) => {
                return x._id === formData.value.taskStatusForm.taskStatusField.value._id
            })
            let taskStausValue = taskStatus.value[taskStatusindex];
            let projectStausValue = projectStaus.value[index];
            const currencyObject = {
                'symbol': '₹',
                'name':'Indian Rupee',
                'symbol_native':'টকা',
                'decimal_digits':2,
                'rounding': 0,
                'code':'INR',
                'name_plural':'Indian rupees'
            }
            if(formData.value.templateDetail.previewImage.value !== ""){
                const randomNumber = parseInt(Date.now() * Math.random());
                const name = randomNumber + "_" + formData.value.templateDetail.previewImage.value.name.replaceAll(" ", "_");
                let filePath = `ProjectTemplate/${name}`;

                const apiFormData = new FormData();
                apiFormData.append("file", formData.value.templateDetail.previewImage.value);
                apiFormData.append("companyId", CompanyDatabase.value);
                apiFormData.append("path", filePath);

                await apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, apiFormData, "form").then((res)=>{
                    if(res.data.status){
                        proIconData.value = {type:"image", data: res.data.statusText}
                    }else{
                        proIconData.value = {type:"image", data: ''}
                    }
                })
            }
            if(JSON.parse(JSON.stringify(formData.value?.alianAppsObj)).length && JSON.parse(JSON.stringify(formData.value?.alianAppsObj))?.find((e)=>e.key === 'CustomFields').appStatus !== true) {
                customFiedlsValue.value = [];
            }
            const obj = {
                AssigneeUserId: [companyUser.value.userId],
                TemplateName: formData.value.templateDetail.templateName.value,
                templateImageURL: proIconData.value,
                Description : formData.value.templateDetail.description.value,
                CompanyId: CompanyDatabase.value,
                CompanyName: CompanyDatabase.value,
                // 'TemplateCategory': self.selectedCategory,
                LeadUserId: [companyUser.value.userId],
                updatedAt: new Date(),
                createdAt: new Date(),
                customFiedlsValue:customFiedlsValue.value,
                TemplateRequiredComponent : formData.value.requiredViewobj.value.filter((x) => x.viewStatus === true),
                taskStatusData : templateProjectStatus,
                apps : formData.value.alianAppsObj ? formData.value.alianAppsObj : [],
                TemplateTaskActiveKey: activeTemp,
                TemplateTaskDoneKey: doneTemp,
                TemplateTaskCloseKey : taskcloseStatus,
                TemplateTaskType : formData.value.taskTypeForm.taskTypeField.value.taskTypes,
                projectStatusData: [...formData.value.projectStatusForm.projectStatusField.value.projectActiveStatus, ...formData.value.projectStatusForm.projectStatusField.value.projectDoneStatus, {...formData.value.projectStatusForm.projectStatusField.value.projectCompletedStatus}],
                ProjectRequiredDefaultComponent: formData.value.requiredViewobj.value.filter((x) => x.setAsDefault === true)[0].keyName,
                ProjectCurrency:currencyObject,
                projectStatusTemplateId : formData.value.projectStatusForm.projectStatusField.value.projectActiveStatus.length === projectStausValue.projectActiveStatus.length && formData.value.projectStatusForm.projectStatusField.value.projectDoneStatus.length === projectStausValue.projectDoneStatus.length ? formData.value.projectStatusForm.projectStatusField.value._id : '',
                TaskTypeTemplateId : formData.value.taskTypeForm.taskTypeField.value.taskTypes.length === taskTypeValue.taskTypes.length ?  formData.value.taskTypeForm.taskTypeField.value._id : '',
                TemplateTaskStatusId : formData.value.taskStatusForm.taskStatusField.value.ActiveStatusList.length === taskStausValue.ActiveStatusList.length && formData.value.taskStatusForm.taskStatusField.value.DoneStatusList.length === taskStausValue.DoneStatusList.length ?  formData.value.taskStatusForm.taskStatusField.value._id : '',
            }
            const query = {
                type: 'insertOne',
                collection: dbCollections.PROJECT_TEMPLATES,
                data: [obj]
                }
            mongodbCrudOperations(query)
                .then((response)=>{
                let newObj = {op: 'add',data: {...obj,_id: response.insertedId}}
                commit("projectData/mutateprojectTemplate",[newObj])
                $toast.success("Template has been added successfully.",{position: 'top-right'});
                isSpinner.value = false;
                emit('click:closeSidebar',false);
            })
            .catch((error) => {
                isSpinner.value = false;
                console.error(error);
            })
        }
        catch(error){
            isSpinner.value = false;
            console.error(error);
        }
    }
</script>
<style scoped>
@import "./style.css";
</style>