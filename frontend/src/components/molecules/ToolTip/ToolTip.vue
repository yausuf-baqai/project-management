<template>
    <div :id="dyid" @mouseover="showTooltip = true,setPosition()" @mouseleave="handleMouseLeave">
        <span class="text-ellipsis">{{ props.label }}</span>
        <teleport to="body">
            <div :id="`dd_${dyid}`" @mouseover="hoverTooltip = true" @mouseleave="handleLeave" class="tooltip">
                <div v-if="showTooltip && !showFullText" class="tooltip-read-more">
                    <span class="tooltip-text-wrapper">{{ truncatedText }}</span>
                    <span class="blue cursor-pointer" v-if="isTruncated">...<span @click="showTooltip = false,showFullText=true">read more</span></span>
                </div>
                <div v-if="showFullText" class="tooltip-full-text">
                    <div class="tooltip-hover-text style-scroll">
                        <span class="tooltip-text-wrapper">{{fullText}}</span>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>
<script setup>
    import { onMounted, ref, watch } from "vue";
    import { useCustomComposable } from "@/composable";

    const {makeUniqueId} = useCustomComposable();
    const props = defineProps({
        label:{
            type: String,
            default:''
        },
        descriptions:{
            type: String,
            default:''
        }
    });

    // ref
    const fullText = ref('');
    const truncatedText = ref('');
    const showTooltip = ref(false);
    const isTruncated = ref(false);
    const showFullText = ref(false);
    const hoverTooltip = ref(false);
    const dyid = ref(makeUniqueId(5));
    const description = ref(props?.descriptions ? props?.descriptions : ''); // Replace with your actual description

    // watch
    watch(description, () => {
        truncateText();
    });

    //onMounted
    onMounted(() => {
        truncateText();
    });

    //function
    const truncateText = () => {
        const maxLength = 20;
        if (description.value.length > maxLength) {
            truncatedText.value = description.value.substring(0, maxLength);
            fullText.value = description.value;
            isTruncated.value = true;
        } else {
            truncatedText.value = description.value;
            fullText.value = '';
            isTruncated.value = false;
        }
    };

    const handleMouseLeave = () => {
        setTimeout(()=>{
            if(hoverTooltip.value === false){
                showTooltip.value = false;
                showFullText.value = false; 
            }
        })
    };

    const setPosition = () => {
        const element = document.getElementById(dyid.value);
        let childNode = document.getElementById(`dd_${dyid.value}`);

        // Check if the tooltip is present and position it
        if (element) {
            const {bottom, left} = element.getBoundingClientRect();
            const {width} = childNode.getBoundingClientRect();

            if(document.documentElement.clientWidth < (left + width + 25)) {
                const offset = document.documentElement.clientWidth - (left + width + 15);
                childNode.style.left = left + offset + "px";
            } else {
                childNode.style.left = left + -20 + "px";
            }
            childNode.style.bottom = document.documentElement.clientHeight - bottom + 20 +"px";
        }
    };

    const handleLeave = () => {
        hoverTooltip.value = false;
        showTooltip.value = false;
        showFullText.value = false;
    };
</script>
<style>
    @import '@/components/molecules/ToolTip/style.css';
</style>