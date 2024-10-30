<template>
    <div v-show="tabIndexCheck === 1">
        <CustomFieldInputComponent
            :label="'Field Label'"
            :type="'text'"
            :placeholder="'Enter Field Label'"
            :validations="'required:trim|length:0,25'"
            :bindValue="props.customFieldObject?.fieldTitle ? props.customFieldObject.fieldTitle : fieldLabel"
            :validationVisibility="'blur'"
            :className="'custom__field-required'"
            :name="'fieldTitle'"
        />
        <CustomFieldInputComponent
            :label="'Placeholder'"
            :type="'text'"
            :placeholder="'Enter Placeholder'"
            :validations="'required:trim'"
            :bindValue="props.customFieldObject?.fieldPlaceholder ? props.customFieldObject.fieldPlaceholder : fieldPlaceholder"
            :validationVisibility="'blur'"
            :className="'custom__field-required'"
            :name="'fieldPlaceholder'"
        />
        <CustomFieldInputComponent
            :label="'Description'"
            :type="'textarea'"
            :placeholder="'Enter Description'"
            :validations="'required:trim|length:10'"
            :bindValue="props.customFieldObject?.fieldDescription ? props.customFieldObject.fieldDescription : fieldDescription"
            :validationVisibility="'blur'"
            :className="'custom__field-required'"
            :name="'fieldDescription'"
        />
    </div>
    <div v-show="tabIndexCheck === 2">
        <CustomFieldInputComponent
            :type="'checkbox'"
            :options="entryLimits"
            :bindValue="props.customFieldObject?.fieldEntryLimits ? props.customFieldObject.fieldEntryLimits : entryLimitsToggle"
            :validationVisibility="'blur'"
            :name="'fieldEntryLimits'"
            :className="'customCheckbox helpCheckbox'"
            :help="'Limit the minimum or maximum value allowed for this field'"
            @inputUpdate="handleInput"
        />
        <div v-show="entryLimitsToggle && entryLimitsToggle.length">
           <CustomFieldInputComponent
                :label="'Enter Minimum Limit'"
                :type="'text'"
                :placeholder="'Enter Number'"
                :validations="fieldMinimum && fieldMaximum ? Number(fieldMinimum) > Number(fieldMaximum) ? 'is' : 'matches:/^[-]?[0-9]+([.]?[0-9]+)?$/' : 'matches:/^[-]?[0-9]+([.]?[0-9]+)?$/'"
                :bindValue="props.customFieldObject?.fieldMinimum ? props.customFieldObject?.fieldMinimum : fieldMinimum"
                :validationVisibility="'blur'"
                :name="'fieldMinimum'"
                @inputUpdate="(val) => fieldMinimum = val ? val : ''"
                :customValidationMessage="fieldMinimum && fieldMaximum ? Number(fieldMinimum) > Number(fieldMaximum) ? {is:'Minimum value should not be greater than Maximum value'} : {is: 'The entered value for Minimum Limit Type is not an allowed value.',matches: 'The entered value for Minimum Limit Type is not an allowed value.'} : {is: 'The entered value for Minimum Limit Type is not an allowed value.',matches: 'The entered value for Minimum Limit Type is not an allowed value.'}"
            />
            <CustomFieldInputComponent
                :label="'Enter Maximum Limit'"
                :type="'text'"
                :placeholder="'Enter Number'"
                :validations="fieldMinimum && fieldMaximum ? Number(fieldMinimum) > Number(fieldMaximum) ? 'is' : 'matches:/^[-]?[0-9]+([.]?[0-9]+)?$/' : 'matches:/^[-]?[0-9]+([.]?[0-9]+)?$/'"
                :bindValue="props.customFieldObject?.fieldMaximum ? props.customFieldObject.fieldMaximum : fieldMaximum"
                :validationVisibility="'blur'"
                :name="'fieldMaximum'"
                @inputUpdate="(val) => fieldMaximum = val ? val : ''"
                :customValidationMessage="fieldMinimum && fieldMaximum ? Number(fieldMinimum) > Number(fieldMaximum) ? {is:'Maximum value should be greater than Minimum value'} : {is: 'The entered value for Maximum Limit Type is not an allowed value.',matches: 'The entered value for Maximum Limit Type is not an allowed value.'} : {is: 'The entered value for Maximum Limit Type is not an allowed value.',matches: 'The entered value for Maximum Limit Type is not an allowed value.'}"
            />
        </div>
    </div>
</template>

<script setup>
    import { ref, watch } from "vue";
    import CustomFieldInputComponent from "@/components/atom/CustomFieldInputComponent/CustomFieldInputComponent.vue";
    // props
    const props = defineProps({
            tabIndex:{
                type: Number,
                default:1
            },
            componentDetail:{
                type: Object,
                default:() => {}
            },
            customFieldObject:{
                type: Object,
                default:() => {}
            }
        }
    );
    // emit
    const emit = defineEmits(['handleFunction','tabIndexUpdate']);
    
    watch(() => props.tabIndex, (val) =>{
        tabIndexCheck.value = val;
    });
    // ref
    //FIRST Tab
    const fieldLabel = ref('');
    const fieldPlaceholder = ref('');
    const entryLimits = ref(['Entry Limits']);
    const entryLimitsToggle = ref([]);
    const fieldDescription = ref('');
    //SECOND Tab
    const fieldMaximum = ref();
    const fieldMinimum = ref();
    
    const tabIndexCheck = ref(props.tabIndex);

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
            object.fieldValidation = "";
            object.fieldValidation += object.fieldMinimum ? `min:${object.fieldMinimum}` : "";
            object.fieldValidation += object.fieldMaximum ? object.fieldMinimum ? `|max:${object.fieldMaximum}` : `max:${object.fieldMaximum}` : "";
            object.fieldMinimum = object.fieldMinimum ? String(object.fieldMinimum) : '';
            object.fieldMaximum = object.fieldMaximum ? String(object.fieldMaximum) : '';
            object.fieldType = props.componentDetail.cfType;
            object.fieldImage = props.componentDetail.cfIcon;
            object.fieldImageGrey = props.componentDetail.cfIconGrey;
            object.fieldPlaceholder = object.fieldPlaceholder.trim();
            object.fieldTitle = object.fieldTitle.trim();
            object.fieldDescription = object.fieldDescription.trim();
            emit('handleFunction',object,props.customFieldObject && Object.keys(props.customFieldObject).length ? true : false)
    };

    defineExpose({handleTabComp,handleSubmitComp});
</script>
