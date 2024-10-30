<template>
    
    <div>
        <div v-if="mainStep && mainStep === 100">
            <!-- <img :src="successImg" /> -->
            <p class="text-center">Please Wait a moment</p>
            <h2 class="text-center">All Step is Done</h2>
        </div>
        <!-- STEP 1 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 1, 'opacity-5': mainStep < 1}">MongoDB Auth
                <img v-if="mainStep >= 2" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 1 && mainStep !== 100" >
                <MongoAuthVerify @complete="mongoAuthVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoAuthVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
        <!-- STEP 2 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 2, 'opacity-5': mainStep < 2 }">MongoDB Cluster Settings
                <img v-if="mainStep >= 3" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 2 && mainStep !== 100" >
                <MongoClusterVerify @complete="mongoClusterVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoClusterVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
        <!-- STEP 3 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 3, 'opacity-5': mainStep < 3 }">Network Settings
                <img v-if="mainStep >= 4" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 3 && mainStep !== 100" >
                <MongoNetworkVerify @complete="mongoNetworkVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoNetworkVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
        <!-- STEP 4 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 4, 'opacity-5': mainStep < 4 }">Generate Database URL
                <img v-if="mainStep >= 5" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 4 && mainStep !== 100" >
                <MongoGenerateDatabaseURLVerify @complete="mongoGenerateDatabaseURLVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoGenerateDatabaseURLVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
        <!-- STEP 5 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 5, 'opacity-5': mainStep < 5 }">App Service Settings
                <img v-if="mainStep >= 6" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 5 && mainStep !== 100" >
                <MongoAppServiceVerify @complete="MongoAppServiceVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoAppServiceVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
        <!-- STEP 6 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 6, 'opacity-5': mainStep < 6 }">Add MongoDB Function
                <img v-if="mainStep >= 7" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 6 && mainStep !== 100" >
                <MongoFunctionVerify @complete="mongoFunctionVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoFunctionVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
        <!-- STEP 7 -->
        <div class="main-substep-box">
            <h1 class="blue title-sub default-box mb-0" :class="{'default-box1' : mainStep == 7, 'opacity-5': mainStep < 7 }">Add Default User
                <img v-if="mainStep >= 8" :src="smallsuccessImg" class="success-icon" />
            </h1>
            <div class="default-contant-box" v-if="mainStep && mainStep === 7 && mainStep !== 100" >
                <MongoAddDefaultUserVerify @complete="mongoAddDefaultUserVerifySubmit" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 1"></MongoAddDefaultUserVerify>
                <div class="image-section" v-if="stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2">
                    <img :src="inProgressImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'" />
                    <img :src="successImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'done'" />
                    <img :src="errorImg" v-if="stepDesc[`step${mainStep}Desc`][0].status === 'error'" />
                </div>
            </div>
        </div>
    </div>
    <div v-if="mainStep && mainStep !== 100 && stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length && stepDesc[`step${mainStep}Desc`].length !== 1">
        <div style="margin: 30px 0px;">
            <div class="sub-steps d-flex align-items-center mb-20px" v-for="(row, stepIndex) in stepDesc[`step${mainStep}Desc`]" :key="stepIndex" :class="{'opacity-5' : row.status === 'remaining' }">
                <span class="">{{row.name}}</span>
                <img
                    v-if="row.status !== 'remaining'"
                    :src="row.status === 'inprogress' ? inProgressImg : row.status === 'done' ? smallsuccessImg :  smallerrorImg"
                    width="25"
                    height="25"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    // PACKAGES
    import { defineComponent, onMounted, defineEmits, ref } from "vue";
    const emit = defineEmits(["complete"]);
    import * as env from '@/config/env';
    import { apiRequest } from "../../../services";
    import {useToast} from 'vue-toast-notification';
    import MongoAuthVerify from "./MongoAuthVerify.vue";
    import MongoClusterVerify from "./MongoClusterVerify.vue";
    import MongoNetworkVerify from "./MongoNetworkVerify.vue";
    import MongoGenerateDatabaseURLVerify from "./MongoGenerateDatabaseURLVerify.vue";
    import MongoAppServiceVerify from "./MongoAppServiceVerify.vue";
    import MongoFunctionVerify from "./MongoFunctionVerify.vue";
    import MongoAddDefaultUserVerify from "./MongoAddDefaultUserVerify.vue";
    import inProgressImg from "@/assets/images/svg/inprogress.gif";
    import successImg from "@/assets/images/svg/sucess.svg";
    import smallsuccessImg from "@/assets/images/svg/smallsucess.svg";
    import errorImg from "@/assets/images/svg/error.svg";
    import smallerrorImg from "@/assets/images/svg/smallerror.svg";
    
    const $toast = useToast();
    
    defineComponent({
        name: "install-step-mongo"

    });

    const stepData = ref({});
    const mainStep = ref(0);
    const isMainStep = ref(true);
    
    const stepDesc = ref({
        step1Desc: [{
            step: 1,
            name: "MongoDB Auth",
            status: "inprogress",
            subStep: 1
        }],
        step2Desc: [{
            step: 1,
            name: "MongoDB Cluster Setting",
            status: "inprogress",
            subStep: 1
        }],
        step3Desc: [{
            step: 1,
            name: "Network Setting",
            status: "inprogress",
            subStep: 1
        }],
        step4Desc: [{
            step: 1,
            name: "Generate Database URL",
            status: "inprogress",
            subStep: 1
        }],
        step5Desc: [{
            step: 1,
            name: "App Service Settings",
            status: "inprogress",
            subStep: 1
        }],
        step6Desc: [{
            step: 1,
            name: "Add MongoDB Function",
            status: "inprogress",
            subStep: 1
        }],
        step7Desc: [{
            step: 1,
            name: "Add Default User",
            status: "inprogress",
            subStep: 1
        }]
    })
    function startCallingSteps(bData, bodyData) {
        mainStep.value = bData.step;
        const evId = `ev_${Math.random().toString(16).slice(2)}`;

        if (
            (bData.step === 1 && stepDesc.value.step1Desc[0].subStep === 1) ||
            (bData.step === 2 && stepDesc.value.step2Desc[0].subStep === 1) ||
            (bData.step === 3 && stepDesc.value.step3Desc[0].subStep === 1) ||
            (bData.step === 4 && stepDesc.value.step4Desc[0].subStep === 1) ||
            (bData.step === 5 && stepDesc.value.step5Desc[0].subStep === 1) ||
            (bData.step === 6 && stepDesc.value.step6Desc[0].subStep === 1) ||
            (bData.step === 7 && stepDesc.value.step7Desc[0].subStep === 1)
        ) {
            return;
        }
        
        const source = new EventSource(`${env.API_URI}/api/v1/checkinstallstep/events/${evId}`);
        let step;
        source.onmessage = function(event) {
            // Parse the event data (the progress update)
            const data = JSON.parse(event.data)?.data;
            if (data?.step && data?.step !== 100) {
                step = data?.step;
                stepDesc.value[`step${bData.step}Desc`][step-1].status = "done";
                if (stepDesc.value[`step${bData.step}Desc`].length > step) {
                    stepDesc.value[`step${bData.step}Desc`][step].status = "inprogress";
                }
            } else {
                source.close();
                if (data?.error) {
                    if (!step) {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                    } else {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                        }, 2000)
                    }
                    // Error Message
                    return;
                }
                stepDesc.value[`step${bData.step}Desc`][stepDesc.value[`step${bData.step}Desc`].length-1].status = "done";
            }
        };
        source.onerror = function(error) {
            console.error("Event error", error);
            stepDesc.value[`step${bData.step}Desc`][step].status = "done";
            source.close(); // Close the connection in case of error
        };
        try {
            let installStepData = {
                eventId : evId,
                step: bData.step
            };
            if (bodyData) {
                installStepData = {...installStepData, ...bodyData}
            }
            apiRequest("post", env.INSTALL_MONGO_STEP, installStepData).then((res) => {
                if (res.data.status === true) {
                    if (stepData.value[bData.step]) {
                        source.close();
                        mainStep.value = bData.step;
                        startCallingSteps(stepData.value[bData.step]);
                    } else {
                        source.close();
                        mainStep.value = 100;
                        // setTimeout(() => {
                        //     const OldUrl =  window.location.origin;
                        //     window.location.href = OldUrl + "/admin/";
                        // }, 5000);
                        emit("complete", {
                            status: true,
                            statusText: "MongoDb Connected"
                        });
                    }
                } else {
                    source.close();
                    // Add Error Message
                    $toast.error(`Please check your credentials. ${res.data.error}`,{position: 'top-right'});
                    if (!step) {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                        }, 2000)
                    } else {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                        }, 2000)
                    }
                }
            }).catch((err) => {
                source.close();
                // Add Error Message
                console.error("ERROR IN INSTALL STEP", err);
                stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                setTimeout(() => {
                    stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                }, 2000)
            })
        } catch (error) {
            source.close();
            // Add Error Message
            stepDesc.value[`step${bData.step}Desc`][0].status = "error";
            setTimeout(() => {
                stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
            }, 2000)
        }
    }
    
    function mongoAuthVerifySubmit(data) {
        mainStep.value = 1;
        stepDesc.value.step1Desc[0].subStep = 2;
        stepDesc.value.step1Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[0], data);
    }

    function mongoClusterVerifySubmit(data) {
        mainStep.value = 2;
        stepDesc.value.step2Desc[0].subStep = 2;
        stepDesc.value.step2Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[1], data);
    }

    function mongoNetworkVerifySubmit(data) {
        mainStep.value = 3;
        stepDesc.value.step3Desc[0].subStep = 2;
        stepDesc.value.step3Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[2], data);
    }

    function mongoGenerateDatabaseURLVerifySubmit(data) {
        mainStep.value = 4;
        stepDesc.value.step4Desc[0].subStep = 2;
        stepDesc.value.step4Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[3], data);
    }

    function MongoAppServiceVerifySubmit(data) {
        mainStep.value = 5;
        stepDesc.value.step5Desc[0].subStep = 2;
        stepDesc.value.step5Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[4], data);
    }
    
    function mongoFunctionVerifySubmit(data) {
        mainStep.value = 6;
        stepDesc.value.step6Desc[0].subStep = 2;
        stepDesc.value.step6Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[5], data);
    }

    function mongoAddDefaultUserVerifySubmit(data) {
        mainStep.value = 7;
        stepDesc.value.step7Desc[0].subStep = 2;
        stepDesc.value.step7Desc[0].status = "inprogress";
        startCallingSteps(stepData.value[6], data);
    }
    
    onMounted(() => {
        isMainStep.value = true;
        try {
            apiRequest("get", env.INSTALL_STEP_GET).then((getStepData) => {
                if (getStepData.data.status === true) {
                    stepData.value = getStepData.data.data[1].subStep;
                    const getErrorData = (stepData.value || []).filter((x) => x.status === 'error');
                    if (getErrorData && getErrorData.length) {
                        startCallingSteps(getErrorData[0]);
                        return;
                    }

                    const getInprogressData = (stepData.value || []).filter((x) => x.status === 'inprogress');
                    if (getInprogressData && getInprogressData.length) {
                        startCallingSteps(getInprogressData[0]);
                        return;
                    }
                    const getDoneData = (stepData.value || []).filter((x) => x.status === 'done');

                    if (getDoneData.length === stepData.value.length) {
                        mainStep.value = 100;
                        console.log("All Step Is Done");
                        emit("complete", {
                            status: true,
                            statusText: "MongoDb Connected"
                        });
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 5000);
                        return;
                    }

                    if (!(getDoneData && getDoneData.length) && !(getInprogressData && getInprogressData.length)) {
                        startCallingSteps(stepData.value[0]);
                        return;
                    }
                    if (getDoneData && getDoneData.length && !(getInprogressData && getInprogressData.length)) {
                        startCallingSteps(stepData.value[getDoneData.length]);
                    }
                } else {
                    mainStep.value = 0;
                    isMainStep.value = false;
                }
            }).catch((err) => {
                isMainStep.value = false;
                console.error("ERROR IN INSTALL STEP GET 1: ", err);
            })
        } catch (error) {
            mainStep.value = 0;
            isMainStep.value = false;
            console.error("ERROR IN INSTALL STEP GET 2: ", error);
        }
    })
</script>

<style src="./style.css">
</style>
