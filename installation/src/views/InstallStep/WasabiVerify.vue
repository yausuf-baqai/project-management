<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="wasabiSecretAccessKey">Wasabi Secret Access Key</label>
                        <InputText
                            id="wasabiSecretAccessKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.wasabiSecretAccessKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.wasabiSecretAccessKey,
                            'name':formData.wasabiSecretAccessKey.name,
                            'validations':formData.wasabiSecretAccessKey.rules,
                            'type':formData.wasabiSecretAccessKey.type,
                            'event':$event.event})"
                            @input="formData.wasabiSecretAccessKey.value = formData.wasabiSecretAccessKey.value"
                            maxlength="254"
                            ref="wasabiSecretAccessKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.wasabiSecretAccessKey.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="wasabiAccessKey">Wasabi Access Key</label>
                        <InputText
                            id="wasabiAccessKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.wasabiAccessKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.wasabiAccessKey,
                            'name':formData.wasabiAccessKey.name,
                            'validations':formData.wasabiAccessKey.rules,
                            'type':formData.wasabiAccessKey.type,
                            'event':$event.event})"
                            @input="formData.wasabiAccessKey.value = formData.wasabiAccessKey.value"
                            maxlength="254"
                            ref="wasabiAccessKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.wasabiAccessKey.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="wasabiUserId">Wasabi UserId</label>
                        <InputText
                            id="wasabiUserId"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.wasabiUserId.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.wasabiUserId,
                            'name':formData.wasabiUserId.name,
                            'validations':formData.wasabiUserId.rules,
                            'type':formData.wasabiUserId.type,
                            'event':$event.event})"
                            @input="formData.wasabiUserId.value = formData.wasabiUserId.value"
                            maxlength="254"
                            ref="wasabiUserId"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.wasabiUserId.error}}</div>
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
        wasabiSecretAccessKey: {
            value: "",
            rules:
            "required",
            name: "Secret Access Key",
            error: "",
        },
        wasabiAccessKey: {
            value: "",
            rules:
            "required",
            name: "Access Key",
            error: "",
        },
        wasabiUserId: {
            value: "",
            rules:
            "required",
            name: "User Id",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your Wasabi",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    wasabiSecretAccessKey: formData.value.wasabiSecretAccessKey.value,
                    wasabiUserId: formData.value.wasabiUserId.value,
                    wasabiAccessKey: formData.value.wasabiAccessKey.value
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