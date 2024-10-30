<template>
    <div class="ai-sidebar-wrapper">
        <Sidebar width="923px" className="ai-sidebar" v-if="currentCompany?.planFeature?.aiPermission">
            <template #head-left>
                <div></div>
            </template>
            <template #head-mid>
                <div>
                    <div class="d-flex flex-column">
                        <span class="font-size-22 font-weight-700 white text-center pb-20px">Ask AI to find or create anything</span>
                        <input type="search" placeHolder="What would you like AI to write about?" class="ai-input" v-model="search">
                    </div>
                </div>
            </template>
            <template #head-right>
                <div @click="$emit('closeAi')" class="close-image d-flex align-items-center justify-content-center"><img src="@/assets/images/svg/delete.svg" /></div>
            </template>
            <template #body>
                <template v-if="!isSpinner">
                    <div class="ai-sidebar-body" :class="[{'d-flex' : readMore === true}]">
                        <template v-if="filterCategories.length">
                            <div v-for="(item, index) in filterCategories" :key="index" class="prompt-wrapper cursor-pointer">
                                <template v-if="!readMore">
                                    <h3 class="p-10px">{{item.categoryName}}</h3>
                                    <div class="flex-wrap d-flex">
                                        <div v-for="(prompt, index) in filterPrompts.filter((x) => x.categoryRef === item.key).filter((x, index) => index < 7)" :key="index" class="prompt-div text-ellipsis font-size-12 font-weight-400 GunPowder" @click="openPromptDetail(prompt)">
                                            <span>{{prompt.title}}</span>
                                        </div>
                                        <span v-if="prompts.filter((x) => x.categoryRef === item.key).length > 7" @click="readMoreFun(item)" class="prompt-div text-ellipsis font-size-12 font-weight-400 GunPowder">Read More</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="read-more-div d-flex justify-content-center align-items-center" :class="[{'border-primary' : selectedCategory.key === item.key}]" @click="selectedCategory = item">
                                        <span>{{item.categoryName}}</span>
                                    </div>
                                </template>
                            </div>
                        </template>
                        <div v-else>
                            No Data Found
                        </div>
                    </div>
                    <div v-if="readMore" class="cursor-pointer">
                        <h3 class="p-10px">{{selectedCategory.categoryName}}</h3>
                        <div class="flex-wrap d-flex">
                            <div v-for="(prompt, ind) in prompts.filter((x) => x.categoryRef === selectedCategory.key)" :key="ind" class="prompt-div text-ellipsis">
                                <span class="font-size-12 font-weight-400 GunPowder" @click="openPromptDetail(prompt)">{{prompt.title}}</span>
                            </div>
                        </div>
                    </div>
                </template>
                <SpinnerComp v-else :is-spinner="isSpinner" />
            </template>
        </Sidebar>
        <Sidebar v-else-if="!currentCompany?.planFeature?.aiPermission" width="923px">
            <template #head-left>
                <span></span>
            </template>
            <template #head-right>
                <div @click="$emit('closeAi')" class="close-image d-flex align-items-center justify-content-center"><img src="@/assets/images/svg/delete.svg" /></div>
            </template>
            <template #body>
                <UpgradePlan
                buttonText="Upgrade Your Plan"
                lastTitle="To Unlock AI"
                secondTitle="Unlimited"
                firstTitle="Upgrade To"
                message="That feature isn’t available on your current plan"
            />
            </template>
        </Sidebar>
        <PromptSidebar v-if="isOpenPromptDetail" @closePrompt="isOpenPromptDetail = false" :selectedPrompt="selectedPrompt" @closeMainSidebar="$emit('closeAi')" @closeAllSidebar="$emit('closeAi')" />
    </div>
</template>

<script setup>
import { onMounted, ref, computed} from 'vue'
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue";
import PromptSidebar from "@/components/molecules/PromptSidebar/PromptSidebar.vue"
import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
import { useStore } from "vuex";
import * as env from '@/config/env';
import { apiRequest } from '../../../services';
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp'

const aiCategories = ref([]);
const prompts = ref([]);
const isOpenPromptDetail = ref(false);
const selectedPrompt = ref({});
const selectedCategory = ref({});
const readMore = ref(false);
const search = ref('');
const isSpinner = ref(false)

const { getters } = useStore();

const currentCompany = computed(() => getters["settings/selectedCompany"]);

onMounted(() => {
    isSpinner.value = true;
    apiRequest("post",env.GETAICATEGORY).then((result)=>{
        if(result.data.status === true){
            aiCategories.value = result.data.statusText;
        }
    }).catch(() => {
        isSpinner.value = false;
    })
    apiRequest("post",env.GETPROMPTS).then((result)=>{
        if(result.data.status === true){
            prompts.value = result.data.statusText;
            isSpinner.value = false;
        }else{
            isSpinner.value = false;
        }
    }).catch(() => {
        isSpinner.value = false;
    })
})

function openPromptDetail (data) {
    data.fields.forEach((x) => {
        if(x.type === 'text' || x.type === 'textArea'){
            x.value = '',
            x.error = ''
        }
    })
    isOpenPromptDetail.value = true;
    selectedPrompt.value = data;
}

function readMoreFun(item){
    readMore.value = true;
    selectedCategory.value = item;
}

const filterPrompts = computed(() => {
    if(search.value){
        return prompts.value.filter(x => x.title.toLowerCase().includes(search.value.toLowerCase()));
    }else{
        return prompts.value
    }
})

const filterCategories = computed(() => {
    const categoryRefs = filterPrompts.value.map(prompt => prompt.categoryRef);
    let data = aiCategories.value.filter(category =>
        categoryRefs.includes(category.key)
    );
    return data;
})
</script>
<style>
.import_category{
    background: linear-gradient(104.48deg, #80E1E5 2.11%, #3664DA 53.8%, #7D2AE7 100.06%);
    border: none;
    height: 30px;
}
.ai-sidebar-body{
    padding: 20px;
    background: #F4F5F7;
    box-shadow: 0px 2px 12px 3px #00000026;
}
.prompt-div{
    background: #FFFFFF;
    width: 200px;
    height: 38px;
    border: 1px solid #DFE1E6;
    border-radius: 6px;
    padding: 10px;
    width: calc(25% - 20px);
    max-width: calc(25% - 20px);
    margin: 0 10px 20px;
}
.prompt-wrapper{
    padding: 20px 5px;
    margin: 0 -10px;
}
.ai-sidebar .sidebar-content .sidebar-head {
    height: 178px !important;
    background: linear-gradient(104.48deg, #80E1E5 2.11%, #3664DA 53.8%, #7D2AE7 100.06%);
}
.ai-sidebar .close-image{
    text-align: center;
    width: 30px;
    height: 30px;
    background: #DFE1E6;
    position: absolute;
    top: 15px;
    right: 15px;
}
.read-more-div{
    border: 1px solid #DFE1E6;
    width: 106.14px;
    height: 88px;
    border-radius: 6px;
    text-align: center;
    margin: 0px 10px;
}
.ai-sidebar .ai-input{
    height: 44px;
    max-width: 100%;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    padding: 10px 20px 10px 20px;
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    color: #959595;
    font-size: 16px;
    width: 667px;
}
</style>