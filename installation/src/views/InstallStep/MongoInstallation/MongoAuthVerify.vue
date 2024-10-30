<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="form-group mb-15px">
                <label for="publicKey">Public Key</label>
                <InputText
                    id="publicKey"
                    class="login-input mt-10"
                    placeHolder="XXXXXXX"
                    v-model="formData.publicKey.value"
                    height="48px"
                    width="calc(100% - 32px)"
                    @keyup="checkErrors({'field':formData.publicKey,
                    'name':formData.publicKey.name,
                    'validations':formData.publicKey.rules,
                    'type':formData.publicKey.type,
                    'event':$event.event})"
                    @input="formData.publicKey.value = formData.publicKey.value"
                    maxlength="254"
                    ref="publicKey"
                    type="text"
                    @enter="handleSubmit"
                />
                <div class="invalid-feedback red">{{formData.publicKey.error}}</div>
            </div>
            <div class="form-group mb-15px">
                <label for="privateKey">Private Key</label>
                <InputText
                    id="privateKey"
                    class="login-input mt-10"
                    placeHolder="XXXXXXX"
                    v-model="formData.privateKey.value"
                    height="48px"
                    width="calc(100% - 32px)"
                    @keyup="checkErrors({'field':formData.privateKey,
                    'name':formData.privateKey.name,
                    'validations':formData.privateKey.rules,
                    'type':formData.privateKey.type,
                    'event':$event.event})"
                    @input="formData.privateKey.value = formData.privateKey.value"
                    maxlength="254"
                    ref="privateKey"
                    type="text"
                    @enter="handleSubmit"
                />
                <div class="invalid-feedback red">{{formData.privateKey.error}}</div>
            </div>
            <div class="form-group">
                <label for="projectId">Project Id</label>
                <InputText
                    id="projectId"
                    class="login-input mt-10"
                    placeHolder="XXXXXXX"
                    v-model="formData.projectId.value"
                    height="48px"
                    width="calc(100% - 32px)"
                    @keyup="checkErrors({'field':formData.projectId,
                    'name':formData.projectId.name,
                    'validations':formData.projectId.rules,
                    'type':formData.projectId.type,
                    'event':$event.event})"
                    @input="formData.projectId.value = formData.projectId.value"
                    maxlength="254"
                    ref="projectId"
                    type="text"
                    @enter="handleSubmit"
                />
                <div class="invalid-feedback red">{{formData.projectId.error}}</div>
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
        publicKey: {
            value: "",
            rules:
            "required",
            name: "Public key",
            error: "",
        },
        privateKey: {
            value: "",
            rules:
            "required",
            name: "Private key",
            error: "",
        },
        projectId: {
            value: "",
            rules:
            "required",
            name: "Project id",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Mongo Auth",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    publicKey: formData.value.publicKey.value,
                    privateKey: formData.value.privateKey.value,
                    projectId: formData.value.projectId.value
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