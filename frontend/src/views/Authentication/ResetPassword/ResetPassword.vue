<template>
    <div v-if="isVerify === true" class="h-100dvh">
        <SpinnerComp :is-spinner="isVerify" v-if="isVerify"/>
    </div>
    <Template v-if="isVerify === false">
        <div class="ah-rightside">
            <div>
                <h3 class="title-login font-weight-bold text-capitalize dark-gray">Reset password</h3>
                <p class="GunPowder" v-if="!showResend">Please enter your new password</p>
                <p class="GunPowder" v-else>Your link is expired please click on below button to resend reset password email</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit" v-if="!showResend">
                <div class="form-group">
                    <label class="font-roboto-sans gray" for="password">Password<span class="red">*</span></label>
                    <InputText 
                        class="login-input"
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
                     />
                    <span @click="togglePasswordInput('password')" class="cursor-pointer position-ab d-flex align-items-center eye">
                        <img v-if="viewPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                        <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                    </span>
                    <div class="invalid-feedback red">{{formData.password.error}}</div>
                </div>
                <div class="form-group">
                    <label class="font-roboto-sans gray" for="password">Confirm Password<span class="red">*</span></label>
                    <InputText 
                        class="login-input"
                        v-model="formData.confirmPassword.value"
                        height="56px"
                        width="100%"
                        :max-length="150"
                        placeHolder="*****"
                        :type="viewConfirmPassword"
                        @keyup="confirmationPassValidation()"
                        id="cpassword"
                     />
                    <span @click="togglePasswordInput('cpassword')" class="cursor-pointer position-ab d-flex align-items-center eye">
                        <img v-if="viewConfirmPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                        <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                    </span>
                     <div class="invalid-feedback red">{{ confirmationErr }}</div>
                </div>
                <div class="form-group">
                    <button v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" type="submit">Reset Password</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans bg-blue white cursor-pointerfont-weight-500" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
            </form>
            <form v-if="showResend">
                <div class="form-group">
                    <button v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" type="button" @click="handleResend">Resend Email</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans bg-blue white cursor-pointerfont-weight-500" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
            </form>
            <div class="create-accountlink text-center">
                <span class="font-roboto-sans font-weight-normal font-weight-400 gray">Back to login? <router-link :to="{name:'Log-in'}" class="light-purple font-weight-500">Login</router-link></span>
            </div>
        </div>
    </Template>
</template>

<script setup>
import Template from "@/components/templates/Authentication/index.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { ref , inject , onMounted } from "vue";
import { useRoute , useRouter } from 'vue-router'
import { useValidation } from "@/composable/Validation.js";
import * as env from '@/config/env';
import {useToast} from 'vue-toast-notification';
import { App } from "realm-web";
const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
const  { checkErrors , checkAllFields } = useValidation();
const route = useRoute();
const router = useRouter();
const axios = inject("$axios");
const $toast = useToast();
const showResend = ref(true);
const formData = ref({
    password: {
        value: "",
        rules:
        "required | min:8 | max:15 | regex: ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$ ",
        name: "Password",
        error: "",
    },
    confirmPassword: {
        value: "",
        name: "confirm password",
        error: "",
    }
})
const isSpinner = ref(false);
const isVerify = ref(false);
const viewPassword = ref("password");
const viewConfirmPassword = ref("password");
const email = ref("");
const confirmationErr = ref("");

onMounted(()=>{
    isVerify.value = true;
    let data = {
        type: 'users',
        data:[ {
            _id:  route.params.id
        }]
    }
    const axiosData = {
        dataObj: data.data,
        dbName: 'global',
        collection: data.type,
        methodName: 'findOne'
    };
    axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result)=>{
        if(result.data.status){
            if (result.data.statusText !== null) {
                let userData = result.data.statusText;
                email.value = userData.Employee_Email;

                const tokenTime = new Date(userData.forgotPasswordTokenTime);
                const ValidTime = new Date(tokenTime.setMinutes(tokenTime.getMinutes() + 10));
                if (!((userData.forgotPasswordToken == route.params.token) && (ValidTime.getTime() > new Date().getTime()))) {
                    showResend.value = true;
                    isVerify.value = false;
                } else {
                    showResend.value = false;
                    isVerify.value = false;
                }
            } else {
                $toast.error('something went wrong.',{position: 'top-right'})
                isVerify.value = false;
            }
        }else{
            $toast.error('something went wrong.',{position: 'top-right'})
            isVerify.value = false;
        }
    }).catch(()=>{
        isVerify.value = false;
    })
})

const handleSubmit = () => {
    if(formData.value.confirmPassword.value === ''){
        confirmationErr.value = 'The confirm password field is required'
    }else if(formData.value.password.value !== formData.value.confirmPassword.value){
        confirmationErr.value = 'The confirm password confirmation does not match'
    }
    checkAllFields(formData.value).then(async (valid)=>{
        if(valid && confirmationErr.value === ''){
            isSpinner.value = true;
            try {
                await app.emailPasswordAuth.resetPassword({
                    password: formData.value.password.value,
                    token: route.params.realmToken,
                    tokenId: route.params.realmTokenId,
                });
                let data = {
                    type: 'users',
                    data:[ {
                        _id:  route.params.id
                    },
                    {
                        $set: {
                            forgotPasswordToken: ""
                        }
                    }]
                }
                const axiosData = {
                    dataObj: data.data,
                    dbName: 'global',
                    collection: data.type,
                    methodName: 'updateOne'
                };
                axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async ()=>{
                    isSpinner.value = false;
                    $toast.success("Password reset has been successfully",{position: 'top-right'});
                    router.replace({ name: 'Log-in' });
                }).catch((error)=>{
                    console.error(error);
                    isSpinner.value = false;
                })
            } catch (error) {
                isSpinner.value = false;
                $toast.error('something went wrong',{position: 'top-right'});
            }
        }
    })
}

const handleResend = async () => {
    isSpinner.value = true;
    try {
        await app.emailPasswordAuth.callResetPasswordFunction(
            { email : email.value , password: '11111111' },
        );
        isSpinner.value = false;
        $toast.success("Password reset email has been sent successfully",{position: 'top-right'})
        router.push({name:'Log-in'})
    } catch (error) {
        isSpinner.value = false;
        $toast.error('Something went wrong.',{position: 'top-right'})
    }

}

const togglePasswordInput = (key) => {
    if(key === "password"){
        viewPassword.value = (viewPassword.value === "password") ? "text" : "password";
    }else{
        viewConfirmPassword.value = (viewConfirmPassword.value === "password") ? "text" : "password";
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