<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display project bacis detail for blank project form as step-1 in create project module.
========================================================================================== -->
<template>
<div>
    <div class="createprojectContent whitebodyContent_v2">
        <div class="form-group d-flex align-items-center" id="createprojectname_driver">
            <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >Project Name<span class="text-red asterisk">*</span></label>
            <div class="input-field-group">
                <InputText
                    class="form-control login-input text-capitalize"
                    placeHolder="Enter Project Name"
                    autocomplete="off"
                    v-model.trim="theModel.projectName.value"
                    @keyup="gererateProjectKey(theModel.projectName),isUniqueProjectKey(theModel.projectCode.value),checkErrors({'field':theModel.projectName,
                    'name':theModel.projectName.name,
                    'validations':theModel.projectName.rules,
                    'type':theModel.projectName.type,
                    'event':$event.event}),checkErrors({'field':theModel.projectCode,
                    'name':theModel.projectCode.name,
                    'validations':theModel.projectCode.rules,
                    'type':theModel.projectCode.type,
                    'event':$event.event})"
                    maxlength="100"
                    type="text"
                />
                <div class="text-red">{{theModel.projectName.error}}</div>
            </div>
        </div>
        <div class="form-group d-flex align-items-center" id="createprojectkey_driver">
            <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >Key<span class="text-red asterisk">*</span></label>
            <div class="input-field-group">
                <InputText
                    class="form-control login-input text-capitalize"
                    placeHolder="Enter Key Name"
                    autocomplete="off"
                    v-model.trim="theModel.projectCode.value"
                    @keyup="isUniqueProjectKey(theModel.projectCode.value), convertToUpperCase('projectKey'),checkErrors({'field':theModel.projectCode,
                    'name':theModel.projectCode.name,
                    'validations':theModel.projectCode.rules,
                    'type':theModel.projectCode.type,
                    'event':$event.event})"
                    @keypress="removeSpecialCharacter(), convertToUpperCase('projectKey')"
                    type="text"
                />
                <div class="text-red">{{theModel.projectCode.error}}</div>
                <div class="text-red" v-if="theModel.projectCode.isUniqueProjectCode !== ''">{{theModel.projectCode.isUniqueProjectCode}}</div>
            </div>
        </div>
        <div class="form-group d-flex align-items-center" id="createprojectcategory_driver">
            <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >Category<span class="text-red asterisk">*</span></label>
            <div class="input-field-group">
                <InputText
                    class="form-control login-input text-capitalize"
                    placeHolder="Select Category"
                    v-model="theModel.projectCategory.value"
                    @click="openSidebar('locSidebar')"
                    autocomplete="off"
                    readonly
                    @input="theModel.projectCategory.value = theModel.projectCategory.value.toLowerCase()"
                    type="text"
                    @keyup="checkErrors({'field':theModel.projectCategory,
                    'name':theModel.projectCategory.name,
                    'validations':theModel.projectCategory.rules,
                    'type':theModel.projectCategory.type,
                    'event':$event.event})"
                />
                <div class="text-red">{{theModel.projectCategory.error}}</div>
            </div>
        </div>
        <div class="form-group d-flex align-items-center" id="createprojectduedate_driver">
            <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >Due Date</label>
            <VueDatePicker class="text-capitalize" placeholder="Select Project Due Date" v-model="theModel.dueDate.value" @input="updateDueDate(event)" auto-apply  :close-on-auto-apply="true" :min-date="new Date()" :enable-time-picker="false"/>
        </div>
        <div class="form-group d-flex align-items-center" id="createprojectleadassignee_driver">
            <div class="labelDetail leadMain d-flex align-items-center">
                <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >Lead</label>
                <ul class="d-flex">
                    <li class="addIcon ml-0px">
                        <Assignee
                            :users="theModel.leadUser.value.map((x)=>x.id)"
                            :options="users.map((x) => x._id)"
                            :num-of-users="3"
                            imageWidth="30px"
                            @selected="updateAssignee($event, 'add')"
                            @removed="updateAssignee($event, 'remove')"
                            :isDisplayTeam="false"
                        />
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <sidebar v-if="activeLOC"
        :title="sidebarTitle"
        :grouped="false"
        v-model:visible="activeLOC"
        :enable-search="true"
        :multi-select="false"
        :options="projectCategoryArray"
        @selected="setSelectedCategory($event,'add')"
        @removed="setSelectedCategory($event, 'remove')"
        @clear="projectCategoryArray = []"
        :top="clientWidth>767 ? '46px' : '0px'"
        :listenKeys="true"
    ></sidebar>
</div>
</template>

<script setup>
import { useStore } from "vuex";
import { ref, defineProps, defineEmits , computed, defineComponent, onMounted, inject, watch} from "vue";
import { ValidationFunction } from "@/composable/DefaultValidationFunction";
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { useValidation } from "@/composable/Validation.js";
import { dbCollections, settingsCollectionDocs } from "@/utils/FirebaseCollections";
// import * as getFirebase from "@/utils/FirebaseQueries/Get/getQueries";
// import DueDateCompo from "@/components/molecules/DueDateCompo/DueDateCompo.vue"
import Assignee from '@/components/molecules/Assignee/Assignee.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
const  { checkErrors } = useValidation();
    defineComponent({
        name: "CreateProject-Component",
        components: {
            Sidebar
        },
    })
    // const CompanyDatabase = inject("$companyId");
    const clientWidth = inject("$clientWidth");
    const users = computed(() => getters["users/users"]);
    const props = defineProps({
        modelValue: {
            type: Object,
            default: () => ({}),
        },
    });
    const theModel = ref(props.modelValue);
    watch(()=> props.modelValue,(val)=>{
        theModel.value = val;
    })
    const { getters} = useStore();
    var emloyeeArray = computed(() => {
        return getters["users/users"];
    })
    const projectsGetter = computed(() => { return getters["projectData/allProjects"]});
    const projectCodeArr = ref([]);
    if(projectsGetter.value.data && projectsGetter.value.data.length > 0){
        projectsGetter.value.data.forEach(itemVal=>{
            projectCodeArr.value.push(itemVal.ProjectCode);
        })
    }
    if(emloyeeArray.value && emloyeeArray.value.length > 0){
        emloyeeArray.value.forEach(x => {
            x.label = x.Employee_Name
        });
    }
    const emit = defineEmits([
        'update:modelValue'
    ]);
    var projectCategoryArray = ref([]);
    /*** GET PROJECT CATEGORY ***/
    onMounted(() => {
        const query = {
                type: "findOne",
                collection: dbCollections.SETTINGS,
                data: [
                    {
                        name: settingsCollectionDocs.PROJECT_CATEGORY
                    }
                ]
            }
            mongodbCrudOperations(query)
            .then((result) => {
                let data = result.settings;
                data.forEach(x => {
                    projectCategoryArray.value.push({"label" : x});
                });
            })
        // let args = {path: `${CompanyDatabase.value}/${CompanyDatabase.value}/${dbCollections.SETTINGS}/${settingsCollectionDocs.PROJECT_CATEGORY}`};
        // getFirebase.getDocument(args).then((doc)=>{
        // })
    })
    // Generate project key dynamically based on project name
    const gererateProjectKey = () => {
        if(theModel.value.projectName.value !== "") {
            const str = theModel.value.projectName.value;
            const matches = str.match(/\b(\w)/g); 
            theModel.value.projectCode.value = matches.join('').toUpperCase();
        }
        else{
            theModel.value.projectName.value = "";
            theModel.value.projectCode.value = "";
        }
        emit('update:modelValue', theModel.value)
    }
    // Chceck if project have unique or not
    const isUniqueProjectKey = (value) => {
        const val = value;
        ValidationFunction.isValueExistInArray(projectCodeArr.value, val, (result) => {
            if (result == true) {
                theModel.value.projectCode.isUniqueProjectCode = "Project key must be unique";
                theModel.value.projectCode.error = "";               
            } else {
                theModel.value.projectCode.isUniqueProjectCode = "";
            }
        })
        return;
    }
    // Convert string lowercase to uppercase function
    const convertToUpperCase = (keyname)=> {
        var dataVal = theModel.value.projectCode.value.replace(/ /g,'');
        if(keyname == "projectKey"){
            theModel.value.projectCode.value = dataVal.toUpperCase();
        }
        emit('update:modelValue', theModel.value)
    }
    // Regex for validate alpha numeric
    const removeSpecialCharacter = () => {
        // ValidationFunction.onlyAlphaNumericAllowed(theModel.value.projectCode.value);
        emit('update:modelValue', theModel.value)
    }
    // Handle open sidebar events for child sidebars
    const activeLOC = ref(false);
    const userSidebarVal = ref(false);
    const sidebarTitle = ref("");
    const openSidebar = (key) => {
        activeLOC.value = (key == "locSidebar") ? true : false;
        userSidebarVal.value = (key == "userSidebar") ? true : false;
        sidebarTitle.value = (key == "locSidebar") ? "Category List" : (key == "userSidebar") ? "List of User" : "List cc";
    }
    function setSelectedCategory(category) {
        theModel.value.projectCategory.value = category.label;
        checkErrors({'field':theModel.value.projectCategory,
            'name':theModel.value.projectCategory.name,
            'validations':theModel.value.projectCategory.rules,
            'type':theModel.value.projectCategory.type})
    }
    function updateAssignee(event, type){
        try{
            if(type == "add"){
                theModel.value.leadUser.value.push({...event});
            }
            else if(type == "remove"){
                let indexId = theModel.value.leadUser.value.findIndex((item)=>{
                    return item.id == event.id
                })
                if(indexId !== -1){
                    theModel.value.leadUser.value.splice(indexId,1);
                }
            }
            emit('update:modelValue', theModel.value)
        }
        catch(error){
            console.error(error);
        }
    }
    function updateDueDate (event){
        theModel.value.dueDate.value = new Date(event.dateVal).getTime()/1000;
        emit('update:modelValue', theModel.value)
    }
</script>
<style scoped>
@import './style.css';
</style>
<style scoped>
ul{
    margin: 0;
    padding: 0;
}
li{
    list-style: none;
}

</style>