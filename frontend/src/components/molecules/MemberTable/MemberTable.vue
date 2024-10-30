<!--
    IMPORTANT NOTE: 

    IF YOU HAVE CHANGES IN THIS FILE, PLEASE VERIFY THE CHANGES BECAUSE THIS FILE IS CONNECTED TO THE PAYMENT MODULE.
    AND YOUR CHANGES ARE REQUIRED. ALSO ADD YOUR CHANGES TO THE 'CHARGEBEE-SETUP' AND 'PADDLE-SETUP' FOLDER.
-->
<template>
    <div class="currencies_wrapper overflow-y-auto  style-scroll">
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <div class="manufacture_create_content currencies_table border_active" :class="[{'pointer-event-none':isSpinner == true}]">
            <table class="memebertableClass"  v-if="(activeTab === 0 ? filteredList : filteredRemovedList).length">
                <thead>
                    <tr class="border-0 bg-colorlightgray">
                        <th class="th__name">Name</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Role</th>
                        <th>Last Active</th>
                        <th v-if="activeTab === 0">Status</th>
                        <th>Time Tracker</th>
                        <th class="th__settings">Settings</th>
                        </tr>
                </thead>
                <tbody>
                    <MemberRowCompo
                        v-for="(item, itemIndex) in activeTab === 0 ? filteredList : filteredRemovedList"
                        :key="'item'+itemIndex"
                        :item="item" 
                        :itemIndex="itemIndex"
                        :userData="activeTab === 0 ? filteredList : filteredRemovedList"
                        :activeTab="activeTab"
                        :page="page"
                        :timeTrackerAppPermission="curentCompany?.planFeature?.timeTrackingProjectApp"
                        @removeUser="(item) => removeCompanyUser(item)"
                        @removeRequest="(item,req) => cancelInvitation(item,req)"
                        @removePermenet="(item,req) => requestRemoveFunction(item)"
                        @inviteUser="(email,type,designation,flag,isFromRemove) => $emit('inviteUserParent',email,type,designation,flag,isFromRemove)"
                        @changerole="(item,id) => changeRole(item,id)"
                        @changeDesignation="(item,id) => changeDesignation(item,id)"
                        @manageTimeTrackingPermission="(item)=> manageTtPermission(item)"
                    />
                </tbody>
            </table>
            <div class="errorWrapper" v-else>
                <img src="@/assets/images/svg/No-Search-Result.svg" alt="aliansoftware"/>
                <div class="error-text">
                    <h2>No data found</h2>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script setup>
    import { defineProps, ref, watch, inject, computed } from "vue";
    import MemberRowCompo from "@/components/atom/MemberRowCompo/MemberRowCompo.vue";
    import * as mongoQuery from '@/utils/MongoQueries/crudOperations/crudOperations';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    // 
    import { BSON } from "realm-web";
    import { dbCollections } from '@/utils/FirebaseCollections';
    import * as env from '@/config/env';
    import { useToast } from 'vue-toast-notification';
    import Swal from 'sweetalert2';
    import { useStore } from 'vuex';
    import { apiRequest } from '../../../services';

    const $toast = useToast();
    const  companyId = inject('$companyId');
    // 
    const { getters } = useStore();
    const removeUserSubscriptionData = ref({});
    const isSpinner = ref(false);
    const props = defineProps({
        filteredList: {
            type: Array,
        },
        filteredRemovedList: {
            type: Array,
        },
        activeTab: {
            type: Number,
        },
        perPage: {
            type: Number,
        },
        page: {
            type: Number,
        },
        listingArray: {
            type: Array,
        }
    })
    const emit = defineEmits(["pageClick","arrayCheck", "inviteUserParent", "manageTimeTrackingPermission"]);

    const page = ref(props.page);
    const listingArray = ref(props.listingArray);

    watch(() => props.listingArray, (newVal) => {
        listingArray.value = newVal;
    });
    const designations = computed(() => {
        return getters['settings/designations'];
    });
    const rolesGetter = computed(() => {
        return getters['settings/roles'];
    });

    const curentCompany = computed(() => getters['settings/selectedCompany']);

    const removeCompanyUser = (item) => {
        // 
        removeUserSubscriptionData.value = {type: 'remove', data: item};
        // removeUser();

        // 
        removeUserProcess(item);
    }

    const removeUserProcess = (item) => {
        try {
            const query = {
                type: "updateOne",
                collection: dbCollections.COMPANY_USERS,
                data: [
                    { _id: BSON.ObjectID(item.requestId) },
                      { $set: { isDelete: true, isTrackerUser : false } },
                    { upsert: true }
                ]
            };
            // Update data in "COMPANY_USERS" collection
            mongoQuery.mongodbCrudOperations(query).then(() => {
                const userQuery = {
                    type: "updateOne",
                    collection: dbCollections.USERS,
                    global: true,
                    data: [
                        { _id: BSON.ObjectID(item.userId) },
                        { $pull: { AssignCompany: companyId.value } },
                        { upsert: true }
                    ]
                };
                // Update data in "USERS" collection
                mongoQuery.mongodbCrudOperations(userQuery).then(() => {
                    const companyQuery = {
                        type: "updateOne",
                        collection: dbCollections.COMPANIES,
                        global: true,
                        data: [
                            { _id: BSON.ObjectID(companyId.value) },
                            {
                                $inc: {'companyData.$[elementIndex].users': -1}
                            },
                            {
                                arrayFilters: [{ 'elementIndex.users': { $exists: true } }],
                            }
                        ]
                    };
                    // Update data in "USERS" collection
                    // Update data in "COMPANIES" collection
                    mongoQuery.mongodbCrudOperations(companyQuery).then(() => {
                        let axiosData = {
                            companyId : companyId.value,
                            userId : item.userId,
                        }
                        if(item.isTrackerUser !== undefined && item.isTrackerUser == true) {
                            const updateCompanyQuery = {
                                type: 'findOneAndUpdate',
                                collection: dbCollections.COMPANIES,
                                global: true,
                                data: [
                                    { _id: BSON.ObjectID(companyId.value) },
                                    { $inc: { trackerUsers: -1 } }
                                ]
                            };
                            mongoQuery.mongodbCrudOperations(updateCompanyQuery).catch((err)=>console.error(err));
                        }
                        apiRequest("post", env.REMOVE_USER_NOTIFICATION, axiosData).catch((error) => {
                            console.error(error,"ERROR");
                        })
                        emit('arrayCheck');
                        $toast.success("User removed successfully", {position: 'top-right'});
                    })
                })
            })
        } catch (error) {
            console.error(`Error - remove company user => ${error.message}`);
        }
    }

    const cancelInvitation = (data, isRequest) => {
        // 
        removeUserSubscriptionData.value = {type: 'cancel', data: data, isRequest: isRequest};
        // deleteDoc();

        // 
        deleteDoc(data,isRequest);
    }

    const deleteDoc = (data, isRequest) => {
        try {
            const query = {
                type: "deleteOne",
                collection: dbCollections.COMPANY_USERS,
                data: [
                    { _id: BSON.ObjectID(data.requestId) }
                ]
            };
            // Update data in "COMPANY_USERS" collection
            mongoQuery.mongodbCrudOperations(query).then(() => {
                listingArray.value = listingArray.value.filter((x) => x.requestId !== data.requestId);
                emit('arrayCheck',listingArray.value);
                if(isRequest === false) {

                    //Updating company trackeruser count -- START
                    if(removeUserSubscriptionData.value.data.isTrackerUser !== undefined && removeUserSubscriptionData.value.data.isTrackerUser == true) {
                        const updateCompanyQuery = {
                            type: 'findOneAndUpdate',
                            collection: dbCollections.COMPANIES,
                            global: true,
                            data: [
                                { _id: BSON.ObjectID(companyId.value) },
                                { $inc: { trackerUsers: -1 } }
                            ]
                        };
                        mongoQuery.mongodbCrudOperations(updateCompanyQuery)
                        .then(()=>{
                            listingArray.value = listingArray.value.map((x) => {
                                if(x._id === removeUserSubscriptionData.value.data._id) {
                                    x.isTrackerUser = false;
                                }
                                return x;
                            })
                            emit('arrayCheck',listingArray.value);
                        }).catch((err)=>console.error(err));
                    }
                    // Updating company trackeruser count -- END

                    const companyQuery = {
                        type: "updateOne",
                        collection: dbCollections.COMPANIES,
                        global: true,
                        data: [
                            { _id: BSON.ObjectID(companyId.value) },
                            {
                                $inc: {'companyData.$[elementIndex].users': -1}
                            },
                            {
                                arrayFilters: [{ 'elementIndex.users': { $exists: true } }],
                            }
                        ]
                    };
                    // Update data in "COMPANIES" collection
                    mongoQuery.mongodbCrudOperations(companyQuery).catch((eroor) => {
                        console.error(eroor,"ERROR S");
                    });
                }
                $toast.success("Invitation cancelled successfully",{position: 'top-right'});
            })
        } catch (error) {
            console.error(`Error - cancel invitation => ${error.message}`);
        }
    }

    const changeRole = (roleKey, requestId) => {
        if(props.listingArray && props.listingArray.length) {
            let index = props.listingArray.findIndex((x) => x.requestId === requestId);
            if(index > -1 && props.listingArray[index].roleType === roleKey) {
                return;
            }

            Swal.fire({
                title: 'Are you sure?',
                text: `Are you sure you want to change this user's role to "${rolesGetter.value.filter((x) => x.key === roleKey)[0].name}" ?`,
                showCancelButton: true,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result)=>{
                if (result.value) {
                    const query = {
                        type: "updateOne",
                        collection: dbCollections.COMPANY_USERS,
                        data: [
                            { _id: BSON.ObjectID(requestId) },
                            { $set: { roleType: roleKey } },
                            { upsert: true }
                        ]
                    };
                    // Update data in "COMPANY_USERS" collection
                    mongoQuery.mongodbCrudOperations(query).then(() => {
                        $toast.success("User role changed successfully",{position: 'top-right'});
                        listingArray.value = listingArray.value.map((x) => {
                            if(x.requestId === requestId) {
                                x.roleType = roleKey;
                            }
                            return x;
                        })
                        emit('arrayCheck',listingArray.value);
                    })
                }
            })
        }
    }

    const changeDesignation = (desKey, requestId) => {
        if(props.listingArray && props.listingArray.length) {
            let index = props.listingArray.findIndex((x) => x.requestId === requestId);
            if(index > -1 && props.listingArray[index].designation === desKey) {
                return;
            }

            Swal.fire({
                title: 'Are you sure?',
                text: `Are you sure you want to change this user's designation to "${designations.value.filter((x) => x.key === desKey)[0].name}"?`,
                showCancelButton: true,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result)=>{
                if (result.value) {
                    const query = {
                        type: "updateOne",
                        collection: dbCollections.COMPANY_USERS,
                        data: [
                            { _id: BSON.ObjectID(requestId) },
                            { $set: { designation: desKey } },
                            { upsert: true }
                        ]
                    };
                    // Update data in "COMPANY_USERS" collection
                    mongoQuery.mongodbCrudOperations(query).then(() => {
                        $toast.success("User designation changed successfully.",{position: 'top-right'});
                        listingArray.value = listingArray.value.map((x) => {
                            if(x.requestId === requestId) {
                                x.designation = desKey;
                            }
                            return x;
                        })
                        emit('arrayCheck',listingArray.value);
                    })
                }
            })
        }
    }

    // 
    const manageTtPermission = async (dataObj) => {
        isSpinner.value = true;
        const { planFeature, trackerUsers } = curentCompany.value;
        if(planFeature.timeTrackingProjectApp === undefined || (planFeature.timeTrackingProjectApp !== undefined && planFeature.timeTrackingProjectApp == false)) {
            $toast.error("Please upgrade your plan to use Time Tracker.",{position: 'top-right'});
            isSpinner.value = false;
        } else {
            if(dataObj.ops == false) {
                await updateTrackerUsersAndUser(dataObj, companyId.value);
            } else {
                if (trackerUsers === undefined || planFeature.timeTrackerUser === null || (typeof planFeature.timeTrackerUser === 'number' && planFeature.timeTrackerUser > 0 && planFeature.timeTrackerUser > trackerUsers)) {
                    await updateTrackerUsersAndUser(dataObj, companyId.value);
                } else {
                    if(typeof planFeature.timeTrackerUser == 'number' && planFeature.timeTrackerUser == 0) {
                        //When in plan feature timeTrackeruser is 0.
                        $toast.error("Please upgrade your plan to use Time Tracker.",{position: 'top-right'});
                        isSpinner.value = false;
                    } else {
                        //When tracker user limit crosssed
                        $toast.error("Please upgrade your plan to add more Time Tracker Users.",{position: 'top-right'});
                        isSpinner.value = false;
                    }
                }
            }
        }
    };

    const updateTrackerUsersAndUser = async (dataObj, companyId) => {
        try {
            apiRequest("post", env.TRACKER_USER_PERMISSION_MANAGEMENT, {
                CompanyId: companyId,
                DataObj: dataObj
            })
            .then((resp) => {
                if(resp.data.status) {
                    listingArray.value = listingArray.value.map((x) => {
                        if(x[dataObj.data.status === 2 ? 'userId' : '_id'] === dataObj.data[dataObj.data.status === 2 ? 'userId' : '_id']) {
                            x.isTrackerUser = !x.isTrackerUser;
                        }
                        return x;
                    })
                    emit('arrayCheck',listingArray.value);
                    $toast.success(resp.data.message,{position: 'top-right'});
                    isSpinner.value = false;
                } else {
                    isSpinner.value = false;
                    $toast.error(resp.data.message,{position: 'top-right'});
                }
            })
            .catch((err)=>{
                console.error(err);
                $toast.error(err.message,{position: 'top-right'});
                isSpinner.value = false;
            })
        } catch (error) {
            console.error('ERROR IN updateTrackerUsersAndUser.',error);
            isSpinner.value = false;
        }
    };

    const requestRemoveFunction = (data) => {
        try {
            const query = {
                type: "deleteOne",
                collection: dbCollections.COMPANY_USERS,
                data: [
                    { _id: BSON.ObjectID(data.requestId) }
                ]
            };
            mongoQuery.mongodbCrudOperations(query).then(() => {
                $toast.success("Request remove successfully",{position: 'top-right'});
                listingArray.value = listingArray.value.filter((x) => x.requestId !== data.requestId);
                emit('arrayCheck',listingArray.value);
            }).catch((error)=>{
                console.error(error);
            })
        } catch (error) {
            console.error(error);
        }
    }
</script>

<style src="./style.css">
</style>