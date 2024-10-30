<template lang="">
    <div class="embed__view-item">
        <SpinnerComp :is-spinner="!isVisible" v-if="!isVisible"/>
        <div class="embed__viewshow-visible"  v-show="isVisible">
        <div class="vhtml" v-if="Data?.type == 'Anything_html'"  v-html='URL'></div>
            <iframe id="frame" v-show="Data?.type != 'Anything_html'" :src=" Data?.type != 'Anything_html' ? URL : '' " height="100%" width="100%" class="border-0"></iframe>
        </div>
    </div>
</template>
<script setup>
import {onMounted, ref , watch ,inject} from 'vue'
import { useRoute } from 'vue-router';
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue'


const route  = useRoute()
const props = defineProps({
    data:{
        type:Object,
        default:() =>{}
    },
})

const URL = ref('')
const Data = ref('')
const projectData = inject('selectedProject')
const isVisible = ref(false)

watch(() => props.data ,(newVal,oldVal)=> {
    setTimeout(() => {
        let flag = props?.data?.isPrivate
        const objValue = !flag ? projectData.value.ProjectRequiredComponent.filter((item) => item.id == route.query.eid) : props.data 
        Data.value = flag ? objValue :objValue[0]
        if(newVal !== oldVal)
        isVisible.value = false 
        modifyURL()
    });
})

onMounted(() =>{

setTimeout( () => {
    let flag = props?.data?.isPrivate
    const objValue = !flag ? projectData.value.ProjectRequiredComponent.filter((item) => item.id == route.query.eid) : props.data 
    Data.value = flag ? objValue :objValue[0]
    modifyURL()
    });
})

const modifyURL = () =>{
    if(!Data.value){
        return
    }

    if(Data.value.type === 'Youtube')
    {
        if(Data.value.url.includes('watch')){
            URL.value = "https://www.youtube.com/embed/"+`${Data.value.url.split('watch')[1].split('=')[1]}`
        }
        else{
            let url = Data.value.url.split('/')
            URL.value = "https://www.youtube.com/embed/"+`${url[url.length - 1]}`
        }
    }    
    else if(Data.value.type === 'Figma'){
        URL.value = "https://www.figma.com/embed?embed_host=share&url=" + Data.value.url
    }
    else if(Data.value.type === 'Anything_url'){
        if(Data.value.url.includes('www.youtube.com') || Data.value.url.includes('https://youtu.be')){
            if(Data.value.url.includes('watch')){
                URL.value = "https://www.youtube.com/embed/"+`${Data.value.url.split('watch')[1].split('=')[1]}`
            }
            else{
                let url = Data.value.url.split('/')
                URL.value = "https://www.youtube.com/embed/"+`${url[url.length - 1]}`
            }
        }
        else if(Data.value.url.includes('figma')){
            URL.value = "https://www.figma.com/embed?embed_host=share&url=" + Data.value.url
        }
        else{
            URL.value = Data.value.url
        }
    }
    else{
        if(Data.value.type == 'Anything_html'){
            URL.value = Data.value.html
        }
        else{
            URL.value = Data.value.url
        }
    }

    if(Data.value.type == 'Anything_html'){
        isVisible.value = true
    }
    document.getElementById('frame').onload = function() {
        isVisible.value = true
    }

}

</script>
<style>

.vhtml iframe {
    border-width: 0;
    display: block;
    min-height: 100%;
    min-width: 100%;
    box-sizing: border-box;
}
.embed__view-item, .embed__viewshow-visible{
    width: 100% !important;
    height: 100% !important;
}
.embed__view-item .vhtml{
    height: 100% !important;

}
</style>