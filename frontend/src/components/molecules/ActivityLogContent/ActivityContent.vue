<template>
    <div class="d-flex align-items-center">
        <UserProfile :data="data.userData" :show-dot="false" :width="'30px'" :thumbnail="'30x30'" />
        <div class="ml-015 wrapperNameImage">
            <span v-html="data.Message"></span>
            <span>&nbsp;{{getDateAndTime(data.createdAt == undefined ? new Date().getTime(): new Date(data?.createdAt).getTime())}}</span>
        </div>
    </div>
</template>
<script setup>
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
import { defineComponent,defineProps } from "vue";
import { useProjects } from '@/composable/projects';
const {getDateAndTime} = useProjects();

defineComponent({
    name: "ActivityContent",
    components: {
        UserProfile
    },
})
defineProps({
    data: Object,
});
</script>
<style src="./style.css"></style>