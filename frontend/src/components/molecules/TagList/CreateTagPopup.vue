<template lang="">
    <div class="d-flex taglist__dropdown-mobile__margin" @click="(e)=>{e.stopPropagation()}" :class="[{'pointer-none' : (tagChipArray.length >= 3 && isTaskList) || !checkApps('tags') }]">
        <DropDown @isVisible="tagClosed">   
        <template  #button>
            <div v-show="(tagChipArray.length < 3 || !isTaskList) && checkApps('tags')" class="d-flex " ref="clickDropDown" >
                <img id="openTagDropdown" :src="!isTaskList? tag:tag2"  class="cursor-pointer tag-div">
            </div>
        </template>
        <template #head>
            <div class="tagInputwrapper">
                <InputText :modelValue="searchtag" 
                           placeHolder="Search or Create New" 
                           @update:modelValue="(val) => searchtag = val" 
                           @keyup="(val)=>checkSameName(val.event,val.value,'isSearch')" 
                           :isDirectFocus="true" 
                />
                <h5 v-if="errorMessage" class="red font-size-11 font-weight-400">{{errorMessage}}</h5>
            </div>
        </template>
    <template #options>
            <div class="chipDiv-wrapper" v-if="checkApps('tags')"> 
                <SpinnerComp :is-spinner="isSpinner || isChipSpinner"/>  
                <div v-for="(item, index) in tagChipArray" :key="index" class="tagList">
                    <TagChip :data="item" :isBorder="false" :ids="ids" :tagsArray="project.tagsArray" :taskId="task.id" :sprintId="task.sprintId" :taskName="task.TaskName" @isSpinner="(val)=> isChipSpinner = val"/>
                </div>
            </div>
                <div class="chipDiv-hr"></div>
            <div class="taglist-options">
                <div class="taglist_option--item" v-for="(item, index) in (searchtag ? array2 : array)" :key="index">
                    <div class="mainDiv cursor-pointer">
                        <div class="ml-0 w-100 edit__status-key"  v-if="editStatus && editStatus.key === 'isRename' && editStatus.uid === item.uid">
                            <InputText
                                :inputId="item.uid"
                                v-model="reNameVal" 
                                @focus="(val) =>{reNameVal = item.tagName,oldVal = JSON.parse(JSON.stringify(item))}"
                                @blur="(val)=> {editStatus = undefined}"
                                placeHolder="Rename Tag" 
                                @update:modelValue="(val) => reNameVal = val" 
                                @keyup="(val)=>checkSameName(val.event,val.value.trim(),'isRename',index,item)" 
                                :isDirectFocus="true"
                                class="ml-0 w-100 edit__status-key"
                            />
                            <h5 v-if="renameErrorMessage" class="red" >{{renameErrorMessage}}</h5>
                        </div>
                            <div class="change-color-wrapper" v-else-if="editStatus && editStatus.key === 'isColor' && editStatus.uid === item.uid">
                                <span class="changeColorTextTagName" :title="item.tagName" :style="{color:item.tagColor}">{{item.tagName}}</span>
                                <input
                                    type="color"
                                    v-model.trim="tagColor"
                                    @input="tagBgColor = tagColor+'35'"
                                />
                                <img :src="saveimage" class="saveTagColorImage cursor-pointer" @click="()=>HandleColors('save',index,item)"/>
                                <img :src="cancelimage" class="deleteTagImage cursor-pointer ml-5px" @click="()=>HandleColors('cancel',index)"/>
                            </div>
                            <div class="d-flex justify-content-between w-100" v-else @click="addTag(item.uid,item.tagName)">
                                <span class="tag_name"  :title="item.tagName" :style="{color:item.tagColor}" >{{item.tagName}}</span>
                                <span @click.stop="()=>dropdown(item)"><img  :src="threedots" class="cursor-pointer p0x-5px ml-auto mt-7px tagname__threedots" :class="[{'threedots': clientWidth > 767}]" alt=""/> </span> 
                            </div>

                            <DropDown :id="Did" >
                                <template #button>
                                    <button id="EditTag" hidden :ref="Did"></button>
                                </template>
                                <template #options>
                                    <div class="">
                                        <ul class="tag-edit-option justify-content-start">
                                            <li class="mainDiv justify-content-start" @click=" $refs[Did][0].click(),EditChips('isRename')">
                                                <img :src="renameimage" class="inner-tagedit-list-item"/>
                                                <span>Rename</span>
                                            </li>
                                            <li class="mainDiv justify-content-start" @click=" $refs[Did][0].click(),EditChips('isColor')">
                                                <img :src="colorimage" class="inner-tagedit-list-item"/>
                                                <span>Change Color</span>
                                            </li>
                                            <li class="mainDiv justify-content-start" @click=" $refs[Did][0].click(),EditChips('isDelete'),showSidebar = true,sendMethod()">
                                                <img :src="deleteimage" class="inner-tagedit-list-item"/>
                                                <span class="red">Delete</span>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                            </DropDown>
                    </div>
                </div>
                <p class="tag-instruct-text" v-if="searchtag">Press Enter to create a new tag</p>
                <p class="tag-instruct-text p-0" v-else-if="array.length==0 && tagChipArray.length == 0">No Tags Found</p>
            </div>
    </template> 
        </DropDown>
        <ConfirmationSidebar
            v-model="showSidebar"
            :acceptButtonClass="`btn-danger`"
            acceptButton="Delete"
            title="Delete Tag"
            message="Are you sure you want to delete the tag everywhere in this Space?"
            :isShowInput="false"
            @confirm="deleteTags(dataItem),toast.error('Tag Deleted successfully',{position:'top-right'})"
        >
        <template #body>
            <div></div>
        </template>
    </ConfirmationSidebar>
    </div>
</template>
<script setup>

// packages
import {ref,watchEffect,inject} from 'vue'

// components
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import TagChip from '@/components/atom/TagChip/TagChip.vue'
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import InputText from "@/components/atom/InputText/InputText.vue";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';

// utility 
import * as env from '@/config/env';
import { createTag,addTaskTag,updateTag,deleteTag} from "./helper.js";
import { useCustomComposable , useGetterFunctions } from "@/composable";
import { useToast } from 'vue-toast-notification';
import { apiRequest } from '../../../services';

const companyId = inject("$companyId")
const threedots = require("@/assets/images/svg/tagdots.svg")
const tag = require("@/assets/images/svg/Tag.svg");
const tag2 = require("@/assets/images/svg/SquareTag.svg");
const array = ref([])
const array2 = ref([])
const clientWidth = inject('$clientWidth');
const editStatus = ref({})
const showSidebar = ref(false)
const reNameVal = ref("")
const tagChipArray = ref([])
const dataItem  = ref()
const errorMessage = ref("")
const renameErrorMessage = ref("")
const ids = ref({})
const tasksTagsArray = ref([])
const tagColor = ref('#000000')
const tagBgColor = ref('#000000')
const toast = useToast()
const {makeUniqueId , checkApps } = useCustomComposable();
const searchtag =  ref()
const Did = ref("custom"+makeUniqueId(5));
const renameimage = require("@/assets/images/editmilestone.png")
const deleteimage = require("@/assets/images/Deletemilestone.png")
const colorimage = require("@/assets/images/palette.png")
const saveimage = require("@/assets/images/save.png")
const cancelimage = require("@/assets/images/svg/deletered.svg")
const emit = defineEmits(["send:tagChipArray","send:ids", "send:dropvisible"])
const isSpinner = ref(false)
const isChipSpinner = ref(false)
const projectArray = ref()
const oldVal = ref('')
const clickDropDown = ref()
const sendMethod = () =>{
    clickDropDown.value.click()
}
const {getUser} = useGetterFunctions();
const userId = inject('$userId')
const user = getUser(userId.value);

const userData = {
    id: user.id,
    Employee_Name: user.Employee_Name,
    companyOwnerId: user.companyOwnerId
}



defineExpose({sendMethod})

const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
    project:{
        type: Object,
        required: true,
    },
    isTaskList:{
        type:Boolean,
        default: false,
    },
    chipCount:{
        type:Number,
        default:4
    },
    stringObj:{
        type:String,
    },
});

const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return {tagColor:color,tagBgColor:color+'35'};
}

projectArray.value = { ...props.project.tagsArray }

const ActivityLog = (message, taskId = null) =>{
    let historyObj =  {
        "sprintId": taskId ? props.task?.sprintId : null,
        'message': message,
        'key' : taskId ? 'task' : 'Project_Name',
    }
    apiRequest("post", env.HANDLE_HISTORY, {
        "type": taskId ? 'task' : 'project',
        "companyId": companyId.value,
        "projectId": props.project._id,
        "taskId": taskId,
        "object": historyObj,
        "userData": userData
    })
    .catch((error) => {
        console.error("ERROR in update project history: ", error);
    })
}

watchEffect(()=>{
    array.value = props.project.tagsArray || [];
    tasksTagsArray.value = props.task.tagsArray || [];
    array.value = array.value.filter((item)=>{ return !(tasksTagsArray.value.includes(item['uid'])) })
    array.value.sort((a,b) => (a.tagName.toLowerCase() < b.tagName.toLowerCase()) ? -1 : ((b.tagName.toLowerCase() < a.tagName.toLowerCase()) ? 1 : 0));  

    tagChipArray.value =  (props.project.tagsArray !== undefined) ? props.project.tagsArray.filter((item)=>{ return tasksTagsArray.value.includes(item['uid'])}) : []

    ids.value = {companyId:companyId.value,projectId:props.project._id,sprintId:props.task.sprintId,taskId:props.task._id}
    tagChipArray.value.sort((a,b) => (a.tagName.toLowerCase() < b.tagName.toLowerCase()) ? -1 : ((b.tagName.toLowerCase() < a.tagName.toLowerCase()) ? 1 : 0));      

    emit("send:tagChipArray",tagChipArray.value)
    emit("send:ids",ids.value)

})

function tagClosed(val) {
    emit("send:dropvisible",val)
    if(!val) {
        searchtag.value = ""
        errorMessage.value = ""
        renameErrorMessage.value = ""
        editStatus.value = undefined
    }
}

const EditChips = (key) => {
    editStatus.value = {...dataItem.value, key:key}    
}

const dropdown = (item) => {
    document.getElementById("EditTag").click();
    dataItem.value = item
}

//  search , create , rename tag function
const checkSameName = (e,val,state,i,item) => {
    const value = val.trim() ? val.trim() : ""
    let flag = false
    errorMessage.value = ""
    renameErrorMessage.value = ""
    let propArray = props.project.tagsArray !== undefined ? props.project.tagsArray : []

    if(state == 'isSearch'){
        array2.value = array.value.filter((item) =>{
        return item.tagName.toLowerCase().trim().includes(value.toLowerCase()) 
    })
    propArray.forEach((item) => {
        if( item.tagName.toLowerCase().trim() === value.toLowerCase().trim()) { flag = true }
        })
        if(e.keyCode == 13){
            if(flag){
                errorMessage.value = "This tag has already been added."
                return     
            }
            if(!value){
                errorMessage.value = "Tag name required"
                return
            }
            let colors = getRandomColor()   
            const obj = {tagBgColor:colors.tagBgColor , tagColor:colors.tagColor , tagName:value,uid:makeUniqueId(12)}
            createTag(ids.value,obj)
            addTag(obj.uid,obj.tagName)
            toast.success("Tag Created successfully",{position:"top-right"})
            array.value.push(obj)
            searchtag.value = ""
        }
    }

    if(state == 'isRename'){
        propArray.forEach((item) => {
        if(  item.tagName.toLowerCase().trim() === value.toLowerCase().trim()) { flag = true }
        })
        if(e.keyCode == 13){
            if(dataItem.value.tagName.toLowerCase().trim() === value.toLowerCase().trim()){
                    editStatus.value = false
                    return 
            }
            if(flag){
                renameErrorMessage.value = "This tag has already been added."
                return     
            }
            if(!value){
                renameErrorMessage.value = "Tag name required"
                return
            }
            let Name = array.value[i].tagName
            array.value[i].tagName = reNameVal.value
            updateTag(ids.value, oldVal.value, {...item,tagName:reNameVal.value})
            ActivityLog(`<b>${userData.Employee_Name}</b> has renamed the Tag from <b>  ${Name}  </b> to <b>${reNameVal.value} </b>`)
            editStatus.value = undefined
        }
    }
}

const addTag = (payload,tagName) =>{

    isSpinner.value = true
    addTaskTag(ids.value,payload).then((data)=>{
        isSpinner.value = data
        errorMessage.value = ""
    }).catch((error)=>{
        toast.error(error,{position: "top-right"})
    })
    ActivityLog(`<b>${userData.Employee_Name}</b> has added the <b> ${tagName} Tag </b> in <b>${props.task?.TaskName}</b> Task`)
    ActivityLog(`<b>${userData.Employee_Name}</b> has added the <b> ${tagName} Tag </b>`, props.task?._id)
}

//  Handling deletion of Tags
const deleteTags = (payload) =>{
    showSidebar.value = false
    deleteTag(ids.value,payload)
    ActivityLog(`<b>${userData.Employee_Name}</b> has deleted the <b> ${payload.tagName} Tag </b>`)
}

//  Handling colors Changes
const HandleColors = (key,i,item) =>{
    if(key === 'save'){
        updateTag(ids.value, item, {...item , tagColor:tagColor.value , tagBgColor:tagBgColor.value})
        tagColor.value = '#000000'
        tagBgColor.value = '#C8C8C8'
    }
    else{
        tagColor.value = '#000000'
        tagBgColor.value = '#C8C8C8'
    }
    editStatus.value = undefined
}

</script>
<style>
@import "./style.css";
.search-project-filter:has(.taglist-options) {
    padding: 0px!important;
}
.tagInputwrapper input::placeholder{
    text-transform: none !important;
}
.tagname__threedots{
    height:4px;
}
.edit__status-key{
    height:26px !important;
}
.chipDiv-hr{
    border-bottom: 1px solid #CFCFCF;
    margin: 6px 0;
}
</style>