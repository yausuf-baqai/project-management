<template>
    <div :class="props.className">
        <FormKit
            :type="props.type"
            :id="Id"
            :delay="200"
            :accept="props.accept"
            v-model="inputValue"
            :options="props.options"
            :name="props.name"
            :help="props.help"
            :label="props.label"
            :placeholder="props.placeholder"
            :validation="props.validations"
            :validation-visibility="props.validationVisibility"
            :multiple="(type=='file') || (label=='accept')"
            @change="emit('changeUpdate',inputValue)"
            @keypress="handleFunction"
            @blur="emit('blurUpdate',inputValue,props.detail,Id)"
            :plugins="props.type === 'dropdown' ? [] : [inputUpdateValue]"
            :validation-messages="props.customValidationMessage && Object.keys(props.customValidationMessage).length ? props.customValidationMessage : ''"
            @keydown="preventArrowDown"
            autocomplete="off"
        >
            <template #label v-if="toopTipHover">
                <div class="formkit-label__wrapper">
                    <label class="formkit-label">
                        <img class="custom__field-image" :src="props.detail.fieldImageGrey">
                        <ToolTip
                            :label="props.label"
                            :descriptions="props?.detail?.fieldDescription"
                        />
                    </label>
                    <span>
                        <img @click="handleEdit" :src="editIconImage" class="formkit-label__image pr-22px cursor-pointer" />
                    </span>
                </div>
            </template>
        </FormKit>
    </div>
</template>
<script setup>
    import { onMounted, ref, watch } from "vue";
    import {FormKit} from '@formkit/vue';
    import { useCustomComposable } from "@/composable";
    import ToolTip from "@/components/molecules/ToolTip/ToolTip.vue";    
    import { ValidationFunction } from "@/composable/DefaultValidationFunction";

    const {makeUniqueId} = useCustomComposable();
    const emit = defineEmits(['blurUpdate','inputUpdate','changeUpdate','handleEdit']);
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
            type: [String,Array,Number,Boolean,Object],
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
        toopTipHover:{
            type: Boolean,
            default: false
        },
        uniqueId:{
            type: String,
            default: ""
        },
        isFocus:{
            type: Boolean,
            default: false
        }
    });
    

    const inputValue = ref(props.bindValue);
    const Id = ref(props.uniqueId ? props.uniqueId : makeUniqueId(5));
    const editIconImage = require("@/assets/images/editing.png");

    onMounted(()=>{
        if(props.isFocus){
            setTimeout(() => {
                document.getElementById(`${Id.value}`).focus();
            });
        }
    });

    watch(()=> props.bindValue,(val) =>{
        inputValue.value = val;
    });
    const inputUpdateValue = (node) => {
        node.hook.input((value,next)=>{
            emit('inputUpdate',next(value))
            return next(value);
        });
    }
    const handleFunction = (event) => {
        if(props.preventDefault){
            ValidationFunction.onlyNumberWithoutDecimal(event);
        }
    }
    const preventArrowDown = (event) => {
        if(props.preventDefault){
            if (event.keyCode === 40 || event.keyCode === 38) {
                event.preventDefault();
            }
        }
    }
    const handleEdit = () => {
        emit('handleEdit',props?.detail)
    };
</script>
<style>
    @import '@/components/atom/FormkitInput/style.css';
</style>