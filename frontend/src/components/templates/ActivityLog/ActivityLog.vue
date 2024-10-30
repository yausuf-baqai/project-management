<template>
    <SpinnerComp :is-spinner="isSpinner"/>
    <div class="activity-log">
        <div class="activity-scroll">
            <div v-for="data in activityLog" :key="data.id" class="main-activity">
                <ActivityContent :data="data" :key="data.id"/>
            </div>
            <div class="d-flex mt-1" v-if="activityLog.length > 9 && isVisibleLoadMoreButton === true && allRecordCount > skip + limit">
                <button @click="commonGetQuery(true)" class="btn-class cursor-pointer">Load More</button>
            </div>
            <div v-if="activityLog.length === 0 && !isSpinner" class="d-flex justify-content-center">
                <span>No activity log found</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { dbCollections } from '@/utils/FirebaseCollections';
import { defineComponent,defineProps,inject,ref,onMounted, watch } from "vue";
import moment from "moment";
import { useGetterFunctions } from '@/composable/index';
import ActivityContent from "@/components/molecules/ActivityLogContent/ActivityContent.vue";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { useRoute } from "vue-router";
const { getUser } = useGetterFunctions();
const defaultpic = inject("$defaultUserAvatar");
defineComponent({
    name: "ActivityLog",
    components: {
        ActivityContent,
        SpinnerComp
    },
})
const props = defineProps({
    dataObj: Object,
    fromProject: {
        type: Boolean,
        required: true,
        default: undefined
    },
});
const activityLog = ref([]);
const lastVisible = ref(null);
const isVisibleLoadMoreButton = ref(true);
const isSpinner = ref(false);
const skip = ref(0);
const limit = ref(10);
const route = useRoute()
const allRecordCount = ref();

watch(() => props.dataObj,(prValue) => {
    if(props.fromProject === true && prValue._id !== route.params.id){
        commonGetQuery();
    }
})

function commonGetQuery(loadMore = false) {
    isSpinner.value = true;
    if(loadMore){
        skip.value += limit.value
    } else {
        skip.value = 0;
        activityLog.value = [];
    }
    let queryObj = [
        {
            $match: 
                props.fromProject == false ?
                {
                    $and: [
                        {Type: {$ne : "project"}},
                        {ProjectId: `${props.dataObj.ProjectID}`},
                        {TaskId: `${props.dataObj._id}`}
                    ]
                }  
                :
                {
                    $and: [
                        {Type: "project"},
                        {ProjectId: `${props.dataObj._id}`}
                    ]
                }
        },
        {$sort: {createdAt: -1,_id: 1}}
    ]
    const data = {
        type: 'aggregate',
        collection: dbCollections.HISTORY,
        data: [
            [
                ...queryObj,
                {
                    $facet: {
                        result:[
                            { $skip: skip.value},
                            { $limit: limit.value}
                        ],
                        count:[
                            {$count: "count" }
                        ]
                    }
                }
            ]
        ]
    }
    mongodbCrudOperations(data)
    .then((response) => response?.[0])
    .then((response) => {
        const res = response.result;
        allRecordCount.value = response?.count?.[0].count;
        if(res.length == 0){
            isVisibleLoadMoreButton.value = false;
            isSpinner.value = false;
            return;
        }
        res.forEach((element) => {
            let dataObject = {...element};
            dataObject.displayDate = dataObject.createdAt == undefined ? moment(new Date()).format('ddd, MMM DD, YYYY hh:mm:ss A') : moment(new Date(dataObject?.createdAt)).format('ddd, MMM DD, YYYY hh:mm:ss A');
            const user = getUser(dataObject.UserId);
            dataObject.userData = {
                image: user.Employee_profileImageURL ? user.Employee_profileImageURL : defaultpic,
                title: user.Employee_Name
            };
            activityLog.value.push(dataObject);
        });
        lastVisible.value = res[res.length -1];
        isSpinner.value = false;
    })
    .catch((error) => {
        console.error(`ERROR in getting activity log of ${props.fromProject == false ? 'task': 'project'}` , error);
    })
}
onMounted(() => {
    if(props.fromProject == undefined) {
        throw new Error("fromProject is required");
    }
    commonGetQuery();
})
</script>
<style src="./style.css"></style>