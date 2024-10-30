<template>
    <div class="project-item-wrapper project-Subitem-wrapper position-re">
        <div class="project-item border-radius-5-px cursor-pointer ml-016" :class="{'hover-bg-light-gray': folder, 'hover-bg-light-blue': !folder ,'bg-light-gray' : folder && $route.params.folderId === data.folderId, 'bg-light-blue': !folder && $route.params.sprintId === (data.id ? data.id : data._id)}">
            <div class="position-ab drop__arrow-div">
                <img @click.stop="$emit('change', data)" v-if="sprints && sprints.length && (sprints.filter(e=>(showArchived ? e.deletedStatusKey == 2 : !e.deletedStatusKey))).length && !data.deletedStatusKey" src="@/assets/images/svg/triangleBlack.svg" alt="" :style="`transform: rotateZ(${data.isExpanded ? '90' : '0'}deg)`">
            </div>
            <div class="item-left" @click="$emit('changeProject'),changeRoute()">
                <Spinner v-if="!folder" :isSpinner="spinner" class="position-re list-spinner"/>
                <div class="text-ellipsis">
                    <img v-if="data.deletedStatusKey !== undefined && data.deletedStatusKey === 2" :src="inventoryIcon" alt="inventoryIcon">
                    <img v-else-if="data.deletedStatusKey !== undefined && data.deletedStatusKey === 1" :src="deleteIcon" alt="deleteIcon">
                    <img v-if="folder" :src="folderIcon" alt="folderIcon" class="ml-6px">
                    <img v-else @click.stop="markFavourite()" :src="favourite ? filledStar : blankStar" alt="favourite star" class="ml-6px">

                    <span class="text-ellipsis project-sb-desc ml-6px" :title="data.name">
                        {{data.name}}
                    </span>
                </div>
            </div>
            <div class="item-right">
                <template v-if="!isOpened">
                    <span v-if="!folder" class="gray sptint-total" :class="{'font-size-13': clientWidth > 767, 'font-size-16': clientWidth <= 767}">{{showArchived ? (data.archiveTaskCount || 0) : (data.tasks || 0)}}</span>
                    <div class="count-block child-count-block ml-6px" v-if="folder && data?.sprintsObj && Object.keys(data?.sprintsObj).length && showCounts({project, key: 'folder', sprints: Object.values(data?.sprintsObj), showArchived}).count" :style="{backgroundColor: showCounts({project, key: 'folder', sprints: Object.values(data?.sprintsObj), showArchived}).color}">
                        {{showCounts({project, key: 'folder', sprints: Object.values(data?.sprintsObj), showArchived}).count > 99 ? "+99" : showCounts({project, key: 'folder', sprints: Object.values(data?.sprintsObj), showArchived}).count}}
                    </div>
                    <div class="count-block child-count-block ml-6px" v-else-if="!folder && showCounts({project, key: 'sprint', sprints: [data], showArchived}).count" :style="{backgroundColor: showCounts({project, key: 'sprint', sprints: [data], showArchived}).color}">
                        {{showCounts({project, key: 'sprint', sprints: [data], showArchived}).count > 99 ? "+99" : showCounts({project, key: 'sprint', sprints: [data], showArchived}).count}}
                    </div>
                </template>
                <DropDown :id="itemId" @isVisible="(val)=> isOpened = val" :title="folder? data.name : data.name" v-if="
                    (
                        checkPermission('project.project_sprint_create',project.isGlobalPermission) === true
                        || checkPermission('project.project_folder_name_edit',project.isGlobalPermission) === true
                        || checkPermission('project.project_sprint_name_edit',project.isGlobalPermission) === true
                        || checkPermission('project.project_list',project.isGlobalPermission) === true
                    )
                    && (showArchived ? data.deletedStatusKey === 2 : !data.deletedStatusKey)
                ">
                    <template #button>
                        <img src="@/assets/images/svg/horizontalDots.svg" alt="dots" class="project__three-dot ml-6px vertical-middle"  :class="{'project-option': clientWidth > 767 && !isOpened, 'project-option-mobile': clientWidth <= 767}" :ref="itemId">
                    </template>

                    <template #options>
                        <template v-if="!showArchived">
                            <DropDownOption v-if="folder && checkPermission('project.project_sprint_create',project.isGlobalPermission) === true" @click="createSprint = true, $refs[itemId].click(), $emit('change', {...data, isNewClicked: true })">
                                <div class="d-flex align-items-center project-mobile-desc">
                                    <img :src="listIcon" alt="listIcon" class="mr-6px">
                                    Create New List
                                </div>
                            </DropDownOption>
                            <DropDownOption v-if="folder ? checkPermission('project.project_folder_name_edit',project.isGlobalPermission) === true : checkPermission('project.project_sprint_name_edit',project.isGlobalPermission) === true" @click="$refs[itemId].click(), rename()">
                                <div class="d-flex align-items-center project-mobile-desc">
                                    <img :src="editIcon" alt="editIcon" class="mr-6px">
                                    Rename
                                </div>
                            </DropDownOption>
                            <DropDownOption v-if="checkPermission('project.project_list',project.isGlobalPermission) === true && (data.deletedStatusKey === 0 || data.deletedStatusKey === undefined)" @click="$refs[itemId].click(), showSidebar = true, archive = true">
                                <div class="d-flex align-items-center project-mobile-desc">
                                    <img :src="inventoryIcon" alt="inventoryIcon" class="mr-6px">
                                    Archive
                                </div>
                            </DropDownOption>
                        </template>
                        <DropDownOption v-if="checkPermission('project.project_list',project.isGlobalPermission) === true && data.deletedStatusKey === 2" @click="$refs[itemId].click(), updateItem(0)">
                            <div class="d-flex align-items-center project-mobile-desc">
                                <img :src="inventoryIcon" alt="restoreInventoryIcon" class="mr-6px">
                                Restore
                            </div>
                        </DropDownOption>
                        <DropDownOption v-if="checkPermission('project.project_list',project.isGlobalPermission) === true && !folder" @click="$refs[itemId].click(), showSidebar = true, close = true">
                            <div class="d-flex align-items-center project-mobile-desc">
                                <img :src="cancelIcon" alt="cancelIcon" class="mr-6px">
                                Close
                            </div>
                        </DropDownOption>
                        <DropDownOption v-if="checkPermission('project.project_list',project.isGlobalPermission) === true" @click="$refs[itemId].click(), showSidebar = true, archive = false">
                            <div class="d-flex align-items-center project-mobile-desc mobile-deleteIcon red">
                                <img :src="deleteIcon" alt="deleteIcon" class="mr-6px">
                                Delete
                            </div>
                        </DropDownOption>
                    </template>
                </DropDown>
            </div>
        </div>
        <div v-if="createSprint || renameFolder || renameSprint" class="d-flex align-items-center create__rename-sprintwrapper">
            <SprintFolderInput
                :createSprint="createSprint || renameSprint"
                :createFolder="renameFolder"
                :folder="folder ? {folderId: data.folderId, folderName: data.name} : data.folderId ? {folderId: data.folderId, folderName: data.folderName} : null"
                :item="renameFolder || renameSprint ? data : null"
                :subItems="folder && !renameFolder ? [...(Object.values(data?.sprintsObj || {}))] : subItems"
                @cancel="createSprint = false, renameFolder = false, renameSprint=false"
            />
        </div>
        <div v-if="data.isExpanded && sprints?.length" class="pl-10px">
            <template v-for="subItem in sprints">
                <SubItem
                    v-if="showArchived ? (subItem.deletedStatusKey === 2 || subItem.archiveTaskCount) : (!subItem.deletedStatusKey)"
                    :key="subItem.id"
                    :data="subItem"
                    :subItems="[...(sprints || [])]"
                    @change="toggleSubItem($event)"
                    @changeProject="$emit('changeProject')"
                />
            </template>
        </div>

        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${close ? 'Close' : archive ? 'Archive' : 'Delete'}`"
            :message="close ? 'Type sprint name to confirm that you really do wish to close this sprint' : archive ? 'A List can be archived to hide it from view but be restored at any time. All tasks are kept and remain searchable when you archive a List.' : `This Project's tasks and templates will all be erased. Type project name to confirm that you really do wish to delete all tasks, templates, and this project.`"
            :confirmationString="`${close ? 'close' : archive ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive && !close ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${close ? 'Close' : archive ? 'Archive' : 'Delete'}`"
            @confirm="updateItem()"
            :showSpinner="showSpinner"
        />
    </div>
</template>

<script setup>
// PACKAGES
import { computed, defineComponent, defineEmits, defineProps, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomComposable, useGetterFunctions } from '@/composable';
import { useStore } from 'vuex';
import { useToast } from 'vue-toast-notification';

// COMPONENTS
import SubItem from './SubItem'
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import SprintFolderInput from '@/components/atom/SprintFolderInput/SprintFolderInput.vue'
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import Spinner from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import { BSON } from "realm-web";
import { dbCollections } from '@/utils/FirebaseCollections';
import { apiRequest } from '../../../services';
import * as env from '@/config/env';

// UTILS
const $toast = useToast();
const router = useRouter();
const route = useRoute();
const userId = inject("$userId");
const {showCounts, checkPermission} = useCustomComposable();
const companyId = inject("$companyId");
const {getUser} = useGetterFunctions()
const {getters} = useStore();
const clientWidth = inject("$clientWidth");
const showArchived = inject("showArchivedProjects");
const isOpened = ref(false)


// IMAGES
const cancelIcon = require("@/assets/images/cancel.png");
const inventoryIcon = require("@/assets/images/svg/inventoryIcon.svg");
const deleteIcon = require("@/assets/images/svg/deleteIcon.svg");
const listIcon = require("@/assets/images/svg/listView.svg");
const folderIcon = require("@/assets/images/folder.png");
const editIcon = require("@/assets/images/svg/rename.svg");
const filledStar = require("@/assets/images/svg/start10.svg");
const blankStar = require("@/assets/images/svg/blankStar.svg");

defineComponent({
    name: "sub-item",

    components: {
        SubItem,
        DropDown,
        DropDownOption,
        SprintFolderInput,
        ConfirmationSidebar,
    }
})

defineEmits(['change', 'changeProject']);

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    folder: {
        type: Boolean,
        default: false
    },
    filterFavorites: {
        type: Boolean,
        default: false
    },
    subItems: {
        type: Array,
        default: () => []
    }
})

const sprints = computed(() => {
    let tmp = {};
    if(props.filterFavorites) {
        const favourites = Object.values(props?.data?.archivedSprintList ? props?.data?.archivedSprintList : props?.data?.sprintsObj).filter(x => x.favouriteTasks?.length && x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => a?.createdAt?.seconds > b?.createdAt?.seconds ? -1 : 1)
        const others = Object.values(props?.data?.archivedSprintList ? props?.data?.archivedSprintList : props?.data?.sprintsObj).filter(x => !x.favouriteTasks?.length || !x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => a?.createdAt?.seconds > b?.createdAt?.seconds ? -1 : 1)
        let arr = [...favourites, ...others]
        arr.forEach((sprint) => {
            tmp[sprint.id] = sprint;
        })
        return Object.values(tmp);
    } else {
        return Object.values(props?.data?.archivedSprintList ? props?.data?.archivedSprintList : props?.data?.sprintsObj || []);
    }
});

const itemId = computed(() => {
    return props.folder ? props.data.folderId : props.data.id;
})

const spinner = ref(false);
const close = ref(false);
const archive = ref(false);
const showSpinner = ref(false);
const showSidebar = ref(false);
const createSprint = ref(false);
const renameFolder = ref(false);
const renameSprint = ref(false);
const project = inject("selectedProject");
const favourite = computed(() => {
    return props.data?.favouriteTasks && props.data.favouriteTasks.length && props.data.favouriteTasks.filter((x) => userId.value && x.userId === userId.value).length;
})

const companyOwner = computed(() => getters["settings/companyOwnerDetail"])
function getUserData() {
    const user = getUser(userId.value);
    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: companyOwner.value.userId,
    }

    return userData;
}

function changeRoute() {
    let tab = route.query?.tab;
    if(!project.value?.ProjectRequiredComponent?.find((x) => x.keyName === route.query?.tab)) {
        tab = "ProjectListView";
    }
    if(props.data.folderId && props.data.sprintsObj) {
        router.push({
            name: "ProjectFolder",
            params: {
                id: project.value._id,
                folderId: props.data.folderId
            },
            query: {
                ...route.query,
                tab
            }
        })
    } else {
        if(props.data.folderId) {
            router.push({
                name: "ProjectFolderSprint",
                params: {
                    id: project.value._id,
                    folderId: props.data.folderId,
                    sprintId: props.data.id ? props.data.id : props.data._id
                },
                query: {
                    ...route.query,
                    tab
                }
            })
        } else {
            router.push({
                name: "ProjectSprint",
                params: {
                    id: project.value._id,
                    sprintId: props.data.id ? props.data.id : props.data._id
                },
                query: {
                    ...route.query,
                    tab
                }
            })
        }
    }
}

function toggleSubItem(data) {
    Object.keys(data.sprintsObj).forEach((key) => {
        if(data.sprintsObj[key].id === data.id) {
            data.sprintsObj[key].isExpanded = !data.sprintsObj[key].isExpanded;
        } else {
            data.sprintsObj[key].isExpanded = false;
        }
    })
}

function rename() {
    if(props.folder) {
        renameFolder.value = true;
        renameSprint.value = false;
    } else {
        renameFolder.value = false;
        renameSprint.value = true;
    }
}

function updateItem(value = null) {
    showSpinner.value = true;

    let obj = {};
    let updatedValue = '';
    if(props.folder) {
        obj.$set = { deletedStatusKey: value !== null ? value : archive.value ? 2 : 1}
        updatedValue = value !== null ? value : archive.value ? 2 : 1
    } else {
        obj.$set = {deletedStatusKey: value !== null ? value : close.value ? 5 : archive.value ? 2 : 1};
        updatedValue = value !== null ? value : close.value ? 5 : archive.value ? 2 : 1
    }

    const userData = getUserData();

    const axiosData = {
        type: !props.folder ? "updateSprint" : "updateFolder",
        companyId: companyId.value,
        projectId: project.value._id,
        folderId: props.data.folderId || null,
        updateObject: {
            ...obj
        },
        updatedValueDeleteStatusKey: updatedValue,
        userData,
        sprintName: !props.folder ? props.data.name : null,
        projectData: {
            id: project.value._id,
            ProjectName: project.value.ProjectName
        },
        folderName: props.data.name,
    }

    if(!props.folder && props.item?.folderId) {
        axiosData.folderName = props.item.folderName
    }
    
    if(props.folder) {
        axiosData.sprints = sprints.value?.filter((x) => !x.deletedStatusKey || x.deletedStatusKey === 6)?.map((x) => x.id)
    }
    let reqUrl = env.SPRINT+'/'+itemId.value;
    if (props.data.folderId) {
        reqUrl = env.FOLDER+'/'+itemId.value;
    }
    apiRequest("patch", reqUrl, axiosData)
    .then((res) => {
        if(!res.data.status) {
            showSpinner.value = false;
            $toast.error(`Something went wrong.`, {position: "top-right"})
            return;
        }
        $toast.success(`${props.data.folderId ? 'Folder' : 'Sprint'} ${value !== null ? 'restored' : close.value ? 'closed' : archive.value ? 'archived' : 'deleted'} successfully`, {position: "top-right"})
        showSidebar.value = false;
        showSpinner.value = false;
        close.value = false;
        archive.value = false;
    })
    .catch((error) => {
        close.value = false;
        archive.value = false;
        showSidebar.value = false;
        showSpinner.value = false;
        $toast.error(`Something went wrong.`, {position: "top-right"})
        console.error("ERROR in updateItem: ", error);
    })
}

function markFavourite() {
    spinner.value = true;
    const userData = getUserData();
    const isFavouriteOutsideFolder = (sprintId) => {
        if(props.subItems && props.subItems.length){
            let data = props.subItems.find((e)=> (e?._id ? e?._id : e?.id) === sprintId);
            return data?.favouriteTasks?.some((x) => x.userId === userId.value);
        }else{
            return null;
        }
    };

    let updateQuery;
    const fav = isFavouriteOutsideFolder(props.data?.id ? props.data?.id : props.data?._id);
    const key = fav ? "$pull" : "$push";
    updateQuery = [
        { _id: BSON.ObjectID(props.data?.id ? props.data?.id : props.data?._id) },
        { [key]: { 'favouriteTasks': { userId: userId.value } } },
        false,
        true,
    ];
    const query = {
        type: "updateOne",
        collection: dbCollections.SPRINTS,
        data: updateQuery
    };

    const queryRef = mongoQuery.mongodbCrudOperations(query);
    queryRef.then(() => {

        spinner.value = false;
        $toast.success(`${!favourite.value ? "Added to" : "Removed from"} favorite`, {position: "top-right"});

        // Call history API
        const axiosData = {
            "type": "project",
            "companyId": companyId.value,
            "projectId": project.value._id,
            "taskId": null,
            "object": {
                "sprintId": props.data.id,
                "key": "Create_Sprint",
                "message": `<b>${userData.Employee_Name}</b> has been seted <b>${props.data.name}</b> sprint mark as favorite in <b>${project.value.ProjectName}</b> project.`
            },
            "userData": userData
        };
        apiRequest("post", env.HANDLE_HISTORY, axiosData).then((result) => {
            if(result.data.status) {
                console.info(result.data.statusText)
            }
        });
    })

}
</script>

<style>
.list-spinner .spinner {
    width: 10px !important;
    height: 10px !important;
    left: -5px;
}
.create__rename-sprintwrapper{
    padding: 0px 5px 0px 32px;
}
.drop__arrow-div{
    min-width: 10px;
    left: 10px;
}
</style>