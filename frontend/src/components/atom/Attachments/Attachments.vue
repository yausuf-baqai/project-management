<template>
    <div :class="[{'cursor-pointer':permission === true}]" class="position-re project__detail-atttachment mobile__bg--withPadding" @dragenter="handleDragOver" @mouseleave="showDropZone= false" @dragleave="handleDragLeave"
    @dragover="handleDragOver">
        <DragAndDropDivCompo
            v-if="showDropZone && permission"
            @handleDrop="(e)=>handleDrop(e)"
            :extensions="props.extensions"
            class="position-ab w-100 h-100 drag_drop-compo"
            :class="{'z-index-9':showDropZone === true}"
            @dragLeave="showDropZone = false"
            @drop="showDropZone = false"
        >
        </DragAndDropDivCompo>
        <div class="d-flex justify-content-between">
            <h4 class="task-details-subtitle m-0" :class="{'font-size-16 font-weight-600' : clientWidth <=767 , 'font-size-14 font-weight-700' : clientWidth > 767 }">Attachments({{attachments.length }})
                <span 
                    class="custom-popover position-re pl-5px"
                    v-if="permission === true && clientWidth > 767"
                >
                    <img src="@/assets/images/help_icon.png" alt="">
                    <span class="popover-content">Here, you can also drag and drop files.</span>
                </span>
            </h4>
            <label 
                for="UploadedFile"
                v-if="permission === true"
            >
                <img class="cursor-link cursor-pointer" src="@/assets/images/black_plus.png" />
            </label>
            <input 
                type="file" 
                id="UploadedFile" 
                hidden 
                multiple
                ref="attach_files"
                :accept="extensions"
                @change.prevent="uploadFiles"
            />
        </div>
        <div class="drag-and-drop-attchement" v-if="attachments.length === 0">
            <img :src="draganddropImg" alt="draganddropImg"/>Drop files here to attach or <span class="text-decoration-underline blue">browse</span>
        </div>
        <div class="slider-main p-0"  @click="attchmentDivClick">
            <Attchment
                v-for="attachment in attachments"
                :key="attachment.id"
                :data="attachment"
                :isDelete="permission === true"
                @delete="$emit('update:delete',attachment)"
                :isSpinner="isSpinner"
            />
         
            <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner && attachments === undefined || attachments.length === 0"/>
        </div>
           <div class="d-block text-right p-1 blue text-decoration-underline font-weight-500 font-size-14 see__all" @click="$emit('seAll',selectedData.ProjectID ? 'task' : 'project')" >See All</div>
    </div>
</template>

<script setup>
import { defineComponent, ref ,inject, watch} from "vue";

import Attchment from "@/components/atom/Attachments/AttachmentImage.vue";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import DragAndDropDivCompo from '@/components/atom/DragAndDropDivCompo/DragAndDropDivCompo.vue'
import { useToast } from "vue-toast-notification"
import { useRoute } from 'vue-router';
const route = useRoute();
watch(route, (newVal) => {
    if(newVal && newVal.hash) {
        document.querySelector(newVal.hash).scrollIntoView();
    }
})
defineComponent({
    name: "AttachmentsComponent"
});

//IMAGES

const draganddropImg = require("@/assets/images/svg/draganddropImg.svg");
const clientWidth = inject("$clientWidth");

const props = defineProps({
    attachments: {
        type: Array,
        default: () => []
    },
    permission: {
        type: Boolean,
        default: false
    },
    extensions: {
        type: Array,
    },
    isSpinner:{
        type: Boolean
    },
    selectedData:{
        type:Object
    }
});
const showDropZone = ref(false);

const emit = defineEmits(["update:add", "update:delete","seAll"]);
// eslint-disable-next-line
const extensions = ref("");
extensions.value = props.extensions.map(exe => exe.name).join();
const $toast = useToast();
const attach_files = ref(null); 
const uploadFiles = (event) => {
    const files = event.target.files;

    let arr = [];
    let isErrorInUpload = false;
    props.extensions.forEach((v) =>
        arr.push(v.name.replaceAll(" ", "_").toLowerCase())
    );

    files.forEach((file) => {
        if(file == null) {
            isErrorInUpload = true;
            $toast.error("Please select valid file.",{position: 'top-right'});
            return;
        }
        let fileName = file.name;
        var ele = fileName.substring(fileName.lastIndexOf(".") + 1);

        const isExists = arr.includes("." + ele.toLowerCase());
        if (!isExists) {
            isErrorInUpload = true;
            if(props.extensions.length > 1) {
                $toast.error(`Please select valid file. Only ${extensions.value} files are allowed.`,{position: 'top-right'});
            } else {
                $toast.error("You have to add extension in setting.",{position: 'top-right'});
            }
            return;
        }
    });

    if(!isErrorInUpload) {
        emit("update:add", files);
    }
    attach_files.value.value = null;
}
const handleDrop = (e) => {
    emit("update:add", e);
}

const attchmentDivClick = (clickEvent) =>{
    if(clickEvent.target.nodeName === 'DIV' && props.permission === true){
        let fileInput = document.getElementById('UploadedFile')
        fileInput.click();
    }
}
const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    const isLeavingContainer = (
    event.clientX < rect.left ||
    event.clientX >= rect.right ||
    event.clientY < rect.top ||
    event.clientY >= rect.bottom
    );
    if (isLeavingContainer) {
    showDropZone.value = false;
    }  
}
const handleDragOver = (event) => {
    showDropZone.value = true;
    event.preventDefault();
    event.stopPropagation(); 
}
</script>
<style scoped src="./style.css"></style>
<style>
.slider-main::-webkit-scrollbar{display:none;}
.slider-main {
    display: -webkit-box;
    position: relative;
    width: 100%;
    z-index: 5;
    height: 93px;
    margin-top: 20px;
    gap: 10px;
    overflow: auto;
    scrollbar-width: none;
    /* overflow-x: auto;
    margin-top: 15px;
    overflow: auto; */
}
.drag_drop-compo{
    top: 33px;
}
.custom-popover{
    top: 2px;
}
@media(max-width: 767px){
    .slider-main{height: 70px;}
    .see__all{padding-right: 0 !important;}
}
</style>