<template>
    <div class="task-detail-title">
        <ul class="d-flex">
            <li v-if="!isSupport">
                <img
                    v-if="isFavourite"
                    class="cursor-pointer fav__star-img"
                    src="@/assets/images/svg/start13.svg"
                    @click="$emit('update:favourite')"
                />
                <img
                    v-if="!isFavourite"
                    class="cursor-pointer fav__star-img"
                    src="@/assets/images/svg/blankStar.svg"
                    @click="$emit('update:favourite')"
                />
            </li>
            <li class="task-name">
                <template v-if="!isSupport">
                    <img v-if="getTaskType(props.taskType, selectedProject)?.taskImage !== undefined ? getTaskType(props.taskType, selectedProject).taskImage.includes('http') : ''" v-bind:src="getTaskType(props.taskType, selectedProject)?.taskImage !== undefined ? getTaskType(props.taskType, selectedProject).taskImage : ''" alt="task_type"  class="border-radius-2-px mt-2px ml-8px task__selected-type">
                    <WasabiImage 
                        v-else
                        class="border-radius-2-px mt-2px ml-8px task__selected-type"
                        :data="{url: getTaskType(props.taskType, selectedProject)?.taskImage !== undefined ? getTaskType(props.taskType, selectedProject).taskImage : ''}"
                    />
                </template>
                <template v-if="!isEditName">
                <h4 
                    v-if="checkPermission('task.task_name_edit',selectedProject?.isGlobalPermission) === true"
                    class="title-name"
                    :title="taskName"
                    @click="isEditName = true, editTaskName = taskName"
                >
                    {{ taskName }}
                </h4>
                <h4 
                    v-else
                    class="title-name"
                    :title="taskName"
                >
                    {{ taskName }}
                </h4>
                </template>
                <span v-else>
                    <InputText
                        input-id="taskNameEdit"
                        v-model="editTaskName"
                        :is-direct-focus="true"
                        :max-length="250"
                        @blur="editFocusOut()"
                        place-holder="Task Name"
                        @enter="$emit('update:taskName', editTaskName), isEditName = false"
                        height="25px"
                        :isOutline="false"
                    />
                </span>
                <img
                    v-if="!isEditName && !isSupport"
                    src="@/assets/images/copy.png"
                    class="copy-icon cursor-pointer"
                    @click="copyText(taskName)"
                />
            </li>
        </ul>
    </div>
</template>
<script setup>
    import { useGetterFunctions, useCustomComposable } from '@/composable';
    import { computed, defineProps, defineEmits,inject,ref } from 'vue';
    import InputText from '@/components/atom/InputText/InputText.vue';
    import { useToast } from 'vue-toast-notification';
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";

    const { checkPermission } = useCustomComposable();

    defineEmits(["update:taskName", "update:favourite"])
    const props = defineProps({
        favourites: Array,
        taskType: Number,
        taskName: String,
        isSupport: {
            type: Boolean,
            default: false
        }
    });

    const $toast = useToast();

    const editTaskName = ref('');
    const userId = inject('$userId')
    const isFavourite = computed(() => {
        return props.favourites && props.favourites.length && props.favourites.filter((x) => x === userId.value).length;
    });
    const selectedProject = inject("selectedProject");
    const { getTaskType } = useGetterFunctions();

    const isEditName = ref(false); 

    const editFocusOut = () => {
        if(isEditName.value) {
            isEditName.value = false;
        }
        editTaskName.value = '';
    }

    const copyText = (text) => {
        $toast.success(`Task name copied`, {position: "top-right"})
        navigator.clipboard.writeText(text);
    }

</script>
<style src="./style.css"></style>