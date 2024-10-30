<template lang="">
<div>
    <Sidebar v-if="isVisible" width="607px" class="sidebar__height"  :closeOnBackDrop="true">
        <template #head>
            <div class="sidebarHeader d-flex justify-content-between">
                <h3 class="primaryColor">Create Company</h3>
            </div>
        </template>
        <template #body>
            <div class="createCompanyform">
                <div class="d-flex justify-content-center">
                <!-- cropper -->
                    <cropper ref="cropper1" class="cropper" :zoom="zoomscale" :src="imageToCrop" :min-zoom="0.1" :max-zoom="2"  
                    :stencil-size="{
                    width: 180,
                    height: 180,
                    }"
                    @change="onChange"
                    :debounce="false"
                    />
                </div>
                <!-- preview image -->
                <div class="d-flex mt-3 justify-content-center"> 
                    <Preview :width="16" :height="16" class="preview" :image="result.image" :coordinates="result.coordinates"/>
                    <Preview :width="25" :height="25" class="preview" :image="result.image" :coordinates="result.coordinates"/>
                    <Preview :width="33" :height="33" class="preview" :image="result.image" :coordinates="result.coordinates"/>
                    <Preview :width="41" :height="41" class="preview" :image="result.image" :coordinates="result.coordinates"/>
                    <Preview :width="50" :height="50" class="preview" :image="result.image" :coordinates="result.coordinates"/>
                    <Preview :width="58" :height="58" class="preview" :image="result.image" :coordinates="result.coordinates"/>
                </div>

                <!-- Cropping Tools -->
                <div class="tools mt-3 d-flex flex-wrap  cursor-pointer">
                    <span title="Rotate Left"><img :src="rotateLeft" alt="rotateLeft" @click="cropper1.rotate(-90);"></span>
                    <span title="Rotate Right"><img :src="rotateRight" alt="rotateRight" @click="cropper1.rotate(90)"></span>
                    <span title="Flip Verticle"><img :src="flipVerticle" alt="flipVerticle" @click="cropper1.flip(true,false)"></span>
                    <span title="Flip Horizontal"><img :src="flipHorizontal" alt="flipHorizontal" @click="cropper1.flip(false,true)" ></span>
                    <span title="Zoom in"><img :src="zoomIn" alt="zoomIn" @click="ZoomImage(2)"></span>
                    <span title="Zoom out"><img :src="zoomOut" alt="zoomOut" @click="ZoomImage(1)"></span>
                    <span title="Maximize Crop Area"><img :src="maxSizeImage" alt="maxSizeImage" @click="MaxCropArea"></span>
                    <span title="Center Cropper"><img :src="maxSizeFrame" alt="maxSizeFrame" @click="Centerstencil"></span>
                </div>

                <!-- footer section -->
                <div class="d-flex justify-content-between mt-4">
                    <span class="d-flex cursor-pointer cloud" @click="changeImage()"><img :src="cropCloud" alt="cropCloud"/> &nbsp; Change Image </span>
                    <div class="btn_block d-flex cancel_upload-wrapper justify-content-end">
                        <button class="white_btn" type="button" @click="isVisible = false">Cancel</button>
                        <button class="blue_btn upload__btn" type="button" @click="getImage">Upload</button>
                    </div>
                </div>
            </div>
        </template> 
    </Sidebar>
    <input type="file" id="cropping-input" ref="fileSelect" accept="image/png, image/jpg, image/jpeg" @input="(e)=>OnFileSelected(e)" hidden>
</div>   
</template>
<script setup>
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import { watchEffect,ref, onMounted } from 'vue';
import { Cropper,Preview } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css';
import {useToast} from 'vue-toast-notification';

const $toast = useToast();
const fileSelect = ref(null)
const emit = defineEmits(['updateVisible','getEditedImage'])
const rotateLeft = require("@/assets/images/svg/rotate-left.svg")
const rotateRight = require("@/assets/images/svg/rotate-right.svg")
const flipVerticle = require("@/assets/images/svg/flip-verticle.svg")
const flipHorizontal = require("@/assets/images/svg/flip-horizontal.svg")
const zoomIn = require("@/assets/images/svg/zoomin.svg")
const imageName= ref('')
const isVisible = ref(false)
const zoomOut = require("@/assets/images/svg/zoomout.svg")
const cropCloud = require("@/assets/images/svg/crop-cloud.svg")
const maxSizeImage = require("@/assets/images/svg/max-size-image.svg")
const maxSizeFrame = require("@/assets/images/svg/max-size-frame.svg")
const result = ref({coordinates: null,image: null});
const imageToCrop = ref()
const zoomscale = ref(0)
const fileSize = ref(0)
const cropper1 = ref(null);
const croppedImage = ref(null)

const props = defineProps({
    image:{
        type:Object
    }
})


const onChange = ({ coordinates, image }) => {
  let res = { coordinates, image };
  result.value = res;
};
const changeImage = () =>{
    document.getElementById('cropping-input').click()
}

const OnFileSelected = (event) => {
    
    let file = event.target.files[0];
    if(file == null){
        fileSelect.value.value = null;
        return
    }
    const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
    const fileName = file.name.split(".")[file.name.split(".").length-1]
    imageName.value = file.name
    fileSize.value = file.size
    
    if(fileSize.value > 500000){
        $toast.error("file size is larger than 500kb!",{position:'top-right'})
        fileSelect.value.value = null;
        return
    }

    if(extArray.includes(fileName.toLowerCase())){
        imageToCrop.value = URL.createObjectURL(file);
        isVisible.value = true
        fileSelect.value.value = null;
    }
    else{
        emit('updateVisible',false)
        $toast.error('Select image only and image file format should be jpg,jpeg,png',{position: 'top-right'})
        fileSelect.value.value = null;
    }
};

const ZoomImage = (factor) => {
  if (factor == 1) {
    cropper1.value.zoom(0.1);
    return;
  }
  cropper1.value.zoom(factor);
  zoomscale.value += factor;
};

const MaxCropArea = ()=>{
    cropper1.value.setCoordinates(({ imageSize }) => ({
        width: imageSize.width,
        height: imageSize.height
    }))
}

const Centerstencil = () => {
    cropper1.value.setCoordinates(({ coordinates, imageSize }) => ({
        left: imageSize.width/2 - coordinates.width/2,
        top: imageSize.height/2 - coordinates.height/2
    }))
}

const getImage = () => {
  const { canvas } = cropper1.value.getResult();
  croppedImage.value = canvas.toDataURL();
  emit('getEditedImage',{url:croppedImage.value,fileName:imageName.value,base64Image:croppedImage.value});
  emit('updateVisible',false)
  isVisible.value = false

};

watchEffect(()=>{
    imageToCrop.value = props.image.url
})  

onMounted(()=>{
    result.value ={coordinates: null,image: null}
})

</script>
<style>
@import './style.css'
</style>