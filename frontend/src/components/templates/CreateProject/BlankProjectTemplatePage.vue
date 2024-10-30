<template>
<div>
    <div class="createprojectContent whitebodyContent_v2">
        <div class="col-md-2 company_img">
            <div v-if="templateModel.previewImage.value ==''" class="image-input create-workspace-sidebar-image" @click="$refs.fileInputUser.click()">
                <span class="placeholder" > Upload Image </span>
                <img :src="upload" class="upload_image"  :height="12" :width="13">
            </div>
            <img v-else :src="templateModel.previewImage.name"  class="create-workspace-sidebar-image" @click="$refs.fileInputUser.click()">
            <input type="file" ref="fileInputUser" @change="previewImage" hidden>
        </div>
        <div class="form-group d-flex align-items-center">
            <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >Template Name<span class="text-red asterisk">*</span></label>
            <div class="input-field-group">
                <InputText
                    class="form-control login-input"
                    placeHolder="Enter Template Name"
                    autocomplete="off"
                    v-model.trim="templateModel.templateName.value"
                    @keyup="isUniqueProjectKey(templateModel.templateName.value),checkErrors({'field':templateModel.templateName,
                    'name':templateModel.templateName.name,
                    'validations':templateModel.templateName.rules,
                    'type':templateModel.templateName.type,
                    'event':$event.event})"
                    maxlength="50"
                    type="text"
                />
                <div class="text-red font-size-11 template__error-text">{{templateModel.templateName.error}}</div>
                <div class="text-red font-size-11 template__error-text" v-if="errorMsg.isUniqueProjectCode">{{errorMsg.isUniqueProjectCode}}</div>
            </div>
        </div>
        <div class="form-group textareaWrapper desc-wrapper">
            <label>Description<span class="text-red asterisk">*</span></label>
            <div class="input-field-group" :style="[{height : clientWidth > 767 ? '83px' : 'auto'}]">
                <textarea placeholder="Enter Description" class="form-control textarea-desc"  :class="[{'border-radius-8-px' : clientWidth <=767}]"  :style="[{height : clientWidth > 767 ? '83px !important' : '55px !important' , paddingTop : clientWidth <=767 ? '15.5px' : '5px'}]"  v-model="templateModel.description.value"></textarea>
            </div>
        </div>
    </div>
</div>
</template>
<script setup>
import { ref, onMounted, watch, inject } from "vue";
import { useStore } from "vuex";
import InputText from "@/components/atom/InputText/InputText.vue";
import { ValidationFunction } from "@/composable/DefaultValidationFunction";
import { useValidation } from "@/composable/Validation.js";
import {useToast} from 'vue-toast-notification';
import { useCustomComposable } from "@/composable";

const { getters , dispatch} = useStore();
const  { checkErrors } = useValidation();

const $toast = useToast();
const { checkBucketStorage } = useCustomComposable();

    const props = defineProps({
        modelValue : {
            type : Object,
            default : (()=>{})
        },
        templateDetail : {
            type : Object,
            default : (()=>{})
        }
    })
    const fileInputUser = ref();
    const defaultMainTemplate = ref([]);
    const CompanyDatabase = inject("$companyId");
    const clientWidth = inject("$clientWidth");
    const upload = require("@/assets/images/svg/upload_icon.svg")
    const templateModel = ref(props.templateDetail);
    onMounted(()=>{
        if(!(getters['projectData/defaultTemplate']).length) {
            dispatch('projectData/setdefaultTemplate', CompanyDatabase.value)
            .then((res) => {
                defaultMainTemplate.value = [];
                if(res && res.length > 0){
                    res.forEach(itemVal=>{
                        defaultMainTemplate.value.push(itemVal.TemplateName);
                    })
                }
            })
        }
    })
    watch(() => getters['projectData/defaultTemplate'], (val) => {
        defaultMainTemplate.value = [];
        if(val && val.length > 0){
            val.forEach(itemVal=>{
                defaultMainTemplate.value.push(itemVal.TemplateName);
            })
        }
    })
    const errorMsg = ref({isUniqueProjectCode : ''});

    function isUniqueProjectKey(value) {
        const val = value;
        ValidationFunction.isValueExistInArray(defaultMainTemplate.value, val, (result) => {
            if (result == true) {
                errorMsg.value.isUniqueProjectCode = "Template name is already exist.";             
            } else {
                errorMsg.value.isUniqueProjectCode = "";
            }
        })
        return;
    }

    function previewImage(){
        const input = fileInputUser.value;
        let fileList = Array.from(input.files);
        if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters,defineFileSize: 4}) !== true){
            return;
        }
        templateModel.value.uploadedImage.value = input.files;
        if (templateModel.value.uploadedImage.value && templateModel.value.uploadedImage.value[0]) {
            const ext = templateModel.value.uploadedImage.value[0].name.substring(templateModel.value.uploadedImage.value[0].name.lastIndexOf(".") + 1);
            const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
            if (!extArray.includes(ext.toLowerCase())) {
                $toast.error('Select image only and image file format should be jpg,jpeg,png', { position: 'top-right' })
                return;
            }
            var reader = new FileReader();
            reader.onload = (e) => {
                templateModel.value.previewImage.name = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
            templateModel.value.previewImage.value = input.files[0];
        }
    }
</script>
<style scoped>
.upload_image {
    position: absolute;
    bottom: 10px;
    left: 50px;
}
.template__error-text{
    line-height:18px;
}
.desc-wrapper{
    margin-bottom: -2px;
}
.desc-wrapper textarea{
    resize: none;
}
</style>