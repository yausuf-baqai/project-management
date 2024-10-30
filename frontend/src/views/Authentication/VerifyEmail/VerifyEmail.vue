<template>
    <div v-if="isVerify === true" class="h-100dvh">
        <SpinnerComp :is-spinner="isVerify" v-if="isVerify"/>
    </div>
    <Template v-if="isVerify === false">
        <div class="ah-rightside">
            <div>
                <h3 class="title-login dark-gray">Resend Email</h3>
                <p class="GunPowder">Please click on button to resend verification email</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <button  v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white font-weight-500 cursor-pointer" type="submit">Resend Email</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled opacity-7 white bg-blue font-weight-500 font-roboto-sans" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
            </form>
            <div class="create-accountlink text-center">
                <span class="font-roboto-sans font-weight-normal font-weight-400 gray">Back to Login? <router-link class="light-purple font-weight-500" :to="{name:'Log-in'}">Login</router-link></span>
            </div>
        </div>
    </Template>
</template>

<script setup>
import Template from "@/components/templates/Authentication/index.vue";
import { ref, onMounted , inject } from 'vue';
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import * as env from '@/config/env';
import { useRoute , useRouter  } from 'vue-router'
import {useToast} from 'vue-toast-notification';
const axios = inject("$axios");
const route = useRoute()
const router = useRouter()
const $toast = useToast();

const email = ref('');
const isSpinner = ref(false);
const isVerify = ref(false);

    onMounted(() => {
        isVerify.value = true;
        const axiosData = {
            "uid": route.params.id,
            "token": route.params.token
        }
        axios.post(env.API_URI + env.VERIFY_EMAIL, axiosData).then((result) => {

            if(result.data.showResendVerification) {
                $toast.error(result.data.statusText,{position: 'top-right'});
                email.value = result.data.email;
                isVerify.value = false;
            } else if(!result.data.status && result.data.alreadyVarified) {
                $toast.error(result.data.statusText,{position: 'top-right'});
                router.push({name:'Log-in'});
                isVerify.value = false;
            } else if(!result.data.status) {
                $toast.error(result.data.statusText,{position: 'top-right'});
                isVerify.value = false;
            } else {
                $toast.success("Your email has been verify successfully",{position: 'top-right'});
                router.push({name:'Log-in'});
                isVerify.value = false;
            }
        }).catch((error) => {
            isVerify.value = false;
            console.error(error,"Error");
        })
    })

    const handleSubmit = () => {
        const axiosData = {
            "uid": route.params.id,
            "email": email.value
        };
        isSpinner.value = true;
        axios.post(env.API_URI + env.SEND_VARIFICATION_EMAIL, axiosData).then((result) => {
            if(result.data.status === true) {
                $toast.success("Verification mail has been send successfully",{position: 'top-right'});
                router.push({name:'Log-in'})
            } else {
                isSpinner.value = false;
                $toast.success(result.data.statusText,{position: 'top-right'});
            }
        }).catch((error) => {
            isSpinner.value = false;
            console.error(error,"Error");
        })
    }
    
</script>

<style src="./style.css">
</style>