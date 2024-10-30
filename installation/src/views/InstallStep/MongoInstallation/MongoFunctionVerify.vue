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
    const emit = defineEmits(["complete"]);
    import inProgressImg from "@/assets/images/svg/inprogress.gif";

    const mainSpinner = ref(true);
    const mainSpinnerErrorMessage = ref("");
    const stepDesc = ref({
        name: "Add MongoDB Function",
        subStep: 1
    })
    onMounted(async () => {
        mainSpinner.value = true;
        try {
            emit("complete", {status: true, statusText: "Mongo Function Connected"});
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