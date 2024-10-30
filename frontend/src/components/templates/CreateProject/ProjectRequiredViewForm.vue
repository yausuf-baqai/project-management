<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display project required views default detail for blank project form as step-8 in create project module.
========================================================================================== -->
<template>
 <div id="project-step-container" class="ProjectShareGraphicModel addProjectEnabale borderChange mobile-project-taskstatus-section">
    <div class="modalHeader bg-light-gray text-center"
    :style="[{padding : clientWidth > 767 ? '16.5px' : '18.5px'}]"
    :class="{'border-radius-5-px': clientWidth > 767 , 'border-radius-8-px': clientWidth <= 767}"
    >
        <h3 class="m-0"  :class="{'task-heading-desktop': clientWidth > 767 , 'task-heading-mobile': clientWidth <= 767}">Required views</h3>
    </div>
    <p class="navigating"  :class="{'p-navigating-desktop': clientWidth > 767 , 'p-navigating-mobile': clientWidth <= 767}">Set the view(s) you require. These views will be automatically when you are navigating to Projects, Folders, and Lists in {{brandSettings && brandSettings?.productName ? brandSettings.productName : 'Alian Hub'}} instead of manually creating them. Once created, views cannot be deleted.
    </p>
    <div  class="align-items-center justify-content-space-between mobile-reuired-views">
        <!-- start required design   -->
        <div class="requiredviewListWrapper style-scroll d-flex flex-wrap justify-content-between">
            <div v-for="(viewList, index) in requiredViewobj.value" :key="index" :class="{'outline-required': !viewList.viewStatus, 'outline-primary': viewList.viewStatus}" class="position-re requiredListItem d-flex align-items-center justify-content-between mb-20px">
                <div class="position-ab bg-blue white border-top-radius-5-px text-center font-size-12 always__text-div"  v-if="viewList.keyName === 'ProjectListView'">
                    Always Required
                </div>
                <div class="Icon_text d-flex align-items-center">
                    <img :src="!viewList.viewStatus ? projectComponentsIcons(viewList.keyName).icon : projectComponentsIcons(viewList.keyName).activeIcon" :alt="viewList.name">
                    <!-- <h4 style="margin: 0px 0px 0px 5px;" class="changesFont margin-left-value">{{viewList.name}}</h4> -->
                    <span class="changesFont margin-left-value ml-5px" :class="{'enableapp-list-desktop': clientWidth > 767 , 'enableapp-list-mobile': clientWidth <= 767,'blue':viewList.viewStatus}">{{viewList.name}}</span>
                </div>
                <div class="text-toggle d-flex align-items-center">
                    <span class="blue font-size-10" v-if="viewList.setAsDefault === true">
                        <img :src="homeSetting" alt="home" class="default_home_settingsImg"/>
                        Default View
                    </span>
                    <DropDown v-if="!viewList.setAsDefault">
                        <template #button>
                            <img :src="horizontalDots" alt="horizontalDots" class="makeAsDefaultDot mr-15px vertical-middle"/>
                            <img v-if="!viewList.setAsDefault" :src="horizontalDotsBlue" alt="horizontalDots" class="makeAsDefaultDotBlue mr-15px vertical-middle"/>
                        </template>
                        <template #options>
                            <DropDownOption @click="updateRequiredViews(viewList, true),getView(viewList)">
                                Make Default
                            </DropDownOption>
                        </template>
                    </DropDown>
                    <Toggle v-model="viewList.viewStatus" @change="getView(viewList)" :active-color="viewList.setAsDefault === true ? '#8591F9' : '#3845B3'" :disabled="viewList.setAsDefault || viewList.keyName === 'ProjectListView'" class="ml-5px" />
                </div>
            </div>
        </div>
        <!-- start required design end -->
    </div>
</div>
</template>
<script setup>
import { ref, onMounted, inject, computed } from "vue";
import { dbCollections } from "@/utils/FirebaseCollections";
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
import Toggle from "@/components/atom/Toggle/Toggle.vue"
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { projectComponentsIcons } from '@/composable/commonFunction';
import { useStore } from 'vuex';
const { getters } = useStore();

    const props = defineProps({
        modelValue : {
            type : Object,
            default : (()=>{})
        }
    })
    const requiredViewobj = ref(props.modelValue);
    const clientWidth = inject("$clientWidth");
    const horizontalDotsBlue = require("@/assets/images/svg/blueThreeDot.svg");
    const horizontalDots = require("@/assets/images/svg/horizontalSvg.svg");
    const homeSetting = require("@/assets/images/svg/homeSetting.svg");
    const mainArray =  ref([]);
    const selectedRequiredObj= ref([]);
    const brandSettings = computed(() => getters['brandSettingTab/brandSettings']);
    onMounted(() => {
        if(requiredViewobj.value.value.length <= 0){
            getAllViews();
        }else{
            mainArray.value = requiredViewobj.value.value;
        }
    })
    const emit = defineEmits([
        'update:modelValue'
    ]);
    function getAllViews(){
        let getQuery = {
            type : "find",
            collection : dbCollections.PROJECT_TAB_COMPONENTS,
            data: []
        }
        mongodbCrudOperations(getQuery)
        .then((querySnapshot) => {
            let data = querySnapshot
            const arr = ["gantt", "timeline","embed"];
            let temp = data.filter((item) => {
                if(!arr.includes(item.value)) {
                    return item;
                }
            });
            temp.sort((a, b) => a.sortIndex - b.sortIndex);
            temp = temp.map((item)=>{
                delete item.createdAt
                delete item.updatedAt
                return item
            })
            mainArray.value = temp;
            requiredViewobj.value.value = temp;
        })
        .catch((error) => {
            console.error(error,"EROOR")
        })
    }
    function updateRequiredViews(viewList, updateDefault=false) {
        mainArray.value = mainArray.value.map((x) => {
            if(x.value === viewList.value) {
                if(updateDefault) {
                    x.setAsDefault = true;
                    x.viewStatus = true;
                } else {
                    if(!x.setAsDefault) {
                        x.viewStatus = !x.viewStatus;
                    } else {
                        x.setAsDefault = false;
                        x.viewStatus = false;
                        requiredViewobj.value.value.filter((x) => x.name === "List")[0].setAsDefault = true;
                        mainArray.value.filter((x) => x.name === "List")[0].setAsDefault = true;
                    }
                }
            } else {
                if(updateDefault) {
                    x.setAsDefault = false;
                }
            }

            return x;
        })
        selectedRequiredObj.value = requiredViewobj.value;
        emit('update:modelValue', requiredViewobj.value)
    }
    function getView(viewList){
        if(viewList.viewStatus === true && viewList.keyName !== 'ProjectListView'){
            if(requiredViewobj.value.value.findIndex((x) => x._id === viewList._id) === -1) {
                requiredViewobj.value.value.push(viewList)
            }
        }
        let fIndex = requiredViewobj.value.value.findIndex((dataas)=>{
            return dataas.viewStatus === false && dataas.keyName === viewList.keyName
        })
        if(fIndex > 0){
            requiredViewobj.value.value[fIndex].viewStatus = viewList.viewStatus;
        }
        emit('update:modelValue', requiredViewobj.value)
    }
</script>
<style scoped>
@import './style.css';
</style>
