<template>
    <div class="list__taskstatus-sidebar">
        <Sidebar width="374px" :zIndex="props.zTndex" :top="clientWidth <= 767 ? '0px' : '46px'" >
            <template #head-left>
                <div class="font-size-18 font-weight-700 black font-roboto-sans">{{title}}</div>
            </template>
            <template #head-right>
                <span class="add_status font-size-12 font-weight-400" v-if="isOpenAddStatus === false && isAddStatus === true" @click="isOpenAddStatus = true,formData.status.value = ''">+ Add Status</span>
                    <img :src="closeBlueImage" @click="isSidebarOpen = false,$emit('closesidebar',taskSelectedStatus)" />
            </template>
            <template #body>
                <div v-if="isOpenAddStatus && isAddStatus === true"  class="open__add-status position-re d-flex align-items-center justify-content-between bg-white">
                    <input type="color" v-if="props.type !== 'task_type'" v-model="statusColor" class="status__color-input position-ab">
                    <input v-if="props.type === 'task_type'" type="file" class="d-none"  ref="task_type_image" accept="image/*" @change="checkFile">
                    <button v-if="props.type === 'task_type'" class="cursor-pointer upload-image-btn btn-primary mr-10-px" type="button" @click="$refs.task_type_image.click()">
                        <img v-if="addNewtaskImage" :src="addNewtaskImage" class="projecttasktypeform__image__after"/>
                        <img v-else src="@/assets/images/svg/upload.svg" class="projecttasktypeform__image__before" alt="upload">
                    </button>
                    <InputText  
                        v-model="formData.status.value"
                        :placeholder="props.type === 'project_status' ?'Enter Project Status' : props.type === 'task_type' ? 'Enter Task Type' : 'Enter Task Status'"
                        class="project__statustask-type"
                        :maxLength="25"
                        :minLength="3"
                        :isDirectFocus="true"
                        :isOutline="false"
                        @keyup="checkErrors({'field':formData.status,
                        'name':formData.status.name,
                        'validations':formData.status.rules,
                        'type':formData.status.type,
                        'event':$event.event})"
                        @enter="addTaskStatus()"
                    />
                    <span class="cursor-pointer d-flex justify-content-end ml-13px confrm__cancel-wrapper">
                        <img :src="greenCheck" class="greenCheck_sidebar vertical-middle mr-13px" @click="addTaskStatus()">
                        <img :src="deleteRed" alt="cancel" @click="isOpenAddStatus = false,formData.status.error='',addNewtaskImage = ''" class="deleteRed_sidebar vertical-middle">
                    </span>
                    <div class="position-ab red font-size-11 error-text">{{formData.status.error}}</div>
                </div>
                <div class="overflow-y-auto sidebar-options overflow-x-hidden" :style="`height: ${!isOpenAddStatus && isAddStatus === true ? 'calc(100% - 0px);' : (clientWidth > 767 ? 'calc(100% - 70px);' : 'calc(100% - 90px);')}`">
                <SidebarItems
                    v-for="(item, itemIndex) in statusOptions"
                    :key="'item'+itemIndex"
                    :item="item"
                    :multiSelect="true"
                    :isDisable="true"
                    :selected="checkSelected(item)"
                    @select="(item) => updateItem('add', item)"
                    @remove="(item) => updateItem('remove', item)"
                    :taskType="true"
                    :removeKey="removeKey"
                />
                </div>
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
import { defineProps, ref, defineEmits, computed, inject} from "vue";
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import SidebarItems from "@/components/molecules/SidebarItems/SidebarItems.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { useStore } from "vuex";
import { useValidation } from "@/composable/Validation";
import * as env from '@/config/env';
import { useToast } from "vue-toast-notification";
import { dbCollections, settingsCollectionDocs } from "@/utils/FirebaseCollections";
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { apiRequestWithoutCompnay } from '../../../services';
import { useCustomComposable } from "@/composable";
const props = defineProps({
    isTaskSidebarOpen: {
        type: Boolean,
    },
    title: {
        type: String
    },
    options: {
        type:Array
    },
    isAddStatus: {
        type: Boolean,
        default:false
    },
    zTndex: {
        type:Number,
        default:7
    },
    type:{
        type:String,
        default:''
    },
    useDataArray: {
        type : Array,
        default: () => []
    }
})
const statusColor = ref('#AE5500');
const emit = defineEmits(["closesidebar","update:value","removed","selected"]);
const companyId = inject('$companyId')
const {getters} = useStore();
const  { checkErrors, checkAllFields } = useValidation();
const { checkBucketStorage } = useCustomComposable();
const $toast = useToast();
const clientWidth = inject("$clientWidth");
const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");
const greenCheck = require("@/assets/images/svg/greencheck2.svg");
const deleteRed = require("@/assets/images/svg/deletered.svg");
const defaultTaskType = inject("$defaultTaskStatusImg");

const isSidebarOpen = ref(props.isTaskSidebarOpen);
const isOpenAddStatus = ref(false);
const addNewtaskImage = ref("");
const taskImageFile = ref("")
const TaskStatusArray = computed(() => JSON.parse(JSON.stringify(getters["settings/AllTaskStatus"])));
const projectStatusArray = computed(() => JSON.parse(JSON.stringify(getters["settings/AllProjectStatus"])));
const taskTypeArray = computed(() => JSON.parse(JSON.stringify(getters["settings/AllTaskType"])));

const statusOptions = computed(() => {
    let arr = props.type === 'project_status' ? projectStatusArray.value.settings : props.type === 'task_type' ? taskTypeArray.value.settings : TaskStatusArray.value.settings;
    let data = arr.map((x)=>({...x,label:x.name}));
    data = data.map((x) => {
        if(checkDeletable(x) === true){
            removeKey.value.push(x.key);
        }
        const matchObj = props.options.find((firstObj) => firstObj.key === x.key)
        if (matchObj && matchObj.type) {
            return { ...x, type: matchObj.type };
        }
        return x;
    })
    return data;
})

const formData = ref({
    status: {
        value: '',
        rules:
        "required",
        name: "status",
        error: "",
    },
})

const taskSelectedStatus = ref(props.options);
// const taskStatusModel = ref('');
const removeKey = ref([1,2])

function updateItem(type, item) {
    if (type === "add") {
        if (taskSelectedStatus.value) {
            if (taskSelectedStatus.value.some((x) => x.key === item.key)) {
                return;
            }
            taskSelectedStatus.value.push(item);
            item.type = taskSelectedStatus.value.filter((x) => x.key === item.key)[0]?.type ? taskSelectedStatus.value.filter((x) => x.key === item.key)[0].type : 'active'
            emit('selected', item);
        }
    } else {
        if(taskSelectedStatus.value) {
            item.type = taskSelectedStatus.value.filter((x) => x.key === item.key)[0].type;
            if(props.isAddStatus === true && (item.key === 'default_active' || item.key === 'close')){
                return;
            }
            const value = taskSelectedStatus.value.filter((x) => x.key !== item.key);
            taskSelectedStatus.value = value;
            emit('removed', item);
        }
    }
}


function checkSelected(item) {
    if (taskSelectedStatus.value) {
        return taskSelectedStatus.value.some((x) => x.key === item.key);
    }
    return false;
}

function addTaskStatus () {
    checkAllFields(formData.value).then(async(valid) => {
        if(valid) {
            if(props.type === 'task_status'){
                isOpenAddStatus.value = false;
                let statusIndex = -1;
                statusIndex = TaskStatusArray.value.settings.findIndex((x) => x.name.toLowerCase() === formData.value.status.value.toLowerCase());
                if(statusIndex !== -1) {
                    $toast.error(`Status already exists`, {position: "top-right"});
                    return;
                }
                let obj = {
                    'bgColor':statusColor.value + '35',
                    'isDeleted':false,
                    'key':TaskStatusArray.value.totalStatus + 1,
                    'name':formData.value.status.value,
                    'textColor':statusColor.value
                }
                let queryObj = [
                    { 'name': settingsCollectionDocs.TASK_STATUS },
                    {
                        $inc: {"totalStatus": 1},
                        $push: {settings: {...obj}}
                    }
                ];
                const queryUpdate = {
                    type: "updateOne",
                    collection: dbCollections.SETTINGS,
                    data: queryObj
                };
                mongodbCrudOperations(queryUpdate).then(() => {
                    $toast.success(`Status added sucessfully`, {position: "top-right"});
                }).catch((error) => {
                    console.error(error,"Error in Add STATUS");
                })
            }else if(props.type === 'project_status'){
                isOpenAddStatus.value = false;
                let statusIndex = -1;
                statusIndex = projectStatusArray.value.settings.findIndex((x) => x.name.toLowerCase() === formData.value.status.value.toLowerCase());
                if(statusIndex !== -1) {
                    $toast.error(`Status already exists`, {position: "top-right"});
                    return;
                }
                let obj = {
                    'backgroundColor':statusColor.value + '35',
                    'isDeleted':false,
                    'key':8,
                    'name':formData.value.status.value,
                    'textColor':statusColor.value,
                    'value' : formData.value.status.value.toLowerCase().replaceAll(" ", "_")
                }
                let queryObj = [
                    { 'name': settingsCollectionDocs.PROJECT_STATUS },
                    {
                        $push: {settings: {...obj}},
                        $inc: {totalStatus: 1}
                    }
                ];
                const queryUpdate = {
                    type: "updateOne",
                    collection: dbCollections.SETTINGS,
                    data: queryObj
                };
                mongodbCrudOperations(queryUpdate).then(() => {
                    $toast.success(`Status added sucessfully`, {position: "top-right"});
                }).catch((error) => {
                    console.error(error,"Error in Add STATUS");
                })
            }
            else if(props.type === 'task_type'){
                isOpenAddStatus.value = false;
                let statusIndex = -1;
                statusIndex = taskTypeArray.value.settings.findIndex((x) => x.name.toLowerCase() === formData.value.status.value.toLowerCase());
                if(statusIndex !== -1) {
                    $toast.error(`Task Type already exists`, {position: "top-right"});
                    return;
                }
                let obj = {
                    'name': formData.value.status.value,
                    'taskCount': 0,
                    'value': formData.value.status.value.toLowerCase().replaceAll(" ",  "_"),
                    'isAddNewStatus':false,
                    'key': taskTypeArray.value.totalStatus + 1,
                    'isEditable': false,
                    'isDeleted': false,
                    'assignAsSubtask': false,
                    'assignAsTask': false,
                }
                if(taskImageFile.value!== ''){
                    const randomNumber = parseInt(Date.now() * Math.random());
                    const name = randomNumber + "_" + taskImageFile.value.name.replaceAll(" ", "_");
                    let filePath = `setting/task_type/${name}`;

                    const apiFormData = new FormData();
                    apiFormData.append("file", taskImageFile.value);
                    apiFormData.append("companyId", companyId.value);
                    apiFormData.append("path", filePath);
                    await apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, apiFormData, "form").then((res)=>{
                        if(res.data.status){
                            obj.taskImage = res.data.statusText;
                        }else{
                            obj.taskImage = defaultTaskType;
                        }
                    })
                }else{
                    obj.taskImage = defaultTaskType;
                }
                let queryObj = [
                    { 'name': settingsCollectionDocs.TASK_TYPE },
                    {
                        $push: {settings: {...obj}},
                        $inc: {totalStatus: 1}
                    }
                ];
                const queryUpdate = {
                    type: "updateOne",
                    collection: dbCollections.SETTINGS,
                    data: queryObj
                };
                mongodbCrudOperations(queryUpdate).then(() => {
                    addNewtaskImage.value = "";
                    $toast.success(`Task Type added sucessfully`, {position: "top-right"});
                }).catch((error) => {
                    console.error(error,"Error in Add STATUS");
                })
            }
        }
    })
}

function checkFile(e){
    try{
        let fileList = Array.from(e.target.files);
        if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters}) !== true){
            return;
        }
        const file = e.target.files[0];
        if(!file.type.includes("image")) {
            return;
        }
        var reader = new FileReader();
        reader.onload = (evt) => {
            addNewtaskImage.value = evt.target.result;   
        }
        reader.readAsDataURL(file);
        taskImageFile.value = file;
    }
    catch(error){
        console.error(error);
    }
}

const checkDeletable = (value) => {
    let data = false;
    if(props.type === 'task_type'){
        if(value.default === true){
            data = true;
        }else{
            data = props.useDataArray.some(x => x.TaskTypeKey === value.key);
        }
    }else if(props.type === 'task_status') {
        data = props.useDataArray.some(x => x.statusKey === value.key);
    }else{
        data = props.useDataArray.some(x => x.key === value.key);
    }
    return data;
}
</script>

<style scoped src="./style.css"></style>