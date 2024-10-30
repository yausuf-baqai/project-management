<template>
    <div v-if="isVerify === true" class="h-100dvh">
        <SpinnerComp :is-spinner="isVerify" v-if="isVerify"/>
    </div>
    <AuthTemplate>
        <div class="create-accountlink">
            <span class="mb-20px d-block font-size-26">This link is <b>exipred</b></span>
            <span class="font-roboto-sans font-weight-normal font-weight-400 gray">Back to Login? <router-link class="light-purple font-weight-500" :to="{name:'Log-in'}">Login</router-link></span>
        </div>
    </AuthTemplate>
</template>

<script setup>
import { onMounted, inject, ref } from "vue";
import AuthTemplate from "@/components/templates/Authentication/index.vue";
import {useToast} from 'vue-toast-notification';
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { useRouter, useRoute } from 'vue-router'
import * as env from '@/config/env';
import { apiRequest } from '../../../services'

const axios = inject("$axios");
const route = useRoute();
const router = useRouter()
const $toast = useToast();
const isVerify = ref(false);
const userId = inject('$userId')

onMounted(() => {
    isVerify.value = true;
    const axiosData = {
        id: route.query.id,
    };
    let valid = true;

    Object.keys(axiosData).forEach(function(key) {
        if(axiosData[key] === undefined || axiosData[key] === "") {
            valid = false;
        }
    })

    if(!valid) {
        $toast.error("Invalid URL",{position: 'top-right'});
        isVerify.value = false;
        router.replace({ name: "Log-in" });
        return;
    }
    axios.post(env.API_URI + env.INVITATION_CONFIRMATION, axiosData).then((result) => {
        if(result.data.key === 5) {
            const axiosData = {
                "companyId": result.data.companyId,
                "userId": result.data.userId,
            };
            apiRequest("post", env.IMPORT_NOTIFICATION_SETTING, axiosData).then(()=>{
                isVerify.value = false;
                localStorage.setItem('selectedCompany',result.data.companyId);
            })
            .catch((error) =>{
                console.error("ERROR in import settings: ", error.message);
                $toast.error(error.message,{position: 'top-right'});
            })

            $toast.success("Invitation accepted successfully",{position: 'top-right'});

            router.replace({ name: "Log-in" }).then(() => {
                if(userId.value !== ''){
                    window.location.reload();
                }
            });
        } else {
            isVerify.value = false;
            $toast.error(result.data.statusText,{position: 'top-right'});
        }
    }).catch((error) =>{
        console.error("ERROR in validate invitation: ", error);
    });
});
</script>

<style>
@import url('../Login/style.css');
</style>