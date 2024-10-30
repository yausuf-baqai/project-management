<template>
    <div>
        <Sidebar
            width="1545px"
            :defaultLayout="false"
            :visible="isTaskDetailSideBar"
            @update:visible="() => $emit('toggleTaskDetail', task)"
            className="task-detail-sidebar"
            headClass="task-detail-head"
            :zIndex="props.zIndex"
            :top="props.top"
        >
            <template #head-left>
                <Skelaton v-if="isSpinner" class="breadcrubm-skeleton"/>
                <TaskDetailNavBar
                    v-if="task !== undefined && clientWidth > 764 && !isSpinner && !isSupport"
                    :taskKey="task.TaskKey"
                    :isParent="task.isParentTask"
                    :sprintName="task.sprintData && task.sprintData.length > 0 ? task.sprintData[0].name : ''"
                    :isFolderSprint="task.sprintArray && task.folderObjId ? true : false"
                    :folderName="task.folderData && task.folderData.length ? task.folderData[0].name : ''"
                    :parentKey="parentTask ? parentTask.TaskKey : ''"
                    :projectName="projectData ? projectData.ProjectName : ''"
                    @open="(val) => open(val)"
                />
                <TaskDetailTitle
                    v-if="task !== undefined && !isSpinner"
                    :taskName="task.TaskName"
                    :isSupport="isSupport"
                    :taskType="task.TaskTypeKey"
                    :favourites="task.favouriteTasks"
                    :userId="user.id"
                    @update:favourite="(val) => updateFavourite()"
                    @update:taskName="(val) => updateTaskName(val)"
                />
            </template>
            <template #head-right>
                <TaskDetailAction
                    v-if="task !== undefined && isSupport === false"
                    :watchers="task.watchers"
                    @open="(val) => open(val)"
                    @update:watchers="(userId, type) => updateWatchers(userId, type)"
                    @close="$emit('toggleTaskDetail' , task, true)"
                    :task="task"
                />
                <div class="task-detail-action" v-if="isSupport === true">
                    <ul class="task-detail-action-ul">
                        <li class="close-icon" @click="$emit('toggleTaskDetail' , task, true)">
                            <img src="@/assets/images/svg/delete.svg" />
                        </li>
                    </ul>
                </div>
            </template>
            <template #body>
                <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
                <TaskDetailBody
                    v-if="task !== undefined && !isSpinner"
                    :task="task"
                    :parentTask="parentTask"
                    :clientWidth="clientWidth"
                    @open="(val) => open(val)"
                    :taskStatusIndex="10"
                    :zIndexAssigne="10"
                    :zIndexPriority="10"
                    :zIndexEstimate="10"
                    :isSupport="isSupport"
                />
            </template>
        </Sidebar>

        <Sidebar
            className="task-sub-sidebar"
            v-model:visible="isSidebar"
            :title="sidebarTitle"
            width="375px"
            :zIndex="10"
        >
            <template #body>
                <FileAndLinks
                    v-if="sidebarTitle === 'Files & Links'"
                    :attachments="task.attachments"
                    :description="task.description"
                    :handleType="'task'"
                    @closeSidebar="(val) => isSidebar = val"
                    :selectedData="task"
                />
                <TaskAudioFiles
                    v-else-if="sidebarTitle === 'Audio Files'"
                    :fromWhich="'task'"
                    :key="`${task?._id}${Date.now() * Math.random() * 10000}` + 'task'"
                    :selectedData="task"
                />
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
    import { computed, defineProps, inject, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
    import { useGetterFunctions } from '@/composable';
    // import { useDocument } from 'vuefire';
    import { useRouter,useRoute } from 'vue-router';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import taskClass from "@/utils/TaskOperations";

    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue'
    import TaskDetailNavBar from '@/components/molecules/TaskDetailNavBar/TaskDetailNavBar.vue'
    import TaskDetailTitle from '@/components/molecules/TaskDetailTitle/TaskDetailTitle.vue'
    import TaskDetailAction from '@/components/molecules/TaskDetailAction/TaskDetailAction.vue'
    import TaskDetailBody from '@/components/organisms/TaskDetailBody/TaskDetailBody.vue'
    import FileAndLinks from '@/components/molecules/FileAndLinks/FileAndLinks.vue'
    import TaskAudioFiles from '@/components/molecules/TaskAudioFiles/TaskAudioFiles.vue'
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import Skelaton from '@/components/atom/Skelaton/Skelaton.vue';

    import { useStore } from 'vuex';
    import { useToast } from 'vue-toast-notification';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
    import * as mongoSnap from "@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot"
    import { BSON } from 'realm-web';

    const emit = defineEmits(["toggleTaskDetail"]);
    const props = defineProps({
        companyId:{ type: String, default: '' },
        projectId:{ type: String, default: '' },
        sprintId:{ type: String, default: '' },
        taskId:{ type: String, default: '' },
        isTaskDetailSideBar:{type:  Boolean  ,default: false },
        zIndex:{ type: Number, default:  7},
        top:{ type: String },
        isSupport:{
            type:Boolean,
            default:false
        }
    });

    const router = useRouter();
    const route = useRoute();
    const { getters } = useStore();
    const { getUser } = useGetterFunctions();

    // const toggleTaskDetail = inject('toggleTaskDetail')
    const $toast = useToast();
    let isTaskDetailSideBar = ref(props.isTaskDetailSideBar);

    const parentTask = ref(null);
    const isSidebar = ref(false);
    const sidebarTitle = ref('');
    const sprintData = ref([])
    const folderData = ref({})

    // PROJECT DATA
    const snap = ref(null);
    const projectData = ref({});

    const clientWidth = ref(document.documentElement.clientWidth);
    window.addEventListener('resize', (e) => {
        clientWidth.value = e.target.innerWidth;
    });

    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    });

    const user = getUser(inject('$userId').value);
    const isSpinner = ref(true);

    // Get task details from MongoDB
    const task = ref({});
    let options = {
        subCollection : dbCollections.TASKS,
        watchFilter: {
            filter: {
                'fullDocument._id': BSON.ObjectID(props.taskId)
            }
        }
    }

    let query = [
        {
            $match: {_id : BSON.ObjectID(props.taskId)}
        },
        {
            $lookup: {
                from: dbCollections.SPRINTS,
                localField: "sprintId",
                foreignField: "_id",
                as: "sprintData",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                        },
                    },
                ],
            }
        },
        {
            $lookup: {
                from: dbCollections.FOLDERS,
                localField: "folderObjId",
                foreignField: "_id",
                as: "folderData",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                        },
                    },
                ],
            }
        },
    ];

    let getQuery = {
        type : "aggregate",
        collection : dbCollections.TASKS,
        data:[query]
    }

    mongoSnap.mongodbSnapshot(options,({error, data, type}) => {
        if(error) {
            console.error("ERROR in get task: ", error)
            isSpinner.value = false;
        } else {
            if(type === "inital") {
                mongoQuery.mongodbCrudOperations(getQuery)
                .then((res) => {
                    task.value = res[0];
                    isSpinner.value = false;
                })
                .catch((error) => {
                    console.error("ERROR in get roles: ", error);
                })
            }else if(type === 'update'){
                task.value = {...task.value, ...data.fullDocument};
                isSpinner.value = false;
            }else if(type === 'delete'){
                task.value = {};
                isSpinner.value = false;
            }
        }
    })

    const updateTaskName = (val) => {
        if(!val?.trim()?.length) return;
        const userData = {
            id: user.id,
            name: user.Employee_Name,
            companyOwnerId: companyOwner.value.userId,
        }

        const firebaseObj = {
            'TaskName': val
        }
        let obj = {
            'previousTaskName': task.value.TaskName,
            'userName' : userData.name
        }
        const project = {
            _id: projectData.value._id,
            CompanyId: projectData.value.CompanyId,
            lastTaskId: projectData.value.lastTaskId,
            ProjectName: projectData.value.ProjectName,
            ProjectCode: projectData.value.ProjectCode
        }

        taskClass.updateTaskName({firebaseObj, projectData: project, taskData: task.value, obj, userData})
        .then(() => {
            $toast.success(`Task name updated successfully`, {position: "top-right"})
        })
        .catch((err) => {
            console.error(err);
        })
    }

    const updateFavourite = () => {
        taskClass.markAsFavourite({
            companyId: projectData.value.CompanyId,
            projectId: projectData.value._id,
            sprintId: props.sprintId,
            taskData: task.value,
            userId: user.id,
        })
        .then(({statusText}) => {
            $toast.success(statusText, {position: "top-right"})
        })
        .catch((error) => {
            console.error("ERROR in markAsFavourite: ", error);
        })
    }

    const updateWatchers  =  (userId, type) => {
        const operationtype = (type === "add") ? true : false
        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: companyOwner.value.userId,
        }
        taskClass.updateWatcher({
            companyId: projectData.value.CompanyId,
            projectId: projectData.value._id,
            sprintId: props.sprintId,
            taskId: props.taskId,
            userId: userId,
            add: operationtype,
            userData: userData,
            employeeName : getUser(userId)?.Employee_Name
        }).then(() => {
            $toast.success(`Watcher ${type === "add" ? 'added' : 'removed'} successfully`, {position: "top-right"});
        }).catch((error) => {
            console.error("ERROR in updateWatcher: ", error);
        });
    }

    const open = (val) => {
        switch (val) {
            case 'project':
                emit("toggleTaskDetail",task.value,true);
                router.push({
                    name: 'Project',
                    params: {
                        cid: props.companyId,
                        id: props.projectId
                    }
                })
                break;
            case 'sprint':
                emit("toggleTaskDetail",task.value,true);
                if(task.value.folderObjId) {
                    router.push({
                        name: 'ProjectFolderSprint',
                        params: {
                            cid: props.companyId,
                            id: props.projectId,
                            sprintId: props.sprintId,
                            folderId: task.value.folderObjId
                        }
                    });
                } else {
                    router.push({
                        name: 'ProjectSprint',
                        params: {
                            cid: props.companyId,
                            id: props.projectId,
                            sprintId: props.sprintId
                        }
                    })
                }
                break;
            case 'parent':
                if(parentTask.value) {
                   emit("toggleTaskDetail",parentTask.value);
                    if(parentTask.value.sprintArray.isFolderSprint) {
                        nextTick(() =>{router.push({
                            name: 'ProjectFolderSprintTask',
                            params: {
                                cid: props.companyId,
                                id: props.projectId,
                                sprintId: props.sprintId,
                                folderId: parentTask.value.folderObjId,
                                taskId: task.value.ParentTaskId
                            }
                        })})
                    } else {
                        nextTick(() =>{router.push({
                            name: 'ProjectSprintTask',
                            params: {
                                cid: props.companyId,
                                id: props.projectId,
                                sprintId: props.sprintId,
                                taskId: task.value.ParentTaskId
                            }
                        })})
                    }
                }

                break;
            case 'folder':
                if(task.value.folderObjId) {
                    emit("toggleTaskDetail",task.value,true);
                    router.push({
                        name: 'ProjectFolder',
                        params: {
                            cid: props.companyId,
                            id: props.projectId,
                            folderId: task.value.folderObjId
                        }
                    });
                }
                break;
            case 'filesLinks':
                isSidebar.value = true;
                sidebarTitle.value = 'Files & Links';
                break;
            case 'audio':
                isSidebar.value = true;
                sidebarTitle.value = 'Audio Files';
                break;
            default:
                break;
        }
    }

    watch(task, (oldVal) => {
        if(oldVal && task.value && task.value.isParentTask == false && task.value.ParentTaskId){
            getParentTask()
        }
    })

    function getSprintData(id) {
        return new Promise((resolve, reject) => {
            try {
                if(Object.keys(getters["projectData/sprints"]).includes(id)){
                    sprintData.value = getters["projectData/sprints"][id];
                    resolve(sprintData.value,true);
                    return;
                }
                let projectId = id;
                const uid = companyOwner.value.userId;
                let publicQuery = {
                    private:false,
                    projectId : BSON.ObjectId(projectId)
                }
                let privateQuery = {
                    private:true,
                    projectId : BSON.ObjectId(projectId)
                }
                if(companyOwner.value.roleType !== 1 && companyOwner.value.roleType !== 2) {
                    privateQuery.AssigneeUserId = {
                        $in:[uid]
                    }
                }
                const query = [
                    {
                        $match: {
                            $or: [
                                privateQuery,
                                publicQuery
                            ]
                        }
                    }
                ];
                let getQuery = {
                    type : "aggregate",
                    collection:dbCollections.SPRINTS,
                    data: [query]
                }
                mongoQuery.mongodbCrudOperations(getQuery).then((sprintss) => {
                    sprintData.value = sprintss;
                    resolve(sprintss);
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
                    folderData.value = getters["projectData/folders"][id];
                    resolve(folderData.value,true);
                    return;
                }
                let projectId = id;
                let publicQuery = {
                    private:false,
                    projectId : BSON.ObjectId(projectId)
                }
                let privateQuery = {
                    projectId : BSON.ObjectId(projectId)
                }
                const query = [
                    {
                        $match: {
                            $or: [
                                privateQuery,
                                publicQuery
                            ]
                        }
                    }
                ];
                let getQuery = {
                    type : "aggregate",
                    collection:dbCollections.FOLDERS,
                    data: [query]
                }
                mongoQuery.mongodbCrudOperations(getQuery).then((folders) => {
                    resolve(folders);
                    folderData.value = folders;
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    const getSprintFolderData = async (id) => {
        try {
            return new Promise((resolve,reject) => {
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
                        let allSprints = sprintsArray ? sprintsArray : []

                        let allFolders = foldersObject ? foldersObject : {}

                        const sprintIdToObject = {};
                        allSprints.forEach(item => {sprintIdToObject[item.id] = item;});
                        resolve({sprints:sprintIdToObject,folders:allFolders})
                    } else {
                        console.error("One or more promises were rejected");
                        reject()
                    }
                })
                .catch((error) => {
                    reject(error)
                    console.error("Error in Promise.allSettled", error);
                });
            })
        } catch (error) {
            console.error("ERROR", error);
        }
    }

    onMounted(() => {
        if(route.query?.detailTab) {
            router.replace({query: {...route.query}})
        }
        try {
            let options = {
                subCollection : dbCollections.PROJECTS,
                watchFilter: {
                    filter: {
                        'fullDocument._id':props.projectId
                    }
                }
            }

            let getQuery = {
                type : "findOne",
                collection : dbCollections.PROJECTS,
                data:[
                    {
                        _id: BSON.ObjectID(props.projectId)
                    }
                ]
            }
            getSprintFolderData(props.projectId).then((resp) => {
                mongoSnap.mongodbSnapshot(options,({error, data, type}) => {
                    if(error) {
                        console.error("ERROR in get project: ", error)
                    } else {
                        if(type === "inital") {
                            mongoQuery.mongodbCrudOperations(getQuery)
                            .then((res) => {
                                projectData.value = res;
                                projectData.value.sprintsObj = resp.sprints;
                                projectData.value.sprintsfolders = resp.folders;
                            })
                            .catch((error) => {
                                console.error("ERROR in get roles: ", error);
                            })
                        }else if(type === 'update'){
                            projectData.value = data.fullDocument;
                            projectData.value.sprintsObj = resp.sprints;
                            projectData.value.sprintsfolders = resp.folders;
                        }
                    }
                })
            });
            if(task.value && Object.keys(task.value).length > 0){
                getParentTask();
            }
        } catch (error) {
            console.error("ERROR in get project: ", error)
        }
    })
    provide("selectedProject", projectData);

    function getParentTask() {
        if(task?.value?.ParentTaskId) {
            const queryRef = mongoQuery.mongodbCrudOperations({
                type: "findOne",
                collection: dbCollections.TASKS,
                data: [
                    { _id: BSON.ObjectID(task.value.ParentTaskId) }
                ]
            });

            queryRef.then((response) => {
                parentTask.value = response;
            })
        }
    }

    onUnmounted(() => {
        // DETACH
        if(snap.value !== null) {
            snap.value();
        }
    })
</script>
<style src="./style.css"></style>