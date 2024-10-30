<template>
    <div class="checkbox-custom-field">
        <div v-show="tabIndexCheck === 1">
            <CustomFieldInputComponent
                :label="'Field Label'"
                :type="'text'"
                :placeholder="'Enter Field Label'"
                :validations="'required:trim|length:0,25'"
                :bindValue="props.customFieldObject?.fieldTitle ? props.customFieldObject.fieldTitle :fieldLabel"
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

    // Emits
    const emit = defineEmits(['handleFunction', 'tabIndexUpdate']);

    watch(() => props.tabIndex, (val) => {
        tabIndexCheck.value = val;
    });

    // Variables
    const fieldLabel = ref('');
    const fieldPlaceholder = ref('');
    const fieldDescription = ref('');
    const tabIndexCheck = ref(props.tabIndex);

    // Redirect to the tab where the validation error message is displayed.
    const handleTabComp = (node) => {
        if (!(node._value.fieldDescription && node._value.fieldTitle && node._value.fieldPlaceholder)) {
            tabIndexCheck.value = 1;
            emit('tabIndexUpdate', tabIndexCheck.value)
        }
    };

    // submit the form
    const handleSubmitComp = (object) => {
        object.fieldValidation = '';
        object.fieldTitle = object.fieldTitle.trim();
        object.fieldType = props.componentDetail.cfType;
        object.fieldImage = props.componentDetail.cfIcon;
        object.fieldImageGrey = props.componentDetail.cfIconGrey;
        object.fieldDescription = object.fieldDescription.trim();
        object.fieldPlaceholder = object.fieldPlaceholder.trim();
        emit('handleFunction',object,props.customFieldObject && Object.keys(props.customFieldObject).length ? true : false);
    };

    defineExpose({ handleTabComp, handleSubmitComp });
</script>