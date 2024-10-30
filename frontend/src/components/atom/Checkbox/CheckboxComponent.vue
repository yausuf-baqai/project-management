<template>
    <div class="main-checkbox-component">
        <input
            type="checkbox"
            class="checkbox-input"
            :id="id"
            v-model="model"
            :value="value"
            :class="customClasses"
        />
        <label :for="id">{{ text }}</label>
    </div>
</template>

<script setup>
// Packages
import { computed, defineProps, defineEmits } from "vue";

//Props
const props = defineProps({
    id: { type: [String] },
    text: { type: [String] },
    modelValue: { type: [Boolean, Object, Array, String, Number] },
    value: { type: [Boolean, Object, Array, String, Number] },
    customClasses: { type: [String] },
});

// Emits
const emits = defineEmits(["update:modelValue"]);

// Computed properties
const model = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits("update:modelValue", value);
    },
});

</script>
<style src="./style.css" scoped/>