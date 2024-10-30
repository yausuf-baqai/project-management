<template>
    <div class="p-1">
        <div class="style-scroll workSpaceSection companyWrapper">
                    <div class="companyWrapper__content">
                        <ul class="imageUplaod">
                            <li v-for="(item, index) in companies" :key="index" class="active">
                                <div>
                                    <span v-if="!item.Cst_profileImage" class="no-img p-0">
                                    {{ item.Cst_CompanyName.charAt(0).toUpperCase()}}
                                    </span>
                                    <span v-else class="p-0">
                                    <img v-if="item.Cst_profileImage.includes('firebasestorage')" :src="item.Cst_profileImage" alt="" class="companyimg">
                                    <WasabiIamgeCompp v-else class="companyimg" :companyId="item._id" :data="{url:item.Cst_profileImage}"/>
                                    </span>
                                </div>
                                <span class="black">{{ item.Cst_CompanyName }}</span>
                            </li>
                                <SpinnerComp :is-spinner="isSpinner"/>
                            </ul>
                    </div>
                    <!--//// Sidebar ////////// -->
                    <Sidebar v-if="visible" width="607px" class="sidebar__top47">
                            <template #head>
                                <div class="sidebarHeader d-flex justify-content-between">
                                    <h3 class="primaryColor">Create Company</h3>
                                </div>
                            </template>
                            <template #body>
                                <form class="createCompanyform create_company_wrapper">
                                    <div class="col-md-2 company_img">
                                        <div v-show="!Company_profileImage" class="image-input create-workspace-sidebar-image" @click="openCropperTool()">
                                            <span class="placeholder" > Upload Image </span>
                                            <img :src="upload" class="upload_image" :height="12" :width="13">
                                        </div>
                                        <img v-show="Company_profileImage" @click="openCropperTool()" :src="Company_profileImage" class="create-workspace-sidebar-image">
                                        </div>
                                            <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                                                <label class="font-size-14 font-weight-500">
                                                    Company Name<span class="redmark">*</span>
                                                </label>
                                                <div class="teaminput-sidebar">
                                                    <InputText :modelValue="createCompanyObj.Cst_CompanyName.value" @update:modelValue="(val)=>{ createCompanyObj.Cst_CompanyName.value = val.trim() }" placeHolder="Enter Company Name" width="367px" 
                                                    @keyup="checkErrors({'field':createCompanyObj.Cst_CompanyName,
                                                    'name':createCompanyObj.Cst_CompanyName.name,
                                                    'validations':createCompanyObj.Cst_CompanyName.rules,
                                                    'event':$event.event})" />
                                                    <div class="red error" >{{visible ? createCompanyObj.Cst_CompanyName.error : (createCompanyObj.Cst_CompanyName.error = '') }}</div>
                                                </div>
                                            </div>

                                    <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                                        <label class="font-size-14 font-weight-500">
                                            Phone<span class="redmark">*</span>
                                        </label>
                                        <div class="teaminput-sidebar">
                                            <div class="d-flex">
                                                <PhoneCountry @onSelect="(val)=> createCompanyObj.Cst_DialCode.value = val " :preferredCountries="['IN', 'US']" :enabledCountryCode="true" :enabledFlags="true"  class="border-topbottom-left-6-px"/> 
                                                    <img class="arrow" :src="arrow">
                                                    <InputText :modelValue="String(createCompanyObj.Cst_Phone.value)" @keypress="(val)=> isNumber(val.event)" class="border-leftright-6-px border-left"  @update:modelValue="(val)=>{ createCompanyObj.Cst_Phone.value = String(val) }" placeHolder="eg. 000-000-0000" width="272px"
                                                        @keyup="checkErrors({'field':createCompanyObj.Cst_Phone,
                                                        'name':createCompanyObj.Cst_Phone.name,
                                                        'validations':createCompanyObj.Cst_Phone.rules,
                                                        'type':'string',
                                                        'event':$event.event})"/>  
                                            </div>
                                            <div class="red error" >{{ createCompanyObj.Cst_Phone.error }}</div>
                                        </div>
                                    </div>
                                    <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                                        <label class="font-size-14 font-weight-500">
                                            Country<span class="redmark">*</span>
                                        </label>
                                        <div class="teaminput-sidebar">
                                                <InputText inputId="country_input" :modelValue="createCompanyObj.Cst_Country.value" :isReadonly="true" @click="countryVisible = true,locationKey='country',HandleSidebar(locationKey)" @focus="countryVisible = true,locationKey='country',HandleSidebar(locationKey)" @update:modelValue="(val)=>{ createCompanyObj.Cst_Country.value = val }" placeHolder="Select Country" width="367px"/>                                    
                                                <div class="red error" >{{ !createCompanyObj.Cst_Country.value ? createCompanyObj.Cst_Country.error:'' }}</div>
                                        </div>
                                    </div>

                                            <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                                                <label class="font-size-14 font-weight-500">
                                                    State<span class="redmark">*</span>
                                                </label>
                                                <div class="teaminput-sidebar">
                                                    <InputText inputId="refState1" :disabled="locationObj['state']?.isStateVal" :modelValue="createCompanyObj.Cst_State.value" :isReadonly="true" @update:modelValue="(val)=>{ createCompanyObj.Cst_State.value = val}" @focus="countryVisible = true,locationKey='state',HandleSidebar(locationKey)" @click="countryVisible = true,locationKey='state',HandleSidebar(locationKey)" :placeHolder="locationObj['state']?.isStateVal == false ? 'Select State' : 'No States'" width="367px"/>
                                                    <div class="red error" >{{ !createCompanyObj.Cst_State.value ? createCompanyObj.Cst_State.error  : ''}}</div>
                                                </div>
                                            </div>

                                            <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                                                <label class="font-size-14 font-weight-500">
                                                    City<span class="redmark">*</span>
                                                </label>
                                                <div class="teaminput-sidebar">
                                                    <InputText inputId="refCity1" :disabled="(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)" :modelValue="createCompanyObj.Cst_City.value" :isReadonly="true" @focus="countryVisible = true,locationKey='city',HandleSidebar(locationKey)" @click="countryVisible = true,locationKey='city',HandleSidebar(locationKey)" @update:modelValue="(val)=>{ createCompanyObj.Cst_City.value = val }" :placeHolder="!(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal) ? 'Select City' : 'No Cities'" width="367px"/>                                
                                                    <div class="red error" >{{ !createCompanyObj.Cst_City.value ? createCompanyObj.Cst_City.error : '' }}</div>
                                                </div>
                                            </div>

                                    <div class="btn_block d-flex">
                                        <button class="white_btn font-roboto-sans d-flex align-items-center company__btn-cancel" type="button" @click="visible = false,cleanUp()">Cancel</button>
                                        <button ref="refButton1" class="blue_btn font-roboto-sans d-flex align-items-center company__btn-save" type="button" @click="HandleSubmit">Save</button>
                                    </div>
                                </form>
                            </template> 
                    </Sidebar>
    
                    <!-- country Sidebar -->
                    <Sidebar v-if="countryVisible" 
                    :title="locationObj[locationKey].title" 
                    :enable-search="true" 
                    @selected="(val)=> HandleValues(locationKey,val)" 
                    @update:visible="(val)=> countryVisible = val"  
                    :closeOnBackDrop="false"
                    :listenKeys="true"
                    :value="currentSidebarValue"
                    :options="locationObj[locationKey].options.map((x)=>{ return {...x, label: x.name, value: x.name}})"
                    /> 
                    <CroppingTool  :image="{url:Company_profileImage,name:previewImage.name}" @updateVisible="(val) => isCropperVisible = val" @getEditedImage="(val)=>{Company_profileImage = val.url,file=val.fileName,base64Image=val.base64Image}" />
        </div>
    </div>
    <Modal v-model="isCompanyProcess" :header="false" :footer="false" >
        <template #body>
            <div>
                <div class="pr-2 pl-2 pt-5 pb-5 text-center">
                    {{stepCompanyProcessMessage}}
                    <div class="mt-3">
                        <div class="custom-loader">
                            <div class="loaderBar bg-blue"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup>

//components  
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import PhoneCountry from "@/components/molecules/CountryPhoneNumberDropdown/PhoneCountry.vue"
import InputText from "@/components/atom/InputText/InputText.vue";
import CroppingTool from '@/components/atom/CroppingTool/CroppingTool.vue'
import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
import Modal from "@/components/atom/Modal/Modal.vue";
import { apiRequestWithoutCompnay } from '../../../services';

// utility
import { defineComponent, inject, ref,computed} from "vue";
import { useValidation } from "@/composable/Validation.js";
import * as env from '@/config/env';
// import { useGetterFunctions } from "@/composable/index.js";

// packages
import {useToast} from 'vue-toast-notification';
import { Country, State, City } from 'country-state-city';
import { useStore } from "vuex";
import { App, BSON } from 'realm-web';


defineComponent({
    name: "CompanyComponent",
    SpinnerComp
})


// const {getUser} = useGetterFunctions()
const {getters} = useStore();
const companies = computed(() => {
    return getters["settings/companies"];
})
const  { checkErrors,checkAllFields  } = useValidation();
const arrow = require("@/assets/images/svg/drop_down_arrow.svg")
const userId = inject("$userId");
const upload = require("@/assets/images/svg/crop-cloud.svg")
const visible = ref(false);
const countryVisible = ref(false);
const isCropperVisible = ref(false)
const isSpinner = ref(false);
const isCompanyProcess = ref(false);
const stepCompanyProcessMessage = ref("");
const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
const locationObj = ref({
country:{options: Country.getAllCountries(),title:'Select Country',key:'country',countryCode:'IN'},
state:{options:State.getStatesOfCountry('IN'),title:'Select State',key:'State',countryCode:'IN',stateCode:'GJ',isStateVal: false},
city:{options:City.getCitiesOfState('IN', 'GJ'),title:'Select City',key:'State',isCityVal: false}
})
const createCompanyObj = ref({
    Cst_CompanyName:{
            value: "",
            rules:
            `required | min:3`,
            name: "company name",
            error: ""
        },
        Cst_Phone:{
            value:"",
            rules:
            "required | min:10 | max:10 | regex:^[0-9]+$",
            name: "phone",
            error:""
        },
        Cst_Country:{
            value:"",
            rules:
            "required",
            name: "country",
            error:""
        },
        Cst_State:{
            value:"",
            rules:
            "required",
            name: "state",
            error:""
        },
        Cst_City:{
            value:"",
            rules:
            "required",
            name: "city",
            error:""
        },
        Cst_DialCode:{
            value:()=>{}
        }
    });
const locationKey = ref('country') 
const file = ref()
const base64Image = ref('')
const $toast = useToast();
const previewImage = ref("");
const Company_profileImage = ref('')
const refButton1 = ref()
const currentSidebarValue = ref([]);

const handleDisabled = async (key, val) => {
    const country = val.isoCode;
    const state = val.countryCode;
    const noStates = (await State.getStatesOfCountry(country)).length === 0;
    const noCities = (await City.getCitiesOfState(state, country)).length === 0;

    if (key === 'country') {
        locationObj.value['state'].isStateVal = noStates;
        createCompanyObj.value.Cst_City.rules = noStates ? '' : 'required';
        createCompanyObj.value.Cst_State.rules = noStates ? '' : 'required';
        createCompanyObj.value.Cst_State.error = '';
        createCompanyObj.value.Cst_City.error = '';
    } else if (key === 'state') {
        locationObj.value['city'].isCityVal = noCities;
        createCompanyObj.value.Cst_City.rules = noCities ? '' : 'required';
        createCompanyObj.value.Cst_City.error = '';
    }
};

const HandleSidebar = (key) =>{
    switch (key) {
        case 'country':
            currentSidebarValue.value = [{ value: createCompanyObj.value.Cst_Country.value }];
            break;
        case 'state':
            locationObj.value[key].options = State.getStatesOfCountry(locationObj.value['country']['countryCode'])            
            currentSidebarValue.value = [{ value: createCompanyObj.value.Cst_State.value }];
            break;
        case 'city':
            locationObj.value[key].options = City.getCitiesOfState(locationObj.value['country']['countryCode'],locationObj.value['state']['stateCode'])            
            currentSidebarValue.value = [{ value: createCompanyObj.value.Cst_City.value }];
            break;
        default:
            break;
    }
}

const HandleValues = (key,val) => {
    switch (key) {
        case 'country':
            handleDisabled('country',val)
            locationObj.value[key]['countryCode'] = val['isoCode']
            createCompanyObj.value.Cst_Country.value = val.label
            checkErrors({'field':createCompanyObj.value.Cst_Country,
            'name':createCompanyObj.value.Cst_Country.name,
            'validations':createCompanyObj.value.Cst_Country.rules,
            'type':createCompanyObj.value.Cst_Country.type})
            createCompanyObj.value.Cst_State.value = ""
            createCompanyObj.value.Cst_City.value = ""
            setTimeout(() => { 
                const ele = document.getElementById("refState1");
                ele.focus();
            }, 1000);
            break;
        case 'state':
            handleDisabled('state',val)
            locationObj.value[key]['countryCode'] = val['countryCode']
            locationObj.value[key]['stateCode'] = val['isoCode']
            createCompanyObj.value.Cst_State.value = val.label
            checkErrors({'field':createCompanyObj.value.Cst_State,
            'name':createCompanyObj.value.Cst_State.name,
            'validations':createCompanyObj.value.Cst_State.rules,
            'type':createCompanyObj.value.Cst_State.type})
            createCompanyObj.value.Cst_City.value = ""
            setTimeout(() => { 
                const ele = document.getElementById("refCity1");
                ele.focus();
            }, 1000);
            break;
        case 'city':
            createCompanyObj.value.Cst_City.value = val.label
            checkErrors({'field':createCompanyObj.value.Cst_City,
            'name':createCompanyObj.value.Cst_City.name,
            'validations':createCompanyObj.value.Cst_City.rules,
            'type':createCompanyObj.value.Cst_City.type})
            setTimeout(() => { refButton1.value.focus() }, 1000);
            break; 
    }
}

const isNumber = (evt) => {
    const char = String.fromCharCode(evt.keyCode)
    if (!/[0-9]/.test(char)) {
        evt.preventDefault()
    }
}

const openCropperTool = () => {
    isCropperVisible.value = true
    document.getElementById('cropping-input').click()
}

const HandleSubmit = () =>{

   let duplicationCompany =  companies.value.filter((item)=>{
        return createCompanyObj.value.Cst_CompanyName.value.toLowerCase().trim().replaceAll(" ","") === item.Cst_CompanyName.toLowerCase().trim().replaceAll(" ","")
    })

    if(duplicationCompany.length){
        $toast.error("Company name already exists",{ position :'top-right' })
        return
    }
    checkAllFields(createCompanyObj.value).then((valid)=>{        
        if (valid ) {
            // const formData = new FormData();
            const evId = `ev_${BSON.ObjectID().toString()}`;
            const source = new EventSource(`${env.API_URI}/company-create/events/${evId}`);

            source.onmessage = function(event) {
                // Parse the event data (the progress update)
                if (!isCompanyProcess.value) {
                    isCompanyProcess.value = true;
                }
                const data = JSON.parse(event.data)?.data;

                if (data?.step === 1) {
                    stepCompanyProcessMessage.value = "Creating Company"
                } else if (data?.step === 2) {
                    stepCompanyProcessMessage.value = "Your company was created. We have set up the initial steps. Please wait a moment.";
                } else {
                    source.close(); // Close the connection when the progress reaches 100%
                    if (data?.error) {
                        stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                        setTimeout(() => {
                            isCompanyProcess.value = false;
                        }, 1500)
                        return;
                    }
                    stepCompanyProcessMessage.value = "Good To Go.";
                    setTimeout(() => {
                        $toast.success("Company has been created Successfully.",{position: 'top-right'});
                        isCompanyProcess.value = false;
                        window.location.reload();
                    }, 1500);
                }
            };
            source.onerror = function(error) {
                console.log('EventSource failed1:', error);
                setTimeout(() => {
                    isCompanyProcess.value = false;
                }, 2000);
                source.close(); // Close the connection in case of error
            };

            let subscriptionData = {
                storage : 0,
                trackers: 0,
                users :5
            }
            let totalData = {
                storage: 0,
                trackers: 0,
                users:1
            }
            const formData = {
                userId : userId.value,
                email: app?.currentUser?._profile?.data?.email || "",
                companyName : createCompanyObj.value.Cst_CompanyName.value,
                phoneNumber : createCompanyObj.value.Cst_Phone.value,
                country : createCompanyObj.value.Cst_Country.value,
                city : createCompanyObj.value.Cst_City.value,
                state : createCompanyObj.value.Cst_State.value,
                countryCodeObj : createCompanyObj.value.Cst_DialCode.value,
                logtimeDays : 8,
                totalProjects : 0,
                isInactive : false,
                isFree : true ,
                subscriptionData : subscriptionData,
                totalData : totalData,
                eventId : evId,
            }
            if(Company_profileImage.value){
                formData.file = base64Image.value;
                formData.fileName = file.value;
            }
            try {
                isSpinner.value = true;
                visible.value = false;
                apiRequestWithoutCompnay("post", env.CREATE_COMPANY, formData).then((res)=>{
                    if(res.data.status === true){
                        // $toast.success("Company has been created Successfully.",{position: 'top-right'});
                    }else{
                        source.close(); // Close the connection when the progress reaches 100%
                        stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                        setTimeout(() => {
                            isCompanyProcess.value = false;
                        }, 1500)
                        $toast.error("Something went wrong",{position: 'top-right'})
                    }
                    isSpinner.value = false
                    cleanUp()
                }).catch((error) => {
                    console.error(`Company Create Error: ${JSON.stringify(error)}`);
                    $toast.error(error,{position: 'top-right'})    
                    source.close(); // Close the connection when the progress reaches 100%
                    stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                    setTimeout(() => {
                        isCompanyProcess.value = false;
                    }, 1500)    
                })
            } catch (error) {
                console.error(`Company Create Error: ${JSON.stringify(error)}`);
                $toast.error(error,{position: 'top-right'})    
                source.close(); // Close the connection when the progress reaches 100%
                stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                setTimeout(() => {
                    isCompanyProcess.value = false;
                }, 1500)
            }
        }
    })
}

const cleanUp = () =>{
    for(let key in createCompanyObj.value) {
        createCompanyObj.value[key].error = ''
        createCompanyObj.value[key].value = ''
    }
    createCompanyObj.value.Cst_City.rules = 'required';
    createCompanyObj.value.Cst_State.rules = 'required';
    locationObj.value['state'].isStateVal = false;
    locationObj.value['city'].isCityVal = false;
    Company_profileImage.value = ""
    isCropperVisible.value = false
}

</script>

<style scoped>
@import './style.css'
</style>