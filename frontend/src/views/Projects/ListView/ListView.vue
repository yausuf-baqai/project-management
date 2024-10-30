<template>
    <div class="w-100 pr-20px pl-20px" v-if="isLoading">
        <div class="bg-white border-radius-8-px p-10px mb-15px">
            <div class="d-flex align-items-center mb-20px">
                <img :src="triangleBlack" alt="triangleBlack">
                <Skelaton class="border-radius-5-px ml-10px" style="height: 20px; width: 150px;"/>
            </div>
            <!-- <Skelaton v-for="i in 5" :key="i" class="border-radius-5-px skelaton__option mb-5px"/> -->
            <div v-for="i in 5" :key="i" class="sprint" style="background-color: #f4f5f7" :style="`${i == 5 ? 'margin-bottom: 0px !important;' : ''}`">
                <div class="d-flex align-items-center">
                    <Skelaton class="border-radius-5-px status-sprint" style="width: 80px;"/>
                    <Skelaton class="border-radius-5-px status-sprint ml-6px" style="width: 50px; height: 20px;"/>
                </div>
            </div>
        </div>
        <div v-for="i in 5" :key="i" class="bg-white border-radius-8-px p-10px mb-15px">
            <div class="d-flex align-items-center">
                <img :src="triangleBlack" alt="triangleBlack">
                <Skelaton class="border-radius-5-px ml-10px" style="height: 20px; width: 150px;"/>
            </div>
        </div>
    </div>
    <template v-else>
        <div class="list_view style-scroll" v-if="groupedTasks.length" id="list_scroll">
            <SprintListing
                v-for="(sprint, index) in groupedTasks"
                :key="sprint?.id"
                :sprint="sprint"
                :groupType="grouped"
                :commonDateFormatForDate="commonDateFormatForDate"
                :style="{marginBottom: index === groupedTasks.length - 1 ? '0px' : '15px', marginTop: index === 0 ? '15px' : ''}"
                :calendarDate="initialDate"
                @change="(sprintId) => {toggleSprints(sprintId)}"
                :calendarDateChange="calendarDateChange"
            />
        </div>
        <div class="list_view d-flex align-items-center justify-content-center flex-column" v-else>
            <img :src="noSearchResult" alt="noSearchResult">
            <h3 class="mt-1">No {{showArchived ? "Archived" : ""}} Data Found</h3>
        </div>
    </template>
</template>

<script setup>
// PACKAGES
import { ref, defineProps, defineEmits, nextTick, inject, watch, 
    onMounted, computed
} from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

// COMPONENTS
import SprintListing from "@/components/organisms/SprinstList/SprintsList.vue"
import Skelaton from "@/components/atom/Skelaton/Skelaton.vue"
import isEqual from 'lodash/isEqual';
import { taskListHelper } from '@/views/Projects/helper.js';

const triangleBlack = require('@/assets/images/svg/triangleBlack.svg');

// UTILS
const {getters} = useStore();
const route = useRoute()
const project = inject("selectedProject");
const showArchived = inject("showArchived");
const {
    groupBy,
    getSprintTasks,
    getMongoDBUpdate
} = taskListHelper();

// EMITS
defineEmits(['change'])

// PROPS
const props = defineProps({
    grouped: {
        type: Number,
        default: 0
    },
    commonDateFormatForDate: {
        type: String,
        default: "DD/MM/YYYY"
    },
    sprints: {
        type: Array,
        default: () => []
    },
    calendarDate: {
        type: [String,Number],
        default: ""
    },
    calendarDateChange: {
        type: Function,
        default: () => false
    }
})

// IMAGES
const noSearchResult = require("@/assets/images/svg/No-Search-Result.svg");

const groupedTasks = ref([]);
const expandedSprint = ref("");
const initialDate = ref(0);
const isLoading = ref(false);

const timer = ref(null);
function debouncer(timeout = 1000) {
    return new Promise((resolve) => {
        if(timer.value) {
            clearTimeout(timer.value);
        }
        timer.value = setTimeout(() => {
            resolve();
        }, timeout);
    })
}

function init (group,refetch,projects,sprints,groupedTasksData,isBoard,isInitial) {
    // props.calendarDateChange(false);
    if(isInitial == true){
        isLoading.value = true;
    }
    debouncer(1000).then(() => {
        groupBy(group,refetch,projects,sprints,groupedTasksData,isBoard,'list',(resp)=>{
            groupedTasks.value = resp;
            isLoading.value = false;
        });
    })
}

onMounted(() => {
    if(project.value && Object.keys(project.value).length) {
        init(props.grouped,true,project,props.sprints,groupedTasks,false,true);
    }
})
watch(route , (to, from) => {
    if (from?.query?.tab === "Calendar") {
        props.calendarDateChange(true, "calendar");
    }
})
const taskGetter = computed(() => JSON.parse(JSON.stringify(getters["projectData/tasks"])))
watch(taskGetter , () => {
    if(props.grouped === 1) {
        setTimeout(() => {
            init(props.grouped, false, project, props.sprints, groupedTasks, false,false);
        }, 500)
    }
})

watch([() => props.grouped, () => props.sprints], ([newGroup, newSprints], [oldGroup, oldSprints]) => {
    // if (props.calendarDate) {
        // initialDate.value = new Date().getTime();
        // props.calendarDateChange(true);
    // }
    if(project.value && Object.keys(project.value).length) {
        init(props.grouped, !isEqual(newGroup,oldGroup) || JSON.stringify(newSprints) !== JSON.stringify(oldSprints),project,props.sprints,groupedTasks,false,false);
    }
})

watch([() => props.calendarDate], (data) => {
    if (data && data.length) {
        const selectedDate = data[0];
        if (selectedDate) {
            initialDate.value = new Date(selectedDate).getTime()
        } else {
            initialDate.value = new Date().getTime()
        }
    } else {
        initialDate.value = new Date().getTime()
    }
})

function toggleSprints(sprintId) {
    groupedTasks.value.forEach((sprint) => {
        let SprintId = sprint?.id;
        if(SprintId === sprintId) {
            sprint.isExpanded = !sprint.isExpanded;
            if(sprint.isExpanded) {
                let promises = [];
                sprint.items.forEach((item) => {
                    promises.push(
                        getSprintTasks({projectId: project.value._id, sprintId: SprintId, item, projectData: project.value, groupType: props.grouped})
                    )
                })
                Promise.allSettled(promises)
                .then(() => {
                    nextTick(() => {
                        document.getElementById(`sprint_${SprintId}`).scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                            inline: "nearest"
                        });
                    })

                    getMongoDBUpdate({
                        projectId: project.value._id,
                        sprintId: sprint.id,
                        projectData: project.value,
                        groupBy: {type:  props.grouped, items: sprint.items?.map((x) => ({key: `${x.searchKey}_${x.searchValue}`, value: x.searchValue, name: x.name}))}
                    });
                })
                .catch((error) => {
                    console.error("ERROR in toggleSprints > Promise.allSettled: ", error);
                })
                expandedSprint.value = SprintId
            }
        } else {
            sprint.isExpanded = false;
        }
    })
}
</script>

<style>
@import "./style.css";
</style>