<template>
    <div>
        <Sidebar title="Create Channel" :visible="visible" @update:visible="inProgress ? '' : $emit('update:visible', $event), resetValues()" width="610px;">
            <template #body>
                <div v-if="!allowPublicChannels && !allowPrivateChannels" class="plan-upgrade-massage">
                    <h4>You reached the maximum public and private channel creation limit. To access this feature please upgrade your plan.</h4>
                </div>
                <div class="bg-light-gray h-100 p-10px" v-else>
                    <div class="position-ab d-flex align-items-center justify-content-center z-index-7 w-100 h-100 bg-dark-gray3" v-if="inProgress">
                        <Spinner :isSpinner="true"/>
                    </div>
                    <div class="bg-white border-radius-8-px p-15px webkit-avilable">
                        <div v-if="showWarning" class="mb-15px light-purple">{{warningMessage}}</div>
                        <!-- CHANNEL NAME -->
                        <div class="d-flex align-items-center">
                            <label class="text-nowrap mr-10px">Channel Name<span class="red">*</span></label>
                            <div class="position-re w-100">
                                <input type="text" v-model.trim="channelName.value" placeholder="Enter Channel Name" class="form-control webkit-avilable"
                                    @keyup="checkErrors({'field':channelName,
                                        'name':channelName.name,
                                        'validations':channelName.rules,
                                        'type':channelName.type,
                                        'event':$event.event})"
                                >
                                <div class="red position-ab font-size-11 error__text-channelname" v-if="channelName.error">{{channelName.error}}</div>
                            </div>
                        </div>

                        <!-- ICONS -->
                        <div>
                            <div class="d-flex white mt-2 justify-content-between">
                                <div class="border position-re border-radius-10-px bg-light-gray d-flex align-items-center justify-content-center mr-10px icons__wrapper-div">
                                    <img v-if="icon && Object.keys(icon).length || uploadFileName" class="position-ab create__channel-remove" @click="icon={},uploadFileName=''" :src="deletered">
                                    <img v-if="icon?.url" :src="icon?.url" alt="icon" class="border-radius-10-px w-100 h-100 icon__img">
                                    <FontAwesomeIcon v-if="icon?.iconName" :icon="icon" size="xl" class="gray81"/>
                                </div>
                                <div class="w-80">
                                    <span class="black font-weight-bold">Icons</span>
                                    <div class="d-flex flex-wrap white overflow-y-scroll style-scroll" style="height: 150px;" >
                                    <div v-for="(item,index) in icons" :key="index" class="m-6px" :class="(icon && item?.iconName === icon?.iconName) ? ['icon_bg border-radius-5-px'] : null">
                                            <div class="d-flex justify-content-center align-items-center icon_wrapper" @click="setIcon(item)">
                                                <FontAwesomeIcon :icon="item" size="lg" class="gray81"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center mt-10px">
                                <span>or</span>
                                <div class="d-flex align-items-center mt-10px">
                                    <input v-if="!uploadFileName" type="text" placeholder="Choose an Image to Upload" class="form-control" v-model.trim="icon.name" readonly/>
                                    <input v-else type="text" :placeholder="uploadFileName ? uploadFileName : 'Choose an Image to Upload'" class="form-control webkit-avilable" readonly/>
                                    <button class="btn-primary p0x-10px" @click="$refs.fileInputUser.click()">Upload</button>
                                    <input type="file" ref="fileInputUser" class="d-none" name="img" @change="previewImage" accept="image/x-png,image/jpeg,image/jpg" id="upload-photo"/>
                                </div>
                            </div>
                        </div>

                        <!-- PRIVATE CHANNEL -->
                        <div class="d-flex mt-2" :style="{'opacity': showWarning ? 0.5 : 1}">
                            <div class="w-95">
                                <span class="font-weight-bold">Private Channel</span>
                                <span class="d-block font-size-13 mt-5px">Only selected members and roles will be able to view this channel</span>
                            </div>
                            <Toggle v-model="privateChannel" width="30" activeColor="#3845B3" :disabled="isDisabled"/>
                        </div>

                        <!-- SEND MESSAGE -->
                        <div class="d-flex mt-2">
                            <div class="w-95">
                                <span class="font-weight-bold">Send Messages</span>
                                <span class="d-block font-size-13 mt-5px">Allows members to send messages in this channel.</span>
                            </div>
                            <Toggle v-model="sendMessage" width="30" activeColor="#3845B3"/>
                        </div>

                        <!-- ONLY SHARE WITH -->
                        <div class="d-flex align-items-center mt-2" v-if="privateChannel">
                            <span>Only share with: </span>
                            <Assignee
                                class="assignee-data ml-15px"
                                :users="assigneeUsers"
                                :options="[...userGetter, ...teams.map((x) => 'tId_'+x._id)]"
                                :imageWidth="clientWidth>1024 ? '30px' : '25px'"
                                :num-of-users="clientWidth>1024 ? 4 : 2"
                                @selected="changeAssignee('add', $event)"
                                @removed="changeAssignee('remove', $event)"
                                :isDisplayTeam="true"
                            />
                        </div>

                        <!-- CREATE CHANNEL -->
                        <div class="d-flex justify-content-end mt-2">
                            <button class="btn-primary" @click="createChannel()">Create Channel</button>
                        </div>
                    </div>
                </div>
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
// PACKAGES
import { computed, inject, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useValidation } from "@/composable/Validation";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons"
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// COMPONENTS
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
import Spinner from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import Toggle from "@/components/atom/Toggle/Toggle.vue"
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import { useCustomComposable, useGetterFunctions } from "@/composable";
import * as env from '@/config/env';
import { useToast } from "vue-toast-notification";
import { apiRequest, apiRequestWithoutCompnay } from '../../../services';

library.add(far);
library.add(fab)
library.add(fas);
dom.watch();

// UTILS
const projectData = inject("selectedProject");
const userId = inject("$userId");
const companyId = inject("$companyId");
const clientWidth = inject("$clientWidth");
const { getters } = useStore();
const {getUser} = useGetterFunctions();
const {checkAllFields, checkErrors} = useValidation();
const { checkBucketStorage } = useCustomComposable();
const teams = computed(() => getters["settings/teams"])
const $toast = useToast()
const showWarning = ref(false);
const warningMessage = ref("");

// EMITS
const emit = defineEmits(["update:visible", "cancel"]);

//IMAGE
const deletered = require("@/assets/images/svg/deletered.svg");

// PROPS
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    folder: {
        type: Object,
        default: null
    },
})

const icons = [...new Set([...Object.keys(far).map(key => far[key]),...Object.keys(fab).map(key => fab[key]),...Object.keys(fas).map(key => fas[key])])]
const userGetter = computed(() => {
    return getters["settings/companyUsers"].map((x) => x.userId)
})
const inProgress = ref(false)
const channelName = ref({
    error: "",
    value: "",
    rules: "required | min: 3",
    name: "channel name"
});
const icon = ref(icons.length > 0 ? {...icons[0],type: 'icon'} : {});
const assigneeUsers = ref([userId.value]);
const privateChannel = ref(false);
const sendMessage = ref(true);
const uploadFileName = ref('');

const currentCompanyDetails = computed(() => getters['settings/selectedCompany']);
const allowPrivateChannels = ref(false);
const allowPublicChannels = ref(false);

// Keep the watch on selectedCompany store getters to get updated data
watch(() => getters['settings/selectedCompany'], (val) => {
	currentCompanyDetails.value = val;
})

onMounted(() => {
    allowPrivateChannels.value = privateChannelsFun(currentCompanyDetails.value);
    allowPublicChannels.value = publicChannelsFun(currentCompanyDetails.value);
    if (!allowPrivateChannels.value || !allowPublicChannels.value) {
        showWarning.value = true;
        if (!allowPrivateChannels.value) {
            warningMessage.value = 'You have reached the limit for private channel creation. You can only create public channels. If you want to create a private channel, please upgrade your plan.'
        } else {
            warningMessage.value = 'You have reached the limit for public channel creation. You can only create private channels. If you want to create a public channel, please upgrade your plan.'
        }
    }
    manageToggleButton();
})

// Check private channels count as per the current subscription plan
const privateChannelsFun = (obj) => {
    const privateChannels = obj?.projectCount?.privateChannels;
    const maxPrivateChannels = obj?.planFeature?.maxPrivateChannels;

    return privateChannels === undefined || maxPrivateChannels === null || (maxPrivateChannels - privateChannels) > 0;
};

// Check public channels count as per the current subscription plan
const publicChannelsFun = (obj) => {
    const publicChannels = obj?.projectCount?.publicChannels;
    const maxPublicChannels = obj?.planFeature?.maxPublicChannels;

    return publicChannels === undefined || maxPublicChannels === null || (maxPublicChannels - publicChannels) > 0;
};

// Manage toggle for the private/public channel based on channel limits on subscription plan
const manageToggleButton = () => {
    privateChannel.value = !allowPublicChannels.value && allowPrivateChannels.value
                        ? true
                        : (allowPublicChannels.value && !allowPrivateChannels.value
                        ? false
                        : privateChannel.value);
}

// Disable toggle button of private/public channel based on subscription plan
const isDisabled = computed(() => allowPublicChannels.value !== allowPrivateChannels.value);

function setIcon(icn) {
    icon.value = {...icn, type: 'icon'}
    uploadFileName.value = '';
}

function previewImage(e) {
    let file = Array.from(e.target.files)?.[0];
    let fileList = Array.from(e.target.files);
    if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters}) !== true){
        return;
    }

    const extensions = ["jpg", "png", "gif", "jpeg"];
    const fileExt = file.name.split(".").pop()

    if(file && extensions.includes(fileExt)) {
        let render = new FileReader();
        render.onload = (data) => {
            icon.value = {
                file:file,
                url: data.target.result,
                type:'image'
            };
        }
        render.readAsDataURL(file)
        uploadFileName.value = file.name;
    } else {
        $toast.error("Please select an image file", {position: "top-right"})
        return;
    }
}

function changeAssignee(type, event) {
    if(type == "add"){
        assigneeUsers.value.push(event.id);
    }
    else if(type == "remove"){
        assigneeUsers.value = assigneeUsers.value.filter((x) => x !== event.id)
    }
}

function resetValues() {
    channelName.value.value = "";
    channelName.value.error = "";
    icon.value = {};
    privateChannel.value = false;
    sendMessage.value = true;
    assigneeUsers.value = [];
    emit("update:visible", false);
}

function createChannel() {
    if(inProgress.value) return;
    inProgress.value = true;
    checkAllFields({channelName: channelName.value})
    .then((valid) => {
        if(valid) {
            createChannelFun().then((res) => {
                if (res.data.status) {
                    $toast.success(`Channel created successfully`, { position: "top-right" })
                    resetValues();
                    inProgress.value = false;
                } else {
                    $toast.error(res.data.statusText, { position: "top-right" })
                    resetValues();
                    inProgress.value = false;
                }
            }).catch(() => {
                $toast.error(`Something went wrong`, { position: "top-right" })
                emit('cancel');
                resetValues();
                inProgress.value = false;
            })
        } else {
            inProgress.value = false;
        }
    })
    .catch((error) => {
        inProgress.value = false;
        console.error("ERROR: ", error);
    })
}

async function createChannelFun() {
    return new Promise((resolve, reject) => {
        try {
            (async () => {
                if(!props.folder) {
                    $toast.error(`Folder not found`, {position: "top-right"});
                    inProgress.value = false;
                    return;
                }
                let user = getUser(userId.value);
                let uploadIcon = {
                    ...icon.value
                }

                delete uploadIcon.icon;

                if (uploadIcon && Object.keys(uploadIcon).length && uploadIcon?.type === 'image') {
                    const randomNumber = parseInt(Date.now() * Math.random());
                    const name = uploadIcon.file.name.split(".")
                    const fileName = name[0].replaceAll(" ","_") + "_"+ randomNumber + "."+ name[1];
                    let filePath = `chats/${projectData.value._id}/channelImages/${fileName}`;
    
                    const apiFormData = new FormData();
                    apiFormData.append("file", uploadIcon.file);
                    apiFormData.append("path", filePath);
                    apiFormData.append("companyId", companyId.value);
                    await apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, apiFormData, "form").then((res)=>{
                        if(res.data.status){
                            uploadIcon = {
                                url: res.data.statusText,
                                type: 'image'
                            }
                        } else {
                            uploadIcon = {}
                        }
                    })
                }
                const axiosData = {
                    companyId: companyId.value,
                    projectId: projectData.value._id,
                    sprintName: channelName.value.value,
                    userData: {
                        id: user.id,
                        Employee_Name: user.Employee_Name,
                        companyOwnerId: user.companyOwnerId
                    },
                    projectName: projectData.value.ProjectName,
                    mainChat: true,
                    private: privateChannel.value,
                    sendMessage: sendMessage.value,
                    AssigneeUserId: assigneeUsers.value,
                    icon: uploadIcon
                }

                if(privateChannel.value) {
                    axiosData.watchers = assigneeUsers.value;
                }

                if(props.folder) {
                    axiosData.folder = {
                        folderId: props.folder.folderId,
                        folderName: props.folder.name
                    }
                } else {
                    axiosData.folder = null
                }

                let endPoint = env.SPRINT;
                apiRequest("post", endPoint, {
                    ...axiosData,
                    type: "addSprint",
                })
                .then((res) => {
                    resolve(res);
                })
                .catch((error) => {
                    console.error("Error: ", error);
                    reject(error);
                });
            })()
        } catch (error) {
            console.error("ERROR: ", error);
            reject(error);
        }
    });
}
</script>

<style scoped>
.error__text-channelname{
    bottom: -14px; 
    left: 0px;
}
.icons__wrapper-div{
    width: 62px; 
    height: 62px;
}
.icon__img{
    object-fit: cover;
}
.icon_bg {
    background-color: #ebecf4;
}
.icon_wrapper{
    height: 40px;
    width: 35px;
}
.plan-upgrade-massage {
    position: absolute;
    top: 50%;
    left: 3%;
    font-size: 13px;
}
.create__channel-remove {
    right: -6px;
    top: -10px;
    background-color: #ffd6d6;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
}
</style>