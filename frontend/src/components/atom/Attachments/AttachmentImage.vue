<template>
    <div  @click.stop.prevent="handleClick(data)" class="attachment-display" :style="[{width : clientWidth>767 ? '131px' : '169px'}]" :id="data.id">
        <ul class="d-flex position-ab hover_icon-slider z-index-1">
            <li>
                <a @click.stop.prevent="downloadAttachment(data)">
                    <img
                        src="@/assets/images/download_attchment.png"
                        alt=""
                    />
                </a>
            </li>
            <li v-if="isDelete">
                <a @click.stop.prevent="$emit('delete')">
                    <img
                        src="@/assets/images/delete_attechment.png"
                        alt=""
                    />
                </a>
            </li>
        </ul>
        <ImageIcon
            v-if="data.url.includes('http')"
            :src="data.url"
            :alt="data.filename"
            :extension="data.extension"
            class="w-100"
            :style="[{height : clientWidth>767 ? '100px' : '120px'}]"
        />
        <WasabiIamgeCompp 
            v-else
            :data="data"
            class="attachment__image-height w-100"
            :style="[{height : clientWidth>767 ? '100px' : '120px'}]"
            :thumbnail="showThumbnails ? '130x93' : ''"
            @downloadUrl="(eve) => {downloadurl(eve)}"
        />
    </div>
    <PdfImageViewer
        v-if="showModal"
        :data="data"
        :openModal="showModal"
        @closeModal="showModal = false"
        :downloadValue="downloadValue"
        :thumbnail="showThumbnails ? '1280x720' : ''"
    >
    </PdfImageViewer>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
</template>

<script setup>
import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
import { defineComponent, defineProps, defineEmits, ref, inject, onMounted } from "vue";
import { download } from "@/utils/StorageOprations/download";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import ImageIcon from "@/components/atom/ImageIcon/ImageIcon.vue"
import '@/components/atom/Attachments/styleAttachment.css'
import PdfImageViewer from "@/components/atom/Attachments/PdfImageViewer.vue"
import { storageHelper } from "@/composable/commonFunction";


const {getStorageImage} = storageHelper();
const companyId = inject("$companyId");
// import Pdf from 'vue-pdf';
defineComponent({
    name: "AttchmentSingleComponent"
});

defineEmits(["delete"])

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isSpinner: {
        type: Boolean
    }
});
const clientWidth = inject("$clientWidth");
const itemData = ref(props.data);
const showModal =ref(false)
const showThumbnails =ref(false)
const downloadValue = ref('');

onMounted(() => {
    const fixedDate = new Date(2024,6,9).getTime();
    const today = new Date().setHours(0,0,0,0);
    showThumbnails.value = today >= fixedDate;
})

const downloadAttachment = () => {
    getStorageImage({
        companyId: companyId.value,
        data: {
            url: props.data.url
        }
    })
    .then((res) => {
        download(res, props.data.filename).catch((error) => {
            console.error('Error while downloading file.', error);
        });
    })
    .catch((error) => {
        console.log("ERR: ", error);
    })
}

function downloadurl (e) {
    itemData.value.downloadUrl = e;
    downloadValue.value = e;
}

const handleClick = () => {
    showModal.value = true;
}
</script>
<style scoped>
.attachment-display {
    /* background-color: #e1dbdb; */
    margin-right: 10px;
    padding: 5px;
    border-radius: 6px;
    position: relative;
}
.attachment-display ul li {
    list-style: none;
    position: relative;
}
.attachment-display ul li img {
    background-color: #F4F5F7;
    height: 22px;
    border-radius: 2px;
    object-fit: contain;
    cursor: pointer;
}
.hover_icon-slider{
    gap: 5px;
    padding: 0;
    width: auto;
    right: 5px;
    top: 5px;
}
img.attachment__image-height {
    object-fit: contain;
}
@media(max-width: 767px){
    .attachment-display{  margin-right: 10px;padding: 0;width: 120px!important;}
    img.attachment__image-height {
    object-fit: cover !important;
    border-radius: 8px;
}
}

</style>