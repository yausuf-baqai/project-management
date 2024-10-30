<template>
    <div v-if="checkPermission('settings.settings_team_list') !== null">
        <div class="team-management-settings p-1">
            <div v-if="teams.length === 0" class="errorWrapper position-ab">
                <img src="@/assets/images/svg/No-Search-Result.svg" alt="aliansoftware"/>
                <div class="error-text text-center">
                    <h2>No data found</h2>
                </div>
            </div>
            <div v-if="teams.length > 0">
                <div class="d-flex title-team-user justify-content-between">
                    <span>Team</span>
                    <span>User</span>
                </div>
                <div v-for="(row, index) in teams" :key="index" class="team-section d-flex align-items-center justify-content-between bg-white">
                    <div class="d-flex align-items-center team-name-icon position-re" tabindex="0" @blur="row.isPopupOpen = false">
                        <span class="team_icon_span cursor-pointer text-center" :style="[{'color': row?.teamColor?.color,'background-color': row?.teamColor?.bgColor, 'padding':'5px'}]"  @click="row.isPopupOpen = true">{{row.name.charAt(0)}}</span>
                        <ul v-if="row.isPopupOpen && editPermission === true" class="ul-colors ul-color-sidebar-popup d-flex flex-wrap justify-content-start position-ab bg-white">
                            <li v-for="(color, index) in colors" :key="index" @click="(row.teamColor.bgColor = color, handleUpdate(row),row.isPopupOpen = false)" :class="[{'active': color === row.teamColor.bgColor}]" :style="[{'cursor':'pointer', 'background-color': color}]">
                                <span></span>
                            </li>
                        </ul>
                        <div class="team_name dark-gray font-roboto-sans">
                            <span v-if="row.isEdit === false" @click="editPermission === true ? openInput(row) :''">{{row.name}}</span>
                            <span v-if="row.isEdit === true && editPermission === true">
                                <InputText :is-direct-focus="true" @blur="editFocusOut(row)" v-model.trim="existingValue"  @enter="saveTeamName(row)" />
                            </span>
                        </div>
                    </div>
                        <Assignee class="Assignee-component ml-15px assginee__comp-wrappper"
                            :users="row.assigneeUsersArray"
                            :options="users.map((x) => x._id)"
                            :imageWidth="'30px'" 
                            :showDot="false"
                            :addUser=editPermission
                            @selected="changeAssignee('add', $event,row)"
                            @removed="changeAssignee('remove', $event,row)"
                            :isDisplayTeam="false"
                        />
                </div>
            </div>
        </div>
    </div>
    <div v-else class="text-center">
        <img :src="accesDenied" />
    </div>
</template>

<script setup>
    import { defineComponent, ref, computed} from "vue";
    import { useStore } from 'vuex';
    import InputText from "@/components/atom/InputText/InputText.vue"
    import { useCustomComposable } from '@/composable';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import Assignee from "@/components/molecules/Assignee/Assignee.vue"
    import { useToast } from 'vue-toast-notification';
    import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
    import { BSON } from "realm-web";
    const $toast = useToast();
    defineComponent({
        name: "TeamsComponent"
    })
    const { getters } = useStore();
    const { checkPermission } = useCustomComposable();
    const editPermission= computed(() =>checkPermission('settings.settings_team_list'))
    const existingValue = ref('');
    const colors = ref([
        "#40BC86","#1ABC9C","#27AE60","#00D717","#F31D2F",
        "#EC555C","#FC575E","#FCB410","#B17E22","#F24D16",
        "#FF8600","#EC6F32","#2980B9","#3498DB","#528CCB",
        "#03A2FD","#7B68EE","#BF4ACC","#074354","#34495E",
        "#181D21","#0918EC","#199EC7"
    ])

    const users = computed(() => getters["users/users"]);
    const teams = computed(() => getters["settings/teams"]);
    const accesDenied = require("@/assets/images/access_denied_img.png");

    const changeAssignee = (type, user,row) => {
        let updateObj = {
            $set: {updatedAt: new Date()}
        };

        if(type === "add") {
            updateObj.$addToSet = {assigneeUsersArray: user.id};
        } else {
            updateObj.$pull = {assigneeUsersArray: user.id};
        }
        let object = [
            { _id: BSON.ObjectID(row._id) },
            updateObj,
            true, //Upsert
            false
        ];

        const query = {
            type: "updateOne",
            collection: dbCollections.TEAMS_MANAGEMENT,
            data: object
        };


        mongodbCrudOperations(query)
        .then(() => {
            $toast.success('Updated successfully',{position: 'top-right'});
        })
        .catch((error) => {
            console.error("ERROR in update project assignee: ", error);
        })
    }

    const editFocusOut = (row) => {
        row.isEdit = false;
    }

    const openInput = (row) => {
        teams.value.map((x)=>{return x._id === row._id ? x.isEdit = true : x.isEdit = false});
        existingValue.value = row.name;
    }

    const saveTeamName = (data) => {
        if(data.name === existingValue.value){
            data.isEdit = false;
            return;
        }
        const obj = {
            name: existingValue.value,
            updatedAt: new Date(),
            value: existingValue.value.replaceAll(" ", "_").toUpperCase()
        }
        if(obj.value === ''){
            $toast.error('Team name is required',{position: 'top-right'});
        } else if(obj.value.length < 3){
            $toast.error('Minimum 3 character required',{position: 'top-right'});
        } else if(teams.value && teams.value.length > 0 && teams.value.map((x)=>{return x.value}).includes(obj.value)){
            $toast.error('Team name already exist',{position: 'top-right'});
        }
        else{
            let object = [
                { _id: BSON.ObjectID(data._id) },
                { $set: obj  },
                true, // Upsert
                false
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.TEAMS_MANAGEMENT,
                data: object
            };
            mongodbCrudOperations(query)
            .then(() => {
                data.isEdit = false;
                $toast.success('Updated successfully',{position: 'top-right'});
            })
            .catch((error) => {
                console.error("ERROR in update team name: ", error);
            })
        }
    }

    const handleUpdate = (item) => {
        let object = [
            { _id: BSON.ObjectID(item._id) },
            { $set: { 
                teamColor: {
                    bgColor: item.teamColor.bgColor,
                    color: item.teamColor.color
                    } 
                } 
            },
            true, // Upsert
            false
        ];

        const query = {
            type: "updateOne",
            collection: dbCollections.TEAMS_MANAGEMENT,
            data: object
        };

        mongodbCrudOperations(query)
        .then(() => {
            $toast.success('Updated successfully',{position: 'top-right'});
        })
        .catch((error) => {
            console.error("ERROR in update background color name: ", error);
        })
    }
</script>

<style src="./style.css">
</style>