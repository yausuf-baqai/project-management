<template>
    <SpinnerComp :is-spinner="isSpinner" />
    <div>
        <h2 class="task_priority_wrapper_value">Milestone Weekly Range</h2>
        <div class="mySettingSection priorityWrapper">
            <div v-if="!milestoneCheck && props.editPermission" :class="[{'Company-pointer-event-none':isSpinner}]">
                <div class="vs-component vs-con-input-label vs-input inputx vs-input-primary">
                    <DropDown>
                        <template #button>
                            <div class=" vs-inputx vs-input--input normal" :ref="milestonefromate">
                                {{ milestoneformat }}
                            </div>
                        </template>
                        <template #options>
                            <DropDownOption v-for="(date, index) in dateArray" :key="index">
                                <div class="w-100"  @click="handleSelect(date),$refs[milestonefromate].click()">{{date}}</div>
                            </DropDownOption>
                        </template>
                    </DropDown>
                </div>
                <div class="d-flex">
                    <button type="submit" class="blue_btn" id="blue_btn" :class="[{'Company-pointer-event-none':isSpinner}]" @click="saveData">Save</button>
                    <button type="button" name="button"
                        :class="[{'Company-pointer-event-none':isSpinner}]" class="vs-component vs-button white_btn vs-button-primary vs-button-filled" @click="cancelData">
                        Cancel
                    </button>
                </div>
            </div>
            <span v-else>{{ milestoneformat }}</span>
        </div>
    </div>
</template>

<script setup>
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import { defineComponent, ref, computed ,defineProps, watch, onMounted} from "vue";
import { useStore } from "vuex";
import { dbCollections, settingsCollectionDocs } from "@/utils/FirebaseCollections";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { useToast } from 'vue-toast-notification';
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";

const $toast = useToast();
const dateArray = ref(['Mon - Sun', 'Sun - Mon'])
const milestonefromate = ref("")
const { getters } = useStore();
const isSpinner = ref(false);
const milestoneformat = ref('');
const milestoneCheck = ref(false);
defineComponent({
    name: 'Company-Details',
    components: {
        DropDown,
        DropDownOption,
        SpinnerComp,
    }
})
const props = defineProps({
    editPermission: {
        type: [Boolean],
        default: false
    }
});
const milestone = computed(() => getters["settings/milestoneweeklyrange"]);
watch(milestone,(newValue)=>{
    milestoneformat.value = newValue;
});
onMounted(()=>{
    getMongodbData();
})
// GET WEEKLY MILESTONE 
function getMongodbData() {
    let queryObj = [
        { billingPeriod: 'Weekly' }
    ];
    const query = {
        type: "findOne",
        collection: 'milestone',
        data: queryObj
    };
    mongodbCrudOperations(query).then((result) => {
        if(result && Object.keys(result)?.length){
            milestoneCheck.value = true;
        }else{
            milestoneCheck.value = false;
        }
        milestoneformat.value = milestone.value;
    }).catch((error) => {
        milestoneCheck.value = false;
        console.error("Error in getFixMilestoneData",error);
    });
}
// SAVE DATA MILESTONE WEEKLY RANGE ///
function saveData() {
    if (milestoneformat.value) {
        if(milestone.value !== milestoneformat.value){
            isSpinner.value = true;
            let queryObj = [
                { 'name': settingsCollectionDocs.HOURLY_MILESTONE_WEEKLY_RANGE },
                {$set: {settings: [milestoneformat.value]}}
            ];
            const queryUpdate = {
                type: "updateOne",
                collection: dbCollections.SETTINGS,
                data: queryObj
            };
            /*
                - Locate documents in the "settings" collection find the "name" field with "hourly_milestone_weekly_range."
                - Within these documents, add the object in the "settings" array.
            */
            mongodbCrudOperations(queryUpdate).then(() => {
                isSpinner.value = false;
                $toast.success("Milestone weekly range updated successfully.", { position: 'top-right' });
            }).catch((error)=>{
                $toast.error('Some thing went wrong', { position: 'top-right' });
                console.error("ERROR in delete sprint: ", error);
            });
    
        }
    }
}
const cancelData = () => {
    milestoneformat.value = milestone.value;
};
const handleSelect = (value) => {
    milestoneformat.value = value;
};
</script>

<style scoped>
@import './style.css';


.blue_btn {
    margin-left: 0px !important;
}

.normal {
    width: 264px !important;
    height: 30px !important;
}
.inputx {
    margin-bottom: 20px !important;
}
.font_family_status_date {
    font-family: 'Roboto';
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
    letter-spacing: 0px;
    text-align: left;
    display: block;
}
@media(max-width: 1199px){
.inputx {
    margin-bottom: 25px !important;
}
}
@media(max-width: 480px){
    .normal {width: 100% !important;}
}
@media(max-width: 375px){
    .normal {margin-bottom: 10px;width: 100% !important;}
    .inputx {
    margin-bottom: 0px !important;
}
}
</style>