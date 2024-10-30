<template>
    <div>
        <Sidebar :class="[{'position-re':!currentCompany?.planFeature?.projectWisePermisson}]" width="1329px" title="Project Permissions">
            <template #head-right>
                <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="$emit('isClose',true)"/>
            </template>
            <template #body>
                <div :class="[{'pointer-event-none opacity-5 blur-3-px':!currentCompany?.planFeature?.projectWisePermisson}]" class="add_permission_project bg-white d-flex justify-content-between align-items-center"> 
                    <div>
                        <span class="main_para d-block black font-size-14 font-roboto-sans font-weight-500">The ability to grant custom permissions for this project will be {{ projectRawRules?.length === 0 ? 'enabled' : 'disabled' }} </span>
                        <span v-if="projectRawRules?.length === 0" class="second_para d-block GunPowder font-size-12 font-roboto-sans font-weight-400">To override the global permission, it is disabled by default. After it is enabled, you can manage project and task permissions. if it is disabled, the global permissions are then applied.</span>
                    </div>
                    <div v-if="checkPermission('settings.settings_security_permissions') == true">
                        <button :disabled="!currentCompany?.planFeature?.projectWisePermisson" v-if="projectRawRules?.length === 0" class="bg-white permissionButton border-primary font-size-16 blue mr-010 cursor-pointer" :class="[{'disableButton font-size-16':isSpinner}]" @click="applyProjectPermision">Apply Permission</button>
                        <button :disabled="!currentCompany?.planFeature?.projectWisePermisson" v-else class="bg-white permissionButton border-primary blue mr-010 cursor-pointer font-size-16" @click="resetProjectPermission()" :class="[{'disableButton font-size-16':isSpinner}]">Reset Permission</button>
                    </div>
                    <div v-else-if="checkPermission('settings.settings_security_permissions') == false">
                        <button :disabled="!currentCompany?.planFeature?.projectWisePermisson" v-if="projectRawRules?.length === 0" class="bg-white permissionButton border-primary font-size-16 blue mr-010 cursor-pointer disableButton" :class="[{'disableButton font-size-16':isSpinner}]">Apply Permission</button>
                        <button :disabled="!currentCompany?.planFeature?.projectWisePermisson" v-else class="bg-white permissionButton border-primary blue mr-010 cursor-pointer font-size-16 disableButton" :class="[{'disableButton font-size-16':isSpinner}]">Reset Permission</button>
                    </div>
                </div>
                <SecurityPermissions v-if="projectRawRules && projectRawRules.length > 0" :from="'project_rules'" :projectData="projectData" :isSpinnerProject="isSpinner"></SecurityPermissions> 
                <div v-if="projectRawRules.length <= 0 && !currentCompany?.planFeature?.projectWisePermisson">
                    <UpgradePlan
                        buttonText="Upgrade Your Plan"
                        lastTitle="To Unlock Project Permissions"
                        secondTitle="Unlimited"
                        firstTitle="Upgrade To"
                        message="That feature isn’t available on your current plan"
                    />
                </div>
            </template>
        </Sidebar>
    </div>
</template>
<script setup>
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import { computed, defineEmits, inject, onMounted, ref } from "vue";
    import { useStore } from 'vuex';
    import SecurityPermissions from '@/views/Settings/SecurityPermissions/SecurityPermissions.vue';
    import { apiRequest } from "@/services";
    import * as env from '@/config/env';
    import { useRoute } from 'vue-router';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
    import { BSON } from 'realm-web';
    import { useCustomComposable } from '@/composable';
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';

    const { getters, dispatch } = useStore();
    const {checkPermission} = useCustomComposable()
    defineEmits(["isClose"])

    defineProps({
        projectData:{
            type:Object,
            default:() => {}
        }
    })
    const isSpinner = ref(false)
    const projectRawRules = computed(() => {
        return getters["settings/projectRawRules"];
    });
    const currentCompany = computed(() => getters["settings/selectedCompany"]);
    const route = useRoute();

    const companyId = inject('$companyId');
    const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");

    onMounted(() => {
        if(getters["settings/projectRawRules"] && getters["settings/projectRawRules"].length > 0){
            if(getters["settings/projectRawRules"].some((x) => x.projectId === route.params.id)){
                return;
            }else{
                dispatch("settings/setProjectRules", {pid: route.params.id})
            }
        }
        else{
            dispatch("settings/setProjectRules", {pid: route.params.id})
        }
    })

    function applyProjectPermision () {
        if(currentCompany.value?.planFeature?.projectWisePermisson){
            isSpinner.value = true;
            apiRequest("post", env.PROJECT_RULES, {
                companyId : companyId.value,
                type : 'project',
                projectId : route.params.id
            }).then(() => {
                let queryObj = [
                    { _id: BSON.ObjectID(route.params.id) },
                    { $set: { isGlobalPermission: false }},
                ];
    
                const query = {
                    type: "updateOne",
                    collection: dbCollections.PROJECTS,
                    data: queryObj
                };
    
                mongodbCrudOperations(query)
                .then(() => {
                    isSpinner.value = false;
                })
                .catch((err)=>{
                    isSpinner.value = false;
                    console.error(err,"Error in Project Global permission Update");
                })
            }).catch((error) => {
                isSpinner.value = false;
                console.error(error,"ERROR IN IMPORT PROJECT PERMISSION");
            });
        }
    }

    function resetProjectPermission () {
        if(currentCompany.value?.planFeature?.projectWisePermisson){
            isSpinner.value = true;
            let queryObj = [
                { projectId: route.params.id}
            ];
            const query = {
                type: "deleteMany",
                collection: dbCollections.PROJECT_RULES,
                data: queryObj
            };
            mongodbCrudOperations(query).then(() => {
                let queryObj = [
                    { _id: BSON.ObjectID(route.params.id) },
                    { $set: { isGlobalPermission: true }},
                ];

                const query = {
                    type: "updateOne",
                    collection: dbCollections.PROJECTS,
                    data: queryObj
                };

                mongodbCrudOperations(query)
                .then(() => {
                    isSpinner.value = false;
                })
                .catch((err)=>{
                    isSpinner.value = false;
                    console.error(err,"Error in Project Global permission Update");
                })
            }).catch(() => {
                isSpinner.value = false;
            });
        }
    }
</script>

<style src="./style.css">
</style>