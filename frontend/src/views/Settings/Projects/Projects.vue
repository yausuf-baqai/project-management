<template>
    <div class="mainProjectlistingInSetting">
        <!-- <div class="form-mianDiv">
            <InputText
                placeholder="Search by project name"
            />
        </div> -->
        <div v-if="checkPermission('settings.settings_project_list') != null && checkPermission('project.project_details') != null">
            <div class="lising_mainDiv p-1 position-re">
                <div class="totalCountActiveClose d-flex justify-content-between position-re">
                    <input type="text" class="form-control project-search" v-model="searchValue" placeholder="Search"/>
                    <div class="d-flex">
                        <span class="tab-option" @click="activeTab = 0" :class="{'activeTab': activeTab === 0}">Open Project ({{filterActiveProjects && filterActiveProjects.length ? filterActiveProjects.length : 0 }})</span>
                        <span class="tab-option" @click="activeTab = 2" :class="{'activeTab': activeTab === 2}">Archive Project ({{filterArchiveProjects && filterArchiveProjects.length ? filterArchiveProjects.length : 0}})</span>
                        <span class="tab-option" @click="activeTab = 1" :class="{'activeTab': activeTab === 1}">Close Project ({{filterCloseProject && filterCloseProject.length ? filterCloseProject.length : 0}})</span>
                    </div>
                </div>
                <div v-if="activeTabProjects?.length">
                  <ProjectsListingSetting
                    v-for="(item, itemIndex) in paginatedItems"
                    :key="'item'+itemIndex"
                    :item="item"
                    :activeTab="activeTab"
                  />

            <div class="pagination">
                  <div class="showingEntries">
                        <div v-if="activeTabProjects === filterActiveProjects">
                             Showing {{ Math.min((currentPage - 1) * itemsPerPage + 1, filterActiveProjects.length) }}  to {{ Math.min(currentPage * itemsPerPage, filterActiveProjects.length) }} of {{ filterActiveProjects.length }} entries
                       </div>
                        <div v-else-if="activeTabProjects === filterCloseProject">
                            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filterCloseProject.length) }} of {{ filterCloseProject.length }} entries
                        </div>
                        <div v-else-if="activeTabProjects === filterArchiveProjects">
                            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filterArchiveProjects.length) }} of {{ filterArchiveProjects.length }} entries
                        </div>
                 </div>
                <div class="page_button">

                            <div  @click="goToPreviousPage"  :disabled="currentPage === 1">
                               <span><img @click="goToPreviousPage" src= "@/assets/images/svg/right_arrow.svg" /> Previous</span>
                            </div>
                           
                        
                        <div class="pagination-pages overflow-x-auto style-scroll">
                            <span
                                v-for="i in totalPages"
                                :class="{ active: currentPage === i }"
                                :key="i"
                                :id="`paginate${i}`"
                                @click="goToPage(i)"
                            >
                                {{ i }}
                            </span>
                        </div>
                        <div @click="goToNextPage" :disabled="currentPage === totalPages">
                            <span>Next <img @click="nextPage" src= "@/assets/images/svg/left_arrow.svg" /></span>
                         </div>
                </div>


                <div v-if="allProjects.length " class="itemsPerPageSelect">
                        <label for="itemsPerPageSelect">Items Per Page :</label>
                        <select id="itemsPerPageSelect" v-model="itemsPerPage" @change="updatePagination">
                            <option :value="5">5</option>
                            <option :value="10">10</option>
                            <option :value="15">15</option>
                            <option :value="20">20</option>
                        </select>
                 </div>

            </div>
            
        </div>
                <div v-else class="text-center">
                    <img :src="noSearch" alt="aliansoftware"/>
                    <div class="error-text">
                        <h2>No data found</h2>
                    </div>
                </div>
            </div>  
        </div>
        <div class="noproject-area" v-else>
            <img src="@/assets/images/access_denied_img.png">
        </div>
    </div>
</template>

<script setup>
import { defineComponent, onMounted, computed, ref,watch } from "vue";
import ProjectsListingSetting from "@/components/molecules/ProjectsListingSetting/ProjectsListingSetting.vue";
import { useProjectsHelper } from '@/views/Projects/helper';
import { useStore } from 'vuex';
import { useCustomComposable } from "@/composable";


const { dispatchProjects} = useProjectsHelper();
const {checkPermission} = useCustomComposable();
const {getters} = useStore();
const searchValue = ref("");
const activeTab = ref(0);
const noSearch = require("@/assets/images/svg/No-Search-Result.svg")
const currentPage = ref(1);
const itemsPerPage = ref(5);


onMounted(() => {
    dispatchProjects()
    .catch((error) => {
        console.error("ERROR: in set projects: ", error);
    })
})


watch([searchValue, activeTab], () => {
    currentPage.value = 1;
});

function updatePagination() {
  currentPage.value = 1;
}

const allProjects = computed(()=> {
    if ((searchValue.value).trim()) {
     let allPro = getters["projectData/projects"].data.filter((x) => x.ProjectName.toLowerCase()?.includes(searchValue.value.toLowerCase().trim()) || x.ProjectCode.toLowerCase()?.includes(searchValue.value.toLowerCase().trim()))
     return allPro        
    } else {
        return getters["projectData/projects"].data
    }
})

           
    
const closeProjects = computed(()=> {
    if (searchValue.value.trim()) {
        let allPro = getters["projectData/closeProject"].data.filter((x) => x.ProjectName.toLowerCase()?.includes(searchValue.value.toLowerCase()) || x.ProjectCode.toLowerCase()?.includes(searchValue.value.toLowerCase()))
        return allPro
    } else {
        return getters["projectData/closeProject"].data
    }
})

const filterActiveProjects = computed(() => {
    let activeProject = allProjects.value
    activeProject && activeProject.sort((a,b) => a.Created_At > b.Created_At ? -1 : 1)
    return activeProject?.filter((ele)=>{return ele.deletedStatusKey !== 1 && ele.deletedStatusKey !== 2}) || [];
})

const filterArchiveProjects = computed(() => {
    let allProject = allProjects.value
    allProject && allProject.sort((a,b) => a.Created_At > b.Created_At ? -1 : 1)
    return allProject?.filter((ele)=>{return ele.deletedStatusKey === 2});
})


const filterCloseProject = computed(() => {
    let closeProject = closeProjects.value
    closeProject && closeProject.sort((a,b) => a.Created_At > b.Created_At ? -1 : 1)
    return closeProject;
})


const activeTabProjects = computed(() => {
    if (activeTab.value === 0)
    return filterActiveProjects.value;
if (activeTab.value === 1) return filterCloseProject.value;
return filterArchiveProjects.value;
});




const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return activeTabProjects.value?.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(activeTabProjects.value?.length / itemsPerPage.value));


function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    document.getElementById(`paginate${currentPage.value}`).scrollIntoView({  behavior: "smooth"})
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;

    document.getElementById(`paginate${currentPage.value}`).scrollIntoView({  behavior: "smooth"})
  }
}

function goToPage(page) {
  currentPage.value = page;
}

defineComponent({
    name: "ProjectsComponent"
})
</script>

<style>
@import "./style.css";
</style>