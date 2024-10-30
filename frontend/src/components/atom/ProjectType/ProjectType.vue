<template>
    <div>
        <span class="cursor-pointer black project-type-name" :class="{'font-size-13 font-weight-400' : clientWidth > 767, 'font-size-16' : clientWidth <=767}" @click="checkMilestone" :title="projectData.ProjectType ? projectData.ProjectType : 'Fix'">{{projectData.ProjectType ? projectData.ProjectType :"Fix" }}</span>

        <Sidebar
            v-if="checkPermission('project.project_list',projectData?.isGlobalPermission) === true && checkPermission('project.project_type',projectData?.isGlobalPermission) === true"
            v-model:visible="isVisible"
            title="Select Project Type"
            :enable-search="true"
            :options="projectTypeArray.map((x) => {return {label: x.name}})"
            @selected="$emit('selected', $event)"
            :listenKeys="true"
        />
    </div>
</template>

<script setup>
    import { ref ,inject,defineProps} from 'vue';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
    import { useCustomComposable } from '@/composable';
    const projectTypeArray = ref([{name:'Hourly'},{name:'Fix'}]);
    const props = defineProps({
        projectData: {
            type: Object,
        }
    });

    const { checkPermission } = useCustomComposable();

    defineEmits(["selected"]);

    const isVisible = ref(false);
    const clientWidth = inject("$clientWidth");
    // check milestone is created or not
    const checkMilestone = () => {
        let queryObj = [
            { projectId: props.projectData._id }
        ];
        const query = {
            type: "findOne",
            collection: 'milestone',
            data: queryObj
        };
        mongoQuery.mongodbCrudOperations(query).then((result) => {
            if(result && Object.keys(result)?.length){
                isVisible.value = false;
            }else{
                isVisible.value = true;
            }
        }).catch((error) => {
            isVisible.value = true;
            console.error("Error in getFixMilestoneData",error);
        });
    }
</script>
<style scoped>
.project-type-name{
   line-height: 19.24px;
}
</style>
