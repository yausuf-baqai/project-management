<template>
    <tr>
        <td>
            <div class="d-flex align-items-center">
                <UserProfile
                    :data="{title: item.loggedUserName, image: item.loggedUserProfile}"
                    width="30px"
                    :showDot="true"
                    class="imageUser mr-10px"
                    :thumbnail="'30x30'"
                />
                {{item.loggedUserName}}
            </div>
        </td>
        <td>
            <div class="d-flex align-items-center justify-content-between">
                <div class="discription_project d-flex align-items-center justify-content-between">
                    <span class="text-ellipsis">{{item.LogDescription}}</span>
                    <img v-if="item.startTimeTracker && !checkDateDiff" :src="timeTrackerIcon">
                </div>
            </div>
        </td>
        <td >{{item.displaylogTimeDate}}</td>
        <td>{{changeTimeFormat(moment(new Date(item.LogStartTime * 1000)).format('hh:mm A'),moment(new Date(item.LogEndTime * 1000)).format('hh:mm A'))}}</td>
        <td>
             <div class="d-flex align-items-center justify-content-evenly">
                <span>{{item.duration}}</span>
                <img v-if="item.logAddType === 1" class="greenPurpleDot" src="@/assets/images/svg/green_dot.svg"/>
                <img v-else class="greenPurpleDot" src="@/assets/images/svg/Purple_dot.svg">
            </div>
        </td>
        <td class="editdelete">
            <span class="d-flex justify-content-start align-items-center">
                <img src="@/assets/images/eye_icon_vector.png" class="cursor-pointer eyeicon" @click="$emit('viewDetail', item)"/>
                <div class="projectDetailAction d-flex justify-content-end" v-if="item.Loggeduser === userId">
                    <img v-if="item.logAddType === 0" src="@/assets/images/edit_icon.png" class="cursor-pointer mr-1 edit__icon-image" @click.stop="$emit('showEdit', item)" />
                    <img src="@/assets/images/delete_icon.png" class="cursor-pointer" @click.stop="$emit('deleteTime', item)"/>
                </div>
            </span>
        </td>
    </tr>
</template>

<script setup>
    import moment from "moment";
    import { useGetterFunctions } from "@/composable";
    import { inject , defineProps ,defineEmits, computed} from "vue";
    import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
    const props = defineProps({
        item: {
            type: Object,
        }
    })
    defineEmits(["showEdit", "deleteTime" ,"viewDetail"]);

    const {getUser} = useGetterFunctions();
    const userId =  inject('$userId');

    const timeTrackerIcon = require("@/assets/images/svg/time_tracker.svg");

    const changeTimeFormat = (start1,end1) => {
        let tempStartLog = start1;
        let tempEndLog = end1;
        let user = getUser(userId.value);
        if(user.timeFormat == '24'){
            tempStartLog = moment(start1, "hh:mm A").format("HH:mm");
            tempEndLog = moment(end1, "hh:mm A").format("HH:mm");
        }
        return tempStartLog  + ' - '  + tempEndLog;
    }
    
    const checkDateDiff =  computed(() => {
        let date1 = props.item.startTimeTracker ? new Date(props.item.startTimeTracker * 1000) : ''
        let date2 = new Date();
        const diffMinutes = moment(date2).diff(moment(date1), 'minutes');
        if(diffMinutes >= 10){
           return true;
        }else{
            return false;
        }
    })

</script>
<style scoped>
.edit__icon-image{
    height: 18px !important;
}
</style>