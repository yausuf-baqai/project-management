<template>
    <div class="position-sti bg-white task__audio-component h-100">
        <div class="input__file-Search">
            <InputText v-model="search" place-holder="Search" @input="onSerch" :isOutline="false"/>
        </div>
        <div class="d-flex align-items-center justify-content-between audio__detail-wrapper">
            <div class="w-50">
                <ul class="d-flex p-0 m-0 ml-5px">
                    <template v-for="(user, index) in userList.filter((x, index) => index < 4)" :key="index">
                        <li v-if="index <= 3" class="ml--5px li__less-three">
                            <UserProfile
                                :showDot="false"
                                :data="{
                                    image: getUser(user._id).Employee_profileImageURL,
                                    title: getUser(user._id).Employee_Name
                                }"
                                width="30px"
                                :thumbnail="'30x30'"
                                class="cursor-pointer"
                                :style="user.isSelected ? 'border: 2px solid #3F51B5; border-radius: 50%;' : ''"
                                @click="user.isSelected = !user.isSelected,getDataWithUserFilter()"
                            />
                        </li>
                        <li v-if="index == 3 && Number(userList.length-4) !== 0" class="position-re li__equal-four">
                            <DropDown :id="'Assignee_'+'fileandlinks'" :bodyClass="{'audio__user-sidebar' : true}">
                                <template #button>
                                    <div @click="toggleUsers = true" class="cursor-pointer d-flex align-items-center justify-content-center profile-image GunPowder blue text-nowrap">
                                        + {{ Number(userList.length-4) }}
                                    </div>
                                </template>
                                <template #options>
                                    <DropDownOption
                                        v-for="(user1,index1) in userList.filter((x, index) => index >= 4)"
                                        :key="'user'+index1"
                                    >
                                        <div class="font-size-13 getdata__userfilter">
                                            <div class="overflow-y-auto overflow-x-hidden drop-down-options black">
                                                <div class="align-items-center border-radius-5-px justify-content-between hover-purple cursor-pointer text-nowrap drop-down-item">
                                                    <div class="d-flex align-items-center" :title="user1.Employee_Name" @click.stop.prevent="user1.isSelected = !user1.isSelected,getDataWithUserFilter()">
                                                        <input type="checkbox" :class="[{'checkboxBlueFileLink' : user1.isSelected}]" :id="'checkboxlinkfile'+user1.id" v-model="user1.isSelected" />
                                                        <UserProfile
                                                            :showDot="false"
                                                            :data="{
                                                                image: getUser(user1.id).Employee_profileImageURL,
                                                                title: getUser(user1.id).Employee_Name
                                                            }"
                                                            width="22px"
                                                            :thumbnail="'22x22'"
                                                            class="cursor-pointer ml-15px"
                                                            @click="user.isSelected = !user.isSelected"
                                                            :style="user1.isSelected ? 'border: 2px solid #3F51B5;' : ''"   
                                                        />
                                                        <span class="text-ellipsis  ml-5px user__employename">{{ user1.Employee_Name }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </DropDownOption>
                                </template>
                            </DropDown>
                        </li>
                    </template>
                </ul>
            </div>
            <div class="border-radius-6-px file__ascedesc-wrapper">
                <DropDown id="filter" :bodyClass="{'z-index-10' : true}">
                    <template #button>
                        <div ><span class="font-size-16 font-weight-700 gray81 mr-15px">Sort by:</span> <span class="font-size-16 font-weight-400 gray81 ml-6px sort__by-category">{{selectedOrder == '0' ? 'A to Z' : 'Z to A'}}</span></div>
                    </template>
                    <template #options>
                        <DropDownOption
                            class="font-size-16 font-weight-400 gray81"
                            v-for="order in orders"
                            :key="order.value"
                            :item="order"
                            @click="oldOrder = selectedOrder,selectedOrder = order.value,changesOrderOfSorting()"
                        />
                    </template>
                </DropDown>
            </div>
        </div>
        <div v-if="!isSpinner && filterdAudioFiles.length > 0" class="audio_files-content overflow-y-auto overflow-y-auto::-webkit-scrollbar p0x-15px" :style="[{maxHeight : clientWidth >767 ? 'calc(100vh - 225px)' : 'calc(100vh - 185px)'}]" @scroll="onScroll">
            <Transition>
                <ul>
                    <TransitionGroup name="list__audiosidebar" tag="div" appear>
                        <AudioFileComp v-for="dataObject in filterdAudioFiles" :key="dataObject.id" :audioObject="dataObject"/>
                    </TransitionGroup>
                </ul>
            </Transition>
        </div>
        <div v-if="!filterdAudioFiles.length && isLoading == false" class="text-center mt-5">
            No audio files found
        </div>
    </div>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
</template>
<script setup>
import {defineProps,inject,ref,onMounted,computed, onUnmounted} from "vue";
import { dbCollections } from '@/utils/FirebaseCollections';
import InputText from '@/components/atom/InputText/InputText.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import { useGetterFunctions } from '@/composable';
import AudioFileComp from "./AudioFileComp.vue";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
const { getUser } = useGetterFunctions();
import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"
import { BSON } from "realm-web";
// Props
const props = defineProps({
    selectedData: {
        type: Object,
        default: () => {}
    },
    fromWhich: {
        type: String,
        default: ''
    },
})
//Vav Declarations
const clientWidth = inject("$clientWidth");
const timer = ref(null);
const isSpinner = ref(false);
const isLoading = ref(false);
const toggleUsers = ref(false);
const audioAttachmentList = ref([]);
const searchByUserId = ref([]);
const userList = ref([]);
const nextPageStartValue = ref(null);
const search = ref('');
const orders = ref([
    {
        label: 'A to Z',
        value: '0'
    },
    {
        label: 'Z to A',
        value: '1'
    }
]);
const selectedOrder = ref('0');
const oldOrder = ref('');
const batchSize = ref(10);
const skip = ref(0)

//Component Mounted
onMounted(()=>{
    try {
        isSpinner.value = true;
        getMongoData()
    } catch (error) {
        console.error(error);
    }
})
//Component Unmounted
onUnmounted(()=>{
    search.value = '';
    searchByUserId.value = [];
    selectedOrder.value = '0';
    userList.value = userList.value.map((ele)=>{
        ele.isSelected = false;
        return ele;
    })
    oldOrder.value = '';
})

//Computed Function
const filterdAudioFiles = computed(() => {
    let array = audioAttachmentList.value;
    if(search.value) {
        array = array.filter((item) => {
            return (
                item.fileName.toLowerCase().includes(search.value.toLowerCase()) || search.value.toLowerCase().includes(item.fileName.toLowerCase())
            );
        })
    }
    if(selectedOrder.value == '0') {
        array.sort((a, b) => {
            return a.fileName.localeCompare(b.fileName);
        })
    } else if(selectedOrder.value == '1') {
        array.sort((a, b) => {
            return b.fileName.localeCompare(a.fileName);
        })
    }
    let temp = false;
    userList.value.forEach((user) => {
        if(user.isSelected) {
            temp = true;
        }
    });
    if(temp) {
        array = array.filter((item) => {
            let temp1 = false;
            userList.value.forEach((user) => {
                if(user.isSelected && user._id == item.userId) {
                    temp1 = true;
                }
            });
            return temp1;
        })
    }

    return array;
});

//Methods
const onSerch = () => {
    debouncer(500).then(() => {
        nextPageStartValue.value = null;
        skip.value = 0;
        getMongoData()
    })
}


//Main Paginate Query
async function paginateCollection(collection) {
    await groupByQuery(collection);

    let query;
    isLoading.value = true
    let searchObj = {};
    let userFilterObj = {}
    if(search.value){
        searchObj = {
            mediaOriginalName : { $regex: search.value, $options: "i" },
        }
    }
    if(searchByUserId.value && searchByUserId.value.length){
        userFilterObj = {
            userId: { $in: searchByUserId.value }
        }
    }

    if(props.fromWhich === "task") {
        query = {
            $match: {
                $and: [
                        { projectId: BSON.ObjectID(props.selectedData.ProjectID) },
                        { project: false },
                        { sprintId: props.selectedData.sprintId},
                        { taskId: BSON.ObjectID(props.selectedData._id)},
                        { type: { $in: ['audio'] } },
                        { isDeleted: false },
                        searchObj,
                        userFilterObj
                    ]
            }
        };
    } else if(props.fromWhich === "project"){
        query = {
            $match: {
                $and: [
                    { projectId: BSON.ObjectID(props.selectedData._id) },
                    { project: true },
                    { type: { $in: ['audio'] } },
                    { isDeleted: false },
                    searchObj,
                    userFilterObj
                ]
            },
        };
    } else if(props.fromWhich === 'chat') {
        query = {
            $match: {
                $and: [
                        { projectId: BSON.ObjectID(props.selectedData.ProjectID) },
                        { project: false },
                        { sprintId: props.selectedData.sprintId},
                        { taskId: props.selectedData.id === 'default' ? 'default' : BSON.ObjectID(props.selectedData.id)},
                        { type: { $in: ['audio'] } },
                        { isDeleted: false },
                        searchObj,
                        userFilterObj
                    ]
            }
        };
    }

    const queryChange = [
        {
            $facet: {
                "results": [
                    query,
                    {
                        $sort : {mediaOriginalName: selectedOrder.value == '0' ? 1 : -1 }
                    },
                    {
                        $skip: skip.value,
                    },
                    {
                        $limit: batchSize.value,
                    }
                ]
            }
        }
    ];

    const queryRef = mongoQuery.mongodbCrudOperations({
        type: "aggregate",
        collection: collection,
        data: [queryChange]
    })
    .catch((error) => {
        console.error(`Error come in the get data from comments collection on mongoDB ${error.message}`)
    });

    return queryRef;
}


async function groupByQuery(collection) {

    let query;

    if(props.fromWhich === "task") {
        query = [
            {
                $match: {
                    $and: [
                        { projectId: props.selectedData.ProjectID },
                        { project: false },
                        { sprintId: props.selectedData.sprintId},
                        { taskId: props.selectedData._id},
                        { type: { $in: ['audio'] } },
                        { isDeleted: false },
                        {...(search.value && {mediaOriginalName: { $regex: search.value, $options: "i" }})},
                    ]
                }
            },
            { $group: {_id: "$userId",count: { $sum: 1 },results: { $push: "$$ROOT" }}},
        ];
    } else if(props.fromWhich === "project"){
        query = [
            {
                $match: {
                    $and: [
                        { projectId: props.selectedData._id },
                        { project: true },
                        { type: { $in: ['text'] } },
                        { isDeleted: false },
                        {...(search.value && {mediaOriginalName: { $regex: search.value, $options: "i" }})},
                    ]
                }
            },
            {$group: {_id: "$userId",count: { $sum: 1 },results: { $push: "$$ROOT" }}},
        ];
    } else if(props.fromWhich === 'chat') {
        query = [
            {
                $match: {
                    $and: [
                        { projectId: props.selectedData.ProjectID },
                        { project: false },
                        { sprintId: props.selectedData.sprintId},
                        { taskId: props.selectedData.id},
                        { type: { $in: ['audio'] } },
                        { isDeleted: false },
                        {...(search.value && {mediaOriginalName: { $regex: search.value, $options: "i" }})},
                    ]
                }
            },
            {$group: {_id: "$userId",count: { $sum: 1 },results: { $push: "$$ROOT" }}},
        ];
    }

    const queryRef = await mongoQuery.mongodbCrudOperations({
        type: "aggregate",
        collection: collection,
        data: [query]
    }).catch((error) => {
        console.error(`Error come in the get data from comments collection on mongoDB ${error.message}`)
    });

    let array = [];
    if(queryRef && queryRef.length) {
        if(queryRef.length) {
            queryRef.forEach((ele)=>{
                array = [ele._id,...array]
            })
        }
        array.forEach((x)=>{
            let userIndex = userList.value.findIndex((user) => {
                return user._id == x;
            });
            if(userIndex == -1){
                userList.value.push({...getUser(x), isSelected: false});
            }
        })
    }
    return array;
}
//Mongodb Common Query for Sort, Search and filter
const getMongoData = async() => {
    try {
        let results = await paginateCollection(
            dbCollections.COMMENTS
        );
        results = results[0].results
        if(props.fromWhich !== 'chat' && props.selectedData.attachments) {
            addAttachmentData();
        }
        if(!results.length) {
            isSpinner.value = false;
            isLoading.value = false;
            return;
        }
        let arrayData = [];
        results.forEach(x => {
            if(!x.isDeleted && audioAttachmentList.value.findIndex((ele)=>{return ele.id === x._id}) == -1) {
                arrayData.push(x);
            }
        });
        if(arrayData.length > 0) {
            arrayData.forEach(async(x,index) => {
                let bfileSize = x.mediaSize ? x.mediaSize : 0;
                let convertedKbSize = parseFloat(parseInt(bfileSize) / Math.pow(1024, 1)).toFixed(2) + 'KB';
                const fileExt = x.mediaOriginalName.split('.').pop();
                let obj = {
                    'id': x._id ? x._id : '',
                    'userId': x.userId ? x.userId : '',
                    'attached': x.mediaURL ? x.mediaURL : '',
                    'attachedType': 'audio',
                    'extension': fileExt ? fileExt : '',
                    'size': convertedKbSize,
                    'fileName': x.mediaOriginalName,
                    'createTime': x.createdAt,
                    'getFrom': x.from ? 'attachment' :'comments',
                    'userDetail': getUser(x.userId),
                }
                audioAttachmentList.value.push(obj);
                let userIndex = userList.value.findIndex((user) => {
                    return user._id == x.userId;
                });
                if(userIndex == -1) {
                    userList.value.push({...getUser(x.userId), isSelected: false});
                }
                if(index + 1 == results.length) {
                    isSpinner.value = false;
                }
            })
        }
        nextPageStartValue.value = results[results.length - 1].mediaOriginalName;
        isLoading.value = false
    } catch (error) {
        console.error(error);
        isSpinner.value = false;
        isLoading.value = false;
    }
}

//Handle the Scroll
let previousScrollTop = 0;
const onScroll = (e) => {
    const currentScrollTop = e.target.scrollTop;

    debouncer(50).then(() => {
        if (currentScrollTop > previousScrollTop && 
            currentScrollTop + e.target.clientHeight >= e.target.scrollHeight) {
            getMongoData()
            skip.value += batchSize.value
        }
        previousScrollTop = currentScrollTop;
    });
}

//Debouncer
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

//Initially get audio attachment from project
const addAttachmentData = () => {
    try {
        let attachmentData = [];
        props.selectedData.attachments.forEach(async(ele)=>{
            if(ele.type == 'audio' && audioAttachmentList.value.findIndex((e)=>{return e.id == ele.id}) == -1) {
                attachmentData.push({...ele,mediaURL:ele.url,mediaName:ele.filename,mediaSize:ele.size,from:'attachment',createdAt:ele.createdAt})
            }
        })
        attachmentData.forEach(async(x) => {
            let bfileSize = x.mediaSize ? x.mediaSize : 0;
            let convertedKbSize = parseFloat(parseInt(bfileSize) / Math.pow(1024, 1)).toFixed(2) + 'KB';
            const fileExt = x.mediaName.split('.').pop();
            let obj = {
                'id': x.id ? x.id : '',
                'userId': x.userId ? x.userId : '',
                'attached': x.mediaURL ? x.mediaURL : '',
                'attachedType': 'audio',
                'extension': fileExt ? fileExt : '',
                'size': convertedKbSize,
                'fileName': x.mediaName ? x.mediaName : '',
                'createTime': x.createdAt,
                'getFrom': x.from ? 'attachment' :'comments',
                'userDetail': getUser(x.userId),
            }
            audioAttachmentList.value.push(obj);
            let userIndex = userList.value.findIndex((user) => {
                return user._id == x.userId;
            });
            if(userIndex == -1) {
                userList.value.push({...getUser(x.userId), isSelected: false});
            }
        })
    } catch (error) {
        console.error(error)
    }
}

//Hanlde Sorting
const changesOrderOfSorting = () => {
    try {
        if(selectedOrder.value === oldOrder.value) {
            return
        }
        audioAttachmentList.value = [];
        nextPageStartValue.value = null;
        skip.value = 0;
        getMongoData()
    } catch (error) {
        console.error(error);
    }
}

//Hanlde user filteration
const getDataWithUserFilter = () => {
    try {
        searchByUserId.value = userList.value.filter((e)=>{return e.isSelected == true}).map((e)=>{return e._id});
        audioAttachmentList.value = [];
        nextPageStartValue.value = null;
        skip.value = 0;
        getMongoData()
    } catch (error) {
        console.error(error);
    }
}
</script>
<style src="./style.css"></style>