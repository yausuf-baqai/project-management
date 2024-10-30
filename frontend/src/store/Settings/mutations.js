export const mutateRules = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.rawRules.push(data);
    } else if(op === "modified") {
        const index = state.rawRules.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.rawRules[index] = data;
        }
    } else if(op === "removed") {
        const index = state.rawRules.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.rawRules.splice(index, 1);
        }
    }
}

export const mutateArrangedRules = (state, payload) => {
    try {
        let tmpRules = payload;
        let arrangedRules = {};
        tmpRules = tmpRules.sort((x, b) => x.isParent > b.isParent ? -1 : 1);

        tmpRules.forEach((rule) => {
            if(rule.isParent) {
                arrangedRules[rule.key ? rule.key : rule.name.replaceAll(" ", "_").toLowerCase()] = {
                    ...rule
                };
            } else {
                try {
                    let key = tmpRules.filter((x) => x._id === rule.parentId)[0].key
                    arrangedRules[key][rule.key ? rule.key : rule.name.replaceAll("  ", " ").replaceAll(" ", "_").toLowerCase()] = rule;
                } catch (error) {
                    console.error("ERR: ", error.message);
                }
            }
        })

        // ARRANGED RULES
        state.rules = arrangedRules;
    } catch (error) {
        console.error("ERROR arrange rules: ", error);
    }
}

export const mutateArrangeProjectRules = (state, payload) => {
    try {
        const {data,op} = payload;
        if(op === 'added' || op === 'modified'){
            let tmpRules = data;
            let arrangedRules = {};
            tmpRules = tmpRules.sort((x, b) => x.isParent > b.isParent ? -1 : 1);
    
            tmpRules.forEach((rule) => {
                if(rule.isParent) {
                    arrangedRules[rule.key ? rule.key : rule.name.replaceAll(" ", "_").toLowerCase()] = {
                        ...rule
                    };
                } else {
                    try {
                        let key = tmpRules.filter((x) => x._id === rule.parentId)[0].key
                        arrangedRules[key][rule.key ? rule.key : rule.name.replaceAll("  ", " ").replaceAll(" ", "_").toLowerCase()] = rule;
                    } catch (error) {
                        console.error("ERR: ", error.message);
                    }
                }
            })
    
            // ARRANGED RULES
            state.projectRules = arrangedRules;
        }
    } catch (error) {
        console.error("ERROR arrange rules: ", error);
    }
}

export const mutateProjectRules = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        const index = state.projectRawRules.findIndex((rule) => rule._id === data._id);
        if(index === -1){
            state.projectRawRules.push(data);
        }
    } else if(op === "modified") {
        const index = state.projectRawRules.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.projectRawRules[index] = data;
        }
    } else if(op === "removed") {
        const index = state.projectRawRules.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.projectRawRules.splice(index, 1);
        }
    }
}

export const mutateRoles = (state, payload) => {
    const {data,op} = payload

    if(op === "added") {
        state.roles = data
        state.withoutOwnerRoles = data.filter((data) => data.key !== 1);
    } else if(op === "modified") {
        state.roles = data
        state.withoutOwnerRoles = data.filter((data) => data.key !== 1);
    } else if(op === "removed") {
       state.roles = []
       state.withoutOwnerRoles = []
    }
}

export const mutateCompanyUsers = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.companyUsers.push(data);
    } else if(op === "modified") {
        const index = state.companyUsers.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.companyUsers[index] = data;
        }
    } else if(op === "removed") {
        const index = state.companyUsers.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.companyUsers.splice(index, 1);
        }
    }

    if(data.isCurrentUser) {
        state.companyUserDetail = data;
    }
    if(data.roleType === 1) {
        state.companyOwnerDetail = data;
    }
}

export const mutateCompanyUserStatus = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.companyUserStatus = data;
    } else if(op === "modified") {
        state.companyUserStatus = data;
    } else if(op === "removed") {
        state.companyUserStatus = [];
    }
}

export const mutateDesignations = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.designations = data || [];
    } else if(op === "modified") {
        state.designations = data;
    } else if(op === "removed") {
        state.designations = [];
    }
}

export const mutateProjectMilestoneStatus = (state, payload) => {
    state.projectMilestone = payload;
}

export const mutateCompanies = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.companies.push(data);
    } else if(op === "modified") {
        const index = state.companies.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.companies[index] = data;
        }
    } else if(op === "removed") {
        const index = state.companies.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.companies.splice(index, 1);
        }
    }
}

export const mutateSelectedCompany = (state, payload) => {
    state.selectedCompanyId = payload;
}

export const mutateFileExtentions = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.fileExtentions = data;
    } else if(op === "modified") {
            state.fileExtentions = data;
    } else if(op === "removed") {
            state.fileExtentions = [];
    }
}

export const mutateProjectTabComponents = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.projectTabComponents.push(data);
    } else if(op === "modified") {
        const index = state.projectTabComponents.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.projectTabComponents[index] = data;
        }
    } else if(op === "removed") {
        const index = state.projectTabComponents.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.projectTabComponents.splice(index, 1);
        }
    }
}

export const mutateCompanyPriority = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.companyPriority = data;
    } else if(op === "modified") {
        state.companyPriority = data;
    } else if(op === "removed") {
        state.companyPriority = [];
    }
}

export const mutateCompanyDateFormat = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.companyDateFormat = data[0];
    } else if(op === "modified") {
        state.companyDateFormat = data[0];
    } else if(op === "removed") {
        state.companyDateFormat = {};
    }
}

export const mutateNotificationSettings = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.notificationSettings = data;
    } else if(op === "modified") {
        state.notificationSettings = data;
    } else if(op === "removed") {
        state.notificationSettings = {};
    }
}
export const mutateTaskType = (state, payload) =>{
    const {data, op} = payload;

    if(op === "added") {
        const index = state.taskType.findIndex((x) => x._id === data._id);
        if(index === -1) {
            state.taskType.push(data);
        }
    } else if(op === "modified") {
        const index = state.taskType.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.taskType[index] = data;
        }
    } else if(op === "removed") {
        const index = state.taskType.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.taskType.splice(index, 1);
        }
    }
}
export const mutateTaskStatus = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        const index = state.taskStatus.findIndex((x) => x._id === data._id);
        if(index === -1){
            state.taskStatus.push(data);
        }
    } else if(op === "modified") {
        const index = state.taskStatus.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.taskStatus[index] = data;
        }
    } else if(op === "removed") {
        const index = state.taskStatus.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.taskStatus.splice(index, 1);
        }
    }
}
export const mutateCategory = (state, payload) => {
    state.category = payload;
}

export const mutateProjectMilestoneWeeklyRange = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        state.milestoneweeklyrange = data;
    } else if(op === "modified") {
        state.milestoneweeklyrange= data;
    } else if(op === "removed") {
        state.milestoneweeklyrange= "";
    }
}
export const mutateTeams = (state, payload) => {
    const { data, op } = payload;
    if(op === "added") {
        const index = state.teams.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.teams[index] = data;
        } else {
            state.teams.push(data);
        }
    } else if (op === "modified") {
        const index = state.teams.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.teams[index] = data;
        }
    } else if (op === "removed") {
        const index = state.teams.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.teams.splice(index, 1);
        }
    }
}
export const mutateCustomFields = (state, payload) =>{
    state.customFields = payload;
}

export const mutateRestrictedExtensions =(state,payload)=>{
    const {data,op} = payload

    if (op === 'added') {
        state.restrictedExtensions = data;
    } else if(op == 'modified'){
        state.restrictedExtensions = data;
    } else if(op == 'removed'){
        state.restrictedExtensions = []
    }
}

export const mutateFinalCustomFields = (state, payload) =>{
    const {data,op} = payload;
    if(op === 'inital'){
        state.finalCustomFields = data;
    } else if (op === 'added') {
        const index = state.finalCustomFields.findIndex((val)=>val._id === data._id);
        if(index === -1){
            state.finalCustomFields.push(data);
        } 
    } else if(op === "modified") {
        const index = state.finalCustomFields.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.finalCustomFields[index] = data;
        }
    } else if(op == 'removed'){
        const index = state.finalCustomFields.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.finalCustomFields.splice(index,1);
        }
    }
}

export const mutateTimeTrackerDownload = (state, payload) =>{
    state.TimeTracker = payload;
}
export const mutateTaskStatusArray = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        state.TaskStatusArray = data;
    } else if(op === "modified") {
        const index = state.TaskStatusArray._id === data._id;
        if(index == true) {
            state.TaskStatusArray = data;
        }
    }
}
export const setProjectStatusArray = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        state.projectStatusArray = data;
    } else if(op === "modified") {
        const index = state.projectStatusArray._id === data._id;
        if(index == true) {
            state.projectStatusArray = data;
        }
    }
}
export const setCurrencyArray = (state, payload) => {
    state.currencyArray = payload;
}

export const mutateProjectStatus = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        let index = state.projectStaus.findIndex((type) => type._id === data._id);
        if(index === -1){
            state.projectStaus.push(data);
        }
    } else if(op === "modified") {
        const index = state.projectStaus.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.projectStaus[index] = data;
        }
    } else if(op === "removed") {
        const index = state.projectStaus.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.projectStaus.splice(index, 1);
        }
    }
}

export const setTaskTypeArray = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        state.taskTypeArray = data;
    } else if(op === "modified") {
        const index = state.taskTypeArray._id === data._id;
        if(index == true) {
            state.taskTypeArray = data;
        }
    }
}

export const setChargeBeePrice = (state, payload) => {
    state.chargeBeePrice = payload;
}

export const setplanFeatureDisplay = (state, payload) => {
    state.planFeatureDisplay = payload;
}