<template>
    <CustomFieldViewColumn
        v-if="props.detail?._id === props?.customFieldId"
        :type="'text'"
        :bindValue="props.detail?.fieldValue"
        @inputUpdate="(val)=> checkValue = val"
        @blurUpdate="handleBlur"
        :validations="props.detail?.fieldValidation"
        :placeholder="props.detail?.fieldPlaceholder"
        :detail="props.detail"
    />
    <span
        v-else
        class="text-ellipse d-block mw-65px text-center"
        :title="props.detail?.fieldValue ? props.detail?.fieldValue : ''"
    >
        {{props.detail?.fieldValue ? props.detail?.fieldValue : '-'}}
    </span>
</template>

<script setup>
    import { ref } from "vue";
    import CustomFieldViewColumn from "@/components/atom/CustomFieldViewColumn/CustomFieldViewColumn.vue";
    
    const props = defineProps({
        detail:{
            type:Object,
            default:() => {}
        },
        customFieldId:{
            type:String,
            default:''
        }
    });
    const emit = defineEmits(['blurUpdate']);

    const checkValue = ref('');

    const handleBlur = (value,detail,id) => {
        value = checkValue.value;
        emit('blurUpdate',value,detail,id);
    }
</script>