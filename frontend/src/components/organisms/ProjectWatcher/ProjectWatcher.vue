<template>
    <div>
        <Sidebar
            title="List of watchers"
            :visible="openSidebar"
            @update:visible="$emit('update:openSidebar', !openSidebar)"
        >
            <template #body>
                <div class="bg-white p-1 h-100">
                    <div class="border-radius-5-px bg-light-gray p0x-10px">
                        <div class="cursor-pointer d-flex align-items-center border-bottom py-10px" @click="filterUsers.map((x) => x.id)?.includes(userId) ? (watchType = 'all_activity', changeWatchType()) : ''">
                            <input class="mr-5px m-0"  type="radio" name="type" value="all_activity" :disabled="!filterUsers.map((x) => x.id)?.includes(userId)" v-model="watchType"/>
                            <label>All Activity</label>
                        </div>
                        <div class="cursor-pointer d-flex align-items-center border-bottom py-10px" @click="filterUsers.map((x) => x.id)?.includes(userId) ? (watchType = 'participating_mentions', changeWatchType()) : ''">
                            <input class="mr-5px m-0" type="radio" name="type" value="participating_mentions" :disabled="!filterUsers.map((x) => x.id)?.includes(userId)" v-model="watchType"/>
                            <label>Participating and @mentions</label>
                        </div>
                        <div class="cursor-pointer d-flex align-items-center py-10px" @click="filterUsers.map((x) => x.id)?.includes(userId) ? (watchType = 'ignore', changeWatchType()) : ''">
                            <input class="mr-5px m-0" type="radio" name="type" value="ignore" :disabled="!filterUsers.map((x) => x.id)?.includes(userId)" v-model="watchType"/>
                            <label>Ignore</label>
                        </div>
                    </div>
                    <h3 class="pt-1 border-top mt-1">Watchers list</h3>
                    <input type="text" v-model="search" class="form-control m10px-0px" placeholder="Search here">
                    <div class="overflow-y-auto style-scroll filterusers__wrapper">
                        <template v-if="filterUsers?.length">
                            <TransitionGroup>
                                <div
                                    v-for="user in filterUsers" :key="user.id"
                                    class="d-flex align-items-center justify-content-between hover-bg-light-gray cursor-pointer border-radius-5-px p5px-p10px"
                                    @click="addWatchers(user.id, 'add')"
                                >
                                    <div class="d-flex align-items-center">
                                        <UserProfile
                                            width="30px"
                                            :thumbnail="'30x30'"
                                            :showDot="false"
                                            class="user__profile-component"
                                            :data="{image: getUser(user.id)?.Employee_profileImageURL, title: getUser(user.id)?.Employee_Name}"
                                        />
                                        <div class="ml-5px">
                                            <span class="font-size-14 d-block">
                                                {{getUser(user.id)?.Employee_Name}}
                                            </span>
                                            <span class="font-size-14 d-block">
                                                <template v-if="getUser(user.id)?.companyOwnerId === user.id">
                                                    Owner
                                                </template>
                                                <template v-else>
                                                    {{designations.find((x) => x.key === getUser(user.id)?.designation)?.name}}
                                                </template>
                                            </span>
                                        </div>
                                    </div>
                                    <div v-if="user.id === userId && user?.watcher">
                                        <img :src="closeRedImage" alt="" class="cursor-pointer" @click.stop="addWatchers(user.id, 'remove')">
                                    </div>
                                </div>
                            </TransitionGroup>
                        </template>
                        <template v-else>
                            <div class="red text-center">
                                No results found
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
// PACKAGES
import { useStore } from 'vuex';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useCustomComposable, useGetterFunctions } from '@/composable';
import { dbCollections } from '@/utils/FirebaseCollections';
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import { BSON } from "realm-web";
import * as env from '@/config/env';

// COMPONENTS
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"
import { useToast } from 'vue-toast-notification';
import { apiRequest } from '@/services';

// UTILS
const userId = inject("$userId")
const companyId = inject('$companyId');
const {getters} = useStore();
const {getUser} = useGetterFunctions();
const {debounce} = useCustomComposable();
const $toast = useToast();

// IMAGES
const closeRedImage = require("@/assets/images/close.png");

const designations = computed(() => getters["settings/designations"]);
const companyOwnerId = computed(() => getters["settings/companyOwnerDetail"]?.userId);

defineEmits(['update:openSidebar']);

const props = defineProps({
    openSidebar: {
        type: Boolean,
        default: false
    },
    watchers: {
        type: Object,
        default: () => {}
    },
    options: {
        type: Array,
        default: () => []
    },
    includeOwner: {
        type: Boolean,
        default: true
    },
    projectId: {
        type: String,
        required: true
    }
})

const inProcess = ref(false);
const search = ref("");
const watchType = ref('participating_mentions');
const users = ref([]);

watch([() => props.watchers, () => props.options], () => {
    handleWatchers();
})

const filterUsers = ref(users.value);


watch([search, users], debounce(() => {
    if(search.value?.trim()) {
        filterUsers.value = users.value?.filter((x) => x.Employee_Name?.trim()?.toLowerCase().includes(search.value?.trim()?.toLowerCase()));
    } else {
        filterUsers.value = users.value;
    }
}), 1000)

function handleWatchers() {
    watchType.value = props.watchers?.[userId.value] || 'participating_mentions';
    let allUsers = JSON.parse(JSON.stringify(props.options)) || [];
    if(props.includeOwner && !allUsers.includes(companyOwnerId.value)) {
        allUsers.push(companyOwnerId.value);
    }
    users.value = [];

    allUsers.forEach((uid) => {
        let obj = {
            ...getUser(uid),
            watcher: false,
        };

        if(Object.keys(props.watchers || {})?.includes(uid)) {
            obj.watcher=true;
        }
        if (!getUser(uid).ghostUser) {
            users.value.push({...obj});
        }
    })
}

function addWatchers(uid, type) {
    if(uid !== userId.value || ((type === "add" && props?.watchers?.[userId.value]) || (type === "remove" && !props?.watchers?.[userId.value]))) return;

    let updateObj = {};
    if(type === "add") {
        updateObj = {
            $set: {
                [`watchers.${uid}`]: watchType.value
            },
        }
    } else {
        updateObj = {
            $unset: {
                [`watchers.${uid}`]: 1
            },
        }
    }

    updateProject(updateObj, `Watchers ${type === "add" ? 'added' : 'removed'} successfully`);
}

function changeWatchType() {
    const user = getUser(userId.value);
    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId
    }
    let historyObj = { 
        key : "Project_Watchers"
    }
    if(watchType.value === 'all_activity'){
        historyObj.message = `<b>${userData.Employee_Name}</b> has watchers activity as a <b>All Activity</b> </b>`
    }else if(watchType.value === 'participating_mentions') {
        historyObj.message = `<b>${userData.Employee_Name}</b> has watchers activity as a <b>Participating and @mentions</b> </b>`
    }else{
        historyObj.message = `<b>${userData.Employee_Name}</b> has watchers activity as a <b>Ignore</b> </b>`
    }
    let updateObj = {
        $set: {
            [`watchers.${userId.value}`]: watchType.value
        },
    }
    updateProject(updateObj, `Watch type updated successfully`,historyObj,userData)
}

function updateProject(updateObj = null, successMessage = '',historyObj = {},userData = {}) {
    if(inProcess.value) return;
    inProcess.value = true;
    if(!updateProject) return;

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: [
            { _id: BSON.ObjectID(props.projectId) },
            { ...updateObj },
            true,
            false
        ]
    };

    mongoQuery.mongodbCrudOperations(query)
    .then(() => {
        inProcess.value = false;
        if(historyObj && Object.keys(historyObj).length > 0){
            apiRequest("post", env.HANDLE_HISTORY, {
                "type": 'project',
                "companyId": companyId.value,
                "projectId": props.projectId,
                "taskId": null,
                "object": historyObj,
                "userData": userData
            })
        }
        $toast.success(successMessage, {position: "top-right"})
    })
    .catch((error) => {
        inProcess.value = false;
        console.error("ERROR in update watcher: ", error.message);
    })
}

onMounted(() => {
    handleWatchers();
})

</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.filterusers__wrapper{
   height: calc(100% - 225px);
}
.user__profile-component{
    object-fit: cover;
}
</style>