<template>
    <div class="queue__list-taskdetail-wrapper d-flex align-items-center position-re cursor-pointer" @click.stop.prevent="openInNewTab(Taskdata)">
        <div class="queue__list-taskdetail d-flex align-items-center justify-content-between position-re border-radius-3-px">
            <span class="font-size-14 font-weight-400 GunPowder d-block w-94">
                <div class="d-flex align-items-center">
                    <span v-if="Taskdata.statusType !== 'close'" :style="[{'background-color':(allTaskStatusArray && allTaskStatusArray.settings.length) ? allTaskStatusArray.settings.find((ut)=> ut.key === Taskdata.statusKey)?.textColor : '','width':'10px','height':'10px','margin-right': '9.5px','min-width':'10px'}]"></span>
                    <img v-else :src="greenCheck" class="greencheck__img">
                    <span class="text-ellipsis d-block" :title="Taskdata.TaskName">{{Taskdata.TaskName}}</span>
                </div>
            </span>
            <span class="cursor-pointer queue__list-closebtn text-right"><img :src="close" @click="removeFromQueueList(Taskdata)"/></span>
        </div>
    </div>
</template>
<script setup>
import {defineProps,computed,ref,defineEmits} from "vue"
import { useStore } from 'vuex';
const { getters } = useStore();
const emit = defineEmits([
    'removeTaskFromQueueData',
    'openTaskDetailSidebar'
])
const close = require('@/assets/images/svg/close_svg.svg');
const greenCheck = require("@/assets/images/svg/green_check.svg");
const TaskStatusArray = computed(() => getters["settings/AllTaskStatus"]);
const allTaskStatusArray = ref(JSON.parse(JSON.stringify(TaskStatusArray.value)));
defineProps({
    Taskdata : {type:Object,required:true},
})
const openInNewTab = (task) => {
    emit('openTaskDetailSidebar',task)
};
const removeFromQueueList = (obj) => {
    emit('removeTaskFromQueueData',obj)
}
</script>
<style scoped src="../Home/style.css"></style>