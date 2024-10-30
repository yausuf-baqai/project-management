<template>
    <SpinnerComp :is-spinner="isSpinner" />
    <div class="Notification_main p-1" :class="[{'pointer-event-none':isSpinner}]">
        <div class="d-flex justify-content-between align-items-center pb-1">
            <h3 class='m-0 black Notification_header'>Notification Settings</h3> 
        </div>
        <div class="white-box">
            <div class="advancePermissionContent" >
                <div class="overflow-auto Permissions-table style-scroll">
                    <div class="thead position-sti">
                        <div class="tr">
                            <div class="th">
                                <!-- <div class="blank_wrapper1"></div>
                                <div class="blank_wrapper2"></div> -->
                                <div class="header_col_blank"></div>
                                <div class="header_col header_col__email">Email</div>
                                <div class="header_col header_col__browser">Browser</div>
                                <div class="header_col header_col__mobile">Mobile</div>
                            </div>
                        </div>
                    </div>      
                    <div class="tbody">   
                        <div v-for="(item, index) in settings" :key="index">
                            <div class="section-name">
                                <h4 class="mt-1 sectionName Notification_header black">{{item.sectionName}}</h4>
                            </div>
                            <NotificationTableRow 
                                v-for="(items, index) in item.items" :key="index" 
                                :Title="items.name" :dropdown1="items.notifySelection && items.notifySelection" 
                                :dropdown2="(index==0 && item.sectionName == 'Tasks') ? false : items.notifySelection" 
                                :Email="items.email" 
                                :Mobile="items.mobile" 
                                :Browser="items.browser" 
                                :dropdown1Value="items.notifyFor"
                                :dropdown2Value="items.duration"
                                @mail="(val)=>{Changemail(val,items,item.key)}" 
                                @browser="(val) => {Changebowser(val,items,item.key)}" 
                                @mobile="(val) => {Changemobile(val,items,item.key)}"
                                @duration="(val) => {Handledropdown(val,items,'duration',item.key)}"
                                @notifyFor="(val) => {Handledropdown(val,items,'notifyFor',item.key)}"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    // PACKAGES
    import { useStore } from 'vuex';
    import { useToast } from 'vue-toast-notification';
    import {computed, defineComponent, inject, onMounted, ref, watch} from 'vue'

    // COMPONENTS
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import NotificationTableRow from '../../../components/atom/NotificationTableRow/NotificationTableRow.vue';

    // UTILS
    import { BSON } from 'realm-web';
    import { dbCollections } from "@/utils/FirebaseCollections";
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';


    const userId = inject("$userId");
    const {getters, dispatch} = useStore();
    const companyId = inject("$companyId");

    defineComponent({
        name: "NotificationSettings"
    });

    const settings = ref([]);
    const toast = useToast();
    //variable
    const isSpinner = ref(false);
    //computed
    const rulesGetter = computed(() => getters["settings/notificationSettings"]);
    //onMounted
    onMounted(() => {
        isSpinner.value = true;
        if(rulesGetter.value && !Object.keys(rulesGetter.value).length) {
            dispatch("settings/setNotificationRules", {
                userId: userId.value,
                cid: companyId.value
            }).then(() => {
                settings.value = [];
                Object.keys(rulesGetter.value).forEach((key) => {
                    if(key !== "updatedAt" && key !== "createdAt" && key !== "_id" && key !== 'userId' && key !== '__v') {
                        settings.value.push(rulesGetter.value[key]);
                    }
                });
                settings.value.sort((a,b) => (a.sectionName.toLowerCase() < b.sectionName.toLowerCase()) ? -1 : ((b.sectionName.toLowerCase() < a.sectionName.toLowerCase()) ? 1 : 0));  
                isSpinner.value = false;
            }).catch((error) => {
                isSpinner.value = false;
                console.error("ERROR in set notification rules: ", error);
            })
        } else {
            Object.keys(rulesGetter.value).forEach((key) => {
                if(key !== "updatedAt" && key !== "createdAt" && key !== "_id" && key !== 'userId' && key !== '__v') {
                    settings.value.push(rulesGetter.value[key]);
                }
                settings.value.sort((a,b) => (a.sectionName.toLowerCase() < b.sectionName.toLowerCase()) ? -1 : ((b.sectionName.toLowerCase() < a.sectionName.toLowerCase()) ? 1 : 0));  
            });
            isSpinner.value = false;
        }
    });
    
    watch(() => rulesGetter.value, (val) => {
        if(val && Object.keys(val).length) {
            settings.value = [];
            Object.keys(val).forEach((key) => {
                if(key !== "updatedAt" && key !== "createdAt" && key !== "_id" && key !== 'userId' && key !== '__v') {
                    settings.value.push(val[key]);
                }
            })              
            settings.value.sort((a,b) => (a.sectionName.toLowerCase() < b.sectionName.toLowerCase()) ? -1 : ((b.sectionName.toLowerCase() < a.sectionName.toLowerCase()) ? 1 : 0));  
        }
    });
    // Update function for notification settings
    const handleUpdate = (valueToUpdate,fieldToUpdate,item,key) => {
        isSpinner.value = true;
        /*
            { _id: ObjectId('6540e1d5e72213abe3e44074') }: This part specifies the filter criteria. It targets a document in the MongoDB collection with the given _id, which is an ObjectId.

            $set operator: This is used to set a new value for a specific field.

            "before.items.chat.items.$[element].email": true: This is the field you want to update. It accesses the "email" field within a nested structure. Specifically, it's targeting the "email" field in the "chat" object within the "items" array, and it sets its value to true.

            arrayFilters: This part specifies filters to determine which elements within an array are affected by the update. In this case, it filters based on the "key" field matching "message_create."
        */
        let queryObj = [
            { _id: BSON.ObjectId(rulesGetter.value._id) },
            { $set: { [`${key}.items.$[element].${fieldToUpdate}`]: valueToUpdate } },
            { arrayFilters: [{ "element.key": item.key }] },
        ];
        let object = {
            type:'updateOne',
            collection:dbCollections.NOTIFICATIONS_SETTINGS,
            data:queryObj
        }
        /*
            update Data in mongoDB
        */
        mongodbCrudOperations(object).then(()=>{
            isSpinner.value = false;
            toast.success(`Notification Settings Update successfully`, { position: 'top-right' });
        }).catch((error) => {
            console.error(error);
            isSpinner.value = false;
            toast.error(error.message, { position: 'top-right' });
        });
    };
    const Changemail = (val,item,key) =>{
        item.email = val;
        handleUpdate(val,'email',item,key);
    };
    const Changebowser = (val,item,key) =>{
        item.browser = val;
        handleUpdate(val,'browser',item,key);
    };
    const Changemobile = (val,item,key) =>{
        item.mobile = val;
        handleUpdate(val,'mobile',item,key);
    };
    const Handledropdown = (val,item,type,key) => {
        if(item.duration == val || item.notifyFor == val){   
            return toast.error(`Nothing To Update `, { position: 'top-right' });
        }
        if(type==="duration"){
            item.duration = val;
        }
        if(type==="notifyFor"){
            item.notifyFor = val;
        }
        handleUpdate(val,type,item,key);
    };
</script>
<style scoped>
@import "./style.css";
</style>