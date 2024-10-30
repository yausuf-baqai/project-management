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
        <div class="install-form" v-if="!mainSpinner && isDisplayCreateButton">
            <div class="form-group mb-15px">
                <p> <b>Email:</b> {{ formData.useremail }}</p>
            </div>
            <div class="form-group mb-15px">
                <p> <b>Password:</b> {{ formData.userpassword }}</p>
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
    const isDisplayCreateButton = ref(true);
    const mainSpinnerErrorMessage = ref("");
    const stepDesc = ref({
        name: "Add Default User",
        subStep: 1
    })
    const formData = ref({
        useremail: "",
        userpassword: ""
    });
    
    const isSubmitSend = ref(true);
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        stepDesc.value.subStep = 2;
        isSubmitSend.value = true;
        emit("complete", {
            useremail: formData.value.useremail,
            userpassword: formData.value.userpassword
        });
    }
    onMounted(async () => {
        mainSpinner.value = true;
        try {
            formData.value.useremail = "alianhubadmin"+new Date().getTime()+"@gmail.com";
            formData.value.userpassword = Math.random().toString(36).slice(2, 16);
            mainSpinner.value = false;
            emit("complete", {
                useremail: formData.value.useremail,
                userpassword: formData.value.userpassword
            });
        } catch (error) {
            console.error("Get Default User Error 2", error?.message || error);
            mainSpinner.value = false;
            mainSpinnerErrorMessage.value = error?.message || error;
        }
    });
</script>
<style scoped>

</style>