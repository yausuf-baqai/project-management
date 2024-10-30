import { ref } from "vue";
import { Country, State, City } from 'country-state-city';
import { useToast } from 'vue-toast-notification';
const fileInputUser = ref();
const selectFile = ref();

const isImgeChange = ref(false);

const dataArray = ref([]);
const sidebarTitle = ref("");
const contriesArray = ref([]);
const statesArray = ref([]);
const citiesArray = ref([]);
const $toast = useToast();
const previewImage = ref();
const locationObj = ref({
    state:{isStateVal: false},
    city:{isCityVal: false}
})


export function setFocus() {
    contriesArray.value = Country.getAllCountries();
    statesArray.value = State.getStatesOfCountry('IN');
    citiesArray.value = City.getCitiesOfState('IN', 'GJ');
    const visible = ref(false);
    const fieldType = ref("");
    fieldType.value = 'country'


    const formData = ref({
        companyName: {
            value: "",
            rules:
                "required | min:3",
            name: "company name",
            error: ""
        },
        phoneNumber: {
            value: "",
            rules:
                "required | min:10 | regex:^[0-9]+$",
            name: "phone number",
            error: ""
        },
        country: {
            value: "",
            rules:
                "required",
            name: "country",
            error: ""
        },
        state: {
            value: "",
            rules:
                "required",
            name: "state",
            error: ""
        },
        city: {
            value: "",
            rules:
                "required",
            name: "city",
            error: ""
        },

        day: {
            value: "",
            rules:
                "required | min:1 | regex:^[0-9]+$",
            name: "day",
            error: ""
        },
        format_date: '',
        companyprofileImage: "",
        Cst_countryCode: {
            value: ""
        },
        Cst_stateCode: {
            value: ""
        }
    });

    /// Select County,State and city function ///
    function setfocus(type) {
        visible.value = true;
        if (type == 'country') {
            dataArray.value = contriesArray.value;
            sidebarTitle.value = (type == 'country') ? "Select Country" : "";
            fieldType.value = 'country';
        }
        if (type == 'state') {
            statesArray.value = State.getStatesOfCountry(formData.value.Cst_countryCode.value || 'IN')
            dataArray.value = statesArray.value;
            sidebarTitle.value = (type == 'state') ? "Select State" : "";
            fieldType.value = 'state';
        }
        if (type == 'city') {
            citiesArray.value = City.getCitiesOfState(formData.value.Cst_countryCode.value || 'IN',formData.value.Cst_stateCode.value || 'GJ')
            dataArray.value = citiesArray.value;
            sidebarTitle.value = (type == 'city') ? "Select City" : "";
            fieldType.value = 'city';
        }
        dataArray.value.map((x) => {
            x["label"] = x.name;
            x["value"] = x.name;
        })
    }

    const handleDisabled = async (key, val) => {
        const country = val.isoCode;
        const state = val.countryCode;
        const noStates = (await State.getStatesOfCountry(country)).length === 0;
        const noCities = (await City.getCitiesOfState(state, country)).length === 0;
        if (key === 'country') {
            locationObj.value['state'].isStateVal = noStates;
            formData.value.state.rules = noStates ? '' : 'required';
            formData.value.city.rules = noStates ? '' : 'required';
            formData.value.state.error = '';
            formData.value.city.error = '';
        } else if (key === 'state') {
            locationObj.value['city'].isCityVal = noCities;
            formData.value.city.rules = noCities ? '' : 'required';
            formData.value.city.error = '';
        }
    };

    /// Selected County,State and city value store in Textbox value function ///
    function getSubSidebarData(val) {
        if (fieldType.value === "country") {
            handleDisabled('country',val)
            formData.value.country.value = val.name;
            formData.value.state.value = "";
            formData.value.city.value = "";
            formData.value.state.error = ''
            formData.value.city.error = ''
            formData.value.Cst_countryCode.value = val.isoCode;
            statesArray.value = State.getStatesOfCountry(val.isoCode);
            setTimeout(() => {
                if(statesArray.value.length > 0) {
                    const ele = document.getElementById("refState");
                    ele.focus();
                    fieldType.value = "state"
                }
            }, 500);
        }
        if (fieldType.value === "state") {
            handleDisabled('state',val)
            formData.value.state.value = val.name;
            formData.value.city.value = "";
            formData.value.state.error = ''
            formData.value.Cst_stateCode.value = val.isoCode;
            citiesArray.value = City.getCitiesOfState(val.countryCode, val.isoCode);
            setTimeout(() => {
                if(citiesArray.value.length > 0) {
                    const refcity = document.getElementById("refCity");
                    refcity.focus();
                    fieldType.value = "city"
                }
            }, 500);
        }
        if (fieldType.value === "city") {
            formData.value.city.value = val.name;
            formData.value.state.error = ''
            formData.value.city.error = ''
        }
    }


    ///Company Profile Image Change function///
    function onSelectFile() {
        const input = fileInputUser.value;
        selectFile.value = input.files;
        if (selectFile.value && selectFile.value[0]) {
            const ext = selectFile.value[0].name.substring(selectFile.value[0].name.lastIndexOf(".") + 1);
            const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
            // Check valid image extension validation
            if (!extArray.includes(ext.toLowerCase())) {
                $toast.error('Select image only and image file format should be jpg,jpeg,png', { position: 'top-right' })
                return;
            }
            if(selectFile.value[0].size > 500000){
                $toast.error("file size is larger than 500kb!",{position:'top-right'})
                return;
            }
            isImgeChange.value = true;
            var reader = new FileReader();
            reader.onload = (e) => {
                formData.value.companyprofileImage = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
            previewImage.value = input.files[0];
        }
    }

    return {
        setfocus,
        onSelectFile,
        getSubSidebarData,
        formData,
        visible,
        fieldType, $toast,
        citiesArray, statesArray, contriesArray, Country, State, City, sidebarTitle, dataArray, fileInputUser, selectFile, isImgeChange, locationObj
    }
}