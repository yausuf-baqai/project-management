<template>
	<div class="position-re d-flex align-items-center w-100" :class="[{'empty-error-text': listName.error}]">
		<div class="position-re w-100">
			<input
				:id="id"
				type="text"
				class="form-control"
				:style="[{padding : clientWidth <=767 ? '13px 10px' : '0px 10px'}]"
				:max-length="50"
				v-model.trim="listName.value"
				:placeholder="createSprint ? 'Enter sprint name' : 'Enter directory name'"
				@keypress.enter="createSprint ? createEditSprint($event.value) : createEditFolder($event.value)"
				@keyup="checkErrors({'field':listName,
				'name':listName.name,
				'validations':listName.rules,
				'type':listName.type,
				'event':$event.event})"
				:isDirectFocus="true"
			>
			<span class="position-ab d-flex align-items-center bg-white pl-10px" :style="[{padding : clientWidth>767 ? '4px 10px' : '9px 10px', top : clientWidth>767 ? '4px' : '9px', right : clientWidth>767 ? '1px' : '5px'}]">
				<img :src="greenMarkIcon" alt="greenMarkIcon" class="cursor-pointer mr-10px green__mark-icon" @click.stop="createSprint ? createEditSprint(listName.value) : createEditFolder(listName.value)">
				<img :src="closeRedIcon" alt="closeRedIcon" class="cursor-pointer"  @click="$emit('cancel')">
			</span>
			<div class="red position-ab z-index-1 font-size-11 listname_error">{{listName.error}}</div>
		</div>
	</div>
</template>

<script setup>
// PACKAGE
import { computed, ref, defineEmits, defineProps, inject, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { useCustomComposable, useGetterFunctions } from "@/composable";
import { useValidation } from "@/composable/Validation";
import * as env from '@/config/env';
import { useToast } from "vue-toast-notification";
import { apiRequest } from '../../../services';

// UTILS
const userId = inject('$userId');
const companyId = inject('$companyId');
const clientWidth = inject("$clientWidth");
const projectData = inject('selectedProject');
const {getters} = useStore();
const  { checkErrors , checkAllFields } = useValidation();
const {getUser} = useGetterFunctions();
const {makeUniqueId} = useCustomComposable();
const $toast = useToast();

// IMAGES
const greenMarkIcon = require("@/assets/images/svg/right_tick_green.svg");
const closeRedIcon = require("@/assets/images/svg/delete_cross_icon.svg");

const emit = defineEmits(["cancel"]);
const id = makeUniqueId();

const props = defineProps({
	item: {
		type: Object,
		default: null
	},

	createFolder: {
		type: Boolean,
		default: true
	},
	createSprint: {
		type: Boolean,
		default: true
	},
	folder: {
		type: Object,
		default: null
	},
	subItems: {
		type: Array,
		default: () => []
	}
})

const inProgress = ref(false);

const listName = ref({
	value: "",
	rules:
	"required | min: 3",
	name: "name",
	error: "",
});
onMounted(() => {
	listName.value.value = props.item ? props.item.name : "";

	nextTick(() => {
		document.getElementById(id).focus();
	})
})

const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
})

// SPRINT OPERATIONS
function createEditSprint() {
	if(inProgress.value) {
		return
	}
	inProgress.value = true;
	if(listName?.value?.value?.length) {
		listName.value.value = listName.value.value.trim();
	}

	checkAllFields({listName: listName.value})
	.then((valid) => {
		if(valid) {

			let sprintIndex = -1;
			if(props.item !== null) {
				if(listName.value.value === props.item.name.trim()) {
					$toast.success(`Nothing to update`, {position: "top-right"});
					inProgress.value = false;
					return;
				}
				sprintIndex = props.subItems.filter((x) => x.deletedStatusKey !== 1).findIndex((x) => x.name?.toLowerCase() === listName.value.value.toLowerCase() && x.id !== props.item.id)
			} else {
				sprintIndex = props.subItems.filter((x) => x.deletedStatusKey !== 1).findIndex((x) => x.name?.toLowerCase() === listName.value.value.toLowerCase())
			}

			if(sprintIndex !== -1) {
				$toast.error(`Sprint already exists`, {position: "top-right"});
				inProgress.value = false;
				return;
			}

			let user = getUser(userId.value);

			const axiosData = {
				companyId: companyId.value,
				projectId: projectData.value._id,
				sprintName: listName.value.value,
				userData: {
					id: user.id,
					Employee_Name: user.Employee_Name,
					companyOwnerId: companyOwner.value.userId
				},
				projectName: projectData.value.ProjectName
			}

			if(props.folder) {
				axiosData.folder = {
					folderId: props.folder.folderId,
					folderName: props.folder.folderName
				}
			} else {
				axiosData.folder = null
			}

			let endPoint = "";
			if(props.item !== null) {
				endPoint = env.SPRINT+"/"+props.item.id;
				axiosData.prevData = props.item;
			} else {
				endPoint = env.SPRINT;
			}
			apiRequest(props.item !== null ? "patch" : "post", endPoint, {
					...axiosData,
					type: props.item !== null ? "editSprintName" : "addSprint",
			})
			.then(() => {
				$toast.success(`Sprint ${props.item !== null ? 'updated' : 'created'} successfully`, {position: "top-right"})
				if(props.item !== null) {
					emit('cancel');
				} else {
					listName.value.value = "";
					listName.value.error = "";
				}
				inProgress.value = false;
			})
			.catch((err) => {
				inProgress.value = false;
				$toast.error(`Something went wrong`, {position: "top-right"})
				emit('cancel');
				console.error("Error: ", err);
			})
		} else {
			inProgress.value = false;
		}
	})
	.catch((error) => {
		inProgress.value = false;
		console.error("ERROR in validation: ", error);
	})

}

// FOLDER OPERATIONS
function createEditFolder() {
	if(inProgress.value) {
		return
	}
	inProgress.value = true;
	if(!listName?.value?.value?.length) {
		listName.value.value = listName.value.value.trim();
	}

	checkAllFields({listName: listName.value})
	.then((valid) => {
		if(valid) {
			let folderIndex = -1;
			if(props.item !== null) {
				if(listName.value.value === props.item.name.trim()) {
					$toast.success(`Nothing to update`, {position: "top-right"});
					inProgress.value = false;
					return;
				}
				folderIndex = props.subItems.findIndex((x) => x.name?.toLowerCase() === listName.value.value.toLowerCase() && x.folderId !== props.item.id)
			} else {
				folderIndex = props.subItems.findIndex((x) => x.name?.toLowerCase() === listName.value.value.toLowerCase())
			}

			if(folderIndex !== -1) {
				$toast.error(`Folder already exists`, {position: "top-right"});
				inProgress.value = false;
				return;
			}

			let user = getUser(userId.value);
			const axiosData = {
				companyId: companyId.value,
				projectId: projectData.value._id,
				folderName: listName.value.value,
				userData: {
					id: user.id,
					Employee_Name: user.Employee_Name,
					companyOwnerId: companyOwner.value.userId
				},
				projectName: projectData.value.ProjectName
			}

			let endPoint = "";
			if(props.item !== null) {
				endPoint = env.FOLDER+"/"+props.item.id;
				axiosData.prevFolderName = props.item.name;
			} else {
				endPoint = env.FOLDER;
			}
			apiRequest(props.item !== null ? "patch" : "post", endPoint, {
					...axiosData,
					type: props.item !== null ? "editFolderName" : "addFolder",
			})
			.then(() => {
				$toast.success(`Folder ${props.item !== null ? 'updated' : 'created'} successfully`, {position: "top-right"})
				if(props.item !== null) {
					emit('cancel');
				} else {
					listName.value.value = "";
					listName.value.error = "";
				}
				inProgress.value = false;
			})
			.catch((err) => {
				$toast.error(`Something went wrong`, {position: "top-right"})
				emit('cancel');
				inProgress.value = false;
				console.error("Error: ", err);
			})
		} else {
			inProgress.value = false;
		}
	})
	.catch((error) => {
		inProgress.value = false;
		console.error("ERROR in validation: ", error);
	})
}
</script>

<style scoped>
.empty-error-text {
    margin-bottom: 17px;
}
.listname_error{
	bottom: -14px; 
	left: 0px;
}
.green__mark-icon{
	width: 15px !important;
}

@media(max-width: 767px){
	.sprint-input-tag {height: auto !important;padding: 6px 15px;font-size: 16px;line-height: 26px;}
	.sprint-input-tag::placeholder{font-size: 16px;}
	.empty-error-text {margin-bottom: 10px;}
}
</style>
