<template>
<div class="position-re mySettingsWrapper p-1">
    <SpinnerComp :is-spinner="isSpinner" />
    <div class="my-settings-main">
            <div class="row flex-row align-items-start">
            <div class="col-md-2 settingprofile">
                <div class="userimg border-radius-50-per mysettings_profile">
                    <img :src="formData.Employee_profileImage" alt="" class="userimg border-radius-50-per"
                    @click="$refs.fileInputUser.click()"
                    v-if="isTempPreview"/>
                    <WasabiImage  v-if="!isTempPreview && formData.Employee_profileImage"
                        class="mysettings__wasabi-img"
                        :data="{url: formData.Employee_profileImage}"
                        :thumbnail="'120x120'"
                        :userImage="true"
                        @click="$refs.fileInputUser.click()"
                    />
                    <span class="noimg-uploadImage cursor-pointer"  v-if="!isTempPreview && !formData.Employee_profileImage" @click="$refs.fileInputUser.click()">
                        {{formData.firsName.value.charAt(0).toUpperCase()}}
                    </span>
                    <input class="d-none" ref="fileInputUser" type="file" @input="onSelectFile" @change="isTempPreview = true">
                </div>
            </div>
            <div class="col-md-10 settingprofileform">
                <div class="profileform">
                    <form>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="inputfield position-re">
                                    <label for="fristname">
                                        First Name
                                    </label>
                                    <input class="logininput" v-model.trim="formData.firsName.value" maxlength="25" placeHolder="eg. Maria"
                                        type="text" @keyup="checkErrors({
                                                'field': formData.firsName,
                                                'name': formData.firsName.name,
                                                'validations': formData.firsName.rules,
                                                'type': formData.firsName.type,
                                                'event': $event.event
                                            })" id="firstName" tabindex="1" />
                                    <div class="invalid-feedback red position-ab">{{ formData.firsName.error }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputfield position-re">
                                    <label for="last name">
                                        Last Name
                                    </label>
                                    <input class="logininput" v-model.trim="formData.lastName.value" maxlength="25"
                                        placeHolder="eg. Tailor" type="text"
                                        @keyup="checkErrors({ 'field': formData.lastName, 'name': formData.lastName.name, 'validations': formData.lastName.rules, 'type': formData.lastName.type, 'event': $event.event })"
                                        id="lastName" tabindex="2" />
                                    <div class="invalid-feedback red position-ab">{{ formData.lastName.error }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputfield position-re">
                                    <label for="Email">
                                        Email
                                    </label>
                                    <input type="text" class="logininput" disabled="true" placeHolder="eg. mail@abc.com"
                                        v-model="formData.email.value" tabindex="3" :max-length="50" @keyup="checkErrors({
                                                'field': formData.email,
                                                'name': formData.email.name,
                                                'validations': formData.email.rules,
                                                'type': formData.email.type,
                                                'event': $event.event
                                            })" />
                                    <div class="invalid-feedback red position-ab">{{ formData.email.error }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="radioBox">
                                    <label for="Time Format">
                                        Time Format
                                    </label>
                                    <div class="radio_wrapper d-flex">
                                        <div class="radio">
                                            <input type="radio" name="radio-group-hours" v-model="formData.Time_Format"
                                                id="12hour" value="24" checked="checked">
                                            <label for="12hour" class="radio-label">24 hours</label>
                                        </div>
                                        <div class="radio">
                                            <input type="radio" name="radio-group-hours" v-model="formData.Time_Format"
                                                id="24hour" value="12" checked="checked">
                                            <label for="24hour" class="radio-label">12 hours</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputfield">
                                    <label for="Timezone">
                                        Timezone
                                    </label>
                                    <div class="con-select selectExample autocompletex">
                                        <div class="input-select-con">
                                            <DropDown :id="timeZone">
                                                <template #button>
                                                    <img src="../../../assets/images/dropdown-arrow.png" alt="dropdown-arrow" class="dropdown-arrow">
                                                    <div class=" cursor-pointer text-capitalize" :ref="timeZone">
                                                        {{ formData.Time_Zone }}
                                                    </div>
                                                </template>
                                                <template #options>
                                                    <DropDownOption
                                                        @click="formData.Time_Zone = company, $refs[timeZone].click()"
                                                        v-for="(company, index) in timezoneArray" :key="index"
                                                        :id="'item'+index"
                                                        :highlight="index === highlightIndex"
                                                        :item="{ label: company }">
                                                    </DropDownOption>
                                                </template>
                                            </DropDown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-start mysetiing_save">
                            <button :disabled="isSpinner" @click.prevent="SaveChangeToDb()" :class="[{'pointer-events-none' : isSpinner}]" class="btn_btn mysetting_save_btn ml-15px">Save Changes</button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
    import { BSON } from "realm-web";
    import * as env from '@/config/env';
    import timeZoneOption from "./timezoneArray.js";
    import {useToast} from 'vue-toast-notification';
    import { useGetterFunctions } from "@/composable";
    import { useValidation } from "@/composable/Validation.js";
    import { dbCollections } from "@/utils/FirebaseCollections";
    import { ref, inject, onMounted, defineComponent, nextTick, onUnmounted } from "vue";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import DropDown from "@/components/molecules/DropDown/DropDown.vue";
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
    import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations"; 
    import { apiRequestWithoutCompnay } from "../../../services";

    const $toast = useToast();
    const { getUser } = useGetterFunctions();
    const { checkErrors, checkAllFields } = useValidation();
    defineComponent({ InputText,SpinnerComp });
    // variable
    const userId = inject("$userId");
    const timeZone = ref("");

    const highlightIndex = ref(0);
    const formData = ref({
        firsName: {
            value: "",
            rules:
                "required",
            name: "first name",
            error: "",
        },
        lastName: {
            value: "",
            rules:
                "required",
            name: "last name",
            error: "",
        },
        email: {
            value: "",
            rules:
                "required | regex: \\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+",
            name: "Email",
            error: "",
        },
        Employee_profileImage: "",
        Time_Zone: '',
        Time_Format: ''
    })
    const timezoneArray = ref(timeZoneOption);
    const fileInputUser = ref();
    const selectFile = ref();
    const previewImage = ref();
    const isImgeChange = ref(false);
    const oldFileValue = ref();
    const isSpinner = ref(false);
    const isTempPreview = ref(false);
    const preEmail = ref('');

    function onSelectFile () {
        const input = fileInputUser.value;
        selectFile.value = input.files;
        if (selectFile.value && selectFile.value[0]) {
            const ext = selectFile.value[0].name.substring(selectFile.value[0].name.lastIndexOf(".") + 1);
            const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
            // Check valid image extension validation
            if(!extArray.includes(ext.toLowerCase())) {
                $toast.error('Select image only and image file format should be jpg,jpeg,png',{position: 'top-right'})
                return;
            }
            isImgeChange.value = true;
            var reader = new FileReader();
            reader.onload = (e) => {
                formData.value.Employee_profileImage = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
            previewImage.value=input.files[0];
        }
    }
    function init() {
        const user = getUser(userId.value, 1);
        formData.value.firsName.value = user.Employee_FName;
        formData.value.lastName.value = user.Employee_LName;
        formData.value.Employee_profileImage = user.Employee_profileImage == undefined ? '' : user.Employee_profileImage;
        formData.value.Employee_profileImageURL = user.Employee_profileImageURL == undefined ? '' : user.Employee_profileImageURL;
        formData.value.email.value = user.Employee_Email;
        formData.value.Time_Format = user.Time_Format || "12";
        formData.value.Time_Zone = user.Time_Zone || "Asia/Kolkata";
        oldFileValue.value = user.Employee_profileImage;
        preEmail.value = user.Employee_Email;
    }
    const SaveChangeToDb = () =>{
        checkAllFields(formData.value).then(async(valid)=>{
            if(valid){
                const user = getUser(userId.value, 1);
                if(formData.value.firsName.value == user.Employee_FName &&
                    formData.value.lastName.value == user.Employee_LName && 
                    formData.value.Employee_profileImage == user.Employee_profileImage &&
                    formData.value.Employee_profileImageURL == user.Employee_profileImageURL &&
                    formData.value.email.value == user.Employee_Email &&
                    formData.value.Time_Format == user.Time_Format &&
                    formData.value.Time_Zone == user.Time_Zone) 
                {
                    return $toast.error('Nothing To Update', { position: 'top-right' });
                }
                isSpinner.value = true;
                if(isImgeChange.value && oldFileValue.value != formData.value.Employee_profileImage){
                    const randomNumber = parseInt(Date.now() * Math.random());
                    const name = randomNumber + "_" + selectFile.value[0].name.replaceAll(" ","_");
                    let filePath = `${name}`;

                    // Wasbai upload start
                    const apiFormData = new FormData();
                    apiFormData.append("file", selectFile.value[0]);
                    apiFormData.append("path", filePath);
                    apiFormData.append("key","userProfile")
                    apiFormData.append("isUserProfile", true);
                    await apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, apiFormData, "form").then((res)=>{
                        if(res.data.status){
                            formData.value.Employee_profileImage = res.data.statusText[0];
                            formData.value.Employee_profileImageURL = res.data.statusText[0];
                            isTempPreview.value = false;
                        } else {
                            formData.value.Employee_profileImage = "";
                        }
                    })
                }
                let queryObj = [
                    { _id: BSON.ObjectId(userId.value) },
                    {   $set: {
                            Employee_FName: formData.value.firsName.value,
                            Employee_LName: formData.value.lastName.value,
                            Employee_profileImage: formData.value.Employee_profileImage,
                            Employee_profileImageURL: formData.value.Employee_profileImageURL,
                            Time_Format: formData.value.Time_Format,
                            Time_Zone: formData.value.Time_Zone,
                            Employee_Name: `${formData.value.firsName.value} ${formData.value.lastName.value}` ,
                            updatedAt:new Date()
                        }
                    }
                ];
                const queryUpdate = {
                    type: "updateOne",
                    collection: dbCollections.USERS,
                    data: queryObj,
                    global:true
                };
                /* 
                    - in global collection in that 'user' collection.
                    - we are matching items based on their 'id' and updating the field.
                */
                mongodbCrudOperations(queryUpdate).then(()=>{
                    formData.value.email.value = preEmail.value;
                    isSpinner.value = false;
                    $toast.success("Profile updated successfully.",{position: 'top-right'});
                }).catch((error) => {
                    isSpinner.value = false;
                    $toast.error('Some thing went wrong',{position: 'top-right'});
                    console.error("ERROR in delete sprint: ", error);
                });
            }
        })
    }
    onMounted(() => {
        timeZone.value = 'user_timezone';
        init();
        startListener();
    });

    function startListener() {
        document.addEventListener("keydown", keyListener)
    }

    function stopListener() {
        document.removeEventListener("keydown", keyListener)
    }

    onUnmounted(() => {
        stopListener();
    })

    function keyListener(event) {
        if(event.keyCode === 13) { // Enter
            formData.value.Time_Zone = timezoneArray.value[highlightIndex.value];
            let timeZoneInput = document.getElementById('item'+highlightIndex.value)
            timeZoneInput.click();
        } else if(event.keyCode === 38){ // UP
            highlightIndex.value = highlightIndex.value > 0 ? highlightIndex.value-1 : 0;
            nextTick(() => {
                document.getElementById('item'+highlightIndex.value)?.scrollIntoView({behavior: "smooth", block: 'end'})
            })
        } else if (event.keyCode === 40){ // DOWN
            highlightIndex.value = highlightIndex.value < timezoneArray.value.length-1 ? highlightIndex.value+1 : timezoneArray.value.length-1;
            nextTick(() => {
                document.getElementById('item'+highlightIndex.value)?.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start'})
            })
        }
    }
</script>

<style scoped>
@import '@/views/Settings/MySettings/style.css';
</style>