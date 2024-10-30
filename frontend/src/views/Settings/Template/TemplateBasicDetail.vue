<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display template bacis detail for template create module.
========================================================================================== -->
<template>
<div>
    <div id="project-step-container">
        <div class="createprojectContent whitebodyContent_v2 templateSidebar">
            <div class="col-md-2 company_img">
                <div v-if="theModel.templateDetail.previewImage.value ==''" class="image-input create-workspace-sidebar-image" @click="$refs.fileInputUser.click()">
                    <span class="placeholder" > Upload Image </span>
                    <img :src="upload" class="upload_image"  :height="12" :width="13">
                </div>
                <img v-else :src="previewImageSrc"  class="create-workspace-sidebar-image" @click="$refs.fileInputUser.click()">
                <input type="file" ref="fileInputUser" @change="previewImage" hidden>
            </div>
            <div class="template__desc-wrapperform">
                <div class="form-group">
                    <label class="dark-gray">Template Name<span class="text-red asterisk">*</span></label>
                    <div class="input-field-group">
                            <InputText
                                class="form-control login-input template__input"
                                placeHolder="Enter Template Name"
                                autocomplete="off"
                                v-model.trim="theModel.templateDetail.templateName.value"
                                @keyup="isUniqueProjectKey(theModel.templateDetail.templateName.value),checkErrors({'field':theModel.templateDetail.templateName,
                                'name':theModel.templateDetail.templateName.name,
                                'validations':theModel.templateDetail.templateName.rules,
                                'type':theModel.templateDetail.templateName.type,
                                'event':$event.event})"
                                maxlength="50"
                                height="29px"
                                type="text"
                            />
                            <div class="text-red font-size-11">{{theModel.templateDetail.templateName.error === 'The templatename field is required' ? 'The template name field is required' : theModel.templateDetail.templateName.error}}</div>
                            <div class="text-red font-size-11" v-if="errorMsg.isUniqueProjectCode">{{errorMsg.isUniqueProjectCode}}</div>
                    </div>
                </div>
                <div class="form-group textareaWrapper flex-column">
                    <div class="d-flex" :class="{'flex-column' :clientWidth <= 767}">
                        <label class="dark-gray">Description<span class="text-red asterisk">*</span></label>
                        <textarea placeholder="Enter Description" @keyup="checkErrors({'field':theModel.templateDetail.description,
                                'name':theModel.templateDetail.description.name,
                                'validations':theModel.templateDetail.description.rules,
                                'type':theModel.templateDetail.description.type,
                                'event':$event})" maxlength="2000" class="form-control" v-model="theModel.templateDetail.description.value">
                        </textarea>
                    </div>
                    <div class="d-flex mt-1px" :style="[{'margin-left': clientWidth <= 767 ? '0' : '28%'}]">
                        <span class="text-red font-size-11 red">{{theModel.templateDetail.description.error}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<script setup>
import { ref,inject } from "vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { useValidation } from "@/composable/Validation.js";
import { useToast } from 'vue-toast-notification';
import { ValidationFunction } from "@/composable/DefaultValidationFunction";
import { useStore } from "vuex";
import { useCustomComposable } from "@/composable";
const upload = require("@/assets/images/svg/crop-cloud.svg")

    const  { checkErrors } = useValidation();
    const $toast = useToast();
    const fileInputUser = ref();
    const props = defineProps({
        modelValue: {
            type: Object,
            default: () => ({}),
        },
        defaultMainTemplate : {
            type : Array,
            default : ()=>([])
        }
    });
    const { getters} = useStore();
    const { checkBucketStorage } = useCustomComposable();
    const templateArr = ref([]);
    props.defaultMainTemplate.forEach(itemVal=>{
        templateArr.value.push(itemVal.TemplateName);
    })
    const emit = defineEmits([
        'update:modelValue'
    ]);
    const theModel = ref(props.modelValue);
    const errorMsg = ref({isUniqueProjectCode : ''});
    const previewImageSrc = ref("");
    const clientWidth = inject("$clientWidth");
     function previewImage(){
        const input = fileInputUser.value;
        let fileList = Array.from(input.files);
        if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters,defineFileSize:5}) !== true){
            return;
        }
        theModel.value.templateDetail.uploadedImage.value = input.files;

        if (theModel.value.templateDetail.uploadedImage.value && theModel.value.templateDetail.uploadedImage.value[0]) {
            const ext = theModel.value.templateDetail.uploadedImage.value[0].name.substring(theModel.value.templateDetail.uploadedImage.value[0].name.lastIndexOf(".") + 1);
            const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
            if (!extArray.includes(ext.toLowerCase())) {
                $toast.error('Select image only and image file format should be jpg,jpeg,png', { position: 'top-right' })
                return;
            }
            var reader = new FileReader();
            reader.onload = (e) => {
                previewImageSrc.value = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
            theModel.value.templateDetail.previewImage.value = input.files[0];
        }
        emit('update:modelValue', theModel.value)
    }
    function isUniqueProjectKey(value) {
        const val = value;
        ValidationFunction.isValueExistInArray(templateArr.value, val, (result) => {
            if (result == true) {
                errorMsg.value.isUniqueProjectCode = "Template name is already exist.";             
            } else {
                errorMsg.value.isUniqueProjectCode = "";
            }
        })
        return;
    }
</script>
<style scoped>
@import "./style.css";
</style>