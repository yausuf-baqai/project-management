<template>
    <div class="calendar__title--wrapper d-flex align-items-center flex-row justify-content-between pb-22px">
        <h2 class="m-0 font-size-22 font-weight-500 black calendar__title">Calendar</h2>
        <button class="btn__task ml-10px border-radius-4-px black font-weight-400 border-0 font-size-12 cursor-pointer bg-colorlightgray mr-2px vertical-middle"  @click="emit('hideCalender',false)"><img :src="hideIcon" /> Hide </button>
    </div>
    <div class="calendar__detail--wrapper bg-white border-radius-10-px"> 
        <div class="calendar__component--header p-20px d-flex align-items-center justify-content-between border-bottom-serach">
            <div class=" d-flex align-items-center">   
                <div class=" d-flex align-items-center" :style="[{marginRight : clientWidth > 767 ? '40px' : '15px' }]">
                    <span class="cursor-pointer"><img class="calendar_days left__days position-re z-index-1"  :src="calnedarLeft" @click="subtractDays(1)"/></span>
                    <span class="font-size-16 black font-weight-500 due-date-home-calender-wrapper">
                        <DueDateCompo
                            :ref="'dueDate'"
                            class="due-date-home-cal"
                            id="due-date-home-calender"
                            :allowTillCurrentDate="true"
                            :isShowDateAndicon="true"
                            :displyDate="new Date(dateValue).getTime()"
                            @SelectedDate="($event) => updateDueDate($event)"
                            :position="`right`"
                            :autoposition="true"
                        />
                    </span>
                    <span class="cursor-pointer"><img class="calendar_days right__side position-re z-index-1" :src="calnedarRight" @click="addDays(1)"/></span>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="day__status font-size-14 gray81 cursor-pointer lable-status-hover" :style="[{marginLeft : clientWidth > 767 ? '20px' : '10px' }]" @click="updateDueDate({dateVal:new Date()})">Today</span>
            </div>
        </div> 
        <div class="calendar__main-component">
            <!-- <SpinnerComp :is-spinner="loading" v-if="loading" class="position-re mt-30px"/> -->
            <div class="p-10px" v-if="loading">
                <div class="calendar__taskdisplay--wrapper-skelaton mb-10px" v-for="(ele,index) in 3" :key="index">
                    <SkelatonVue :style="{width: '40%', height: '11px', margin: '5px 0px 5px 5px'}" :class="{}"/>
                    <SkelatonVue :style="{width: '100%', height: '16px', margin: '5px 0px 5px 5px'}" :class="{}"/>
                </div>
            </div>
            <div class="calnedar__projectstatus--timecomponent overflow-y-auto overflow-x-hidden" @scroll="onScroll">
                <div v-if="!loading && searchResults && searchResults.length == 0" class="text-center">
                    No task found
                </div>
                <Transition>
                    <TransitionGroup name="list" appear tag="div">
                        <div v-if="!loading && searchResults && searchResults.length">
                            <CalendarTaskDisplayComp v-for="(task) in searchResults" @openTaskDetailSidebar="sidebarDataMange" :key="task._id" :taskObject="task" :findParticularProject="findParticularProject(task.ProjectID)"/>
                        </div>
                    </TransitionGroup>
                </Transition>
            </div>
        </div> 
    </div>
</template>

<script setup>
    import { defineComponent,defineProps, ref,onMounted,inject, watch,defineEmits } from "vue";
    import SkelatonVue from '../../components/atom/Skelaton/Skelaton.vue';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
    // import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import CalendarTaskDisplayComp from '../Home/CalendarTaskDisplayComp.vue'
    import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
    import { BSON } from "realm-web";
    const hideIcon = require('@/assets/images/svg/hide_icon.svg');
    const calnedarLeft = require ('@/assets/images/rectangle_leftArrow.png');
    const calnedarRight = require ('@/assets/images/rectangle_rightArrow.png');
    
    defineComponent({
        components:[
            CalendarTaskDisplayComp
        ]
    })
    const emit = defineEmits([
        'hideCalender',
        'openTaskDetail'
    ])

    const props = defineProps({
        // projectIdsArray : {type:Array,required:true},
        allProjectsArray : {type:Array,required:true},
        updatedObject : {type:Object,default: () => {}},
    });

    const userId = inject("$userId");
    const companyId = inject("$companyId");
    const clientWidth = inject("$clientWidth");

    // const projectIdsArray = ref(props.ProjectIdsArray);
    const allProjects = ref(props.allProjectsArray);
    const searchResults = ref([]);
    const pageNumber = ref(1);
    const loading = ref(false);
    const timer = ref(null);
    const memorizationArray = ref([]);
    const dateValue = ref(new Date());
    const findParticularProject = (id) => allProjects.value.find((xt) => xt._id === id) || {};
    const skip = ref(0)
    const limit = ref(10)

    watch(()=>props.updatedObject,(newVal)=>{
        if(newVal) {
            let start_date = new Date(dateValue.value).setHours(0,0,0);
            let end_date = new Date(dateValue.value).setHours(23,59,59);
            if(new Date(newVal.DueDate).getTime() >= start_date && new Date(newVal.DueDate).getTime() <= end_date) {
                let fIndex = searchResults.value.findIndex((e)=>e._id === newVal._id)
                if(fIndex === -1) {
                    searchResults.value.unshift(newVal);
                } else {
                    searchResults.value.splice(fIndex,1,newVal)
                }
            } else {
                let findIndex = searchResults.value.findIndex((ele)=>{return ele._id === newVal._id});
                if(findIndex !== -1) {
                    searchResults.value.splice(findIndex,1);
                }
            }
        }
    })

    const addOrSubtractDaysFromToday =(daysToAddOrSubtract) => {
      const newDate = new Date(dateValue.value);
      newDate.setDate(dateValue.value.getDate() + daysToAddOrSubtract);
      searchMongoTasks(new Date(newDate),true)
      return newDate;
    }
    const addDays = (days) => {
      dateValue.value = addOrSubtractDaysFromToday(days);
    }
    const subtractDays = (days) => {
      dateValue.value = addOrSubtractDaysFromToday(-days);
    }
    const searchMongoTasks = (date = null,reset = true) => {
        try {
            if(reset) {
                searchResults.value = [];
                pageNumber.value = 1;
                loading.value = true;
                skip.value = 0
            } else {
                skip.value += limit.value
            }
            let startDate = date == null ? new Date(dateValue.value.setHours(0,0,0)) : new Date(date.setHours(0,0,0));
            let endDate = date == null ? new Date(dateValue.value.setHours(23,59,59)) : new Date(date.setHours(23,59,59));
            let projectData = allProjects.value;
            let obj = [
                {
                    $match: {
                        $and: [
                            {CompanyId: BSON.ObjectId(companyId.value)},
                            {AssigneeUserId: {$in: [userId.value]}},
                            {deletedStatusKey: 0},
                            {ProjectID:{$in :projectData && projectData.length ? JSON.parse(JSON.stringify(projectData)).map((e)=>BSON.ObjectId(e._id)) : [] }},
                        ],
                        $or: [
                            {startDate: {$gte: startDate, $lte: endDate}},
                            {DueDate: {$gte: startDate, $lte: endDate}},
                            {$and: [
                                    {DueDate: {$gte: startDate}},
                                    {startDate: {$lte: endDate}}
                                ]
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'folders',
                        localField: 'folderObjId',
                        foreignField: '_id',
                        as: 'folderArray',
                        pipeline: [
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                    }
                },
                {
                    $lookup: {
                        from: 'sprints',
                        localField: 'sprintId',
                        foreignField: '_id',
                        as: 'sprintArray',
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    folderId:1
                                }
                            }
                        ],
                    }
                },
                {
                    $unwind: '$sprintArray'
                },
                {
                    $unwind: { path: '$folderArray', preserveNullAndEmptyArrays: true }
                },
                {$sort:{DueDate: -1,_id:1}},
                {$skip: skip.value},
                {$limit: limit.value}
            ]
            const query = {
                type: 'aggregate',
                collection: dbCollections.TASKS,
                data: [obj]
            }
            const queryRef =  mongodbCrudOperations(query)
        
            debouncer(500).then(() => {
                queryRef.then((result) => {
                    if(!result.length || result.length == 0) {
                        loading.value = false;
                        if (reset) {
                            searchResults.value = []
                        }
                        return;
                    }
                    pageNumber.value = pageNumber.value + 1;
                    if(reset){
                        searchResults.value = result
                    } else {
                        result.forEach(x =>{
                            searchResults.value.push({...x})
                        })
                    }
                    let count = 0;
                    const updateTask = (ele) => {
                        if(count >= searchResults.value.length) {
                            return;
                        } else {
                            if(ele.parentTaskName == undefined && !ele.isParentTask) {
                                let dataVal =  getSubTaskData(ele.ParentTaskId)
                                ele.parentTaskName = dataVal ? dataVal.TaskName : '';
                            } else {
                                count++;
                                updateTask(searchResults.value[count]);
                            }
                        }
                    }
                    updateTask(searchResults.value[count]);
                    loading.value = false;
                })
                .catch((error) => {
                    loading.value = false;
                    console.error("ERROR in search tasks: ", error);
                })
            })
        } catch (error) {
            loading.value = false;
            console.error("ERROR in search tasks: ", error);
        }
    }
    const getSubTaskData = (id1) => {
        const collectionNamePar = dbCollections.TASKS;
        const searchPar = [
            {_id: BSON.ObjectId(id1)}
        ]

        const findIndex = memorizationArray.value.findIndex((ele) => ele._id === id1);
        if (findIndex === -1) {
            try {
                const res = mongodbCrudOperations({ type: 'findOne', collection: collectionNamePar, data: searchPar });
                res.then(() => {
                    memorizationArray.value.push(res);
                    return { ...res };
                })
                .catch((error) => {
                    console.error("ERROR in search subtask data: ", error);
                })
            } catch (error) {
                console.error("Error fetching subtask data:", error);
                return null;
            }
        } else {
            return memorizationArray.value.find((e) => e._id == id1);
        }
    };
    const updateDueDate = (event) =>{
        if(new Date(dateValue.value).toLocaleDateString() === new Date(event.dateVal).toLocaleDateString()){
            return
        }
        dateValue.value = new Date(event.dateVal);
        searchMongoTasks(dateValue.value,true)
    }
    const onScroll = (e) => {
        debouncer(50).then(() => {
            if (e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight) - 200) {
                searchMongoTasks(new Date(dateValue.value),false);
            }
        })
    }

    function debouncer(timeout = 1000) {
        return new Promise((resolve) => {
            if(timer.value) {
                clearTimeout(timer.value);
            }
            timer.value = setTimeout(() => {
                resolve();
            }, timeout);
        })
    }
    onMounted(()=>{
        loading.value = true;
        searchMongoTasks();
    })
    function sidebarDataMange(taskObj) {
        emit('openTaskDetail',taskObj);
    }
</script>

<style scoped src="../Home/style.css"></style>