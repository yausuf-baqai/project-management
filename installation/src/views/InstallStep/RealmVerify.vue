<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="adminUserEmailRealm">Admin User Email Realm</label>
                        <InputText
                            id="adminUserEmailRealm"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.adminUserEmailRealm.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.adminUserEmailRealm,
                            'name':formData.adminUserEmailRealm.name,
                            'validations':formData.adminUserEmailRealm.rules,
                            'type':formData.adminUserEmailRealm.type,
                            'event':$event.event})"
                            @input="formData.adminUserEmailRealm.value = formData.adminUserEmailRealm.value"
                            maxlength="254"
                            ref="adminUserEmailRealm"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.adminUserEmailRealm.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="adminUserPasswordRealm">Admin User Password Realm</label>
                        <InputText
                            id="adminUserPasswordRealm"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.adminUserPasswordRealm.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.adminUserPasswordRealm,
                            'name':formData.adminUserPasswordRealm.name,
                            'validations':formData.adminUserPasswordRealm.rules,
                            'type':formData.adminUserPasswordRealm.type,
                            'event':$event.event})"
                            @input="formData.adminUserPasswordRealm.value = formData.adminUserPasswordRealm.value"
                            maxlength="254"
                            ref="adminUserPasswordRealm"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.adminUserPasswordRealm.error}}</div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" :disabled="!isSubmitSend" :class="{'disabled': !isSubmitSend}" @click="handleSubmit" tabindex="3">Submit</button>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { defineEmits, ref } from "vue";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import { useValidation } from "@/composable/Validation.js";
    const  { checkErrors , checkAllFields } = useValidation();
    const emit = defineEmits(["complete"]);

    const formData = ref({
        adminUserEmailRealm: {
            value: "",
            rules:
            "required",
            name: "Admin User Email",
            error: "",
        },
        adminUserPasswordRealm: {
            value: "",
            rules:
            "required",
            name: "Admin User Password",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your Realm",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    adminUserEmailRealm: formData.value.adminUserEmailRealm.value,
                    adminUserPasswordRealm: formData.value.adminUserPasswordRealm.value
                });
            } else {
                stepDesc.value.subStep = 1;
                isSubmitSend.value = true;
            }
        })
    }
</script>
<style scoped>

</style>