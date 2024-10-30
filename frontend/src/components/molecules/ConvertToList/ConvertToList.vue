<template>
    <div class="mainConvertList">
        <div v-if="isFolder === true">
            <Sidebar width="607px" :top="clientWidth <= 767 ? '0px' : '46px'">
                <template #head-left>
                    <div class="blue font-roboto-sans screenShotPreview">Convert to List</div>
                </template>
                <template #head-right>
                <button class="outline-primary d-flex align-items-center font-roboto-sans font-size-16 convertlist__cancel-btn" @click="$emit('closeSidebar',false)">Cancel</button>
                </template>
                <template #body>
                        <div class="bg-white overflow-x-visible overflow-y-auto overflow-y-auto::-webkit-scrollbar p15x-20px" :class="{'border-radius-12-px' : clientWidth > 767, 'border-radius-0 ' : clientWidth <= 767}"  :style="[{margin : clientWidth > 767 ? '15px' : '0px' ,  height : clientWidth <= 767 ?  '100%' : ''}]">
                        <div class="position-re overflow-x-visible overflow-y-auto overflow-y-auto::-webkit-scrollbar" :style="[{ maxHeight : clientWidth > 767 ? 'calc(100vh - 172px)' : 'calc(100vh - 90px)'}]">
                        <div class="d-flex align-items-center justify-content-between position-sti z-index-1 project__icon-wrapper">
                            <div class="d-flex align-items-center text-ellipsis projectDivInList">
                                <span v-if="selectedProjectData.projectIcon && selectedProjectData.projectIcon.type === 'color'" class="d-flex align-items-center justify-content-center font-weight-400 inital-box ml-6px" :style="[{'background-color': selectedProjectData.projectIcon.data}]">{{ selectedProjectData.ProjectName.charAt(0).toUpperCase()}}</span>
                                <img v-if="selectedProjectData.projectIcon && selectedProjectData.projectIcon.type === 'image'" class="profile-sm-square ml-6px" :src="selectedProjectData.projectIcon.data" alt=""/>
                                <span class="text-ellipsis Project-name-sidebar-inlist black font-weight-500 font-roboto-sans pl-10px" :class="{'font-size-13' : clientWidth > 767, 'font-size-16' : clientWidth <= 767}"  @click="showSidebar = true">{{selectedProjectData.ProjectCode}} | {{selectedProjectData.ProjectName}}</span>
                            </div>
                        </div>
                        <SideBarSprintFolderData
                            v-for="subItem in sprintFolders"
                            :key="subItem.folderId"
                            :data="subItem"
                            :folder="true"
                            :selectedProjectData="selectedProjectData"
                            @click="selectedFolder(subItem)"
                            :isShowIcon="false"
                        />
                    </div>
                    </div>
                    <ConfirmationSidebar
                        v-model="showSidebar"
                        :title="'Are you sure want to convert this task into a List?'"
                        :acceptButtonClass="'btn-primary font-roboto-sans'"
                        :acceptButton="'Convert to list'"
                        @confirm="showSidebar = false,convertToListFun()">
                        <template #head>
                            <img @click="$emit('closeSidebar',false)" :src="closeImage" alt="closeImage" class="position-ab cursor-pointer close_image-icon">
                        </template>
                        <template #body>
                            <span class="d-block text-center convert-list-message font-size-16 font-weight-400 font-roboto-sans gray81 pt-17px important__note-desc" ><span class="red">Important:</span> You will lose all threaded comments. This action cant be undone</span>
                        </template>
                    </ConfirmationSidebar>
                </template>
            </Sidebar>
        </div>
        <div v-if="isFolder === false">
            <ConfirmationSidebar
                v-model="showSidebar"
                :title="'Are you sure want to convert this task into a List?'"
                :acceptButtonClass="'btn-primary font-roboto-sans'"
                :acceptButton="'Convert to list'"
                @confirm="showSidebar = false,convertToListFun()">
                <template #head>
                    <img @click="$emit('closeSidebar',false)" :src="closeImage" alt="closeImage" class="position-ab cursor-pointer close_image-icon">
                </template>
                <template #body>
                    <span class="d-block text-center convert-list-message font-size-16 font-weight-400 font-roboto-sans gray81 pt-17px important__note-desc"><span class="red">Important:</span> You will lose all threaded comments. This action cant be undone</span>
                </template>
            </ConfirmationSidebar>
        </div>
    </div>
</template>

<script setup>
    import { defineProps, ref, defineEmits, inject, computed, onMounted } from "vue";
    import { useStore } from "vuex";
    import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue";
    import taskClass from "@/utils/TaskOperations";
    import { useGetterFunctions } from "@/composable";
    import { useToast } from "vue-toast-notification";
    import { useRouter } from 'vue-router';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import SideBarSprintFolderData from "@/components/organisms/SideBarSprintFolderData/SideBarSprintFolderData.vue"
    import { dbCollections } from '@/utils/FirebaseCollections';
    import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";

    const {getUser} = useGetterFunctions();
    const {getters} = useStore();
    const $toast = useToast();
    const props = defineProps({
        openSidebar: {
            type: Boolean,
            default: false
        },
        task: {
            type: Object,
        }
    })
    const emit = defineEmits(["closeSidebar"]);
    const companyId = inject('$companyId');
    const selectedProjectData = inject('selectedProject');
    const userId = inject('$userId');
    const clientWidth = inject("$clientWidth");
    const router = useRouter();

    const showSidebar = ref(false);
    const selectedFolderData = ref({});
    const subtaskArr = ref([]);
    const closeImage = require("@/assets/images/svg/deletearchiveSvg.svg");
    const sprintOptions = ref([]);
    const isFolder = ref(false);

    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    })

    onMounted(() => {
        if(selectedProjectData.value.sprintsfolders && Object.values(selectedProjectData.value.sprintsfolders).length) {
            isFolder.value = true;
        }else{
            isFolder.value = false;
            showSidebar.value = true;
        }
        sprintOptions.value = [...(selectedProjectData.value?.sprintsObj ? Object.values(selectedProjectData.value.sprintsObj).filter((x) => !x.deletedStatusKey) : [])]
        if(selectedProjectData.value.sprintsfolders && Object.values(selectedProjectData.value.sprintsfolders).length) {
            Object.values(selectedProjectData.value.sprintsfolders).forEach((x) => {
                if(!x.deletedStatusKey) {
                    sprintOptions.value = [...sprintOptions.value, ...(Object.values(x?.sprintsObj)?.length ? Object.values(x.sprintsObj).filter((y) => !y.deletedStatusKey) : [])];
                }
            })
        }
    })

    const sprintFolders = ref(JSON.parse(JSON.stringify(selectedProjectData.value.sprintsfolders || {})));

    // Check subtask exist or not
    const checkSubTask = () => {
        return new Promise((resolve, reject) => {
            try {
                const query = {
                    type: "find",
                    collection: dbCollections.TASKS,
                    data: [
                        {
                            ParentTaskId: props.task._id
                        }
                    ]
                };

                mongodbCrudOperations(query).then((result) => {
                    if (result.length === 0) {
                        return resolve(true);
                    }
                    subtaskArr.value = result;
                    resolve(true);
                })
                .catch((error)=>{
                    console.error("ERROR in add project tags: ", error);
                })
            } catch (error) {
                reject(false);
                console.error(error,"error");
            }
        })
    }

    // Convert to list function
    const convertToListFun = () => {
        let isExist = false;
        sprintOptions.value.filter((x) => {
            if(x && x.name !== undefined && x.name.toLowerCase() === props.task.TaskName.toLowerCase()){
                $toast.error(`${x.name} is already exists`,{position: 'top-right'});
                isExist = true;
                emit("closeSidebar", false);
            }
        })
        if(isExist === false){
            emit("closeSidebar", false);

            checkSubTask().then((result)=>{
                if(result === true){
                    const user = getUser(userId.value)
                    const userData = {
                        id: user.id,
                        Employee_Name: user.Employee_Name,
                        companyOwnerId: companyOwner.value.userId,
                    }

                    taskClass.convertToList({
                        companyId: companyId.value,
                        projectData: {
                            id : selectedProjectData.value._id,
                            ProjectName : selectedProjectData.value.ProjectName
                        },
                        taskId : props.task._id,
                        userData : userData,
                        folderData : selectedFolderData.value ? selectedFolderData.value : null,
                        sprintObj : { 
                            id: props.task.sprintId,
                            folderId : props.task.folderObjId || null
                        },
                        isSubTask : subtaskArr.value.length > 0 ? true : false
                    }).then((response)=>{
                        if(response.data.status === true){
                            let sprintObj = response.data.data;
                            let parmasObj = {
                                cid: companyId.value,
                                id: selectedProjectData.value._id,
                                sprintId: sprintObj._id
                            }
                            if(sprintObj.folderId) {
                                parmasObj.folderId = sprintObj.folderId;
                            }
                            $toast.success("Converted sucessfully",{position: 'top-right'});
                            router.push({name: sprintObj?.folderId ? "ProjectFolderSprint" : "ProjectSprint", params: parmasObj});
                        }else{
                            $toast.error('Something went wrong',{position: 'top-right'});
                        }
                    }).catch((err)=>{
                        console.error('error',err);
                    })
                }
            })
        }
    }

    // Selected folder
    const selectedFolder = (folder) => {
        selectedFolderData.value = folder;
        showSidebar.value = true;
    }
</script>

<style scoped src="./style.css"></style>

