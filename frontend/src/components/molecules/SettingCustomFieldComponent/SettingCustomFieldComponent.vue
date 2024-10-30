<template>
    <div class="customField-wrapper">
        <CustomFieldList
            :finalCustomFields="finalCustomFields"
            @editCustomField="editCustomField"
            @isVisible="visible = true"
        />
    </div>
    <Sidebar  
        width="374px"
        :defaultLayout="false"
        :visible="visible"
        :zIndex="10"
        :className="'customFieldSidebar'"
    >
        <template #head-right>
            <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="visible = false,componentDetail={},customFieldObject={}"/>
        </template>       
        <template #head-left>
            <span class="font-weight-bold font-size-18">Create Custom Field</span>
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
</template>

<script setup>
    import CustomField from '@/components/atom/CustomField/CustomField.vue'
    import {defineComponent,ref,computed, watch,inject} from 'vue'
    import { useStore } from 'vuex';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue'
    import CustomFieldList from "@/components/molecules/SettingCustomFieldComponent/CustomFieldList.vue";
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import { useToast } from 'vue-toast-notification';
    import { BSON } from 'realm-web';
    const finalCustomFields = computed(() => getters['settings/finalCustomFields']);
    const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");
    const $toast = useToast();
    const {getters,commit} = useStore();
    // inject
    const userId = inject('$userId');
    watch(() => getters['settings/finalCustomFields'],(val) => {
        finalCustomFields.value = val;
    });
    watch(() => getters["settings/customFields"],(val) => {
        CustomFieldData.value = val;
    });

    defineComponent({
        name: "CustomizedInput"
    })  
    const visible = ref(false);
    const componentDetail = ref({});
    const customFieldObject = ref({});
    const CustomFieldData = ref(JSON.parse(JSON.stringify(getters["settings/customFields"])));

    const customFieldStore = (value,isEdit) => {
        if(!isEdit){
            value.global = true;
            value.createdAt = new Date();
            value.updatedAt = new Date();
            value.userId = userId.value;
            const query = {
                type: "insertOne",
                collection: dbCollections.CUSTOM_FIELDS,
                data: [value]
            };
            mongodbCrudOperations(query).then((result)=>{
                value._id = result.insertedId;
                commit("settings/mutateFinalCustomFields", {data: value || {},op: "added"});
                visible.value = false;
                componentDetail.value={};
                customFieldObject.value={};
                $toast.success("Field Added Successfully", {position: 'top-right' })
            }).catch((err)=>{
                $toast.error(err, { position: 'top-right' })
            })
        }else{
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
                visible.value = false;
                componentDetail.value={};
                customFieldObject.value={};
                $toast.success("Field Updated Successfully", {position: 'top-right' })
            }).catch((err)=>{
                $toast.error(err, { position: 'top-right' })
            });
        }
    };
    const handleCloseSidebar = (val,pageIndex) => {
        if(pageIndex === 0) visible.value = val;
        componentDetail.value={};
        customFieldObject.value={};
    };
    const editCustomField = (val) => {
        componentDetail.value = CustomFieldData.value.find((x)=> x.cfType === val.fieldType);
        customFieldObject.value = val;
        if(componentDetail.value){
            visible.value = true;
        }
    };
</script>
<style scoped>
.customField-wrapper {
    padding: 20px;
}
.addcustomfield-btn {
    margin-bottom: 20px;
}
</style>