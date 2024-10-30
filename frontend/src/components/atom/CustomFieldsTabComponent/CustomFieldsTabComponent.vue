<template>    
    <template v-for="(tabs,index) in tabArray" :key="index">
        <div class="d-flex align-items-center pt-20px mb-20px custom_field-border" v-if="tabs.type === props.componentDetail.cfType">
            <h4 
                v-for="(tabValue,ind) in tabs.tab" :key="ind"
                :class="[{'activeClass' : tabIndex === ind + 1,'mr-40px':tabs.tab.length !== ind +1}]" 
                class="font-roboto-sans font-size-14 font-weight-500 line-height-30px m-0 GunPowder cursor-pointer pb-7px" 
                @click="tabIndex = ind + 1,emit('handleIndex',ind + 1)"
            >
                {{tabValue}}
            </h4>
        </div>
    </template>
</template>

<script setup>
    //import
    import { ref, watch } from "vue";

    const tabArray = ref([
        {
            type:'text',
            tab:['General','Options']
        },
        {
            type: 'checkbox',
            tab: ['General']
        },
        {
            type:'dropdown',
            tab:['General', 'Options', 'Advanced']
        },
        {
            type:'date',
            tab:['General','Options','Time','Limits']
        },
        {
            type:'money',
            tab:['General', 'Options']
        },
        {
            type:'textarea',
            tab:['General', 'Options']
        },
        {
            type:"number",
            tab:['General','Options']
        },
        {
            type:"phone",
            tab:['General','Options']
        },
        {
            type:"email",
            tab:['General']
        }
    ]);
    const emit = defineEmits(['handleIndex']);
    const props = defineProps({
        componentDetail:{
            type:Object,
            default:() => {}
        },
        tabIndexComp:{
            type:Number,
            default:1
        }
    });
    const tabIndex = ref(props.tabIndexComp)
    watch(() => props.tabIndexComp , (val)=>{
        tabIndex.value = val;
    });
</script>
