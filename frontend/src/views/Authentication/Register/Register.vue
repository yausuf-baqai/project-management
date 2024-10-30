<template>
    <Spinner v-if="isLoading" :isSpinner="isLoading"/>
    <AuthTemplate v-else>
        <div class="ah-rightside" :class="[{'disableInputField':isSpinner}]">
            <div class="sinup-login-title-wrapper">
                <h3 class="font-weight-bold text-capitalize dark-gray">Welcome to {{brandSettings && brandSettings?.productName ? brandSettings.productName : 'Alian Hub'}}</h3>
                <p class="GunPowder">Get access to exclusive features by creating an account</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit">
                <div class="row align-items-start d-flex">
                    <div class="col-md-6 pl-0">
                        <div class="form-group">
                            <label class="gray font-roboto-sans" for="password">First Name<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input"
                                v-model.trim="formData.firsName.value"
                                height="56px"
                                width="100%"
                                :max-length="25"
                                placeHolder="eg. Maria"
                                type="text"
                                @keyup="checkErrors({'field':formData.firsName,
                                'name':formData.firsName.name,
                                'validations':formData.firsName.rules,
                                'type':formData.firsName.type,
                                'event':$event.event})"
                                id="firstName"
                                tabindex="1"
                            />
                            <div class="invalid-feedback red" >{{ formData.firsName.error }}</div>
                        </div>
                    </div>
                    <div class="col-md-6 pr-0">
                        <div class="form-group">
                            <label for="password" class="gray font-roboto-sans">Last Name<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input"
                                v-model.trim="formData.lastName.value"
                                height="56px"
                                width="100%"
                                :max-length="25"
                                placeHolder="eg. Tailor"
                                type="text"
                                @keyup="checkErrors({'field':formData.lastName,
                                'name':formData.lastName.name,
                                'validations':formData.lastName.rules,
                                'type':formData.lastName.type,
                                'event':$event.event})"
                                id="lastName"
                                tabindex="2"
                            />
                            <div class="invalid-feedback red" >{{ formData.lastName.error }}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="gray font-roboto-sans" for="password">Email ID<span class="red">*</span></label>
                    <input
                        class="form-control login-input"
                        name="email"
                        type="text"
                        placeholder="mail@abc.com"
                        :value="email"
                        disabled
                    />
                    <div class="invalid-feedback red" >{{ formData && formData.email && formData.email.error }}</div>
                </div>
                <div class="row align-items-start d-flex">
                    <div class="col-md-6 pl-0">
                        <div class="form-group">
                            <label class="gray font-roboto-sans" for="password">Password<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input pwd__input"
                                v-model="formData.password.value"
                                height="56px"
                                width="100%"
                                :max-length="150"
                                placeHolder="*****"
                                :type="viewPassword"
                                @keyup="checkErrors({'field':formData.password,
                                'name':formData.password.name,
                                'validations':formData.password.rules,
                                'type':formData.password.type,
                                'event':$event.event}),updateConfirmation()"
                                id="password"
                                tabindex="4"
                            />
                            <span @click="togglePasswordInput('password')" class="cursor-pointer position-ab d-flex align-items-center eye">
                                <img v-if="viewPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                                <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                            </span>
                            <div class="invalid-feedback red" >{{ formData.password.error }}</div>
                        </div>
                    </div>
                    <div class="col-md-6 pr-0">
                        <div class="form-group">
                            <label class="gray font-roboto-sans" for="password">Confirm Password<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input pwd__input"
                                v-model="formData.confirmPassword.value"
                                height="56px"
                                width="100%"
                                :max-length="150"
                                placeHolder="*****"
                                :type="viewConfirmPassword"
                                @keyup="confirmationPassValidation()"
                                id="confirmPassword"
                                tabindex="5"
                            />
                            <span @click="togglePasswordInput('cpassword')" class="cursor-pointer position-ab d-flex align-items-center eye">
                                <img v-if="viewConfirmPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                                <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                            </span>
                            <div class="invalid-feedback red" >{{ confirmationErr }}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group d-flex checkbox-label forgot-checkbox flex-wrap">
                    <input type="checkbox" 
                        id="checkbox-term-policy" 
                        data-vv-as="term and conditions"
                        name="termPolicy"
                        class="styled-checkbox position-ab opacity-none"
                        v-model="formData.termsAndCondition.value"
                        @click="checkErrors({'field':formData.termsAndCondition,
                        'name':formData.termsAndCondition.name,
                        'validations':formData.termsAndCondition.rules,
                        'type':formData.termsAndCondition.type,
                        'event':$event})">
                    <label  for="checkbox-term-policy" class="chk-label gray font-roboto-sans d-flex align-items-center">
                        <span>I agree to the <a :href="brandSettings && brandSettings?.termsOfService ? brandSettings.termsOfService : 'javascript:void(0)'" :target="brandSettings && brandSettings?.termsOfService ? '_blank' : ''" :style="[{'pointer-events' : isSpinner ? 'none' : ''}]">Terms of Service</a> and <a :href="brandSettings && brandSettings?.privacyPolicy ? brandSettings.privacyPolicy : 'javascript:void(0)'" :target="brandSettings && brandSettings?.privacyPolicy ? '_blank' : ''" :style="[{'pointer-events' : isSpinner ? 'none' : ''}]"> Privacy Policy</a></span>   
                    </label>
                    <div class="invalid-feedback red w-100" >{{ formData.termsAndCondition.error }}</div>
                </div>
                <div class="form-group">
                    <button v-if="!isSpinner"  type="submit" class="btn btn-blue btn-login font-roboto-sans bg-blue white font-weight-500 cursor-pointer" tabindex="6">Register</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans opacity-7 white bg-blue font-weight-500" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
                <div class="create-accountlink text-center">
                    <span class="font-roboto-sans font-weight-normal font-weight-400 gray already__acount">Already have an account? <router-link class="light-purple font-weight-500" :style="[{'pointer-events' : isSpinner ? 'none' : ''}]" :to="{name: 'Log-in'}">Login</router-link></span>
                </div>
            </form>
        </div>
    </AuthTemplate>
</template>

<script setup>
import { defineComponent ,ref , inject, onMounted, computed } from "vue";
import { useValidation } from "@/composable/Validation.js";
import * as env from '@/config/env';
const  { checkErrors, checkAllFields } = useValidation();
import { useRouter, useRoute } from 'vue-router'
import {useToast} from 'vue-toast-notification';
import InputText from "@/components/atom/InputText/InputText.vue";
import AuthTemplate from "@/components/templates/Authentication/index.vue";
import Spinner from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import { apiRequest } from '../../../services'
import { dbCollections } from "../../../utils/FirebaseCollections";
import { BSON } from 'realm-web';
const axios = inject("$axios");
const $toast = useToast();
import { useStore } from 'vuex';
const { getters } = useStore();
defineComponent({
	name: "SignUp-page",

	components: {
		AuthTemplate
	}
});

const formData = ref({
    firsName: {
        value: "",
        rules:
        "required",
        name: "first name",
        error: "",
    },
    lastName: {
        value: "",
        rules:
        "required",
        name: "last name",
        error: "",
    },
    email: {
        value: "",
        rules:
        "required | regex: \\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+",
        name: "Email",
        error: "",
    },
    password: {
        value: "",
        rules:
        "required | regex: ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$ | min:8",
        name: "Password",
        error: "",
    },
    confirmPassword: {
        value: "",
        name: "confirm password",
        error: "",
    },
    termsAndCondition: {
        value: "",
        name: "terms and condition",
        error: "",
        rules: "required",
    },
})
const isSpinner = ref(false)
const router = useRouter()
const signUpWithInvitation = ref(false)
const viewPassword = ref("password")
const viewConfirmPassword = ref("password")
const isInvitation = ref(false);
const route = useRoute();
const email = ref("");
const requestId = ref("");
const companyIdRoute = ref("");
const userData = ref({});
const isLoading = ref(false);
const brandSettings = computed(() => getters['brandSettingTab/brandSettings']);
const togglePasswordInput = (key) => {
    if(key === "password") {
        viewPassword.value = (viewPassword.value === "password") ? "text": "password";
    }else{
        viewConfirmPassword.value = (viewConfirmPassword.value === "password") ? "text": "password";
    }
}
const confirmationErr = ref('')

onMounted(() => {
    if(!Object.keys(route.query).length || !route.query.companyId) {
        router.replace({ name: 'Log-in' });
        $toast.success("Invalid url",{position: 'top-right'});
        return;
    } else if(route.query.companyId.split("-").length < 2) {
        $toast.success("Invalid url",{position: 'top-right'});
        router.replace({ name: 'Log-in' });
        return;
    }

    isLoading.value = true;

    companyIdRoute.value = route.query.companyId.split("-")[0];
    requestId.value = route.query.companyId.split("-")[1];


    if(companyIdRoute.value !== undefined && companyIdRoute.value.length && requestId.value !== undefined && requestId.value.length) {
        let data = {
            type: 'companies',
            data:[ {
                _id: companyIdRoute.value
            }]
        }
        const axiosData = {
            dataObj: data.data,
            dbName: 'global',
            collection: data.type,
            methodName: 'findOne'
        };
        axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result) => {
            if(result.data.status){
                if (result.data.statusText !== null) {
                    let data = {
                        type: 'company_users',
                        data:[ {
                            _id:  requestId.value
                        }]
                    }
                    const axiosData = {
                        dataObj: data.data,
                        dbName: companyIdRoute.value,
                        collection: data.type,
                        methodName: 'findOne'
                    };
                    axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result)=>{
                        if (result.data.status) {
                            userData.value = result.data.statusText;
                            if(userData.value.status === 1){
                                signUpWithInvitation.value = true;
                                isInvitation.value  = true;
                                email.value = result.data.statusText.userEmail;
                                isLoading.value = false;
                            }else{
                                isLoading.value = false;
                                $toast.error('User already registered.',{position: 'top-right'})
                                router.replace({ name: "Log-in" });
                            }
                        } else {
                            isLoading.value = false;
                            $toast.error('something went wrong.',{position: 'top-right'})
                            console.error(result.data.statusText);
                            router.replace({ name: "Log-in" });
                        }
                    }).catch((error)=>{
                        isLoading.value = false;
                        console.error(error);
                        router.replace({ name: "Log-in" });
                    })
                } else {
                    router.replace({ name: "Log-in" });
                    isLoading.value = false;
                }
            }else{
                $toast.error('something went wrong.',{position: 'top-right'})
                console.error(result.data.statusText);
                router.replace({ name: "Log-in" });
                isLoading.value = false;
            }
        }).catch((error)=>{
            console.error(error);
            router.replace({ name: "Log-in" });
            isLoading.value = false;
        })
    }else{
        isLoading.value = false;
    }
})

const handleSubmit = () =>{
    if(signUpWithInvitation.value){
        delete formData.value.email;
        if(formData.value.confirmPassword.value === ''){
            confirmationErr.value = 'The confirm password field is required'
        }else if(formData.value.password.value !== formData.value.confirmPassword.value){
            confirmationErr.value = 'The confirm password confirmation does not match'
        }
        checkAllFields(formData.value).then(async(valid)=>{
            if(valid && confirmationErr.value === ''){
                isSpinner.value = true;
                const axiosData = {
                    firstName:  formData.value.firsName.value,
                    assignCompany: companyIdRoute.value,
                    lastName: formData.value.lastName.value,
                    email: email.value,
                    password: formData.value.password.value,
                    isInvitation: true
                };
                axios.post(env.API_URI + env.CREATE_USER, axiosData).then((response) => {
                    if (response.data.status) {
                        let data = {
                            type: 'company_users',
                            data:[ 
                                {
                                    _id:  requestId.value
                                },
                                {
                                    $set: {
                                        userId: response.data.statusText._id,
                                        status: 2,
                                    }
                                },
                                { returnNewDocument: true }
                            ]
                        }
                        const axiosData = {
                            dataObj: data.data,
                            dbName: companyIdRoute.value,
                            collection: data.type,
                            methodName: 'findOneAndUpdate'
                        };
                        axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result)=>{
                            if (result.data.status) {
                                if(result.data.statusText !== null){
                                    // From Admin side user create invitation flow, add userId in company collection
                                    if(result.data.statusText.roleType === 1){
                                        let setObj = {
                                            userId: BSON.ObjectID(response.data.statusText._id),
                                            companyData: [{ users: 1 }]
                                        }
                                        let queryObj = [
                                            { _id: BSON.ObjectID(companyIdRoute.value) },
                                            { $set: setObj},
                                        ];
                                        let data = {
                                            type: dbCollections.COMPANIES,
                                            data: queryObj
                                        }
                                        const mongoData = {
                                            dataObj: data.data,
                                            dbName: 'global',
                                            collection: data.type,
                                            methodName: 'updateOne'
                                        };
                                        axios.post(env.API_URI + env.MONGO_OPRATION, mongoData).catch((error)=>{
                                            isSpinner.value = false;
                                            console.error(error);
                                        })
                                        // 
                                    }
                                }
                                const axiosData = {
                                    "companyId": companyIdRoute.value,
                                    "userId": response.data.statusText._id,
                                };
                                apiRequest("post", env.IMPORT_NOTIFICATION_SETTING, axiosData).then(()=>{
                                    isSpinner.value = false;
                                })
                                .catch((error) =>{
                                    isSpinner.value = false;
                                    console.error("ERROR in user notification settings: ", error.message);
                                    $toast.success(error.message,{position: 'top-right'});
                                })
                                let userIdObj = {
                                    companyId : companyIdRoute.value,
                                    userId : response.data.statusText._id,
                                    type: "Add"
                                }
                                apiRequest("post", env.REMOVE_USER_NOTIFICATION, userIdObj).catch((error) => {
                                    console.error(error,"ERROR");
                                })
                                localStorage.setItem('isLogging', 'false');
                                router.push({ name: "Log-in" });
                                $toast.success("User has been registered successfully.",{position: 'top-right'});
                            } else {
                                $toast.error('something went wrong.',{position: 'top-right'})
                                console.error(result.data.statusText);
                                isSpinner.value = false;
                            }
                        }).catch((error)=>{
                            isSpinner.value = false;
                            console.error(error);
                        })
                    } else {
                        isSpinner.value = false;
                        if (response.data.statusText.status == 409) {
                            $toast.error("The email address is already in use",{position: 'top-right'})
                        } else {
                            $toast.error("Something went wrong",{position: 'top-right'})
                        }
                    }
                }).catch((error)=>{
                    console.error(error);
                    isSpinner.value = false;
                    localStorage.setItem('isLogging', 'false');
                    router.push({ name: "Log-in" });
                    $toast.success(error.message,{position: 'top-right'});
                })
            }
        })
    }
}

const updateConfirmation = () => {
    if(formData.value.confirmPassword.value === ''){
        return;
    }else{
        if(formData.value.confirmPassword.value === ''){
            confirmationErr.value = 'The confirm password field is required'
        }else if(formData.value.password.value !== formData.value.confirmPassword.value){
            confirmationErr.value = 'The confirm password confirmation does not match'
        }else{
            confirmationErr.value = ''
        }
    }
}

const confirmationPassValidation = () => {
    if(formData.value.confirmPassword.value === ''){
        confirmationErr.value = 'The confirm password field is required'
    }else if(formData.value.password.value !== formData.value.confirmPassword.value){
        confirmationErr.value = 'The confirm password confirmation does not match'
    }else{
        confirmationErr.value = ''
    }
}
</script>

<style>
@import url('../Login/style.css');
</style>