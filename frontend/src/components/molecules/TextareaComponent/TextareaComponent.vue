<template>
    <div v-show="tabIndexCheck === 1">
        <CustomFieldInputComponent :label="'Field Label'" :type="'text'" :placeholder="'Enter Field Label'"
            :validations="'required:trim|length:0,25'" :bindValue="props.customFieldObject?.fieldTitle ? props.customFieldObject.fieldTitle : fieldLabel"
            :validationVisibility="'blur'" :className="'custom__field-required'" :name="'fieldTitle'"
        />
        <CustomFieldInputComponent :label="'Placeholder'" :type="'text'" :placeholder="'Enter Placeholder'"
            :validations="'required:trim'" :bindValue="props.customFieldObject?.fieldPlaceholder ? props.customFieldObject.fieldPlaceholder : fieldPlaceholder" 
            :validationVisibility="'blur'" :className="'custom__field-required'" :name="'fieldPlaceholder'"
        />
        <CustomFieldInputComponent :label="'Description'" :type="'textarea'" :placeholder="'Enter Description'"
            :validations="'required:trim|length:10'" :bindValue="props.customFieldObject?.fieldDescription ? props.customFieldObject.fieldDescription : fieldDescription"
            :validationVisibility="'blur'" :className="'custom__field-required'" :name="'fieldDescription'"
        />
    </div>
    <div v-show="tabIndexCheck === 2">
        <CustomFieldInputComponent :type="'checkbox'" :options="entryLimits"
            :bindValue="props.customFieldObject?.fieldEntryLimits ? props.customFieldObject.fieldEntryLimits : entryLimitsToggle"
            :validationVisibility="'blur'" :name="'fieldEntryLimits'" :className="'customCheckbox helpCheckbox'"
            :help="'Limit the minimum or maximum amount of text allowed in this field'" @inputUpdate="handleInput"
        />
        <div v-show="entryLimitsToggle && entryLimitsToggle.length" class="position-re">
            <CustomFieldInputComponent
                :label="'Enter Minimum Limit Type'"
                :type="'number'"
                :placeholder="'Enter Number'"
                :validations="fieldMinimum && fieldMaximum ? Number(fieldMinimum) > Number(fieldMaximum) ? 'min should be less then max' : '' : ''"
                :bindValue="props.customFieldObject?.fieldMinimum ? props.customFieldObject?.fieldMinimum : fieldMinimum" 
                :validationVisibility="'blur'"
                :name="'fieldMinimum'"
                @inputUpdate="(val) => fieldMinimum = val ? Number(val) : ''"
                :preventDefault="true"
            />
            <CustomFieldInputComponent
                :label="'Enter Maximum Limit Type'"
                :type="'number'"
                :placeholder="'Enter Number'"
                :validations="fieldMinimum && fieldMaximum ? Number(fieldMinimum) > Number(fieldMaximum) ? 'max should be greater then min' : '' : ''"
                :validationVisibility="'blur'"
                :name="'fieldMaximum'"
                :bindValue="props.customFieldObject?.fieldMaximum ? Number(props.customFieldObject.fieldMaximum) : fieldMaximum"
                @inputUpdate="(val) => fieldMaximum = val ? Number(val) : ''"
                :preventDefault="true"
            />
            <small class="red position-ab textAreCustomField__error_msg" v-if="fieldMinimum && fieldMaximum && Number(fieldMinimum) > Number(fieldMaximum)">Maximum value should be greater than Minimum value.</small>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import CustomFieldInputComponent from "@/components/atom/CustomFieldInputComponent/CustomFieldInputComponent.vue";

// props
const props = defineProps({
    tabIndex: {
        type: Number,
        default: 1
    },
    componentDetail:{
        type: Object,
        default:() => {}
    },
    customFieldObject:{
        type: Object,
        default:() => {}
    }
});

// emit
const emit = defineEmits(['handleFunction','tabIndexUpdate']);

watch(() => props.tabIndex, (val) => {
    tabIndexCheck.value = val;
});

// Variables
const fieldLabel = ref('');
const fieldPlaceholder = ref('');
const fieldDescription = ref('');
const entryLimits = ref(['Entry Limits']);
const entryLimitsToggle = ref([]);
const fieldMaximum = ref();
const fieldMinimum = ref();
const tabIndexCheck = ref(props.tabIndex);

/**
 * This function is used to handle input event
 * @param {*} val
 */
const handleInput = (val) => {
    entryLimitsToggle.value = val;
    fieldMaximum.value = null;
    fieldMinimum.value = null;
};

// Redirect to the tab where the validation error message is displayed.
const handleTabComp = (node) => {
    if(!(node._value.fieldDescription && node._value.fieldTitle && node._value.fieldPlaceholder)){
        tabIndexCheck.value = 1;
        emit('tabIndexUpdate',tabIndexCheck.value)
    }else if(node._value.fieldMinimum || node._value.fieldMaximum){
        if((Number(node._value.fieldMinimum) > Number(node._value.fieldMaximum))){
            tabIndexCheck.value = 2;
            emit('tabIndexUpdate',tabIndexCheck.value)
        }
    }
};
// submit the form
const handleSubmitComp = (object) => {
    if(!(object.fieldEntryLimits && object.fieldEntryLimits.length)){
        object.fieldMinimum = '';
        object.fieldMaximum = '';
    }
    let length = object.fieldMinimum || object.fieldMaximum ? `length:${`${object.fieldMinimum ? object.fieldMinimum : 0}` + `${object.fieldMaximum ? `,${object.fieldMaximum}` : ''}`}` :''
    object.fieldValidation = length ? length : '';
    object.fieldType = props.componentDetail.cfType;
    object.fieldMinimum = object.fieldMinimum ? String(object.fieldMinimum) : '';
    object.fieldMaximum = object.fieldMaximum ? String(object.fieldMaximum) : '';
    object.fieldImage = props.componentDetail.cfIcon;
    object.fieldImageGrey = props.componentDetail.cfIconGrey;
    object.fieldDescription = object.fieldDescription.trim();
    object.fieldPlaceholder = object.fieldPlaceholder.trim();
    object.fieldTitle = object.fieldTitle.trim();
    emit('handleFunction',object,props.customFieldObject && Object.keys(props.customFieldObject).length ? true : false)
};

defineExpose({handleTabComp,handleSubmitComp});

</script>
<style scoped>
.textAreCustomField__error_msg {
    bottom: -25px !important;
    font-family: 'Roboto';
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 17.76px;
    margin-bottom: 0px !important;
}

@media(max-width:340px){
    .textAreCustomField__error_msg {
        bottom: -30px !important;
        line-height: 12.76px;
        font-size: 11px;
    }
}
</style>