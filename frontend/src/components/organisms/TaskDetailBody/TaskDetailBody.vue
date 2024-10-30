<template>
    <div class="h-100">
        <div class="task-detail-body-header">
            <TabListHeader
                :tabs="tabs"
                :activeTab="activeTab"
                @changeTab="changeTab"

                :commentCounts="myCounts"
            />
        </div>
        <div v-if="clientWidth <=767" class="task-body-buttons">
            <button :class="isDetail ? 'outline-secondary' : 'btn-primary'" @click="isDetail == true ? isDetail = false : ''">Description</button>
            <button :class="isDetail ? 'btn-primary' : 'outline-secondary'" @click="isDetail == false ? isDetail = true : ''">Details</button>
        </div>
        <div class="d-flex bg-light-gray mt--15px taskdetail__leftright-wrapper">
            <div class="task-detail-leftside task__detail-padding" v-if="clientWidth > 767 || !isDetail" :style="{'width': (clientWidth > 767 ? 'calc(100% - 375px)' : 'width:95%'), padding: ['comment', 'activity'].includes(activeTab) ? '' : '20px 18.5px'}">
                <TaskDetailTab
                    v-if="activeTab === 'task-detail-tab'"
                    :task="task"
                    @openSeeAll="$emit('open', 'filesLinks')"
                    :isSupport="isSupport"
                />
                <Comments
                    v-else-if="activeTab === 'comment' && Object.keys(projectData).length"
                    :taskId="task._id"
                    :parentTaskId="task?.ParentTaskId"
                    :sprintId="task.sprintId"
                    :folderId="task.folderObjId || null"
                    :userIds="commentUsers"
                    :watchers="[...(task?.watchers || [])]"
                    :title="task?.TaskName"
                    :checklistArray="task?.checklistArray"
                    :sprintName="task.sprintArray.name"
                    :folderName="task.sprintArray.folderName"
                    :productData="{customerId, productName}"
                    :forSupport="isSupport || isSupportProject"
                />
                <ActivityLog
                    v-else-if="activeTab === 'activity' && !isSupport"
                    :dataObj="task"
                    :fromProject="false"
                />
                <TimeLog v-else-if="activeTab === 'time-log'" :task="task" />
            </div>
            <TaskDetailRightSide
                v-if="clientWidth > 767 || isDetail"
                :task="task"
                :parentTask="parentTask"
                :taskStatusIndex="props.taskStatusIndex"
                :zIndexAssigne="props.zIndexAssigne"
                :zIndexPriority="props.zIndexPriority"
                :zIndexEstimate="props.zIndexEstimate"
                :isSupport="isSupport"
            />
        </div>
    </div>
</template>

<script setup>
    import { ref, defineProps, computed, inject, onMounted, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useStore } from 'vuex';

    import TabListHeader from '@/components/molecules/TabListHeader/TabListHeader.vue'
    import TaskDetailTab from '@/components/molecules/TaskDetailTab/TaskDetailTab.vue'
    import TaskDetailRightSide from '@/components/organisms/TaskDetailRightSide/TaskDetailRightSide.vue'
    import Comments from '@/views/Projects/Comments/Comments.vue'
    import ActivityLog from '@/components/templates/ActivityLog/ActivityLog.vue'
    import TimeLog from '@/views/TimeLog/TimeLog.vue'

    const {getters} = useStore();

    const props = defineProps({
        task: Object,
        clientWidth: Number,
        parentTask: Object,
        taskStatusIndex: {
            type: Number,
            default: 7
        },
        zIndexAssigne: {
            type: Number,
            default: 7
        },
        zIndexPriority: {
            type: Number,
            default: 7
        },
        zIndexEstimate: {
            type: Number,
            default: 7
        },
        isSupport:{
            type:Boolean,
            default:false
        }
    });

    const sprintData = computed(() => {
        let sprintData = false;
        if (projectData.value && props.task) {
            sprintData = props.task.folderObjId ? projectData.value?.sprintsfolders?.[props.task.folderObjId]?.sprintsObj?.[props.task.sprintId] : projectData.value?.sprintsObj?.[props.task.sprintId]
        }

        return sprintData || null;
    })

    const router = useRouter();
    const route = useRoute();
    watch(route, (newVal) => {
        activeTab.value = newVal.query.detailTab
    })

    const projectData = inject("selectedProject");
    const users = computed(() => getters["settings/companyUsers"]?.map((x) =>x.userId));

    const activeTab = ref('');
    const isSupportProject = computed(() => process.env.VUE_APP_SUPPORT_PROJECTID === projectData.value._id)

    const customerId = ref(props.task?.customField?.[process.env.VUE_APP_CUSTOMFIELDID]?.fieldValue);
    const productName = ref(props.task?.customField?.[process.env.VUE_APP_CUSTOMFIELDPRODUCTID]?.fieldValue);

    onMounted(() => {
        if(!route.query?.detailTab) {
            router.replace({query: {detailTab: "task-detail-tab"}})
        }
        activeTab.value = route.query.detailTab ? route.query.detailTab : 'task-detail-tab'
    })

    const myCounts = computed(() => getters["users/myCounts"]?.data?.[`task_${projectData.value._id}_${props.task.sprintId}_${props.task._id}_comments`] || 0)

    const tabs = ref({
        'task-detail-tab': {
            name: 'Task Detail',
            activeIcon: require('@/assets/images/svg/tab1Icon.svg'),
            inactiveIcon: require('@/assets/images/svg/tab1Icon.svg'),
        }, 
        'comment': {
            name: 'Comments',
            activeIcon:require('@/assets/images/svg/tab2Icon.svg'),
            inactiveIcon:require('@/assets/images/svg/tab2Icon.svg'),
        },
        'activity':{
            name: 'Activity Log',
            activeIcon:require('@/assets/images/svg/tab3Icon.svg'),
            inactiveIcon:require('@/assets/images/svg/tab3Icon.svg'),
        }, 
        'time-log':{
            name: 'Time Log',
            activeIcon:require('@/assets/images/svg/tab4Icon.svg'),
            inactiveIcon:require('@/assets/images/svg/tab4Icon.svg'),
        }
    });

    const changeTab = (tab) => {
        activeTab.value = tab;
        router.replace({...route, query: {...route.query, detailTab: tab}})
    }

    const isDetail = ref(false);

    const commentUsers = computed(() => {
        let tmp = [];

        if(sprintData.value?.private) {
            tmp = Array.from(new Set([...(sprintData.value?.AssigneeUserId || []), ...(props.task.watchers || [])]))
        } else if(projectData.value?.isPrivateSpace) {
            tmp = [...(projectData.value?.AssigneeUserId || [])]
        } else {
            tmp = [...(users.value || [])]
        }
        return tmp;
    })
</script>
<style src="./style.css"></style>