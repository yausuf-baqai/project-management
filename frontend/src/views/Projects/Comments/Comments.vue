<template>
    <div class="position-re h-100">
        <!-- HEADER -->
        <div id="creator_div" v-if="messages.length && initalUser" class="bg-white border-bottom d-flex align-items-center px-1 creator_div">
            <strong class="font-size-14">Created by:</strong>
                <UserProfile
                    :showDot="false"
                    :data="{
                        image: initalUser.image,
                        title: initalUser.name
                    }"
                    width="30px"
                    :thumbnail="'30x30'"
                    class="cursor-pointer profile-image m0px-10px"
                />
            <span class="font-size-14 gray81"> {{initalUser.name}}</span>
            <strong class="ml-2 font-size-14 mr-10px">
                Created on:
            </strong>
            <span class="font-size-14 gray81">
                {{convertDateFormat(initalUser.createdAt, "DD/MM/YYYY")}}
            </span>
        </div>

        <!-- BODY -->
        <DragDrop
            v-if="showDropZone && messageAllowed"
            :extensions="fileExtentions"
            @handleDrop="checkMedia"
            style="z-index: 6 !important;"
            class="position-sti z-index-1 h-100 media__extension chat__drag-drop d-flex align-items-center justify-content-center"
            @dragLeave="showDropZone = false"
        />
        <div id="message_container"
            @dragenter="messageAllowed ? showDropZone = true : showDropZone = false"
            :style="{height: (messages.length ? `calc(100% - ${mainChat ? 76 : taskId ? 130 : 122}px)` :  `calc(100% - ${mainChat ? (mediaFiles.length ? 76 : 85) : (mediaFiles.length ? (clientWidth>767 ? 76 : props.taskId ? 70 : 18)  : (clientWidth>767 ? 144 : 86))}px)`)}"

            class="overflow-y-auto style-scroll position-re msg__container"
        >
            <div class="p0x-5px">
                <span v-if="messages.length && convertDateFormat({seconds: popupDate}).toLowerCase() !== 'today'" class="position-sti bg-white px-1 border-radius-5-px z-index-2 d-inline-block convert_dateformat">{{convertDateFormat({seconds: popupDate})}}</span>
                <Comment
                    v-for="(data, index) in messages" :key="data._id"
                    :message="data"
                    :showDay="data.showDifference"
                    :showUser="showUserInfo(data, messages[index - 1])"
                    :showMessageTime="showMessageTime(data, messages[index - 1])"
                    :showUnread="unreadMessages !== 0 && index === (messages.length - (unreadMessages)) ? unreadMessages : 0"
                    :class="{'mb-1': (index === messages.length - 1)}"

                    :mainChat="mainChat"

                    @previewImage="previewData = $event"

                    @highlight="highlightMessage"
                    @edit="editMessage(data)"
                    @createTask="createTask = true, formData.taskName.value=changeText(data.message.substr(0, 250), '', '')"
                    @addCheckList="addToCheckList(data.message)"
                    @copy="copyMessage(data.message)"
                    @delete="deleteMessage(data)"
                    @reply="replyMessage(data)"
                    @pin="pinMessage(data)"
                    @markUnread="updateCount(true, messages.length - index), resetUnread = false"
                />
            </div>
        </div>

        <div id="creator_div" v-if="!messages.length && initalUser" class="border-bottom d-flex align-items-center px-1 msg__initaluser">
            <strong class="font-size-14">
                Created by:
            </strong>
            <UserProfile
                :showDot="false"
                :data="{
                    image: initalUser.image,
                    title: initalUser.name
                }"
                width="30px"
                class="cursor-pointer profile-image m0px-10px"
            />
            <span class="font-size-14 gray81">
                {{initalUser.name}}</span>
            <strong class="ml-2 font-size-14 mr-10px">
                Created on:
            </strong>
            <span class="font-size-14 gray81">
                {{convertDateFormat(initalUser.createdAt, "DD/MM/YYYY")}}
            </span>
        </div>

        <!-- FOOTER -->
        <div>
            <div id="comment_footer"  class="border-top position-fi flex-column border-bottom d-flex align-items-end justify-content-between bg-white p-12px comment__footer">
                <!-- SCROLL BOTTOM -->
                <button v-if="showScrollBotton" class="scroll-bottom-btn position-ab bg-light-blue cursor-pointer" @click="scrollBottom()">
                    <img :src="downArrow" alt="downArrow" class="vertical-middle">
                </button>

                <MediaConfirmation
                    v-if="mediaFiles.length"
                    v-model="mediaFiles"
                    @cancel="mediaFiles = []"
                    @addNew="$refs.file_input.click()"
                    class="z-index-6"
                />
                <div class="d-flex w-100">
                    <!-- TEXT -->
                    <div class="d-flex align-items-center position-re comment__text-wrapper">
                        <div class="position-ab cursor-pointer message__reset-id" v-if="message._id" @click="resetMessage()">
                            <img :src="closeIcon" alt="closeIcon">
                        </div>
                        <template v-if="!recording">
                            <CommentInput
                                v-model="message.message"
                                :recording="recording"
                                :reply="message.reply"
                                @cancel-reply="message.reply = {}"
                                :userIds="users.map((x) => x.id)"
                                @enter="mediaFiles.length ? sendMedia() : sendMessageFun(message)"
                                :sendMessageAllowed="messageAllowed"
                                @pasteFile="checkMedia"
                            />
                        </template>
                        <template v-else>
                            <span class="mr-10px">{{recordTime}}</span>
                            <div class="bg-green border-radius-10-px record__progress" :style="{width: `${recordingProgress}%`}"></div>
                            <div class="bg-light-gray border-radius-10-px record__progress" :style="{width: `${100 - recordingProgress}%`}"></div>
                        </template>
                    </div>

                    <!-- FUNCTIONS -->
                    <div class="d-flex align-items-center">
                        <!-- RECORD -->
                        <Record v-model="recording" v-model:recordingProgress="recordingProgress" v-model:recordTime="recordTime" @stop="sendRecord" :send-meassage-allowed="messageAllowed"/>

                        <!-- ATTACH -->
                        <template v-if="!recording">
                            <img :src="attachIcon" alt="attachIcon" class="mx-1 cursor-pointer" :class="{'cursor-not-allowed' : disabled=!messageAllowed }"  @click="messageAllowed ? $refs.file_input.click() : null">
                            <input type="file" class="d-none" ref="file_input" @change="(e) => {checkMedia(Array.from(e.target.files)); e.target.value = null;}" id="filechat" multiple :disabled="!messageAllowed">
                            <button class="btn-primary ml-1 send__media-btn border-radius-8-px" :class="{'disable__send-button' : disabled=!messageAllowed }" @click="messageAllowed ? (mediaFiles.length ? sendMedia() : sendMessageFun(message)) : null"><img :src="sendIcon" alt="sendIcon" class="cursor-pointer" :class="{'disable__send-button' : disabled=!messageAllowed }"></button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <Modal title="Create task" acceptButtonText="Create Task" class-name="createTask__modal" :modelValue="createTask" @accept="saveTask()" @close="createTask = false, resetTaskData()" :closeOnBackdrop="false">
            <template #body>
                <div>
                    <div class="position-re createTask__modal-field mb-15px">
                        <span class="mb-5px" >Task name</span>
                        <InputText
                            class="input__taskname-value"
                            v-model="formData.taskName.value"
                            placeholder="Enter task name"
                            :maxLength="250"
                            :minLength="3"
                            :isOutline="false"
                            :isDirectFocus="true"
                            @keyup="checkErrors({'field':formData.taskName,
                            'name':formData.taskName.name,
                            'validations':formData.taskName.rules,
                            'type':formData.taskName.type,
                            'event':$event.event})"
                        />
                        <div class="red position-ab z-index-1 font-size-12 error__text">{{formData.taskName.error}}</div>
                    </div>
                    <div class="position-re createTask__modal-field mb-15px">
                        <SelectComp
                            name="sprintSelection"
                            title="Sprint"
                            displayKey="name"
                            v-model="formData.selectedSprint.value"
                            :options="sprintOptions"
                            :enableSearch="sprintOptions.length > 10"
                            :disabled="!sprintOptions.length"
                            class="select__component"
                            @change="checkErrors({'field':formData.selectedSprint,
                            'name':formData.selectedSprint.name,
                            'validations':formData.selectedSprint.rules,
                            'type':formData.selectedSprint.type,
                            'event':$event})"
                        />
                        <div class="red position-ab z-index-1 font-size-12 error__text">{{formData.selectedSprint.error}}</div>
                    </div>
                    <div class="position-re createTask__modal-field mb-15px">
                        <SelectComp
                            name="taskTypeSelection"
                            title="Task type"
                            displayKey="name"
                            v-model="formData.selectedType.value"
                            :options="projectData.taskTypeCounts.map((x) => ({...x, image: x.taskImage}))"
                            :enableSearch="projectData.taskTypeCounts.length > 10"
                            :disabled="!projectData.taskTypeCounts.length"
                            class="select__component"
                            @change="checkErrors({'field':formData.selectedType,
                            'name':formData.selectedType.name,
                            'validations':formData.selectedType.rules,
                            'type':formData.selectedType.type,
                            'event':$event})"
                        />
                        <div class="red position-ab z-index-1 font-size-12 error__text">{{formData.selectedType.error}}</div>
                </div>
                </div>
            </template>
        </Modal>

        <PdfImageViewer
            v-if="previewData !== null"
            :data="previewData"
            :openModal="previewData !== null"
            @closeModal="previewData = null"
            :downloadValue="previewData.downloadUrl"
        />
    </div>
</template>

<script setup>
// PACKAGES
import { defineComponent, nextTick, onMounted, ref, defineProps, inject, watch, computed, onBeforeUnmount } from "vue";
import { dbCollections } from "@/utils/FirebaseCollections";
import { useConvertDate, useCustomComposable, useGetterFunctions } from "@/composable";
import { checkFile, renderFiles, showUserInfo, showMessageTime, sendMessage, bakeMessage, uploadToWasabi, deleteFromWasabi, sendMailFromMessage, cutomerDetails } from "./helper";
import { useToast } from "vue-toast-notification";
import { useValidation } from "@/composable/Validation";
import { useStore } from "vuex";
import taskClass from "@/utils/TaskOperations"

// COMPONENTS
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
import Comment from "@/components/organisms/Comment/Comment.vue";
import CommentInput from "@/components/atom/CommentInput/CommentInput.vue"
import Record from "@/components/atom/Record/Record.vue"
import Modal from "@/components/atom/Modal/Modal.vue"
import SelectComp from "@/components/molecules/Select/Select.vue"
import InputText from "@/components/atom/InputText/InputText.vue"
import DragDrop from "@/components/atom/DragAndDropDivCompo/DragAndDropDivCompo.vue"
import MediaConfirmation from "@/components/molecules/MediaConfirmation/MediaConfirmation.vue"
import PdfImageViewer from "@/components/atom/Attachments/PdfImageViewer.vue"
import { useRoute, useRouter } from "vue-router";
import { mongodbSnapshot } from "@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot";
import * as env from '@/config/env';
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { BSON } from "realm-web";
import { apiRequest } from "../../../services";

// UTILS
const {debounce, makeUniqueId, changeText, checkLink, compareObjects,checkBucketStorage} = useCustomComposable();
const projectData = inject("selectedProject");

const axios = inject("$axios");
const companyId = inject("$companyId");
const userId = inject("$userId");
const clientWidth = inject("$clientWidth");
const {getUser} = useGetterFunctions();
const {convertDateFormat} = useConvertDate();
const $toast = useToast()
const  { checkErrors , checkAllFields } = useValidation();
const {getters,commit} = useStore();
const router = useRouter();
const route = useRoute();

// IMAGES
const attachIcon = require("@/assets/images/footerAttachmenticon.svg");
const sendIcon = require("@/assets/images/footerbtnsend.svg");
const downArrow = require("@/assets/images/dropdown-arrow.png");
const closeIcon = require("@/assets/images/svg/CloseSidebar_red.svg");

const element = ref(null);

defineComponent({
    name: "Comments-Component",
    components: {
        Comment,
        CommentInput,
        Record,
        Modal,
        SelectComp,
        InputText,
        DragDrop,
        MediaConfirmation
    }
});

// PROPS
const props = defineProps({
    taskId: {
        type: String,
        default: ""
    },
    parentTaskId: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        default: ""
    },
    newChat: {
        type: Boolean,
        default: false
    },
    sprintId: {
        type: String,
        default: ""
    },
    folderId: {
        type: String,
        default: null
    },
    userIds: {
        type: Array,
        default: () => []
    },
    watchers: {
        type: Array,
        default: () => []
    },
    checklistArray: {
        type: Array,
        default: () => []
    },
    mainChat: {
        type: Boolean,
        default: false
    },
    sendMessageAllowed: {
        type: Boolean,
        default: true
    },
    folderName: {
        type: String,
        default : ''
    },
    sprintName: {
        type: String,
        default : ''
    },
    productData: {
        type: Object,
        default : () => {}
    },
    forSupport: {
        type: Boolean,
        default : false
    }
})

const fileExtentions = computed(() => {
    return getters['settings/fileExtentions'];
});

const previewData = ref(null);

const newMainChat = ref();

const createInProgress = ref(false);
const messageQueue = ref([]);

const companyOwner = computed(() => getters["settings/companyOwnerDetail"])
const showDropZone = ref(false);

const recording = ref(false);
const recordingProgress = ref(0);
const recordTime = ref("00:00");

const createTask = ref(false);
const sprintOptions = ref([]);
const formData = ref({
    taskName: {
        value: "",
        rules:
        "required | min: 3",
        name: "name",
        error: "",
    },
    selectedSprint: {
        value: "",
        rules:
        "required",
        name: "sprint",
        error: "",
    },
    selectedType: {
        value: "",
        rules:
        "required",
        name: "task type",
        error: "",
    }
});

const message = ref({
    reply:{},
    replyMessageId:"",
    message:"",
    mediaURL: undefined,
    mediaName: undefined,
    mediaSize: undefined,
});
const mediaFiles = ref([]);
const messages = ref([]);
const showScrollBotton = ref(false);
const currentTime = ref();
const customerDetails = ref();
const documentPath = ref("");
const projectPath = ref("");
const commentPath = ref("");
const mediaPath = ref("");
const totalMessages = ref(0);
const page = ref(1);
const messageLimit = ref(25);
const snapshotListener = ref(null);
const initalUser = ref(null);
const users = ref([]);
const unreadMessages = computed(() => {
    return  getters["users/myCounts"]?.data?.[`${props.taskId ? "task" : "project"}_${projectData.value._id}${props.taskId ? `_${props.sprintId}_${props.taskId}` : ``}_comments`] || 0
})
const userCommentCount = computed(() => {
    return  getters["users/myCounts"]?.data || {}
})
const adminUsers = computed(() => getters["settings/companyUsers"].filter((x) => x.roleType === 2)?.map((x) => x._id) )
const companyUser = ref(getters['settings/companyUserDetail']);
const messageAllowed = computed(() => {
    if(props.mainChat && !projectData.value?.default && !props.sendMessageAllowed) {
        let allowed = false;
        let userRole= [1,2,7]
        if (userRole.includes(companyUser?.value?.roleType)) {
            allowed = true
        }

        return allowed;
    } else {
        return true;
    }
})
const popupDate = ref(0);
const resetUnread = ref(false);

const mentionRegex = ref(/@\[[\w ]+?\]\(\w{4,30}\)/gi)

onMounted(() => {
    initialize();
})

watch(route, (newVal) => {
    if(newVal.hash) {
        highlightMessage({_id: newVal.hash.replace("#", "")})
    }
})

watch(projectData, (newProj, oldProj) => {
    if(newProj._id !== oldProj._id) {
        initialize();
    }
})

watch([() => props.sprintId, () => props.taskId], ([newSprint, newTask], [oldSprint, oldTask]) => {
    if(newSprint !== oldSprint || newTask !== oldTask) {
        initialize();
    }
})
async function initialize() {
    page.value = 1;
    resetUnread.value = false;
    // unreadMessages.value = 0;
    if(snapshotListener.value !== null) {
        snapshotListener.value?.return();
    }

    element.value = document.getElementById("message_container");
    element.value?.addEventListener("scroll", debounce(watchScroll, 50));

    if(!props.mainChat) {
        sprintOptions.value = [...(projectData.value?.sprintsObj ? Object.values(projectData.value.sprintsObj).filter((x) => !x.deletedStatusKey) : [])]
        if(projectData.value.sprintsfolders && Object.values(projectData.value.sprintsfolders).length) {
            Object.values(projectData.value.sprintsfolders).forEach((x) => {
                if(!x.deletedStatusKey) {
                    sprintOptions.value = [...sprintOptions.value, ...(Object.values(x?.sprintsObj || {})?.length ? Object.values(x.sprintsObj || {}).filter((y) => !y.deletedStatusKey) : [])];
                }
            })
        }
    }

    element.value?.addEventListener("click", watchClick);

    // AUTO FOCUS TEXTBOX
    nextTick(() => {
        document.getElementById("message-box")?.focus();
    })

    // ASSIGN PATHS
    if(props.taskId && props.taskId.length) {
        // TASK
        projectPath.value = `${companyId.value}/${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}`
        documentPath.value = `${companyId.value}/${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/${props.sprintId}/${props.taskId}`
        commentPath.value = `${companyId.value}/${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/${props.sprintId}/${props.taskId}/${dbCollections.COMMENTS}`
        mediaPath.value = `${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/${props.sprintId}/${props.taskId}/comments/`
    } else {
        // PROJECT
        documentPath.value = `${companyId.value}/${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}`
        commentPath.value = `${companyId.value}/${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/${dbCollections.COMMENTS}`
        mediaPath.value = `${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/comments/`
    }
    if(!props.mainChat) {
        const data = {
            collection: dbCollections.HISTORY,
            type: "find",
            data: [
                {
                    ProjectId: projectData.value?._id,
                    ...(!props.mainChat && props.taskId ? {TaskId: props.taskId} : {})
                },
                {
                    sort: {createdAt: 1},
                    limit: 1
                }
            ]
        }
        mongodbCrudOperations(data)
        .then((data) => {
            if(!data) {
                return
            }

            const history = data?.[0];

            const user = getUser(history?.UserId)

            initalUser.value = {
                name: user.Employee_Name,
                image: user.Employee_profileImage,
                createdAt: history?.createdAt
            }
        })
        .catch((error) => {
            console.error("ERROR in get history: ", error);
        })
    }

    setUsers();

    // if(props.taskId.length) {
    //     unreadMessages.value = projectData.value?.taskComments?.[`${props.sprintId}_${props.taskId}`]?.[userId.value] || 0;
    // } else {
    //     unreadMessages.value = projectData.value?.commentCounts?.[userId.value] || 0;
    // }

    if(unreadMessages.value > messageLimit.value) {
        messageLimit.value = unreadMessages.value;
    }

    getMessages();

    // SHOW DAY POPUP BLOCK
    element.value?.addEventListener("scroll", () => {
        if(messages.value.length) {
            let timed = messages.value.filter((x) => x.showDifference).map((x) => x._id);
            if(timed.length) {
                timed = timed.map((x) => ({id: x, top: document.getElementById(x)?.getBoundingClientRect().top})).filter((x) => x.top - (125 + (props.mainChat ? 0 : props.taskId ? 100 : 45)) >= 0);
                if(timed.length) {
                    let msgId = timed[0].id

                    let ind = messages.value.findIndex((x) => x._id === msgId);

                    if(ind > 0) {
                        popupDate.value = (new Date(messages.value[ind - 1].createdAt).getTime()/1000) || 0
                    } else {
                        popupDate.value = 0;
                    }
                } else {
                    popupDate.value = 0;
                }
            } else {
                popupDate.value = (new Date(messages.value[messages.value.length - 1].createdAt).getTime()/1000);
            }
        } else {
            popupDate.value = 0;
        }
    })

    if(props.mainChat) {
        const footer = document.getElementById("comment_footer")
        footer.style.width = "-webkit-fill-available"
        footer.style.width = "-moz-available"
    } else {
        const footer = document.getElementById("comment_footer")
        footer.style.width = footer.parentNode.clientWidth-1+"px"
    }


    // GET CUSTOMER DETAILS FOR SUPPORT
    if(props.productData?.customerId) {
        customerDetails.value = await cutomerDetails(props.productData.customerId)
    }
}
onBeforeUnmount(() => {
    element.value.removeEventListener("scroll", debounce(watchScroll, 50));
    element.value.removeEventListener("click", watchClick);

    // DETACH
    if(snapshotListener.value !== null) {
        snapshotListener.value?.return();
    }
})

watch(clientWidth, () => {
    if(props.mainChat) {
        const footer = document.getElementById("comment_footer")
        footer.style.width = "-webkit-fill-available"
        footer.style.width = "-moz-available"
    } else {
        const footer = document.getElementById("comment_footer")
        footer.style.width = footer.parentNode.clientWidth-1+"px"
    }
})

watch(() => props.userIds, () => {
    setUsers();
})
function setUsers() {
    let tmp = [];
    if(props.mainChat) {
        if(!projectData.value?.default) {
            tmp = Array.from(new Set([...(props.userIds || [])]))
        } else {
            tmp = Array.from(new Set([...props.userIds]))
        }
    } else {
        if(props.taskId) {
            tmp = Array.from(new Set([companyOwner.value.userId, ...adminUsers.value, ...props.userIds || {}]))
        } else {
            tmp = Array.from(new Set([companyOwner.value.userId, ...adminUsers.value, ...(props.userIds || [])]))
        }
    }
    tmp = tmp?.filter((x) => x);
    users.value = tmp.map((x) => {
        const user = getUser(x);
        return {
            name: user.Employee_Name,
            image: user.Employee_profileImage,
            id: user.id
        }
    })
}

watch(projectData, (val) => {
    if(props.taskId.length) {
        // unreadMessages.value = val?.taskComments?.[`${props.sprintId}_${props.taskId}`]?.[userId.value];

        if(val.taskComments?.[`${props.sprintId}_${props.taskId}`]?.[userId.value] > 0 && resetUnread.value === true) {
            updateCount(true, 0);
        }
    } else {
        // unreadMessages.value = val?.commentCounts?.[userId.value] || 0;
        if(unreadMessages.value > 0 && resetUnread.value === true) {
            updateCount(true, 0);
        }
    }

    if(!props.mainChat) {
        sprintOptions.value = [...(val?.sprintsObj ? Object.values(val.sprintsObj).filter((x) => !x.deletedStatusKey) : [])]
        if(val.sprintsfolders && Object.values(val.sprintsfolders).length) {
            Object.values(val.sprintsfolders).forEach((x) => {
                if(!x.deletedStatusKey) {
                    sprintOptions.value = [...sprintOptions.value, ...(Object.values(x?.sprintsObj || {})?.length ? Object.values(x.sprintsObj || {}).filter((y) => !y.deletedStatusKey) : [])];
                }
            })
        }
    }
})

function watchScroll(e) {
    if(e.target.scrollTop < (e.target.scrollHeight - e.target.offsetHeight - 500)) {
        showScrollBotton.value = true;
    } else {
        showScrollBotton.value = false;
    }

    if(e.target.scrollTop < 400 && e.target.scrollTop > 0) {
        getPaginatedMessages();
    }
}

function watchClick(e) {
    if(unreadMessages.value && document.hasFocus()) {
        e.preventDefault();

        if(e.target === document.getElementById("mark_as_unread")) {
            return;
        }
        resetUnread.value = true;
        updateCount(true, 0);
    }
}

function scrollBottom(){
    setTimeout(() => {
        element.value.scrollTo({top: element.value.scrollHeight, left: 0, behavior: "smooth"});
    }, 300)
}

function resetMessage() {
    message.value = {
        reply:{},
        replyMessageId:"",
        message:"",
        mediaURL: undefined,
        mediaName: undefined,
        mediaSize: undefined,
    }
}

function pinMessage(message) {
    try {
        let pinValue = message?.pinnedMessage === undefined ? true : !message?.pinnedMessage;

        const data = {
            collection: dbCollections.COMMENTS,
            type: "updateOne",
            data: [
                {
                    _id: BSON.ObjectId(message._id)
                },
                {
                    $set: {pinnedMessage: pinValue}
                }
            ]
        }
        mongodbCrudOperations(data)
        .then(() => {
            message.pinnedMessage = pinValue;
            $toast.success(`Message ${pinValue ? 'pinned' : 'unpinned'} successfully`, {position: "top-right"});
        })
        .catch((error) => {
            console.error("ERROR in pin message: ", error);
        })
    } catch (e) {
        console.error("ERROR in pin message: ", e);
    }
}

function editMessage(msg) {
    message.value = JSON.parse(JSON.stringify({...msg, reply: {}}));

    document.getElementById("message-box")?.focus();
}

function replyMessage(msg) {
    message.value.reply = JSON.parse(JSON.stringify(msg));

    document.getElementById("message-box")?.focus();
}

function copyMessage(message) {
    $toast.success(`Message copied`, {position: "top-right"});
    navigator.clipboard.writeText(message);
}

function sendRecord(data) {
    checkMedia([data.file.data]);
}

function addToCheckList(msg) {

    const name = msg.trim();
    if(!name || !name.length) {
        $toast.error("Item cannot be empty", {position: "top-right"});
        return;
    } else if(name.length > 250) {
        $toast.error("Maximum 250 characters are allowed", {position: "top-right"});
        return;
    }

    let uniqueId = makeUniqueId(6);
    let updateObj = [
        {
            AssigneeUserId: [],
            id: uniqueId,
            name: "Checklist",
            isChecked: false,
            isExpand: false
        }
    ]

    const strArray = name.split('\n');

    strArray.forEach((x) => {
        if(x?.trim()?.length) {
            updateObj.push({
                AssigneeUserId: [],
                isChecked: false,
                parentId: uniqueId,
                name: x,
                id: makeUniqueId(6)
            })
        }
    })

    let promises = [];
    updateObj.forEach((x) => {
        promises.push(
            new Promise((resolve, reject) => {
                try {
                    const data = {
                        collection: props.taskId ? dbCollections.TASKS : dbCollections.PROJECTS,
                        type: "updateOne",
                        data: [
                            {
                                _id: BSON.ObjectId(props.taskId ? props.taskId : projectData.value._id)
                            },
                            {
                                $push: {
                                    checklistArray: x
                                }
                            }
                        ]
                    }
                    mongodbCrudOperations(data)
                    .then(() => {
                        resolve();
                        if(x.parentId){
                            const user = getUser(userId.value)
    
                            const userData = {
                                id: user.id,
                                Employee_Name: user.Employee_Name,
                                companyOwnerId: companyOwner.value.userId,
                            }
                            let historyObj = {
                                key : props.taskId ? "Task_Comment" : "Project_Comment",
                                message : `<b>${userData.Employee_Name}</b> has added <b>${x.name}</b> checklist from <b>(${projectData.value.ProjectName} ${props.folderName ? '/' + props.folderName : ''}${props.sprintName ? '/' + props.sprintName : ''}${props.taskId ? '/' + props.title : ''})</b> ${props.taskId ? 'task' : 'project'}.`
                            }
                            apiRequest("post", env.HANDLE_HISTORY, {
                                "type": props.taskId ? 'task':'project',
                                "companyId": companyId.value,
                                "projectId": projectData.value._id,
                                "taskId": props.taskId ? props.taskId : null,
                                "object": historyObj,
                                "userData": userData
                            })
                        }
                    })
                    .catch((error) => {
                        reject(error)
                    })
                } catch (error) {
                    reject(error)
                }
            })
        )
    })

    Promise.allSettled(promises)
    .then(() => {
        $toast.success("Item added to checklist", {position: 'top-right'})
    })
    .catch((error) => {
        $toast.error("Someting went wrong", {position: 'top-right'})
        console.error("ERROR in add to checklist: ", error);
    })
}

function deleteMessage(message) {
    const data = {
        collection: dbCollections.COMMENTS,
        type: "updateOne",
        data: [
            {
                _id: BSON.ObjectId(message._id)
            },
            {
                $set: {isDeleted: true}
            }
        ]
    }
    mongodbCrudOperations(data)
    .then(() => {
        if(message.type !== 'text' && message.type !== 'link') {
            deleteFromWasabi(message.mediaURL, companyId.value)
            .catch((error) => {
                console.error("ERROR in remove media from storage: ", error);
            })
        }
    })
    .catch((error) => {
        console.error("ERROR in delete comment: ", error);
    })
}

function resetTaskData() {
    Object.values(formData.value).forEach((item) => {
        item.value = "";
        item.error = "";
    })
}
function saveTask() {
    return new Promise((resolve, reject) => {
        try {
            checkAllFields(formData.value)
            .then((valid) => {
                if(valid) {
                    if(formData.value.taskName.value.trim().length < 3 || formData.value.taskName.value.trim().length > 250) return;

                    const name = formData.value.taskName.value.trim();
                    formData.value.taskName.value = "";
                    formData.value.taskName.error = "";

                    const user = getUser(userId.value)

                    const userData = {
                        id: user.id,
                        Employee_Name: user.Employee_Name,
                        companyOwnerId: companyOwner.value.userId,
                    }

                    let sprintObj = {
                        id: formData.value.selectedSprint.value.id,
                        name: formData.value.selectedSprint.value.name,
                        value: formData.value.selectedSprint.value.value
                    }

                    if(formData.value.selectedSprint.value.folderId) {
                        sprintObj.folderId = formData.value.selectedSprint.value.folderId;
                        sprintObj.folderName = formData.value.selectedSprint.value.folderName;
                    }

                    let status = projectData.value.taskStatusData.find((x) => x.type === "default_active");

                    const obj = {
                        'TaskName': name,
                        'TaskKey': '--',
                        'AssigneeUserId': props.mainChat ? [userId.value, props.taskId] : [],
                        'watchers': [userId.value, props.taskId],
                        'DueDate': "",
                        'dueDateDeadLine': [],
                        'TaskType': formData.value.selectedType.value.value,
                        'TaskTypeKey': formData.value.selectedType.value.key,
                        'ParentTaskId': "",
                        'ProjectID': projectData.value._id,
                        'CompanyId': companyId.value,
                        'status': {
                            "text": status.name,
                            "key": status.key,
                            "value": status.value,
                            'type': status.type
                        },
                        'isParentTask': true,
                        'Task_Leader': userId.value,
                        'sprintArray': sprintObj,
                        'Task_Priority': "MEDIUM",
                        'deletedStatusKey': 0,
                        'sprintId': formData.value.selectedSprint.value.id,
                        'statusType': status.type,
                        'statusKey': status.key
                    }

                    if(props.mainChat) {
                        obj.mainChat = true;
                    }

                    const project = {
                        id: projectData.value._id,
                        CompanyId: companyId.value,
                        lastTaskId: projectData.value.lastTaskId || 0,
                        ProjectName: projectData.value.ProjectName,
                        ProjectCode: projectData.value.ProjectCode || ""
                    }
                    const indexObj = {
                        indexName : "groupByStatusIndex",
                        searchKey : "statusKey",
                        searchValue : "1"
                    }
                    taskClass.create({data: obj, user: userData, projectData: project ,indexObj})
                    .then((res) => {
                        if(!props.mainChat) {
                            $toast.success("Task created successfully.",{position: 'top-right'});
                        }
                        resolve(res.id);
                    })
                    .catch((error) => {
                        console.error("ERROR in create task: ", error);
                        reject(error)
                    })
                    createTask.value = false
                    resetTaskData();
                }
            })
            .catch((error) => {
                console.error("ERROR in check validation: ", error);
            })
        } catch (error) {
            reject(error);
        }
    })
}
/* --------------- GET/HANDLE MESSAGES --------------- */
function getMessages() {
    messages.value = [];
    totalMessages.value = 0;
    currentTime.value = new Date().setHours(new Date().getHours() - 1)

    const query = {
        subCollection: dbCollections.COMMENTS,
        watchFilter: {
            filter: {
                $or: [
                    {
                        'operationType': 'delete'
                    },
                    {
                        'operationType': { $in: ['insert', 'update', 'replace'] },
                        'fullDocument.createdAt': {
                            $gte: new Date(currentTime.value),
                        },
                        'fullDocument.projectId': BSON.ObjectId(projectData.value._id),
                        ...(props.sprintId ? {'fullDocument.sprintId': BSON.ObjectId(props.sprintId)} : ''),
                        ...(!projectData.value?.default && props.mainChat ? {'fullDocument.taskId':"default"} : props.taskId ? {'fullDocument.taskId': BSON.ObjectId(props.taskId)} : {"fullDocument.project": true})
                    }
                ]
            }
        }
    };

    if(props.mainChat && projectData.value?.default && props.newChat) return;
    mongodbSnapshot(query, ({error, data, snap, type}) => {
        if(error) {
            console.error("ERROR: ", error);
        } else {
            if(!snapshotListener.value) {
                snapshotListener.value = snap;
            }

            if (type === "insert") {
                let docData = data.fullDocument;

                let type = "";
                let name = "";

                if(docData.mediaURL && docData.mediaURL.length) {
                    type = docData.type;
                    name = docData.mediaName;
                }

                let ind = messages.value.findIndex((x) => (x.isSending && x.type === type && x.mediaName === name));

                if(ind > -1){
                    messages.value[ind] = {...docData, sent: docData.userId === userId.value};
                } else {
                    totalMessages.value += 1;
                    let obj = {...docData, sent: docData.userId === userId.value};
                    if(messages.value.length > 1 && obj.createdAt !== undefined && new Date(obj.createdAt).setHours(0,0,0,0) !== new Date(messages.value[messages.value.length-1].createdAt).setHours(0,0,0,0)) {
                        obj.showDifference= true;
                    }
                    messages.value.push(obj);
                }
            } else if(type === "update" || type === "replace") {
                let docData = data.fullDocument;

                let index = messages.value.findIndex((x) => x._id === docData._id);
                if(index > -1) {
                    messages.value[index] = {...docData, sent: docData.userId === userId.value};
                } else {
                    let obj = {...docData, sent: docData.userId === userId.value};
                    if(messages.value.length > 1 && obj.createdAt !== undefined && new Date(obj.createdAt).setHours(0,0,0,0) !== new Date(messages.value[messages.value.length-1].createdAt).setHours(0,0,0,0)) {
                        obj.showDifference= true;
                    }
                    messages.value.push(obj);
                }
            }


            // HANDLE MESSAGE
            messages.value.forEach((x) => {
                if(x.type === 'text' || x.type === 'link') {
                    x.overflow=x.message.length > 465
                } else {
                    x.overflow=x.message.length > 100
                }
            })

            if(messages.value.length) {
                messages.value.sort((book1, book2) => {
                    return compareObjects(book1, book2, 'createdAt')
                });

                if(messages.value.length < messageLimit.value) {
                    if(messageLimit.value - messages.value.length > 25) {
                        messageLimit.value = messageLimit.value - messages.value.length;
                    } else {
                        messageLimit.value = 25;
                    }

                    getPaginatedMessages()
                    .then(() => {
                        if(!resetUnread.value && unreadMessages.value && messages.value.length >= unreadMessages.value) {
                            nextTick(() => {
                                let ele = document.getElementById(messages.value[(messages.value.length) - unreadMessages.value]?._id)
                                if(ele) {
                                    ele.scrollIntoView();
                                }
                            })
                        } else {
                            nextTick(() => {
                                scrollBottom();
                            })
                        }
                    })
                    .catch((error) => {
                        console.error("ERROR in get message from mongo: ", error);
                    })
                } else {
                    if(messageLimit.value != 25) {
                        messageLimit.value = 25;
                    }

                    getReplyReferenceMessage();
                    if(!resetUnread.value && unreadMessages.value && messages.value.length >= unreadMessages.value) {
                        nextTick(() => {
                            let ele = document.getElementById(messages.value[(messages.value.length) - unreadMessages.value]?._id)
                            if(ele) {
                                ele.scrollIntoView();
                            }
                        })
                    } else {
                        nextTick(() => {
                            scrollBottom();
                        })
                    }
                }
            } else {
                getPaginatedMessages()
                .then(() => {
                    if(!resetUnread.value && unreadMessages.value && messages.value.length >= unreadMessages.value) {
                        nextTick(() => {
                            let ele = document.getElementById(messages.value[(messages.value.length) - unreadMessages.value]?._id)
                            if(ele) {
                                ele.scrollIntoView();
                            }
                        })
                    } else {
                        nextTick(() => {
                            scrollBottom();
                        })
                    }
                })
                .catch((error) => {
                    console.error("ERROR in get message from mongo: ", error);
                })
            }
        }
    })
}

function getPaginatedMessages(...args) {
    let findData;

    if(args.length === 1) {
        findData = args[0];
    }

    return new Promise((resolve, reject) => {
        try {
            let query = {
                type: "aggregate",
                collection: dbCollections.COMMENTS,
                data: [
                    [
                        {
                            $match: {
                                'projectId': BSON.ObjectId(projectData.value._id),
                                ...(props.sprintId ? {'sprintId': BSON.ObjectId(props.sprintId)} : ''),
                                ...(!projectData.value?.default && props.mainChat ? {'taskId':"default"} : props.taskId ? {'taskId': BSON.ObjectId(props.taskId)} : {'project': true}),
                            }
                        },
                        {
                            $sort: {"createdAt": -1, _id:1}
                        },
                        {
                            $skip: totalMessages.value
                        },
                        {
                            $limit: messageLimit.value
                        }
                    ]
                ]
            }

            mongodbCrudOperations(query)
            .then((data) => {
                if(!data.length) {
                    if(messages.value.length && !messages.value[0].showDifference) {
                        messages.value[0] = {...messages.value[0], showDifference: true};
                    }
                    getReplyReferenceMessage();
                    resolve("No data");
                    return;
                }

                data.forEach((data) => {
                    const docData = data;

                    if(messages.value.findIndex(x => x._id === docData._id) === -1) {
                        if(messages.value[0] && !messages.value[0].showDifference && new Date(docData.createdAt).setHours(0,0,0,0) !== new Date(messages.value[0].createdAt).setHours(0,0,0,0)) {
                            messages.value[0] = {...messages.value[0], showDifference: true};
                        }

                        messages.value.unshift({
                            ...docData,
                            sent: docData.userId === userId.value,
                            createdAt: docData.createdAt,
                            updatedAt: docData.updatedAt
                        });
                    }
                })

                totalMessages.value += data?.length;

                if(data.length < messageLimit.value) {
                    messages.value[0].showDifference = true;
                }

                if(findData) {
                    if(messages.value.filter((x) => x._id === findData._id).length) {
                        setTimeout(() => {
                            document.getElementById(findData._id).scrollIntoView({behavior: 'smooth'});
                            highlightMessage(findData);
                        }, 200)
                    } else {
                        getPaginatedMessages(findData);
                    }
                }

                messages.value.forEach((x) => {
                    if(x.type === 'text' || x.type === 'link') {
                        x.overflow=x.message.length > 465
                    } else {
                        x.overflow=x.message.length > 100
                    }
                })

                if(!resetUnread.value && unreadMessages.value && messages.value.length >= unreadMessages.value) {
                    nextTick(() => {
                        let ele = document.getElementById(messages.value[(messages.value.length) - unreadMessages.value]?._id)
                        if(ele) {
                            ele.scrollIntoView();
                        }
                    })
                }

                getReplyReferenceMessage();
                resolve("Data fetched successfully!");
            })
            .catch((error) => {
                console.error("ERROR in get message from mongo: ", error);
            })
        } catch(error) {
            reject({message: "ERROR TRY-CATCH in get data from mongo: " + error.message, error: error});
        }
    })
}

function highlightMessage(data) {
    let element = document.getElementById(data._id);

    if(element !== undefined && element !== null) {
        element.classList.toggle("highlighted-message");
        element.scrollIntoView({behavior: 'smooth'});

        setTimeout(()=>{
            element.classList.toggle("highlighted-message");
        }, 2000)
    } else {
        getPaginatedMessages(data).catch((error) => {
            console.error("ERROR in get message on ref: ", error);
        });
    }
}

function getReplyReferenceMessage() {
    messages.value.filter((x) => x.hasReply && x.reply === undefined).forEach((message) => {
        let obj = {};
        Object.keys(message).filter(key => key.includes("reply_")).forEach((key) => {
            obj[key.replace("reply_", "")] = message[key]
        })
        message.reply = obj;
    })
}
/* --------------- GET/HANDLE MESSAGES END --------------- */

/* --------------- SEND MESSAGES --------------- */
function uploadToStorage(file) {
    return new Promise((resolve, reject) => {
        try {
            const randomNumber = parseInt(Date.now() * Math.random());
            const name = randomNumber + "_" + file.mediaOriginalName.replaceAll(" ", "_");
            let path = ``
            if(props.taskId) {
                path = `Project/${projectData.value._id}/${props.sprintId}/${props.taskId}/Comments/${name}`
            } else {
                path = `Project/${projectData.value._id}/Comments/${name}`
            }

            uploadToWasabi(file.data, path, companyId.value)
            .then((URL) => {
                let msg = {...message.value};
                msg.mediaURL= URL;
                msg.mediaName= file.name;
                msg.mediaOriginalName= file.mediaOriginalName;
                msg.mediaSize= file.data.size;
                msg.type = file.fileType;
                sendMessageFun({
                    ...msg
                })
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                    console.error("ERROR in send file: ", error);
                })
            })
            .catch((error) => {
                console.error("ERROR: ", error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

function checkMedia(data) {
    if(checkBucketStorage(data.map(file => file?.size),{gettersVal: getters}) !== true){
        return;
    }
    if(mediaFiles.value.length + data.length > 10) {
        $toast.error("Maximum 10 files can be uploaded at once", {position: "top-right"});
    }
    checkFile(data, fileExtentions.value)
    .then((files) => {
        files.forEach((file) => {
            let fileName = `${makeUniqueId()}_${file.name}`;
            renderFiles({data: file.data, name: fileName, mediaOriginalName: file.name, fileType: file.fileType}, userId.value)
            .then((result) => {
                if(mediaFiles.value.length < 10) {
                    mediaFiles.value.push({...result, file: file, message: ""});
                }
            })
            .catch((error) => {
                console.error("ERROR in render file: ", error);
            })
        })
    })
    .catch((error) => {
        console.error("ERROR in send file: ", error);
    })
}

async function sendMedia() {
    if(createInProgress.value) {
        messageQueue.value = [...messageQueue.value, ...mediaFiles.value];
        return;
    }
    if(props.newChat && !newMainChat.value) {
        messageQueue.value = [...messageQueue.value, ...mediaFiles.value];

        let success = await createTaskForMainChat()
        .then(() => {
            return true;
        })
        .catch((error) => {
            console.error("ERROR: ", error);
            return false;
        })

        if(!success) {
            return Promise.reject(new Error("Failed to create"));
        }
    }
    return new Promise((resolve, reject) => {
        try {
            scrollBottom();
            let promises = [];
            let tmpMessage = JSON.parse(JSON.stringify(message.value));
            message.value.message = "";
            mediaFiles.value.forEach((media) => {
                media.createdAt = new Date();
                media.updatedAt = media.createdAt;
                messages.value.push({...media});
                promises.push(
                    new Promise((resolve2, reject2) => {
                        try {
                            uploadToStorage({data: media.file.data, name: media.mediaName, mediaOriginalName: media.mediaOriginalName, fileType: media.type})
                            .then(() => {
                                resolve2()
                            })
                            .catch((error) => {
                                reject2(error);
                            })
                        } catch (error) {
                            reject2(error);
                        }
                    })
                )
            });

            Promise.allSettled(promises)
            .then(() => {
                sendMessageFun(tmpMessage);
                resolve(true);
            })
            .catch((error) => {
                console.error("ERROR: ", error);
                reject(error);
            })
            mediaFiles.value = [];
        } catch (error) {
            reject(error);
        }
    })
}

function checkMentions(message){
    let msg = message;

    let mentions = [];
    let tmpMentions = msg.match(mentionRegex.value);

    if(tmpMentions !== null) {
        tmpMentions.forEach((data) => {
            let id = data.split("(")[1].replace(")", "");
            let msgName = data.split("(")[0].replace("[", "").replace("]", "");
            const user = users.value.filter((x) => x.id === id)[0];
            if(`@${user.name}` === msgName) {
                mentions.push(user.id)
                msg = msg.replace(data, `@[${user.name}](${user.id})`);
            }
        })
    }
    mentions = Array.from(new Set(mentions));
    return {mentions, msg};
}

function updateCount(reset = false, count = 0, otherUsers = []) {
    let taskId = props.taskId;
    if(props.newChat) {
        taskId = newMainChat.value;
    }

    if(reset) {
        if(!document.hasFocus()) return;

        let axiosData = {
            companyId : companyId.value,
            projectId: projectData.value._id,
            userIds: [userId.value],
            "set": true,
            key: taskId ? 2 : 1,
            ...(taskId ? {taskId} : {}),
            ...(props.sprintId ? {sprintId: props.sprintId} : {}),
            messageCount: count,
            prevCount: unreadMessages.value
        }

        if(props.parentTaskId) {
            axiosData.parentTaskId = props.parentTaskId;
        }
        apiRequest("post", env.UPDATE_UNREADREAD_COMMENTS_COUNT, axiosData).then(() => {
            if(axiosData.messageCount === 0){
                let sprintFieldName =  `sprint_${projectData.value._id}_${props.sprintId}_comments`
                let taskFieldName = `task_${projectData.value._id}${ `_${props.sprintId}_${props.taskId}`}_comments`;
                let parentTaskField = ''
                if(props.parentTaskId) {
                    parentTaskField = `parentTask_${projectData.value._id}${`_${props.sprintId}_${props.parentTaskId}`}_comments`;
                }

                userCommentCount.value[sprintFieldName] = (userCommentCount.value?.[sprintFieldName] || 0) - axiosData.prevCount;
                userCommentCount.value[taskFieldName] =  axiosData.messageCount;
                if(parentTaskField){
                    userCommentCount.value[parentTaskField] =  (userCommentCount.value?.[parentTaskField] || 0) - axiosData.prevCount;
                }

                // REMOVE KEY IF COUNT <= 0 for local update
                if(userCommentCount.value[sprintFieldName] <= 0) {
                    delete userCommentCount.value?.[sprintFieldName];
                }
                if(userCommentCount.value[taskFieldName] <= 0) {
                    delete userCommentCount.value?.[taskFieldName];
                }
                if(parentTaskField && userCommentCount.value?.[parentTaskField] <= 0) {
                    delete userCommentCount.value?.[parentTaskField];
                }
                commit("users/mutateCounts", {data: {...userCommentCount.value} || {}});
            }
        })
        .catch((error) => {
            console.error(error,"ERROR");
        })
    } else {
        let userArr = Array.from(new Set([...(props?.watchers || []), ...otherUsers]));

        userArr = filterUsers(userArr);
        userArr = userArr.filter(x => x && x !== userId.value);

        if(!taskId.length) {
            let axiosData = {
                companyId : companyId.value,
                key : 1,
                projectId: projectData.value._id,
                userIds: userArr
            }
            apiRequest("post", env.UPDATE_UNREADREAD_COMMENTS_COUNT, axiosData).catch((error) => {
                console.error(error,"ERROR");
            })
        } else {
            let axiosData = {
                companyId : companyId.value,
                key : 2,
                projectId: projectData.value._id,
                userIds: userArr,
                taskId: taskId,
                sprintId: props.sprintId,
                prevCount: unreadMessages.value
            }

            if(props.parentTaskId) {
                axiosData.parentTaskId = props.parentTaskId;
            }

            apiRequest("post", env.UPDATE_UNREADREAD_COMMENTS_COUNT, axiosData).catch((error) => {
                console.error(error,"ERROR");
            })
        }
    }
}

function performMessageQueue() {
    if(!messageQueue.value.length) return Promise.reject(new Error("No message queue"));
    let count = 0;
    const tmp = messageQueue.value;
    let result = [];

    const next = () => {
        count++;
        loop(tmp[count]);
    }

    const loop = (message) => {
        if(count >= tmp.length) {
            if(props.newChat) {
                router.push({name: `chat_project_channel`, params: {...route.params, sid: newMainChat.value}})
            }
            return Promise.resolve(result);
        }

        try {
            if(!message.type?.length) {
                sendMessageFun(message)
                .then(() => {
                    result.push({status: true, data: message, type: "text/link"})
                    next();
                })
                .catch((error) => {
                    result.push({status: false, data: message, error})
                    next();
                })
            } else {
                mediaFiles.value = [message]
                sendMedia()
                .then(() => {
                    result.push({status: true, data: message, type: "media"})
                    next();
                })
                .catch((error) => {
                    result.push({status: false, data: message, error})
                    next();
                })
            }
        } catch (error) {
            result.push({status: false, data: message, error})
            next();
        }
    }
    loop(tmp[count]);
}

function createTaskForMainChat() {
    return new Promise((resolve, reject) => {
        try {
            if(createInProgress.value) return;
            createInProgress.value = true;

            formData.value.taskName.value = "Chat";
            formData.value.selectedSprint.value = Object.values(projectData.value?.sprintsObj)?.[0];
            formData.value.selectedType.value = projectData.value?.taskTypeCounts?.[0];
            delete formData.value.selectedSprint.value.AssigneeUserId;
            delete formData.value.selectedSprint.value.favorites;

            saveTask()
            .then((docId) => {
                newMainChat.value = docId;
                commentPath.value = `${companyId.value}/${companyId.value}/${dbCollections.MAIN_CHATS}/${projectData.value?._id}/${props.sprintId}/${docId}/${dbCollections.COMMENTS}`;
                documentPath.value = `${companyId.value}/${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/${props.sprintId}/${docId}`
                mediaPath.value = `${companyId.value}/${props.mainChat ? dbCollections.MAIN_CHATS : dbCollections.PROJECTS}/${projectData.value._id}/${props.sprintId}/${docId}/comments/`

                if(props.mainChat && projectData.value?.default) {
                    nextTick(() => {
                        router.push({...route, params: {...route.params, sid: docId}})
                    })
                    getMessages();
                }
                resolve(docId);
                createInProgress.value = false;

                if(messageQueue.value.length) {
                    performMessageQueue();
                }
            })
            .catch((error) => {
                console.error("ERROR in create task: ", error);
                reject(error);
                createInProgress.value = false;
            });
        } catch (error) {
            reject(error);
            createInProgress.value = false;
        }
    })
}

function filterUsers(users = null) {
    if(!users) return [];

    let projectWatchersFilter = [];

    Object.keys(projectData.value?.watchers || {}).forEach((key) => {
        if(projectData.value?.watchers?.[key] === "all_activity") {
            projectWatchersFilter.push(key)
        }
    })

    users.forEach((uid) => {
        const ignore = projectData.value?.watchers?.[uid] === "ignore";
        if(!ignore) {
            projectWatchersFilter.push(uid);
        }
    })

    return projectWatchersFilter;
}

function sendNotification(messageData, otherUsers = []) {
    let receivers = Array.from(new Set([...(props?.watchers || []), ...otherUsers]));

    receivers = filterUsers(receivers);
    receivers = receivers?.filter((x) => x !== userId.value) || [];

    let redirection = window.location.href;

    if(!props.mainChat) {
        let str = `${window.location.origin}/#/${companyId.value}/project/${projectData.value._id}`;
        if(props.taskId) {
            if(props.folderId) {
                str += `/fs/${props.folderId}/${props.sprintId}`;
            } else {
                str += `/s/${props.sprintId}`;
            }
            str += `/${props.taskId}?detailTab=comment`;
        } else {
            str += `/p?tab=Comments`;
        }

        redirection = str;
    }

    // UPDATE COUNTS OF MENTIONS
    let mentionCounts = {
        companyId : companyId.value,
        key : 4,
        userIds: receivers,
        readAll: false
    }
    apiRequest("post", env.UPDATE_UNREADREAD_COMMENTS_COUNT, mentionCounts).catch((error) => {
        console.error(error,"ERROR");
    })

    let msg = messageData?.message ? changeText(messageData?.message, '', '') : messageData?.message
    const axiosData = {
        users: receivers,
        message: msg ? msg : messageData?.mediaName,
        title: props.title,
        redirection
    }
    // CALL THE v2 ENDPOINT from DHrupal 
    axios.post(`${process.env.VUE_APP_APIURL}${env.PUSH_NOTIFICATION}`, axiosData)
    .catch((error) => {
        console.error("ERROR in send notification: ", error);
    })
}

function updateLastMessageTime(msgObj = {}) {
    const obj = JSON.parse(JSON.stringify(msgObj))
    if(!props.mainChat || !projectData.value.default) return;
    let updateQuery = {
        collection: dbCollections.TASKS,
        type: "updateOne",
        data: [
            {
                _id: BSON.ObjectId(obj.taskId)
            },
            {
                $set: {
                    lastMessage: new Date(),
                    ...(Object.keys(msgObj || {}).length ? ["text", "link"].includes(msgObj.type) ? {message: msgObj.message} : {message: msgObj.mediaOriginalName} : {})
                }
            }
        ]
    }

    mongodbCrudOperations(updateQuery)
    .catch((error) => {
        console.error("ERROR: ", error);
    })
}

async function sendMessageFun(messageData) {
    if (!messageAllowed.value) {
        return;
    }
    resetMessage();
    if(!messageData?.message?.trim()?.length && (!messageData.mediaURL || !messageData.mediaURL.length)) {
        return;
    }

    if(createInProgress.value) {
        messageQueue.value.push(messageData);
        return;
    }
    if(props.newChat && !newMainChat.value) {
        messageQueue.value.push(messageData);
        await createTaskForMainChat()
        .then(() => {
            return true;
        })
        .catch((error) => {
            console.error("ERROR: ", error);
            return false;
        })

        // if(!success) {
        return;
        // }
    }

    return new Promise((resolve, reject) => {
        try {
            messageData.message = messageData.message.trim();

            let link = null;
            if(messageData.message.length) {
                link = checkLink(messageData.message);

                if(link !== null) {
                    messageData.type = "link";
                }
            }

            let edited = messageData._id !== undefined && messageData.createdAt !== undefined;

            messageData.userId= userId.value;

            bakeMessage({messageData, edited})
            .then((messageObj) => {
                if(messageObj.type === "text" || messageObj.type === "link") {
                    let {mentions, msg} = checkMentions(messageObj.message)

                    if(mentions.length) {
                        messageObj.mentionIds = mentions;
                        messageObj.message = msg;
                    }
                }

                messageObj.projectId = BSON.ObjectId(projectData.value._id);
                messageObj.project = true;
                if(newMainChat.value) {
                    messageObj.taskId = BSON.ObjectId(newMainChat.value);
                    messageObj.sprintId = BSON.ObjectId(props.sprintId);
                    messageObj.project = false;
                } else if(props.taskId.length) {
                    messageObj.taskId = props.taskId === "default" ? props.taskId : BSON.ObjectId(props.taskId);
                    messageObj.sprintId = BSON.ObjectId(props.sprintId);
                    if(props.folderId){
                        messageObj.folderId = BSON.ObjectId(props.folderId);
                    }
                    messageObj.project = false;
                }

                debounce(updateLastMessageTime({...messageObj}), 500)

                sendMessage({messageData: messageObj, edited, path: commentPath.value,timeZone: getUser(messageData.userId).timeZone ? getUser(messageData.userId).timeZone : "Asia/Kolkata" })
                .then((msg) => {
                    resolve("Message Sent", msg);

                    if(props.forSupport) {
                        if(companyUser?.value?.userEmail !== process.env.VUE_APP_USEREMAIL) {
                            let subject = "Support from AlianHub"
                            const mailMessage = changeText(msg.message  || '', '', '');
                            sendMailFromMessage(customerDetails.value.userEmail, subject, mailMessage);
                        } else {
                            let subject = `Support to ${customerDetails.value?.userName || ""}`
                            const mailMessage = `Email: ${customerDetails.value?.userEmail}\nProduct: ${props.productData?.productName}\n\nMessage:\n${changeText(msg.message  || '', '', '')}`;
                            sendMailFromMessage(process.env.VUE_APP_SUPPORT_MAIL, subject, mailMessage);
                        }
                    }

                    // INITIALIZE SNAPHOT => IF NOT INITIALIZED
                    if(!snapshotListener.value) {
                        getMessages();
                    }

                    // SET COUNT TO ZERO
                    resetUnread.value = true;
                    updateCount(true, 0);

                    if(!edited) {
                        updateCount(false, 1, (msg?.mentionIds || []));
                    }

                    if(!edited && msg.mentionIds.length) {
                        let mentionsRefObj = {
                            mentionIds: msg.mentionIds,
                            type: !props.taskId.length ? "project" : "task",
                            projectId: projectData.value._id,
                            userId: userId.value,
                            notSeen: msg.mentionIds,
                            taskId: props.taskId,
                            sprintId: props.sprintId,
                            folderId: props.folderId ? props.folderId : "",
                            mainChat: props?.mainChat ? true : false
                        }

                        let keys = ["id", "type", "mediaSize", "mediaURL", "mediaName", "mediaOriginalName", "message", 'reply_id', 'reply_mediaName', 'reply_mediaOriginalName', 'reply_mediaURL', 'reply_mediaSize', 'reply_message', 'reply_type', 'reply_userId'];
                        Object.keys(msg).forEach((key) => {
                            if(keys.includes(key)) {
                                mentionsRefObj[`comment_${key}`] = msg[key];
                            }
                        })

                        const data = {
                            collection: dbCollections.MENTIONS,
                            type: "insertOne",
                            data: [
                                {
                                    ...mentionsRefObj,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                }
                            ]
                        }
                        mongodbCrudOperations(data)
                        .then(() => {
                            let axiosData = {
                                companyId : companyId.value,
                                key : 4,
                                projectId: projectData.value._id,
                                userIds: [userId.value]
                            }
                            
                            apiRequest("post", env.UPDATE_UNREADREAD_COMMENTS_COUNT, axiosData).catch((error) => {
                                console.error(error,"ERROR");
                            })
                        })
                        .catch((error) => {
                            console.error("ERROR in add mentions: ", error);
                        })
                    }

                    if(!edited) {
                        if(props.mainChat) {
                            sendNotification(msg, msg.mentionIds || []);
                        } else if(msg.mentionIds.length) {
                            sendNotification(msg, msg.mentionIds);
                        }
                    }

                    scrollBottom();
                })
                .catch((error) => {
                    console.error("ERROR in send message: ", error);
                    reject(error);
                })
            })
            .catch((error) => {
                console.error("ERROR in bake message: ", error);
                reject(error);
            })
        } catch (error) {
            console.error("ERROR in send message: ", error);
            reject(error);
        }
    })
}
/* --------------- SEND MESSAGES END --------------- */
</script>

<style>
@import './style.css';
</style>