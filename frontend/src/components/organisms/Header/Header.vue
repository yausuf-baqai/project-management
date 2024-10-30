<template>
    <div class="d-flex align-items-center justify-content-between px-1 bg-blue white header__wrapper border-bottom-lightgray">
        <div class="d-flex align-items-center">
            <img :src="toggle" alt="options" class="pr-1 cursor-pointer" v-if="clientWidth <= 990" @click="visible = !visible">
            <router-link to="/" class="d-flex align-items-center">
                <img :src="headerLogo" class="cursor-pointer" />
                <img class="cursor-pointer m0px-20px" v-if="clientWidth > 990" src="@/assets/images/svg/header_dashboard.svg" alt="">
            </router-link>

            <NavLinks v-if="clientWidth > 990 && rules && Object.keys(rules).length" :menu="menu" />
        </div>
        <small v-if="clientWidth > 1199" title="Open Advance Filter" class="project-list-title-small cursor-pointer d-flex justify-content-between align-items-centers text-nowrap" @click="dispatchEventForFilet">
            <template v-if="clientWidth >= 1150">
                <small class="project-list-title-small-text">Search</small>
                <small>(Ctrl + K)</small>
            </template>
            <template v-else>
                <small class="project-list-title-small-text">Search</small>
                <small>(Ctrl + K)</small>
            </template>
        </small>
        <div class="d-flex align-items-center justify-content-between z-index-5" v-if="clientWidth > 990">
            <!-- Upgrade Button -->
            
            <!-- COMPANY SELECTION -->
            <div class="d-flex" id="company_dropdown_driver">
            <span v-if="rules && Object.keys(rules).length" class="company-text">Company</span>
            <template v-if="rules && Object.keys(rules).length">
                <DropDown id="company_selection" v-if="filteredCompanies.length">
                    <template #button>
                        <div class="cursor-pointer text-capitalize dropdown_wrapper pr-22px" :class="{'mr-2' : clientWidth > 1440, 'mr-1' : clientWidth<=1440}">
                            {{selectedCompany && selectedCompany.Cst_CompanyName ? selectedCompany.Cst_CompanyName : "N/A"}}
                        </div>
                    </template>
                    <template #options>
                        <DropDownOption @click="$emit('change', company._id)" v-for="(company, index) in filteredCompanies" :key="index" :item="{image: company.Cst_profileImage || defaultUserIcon, label: company.Cst_CompanyName}">
                            <div class="d-flex align-items-center" :class="[{'opacity-5 cursor-default' : company.isDisable === true}]">
                                <span v-if="!company.Cst_profileImage" class="no-image">{{ company.Cst_CompanyName.charAt(0).toUpperCase()}}</span>
                                <template v-else>
                                    <img v-if="company.Cst_profileImage?.includes('firebasestorage')" :src="company.Cst_profileImage || defaultUserIcon" alt="company_image" class="profile-image">
                                    <WasabiIamgeCompp v-else :companyId="company?._id" :data="{url:company.Cst_profileImage}" class="profile-image" thumbnail="38x38"/>
                                </template>
                                <span class="text-capitalize ml-10px">
                                    {{company.Cst_CompanyName}}
                                </span>
                            </div>
                        </DropDownOption>
                    </template>
                </DropDown>
                <div class="text-capitalize font-size-13 font-weight-500" :class="{'mr-2' : clientWidth > 1440, 'mr-1' : clientWidth<=1440}" v-else>
                    {{selectedCompany && selectedCompany.Cst_CompanyName ? selectedCompany.Cst_CompanyName : "N/A"}}
                </div>
            </template>
            </div>
            <router-link class="position-re" :class="{'mr-2' : clientWidth > 1440, 'pr-1' : clientWidth<=1440}" :to="{name: 'chats', params: {cid: companyId}}">
                <img src="@/assets/images/svg/chat_icon.svg" class="cursor-pointer" id="chat_driver"/>
                <span v-if="totalMainCounts" class="notification-tick blinking"></span>
            </router-link>
            <div class="position-re" :class="{'mr-2' : clientWidth > 1440, 'mr-1' : clientWidth<=1440}" v-if="rules && Object.keys(rules).length">
                <img src="@/assets/images/svg/header_notification.svg" class="cursor-pointer" id="notification_driver" @click="getNotifications(!notifications.length), showNotification = 0, notificationVisible = true">
                <span :class="{'notification-tick': totalNotification}" class="blinking"></span>
            </div>
            <div class="position-re" :class="{'pr-2' : clientWidth > 1440, 'pr-1' : clientWidth<=1440}" v-if="rules && Object.keys(rules).length">
                <img src="@/assets/images/comment_mention.png" class="cursor-pointer" id="mention_driver" @click="getMentions(!mentions.length), showNotification = 1, notificationVisible = true">
                <span :class="{'notification-tick': totalMentions > 0}" class="blinking"></span>
            </div>
            <div class="position-re" :class="{'pr-2' : clientWidth > 1440, 'pr-1' : clientWidth<=1440}" v-if="rules && Object.keys(rules).length && (companyUser.roleType === 1 || companyUser.roleType === 2)">
                <img src="@/assets/images/svg/tour_image.svg" class="cursor-pointer" id="tour_icon" @click="getTourDetails(),tourVisible = true">
            </div>
            <div :class="{'pr-2' : clientWidth > 1440, 'pr-1' : clientWidth<=1440}">
                <a :href="brandSettings && brandSettings?.helpLink ? brandSettings?.helpLink : 'javascript:void(0)'" :target="brandSettings && brandSettings?.helpLink  ? '_blank' : ''" class="help__icon">
                    <img src="@/assets/images/svg/questionmark.svg" alt="help" class="question__icon">
                </a>
            </div>
            <div id="profile_menu_driver">
            <DropDown class="pr-1" :id="'profile_menu'">
                <template #button>
                    <div class="header-profile-wrapper" ref="profile_menu_dd">
                        <UserProfile
                            :showDot="false"
                            :data="{
                                image: getUser(userId).Employee_profileImageURL,
                                title: getUser(userId).Employee_Name
                            }"
                            width="35px"
                            :thumbnail="'35x35'"
                        />
                    </div>
                </template>
                <template #options>
                    <div>
                        <DropDownRouterOption v-if="rules && Object.keys(rules).length" :item="{image: profileIcon, to: {name: 'My Settings', params: {cid: companyId}}, label: 'My Profile'}" @click="$refs.profile_menu_dd.click()"/>
                        <DropDownRouterOption v-if="rules && Object.keys(rules).length" :item="{image: settingsIcon, to: {name: 'Setting', params: {cid: companyId}}, label: 'Settings'}" @click="$refs.profile_menu_dd.click()"/>
                        
                        <DropDownOption :item="{image: logoutIcon, label: 'Logout'}" @click="logOut()" />
                    </div>
                </template>
            </DropDown>
            </div>
            <span class="app-version">
                v{{version}}
            </span>
        </div>

        <Sidebar
            title="Test"
            v-model:visible="visible"
            :left="true"
            className="z-index-6 mobile-header-sidebar"
            width="325px !important"
            top="0px"
        >
            <template #head>
                <div class="header-mobile-title d-flex align-items-center">
                    <div class="logo-cross d-flex align-items-center justify-content-between w-100 h-100">
                    <router-link to="/" class="h-100 d-flex align-items-center">
                        <img class="cursor-pointer" :src="logoImage"/>
                    </router-link>
                    <img :src="closeBlueImageMobile" alt="closeButton" class="cursor-pointer close-btn-mobileheader" @click="visible = !visible"/>
                    </div>
                </div>
            </template>
            <template #body>
                <div class="px-1 d-flex flex-column  main-mobileheader-sidebar h-100 style-scroll">
                    <!-- TOP SECTION -->
                    <div v-if="rules && Object.keys(rules).length">
                        <div class="bg-white p-1 d-flex mobile-profileimg-namewrapper pb-30px">
                            <!-- <UserProfile
                                :showDot="false"
                                :data="{
                                    image: getUser(userId).Employee_profileImageURL,
                                    title: getUser(userId).Employee_Name
                                }"
                                width="45px"
                                style="margin: 0px !important;"
                                ref="profile_menu_dd"
                                class="profile-lg-square"
                            /> -->
                            <img v-if="!getUser(userId).Employee_profileImageURL" :src="getUser(userId).Employee_profileImageURL" alt="user_profile" class="profile-lg-square">
                            <WasabiIamgeCompp v-else :userImage="true" :thumbnail="'35x35'" :data="{title:getUser(userId).Employee_Name, url: getUser(userId).Employee_profileImageURL}" class="profile-lg-square"/>
                            <div class="d-flex flex-column cursor-pointer mobile-degignation-wrapper" :class="{'pl-1': clientWidth > 990, 'pt-20': clientWidth < 990 }">
                                <span class="font-weight-500 text-ellipsis font-size-20 mw-75 color90 pb-4px">{{getUser(userId).Employee_Name}}</span>
                                <span class="text-ellipsis mw-65">Designation</span>
                            </div>
                            </div>

                        <!-- COMPANY SELECTION -->
                        <div class="p-1 cursor-pointer border-radius-10-px m0px-20px bg-light-gray2"  @click="visible = false,$emit('filter')">
                            <span class="gray">Search</span>
                        </div>
                        <DropDown id="company_selection_2" class="company_selection_2"> 
                            <template #button>
                                <div class=" hover-bg-purplemobielist p-1 cursor-pointer border-radius-7-px text-capitalize mobile-menu-list" :class="{'hover-white:hover' : clientWidth<=991}">
                                    {{selectedCompany && selectedCompany.Cst_CompanyName ? selectedCompany.Cst_CompanyName : "N/A"}}
                                </div>
                            </template>

                            <template #head>
                                <div class="hover-bg-purplemobielist d-flex justify-content-center font-weight-bold text-capitalize" v-if="clientWidth<=767">
                                    {{selectedCompany && selectedCompany.Cst_CompanyName ? selectedCompany.Cst_CompanyName : "N/A"}}
                                </div>
                            </template>
                            <template #options>
                                <DropDownOption @click="$emit('change', company._id)" v-for="(company, index) in companies" :key="index" :item="{image: company.Cst_profileImage || defaultUserIcon, label: company.Cst_CompanyName}">
                                    <div class="d-flex align-items-center">
                                        <!-- <img :src="company.Cst_profileImage || defaultUserIcon" alt="company_image" class="profile-image"> -->
                                        <WasabiIamgeCompp :companyId="company.id" :data="{ url: company.Cst_profileImage || defaultUserIcon}" alt="company_image" class="profile-image"/>
                                        <span class="text-capitalize ml-10px">
                                            {{company.Cst_CompanyName}}
                                        </span>
                                    </div>
                                </DropDownOption>
                            </template>
                        </DropDown>
                        <template v-for="(item, index) in menu">
                            <!-- DIRECT LINK -->
                            <router-link :key="'item'+index" :class="{'active-list-mobile' : $route.name.includes('Project')}" class="hover-bg-purplemobielist hover-white p-1 cursor-pointer border-radius-7-px mobile-menu-list" v-if="item.submenu && !item.submenu.length" :to="item.to" @click="visible = false">
                                {{ item.name }}
                            </router-link>

                            <!-- FOR SUB MENU -->
                            <div :key="'nested-item-'+index" v-else>
                                <DropDown :id="'nav_menu'+index" :title="item.name">
                                    <template #button>
                                        <div :class="{'active-list-mobile': item.name==='Time Sheet' ? $route.name.toLowerCase().includes('timesheet') : $route.name.toLowerCase().includes('report')}" class="hover-bg-purplemobielist hover-white p-1 cursor-pointer border-radius-7-px mobile-menu-list">
                                            {{ item.name }}
                                        </div>
                                    </template>
                                    <template #options>
                                        <DropDownRouterOption
                                            v-for="(subItem, subIndex) in item.submenu"
                                            :key="subIndex"
                                            :style="`${subIndex === item.submenu.length - 1 ? 'margin-bottom:0px !important' : ''}`"
                                            @click="visible = false"
                                            :item="{to: subItem.to, label: subItem.name}"
                                        />
                                    </template>
                                </DropDown>
                            </div>
                        </template>
                        <router-link  v-if="rules && Object.keys(rules).length" class="hover-bg-purplemobielist hover-white p-1 cursor-pointer border-radius-7-px mobile-menu-list" :to="{name: 'chats', params: {cid: companyId}}">
                            Chat
                        </router-link>
                        <div  v-if="rules && Object.keys(rules).length" class="hover-bg-purplemobielist hover-white p-1 cursor-pointer border-radius-7-px mobile-menu-list" @click="getNotifications(!notifications.length), showNotification = 0, notificationVisible = true, visible = false">
                            Notification
                        </div>
                        <div v-if="rules && Object.keys(rules).length" class="hover-bg-purplemobielist hover-white p-1 cursor-pointer border-radius-7-px mobile-menu-list" @click="getMentions(!mentions.length), showNotification = 1, notificationVisible = true, visible = false">
                            @Mentions
                        </div>
                        <div v-if="rules && Object.keys(rules).length && (companyUser.roleType === 1 || companyUser.roleType === 2)" class="hover-bg-purplemobielist hover-white p-1 cursor-pointer border-radius-7-px mobile-menu-list" @click="getTourDetails(),tourVisible = true,visible = false">
                            Tours
                        </div>
                    </div>
                    <!-- BOTTOM SECTION -->
                    <div>
                        <div class="cursor-pointer border-radius-7-px d-flex align-items-center log-out-list font-size-18 font-weight-500 blue" @click="logOut()">
                            <img :src="logoutIconMobile" alt="logout" class="pr-10px">
                            Logout
                        </div>
                    </div>
                </div>
            </template>
        </Sidebar>

        <Sidebar width="550px" :title="!showNotification ? 'Notifications' : 'Mentions'" v-model:visible="notificationVisible">
            <template #head>
                <div class="d-flex align-items-center justify-content-between assignee-headtitle text-capitalize">
                    {{!showNotification ? 'Notifications' : 'Mentions'}}
                </div>
                <div class="d-flex align-items-center justify-content-between">
                    <button v-if="!showNotification ? totalNotification > 0 : totalMentions > 0" class="outline-primary mr-10px" @click="markAllRead(!showNotification ? 'notifications' : 'mentions')">Mark all as read</button>
                    <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="notificationVisible = false"/>
                </div>
            </template>
            <template #body>
                <div class="overflow-y-auto style-scroll mh-100">
                    <template v-if="(!showNotification ? notifications : mentions).length">
                        <div v-for="item in (!showNotification ? notifications : mentions)" :key="item.id" class="border-bottom notification" :class="{'bg-light-gray': !item.seen, 'bg-white': item.seen}">
                            <div class="d-flex p-1 position-re cursor-pointer" @click="markRead(item, !showNotification ? 'notifications' : 'mentions')">
                                <img v-if="!showNotification" @click.stop="markRead(item, !showNotification ? 'notifications' : 'mentions', false), notifications.length < 1 ? getNotifications(true) : ''" :src="notificationClose" alt="notificationClose" class="position-ab d-none notification-close-icon">

                                <UserProfile :showDot="false" :data="{
                                        image: getUser(item['userId']).Employee_profileImageURL,
                                        title: getUser(item['userId']).Employee_Name
                                    }"
                                    width="45px"
                                    :thumbnail="'40x40'"
                                />
                                <!-- <img :src="getUser(item[!showNotification ? 'UserId' : 'userId']).Employee_profileImageURL" :alt="getUser(item[!showNotification ? 'UserId' : 'userId']).Employee_Name" class="profile-image"> -->

                                <div class="d-flex ml-1 flex-column comment__notification-message">
                                    <strong>{{getUser(item['userId']).Employee_Name}}</strong>
                                    <div v-html="!showNotification ? item.message : `<p>${changeText(item.comment_message)}</p>`"></div>

                                    <span class="">{{ getDateAndTime(new Date(item?.createdAt).getTime()) }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="(!showNotification ? !noNotifications : !noMentions)" class="text-center cursor-pointer blue py-10px" @click="!showNotification ? getNotifications(true) : getMentions(true)">
                            <span>Load more</span>
                        </div>
                    </template>
                    <template v-else>
                        <div class="text-center cursor-pointer red py-10px">
                            <span>No data found</span>
                        </div>
                    </template>
                </div>
            </template>
        </Sidebar>
        <Sidebar width="550px" :title="'Take a Tour'" v-model:visible="tourVisible" className='tour_sidebar'>
            <template #head>
                <div class="d-flex align-items-center justify-content-between assignee-headtitle text-capitalize">
                    Take a Tour
                </div>
                <div class="d-flex align-items-center justify-content-between">
                    <button class="mark-all-comp-btn blue mr-20px cursor-pointer" @click="handleTourOps(tourList,true)">Mark all as Complete</button>
                    <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="tourVisible = false"/>
                </div>
            </template>
            <template #body>
                <div class="overflow-y-auto style-scroll mh-100 pt-5px">
                    <template v-if="tourList.length">
                        <div v-for="item in tourList" :key="item.id" class="notification p5px-p15px">
                            <div class="p-9px d-flex tour-box-card justify-content-between">
                                <div class="d-flex position-re align-items-center">
                                    <img class='tour_image' :src="getImageData(item.image)" :alt="item.image">
    
                                    <div class="d-flex ml-1 flex-column comment__notification-message">
                                        <strong class="tour__title font-weight-700 black font-size-16">{{item.title}}</strong>
                                        <div class="tour__description font-weight-500 font-size-14 GunPowder pr-10px overflow-hidden" :title="item.description">{{item.description}}</div>
                                    </div>
                                </div>
                                <div class="text-center">
                                    <span class="image_wrapper_tour">
                                        <img class="cursor-pointer" :src="!item.isCompleted ? tourComplete : tourRemain" alt="notificationClose" @click="handleTourOps(item)">
                                    </span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="text-center cursor-pointer red py-10px">
                            <span>No data found</span>
                        </div>
                    </template>
                </div>
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
// PACKAGE
import { computed, defineComponent, defineEmits, inject, onMounted, ref, watch, watchEffect } from "vue";
import { App } from "realm-web";
import {version} from "../../../../../package.json";
import { useRouter  } from 'vue-router'
import {useHelper} from "./helper"
import { dbCollections } from '@/utils/FirebaseCollections';
import { useMainChat } from "@/views/Chat/helper";
import { useStore } from "vuex";
import { useCustomComposable, useGetterFunctions } from "@/composable/index.js";
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';

// COMPONENTS
import NavLinks from "@/components/organisms/NavLinks/NavLinks.vue";
import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import DropDownRouterOption from "@/components/molecules/DropDownRouterOption/DropDownRouterOption.vue";
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"
import { useProjects } from '@/composable/projects';
import { UPDATE_UNREADREAD_COMMENTS_COUNT } from "@/config/env";
import { apiRequest } from "@/services";

// INTERFACES
const companyId = inject("$companyId");
const {getters} = useStore();
const userId = inject("$userId");
const {getUser} = useGetterFunctions()
const {changeText} = useCustomComposable();
const clientWidth = inject("$clientWidth");
const {openRoute, menu} = useHelper();
const {getProjects} = useMainChat();
const {getDateAndTime} = useProjects();

// IMAGES
const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");
const closeBlueImageMobile = require("@/assets/images/svg/cross_mobilesidebar_icon.svg");
const profileIcon = require("@/assets/images/svg/User_icon.svg");
const settingsIcon = require("@/assets/images/svg/Setting_icon.svg");
// 
const logoutIcon = require("@/assets/images/svg/Logout_icon.svg");
// const logoImage = require("@/assets/images/svg/mobile_site_Logo.svg");
const logoImage = '/api/v1/getlogo?key=logo&type=admin';
const logoutIconMobile = require("@/assets/images/svg/Mobile_icon/logout.svg");
const defaultUserIcon = inject("$defaultUserAvatar");
const toggle = require("@/assets/images/svg/mobile_toggle_white.svg");
const headerLogo = "/api/v1/getlogo?key=logo&type=web";
const notificationClose = require("@/assets/images/Shape 509.png");
const tourComplete = require("@/assets/images/svg/tourcomplete.svg");
const tourRemain = require("@/assets/images/svg/tourremain.svg");
const ai_tour = require("@/assets/images/svg/ai_tour.svg");
const automate_screen_tour = require("@/assets/images/svg/automate_screen_tour.svg");
const custom_field_tour = require("@/assets/images/svg/custom_field_tour.svg");
const dependencies_tour = require("@/assets/images/svg/dependencies_tour.svg");
const project_listing_tour = require("@/assets/images/svg/project_listing_tour.svg");
const task_details_tour = require("@/assets/images/svg/task_details_tour.svg");
const template_tour = require("@/assets/images/svg/template_tour.svg");
const time_tracker_tour = require("@/assets/images/svg/time_tracker_tour.svg");
const timesheet_tour = require("@/assets/images/svg/timesheet_tour.svg");
const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });

// COMPONENT
defineComponent({
    name: "Header-Component",

    components: {
        NavLinks,
        Sidebar,
        DropDown,
        DropDownOption,
        UserProfile
    }
})

defineEmits(["change"])
const brandSettings = computed(() => getters['brandSettingTab/brandSettings']);
onMounted(() => {
    if(getters['brandSettingTab/brandSettings'] && Object.keys((getters['brandSettingTab/brandSettings']) || {}).length){
        brandSettings.value = getters['brandSettingTab/brandSettings']
    }

    if(getters['mainChat/mainChatProjects'] && !getters['mainChat/mainChatProjects']?.data?.length) {
        getProjects()
        .catch((error) => {
            console.error("ERROR in get projects chat:", error);
        })
    }
})

const tourImages = {
    ai_tour,
    automate_screen_tour,
    custom_field_tour,
    dependencies_tour,
    project_listing_tour,
    task_details_tour,
    template_tour,
    time_tracker_tour,
    timesheet_tour
};

const getImageData = (dataImage) => {
    return tourImages[dataImage] || defaultUserIcon;
};

// DATA
const visible = ref(false);
// 
const showNotification = ref(0);
const notificationVisible = ref(false);
const tourVisible = ref(false);
const myCounts = computed(() => getters["users/myCounts"]?.data || {})
const totalNotification = computed(() => myCounts.value?.notification_counts);
const totalMentions = computed(() => myCounts.value?.mention_counts)
const companyUser = ref(getters['settings/companyUserDetail']);

const dispatchEventForFilet = () => {
    var ctrlKEv = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'k',
        ctrlKey: true
    });
    document.dispatchEvent(ctrlKEv);
}

function processSprint(pid) {
    let total = 0;
    const keys = Object.keys(myCounts.value||{}).filter((x) => x.includes(`sprint_${pid}`))
    keys.forEach((key) => {
        if(myCounts.value?.[key]) {
            total += myCounts.value?.[key] || 0;
        }
    })

    return total;
}
const totalMainCounts = computed(() => {
    let total = 0;

    getters["mainChat/mainChatProjects"]?.data?.forEach((x) => {
        total += processSprint(x._id)
    })

    return total;
})
const batchSize = ref(10)
// NOTIFICATION
const notifications = ref([]);
const noNotifications = ref(false);
const notificationSkip = ref(0);

// MENTIONS
const mentions = ref([]);
const noMentions = ref(false);
const firstMention = ref("");
const lastMention = ref("");
const companies = computed(() => {
    return (getters["settings/companies"] || []);
})

const filteredCompanies = computed(() => {
    return companies.value.filter((x) => x._id !== companyId.value)
})
watch(clientWidth,(newVal)=>{
    if(newVal > 990 && visible.value == true) {
        visible.value = false;
    }
})

//Tour List
// const tourList = ref([
//     {
//         "title":"Project Tour",
//         "description":"Look how to create project, manage tasks, view Time Sheet reports, enter a chat, view mentions and notifications, and more.",
//         "image":"https://picsum.photos/201/301",
//         "userId":"65bc7f88d454ec98010f26ec",
//         "isCompleted":false,
//         "id": "isProjectAndNavbarTour"
//     },
//     {
//         "title":"Dashboard",
//         "description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean leo leo, facilisis nec tellus nec, molestie auctor ante.",
//         "image":"https://picsum.photos/200/300",
//         "userId":"65bc7f88d454ec98010f26ec",
//         "isCompleted":false,
//         "id": "isDashboardTour"
//     },
//     {
//         "title":"Time Tracker",
//         "description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean leo leo, facilisis nec tellus nec, molestie auctor ante.",
//         "image":"https://picsum.photos/202/302",
//         "userId":"65bc7f88d454ec98010f26ec",
//         "isCompleted":false,
//         "id": "isTimeTracker"
//     },
//     {
//         "title":"Task Tour",
//         "description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean leo leo, facilisis nec tellus nec, molestie auctor ante.",
//         "image":"https://picsum.photos/203/303",
//         "userId":"65bc7f88d454ec98010f26ec",
//         "isCompleted":false,
//         "id": "isTaskTour"
//     },
// ]);
const tourList = ref([]);
const selectedCompany = ref("");
const chargeBeePriceData = computed(() => {
    return getters["settings/chargeBeePrice"];
})
const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
})
watchEffect(() => {
    selectedCompany.value = companies.value.find((company) => company._id === companyId.value)
    if (selectedCompany.value && selectedCompany.value.SubcriptionId && selectedCompany.value.SubcriptionId !== '' && chargeBeePriceData.value.length && companyOwner.value.isCurrentUser)  {
        // 
    }
    // 
})

const rules = computed(() => {
    return getters['settings/rules']
})

const router = useRouter()

// 

const deleteToken = () => {
    return new Promise((resolve, reject) => {
        try {

            let token = localStorage.getItem("webTokens");
            if (!userId.value || !token) {
                console.error("UserId or Token is missing");
                resolve(true);
                return;
            }

            // Assuming getUser is synchronous or this part is already handled
            let user = getUser(userId.value);
            let updateOps = {
                $set: {
                    isOnline: false,
                    lastActive: new Date()
                }
            };

            if (user && user.WebTokens && user.WebTokens.includes(token)) {
                updateOps.$pull = { webTokens: token };
            }

            const query = {
                type: "updateOne",
                collection: dbCollections.USERS,
                global: true,
                data: [
                    { _id: BSON.ObjectID(userId.value) },
                    updateOps,
                    true,
                    false
                ]
            };

            const userRef = mongodbCrudOperations(query)
            userRef.then(() => {
                resolve(true)
            })
        } catch (error) {
            reject(false)
            console.error(error,"error");
        }
    })
}

const logOut = (route = null) => {
    deleteToken().then(async ()=>{
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
        try {
            await app.currentUser.logOut();
            if(route === null) {
                router.push({ name: "Log-in" });
            } else {
                router.push(route)
            }
        } catch (error) {
            console.error(error,"error");
        }
    })
}

function getNotifications(loadMore = false) {
    if (loadMore) {
        if (notifications?.value?.length > 0) {
            notificationSkip.value = notifications?.value?.length
            batchSize.value  = notifications?.value?.length + 10
        }
    }

    let query = [
        {
            $match: {
                $and: [
                    {assigneeUsers:{$in: [ userId.value ]}},
                    {
                        $or: [
                            {notificationType: 'push'},
                            {notificationType: null}
                        ]
                    },
                    {receiverID : userId.value}
                ]
            }
        },
        {$sort: {createdAt: -1, _id: 1}},
        {$limit: batchSize.value},
        {$skip: loadMore ? notificationSkip.value : 0},
    ]

    const data = {
        type: 'aggregate',
        collection: dbCollections.NOTIFICATIONS,
        data: [query]
    }

    mongodbCrudOperations(data).then(async (res) => {

        if (res.length <= 0) {
            if (loadMore) {
                noNotifications.value = true;
            }
            return;
        }

        let uniqueNotifications = res
            .map((x) => ({
                ...x,
                seen: x.notSeen === undefined || !x.notSeen.includes(userId.value),
            }))
            .filter(newNotif => !notifications.value.some(existingNotif => existingNotif._id === newNotif._id));

        if (loadMore) {
            notifications.value = [...notifications.value, ...uniqueNotifications];
        } else {
            notifications.value = [...uniqueNotifications, ...notifications.value];
        }
    })
    .catch((error) => {
        console.error("Error getting new notification:", error);
    });
}

async function getMentions(loadMore = false) {

    let mentionQuery = {
        mentionIds: {
            $in: [userId.value]
        }
    }

    if (loadMore) {
        if (mentions?.value?.length > 0) {
            mentionQuery.createdAt = { $lt: new Date(lastMention.value.createdAt) }
        }
    } else {
        if (mentions?.value?.length > 0) {
            mentionQuery.createdAt = { $gt: new Date(firstMention.value.createdAt) }
        }
    }

    const data = {
        type: 'find',
        collection: dbCollections.MENTIONS,
        data: [mentionQuery, { limit: 10, sort: {createdAt: -1} }]
    }

    mongodbCrudOperations(data).then(async (res) => {
        var mentionsData = res
        if (mentionsData.length <= 0) {
            if (loadMore) {
                noMentions.value = true;
            }
            return;
        }

        if (loadMore) {
                lastMention.value = mentionsData[mentionsData.length - 1];
        }

        if (!loadMore || !lastMention.value.length) {
            firstMention.value = mentionsData[0];
            if (mentionsData.isEmpty) {
                noMentions.value = true;
            }
        }


        let tmp = mentionsData.map((x) => ({
            ...x,
            id: x.id,
            seen: x.notSeen === undefined || !x.notSeen.includes(userId.value)
        }));

        if (loadMore) {
            mentions.value = [...mentions.value, ...tmp];
        } else {
            mentions.value = [...tmp, ...mentions.value];
        }
    })
    .catch((error) => {
        console.error("Error getting new mentions:", error);
    });
}

function markRead(data, key, redirect = true) {
    if(data.notSeen && !data.notSeen.includes(userId.value)) {
        if(redirect) {
            openRoute(data, key,{gettersVal: getters});
            notificationVisible.value = false;
            data.seen = true;
        } else {
            notifications.value = notifications.value.filter((x) => x._id !== data._id);
        }
        return;
    }

    const query = {
        type: 'updateOne',
    }

    if(key === 'notifications') {
        query.collection = `${dbCollections.NOTIFICATIONS}`;
        query.data = [
            {_id: BSON.ObjectId(data._id)},
            {$set: 
                {
                    notificationStatus: 'completed',
                    notSeen: [],
                    isSeen: true
                }
            },
            true, //Upsert
            false
        ]
    } else {
        query.collection = `${dbCollections.MENTIONS}`;
        query.data = [
            {_id: BSON.ObjectId(data._id)},
            {$pull: {notSeen: userId.value}},
            true, //Upsert
            false
        ]
    }
    mongodbCrudOperations(query)
    .then(() => {
        if(redirect) {
            openRoute(data, key,{gettersVal: getters});
            notificationVisible.value = false;
            data.seen = true;
        } else {
            notifications.value = notifications.value.filter((x) => x._id !== data._id);
        }

        if(key === 'notifications' ? totalNotification.value <= 0 : totalMentions.value <= 0) return;
        const queryObj = {
            ...query,
            type : 'deleteOne',
            data : [{notificationId: data._id}],
            global: true
        }

        // UPDATE COUNTS OF MENTIONS
        let mentionCounts = {
            companyId : companyId.value,
            key : key === 'notifications' ? 5 : 4,
            userIds: userId.value,
            readAll: false,
            read: true
        }
        apiRequest("post", UPDATE_UNREADREAD_COMMENTS_COUNT, mentionCounts).catch((error) => {
            console.error(error,"ERROR");
        })

        mongodbCrudOperations(queryObj)
        .catch((error) => {
            console.error(`ERROR in deleting ${key} from global: `, error);
        })
    })
    .catch((error) => {
        console.error(`ERROR in mark ${key} seen: `, error);
    })
}

function markAllRead(key) {

    const query = {
        type: 'updateOne'
    }

    if(key === 'notifications') {
        query.collection = `${dbCollections.NOTIFICATIONS}`;
        query.data = [
            {
                assigneeUsers: {$in: [userId.value]},
                notSeen: {$ne: []},
                isSeen: false,
                notificationStatus: {$ne: 'completed'},
                notificationType: 'push',
            },
            {$set:
                {
                    notificationStatus: 'completed',
                    notSeen: [],
                    isSeen: true
                }
            }
        ]

    } else {
        query.collection = `${dbCollections.MENTIONS}`;
        query.data = [
            {
                mentionIds: {$in: [userId.value]},
                notSeen: {$in: [userId.value]}
            },
            {
                $pull: {notSeen: userId.value}
            }
        ]
    }

    mongodbCrudOperations(query)
    .then(() => {
        notifications.value.filter((x) => !x.seen).forEach((data) => data.seen = true);
        mentions.value.filter((x) => !x.seen).forEach((data) => data.seen = true);
    })
    .catch((error) => {
        console.error(`ERROR in update ${key} info: `, error);
    })

    let updateObj = {
        type: 'updateOne',
        collection: dbCollections.USER_ID
    }
    if(key === 'notifications') {
        updateObj.data = [
            {userId: userId.value},
            {
                $set: {
                    notification_counts: 0
                }
            }
        ]
    } else {
        updateObj.data = [
            {userId: userId.value},
            {
                $set: {
                    mention_counts: 0
                }
            }
        ]
    }

    mongodbCrudOperations(updateObj)
    .catch((error) => {
        console.error(`ERROR in update ${key} seen info: `, error);
        return;
    })
}

function getTourDetails() {
    try {
        let obj = {
            type: "find",
            collection: dbCollections.TOURS,
            data:[{}],
            global: true,
        }
        mongodbCrudOperations(obj).then((res)=>{
            if(res.length <= 0) return;
            tourList.value = res;
            let tourStatus = getUser(userId.value).tourStatus;

            for (let tour of tourList.value) {
                if (Object.hasOwnProperty.call(tourStatus, tour.id)) {
                    tour.isCompleted = tourStatus[tour.id];
                }
            }
        }).catch((error)=>{
            console.error("Error GET TOURS GET",error)
        })
        // tourList.value.sort((b,a)=>{return a.isCompleted - b.isCompleted});
    } catch (error) {
        console.error(`ERROR in getTourDetails`, error);
    }
}

function handleTourOps(tourObject,isComplateAll = false) {
    try {
        if(!isComplateAll) {
            let tourUpdateObject = {
                ...(getUser(userId.value).tourStatus && getUser(userId.value).tourStatus),
                [tourObject.id]: !JSON.parse(JSON.stringify(tourObject)).isCompleted
            }
            const query = {
                type: "updateOne",
                collection: dbCollections.USERS,
                global: true,
                data: [
                    { _id: BSON.ObjectID(userId.value)},
                    { $set: { tour: tourUpdateObject } }
                ]
            };
            mongodbCrudOperations(query).then(()=>{
                let find = tourList.value.findIndex((e)=>e.id == tourObject.id);
                if(find !== -1) {
                    tourList.value[find] = {...tourList.value[find],...tourObject,'isCompleted': !tourObject.isCompleted};
                }
            }).catch((e)=>{
                console.error(e);
            })
        } else {
            let tours = tourList.value.reduce((f, e) => {
                f[e.id] = true;
                return f;
            }, {});

            const query = {
                type: "updateOne",
                collection: dbCollections.USERS,
                global: true,
                data: [
                    { _id: BSON.ObjectID(userId.value)},
                    { $set: { tour: tours } }
                ]
            };
            mongodbCrudOperations(query).then(()=>{
                tourList.value = tourList.value.map((e)=>{
                    return {...e, isCompleted: true};
                });
            }).catch((e)=>{
                console.error(e);
            })
        }
    } catch (error) {
        console.error(`ERROR in handleTourOps`, error);
    }
}
</script>

<style>
@import './style.css';
</style>