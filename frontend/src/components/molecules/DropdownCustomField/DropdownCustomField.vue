<template>
    <div class="dropdown-custom-field">
        <div v-show="tabIndexCheck === 1">
            <CustomFieldInputComponent
                :label="'Field Label'"
                :type="'text'"
                :placeholder="'Enter Field Label'"
                :validations="'required:trim'"
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
        <div v-show="tabIndexCheck === 2">
            <div class="options-area style-scroll">
                <draggable v-model="options" item-key="id" tag="div" handle=".drag-icon">
                    <template #item="{ element, index }">
                        <RowComponent :key="element.id"
                            :data="element" 
                            :rowIndex="index"
                            @deleteIndex="deleteRow($event)"
                            @editIndex="editRow"
                            :rowIndexs="rowIndexs"
                            :isedit="props.customFieldObject?.fieldDescription ? true : false"
                            :fieldName="{ color: `option_color_${index}`, option: `option_${index}`}"
                            :isDeletable="options.length > 1"
                        />
                    </template>
                </draggable>
            </div>
            <a class="blue btn-add-new" @click="addRow">+ Add another item</a>
            <div class="mt-20px">
                <h4 class="dark-gray font-size-14 m-0">Predefined Options</h4>
                <div class="dropdown-main mt-10px">
                    <div class="dropdown-select" @click="isVisiblePrededine=true">
                        <span class="select">{{ selectedOption.label || 'None' }}</span>
                        <div class="arrow-dropdown"></div>
                    </div>
                </div>
                <span class="font-size-12 gray">Choose a ready-made list of option (e.g., days, months, etc.)</span>
            </div>
        </div>
        <div v-show="tabIndexCheck === 3">
            <h4 class="dark-gray font-size-14">Selected By Default</h4>
            <div class="options-area style-scroll">
                <div v-for="(row, index) in options" :key="index" class="d-flex mb-20px cursor-pointer">
                    <label class="d-flex cursor-pointer">
                        <CheckboxComponent v-model="row.selected" @click="handleCheckRow(row)" :value="row.value" customClasses="border-gray"/>
                        <span class="ml-10px font-size-12 dark-gray2">{{ row.label }}</span>
                    </label>
                </div>
            </div>
        </div>
        <Sidebar
            v-model:visible="isVisiblePrededine"
            title="Predefined Options"
            :enable-search="true"
            :options="predefinedOptions"
            @selected="selectedObj($event)"
            :zIndex="10"
            :listenKeys="true"
        />
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import draggable from 'vuedraggable';
import { Country } from 'country-state-city';
import CustomFieldInputComponent from "@/components/atom/CustomFieldInputComponent/CustomFieldInputComponent.vue";
import RowComponent from '@/components/molecules/DropdownCustomField/RowComponent.vue';
import CheckboxComponent from "@/components/atom/Checkbox/CheckboxComponent.vue";
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';

// Utils
import { useCustomComposable } from "@/composable";
import monthsList from '@/utils/monthsList.json';
import genderList from '@/utils/genders.json';
import daysList from '@/utils/daysList.json';
import timeZoneOption from "@/views/Settings/MySettings/timezoneArray.js";

const { makeUniqueId } = useCustomComposable();
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
    }
);

// Emits
const emit = defineEmits(['handleFunction', 'tabIndexUpdate']);

watch(() => props.tabIndex, (val) => {
    tabIndexCheck.value = val;
});

// Variables
const isVisiblePrededine = ref(false);
const fieldLabel = ref('');
const fieldPlaceholder = ref('');
const fieldDescription = ref('');
const tabIndexCheck = ref(props.tabIndex);
const selectedOption = ref({});
const predefinedOptions = ref([
    { label: "None", value: "none" },
    { label: "Gender", value: "gender" },
    { label: "Days", value: "days" },
    { label: "Months", value: "months" },
    { label: "Time Zone", value: "timezone" },
    { label: "Country", value: "country" }
]);
const contriesArray = ref(Country.getAllCountries());
const options = ref(props.customFieldObject.fieldOptions ? JSON.parse(JSON.stringify(props.customFieldObject.fieldOptions)) : [{
    id: makeUniqueId(5),
    color: "#34495E",
    value: "",
    label: "",
    selected: false
}]);
const rowIndexs = ref([]);

watch(() => props.customFieldObject.fieldOptions, (val) => {
    options.value = val;
});

// This function is used to add new row
const addRow = () => {
    const obj = {
        id: makeUniqueId(5),
        color: "#34495E",
        value: "",
        label: "",
        selected: false
    }
    
    if(props.customFieldObject?.fieldDescription){
        if(options.value.filter((x) => x.label === "").length){
            return;
        }
        rowIndexs.value = [];
        rowIndexs.value.push(obj.id);
        checkOldId.value = obj.id;
        options.value.push(obj);
        setTimeout(()=>{
            const focusCheck = document.getElementById(`focus${obj.id}`);
            if(focusCheck){
                focusCheck.focus();
            }
        });
    }else{
        options.value.push(obj);
    }
}

// This function is used to delete selected option
const deleteRow = (index) => {
    options.value.splice(index, 1);
}

const selectedObj = (obj) => {
    options.value = [];
    selectedOption.value = obj;
    switch (obj.value) {
        case "none":
            options.value = [];
            addRow();
            break;
        case "gender":
            options.value = genderList.map(x => ({ ...x, id: makeUniqueId(5), color: "#34495E", selected: false }));
            break;
        case "days":
            options.value = daysList.map(x => ({ ...x, id: makeUniqueId(5), color: "#34495E", selected: false }));
            break;
        case "months":
            options.value = monthsList.map(x => ({ ...x, id: makeUniqueId(5), color: "#34495E", selected: false }));
            break;
        case "timezone":
            options.value = timeZoneOption.map(x => ({ label: x, value: "", id: makeUniqueId(5), color: "#34495E", selected: false }));
            break;
        case "country":
            options.value = contriesArray.value.map(x => ({ label: x.name, value: x.isoCode, id: makeUniqueId(5), color: "#34495E", selected: false }));
            break;
        default:
            options.value = [];
            addRow();
            break;
    }
}

// Redirect to the tab where the validation error message is displayed.
const handleTabComp = (node) => {
    if (!(node._value.fieldDescription && node._value.fieldTitle && node._value.fieldPlaceholder)) {
        tabIndexCheck.value = 1;
        emit('tabIndexUpdate', tabIndexCheck.value)
    } else if (options.value.length) {
        if (options.value.some(ele => ele.label.trim() === "")) {
            tabIndexCheck.value = 2;
            emit('tabIndexUpdate', tabIndexCheck.value)
        }
    }
};

// submit the form
const handleSubmitComp = (object) => {
    options.value.forEach(ele => {
        delete ele?.preValue;
        ele.value === '' ? ele.value = ele.label.trim().replaceAll(' ', '_').toLowerCase() : { ...ele };
    });

    object.fieldOptions = options.value;
    let length = object.fieldMinimum || object.fieldMaximum ? `length:${`${object.fieldMinimum ? object.fieldMinimum : 0}` + `${object.fieldMaximum ? `,${object.fieldMaximum}` : ''}`}` : ''
    object.fieldValidation = length ? length : ''
    object.fieldType = props.componentDetail.cfType;
    object.fieldMinimum = object.fieldMinimum ? String(object.fieldMinimum) : '';
    object.fieldMaximum = object.fieldMaximum ? String(object.fieldMaximum) : '';
    object.fieldImage = props.componentDetail.cfIcon;
    object.fieldImageGrey = props.componentDetail.cfIconGrey;
    delete object?.entryLimits;
    Object.keys(object).forEach((key) => {
        if (key.startsWith("option_") || key.startsWith("option_color_")) {
            delete object[key];
        }
    });
    emit('handleFunction',object,props.customFieldObject && Object.keys(props.customFieldObject).length ? true : false);
};

const handleCheckRow = (object) => {
    options.value.forEach((x)=>{
        if(x.id !== object.id){
            x.selected = false;
        }
    })
};
const checkOldId = ref('');
const isChecked = ref(false);

watch(()=> checkOldId.value ,(newVal,oldVal) =>{
    if(oldVal){
        const optionArrayValue = options.value.find((x) => x.id === oldVal);
        if(optionArrayValue && newVal?.new !== true){
            if(optionArrayValue?.preValue && !optionArrayValue?.label || (optionArrayValue?.preValue !== optionArrayValue?.label && isChecked.value === false)){
                optionArrayValue.label = optionArrayValue.preValue;
                const index = options.value.findIndex((x) => !x.label);
                if(index > -1){
                    options.value.splice(index,1)
                }
            }
        }
    }
});
const editRow = (boolean,val,old) => {
    checkOldId.value = val;
    const optionArray = options.value.find((x) => x.id === val);
    if(boolean === true){
        optionArray.preValue = old;
        rowIndexs.value = [val];
        isChecked.value = false;
    }
    else if(boolean === null){
        if(options.value.length === 1){
            return;
        }
        if(optionArray?.preValue){
            optionArray.label = optionArray.preValue;
        }else if((!optionArray.preValue && !optionArray.label) || (optionArray.preValue === undefined)){
            const index = options.value.findIndex((x) => x.label === "");
            options.value.splice(index,1)
        }
        rowIndexs.value = [];
        isChecked.value = false;
    }else if(boolean === false){
        if(old){
            isChecked.value = true;
            optionArray.preValue = old;
            rowIndexs.value = [];
        }else{
            isChecked.value = false;
            optionArray.label = "";
        }
    }
};

defineExpose({ handleTabComp, handleSubmitComp });
</script>