<template>
    <div class="formkit__content-wrapper">
        <div class="formkit-wrapper">
            <div class="formkit-label__wrapper">
                <label class="formkit-label">
                    <img class="custom__field-image" :src="props.detail.fieldImageGrey">
                    <ToolTip
                        :label="props?.detail?.fieldTitle"
                        :descriptions="props?.detail?.fieldDescription"
                    />
                </label>
                <span>
                    <img @click="handleEdit" :src="editIconImage" class="formkit-label__image pr-22px cursor-pointer" />
                </span>
            </div>
            <div class="formkit-inner formkit__content-padding">
                <CalenderCompo
                    :format="props.detail?.fieldDateFormate"
                    :modelValue="props.detail?.fieldValue ? props.detail?.fieldValue : ''"
                    :minDate="props.detail.fieldPastFuture.includes('Future') ? props.detail.fieldPastFuture.includes('Future') && props.detail.fieldPastFuture.includes('Past') ? '' : new Date(new Date().setHours(0,0,0,0)) : !props.detail.fieldPastFuture.includes('Future') && !props.detail.fieldPastFuture.includes('Past') ? new Date(new Date().setHours(0,0,0,0)) : ''"
                    :maxDate="props.detail.fieldPastFuture.includes('Past') ? props.detail.fieldPastFuture.includes('Future') && props.detail.fieldPastFuture.includes('Past') ? '' : new Date(new Date().setHours(23,23,59)) : !props.detail.fieldPastFuture.includes('Past') && !props.detail.fieldPastFuture.includes('Future') ? new Date(new Date().setHours(23,23,59)) : ''"
                    :daysWeekDisable="props.detail.fieldDaysDisable"
                    @update:modelValue="($event) => emit('blurUpdate',$event,props.detail)"
                    :isShowDateAndicon="true"
                    :hideExtraLayouts="props.detail.fieldTimeFormate ? [] : ['time' ,'minutes' , 'hours' , 'seconds']"
                    :timeFormate="props.detail.fieldTimeFormate ? props.detail.fieldTimeFormate === 'AM/PM' ? false : true : false"
                    :showTimeFormate="props.detail.fieldTimeFormate ? true : false"
                    @outsideClick="handleOutside"
                    @handleSubmit="handleSubmit"
                />
            </div>
            <div v-if="validationError" class="position-ab formkit__error-message">
                {{props.detail.fieldTitle}} is required
            </div>
        </div>
    </div>
</template>

<script setup>
    import CalenderCompo from '@/components/atom/CalenderCompo/CalenderCompo.vue';
    import ToolTip from "@/components/molecules/ToolTip/ToolTip.vue";
    import { ref } from 'vue';
    const props = defineProps({
        detail:{
            type:Object,
            default:() => {}
        }
    });
    const emit = defineEmits(['blurUpdate','handleEdit']);
    const editIconImage = require("@/assets/images/editing.png");
    const validationError = ref(false);
    const handleOutside = () => {
        if(props.detail.fieldRequired && props.detail.fieldRequired.length){
            validationError.value = true;
        }else{
            validationError.value = false;
        }
    }
    const handleSubmit = () => {
        validationError.value = false;
    }
    const handleEdit = () => {
        emit('handleEdit',props?.detail)
    }
</script>
<style>
    @import '@/components/molecules/DateComponentListing/style.css';
</style>
