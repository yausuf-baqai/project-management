<template>
    <div>
        <span class="black project-billing-name cursor-pointer" @click="checkMilestone" :class="{'font-size-13 font-weight-400' : clientWidth > 767, 'font-size-16' : clientWidth <=767}" :style="[{padding : clientWidth > 767 ? '0' : '10px 0px'}]" :title="props.projectData.BillingPeriod ? props.projectData.BillingPeriod : ''">{{props.projectData.BillingPeriod ? props.projectData.BillingPeriod :"'N/A'" }}</span>
        <Sidebar
            v-model:visible="isVisible"
            title="Select Billing Period"
            :enable-search="true"
            :options="bilingValue"
            @selected="$emit('selected', $event)"
            :listenKeys="true"
        />
    </div>
</template>

<script setup>
    // import
    import { ref , defineProps ,onMounted,inject } from 'vue';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import { settingsCollectionDocs } from '@/utils/FirebaseCollections';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
    // Props
    const props = defineProps({
        projectData: {
            type: Object,
        }
    })
    // Emits
    defineEmits(["selected"]);
    // variable
    const bilingValue = ref([]);
    const isVisible = ref(false);
    const clientWidth = inject("$clientWidth");
    // onMounted
    onMounted(async () => {
        let queryObj = [
            { name: settingsCollectionDocs.HOURLY_MILESTONE_RANGE }
        ];
        const query = {
            type: "find",
            collection: 'settings',
            data: queryObj
        };
        await mongoQuery.mongodbCrudOperations(query).then((result) => {
            let data = result[0].settings;
            data.forEach((x) => {
                bilingValue.value.push({"label" : x});
            });
        })
    });
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
    };
</script>

<style>
.project-billing-name{
    line-height: 19.24px;
}
</style>