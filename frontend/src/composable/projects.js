import { dbCollections } from "@/utils/FirebaseCollections"
import moment from 'moment';
import { useConvertDate, useGetterFunctions } from "@/composable";
import { inject } from "vue";
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import { BSON } from "realm-web";
import { computed } from "vue";
import { useStore } from "vuex";
const { convertDateFormat } = useConvertDate();
export function useProjects() {
	const {getUser} = useGetterFunctions()
	const uid = inject("$userId");
	const {getters} = useStore();

	/**
	 * This function is used to manage "Mark as Favorites" functionality for the projects
	 * @param {*} param
	 * @returns
	 */
	function markFavourite({projectId = "", userId = "", data = null}) {

		return new Promise((resolve, reject) => {
			try {
				let obj;
				if (data === null) {
					obj = [
						{ _id: BSON.ObjectID(projectId) },
						{ $push: { favouriteTasks: { userId: userId } } },
						false, // Upsert
						true, // Multi
					];
				} else {
					obj = [
						{ _id: BSON.ObjectID(projectId) },
						{ $pull: { favouriteTasks: { userId: userId } } },
						false, // Upsert
						true, // Multi
					];
				}

				const query = {
					type: "updateOne",
					collection: dbCollections.PROJECTS,
					data: obj
				};


				const queryRef = mongoQuery.mongodbCrudOperations(query);
				queryRef.then(() => {
					resolve(`${!data ? "Added to" : "Removed from"} favorite`);
				})
			} catch (error) {
				reject(error)
			}
		})
	}
	function getDateType (seconds) {
		try {
			let timeformat = getUser(uid.value)?.timeFormat || "hh:mm A";
			if (timeformat == "12") {
				return moment(new Date(seconds)).format("hh:mm A");
			} else {
				return moment(new Date(seconds)).format("HH:mm");
			}
		} catch (error) {
			console.error("Error",error)
		}
	}
	function getDateAndTime (seconds) {
		try {
			let timeformat = getUser(uid.value)?.timeFormat || "hh:mm A";
			if (timeformat == "12") {
				return `${convertDateFormat(seconds,'',{showDayName: false})}, ${moment(new Date(seconds)).format(`hh:mm A`)}`;
			} else {
				return `${convertDateFormat(seconds,'',{showDayName: false})}, ${moment(new Date(seconds)).format(`HH:mm`)}`;
			}
		} catch (error) {
			console.error("Error",error)
		}
	}

	function checkProjectPlan(requestFor) {
		const currentCompany = computed(() => getters['settings/selectedCompany']);
		if(currentCompany.value?.planFeature === undefined){
			return false;
		}
		let maxProject = currentCompany.value?.planFeature?.project;
		let projectCount = currentCompany.value?.projectCount?.projectCount || 0;
		if(maxProject === null) {
			//request specific type
			return checkSpecificTypeCount(requestFor);
		} else {
			let mainAvailable = maxProject - projectCount;

			if(mainAvailable) {
				//request specific type
				return checkSpecificTypeCount(requestFor);
			} else {
				return false
			}
		}
	}
	function checkSpecificTypeCount(requestFor) {
		const currentCompany = computed(() => getters['settings/selectedCompany']);
		let maxPublicProject = currentCompany.value?.planFeature?.maxPublicProject;
		let maxPrivateProject = currentCompany.value?.planFeature?.maxPrivateProject;
		let projectPublicCount = currentCompany.value?.projectCount?.publicCount || 0;
		let projectPrivateCount = currentCompany.value?.projectCount?.privateCount || 0;
		if(requestFor === 'public') {
			if(maxPublicProject === null) {
				return true
			} else {
				let available = maxPublicProject - projectPublicCount
	
				if(available > 0) {
					return true
				} else {
					return false
				}
			}
		} else if(requestFor === 'private') {
			if(maxPrivateProject === null) {
				return true
			} else {
				let available = maxPrivateProject - projectPrivateCount
	
				if(available > 0) {
					return true
				} else {
					return false
				}
			}
		}
	}
	return {
		markFavourite,
		getDateType,
		getDateAndTime,
		checkProjectPlan,
		checkSpecificTypeCount
	}
}