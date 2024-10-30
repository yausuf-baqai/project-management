// For Create Project //
exports.createProject = (obj) => {
    return `<p>Created a new project named <strong>${obj.projectName}</strong>.</p>`;
}

exports.EditProjectName = (ProjectNameobj) => {
    return `<p>Project name is chnaged from <strong> ${ProjectNameobj.ProjectName}</strong> to <strong> ${ProjectNameobj.editProjectValue} </strong>.</p>`;
}

// For Create Sprint //
exports.createSprint = (sprintObj) => {
    return `<p>Created new <strong>Sprint</strong> named <strong>${sprintObj.sprintName}</strong> in <strong>${sprintObj.ProjectName}</strong> project.</p>`;
}

exports.EditSprint = (sprintObj) => {
    return `<p>In <strong>${sprintObj.ProjectName}</strong> project <strong>Sprint</strong> name is changed from <strong> ${sprintObj.previousSprint} </strong> to <strong> ${sprintObj.sprintName} </strong> </p>`;
}

// For Create Folder //
exports.createFolder = (obj) => {
    return `<p>Created new <strong>Folder</strong> named <strong>${obj.sprintFolderName}</strong> in <strong>${obj.ProjectName}</strong> project.</p>`;
}

exports.editFolder = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> project <strong>Folder</strong> name is changed from <strong> ${obj.previousFolder} </strong> to <strong> ${obj.sprintFolderName} </strong></p>`;
}

// For Create Sub Sprint //
exports.createSubSprint = (subSprintObj) => {
    return `<p>Created new <strong>Sprint</strong> named <strong>${subSprintObj.sprintName}</strong> in <strong>${subSprintObj.name}</strong> folder in <strong>${subSprintObj.ProjectName}</strong> project.</p>`;
}

exports.editSubSprint = (subSprintObj) => {
    return `<p>Change <strong>Sprint</strong> name from  <strong>${subSprintObj.previousSprint}</strong> to <strong> ${subSprintObj.sprintName}  </strong> in <strong>${subSprintObj.name}</strong> folder in <strong>${subSprintObj.ProjectName}</strong> project. </p>`;
}

// For Project Assignee Add //
exports.projectAssignee = (obj) => {
    return `<p><strong>${obj.projectName}</strong> is Assigned to <strong>${obj.Employee_Name}</strong>.</p>`;
}

// For Project Assignee Remove //
exports.projectAssigneeRemove = (obj) => {
    return `<p><strong>${obj.Employee_Name}</strong> is Removed from <strong>${obj.projectName}</strong>.</p>`;
}

// For Project Lead Add //
exports.projectLeadAdd = (obj) => {
    return `<p><strong>${obj.userName}</strong> has added <strong>${obj.Employee_Name}</strong> to <strong>Leader</strong> in <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Project Lead Remove //
exports.projectLeadRemove = (obj) => {
    return `<p><strong>${obj.userName}</strong> has removed <strong>${obj.Employee_Name}</strong> from <strong>Leader</strong> in <strong>${obj.ProjectName}</strong> project.</p>`;
}

//For Project Status Change //
exports.projectStatus = (Statusobj) => {
    return `<p>Status of <strong>${Statusobj.ProjectName}</strong> is changed from <span style="background-color:${Statusobj.backColor}; color:${Statusobj.color};padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;">${Statusobj.Statusname}</span> to <span style="font-weight: 500;background-color:${Statusobj.backgroundColor}; color:${Statusobj.textColor};padding-right: 5px;padding-left: 5px;border-radius: 5px;">${Statusobj.name}</span>.</p>`;
}

//For Project Category Change //
exports.projectCategory = (catObj) => {
    return `<p>Category of <strong>${catObj.ProjectName}</strong> is changed from <strong>${catObj.previousCategory}</strong> to <strong>${catObj.categoryObj}</strong>.</p>`;
}

// For Project Source Add //
exports.projectSourceAdd = (obj) => {
    return `<p>Project Source of <strong>${obj.ProjectName}</strong> is added as <strong>${obj.proSource}</strong>.</p>`;
}

// For Project Source Change //
exports.projectSourceChange = (obj) => {
    return `<p>Project Source of <strong>${obj.ProjectName}</strong> is changed from <strong>${obj.ProjectSource}</strong> to <strong>${obj.proSource}</strong>.</p>`;
}

// For Project Type Change //
exports.projectType = (obj) => {
    return `<p>Project Type of <strong>${obj.ProjectName}</strong> is changed from <strong>${obj.previousType}</strong> to <strong>${obj.name}</strong>.</p>`;
}

//For Project Currency Change //
exports.projectCurrency = (obj) => {
    return `<p>Project Currency of <strong>${obj.ProjectName}</strong> is changed from <strong>${obj.ProjectCurrency}</strong> to <strong>${obj.name}</strong>.</p>`;
}

//  For Project Start Date Add //
exports.projectStartDateAdd = (obj) => {
    return `<p>Start Date of <strong>${obj.ProjectName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong>.</p>`;
}

// For Project Start Date Change //
exports.projectStartDateChange = (obj) => {
    return `<p>Start Date of <strong>${obj.ProjectName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Project End Date Add //
exports.projectEndDateAdd = (obj) => {
    return `<p>End Date of <strong>${obj.ProjectName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong>.</p>`;
}

// For Project End Date Change //
exports.projectEndDateChange = (obj) => {
    return `<p>End Date of <strong>${obj.ProjectName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Project Due Date Add //
exports.projectDueDateAdd = (obj) => {
    return `<p>Due Date of <strong>${obj.ProjectName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Project Due Date Change //
exports.projectDueDateChange = (obj) => {
    return `<p>Due Date of <strong>${obj.ProjectName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.previousDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Project Description Add //
exports.projectDescriptionAdd = (Descobj) => {
    return `<p>Project Description of <strong>${Descobj.ProjectName}</strong> is added as <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Project Description Change //
exports.projectDescriptionChange = (Descobj) => {
    return `<p>Project Description of <strong>${Descobj.ProjectName}</strong> is changed from <strong>"${Descobj.previousDiscriptionText.length > 20 ? Descobj.previousDiscriptionText.slice(0, 20) + '...' : Descobj.previousDiscriptionText}"</strong> to <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Project Attachmnets Add //
exports.projectAttachmentAdd = (attachObj) => {
    return `<p><strong>${attachObj.url}</strong> attached on <strong>${attachObj.ProjectName}</strong>.</p>`;
}

// For Project Attachmnets Remove //
exports.projectAttachmentChange = (attachObj) => {
    return `<p><strong>${attachObj.removeFileName}</strong> removed on <strong>${attachObj.ProjectName}</strong>.</p>`;
}

// For Project Checklist //
exports.projectCheckList = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Created a new Check List named <strong>${checkObj.value}</strong>.</p>`;
}

// For Project Checklist Assignee Add //
exports.projectCheckListUserAdd = (checkObj) => {
    return `<p>In ${checkObj.ProjectName} Project, <strong>${checkObj.selectedCheckListName}</strong> Checklist is Assigned to <strong>${checkObj.Employee_Name}</strong>.</p>`;
}
 //For Project Checklist Edit
exports.projectCheckListEdit = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Updated a  Check List named  from <strong> ${checkObj.previouName}</strong> to  <strong>${checkObj.newName}</strong>.</p>`;
}
exports.projectCheckListRemove = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Removed  ${checkObj.checklist} <strong> ${checkObj.name}</strong></p>`;
}
// For Project Checklist Assignee Remove //
exports.projectCheckListUserRemove = (checkObj) => {
    return `<p>In ${checkObj.ProjectName} Project, <strong>${checkObj.Employee_Name}</strong> is Removed from <strong>${checkObj.selectedCheckListRemoveName}</strong> Checklist.</p>`;
}

// For Project MileStone //
exports.projectMileStone = (obj) => {
    return `<p>In Project <strong>${obj.ProjectName}</strong> a new Milestone named <strong>${obj.milestoneName}</strong> is Created .</p>`;
}

// For projectMileStoneDelete  //
exports.projectMileStoneDelete = (obj) => {
    return `<p>In Project <strong>${obj.ProjectName}</strong> Milestone named <strong>${obj.milestoneName}</strong> is Deleted.</p>`;
}

// For Project MileStone Status Change //
exports.projectMileStoneStatusChange = (milestoneobj) => {
    return `<p>Status of <strong>${(milestoneobj.editMilestoneName !== milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName) ? milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName : milestoneobj.editMilestoneName}</strong> Milestone is changed from <strong><span style="padding-right: 5px;
    padding-left: 5px; border-radius: 5px; font-weight: 500;background-color:${milestoneobj.backgroundColor ? milestoneobj.backgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.editStatus}</span></strong> to <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.changetextColor ? milestoneobj.changetextColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
}

// For Project MileStone Status Add //
exports.projectMileStoneStatusAdd = (milestoneobj) => {
    return `<p>Status of <strong>${(milestoneobj.editMilestoneName !== milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName) ? milestoneobj.milestoneArray[milestoneobj.editIndex].milestoneName : milestoneobj.editMilestoneName}</strong> Milestone is added <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
} 

exports.projectMileStoneStatusAddForHourly = (milestoneobj) => {
    return `<p>Status of <strong>${milestoneobj.editMilestoneName}</strong> Milestone is added <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
} 
exports.newProjectMileStoneStatusAdd = (milestoneobj) => {
    // return `<p>Status of <strong>${milestoneobj.editMilestoneName}</strong> Milestone is added <strong><span style="padding-right: 5px;
    // padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
    return `<p>In project <strong>${milestoneobj.ProjectName}</strong> <span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.status}</span></strong> status is Added in <strong>${milestoneobj.editMilestoneName}</strong> milestone.</p>`
} 
exports.projectMileStoneStatusChangeForHourly = (milestoneobj) => {
    return `<p>Status of <strong>${milestoneobj.editMilestoneName}</strong> Milestone is changed from <strong><span style="padding-right: 5px;
    padding-left: 5px; border-radius: 5px; font-weight: 500;background-color:${milestoneobj.backgroundColor ? milestoneobj.backgroundColor : ''}; color:${milestoneobj.textColor ? milestoneobj.textColor : ''};">${milestoneobj.editStatus}</span></strong> to <strong><span style="padding-right: 5px;
    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneobj.changebackgroundColor ? milestoneobj.changebackgroundColor : ''}; color:${milestoneobj.changetextColor ? milestoneobj.changetextColor : ''};">${milestoneobj.status}</span></strong> for <strong>${milestoneobj.ProjectName}</strong> project.</p>`;
}
// For Project Mark As Star //
exports.projectMarkStar = (starObj) => {
    return `<p><strong>${starObj.ProjectName}</strong> has been marked as star.</p>`;
}

// For Project Mark As Star Remove //
exports.projectRemoveStar = (starObj) => {
    return `<p><strong>${starObj.ProjectName}</strong> has been removed from marked as star.</p>`;
}

// For Close Project
exports.closeProject = (closeObj) => {
    return `<p><strong>${closeObj.userName}</strong> has closed the <strong>${closeObj.ProjectName}</strong> Project</p>`;
}

// For Create Task //
exports.createTask = (taskObj) => {
    return `<p>In <strong>${taskObj.ProjectName}</strong> Project, created a new task named <strong>${taskObj.newTaskname}</strong>.</p>`;
}

// Fot Task Name Edit //
exports.taskNameEdit = (taskObj) => {
    return `In <strong>${taskObj.ProjectName}</strong> Project, Task name is changed from <strong>${taskObj.previousTaskName}</strong> to <strong>${taskObj.TaskName}</strong>`;
}

// For Task Status Change //
exports.taskStatusChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Status of <strong>${obj.taskName
        }</strong> is changed from <span style="background-color:${obj.backColor}; color:${obj.color};padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;">${obj.statusName}</span> to <span style="font-weight: 500;background-color:${obj.bgColor
        }; color:${obj.textColor
        };padding-right: 5px;padding-left: 5px;border-radius: 5px;">${obj.newStatusName
        }</span>.</p>`;
}

// For Task Priority Change //
exports.taskPriorityChange = (priorityObj) => {
    return `<p>In <strong>${priorityObj.ProjectName}</strong> project, Priority of
    <strong>${priorityObj.taskName}</strong> is changed from 
    <span>
        <img style='width: 10px; height: 10px;' v-if='${priorityObj.statusImage}' src="${priorityObj.statusImage}" alt="task priority"/> ${priorityObj.priorityName}
    </span> to 
    <span>
        <img style='width: 10px; height: 10px;' v-if='${priorityObj.newStatusImage}' src="${priorityObj.newStatusImage}" alt="task priority"/> ${priorityObj.newPriorityName}
    </span></p>`;
}

// For Task Assignee Add //
exports.taskAssigneeAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.TaskName}</strong> is Assigned to <strong>${obj.Employee_Name}</strong></p>`;
}

// For Task Assignee Remove //
exports.taskAssigneeRemove = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.Employee_Name}</strong> is Removed from <strong>${obj.TaskName}</strong> Task</p>`;
}

// For Task Assigne Replace
exports.taskAssigneeReplace = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.Employee_Name}</strong> ${obj.Employee_Name.includes(",") ? 'are' : 'is'} Assigned to <strong>${obj.TaskName}</strong> Task</p>`;
}

// For Task Due Date Add //
exports.taskDueDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Due Date of <strong>${obj.TaskName ? obj.TaskName : ""
        }</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.lastDate}</span></strong>.</p>`;
}

// For Task Due Date Change //
exports.taskDueDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Due Date of <strong>${obj.TaskName ? obj.TaskName : ""}
            </strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.previousDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.changedDate}</span></strong>.</p>`;
}

// For Task Start Date Add //
exports.taskStartDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Start Date of <strong>${obj.TaskName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong>.</p>`;
}

// For Task Start Date Change //
exports.taskStartDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, Start Date of <strong>${obj.TaskName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formetedStartDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Task End Date Add //
exports.taskEndDateAdd = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, End Date of <strong>${obj.TaskName}</strong> is added as <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong>.</p>`;
}

// For Task End Date Change //
exports.taskEndDateChange = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, End Date of <strong>${obj.TaskName}</strong> is changed from <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.formatedDate}</span></strong> to <strong><span style="background-color: rgb(236 238 255);color: #2F3990;border-radius: 5px;padding-right: 5px;padding-left: 5px;">${obj.newDate}</span></strong>.</p>`;
}

// For Task Description Add //
exports.taskDescriptionAdd = (Descobj) => {
    return `<p>In <strong>${Descobj.ProjectName}</strong> Project, Description of <strong>${Descobj.TaskName
        }</strong> is added as <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Task Description Change //
exports.taskDescriptionChange = (Descobj) => {
    return `<p>In <strong>${Descobj.ProjectName}</strong> Project, Description of <strong>${Descobj.TaskName}</strong> is changed from <strong>"${Descobj.previousDiscriptionText.length > 20 ? Descobj.previousDiscriptionText.slice(0, 20) + '...' : Descobj.previousDiscriptionText}"</strong> to <strong>"${Descobj.textSimple.length > 20 ? Descobj.textSimple.slice(0, 20) + '...' : Descobj.textSimple}"</strong>.</p>`;
}

// For Task Attachment Add //
exports.taskAttachmentAdd = (Attachobj) => {
    return `<p>In <strong>${Attachobj.ProjectName}</strong> Project, <strong>${Attachobj.url}</strong> attached on <strong>${Attachobj.TaskName}</strong>.</p>`;
}

// For Task Attachment Remove //
exports.taskAttachmentRemove = (Attachobj) => {
    return `<p>In <strong>${Attachobj.ProjectName}</strong> Project, <strong>${Attachobj.removeFileName}</strong> removed on <strong>${Attachobj.TaskName}</strong>.</p>`;
}

// For Task Checklist Add //
exports.taskCheckList = (Checkobj) => {
    return `<p>In <strong>${Checkobj.ProjectName}</strong> Project, <strong>${Checkobj.TaskName}</strong> Created a new Check List named <strong>${Checkobj.value}</strong>.</p>`;
}

// For Task Checklist Assignee Add //
exports.taskCheckListAssignee = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.TaskName}</strong> of <strong>${obj.selectedChecklist}</strong> Checklist is Assigned to <strong>${obj.Employee_Name}</strong>.</p>`;
}

// For Task Checklist Assignee Remove //
exports.taskCheckListAssigneeRemove = (obj) => {
    return `<p>In <strong>${obj.ProjectName}</strong> Project, <strong>${obj.TaskName}</strong> of <strong>${obj.selectedChecklistRemove}</strong> Checklist is Removed <strong>${obj.Employee_Name}</strong> .</p>`;
}

exports.taskCheckListEdit = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Updated a  Check List named  from <strong> ${checkObj.previouName}</strong> to  <strong>${checkObj.newName}</strong> in <strong>${checkObj.taskName}</strong>.</p>`;
}

exports.taskCheckListRemove = (checkObj) => {
    return `<p>Project <strong>${checkObj.ProjectName}</strong> Removed a  ${checkObj.checklist} <strong> ${checkObj.name}</strong> from <strong>${checkObj.taskName}</strong>.</p>`;
}
// For Create Sub Task //
exports.createSubTask = (Subobj) => {
    return `<p>In <strong>${Subobj.ProjectName}</strong> Project, created a new sub task named <strong>${Subobj.newSubTaskName}</strong>.</p>`;
}

// For Logged Hours //
exports.loggedHours = (obj) => {
    return `<p><strong>${obj.userName}</strong> Added <strong>${obj.timeDuration} hrs(${obj.logTimeDate})</strong> logged hours in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Logged Hours Update //
exports.loggedHoursUpdated = (obj) => {
    return `<p><strong>${obj.userName}</strong> Updated logged hours from <strong>${obj.previousLoggedTime} hrs</strong> to <strong>${obj.timeDuration} hrs (${obj.logTimeDate})</strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}
exports.loggedHoursDeleted= (obj) => {
    return `<p><strong>${obj.userName}</strong> Deleted logged hours from <strong>${obj.strtLogTime}  to ${obj.endLogTime} in <strong>${obj.TaskName}</strong> task of <strong>${obj.ProjectName}</strong></p>`;
}
// For Task Estimated Hour Add //
exports.estimatedTimeAdded = (obj) => {
    return `<p><strong>${obj.loggedUserName}</strong> Added <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData})</strong> Estimated hours in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Task Estimated Hour Update //
exports.estimatedTimeUpdated = (obj) => {
    return `<p><strong>${obj.loggedUserName}</strong> Updated Estimated hours from <strong>${obj.estimatedTime} hrs</strong> to <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData}) </strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Admin or TL is Assign Estimated hours For User //
exports.estimatedTimeAssignUpdated = (obj) => {
    return `<p><strong>${obj.userName}</strong> Updated Estimated hours from <strong>${obj.estimatedTime} hrs</strong> to <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData})</strong>  for <strong>${obj.loggedUserName}</strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}

// For Admin or TL is Assign Estimated hours Updated For User //
exports.estimatedTimeAssignAdded = (obj) => {
    return `<p><strong>${obj.userName}</strong> Added <strong>${obj.updateEstimatedTime} hrs (${obj.timeDateData})</strong> Estimated hours for <strong>${obj.loggedUserName}</strong> in <strong>${obj.TaskName}</strong> task for this <strong>${obj.ProjectName}</strong> project.</p>`;
}
