<template>
    <div>
        <span
        class="project-category-name black cursor-pointer"
        :class="{'font-size-13 font-weight-400' : clientWidth > 767 ,'font-size-16' : clientWidth <=767}"
        :style="[{padding : clientWidth > 767 ? '10px 10px 10px 0' : '10px 0px'}]"
        @click="isVisible = true"
        :title="projectCategory"
        >
       {{projectCategory}}
        </span>

        <Sidebar
            v-if="checkPermission('project.project_list',projectData?.isGlobalPermission) === true && checkPermission('project.project_category',projectData?.isGlobalPermission) === true"
            v-model:visible="isVisible"
            title="Select Project Category"
            :enable-search="true"
            :options="category.map((x) => {return {label: x}})"
            @selected="$emit('selected', $event)"
            :listenKeys="true"
        >
        </Sidebar>
    </div>
</template>

<script setup>
import { ref , computed, defineEmits , inject } from 'vue';
import { useStore } from 'vuex';
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import { useCustomComposable } from '@/composable';

 const { getters } = useStore();
 const clientWidth = inject("$clientWidth");
 const { checkPermission } = useCustomComposable();

 const props = defineProps({
    projectData: {
        type: Object,
    }
 })

 const category = computed(() => {
    return getters['settings/category'];
});

const projectCategory = computed(() => {
    return category.value.find((cat) => cat === props.projectData.ProjectCategory);
});

defineEmits(["selected"])


const isVisible = ref(false);
</script>
<style>
.project-category-name{
   line-height: 19.24px;
}
</style>