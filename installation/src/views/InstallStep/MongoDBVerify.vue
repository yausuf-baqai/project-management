<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongodbUrl">Mongodb Url</label>
                        <InputText
                            id="mongodbUrl"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongodbUrl.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongodbUrl,
                            'name':formData.mongodbUrl.name,
                            'validations':formData.mongodbUrl.rules,
                            'type':formData.mongodbUrl.type,
                            'event':$event.event})"
                            @input="formData.mongodbUrl.value = formData.mongodbUrl.value"
                            maxlength="254"
                            ref="mongodbUrl"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongodbUrl.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongoAppId">Mongo App Id</label>
                        <InputText
                            id="mongoAppId"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongoAppId.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongoAppId,
                            'name':formData.mongoAppId.name,
                            'validations':formData.mongoAppId.rules,
                            'type':formData.mongoAppId.type,
                            'event':$event.event})"
                            @input="formData.mongoAppId.value = formData.mongoAppId.value"
                            maxlength="254"
                            ref="mongoAppId"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongoAppId.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongoDbProjectId">MongoDb Project Id</label>
                        <InputText
                            id="mongoDbProjectId"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongoDbProjectId.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongoDbProjectId,
                            'name':formData.mongoDbProjectId.name,
                            'validations':formData.mongoDbProjectId.rules,
                            'type':formData.mongoDbProjectId.type,
                            'event':$event.event})"
                            @input="formData.mongoDbProjectId.value = formData.mongoDbProjectId.value"
                            maxlength="254"
                            ref="mongoDbProjectId"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongoDbProjectId.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongoDbProjectServiceName">MongoDb Project Service Name</label>
                        <InputText
                            id="mongoDbProjectServiceName"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongoDbProjectServiceName.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongoDbProjectServiceName,
                            'name':formData.mongoDbProjectServiceName.name,
                            'validations':formData.mongoDbProjectServiceName.rules,
                            'type':formData.mongoDbProjectServiceName.type,
                            'event':$event.event})"
                            @input="formData.mongoDbProjectServiceName.value = formData.mongoDbProjectServiceName.value"
                            maxlength="254"
                            ref="mongoDbProjectServiceName"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongoDbProjectServiceName.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongoDbProjectPublicAPIKey">MongoDb Project Public API Key</label>
                        <InputText
                            id="mongoDbProjectPublicAPIKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongoDbProjectPublicAPIKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongoDbProjectPublicAPIKey,
                            'name':formData.mongoDbProjectPublicAPIKey.name,
                            'validations':formData.mongoDbProjectPublicAPIKey.rules,
                            'type':formData.mongoDbProjectPublicAPIKey.type,
                            'event':$event.event})"
                            @input="formData.mongoDbProjectPublicAPIKey.value = formData.mongoDbProjectPublicAPIKey.value"
                            maxlength="254"
                            ref="mongoDbProjectPublicAPIKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongoDbProjectPublicAPIKey.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongoDbProjectPrivateAPIKey">MongoDb Project Private API Key</label>
                        <InputText
                            id="mongoDbProjectPrivateAPIKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongoDbProjectPrivateAPIKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongoDbProjectPrivateAPIKey,
                            'name':formData.mongoDbProjectPrivateAPIKey.name,
                            'validations':formData.mongoDbProjectPrivateAPIKey.rules,
                            'type':formData.mongoDbProjectPrivateAPIKey.type,
                            'event':$event.event})"
                            @input="formData.mongoDbProjectPrivateAPIKey.value = formData.mongoDbProjectPrivateAPIKey.value"
                            maxlength="254"
                            ref="mongoDbProjectPrivateAPIKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongoDbProjectPrivateAPIKey.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="mongoDbAppId">MongoDb App Id</label>
                        <InputText
                            id="mongoDbAppId"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongoDbAppId.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongoDbAppId,
                            'name':formData.mongoDbAppId.name,
                            'validations':formData.mongoDbAppId.rules,
                            'type':formData.mongoDbAppId.type,
                            'event':$event.event})"
                            @input="formData.mongoDbAppId.value = formData.mongoDbAppId.value"
                            maxlength="254"
                            ref="mongoDbAppId"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongoDbAppId.error}}</div>
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
        mongodbUrl: {
            value: "",
            rules:
            "required",
            name: "MongoDb Url",
            error: "",
        },
        mongoAppId: {
            value: "",
            rules:
            "required",
            name: "Mongo App Id",
            error: "",
        },
        mongoDbProjectId: {
            value: "",
            rules:
            "required",
            name: "MongoDb Project Id",
            error: "",
        },
        mongoDbProjectServiceName: {
            value: "",
            rules:
            "required",
            name: "MongoDb Project Service Name",
            error: "",
        },
        mongoDbProjectPublicAPIKey: {
            value: "",
            rules:
            "required",
            name: "MongoDb Project Public API Key",
            error: "",
        },
        mongoDbProjectPrivateAPIKey: {
            value: "",
            rules:
            "required",
            name: "MongoDb Project Private API Key",
            error: "",
        },
        mongoDbAppId: {
            value: "",
            rules:
            "required",
            name: "MongoDb App Id",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your MongoDb",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    mongodbUrl: formData.value.mongodbUrl.value.replace(/\/+$/, ""),
                    mongoDbProjectId: formData.value.mongoDbProjectId.value,
                    mongoAppId: formData.value.mongoAppId.value,
                    mongoDbProjectServiceName: formData.value.mongoDbProjectServiceName.value,
                    mongoDbProjectPublicAPIKey: formData.value.mongoDbProjectPublicAPIKey.value,
                    mongoDbProjectPrivateAPIKey: formData.value.mongoDbProjectPrivateAPIKey.value,
                    mongoDbAppId: formData.value.mongoDbAppId.value
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