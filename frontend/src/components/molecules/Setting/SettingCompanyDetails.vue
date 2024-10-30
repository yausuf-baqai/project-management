<template>
<div class="position-re">
    <SpinnerComp :is-spinner="isSpinner" class="setting_spinner"/>
    <div class="mySettingSection box-shadow-2" :class="[{'Company-pointer-event-none':isSpinner}]">
        <div class="row vs-con-loading__container" id="div-with-loading-profile">
            <div class="col-md-2 settingProfileCol">
                <div class="settingProfileWrapper">
                    <img :src="formData.companyprofileImage" alt="" class="image-input company-settings-image-input"
                    :style="{'pointer-events': !props.editPermission ? 'none' : ''}"
                    @click="$refs.fileInputUser.click()" v-if="isTempPreview && isImgeChange"/>
                    <WasabiImage  v-if="(!isTempPreview && formData.companyprofileImage) || (!isImgeChange && formData.companyprofileImage)"
                        class="setting__wasabi-image"
                        :data="{url: formData.companyprofileImage}"
                        @click="$refs.fileInputUser.click()"
                        thumbnail="180x180"
                    />
                    <span class="noimg-uploadImage cursor-pointer" v-if="(!isTempPreview && !formData.companyprofileImage) || (!isImgeChange && !formData.companyprofileImage)"  @click="$refs.fileInputUser.click()">
                        {{selectedCompany?.Cst_CompanyName?.charAt(0)?.toUpperCase()}}
                    </span>
                    <input ref="fileInputUser" type="file" class="file-input" @input="onSelectFile"  @change="isTempPreview = true">
                </div>
            </div>
            <div class="col-md-10 settingProfileFormCol">
                <div class="settingProfileFormSubmission">
                    <form>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="inputFieldDiv">
                                    <label for="Company Name">
                                        Company Name
                                    </label>
                                    <InputText :readonly="!props.editPermission" class="form-control login-input" v-model.trim="formData.companyName.value"
                                        placeHolder="Company Name" type="text" id="Company Name" tabindex="1" @keyup="checkErrors({
                                                'field': formData.companyName,
                                                'name': formData.companyName.name,
                                                'validations': formData.companyName.rules,
                                                'type': formData.companyName.type,
                                                'event': $event.event
                                            })" inputId="refCompanyName" />
                                    <div class="invalid-feedback red">{{ formData.companyName.error }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputFieldDiv">
                                    <label>
                                        Phone
                                    </label>
                                    <div class="teaminput-sidebar">
                                        <div class="d-flex position-re">
                                            <PhoneCountry class="phone" @onSelect="(val) =>onSelect(val)"
                                                :preferredCountries="[countryCodeObj?.isoCode ,'US']" :enabledCountryCode="true"
                                                :enabledFlags="true"
                                                :style="{ 'border-radius': '6px 0px 0px 6px ', 'pointer-events': !props.editPermission ? 'none' : '' }"  
                                                :enabledArrowIcon="true"/>
                                           
                                            <InputText :readonly="!props.editPermission" class="form-control login-input border-topbottom-right-6-px"
                                                v-model="formData.phoneNumber.value" placeHolder="eg. 000-000-0000"
                                                :max-length="10" tabindex="1" @keypress="isNumber($event.event)"
                                                 @keyup="checkErrors({
                                                        'field': formData.phoneNumber,
                                                        'name': formData.phoneNumber.name,
                                                        'validations': formData.phoneNumber.rules,
                                                        'type': formData.phoneNumber.type,
                                                        'event': $event.event
                                                    })" />
                                        </div>
                                        <div class="invalid-feedback red">{{ formData.phoneNumber.error }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputFieldDiv">
                                    <label for="Country">
                                        Country
                                    </label>
                                    <InputText :readonly="true" :style="{ 'pointer-events': !props.editPermission ? 'none' : '' }"  type="text" class="form-control login-input cursor-pointer" v-model="formData.country.value"
                                        placeHolder="Country" @click="setfocus('country'), visible = !visible"
                                        @focus="setCurrentSidebarValue('country'), setfocus('country')" @keyup="checkErrors({
                                                'field': formData.country,
                                                'name': formData.country.name,
                                                'validations': formData.country.rules,
                                                'type': formData.country.type,
                                                'event': $event.event
                                            })" />
                                    <div class="invalid-feedback red">{{ formData.country.error }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputFieldDiv">
                                    <label for="State">
                                        State
                                    </label>
                                    <InputText :disabled="locationObj['state'].isStateVal" :readonly="true" :style="{ 'pointer-events': !props.editPermission ? 'none' : '' }" type="text" class="form-control login-input" v-model="formData.state.value"
                                        :placeHolder="locationObj['state'].isStateVal == false ? 'State' : 'No States'" 
                                        inputId="refState" @click="setfocus('state')"
                                        :class="[{'cursor-pointer': locationObj['state'].isStateVal == false}]"
                                        @focus="setCurrentSidebarValue('state'), setfocus('state')" @keyup="checkErrors({
                                                'field': formData.state,
                                                'name': formData.state.name,
                                                'validations': formData.state.rules,
                                                'type': formData.state.type,
                                                'event': $event.event
                                            })" />
                                    <div class="invalid-feedback red">{{ formData.state.error }}</div>

                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputFieldDiv">
                                    <label for="City">
                                        City
                                    </label>
                                    <InputText :disabled="(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)" :readonly="true" :style="{ 'pointer-events': !props.editPermission ? 'none' : '' }" type="text" class="form-control login-input" v-model="formData.city.value"
                                        :placeHolder="!(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal) ? 'City' : 'No Cities'" 
                                        inputId="refCity" @click="setfocus('city')"
                                        :class="[{'cursor-pointer': !(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)}]"
                                        @focus="setCurrentSidebarValue('city'), setfocus('city')" @keyup="checkErrors({
                                                'field': formData.city,
                                                'name': formData.city.name,
                                                'validations': formData.city.rules,
                                                'type': formData.city.type,
                                                'event': $event.event
                                            })" />
                                    <div class="invalid-feedback red">{{ formData.city.error }}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="inputFieldDiv drop-arrow">
                                    <label for="Date">
                                        Select Date Format
                                    </label>

                                    <div class="con-select selectExample autocompletex">
                                        <div class="input-select-con">
                                            <DropDown :id="formatdate" :style="{ 'pointer-events': !props.editPermission ? 'none' : '' }">
                                                <template #button>
                                                    <div class=" cursor-pointer text-capitalize" :ref="formatdate">
                                                        {{ formData.format_date }}
                                                    </div>
                                                </template>
                                                <template #options>
                                                    <DropDownOption
                                                        @click="formData.format_date = date, $refs[formatdate].click()"
                                                        v-for="(date, index) in dateArray" :key="index"
                                                        :item="{ label: date }">
                                                    </DropDownOption>
                                                </template>
                                            </DropDown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button v-if="props.editPermission" :disabled="isSpinner" ref="refButton" @click.prevent="SaveChangeToDb()"
                            class="blue_btn" id="blue-btn-savecompany">Save
                            Changes </button>
                    </form>

                    <Sidebar :title="sidebarTitle" v-model:visible="visible" :enable-search="true" :options="dataArray"
                        :listenKeys="true"
                        :value="currentSidebarValue"
                        @selected="getSubSidebarData" width="337px" :formData="formData" :fieldType="fieldType" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { BSON } from "realm-web";
import PhoneCountry from "@/components/molecules/CountryPhoneNumberDropdown/PhoneCountry.vue"
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import InputText from "@/components/atom/InputText/InputText.vue";
import { computed, defineComponent, inject, onMounted, ref, watchEffect,defineProps } from "vue";
import { useStore } from "vuex";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { useValidation } from "@/composable/Validation.js";
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
import { dbCollections,settingsCollectionDocs } from "@/utils/FirebaseCollections";
import { apiRequestWithoutCompnay } from '../../../services';
// import {firebaseUpload} from "@/utils/StorageOprations/upload"
// import {firebaseRemove} from "@/utils/StorageOprations/remove"
import { setFocus } from './helper.js'
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import * as env from '@/config/env';

//// import Commons Function///
const { setfocus, formData, visible, sidebarTitle, dataArray, $toast,
    getSubSidebarData, onSelectFile, fileInputUser, selectFile, isImgeChange, locationObj, fieldType } = setFocus()
defineComponent({
    name: 'Company-Details',
    components: {
        Sidebar,
        PhoneCountry,
        DropDown,
        DropDownOption,
        InputText,
        SpinnerComp
    }
})
const props = defineProps({
    editPermission: {
        type: [Boolean],
        default: false
    }
})
const companyId = inject("$companyId");
const { checkErrors, checkAllFields } = useValidation();
const { getters } = useStore();
const dateArray = ref(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY', 'MM-DD-YYYY',
    'YYYY-MM-DD', 'DD MMM[,] YYYY', 'MMMM Do[,] YYYY', 'MMMM DD[,] YYYY',
    'DD MMMM[,] YYYY', 'Do MMMM[,] YYYY']);

const countryCodeObj = ref({});
const refButton = ref("");
const formatdate = ref("")
const isSpinner = ref(false);
const oldFileValue = ref();
const selectedCompany = ref("");
const isTempPreview = ref(false);

const companies = computed(() => {
    return getters["settings/companies"];
})
const companyDate=computed(()=>{
    return getters['settings/companyDateFormat']
})
watchEffect(() => {
    formData.value.format_date = companyDate.value.dateFormat
    selectedCompany.value = companies.value.find((company) => company._id === companyId.value) 
})

//// Only Number Input Function///
const isNumber = (evt) => {
    const char = String.fromCharCode(evt.keyCode)
    if (!/[0-9]/.test(char)) {
        evt.preventDefault()
    }
}

const currentSidebarValue = ref([]);
function setCurrentSidebarValue(type) {
    const key = type
    currentSidebarValue.value = [JSON.parse(JSON.stringify(formData.value[key]))]
}

//// Select PhoneCountry Function///
const onSelect = (val) => {
    countryCodeObj.value = val
}
onMounted(() => {
    formData.value.companyprofileImage = selectedCompany.value?.Cst_profileImage == undefined ? '' : selectedCompany.value?.Cst_profileImage;
    formData.value.companyName.value = selectedCompany.value?.Cst_CompanyName;
    formData.value.phoneNumber.value = selectedCompany.value?.Cst_Phone;
    formData.value.country.value = selectedCompany.value?.Cst_Country;
    formData.value.state.value = selectedCompany.value?.Cst_State;
    formData.value.Cst_DialCode = selectedCompany.value?.Cst_DialCode; 
    formData.value.city.value = selectedCompany.value?.Cst_City;
    formData.value.day.value = selectedCompany.value?.Cst_LogTimeDays;
    formData.value.format_date = companyDate.value.dateFormat;
    oldFileValue.value = selectedCompany.value?.Cst_profileImage;
    formData.value.Cst_countryCode.value = selectedCompany.value?.Cst_countryCode || 'IN';
    formData.value.Cst_stateCode.value = selectedCompany.value?.Cst_stateCode || 'GJ';

    if(selectedCompany.value.Cst_State == '') {
        locationObj.value['state'].isStateVal = true;
    }
    if(selectedCompany.value.Cst_City == '') {
        locationObj.value['city'].isCityVal = true;
    }
    countryCodeObj.value = selectedCompany.value?.Cst_DialCode
}
);

///UPDATE DATA IN DATABASE///
const SaveChangeToDb = async () => {
    checkAllFields(formData.value).then(async (valid) => {
        if (valid) {
            if (formData.value.companyprofileImage == selectedCompany.value?.Cst_profileImage && formData.value.companyName.value == selectedCompany.value?.Cst_CompanyName
                && formData.value.phoneNumber.value == selectedCompany.value?.Cst_Phone &&  countryCodeObj.value.name == selectedCompany.value?.Cst_DialCode.name
                && formData.value.country.value == selectedCompany.value?.Cst_Country && formData.value.state.value == selectedCompany.value?.Cst_State
                && formData.value.city.value == selectedCompany.value?.Cst_City && formData.value.format_date == companyDate.value.dateFormat) {
                return $toast.error('Nothing To Update', { position: 'top-right' });
            }
            isSpinner.value = true;
            if (isImgeChange.value && (!oldFileValue.value || oldFileValue.value !== formData.value.companyprofileImage)) {
                const randomNumber = parseInt(Date.now() * Math.random());
                const name = randomNumber + "_" + selectFile.value[0].name.replaceAll(" ", "_");
                // const storageFolder = `${companyId.value}/company_profile_avatar/`;
                const filePath = `companyIcon/${name}`;
                // Remove the old image from Firebase storage
                // if (oldFileValue.value) {
                //     const splitParts = oldFileValue.value.split('/');
                //     const urlPar = splitParts[splitParts.length - 1];
                //     const filename = urlPar.split('?')[0].replaceAll("%2F", "/");
                //     firebaseRemove(filename, '', () => {});
                // }

                // // Upload the new image to Firebase storage
                // await firebaseUpload(selectFile.value[0], storageFolder, name)
                //     .then((imgURL) => {
                //     formData.value.companyprofileImage = imgURL;
                //     oldFileValue.value = imgURL;
                // });

                const apiFormData = new FormData();
                apiFormData.append("file", selectFile.value[0]);
                apiFormData.append("path", filePath);
                apiFormData.append("companyId", companyId.value);
                apiFormData.append("key", "companyIcon");
                await apiRequestWithoutCompnay("post", env.WASABI_UPLOAD_FILE, apiFormData, "form").then((res) => {
                    if (res.data.status) {
                        formData.value.companyprofileImage = res.data.statusText[0];
                        isTempPreview.value = false;
                    } else {
                        formData.value.companyprofileImage = "";
                    }
                })
            }

            let object = {
                Cst_profileImage: formData.value.companyprofileImage,
                Cst_CompanyName: formData.value.companyName.value,
                Cst_Phone: formData.value.phoneNumber.value,
                Cst_Country: formData.value.country.value,
                Cst_DialCode: countryCodeObj.value,
                Cst_State: formData.value.state.value,
                Cst_City: formData.value.city.value,
                Cst_LogTimeDays: formData.value.day.value,
                Cst_countryCode: formData.value.Cst_countryCode.value,
                Cst_stateCode: formData.value.Cst_stateCode.value,
                updatedAt: new Date()
            };


            let queryObj = [
                { _id: BSON.ObjectID(companyId.value) },
                {
                    $set: object
                },
                true, // Upsert
                false
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.COMPANIES,
                data: queryObj,
                global: true
            };

            mongoQuery.mongodbCrudOperations(query)
                .then(() => {
                    let obj = {
                        dateFormat: formData.value.format_date
                    }

                    let queryObje = [
                        { 'name': settingsCollectionDocs.COMMON_DATE_FORMAT },
                        { $set: { settings: [obj] } }
                    ];
                    const queryUpdate = {
                        type: "updateOne",
                        collection: dbCollections.SETTINGS,
                        data: queryObje
                    };

                    mongoQuery.mongodbCrudOperations(queryUpdate)
                        .then(() => {
                            isSpinner.value = false;
                            $toast.success("Company details updated successfully.", { position: 'top-right' });
                        }).catch((error) => {
                            $toast.error(error.message, { position: 'top-right' });
                        });
                })
                .catch((error) => {
                    $toast.error('Some thing went wrong', { position: 'top-right' });
                    console.error("ERROR in delete sprint: ", error);
                })

        }
    })
}

</script>
<style scoped>
@import './style.css';

.invalid-feedback{
top: unset !important;
}
.setting__wasabi-image{
   width:120px !important;
   height:120px !important;
   border-radius: 50%;
    border: 2px solid #102a83;
}
</style>