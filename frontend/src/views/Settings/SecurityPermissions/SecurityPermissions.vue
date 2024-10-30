<template>
    <SpinnerComp :is-spinner="isSpinner || isSpinnerProject" v-if="isSpinner || isSpinnerProject"/>
    <div v-if="loading" :class="[{'position-re':props?.from ? '' :!currentCompany?.planFeature?.globalPermison}]">
        <div v-if="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison">
            <UpgradePlan
                buttonText="Upgrade Your Plan"
                lastTitle="To Unlock Security & Permissions"
                secondTitle="Unlimited"
                firstTitle="Upgrade To"
                message="That feature isn’t available on your current plan"
            />
        </div>
        <div :class="[{'pointer-event-none opacity-5 blur-3-px':props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison}]" v-if="loading" class="position-re">
            <div :class="[{'Settings-pointer-event-none':isSpinner || isSpinnerProject}]" class="projectSecurityAndPermissionWrapper p-1" v-if="(companyUser && (companyUser.roleType === 1 || companyUser.roleType === 2)) || checkPermission('settings.settings_security_permissions') !== null">
                <div class="advancePermission">
                    <div class="d-flex align-items-center justify-content-between headerclass pb-1">
                        <h3 class="font-roboto-sans black font-weight-500">Advanced Permissions</h3>
                        <!-- <a href="#" class="cls-import blue font-roboto-sans" @click.prevent="importRules">Import Default Rules</a> -->
                    </div>
                    <div class="white_box bg-white box-shadow-2">
                        <div class="advancePermissionContent">
                            <div :class="[{'justify-content-end':props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison,'justify-content-between':props?.from ? currentCompany?.planFeature?.projectWisePermisson : currentCompany?.planFeature?.globalPermison}]" class="permissionSearch d-flex align-items-center">
                                <input v-if="props?.from ? currentCompany?.planFeature?.projectWisePermisson : currentCompany?.planFeature?.globalPermison" type="search" v-model="searchValue" placeholder="Search" class="form-control search__input">
                                <button v-if="checkPermission('settings.settings_security_permissions') === true" class="blue_btn bg-blue white border-0" :class="[{'opacity-5 pointer-event-none':props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison,'cursor-pointer':props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison,'justify-content-between':props?.from ? currentCompany?.planFeature?.projectWisePermisson : currentCompany?.planFeature?.globalPermison}]" @click="updateRules">Save</button>
                            </div>
                            <SecurityandPermissionTable :searchValue="searchValue" :withoutOwnerRoles="withoutOwnerRoles"
                                :advancedPermissionBody="advancedPermissionBody" :changeRule="changeRule" :from="from" 
                                :planCondition="props?.from ? currentCompany?.planFeature?.projectWisePermisson : currentCompany?.planFeature?.globalPermison"
                            />
                        </div>
                    </div>
                </div>
                <div class="permissionAllowWrapper mt-2 box-shadow-2" v-if="props?.from === '' && false">
                    <div class="white_box bg-white">
                        <div class="d-flex align-items-center">
                            <label class="switch position-re d-inline-block">
                                <Toggle v-if="checkPermission('settings.settings_security_permissions') === true" type="checkbox"
                                    v-model="allowAdminForPrivateSpace" :disabled="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison" :true-value="true" :false-value="false"
                                    @click="updateToggledRule('admin')" />
                                <Toggle v-else :disabled="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison" :true-value="true" :false-value="false" />
                            </label>
                            <div class="permission-allow-text ml-1">
                                <label class="font-weight-500 black font-roboto-sans">Allow admins to manage private
                                    Spaces</label>
                                <p>When enabled, admins will be able to add/remove people and transfer ownership of all Spaces.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="white_box bg-white">
                        <div class="d-flex align-items-center">
                            <label class="switch position-re d-inline-block">
                                <Toggle v-if="checkPermission('settings.settings_security_permissions') === true" type="checkbox"
                                    v-model="showAllProjects" :true-value="true" :false-value="false"
                                    @click="updateToggledRule('projects')"
                                    :disabled="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison"    
                                />
                                <Toggle v-else :disabled="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison" :true-value="true" :false-value="false" />
                            </label>
                            <div class="permission-allow-text ml-1">
                                <label class="font-weight-500 black font-roboto-sans">Show all projects</label>
                                <p>When enabled, users will be able to see all the global projects.</p>
                            </div>
                        </div>
                    </div>
                    <div class="white_box bg-white">
                        <div class="d-flex align-items-center">
                            <label class="switch position-re d-inline-block">
                                <Toggle v-if="checkPermission('settings.settings_security_permissions') === true" type="checkbox"
                                    v-model="showAllTasks" :true-value="true" :false-value="false"
                                    @click="updateToggledRule('tasks')"
                                    :disabled="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison"    
                                />
                                <Toggle v-else :disabled="props?.from ? !currentCompany?.planFeature?.projectWisePermisson :!currentCompany?.planFeature?.globalPermison" :true-value="true" :false-value="false" />
                            </label>
                            <div class="permission-allow-text ml-1">
                                <label class="font-weight-500 black font-roboto-sans">Show all tasks</label>
                                <p>When enabled, users will be able to see all the tasks in the sprints.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center">
                <img :src="accesDenied" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useStore } from "vuex";
    import { BSON } from 'realm-web';
    import { useToast } from 'vue-toast-notification';
    import { useCustomComposable } from '@/composable';
    import { ref, computed, watch, onMounted } from "vue";
    import Toggle from "@/components/atom/Toggle/Toggle.vue"
    import { dbCollections } from '@/utils/FirebaseCollections';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
    import SecurityandPermissionTable from '@/components/molecules/SecurityandPermissionTable/SecurityandPermissionTable.vue'
    //variable
    const oldRules = ref([]);
    const loading = ref(true);
    const searchValue = ref("");
    const isSpinner = ref(false);
    const showAllTasks = ref(true);
    const showAllProjects = ref(true);
    const advancedPermissionBody = ref([]);
    const allowAdminForPrivateSpace = ref(true);
    //store
    const $toast = useToast();
    const { getters } = useStore();
    const rulesInterval = ref(null);
    const { checkPermission } = useCustomComposable();

    const props = defineProps({
        from:{
            type:String,
            default:''
        },
        projectData:{
            type:Object,
            default:() => {}
        },
        isSpinnerProject:{
            type:Boolean,
        }
    })
    //computed
    const withoutOwnerRoles = computed(() => {
        return getters["settings/withoutOwnerRoles"];
    });
    const rawRules = computed(() => {
        if(props?.from === 'project_rules'){
            return getters["settings/projectRawRules"];
        }else{
            return getters["settings/rawRules"];
        }
    });
    const rules = computed(() => {
        if(props?.from === 'project_rules'){
            return getters["settings/projectRules"];
        }else{
            return getters["settings/rules"];
        }
    });
    const currentCompany = computed(() => getters["settings/selectedCompany"])
    const companyUser = ref(getters['settings/companyUserDetail']);
    const accesDenied = require("@/assets/images/access_denied_img.png");
    //watch
    watch(() => rawRules.value, (val) => {
        if (val.length) {
            getRulesData(JSON.parse(JSON.stringify(val)))
        }
    })

    watch(() => rules.value, (val) => {
        if (val.length) {
            getRulesData(JSON.parse(JSON.stringify(val)))
        }
    })

    //onMounted
    onMounted(() => {
        let count = 0;
        isSpinner.value = true;
        loading.value = false;
        rulesInterval.value = setInterval(() => {
            count++;
            if (rawRules.value && Object.keys(rawRules.value).length) {
                clearInterval(rulesInterval.value);
                getRulesData(JSON.parse(JSON.stringify(rawRules.value)));
            } else if (count > 6) {
                clearInterval(rulesInterval.value);
            }
            loading.value = true;
            isSpinner.value = false;
        }, 500);
    })
    
    const getRulesData = (rules) => {
        let bodyData = [];
        let response = rules.map((doc) => ({ ...doc }));

        response.filter((x) => x.isParent).forEach((data) => {
            if (data.key !== "toggle") {
                bodyData = [...bodyData, data, ...response.filter((x) => x.parentId === data._id).sort((a, b) => a.priorityIndex > b.priorityIndex ? 1 : -1)];
            } else {
                allowAdminForPrivateSpace.value = data.allowAdminForPrivateSpace !== undefined ? data.allowAdminForPrivateSpace === false ? false : data.allowAdminForPrivateSpace : true;
                showAllProjects.value = data.showAllProjects !== undefined ? data.showAllProjects === false ? false : data.showAllProjects : true;
                showAllTasks.value = data.showAllTasks !== undefined ? data.showAllTasks === false ? false : data.showAllTasks : true;
            }
        })

        bodyData.forEach((rule) => {
            withoutOwnerRoles.value.forEach((role) => {
                if (!rule.roles.filter((x) => x.key === role.key).length) {
                    changeRule(null, rule, role);
                }
            })
        })


        advancedPermissionBody.value = bodyData;
        oldRules.value = JSON.parse(JSON.stringify(advancedPermissionBody.value));
    };

    const changeRule = (value, rule, role) => {
        const highlightRow = (id) => {
            let element = document.getElementById(id);
            if (element) {
                element.classList.toggle("highlightRow");
                setTimeout(() => {
                    element.classList.toggle("highlightRow");
                }, 500);
            }
        };

        if (rule.roles && rule.roles.length) {
            let index = rule.roles.findIndex((x) => x.key === role.key);
            if (index !== -1) {
                rule.roles[index].permission = value;
                highlightRow(`${rule.name.replaceAll(' ', '_')}${rule.key}`);
            } else {
                rule.roles.push({
                    key: role.key,
                    permission: value
                })
            }

            if (rule.isParent) {
                if (value !== null) {
                    rule.roles.filter((y) => y.key === role.key)[0].permission = value;
                } else {
                    advancedPermissionBody.value.filter((x) => x.parentId === rule._id).forEach((subRule) => {
                        changeRule(value, subRule, role);
                    })
                }
            } else {
                advancedPermissionBody.value.filter((x) => x._id === rule.parentId).forEach((parentRule) => {
                    let parentValue = null;
                    if (parentRule.roles.length && parentRule.roles.filter((y) => y.key === role.key).length) {
                        parentValue = parentRule.roles.filter((y) => y.key === role.key)[0].permission

                        if (parentValue === null && value === false) {
                            parentRule.roles.filter((y) => y.key === role.key)[0].permission = value;
                            highlightRow(`${parentRule.name.replaceAll(' ', '_')}${parentRule.key}`);
                        } else if (parentValue === null && value === true) {
                            parentRule.roles.filter((y) => y.key === role.key)[0].permission = value;
                            highlightRow(`${parentRule.name.replaceAll(' ', '_')}${parentRule.key}`);
                        } else if (parentValue === false && value === true) {
                            parentRule.roles.filter((y) => y.key === role.key)[0].permission = value;
                            highlightRow(`${parentRule.name.replaceAll(' ', '_')}${parentRule.key}`);
                        }
                    }
                })
            }
        } else {
            rule.roles.push({
                key: role.key,
                permission: value,
            })
        }
    };

    const maxLimit = computed(() => {
        if(currentCompany.value.planFeature.aiRequest === undefined){
            return 0;
        }
        if(currentCompany.value.planFeature.aiRequest === null){
            return null;
        }else{
           return currentCompany.value.planFeature.aiRequest;
        }
    })

    const minLimit = computed(() => {
        if(currentCompany.value.planFeature.aiRequest === undefined){
            return 0;
        }
        if(currentCompany.value.planFeature.aiRequest === null){
            return -1;
        }else{
           return 0;
        }
    })

    const updateRules = () => {
        if(props?.from ? currentCompany.value?.planFeature?.projectWisePermisson : currentCompany.value?.planFeature?.globalPermison){
            if(props?.from === ''){
                isSpinner.value = true;
                let token = advancedPermissionBody.value.find((x) => x.key === 'per_user_generate_limit');
                let isValid = validatePermissions(token, minLimit.value, maxLimit.value);
                if(isValid){
                    advancedPermissionBody.value.forEach((rule) => {
                        withoutOwnerRoles.value.forEach((role) => {
                            if (!rule.roles.filter((x) => x.key === role.key).length) {
                                changeRule(null, rule, role);
                            }
                        })
                    })

                    let promises = [];

                    let count = 0;
                    advancedPermissionBody.value.forEach((rule) => {
                        let ind = oldRules.value.findIndex((x) => x.key === rule.key);
            
                        if (ind !== -1) {
                            count++;
                            /*
                                { _id: BSON.ObjectId(rule._id) }: This specifies the filter condition to target a document by its _id field.
                                { $set: {roles:rule.roles} }: This uses the $set operator to update the document. The obj variable contains the field to be updated based on the condition.
                            */
                            promises.push(
                                mongodbCrudOperations({
                                    type:'updateOne',
                                    collection:dbCollections.RULES,
                                    data:[
                                        { _id: BSON.ObjectId(rule._id) },
                                        { $set: {roles:rule.roles} },
                                    ]
                                }).catch(() => {
                                    console.error("error in update rules");
                                })
                            );
                        }
                    });
                    Promise.allSettled(promises).then(() => {
                        isSpinner.value = false;
                        if (count > 0) {
                            $toast.success('Permission updated successfully', { position: 'top-right' });
                        } else {
                            $toast.success('Nothing to update', { position: 'top-right' });
                        }
                    }).catch((error) => {
                        isSpinner.value = false;
                        console.error("ERROR in update permission: ", error);
                        $toast.error('Something went wrong!', { position: 'top-right' });
                    });
                }else{
                    isSpinner.value = false;
                    $toast.error('Per User Generate Limit value is not valid', { position: 'top-right' });
                }
            }else{
                isSpinner.value = true;
                advancedPermissionBody.value.forEach((rule) => {
                    withoutOwnerRoles.value.forEach((role) => {
                        if (!rule.roles.filter((x) => x.key === role.key).length) {
                            changeRule(null, rule, role);
                        }
                    })
                })
        
                let promises = [];
        
                let count = 0;
                advancedPermissionBody.value.forEach((rule) => {
                    let ind = oldRules.value.findIndex((x) => x.key === rule.key);
        
                    if (ind !== -1) {
                        count++;
                        promises.push(
                            mongodbCrudOperations({
                                type:'updateOne',
                                collection:dbCollections.PROJECT_RULES,
                                data:[
                                    { _id: BSON.ObjectId(rule._id) },
                                    { $set: {roles:rule.roles} },
                                ]
                            }).catch(() => {
                                console.error("error in update rules");
                            })
                        );
                    }
                });
                Promise.allSettled(promises).then(() => {
                    isSpinner.value = false;
                    if (count > 0) {
                        $toast.success('Permission updated successfully', { position: 'top-right' });
                    } else {
                        $toast.success('Nothing to update', { position: 'top-right' });
                    }
                }).catch((error) => {
                    isSpinner.value = false;
                    console.error("ERROR in update permission: ", error);
                    $toast.error('Something went wrong!', { position: 'top-right' });
                });
            }
        }
    };

    const updateToggledRule = (type) => {
        if(props?.from ? currentCompany.value?.planFeature?.projectWisePermisson : currentCompany.value?.planFeature?.globalPermison){
            let obj = {};
    
            if (type === "admin") {
                obj = {
                    allowAdminForPrivateSpace: allowAdminForPrivateSpace.value
                }
            } else if (type === "projects") {
                obj = {
                    showAllProjects: showAllProjects.value
                }
            } else if (type === "tasks") {
                obj = {
                    showAllTasks: showAllTasks.value
                }
            }
            
            let queryObj = [
                { _id: BSON.ObjectId(rules.value.toggle._id) },
                { $set: obj },
            ];
            let object = {
                type:'updateOne',
                collection:dbCollections.RULES,
                data:queryObj
            }
            mongodbCrudOperations(object).then(()=>{
                isSpinner.value = false;
                $toast.success(`Permission updated successfully`, { position: 'top-right' });
            }).catch((error) => {
                isSpinner.value = false;
                console.error("ERROR in toggle rules update: ", error);
                $toast.error('Something went wrong!', { position: 'top-right' });
            });
        }
    };

    function validatePermissions(token, minLimit, maxLimit) {
        if (!token) {
            return true;
        }

        for (let x of token.roles) {
            if (typeof x.permission === 'number') {
                if (!Number.isInteger(x.permission)) {
                    return false;
                }
                const permission = parseInt(x.permission.toLocaleString('fullwide', { useGrouping: false }));
                if (maxLimit === null) {
                    if (permission < minLimit || isNaN(permission)) {
                        return false;
                    }
                } else {
                    if (isNaN(permission) || permission > maxLimit || permission < minLimit) {
                        return false;
                    }
                }
            }else if (x.permission !== null && typeof x.permission !== 'boolean') {
                return false;
            }
        }
        return true;
    }
</script>

<style src="./style.css"></style>