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
        </div>
        <div class="install-form" v-if="!mainSpinner">
            <div class="form-group mb-15px">
                <p> <b>App Service:</b> {{ formData.appservicename }}</p>
            </div>
            <div class="form-group">
                <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" :disabled="!isSubmitSend" :class="{'disabled': !isSubmitSend}" @click="handleSubmit" tabindex="3">Submit</button>
            </div>
        </div>
    </div>
</template>
<script setup>

    import { onMounted, defineEmits, ref } from "vue";
    const emit = defineEmits(["complete"]);

    const mainSpinner = ref(true);
    const mainSpinnerErrorMessage = ref("");
    const stepDesc = ref({
        name: "Mongo APP Service",
        subStep: 1
    })
    const formData = ref({
        appservicename: ""
    });
    
    const isSubmitSend = ref(true);
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        stepDesc.value.subStep = 2;
        isSubmitSend.value = true;
        emit("complete", {
            appservicename: formData.value.appservicename,
        });
    }
    onMounted(async () => {
        mainSpinner.value = true;
        try {
            formData.value.appservicename = "alian-"+new Date().getTime();
            mainSpinner.value = false;
            emit("complete", {
                appservicename: formData.value.appservicename,
            });
        } catch (error) {
            console.error("Get App Service Name Error", error?.message || error);
            mainSpinner.value = false;
            mainSpinnerErrorMessage.value = error?.message || error;
        }
    });
</script>
<style scoped>

</style>