<template>
    
    <div class="project-item-wrapper position-re mb-2px" :class="[{'opacity-5' : item?.isRestrict === true}]" id="projectleftlistsingle_driver">
        <div class="project-item cursor-pointer ml-016 border-radius-5-px hover-bg-light-gray" @click="$emit('change', item)" :class="{'bg-lighter-gray': selected,'new_project_add': new Date(item?.createdAt).getTime() > new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 2).getTime()}">
            <div class="position-ab toggle__wrappper" @click.stop="!item?.isRestrict ? $emit('toggle', item) : ''">
                <img v-if="!item?.deletedStatusKey" src="@/assets/images/svg/triangleBlack.svg" alt="" class="vertical-middle"  :style="`transform: rotateZ(${item.isExpanded ? '90' : '0'}deg)`">
            </div>
            <div class="item-left">
                <Spinner :isSpinner="spinner" class="position-re item-spinner"/>
                <template v-if="!editName">
                    <img :src="favourite ? filledStar : blankStar" alt="favourite star" class="ml-6px"  @click.stop="markProjectFavourite">
                    <span v-if="item.projectIcon && item.projectIcon.type === 'color'" class="d-flex align-items-center justify-content-center inital-box ml-6px" :style="[{'background-color': item.projectIcon.data}]">{{ item.ProjectName.charAt(0).toUpperCase()}}</span>
                    <template v-else-if="item.projectIcon && item.projectIcon.type === 'image'">
                        <WasabiImage class="profile-sm-square ml-6px" v-if="!item.projectIcon.data.includes('http')" :data="{url: item.projectIcon.data, filename: item.projectIcon.data.split('/').pop(), extension: item.projectIcon.data.split('/').pop().split('.').pop()}"/>
                        <img v-else class="profile-sm-square ml-6px" :src="item.projectIcon.data" alt=""/>
                    </template>
                </template>
                <div class="d-flex flex-column text-ellipsis ml-6px w-100" v-if="!editName">
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="text-ellipsis project-sb-ptitle font-size-13 font-weight-500 mw-80" :title="item.ProjectName">
                            {{item.ProjectName}}
                        </span>
                        <div class="d-flex align-items-center lastproject__activity-wrapper">
                            <span v-if="item?.lastProjectActivity && !isOpened" class="font-size-11 project-last-activity">
                                {{getTimeAgo(item?.lastProjectActivity * 1000)}}
                            </span>
                            <DropDown :id="item.id" @isVisible="(val) => isOpened = val" :title="item.ProjectName" v-if="
                                (
                                    checkPermission('project.project_sprint_create',item.isGlobalPermission) === true
                                    || checkPermission('project.project_folder_create',item.isGlobalPermission) === true
                                    || checkPermission('project.project_name_edit',item.isGlobalPermission) === true
                                    || checkPermission('project.project_create',item.isGlobalPermission) === true
                                    || checkPermission('project.project_close',item.isGlobalPermission) === true
                                    || checkPermission('project.project_list',item.isGlobalPermission) === true
                                )
                                && (showArchivedProjects ? item.deletedStatusKey === 2 : !item.deletedStatusKey)
                            ">
                                <template #button>
                                    <img ref="butt" src="@/assets/images/svg/horizontalDots.svg" class="project__three-dot ml-6px vertical-middle" :class="{'project-option': clientWidth > 767 && !isOpened, 'project-option-mobile': clientWidth <= 767 }" alt="dots">
                                </template>
                                <template #options>
                                    <template v-if="!showArchivedProjects">
                                        <DropDownOption @click="$refs.butt.click(), createSprint = true, createFolder = false" v-if="checkPermission('project.project_sprint_create',item.isGlobalPermission) === true">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="listIcon" alt="listIcon" class="mr-10px">
                                                Create New List
                                            </div>
                                        </DropDownOption>
                                        <DropDownOption @click="$refs.butt.click(), createSprint = false, createFolder = true" v-if="checkPermission('project.project_folder_create',item.isGlobalPermission) === true">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="folderIcon" alt="folderIcon" class="mr-10px">
                                                Create New Folder
                                            </div>
                                        </DropDownOption>
                                        <DropDownOption @click="$refs.butt.click(),toggleRenameProject()" v-if="checkPermission('project.project_name_edit',item.isGlobalPermission) === true">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="editIcon" alt="editIcon" class="mr-10px">
                                                Rename
                                            </div>
                                        </DropDownOption>
                                        <DropDownOption v-if="checkPermission('project.project_create',item.isGlobalPermission) === true" @click="$refs.butt.click(), $emit('changeAvatar', {id: item.id, name: item.ProjectName, icon: item.projectIcon})">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="colorPalletIcon" alt="colorPalletIcon" class="mr-10px">
                                                Color & Avatar
                                            </div>
                                        </DropDownOption>
                                        <DropDownOption v-if="false">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="copyIcon" alt="copyIcon" class="mr-10px duplicate__icon">
                                                Duplicate
                                            </div>
                                        </DropDownOption>
                                        <DropDownOption @click="$refs.butt.click(), showSidebar = true, archive = 0" v-if="checkPermission('project.project_close',item.isGlobalPermission) === true">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="cancelIcon" alt="cancelIcon" class="mr-10px">
                                                Close Project
                                            </div>
                                        </DropDownOption>
                                        <DropDownOption v-if="checkPermission('project.project_list',item.isGlobalPermission) === true && (item.deletedStatusKey === 0 || item.deletedStatusKey === undefined)" @click="$refs.butt.click(), showSidebar = true, archive = 1">
                                            <div class="d-flex align-items-center project-mobile-desc">
                                                <img :src="inventoryIcon" alt="inventoryIcon" class="mr-10px">
                                                Archive
                                            </div>
                                        </DropDownOption>
                                    </template>
                                    <DropDownOption v-if="checkPermission('project.project_list',item.isGlobalPermission) === true && item.deletedStatusKey === 2" @click="$refs.butt.click(), updateProject(0)">
                                        <div class="d-flex align-items-center project-mobile-desc">
                                            <img :src="inventoryIcon" alt="restoreInventoryIcon" class="mr-10px">
                                            Restore
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="checkPermission('project.project_list',item.isGlobalPermission) === true" @click="$refs.butt.click(), showSidebar = true, archive = 2">
                                        <div class="d-flex align-items-center project-mobile-desc mobile-deleteIcon red">
                                            <img :src="deleteIcon" alt="deleteIcon" class="mr-10px">
                                            Delete
                                        </div>
                                    </DropDownOption>
                                </template>
                            </DropDown>
                        </div>
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="font-size-11 gray text-ellipsis">{{item.projectStatusData.find((x) => x.value === item.status)?.name}}</span>
                        <!-- <img :src="publicFolderIcon" alt="publicFolderIcon" v-if="!item.isPrivateSpace && !editName" style="margin-left: 10px;"> -->
                        <div class="d-flex align-items-center">
                            <div class="count-block parent-count-block ml-5px" v-if="showCounts({project: item, showArchived: showArchivedProjects}).count" :style="{backgroundColor: showCounts({project: item, showArchived: showArchivedProjects}).color}">
                                {{showCounts({project: item, showArchived: showArchivedProjects}).count > 99 ? "+99" : showCounts({project: item, showArchived: showArchivedProjects}).count}}
                            </div>
                            <!-- <div class="count-block parent-count-block">5</div> -->
                            <template v-if="Object.keys(item?.userActivity || {}).length">
                                <DropDown>
                                    <template #button>
                                        <img :src="Object.keys(item?.userActivity || {}).length ? clockBlue : clockGray" alt="clockBlue" class="ml-5px">
                                    </template>

                                    <template #options>
                                        <DropDownOption v-for="userActivity in Object.entries(item?.userActivity || {})" :key="userActivity">
                                            <div class="d-flex align-items-center justify-content-between w-100 user__activity">
                                                <div class="d-flex align-items-center">
                                                    <div class="mr-5px">
                                                        <UserProfile
                                                            width="30px"
                                                            :thumbnail="'30x30'"
                                                            :showDot="false"
                                                            :data="{
                                                                image: getUser(userActivity[0])?.Employee_profileImageURL,
                                                                title: getUser(userActivity[0])?.Employee_Name,
                                                                isOnline: getUser(userActivity[0])?.isOnline
                                                            }"
                                                        />
                                                    </div>
                                                    <div class="d-flex flex-column">
                                                        <div>
                                                            {{getUser(userActivity[0])?.Employee_Name}}
                                                        </div>
                                                        <div>
                                                            {{designations.find((x) => x.key === getUser(userActivity[0])?.designation)?.name}}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span v-if="userActivity[1]?.timestamp">
                                                        {{getTimeAgo(userActivity[1]?.timestamp * 1000)}}
                                                    </span>
                                                    <span v-else>Just now</span>
                                                </div>
                                            </div>
                                        </DropDownOption>
                                    </template>
                                </DropDown>
                            </template>
                            <template v-else>
                                <img :src="item?.[userId] ? clockBlue : clockGray" alt="clockBlue" class="ml-5px">
                            </template>
                            <img v-if="item?.isPrivateSpace" :src="round_clock" alt="time" title="Private project" class="ml-5px">
                            {{item?.[userId]}}
                        </div>
                    </div>
                </div>
                <div class="position-re project-input-div w-100" v-else>
                    <input
                        type="text"
                        class="form-control ml-10px project__name-input"
                        placeholder="Project Name"
                        v-model.trim="projectName.value"
                        :id="`${item.id}_input`"
                        @blur="editName = false"
                        @keypress.enter="renameProject()"
                        @keyup="checkErrors({'field':projectName,
                        'name':projectName.name,
                        'validations':projectName.rules,
                        'type':projectName.type,
                        'event':$event.event})"
                    />
                    <div class="red position-ab z-index-1 font-size-11 error__text-data">{{projectName.error}}</div>
                </div>
            </div>
        </div>
        <div v-if="createSprint || createFolder" class="d-flex align-items-center create__sprint-folder">
            <SprintFolderInput
                :createSprint="createSprint"
                :createFolder="createFolder"
                :subItems="[...(Object.values(sprintFolders) || []), ...(sprints || [])]"
                @cancel="createSprint = false, createFolder = false"
            />
        </div>
        <div v-if="item.isExpanded && !item?.deletedStatusKey && !item.isRestrict" class="ml-15px">
            <template v-if="!props.loadingData">
                <template v-if="sprintFolders && Object.keys(sprintFolders).length">
                    <template v-for="subItem in sprintFolders">
                        <SubItem
                            v-if="showArchivedProjects ? (subItem.deletedStatusKey === 2 || (Object.keys(subItem.sprintsObj).length && availableSprints(subItem.sprintsObj))) : (!subItem.deletedStatusKey)"
                            :key="subItem.folderId"
                            :data="subItem"
                            @changeProject="$emit('change', item)"
                            :folder="true"
                            :filterFavorites="filterFavorites"
                            :subItems="[...(Object.values(sprintFolders) || [])]"
                            @change="toggleSubItem($event)"
                        />
                    </template>
                </template>
                <template v-if="sprints && sprints.length">
                    <template v-for="subItem in sprints">
                        <SubItem
                            v-if="showArchivedProjects ? (subItem.deletedStatusKey === 2 || subItem.archiveTaskCount) : (!subItem.deletedStatusKey)"
                            :key="subItem.id"
                            :data="subItem"
                            :subItems="[...(sprints || [])]"
                            @changeProject="$emit('change', item)"
                        />
                    </template>
                </template>
            </template>
            <template v-else>
                <div v-for="i in 3" :key="i">
                    <div class="d-flex flex-column align-items-end">
                        <Skelaton class="border-radius-5-px m-5px h-35px w-95"/>
                        <Skelaton class="border-radius-5-px m-5px h-35px w-85"/>
                    </div>
                </div>
            </template>
            
        </div>
        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${archive === 0 ? 'Close' : archive === 1 ? 'Archive' : 'Delete'}`"
            :message="archive === 0 ? 'Type project name to confirm that you really do wish to close this project' : archive === 1 ? 'A List can be archived to hide it from view but be restored at any time. All tasks are kept and remain searchable when you archive a List.' : `This Project's tasks and templates will all be erased. Type project name to confirm that you really do wish to delete all tasks, templates, and this project.`"
            :confirmationString="`${archive === 0 ? 'close' : archive === 1 ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive === 1 ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${archive === 0 ? 'Close' : archive === 1 ? 'Archive' : 'Delete'}`"
            @confirm="updateProject()"
            :showSpinner="showSpinner"
        />
    </div>
</template>

<script setup>
// PACKAGES
import { defineEmits, defineProps, defineComponent, ref, inject, computed, nextTick, watch, onMounted } from 'vue';
import { useProjects } from "@/composable/projects"
import { useCustomComposable, useGetterFunctions, useHistoryNotification } from '@/composable';
import { useValidation } from '@/composable/Validation';
import { dbCollections } from '@/utils/FirebaseCollections';
import { useToast } from 'vue-toast-notification';
import moment from 'moment';
import { useStore } from 'vuex';
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import { BSON } from "realm-web";
import * as env from '@/config/env';
import { apiRequest } from '../../../services'

// COMPONENTS
import SubItem from '@/components/molecules/SubItem/SubItem.vue'
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import SprintFolderInput from '@/components/atom/SprintFolderInput/SprintFolderInput.vue'
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
import Spinner from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import Skelaton from '@/components/atom/Skelaton/Skelaton.vue';
// import Skelaton from '@/components/atom/Skelaton/Skelaton/.vue';

// IMAGES
const copyIcon = require("@/assets/images/copy.png");
const cancelIcon = require("@/assets/images/svg/close_project.svg");
const inventoryIcon = require("@/assets/images/svg/inventoryIcon.svg");
const deleteIcon = require("@/assets/images/svg/deleteIcon.svg");
const editIcon = require("@/assets/images/svg/rename.svg");
const filledStar = require("@/assets/images/svg/start10.svg");
const blankStar = require("@/assets/images/svg/blankStar.svg");
const listIcon = require("@/assets/images/svg/listView.svg");
const folderIcon = require("@/assets/images/svg/createFolder.svg");
const colorPalletIcon = require("@/assets/images/svg/colorpalette.svg");
const round_clock = require("@/assets/images/svg/round_lock.svg");
const clockBlue = require("@/assets/images/svg/clock_timer_svg.svg");
const clockGray = require("@/assets/images/svg/clock_timer_gray_svg.svg");

// UTILS
const  { checkErrors , checkAllFields } = useValidation();
const userId = inject('$userId');
const companyId = inject('$companyId');
const {markFavourite} = useProjects();
const {showCounts, checkPermission} = useCustomComposable();
const clientWidth = inject('$clientWidth');
const showArchivedProjects = inject('showArchivedProjects');
const $toast = useToast()
const {getUser} = useGetterFunctions()
const {addHistory, addNotification} = useHistoryNotification();

defineComponent({
    name: "Item-Component",

    components: {
        SubItem,
        DropDown,
        DropDownOption,
        SprintFolderInput,
        ConfirmationSidebar,
        WasabiImage
    }
})

defineEmits(['change', 'toggle', 'changeAvatar'])

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    selected: {
        type: Boolean,
        default: false
    },
    filterFavorites: {
        type: Boolean,
        default: false
    },
    sprintData : {
        type: Object,
    },
    loadingData: {
        type: Boolean,
        default: false
    }
})


const {getters} = useStore();
const designations = computed(() => getters["settings/designations"])

const spinner = ref(false)
const isOpened = ref(false)
const propItem = computed(() => props.item);
const createSprint = ref(false);
const createFolder = ref(false);
const showSpinner = ref(false);
const showSidebar = ref(false);
const archive = ref(0);
const editName = ref(false);
const projectName = ref({
	value: "",
	rules: "required | min: 3",
	name: "name",
	error: ""
})

const sprints = ref([]);
const sprintFolders = ref({});
onMounted(() => {
    setSprints();
    setFolders();
})

watch(() => props.sprintData[props.item._id], () => {
    setSprints();
    setFolders();
})

function getTimeAgo(timestamp = null) {
    if(!timestamp) return '';
    let curr = moment(new Date());
    let start = moment(timestamp);

    let diff = moment.duration(curr.diff(start))

    let hrs = Number(diff.asHours().toFixed(0))
    let min = Number(diff.asMinutes().toFixed(0))

    let str = ``;

    if(hrs) {
        if(hrs >= 24) {
            str = moment(timestamp).format("DD/MM/YYYY")
        } else {
            str = `${hrs} hrs ${min % 60} min ago`
        }
    } else if (min) {
        str = `${min % 60} min ago`
    } else {
        str = `Just now`
    }

    return str
}

function setFolders(){
    // let oldFolder = props.item?.sprintsfolders || {};
    let newFolder = props.sprintData && props.sprintData[props.item._id] ? props.sprintData[props.item._id].folders : {};
    let mergeObj = {...newFolder}
    let remove = Object.keys(sprintFolders.value).filter((x) => !Object.keys(mergeObj || {}).includes(x))
    Object.keys(mergeObj || {}).forEach((key) => {
        const folder = JSON.parse(JSON.stringify(mergeObj[key]));

        sprintFolders.value[key] = {
            ...folder,
            isExpanded: folder?.isExpanded ? folder.isExpanded : sprintFolders.value?.[key]?.isExpanded ? sprintFolders.value[key].isExpanded : false
        }
    })

    if(remove?.length) {
        remove.forEach((key) => {
            delete sprintFolders.value[key];
        })
    }
}

function mergeArraysByUniqueID(array1, array2, uniqueID) {
    const mergedArray = [...array2];

    for (const obj2 of array1) {
        const exists = mergedArray.some(obj1 => obj1[uniqueID] === obj2[uniqueID]);
        if (!exists) {
            mergedArray.push(obj2);
        }
    }

    return mergedArray;
}

function setSprints() {
    let tmp = {};
    let oldSprint = Object.values(props.item.sprintsObj || {});
    let newSprint = props.sprintData !== undefined && props.sprintData[props.item._id] ? props.sprintData[props.item._id].sprints : [];

    let mergeArray = mergeArraysByUniqueID(oldSprint,newSprint,'_id')
    let remove = sprints.value.filter((x) => !Object.keys(props.item?.sprintsObj || {}).includes(x.id))
    if(props.filterFavorites) {
        const favourites = mergeArray.filter(x => x.favouriteTasks?.length && x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => a?.createdAt?.seconds > b?.createdAt?.seconds ? -1 : 1)
        const others = mergeArray.filter(x => !x.favouriteTasks?.length || !x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => a?.createdAt?.seconds > b?.createdAt?.seconds ? -1 : 1)
        let arr = [...favourites, ...others]
        arr.forEach((sprint) => {
            tmp[sprint.id] = sprint;
        })
        sprints.value = Object.values(tmp);
    } else {
        sprints.value = mergeArray;
    }

    if(remove?.length) {
        remove.forEach((x) => {
            let index = sprints.value.findIndex((y) => y.id === x);

            if(index !== -1) {
                sprints.value.splice(index, 1);
            }
        })
    }
}

const favourite = computed(() => {
    return props.item.favouriteTasks && props.item.favouriteTasks.length && props.item.favouriteTasks.filter((x) => userId.value && x.userId === userId.value).length;
})

function availableSprints(obj = null) {
    if(!obj) return;

    let sprints = [];

    Object.values(obj).forEach((sprint) => {
        if(sprint.deletedStatusKey !== 1 && (showArchivedProjects.value ? (sprint.deletedStatusKey === 2 || sprint.archiveTaskCount) : !sprint.deletedStatusKey)) {
            sprints.push(sprint);
        }
    })

    return sprints.length > 0
}

function toggleSubItem(data) {
    Object.keys(sprintFolders.value).map((x) => {
        if(data.isNewClicked) {
            sprintFolders.value[data.folderId].isExpanded = true;
        } else if(x === data.folderId) {
            sprintFolders.value[x].isExpanded = !sprintFolders.value[x].isExpanded;
        } else if(sprintFolders.value[x].isExpanded === true) {
            sprintFolders.value[x].isExpanded = false;
        }
        return x;
    })
}

function markProjectFavourite() {
    spinner.value = true;
    if(!favourite.value) {
        markFavourite({
            cid: companyId.value,
            projectId: props.item._id,
            userId: userId.value
        })
        .then((msg) => {
            $toast.success(msg, {position: "top-right"});
            spinner.value = false;
        })
        .catch((error) => {
            spinner.value = false;
            console.error("ERROR in markFavourite: ", error);
        })
    } else {
        markFavourite({
            cid: companyId.value,
            projectId: props.item._id,
            userId: userId.value,
            data: props.item.favouriteTasks.find((x) => x.userId === userId.value)
        })
        .then((msg) => {
            $toast.success(msg, {position: "top-right"});
            spinner.value = false;
        })
        .catch((error) => {
            spinner.value = false;
            console.error("ERROR in markFavourite: ", error);
        })
    }
}

function resetProjectName() {
    projectName.value.value = "";
    projectName.value.error = "";
}
function toggleRenameProject() {
    projectName.value.value = props.item.ProjectName;
    editName.value=true;
    nextTick(() => {
        document.getElementById(`${props.item?.id}_input`)?.focus();
    })
}

function renameProject() {
    checkAllFields({projectName: projectName.value})
    .then((valid) => {
        if(valid) {
            editName.value = false;
            const prevProjectName = propItem.value.ProjectName;

            let obj = [
                { _id: BSON.ObjectID(propItem.value._id) },
                { $set: { ProjectName: projectName.value.value } },
                true, // Upsert
                false
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.PROJECTS,
                data: obj
            };


            const queryRef = mongoQuery.mongodbCrudOperations(query);
            queryRef.then(() => {
                $toast.success("Project name updated successfully", {position: 'top-right'});
                const user = getUser(userId.value);
                const userData = {
                    id: user.id,
                    Employee_Name: user.Employee_Name,
                    companyOwnerId: user.companyOwnerId
                }

                // Call history API
                const axiosData = {
                    "type": "project",
                    "companyId": companyId.value,
                    "projectId": propItem.value._id,
                    "taskId": null,
                    "object": {
                        "sprintId": null,
                        "key": "Project_Name",
                        "message": `<b>${userData.Employee_Name}</b> has changed the name of <b>${prevProjectName}</b> to <b>${projectName.value.value}</b>`
                    },
                    "userData": userData
                };
                apiRequest("post", env.HANDLE_HISTORY, axiosData).then((result) => {
                    if(result.data.status) {
                        console.info(result.data.statusText)
                    }
                });

                resetProjectName();
            })
        }
    })
    .catch((error) => {
        console.error("ERROR in renameProject: ", error);
    })
}

function updateProject(value = null) {
    showSpinner.value = true;
    let updateObject = {};
    if(value !== null || archive.value !== 0) {
        updateObject.deletedStatusKey= value !== null ? value : archive.value === 1 ? 2 : 1;
    } else {
        let status = propItem.value.projectStatusData.find((x) => x.type === "close");
        updateObject.status = status.value;
        updateObject.statusType = status.type;
    }

    let obj = [
        { _id: BSON.ObjectID(propItem.value._id) },
        { $set: { ...updateObject } },
        true, // Upsert
        false
    ];

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: obj
    };
    const queryRef = mongoQuery.mongodbCrudOperations(query);
    queryRef.then(() => {
        showSidebar.value = false;
        showSpinner.value = false;
        updateChildTasks(value !== null);
        const user = getUser(userId.value);
        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: user.companyOwnerId
        }

        let type = `${value !== null ? 'restored' : archive.value === 0 ? 'closed' : archive.value === 1 ? 'archived' : 'deleted'}`;

        $toast.success(`Project ${type} successfully`, {position: 'top-right'});

        let notificationObject = {
            'message': `<p><strong>${userData.Employee_Name}</strong> has ${type} the <strong>${propItem.value.ProjectName}</strong> Project</p>`,
            'key': 'project_close',
            'projectId': propItem.value._id,
        }
        var historyObj = {
            'message': `<b>${userData.Employee_Name}</b> has ${type} the <b>${propItem.value.ProjectName}</b> Project`,
            'key' : 'Project_Name',
        }
        addHistory({
            "type": 'project',
            "companyId": companyId.value,
            "projectId": propItem.value._id,
            "taskId": null,
            "object": historyObj,
            "userData": userData
        });
        addNotification({
            type:'project',
            "companyId": companyId.value,
            projectId: propItem.value._id,
            object: notificationObject,
            userData
        });
    })
    .catch((error) => {
        showSidebar.value = false;
        showSpinner.value = false;
        $toast.error(`Something went wrong.`, {position: "top-right"})
        console.error("ERROR in update project: ", error);
    })
}

function updateChildTasks(restore = false) {
    try {
        let dsk = archive.value;
            let taskDeleteStatusKey = 0;
            let deletedStatusKey;
            if(restore) {
                deletedStatusKey = dsk ? 8 : 7;
                taskDeleteStatusKey = 0;
            } else {
                deletedStatusKey = 0
                if(dsk === 1 || dsk === 0) {
                    taskDeleteStatusKey = (dsk === 0 ? 8 : 7)
                } else if(dsk === 2) {
                    taskDeleteStatusKey = 1
                }
            }

            try {
                const taskStatusUpdateQuery = {
                    type: "updateMany",
                    collection: dbCollections.TASKS,
                    data: [
                        {
                            ProjectID: BSON.ObjectID(propItem.value._id),
                            deletedStatusKey:deletedStatusKey
                        },
                        { $set: {deletedStatusKey: taskDeleteStatusKey}},
                    ]
                }
                
                mongoQuery.mongodbCrudOperations(taskStatusUpdateQuery)
                .catch((error) =>{
                    console.error(error)
                })
            } catch (error) {
                console.error(error)
            }
    } catch (error) {
        console.error(`ERROR in update tasks: `, error);
    }
}
</script>

<style src="./style.css">
</style>
<style>
.item-spinner .spinner {
    width: 10px !important;
    height: 10px !important;
}
.profile-sm-square{
    width: 28px !important;
    height: 28px !important;
}
.toggle__wrappper{
    min-width: 5px; 
    left: 10px;
}
.lastproject__activity-wrapper{
    height:13px;
}
.project__three-dot{
    min-width: 20px;
}
.duplicate__icon{
    width: 10px;
}
.user__activity{
   min-width:290px;
}
.profile-image{
   object-fit: cover;
}
.project__name-input{
    width: calc(100% - 10px);
    margin-left: 10px !important;
}
.error__text-data{
    bottom: -15px; 
    left: 0px;
}
.create__sprint-folder{
    padding: 4px 5px 0px 32px;
}
</style>