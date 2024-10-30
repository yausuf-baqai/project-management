<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display project alian defaul app detail for blank project form as step-7 in create project module.
========================================================================================== -->
<template>
<div id="project-step-container" class="ProjectShareGraphicModel addProjectEnabale borderChange mobile-project-taskstatus-section">
    <div class="modalHeader bg-light-gray text-center p-1" :class="{'border-radius-5-px': clientWidth > 767 , 'border-radius-8-px': clientWidth <= 767}">
        <h3 class="m-0" :class="{'task-heading-desktop': clientWidth > 767 , 'task-heading-mobile': clientWidth <= 767}">Enable Apps</h3>
    </div>
    <div class="checkBox_Text">
        <div class="d-flex align-items-center justify-content-center">
            <Toggle
                class="mr-10px"
                :modelValue="allSelected"
                activeColor="#3845B3"
                @click="(e) =>{checkOnOff(e)}"
                width="30"
            />
            <p class="turnOff">Turn {{theModel && theModel.length>0 && theModel.filter((x) => x.appStatus).length === theModel.length ? 'off' : 'on'}} all Apps</p>
        </div>
        <div class="d-flex align-items-center justify-content-between enable-app-data style-scroll flex-wrap">
            <label class="cat action" :class="{'border-radius-7-px enable-cataction-desktop': clientWidth > 767 , 'border-radius-8-px enable-cataction-mobile': clientWidth <= 767}" v-for="(appData,key) in theModel" v-bind:key="key"  :style="[{'border': appData.appStatus ? '1.5px solid #3845B3' :'' }]">
                <input type="checkbox" value="Priority" v-model.trim="appData.appStatus" :checked="appData.appStatus" />
                <div class="Image_other d-flex align-items-center justify-content-between" @click="manageApps(appData)">
                    <div class="d-flex align-items-center">
                        <img v-if="!appData.appStatus" alt="information" :src="getImageUrl(appData)">
                        <img v-if="appData.appStatus" alt="information" :src="getImageUrl(appData)">
                        <h4 class="changesFont ml-15px" :class="{'enableapp-list-desktop': clientWidth > 767 , 'enableapp-list-mobile': clientWidth <= 767}" :style="[{'color': appData.appStatus ? '#3845B3 !important' :'' }]" >{{appData.name}}</h4> 
                    </div>
                    <div class="apps-tooltip-container">
                        <img :src="information" alt="information" class="info-desktop tooltip-trigger">
                        <img :src="information_svg" alt="information" class="info-mobile d-none tooltip-trigger">
                        <span class="apps-tooltip-text" v-html="getTooptipText(appData.key)"></span>
                    </div>
                </div>
            </label>
        </div>
    </div>
</div>
</template>
<script setup>
import { ref, onMounted, inject, computed, watch } from "vue";
import { dbCollections } from "@/utils/FirebaseCollections";
import Toggle from "@/components/atom/Toggle/Toggle.vue";
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
    const props = defineProps({
        modelValue : {
            type : Object,
            default : (()=>{})
        }
    })
    const theModel = ref(props.modelValue);
    const clientWidth = inject("$clientWidth");
    const information = require("@/assets/images/information.png");
    const information_svg = require("@/assets/images/svg/information_svg.svg");
    const multipleAssigneBlue = require("@/assets/images/svg/mutipleblue.svg");
    const multipleAssigneGray = require("@/assets/images/svg/mutiplegrey.svg");
    const timeBlue = require("@/assets/images/svg/timeBlue.svg");
    const timeGray = require("@/assets/images/svg/timegrey.svg");
    const priorityBlue = require("@/assets/images/svg/priorityBlue.svg");
    const priorityGray = require("@/assets/images/svg/priorityGray.svg");
    const timetrackingBlue = require("@/assets/images/svg/timevalueblue.svg");
    const timetrackingGray = require("@/assets/images/svg/timetrackinggray.svg");
    const milestoneBlue = require("@/assets/images/svg/checkflagblue.svg");
    const milestoneGray = require("@/assets/images/svg/checkflaggrey.svg");
    const tagsBlue = require("@/assets/images/svg/tagsblue.svg");
    const tagsGray = require("@/assets/images/svg/tagsgrey.svg");
    const editBlue = require("@/assets/images/svg/editblue.svg");
    const editGray = require("@/assets/images/svg/editgray.svg");
    const aiGray = require("@/assets/images/svg/AI_inactive_gray.svg");
    const aiBlue = require("@/assets/images/svg/AI_active_blue.svg");
    onMounted(() => {
        if(theModel.value.length <= 0 || theModel.value.length == undefined){
            getAllApps();
        }
    })
    watch(()=> props.modelValue ,(val)=>{
        theModel.value = val;
    })
    const emit = defineEmits([
        'update:modelValue'
    ]);
    const allSelected = computed(() => {
        return theModel.value && theModel.value.length>0 && theModel.value.filter((x) => x.appStatus).length === theModel.value.length});

    function getAllApps(){
        let getQuery = {
            type : "find",
            collection : dbCollections.APPS,
            data: []
        }
        mongodbCrudOperations(getQuery)
        .then((querySnapshot) => {
            let data = querySnapshot
            const arr = ["IncompleteWarning"];
            const temp = data.filter((item) => {
                if(!arr.includes(item.key)) {
                    return item;
                }
            });
            temp.sort((a, b) => a.sortIndex - b.sortIndex);
            theModel.value = temp;
            emit('update:modelValue', theModel.value);
        })
        .catch((error) => {
            console.error(error,"EROOR")
        })
    }
    function manageApps(){
        emit('update:modelValue', theModel.value);
    }
    function checkOnOff(e){
        if(!e){
            theModel.value = theModel.value.map((x) => ({...x, appStatus: true}))
        }else{
            theModel.value = theModel.value.map((x) => ({...x, appStatus: false}))
        }
        emit('update:modelValue', theModel.value);
    }

    function getImageUrl (item) {
        if(item.name === 'Multiple Assignees' && item.appStatus === false){
            return multipleAssigneGray;
        }
        if(item.name === 'Multiple Assignees' && item.appStatus === true){
            return multipleAssigneBlue;
        }
        if(item.name === 'Time Estimate' && item.appStatus === true){
            return timeBlue;
        }
        if(item.name === 'Time Estimate' && item.appStatus === false){
            return timeGray;
        }
        if(item.name === 'Priority' && item.appStatus === true){
            return priorityBlue;
        }
        if(item.name === 'Priority' && item.appStatus === false){
            return priorityGray;
        }
        if(item.name === 'Time Tracking' && item.appStatus === true){
            return timetrackingBlue;
        }
        if(item.name === 'Time Tracking' && item.appStatus === false){
            return timetrackingGray;
        }
        if(item.name === 'Milestones' && item.appStatus === true){
            return milestoneBlue;
        }
        if(item.name === 'Milestones' && item.appStatus === false){
            return milestoneGray;
        }
        if(item.name === 'Tags' && item.appStatus === true){
            return tagsBlue;
        }
        if(item.name === 'Tags' && item.appStatus === false){
            return tagsGray;
        }
        if(item.name === 'Custom Fields'){
            if(item.appStatus === false) {
                return editGray;
            } else {
                return editBlue;
            }
        }
        if(item.name === 'AI'){
            if(item.appStatus === false) {
                return aiGray;
            } else {
                return aiBlue;
            }
        }
    }

    function getTooptipText(key) {
        switch (key) {
            case "Priority":
                return `By enabling this app you will be able to manage <b>Priority</b> in <b>Tasks</b> for this <b>project</b>`;
            case "MultipleAssignees":
                return `By enabling this app you will be able to manage <b>Multiple Assignee</b> in <b>Tasks</b> for this <b>project</b>`;
            case "TimeEstimates":
                return `By enabling this app you will be able to manage <b>Time Estimates</b> in <b>Tasks</b> for this <b>project</b>`;
            case "Milestones":
                return `By enabling this app you will be able to use <b>Milestones</b> for this <b>project</b>`;
            case "tags":
                return `By enabling this app you will be able to manage <b>Tags</b> in <b>Tasks</b> for this <b>project</b>`;
            case "CustomFields":
                return `By enabling this app you will be able to manage <b>Custom Fields</b> for this <b>project</b>`;
            case "TimeTracking":
                return `By enabling this app you will be able to manage <b>Time log</b> in <b>Tasks</b> for this <b>project</b>`;
            case "AI":
                return `By enabling this app you will be able to use <b>AI operations</b> for this <b>project</b>`;
            default:
                break;
        }
    }
</script>
<style scoped>
@import './style.css';

.apps-tooltip-container {
    position: relative;
    display: inline-block;
}

.apps-tooltip-text {
    visibility: hidden;
    width: 150px;
    background-color: #FFF;
    color: #000;
    font-size: 13px;
    text-align: center;
    border-radius: 5px;
    padding: 10px 10px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 10%;
    margin-left: -100px;
    opacity: 0;
    transition: opacity 0.3s;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.apps-tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 70%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #FFF transparent transparent transparent;
}

.apps-tooltip-container:hover .apps-tooltip-text {
    visibility: visible;
    opacity: 1;
}

.tooltip-trigger {
    cursor: pointer;
}

</style>

