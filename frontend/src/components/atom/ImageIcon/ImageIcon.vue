<template>
    <img 
        :src="imgSrc"
        :alt="alt"
        @load="onImageLoad"
        @error="onImageError"
        :class="{'skelaton-loader': isLoad}" 
    />
</template>
<script setup>
    import { ref, defineProps, watch, onMounted, inject } from "vue";

    const props = defineProps({
        src: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            required: true
        },
        extension: {
            type: String,
            default: ''
        },
        userImage: {
            type: Boolean,
            default: false
        }
    });

    const imgSrc = ref('');
    const src = ref(props.src);
    const isLoad = ref(true);
    const defaultUserAvatar = inject("$defaultUserAvatar")
    // const defaultImage = require("@/assets/images/image_name.png")
    watch([() => props.src,()=>props.extension],()=>{
        src.value = props.src;
        displayImg();
    })

    onMounted(() => {
        displayImg();
    })

    const onImageLoad = () => {
        isLoad.value = false;
    }
    const onImageError = () => {
        if(props.userImage) {
            imgSrc.value = defaultUserAvatar;
        } else {
            // PLACE HOLDER FOR IMAGE COMPONENT IF IMAGE NOT LOADED
            // imgSrc.value = defaultImage;
        }
        isLoad.value = false;
    }

    const displayImg = () =>{
        const extention = ref(props.extension.toLocaleLowerCase());

        if(props.userImage && (src.value.includes("http") || src.value.includes("base64"))) {
            imgSrc.value = src.value
            return;
        }

        if(!props.extension) {
            imgSrc.value = src.value;
        } else if (extention.value === 'jpg' || extention.value === 'jpeg' || extention.value === 'png' || extention.value === 'gif' || extention.value === 'image') {
            imgSrc.value = src.value;
        } else if(extention.value === 'psd') {
            imgSrc.value = require('@/assets/images/icon/PSD.png');
        } else if (extention.value === 'js') {
            imgSrc.value = require('@/assets/images/icon/JS.png');
        } else if (extention.value === 'html' ) {
            imgSrc.value = require('@/assets/images/icon/HTML.png');
        } else if (extention.value === 'css' ) {
            imgSrc.value = require('@/assets/images/icon/CSS.png');
        } else if (extention.value === 'php' ) {
            imgSrc.value = require('@/assets/images/icon/PHP.png');
        } else if (extention.value === 'sql' ) {
            imgSrc.value = require('@/assets/images/icon/SQL.png');
        } else if (extention.value === 'mp4' || extention.value === 'video') {
            imgSrc.value = require('@/assets/images/mp4.png');
        } else if (extention.value === 'mkv' ) {
            imgSrc.value = require('@/assets/images/mkv.png');
        } else if (extention.value === 'mp3' ) {
            imgSrc.value = require('@/assets/images/mp3.png');
        } else if (extention.value === 'pub' ) {
            imgSrc.value = require('@/assets/images/pub.png');
        } else if (extention.value === 'txt' ) {
            imgSrc.value = require('@/assets/images/txt.png');
        } else if (extention.value === 'apk' ) {
            imgSrc.value = require('@/assets/images/icon/APK.png');
        } else if (extention.value === 'aab' ) {
            imgSrc.value = require('@/assets/images/icon/AAB.png');
        } else if (extention.value === 'key' ) {
            imgSrc.value = require('@/assets/images/icon/KEY.png');
        } else if (extention.value === 'ppk' ) {
            imgSrc.value = require('@/assets/images/icon/PPK.png');
        } else if (extention.value === 'pem' ) {
            imgSrc.value = require('@/assets/images/icon/PEM.png');
        } else if (extention.value === 'mov' ) {
            imgSrc.value = require('@/assets/images/mov.png');
        } else if (extention.value === 'xlsx' || extention.value === 'xls' ) {
            imgSrc.value = require('@/assets/images/icon/Excel.png');
        } else if (extention.value === 'doc' ) {
            imgSrc.value = require('@/assets/images/icon/Doc.png');
        } else if (extention.value === 'docx' ) {
            imgSrc.value = require('@/assets/images/icon/Word.png');
        } else if (extention.value === 'pdf' ) {
            imgSrc.value = require('@/assets/images/icon/PDF.png');
        } else if (extention.value === 'csv' ) {
            imgSrc.value = require('@/assets/images/icon/CSV.png');
        } else if (extention.value === 'zip' ) {
            imgSrc.value = require('@/assets/images/zip.png');
        } else {
            imgSrc.value = require('@/assets/images/icon/OTHER.png');
        }
    }
</script>

<style lang="css" scoped>
.skelaton-loader {
    animation: pulse-bg 1s infinite;
}

@keyframes pulse-bg {
    0% {
      background-color: #ddd;
    }
    50% {
      background-color: #d0d0d0;
    }
    100% {
      background-color: #ddd;
    }
}
</style>