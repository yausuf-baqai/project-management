<!-- =========================================================================================
    Created By : Dipsha Kalariya
    Commnet : This component is used to display project status detail for blank project form as step-5 in create project module.
========================================================================================== -->
<template>
<div class="taskStatusSection statusTaskWrapper">
    <div class="bg-light-gray text-center mb-30px"
    :style="[{padding : clientWidth > 767 ? '16.5px' : '18.5px'}]"
    :class="{'border-radius-5-px': clientWidth > 767 , 'border-radius-8-px': clientWidth <= 767}"
    >
        <h3 v-if="fromWhich == ''" :class="{'task-heading-desktop': clientWidth > 767 , 'task-heading-mobile': clientWidth <= 767}">Add the statuses for the project</h3>
        <h3 v-else :class="{'task-heading-desktop': clientWidth > 767 , 'task-heading-mobile': clientWidth <= 767}">What project status do you want?</h3>
    </div>
    <div class="d-flex justify-content-between" :class="clientWidth<=767 ? 'flex-column task_statusLeft-mobile' : ''">
        <div class="taskStatusLeft">
            <div class="d-flex justify-content-between w-90 align-items-baseline">
                <label class="templetes" :class="{'template-label-desktop': clientWidth > 767 , 'template-label-mobile': clientWidth <= 767}">Templates ({{templateList.length}})</label>
                <img class="cursor-pointer" src="@/assets/images/svg/pluss.svg" @click="activeTemplate()"/>
            </div>
            <ul class="templated_name_ul position-re">
                <li v-for="(tempVal,index) in templateList" v-bind:key="index" class="cursor-pointer">
                    <span v-if="!tempVal.isEditable" :class="[{'temp_save_dot':tempVal.isShowSave}]" :style="`${theModel.projectStatusField.value._id === tempVal._id ? 'color: #3845B3 !important; font-weight: 500' : ''}`" @click="setTemplateData(tempVal),emit('setTemplateData')" class="templated_name text-ellipsis" :title="tempVal.TemplateName"> {{tempVal.TemplateName}} </span>
                    <input type="text" class="statusInputText form-control edit-input statuseditInput" :maxlength="50" v-if="tempVal.isEditable" v-model.trim="projectStatusTemplate" @keyup.enter="editTaskTemplate(tempVal,index)" @input="errTempMsg=''"/>
                    <span class="position-ab" :style="[{paddingTop : clientWidth > 767 ? '8px' : '0px', right : clientWidth > 767 ? '20px' : '20px'}]">
                        <img :src="saveIcon" class="cursor-pointer" v-if="tempVal.isEditable" @click="editTaskTemplate(tempVal,index)">
                        <img :src="deletered" class="cursor-pointer ml-10px"  v-if="tempVal.isEditable" @click="tempVal.isEditable = false,errTempMsg=''">
                    </span>
                    <span class="task-leftside" v-if="!tempVal.isEditable && tempVal.isShowSave !== true && tempVal.TemplateName !== 'Custom'">
                        <img :src="templateEditIcon" alt="editicon" class="taskleftEditIcon" @click="projectStatusTemplate = tempVal.TemplateName,isTemplate=false,editTemplateOpen(index),addTaskType=false"/>
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
        </div>
        <div class="taskStatusRight style-scroll">
            <label class="status_lable" :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}">Active Status</label>
            <draggable v-model="theModel.projectStatusField.value.projectActiveStatus" tag="ul" class="status_ul" @update:modelValue="$emit('update:modelValue',$event)" :item-key="makeUniqueId(5)" :group="'project_status_group'" :move="checkMove" @change="updateItem(theModel.projectStatusField.value.projectActiveStatus,$event,'active')">
                <template #item="{ element, index }">
                    <li class=" d-flex align-items-center justify-content-between closeStatus position-re">
                        <span class="taskInnerData"  v-if="!element.isEditable">
                            <div class="d-flex align-items-center  position-re" >
                                <span class="drag-image-wrapper position-ab" v-if="element.default !== true">
                                    <img :src="dragIcon" class="dragImage position-re" :style="[{top : clientWidth > 767 ? '2px !important' : '4.5px !important'}]"/>
                                </span>
                            <input v-if="!element.isAddNewStatus && element.textColor" :id="`ActiveTaskStatus${index}`" type="color" v-model.trim="element.textColor" @input="element.backgroundColor = element.textColor+'35'" class="ignore-drag input__ignore-drag p-0 mr-8px d-inline-block border-radius-2-px border-0 bg-transparent" disabled>
                            <span :class="{'taskInnerData-desktop': clientWidth > 767 , 'taskInnerData-mobile': clientWidth <= 767}">{{ element.name }}</span>
                            </div>    
                        </span> 
                        <input v-if="element.isEditable" class="statusInputText form-control edit-input" type="text" v-model.trim="element.name" @keypress.enter.prevent="manageSelectedOption(element,'active')" @input="$emit('resetTaskTypeErr')"/>
                        <img :src="saveData" class="cursor-pointer" v-if="element.isEditable" @click="manageSelectedOption(element,'active')">
                        <img :src="deletered" class="cursor-pointer ml-10px" v-if="element.isEditable" @click="element.isEditable = false, element.name = taskTypeNameData,$emit('disableNext',false)">
                        <span class="taskInnerData task-dropdown" v-if="!element.isEditable && element.default!== true">
                            <DropDown id="" class="status_change_dropdown" v-if="useDataArray.length > 0 ? !checkDeletable(element) : element.default ? false : true">
                                <template #button>
                                    <button class="btn-white border cursor-pointer dot-btn">
                                        <img :src="dotcolor">
                                    </button>
                                </template>
                                <template #options>
                                    <DropDownOption @click="deleteProjectStatus(element,'active')" class="mobile-delete-status">
                                        <img :src="deleteIcon" class="mr-10px"> Remove
                                    </DropDownOption>
                                </template>
                            </DropDown>
                        </span>
                    </li>
                </template>
            </draggable>
            <div class="addStatusBtn searchValue">
                <button class="cursor-pointer btn btn-primary ml-0" type="button" v-if="!addTaskType" @click="taskTypeName = '',isTaskSidebarOpen = true">+ Add Status</button>
                <span v-if="errTempMsg" class="err_temp red font-size-12">{{errTempMsg}}</span>
            </div>
            <div>
                <label class="task-done-status" :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}">Done Status</label>
                <draggable v-model="theModel.projectStatusField.value.projectDoneStatus" tag="ul" class="status_ul" @update:modelValue="$emit('update:modelValue',$event)" :item-key="makeUniqueId(5)" :group="'project_status_group'" :move="checkMove" @change="updateItem(theModel.projectStatusField.value.projectDoneStatus,$event,'done')">
                    <template #item="{ element, index }">
                        <li class=" d-flex align-items-center justify-content-between closeStatus">
                            <span class="taskInnerData"  v-if="!element.isEditable">
                                <div class="d-flex align-items-center  position-re">
                                    <span class="drag-image-wrapper position-ab" v-if="element.default !== true">
                                        <img :src="dragIcon" class="dragImage position-re" :style="[{top : clientWidth > 767 ? '2px !important' : '4.5px !important'}]"/>
                                    </span>
                                <input v-if="!element.isAddNewStatus && element.textColor" :id="`ActiveTaskStatus${index}`" type="color" v-model.trim="element.textColor" @input="element.backgroundColor = element.textColor+'35'" class="ignore-drag input__ignore-drag p-0 mr-8px d-inline-block border-radius-2-px border-0 bg-transparent" disabled>
                                {{ element.name }}
                                </div>    
                            </span> 
                            <input v-if="element.isEditable" class="statusInputText form-control edit-input" type="text" v-model.trim="element.name" @keypress.enter.prevent="manageSelectedOption(element,'done')" @input="$emit('resetTaskTypeErr')"/>
                            <img :src="saveData" class="cursor-pointer" v-if="element.isEditable" @click="manageSelectedOption(element,'done')">
                            <img :src="deletered" class="cursor-pointer ml-10px" v-if="element.isEditable" @click="element.isEditable = false, element.name = taskTypeNameData,$emit('disableNext',false)">
                            <span class="taskInnerData task-dropdown" v-if="!element.isEditable && element.default!== true">
                                <DropDown id="" class="status_change_dropdown">
                                    <template #button>
                                        <button class="btn-white border cursor-pointer dot-btn">
                                            <img :src="dotcolor">
                                        </button>
                                    </template>
                                    <template #options>
                                        <DropDownOption @click="deleteProjectStatus(element,'done')" class="mobile-delete-status">
                                            <img :src="deleteIcon" class="mr-10px"> Remove
                                        </DropDownOption>
                                    </template>
                                </DropDown>
                            </span>
                        </li>
                    </template>
                </draggable>
            </div>            
            <div class="mt-30px"  v-if="theModel.projectStatusField.value.projectCompletedStatus && Object.keys(theModel.projectStatusField.value.projectCompletedStatus).length > 0">
                <label class="status_lable" :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}">Close Status</label>
                <div class="statuInputwrapper d-flex align-items-center justify-content-between closeStatus" :style="[{'border-color': theModel.projectStatusField.value.projectCompletedStatus?.backgroundColor}]">
                    <div class="d-flex align-items-center" :class="[{'edit_name_value':theModel.projectStatusField.value.projectCompletedStatus?.isEditable}]">
                        <input type="color" class="color-input p-0 mr-8px d-inline-block border-radius-2-px border-0 bg-transparent" ref="closeStatus"  v-model="theModel.projectStatusField.value.projectCompletedStatus.textColor" @input="theModel.projectStatusField.value.projectCompletedStatus.backgroundColor = theModel.projectStatusField.value.projectCompletedStatus?.textColor+'35'"  disabled>
                        <span class="style_changes_value text-ellipsis" v-if="!theModel.projectStatusField.value.projectCompletedStatus?.isEditable" :style="[{'color': theModel.projectStatusField.value.projectCompletedStatus?.textColor}]" :class="{'font-size-13px' : clientWidth >767 , 'font-size-16px' : clientWidth > 767 }">{{theModel.projectStatusField.value.projectCompletedStatus?.name}} </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <TaskStatusSidebar v-if="isTaskSidebarOpen" :isTaskSidebarOpen="isTaskSidebarOpen" @closesidebar="isTaskSidebarOpen = false" title="List of Project Status" :options="statusOPtion" @selected="updateTaskStatus" @removed="removeTaskStatus" :isAddStatus="true" :type="'project_status'" :useDataArray="useDataArray"/>
</div>
</template>
<script setup>
import draggable from 'vuedraggable';
import { useStore } from "vuex";
import { ref, defineProps, onMounted, defineComponent , inject, watch} from 'vue';
import {useToast} from 'vue-toast-notification';
import { useCustomComposable } from "@/composable";
import { dbCollections } from '@/utils/FirebaseCollections';
import TaskStatusSidebar from '@/components/molecules/TaskStatusSidebar/TaskStatusSidebar.vue';
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import cloneDeep from 'lodash/cloneDeep'; // Import a cloning library
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';
const { getters, commit } = useStore();
const {makeUniqueId} = useCustomComposable();
    defineComponent({
        name: "Projects-Status-form",
    })
    const saveIcon = require("@/assets/images/save.png");
    const deletered = require("@/assets/images/svg/deletered.svg");
    const saveData = require("@/assets/images/save.png");
    const dragIcon = require("@/assets/images/svg/Swip.svg");
    const templateEditIcon = require('@/assets/images/svg/edit_icon.svg');
    const templateDeleteIcon = require('@/assets/images/svg/closeLeftHover.svg');
    const dotcolor = require("@/assets/images/dotcolor.png");
    const deleteIcon = require("@/assets/images/svg/redDelete_Icon.svg");
    const taskTypeNameData = ref('');
    const projectStatusTemplate = ref('');
    const isTemplate = ref(false);
    const props = defineProps({
        modelValue : {
            type: Object,
            default : () =>({}),
        },
        from: {
            type: String,
            default: () => (''),
        },
        projectData: {
            type: Object,
        }
    })
    const isDeleteTemp = ref(false);
    const emit = defineEmits([
        'update:modelValue','disableNext','settingValue','setTemplateData','saveTemplate'
    ]);
    const $toast = useToast();
    const theModel = ref(props.modelValue);
    const clientWidth = inject("$clientWidth");
    const addTaskType = ref(false);
    const taskTypeName = ref("");
    const colorsList = ref([]);
    const errTempMsg = ref("");
    const fromWhich = ref(props.from);
    const templateList = ref([]);
    const templateName = ref('');
    const isTaskSidebarOpen = ref(false);
    const statusOPtion = ref([]);
    const deleteTemplateObj = ref({});
    const useDataArray = ref([]);

    function generateColor(){
        colorsList.value = [];
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        for(let d=0;d<20;d++){
            let randomColor = getRandomColor();
            while(randomColor === "#FFFFFF" || colorsList.value.includes(randomColor)) {
                randomColor = getRandomColor();
            }
            colorsList.value.push(randomColor);
        }
    }

    onMounted(()=>{
        generateColor();
        templateList.value = cloneDeep(getters['settings/projectStaus']);
        emit('update:modelValue', theModel.value);
        if(templateList.value.length > 0){
            if(fromWhich.value === 'setting'){
                let index = templateList.value.findIndex((x) => {
                    return x._id === props.projectData.projectStatusTemplateId;
                })
                if(index !== -1){
                    theModel.value.projectStatusField.value = Object.keys(theModel.value.projectStatusField.value).length > 0 ? theModel.value.projectStatusField.value : templateList.value[index]    
                }else{
                    const customObj = {
                        TemplateName : 'Custom',
                        projectDoneStatus : props.projectData.projectStatusData.filter((x) => x.type==='done'),
                        projectCompletedStatus : props.projectData.projectStatusData.filter((x) => x.type==='close')[0],
                        projectActiveStatus : props.projectData.projectStatusData.filter((x) => x.type==='active' || x.type === 'default_active')
                    }
                    templateList.value = [customObj, ...templateList.value];
                    theModel.value.projectStatusField.value = Object.keys(theModel.value.projectStatusField.value).length > 0 ? theModel.value.projectStatusField.value : customObj;
                }
            }else{
                theModel.value.projectStatusField.value = Object.keys(theModel.value.projectStatusField.value).length > 0 ? theModel.value.projectStatusField.value :templateList.value[0];
                let find = templateList.value.find((x) => x._id === theModel.value.projectStatusField.value._id);
                if(find === undefined){
                    templateList.value.push(theModel.value.projectStatusField.value);
                }
            }
            statusOPtion.value = [...theModel.value.projectStatusField.value.projectActiveStatus, ...theModel.value.projectStatusField.value.projectDoneStatus, theModel.value.projectStatusField.value.projectCompletedStatus];
        }
        if(props.projectData && Object.keys(props.projectData).length > 0) {
            useDataArray.value = props.projectData.projectStatusData.filter((y) => y.value === props.projectData.status);
        }
    })

    watch(() => getters['settings/projectStaus'], (val) => {
        const clonedTemplateList = cloneDeep(val);
        templateList.value = clonedTemplateList;
        if(templateList.value.length){
            if(fromWhich.value === 'setting'){
                let index = templateList.value.findIndex((x) => {
                    return x._id === props.projectData.projectStatusTemplateId;
                })
                if(index !== -1){
                    theModel.value.projectStatusField.value = Object.keys(theModel.value.projectStatusField.value).length > 0 ? theModel.value.projectStatusField.value : templateList.value[index]    
                }else{
                    const customObj = {
                        TemplateName : 'Custom',
                        projectDoneStatus : props.projectData.projectStatusData.filter((x) => x.type==='done'),
                        projectCompletedStatus : props.projectData.projectStatusData.filter((x) => x.type==='close')[0],
                        projectActiveStatus : props.projectData.projectStatusData.filter((x) => x.type==='active' || x.type === 'default_active')
                    }
                    theModel.value.projectStatusField.value = Object.keys(theModel.value.projectStatusField.value).length > 0 ? theModel.value.projectStatusField.value : customObj;
                    templateList.value = [customObj, ...templateList.value];
                }
            }else{
                theModel.value.projectStatusField.value = Object.keys(theModel.value.projectStatusField.value).length > 0 ? theModel.value.projectStatusField.value :templateList.value[0];
            }
            statusOPtion.value = [...theModel.value.projectStatusField.value.projectActiveStatus, ...theModel.value.projectStatusField.value.projectDoneStatus, theModel.value.projectStatusField.value.projectCompletedStatus];
        }
    })
    function deleteProjectStatus (element,type) {
        let arr = type === 'active' ? theModel.value.projectStatusField.value.projectActiveStatus :theModel.value.projectStatusField.value.projectDoneStatus;
        let findInd = arr.findIndex((x) => {
            return x.value === element.value
        })
        if(findInd !== -1) {
            arr.splice(findInd,1);
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.projectStatusField.value._id
        });
        if(indexKey !== -1 && theModel.value.projectStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
        emit('update:modelValue', theModel.value);
    }

    function checkMove (e) {
       return !(e.draggedContext.element.default);
    }

    function updateItem(item, event,type){
        if(event.added !== undefined){
            event.added.element.type = type;
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.projectStatusField.value._id
        });
        if(type === 'active'){
            theModel.value.projectStatusField.value.projectActiveStatus = item
        }
        if(type === 'done'){
            theModel.value.projectStatusField.value.projectDoneStatus = item;
        }
        if(indexKey !== -1 && theModel.value.projectStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
        emit('update:modelValue', theModel.value);
    }
    function setTemplateData(itemData) {
        theModel.value.projectStatusField.value = {};
        theModel.value.projectStatusField.value = itemData;
        statusOPtion.value = [...theModel.value.projectStatusField.value.projectActiveStatus, ...theModel.value.projectStatusField.value.projectDoneStatus,theModel.value.projectStatusField.value.projectCompletedStatus];
        emit('update:modelValue', theModel.value);
    }

    function editTaskTemplate(temp,index) {
        if(projectStatusTemplate.value !== ''){
            if(projectStatusTemplate.value.toLowerCase() === 'custom'){
                $toast.error("Can not create template name Custom",{position: 'top-right'});
                return;
            }
            const duplicateNameIndex = templateList.value.findIndex(
                (object, i) => object.TemplateName === projectStatusTemplate.value && i !== index
            );
            let mainId = templateList.value.findIndex(item=>{
                return item.TemplateName=== projectStatusTemplate.value;
            })
            let obj = {
                TemplateName : projectStatusTemplate.value
            }
            if(mainId === -1 || duplicateNameIndex === -1){
                const query = {
                    collection: dbCollections.PROJECT_STATUS_TEMPLATES,
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
                        let modifiedObj = {...templateList.value[index],TemplateName: projectStatusTemplate.value,isEditable:false};
                        commit("settings/mutateProjectStatus", {data: {...modifiedObj, _id: temp._id}, op: "modified"});
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

    function editTemplateOpen(index) {
        const mergedArray = [...theModel.value.projectStatusField.value.projectActiveStatus, ...theModel.value.projectStatusField.value.projectDoneStatus];
        mergedArray.filter((x) =>{return x.isEditable = false});
        templateList.value.forEach((x,ind) => {
            if(ind === index){
                x.isEditable = true;
            }else{
                x.isEditable = false;
            }
        })
    }

    function activeTemplate(){
        isTemplate.value = true;
        templateList.value.map((x)=>{return x.isEditable = false});
        addTaskType.value = false;
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
                    projectActiveStatus : [{
                        'name': 'Open',
                        'value': 'open',
                        'textColor':'#7367F0',
                        'bgColor': '#E3E1FC35',
                        'isEditable': false,
                        'key':1,
                        'editColor':false,
                        'default':true,
                        "type" : 'default_active'
                    }],
                    projectDoneStatus: [],
                    projectCompletedStatus : {
                        'name': 'Close',
                        'value': 'close',
                        'textColor':'#6BC950',
                        'bgColor': '#6BC95035',
                        'isEditable': false,
                        'key':2,
                        'editColor':false,
                        'type': 'close',
                    },
                    taskcloseStatus : 2,
                    taskActiveStatus : [1],
                    taskDoneStatus : [],
                    createdAt: new Date()
            }
            const getQuery = {
                type: "insertOne",
                collection: dbCollections.PROJECT_STATUS_TEMPLATES,
                data: [insertObj]
            }
            mongodbCrudOperations(getQuery).then((response)=>{
                theModel.value.projectStatusField.value = {...insertObj, _id: response.insertedId};
                commit("settings/mutateProjectStatus", {data: {...insertObj, _id: response.insertedId}, op: "added"});
                templateName.value = "";
                isTemplate.value = false;
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
            return x._id == theModel.value.projectStatusField.value._id
        });
        if(indexKey !== -1){
            delete templateList.value[indexKey].isShowSave;
        }
        const oldId = theModel.value.projectStatusField.value._id;
        const obj = {
            'TemplateName' : theModel.value.projectStatusField.value.TemplateName,
            'projectActiveStatus': theModel.value.projectStatusField.value.projectActiveStatus,
            'projectDoneStatus' : theModel.value.projectStatusField.value.projectDoneStatus,
            'projectCompletedStatus' : theModel.value.projectStatusField.value.projectCompletedStatus,
            'createdAt': new Date()
        }
        if(theModel.value.projectStatusField.value.default !== undefined){
            obj.default = theModel.value.projectStatusField.value.default
        }
        const query = {
            type : 'deleteOne',
            data : [{
                _id : BSON.ObjectId(theModel.value.projectStatusField.value._id)
            }],
            collection : dbCollections.PROJECT_STATUS_TEMPLATES
        }
        mongodbCrudOperations(query).then(async() => {
            commit("settings/mutateProjectStatus", {data: {_id: oldId}, op: "removed"});
            const getQuery = {
                type: "insertOne",
                collection: dbCollections.PROJECT_STATUS_TEMPLATES,
                data: [obj]
            }
            await mongodbCrudOperations(getQuery).then((response)=>{
                theModel.value.projectStatusField.value = {...obj , _id : response.insertedId};
                let index = templateList.value.findIndex((x) => x._id === response.insertedId);
                if(index === -1){
                    templateList.value.push({...obj , _id : response.insertedId});
                }
                const index1 = templateList.value.findIndex((type) => type._id === oldId);
                if(index1 !== -1) {
                    templateList.value.splice(index1, 1);
                }
                emit('saveTemplate',response.insertedId,oldId,'projectstatus')
            }).catch((err) => {
                console.error(err)
            })
        })
    }

    function updateTaskStatus (event) {
        if(event.type === 'active'){
            theModel.value.projectStatusField.value.projectActiveStatus = [...theModel.value.projectStatusField.value.projectActiveStatus,event];
        }else if(event.type === 'done'){
            theModel.value.projectStatusField.value.projectDoneStatus = [...theModel.value.projectStatusField.value.projectDoneStatus,event];
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.projectStatusField.value._id
        });
        if(indexKey !== -1 && theModel.value.projectStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
        emit('settingValue',theModel.value)
    }

    function removeTaskStatus (event) {
        if(event.type === 'active'){
            let activeIndex = theModel.value.projectStatusField.value.projectActiveStatus.findIndex((x) => {
                return x.key === event.key
            })

            if(activeIndex !== -1) {
                theModel.value.projectStatusField.value.projectActiveStatus.splice(activeIndex,1);
            }
        }else if(event.type === 'done'){
            let doneIndex = theModel.value.projectStatusField.value.projectDoneStatus.findIndex((x) => {
                return x.key === event.key
            })

            if(doneIndex !== -1) {
                theModel.value.projectStatusField.value.projectDoneStatus.splice(doneIndex,1);
            }
        }
        let indexKey = templateList.value.findIndex((x)=>{
            return x._id == theModel.value.projectStatusField.value._id
        });
        if(indexKey !== -1 && theModel.value.projectStatusField.value.TemplateName !== 'Custom'){
            templateList.value[indexKey].isShowSave = true;
        }
        statusOPtion.value = [...theModel.value.projectStatusField.value.projectActiveStatus, ...theModel.value.projectStatusField.value.projectDoneStatus, theModel.value.projectStatusField.value.projectCompletedStatus];
    }

    function handleConfirm(){
        const query = {
            type : 'deleteOne',
            data : [{
                _id : BSON.ObjectId(deleteTemplateObj.value._id)
            }],
            collection : dbCollections.PROJECT_STATUS_TEMPLATES
        }
        mongodbCrudOperations(query).then(()=>{
            isDeleteTemp.value = false;
            theModel.value.projectStatusField.value = templateList.value.find((x) => x._id !== deleteTemplateObj.value._id) || {};
            commit("settings/mutateProjectStatus", {data: {_id: deleteTemplateObj.value._id}, op: "removed"});
            $toast.success("Template deleted successfully.",{position: 'top-right'});
        }).catch((err) =>{
            console.error(err,"Error in Delete Template");
        })
    }

    const checkDeletable = (value) => {
        let data;
        if(value.default === true){
            data = true;
        }else{
            data = useDataArray.value.some(x => x.value === value.value);
        }
        return data;
    }

</script>
<style scoped>
@import './style.css';
.closeStatus {
    list-style: none;
    border: 1px solid #ececec!important;
    border-radius: 5px;
    padding: 0px 10px 0px 23px;
    margin-bottom: 10px;
}
input.form-control.edit-input{
    margin: 1px 8px 1px 0px;
    background-color: #f1f1f1;
    border: 0px;
}
input.form-control.edit-input1 {
    margin: 1px 8px 1px 0px;
    background-color: #f1f1f1;
    border: 0;
}
.input__ignore-drag{
    width: 12px; 
    height: 12px; 
}
.taskStatusSection .add_new_temp{
    flex-grow: 1;
    padding-right: 56px !important;
    box-sizing: border-box;
}
.taskStatusSection.statusTaskWrapper .taskStatusRight{overflow: auto;max-height: 308px;}
.taskStatusSection.statusTaskWrapper {overflow: unset;max-height: fit-content;}
@media(max-width:1366px){
    .taskStatusSection.statusTaskWrapper .taskStatusRight{overflow: auto;max-height: 308px;}
    .taskStatusSection.statusTaskWrapper {overflow: unset;max-height: fit-content;}
}
@media(max-width:767px){
    .closeStatus{height: 40px;}
    .taskStatusSection.statusTaskWrapper .taskStatusRight{max-height: 300px;}
}

</style>