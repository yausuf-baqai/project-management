<template>
    <div class="project-list bg-white">
        <div class="position-sti bg-white z-index-6 project__list-sticky">
        <div class="searchBox px-010rem blue cursor-default border-bottom-serach" id="projectrightside_driver">
            <img v-if="clientWidth <= 1300" :src="sidebarArrowIcon" alt="sidebarArrowIcon" class="cursor-pointer mr-1" @click="$emit('close')">
            <input type="text" v-if="enableSearch" v-model="search" placeholder="Search" ref="projectSearchInput" class="form-control serach-inputbox webkit-avilable ml-0">
            <span v-else class="project-list-title">{{showArchivedProjects ? 'Archived List' : 'Projects'}}</span>

            <div class="d-flex align-items-center">
                <img id="projectrightsidesearch_driver" v-if="!enableSearch" :src="searchIcon" alt="searchIcon" class="cursor-pointer mx-1" @click="enableSearch = !enableSearch, $nextTick(() => $refs.projectSearchInput.focus())">
            <img v-else :src="redCross" alt="redCross" class="cursor-pointer close-serach-btn" @click="enableSearch = !enableSearch, search = ''">

                <DropDown id="project_filter_options" class="project_filter_options" title="Project search filter search-filter-data">
                    <template #button>
                        <img :src="horizontalDots" alt="horizontalDots" class="vertical-middle" id="projectrightsidedropdown_driver">
                    </template>
                    <template #options>
                        <DropDownOption @click="projectSearch = true, folderSearch = false, sprintSearch = false">
                            <span class="project-mobile-desc mr-10px">Project Name</span>
                            <Toggle :modelValue="projectSearch" :disabled="projectSearch" @click="projectSearch = true, folderSearch = false, sprintSearch = false" class="filter-toggle" width="20"
                             />
                        </DropDownOption>
                        <DropDownOption @click="folderSearch = true, projectSearch = false, sprintSearch = false">
                            <span class="project-mobile-desc mr-10px">Folder Name</span>
                            <Toggle :modelValue="folderSearch" :disabled="folderSearch" @click="folderSearch = true, projectSearch = false, sprintSearch = false" class="filter-toggle" width="20" />
                        </DropDownOption>
                        <DropDownOption @click="sprintSearch = true, folderSearch = false, projectSearch = false">
                            <span class="project-mobile-desc mr-10px">Sprint Name</span>
                            <Toggle :modelValue="sprintSearch" :disabled="sprintSearch" @click="sprintSearch = true, folderSearch = false, projectSearch = false" class="filter-toggle" width="20" />
                        </DropDownOption>
                    </template>
                </DropDown>
            </div>
        </div>
        <div class="bg-white position-sti d-flex align-items-center justify-content-between p-10px assignee__drop-wrapper">
            <div class="d-flex align-items-center">
                <img id="projestleftlistfilter_driver" :src="filterFavorites ? starImage : blankStar" alt="starImage" class="cursor-pointer fillstar__image" @click="emit('update:filterFavorites', !filterFavorites)"/>
            </div>
            <div class="d-flex align-items-center">
                <Assignee
                    :tourId="'projectleftsideassignee_driver'"
                    imageWidth="30px"
                    :users="filterUsers"
                    :options="[...allUsers, ...teams.map((x) => 'tId_'+x._id)]"
                    :num-of-users="1"
                    @selected="changeAssignee('add', $event)"
                    @removed="changeAssignee('remove', $event)"
                    class="mr-10px"
                    :isDisplayTeam="true"
                />
                <DropDown>
                    <template #button>
                        <img ref="project_show_hide" :src="settingIcon" alt="settingIcon" class="cursor-pointer vertical-middle" id="projectleftsidsetting_driver"/>
                    </template>
                    <template #options>
                        <DropDownOption v-if="!showArchivedProjects" @click="$refs.project_show_hide.click(), $emit('update:showArchivedProjects', true)">
                            Show Archive
                        </DropDownOption>
                        <DropDownOption v-else @click="$refs.project_show_hide.click(), $emit('update:showArchivedProjects', false)">
                            Hide Archive
                        </DropDownOption>
                    </template>
                </DropDown>
                <button v-if="!showArchivedProjects && checkPermission('project.project_list',projectData.isGlobalPermission) === true && checkPermission('project.project_create',projectData.isGlobalPermission) === true" class="outline-primary ml-1 font-size-16 p0x-13px" @click="$emit('createProject')" id="createproject_driver">+ New Project</button>
            </div>
        </div>
        </div>
        <div>
            <template v-if="!loader && !isSpinner">
                <template v-if="filterdProjects?.length">
                    <Item
                        v-for="item in filterdProjects"
                        :key="item._id"
                        :item="item"
                        :filterFavorites="filterFavorites"
                        :selected="projectData !== null && projectData._id === item._id"
                        @toggle="(data) => toggleProject(data)"
                        @change="(data) => projectData !== null && projectData._id === item._id ? mutateCurrentProjectDetails(data, true) : toggleProject(data)"
                        @changeAvatar="$emit('changeAvatar', $event)"
                        :loadingData="loadingData[item._id]"
                        :sprintData="sprintFolders"
                    />
                </template>
                <template v-else>
                    <div class="text-center mt-1">
                        <h3 class="m-0">
                            {{!search?.length ? (isSpinner === false && projects.length == 0 ? "No projects found" : '') : "No results found"}}
                        </h3>
                        <p v-if="search?.length" class="font-size-14 mt-10px">Try using different keywords</p>
                    </div>
                </template>
            </template>
            <template v-else>
                <div v-for="i in 2" :key="i">
                    <div class="d-flex flex-column align-items-end">
                        <Skelaton class="border-radius-5-px m-5px h-35px w-95"/>
                        <Skelaton class="border-radius-5-px m-5px h-35px w-85"/>
                        <Skelaton class="border-radius-5-px m-5px h-35px w-70"/>
                        <Skelaton class="border-radius-5-px m-5px h-35px w-85"/>
                        <Skelaton class="border-radius-5-px m-5px h-35px w-85"/>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
// PACKAGES
import { computed, ref, defineEmits, defineProps, onMounted, watch, inject, defineComponent, nextTick } from 'vue';
import { useStore } from 'vuex';

// COMPONENTS
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import Item from '@/components/organisms/Item/Item.vue'
import { useCustomComposable } from '@/composable';
import { useRoute, useRouter } from 'vue-router';
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import Toggle from '@/components/atom/Toggle/Toggle.vue'
import Skelaton from "@/components/atom/Skelaton/Skelaton.vue"
import { BSON } from 'realm-web';

// UTILS
const {getters, commit, dispatch} = useStore();
const {debounce, checkPermission} = useCustomComposable()
const router = useRouter();
let route = useRoute();
const userId = inject("$userId");
const companyId = inject("$companyId");
const clientWidth = inject("$clientWidth");

// IMAGES
const horizontalDots = require("@/assets/images/svg/horizontalDots.svg");
const searchIcon = require("@/assets/images/search.png");
const redCross = require("@/assets/images/svg/delete_iicon.svg");
const sidebarArrowIcon = require("@/assets/images/svg/sidebarclose_arrow.svg");
const starImage = require("@/assets/images/svg/start16.svg");
const blankStar = require("@/assets/images/svg/blankStar.svg");
const settingIcon = require("@/assets/images/svg/setting_vector.svg");

defineComponent({
    components: {
        Item,
        DropDown,
        DropDownOption,
        Toggle,
        Assignee
    }
})

// EMITS
const emit = defineEmits(["update:projectData", "update:sprints", "change", "close", "update:showArchivedProjects", "update:filterFavorites", 'changeAvatar', 'createProject','isSpinner','sprintsFoldersData']);

// PROPS
const props = defineProps({
    showArchivedProjects: {
        type: Boolean,
        required: true,
        default: false
    },
    loadingProjects: {
        type: Boolean,
        required: true,
        default: false
    },
    filterFavorites: {
        type: Boolean,
        default: false
    },
    projectData: {
        type: Object,
        required: true
    },
    projectsArr: {
        type: Array,
        required: true,
        default: () => []
    },
})

const search = ref("");

const loader = ref(true);

const filterUsers = ref([]);
const enableSearch = ref(false);
const projectSearch = ref(true);
const folderSearch = ref(false);
const sprintSearch = ref(false);
const projectsGetter = computed(() => getters["projectData/projects"]);
const allUsers = computed(() => getters["settings/companyUsers"].map((x) => x.userId));
const teams = computed(() => getters["settings/teams"]);
const loadingData = ref({});
const companyUserDetail = computed(() => getters["settings/companyUserDetail"]);
// UPDATE PROJECTS VALUE ON DATABSE SNAP
const projects = ref([]);
const isSpinner = ref(false);
const sprintData = ref([])
const folderData = ref({})
const sprintFolders = ref({})

watch(() => props.projectsArr, (data) => {
    if(!projects.value || !projects.value.length) {
        projects.value = data;
    } else {
        data.forEach((item) => {
            if(projects?.value?.length) {
                const index = projects.value?.findIndex((project) => project._id === item._id);
                if(index !== -1) {
                    if(JSON.stringify(item) !== JSON.stringify(projects.value[index])) {
                        projects.value[index] = {...projects.value[index], ...item, isExpanded: item.isExpanded};
                    }
                } else {
                    projects.value.push(item);
                }
            }
        })

        projects.value = projects.value.filter((x) => data.length && data.filter((y) => y._id === x._id).length);
    }

    // UPDATE SELECTED PROJECT
    if(projects.value && projects.value.length) {
        if(props.projectData && !Object.keys(props.projectData).length) {
            if(route.params && route.params.id) {
                const projectIndex = projects.value.findIndex((item) => item._id === route.params.id);
                if(projectIndex !== -1) {
                    if(!projects.value[projectIndex].isRestrict){
                        projects.value[projectIndex].isExpanded = true;
                    }
                    mutateCurrentProjectDetails(projects.value[projectIndex]);
                } else {
                    mutateCurrentProjectDetails(projects.value[0], true);
                }
            } else {
                mutateCurrentProjectDetails(projects.value[0], true);
            }
        } else {
            const projIndex = projects.value.findIndex((item) => item._id === props.projectData._id);
            if(projIndex !== -1) {
                if(!projects.value[projIndex].isRestrict){
                    projects.value[projIndex].isExpanded = true;
                }
                mutateCurrentProjectDetails({...projects.value[projIndex]});
            } else {
                mutateCurrentProjectDetails({...projects.value[0]}, true);
            }
        }
    }

    setTimeout(() => {
        loader.value = false;
    }, 2000)
})

watch(() => getters["projectData/sprints"],(sprintfold) => {
    if(JSON.stringify(sprintData.value) !== JSON.stringify(sprintfold[route.params.id] || [])){
        sprintData.value = sprintfold[route.params.id];
        getSprintFolderData(route.params.id,true);
    }
})

watch(() => getters["projectData/folders"],(folder) => {
    if(JSON.stringify(folderData.value) !== JSON.stringify(folder[route.params.id] || [])){
        folderData.value = folder[route.params.id];
        getSprintFolderData(route.params.id,true);
    }
})

watch(() => props.loadingProjects, (newVal, oldVal) => {
    if(newVal !== oldVal) {
        loader.value = true;
    }
    if(loader.value && !props.loadingProjects && !projects.value?.length) {
        setTimeout(() => {
            loader.value = false;
        }, 3000)
    }
})

watch(() => route.params,(newVal, oldVal) => {
    if(newVal.id !== oldVal.id){
        sprintData.value = getters["projectData/sprints"][route.params.id];
        folderData.value = getters["projectData/folders"][route.params.id];
    }
})

// SEARCH OPERATION ON PROJECTS
const filterdProjects = ref([]);
watch([search, filterUsers, projects, () => props.filterFavorites, projectSearch, folderSearch, sprintSearch], debounce(() => {
    if(search.value) {
        let tmp = [];
        if(projectSearch.value) {
            tmp = projects.value.filter((item) => {
                let cotainsUsers = filterUsers.value.length ? filterUsers.value.filter((x) => item.AssigneeUserId.filter((y) => x === y).length).length : true
                return item.ProjectName.toLowerCase().includes(search.value.toLowerCase()) && cotainsUsers;
            })
        } else if(folderSearch.value) {
            projects.value.forEach((item) => {
                let folders = {};
                if(item.sprintsfolders && Object.keys(item.sprintsfolders).length) {
                    Object.keys(item.sprintsfolders).forEach((key) => {
                        const folder = item.sprintsfolders[key];
                        if(folder?.name.toLowerCase().includes(search.value.toLowerCase())) {
                            folders[key] = folder;
                        }
                    })
                }
                if(Object.keys(folders).length) {
                    tmp.push({...item, isExpanded: true, sprintsfolders: folders, sprintsObj: {}});
                }
            })
        } else if(sprintSearch.value) {
            projects.value.forEach((item) => {
                let sprints = {};
                let folders = {};

                // MAIN SPRINTS
                if(item.sprintsObj && Object.values(item.sprintsObj).length) {
                    Object.values(item.sprintsObj).forEach((sprint) => {
                        if(sprint?.name?.toLowerCase().includes(search.value.toLowerCase())) {
                            sprints[sprint.id] = sprint;
                        }
                    })
                }

                // SPRINTS FROM FOLDERS
                if(item.sprintsfolders && Object.keys(item.sprintsfolders).length) {
                    Object.keys(item.sprintsfolders).forEach((key) => {
                        const folder = item.sprintsfolders[key];

                        if(Object.keys(folder).length && folder.sprintsObj && Object.values(folder.sprintsObj).length) {
                            Object.values(folder.sprintsObj).forEach((sprint) => {
                                if(sprint.name.toLowerCase().includes(search.value.toLowerCase())) {
                                    folders[key] = {
                                        ...folder,
                                        isExpanded: true,
                                        sprintsObj: {
                                            ...(folders?.[key]?.sprintsObj ? folders[key].sprintsObj : {}),
                                            [sprint.id]: sprint
                                        }
                                    };
                                }
                            })
                        }
                    })
                }
                if(Object.values(sprints).length || Object.keys(folders).length) {
                    tmp.push({...item, isExpanded: true, sprintsObj: sprints, sprintsfolders: folders});
                }
            })
        }
        if(props.filterFavorites) {
            const favourites = tmp.filter(x => x.favouriteTasks?.length && x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => new Date(a?.createdAt).getTime() > new Date(b?.createdAt).getTime() ? -1 : 1)
            const others = tmp.filter(x => !x.favouriteTasks?.length || !x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => new Date(a?.createdAt).getTime() > new Date(b?.createdAt).getTime() ? -1 : 1)
            tmp = [...favourites, ...others];
        } else {
            tmp = tmp.sort((a,b) => new Date(a?.createdAt).getTime() > new Date(b?.createdAt).getTime() ? -1 : 1)
        }
        filterdProjects.value = tmp;
    } else {
        if(projects.value && projects?.value?.length) {
            let tmp = projects?.value.filter((item) => {
                let cotainsUsers = filterUsers.value.length ? filterUsers.value.filter((x) => item.AssigneeUserId.filter((y) => x === y).length).length : true
                return cotainsUsers;
            });
            if(props.filterFavorites) {
                const favourites = tmp.filter(x => x.favouriteTasks?.length && x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => new Date(a?.createdAt).getTime() > new Date(b?.createdAt).getTime() ? -1 : 1)
                const others = tmp.filter(x => !x.favouriteTasks?.length || !x.favouriteTasks.filter((y) => y.userId === userId.value).length).sort((a,b) => new Date(a?.createdAt).getTime() > new Date(b?.createdAt).getTime() ? -1 : 1)
                tmp = [...favourites, ...others];
            } else {
                tmp = tmp.sort((a,b) => new Date(a?.createdAt).getTime() > new Date(b?.createdAt).getTime() ? -1 : 1)
            }
            filterdProjects.value = tmp;
        } else {
            filterdProjects.value = [];
        }
    }
}, 1000));

function changeAssignee(type, user) {
    if(type === "add") {
        if(!filterUsers.value.includes(user.id)) {
            filterUsers.value = [...filterUsers.value, user.id]
        }
    } else {
        filterUsers.value = filterUsers.value.filter((x) => x !== user.id)
    }
}

// TOGGLE PROJECT
function toggleProject(project) {
    projects.value.forEach((item) => {
        if(item._id === project._id) {
            if(!project?.isRestrict){
                item.isExpanded = !item.isExpanded;
            }
            // if(item.isExpanded) {
                mutateCurrentProjectDetails(project, true)
            // }
        } else {
            item.isExpanded = false;
        }
    })
}

// MUTATE CURRENT PROJECT DETAILS
function mutateCurrentProjectDetails(data, updateRoute = false) {
    if(!projects?.value?.length) return;
    if(data.isGlobalPermission === false) {
        if(getters["settings/projectRawRules"] && getters["settings/projectRawRules"].length > 0){
            if(getters["settings/projectRawRules"].some((x) => x.projectId !== data._id)){
                dispatch("settings/setProjectRules", {pid: data._id}).then(() => {
                    nextTick(()=>{
                        isSpinner.value = false;
                        emit('isSpinner', isSpinner.value,checkPermission('project.project_list',data.isGlobalPermission,{gettersVal: getters}));
                    })
                }).catch(() => {
                    nextTick(()=>{
                        isSpinner.value = false;
                        emit('isSpinner', isSpinner.value,checkPermission('project.project_list',data.isGlobalPermission,{gettersVal: getters}));
                    })
                })
            }else{
                nextTick(()=>{
                    isSpinner.value = false;
                    emit('isSpinner', isSpinner.value,checkPermission('project.project_list',data.isGlobalPermission,{gettersVal: getters}));
                })
            }
        }
        else{
            dispatch("settings/setProjectRules", {pid: data._id}).then(() => {
                nextTick(()=>{
                    isSpinner.value = false;
                    emit('isSpinner', isSpinner.value,checkPermission('project.project_list',data.isGlobalPermission,{gettersVal: getters}));
                })
            }).catch(() => {
                nextTick(()=>{
                    isSpinner.value = false;
                    emit('isSpinner', isSpinner.value,checkPermission('project.project_list',data.isGlobalPermission,{gettersVal: getters}));
                })
            })
        }
    }

    let tab = route.query?.tab;
    if(!data?.ProjectRequiredComponent?.find((x) => x.keyName === route.query?.tab)) {
        tab = "ProjectListView";
    }

    if(updateRoute) {
        router.push({
            name: "Project",
            params: {
                cid: companyId.value,
                id: data._id
            },
            query: {
                ...route.query,
                tab: tab
            }
        })
    }
    let project = projects.value.find((item) => item._id === data._id);
    let sprints = [...(project?.sprintsObj && Object.values(project?.sprintsObj).length ? Object.values(project.sprintsObj) : [])];

    project.sprintsfolders && Object.values(project.sprintsfolders).forEach((item) => {
        sprints = [...sprints, ...(item?.sprintsObj && Object.values(item?.sprintsObj).length ? Object.values(item.sprintsObj) : [])];
    })
    commit("projectData/mutateCurrentProjectDetails", project);
    emit('update:projectData', project);
}

watch(() => props.projectData,(newVal, oldVal) => {
    if(newVal._id !== oldVal._id){
        getSprintFolderData(newVal._id ? newVal._id : oldVal._id);
        return;
    }
})

// ON MOUNTED
onMounted(async() => {
    sprintData.value = getters["projectData/sprints"][route.params.id];
    folderData.value = getters["projectData/folders"][route.params.id];
    if(projectsGetter.value && Object.keys(projectsGetter.value).length) {
        projects.value = props.projectsArr;

        if(props.projectData && !Object.keys(props.projectData).length) {
            mutateCurrentProjectDetails(projects.value[0], true);
            if(projects.value[0]?.isGlobalPermission === false) {
                getSprintFolderData(projects.value[0]?._id);
            }
        } else {
            const projIndex = projects.value.findIndex((item) => item._id === props.projectData._id);
            if(projIndex !== -1) {
                mutateCurrentProjectDetails(projects.value[projIndex]);
                if(projects.value[projIndex]?.isGlobalPermission === false) {
                    getSprintFolderData(projects.value[projIndex]?._id);
                }
            }
        }
        setTimeout(() => {
            loader.value = false;
        }, 3000)
    }
})

function getSprintData(id) {
    return new Promise((resolve, reject) => {
        try {
            if(Object.keys(getters["projectData/sprints"]).includes(id)){
                if(!sprintData.value){
                    sprintData.value = getters["projectData/sprints"][id];
                }
                resolve(sprintData.value,true);
                return;
            }
            let projectId = id;
            const uid = companyUserDetail.value.userId;
            let publicQuery = {
                private:false,
                projectId : BSON.ObjectId(projectId)
            }
        
            let snapPublicQuery = {
                "fullDocument.private" : false,
                "fullDocument.projectId" : BSON.ObjectId(projectId)
            }
            let privateQuery = {
                private:true,
                projectId : BSON.ObjectId(projectId)
            }
        
            let snapPrivateQuery = {
                "fullDocument.private" : true,
                "fullDocument.projectId" : BSON.ObjectId(projectId)
            }
            if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2) {
                privateQuery.AssigneeUserId = {
                    $in:[uid]
                }
                snapPrivateQuery['fullDocument.AssigneeUserId'] = {$in:[uid]}
            }
            dispatch("projectData/setSprints",{projectId,uid,publicQuery,privateQuery,snapPublicQuery,snapPrivateQuery}).then((sprintss) => {
                sprintData.value = sprintss;
                resolve(sprintss);
            }).catch(() => {
            })
        } catch (error) {
            reject(error);
        }
    })
}

function getFolderData(id) {
    return new Promise((resolve, reject) => {
        try {
            if(Object.keys(getters["projectData/folders"]).includes(id)){
                if(!folderData.value || folderData.value.length === 0){
                    folderData.value = getters["projectData/folders"][id];
                }
                resolve(folderData.value,true);
                return;
            }
            let projectId = id;
            const uid = companyUserDetail.value.userId;
            let publicQuery = {
                private:false,
                projectId : BSON.ObjectId(projectId)
            }
        
            let snapPublicQuery = {
                "fullDocument.projectId" : BSON.ObjectId(projectId)
            }
            let privateQuery = {
                projectId : BSON.ObjectId(projectId)
            }
        
            let snapPrivateQuery = {
                "fullDocument.projectId" : BSON.ObjectId(projectId)
            }
            dispatch("projectData/setFolders",{projectId,uid,publicQuery,privateQuery,snapPublicQuery,snapPrivateQuery}).then((folders) => {
                resolve(folders);
                folderData.value = folders;
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getSprintFolderData = async (id,isUpdate = false) => {
    try {
        if(!isUpdate){
            loadingData.value[id] = true;
        }
        Promise.allSettled([getSprintData(id), getFolderData(id)])
        .then((results) => {
            const resolvedPromises = results.filter((result) => result.status === 'fulfilled');
            if (resolvedPromises.length === 2) {
                const [sprintsResult, foldersResult] = resolvedPromises.map((result) => result.value);
                const sprintsArray = sprintsResult?.filter(sprint => sprint.projectId === id && !sprint.folderId).map((x) => ({ ...x, id:x._id }));

                const foldersObject = foldersResult?.reduce((acc, folder) => {
                    if (folder.projectId === id) {
                        let folId = folder._id
                        acc[folId] = {
                            folderId: folId,
                            name: folder.name,
                            sprintsObj: {},
                            deletedStatusKey: folder.deletedStatusKey,
                            legacyId : folder?.legacyId ? folder?.legacyId : '',
                            id: folder._id,
                            _id: folder._id,
                        };
                    }
                    return acc;
                }, {});

                sprintsResult?.forEach(sprint => {
                    if (sprint.projectId === id && sprint.folderId && foldersObject[sprint.folderId]) {
                        sprint.folderName = foldersObject[sprint.folderId].name;
                        sprint.id = sprint._id;
                        foldersObject[sprint.folderId].sprintsObj[sprint.id] = sprint;
                    }
                });
                sprintFolders.value = {
                    [id]: {
                        folders: foldersObject,
                        sprints: sprintsArray,
                    }
                };
                let project = projects.value.find((item) => item._id === id);
                let allSprints = sprintFolders.value !== undefined && sprintFolders.value && sprintFolders.value[route.params.id] ? sprintFolders.value[route.params.id]?.sprints : []
                allSprints = [...allSprints];

                let allFolders = sprintFolders.value && sprintFolders.value[route.params.id] ? sprintFolders.value[route.params.id]?.folders : {}
                allFolders = {...(project?.sprintsfolders && Object.keys(project?.sprintsfolders).length ? project?.sprintsfolders || {} : {}), ...allFolders}

                const sprintIdToObject = {};
                allSprints.forEach(item => {sprintIdToObject[item.id] = item;});
                project.sprintsObj = sprintIdToObject;
                project.sprintsfolders = allFolders;
                var newObj = {snap: null, privateSnap: false, userId: userId.value,roleType: companyUserDetail.value.roleType, op: "modified", data: {...project, isExpanded: true}};
                commit("projectData/mutateProjects",[newObj]);
                nextTick(() => {
                    loadingData.value[id] = false;
                })
            } else {
                loadingData.value[id] = false;
                console.error("One or more promises were rejected");
            }
        })
        .catch((error) => {
            loadingData.value[id] = false;
            console.error("Error in Promise.allSettled", error);
        });
    } catch (error) {
        console.error("ERROR", error);
    }
}

watch(sprintFolders,(sp) => {
    sprintFolders.value = sp;
})
</script>

<style>
@import "./style.css";
</style>