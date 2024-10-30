<template>
    <div class="mt-1" :class="[{'custom-field__height':props.planPermission === false && (!customFieldList || customFieldList?.filter((val)=>(val?.isDelete) && (val?.global || val?.projectId === props?.task?.ProjectID))?.length < 3)}]">
        <div class="d-flex align-items-center justify-content-between">
            <h4 class="font-roboto-sans font-size-14 font-weight-700 font-normal">Custom Field</h4>
            <h4 v-if="props.editPermission === true" class="font-roboto-sans font-size-14 font-weight-500 font-normal text-decoration-underline blue cursor-pointer" @click="emit('isCustomField',true)">+ Custom Field</h4>
        </div>
        <template v-if="customFieldList && customFieldList.length">
            <template v-for="(item, index) in customFieldList?.filter((val)=>(val?.isDelete) && (val?.global || val?.projectId === props?.task?.ProjectID))" :key="index">
                <div class="position-re" :class="[{'pointer-event-none':props.editPermission === false}]">
                    <component
                        :is="getView(item?.fieldType)"
                        @inputUpdate="(val)=> item.fieldValue = val"
                        @blurUpdate="handleEmit"
                        :detail="item"
                        @handleEdit="handleEdit(item)"
                        @handleUpdate="handleUpdate"
                    />
                </div>
            </template>
        </template>
    </div>
</template>

<script setup>
    import { useStore } from 'vuex';
    import { computed,watch,onMounted } from 'vue';
    import TextComponentListing from '@/components/molecules/TextComponentListing/TextComponentListing.vue'
    import CheckboxComponentListing from '@/components/molecules/CheckboxCustomField/CheckboxComponentListing.vue'
    import DropdownComponentListing from '@/components/molecules/DropdownCustomField/DropdownComponentListing.vue'
    import DateComponentListing from '@/components/molecules/DateComponentListing/DateComponentListing.vue'
    import MoneyComponentListing from '@/components/molecules/MoneyComponentListing/MoneyComponentListing.vue'
    import TextareaComponentListing from '@/components/molecules/TextareaComponentListing/TextareaComponentListing.vue'
    import NumberComponentListing from '@/components/molecules/NumberComponentListing/NumberComponentListing.vue'
    import EmailComponentListing from '@/components/molecules/EmailComponentListing/EmailComponentListing.vue'
    import PhoneComponentListing from '@/components/molecules/PhoneComponentListing/PhoneComponentListing.vue'


    const { getters } = useStore();
    const customFieldList = computed(() => (getters['settings/finalCustomFields'] && getters['settings/finalCustomFields'].length) ? getters['settings/finalCustomFields']: []);
    const props = defineProps({
        task:{
            type:Object,
            default:()=>{}
        },
        editPermission:{
            type: [Boolean, Number],
            default: false
        },
        planPermission:{
            type: [Boolean, Number],
            default:false
        }
    })
    const emit = defineEmits(['blurUpdate','isCustomField','editCustomField']);
    // watch
    watch(() => getters['settings/finalCustomFields'],(val) => {
        customFieldList.value = val;
        manageCustomField(customFieldList.value);
    });

    //onMounted
    onMounted(()=>{
        manageCustomField(customFieldList.value);
    });
    // function
    const manageCustomField = (data) => {
        if (!(data && data.length)) {
            return;
        }
        if(props.task && props.task?.customField && Object.keys(props.task?.customField)?.length){
            customFieldList.value.forEach((val,index)=>{
                if(props.task?.customField[val._id]){
                    customFieldList.value[index] = {
                        ...val,
                        fieldValue:props.task?.customField[val._id]?.fieldValue,
                        fieldCode:props.task?.customField[val._id]?.fieldCode || '',
                        fieldPattern:props.task?.customField[val._id]?.fieldPattern || '',
                        fieldFlag:props.task?.customField[val._id]?.fieldFlag || ''
                    };
                }else{
                    delete val?.fieldValue
                    delete val?.fieldCode
                    delete val?.fieldPattern
                    delete val?.fieldFlag
                    customFieldList.value[index] = val;
                }
            });
        }else{
            if(data && data.length){
                data.forEach((val)=>{
                    delete val?.fieldValue;
                    delete val?.fieldCode;
                    delete val?.fieldPattern;
                    delete val?.fieldFlag;
                });
            }
            customFieldList.value = data;
        }
    };

    const handleEdit = (val) => {
        emit("editCustomField",val);
    };
    const handleUpdate = (value,detail,id) => {
        emit('blurUpdate',value,detail,id,true);
    };

    const getView = (val) => {
        switch(val){
            case 'text':
                return TextComponentListing
            case 'checkbox':
                return CheckboxComponentListing
            case 'dropdown':
                return DropdownComponentListing
            case 'date':
                return DateComponentListing
            case 'money':
                return MoneyComponentListing
            case 'textarea':
                return TextareaComponentListing
            case 'number':
                return NumberComponentListing
            case 'email':
                return EmailComponentListing
            case 'phone':
                return PhoneComponentListing
        }
    };

    const handleEmit = (value,detail,id) => {
        if(value && detail?.fieldType === 'phone'){
            let index = customFieldList.value.findIndex((x)=>x._id === detail._id);
            if(index > -1){
                customFieldList.value[index].fieldValue = value;
                detail.fieldValue = value;
            }
        }
        emit('blurUpdate',value,detail,id);
    };
</script>
<style>
    @import '@/components/atom/CustomFieldRender/style.css';
</style>
