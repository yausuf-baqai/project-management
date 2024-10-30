<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div v-if="!mainSpinner && mainSpinnerErrorMessage">
                <p style="text-align: center; color: red;">
                    {{ mainSpinnerErrorMessage }}
                </p>
            </div>
            <div class="text-center" v-if="mainSpinner">
                <img :src="inProgressImg" />
            </div>
        </div>
    </div>
</template>
<script setup>
    import { onMounted, defineEmits, ref } from "vue";
    // import Swal from 'sweetalert2';
    import * as env from '@/config/env';
    const emit = defineEmits(["complete"]);
    import { apiRequest } from "../../../services";
    import inProgressImg from "@/assets/images/svg/inprogress.gif";

    const mainSpinner = ref(true);
    const mainSpinnerErrorMessage = ref("");
    const stepDesc = ref({
        name: "Mongo NetWork Setting",
        subStep: 1
    })
    onMounted(async () => {
        mainSpinner.value = true;
        try {
            apiRequest("get", env.MONGO_NETWORK_GET_AND_ADD).then((mongoNetork) => {
                if (mongoNetork?.data?.status) {
                    mainSpinner.value = false;
                    emit("complete", {status: true, statusText: "Mongo Network Connected"});
                } else {
                    console.error("Get And Add Mongo Network Error 0", mongoNetork?.data?.error);
                    mainSpinner.value = false;
                    mainSpinnerErrorMessage.value = mongoNetork?.data?.error;
                    emit("complete", {status: false, error: "MongoDb Network Access Error; please contact the administrator"});
                }
            }).catch((err) => {
                console.error("Get And Add Mongo Network Error 1", err);
                mainSpinner.value = false;
                mainSpinnerErrorMessage.value = err;
                emit("complete", {status: false, error: "MongoDb Network Access Error; please contact the administrator"});
            })
        } catch (error) {
            console.error("Get And Add Mongo Network Error 2", error?.message || error);
            mainSpinner.value = false;
            mainSpinnerErrorMessage.value = error?.message || error;
            emit("complete", {status: false, error: "MongoDb Network Access Error; please contact the administrator"});
        }
    });
</script>
<style scoped>

</style>