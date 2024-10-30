<!--
    File Name: TaskFilter.vue
    Created By: Parth Detroja
-->
<template>
    <div class="bg-white d-flex align-items-center position-re border-radius-6-px" :class="{'mr-15' : clientWidth > 767 , 'mr-010' : clientWidth <= 767}">
        <DropDown maxHeight="47dvh" :bodyClass="{'main-filter-dropdown-wrapper' : true}">
            <template #head>
                <div class="d-flex align-items-center justify-content-between filter-title" v-if="clientWidth <= 767">
                    <h3 class="m-0">Filters</h3>
                    <div class="filter-info d-flex">
                        <a href="https://help.alianhub.com/" target="_blank">
                            <img src="@/assets/images/svg/info_icon.svg" alt="info icon" class="mr-5px"/>
                            Learn more about filters
                        </a>
                    </div>
                </div>
            </template>
            <template #button>
                <div class="top-filter-section">
                    <img :src="editIcon" id="projectviewfilter_driver" alt="TaskFilter" class="task-filter-icon cursor-pointer" ref="closeFilterRef"/>
                    <span v-if="isApplyed" class="task-filter-count">{{inputs.length}}</span>
                    <img v-if="isApplyed" src="@/assets/images/svg/deletered.svg" alt="close" class="task-filter-close cursor-pointer" @click.stop.prevent="clearFilter"/>
                </div>
            </template>
            <template #options>
                <div class="bottom-filter-section bg-white" >
                    <div class="d-flex justify-content-between w-100 mb-13px" v-if="clientWidth > 767">
                        <div class="filter-title">
                            <h2 class="m-0 font-size-18 text-capitalize">{{ isEdit === true ? selectedRow.name : "Filters"}}</h2>
                        </div>
                        <div class="filter-info d-flex">
                            <a href="https://help.alianhub.com/" target="_blank">
                                <img src="@/assets/images/svg/info_icon.svg" alt="info icon" class="mr-5px"/>
                                Learn more about filters
                            </a>
                        </div>
                    </div>
                    <div v-if="!isValidate" role="alert" aria-live="polite" aria-atomic="true" class="alert alert-danger font-size-13">Please select all valid options</div>
                    <div class="table-data">
                        <FieldsTable
                            :inputs="inputs"
                            :statusArray="statusArray"
                            :taskTypeArray="taskTypeArray"
                            :priorities="prioritiesArray"
                            :tagsArray="tagsArray"
                            :users="users"
                            :mainOptions="keysArray"
                            @delete="deleteRow"
                        />
                    </div>
                    <div class="d-flex w-100 add-filter-wrapper">
                        <div class="add-section mb-13px" :class="{'d-flex justify-content-between w-100' : clientWidth <= 767}" v-if="keysArray.length">
                            <span><a href="#" class="mr-10px"  @click.stop.prevent="clearFilter($event), $refs.closeFilterRef.click()" v-if="clientWidth <= 767" :class="{'font-weight-500 font-size-18' : clientWidth <=767}">Clear all</a></span>
                            <a href="#" class="blue" @click.stop.prevent="addRow" :class="{'font-weight-400 font-size-12' : clientWidth > 767 , 'font-weight-500 font-size-18' : clientWidth <= 767}">+ Add Filter</a>
                        </div>
                    </div>
                    <FieldsActions
                        :filters="filters"
                        :isInvalid="isInvalid"
                        :isEdit="isEdit"
                        @save="saveFilter"
                        @update="updateFilter"
                        @delete="deleteFilter"
                        @apply="applyFilter"
                        @clear="clearFilter($event), $refs.closeFilterRef.click()"
                        :getFiltersData="getFiltersData"
                        :handleUpdate="handleUpdate"
                    />
                </div>
            </template>
        </DropDown>
        <ConfirmModal
            :modelValue="isConfirm"
            acceptButtonText="Confirm"
            cancelButtonText="Cancel"
            :header="true"
            :showCloseIcon="false"
            @accept="handleConfirm"
            @close="isConfirm = false"
        >
            <template #header>
                <h3 class="m-0">Confirm</h3>
            </template>
            <template #body>
                <span>Are you sure want to delete?</span>
            </template>
        </ConfirmModal>
    </div>
</template>
<script setup>
// Packages
import moment from 'moment';
import { useStore } from "vuex";
import { useToast } from 'vue-toast-notification';
import { ref, onMounted, defineProps, computed, watch, defineEmits, inject, nextTick } from 'vue';

// Components
import * as env from '@/config/env';
import { useGetterFunctions } from "@/composable";
import ConfirmModal from '@/components/atom/Modal/Modal.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import FieldsTable from '@/components/molecules/TaskFilter/FieldsTable.vue';
import FieldsActions from '@/components/molecules/TaskFilter/FieldsActions.vue';
import { settingsCollectionDocs } from '@/utils/FirebaseCollections';
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';
import { apiRequest } from '../../../services';

// Utils
const { getUser } = useGetterFunctions();
const { getters } = useStore();
const priorities = computed(() => getters["settings/companyPriority"]);
const $toast = useToast();
const companyOwner = computed(() => getters["settings/companyOwnerDetail"]);

// Props
const props = defineProps({
    projectData: {
        type: Object,
        default: () => {}
    }
})

// Emites
const emits = defineEmits(["apply","clear"]);

// Watch on project data update
watch(() => props.projectData, (newVal, oldVal) => {
    if(JSON.stringify(newVal._id) !== JSON.stringify(oldVal._id)) {
        getFiltersData();
        clearFilter();
    }
});

// Images
const editIcon = require("@/assets/images/svg/TaskFilter.svg");
//Variables
const clientWidth = inject("$clientWidth");
const companyId = inject('$companyId');
const userId = inject('$userId');
const isEdit = ref(false);
const isApplyed = ref(false);
const isValidate = ref(true);
const inputs = ref([]);
const isConfirm = ref(false);
const isInvalid = ref(false);
const selectedRow = ref({});
const filters = ref([]);
const closeFilterRef = ref();
const mainOptions = ref([
    { value: 'statusKey', name: "Status",type:'array',filterOn:'statusKey' },
    { value: 'DueDate', name: "Due Date",type:'date',filterOn:'DueDate' } ,
    { value: 'Task_Priority', name: "Priority",type:'array',filterOn:'Task_Priority' },
    { value: 'Task_Leader', name: "Created by",type:'array',filterOn:'Task_Leader' },
    { value: 'TaskTypeKey', name: "Task Type",type:'array',filterOn:'TaskTypeKey' },
    { value: 'tagsArray', name: "Tags",type:'array',filterOn:'tagsArray' }
]);
const keysArray = computed(() => {
    return mainOptions.value.filter(option => {
        if(!inputs.value.some(input => input.name.value === option.value)) {
            return option;
        }
    });
});
const users = computed(() => {
    return props.projectData?.AssigneeUserId?.map((x) => {
        const user = getUser(x);
        return {
            finalValue: x,
            value: x,
            name: user.Employee_Name,
            image: user.Employee_profileImage,
            isOnline: user.isOnline
        }
    }).filter((x) => !getUser(x.value).ghostUser)
});
const statusArray = computed(() => {
    return props.projectData?.taskStatusData?.map((x) => {
        return { ...x, finalValue: x.key }
    })
});
const taskTypeArray = computed(() => {
    return props.projectData?.taskTypeCounts?.map((x) => {
        return { ...x, finalValue: x.key }
    })
});
const tagsArray = computed(() => {
    return props.projectData?.tagsArray?.map((x) => {
        return { ...x, finalValue: x.uid, name: x.tagName }
    })
});
const prioritiesArray = computed(() => {
    return priorities?.value.map((x) => {
        return { ...x, finalValue: x.value}
    })
});
function getUserData() {
    const user = getUser(userId.value);
    return {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: companyOwner.value.id,
    };
}
const userData = getUserData();

// Mounted
onMounted(() => {
    addRow();
    getFiltersData();
});

/**
 * Get saved filter data from database
 */
const getFiltersData = () => {
    setTimeout(async () => {
        let queryObj = [
            {
                userId:userId.value,
                filter:'taskFilter',
                typeFilter:'projectTask'
            }
        ];
        const queryUpdate = {
            type: "find",
            collection: settingsCollectionDocs.GLOBALFILTER,
            data: queryObj
        };
        mongodbCrudOperations(queryUpdate).then((res) => {
            filters.value = [];
            if(res && res?.length){
                res.forEach((doc) => {
                    filters.value.push({...doc, isEdit: false});
                });
            }
        }).catch((err)=>{
            console.error("ERROR",err);
        });
    }, 2000);
}

/**
 * This function is used to manage all the checklist hostory for the project and tasks
 * @param {*} type 
 * @param {*} key 
 * @param {*} message 
 */
const manageHistory = async (type, key, message) => {
    const axiosData = {
        "type": type,
        "companyId": companyId.value,
        "projectId": props.projectData.id,
        "taskId": null,
        "object": {
            "sprintId": null,
            "key": key,
            "message": message
        },
        "userData": getUserData()
    };
    await apiRequest("post", env.HANDLE_HISTORY, axiosData).then((result) => {
        if(result.data.status) {
            console.info(result.data.statusText)
        }
    });
}

/**
 * This function is used for the handle update event
 * @param {*} obj 
 */
const handleUpdate = async (obj) => {
    let queryObj = [];
    if(obj?.name){
        queryObj = [
            { _id: BSON.ObjectID(obj.id) },
            { $set:{name:obj.name} },
            true,
            false
        ];
    }else{
        queryObj = [
            { _id: BSON.ObjectID(obj.id) },
            { $set:{filters:obj.filters} },
            true,
            false
        ];
    }
    const queryUpdate = {
        type: "updateOne",
        collection: settingsCollectionDocs.GLOBALFILTER,
        data: queryObj
    };
    mongodbCrudOperations(queryUpdate).then(()=>{
        getFiltersData();
        $toast.success("Filter updated successfully.",{position: 'top-right'});
        // Filter history
        const msg =  `<b>${userData.Employee_Name}</b> has been updated <b>${selectedRow.value.name}</b> filter`;
        manageHistory('project', "Project_Filter", msg);
    }).catch((error) => {
        console.error("ERROR in delete: ", error.message);
    });
}

/**
 * This is a callback function which is used to manage mulitple array based on type. It return data based on used
 * @param {String} type 
 */
 const manageArray = (type) => {
    let arrayData = [];
    if(type === "statusKey") {
        arrayData = statusArray;
    } else if (type === "Task_Priority") {
        arrayData = prioritiesArray;
    } else if (type === "TaskTypeKey") {
        arrayData = taskTypeArray;
    } else if (type === "Task_Leader") {
        arrayData = users;
    } else if (type === "tagsArray") {
        arrayData = tagsArray;
    }
    return arrayData;
}

/**
 * Populate the value in comparision array based on key
 * @param {String} key 
 */
const manageComparisonArray = (key) => {
    const arraykeys = ["statusKey", "Task_Priority", "Task_Leader", "TaskTypeKey", "tagsArray"];
    const dateKeys = ["DueDate"];
    let arrayData = [];
    if(arraykeys.includes(key)) {
        arrayData = [
            { value: ':', name: "Is" }
        ]
    } else if(dateKeys.includes(key)) {
        arrayData = [
            { value: ':>', name: "Greater Than" },
            { value: ':<', name: "Less Than" },
            { value: ':=', name: "Equal To" }
        ]
    }
    return arrayData;
}

/**
 * This function is used to validate each fields in the tables
 */
const validateItems = () => {
    let isValid = true; // Assume the array is valid initially

    inputs.value.forEach(item => {
        item.isValidate = true;

        if (typeof item.name !== "object" || Object.keys(item.name).length === 0) {
            item.isValidate = false;
        }
        if (typeof item.comparison !== "object" || Object.keys(item.comparison).length === 0) {
            item.isValidate = false;
        }
        if (item.name.value === "DueDate") {
            if (item.date === "") {
                item.isValidate = false;
            }
        } else {
            if (!Array.isArray(item.values) || item.values.length === 0) {
                item.isValidate = false;
            }
        }
        if (item.isValidate === false) {
            isValid = false;
        }
    });
    return isValid;
}

/**
 * This function is used to add new row
 */
const addRow = () => {
    if(!validateItems()) {
        isValidate.value = false;
        return;
    }

    isValidate.value = true;
    const obj = {
        name: {},
        comparison: {},
        values: [],
        condition: inputs.value.length > 0 ? inputs.value[0].condition : "&&",
        date: "",
        isAllChecked: false,
        isValidate: true,
        displayData: [],
        comparisonsData: [],
    }
    inputs.value.push(obj);

    nextTick(() => {
        if(inputs.value.length > 5) {
            const el = document.querySelector(`#num-${inputs.value.length - 1}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: "end" });
            }
        }
    })
}

/**
 * This function is used to delete perticuler row for the filters
 * @param {*} index 
 */
const deleteRow = (row) => {
    inputs.value.splice(row.index, 1);
}

/**
 * This function is used to apply filter on the seleted query and get result from the mongo
 */
const applyFilter = (data) => {

    isValidate.value = true;
    let filterBy = {};
    let queries = [];

    if(data.type === "saved") {
        inputs.value = [];
        isEdit.value = true;
        selectedRow.value = data.item;
        queries = JSON.parse(JSON.stringify(data.item.filters));
        queries.map(x => x.comparisonsData = manageComparisonArray(x.name.value));
        queries.map(x => x.displayData = x.name.value !== "DueDate" ? manageArray(x.name.value).value.filter(v => x.values.includes(v.finalValue)) : []);
        nextTick(() => {
            inputs.value = queries
        });
    } else {
        if(!validateItems()) {
            isValidate.value = false;
            return;
        }
        queries = JSON.parse(JSON.stringify(inputs.value));
    }
    
    queries.forEach((query) => {
        const queryField = query.name.value;
        const comparison = query.comparison.value;
        const condition = query.condition === '||' ? '$or' : '$and';
        const filterOn = query.name.filterOn;
        if(filterBy[condition] === undefined){
            filterBy[condition] = [];
        }
        if(query.name.type === "arrayOfObject"){
            filterBy[condition].push({[queryField]:{$elemMatch: {[filterOn]:{ $in: query.values }}}}) 
        } else if(query.name.type === "object"){
            const filteField = `${queryField}.${filterOn}`;
            filterBy[condition].push({[filteField]: {$in: query.values}});
        } else if(query.name.type === "string" || query.name.type === "array"){
            filterBy[condition].push({[filterOn]: {$in: query.values}});
        } else if(query.name.type === "date") {
            const date = new Date(query.date);
            const now = moment(new Date(query.date));
            const nextDate = new Date(now.endOf('day'));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            if(comparison === ':=') {
                const startDate = new Date(query.date).setHours(0,0,0,0);
                const endDate = new Date(query.date).setHours(23,59,59,59);
                filterBy[condition].push({[filterOn]:{$gte: new Date(startDate),$lte: new Date(endDate)}});
            } else if(comparison === ':>') {
                filterBy[condition].push({[filterOn]: {$gt: new Date(nextDate)}});
            } else {
                filterBy[condition].push({[filterOn]: {$lt: new Date(date)}});
            }
        } else if(query.name.type === "dateNumber"){
            const date = new Date(query.date);
            const now = moment(new Date(query.date));
            const nextDate = new Date(now.endOf('day'));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            if(comparison === ':=') {
                const startDate = new Date(query.date).setHours(0,0,0,0);
                const endDate = new Date(query.date).setHours(23,59,59,59);
                filterBy[condition].push({[filterOn]:{$gte: new Date(startDate).getTime() / 1000,$lte: new Date(endDate).getTime() / 1000}});
            } else if(comparison === ':>') {
                filterBy[condition].push({[filterOn]: {$gt: new Date(nextDate).getTime() / 1000}});
            } else {
                filterBy[condition].push({[filterOn]: {$lt: new Date(date).getTime() / 1000}});
            }
        } else {
            filterBy = {...filterBy}
        }
    });
    emits('apply', filterBy);
    isApplyed.value = true;
    closeFilterRef.value.click();
}

/**
 * This function is used to clear all the selected filters and close it
 */
const clearFilter = () => {
    inputs.value = [];
    addRow();
    emits('clear', true);
    isValidate.value = true;
    isEdit.value = false;
    isApplyed.value = false;
}

/**
 * This function is used to save the filter to the database
 */
const saveFilter = async (inputName) => {
    if(inputName === "") {
        isInvalid.value = true;
        return;
    } else {
        if(!validateItems()) {
            isValidate.value = false;
            return;
        }
    }
    isValidate.value = true;
    isInvalid.value = false;
    const arr = JSON.parse(JSON.stringify(inputs.value));
    arr.forEach((key) => {
        delete key.displayData;
        delete key.isValidate;
        delete key.comparisonsData;
    });

    let data = {
        name: inputName,
        filters: arr,
        userId:userId.value,
        companyId:companyId.value,
        typeFilter:'projectTask',
        filter:'taskFilter',
        updatedAt:new Date(),
        createdAt:new Date()
    }
    let queryObj = [
        {...data}
    ];
    const queryUpdate = {
        type: "insertOne",
        collection: settingsCollectionDocs.GLOBALFILTER,
        data: queryObj
    };
    mongodbCrudOperations(queryUpdate)
    .then(() => {
        getFiltersData();
        $toast.success("Filter saved successfully.",{position: 'top-right'});
        // Filter history
        const msg =  `<b>${userData.Employee_Name}</b> has created new <b>${inputName}</b> filter`;
        manageHistory('project', "Project_Filter", msg);
    }).catch((error) => {
        console.error("ERROR in delete: ", error);
    });
}

/**
 * This function is used to update selected filter to the database
 */
const updateFilter = async () => {
    // Validate if any field is blank or not
    if(!validateItems()) {
        isValidate.value = false;
        return;
    }
    isValidate.value = true;
    const arr = JSON.parse(JSON.stringify(inputs.value));
    arr.forEach((key) => {
        delete key.displayData;
        delete key.isValidate;
        delete key.comparisonsData;
    });

    const obj = { filters: arr, id: selectedRow.value._id};
    await handleUpdate(obj);
}

/**
 * This function is used to delete selected the filter to the database
 */
const deleteFilter = (row) => {
    isConfirm.value = true;
    selectedRow.value = row;
}
const handleConfirm = (val) => {
    if (val) {
        const obj = [
            {
                _id: BSON.ObjectID(selectedRow.value._id)
            }
        ];
        const query = {
            type: "deleteOne",
            collection: settingsCollectionDocs.GLOBALFILTER,
            data: obj
        };
        mongodbCrudOperations(query)
        .then(() => {
            // Remove row from local array
            const index = filters.value.findIndex(x => x._id === selectedRow.value._id);
            if (index !== -1) {
                filters.value.splice(index, 1);
            }
            $toast.success("Filter deleted successfully.", { position: 'top-right' });
            // Filter history
            const msg = `<b>${userData.Employee_Name}</b> has been deleted <b>${selectedRow.value.name}</b> filter`;
            manageHistory('project', "Project_Filter", msg);
            isConfirm.value = false;
        })
        .catch((error) => { console.error("ERROR", error); });
    }
}
</script>
<style> @import "./style.css"; </style>