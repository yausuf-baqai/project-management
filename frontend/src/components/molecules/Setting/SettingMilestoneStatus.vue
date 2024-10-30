<template>
    <SpinnerComp :is-spinner="isSpinner" />
    <div>
        <h2 class="task_priority_wrapper_value">Project Milestone Status</h2>
        <div class="mySettingSection priorityWrapper">
            <div>
                <form class="pb-30px" v-if="props.editPermission ==true">
                    <div class="d-flex wrapper_setting" >
                        <div class="wrapper_milestone">
                            <h3 class="date_milestone">Milestone Status Name</h3>
                            <div
                                class="vs-component vs-con-input-label vs-input inputx inputx_milestone_status vs-input-primary">
                                <div class="vs-con-input">
                                    <div class="color_picker">
                                        <input type="color" v-model="formData.colorvalue"
                                            class="vs-inputx vs-input--input normal hasValue cursor-pointer"/>
                                    </div>
                                    <InputText type="text" class="vs-inputx vs-input--input normal milestone__value-input" 
                                        placeholder="Enter Milestone Status" v-model.trim="formData.milestone_status.value"
                                        @keyup="checkErrors({
                                                'field': formData.milestone_status,
                                                'name': formData.milestone_status.name,
                                                'validations': formData.milestone_status.rules,
                                                'type': formData.milestone_status.type,
                                                'event': $event.event,
                                            })" />
                                    <div class="invalid-feedback red Milestone_invalid">{{ formData.milestone_status.error }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="date_value_displayed">
                            <h3 class="date_milestone">Date Displayed in Calendar</h3>
                            <div class="d-flex">
                                <div class="form-group-milestone">
                                    <input type="checkbox" id="pastdate" class="input_checkbox"
                                        @click="isPast = !isPast" />
                                    <label class="past_future mr-20px" for="pastdate">Past</label>
                                </div>
                                <div class="form-group-milestone">
                                    <input type="checkbox" class="input_checkbox" id="futuredate"
                                        @click="isFuture = !isFuture" />
                                    <label for="futuredate" class="past_future">Future</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex">
                        <button type="button" class="blue_btn" id="blue_btn" @click="saveData">Save</button>
                        <button type="button" name="button"
                            class="vs-component vs-button white_btn vs-button-primary vs-button-filled" @click="cancel()">
                            Cancel
                        </button>
                    </div>
                </form>
                <div class="milestone-table-overflow milestone_status_button_wrapper">
                    <table class="milestone_wrapper_table">
                        <thead>
                            <tr>
                                <th class="pl-30px">Milestone Status Name</th>
                                <th>Date Displayed in Calendar</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in arrayobject" :key="index">
                                <td>
                                    <div class="d-flex color_box_main pl-20px">
                                        <span class="color_box" :style="{ backgroundColor: item.backgroundColor }"></span>
                                        <span class="overflow-auto style-scroll w-100"> {{ item.name }}</span>
                                    </div>
                                </td>
                                <td>
                                    <span>
                                        {{ item.isPast === false && item.isFuture === false ? '-' : '' }} 
                                        {{ item.isPast === true ? 'Past' : '' }} 
                                        {{ item.isFuture === true && item.isPast === true ? ',' : '' }} 
                                        {{ item.isFuture === true ? 'Future' : '' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex Rename_Delete_wrapper justify-content-end" id="modelComponent0">
                                        <DropDown class="mr-1" v-if="!item.isDefault && props.editPermission ==true">
                                            <template #button>
                                                <img :src=addIcon alt="addIconmilestoneSvg" class="cursor-pointer" :ref="item.value">
                                            </template>
                                            <template #options>
                                                <DropDownOption @click="$refs[item.value][0].click(), EditData(index)">
                                                    <img :src='renameicon' alt="Editmilestone">
                                                    <label class="dropRename">Rename</label>
                                                </DropDownOption>
                                                <DropDownOption @click="$refs[item.value][0].click(), deletetask(index)" v-if="item.isCount == 0">
                                                    <img :src='deleteicon' alt="Deletemilestone">
                                                    <label class="dropDelete">Delete</label>
                                                </DropDownOption>
                                            </template>
                                        </DropDown>
                                    </div>
                                </td>
                            </tr>
                            <ConfirmModal
                                :modelValue="showConfirmModal"
                                acceptButtonText="Confirm"
                                cancelButtonText="Cancel"
                                maxlength="150"
                                :header="true"
                                :showCloseIcon="false"
                                @accept="DeleteData"
                                @close="showConfirmModal = false"
                            >
                                <template #header>
                                    <h3 class="m-0">Confirm</h3>
                                </template>
                                <template #body>
                                    <span>Are you sure want to delete?</span>
                                </template>
                            </ConfirmModal>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    //import
    import { useStore } from "vuex";
    import { useToast } from 'vue-toast-notification';
    import { useValidation } from "@/composable/Validation.js";
    import ConfirmModal from '@/components/atom/Modal/Modal.vue';
    import InputText from "@/components/atom/InputText/InputText.vue";
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
    import { dbCollections, settingsCollectionDocs } from "@/utils/FirebaseCollections";
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
    import { ref, computed, watchEffect, defineComponent, onMounted ,defineProps} from "vue";

    const $toast = useToast();
    const { getters } = useStore();
    const { checkErrors } = useValidation();
    // variable
    const isPast = ref(false);
    const rename = ref(false);
    const valueindex = ref('');
    const selectedvalue=ref('');
    const isFuture = ref(false);
    const arrayobject = ref([]);
    const isSpinner = ref(false);
    const showConfirmModal = ref(false);
    const formData = ref({
        milestone_status: {
            value: "",
            rules:
                "required | min:3",
            name: "milestone status",
            error: "",
        },
        colorvalue: '#818181'
    });
    //computed
    const status = computed(() => getters['settings/projectMilestoneStatus']);
    // image
    const renameicon = require("@/assets/images/editmilestone.png");
    const deleteicon = require("@/assets/images/Deletemilestone.png");
    const addIcon = require("@/assets/images/svg/addIconmilestoneSvg.svg");

    defineComponent({
        name: 'Milestone-Status',
        components: {
            DropDown,
            DropDownOption,
            InputText,
            SpinnerComp
        }
    })
    // props
    const props = defineProps({
        editPermission: {
            type: [Boolean],
            default: false
        }
    })
    // onMounted
    onMounted(() => {
        arrayobject.value = status.value
    });

    watchEffect(() => {
        arrayobject.value = status.value.map((x) => ({ ...x, value: x.value, name: x.name, backgroundColor: x.backgroundColor, isFuture: x.isFuture, isPast: x.isPast, isDeleted: x.isDeleted, milestoneStatusDate: x.milestoneStatusDate ,isDefault: x.isDefault ,isCount:x.isCount}));
    });

    /// UPDATE DATA IN DATABASE  ////
    function saveData() {
        if (formData.value.colorvalue === '#ffffff' || formData.value.colorvalue === '#fff') {
            formData.value.milestone_status.error = 'white color are not allow please select a valid color'
            return formData.value.colorvalue = '#818181'

        }
        if (formData.value.milestone_status.value == '') {
            formData.value.milestone_status.error = ('The milestone status field is required')
            return
        }
        if (formData.value.milestone_status.value.length < 3) {
            formData.value.milestone_status.error =('The milestone status field must be at least 3 characters');
            return
        }

        if (rename.value == false) {
            const nameExists = arrayobject.value.some((item) => {
                return item.name.replaceAll(" ","").toLowerCase() === formData.value.milestone_status.value.replaceAll(" ","").toLowerCase();
            });

            if (nameExists) {
                formData.value.milestone_status.error = ('Name already exists')
                return
            }
            isSpinner.value = true;

            let obj = {
                name: formData.value.milestone_status.value, milestoneStatusDate: new Date(), backgroundColor: formData.value.colorvalue,
                isFuture: isFuture.value, isPast: isPast.value, isDeleted: true, value: Math.random().toString(36).substring(2, 15),isDefault:false,isCount:0
            }

            arrayobject.value.push(obj);
            let queryObj = [
                { 'name': settingsCollectionDocs.PROJECT_MILESTONE_STATUS },
                {$push: {settings: {...obj}}}
            ];
            const queryUpdate = {
                type: "updateOne",
                collection: dbCollections.SETTINGS,
                data: queryObj
            };
            /*
                - Locate documents in the "settings" collection find the "name" field with "milestone_status."
                - Within these documents, add the object in the "settings" array.
            */
            mongoQuery.mongodbCrudOperations(queryUpdate)
            .then(() => {
                isSpinner.value = false;
                $toast.success("Project milestone status updated successfully.", { position: 'top-right' });
            }).catch((error)=>{
                $toast.error('Some thing went wrong', { position: 'top-right' });
                console.error("ERROR in updated project milestone status  ", error);
            });
        }
        else {
            if(arrayobject.value[valueindex.value].name == formData.value.milestone_status.value &&
                arrayobject.value[valueindex.value].backgroundColor == formData.value.colorvalue &&
                arrayobject.value[valueindex.value].isFuture == isFuture.value &&
                arrayobject.value[valueindex.value].isPast == isPast.value){
                    return $toast.error('Nothing To Update', { position: 'top-right' });
            }
            let sIndex = arrayobject.value.findIndex((elem) => {
                return (elem.name.replaceAll(" ","").toLowerCase() == formData.value.milestone_status.value.replaceAll(" ","").toLowerCase() && elem.value !== arrayobject.value[valueindex.value].value)
            })

            if (sIndex <= -1) {
                arrayobject.value[valueindex.value].name = formData.value.milestone_status.value;
                arrayobject.value[valueindex.value].backgroundColor = formData.value.colorvalue;
                arrayobject.value[valueindex.value].isFuture = isFuture.value;
                arrayobject.value[valueindex.value].isPast = isPast.value;
                let queryObj = [
                    { 'name': settingsCollectionDocs.PROJECT_MILESTONE_STATUS },
                    {$set: {'settings.$[elementIndex]':arrayobject.value[valueindex.value] }},
                    {arrayFilters: [{ "elementIndex.value": arrayobject.value[valueindex.value].value }]}
                ];
                const queryUpdate = {
                    type: "updateOne",
                    collection: dbCollections.SETTINGS,
                    data: queryObj
                };
                /*
                    - Locate documents in the "settings" collection find the "name" field with "milestone_status."
                    - Within these documents, search for an object in the "settings" array.
                    - If an object in the "settings" array matches a particular value, then update the object.
                */
                mongoQuery.mongodbCrudOperations(queryUpdate).then(()=>{
                    isSpinner.value = false;
                    $toast.success('Project milestone status updated successfully.', { position: 'top-right' });
                }).catch((error) => {
                    $toast.error('Something went wrong', { position: 'top-right' });
                    console.error('ERROR:', error);
                });
            } else {
                formData.value.milestone_status.error = ('Name already exists')
                return;
            }
        }

        formData.value.milestone_status.value = ''
        isFuture.value = false
        isPast.value = false
        document.getElementById("pastdate").checked = false;
        document.getElementById("futuredate").checked = false;
        rename.value = false;
        formData.value.colorvalue='#818181'
    }

    /// Edited milestone status field function ////
    function EditData(index) {
        const obj = arrayobject.value[index]
        valueindex.value = index
        formData.value.milestone_status.value = obj.name
        formData.value.colorvalue = obj.backgroundColor
        isFuture.value = obj.isFuture
        isPast.value = obj.isPast
        document.getElementById("pastdate").checked = isPast.value;
        document.getElementById("futuredate").checked = isFuture.value;
        rename.value = true;

    }
    // All Fields Are Empty //
    function cancel() {
        formData.value.milestone_status.value = ''
        isFuture.value = false
        isPast.value = false
        document.getElementById("pastdate").checked = false;
        document.getElementById("futuredate").checked = false;
        rename.value = false;
        formData.value.milestone_status.error = ''
        formData.value.colorvalue='#818181'
    }
    // Delete Selected Status //
    function deletetask(index){
        showConfirmModal.value = true;
        selectedvalue.value =index
    }
    // Delete milestoneStatus
    function DeleteData() {
        isSpinner.value = true;
        let queryObj = [
            { 'name': settingsCollectionDocs.PROJECT_MILESTONE_STATUS },
            { $pull: { settings: {value:arrayobject.value[selectedvalue.value].value} } },
            true,
            false
        ];
        const queryUpdate = {
            type: "updateOne",
            collection: dbCollections.SETTINGS,
            data: queryObj
        };
        /* 
            - Locate documents in the "settings" collection find the "name" field with "milestone_status."
            - Within these documents, search for an object in the "settings" array.
            - If an object in the "settings" array matches a particular value, that object is deleted.
        */
        mongoQuery.mongodbCrudOperations(queryUpdate).then(()=>{
            isSpinner.value = false;
            $toast.success("Project milestone status Deleted successfully.", { position: 'top-right' });
            showConfirmModal.value = false;
        }).catch((error) => {
            $toast.error('Some thing went wrong', { position: 'top-right' });
            console.error("ERROR in delete project milestone status  ", error);
        });
    }
</script>

<style scoped>
@import './style.css';
.style-scroll::-webkit-scrollbar {
    height: 4px;
}
.input__color-value{
    height: 25px !important;
}
.milestone__value-input{
    width:264px !important;
}
</style>