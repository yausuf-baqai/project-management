// For Create Project //
export const createProject = (obj) => {
    return `<p>Created a new project named <strong>${obj.projectName}</strong>.</p>`;
}

export const EditProjectName = (ProjectNameobj) => {
    return `<p>Project name is changed from <strong> ${ProjectNameobj.ProjectName}</strong> to <strong> ${ProjectNameobj.editProjectValue} </strong>.</p>`;
}

// For Create Sprint //
export const createSprint = (sprintObj) => {
    return `<p>Created new <strong>Sprint</strong> named <strong>${sprintObj.sprintName}</strong> in <strong>${sprintObj.ProjectName}</strong> project.</p>`;
}

export const EditSprint = (sprintObj) => {
    return `<p>In <strong>${sprintObj.ProjectName}</strong> project <strong>Sprint</strong> name is changed from <strong> ${sprintObj.previousSprint} </strong> to <strong> ${sprintObj.sprintName} </strong> </p>`;
}

// For Create Folder //
export const createFolder = (obj) => {
    return `<p>Created new <strong>Folder</strong> named <strong>${obj.sprintFolderName}</strong> in <strong>${obj.ProjectName}</strong> project.</p>`;
}

export const editFolder = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> project <strong>Folder</strong> name is changed from <strong> ${obj.previousFolder} </strong> to <strong> ${obj.sprintFolderName} </strong></p>`;
}

// For Create Sub Sprint //
export const createSubSprint = (subSprintObj) => {
    return `<p>Created new <strong>Sprint</strong> named <strong>${subSprintObj.sprintName}</strong> in <strong>${subSprintObj.name}</strong> folder in <strong>${subSprintObj.ProjectName}</strong> project.</p>`;
}

export const editSubSprint = (subSprintObj) => {
    return `<p>Change <strong>Sprint</strong> name from  <strong>${subSprintObj.previousSprint}</strong> to <strong> ${subSprintObj.sprintName}  </strong> in <strong>${subSprintObj.name}</strong> folder in <strong>${subSprintObj.ProjectName}</strong> project. </p>`;
}

// For Project Assignee Add //
export const projectAssignee = (obj) => {
    return `<p><strong>${obj.projectName}</strong> is Assigned to <strong>${obj.Employee_Name}</strong>.</p>`;
}

// For Project Assignee Remove //
export const projectAssigneeRemove = (obj) => {
    return `<p><strong>${obj.Employee_Name}</strong> is Removed from <strong>${obj.projectName}</strong>.</p>`;
}

// For Project Lead Add //
export const projectLeadAdd = (obj) => {
    return `<p><strong>${obj.userName}</strong> has added <strong>${obj.Employee_Name}</strong> to <strong>Leader</strong> in <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Project Lead Remove //
export const projectLeadRemove = (obj) => {
    return `<p><strong>${obj.userName}</strong> has removed <strong>${obj.Employee_Name}</strong> from <strong>Leader</strong> in <strong>${obj.ProjectName}</strong> project.</p>`;
}

//For Project Status Change //
export const projectStatus = (Statusobj) => {
    return `<p>Status of <strong>${Statusobj.ProjectName}</strong> is changed from <span style="background-color:${Statusobj.backColor}; color:${Statusobj.color};padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;">${Statusobj.Statusname}</span> to <span style="font-weight: 500;background-color:${Statusobj.backgroundColor}; color:${Statusobj.textColor};padding-right: 5px;padding-left: 5px;border-radius: 5px;">${Statusobj.name}</span>.</p>`;
}

//For Project Category Change //
export const projectCategory = (catObj) => {
    return `<p>Category of <strong>${catObj.ProjectName}</strong> is changed from <strong>${catObj.previousCategory}</strong> to <strong>${catObj.categoryObj}</strong>.</p>`;
}

// For Project Source Add //
export const projectSourceAdd = (obj) => {
    return `<p>Project Source of <strong>${obj.ProjectName}</strong> is added as <strong>${obj.proSource}</strong>.</p>`;
}

// For Project Source Change //
export const projectSourceChange = (obj) => {
    return `<p>Project Source of <strong>${obj.ProjectName}</strong> is changed from <strong>${obj.ProjectSource}</strong> to <strong>${obj.proSource}</strong>.</p>`;
}

// For Project Type Change //
export const projectType = (obj) => {
    return `<p>Project Type of <strong>${obj.ProjectName}</strong> is changed from <strong>${obj.previousType}</strong> to <strong>${obj.name}</strong>.</p>`;
}

//For Project Currency Change //
export const projectCurrency = (obj) => {
    return `<p>Project Currency of <strong>${obj.ProjectName}</strong> is changed from <strong>${obj.ProjectCurrency}</strong> to <strong>${obj.name}</strong>.</p>`;
}

//  For Project Start Date Add //
export const projectStartDateAdd = (obj) => {
    return `<p>Start Date of <strong>${obj.ProjectName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong>.</p>`;
}

// For Project Start Date Change //
export const projectStartDateChange = (obj) => {
    return `<p>Start Date of <strong>${obj.ProjectName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Project End Date Add //
export const projectEndDateAdd = (obj) => {
    return `<p>End Date of <strong>${obj.ProjectName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong>.</p>`;
}

// For Project End Date Change //
export const projectEndDateChange = (obj) => {
    return `<p>End Date of <strong>${obj.ProjectName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Project Due Date Add //
export const projectDueDateAdd = (obj) => {
    return `<p>Due Date of <strong>${obj.ProjectName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Project Due Date Change //
export const projectDueDateChange = (obj) => {
    return `<p>Due Date of <strong>${obj.ProjectName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.previousDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Project Description Add //
export const projectDescriptionAdd = (Descobj) => {
    return `<p>Project Description of <strong>${Descobj.ProjectName}</strong> is added as <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Project Description Change //
export const projectDescriptionChange = (Descobj) => {
    return `<p>Project Description of <strong>${Descobj.ProjectName}</strong> is changed from <strong>"${Descobj.previousDiscriptionText.length > 20 ? Descobj.previousDiscriptionText.slice(0, 20) + '...' : Descobj.previousDiscriptionText}"</strong> to <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Project Attachmnets Add //
export const projectAttachmentAdd = (attachObj) => {
    return `<p><strong>${attachObj.url}</strong> attached on <strong>${attachObj.ProjectName}</strong>.</p>`;
}

// For Project Attachmnets Remove //
export const projectAttachmentChange = (attachObj) => {
    return `<p><strong>${attachObj.removeFileName}</strong> removed on <strong>${attachObj.ProjectName}</strong>.</p>`;
}

// For Project Checklist //
export const projectCheckList = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Created a new Check List named <strong>${checkObj.value}</strong>.</p>`;
}

// For Project Checklist Assignee Add //
export const projectCheckListUserAdd = (checkObj) => {
    return `<p>In ${checkObj.ProjectName} Project, <strong>${checkObj.selectedCheckListName}</strong> Checklist is Assigned to <strong>${checkObj.Employee_Name}</strong>.</p>`;
}
 //For Project Checklist Edit
export const projectCheckListEdit = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Updated a  Check List named  from <strong> ${checkObj.previouName}</strong> to  <strong>${checkObj.newName}</strong>.</p>`;
}
export const projectCheckListRemove = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Removed  ${checkObj.checklist} <strong> ${checkObj.name}</strong></p>`;
}
// For Project Checklist Assignee Remove //
export const projectCheckListUserRemove = (checkObj) => {
    return `<p>In ${checkObj.ProjectName} Project, <strong>${checkObj.Employee_Name}</strong> is Removed from <strong>${checkObj.selectedCheckListRemoveName}</strong> Checklist.</p>`;
}

// For Project MileStone //
export const projectMileStone = (obj) => {
    return `<p>In Project <strong>${obj.ProjectName}</strong> a new Milestone named <strong>${obj.milestoneName}</strong> is Created .</p>`;
}

// For projectMileStoneDelete  //
export const projectMileStoneDelete = (obj) => {
    return `<p>In Project <strong>${obj.ProjectName}</strong> Milestone named <strong>${obj.milestoneName}</strong> is Deleted.</p>`;
}

// For Project MileStone Status Change //
export const projectMileStoneStatusChange = (milestoneobj) => {
    return `<p>Status of <strong>${(milestoneobj.editMilestoneName !== milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName) ? milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName : milestoneobj.editMilestoneName}</strong> Milestone is changed from <strong><span style="padding-right: 5px;
    padding-left: 5px; border-radius: 5px; font-weight: 500;background-color:${milestoneobj.backgroundColor ? milestoneobj.backgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.editStatus}</span></strong> to <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.changetextColor ? milestoneobj.changetextColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
}

// For Project MileStone Status Add //
export const projectMileStoneStatusAdd = (milestoneobj) => {
    return `<p>Status of <strong>${(milestoneobj.editMilestoneName !== milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName) ? milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName : milestoneobj.editMilestoneName}</strong> Milestone is added <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
} 

export const projectMileStoneStatusAddForHourly = (milestoneobj) => {
    return `<p>Status of <strong>${milestoneobj.editMilestoneName}</strong> Milestone is added <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
} 
export const newProjectMileStoneStatusAdd = (milestoneobj) => {
    // return `<p>Status of <strong>${milestoneobj.editMilestoneName}</strong> Milestone is added <strong><span style="padding-right: 5px;
    // padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
    return `<p>In project <strong>${milestoneobj.ProjectName}</strong> <span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> status is Added in <strong>${milestoneobj.editMilestoneName}</strong> milestone.</p>`
} 
export const projectMileStoneStatusChangeForHourly = (milestoneobj) => {
    return `<p>Status of <strong>${milestoneobj.editMilestoneName}</strong> Milestone is changed from <strong><span style="padding-right: 5px;
    padding-left: 5px; border-radius: 5px; font-weight: 500;background-color:${milestoneobj.backgroundColor ? milestoneobj.backgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.editStatus}</span></strong> to <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.changetextColor ? milestoneobj.changetextColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
}
// For Project Mark As Star //
export const projectMarkStar = (starObj) => {
    return `<p><strong>${starObj.ProjectName}</strong> has been marked as star.</p>`;
}

// For Project Mark As Star Remove //
export const projectRemoveStar = (starObj) => {
    return `<p><strong>${starObj.ProjectName}</strong> has been removed from marked as star.</p>`;
}

// For Close Project
export const closeProject = (closeObj) => {
    return `<p><strong>${closeObj.userName}</strong> has closed the <strong>${closeObj.ProjectName}</strong> Project</p>`;
}

// For Create Task //
export const createTask = (taskObj) => {
    return `<p>In <strong>${taskObj.ProjectName}</strong> Project, created a new task named <strong>${taskObj.newTaskname}</strong>.</p>`;
}

// Fot Task Name Edit //
export const taskNameEdit = (taskObj) => {
    return `In <strong>${taskObj.ProjectName}</strong> Project, Task name is changed from <strong>${taskObj.previousTaskName}</strong> to <strong>${taskObj.TaskName}</strong>`;
}

// For Task Status Change //
export const taskStatusChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Status of <strong>${obj.taskName
        }</strong> is changed from <span style="background-color:${obj.backColor}; color:${obj.color};padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;">${obj.statusName}</span> to <span style="font-weight: 500;background-color:${obj.bgColor
        }; color:${obj.textColor
        };padding-right: 5px;padding-left: 5px;border-radius: 5px;">${obj.newStatusName
        }</span>.</p>`;
}

// For Task Priority Change //
export const taskPriorityChange = (priorityObj) => {
    return `<p>In <strong>${priorityObj.ProjectName}</strong> project, Priority of
    <strong>${priorityObj.taskName}</strong> is changed from 
    <span>
        <img style='width: 16px; height: 16px;' v-if='${priorityObj.statusImage}' src="${priorityObj.statusImage}" alt="task priority"/>${priorityObj.priorityName}
    </span> to 
    <span>
        <img style='width: 16px; height: 16px;' v-if='${priorityObj.newStatusImage}' src="${priorityObj.newStatusImage}" alt="task priority"/>${priorityObj.newPriorityName}
    </span></p>`;
}

// For Task Assignee Add //
export const taskAssigneeAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.TaskName}</strong> is Assigned to <strong>${obj.Employee_Name}</strong></p>`;
}

// For Task Assignee Remove //
export const taskAssigneeRemove = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.Employee_Name}</strong> is Removed from <strong>${obj.TaskName}</strong> Task</p>`;
}

// For Task Due Date Add //
export const taskDueDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Due Date of <strong>${obj.TaskName ? obj.TaskName : ""
        }</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.lastDate}</span></strong>.</p>`;
}

// For Task Start And Due Date Add //
export const taskStartAndDueDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Start And Due Date of <strong>${obj.TaskName ? obj.TaskName : ""
        }</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.lastDate}</span></strong>.</p>`;
}

// For Task Due Date Change //
export const taskDueDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Due Date of <strong>${obj.TaskName ? obj.TaskName : ""}
            </strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.previousDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Task Start And Due Date Change //
export const taskStartAndDueDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Start And Due Date of <strong>${obj.TaskName ? obj.TaskName : ""}
            </strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.previousDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Task Start Date Add //
export const taskStartDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Start Date of <strong>${obj.TaskName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong>.</p>`;
}

// For Task Start Date Change //
export const taskStartDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Start Date of <strong>${obj.TaskName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Task End Date Add //
export const taskEndDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, End Date of <strong>${obj.TaskName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong>.</p>`;
}

// For Task End Date Change //
export const taskEndDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, End Date of <strong>${obj.TaskName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Task Description Add //
export const taskDescriptionAdd = (Descobj) => {
    return `<p>In <strong>${Descobj.ProjectName}</strong> Project, Description of <strong>${Descobj.TaskName
        }</strong> is added as <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Task Description Change //
export const taskDescriptionChange = (Descobj) => {
    return `<p>In <strong>${Descobj.ProjectName}</strong> Project, Description of <strong>${Descobj.TaskName}</strong> is changed from <strong>"${Descobj.previousDiscriptionText.length > 20 ? Descobj.previousDiscriptionText.slice(0, 20) + '...' : Descobj.previousDiscriptionText}"</strong> to <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Task Attachment Add //
export const taskAttachmentAdd = (Attachobj) => {
    return `<p>In <strong>${Attachobj.ProjectName}</strong> Project, <strong>${Attachobj.url}</strong> attached on <strong>${Attachobj.TaskName}</strong>.</p>`;
}

// For Task Attachment Remove //
export const taskAttachmentRemove = (Attachobj) => {
    return `<p>In <strong>${Attachobj.ProjectName}</strong> Project, <strong>${Attachobj.removeFileName}</strong> removed on <strong>${Attachobj.TaskName}</strong>.</p>`;
}

// For Task Checklist Add //
export const taskCheckList = (Checkobj) => {
    return `<p>In <strong>${Checkobj.ProjectName}</strong> Project, <strong>${Checkobj.TaskName}</strong> Created a new Check List named <strong>${Checkobj.value}</strong>.</p>`;
}

// For Task Checklist Assignee Add //
export const taskCheckListAssignee = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.TaskName}</strong> of <strong>${obj.selectedChecklist}</strong> Checklist is Assigned to <strong>${obj.Employee_Name}</strong>.</p>`;
}

// For Task Checklist Assignee Remove //
export const taskCheckListAssigneeRemove = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.TaskName}</strong> of <strong>${obj.selectedChecklistRemove}</strong> Checklist is Removed <strong>${obj.Employee_Name}</strong> .</p>`;
}

export const taskCheckListEdit = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Updated a  Check List named  from <strong> ${checkObj.previouName}</strong> to  <strong>${checkObj.newName}</strong> in <strong>${checkObj.taskName}</strong>.</p>`;
}

export const taskCheckListRemove = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Removed a  ${checkObj.checklist} <strong> ${checkObj.name}</strong> from <strong>${checkObj.taskName}</strong>.</p>`;
}
// For Create Sub Task //
export const createSubTask = (Subobj) => {
    return `<p>In <strong>${Subobj.ProjectName}</strong> Project, created a new sub task named <strong>${Subobj.newSubTaskName}</strong>.</p>`;
}

// For Logged Hours //
export const loggedHours = (obj) => {
    return `<p><strong>${obj.userName}</strong> Added <strong>${obj.timeDuration} hrs(${obj.logTimeDate})</strong> logged hours in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Logged Hours Update //
export const loggedHoursUpdated = (obj) => {
    return `<p><strong>${obj.userName}</strong> Updated logged hours from <strong>${obj.previousLoggedTime} hrs</strong> to <strong>${obj.timeDuration} hrs (${obj.logTimeDate})</strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Task Estimated Hour Add //
export const estimatedTimeAdded = (obj) => {
    return `<p><strong>${obj.loggedUserName}</strong> Added <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData})</strong> Estimated hours in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Task Estimated Hour Update //
export const estimatedTimeUpdated = (obj) => {
    return `<p><strong>${obj.loggedUserName}</strong> Updated Estimated hours from <strong>${obj.estimatedTime} hrs</strong> to <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData}) </strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Admin or TL is Assign Estimated hours For User //
export const estimatedTimeAssignUpdated = (obj) => {
    return `<p><strong>${obj.userName}</strong> Updated Estimated hours from <strong>${obj.estimatedTime} hrs</strong> to <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData})</strong>  for <strong>${obj.loggedUserName}</strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Admin or TL is Assign Estimated hours Updated For User //
export const estimatedTimeAssignAdded = (obj) => {
    return `<p><strong>${obj.userName}</strong> Added <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData})</strong> Estimated hours for <strong>${obj.loggedUserName}</strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}
