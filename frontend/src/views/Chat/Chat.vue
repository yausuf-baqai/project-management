<template>
    <div v-if="!allowChatFeature" class="plan-upgrade-massage">
        <h4>To access this feature please upgrade your plan.</h4>
    </div>
    <div class="d-flex h-100" v-else>
        <!-- LEFT SECTION -->
        <MainChatSidebarVue
            v-if="clientWidth > responseWidth"
            class="mainchatcomponent"
            :selectedChat="selectedChat"
            @selectedChat="selectedChat = $event"
            :projects="projects"
            :loadingChats="loadingChats"
        />
        <Sidebar v-else v-model:visible="visible" title="Chats" :left="true" width="395px" :unMount="false" :hideHeader="true">
            <template #body>
                <MainChatSidebarVue
                    :selectedChat="selectedChat"
                    @selectedChat="selectedChat = $event"
                    :projects="projects"
                    @hide="visible = !visible"
                    :loadingChats="loadingChats"
                />
            </template>
        </Sidebar>
        <!-- RIGHT SECTION -->
        <div :style="`width: calc(100%${clientWidth > responseWidth ?' - 400px' : ''});`">
            <div class="border-bottom d-flex align-items-center justify-content-between selected__chat-div  p0x-10px" v-if="selectedChat?.id || loadingChats">
                <template v-if="!loadingChats">
                    <div class="d-flex">
                        <img :src="sidebarArrowIcon" alt="sidebarArrowIcon" @click="visible =! visible" v-if="clientWidth <= responseWidth" class="mr-10px">
                        <div class="d-flex" v-if="selectedProject.default">
                            <div class="d-flex align-items-center">
                                <UserProfile
                                    :data="{title: getUser(selectedChat.receiverId)?.Employee_Name, image: getUser(selectedChat.receiverId)?.Employee_profileImageURL}"
                                    width="30px"
                                    :thumbnail="'30x30'"
                                    :showDot="false"
                                />
                            </div>
                            <div class="d-flex flex-column ml-10px">
                                <span class="font-size-14 font-weight-700 gray63 selectedchat__empname">{{getUser(selectedChat.receiverId).Employee_Name}}</span>
                                <span class="font-size-12 font-wight-400 dark-gray2 selected__chat-last">{{selectedChat?.lastMessage ? convertDateFormat(selectedChat?.lastMessage) : ""}}</span>
                            </div>
                        </div>
                        <div class="d-flex" v-else>
                            <div class="d-flex align-items-center">
                                #
                            </div>
                            <div class="d-flex align-items-center flex-row">
                                <WasabiImage v-if="selectedChat?.type == 'image'" :data="{url: selectedChat.url}" class="profile-sm-square m0px-5px"/>
                                <FontAwesomeIcon v-if="selectedChat?.type == 'icon'" :icon="selectedChat" size="sm" class="w-20 m0px-5px"/>
                                <span>{{selectedChat.name}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <Assignee
                            v-if="selectedChat?.private"
                            :users="selectedChat?.AssigneeUserId || []"
                            :num-of-users="2"
                            :options="[...users, ...teams.map((x) => 'tId_'+x._id)]"
                            image-width="25px"
                            class="mr-15px"
                            @selected="changeAssignee('add', $event.id)"
                            @removed="changeAssignee('remove', $event.id)"
                            :isDisplayTeam="true"
                        />
                        <img class="cursor-pointer mr-15px" @click="isSidebar = true,sidebarTitle='Files & Links'" :src="fileLinkIcon" alt="fileLinkIcon">
                        <img class="cursor-pointer mr-15px" :src="searchIcon" alt="searchIcon" @click="toggleChatSidebar('search')">
                        <img class="cursor-pointer mr-15px" :src="pinIcon" alt="pinIcon" @click="toggleChatSidebar('pin')">
                        <img class="cursor-pointer mr-10px" @click="isSidebar = true,sidebarTitle='Audio Files'" :src="audioIcon" alt="audioIcon">
                    </div>
                </template>
                <template v-else>
                    <div class="d-flex">
                        <Skelaton style="height: 30px; width: 30px;" class="mr-10px border-radius-50-per"/>
                        <Skelaton style="height: 30px; width: 150px;"/>
                    </div>
                </template>
            </div>
            <template v-if="loadingChats">
                <div class="bg-light-gray commments__component-wrapper position-re">
                    <div class="d-grid flex-column">
                        <Skelaton style="height: 30px; width: 10%;" class="border-radius-5-px d-flex align-items-center mt-1 justify-self-start"/>
                        <Skelaton style="height: 30px; width: 25%;" class="border-radius-5-px d-flex align-items-center mt-5px justify-self-start"/>
                        <Skelaton style="height: 30px; width: 50%;" class="border-radius-5-px d-flex align-items-center mt-1 justify-self-end"/>
                        <Skelaton style="height: 30px; width: 10%;" class="border-radius-5-px d-flex align-items-center mt-5px justify-self-end"/>
                        <Skelaton style="height: 30px; width: 25%;" class="border-radius-5-px d-flex align-items-center mt-5px justify-self-end"/>
                        <Skelaton style="height: 30px; width: 50%;" class="border-radius-5-px d-flex align-items-center mt-1 justify-self-start"/>
                    </div>
                    <div class="position-ab" style="bottom: 0; width: 100%">
                        <Skelaton style="height: 70px; width: 100%;" class="border-radius-5-px d-flex align-items-center mt-1 justify-self-start"/>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="bg-light-gray commments__component-wrapper" v-if="selectedChat?.id && selectedProject?._id">
                    <Comments
                        v-if="selectedChat?.id && !loadingChats"
                        :taskId="selectedProject?.default ? selectedChat?.id : 'default'"
                        :sprintId="selectedProject?.default ? selectedChat.sprintId : selectedChat?.id"
                        :userIds="[...(selectedProject?.default ? (selectedChat.AssigneeUserId || []) : ((selectedChat?.private ? selectedChat?.AssigneeUserId : users) || []))]"
                        :watchers="[...(selectedProject?.default ? (selectedChat.AssigneeUserId || []) : ((selectedChat?.private ? selectedChat?.AssigneeUserId : users) || []))]"
                        :mainChat="true"
                        :newChat="selectedChat?.newChat || false"
                        :title="selectedProject.default ? getUser(userId)?.Employee_Name : selectedChat?.name"
                        :sendMessageAllowed="selectedChat?.sendMessage == false ? false : true"
                    />
                </div>
                <div v-else class="bg-light-gray flex-column d-flex align-items-center justify-content-center text-center w-100 h-100 position-re">
                    <div class="position-ab bg-white pl-15px pr-15px pt-10px pb-10px border-right-radius-5-px box-shadow-2" style="top: 10px; left: 0px;" v-if="!visible && clientWidth <= responseWidth">
                        <img :src="sidebarArrowIcon" alt="sidebarArrowIcon" @click="visible =! visible">
                    </div>
                    <img :src="noResultImage" alt="No Chats">
                    <h2>Welcome to {{brandSettings && brandSettings?.productName ? brandSettings.productName : 'Alian Hub'}}</h2>
                    <span class="nochat__text">This is a brand-new Group. Here are some steps to help you get started. For more, check out our Getting Started guide</span>
                </div>
            </template>
        </div>
        <Sidebar
            className="task-sub-sidebar"
            v-model:visible="isSidebar"
            :title="sidebarTitle"
            width="375px"
        >
            <template #body>
                <FileAndLinks
                    v-if="sidebarTitle === 'Files & Links'"
                    :handleType="'chat'"
                    @closeSidebar="(val) => isSidebar = val"
                    :selectedData="selectedProject?.default ? selectedChat : {id:'default',sprintId:selectedChat?.id,ProjectID:selectedProject?._id}"
                />
                <TaskAudioFiles
                    v-else-if="sidebarTitle === 'Audio Files'"
                    :fromWhich="'chat'"
                    :key="`${selectedProject?._id}` + 'chats'"
                    :selectedData="selectedProject?.default ? selectedChat : {id:'default',sprintId:selectedChat?.id,ProjectID:selectedProject?._id}"
                />
            </template>
        </Sidebar>
        <Sidebar
            v-model:visible="chatSidebar"
            :title="searchType"
            width="375px"
        >
            <template #body>
                <FilteredChats
                    :search="searchObj"
                    :mainChat="true"
                    :searchOnMount="searchType !== 'Search'"
                />
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
// PACKAGES
import { computed, defineComponent, inject, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { useConvertDate, useGetterFunctions } from "@/composable";
import { useRoute } from "vue-router";
import {useMainChat} from "./helper"
import { useStore } from "vuex";
import { useToast } from "vue-toast-notification";
import { BSON } from "realm-web";
import FileAndLinks from '@/components/molecules/FileAndLinks/FileAndLinks.vue'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// COMPONENTS
import MainChatSidebarVue from "@/components/organisms/MainChatSidebar/MainChatSidebar.vue";
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
import Skelaton from "@/components/atom/Skelaton/Skelaton.vue"
import Comments from '@/views/Projects/Comments/Comments.vue'
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import TaskAudioFiles from '@/components/molecules/TaskAudioFiles/TaskAudioFiles.vue'
import FilteredChats from "@/components/organisms/FilterChat/FilterChat.vue"
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import * as env from '@/config/env';
import { apiRequest } from "../../services";
import { dbCollections } from "@/utils/FirebaseCollections";

// UTILS
const clientWidth = inject("$clientWidth");
const responseWidth = 1200;
const companyId = inject("$companyId");
const userId = inject("$userId");
const {getUser} = useGetterFunctions();
const {convertDateFormat} = useConvertDate();
const {getters} = useStore();
const route = useRoute();
const $toast = useToast();
const {getProjects, dispatchChats} = useMainChat();

const searchObj = ref()
const brandSettings = computed(() => getters['brandSettingTab/brandSettings']);

// IMAGES
const noResultImage = require("@/assets/images/svg/Artwork-updated.svg");
const searchIcon = require("@/assets/images/serachIcon.png");
const pinIcon = require("@/assets/images/png/Pinned Messages.png");
const sidebarArrowIcon = require("@/assets/images/svg/sidebarclose_arrow.svg");
const fileLinkIcon = require("@/assets/images/svg/Fileslinks.svg")
const audioIcon = require("@/assets/images/svg/audio.svg")

defineComponent({
    name: "chat-component",

    components: {
        MainChatSidebarVue,
        Sidebar,
        Comments
    }
})

const chatSidebar = ref(false);
const searchType = ref("");
const assigneeInProgress = ref(false);

const visible = ref(false);
const isSidebar = ref(false);
const selectedProject = ref({});
const selectedChat = ref(null);
const projects = ref([]);
const snapRef = ref(null);
const loadingChats = ref(true);
const sidebarTitle = ref('');

const users = computed(()=> getters["settings/companyUsers"]?.map((x) => x.userId))
const teams = computed(() => getters["settings/teams"])
const currentPlan = computed(() => getters['settings/selectedCompany']?.planFeature);
const allowChatFeature = computed(() => currentPlan.value && currentPlan.value?.chat);

provide("selectedProject", selectedProject);
provide("selectedChat", selectedChat);

const mainChatProjectGetter = computed(() => getters["mainChat/mainChatProjects"])

onMounted(() => {
    if(mainChatProjectGetter.value?.data?.length) {
        projects.value = mainChatProjectGetter.value?.data || [];
        initalProcess();
    } else {
        handleSnapshot();
    }
})

watch(mainChatProjectGetter, (newVal) => {
    if(newVal?.data?.length) {
        projects.value = newVal?.data || [];
        initalProcess();
    }
})

function initalProcess() {
    if(projects.value.length) {
        selectProject();
    }

    projects.value.forEach((x) => {
        if(Object.keys(x?.sprintsfolders || {}).length) {
            x.sprintsfolders = Object.values(x?.sprintsfolders)?.sort((a, b) => a?.name?.trim()?.toLowerCase() > b?.name?.trim()?.toLowerCase() ? 1 : -1)

            Object.keys(x?.sprintsfolders).forEach((fid) => {
                if(Object.values(x.sprintsfolders?.[fid]?.sprintsObj || {}).length) {
                    x.sprintsfolders[fid].sprintsObj = Object.values(x.sprintsfolders[fid].sprintsObj)?.sort((a, b) => a?.name?.trim()?.toLowerCase() > b?.name?.trim()?.toLowerCase() ? 1 : -1)
                }
            })
        }
    })

    let defaultProject = projects.value.find((x) => x?.default)
    if(defaultProject) {
        loadingChats.value = true;
        dispatchChats(defaultProject._id, Object.keys(defaultProject.sprintsObj || {})?.[0])
        .then(() => {
            loadingChats.value = false;
        })
        .catch((error) => {
            loadingChats.value = false
            console.error("ERROR in get chats: ", error);
        })
    }
}

onUnmounted(() => {
    if(snapRef.value && snapRef.value !== null) {
        snapRef.value();
    }
})

watch([route, projects], () => {
    selectProject();
})

function selectProject() {
    try {
        if(!projects.value.length) return;

        let urlPid = route.params.pid;
        let project = null;

        if(urlPid) {
            project = projects.value.find((x) => x._id === urlPid) || projects.value[0]
        } else {
            project = projects.value[0];
        }

        if(!project) return;
        // UPDATE SELECTED PROJECT
        selectedProject.value = JSON.parse(JSON.stringify(project));
    } catch (error) {
        console.error("ERROR: ", error);
    }
}

// GET MAIN CHATS FROM PROJECTS
function handleSnapshot() {
    getProjects()
    .catch((error) => {
        console.error("ERROR in get chats: ", error);
    })
}

// CHANGE ASSIGNEE OF PRIVATE CHANNELS
function changeAssignee(type, uid) {
    if(assigneeInProgress.value) return;
    assigneeInProgress.value = true;

    let updateData = {};
    if(type === "add") {
        if(!selectedChat.value?.AssigneeUserId.includes(uid)) {
            updateData.$push = {
                [`sprintsfolders.${selectedChat.value?.folderId}.sprintsObj.${selectedChat.value.id}.AssigneeUserId`]: uid,
                [`sprintsfolders.${selectedChat.value?.folderId}.sprintsObj.${selectedChat.value.id}.watchers`]: uid
            }
        }
    } else {
        if(selectedChat.value?.AssigneeUserId.includes(uid)) {
            updateData.$pull = {
                [`sprintsfolders.${selectedChat.value?.folderId}.sprintsObj.${selectedChat.value.id}.AssigneeUserId`]: uid,
                [`sprintsfolders.${selectedChat.value?.folderId}.sprintsObj.${selectedChat.value.id}.watchers`]: uid
            }

            if(selectedChat.value?.AssigneeUserId?.length === 1) {
                updateData.$set = {
                    [`sprintsfolders.${selectedChat.value?.folderId}.sprintsObj.${selectedChat.value.id}.private`]: false,
                }
            }
        }
    }

    if(updateData) {
        try {
            apiRequest("patch", `${env.SPRINT}/${selectedChat.value.id}`, {
                companyId: companyId.value,
                projectId: selectedProject.value._id,
                folderId: selectedChat.value.folderId || "",
                type: "updateSprint",
                updateObject: updateData,
                mainChat: true
            })
            .then((resp) => {
                if(resp.data.status) {
                    $toast.success(`Assignee ${type === "add" ? 'added' : 'removed'} successfully`, {position: "top-right"})
                }
                assigneeInProgress.value = false;
            })
            .catch((error) => {
                console.error('ERROR in update assignee: ', error);
                $toast.error(`Something went wrong`, {position: "top-right"})
                assigneeInProgress.value = false;
            })
        } catch (error) {
            $toast.error(`Something went wrong`, {position: "top-right"})
            console.error('ERROR in update assignee: ', error);
            assigneeInProgress.value = false;
        }
    } else {
        assigneeInProgress.value = false;
    }
}

function toggleChatSidebar(type = '') {
    if(!type) return;
    chatSidebar.value = !chatSidebar.value;

    if(type === 'search') {
        searchType.value = "Search";

        if(selectedProject.value?.default) {
            searchObj.value = {
                type: "find",
                collection: dbCollections.COMMENTS,
                data:[
                    {
                        projectId: BSON.ObjectId(selectedChat.value.ProjectID),
                        ...(selectedChat.value.id ?
                            {
                                sprintId: BSON.ObjectId(selectedChat.value.sprintId),
                                taskId: BSON.ObjectId(selectedChat.value.id),
                            }
                            :
                            {
                                project: true
                            }
                        ),
                        isDeleted: false
                    },
                    {
                        sort:{
                            createdAt: 1
                        }
                    }
                ]
            }
            // filterBy = `isDeleted:!=true && projectId: ${selectedChat.value.ProjectID}${selectedChat.value.id ? ` && sprintId: ${selectedChat.value.sprintId} && taskId: ${selectedChat.value.id}` : ` && project: ${true}`}`
        } else {
            searchObj.value = {
                type: "find",
                collection: dbCollections.COMMENTS,
                data:[
                    {
                        projectId: BSON.ObjectId(selectedProject.value._id),
                        ...(selectedChat.value.id ?
                            {
                                sprintId: BSON.ObjectId(selectedChat.value.id),
                                taskId: "default",
                            }
                            :
                            {
                                project: true
                            }
                        ),
                        isDeleted: false
                    },
                    {
                        sort:{
                            createdAt: 1
                        }
                    }
                ]
            }
            // filterBy = `isDeleted:!=true && projectId: ${selectedProject.value._id}${selectedChat.value.id ? ` && sprintId: ${selectedChat.value.id} && taskId: default` : ` && project: ${true}`}`
        }

        // searchObj.value.filter_by = filterBy;
    } else if(type === `pin`) {
        searchType.value = "Pinned messages";
        searchObj.value = {
            q: "*",
            query_by: `mediaName, message`
        }

        let filterBy = "";
        if(selectedProject.value?.default) {
            searchObj.value = {
                type: "find",
                collection: dbCollections.COMMENTS,
                data:[
                    {
                        projectId: BSON.ObjectId(selectedChat.value.ProjectID),
                        ...(selectedChat.value.id ?
                            {
                                sprintId: BSON.ObjectId(selectedChat.value.sprintId),
                                taskId: BSON.ObjectId(selectedChat.value.id),
                            }
                            :
                            {
                                project: true
                            }
                        ),
                        isDeleted: false,
                        pinnedMessage: true
                    },
                    {
                        sort:{
                            createdAt: 1
                        }
                    }
                ]
            }
            // filterBy = `isDeleted:!=true && pinnedMessage: true && projectId: ${selectedChat.value.ProjectID}${selectedChat.value.id ? ` && sprintId: ${selectedChat.value.sprintId} && taskId: ${selectedChat.value.id}` : ` && project: ${true}`}`
        } else {
            searchObj.value = {
                type: "find",
                collection: dbCollections.COMMENTS,
                data:[
                    {
                        projectId: BSON.ObjectId(selectedProject.value._id),
                        ...(selectedChat.value.id ?
                            {
                                sprintId: BSON.ObjectId(selectedChat.value.id),
                                taskId: "default",
                            }
                            :
                            {
                                project: true
                            }
                        ),
                        isDeleted: false,
                        pinnedMessage: true
                    },
                    {
                        sort:{
                            createdAt: 1
                        }
                    }
                ]
            }
            // filterBy = `isDeleted:!=true && pinnedMessage: true && projectId: ${selectedProject.value._id}${selectedChat.value.id ? ` && sprintId: ${selectedChat.value.id} && taskId: default` : ` && project: ${true}`}`
        }

        searchObj.value.filter_by = filterBy;
    }
}


</script>

<style scoped>
.mainchatcomponent{
    max-width: 400px;
}
.selected__chat-div{
    height: 50px;
}
.selectedchat__empname{
    line-height: 23px;
}
.selected__chat-last{
    line-height:18px;
}
.commments__component-wrapper{
    height: calc(100% - 51px);
}
.nochat__text{
    max-width: 496px;
}
.plan-upgrade-massage {
    position: absolute;
    top: 50%;
    left: 40%;
}
</style>