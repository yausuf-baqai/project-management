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
            :label="'Description'"
            :type="'textarea'"
            :placeholder="'Enter Description'"
            :validations="'required:trim|length:10'"
            :bindValue="props.customFieldObject?.fieldDescription ? props.customFieldObject.fieldDescription : fieldDescription"
            :validationVisibility="'blur'"
            :className="'custom__field-required'"
            :name="'fieldDescription'"
        />
        <CustomFieldInputComponent
            :label="'Separator'"
            :type="'radio'"
            :validations="''"
            :options="fieldSeparator"
            :validationVisibility="'blur'"
            @inputUpdate="handleSeparator"
            :name="'fieldSeparator'"
            :bindValue="props.customFieldObject?.fieldSeparator ? props.customFieldObject.fieldSeparator : fieldSeparatorSelected"
            :className="'custom__field-radio custom__field-Separator'"

        />
    </div>
    <div v-show="tabIndexCheck === 2">
        <CustomFieldInputComponent
            :label="'Date Formate'"
            :type="'radio'"
            :validations="''"
            :options="fieldDateFormate"
            :validationVisibility="'blur'"
            :name="'fieldDateFormate'"
            :bindValue="fieldDateFormate.find((e) => e === props.customFieldObject?.fieldDateFormate) ? fieldDateFormate.find((e) => e === props.customFieldObject?.fieldDateFormate) : fieldDateFormate[0]"
            :className="'custom__field-radio custom__field-radio-help'"
            :help="'Select a date format. D stands for day, M for month, and Y for year.'"
        />
    </div>
    <div v-show="tabIndexCheck === 3">
        <CustomFieldInputComponent
            :type="'checkbox'"
            :options="liteMode"
            :bindValue="props.customFieldObject?.fieldLiteMode ? props.customFieldObject.fieldLiteMode : liteMode"
            :validationVisibility="'blur'"
            :name="'fieldLiteMode'"
            :className="'customCheckbox helpCheckbox'"
            :help="'Allow users to specify a time with date.'"
            @inputUpdate="handleInput"
        />
        <div v-if="liteModeToggle && liteModeToggle.length">
            <CustomFieldInputComponent
                :label="'Time Formate'"
                :type="'radio'"
                :options="fieldTimeFormate"
                :bindValue="props.customFieldObject?.fieldTimeFormate ? props.customFieldObject.fieldTimeFormate : fieldTimeFormate[0]"
                :validationVisibility="'blur'"
                :name="'fieldTimeFormate'"
                :help="'Select a time format'"
                :className="'custom__field-radio custom__field-radio-time-formate'"
            />
        </div>
    </div>
    <div v-show="tabIndexCheck === 4">
        <CustomFieldInputComponent
            :label="'Past & Future'"
            :type="'checkbox'"
            :options="fieldPastFuture"
            :bindValue="props.customFieldObject?.fieldPastFuture ? props.customFieldObject.fieldPastFuture : fieldPastFuture"
            :validationVisibility="'blur'"
            :name="'fieldPastFuture'"
            :help="'Let users select dates in the past or future'"
            :className="'custom__field-checkbox'"
        />
        <CustomFieldInputComponent
            :label="'Days of the week'"
            :type="'checkbox'"
            :options="fieldDaysDisable"
            :bindValue="props.customFieldObject?.fieldDaysDisable && props.customFieldObject?.fieldDaysDisable.length ? fieldDaysDisable.map((e)=> !(props.customFieldObject.fieldDaysDisable.includes(e.bindValue)) ? e.bindValue : null) : fieldDaysDisable.map((e)=>e.bindValue)"
            :validationVisibility="'blur'"
            :name="'fieldDaysDisable'"
            :help="'Unchecking a day will make it unavailable in the calendar'"
            :className="'custom__field-checkbox'"
        />
    </div>
</template>

<script setup>
    import { ref,watch } from "vue";
    import CustomFieldInputComponent from "@/components/atom/CustomFieldInputComponent/CustomFieldInputComponent.vue";

    //FIRST Tab
    const fieldLabel = ref('');
    const fieldSeparatorSelected = ref('-');
    const fieldPastFuture = ref(['Past','Future']);
    const fieldDescription = ref('');
    const fieldSeparator = ref(['-', '/', '.']);
    const fieldDateFormate = ref(['MM-DD-YYYY','DD-MM-YYYY','YYYY-MM-DD']);
    const fieldTimeFormate = ref(['24 Hour','AM/PM']);
    const fieldDaysDisable = ref([
        {
            value: 0,
            label: 'Sundays',
            bindValue:0
        },
        {
            value: 1,
            label: 'Mondays',
            bindValue:1
        },
        {
            value: 2,
            label: 'Tuesdays',
            bindValue:2
        },
        {
            value: 3,
            label: 'Wednesdays',
            bindValue:3
        },
        {
            value: 4,
            label: 'Thursdays',
            bindValue:4
        },
        {
            value: 5,
            label: 'Fridays',
            bindValue:5
        },
        {
            value: 6,
            label: 'Saturdays',
            bindValue:6
        }
    ]);
    const liteModeToggle = ref(['Lite Mode']);
    const liteMode = ref(['Lite Mode']);
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
    watch (()=> fieldSeparatorSelected.value,() => {
        if(fieldSeparatorSelected.value === '-'){
            fieldDateFormate.value = ['MM-DD-YYYY','DD-MM-YYYY','YYYY-MM-DD'];
        }else if(fieldSeparatorSelected.value === '/'){
            fieldDateFormate.value = ['MM/DD/YYYY','DD/MM/YYYY','YYYY/MM/DD'];
        }else{
            fieldDateFormate.value = ['MM.DD.YYYY','DD.MM.YYYY','YYYY.MM.DD'];
        }
    });
    const tabIndexCheck = ref(props.tabIndex);

    const handleSeparator = (val) => {
        fieldSeparatorSelected.value = val;
    };
    const handleInput = (val) => {
        liteModeToggle.value = val;
    };
    // Redirect to the tab where the validation error message is displayed.
    const handleTabComp = (node) => {
        if(!(node._value.fieldDescription && node._value.fieldTitle)){
            tabIndexCheck.value = 1;
            emit('tabIndexUpdate',tabIndexCheck.value)
        }
    };
    // submit the form
    const handleSubmitComp = (object) => {
        let fieldDaysDisables = [0,1,2,3,4,5,6];
        let newFieldDaysDisable = fieldDaysDisables.filter((e)=> !object.fieldDaysDisable.includes(e));
        object.fieldDaysDisable = newFieldDaysDisable;
        object.fieldValidation = '';
        object.fieldType = props.componentDetail.cfType;
        object.fieldTitle = object.fieldTitle.trim();
        if(!(object.fieldLiteMode && object.fieldLiteMode.length)){
            object.fieldTimeFormate = '';
        }
        object.fieldImage = props.componentDetail.cfIcon;
        object.fieldImageGrey = props.componentDetail.cfIconGrey;
        object.fieldDescription = object.fieldDescription.trim();
        emit('handleFunction',object,props.customFieldObject && Object.keys(props.customFieldObject).length ? true : false);
    };

    defineExpose({handleTabComp,handleSubmitComp});
</script>
