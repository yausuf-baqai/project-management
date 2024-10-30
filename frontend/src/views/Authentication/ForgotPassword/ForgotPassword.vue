<template>
    <Template>
        <div class="ah-rightside">
            <div class="sinup-login-title-wrapper">
                <h3 class="title-login font-weight-bold dark-gray text-capitalize mb-1">Forgot password</h3>
                <p class="GunPowder">Enter the email associated with your account and we’ll send an email with instructions to reset your password.</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label class="font-roboto-sans gray" for="email">Email ID<span class="red">*</span></label>
                    <InputText
                        class="login-input"
                        v-model="formData.email.value"
                        placeHolder="mail@abc.com"
                        height="56px"
                        width="100%"
                        @keyup="checkErrors({'field':formData.email,
                        'name':formData.email.name,
                        'validations':formData.email.rules,
                        'type':formData.email.type,
                        'event':$event.event})"
                        :max-length="254"
                    />
                    <div class="invalid-feedback red">{{formData.email.error}}</div>
                </div>
                <div class="form-group">
                    <button v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" type="submit">Forgot Password</button>
                    <button v-else type="button" class="btn btn-blue btn-login font-roboto-sans btn-disabled opacity-7 white bg-blue font-weight-500" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
            </form>
            <div class="create-accountlink text-center">
                <span class="font-roboto-sans font-weight-normal font-weight-400 gray">Remember password? <router-link :to="{name:'Log-in'}" class="light-purple font-weight-500">Login</router-link></span>
            </div>
        </div>
    </Template>
</template>


<script setup>
import Template from "@/components/templates/Authentication/index.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { App } from "realm-web";
const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
import { useValidation } from "@/composable/Validation.js";
import { ref } from 'vue';
import {useToast} from 'vue-toast-notification';
import { useRouter } from 'vue-router'
const  { checkErrors , checkAllFields } = useValidation();
import axios from 'axios'
import * as env from '@/config/env';

const $toast = useToast();
const router = useRouter();

const formData = ref({
    email: {
        value: "",
        rules:
        "required | regex: \\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+",
        name: "Email",
        error: "",
    },
})
const isSpinner = ref(false);

const handleSubmit = () =>{
    checkAllFields(formData.value).then(async (valid)=>{
        if(valid){
            isSpinner.value = true;
            let data = {
                type: 'users',
                data:[ {
                    Employee_Email:  formData.value.email.value
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
                        try {
                            await app.emailPasswordAuth.callResetPasswordFunction(
                                { email : formData.value.email.value , password: '11111111' },
                            );
                                isSpinner.value = false;
                                $toast.success("Password reset email has been sent successfully",{position: 'top-right'})
                                router.push({name:'Log-in'})
                        } catch (error) {
                            console.error(error.message);
                            isSpinner.value = false;
                            if (error.message.includes('user not found')) {
                                $toast.error('No account found for given email.',{position: 'top-right'})
                            }
                        }
                    } else {
                        $toast.error('No account found for given email.',{position: 'top-right'})
                        isSpinner.value = false;
                    }
                }else{
                    $toast.error('something went wrong.',{position: 'top-right'})
                    isSpinner.value = false;
                }
            }).catch(()=>{
                isSpinner.value = false;
            })
        }
    })
}
</script>

<style src="../Login/style.css">
</style>