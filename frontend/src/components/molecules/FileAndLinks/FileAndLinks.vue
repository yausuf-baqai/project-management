<!--
    File name: FileAndLinks.vue
    Assignee: Parth Detroja
-->
<template>
    <div class="font-roboto-sans overflow-y-auto bg-white h-100 all__filelinks-wrapper">
        <div class="bg-white position-re h-100">
            <div class="files-links-tabs position-sti bg-white">    
                <ul class="d-flex">
                    <li
                        class="d-flex"
                        :class="activeTab == 'all' ? 'active' : ''"
                        @click="activeTab !== 'all' ? activeTab = 'all': ''"
                    >
                        <span class="font-size-18 font-weight-700 font-roboto-sans cursor-pointer"> All </span>
                    </li>
                    <li
                        class="d-flex"
                        :class="activeTab == 'files' ? 'active' : ''"
                        @click="activeTab !== 'files' ? activeTab = 'files': ''"
                    >
                        <span class="font-size-18 font-weight-700 font-roboto-sans cursor-pointer">Files</span>
                    </li>
                    <li
                        class="d-flex"
                        :class="activeTab == 'links' ? 'active' : ''"
                        @click="activeTab !== 'links' ? activeTab = 'links': ''"
                    >
                        <span class="font-size-18 font-weight-700 font-roboto-sans cursor-pointer">Links</span>
                    </li>
                </ul>
            </div>
            <div class="position-sti bg-white file__links-wrapper">
                <div class="input__file-Search">
                    <InputText v-model="search" place-holder="Search" :isOutline="false" @input="onInput"/>
                </div>
                <div class="d-flex align-items-center justify-content-between pt-0 pb-20px pl-15px pr-15px">
                    <div class="w-50 file__list-wrapper">
                        <ul class="d-flex m-0 ml-5px p-0">
                            <template v-for="(user, index) in userList.filter((x, index) => index < 4)" :key="index">
                                <li v-if="index <= 3" class="ml--5px li__less-three">
                                    <UserProfile
                                        :showDot="false"
                                        :data="{
                                            image: user.Employee_profileImageURL,
                                            title: user.Employee_Name
                                        }"
                                        width="35px"
                                        :thumbnail="'35x35'"
                                        class="cursor-pointer"
                                        :style="user.isSelected ? 'border: 2px solid #3F51B5; border-radius: 50%;' : ''"
                                        @click="user.isSelected = !user.isSelected,getDataWithUserFilter()"
                                    />
                                </li>
                                <li v-if="index == 3 && Number(userList.length-4) !== 0" class="position-re li__equal-three">
                                    <DropDown :id="'Assignee_'+'fileandlinks'" :bodyClass="{'filelinks__user-sidebar' : true}">
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
                                                            <div class="d-flex align-items-center selected__employee-users" :title="user1.Employee_Name" @click.stop.prevent="user1.isSelected = !user1.isSelected,getDataWithUserFilter()">
                                                                <input type="checkbox" :class="[{'checkboxBlueFileLink' : user1.isSelected}]" :id="'checkboxlinkfile'+user1._id" v-model="user1.isSelected" />
                                                                <UserProfile
                                                                    :showDot="false"
                                                                    :data="{
                                                                        image: user1.Employee_profileImageURL,
                                                                        title: user1.Employee_Name
                                                                    }"
                                                                    width="22px"
                                                                    class="cursor-pointer ml-15px"
                                                                    :style="user1.isSelected ? 'border: 2px solid #3F51B5;' : ''"
                                                                    @click="user1.isSelected = !user1.isSelected"
                                                                />
                                                                <span class="text-ellipsis ml-5px user__employeename">{{ user1.Employee_Name }}</span>
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
                    <div class="border-radius-6-px  file__ascedesc-wrapper">
                        <DropDown id="filter" :bodyClass="{'file__ascedesc-dropdown z-index-10' : true}">
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
            </div>
            <div v-if="filterdAttacments.length > 0" class="files__links-content overflow-y-auto overflow-y-auto::-webkit-scrollbar p0x-15px" :style="[{maxHeight : clientWidth >767 ? 'calc(100vh - 153px)' : 'calc(100vh - 173px)'}]" @scroll="onScroll">
                <Transition>
                    <ul>
                        <TransitionGroup name="list__filelinks">
                            <li v-for="(item, index) in filterdAttacments" :key="item.id+index" class="d-flex">
                                <div class="action-spinner" v-if="item.isSpinner"></div>
                                <div class="d-flex align-items-start w-100 img-attached-wrapper" :class="[{'opacity_0_3': item.isSpinner}]" v-if='item.attachedType !== "link"'>
                                    <span v-if="item.isImage == true" class="list-attached-img">
                                        <img :src="item.attached" alt="link" :title='item.fileName'>
                                    </span>
                                    <span v-else class="files-img">
                                        <ImageIcon
                                            v-if="item.attached.includes('http')"
                                            :key="item.id + `${index}`"
                                            :src="item.attached"
                                            :alt="item.fileName"
                                            :extension="item.extension"
                                            class="files__image"
                                        />
                                        <WasabiIamgeCompp 
                                            v-else
                                            :data="{...item, url:item.attached}"
                                            @downloadUrl="(eve) => {downloadurl(eve, item)}"
                                        />
                                    </span>
                                    <div class="file-link-name">
                                        <div class="d-flex file-name">
                                            <span class="font-size-14 font-weight-500 text-ellipsis text-decoration-none w-100 d-inline-block pr-5px" :title="item.fileName">{{item.fileName}}</span>
                                            <span>{{item.size}}</span>
                                        </div>
                                        <h4 class="font-size-14 font-weight-500 m-0 gray81 pt-5px">{{item?.userDetail?.Employee_Name}}</h4>
                                        <div class="d-flex  file-link-date">
                                            <div>
                                                <img class="cursor-pointer mr-15px" src="@/assets/images/svg/downloadVector.svg" @click="downloadDocument(item.downloadUrl, item.fileName, item), item.isSpinner = true">
                                                <img v-show="item.getFrom === 'comments'" @click="highlightComment(item)" class="cursor-pointer" :src="messageReply">
                                            </div>
                                            <span v-if="!getDateAndTime(item.createTime).includes('Invalid date')" class="font-size-13 gray81 font-weight-400">
                                                    {{ getDateAndTime(item.createTime) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex align-items-start w-100 img-attached-wrapper" :class="[{'opacity_0_3': item.isSpinner}]" v-if='item.attachedType == "link"'>
                                    <span class="files-img"><img :src="linkIcon" alt="link" class="linkIconLink"></span>
                                    <div class="file-link-name">
                                        <a :href='item.attached'  :class="[{'black' : item.attachedType === 'file','blue' : item.attachedType === 'link'}]"  target=”_blank” class="font-size-14 font-weight-500 text-ellipsis text-decoration-none w-100 d-inline-block pr-5px">{{item.fileName}}</a>
                                        <h4 v-if="item.getFrom != undefined && item.getFrom !== 'description'" class="font-size-14 font-weight-500 m-0 gray81 pt-5px">{{item?.userDetail?.Employee_Name}}</h4>
                                        <h4 v-else class="font-size-14 font-weight-500 m-0 gray81 pt-5px">Description</h4>
                                        <div class="d-flex file-link-date">
                                            <div>
                                                <img v-show="item.getFrom != undefined && item.getFrom == 'comments'" class="cursor-pointer mr-15px" @click="highlightComment(item)"  :src="messageReply">
                                            </div>
                                            <span  class="font-size-13 gray81 font-weight-400">{{item.createTime ? getDateAndTime(item.createTime) : '' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </TransitionGroup>
                    </ul>
                </Transition>
            </div>
            <div class="text-center mt-5" v-else>
                No {{activeTab == 'all' ? 'links or files' : `${activeTab}`}} found
            </div>
        </div>
    </div>
</template>
<script setup>
    // Import packages
    import { computed, ref, defineProps, inject,onMounted,watch,defineEmits } from "vue";
    import { useRoute, useRouter } from 'vue-router';
    import { useStore } from "vuex";
    import {BSON} from "realm-web"

    // Components
    import InputText from '@/components/atom/InputText/InputText.vue';
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    import ImageIcon from '@/components/atom/ImageIcon/ImageIcon.vue';
    import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
    import { useProjects } from '@/composable/projects';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
    import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"

    // Utils
    import { useGetterFunctions } from '@/composable';
    import { download } from "@/utils/StorageOprations/download";
    import { dbCollections } from '@/utils/FirebaseCollections';
    const { getUser } = useGetterFunctions();
    const router = useRouter();
    const route = useRoute();
    const {getDateAndTime} = useProjects();
    const { getters } = useStore();

    // Props
    const props = defineProps({
        attachments: {
            type: Array,
            default: () => []
        },
        description: {
            type: String,
            default: ''
        },
        handleType: {
            type: String,
            default: ""
        },
        selectedData: {
            type: Object,
            default: () => {}
        },
    })

    const emit = defineEmits([
        'closeSidebar'
    ])

    // Variables
    const linkIcon = require('@/assets/images/svg/LinkIcon40.svg');
    const messageReply = require('@/assets/images/svg/messageReplay.svg');
    const clientWidth = inject("$clientWidth");
    const attachments = ref(props.attachments);
    const description = ref(props.description);
    const activeTab = ref('all');
    const search = ref('');
    const searchByUserId = ref([]);
    const timer = ref(null);
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
    const userList = ref([]);
    const userIds = ref([]);
    const toggleUsers = ref(false);
    const nextPageStartValue = ref(null);
    const resultsPerPage = ref(5);
    const hasMoreData =  ref(true);
    const attachmmentList = ref([]);

    // This functions is used to manage attachement and links data for the sidebar
    const filterdAttacments = computed(() => {
        let array = [];

        //Tabs
        if(activeTab.value == 'all') {
            array = attachmmentList.value;
        } else if(activeTab.value == 'files') {
            array = attachmmentList.value.filter((item) => {
                return item.attachedType != 'link';
            })
        } else if(activeTab.value == 'links') {
            array = attachmmentList.value.filter((item) => {
                return item.attachedType == 'link';
            })
        }

        //Search
        if(search.value) {
            array = array.filter((item) => {
                return (
                    item.fileName.toLowerCase().includes(search.value.toLowerCase())
                );
            })
        }

        //Order
        if(selectedOrder.value == '0') {
            array.sort((a, b) => {
                return a.fileName.localeCompare(b.fileName);
            })
        } else if(selectedOrder.value == '1') {
            array.sort((a, b) => {
                return b.fileName.localeCompare(a.fileName);
            })
        }

        //User
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
                    if(user.isSelected && user._id === item.userId) {
                        temp1 = true;
                    }
                });
                return temp1;
            })
        }

        return array;
    });

    // This functions is used for the filter all links from the description or comments
    const linkify = (str) => {
        let string = str;
        let result = [];
        try {
            if (str != '' && str != undefined) {
                //eslint-disable-next-line
                result = string.match(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g);
            }
            return [...new Set(result)];
        } catch (error) {
            console.error(error);
            return result;
        }
    }

    // This function is used to handle pagination data on scroll
    function paginateCollection(collection, nPerPage, startValue) {

        let query;

        if(props.handleType === "task") {
            query = [
                {
                    $match: {
                        $and: [
                            { projectId: BSON.ObjectId(props.selectedData.ProjectID) },
                            { project: false },
                            { sprintId: BSON.ObjectId(props.selectedData.sprintId)},
                            { taskId: BSON.ObjectId(props.selectedData._id)},
                            { type: { $nin: ['text'] } },
                            { ...(search.value && {mediaName: { $regex: search.value, $options: "i" }}) }
                        ]
                    }
                },
                { $sort: { mediaName: selectedOrder.value == '0' ? 1 : -1 ,_id:1 }},
                { $limit: nPerPage }
            ];
        } else if(props.handleType === "project"){
            query = [
                {
                    $match: {
                        $and: [
                            { projectId: BSON.ObjectId(props.selectedData._id) },
                            { project: true },
                            { type: { $nin: ['text'] } },
                            { ...(search.value && {mediaName: { $regex: search.value, $options: "i" }}) }
                        ]
                    }
                },
                { $sort: { mediaName: selectedOrder.value == '0' ? 1 : -1 ,_id:1 }},
                { $limit: nPerPage }
            ];
        } else if(props.handleType === "chat") {
            query = [
                {
                    $match: {
                        $and: [
                            { projectId: BSON.ObjectId(props.selectedData.ProjectID) },
                            { project: false },
                            { sprintId: BSON.ObjectId(props.selectedData.sprintId)},
                            { taskId: props.selectedData.id !== "default" ? BSON.ObjectId(props.selectedData._id) : "default" },
                            { type: { $nin: ['text'] } },
                            ...(search.value && search.value?.length ?
                                [{
                                    mediaName: {
                                        $regex: search.value,
                                        $options: "i"
                                    }
                                }]
                                :
                                []
                            )
                        ]
                    }
                },
                { $sort: { mediaName: selectedOrder.value == '0' ? 1 : -1 ,_id:1 }},
                { $limit: nPerPage }
            ];
        }

        /* If not starting from the beginning of the collection,
           only match documents greater than the previous greatest value. */
        if (startValue !== null) {
            query.unshift({
                $match: {
                    mediaName: { $gt: startValue },
                },
            });
        }

        const queryRef = mongoQuery.mongodbCrudOperations({
            type: "aggregate",
            collection: collection,
            data: [query]
        }).catch((error) => {
            console.error(`Error come in the get data from commets collection on mongoDB ${error.message}`)
        });

        return queryRef;
    }

    // This function is used to get attachments data from "comments" collections
    const fetchData = async () => {
        let collection = dbCollections.COMMENTS
        const results = await paginateCollection(
            collection,
            resultsPerPage.value,
            nextPageStartValue.value
        );

        if (results.length > 0) {

            let arrayData = [];
            results.forEach(x => {
                if(attachmmentList.value.findIndex((ele) => { return ele.id === x._id}) === -1) {
                    arrayData.push(x);
                }
            });
            if(arrayData.length > 0) {
                arrayData.forEach((x) => {
                    if(x.type !== 'link') {
                        // Find out all the files and attachments from comment data
                        let bfileSize = x.mediaSize ? x.mediaSize : 0;
                        let convertedKbSize = parseFloat(parseInt(bfileSize) / Math.pow(1024, 1)).toFixed(2) + 'KB';
                        const fileExt = x.mediaName.split('.').pop();
                        let obj = {
                            'id': x._id ? x._id : '',
                            'userId': x.userId ? x.userId : '',
                            'attached': x.mediaURL ? x.mediaURL : '',
                            'attachedType': 'file',
                            'extension': fileExt ? fileExt : '',
                            'size': convertedKbSize,
                            'fileName': x.mediaName? convertName(x) : '',
                            'createTime': x.createdAt,
                            'getFrom': 'comments',
                            ...(x.userId && {'userDetail': getUser(x.userId)}),
                            'isSpinner': false
                        }
                        attachmmentList.value.push(obj);
                    } else {
                        let attachmentsText = x.message;
                        let linkArray = linkify(attachmentsText);

                        linkArray.forEach((link) => {
                            let obj = {
                                'id': x._id ? x._id : '',
                                'userId': x.userId ? x.userId : '',
                                'attached': link,
                                'attachedType': 'link',
                                'fileName': link,
                                'createTime': x.createdAt,
                                'getFrom': 'comments',
                                ...(x.userId && {'userDetail': getUser(x.userId)}),
                                'isSpinner': false
                            };
                            attachmmentList.value.push(obj);
                        })
                    }
                })
            }

            nextPageStartValue.value = results[results.length - 1].mediaName;
        } else {
            hasMoreData.value = false;
        }
    }

    const getUserData = () => {
        try {
            userList.value = [];
            getters["users/users"].forEach((x) => {
                if(userIds.value.includes(x._id)) {
                    userList.value.push({...x, isSelected: false});
                }
            })
        } catch (error) {
            console.error(error,'FILESS');
        }
    }

    // This function is used to filter data based on type like all, files, links in sidebar
    const filterAttachments = () => {
        attachmmentList.value = [];
        userIds.value = [];

        // Filter Attachments
        if (attachments.value.length > 0) {
            attachments.value.forEach(x => {
                let bfileSize = x.size ? x.size : 0;
                let convertedKbSize = parseFloat(parseInt(bfileSize) / Math.pow(1024, 1)).toFixed(2) + 'KB';
                const segments = x.url.split('/');
                const fileName = segments[segments.length - 1];
                let obj = {
                    'id': x.id ? x.id : '',
                    'userId': x.userId ? x.userId : '',
                    'attached': x.url ? x.url : '',
                    'attachedType': 'file',
                    'extension': x.extension ? x.extension : '',
                    'size': convertedKbSize,
                    'fileName': fileName ? fileName : '',
                    'createTime': x.createdAt,
                    'getFrom': 'attachment',
                    'userDetail': getUser(x.userId),
                    'isSpinner': false,
                    'downloadUrl': x.downloadUrl
                };
                attachmmentList.value.push(obj);
                userIds.value.push(x.userId);
            });
        }

        // Filter Description Links
        if (description.value) {
            let attachmentsText = description.value ? description.value : '';
            let linkArray = linkify(attachmentsText);

            linkArray.forEach((link) => {
                let obj = {
                    'id': String(Math.round(Date.now() * Math.random() * 1000)),
                    'attached': link,
                    'attachedType': 'link',
                    'fileName': link,
                    'getFrom': 'description',
                    'isSpinner': false
                };
                attachmmentList.value.push(obj);
            });
        }
    };

    // This function is used to redirect selected comment either it is for task or project
    const highlightComment = (data) => {
        let query = {};
        if(props.handleType === "task") {
            if(data.getFrom == 'comments') {
                query.detailTab = "comment"
            } else {
                query.detailTab = "task-detail-tab"
            }
        } else if(props.handleType === "project") {
            if(data.getFrom == 'comments') {
                query.tab = "Comments"
            } else {
                query.tab = "ProjectDetail"
            }
        }
        emit('closeSidebar',false);
        router.replace({ name: route.value, params: {...route.params}, query, hash: `#${data.id}` });
    }

    // This function is used download seleted document
    const downloadDocument = (url, name, obj) => {
        let downloadurl = url.includes('http') ? url : obj.downloadUrl;
        download(downloadurl, name)
        .then(() => obj.isSpinner = false)
        .catch((error) => { 
            console.error(error);
            obj.isSpinner = false;
        });
    }

    onMounted(()=>{
        filterAttachments();
        getUserData();
        fetchData();
    })

    watch(activeTab, (val) => {
        searchByUserId.value  = [];
        userList.value = userList.value.map((x)=>{ return x.isSelected = false })
        search.value = ''
        if(val == 'files') {
            let filterUserArray = attachmmentList.value.filter((e)=>{return (e.attachedType === 'file' && e.getFrom !== "comments" && e.getFrom !== "description")}).map((ele)=>{
                return ele.userId
            })
            userList.value = userList.value.filter((ele)=>{
                return filterUserArray.indexOf(ele._id) !== -1
            })
            let tmp = Array.from(new Set([...(filterUserArray || [])]))
            if(tmp.length > 0) {
                tmp.forEach(x=>{
                    if(x) {
                        let userIndex = userList.value.findIndex((user) => {
                            return user._id === x;
                        });
                        if(userIndex === -1)
                            userList.value.push({...getUser(x), isSelected: false, from:'comments'});
                    }
                })
            }
        } else if(val == 'links') {
            let filterUserArray = attachmmentList.value.filter((e)=>{return (e.attachedType === 'link' && e.getFrom !== "comments" && e.getFrom !== "description")}).map((ele)=>{
                return ele.userId
            })
            userList.value = userList.value.filter((ele)=>{
                return filterUserArray.indexOf(ele._id) !== -1
            })
            let tmp = Array.from(new Set([...(filterUserArray || [])]))
            tmp.forEach(x=>{
                if(x) {
                    let userIndex = userList.value.findIndex((user) => {
                        return user._id === x;
                    });
                    if(userIndex === -1)
                        userList.value.push({...getUser(x), isSelected: false,from:'comments'});
                }
            })
        } else {
            let filterUserArray = attachmmentList.value.filter((e)=>{return e.getFrom !== "description"}).map((ele)=>{
                return ele.userId
            })
            userList.value = userList.value.filter((ele)=>{
                return filterUserArray.indexOf(ele._id) !== -1
            })
            let tmp = Array.from(new Set([...(filterUserArray || [])]))
            tmp.forEach((x) => {
                if(x) {
                    let userIndex = userList.value.findIndex((user) => {
                        return user._id === x;
                    });
                    if(userIndex === -1)
                        userList.value.push({...getUser(x), isSelected: false, from:'comments'});
                }
            })
        }
    })

    // This function is used to filter data based on selected user on sidebar
    const getDataWithUserFilter = () => {
        try {
            searchByUserId.value = userList.value.filter((e) => { return e.isSelected === true}).map((e) => { return e._id });
        } catch (error) {
            console.error(error);
        }
    }

    // This function is used to sort list ASC ot DESC order in sidebar
    const changesOrderOfSorting = () => {
        try {
            if(selectedOrder.value === oldOrder.value) {
                return
            }
        } catch (error) {
            console.error(error);
        }
    }

    // This function is used to get comments data from on scroll
    let previousScrollTop = 0;
    const onScroll = (e) => {
        const currentScrollTop = e.target.scrollTop;

        debouncer(50).then(() => {
            // Check if it's a scroll down event and if the scroll is at the very bottom
            if (currentScrollTop > previousScrollTop && 
                currentScrollTop + e.target.clientHeight >= e.target.scrollHeight) {
                    fetchData();
            }
            // Update the previousScrollTop value
            previousScrollTop = currentScrollTop;
        });
    }

    // Manage debounce event
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

    // This function is used to set download URL to the pericular selected file
    function downloadurl (e, item) {
        attachments.value.downloadUrl = e;
        item.downloadUrl = e;
    }

    // This function is used to convert new name to original name for comments collection data
    const convertName = (name) => {
        if(name?.mediaOriginalName) {
            return name.mediaOriginalName;
        }
        const parts = name.mediaName.split('_');
        if (parts.length < 2) {
            return parts[0];
        }
        return parts.slice(1).join('_');
    };

    // Fatch data based on search result
    const onInput = () => {
        debouncer(500).then(() => {
            fetchData()
        })
    }
</script>
<style src="./style.css"></style>