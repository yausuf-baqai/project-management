<template>
    <video :id="id" v-if="!loading" :src="imgUrl" :style="style" :class="props.class" :controls="controls" @play="$emit('play', $event)"/>
    <SkelatonVue v-else :style="style" :class="props.class"/>
</template>

<script setup>
    import { onMounted, defineProps, inject, ref, defineEmits, watch } from 'vue';
    import * as env from '@/config/env';
    import isEqual from "lodash/isEqual"
    import SkelatonVue from '../Skelaton/Skelaton.vue';
    import { apiRequest } from '../../../services';
    // eslint-disable-next-line
    const companyId = inject('$companyId');
    const props = defineProps({
        data: {
            required: true,
        },
        id: {},
        class: {},
        companyId: {
            type: String,
            default: ""
        },
        style: {},
        controls: {
            type: Boolean,
            default: true
        },
    });

    const emit = defineEmits(["downloadUrl", "play"]);

    const imgUrl = ref("");
    const loading = ref(false);

    onMounted(() => {
        getFile();
    })

    watch(() => props.data, (newVal, oldVal) => {
        if(!isEqual(newVal, oldVal)) {
            getFile();
        }
    })
    function getFile() {
        loading.value = true;
        const cid = props.companyId?.length ? props.companyId : companyId.value;
        let path = props.data
        const formData = {
            companyId: cid,
            path: path
        }
        let url = env.WASABI_RETRIVE_OBJECT;
        apiRequest("post", url, formData).then((response)=>{
            if(response.data.status === true){
                imgUrl.value = response.data.statusText;
                loading.value = false;
                emit("downloadUrl",response.data.statusText)
            } else {
                loading.value = false;
            }
        }).catch((err)=>{
            loading.value = false;
            console.error(err,"error in get image data");
        })
    }
</script> 