<template>
    <span
        v-for="(obj,ind) in props.projectData?.viewColumn.filter(x =>
            !x?.key?.includes('created_by') &&
            !x?.key?.includes('created_date') &&
            !x?.key?.includes('TaskKey') &&
            !x?.key?.includes('Task_Priority') &&
            !x?.key?.includes('DueDate') &&
            !x?.key?.includes('AssigneeUserId') &&
            !x?.key?.includes('commentCounts') &&
            (x.funcPermission ? checkPermission(x.funcPermission,projectData.isGlobalPermission) !== null : true ) && (x.appPermission ? checkApps(x.appPermission) : true ) &&
            x?.show === true)"
        :key="ind"
        class="task_right custom__field_list_view"
        @click="handleOpenInput(obj,props.task._id)"
    >
        <template v-if="props.task.customField && Object.keys(props.task.customField).length">
            <template v-for="(item, index) in Object.keys(props.task.customField)" :key="index">
                <div v-if="obj.key === props.task.customField[item]._id" class="position-re">
                    <component
                        :is="getView(props.task.customField[item]?.fieldType)"
                        @blurUpdate="submitHandler"
                        :detail="props.task.customField[item]"
                        @outSideClick="handleOutSideClick"
                        :customFieldId="customFieldId"
                        :taskId="taskId"
                    />
                </div>
            </template>
        </template>
    </span>
</template>

<script setup>
    //import
    import { BSON } from "realm-web";
    import { computed, nextTick, ref } from 'vue';
    import { useToast } from "vue-toast-notification";
    import { dbCollections } from "@/utils/FirebaseCollections";
    import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
    import { useCustomComposable } from '@/composable';
    import TextComponentViewColumn from '@/components/molecules/TextComponentListing/TextComponentViewColumn.vue';
    import TextareaComponentListing from '@/components/molecules/TextareaComponentListing/TextareaComponentViewColumn.vue'
    import NumberComponentListing from '@/components/molecules/NumberComponentListing/NumberComponentViewColumn.vue'
    import CheckboxComponentListing from '@/components/molecules/CheckboxCustomField/CheckboxComponentViewColumn.vue'
    import MoneyComponentListing from '@/components/molecules/MoneyComponentListing/MoneyComponentViewColumn.vue'
    import DropdownComponentListing from '@/components/molecules/DropdownCustomField/DropdownComponentViewColumn.vue'
    import DateComponentListing from '@/components/molecules/DateComponentListing/DateComponentViewColumn.vue'
    import EmailComponentListing from '@/components/molecules/EmailComponentListing/EmailComponentViewColumn.vue'
    import PhoneComponentListing from '@/components/molecules/PhoneComponentListing/PhoneComponentViewColumn.vue'
    import { useStore } from 'vuex';

    const {checkPermission, checkApps} = useCustomComposable();
    const $toast = useToast()
    //props
    const props = defineProps({
        projectData:{
            type:Object,
            default:() => {}
        },
        task:{
            type:Object,
            default:() => {}
        }
    });

    const {getters} = useStore();

    // ref
    const taskId = ref('');
    const customFieldId = ref('');
    const customFieldPermission = computed(() => checkPermission("task.task_custom_field", props.projectData.isGlobalPermission, {gettersVal: getters}))

    // function
    const getView = (val) => {
        switch(val){
            case 'text':
                return TextComponentViewColumn
            case 'textarea':
                return TextareaComponentListing
            case 'number':
                return NumberComponentListing
            case 'checkbox':
                return CheckboxComponentListing
            case 'money':
                return MoneyComponentListing
            case 'dropdown':
                return DropdownComponentListing
            case 'date':
                return DateComponentListing
            case 'email':
                return EmailComponentListing
            case 'phone':
                return PhoneComponentListing
        }
    };

    const submitHandler = (value,details,id,edit) => {
        let detail = JSON.parse(JSON.stringify(details));
        if(value && detail.fieldType !== 'checkbox'){
            detail.fieldValue = value;
            if(detail.fieldType === 'date'){
                try{
                    detail.fieldValue = new Date(value);
                    insertCustomField(detail);
                } catch(error){
                    console.error('ERROR',error);
                }
            }else if(detail.fieldType === 'dropdown'){
                detail.fieldValue = [value.id];
                try {
                    insertCustomField(detail);
                } catch(error){
                    console.error('ERROR',error);
                }
            }else if(detail.fieldType === 'number' || detail.fieldType === 'money'){
                try{
                    detail.fieldValue = String(value);
                    insertCustomField(detail);
                } catch(error){
                    console.error('ERROR',error);
                }
            }else{
                nextTick(() => {
                    const input = document?.getElementById(`${id}`);
                    const ariaDescribedByValue = input?.getAttribute('aria-describedby');
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
                            insertCustomField(detail);
                        } catch(error){
                            console.error('ERROR',error);
                        }
                    }
                });
            }
        } else if(detail.fieldType === 'checkbox'){
            try{
                detail.fieldValue = value;
                insertCustomField(detail);
            } catch(error){
                console.error('ERROR',error);
            }
        }else{
            if(detail.fieldType !== "phone"){
                customFieldId.value = "";
            }
        }
    };

    const insertCustomField = (detail) => {
        let updateDetail = {};
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
            $toast.success("Custom field updated successfully", {position: 'top-right' });
            if(detail.fieldType !== "phone"){
                customFieldId.value = "";
            }
        }).catch((err)=>{
            console.error('ERROR',err);
        });
    };

    const handleOpenInput = (value,id) => {
        if(customFieldPermission.value == true){
            taskId.value = id;
            customFieldId.value = value.key;
        }
    };

    const handleOutSideClick = () => {
        customFieldId.value = "";
    }
</script>
<style scoped>
    @import '@/components/molecules/CustomFieldListViewColumn/style.css';
</style>
