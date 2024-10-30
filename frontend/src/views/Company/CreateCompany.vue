<template>
    <div v-if="mainSpinner" class="d-flex align-items-center justify-content-center lds-roller h-100dvh">
        <img :src="logo" alt="logo" class="position-ab z-index-1 company__logo">
        <div class="spinner"></div>
    </div>
    <Template v-else>
        <div class="ah-rightside" :class="[{'disableInputField':isSpinner}]">
            <div class="sinup-login-title-wrapper">
                <h3 class="font-weight-bold dark-gray text-capitalize">Set up your Company</h3>
                <p class="GunPowder">Fill in your company details</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label class="font-roboto-sans gray">Company Name<span class="red">*</span></label>
                    <InputText
                        class="form-control login-input"
                        placeHolder="eg. Algorithm Computers"
                        v-model.trim="formData.companyName.value"
                        :max-length="60"
                        tabindex="1"
                        height="56px"
                        width="100%"
                        @keyup="checkErrors({'field':formData.companyName,
                        'name':formData.companyName.name,
                        'validations':formData.companyName.rules,
                        'type':formData.companyName.type,
                        'event':$event.event})"
                        inputId="refCompanyName"
                    />
                    <div class="invalid-feedback red" >{{ formData.companyName.error }}</div>
                </div>
                <div class="form-group country-code-main">
                    <label class="font-roboto-sans gray">Phone Number<span class="red">*</span></label>
                    <div class="d-flex phone-country-wrapper">
                        <PhoneCountry  @onSelect="onSelect" :preferredCountries="['IN', 'US']" :enabledCountryCode="true" :enabledFlags="true" />
                        <InputText
                        class="form-control login-input border-radius-0 company-phno"
                        placeHolder="eg. 000-000-0000"
                        v-model.trim="formData.phoneNumber.value"
                        :max-length="13"
                        tabindex="1"
                        height="56px"
                        width="100%"
                        @keyup="checkErrors({'field':formData.phoneNumber,
                        'name':formData.phoneNumber.name,
                        'validations':formData.phoneNumber.rules,
                        'type':formData.phoneNumber.type,
                        'event':$event.event})"
                        @keypress="isNumber($event.event)"
                    />
                    </div>
                    <div class="invalid-feedback red" >{{ formData.phoneNumber.error }}</div>
                </div>
                <div class="form-group">
                    <label class="font-roboto-sans gray">Country<span class="red">*</span></label>
                    <InputText
                        class="form-control login-input"
                        placeHolder="eg. India"
                        v-model="formData.country.value"
                        :max-length="50"
                        tabindex="3"
                        height="56px"
                        width="100%"
                        @click="setFocus('country')"
                        @focus="setFocus('country')"
                        :isReadonly="true"
                    />
                <div class="invalid-feedback red" >{{ formData.country.error }}</div>
                </div>
                <div class="row align-items-start d-flex">
                    <div class="col-md-6 pl-0">
                        <div class="form-group">
                            <label class="font-roboto-sans gray">State<span class="red">*</span></label>
                            <InputText
                                class="form-control login-input"
                                :placeHolder="locationObj['state'].isStateVal == false ? 'eg. Gujarat' : 'No States'"
                                :disabled="locationObj['state'].isStateVal"
                                v-model="formData.state.value"
                                :max-length="50"
                                tabindex="4"
                                height="56px"
                                width="100%"
                                @click="setFocus('state')"
                                @focus="setFocus('state')"
                                :isReadonly="true"
                                inputId="refState"
                            />
                            <div class="invalid-feedback red">{{ formData.state.error }}</div>
                        </div>
                    </div>
                    <div class="col-md-6 pr-0">
                        <div class="form-group">
                            <label class="font-roboto-sans gray">City<span class="red">*</span></label>
                            <InputText
                                class="form-control login-input"
                                :placeHolder="!(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal) ? 'eg. Anand' : 'No Cities'"
                                v-model="formData.city.value"
                                :disabled="(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)"
                                :max-length="50"
                                tabindex="5"
                                height="56px"
                                width="100%"
                                @click="setFocus('city')"
                                @focus="setFocus('city')"
                                :isReadonly="true"
                                inputId="refCity"
                            />
                            <div class="invalid-feedback red" >{{ formData.city.error }}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group mt-10px">
                    <button v-if="!isSpinner" ref="refButton" type="submit" class="btn btn-blue btn-login font-roboto-sans bg-blue white font-weight-500 cursor-pointer" tabindex="6">Create Company</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans bg-blue white font-weight-500 opacity-7" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
                <div class="text-center cursor-pointer light-purple font-weight-500" @click="logOut()">Back to Login</div>
            </form>
        </div>
        <Sidebar
            :title="sidebarTitle"
            v-model:visible="visible"
            :enable-search="true"
            :options="dataArray"
            @selected="getSubSidebarData"
            width="337px"
            top="0px"
            :listenKeys="true"
            :value="currentSidebarValue"
            :className="visible === true ? 'sidebar__scroll' : ''"
        />

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
    </Template>
</template>

<script setup>
    import Template from "@/components/templates/Authentication/index.vue";
    import { App, BSON } from "realm-web";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import { useValidation } from "@/composable/Validation.js";
    import { ref , defineComponent , onMounted , computed , inject, nextTick} from "vue";
    import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
    import { Country, State, City }  from 'country-state-city';
    import { useStore } from "vuex";
    import { useRouter, useRoute } from 'vue-router'
    import { dbCollections } from '@/utils/FirebaseCollections';
    import * as env from '@/config/env';
    import {useToast} from 'vue-toast-notification';
    import PhoneCountry from "@/components/molecules/CountryPhoneNumberDropdown/PhoneCountry.vue";
    import { useGetterFunctions, useFirebase } from "@/composable";
    import Modal from "@/components/atom/Modal/Modal.vue";
    import { arrayRemove, updateDoc } from 'firebase/firestore';
    import { apiRequestWithoutCompnay } from "../../services";
    import { mongoGLOBALConnection } from "@/utils/MongoQueries/mongoAuth";
    import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
    const {generateQuery} = useFirebase();
    const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
    const router = useRouter();
    const route = useRoute();
    const  { checkErrors , checkAllFields } = useValidation();
    const {getters, commit} = useStore();
    const $toast = useToast();
    const {getUser} = useGetterFunctions();
    defineComponent({
        name: 'Create-Company',
        components: {
            Sidebar,
            PhoneCountry
        }
    })
    const userId = inject("$userId");
    const companyId = inject('$companyId');
    const formData = ref({
        companyName:{
            value: "",
            rules:
            "required | min:3",
            name: "company name",
            error: ""
        },
        phoneNumber:{
            value:"",
            rules:
            "required | min:10 | regex:^[0-9]+$",
            name: "phone number",
            error:""
        },
        country:{
            value:"",
            rules:
            "required",
            name: "country",
            error:""
        },
        state:{
            value:"",
            rules:
            "required",
            name: "state",
            error:""
        },
        city:{
            value:"",
            rules:
            "required",
            name: "city",
            error:""
        },
    });
    const isCompanyProcess = ref(false);
    const stepCompanyProcessMessage = ref("");
    const visible = ref(false);
    const contriesArray = ref([]);
    const dataArray = ref([]);
    const citiesArray = ref([]);
    const statesArray = ref([]);
    const sidebarTitle = ref("");
    const fieldType = ref("");
    const refButton = ref("");
    const countryCodeObj = ref({});
    const isSpinner = ref(false);
    const mainSpinner = ref(true);
    const locationObj = ref({
        state:{isStateVal: false},
        city:{isCityVal: false}
    })

    function changeCompany(cid) {
        let userCompany = getUser(userId.value).assigneeCompany;
        let checkCompany = getters['settings/companies'].filter((user) => userCompany.includes(user._id)).find((x) => x._id === cid)?.isDisable || false;
        if(checkCompany === false){
            companyId.value = cid;
            if(userCompany.includes(cid)){
                commit("settings/mutateSelectedCompany", companyId.value);
    
                localStorage.setItem('selectedCompany', cid);
                if(cid){
                    let routeObj = {name: 'Projects', params: {cid: cid}};
                    if(route?.params?.cid) {
                        routeObj.params.cid = cid;
                    }
                    router.replace(routeObj)
                    .then(() => {
                        // window.location.reload();
                    })
                    .catch((error) => {
                        console.error("ERROR in change company: ", error);
                    })
                }
            }else{
                router.push({name : 'Create_Company'});
                localStorage.removeItem('selectedCompany');
            }
        }else{
            $toast.error("Company is disable",{position: 'top-right'});
            let availableCompany = getters['settings/companies'].find((x) => !x.isDisable);
            if(availableCompany){
                router.push({name: 'Projects', params: {cid: cid}});
            }else{
                router.push({name : 'Create_Company'});
            }
        }
    }

    onMounted(() => {
        mainSpinner.value = true;
        (async() => {
            try {
                const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
                if (app.currentUser !== null && app.currentUser !== undefined) {
                    userId.value = app.currentUser.id
                }
    
                await mongoGLOBALConnection();
    
                const isProductOwner = await mongodbCrudOperations({
                    type: "findOne",
                    collection: dbCollections.USERS,
                    global: true,
                    data: [
                        {
                            _id: BSON.ObjectID(userId.value)
                        }
                    ]
                })
                .then((result) => {
                    return result?.isProductOwner;
                })
                .catch((error) => {
                    console.error("ERROR: ", error);
                    return false;
                })

                if(!(isProductOwner || (env.CANYONLICENSETYPE === "Extended License" && env.CANYON_IS_SINGLE_APP == 'false'))) {
                    $toast.error("Only product owner can create a company", {position: "top-right"})
                    logOut();
                    return;
                }
                mainSpinner.value = false;
                nextTick(() => {
                    const companyRef = document.getElementById("refCompanyName");
                    companyRef?.focus();
                    contriesArray.value = Country.getAllCountries();
                    statesArray.value = State.getStatesOfCountry('IN');
                    citiesArray.value = City.getCitiesOfState('IN','GJ');
                    if(getUser(userId.value).assigneeCompany?.length > 0 && companyId.value !== ''){
                        changeCompany(companyId.value);
                    }else{
                        changeCompany(companyId.value);
                    }
                })
            } catch (error) {
                mainSpinner.value = false;
            }
        })()
    });

    const companies = computed(() => {
        return getters["settings/companies"];
    })

    const currentSidebarValue = ref([]);
    function setCurrentSidebarValue(type) {
        const key = type
        currentSidebarValue.value = [JSON.parse(JSON.stringify(formData.value[key]))]
    }

    const setFocus = (type) =>{
        visible.value = true;
        if(type == 'country'){
            dataArray.value = contriesArray.value;
            sidebarTitle.value = (type == 'country') ? "Select Country" : "";
            fieldType.value = 'country';
        }
        if(type == 'state'){
            dataArray.value = statesArray.value;
            sidebarTitle.value = (type == 'state') ? "Select State" : "";
            fieldType.value = 'state';
        }
        if(type == 'city'){
            dataArray.value = citiesArray.value;
            sidebarTitle.value = (type == 'city') ? "Select City" : "";
            fieldType.value = 'city';
        }
        dataArray.value.map((x)=>{
            x["label"] = x.name;
            x["value"] = x.name;
        })

        setCurrentSidebarValue(type);
    }

    const handleDisabled = async (key, val) => {
        const country = val.isoCode;
        const state = val.countryCode;
        const noStates = (await State.getStatesOfCountry(country)).length === 0;
        const noCities = (await City.getCitiesOfState(state, country)).length === 0;
        if (key === 'country') {
            locationObj.value['state'].isStateVal = noStates;
            formData.value.state.rules = noStates ? '' : 'required';
            formData.value.city.rules = noStates ? '' : 'required';
            formData.value.state.error = '';
            formData.value.city.error = '';
            citiesArray.value = []
        } else if (key === 'state') {
            locationObj.value['city'].isCityVal = noCities;
            formData.value.city.rules = noCities ? '' : 'required';
            formData.value.city.error = '';
        }
    };

    const getSubSidebarData  = (val) => {
        if(fieldType.value === "country"){
            handleDisabled('country',val)
            formData.value.country.value = val.name;
            checkErrors({'field':formData.value.country,
            'name':formData.value.country.name,
            'validations':formData.value.country.rules,
            'type':formData.value.country.type})
            formData.value.state.value = "";
            formData.value.city.value = "";
            statesArray.value = State.getStatesOfCountry(val.isoCode);
            if(statesArray.value.length > 0) {
                setTimeout(() => { 
                    const ele = document.getElementById("refState");
                    ele.focus();
                }, 1000);
            } else {
                setTimeout(() => { refButton.value.focus() }, 1000);
            }
        }
        if(fieldType.value === "state"){
            handleDisabled('state',val)
            formData.value.state.value = val.name;
            checkErrors({'field':formData.value.state,
            'name':formData.value.state.name,
            'validations':formData.value.state.rules,
            'type':formData.value.state.type})
            formData.value.city.value = "";
            citiesArray.value = City.getCitiesOfState(val.countryCode, val.isoCode);
            if(citiesArray.value.length > 0) {
                setTimeout(() => { 
                    const refcity = document.getElementById("refCity");
                    refcity.focus();
                }, 1000);
            } else {
                setTimeout(() => { refButton.value.focus() }, 1000);
            }
        }
        if(fieldType.value === "city") {
            formData.value.city.value = val.name;
            checkErrors({'field':formData.value.city,
            'name':formData.value.city.name,
            'validations':formData.value.city.rules,
            'type':formData.value.city.type})
            setTimeout(() => { refButton.value.focus() }, 1000);
        }
    }

    const isNumber = (evt) => {
        const char = String.fromCharCode(evt.keyCode)
        if (!/[0-9]/.test(char)) {
            evt.preventDefault()
        }
    }

    const handleSubmit = () => {
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                if(companies.value.filter((x) => x.Cst_CompanyName.toLowerCase().trim() === formData.value.companyName.value.toLowerCase().trim()).length) {
                    $toast.error("Company name must be unique.",{position: 'top-right'});
                    return ;
                }
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
                            isCompanyProcess.value = false;
                            isSpinner.value = false;
                            router.push({name: 'Home'}).then(() => {
                                window.location.reload();
                            })
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
                const companyData = {
                    userId : userId.value,
                    email: app?.currentUser?._profile?.data?.email || "",
                    companyName : formData.value.companyName.value,
                    phoneNumber : formData.value.phoneNumber.value,
                    country : formData.value.country.value,
                    city : formData.value.city.value,
                    state : formData.value.state.value,
                    countryCodeObj : countryCodeObj.value,
                    logtimeDays : 8,
                    totalProjects : 0,
                    isInactive : false,
                    isFree : true ,
                    subscriptionData : subscriptionData,
                    totalData : totalData,
                    eventId : evId,
                }
                try {
                    isSpinner.value = true;
                    apiRequestWithoutCompnay("post", env.CREATE_COMPANY, companyData).then(async(res)=>{
                        if(res.data.status === true){
                            $toast.success("Company has been created Successfully.",{position: 'top-right'});
                            localStorage.setItem('selectedCompany', res.data.companyId);
                        }else{
                            source.close(); // Close the connection when the progress reaches 100%
                            stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                            setTimeout(() => {
                                isCompanyProcess.value = false;
                            }, 1500)
                            $toast.error("Something went wrong",{position: 'top-right'})
                            isSpinner.value = false;
                        }
                        localStorage.removeItem('isLogging');
                    }).catch((err)=>{
                        source.close(); // Close the connection when the progress reaches 100%
                        stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                        setTimeout(() => {
                            isCompanyProcess.value = false;
                        }, 1500)
                        isSpinner.value = false;
                        console.error("ERROR IN CREATE COMPANY",err)
                    })
                } catch (error) {
                    source.close(); // Close the connection when the progress reaches 100%
                    stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                    setTimeout(() => {
                        isCompanyProcess.value = false;
                    }, 1500)
                    isSpinner.value = false;
                    $toast.error(error,{position: 'top-right'})    
                }
            }
        })
    }

    const onSelect = ({name, isoCode, dialCode}) => {
        countryCodeObj.value = {
            "name": name,
            "dialCode": dialCode,
            "isoCode": isoCode
        }
    }

    const deleteToken = () => {
        return new Promise((resolve, reject) => {
            try {
                let obj = {};
                let token = localStorage.getItem("webTokens");
                if(!userId.value || !token) {
                    resolve();
                    return;
                }
                if(getUser(userId.value).WebTokens){
                    let currentToken = localStorage.getItem("webTokens");
                    if(currentToken !== null) {
                        obj = {
                            'isOnline': false,
                            'webTokens': arrayRemove(currentToken),
                            lastActive: new Date()
                        }
                    }else{
                        obj = {
                            'isOnline': false,
                            lastActive: new Date()
                        }
                    }
                }else{
                    obj = {
                        'isOnline': false,
                        lastActive: new Date()
                    }
                }
                let queryObject = {
                    path: `${dbCollections.USERS}/${userId.value}`,
                }
                const userQuery = generateQuery(queryObject);
                updateDoc(userQuery, obj).then(()=>{
                    resolve(true)
                })
            } catch (error) {
                reject(false)
                console.error(error,"error");
            }
        })
    }

    const logOut = async (route = null) => {
        await deleteToken()
        localStorage.removeItem("isLogging");
        localStorage.removeItem("currentUserEmail");
        localStorage.removeItem("SubmenuScreen");
        localStorage.removeItem("selectedCompany");
        localStorage.removeItem("SubmenuScreen");
        localStorage.removeItem("currentLoggedInUserDetails");
        localStorage.removeItem("userId");
        localStorage.removeItem("webTokens");
        localStorage.removeItem("token");
        localStorage.removeItem("updateToken");
        await app.currentUser.logOut();
        if(route === null) {
            router.push({ name: "Log-in" });
        } else {
            router.push(route)
        }
    }
</script>
<style src="../Authentication/Login/style.css">

</style>