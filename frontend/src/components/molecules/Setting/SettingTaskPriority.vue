<template>
<div class="position-re">
    <SpinnerComp :is-spinner="isSpinner" />
        <div :class="[{'pointer-event-none':isSpinner}]">
            <h2 class="task_priority_wrapper_value">Task Priority</h2>
            <div class="mySettingSection priorityWrapper">
                <div class="tasktype_main">
                    <form v-if="props.editPermission" class="pb-20px"  @submit.prevent="savedata">
                        <div class="img_uploadpriority_wrapper align-items-center d-flex justify-content-between">
                            <div class="vs-component vs-con-input-label vs-input inputx vs-input-primary d-flex justify-content-between">
                                <div class="vs-con-input">
                                    <input type="text" v-model.trim="formData.priorityname.value"
                                        class="vs-inputx vs-input--input normal" name="priorityName"
                                        placeholder="Enter Priority Name" @keyup="checkErrors({
                                                'field': formData.priorityname,
                                                'name': formData.priorityname.name,
                                                'validations': formData.priorityname.rules,
                                                'type': formData.priorityname.type,
                                                'event': $event.event
                                            })" @input="confirmationErr=''"/>
                                    <div class="invalid-feedback red" v-if="confirmationErr">{{ confirmationErr }}</div>
                                    <div class="invalid-feedback red" v-else>{{ formData.priorityname.error }}</div>
                                </div>
                                <div class="from-group d-flex align-items-center" @click="$refs.fileInputUser.click()">
                                    <label class="cursor-pointer Upload_icon">
                                        <img :src="previewImage ? previewImage : Upload_icon" alt="Upload_icon">
                                    </label>
                                    <input type="file" ref="fileInputUser" @change="(e) => onSelectFile(e)" class="form-control-file d-none"
                                        id="priority_upload_img" @input="confirmationErr=''"/>
                                </div>
                            </div>
                            <div>
                                <span class="Upload_img_span">
                                        Maximum image size <span class="black"><b>250x250px</b></span>.
                                </span>
                            </div>
                        </div>
                        <div class="d-flex">
                            <button type="submit" class="blue_btn" id="blue_btn" :disabled="isDisabled">Save</button>
                            <button type="button" name="button"
                                class="vs-component vs-button white_btn vs-button-primary vs-button-filled" @click="emptyfileds()">
                                Cancel
                            </button>
                        </div>
                    </form>
                    <div class="milestone_status_button" v-for="(item, index) in arrayobject " :key="index">
                        <div class="con-vs-chip vs-chip-null">
                            <span class="text-chip vs-chip--text">
                                <div class="priorityWrapper d-flex align-items-center">
                                    <img v-if="!item.image || item.image === ''" :src="companyPrioritiesIcons(item.value).statusImage" alt="priority_img">
                                    <WasabiImage v-else :data="{ url: item.statusImage }" class="wasabi__priority-image"/>
                                    <span class="font_family_status">{{ item.name }}</span>
                                    <img class="cursor-pointer" :src="cancel_icon" alt="cancel" @click="deletetask(index,item)" v-if="item.isDeleted && props.editPermission">
                                </div>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ConfirmModal
            :modelValue="showConfirmModal"
            acceptButtonText="Confirm"
            :cancelButtonText="allowDeletePriority ? `Cancel` : `ok`"
            maxlength="150"
            :header="true"
            :showCloseIcon="false"
            @accept="removedata"
            @close="showConfirmModal = false"
            :acceptButton="allowDeletePriority"
            :className="allowDeletePriority ? '': 'setting_task_priority'"
        >
            <template #header>
                <h3 class="m-0" v-if="allowDeletePriority">Confirm</h3>
                <h3 class="m-0" v-else>Warning</h3>
            </template>
            <template #body>
                <span v-if="allowDeletePriority">Are you sure want to delete?</span>
                <div v-else class="d-flex align-items-center flex-column px-2">
                    <img :src="warnImage" alt="warnImage" class="warning__yellow-img" />
                    <span class="pb-15px">can't delete <strong>{{prioritieName}}</strong> Priority as it is already in use</span>
                </div>
            </template>
        </ConfirmModal>
</div>
</template>

<script setup>
import { onMounted, computed, ref, inject, defineComponent,defineProps } from "vue";
import { useToast } from 'vue-toast-notification';
import { useStore } from "vuex";
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
import { dbCollections, settingsCollectionDocs } from "@/utils/FirebaseCollections";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { useValidation } from "@/composable/Validation.js";
import ConfirmModal from '@/components/atom/Modal/Modal.vue';
import { companyPrioritiesIcons } from '@/composable/commonFunction';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import { apiRequestWithoutCompnay } from '../../../services';
import * as env from '@/config/env';
import { useCustomComposable } from "@/composable";

const showConfirmModal = ref(false);
const selectedvalue=ref(0);
const { checkErrors,checkAllFields } = useValidation();
const fileInputUser = ref();
const selectFile = ref();
const isImgeChange = ref(false);
const previewImage = ref();
const $toast = useToast();
const { getters } = useStore();
let arrayobject = ref([]);
const companyId = inject("$companyId");
const isSpinner = ref(false);
const confirmationErr = ref('')
const isDisabled=ref(false)
const cancel_icon =require('@/assets/images/svg/cancel_icon.svg')
const Upload_icon = require('@/assets/images/svg/Upload_blue-icon.svg')
const isValidIcon = ref(true)
const allowDeletePriority = ref(true);
const prioritieName = ref('');
const warnImage = require('@/assets/images/gif/warning-yellow.gif')
const formData = ref({

    priorityname: {
        value: "",
        rules:
            "required | min:3 | max:20",
        name: "Priority Name",
        error: ""
    }
})
defineComponent({
    name: 'Task-prioritie',
    SpinnerComp
})
const { checkBucketStorage } = useCustomComposable();
const props = defineProps({
    editPermission: {
        type: [Boolean],
        default: false
    }
})
const priorities = computed(() => getters["settings/companyPriority"]);


onMounted(() => {
    arrayobject.value = priorities.value;

});

//// image select function ////
function onSelectFile() {
    const input = fileInputUser.value;
    let fileList = Array.from(input.files);
    if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters}) !== true){
        return;
    }
    selectFile.value = input.files;
    if (selectFile.value && selectFile.value[0]) {
        const ext = selectFile.value[0].name.substring(selectFile.value[0].name.lastIndexOf(".") + 1);
        const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
        // Check valid image extension validation
        if (!extArray.includes(ext.toLowerCase())) {
            $toast.error('Select file only image and image file format should be jpg,jpeg,png', { position: 'top-right' })
            fileInputUser.value.value = null;
            return;
        }
        isValidIcon.value = true
        isImgeChange.value = true;
        var reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.src = e.target.result;
            previewImage.value = e.target.result
            image.onload = () => {
                const width = image.width;
                const height = image.height;
                if (width > 250 || height > 250) {
                    $toast.error('Image dimensions should not exceed 250x250 pixels.', { position: 'top-right' });
                    isValidIcon.value = false
                    previewImage.value = null
                    fileInputUser.value.value = null;
                    return
                }
        }}
        reader.readAsDataURL(input.files[0]);

    } else {
        fileInputUser.value.value = null;
    }
}

///UPDATE DATA IN DATABASE///
async function savedata() {
    const nameExists = arrayobject.value.some((item) => {
        return item.name.replaceAll(" ","").toLowerCase() === formData.value.priorityname.value.replaceAll(" ","").toLowerCase();
    });
    if (formData.value.priorityname.value.trim() === "") {
        confirmationErr.value = "The priority name field is required"
        return
    }
    if (formData.value.priorityname.value.length < 3) {
        confirmationErr.value =('The priority name field must be at least 3 characters');
        return
    }
    if(selectFile.value == null || isValidIcon.value == false)
    {
        confirmationErr.value = "The priority image field is required"
        return
    }
    if (nameExists) {
        confirmationErr.value=('Priorities already Exists ');
    } else {
        checkAllFields(formData.value).then(async(valid)=>{
            if(valid && confirmationErr.value === ''){
        if (isImgeChange.value) {
            isSpinner.value = true;
            isDisabled.value =true
            const randomNumber = parseInt(Date.now() * Math.random());
            const name = randomNumber + "_" + selectFile.value[0].name.replaceAll(" ", "_");
            const filePath = `taskPriorities/${name}`
            // let storageFolder = `${companyId.value}/taskPriorities/`;
            // await firebaseUpload(selectFile.value[0], storageFolder, name).then((imgURL) => {
            //     previewImage.value = imgURL;
            //     confirmationErr.value ='';
            //     selectFile.value = null
            // });

            const apiFormData = new FormData();
            apiFormData.append("file", selectFile.value[0]);
            apiFormData.append("path", filePath);
            apiFormData.append("companyId", companyId.value);
            await apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, apiFormData, "form").then((res)=>{
                if(res.data.status){
                    previewImage.value = res.data.statusText;
                } else {
                    previewImage.value = "";
                }
            })
            if(!previewImage.value){
                isSpinner.value = false;
                isDisabled.value = false;
                $toast.error('error in uploading image please try it again', { position: 'top-right' });
                return;
            }
            let obj = {
                name: formData.value.priorityname.value,
                image: previewImage.value,
                statusImage: previewImage.value,
                value: formData.value.priorityname.value.toUpperCase(),
                isDeleted: true,
                isExpanded: true
            };

          let updateObj = [
           { 'name': settingsCollectionDocs.TASK_PRIORITIES },
               {
                     $push: { settings: obj },
                     $set: {updatedAt: new Date()}
               }
             ];
          const queryUpdate = {
                        type: "updateOne",
                        collection: dbCollections.SETTINGS,
                        data: updateObj
          }; 
          mongoQuery.mongodbCrudOperations(queryUpdate).then(() => {
                isSpinner.value = false;
                isDisabled.value =false;
                $toast.success("Task priority updated successfully.", { position: 'top-right' });
                previewImage.value=''
                fileInputUser.value.value = null;
                arrayobject.value.push(obj);
            }).catch((error) => {
                $toast.error(error.message, { position: 'top-right' });
                fileInputUser.value.value = null;
            })
            formData.value.priorityname.value = '',
            formData.value.priorityname.error = ''
            confirmationErr.value ='';
        }
        else {
            confirmationErr.value =('please select image ');
            fileInputUser.value.value = null;
        }
    }})
    }
    
}

///Delete Selected Data function ///
function emptyfileds(){
    isImgeChange.value = false;
        formData.value.priorityname.value = ''
        previewImage.value = ''
        formData.value.priorityname.error=''
        confirmationErr.value ='';
}
function deletetask(value,detail){
    let query = [
        {
            "$match": {
                "$and": [
                    {           
                        "Task_Priority": {
                            "$in": [detail.value]
                        }       
                    },
                    {
                        "deletedStatusKey":{ $nin: [1] }
                    }
                ]
            }
        },
        {
            "$count": "count"
        }
    ];
    const queryUpdate = {
        type:"aggregate",
        collection: dbCollections.TASKS,
        data:[query]
    };
    mongoQuery.mongodbCrudOperations(queryUpdate).then((res) => {
        if(res[0] && res[0]?.count > 0){
            allowDeletePriority.value = false;
            prioritieName.value = detail.name;
        }else{
            allowDeletePriority.value = true;
            selectedvalue.value = value;
            prioritieName.value = "";
        }
        showConfirmModal.value = true;
    }).catch((err)=>{
        console.error('ERROR',err);
    });
}
function removedata() {
    let obj = arrayobject.value[selectedvalue.value];
    if(obj && Object.keys(obj).length){
        let queryObj = [
            { 'name': settingsCollectionDocs.TASK_PRIORITIES },
            {
                $pull: { settings: obj },
                $set: {updatedAt: new Date()}
            },
            true,
            false
        ];
        const queryUpdate = {
            type: "updateOne",
            collection: dbCollections.SETTINGS,
            data: queryObj
        };
        mongoQuery.mongodbCrudOperations(queryUpdate).then(() => {
            arrayobject.value.splice(selectedvalue.value,1)
            isSpinner.value = false;
            $toast.success("Task priority Remove successfully.", { position: 'top-right' });
            isImgeChange.value = false;
            formData.value.priorityname.value = ''
            previewImage.value = ''
            formData.value.priorityname.error=''
            confirmationErr.value ='';
            showConfirmModal.value = false;
            selectedvalue.value = 0;
        }).catch((error) => {
            $toast.error(error.message, { position: 'top-right' });
        })
    }else{
        $toast.error('error in deleting priority please try it again', { position: 'top-right' });
    }
}
</script>

<style scoped>
.warning__yellow-img{
    width: 100px;
    height: 100px;
}
@import './style.css'
</style>