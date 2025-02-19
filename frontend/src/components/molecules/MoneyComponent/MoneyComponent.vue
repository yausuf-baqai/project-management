<template>
    <div>
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
            <div class="formkit__form-wrapper">
                <label class="formkit-label">Currency</label>
            </div>
            <DropDown @isVisible="search='',allCountriesArray = allCountries" :zIndex="10" :id="customFieldUniqueId" :bodyClassHeader="{'heightcalc' : true}">
                <template #button>
                    <div class="formkit__form-wrapper" :ref="customFieldUniqueId">
                        <div class="d-flex border-gray border-radius-5-px align-items-center p-4px justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="ml-8px font-size-13 font-weight-400 gray81 d-block">{{currency}}</span>
                            </div>
                            <div class="mr-8px">
                                <img class="rotate-z-90" :src="dropDownArrow" alt="">
                            </div>
                        </div>
                    </div>
                </template>
                <template #options>
                    <input type="text" class="customfield__form-control" placeholder="search" v-model="search" @input="handleInput">
                    <div v-if="allCurrencyArray && allCurrencyArray.length">
                        <DropDownOption v-for="(Currency,index) in allCurrencyArray" :key="index" @click="$refs[customFieldUniqueId].click(),handleUpdate(Currency)">
                            <div class="d-flex align-items-center">
                                <span>{{Currency.name}}</span>
                            </div>
                        </DropDownOption>
                    </div>
                    <div class="text-center p-3px" v-else>
                        no currency found
                    </div>
                </template>
            </DropDown>
        </div>
    </div>
</template>

<script setup>
    import { useStore } from "vuex";
    import { ref, watch, computed } from "vue";
    import { useCustomComposable } from "@/composable";
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
    import CustomFieldInputComponent from "@/components/atom/CustomFieldInputComponent/CustomFieldInputComponent.vue";
    
    const { getters } = useStore();
    const {makeUniqueId} = useCustomComposable();

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
    const allCurrency = computed(() => JSON.parse(JSON.stringify((getters['settings/allCurrencyArray'].filter((x)=> x.isDelete === true)))));
    const allCurrencyArray = ref(allCurrency.value);
    const currency = ref(props?.customFieldObject?.fieldMoneyName ? props?.customFieldObject?.fieldMoneyName : 'Indian Rupee');
    const currencyObj = ref(
        props?.customFieldObject?.fieldMoneyCode ? 
        allCurrency.value && allCurrency.value.length ?
        allCurrency.value?.find((x) => x.code === props?.customFieldObject?.fieldMoneyCode) :
        {
            "code": "INR",
            "decimal_digits": 2,
            "isDefault": true,
            "isDelete": true,
            "name": "Indian Rupee",
            "name_plural": "Indian rupees",
            "rounding": 0,
            "symbol": "₹",
            "symbol_native": "টকা"
        } : 
        allCurrency.value && allCurrency.value.length ?
        allCurrency.value?.find((x) => x.code === "INR") :
        {
            "code": "INR",
            "decimal_digits": 2,
            "isDefault": true,
            "isDelete": true,
            "name": "Indian Rupee",
            "name_plural": "Indian rupees",
            "rounding": 0,
            "symbol": "₹",
            "symbol_native": "টকা"
        }
    )
    
    watch(() => props.tabIndex, (val) =>{
        tabIndexCheck.value = val;
    });
    // ref
    //FIRST Tab
    const search = ref('');
    const fieldLabel = ref('');
    const fieldPlaceholder = ref('');
    const tabIndexCheck = ref(props.tabIndex);
    const fieldDescription = ref('');
    const customFieldUniqueId = `custom-field${makeUniqueId(6)}`
    // image
    const dropDownArrow = require('@/assets/images/svg/triangleBlack.svg');
    // Redirect to the tab where the validation error message is displayed.
    const handleTabComp = (node) => {
        if(!(node._value.fieldDescription && node._value.fieldTitle && node._value.fieldPlaceholder)){
            tabIndexCheck.value = 1;
            emit('tabIndexUpdate',tabIndexCheck.value)
        }else if(!node._value.fieldMoneyCode){
            tabIndexCheck.value = 2;
            emit('tabIndexUpdate',tabIndexCheck.value)
        }
    };
    // submit the form
    const handleSubmitComp = (object) => {
        object.fieldType = props.componentDetail.cfType
        object.fieldValidation = '';
        object.fieldMoneySymbol = currencyObj.value.symbol;
        object.fieldMoneyName = currencyObj.value.name;
        object.fieldMoneyCode = currencyObj.value.code;
        object.fieldImage = props.componentDetail.cfIcon;
        object.fieldImageGrey = props.componentDetail.cfIconGrey;
        object.fieldPlaceholder = object.fieldPlaceholder.trim();
        object.fieldTitle = object.fieldTitle.trim();
        object.fieldDescription = object.fieldDescription.trim();
        emit('handleFunction',object,props.customFieldObject && Object.keys(props.customFieldObject).length ? true : false)
    };

    const handleUpdate = (val) => {
        currency.value = val.name;
        currencyObj.value = val;
    };

    const handleInput = () => {
        allCurrencyArray.value = allCurrency.value;
        if(search.value){
            const filters = allCurrencyArray.value.filter(x => x.name.toLowerCase().includes(search.value.toLowerCase()));
            allCurrencyArray.value = filters;
        }
    };
  
    defineExpose({handleTabComp,handleSubmitComp});
</script>
