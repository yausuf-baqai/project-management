<template>
    <ImageIcon :src="imgUrl" :title="data.title" :alt="data.filename ? data.filename : ''" :extension="data.extension" v-if="!loading" :style="style" :class="props.class" :userImage="userImage"/>
    <SkelatonVue v-else :style="style" :class="props.class"/>
</template>

<script setup>
    import { onMounted, defineProps, inject, ref, defineEmits, watch } from 'vue';
    import ImageIcon from "@/components/atom/ImageIcon/ImageIcon.vue"
    import * as env from '@/config/env';
    import isEqual from "lodash/isEqual"
    import SkelatonVue from '../Skelaton/Skelaton.vue';
    import { apiRequest, apiRequestWithoutCompnay } from '../../../services';
    // eslint-disable-next-line
    const companyId = inject('$companyId');  
    const props = defineProps({
        data: {
            type: Object,
            required: true,
        },
        class: {},
        companyId: {
            type: String,
            default: ""
        },
        style: {},
        thumbnail: {
            type: String,
            default: ""
        },
        userImage: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(["downloadUrl"]);
    const imageObject = ref();
    const imgUrl = ref("");
    const loading = ref(false);
    const tuhumbnailSize = ref(props.thumbnail);
    onMounted(() => {
        imageObject.value = JSON.parse(JSON.stringify(props.data))
        getImage();
    })

    watch(() => props.data, (newVal, oldVal) => {
        if(!isEqual(newVal, oldVal)) {
            imageObject.value = JSON.parse(JSON.stringify(props.data))
            getImage(newVal.url !== oldVal.url);
        }
    })
    function getImage(isLoad = true) {
        if(isLoad){
            loading.value = true;
        }
        const cid = props.companyId?.length ? props.companyId : companyId.value;
        let path = ''
        if (tuhumbnailSize.value) {
            const [filename, extension] = props.data.url.split(".");
            path = `${filename}-${tuhumbnailSize.value}.${extension}`;
        } else {
            path = props.data.url
        }
        if (path && path.includes("base64")) {
            if(props.userImage){
                imgUrl.value = props.data.url;
                return loading.value = false
            }else{
                return loading.value = false;
            }
        }
        const formData = {
            companyId: cid,
            path: path
        }
        let url = props.userImage ? env.WASABI_RETRIVE_USER_PROFILE : env.WASABI_RETRIVE_OBJECT;
        let reqAPi;
        if (props.userImage) {
            reqAPi = apiRequestWithoutCompnay("post", url, formData);

        } else {
            if (formData.path) {
                reqAPi = apiRequest("post", url, formData);
            }else{
                return loading.value = false;
            }
        }
        reqAPi.then((response)=>{
            if (response.data.status === false) {
                return loading.value = false;
            }
            if(response.data.status === true){
                imageObject.value.downloadUrl = response.data.statusText;
                emit("downloadUrl",response.data.statusText)
                imgUrl.value = response.data.statusText;
                loading.value = false;
            } else {
                loading.value = false;
            }
        }).catch((err)=>{
            loading.value = false;
            console.error(err,"error in get image data");
        })
    }
</script> 