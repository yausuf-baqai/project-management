<template>
    <div class="formkit__form-wrapper">
        <InputField
            :type="props.type"
            :accept="props.accept"
            :options="props.options"
            :name="props.name"
            :help="props.help"
            :label="props.label"
            :placeholder="props.placeholder"
            :validations="props.validations"
            :validation-visibility="props.validationVisibility"
            @changeUpdate="(val) => emit('changeUpdate',val)"
            @inputUpdate="(val) => emit('inputUpdate',val)"
            @blurUpdate="(val,detail,id) => emit('blurUpdate',val,detail,id)"
            :className="props.className"
            :bindValue="props.bindValue"
            :detail="props.detail"
            :customValidationMessage="props.customValidationMessage"
            :preventDefault="preventDefault"
            :uniqueId="id"
        />
    </div>
</template>

<script setup>
    import InputField from "@/components/atom/FormkitInput/InputField.vue";
    const emit = defineEmits(['blurUpdate','inputUpdate','changeUpdate']);
    const props = defineProps({
        label:{
            type: String,
            default:''
        },
        validations:{
            type: [Array,String],
            default:() =>[]
        },
        type:{
            type: String,
            default: "text"
        },
        placeholder:{
            type: String,
            default: ""
        },
        accept:{
            type: String,
            default: ""
        },
        inputValues:{
            type: Object,
            default:() => {}
        },
        options:{
            type: Array,
            default:() => []
        },
        validationVisibility:{
            type: String,
            default:"blur"
        },
        help:{
            type: String,
            default:""
        },
        name:{
            type: String,
            default:""
        },
        bindValue:{
            type: [String,Array,Number,Boolean],
            default: ''
        },
        detail:{
            type: Object,
            default: () => {}
        },
        className:{
            type: String,
            default: ''
        },
        customValidationMessage:{
            type: Object,
            default: () => {}
        },
        preventDefault:{
            type: Boolean,
            default: false
        },
        id:{
            type: String,
            default: "text"
        }
    });
</script>

<style scoped>
    @import '@/components/atom/CustomFieldInputComponent/style.css';
</style>
