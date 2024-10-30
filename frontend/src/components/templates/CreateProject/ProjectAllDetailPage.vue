<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display all project selected detail for blank project form as step-9 in create project module.
========================================================================================== -->
<template>
<div id="project-step-container" class="ProjectShareGraphicModel addProjectEnabale borderChange mobile-project-taskstatus-section project-detail-setup">
    <div class="modalHeader bg-light-gray mb-28px"
    :style="[{padding : clientWidth > 767 ? '16.5px' : '18.5px'}]"
    :class="{'border-radius-5-px': clientWidth > 767 , 'border-radius-8-px': clientWidth <= 767}"
    >
        <h3 :class="{'task-heading-desktop': clientWidth > 767 , 'task-heading-mobile': clientWidth <= 767}">Details of the Project set up</h3>
    </div>
    <div class="Allgood">
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Project Name</h5>
            <h6>{{theModel.projectName.value}}</h6>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Avatar</h5>
            <img v-if="theModel.projectProfileField.previewImage.value !== ''" :src="theModel.projectProfileField.previewImage.value" alt="" class="project__profilepreview-img" >
            <h6 v-else :style="[{'background-color':theModel.projectProfileField.selectedColor.value ? theModel.projectProfileField.selectedColor.value : '#199EC7'}]"  class="avatar__inital-box text-center white border-radius-3-px">{{theModel && theModel.projectName.value && theModel.projectName.value.length ? theModel.projectName.value.charAt(0).toUpperCase() : "H"}}</h6>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Shared with</h5>
            <div class="d-flex align-items-center" v-if="theModel.workSpaceField.privateSpaceValue.value">
                <h6>Users</h6>
                <ul class="userImage d-flex">
                    <li>
                        <Assignee
                            :users="theModel.workSpaceField.privateSpaceUsers.value.map((x)=>x.id)"
                            :num-of-users="3"
                            imageWidth="30px"
                            :addUser="false"
                        />
                    </li>
                </ul>
            </div>
            <div class="d-flex align-items-center font-size-13 GunPowder" v-else>
                No Users Selected
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Project Status</h5>
            <ul class="d-flex align-items-center">
                <li class="setImagevalue" v-for="(status,index) in [...theModel.projectStatusForm.projectStatusField.value.projectActiveStatus, ...theModel.projectStatusForm.projectStatusField.value.projectDoneStatus, {...theModel.projectStatusForm.projectStatusField.value.projectCompletedStatus}]" :key="index">
                    <span :title="status.name" class="default-status-squer project__status-icon d-inline-block border-radius-2-px" :style="[{'background-color': status.textColor,'cursor': 'pointer'}]"></span>
                </li>
            </ul>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Task Type</h5>
            <ul class="d-flex align-items-center" v-if="theModel.taskTypeForm.taskTypeField && Object.keys(theModel.taskTypeForm.taskTypeField.value).length">
                <li class="setImagevalue cursor-pointer" v-for="(taskType,index) in theModel.taskTypeForm.taskTypeField.value.taskTypes" :key="index">
                    <img class="task-type-image-block" v-if="taskType.taskImage.includes('http')" :src="taskType.taskImage" alt="task_type">
                    <WasabiImage
                        v-else
                        class="task-type-image-block"
                        :data="{url: taskType.taskImage}"
                    />
                </li>
            </ul>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Task Status</h5>
            <ul class="d-flex align-items-center" v-if="theModel.taskStatusForm.taskStatusField && Object.keys(theModel.taskStatusForm.taskStatusField.value).length">
                <li class="setImagevalue" v-for="(status,index) in [theModel.taskStatusForm.taskStatusField.value.defaultActive, ...theModel.taskStatusForm.taskStatusField.value.ActiveStatusList, ...theModel.taskStatusForm.taskStatusField.value.DoneStatusList, theModel.taskStatusForm.taskStatusField.value.defaultComplete]" :key="index">
                    <span :title="status.name" class="default-status-squer task__status-icon d-inline-block border-radius-2-px" :style="[{'background-color': status.textColor,'cursor': 'pointer'}]"></span>
                </li>
            </ul>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject allgoodprojectvalue">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Apps</h5>
            <ul class="d-flex align-items-center" v-if="!alianAppsFlag">
                <template v-for="(appData,ids) in theModel.alianAppsObj">
                    <li class="setImagevalue" v-bind:key="ids" v-if="appData.appStatus">
                        <span :title="appData.name">
                            <img v-if="appData.afterIcon" :src="getImageUrl(appData)" style="height: auto;"/>
                        </span>
                    </li>
                </template>
            </ul>
            <span class="font-size-13 GunPowder" v-if="alianAppsFlag">No Apps Selected</span>
        </div>
        <div class="d-flex justify-content-between align-items-center allgoodproject">
            <h5 :class="{'font-size-13 font-weight-500': clientWidth > 767 , 'font-size-16 font-weight-400': clientWidth <= 767}">Default Settings for Views</h5>
            <ul class="d-flex align-items-center">
                <template v-for="(displayView,ids) in theModel.requiredViewobj.value">
                    <li class="setImagevalue" :key="ids" v-if="displayView.viewStatus">
                        <span :title="displayView.name">
                            <img :src="!displayView.viewStatus ? projectComponentsIcons(displayView.keyName).icon : projectComponentsIcons(displayView.keyName).activeIcon" :alt="displayView.name">
                        </span>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</div>
</template>
<script setup>
import { ref , inject, onMounted} from "vue";
import Assignee from '@/components/molecules/Assignee/Assignee.vue';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import { projectComponentsIcons } from '@/composable/commonFunction';

const multipleAssigneBlue = require("@/assets/images/png/mutipleblue.png");
const timeBlue = require("@/assets/images/timeBlue.png");
const priorityBlue = require("@/assets/images/priorityblue.png");
const timetrackingBlue = require("@/assets/images/timevalueblue.png");
const milestoneBlue = require("@/assets/images/checkflagblue.png");
const tagsBlue = require("@/assets/images/tagsblue.png");
const editBlue = require("@/assets/images/editblue.png");
const aiBlue = require("@/assets/images/AI_active_blue.png");

    const props = defineProps({
        modelValue : {
            type : Object,
            default : (()=>{})
        }
    })
    const theModel = ref(props.modelValue);
    const clientWidth = inject("$clientWidth");
    const alianAppsFlag = ref(true);
    alianAppsFlag.value = alianAppsFlag.value = theModel.value.alianAppsObj.every((x) => x.appStatus === false);
    const hanldeProjectLastStep = inject("hanldeProjectLastStep");
    onMounted(()=>{
        if(hanldeProjectLastStep && hanldeProjectLastStep.value !== null) {
            hanldeProjectLastStep.value();
        }
    })

    function getImageUrl (item) {
        if(item.name === 'Multiple Assignees'){
            return multipleAssigneBlue;
        }
        if(item.name === 'Time Estimate'){
            return timeBlue;
        }
        if(item.name === 'Priority'){
            return priorityBlue;
        }
        if(item.name === 'Time Tracking'){
            return timetrackingBlue;
        }
        if(item.name === 'Milestones'){
            return milestoneBlue;
        }
        if(item.name === 'Tags'){
            return tagsBlue;
        }
        if(item.name === 'Custom Fields'){
            return editBlue;
        }
        if(item.name === 'AI'){
            return aiBlue;
        }
    }
</script>
<style scoped>
@import './style.css';
</style>