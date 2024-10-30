export const mutateMongoUpdatedTask = (state, payload) => {
    state.mongoUpdatedTask = payload;
}

export const mutateProjects = (state, payload) => {
    if(!payload || !payload.length) return;

    const sortObject = (object = {}) => {
        let obj = {};
        Object.values(object).sort((a, b) => a?.createdAt?.seconds > b?.createdAt?.seconds ? -1 : 1).forEach((x) => {
            obj[x.id] = x;
        });

        return obj;
    }

    payload.forEach((x) => {
        const {snap, privateSnap, op, data, userId, roleType } = x;
        if(Object.keys(state.allProjects).length) {
            if(privateSnap && state.allProjects.privateSnap === null) {
                state.allProjects.privateSnap = snap;
            } else if(!privateSnap && state.allProjects.publicSnap === null) {
                state.allProjects.publicSnap = snap;
            }
        }

        if(op === "added") {
            if(!Object.keys(state.allProjects).length) {
                // NO PROJECTS FOUND
                state.allProjects = {
                    data: [data]
                }

                if(privateSnap) {
                    state.allProjects.privateSnap = snap;
                    state.allProjects.publicSnap = null;
                } else {
                    state.allProjects.privateSnap = null;
                    state.allProjects.publicSnap = snap;
                }
            } else {
                data.sprintsObj = sortObject(data.sprintsObj);

                if(data.sprintsfolders && Object.keys(data.sprintsfolders).length) {
                    Object.keys(data.sprintsfolders).forEach((key) => {
                        data.sprintsfolders[key].sprintsObj = sortObject(data.sprintsfolders[key]?.sprintsObj);
                    })
                }
                state.allProjects.data.push(data);
            }
        } else if(op === "modified") {
            const index = state.allProjects.data.findIndex((x) => x._id === data._id);
            if(index !== -1) {
                if (!data.sprintsfolders) {
                    data.sprintsfolders = {};
                }
                if([1, 2].includes(roleType)) {
                    data.sprintsObj = sortObject({...state.allProjects.data[index].sprintsObj, ...data.sprintsObj});
                    let object = {...state.allProjects.data[index].sprintsfolders, ...data.sprintsfolders};
                    if(object && Object.keys(object || {}).length) {
                        Object.keys(object || {}).forEach((key) => {
                            if (!data.sprintsfolders[key]) {
                                data.sprintsfolders[key] = {};
                            }
                            data.sprintsfolders[key] = {...object[key], sprintsObj : sortObject(object[key]?.sprintsObj)};
                        })
                    }
                    state.allProjects.data[index] = data;
                } else {
                    if((data.isPrivateSpace && !data.AssigneeUserId.includes(userId))) {
                        state.allProjects.data.splice(index, 1);
                    } else {
                        data.sprintsObj = sortObject({...state.allProjects.data[index].sprintsObj, ...data.sprintsObj});
                        let object = {...state.allProjects.data[index].sprintsfolders, ...data.sprintsfolders};
                        if(object && Object.keys(object || {}).length) {
                            Object.keys(object || {}).forEach((key) => {
                                if (!data.sprintsfolders[key]) {
                                    data.sprintsfolders[key] = {};
                                }
                                data.sprintsfolders[key] = {...object[key], sprintsObj : sortObject(object[key]?.sprintsObj)};
                            })
                        }
                        state.allProjects.data[index] = data;
                    }
                }
            } else {
                data.sprintsObj = sortObject({...state.allProjects.data[index].sprintsObj, ...data.sprintsObj});

                let object = {...state.allProjects.data[index].sprintsfolders, ...data.sprintsfolders};
                if(object && Object.keys(object || {}).length) {
                    Object.keys(object || {}).forEach((key) => {
                        if (!data.sprintsfolders[key]) {
                            data.sprintsfolders[key] = {};
                        }
                        data.sprintsfolders[key] = {...object[key], sprintsObj : sortObject(object[key]?.sprintsObj)};
                    })
                }
                state.allProjects.data.push(data);
            }
        } else if(op === "removed") {
            const index = state.allProjects.data.findIndex((x) => x._id === data._id);
            if(index !== -1) {
                state.allProjects.data.splice(index, 1);
            }
        }
    })
}

export const mutateCurrentProjectTasks = (state, payload) => {
    if(JSON.stringify(state.currentProjectTasks) !== JSON.stringify(payload)) {
        state.currentProjectTasks = payload;
    }
}

export const mutateCurrentProjectDetails = (state, payload) => {
    if(JSON.stringify(state.currentProjectDetails) !== JSON.stringify(payload)) {
        state.currentProjectDetails = payload;
    }
}

export const mutateTaskItems = (state, payload) => {
    state.items = payload;
}

function returnItemCountDetails(tasks, groupBy, updatedFields = null, taskId) {
    const obj = {};

    let removeCountValue;
    const today = new Date().setHours(0, 0, 0, 0)/1000;
    let over;
    let next;
    switch(groupBy.type) {
        case 0:
            removeCountValue = tasks?.find((x) => x._id === taskId)?.statusKey
            if(updatedFields?.statusKey) {
                obj.addKey = groupBy.items?.find((x) => x.value === updatedFields.statusKey)?.key
                obj.removeKey = groupBy.items?.find((x) => x.value === removeCountValue)?.key
            }
            break;
        case 1:
            break;
        case 2:
            removeCountValue = tasks?.find((x) => x._id === taskId)?.Task_Priority
            if(updatedFields?.Task_Priority) {
                obj.addKey = groupBy.items?.find((x) => x.value === updatedFields.Task_Priority)?.key
                obj.removeKey = groupBy.items?.find((x) => x.value === removeCountValue)?.key
            }
            break;
        case 3:
            removeCountValue = tasks?.find((x) => x._id === taskId)?.DueDate;
            over = groupBy.items.find((x) => x.name === "Overdue")?.value
            next = groupBy.items.find((x) => x.name === "Next")?.value

            if(updatedFields?.DueDate !== undefined) {
                if(updatedFields.DueDate === null) {
                    obj.addKey = groupBy.items?.find((x) => x.value === "DueDate_0")?.key
                } else {
                    if(today > (new Date(updatedFields.DueDate).setHours(0,0,0,0) / 1000)) {
                        obj.addKey = groupBy.items?.find((x) => x.value === (over))?.key
                    } else if(next <= (new Date(updatedFields.DueDate).setHours(0,0,0,0) / 1000)) {
                        obj.addKey = groupBy.items?.find((x) => x.value === (next))?.key
                    } else {
                        obj.addKey = groupBy.items?.find((x) => x.value === (new Date(updatedFields.DueDate).setHours(0,0,0,0) / 1000))?.key
                    }
                }

                // HANDLE REMOVE KEY
                if(removeCountValue === null) {
                    obj.removeKey = groupBy.items?.find((x) => x.value === "DueDate_0")?.key
                } else {
                    if(today > (new Date(removeCountValue).setHours(0,0,0,0) / 1000)) {
                        obj.removeKey = groupBy.items?.find((x) => x.value === (over))?.key
                    } else if(next <= (new Date(removeCountValue).setHours(0,0,0,0) / 1000)) {
                        obj.removeKey = groupBy.items?.find((x) => x.value === (next))?.key
                    } else {
                        obj.removeKey = groupBy.items?.find((x) => x.value === (new Date(removeCountValue).setHours(0,0,0,0) / 1000))?.key
                    }
                }
            }
            break;
    }

    return obj;
}

// HANDLE TASK
export const mutateUpdateFirebaseTasks = (state, payload) => {
    const {pid, sprintId, op, data, snap, updatedFields,dragDropcheck,convertSubTaskToTask, groupBy: payloadGroupBy} = payload;
    const projectFound = Object.keys(state.tasks).includes(pid);

    if(projectFound) {
        const {groupBy} = state.tasks[pid];
        const sprintFound = state.tasks[pid].sprints.includes(sprintId);

        if(sprintFound) {
            if(groupBy) {
                if(["modified", "added"]?.includes(op) && data.isParentTask) {
                    const {addKey, removeKey} = returnItemCountDetails(state.tasks[pid][sprintId].tasks, groupBy, updatedFields, data._id);
                    if(addKey) {
                        if(state.tasks[pid][sprintId].found[addKey]) {
                            state.tasks[pid][sprintId].found[addKey] += 1
                        } else {
                            state.tasks[pid][sprintId].found[addKey] = 1
                        }
                    }
                    if(removeKey) {
                        if(state.tasks[pid][sprintId].found[removeKey]) {
                            state.tasks[pid][sprintId].found[removeKey] -= 1
                        } else {
                            state.tasks[pid][sprintId].found[removeKey] = 0
                        }
                    }
                } else if(["removed"]?.includes(op)) {
                    const {removeKey} = returnItemCountDetails(state.tasks[pid][sprintId].tasks, groupBy, null, data._id);

                    if(removeKey) {
                        if(state.tasks[pid][sprintId].found[removeKey]) {
                            state.tasks[pid][sprintId].found[removeKey] -= 1
                        } else {
                            state.tasks[pid][sprintId].found[removeKey] = 0
                        }
                    }
                }
            }
            if(op === "inital") {
                if(!state.tasks[pid][sprintId].snapshot) {
                    state.tasks[pid][sprintId].snapshot = snap
                }
                state.tasks[pid].groupBy = payloadGroupBy;
            } else if(op === "added") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);
                    if(taskIndex !== -1) {
                        if(state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.length) {
                            const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);
                            if(subTaskIndex === -1) {
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                            } else {
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex], ...data};
                            }
                        } else {
                            state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray= [data];
                        }
                    }
                } else {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex === -1) {
                        // state.tasks[pid][sprintId].found[``] += 1;
                        state.tasks[pid][sprintId].tasks.push(data);
                    } else {
                        state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                    }
                }
            } else if(op === "modified") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);
                    if(taskIndex !== -1 && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray) {
                        const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);
                        if(subTaskIndex !== -1){
                            if(convertSubTaskToTask === true){
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.splice(subTaskIndex,1);
                            }else{
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex], ...data};
                            }
                        }else{
                            if(state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.length){
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                            }else{
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray = [data];
                            }
                        }
                    }
                    else if(dragDropcheck === true && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray === undefined && data.ParentTaskId){
                        state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray = [data];
                    }
                } else {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if (data.islocalSnapStop && data.islocalSnapStop === true) {     
                        if (data.updateToken?.user !== localStorage.getItem('token')) {     
                            if(taskIndex !== -1) {
                                state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                            }else{
                                state.tasks[pid][sprintId].tasks.push(data);
                            }
                        } else {
                            const temp = state.tasks[pid][sprintId].tasks?.[taskIndex]
                            if (temp?.updateTimeStamp <= updatedFields.updateToken?.timeStamp) {
                                let indexes = ['groupByDueDateIndex','groupByPriorityIndex','groupByAssigneeIndex','groupByStatusIndex']
                                let updatedIndex = Object.keys(updatedFields).find((x) => indexes.includes(x))
                                if (updatedIndex) {
                                    state.tasks[pid][sprintId].tasks[taskIndex][updatedIndex] = data[updatedIndex]
                                }
                            }
                        }
                    } else {
                        if(taskIndex !== -1) {
                            state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                        }else{
                            state.tasks[pid][sprintId].tasks.push(data);
                        }
                    }
                }
            } else if(op === "removed") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);
                    if(taskIndex !== -1 && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray) {
                        const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);
                        state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.splice(subTaskIndex, 1);
                    }
                } else {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex !== -1) {
                        state.tasks[pid][sprintId].tasks.splice(taskIndex, 1);
                    }
                }
            }
            if(convertSubTaskToTask === true){
                return;
            }
            if(data !== null && data.sprintId !== sprintId && updatedFields?.sprintId){
                const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                if(taskIndex !== -1) {
                    state.tasks[pid][sprintId].tasks.splice(taskIndex, 1);
                }
            }
            if(data !== null && data.sprintId === sprintId && (updatedFields?.isParentTask === true || updatedFields?.isParentTask === false || updatedFields?.subTasks)){
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex !== -1) {
                        state.tasks[pid][sprintId].tasks.splice(taskIndex,1);
                    }
                }else{
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex === -1){
                        state.tasks[pid][sprintId].tasks.push(data)
                    }
                }
            }
        }
    }
}

export const mutateUpdateFirebaseTableTasks = (state, payload) => {
    const {pid, sprintId, op, data} = payload;
    const projectFound = Object.keys(state.tableTasks).includes(pid);

    if(projectFound) {
        const sprintFound = state.tableTasks[pid].sprints.includes(sprintId);
        if(sprintFound) {
            if(op === "added") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x.id === data.ParentTaskId);
                    if(taskIndex !== -1) {
                        if(state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray && state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray.length) {
                            const subTaskIndex = state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x.id === data.id);
                            if(subTaskIndex === -1) {
                                state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                            } else {
                                state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex], ...data};
                            }
                        } else {
                            state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray= [data];
                        }
                    }
                } else {
                    const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x.id === data.id);
                    if(taskIndex === -1) {
                        state.tableTasks[pid][sprintId].tasks.push(data);
                    } else {
                        state.tableTasks[pid][sprintId].tasks[taskIndex] = {...state.tableTasks[pid][sprintId].tasks[taskIndex], ...data};
                    }
                }
            } else if(op === "modified") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x.id === data.ParentTaskId);
                    if(taskIndex !== -1) {
                        const subTaskIndex = state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x.id === data.id);
                        state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex], ...data};
                    }
                } else {
                    const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x.id === data.id);
                    if(taskIndex !== -1) {
                        state.tableTasks[pid][sprintId].tasks[taskIndex] = {...state.tableTasks[pid][sprintId].tasks[taskIndex], ...data};
                    }
                }

            } else if(op === "removed") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x.id === data.ParentTaskId);
                    if(taskIndex !== -1) {
                        const subTaskIndex = state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x.id === data.id);
                        state.tableTasks[pid][sprintId].tasks[taskIndex].subtaskArray.splice(subTaskIndex, 1);
                    }
                } else {
                    const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x.id === data.id);
                    if(taskIndex !== -1) {
                        state.tableTasks[pid][sprintId].tasks.splice(taskIndex, 1);
                    }
                }
            }
        }
    }
}

export const removeProjectTaskSnap = (state, payload) => {
    delete state.tasks[payload];
}

export const mutateTypesenseTasks = (state, payload) => {
    const {pid, sprintId, data, nextPage, found = 0} = payload;

    const keys = Object.keys(state.tasks);
    const projectFound = keys.includes(pid);

    if(projectFound) {
        const sprintFound = state.tasks[pid].sprints.includes(sprintId);

        if(sprintFound) {
            if(!data) return;

            if(data.isParentTask === false) {

                const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);

                if(taskIndex !== -1) {
                    if(state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray) {
                        const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);

                        if(subTaskIndex !== -1) {
                            state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...data};
                        } else {
                            state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                        }
                    } else {
                        state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray = [data];
                    }
                }
            } else {
                const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);

                if(taskIndex !== -1) {
                    state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                } else {
                    state.tasks[pid][sprintId].tasks.push(data);
                }
            }
            state.tasks[pid][sprintId].index = {
                ...state.tasks[pid][sprintId].index,
                ...nextPage
            };
            state.tasks[pid][sprintId].found = {
                ...state.tasks[pid][sprintId].found,
                ...found
            };
        } else {

            state.tasks[pid].sprints.push(sprintId);
            state.tasks[pid][sprintId]={
                index: {
                    ...nextPage
                },
                found: {
                    ...found
                },
                tasks: [],
                snapshot: null
            };
            if(data) {
                state.tasks[pid][sprintId].tasks = [data];
            }
        }
    } else {

        state.tasks[pid] = {
            projectId: pid,
            [sprintId]: {
                index: {
                    ...nextPage
                },
                found: {
                    ...found
                },
                tasks: [],
                snapshot: null
            },
            sprints: [sprintId]
        };
        if(data) {
            state.tasks[pid][sprintId].tasks = [data];
        }
    }
}

export const emptyTableTasks = (state, payload) => {
    state.tableTasks = payload
}

export const mutateTypesenseTableTasks = (state, payload) => {
    const {pid, sprintId, data, nextPage, total = 0 } = payload;
    const keys = Object.keys(state.tableTasks);
    const projectFound = keys.includes(pid);
    if(projectFound) {
        const sprintFound = state.tableTasks[pid].sprints.includes(sprintId);
        if(sprintFound) {
            if(!data) return;
                const taskIndex = state.tableTasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                if(taskIndex !== -1) {
                    state.tableTasks[pid][sprintId].tasks[taskIndex] = data;
                } else {
                    state.tableTasks[pid][sprintId].tasks.push(data);
                }
            state.tableTasks[pid][sprintId].index = {
                ...state.tableTasks[pid][sprintId].index,
                ...nextPage
            };
        } else {
            state.tableTasks[pid].sprints.push(sprintId);
            state.tableTasks[pid][sprintId]={
                index: {
                    ...nextPage
                },
                tasks: [],
                total,
                snapshot: null
            };
            if(data) {
                state.tableTasks[pid][sprintId].tasks = [data];
            }
        }
    } else {
        state.tableTasks[pid] = {
            projectId: pid,
            [sprintId]: {
                index: {
                    ...nextPage
                },
                tasks: [],
                total,
                snapshot: null
            },
            sprints: [sprintId]
        };
        if(data) {
            state.tableTasks[pid][sprintId].tasks = [data];
        }
    }
}

export const mutateSearchTask = (state, payload) => {

    let mapTasks = [];
    payload.sort((a, b) => a.isParentTask > b.isParentTask ? -1 : 1);

    payload.forEach((task) => {
        if(task.isParentTask) {
            const index = mapTasks.findIndex((x) => x._id === task._id)

            if(index !== -1) {
                mapTasks[index] = {...mapTasks[index], ...task};
            } else {
                mapTasks.push({...task, subtaskArray: []})
            }
        } else {
            const index = mapTasks.findIndex((x) => x._id === task.ParentTaskId)

            if(index !== -1) {
                mapTasks[index].subtaskArray.push(task);
            }
        }
    })

    state.searchedTasks = mapTasks;
}

export const mutateTaskIndex = (state,payload) => {
    const {pid, sprintId, tasksArray , indexName} = payload;
    tasksArray.forEach((data)=>{
        const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
        if (taskIndex!== -1) {
            state.tasks[pid][sprintId].tasks[taskIndex][indexName] = 99999999999999
        }
    })
}

export const mutateTaskForDragAndDrop = (state,payload) => {
    const {pid, sprintId, task} = payload;
    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === task._id);
    if (taskIndex!== -1) {
        state.tasks[pid][sprintId].tasks[taskIndex] = task
    }
}

export const mutateprojectTemplate = (state, payload) => {
    if(!payload || !payload.length){
        state.projectTemplate = {};
        return;
    }
    payload.forEach((x) => {
        const {op,data} = x;
        if(op == 'add') {
            if(!Object.keys(state.projectTemplate).length) {
                state.projectTemplate = {
                    data: [data]
                }
            } else {
                const index = state.projectTemplate.data.findIndex((x) => x._id === data._id);
                if(index !== -1) {
                    state.projectTemplate.data[index] = data;
                } else {
                    state.projectTemplate.data.unshift(data);
                }
            }
        } else if (op == 'del') {
            const index = state.projectTemplate.data.findIndex((x) => x.id === data.id);
            if(index !== -1) {
                if(state.projectTemplate.data.length == 1) {
                    state.projectTemplate = {};
                } else {
                    state.projectTemplate.data.splice(index,1);
                }
            }
        }
    })
}
export const mutatedefaultTemplate = (state,payload) =>{
    state.defaultTemplate = payload;
}


export const mutateSprints = (state,payload) => {
    const {op, data} = payload;
    let pId = data?.projectId;
    if(op === "added"){
        let projecIdFound = Object.keys(state.sprints).includes(pId);
        if(projecIdFound){
            const sprintIndex = state.sprints[pId].findIndex((x) => x._id === data._id);
            if(sprintIndex === -1){
                state.sprints[pId].push(data);
            }
        }else{
            state.sprints = {[pId]:[data]}
        }
    }else if(op === "modified"){
        const sprintIndex = state.sprints[pId] && state.sprints[pId].length > 0 && state.sprints[pId]?.findIndex((x) => x._id === data._id);
        if(sprintIndex !== undefined && sprintIndex !== -1) {
            state.sprints[pId][sprintIndex] = {...data};
        }
    }else if(op === "removed"){
        if(state.sprints[pId]){
            const sprintIndex = state.sprints && state.sprints[pId] && state.sprints[pId].length > 0 && state.sprints[pId]?.findIndex((x) => x._id === data.id);
            if(sprintIndex !== -1) {
                state.sprints[pId].splice(sprintIndex, 1);
            }
        }
    }
}

export const mutateFolders = (state,payload) => {
    const {op, data} = payload;
    let pId = data?.projectId;
    if(op === "added"){
        let projecIdFound = Object.keys(state.folders).includes(pId)
        if(projecIdFound){
            const sprintIndex = state.folders[pId].findIndex((x) => x._id === data._id);
            if(sprintIndex === -1){
                state.folders[pId].push(data);
            }
        }else{
            state.folders = {[pId]:[data]}
        }
    }else if(op === "modified"){
        const sprintIndex = state.folders[pId] && state.folders[pId].length > 0 && state.folders[pId]?.findIndex((x) => x._id === data._id);
        if(sprintIndex !== undefined && sprintIndex !== -1) {
            state.folders[pId][sprintIndex] = {...data};
        }
    }else if(op === "removed"){
        const sprintIndex = state.folders[pId] && state.folders[pId].length > 0 && state.folders[pId]?.findIndex((x) => x._id === data._id);
        if(sprintIndex !== -1) {
            state.folders[pId].splice(sprintIndex, 1);
        }
    }
}