<template>
    <div v-if="noDescription">
        <div class="bg-white border-radius-8-px mt-1 p-10px">
            <button @click="noDescription = false" class="add_description_button">
                Add description
            </button>
        </div>
    </div>
    <div class="editor-container" v-else>
        <div v-show="contentLoaded" id="editorjs" :class="[{'show_hide_class': !isShow}]" @click="isShow = true"></div>
        <Skelaton class="w-100 border-radius-8-px" style="height: 60px;" v-if="!contentLoaded"/>
        <div v-show="false" id="editor-converter"></div>
        <div class="hide_show_wrapper" v-if="contentExceeds">
            <button v-if="!isShow" @click="isShow = true" class="hide_show">Show More</button>
            <button v-else @click="isShow = false" class="hide_show">Show Less</button>
        </div>
        <div class="d-flex justify-content-start description-action mt-10px mb-15px description-padding">
            <!-- <button class="outline-primary mr-10px" @click="cancelData()">Cancel</button> -->
            <button class="btn-primary" @click="saveData()">Save</button>
        </div>

        <PromptSidebar v-if="isOpenPromptDeatil" @closePrompt="isOpenPromptDeatil = false, resetAiBlocks()" :selectedPrompt="selectedPrompt" @closeMainSidebar="(e) => {isOpenPromptDeatil = false; e ? resetAiBlocks() : '';}" :project="project" :task="task" />
    </div>
</template>

<script setup>
import { computed, defineComponent, inject, provide, ref, watch } from 'vue';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import { useRouter } from "vue-router";
import markdownit from 'markdown-it'
const mardownInit = markdownit({
    html: true
})
// mardownInit.renderer.rules.strong_open = () => "<b>";
// mardownInit.renderer.rules.strong_close = () => "</b>";

import PromptSidebar from "@/components/molecules/PromptSidebar/PromptSidebar.vue"

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
// import Quote from '@editorjs/quote';
// import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import CodeTool from '@editorjs/code';
// import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
// import LinkTool from '@editorjs/link';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import writeWithAi from './writeWithAi.js';

import { apiRequest } from '../../../services';
import * as env from '@/config/env';
import { useCustomComposable } from '@/composable';
import { onMounted } from 'vue';
import Skelaton from '@/components/atom/Skelaton/Skelaton.vue';

defineComponent({
    name: "DescriptionComponent"
});
const { getters } = useStore();

const currentCompany = computed(() => getters["settings/selectedCompany"]);
const isOpenPromptDeatil = ref(false);
const selectedPrompt = ref({});
const blockIndex = ref(null)
const router = useRouter();
const isShow = ref(false)
const noDescription = ref(false)
const contentExceeds = ref(false)
const tempBlock = ref([])

const contentLoaded = ref(false)

const { checkPermission,checkApps, debounce } = useCustomComposable();

const props = defineProps({
    description: {
        type: [String, Object],
        default: () => {}
    },
    editPermission: {
        type: [Boolean, Number],
        default: false
    },
    minlength: {
        type: Number,
        default: 0
    },
    isShowAi: {
        type: Boolean,
        default: false
    },
    projectData: {
        type: Object,
        default: () => {}
    },
    from: {
        type: String,
        default:''
    }
});

const companyId = inject('$companyId');
const project = inject("selectedProject");

const checkAiProject = computed(() => checkApps('AI',props.projectData));
const checkAiDescription = props.from === 'project' ? computed(() => checkPermission("project.project_description", props.projectData?.isGlobalPermission, {gettersVal: getters})) : computed(() => checkPermission("task.task_description", props.projectData?.isGlobalPermission, {gettersVal: getters}));

const editorTools = {
    WriteWithAi: {
        class:writeWithAi,
        config: {
            openSidebar : openDescriptionWithAi,
            isShowAi: checkAiProject.value && checkAiDescription.value
        },
    },
    header: {
        class: Header,
        inlineToolbar: true
    },
    list: {
        class: List,
        inlineToolbar: true
    },
    checklist: {
        class: Checklist,
        inlineToolbar: true
    },
    // quote: {
    //     class: Quote,
    //     inlineToolbar: true
    // },
    // warning: {
    //     class: Warning,
    //     inlineToolbar: true
    // },
    marker: {
        class: Marker,
        inlineToolbar: true
    },
    code: {
        class: CodeTool,
        inlineToolbar: true
    },
    // delimiter: {
    //     class: Delimiter,
    //     inlineToolbar: true
    // },
    inlineCode: {
        class: InlineCode,
        inlineToolbar: true
    },
    // linkTool: {
    //     class: LinkTool,
    //     inlineToolbar: true
    // },
    embed: {
        class: Embed,
        inlineToolbar: true
    },
    table: {
        class: Table,
        inlineToolbar: true
    }
}

const editor = ref();

const converter = ref();

onMounted(() => {
    if(!props.description) {
        noDescription.value = true;
    }
    if(!noDescription.value) {
        initEditor()
    }
})

watch(noDescription, (val) => {
    if(!val) {
        initEditor()
    }
})

function initEditor() {
    editor.value = new EditorJS({
        holder: 'editorjs',
        tools: {...editorTools},
        placeholder: "Write something or type '/' for commands and AI action",
        readOnly: !props.editPermission,
        onChange() {
            blockIndex.value = editor.value.blocks.getCurrentBlockIndex();
            try {
                editor.value.save().then((res) => {
                    if(res !== undefined && res){
                        tempBlock.value = res;
                    }
                    checkContentSize()
                })
            } catch (error) {
                console.error("ERROR in save: ", error);
            }
        },
        onReady(){
            document.querySelector('.codex-editor__redactor').style.paddingBottom = '10px';
            setTimeout(() => {
                renderDescription()
            },500);
        }
    });
    converter.value = new EditorJS({
        holder: 'editor-converter',
        tools: {...editorTools},
        onChange() {
            converter.value.save().then((newBlocks) => {
                injectBlocks(newBlocks.blocks?.reverse() || [])
            }).catch((err) => {
                console.error(err,"Error in conver in to blocks");
            })
        },
    });
}

function checkContentSize() {
    contentLoaded.value = true;

    // CHECK IF SIZE EXCEEDS
    const minHeight = 350;
    setTimeout(() => {
        const editorConentHeight = document.querySelector('.codex-editor').clientHeight;
        contentExceeds.value = editorConentHeight > minHeight;

        // ADJUST BOTTOM PADDING DEPENDING ON CONTENT SIZE
        const editorTextArea = document.querySelector('.codex-editor__redactor');
        if(editorTextArea) {
            if(contentExceeds.value) {
                editorTextArea.style.paddingBottom = '50px';
            } else {
                editorTextArea.style.paddingBottom = '10px';
            }
        }
    })
}

const emit = defineEmits(["update:description"]);

watch(() => props.description,() => {
    setTimeout(() => {
        renderDescription()
    },500);
})
watch(() => props.editPermission,() => {
    editor.value.readOnly.toggle(!props.editPermission)
})

function blocksToText(response = []) {
    let descText = "";
    response.forEach((x) => {
        switch(x.type) {
            case "paragraph":
                descText += x.data.text;
                break;
            case "header":
                descText += x.data.text;
                break;
            case "quote":
                descText += x.data.text + "\n";
                descText += x.data.caption;
                break;
            case "warning":
                descText += x.data.title + "\n";
                descText += x.data.message;
                break;
            case "code":
                descText += x.data.code;
                break;
            case "linkTool":
                descText += x.data.link;
                break;
            case "list":
                descText += x.data.items.join(", ");
                break;
            case "checklist":
                descText += x.data.items.map((x) => x.text).join(", ");
                break;
        }
        descText += "\n";
    })
    return descText;
}

const saveData = debounce(() => {
    editor.value.saver.save().then((response) => {
        response.blocks = response.blocks.filter((block) => block.type !== "WriteWithAi");
        if(response){
            emit("update:description", {blocks: response || {},text : blocksToText(response?.blocks)});
        }
    });
})

function renderDescription(replace = false) {
    if(props.description){
        if(typeof props.description === 'string'){
            blockIndex.value = 1;
            injectDescription(props.description,replace);
        }else{
            editor.value?.render(props.description)
            .then(() => {
                checkContentSize()
            });
            if(!Object.keys(tempBlock.value).length){
                tempBlock.value = props.description;
            }
        }
    }else{
        let obj = {
            blocks: []
        }
        editor.value?.render(obj)
        .then(() => {
            checkContentSize()
        });
    }
}

function openDescriptionWithAi () {
    if(!currentCompany.value?.planFeature?.aiPermission){
        Swal.fire({
            title: "Please Upgrade your plan to use AI",
            text: `AI is only available for purchase on our paid plans.Upgrade and add AI now! `,
            icon: 'info',
            confirmButtonColor: '#28C76F',
            confirmButtonText: 'Upgrade Now',
            showCloseButton:true    
        }).then((result) => {
            if (result.isConfirmed) {
                router.push({name: 'Upgrade', params: {cid: companyId.value}})
            }
        })
        return;
    }
    const data = {
        query: [{title : "Write a Description"}]
    };
    apiRequest("post",env.FINDONEPROMPTS,data).then((result)=>{
        if(result.data.status === true){
            selectedPrompt.value = result.data.statusText;
            isOpenPromptDeatil.value = true;
        }
    })
}

async function injectDescription(description = '') {
    try {
        description = description.replaceAll(/\\n/g, '\n');
        const htmlStr = mardownInit.render(description)
        await converter.value.blocks.renderFromHTML(htmlStr);
    } catch (error) {
        console.error(error,"error");
    }
}

async function injectBlocks (newBlocks) {
    const blocks = [...(tempBlock.value?.blocks || [])]

    newBlocks.forEach((block, index) => {
        blocks.splice(blockIndex.value-1, index === 0 ? 1 : 0, block);
    })
    await editor.value.render({...tempBlock.value, blocks})
    checkContentSize()
}

// async function cancelData () {
//     if(Object.keys(tempBlock.value).length > 0){
//         if(props.description){
//             if(typeof props.description === 'string'){
//                 const blockCount = editor.blocks.getBlocksCount();
//                 for (let i = blockCount - 1; i >= 0; i--) {
//                     editor.blocks.delete(i);
//                 }
//                 blockIndex.value = 1;
//                 converter.blocks.renderFromHTML(props.description);
//             }else{
//                 editor?.render(props.description);
//                 if(!Object.keys(tempBlock.value).length){
//                     tempBlock.value = props.description;
//                 }
//             }
//         }else{
//             let obj = {
//                 blocks: []
//             }
//             editor?.render(obj);
//         }
//     }
// }

function resetAiBlocks() {
    // const currIndex = blockIndex.value;
    // editor.blocks.delete(currIndex - 1);

    document.querySelectorAll("[data-type=WW_AI]").forEach((x) => {
        const blockId = x?.parentElement?.parentElement?.dataset?.id
        const deleteIndex = editor.value.blocks.getBlockIndex(blockId)
        if(deleteIndex >= 0) {
            editor.value.blocks.delete(deleteIndex);
        }
    })
}

provide('injectDescription',injectDescription)
</script>

<style src="./style.css">

</style>