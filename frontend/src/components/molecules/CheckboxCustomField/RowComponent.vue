<!-- RowComponent.vue -->
<template>
    <div class="option-container">
        <div class="field-row d-flex align-items-baseline mb-20px">
            <div class="drag-icon cursor-all-scroll position-re">
                <img :src="dragIcon" alt="drag" />
            </div>
            <div class="color-box mr-10px ml-10px justify-content-center align-items-center d-flex border-radius-5-px border-gray">
                <CustomFieldInputComponent
                    :type="'color'"
                    :placeholder="''"
                    :validations="''"
                    :bindValue="fieldValue.color"
                    :validationVisibility="'blur'"
                    :className="'custom__field-required color-field'"
                    :name="fieldName.color"
                    @inputUpdate="(val) => fieldValue.color = val"
                />
            </div>
            <div class="textbox mr-10px">
                <CustomFieldInputComponent
                    :type="'text'"
                    :placeholder="`Enter option`"
                    :validations="'required:trim'"
                    :bindValue="fieldValue.label"
                    :validationVisibility="'blur'"
                    :className="'custom__field-required option-field'"
                    :name="fieldName.option"
                    @inputUpdate="(val) => fieldValue.label = val.trim()"
                    :customValidationMessage="fieldValue.label === '' ? { required: 'This field is required' } : ''"
                />
            </div>
            <div class="cursor-pointer">
                <img v-show="isDeletable" :src="deleteIcon" alt="Delete" @click="$emit('deleteIndex', rowIndex)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, watch } from "vue";
import CustomFieldInputComponent from "@/components/atom/CustomFieldInputComponent/CustomFieldInputComponent.vue";

// props
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    },
    rowIndex: {
        type: Number,
        default: 0
    },
    fieldName: {
        type: Object,
        default: () => {}
    },
    isDeletable: {
        type: Boolean,
        default: true
    }
});

// Variables
const fieldValue = ref(props.data);
const isDeletable = ref(props.isDeletable);
const deleteIcon = require("@/assets/images/svg/Delete_gray.svg");
const dragIcon = require("@/assets/images/svg/drag_icon.svg");

watch(() => props.isDeletable, (val) => {
    isDeletable.value = val;
});
</script>