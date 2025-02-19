<template>
    <div>
        <div class="d-flex align-items-center" @click.stop.prevent="!showAddUser ? addUser ? visible=true : '' : ''" :id="tourId">
            <UserProfile
                v-for="user in detailedUsers.filter((x, index) => index < numOfUsers)"
                :key="user._id"
                :showDot="showDot"
                class="cursor-pointer ml--5px"
                :data="user"
                :width="imageWidth"
                :thumbnail="'30x30'"
            />

            <DropDown :id="'Assignee_'+makeUniqueId(6)" v-if="detailedUsers.length > numOfUsers">
                <template #button>
                    <div class="d-flex align-items-center justify-content-center profile-image black text-nowrap font-weight-400 ml--5px border-2px-blue font-size-12 bg-colorlightgray position-re" :style="{width: imageWidth, height: imageWidth}">
                        +{{detailedUsers.length - numOfUsers}}
                    </div>
                </template>
                <template #options>
                    <DropDownOption
                        v-for="(user, index) in detailedUsers.filter((x, index) => index >= numOfUsers).map((x) => ({label: x.title ? x.title : x.name, image: x.image, type: x.type, teamColor: x.teamColor || {}, assigneeUsersArray: x.assigneeUsersArray || []}))"
                        :key="'user'+index"
                    >
                        <div class="d-flex align-items-center" :title="user.label">
                            <UserProfile
                                :showDot="false"
                                class="cursor-pointer ml--5px"
                                :data="user"
                                :width="imageWidth"
                            />
                            <span class="ml-10px">{{ user.label }}</span>
                        </div>
                    </DropDownOption>
                </template>
            </DropDown>

            <img v-if="addUser && (showAddUser || !detailedUsers.length)" :src="addUserIcon" alt="add user" title="Add User" class="cursor-pointer add__user" @click.stop="addUser ? visible=true : ''" :style="{marginLeft: (detailedUsers.length ? '5px' : '0px'), width: imageWidth, height: imageWidth}" />
            <span v-if="!addUser && !detailedUsers.length" class="font-size-13">N/A</span>
        </div>

        <Sidebar
            :top="clientWidth<=767 ? '0px' : '46px' "
            title="List of Users"
            :value="detailedUsers.map((x) => ({value: x.id, label: x.title ,id: x.id, image: x.image, isOnline: x.isOnline,designation:x.designation}))"
            v-model:visible="visible"
            :options="detailedOptions"
            :multi-select="props.multiSelect"
            :enable-search="true"
            :grouped="true"
            :showClear="false"
            :zIndex="zIndexAssigne"
            @selected="$emit('selected', $event)"
            @removed="$emit('removed', $event)"
        />
    </div>
</template>
<script setup>
// PACKAGES
import { defineComponent, defineProps, defineEmits, ref, computed ,inject} from "vue";
import { useCustomComposable, useGetterFunctions } from "@/composable";
import { useStore } from 'vuex';

// COMPONENTS
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'

// UTILS
const {getUser, getTeam} = useGetterFunctions();
const {makeUniqueId} = useCustomComposable();
const { getters } = useStore();

const addUserIcon = require("@/assets/images/svg/Assign_white.svg")
const clientWidth = inject("$clientWidth");

// COMPONENT
defineComponent({
    name: 'Assignee-Component',
    components: {
        UserProfile,
        Sidebar,
        DropDown,
        DropDownOption
    }
})

defineEmits(["selected", "removed"])

// PROPS
const props = defineProps({
    numOfUsers: {
        type: Number,
        default: 4
    },
    users: {
        type: Array,
        default: () => []
    },
    showDot: {
        type: Boolean,
        default: true
    },
    addUser: {
        type: Boolean,
        default: true
    },
    showAddUser: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default: () => []
    },
    imageWidth: {
        type: String,
        default: "50px"
    },
    zIndexAssigne: {
        type: Number,
        default: 7
    },
    isDisplayTeam: {
        type: Boolean,
        default: true
    },
    multiSelect: {
        type: Boolean,
        default: true 
    },
    tourId: {
        type: String,
        default: ''
    }
})

const visible = ref(false);
// Temporary team assign hide
// const isDisplayTeam = ref(props.isDisplayTeam);
const designations = computed(() => {
    return getters['settings/designations'];
});
const companyUsers = computed(() => {
    return getters['settings/companyUsers'].filter(user => user.isDelete === false);
});

const detailedUsers = computed(() => {
        return props.users.map((x) => {
            let user;
            let team;
            if (x.indexOf('tId_') === -1) {
                user = getUser(x);
                return {
                    id: x,
                    title: user.Employee_Name,
                    image: user?.Employee_profileImageURL || "",
                    isOnline: user.isOnline,
                    type: 'user'
                }
            } else {
                team = getTeam(x.split('tId_')[1]);
                return {
                    id: x,
                    title: team.name,
                    image: "",
                    isOnline: false,
                    type: 'team',
                    teamColor: team.teamColor,
                    assigneeUsersArray: team.assigneeUsersArray
                }
            }
    })?.filter((x) => {
        if (x.type === 'team' || !getUser(x.id).ghostUser) {
            return true;
        }
        return false;
    });
});
const selectedUser =  computed(() => {
    return props.options.filter(user => props.users.includes(user));
})  
const unselectedUser = computed(() => {
    return props.options.filter(user => !props.users.includes(user));
})
// Temporary team assign hide
// const teams = computed(() => {
//     return getters["settings/teams"]
// })
const detailedOptions = computed(() => {
    let res = [
        {
            label: "Users",
            options: []
        },
    ];
    // Temporary team assign hide
    // if(isDisplayTeam.value) {
    //     res.unshift({
    //         label: "Teams",
    //         options: []
    //     })
    // }
    let first = [];
    let second = [];
    selectedUser.value.forEach((x) =>{
        const user = getUser(x);
        if(user.Employee_Name !== "Ghost User" && companyUsers.value.some(y => y.userId === x)) {
            first.push({
                id: x,
                value: x,
                label: user.Employee_Name,
                image: user.Employee_profileImageURL,
                type: 'user'
            })
        }
    });
    first.sort((a, b) => a.label?.trim()?.toLowerCase() > b.label?.trim()?.toLowerCase() ? 1 : -1);
    unselectedUser.value.forEach((x) => {
        const user = getUser(x);
        if(user.Employee_Name !== "Ghost User" && companyUsers.value.some(y => y.userId === x)) {
            second.push({
                id: x,
                value: x,
                label: user.Employee_Name,
                image: user.Employee_profileImageURL,
                type: 'user'
            })
        }
    });
    second.sort((a, b) => a.label?.trim()?.toLowerCase() > b.label?.trim()?.toLowerCase() ? 1 : -1);
    let finalArray = Array.from(new Set([...first, ...second]));
    finalArray.forEach((x) => {
        const designationKey = companyUsers.value.filter((y) => y.userId === x.id)?.[0]?.designation;
        const designation = designations.value?.filter((x) => x.key === designationKey)[0]?.name;
        x.designation = designation;
        res[0].options.push(x);

        // Temporary team assign hide
        // res[isDisplayTeam.value ? 1: 0].options.push(x);
    })
    // Temporary team assign hide
    // if (isDisplayTeam.value) {
    //     res[0].options = teams.value.filter((tf) => unselectedUser.value.indexOf('tId_'+tf._id) !== -1 || selectedUser.value.indexOf('tId_'+tf._id) !== -1).map((tRow) => ({
    //         teamColor: tRow.teamColor,
    //         assigneeUsersArray: tRow.assigneeUsersArray,
    //         id: 'tId_'+tRow._id,
    //         value: 'tId_'+tRow._id,
    //         label: tRow.name,
    //         image: "",
    //         designation: "",
    //         type: 'team'
    //     }))
    // }
    return res;
});

</script>
<style>
.share__with-assignee .profile-image{
    font-size: 8px !important;
}
.add__user{
    min-width: 25px;
}
</style>