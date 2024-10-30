
import { computed } from "vue";
import { useStore } from "vuex";
import { dbCollections, settingsCollectionDocs } from '@/utils/FirebaseCollections';
import { useToast } from 'vue-toast-notification';
import * as mongoQuery from '@/utils/MongoQueries/crudOperations/crudOperations';

export function memberData() {

    const { getters } = useStore();
    const companyUsers = computed(() => {
        return getters['settings/companyUsers'];
    });
    const users = computed(() => getters["users/users"]);
    const $toast = useToast();

    function getCompanyUsers(updatedArray = []){
        const companyUsersData = companyUsers.value ? JSON.parse(JSON.stringify(companyUsers.value)) : [];
        const usersData = users.value ? JSON.parse(JSON.stringify(users.value)) : [];

        let listingArray = [];

        companyUsersData.forEach((data)=>{
            let ind = usersData.findIndex((x) => x._id === data.userId);
            if(ind !== -1) {
                listingArray.push({...data, ...users.value[ind]});
            } else {
                listingArray.push({...data})
            }
        })
        if (updatedArray.length) {
            listingArray = listingArray.map(data => {
                const updatedItem = updatedArray.find(x => x._id === data._id);
                return updatedItem ? {...data, ...updatedItem} : data;
            });
        }
        return listingArray;
    }

    function handleDesignationChanges(changeType, designationKey, designationName, designationsData, ind) {

        if(designationName === "") {
            $toast.error("Designation is required", {position: 'top-right'});
            return;
        }
        let designationInd = designationsData.findIndex(x => x.name.trim().toLowerCase() === designationName.toLowerCase());
        if(designationInd !== -1 && designationInd !== ind) {
            $toast.error("Designation already exists", {position: 'top-right'});
            return;
        }

        let queryObj = {};
        let queryFilter;

        if (changeType === 'add') {
            queryObj.$push = { settings: { key: designationsData.length + 1, name: designationName } };
            queryObj.$set = {
                name: settingsCollectionDocs.DESIGNATIONS,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            queryFilter = { name: settingsCollectionDocs.DESIGNATIONS };
        } else {
            // Update the 'name' of the specific object in the 'settings' array matching the given 'key'
            queryFilter = { 
                name: settingsCollectionDocs.DESIGNATIONS,
                "settings.key": designationKey
            };
            queryObj.$set = {
                "settings.$.name": designationName,
                updatedAt: new Date()
            };
        }

        const query = {
            type: "findOneAndUpdate",
            collection: dbCollections.SETTINGS,
            data: [
                queryFilter,
                queryObj,
                { upsert: true, arrayFilters: queryObj.arrayFilters }
            ]
        };

        mongoQuery.mongodbCrudOperations(query).then(() => {
            if(changeType === "add") {
                designationName = '';
                $toast.success("Designation added successfully", {position: 'top-right'});
            } else {
                $toast.success("Designation updated successfully",{position: 'top-right'});
            }
        })
    }

    function handleRoleChanges (changeType, roleKey = null, ind,roleName,roleData,rolesGetter) {
        if(roleName === "") {
            $toast.error("Role is required",{position: 'top-right'});
            return;
        }
        let roleIndex = roleData.findIndex(x => x.name.trim().toLowerCase() === roleName.toLowerCase());
        if(roleIndex !== -1 && roleIndex !== ind) {
            $toast.error("Role already exists",{position: 'top-right'});
            return;
        }

        let queryObj = {};
        let queryFilter;

        if (changeType === 'add') {
            queryObj.$push = { settings: { key: rolesGetter.length + 1, name: roleName } };
            queryObj.$set = {
                name: settingsCollectionDocs.ROLES,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            queryFilter = { name: settingsCollectionDocs.ROLES };
        } else {
            // Update the 'name' of the specific object in the 'settings' array matching the given 'key'
            queryFilter = { 
                name: settingsCollectionDocs.ROLES,
                "settings.key": roleKey
            };
            queryObj.$set = {
                "settings.$.name": roleName,
                updatedAt: new Date()
            };
        }

        const query = {
            type: "findOneAndUpdate",
            collection: dbCollections.SETTINGS,
            data: [
                queryFilter,
                queryObj,
                { upsert: true, arrayFilters: queryObj.arrayFilters }
            ]
        };

        mongoQuery.mongodbCrudOperations(query).then(() => {
            if(changeType === "add") {
                roleName = '';
                $toast.success("Role added successfully",{position: 'top-right'});
            } else {
                $toast.success("Role updated successfully",{position: 'top-right'});
            }
        })
    }
    
    return {
        getCompanyUsers,
        handleDesignationChanges,
        handleRoleChanges
    }
}