<template>
    <CustomFieldListing 
        :type="props.detail?.fieldType"
        :label="props.detail?.fieldTitle"
        :bindValue="props.detail?.fieldValue"
        @inputUpdate="(val)=> emit('inputUpdate',val)"
        @blurUpdate="(value,detail,id) => emit('blurUpdate',value,detail,id)"
        :options="props.detail?.fieldOptions"
        :validations="props.detail?.fieldValidation"
        :placeholder="props.detail?.fieldPlaceholder"
        :detail="props.detail"
        @handleEdit="(val) => emit('handleEdit',val)"
    />
</template>

<script setup>
    import CustomFieldListing from "@/components/atom/CustomFieldListing/CustomFieldListing.vue";
    const props = defineProps({
        detail:{
            type:Object,
            default:() => {}
        }
    });
    const emit = defineEmits(['blurUpdate','inputUpdate','handleEdit']);
</script>
