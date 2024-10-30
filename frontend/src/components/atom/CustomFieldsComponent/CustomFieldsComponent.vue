<template>
    <FormKit
        type="form"
        :form-class="submitted ? 'hide' : 'show'"
        @submit="handleSubmit"
        :actions="false"
        ref="myForm"
    >
        <component
            :is="getView(props.componentDetail.cfType)"
            :tabIndex="props.tabIndex"
            :componentDetail="props.componentDetail"
            :customFieldObject="props.customFieldObject"
            @handleFunction="(val,isEdit) => emit('handleFunction',val,isEdit)"
            @tabIndexUpdate="(val) => emit('tabIndexUpdate',val)" 
            ref="childRef"
        />
        <div class="custom_field-btn">
            <FormKit type="button" @click="handleTabCheck" label="Cancel" />
            <FormKit type="submit" @click="handleTab" label="Save" :disabled="submitted" />
        </div>
    </FormKit>
</template>

<script setup>
    //import
    import { ref} from "vue";
    import {FormKit} from '@formkit/vue';
    import TextComponent from "@/components/molecules/TextComponent/TextComponent.vue";
    import CheckboxCustomField from "@/components/molecules/CheckboxCustomField/CheckboxCustomField.vue";
    import PhoneComponent from "@/components/molecules/PhoneComponent/PhoneComponent.vue";
    import DropdownCustomField from "@/components/molecules/DropdownCustomField/DropdownCustomField.vue";
    import DateComponentCF from "@/components/molecules/DateComponent/DateComponent.vue";
    import MoneyComponent from "@/components/molecules/MoneyComponent/MoneyComponent.vue";
    import TextareaComponent from "@/components/molecules/TextareaComponent/TextareaComponent.vue";
    import NumberComponent from "@/components/molecules/NumberComponent/NumberComponent.vue";
    import EmailComponent from "@/components/molecules/EmailComponent/EmailComponent.vue";

    //emit
    const emit = defineEmits(['handleFunction','tabIndexUpdate','closeSidebar']);

    //props
    const props = defineProps({
        tabIndex:{
            type: Number,
            default:1
        },
        componentDetail:{
            type: Object,
            default:() => {}
        },
        customFieldObject:{
            type: Object,
            default:() => {}
        }
    });

    // ref
    const myForm = ref();
    const submitted = ref(false);
    const childRef = ref();

    //function
    // save function
    const handleSubmit = async (object) => {
        if(props.componentDetail.cfType == "text" || props.componentDetail.cfType == "textarea") {
            if(object.fieldMinimum && object.fieldMaximum && Number(object.fieldMaximum) < Number(object.fieldMinimum)){
                return;
            }
        }
        childRef.value.handleSubmitComp(object);
        await new Promise((r) => setTimeout(r, 1000));
        submitted.value = true;
    };

    // cancel function
    const handleTabCheck = () => {
       emit('closeSidebar',false)
    };

    // tab validation check
    const handleTab = () => {            
        const node = myForm.value.node;
        childRef.value.handleTabComp(node);
    };

    //component
    const getView = (val) => {
        switch(val) {
            case 'text':
                return TextComponent;           
            case 'checkbox':
                return CheckboxCustomField;
            case 'dropdown':
                return DropdownCustomField;
            case 'date':
                return DateComponentCF;        
            case 'money':
                return MoneyComponent;
            case 'textarea':
                return TextareaComponent;
            case 'number':
                return NumberComponent;
            case 'phone':
                return PhoneComponent;
            case 'email':
                return EmailComponent;
        }
    }; 
</script>
<style scoped>
    @import "@/components/atom/CustomFieldsComponent/style.css"; 
</style>
