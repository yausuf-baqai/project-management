<template>
	<div
		class="toggle"
		:style="`width: ${width}px; height: ${width%2 === 0 ? (width/2) : (width/2 + 1)}px; ${modelValue ? activeColor ? `background-color: ${activeColor}` : '' : inActiveColor ? `background-color: ${inActiveColor}` :''}`"
		:class="{'bg-lowlight-gray': !modelValue, 'bg-green': modelValue}"
		@click.stop="toggle(), $emit('click', modelValue)"
	>
		<div
			class="toggle-button bg-white"
			:style="{
				'width': (width%2 === 0 ? (width/2 - 2) : (width/2 - 1))+'px',
				'height': (width%2 === 0 ? (width/2 - 2) : (width/2 - 1))+'px',
				left: (width%2 === 0 ? !modelValue ? '1px' : width/2+1+'px' : !modelValue ? '1px' : width/2+'px'),
			}"
			:class="{'toggle-button-active': modelValue}">
		</div>
	</div>
</template>

<script setup>
// PACKAGES
import { defineComponent, defineProps, defineEmits, watch } from "vue";

// EMITS
const emit = defineEmits(["update:modelValue", "change", "click"]);

// PROPS
const props = defineProps({
  modelValue: {
	type: Boolean,
	default: false,
  },
  width: {
	type: [Number, String],
	default: 30,
  },
  disabled: {
	type: Boolean,
	default: false,
  },

  activeColor: {
	type: String,
	default: null,
  },
  inActiveColor: {
	type: String,
	default: null,
  }
});

// COMPONENT
defineComponent({
  name: "Toggle-Input"
})

watch(() => props.modelValue, (newVal, oldVal) => {
	if(newVal !== oldVal) {
		emit('change')
	}
})

function toggle() {
	if(props.disabled) return;
	emit("update:modelValue", !props.modelValue);
}
</script>

<style>
@import "./style.css";
</style>