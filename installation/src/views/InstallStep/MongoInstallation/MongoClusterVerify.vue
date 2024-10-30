<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div v-if="!mainSpinner && mainSpinnerErrorMessage">
                <p style="text-align: center; color: red;">
                    {{ mainSpinnerErrorMessage }}
                </p>
            </div>
            <div v-if="mainSpinner">
                <h2 style="text-align: center;">Loading ...</h2>
            </div>
            <div v-if="!mainSpinner && !mainSpinnerErrorMessage">
                <p v-if="!(clusterList && clusterList.length)" class="text-center">Please Create a new Cluster</p>
                <p v-if="clusterList && clusterList.length" class="text-center">Please Select A Cluster or Create a new Cluster</p>
                <h3 v-for="(cluster, index) in clusterList" v-bind:key="index" class="default-selection" :class="{'active-selection' : isSelectedCluster === cluster.name }" @click="selectedCluster(cluster)">{{ cluster.name }}</h3>
                <p style="text-align: center; color: red;" v-if="isAvailableFreeCluster">A free cluster has already been used by you. Kindly pick the above cluster or create a new one in Mongodb.</p>
                <button v-if="!isOpenCreateNewCluster" class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" :disabled="isAvailableFreeCluster" :class="{'disabled': isAvailableFreeCluster}" @click="createNewCluster" tabindex="3">Add New Cluster</button>
                <div class="install-form" v-if="isOpenCreateNewCluster">
                    <div class="form-group mb-15px">
                        <label for="clusterName"> <b> Cluster Name </b></label><br />
                        <span style="font-size: 12px;"> The cluster name can only contain ASCII letters, numbers, and hyphens.</span>
                        <InputText
                            id="clusterName"
                            class="login-input mt-10"
                            placeHolder="Enter Cluster Name"
                            v-model="formData.clusterName.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.clusterName,
                            'name':formData.clusterName.name,
                            'validations':formData.clusterName.rules,
                            'type':formData.clusterName.type,
                            'event':$event.event})"
                            @input="formData.clusterName.value = formData.clusterName.value"
                            maxlength="254"
                            ref="clusterName"
                            type="text"
                            @enter="submitNewCluster"
                        />
                        <div class="invalid-feedback red">{{formData.clusterName.error}}</div>
                    </div>
                    <div class="form-group mb-15px">
                        <label for="clusterRegion"> <b> Cluster Region </b></label>
                        <select class="install-form-control mt-10 w-100" v-model="formData.clusterRegion.value">
                            <option v-for="(region,index) in regionList" :key="index">
                                {{region?.name}}
                            </option>
                        </select>
                        <div class="errorMessage">{{ formData.clusterRegion.error }}</div>
                    </div>
                    <div class="form-group">
                        <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" :disabled="!isSubmitSend" :class="{'disabled': !isSubmitSend}" @click="submitNewCluster" tabindex="3">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { onMounted, defineEmits, ref } from "vue";
    import Swal from 'sweetalert2';
    import * as env from '@/config/env';
    import InputText from "@/components/atom/InputText/InputText.vue";
    import { useValidation } from "@/composable/Validation.js";
    const  { checkErrors , checkAllFields } = useValidation();
    const emit = defineEmits(["complete"]);
    import { apiRequest } from "../../../services";

    const mainSpinner = ref(true);
    const isAvailableFreeCluster = ref(false);
    const isOpenCreateNewCluster = ref(false);
    const mainSpinnerErrorMessage = ref("");
    const clusterList = ref([]);
    const isSelectedCluster = ref("");
    const regionList = ref([]);
    const isSubmitSend = ref(true);
    const formData = ref({
        clusterName: {
            value: "",
            rules:
            // eslint-disable-next-line
            "required | min:3 | regex:^([a-zA-Z0-9]([a-zA-Z0-9-]){0,21}(?<!-)([\w]{0,42}))$",
            name: "cluster name",
            error: "",
        },
        clusterRegion: {
            value: "",
            rules:
            "required",
            name: "cluster region",
            error: "",
        }
    });
    const stepDesc = ref({
        name: "Mongo Cluster Setting",
        subStep: 1
    })
    // function capitalize(s) {
    //     return s[0].toUpperCase() + s.slice(1);
    // }
    const selectedCluster = (clusterData) => {
        try {
            Swal.fire({
                // title: `Are you sure to choose ${capitalize(name)} Cluster?`,
                text: "This will erase all cluster data, including settings, user data, and other. This cannot be undone. Do you want to proceed?",
                showCancelButton: true,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result)=>{
                if (result.value) {
                    isSelectedCluster.value = clusterData.name;
                    emit("complete", {status: true, clusterName: clusterData.name, clusterData: clusterData, key: "old"});
                } else {
                    console.error("error", result.value);
                }
            })
        } catch (error) {
            console.error("error", error);
        }
    }
    const createNewCluster = () => {
        isOpenCreateNewCluster.value = true;
        apiRequest("get", env.MONGO_CLUSTER_REGIONS_GET).then((mongoRegions) => {
            if (mongoRegions?.data?.status) {
                regionList.value = mongoRegions.data.data || [];
                formData.value.clusterRegion.value = mongoRegions.data.data.find((x) => x.default).name || ""
            } else {
                regionList.value = [];
                mainSpinnerErrorMessage.value = mongoRegions?.data?.error;
            }
        }).catch((err) => {
            console.error("Get Regions Error 1", err);
            mainSpinnerErrorMessage.value = err;
        })
    }
    const submitNewCluster = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    clusterName: formData.value.clusterName.value,
                    clusterRegion: formData.value.clusterRegion.value,
                    key: "new"
                });
            } else {
                stepDesc.value.subStep = 1;
                isSubmitSend.value = true;
            }
        })
    }
    onMounted(async () => {
        mainSpinner.value = true;
        try {
            apiRequest("get", env.MONGO_CLUSTER_GET).then((mongoCluster) => {
                // mongoCluster.data.data.results = [];
                if (mongoCluster?.data?.data?.results?.length) {
                    const replicationSpecsArray = []
                    for (let index = 0; index < mongoCluster.data.data.results.length; index++) {
                        const element = mongoCluster.data.data.results[index];
                        if (element?.replicationSpecs?.length) {
                            replicationSpecsArray.push(...element.replicationSpecs.map((x) => x))
                        }
                    }
                    const regionConfigsArray = [];
                    for (let index1 = 0; index1 < replicationSpecsArray.length; index1++) {
                        const element1 = replicationSpecsArray[index1];
                        if (element1?.regionConfigs?.length) {
                            regionConfigsArray.push(...element1.regionConfigs.map((x) => x))
                        }
                    }

                    const freeCluster = regionConfigsArray.find((x) => x?.electableSpecs?.instanceSize === "M0")
                    clusterList.value = mongoCluster.data.data.results;
                    if (freeCluster) {
                        isAvailableFreeCluster.value = true;
                        mainSpinner.value = false;
                    } else {
                        isAvailableFreeCluster.value = false;
                        mainSpinner.value = false;
                    }
                } else {
                    clusterList.value = [];
                    isAvailableFreeCluster.value = false;
                    mainSpinner.value = false;
                }
            }).catch((err) => {
                console.error("Get Cluster Error 1", err);
                mainSpinner.value = false;
                mainSpinnerErrorMessage.value = err;
            })
        } catch (error) {
            console.error("Get Cluster Error 2", error?.message || error);
            mainSpinner.value = false;
            mainSpinnerErrorMessage.value = error?.message || error;
        }
    });
</script>
<style scoped>

</style>