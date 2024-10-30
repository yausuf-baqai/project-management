<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display task status detail for blank project form as step-6 in create project module.
========================================================================================== -->
<template>
<div class="statusHeader statusHeader_two">
    <h3 v-if="fromWhich == ''" class="heading_text bg-light-gray mt-0px"
    :class="{'border-radius-5-px  task-heading-desktop': clientWidth > 767 , 'border-radius-8-px  task-heading-mobile': clientWidth <= 767}"
    >Set up the statuses for tasks</h3>
    <h3 v-else class="heading_text bg-light-gray mt-0px"
    :class="{'border-radius-5-px  task-heading-desktop': clientWidth > 767 , 'border-radius-8-px  task-heading-mobile': clientWidth <= 767}"
    >What task status do you want?</h3>
    <div class="taskStatusSection style-scroll">
        <div class="statusTaskWrapper d-flex justify-content-between">
            <div class="taskStatusLeft">
                <div class="d-flex justify-content-between align-items-baseline w-90">
                    <label class="templetes" :class="{'template-label-desktop': clientWidth > 767 , 'template-label-mobile': clientWidth <= 767}">Templates ({{templateList.length}})</label>
                    <img class="cursor-pointer" src="@/assets/images/svg/pluss.svg" @click="activeTemplate()"/>
                </div>
                <ul class="templated_name_ul position-re">
                    <li v-for="(tempVal,index) in templateList" v-bind:key="index" class="cursor-pointer" :class="[{'temp_save_value':tempVal.isShowSave}]">
                        <span v-if="!tempVal.isEditable" :class="[{'temp_save_dot':tempVal.isShowSave}]"  :style="`${theModel.taskStatusField.value._id === tempVal._id ? 'color: #3845B3 !important; font-weight: 500' : ''}`" @click="setTemplateData(tempVal)" class="templated_name text-ellipsis" :title="tempVal.TemplateName"> {{tempVal.TemplateName}} </span>
                        <input type="text" class="statusInputText form-control edit-input statuseditInput" :maxlength="50" v-if="tempVal.isEditable" v-model.trim="taskTypeName" @keyup.enter="editTaskTemplate(tempVal,index)" @input="errTempMsg=''"/>
                        <span class="position-ab" :style="[{paddingTop : clientWidth > 767 ? '8px' : '0px', right : clientWidth > 767 ? '20px' : '20px'}]">
                            <img :src="saveIcon" class="cursor-pointer" v-if="tempVal.isEditable" @click="editTaskTemplate(tempVal,index)">
                            <img :src="deletered" class="cursor-pointer ml-10px" v-if="tempVal.isEditable" @click="tempVal.isEditable = false,errTempMsg=''">
                        </span>
                        <span class="task-leftside" v-if="!tempVal.isEditable && tempVal.isShowSave !== true && tempVal.TemplateName !== 'Custom'">
                            <img :src="templateEditIcon" alt="editicon" class="taskleftEditIcon" @click="taskTypeName = tempVal.TemplateName,isTemplate=false,editTemplateOpen(index),addTaskType=false"/>
                            <img v-if="!tempVal.default" :src="templateDeleteIcon" alt="deleteicon" class="taskleftdeleteIcon" @click="isDeleteTemp = true,deleteTemplateObj = tempVal"/>
                        </span>
                        <button type="button" class="save_template" v-if="tempVal.isShowSave" @click="saveTemplateData()">Save Template</button>
                    </li>
                </ul>
                <ConfirmationSidebar
                    v-model="isDeleteTemp"
                    :acceptButtonClass="`btn-danger`"
                    acceptButton="Delete"
                    title="Delete Template"
                    message="Are you sure you want to delete the template?"
                    :isShowInput="false"
                    @confirm="handleConfirm"
                >
                    <template #body>
                        <div></div>
                    </template>
                </ConfirmationSidebar>
                <button class="add_template" type="button" @click="activeTemplate()">+ New Template</button>
                <div class="d-flex position-re">
                    <input v-if="isTemplate" placeholder="Enter Template" class="add_new_temp form-control" :maxlength="50" type="text" @keypress.enter.prevent="addNewTaskTypeTemplate()" v-model.trim="templateName" @input="errTempMsg = ''"/>
                    <span class="position-ab edit-rightinput save__closeimg-wrapper">
                        <img :src="saveIcon" class="cursor-pointer"  v-if="isTemplate" @click="addNewTaskTypeTemplate(),templateName = ''">
                        <img :src="deletered" class="cursor-pointer ml-10px" v-if="isTemplate" @click="isTemplate = false, templateName = '',errTempMsg = ''">
                    </span>
                </div>
                <div class="err_temp_status">
                    <span v-if="errTempMsg" class="err_temp red font-size-12">{{errTempMsg}}</span>
                    <div class="red font-size-11">{{theModel.taskStatusField.error}}</div>
                </div>
            </div>
            <div class="taskStatusRight status_right status_new_right">
                <h3 :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}"
                >Active Status</h3>
                <div class="statuInputwrapper activeStatus" v-if="theModel.taskStatusField.value.defaultActive && Object.keys(theModel.taskStatusField.value.defaultActive).length > 0">                   
                    <ul class="status_ul">
                        <li class="d-flex align-items-center justify-content-between">
                            <span class="taskInnerData w-100" :class="{'taskInnerData-desktop': clientWidth > 767 , 'taskInnerData-mobile': clientWidth <= 767}">
                                <div class="d-flex align-items-center ml-15px">
                                    <input type="color" :id="`activeTaskStatus${98}`" v-model.trim="theModel.taskStatusField.value.defaultActive.textColor" @input="theModel.taskStatusField.value.defaultActive.bgColor = theModel.taskStatusField.value.defaultActive.textColor+'35',inputColor()"  class="p-0 mr-8px d-inline-block border-radius-2-px border-0 bg-transparent cursor-pointer project__status-icon" disabled>
                                    <span class="style_changes_value"   :class="{'taskInnerData-desktop': clientWidth > 767 , 'taskInnerData-mobile': clientWidth <= 767}" v-if="!theModel.taskStatusField.value.defaultActive.isEditable" :style="[{'color': theModel.taskStatusField.value.defaultActive.textColor}]">{{theModel.taskStatusField.value.defaultActive.statusName ? theModel.taskStatusField.value.defaultActive.statusName : theModel.taskStatusField.value.defaultActive.name}}</span>
                                    <input v-if="theModel.taskStatusField.value.defaultActive.isEditable" class="addStatusInput form-control" type="text"  v-model.trim="theModel.taskStatusField.value.defaultActive.statusName" @keypress.enter.prevent="saveTaskStatus('editType',theModel.taskStatusField.value.defaultActive)" @input="errorMsgTask = ''"/>
                                    <span class="position-ab" :style="[{top : clientWidth > 767 ? '8px' : '8px', right : clientWidth > 767 ? '10px' : '15px'}]">
                                        <img :src="saveData" class="cursor-pointer" v-if="theModel.taskStatusField.value.defaultActive.isEditable" @click="saveTaskStatus('editType',theModel.taskStatusField.value.defaultActive)">
                                        <img :src="deletered" class="cursor-pointer ml-10px" v-if="theModel.taskStatusField.value.defaultActive.isEditable" @click="theModel.taskStatusField.value.defaultActive.isEditable = false,theModel.taskStatusField.value.defaultActive.statusName = taskStatusName,errorMsgTask = ''">
                                    </span>
                                </div>
                            </span>
                        </li>
                    </ul>
                </div>
                <DragDropField :group="{ name: 'task_status_group' }" :isDeletable="true" :isChangeColor="true" v-model="theModel.taskStatusField.value.ActiveStatusList" categoryTytpe="active" @change:DraggableOption="manageSelectedOption" @enter:updateFieldValue="addTaskStatus" @click:updateFieldValue="addTaskStatus" @input:deleteFieldValue="manageDeleteData" @resetTaskTypeErr="errorMsgTask=''" @renameUpdate="(val) =>{renameUpdate(val)}" :isTemplate="isTemplate" :addTaskType="addTaskType" @changeColor="inputColor()" :useDataArray="useTaskStatusArr"/>
                <button class="cursor-pointer btn btn-primary addstatus-btn ml-0 mb-20px" type="button" @click="taskStatusName = '', addTaskType = true,isTemplate=false,templateList.map((x)=>{return x.isEditable = false}),isTaskSidebarOpen = true">+ Add Status</button>
                <div class="red">
                    <span v-if="errorMsgTask" class="font-size-11">{{errorMsgTask}}</span>
                </div>
                <h3 :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}"
                >Done Status</h3>
                <DragDropField :group="{ name: 'task_status_group' }" v-if="theModel.taskStatusField && Object.keys(theModel.taskStatusField.value).length > 0" :isDeletable="true" :isChangeColor="true" v-model="theModel.taskStatusField.value.DoneStatusList" categoryTytpe="done" @change:DraggableOption="manageSelectedOption" @enter:updateFieldValue="addTaskStatus" @click:updateFieldValue="addTaskStatus" @input:deleteFieldValue="manageDeleteData" @resetTaskTypeErr="errorMsgTask=''" @renameUpdate="(val) =>{renameUpdate(val)}" :isTemplate="isTemplate" :addTaskType="addTaskType" @changeColor="inputColor()" :useDataArray="useTaskStatusArr"/>
                <div>
                    <h3 :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile mt-030': clientWidth <= 767}"
                    >Close Status</h3>
                    <div class="statuInputwrapper activeStatus" v-if="theModel.taskStatusField.value.defaultComplete && Object.keys(theModel.taskStatusField.value.defaultComplete).length > 0">
                        <ul class="status_ul">
                            <li class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center w-100 ml-16px">
                                <input type="color" :id="`CloseTaskStatus${98}`" v-model.trim="theModel.taskStatusField.value.defaultComplete.textColor" @input="theModel.taskStatusField.value.defaultComplete.bgColor = theModel.taskStatusField.value.defaultComplete.textColor+'35'" class="p-0 mr-8px d-inline-block border-radius-2-px border-0 bg-transparent cursor-pointer project__status-icon" disabled>
                                <span class="style_changes_value" :class="{'taskInnerData-desktop': clientWidth > 767 , 'taskInnerData-mobile': clientWidth <= 767}" v-if="!theModel.taskStatusField.value.defaultComplete.isEditable" :style="[{'color': theModel.taskStatusField.value.defaultComplete.textColor}]">{{theModel.taskStatusField.value.defaultComplete.name ? theModel.taskStatusField.value.defaultComplete.name : theModel.taskStatusField.value.defaultComplete.name}}</span>
                                <input v-if="theModel.taskStatusField.value.defaultComplete.isEditable"  class="addStatusInput form-control" type="text" v-model.trim="theModel.taskStatusField.value.defaultComplete.name" @keypress.enter.prevent="saveTaskStatus('editType',theModel.taskStatusField.value.defaultComplete)" @input="errorMsgTask = ''" />
                                <span class="position-ab save__delete-wrappper" :style="[{top : clientWidth > 767 ? '6px' : '10px'}]">
                                    <img :src="saveData" class="cursor-pointer"  v-if="theModel.taskStatusField.value.defaultComplete.isEditable" @click="saveTaskStatus('editType',theModel.taskStatusField.value.defaultComplete)">
                                    <img :src="deletered" class="cursor-pointer ml-10px" v-if="theModel.taskStatusField.value.defaultComplete.isEditable" @click="theModel.taskStatusField.value.defaultComplete.isEditable = false,theModel.taskStatusField.value.defaultComplete.name = taskStatusName,errorMsgTask = ''">
                                </span>
                            </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <TaskStatusSidebar v-if="isTaskSidebarOpen" :isTaskSidebarOpen="isTaskSidebarOpen" @closesidebar="isTaskSidebarOpen = false" title="List of Task Status" :options="statusOPtion" @selected="updateTaskStatus" @removed="removeTaskStatus" :isAddStatus="true" :type="'task_status'" :useDataArray="useTaskStatusArr"/>
</div>
</template>
<script setup>
import { useStore } from "vuex";
import { ref, onMounted, inject, watch, defineComponent } from "vue";
const {getters, commit} = useStore();
import DragDropField from '@/components/atom/DragDropField/DragDropField.vue';
import { dbCollections } from '@/utils/FirebaseCollections';
import {useToast} from 'vue-toast-notification';
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import TaskStatusSidebar from '@/components/molecules/TaskStatusSidebar/TaskStatusSidebar.vue';
import cloneDeep from 'lodash/cloneDeep'; // Import a cloning library
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { BSON } from "realm-web";
    defineComponent({
        name: "Task-Status-form",
    })
    const saveIcon = require("@/assets/images/save.png");
    const deletered = require("@/assets/images/svg/deletered.svg");
    const templateEditIcon = require('@/assets/images/svg/edit_icon.svg');
    const templateDeleteIcon = require('@/assets/images/svg/closeLeftHover.svg');
    const templateList = ref([]);
    const clientWidth = inject("$clientWidth");
    const $toast = useToast();
    const saveData = require("@/assets/images/save.png");
    const taskTypeName = ref('');
    const isDeleteTemp = ref(false);
    const deleteTemplateObj = ref({});
    const props = defineProps({
        modelValue: {
            type: Object,
            default: () => ({}),
        },
        projectData: {
            type: Object,
            default: () => ({})
        },
        from: {
            type: String,
            default: () => (''),
        }
    });
    const theModel = ref(props.modelValue); 
    const fromWhich = ref(props.from);
    const isTaskSidebarOpen = ref(false);
    const statusOPtion = ref([]);
    const newStatusData = ref([]);

    const emit = defineEmits([
        'update:modelValue','renameTaskStatus','setTemplateDataTaskStatus','saveTemplate','spinnerOn'
    ]);
    const errorMsgTask = ref('');
    const useTaskStatusArr = ref([]);
    onMounted(() => {
        templateList.value = cloneDeep(getters['settings/taskStatus']);
        emit('update:modelValue', theModel.value);
        if(templateList.value.length > 0){
            if(fromWhich.value === 'setting'){
                let index = templateList.value.findIndex((x) => {
                    return x._id === props.projectData.TemplateTaskStatusId;
                })
                if(index !== -1){
                    theModel.value.taskStatusField.value = Object.keys(theModel.value.taskStatusField.value).length > 0 ? theModel.value.taskStatusField.value : templateList.value[index]    
                }else{
                    const customObj = {
                        TemplateName : 'Custom',
                        defaultActive : props.projectData.taskStatusData.filter((x) => x.type==='default_active')[0],
                        DoneStatusList : props.projectData.taskStatusData.filter((x) => x.type==='done'),
                        defaultComplete : props.projectData.taskStatusData.filter((x) => x.type==='close')[0],
                        ActiveStatusList : props.projectData.taskStatusData.filter((x) => x.type==='active')
                    }
                    templateList.value = [customObj, ...templateList.value];
                    theModel.value.taskStatusField.value = Object.keys(theModel.value.taskStatusField.value).length > 0 ? theModel.value.taskStatusField.value : customObj;
                }
            }else{
                theModel.value.taskStatusField.value = Object.keys(theModel.value.taskStatusField.value).length > 0 ? theModel.value.taskStatusField.value :templateList.value[0];
                let find = templateList.value.find((x) => x._id === theModel.value.taskStatusField.value._id);
                if(find === undefined){
                    templateList.value.push(theModel.value.taskStatusField.value);
                }
            }
            statusOPtion.value = [...theModel.value.taskStatusField.value.ActiveStatusList, ...theModel.value.taskStatusField.value.DoneStatusList, theModel.value.taskStatusField.value.defaultActive, theModel.value.taskStatusField.value.defaultComplete];
        }
        if(Object.keys(props.projectData).length > 0) {
            props.projectData.taskStatusData.forEach((x) => {
                const query = {
                    type: "findOne",
                    collection: dbCollections.TASKS,
                    data: [
                        {
                            ProjectID: BSON.ObjectId(props.projectData._id),
                            statusKey: x.key 
                        }
                    ]
                }
                mongodbCrudOperations(query).then((result) =>{
                    if(result){
                        useTaskStatusArr.value.push(result);
                    }
                })
            })
    
        }
    })
    watch(() => getters['settings/taskStatus'], (val) => {
        templateList.value = cloneDeep(val);
        if(templateList.value.length){
            if(fromWhich.value === 'setting'){
                let index = templateList.value.findIndex((x) => {
                    return x._id === props.projectData.TemplateTaskStatusId;
                })
                if(index !== -1){
                    theModel.value.taskStatusField.value = Object.keys(theModel.value.taskStatusField.value).length > 0 ? theModel.value.taskStatusField.value : templateList.value[index]    
                }else{
                    const customObj = {
                        TemplateName : 'Custom',
                        defaultActive : props.projectData.taskStatusData.filter((x) => x.type==='default_active')[0],
                        DoneStatusList : props.projectData.taskStatusData.filter((x) => x.type==='done'),
                        defaultComplete : props.projectData.taskStatusData.filter((x) => x.type==='close')[0],
                        ActiveStatusList : props.projectData.taskStatusData.filter((x) => x.type==='active')
                    }
                    templateList.value = [customObj, ...templateList.value];
                    theModel.value.taskStatusField.value = Object.keys(theModel.value.taskStatusField.value).length > 0 ? theModel.value.taskStatusField.value : customObj;
                }
            }else{
                theModel.value.taskStatusField.value = Object.keys(theModel.value.taskStatusField.value).length > 0 ? theModel.value.taskStatusField.value :templateList.value[0];
            }
            statusOPtion.value = [...theModel.value.taskStatusField.value.ActiveStatusList, ...theModel.value.taskStatusField.value.DoneStatusList, theModel.value.taskStatusField.value.defaultActive, theModel.value.taskStatusField.value.defaultComplete];
        }
    })
    watch(()=> props.modelValue ,(val)=>{
        theModel.value = val;
    })
    const isTemplate = ref(false);
    const errTempMsg = ref("");
    const addTaskType = ref(false);
    const taskStatusName = ref("");
    const templateName = ref('');
    function activeTemplate(){
        isTemplate.value = true;
        templateList.value?.map((x)=>{return x.isEditable = false});
        if(theModel.value.taskStatusField.value.defaultComplete){
            theModel.value.taskStatusField.value.defaultComplete.isEditable = false;
        }
        if(theModel.value.taskStatusField.value.defaultActive){
            theModel.value.taskStatusField.value.defaultActive.isEditable = false;
        }
        addTaskType.value = false;
    }
    function setTemplateData(itemData) {
        theModel.value.taskStatusField.value = {};
        theModel.value.taskStatusField.value = itemData;
        statusOPtion.value = [...theModel.value.taskStatusField.value.ActiveStatusList, ...theModel.value.taskStatusField.value.DoneStatusList, theModel.value.taskStatusField.value.defaultActive, theModel.value.taskStatusField.value.defaultComplete];
        if(fromWhich.value === 'setting'){
            emit('spinnerOn');
            newStatusData.value = statusOPtion.value;
            const notMatchedProjects = props.projectData.taskStatusData.filter((x) => {
                return !newStatusData.value.some((y) => y.key === x.key);
            });
            if(notMatchedProjects.length > 0){
                notMatchedProjects.forEach(async(x) => {
                    const query = {
                        type: "find",
                        collection: dbCollections.TASKS,
                        data: [
                            {
                                ProjectID: BSON.ObjectId(props.projectData._id),
                                statusKey: x.key
                            }
                        ]
                    }
                    await mongodbCrudOperations(query).then((result) =>{
                        if(result && result.length){
                            useTaskStatusArr.value.push(result[0]);
                        }
                    })
                    emit('setTemplateDataTaskStatus',useTaskStatusArr.value,notMatchedProjects)
                })
            }else{
                emit('setTemplateDataTaskStatus',useTaskStatusArr.value,notMatchedProjects)
            }
        }
        emit('update:modelValue', theModel.value);
    }
    function manageSelectedOption(item , event , categoryVal){
        if(event.added !== undefined){
            event.added.element.type = categoryVal;
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.taskStatusField.value._id
        });
        if(categoryVal === 'active'){
            theModel.value.taskStatusField.value.ActiveStatusList = item
        }
        if(categoryVal === 'done'){
            theModel.value.taskStatusField.value.DoneStatusList = item;
        }
        if(indexKey !== -1 && theModel.value.taskStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
    }
    function manageDeleteData(item){
        saveTaskStatus('deleteType',item);
    }
    function addTaskStatus(item){
        saveTaskStatus('editType',item)
    }
    function saveTaskStatus(type,rowData){
        if(type == "deleteType"){
            if(rowData.type == "done"){
                let keyVal = theModel.value.taskStatusField.value.DoneStatusList.findIndex((item)=>{
                    return item.key === rowData.key
                })
                if(keyVal !== -1){
                    theModel.value.taskStatusField.value.DoneStatusList.splice(keyVal,1);
                }
            }
            if(rowData.type == "active"){
                let keyVal = theModel.value.taskStatusField.value.ActiveStatusList.findIndex((item)=>{
                    return item.key === rowData.key
                })
                if(keyVal !== -1){
                    theModel.value.taskStatusField.value.ActiveStatusList.splice(keyVal,1);
                }
            }
            const obj = {
                'ActiveStatusList': theModel.value.taskStatusField.value.ActiveStatusList,
                'DoneStatusList' : theModel.value.taskStatusField.value.DoneStatusList,
                'defaultActive' : theModel.value.taskStatusField.value.defaultActive,
                'defaultComplete' : theModel.value.taskStatusField.value.defaultComplete
            }
            theModel.value.taskStatusField.value.ActiveStatusList = obj.ActiveStatusList;
            theModel.value.taskStatusField.value.DoneStatusList = obj.DoneStatusList;
            theModel.value.taskStatusField.value.defaultActive = obj.defaultActive;
            theModel.value.taskStatusField.value.defaultComplete = obj.defaultComplete;
            let indexKey = templateList.value.findIndex((x)=>{
                return x._id == theModel.value.taskStatusField.value._id
            });
            if(indexKey !== -1 && theModel.value.taskStatusField.value.TemplateName !== 'Custom'){
                templateList.value[indexKey].isShowSave = true;
            }
            statusOPtion.value = [...theModel.value.taskStatusField.value.ActiveStatusList, ...theModel.value.taskStatusField.value.DoneStatusList, theModel.value.taskStatusField.value.defaultActive, theModel.value.taskStatusField.value.defaultComplete];
        }
    }
    function addNewTaskTypeTemplate(){
        if(templateName.value === "" || templateName.value === null){
            errTempMsg.value = "Template name is required";
            return;
        }
        if(templateName.value.toLowerCase() === 'custom'){
            $toast.error("Can not create template name Custom",{position: 'top-right'});
            return;
        }
        let mainId = templateList.value.findIndex(item=>{
            return item.TemplateName.replaceAll(" ", "_").toLowerCase() === templateName.value.replaceAll(" ", "_").toLowerCase();
        })
        if(mainId === -1){
            const insertObj = {
                TemplateName : templateName.value,
                ActiveStatusList : [],
                DoneStatusList: [],
                defaultActive : {
                    'name': 'To Do',
                    'value': 'to_do',
                    'textColor':'#ff9600',
                    'bgColor': '#ff960035',
                    'isEditable': false,
                    'key':1,
                    'editColor':false,
                    'type': 'default_active'
                },
                defaultComplete : {
                    'name': 'Complete',
                    'value': 'complete',
                    'textColor':'#6BC950',
                    'bgColor': '#6BC95035',
                    'isEditable': false,
                    'key':2,
                    'editColor':false,
                    'type': 'close'
                },
                taskcloseStatus : 2,
                taskActiveStatus : [1],
                taskDoneStatus : [],
                createdAt: new Date()
            }
            const getQuery = {
                type: "insertOne",
                collection: dbCollections.TASK_STATUS_TEMPLATES,
                data: [insertObj]
            }
            mongodbCrudOperations(getQuery).then((response)=>{
                commit("settings/mutateTaskStatus", {data: {...insertObj, _id: response.insertedId}, op: "added"});
                theModel.value.taskStatusField.value = {...insertObj, _id: response.insertedId};
                templateName.value = "";
                $toast.success("Template has been created Successfully.",{position: 'top-right'});
            })
            .catch((error) => {
                console.error(error);
            })
        }
        if(mainId !== -1){
            errTempMsg.value = "This template name is already exists.";
            setTimeout(()=>{
                errTempMsg.value = "";
                templateName.value = "";
            },5000)
        }
        emit('update:modelValue', theModel.value);
    }
    function saveTemplateData(){
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.taskStatusField.value._id
        });
        if(indexKey !== -1){
            delete templateList.value[indexKey].isShowSave;
        }
        const oldId = theModel.value.taskStatusField.value._id;
        const obj = {
            'TemplateName' :  theModel.value.taskStatusField.value.TemplateName,
            'ActiveStatusList': theModel.value.taskStatusField.value.ActiveStatusList,
            'DoneStatusList' : theModel.value.taskStatusField.value.DoneStatusList,
            'defaultComplete' : theModel.value.taskStatusField.value.defaultComplete,
            'defaultActive' : theModel.value.taskStatusField.value.defaultActive
        }
        if(theModel.value.taskStatusField.value.default !== undefined){
            obj.default = theModel.value.taskStatusField.value.default
        }
        const query = {
            type : 'deleteOne',
            data : [{
                _id : BSON.ObjectId(theModel.value.taskStatusField.value._id)
            }],
            collection : dbCollections.TASK_STATUS_TEMPLATES
        }
        mongodbCrudOperations(query).then(async() => {
            commit("settings/mutateTaskStatus", {data: {_id: oldId}, op: "removed"});
            const getQuery = {
                type: "insertOne",
                collection: dbCollections.TASK_STATUS_TEMPLATES,
                data: [obj]
            }
            await mongodbCrudOperations(getQuery).then((response)=>{
                theModel.value.taskStatusField.value = {...obj , _id : response.insertedId};
                let index = templateList.value.findIndex((x) => x._id === response.insertedId);
                if(index === -1){
                    templateList.value.push({...obj , _id : response.insertedId});
                }
                const index1 = templateList.value.findIndex((type) => type._id === oldId);
                if(index1 !== -1) {
                    templateList.value.splice(index1, 1);
                }
                emit('saveTemplate',response.insertedId,oldId,'taskstatus')
            }).catch((err) => {
                console.error(err)
            })
        })
    }
    function editTaskTemplate(temp,index) {
        if(taskTypeName.value !== ''){
            if(taskTypeName.value.toLowerCase() === 'custom'){
                $toast.error("Can not create template name Custom",{position: 'top-right'});
                return;
            }
            const duplicateNameIndex = templateList.value.findIndex(
                (object, i) => object.TemplateName === taskTypeName.value && i !== index
            );
            let mainId = templateList.value.findIndex(item=>{
                return item.TemplateName=== taskTypeName.value;
            })
            let obj = {
                TemplateName : taskTypeName.value
            }
            if(mainId === -1 || duplicateNameIndex === -1){
                const query = {
                    collection: dbCollections.TASK_STATUS_TEMPLATES,
                    type: "updateOne",
                    data: [
                        {
                            _id: BSON.ObjectId(temp._id)
                        },
                        {
                            $set: {...obj}
                        }
                    ]
                }
                mongodbCrudOperations(query).then(()=>{
                    let index = templateList.value.findIndex((x) => x._id === temp._id);
                    if(index !== -1) {
                        let modifiedObj = {...templateList.value[index],TemplateName: taskTypeName.value,isEditable:false};
                        commit("settings/mutateTaskStatus", {data: {...modifiedObj, _id: temp._id}, op: "modified"});
                    }
                    $toast.success("Template name updated successfully.",{position: 'top-right'});
                })
            }
            if(mainId !== -1 && duplicateNameIndex !== -1){
                errTempMsg.value = "This template name is already exists.";
            }
        }else{
            errTempMsg.value = "This template name is required.";
        }
    }
    function renameUpdate(val) {
        isTemplate.value = val;
        addTaskType.value = val;
        theModel.value.taskStatusField.value.defaultActive.isEditable = false;
        theModel.value.taskStatusField.value.defaultComplete.isEditable = false;
        templateList.value.map((x)=>{return x.isEditable = false});
    }
    function editTemplateOpen(index) {
        theModel.value.taskStatusField.value.defaultActive.isEditable = false;
        theModel.value.taskStatusField.value.defaultComplete.isEditable = false;
        const mergedArray = [...theModel.value.taskStatusField.value.ActiveStatusList, ...theModel.value.taskStatusField.value.DoneStatusList];
        mergedArray.filter((x) =>{return x.isEditable = false});
        templateList.value.forEach((x,ind) => {
            if(ind === index){
                x.isEditable = true;
            }else{
                x.isEditable = false;
            }
        })
    }
    function handleConfirm(){
        const query = {
            type : 'deleteOne',
            data : [{
                _id : BSON.ObjectId(deleteTemplateObj.value._id)
            }],
            collection : dbCollections.TASK_STATUS_TEMPLATES
        }
        mongodbCrudOperations(query).then(()=>{
            isDeleteTemp.value = false;
            theModel.value.taskStatusField.value = templateList.value[0] || {};
            commit("settings/mutateTaskStatus", {data: {_id: deleteTemplateObj.value._id}, op: "removed"});
            $toast.success("Template deleted successfully.",{position: 'top-right'});
        }).catch((err) =>{
            console.error(err,"Error in Delete Template");
        })
    }
    function updateTaskStatus (event) {
        if(event.type === 'active'){
            theModel.value.taskStatusField.value.ActiveStatusList = [...theModel.value.taskStatusField.value.ActiveStatusList,event];
        }else if(event.type === 'done'){
            theModel.value.taskStatusField.value.DoneStatusList = [...theModel.value.taskStatusField.value.DoneStatusList,event];
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.taskStatusField.value._id
        });
        if(indexKey !== -1 && theModel.value.taskStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
    }
    function removeTaskStatus (event) {
        if(event.type === 'active'){
            let activeIndex = theModel.value.taskStatusField.value.ActiveStatusList.findIndex((x) => {
                return x.key === event.key
            })

            if(activeIndex !== -1) {
                theModel.value.taskStatusField.value.ActiveStatusList.splice(activeIndex,1);
            }
        }else if(event.type === 'done'){
            let doneIndex = theModel.value.taskStatusField.value.DoneStatusList.findIndex((x) => {
                return x.key === event.key
            })

            if(doneIndex !== -1) {
                theModel.value.taskStatusField.value.DoneStatusList.splice(doneIndex,1);
            }
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.taskStatusField.value._id
        });
        if(indexKey !== -1 && theModel.value.taskStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
        statusOPtion.value = [...theModel.value.taskStatusField.value.ActiveStatusList, ...theModel.value.taskStatusField.value.DoneStatusList, theModel.value.taskStatusField.value.defaultActive, theModel.value.taskStatusField.value.defaultComplete];
    }
</script>
<style scoped>
@import './style.css';
</style>