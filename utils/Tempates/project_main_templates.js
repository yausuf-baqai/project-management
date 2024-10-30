exports.projectMainTemplates = [
    {
        "TemplateTaskStatusId": "",
        "TemplateTaskActiveKey": [
            1,
            3
        ],
        "TemplateName": "Development",
        "taskStatusData": [
            {
                "key": 1,
                "name": "doing",
                "textColor": "#000000",
                "bgColor": "#00000035",
                "type": "default_active"
            },
            {
                "key": 2,
                "name": "In Progress",
                "textColor": "#E0E550",
                "bgColor": "#E0E55035",
                "type": "active"
            },
            {
                "key": 3,
                "name": "Complete",
                "textColor": "#6BC950",
                "bgColor": "#6BC95035",
                "type": "close"
            },
            {
                "key": 4,
                "name": "testing",
                "textColor": "#FF9128",
                "bgColor": "#FFECDA",
                "type": "active"
            }
        ],
        "TemplateRequiredComponent": [
            {
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_LIST.svg?alt=media&token=f8fb2539-939f-4357-a6ef-95423b5d998d",
                "viewStatus": true,
                "keyName": "ProjectListView",
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Flistrequiredview.png?alt=media&token=80163486-00e0-40b8-a415-4d359de406c2",
                "value": "list",
                "name": "List",
                "setAsDefault": true
            },
            {
                "keyName": "ProjectKanban",
                "viewStatus": true,
                "value": "ProjectKanban",
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_BOARD.svg?alt=media&token=e4df3658-a821-46d1-8f86-f139a01cb88c",
                "setAsDefault": false,
                "name": "Board",
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FBoardrequiredview.png?alt=media&token=0b04dde0-b70f-475b-a2a4-e73398c50b45"
            }
        ],
        "ProjectCurrency": {
            "code": "INR",
            "symbol_native": "টকা",
            "symbol": "₹",
            "decimal_digits": 2,
            "name": "Indian Rupee",
            "name_plural": "Indian rupees",
            "rounding": 0
        },
        "projectStatusData": [
            {
                "key": 1,
                "type": "default_active",
                "default": true,
                "value": "open",
                "backgroundColor": "#E3E1FC35",
                "name": "Open",
                "textColor": "#7367F0"
            },
            {
                "key": 2,
                "type": "close",
                "value": "close",
                "backgroundColor": "#ED514535",
                "name": "Close",
                "textColor": "#ED5145"
            },
            {
                "key": 3,
                "type": "active",
                "value": "Progress",
                "backgroundColor": "#FF9128",
                "name": "Progress",
                "textColor": "#FFECDA"
            }
        ],
        "AssigneeUserId": [],
        "TaskTypeTemplateId": "",
        "TemplateTaskCloseKey": 2,
        "LeadUserId": [],
        "TemplateTaskDoneKey": [],
        "TemplateCategory": {
            "key": 1,
            "name": "Creative & Design"
        },
        "apps": [
            {
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FtimeBlue.png?alt=media&token=1d03956e-1e42-4e32-a78f-551d22735f2d",
                "appStatus": true,
                "key": "TimeEstimates",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Ftimegrey.png?alt=media&token=04962a07-7b98-47ce-b45d-0231cee6573e",
                "name": "Time Estimate"
            },
            {
                "appStatus": true,
                "name": "Milestones",
                "key": "Milestones",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflaggrey.png?alt=media&token=2dfa1fea-3fcc-4c06-964f-c0a17eee9953",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflagblue.png?alt=media&token=4d034b73-9ede-4dd2-9420-ab2428ddb266"
            },
            {
                "appStatus": true,
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflaggrey.png?alt=media&token=daacdb59-13a6-4554-82e5-77fb0f87ee72",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflagblue.png?alt=media&token=700e1b95-0b5f-47a6-9f3e-5ecd6a643d7e",
                "key": "Priority",
                "name": "Priority"
            }
        ],
        "TemplateTaskType": [
            {
                "key": 1,
                "value": "task",
                "name": "Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Ftask.png?alt=media&token=a3c55f9b-42d3-426d-9749-f40cc04de3fa"
            },
            {
                "key": 2,
                "value": "sub_task",
                "name": "Sub Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FsubtaskGreen.png?alt=media&token=fd11d4f4-8567-453c-8037-9ddcd2134df7"
            },
            {
                "key": 3,
                "value": "bug",
                "name": "Bug",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fbug.png?alt=media&token=884f70da-9664-4b3e-91bd-df0ba5f73d07"
            }
        ],
        "Description": ""
    },
    {
        "TemplateTaskDoneKey": [],
        "Description": "",
        "TemplateTaskStatusId": "",
        "TemplateCategory": {
            "name": "Finance & Accounting",
            "key": 3
        },
        "ProjectCurrency": {
            "name": "Indian Rupee",
            "symbol": "₹",
            "decimal_digits": 2,
            "code": "INR",
            "rounding": 0,
            "name_plural": "Indian rupees",
            "symbol_native": "টকা"
        },
        "projectStatusData": [
            {
                "key": 1,
                "type": "default_active",
                "default": true,
                "value": "open",
                "backgroundColor": "#E3E1FC35",
                "name": "Open",
                "textColor": "#7367F0"
            },
            {
                "key": 2,
                "type": "close",
                "value": "close",
                "backgroundColor": "#ED514535",
                "name": "Close",
                "textColor": "#ED5145"
            },
            {
                "key": 3,
                "type": "active",
                "value": "Progress",
                "backgroundColor": "#FF9128",
                "name": "Progress",
                "textColor": "#FFECDA"
            }
        ],
        "taskStatusData": [
            {
                "key": 1,
                "name": "To Do",
                "textColor": "#000000",
                "bgColor": "#00000035",
                "type": "default_active"
            },
            {
                "key": 2,
                "name": "In Progress",
                "textColor": "#E0E550",
                "bgColor": "#E0E55035",
                "type": "active"
            },
            {
                "key": 3,
                "name": "Complete",
                "textColor": "#6BC950",
                "bgColor": "#6BC95035",
                "type": "close"
            }
        ],
        "LeadUserId": [],
        "TemplateName": "UI/UX",
        "TemplateTaskCloseKey": 2,
        "TemplateTaskActiveKey": [
            1,
            3
        ],
        "apps": [
            {
                "appStatus": true,
                "key": "TimeEstimates",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Ftimegrey.png?alt=media&token=04962a07-7b98-47ce-b45d-0231cee6573e",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FtimeBlue.png?alt=media&token=1d03956e-1e42-4e32-a78f-551d22735f2d",
                "name": "Time Estimate"
            },
            {
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflaggrey.png?alt=media&token=2dfa1fea-3fcc-4c06-964f-c0a17eee9953",
                "name": "Milestones",
                "key": "Milestones",
                "appStatus": true,
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflagblue.png?alt=media&token=4d034b73-9ede-4dd2-9420-ab2428ddb266"
            },
            {
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflagblue.png?alt=media&token=700e1b95-0b5f-47a6-9f3e-5ecd6a643d7e",
                "name": "Priority",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflaggrey.png?alt=media&token=daacdb59-13a6-4554-82e5-77fb0f87ee72",
                "key": "Priority",
                "appStatus": true
            }
        ],
        "TemplateRequiredComponent": [
            {
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_LIST.svg?alt=media&token=f8fb2539-939f-4357-a6ef-95423b5d998d",
                "value": "list",
                "name": "List",
                "setAsDefault": true,
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Flistrequiredview.png?alt=media&token=80163486-00e0-40b8-a415-4d359de406c2",
                "keyName": "ProjectListView",
                "viewStatus": true
            },
            {
                "name": "Board",
                "viewStatus": true,
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FBoardrequiredview.png?alt=media&token=0b04dde0-b70f-475b-a2a4-e73398c50b45",
                "setAsDefault": false,
                "keyName": "ProjectKanban",
                "value": "ProjectKanban",
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_BOARD.svg?alt=media&token=e4df3658-a821-46d1-8f86-f139a01cb88c"
            }
        ],
        "AssigneeUserId": [],
        "TaskTypeTemplateId": "",
        "TemplateTaskType": [
            {
                "key": 1,
                "value": "task",
                "name": "Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Ftask.png?alt=media&token=a3c55f9b-42d3-426d-9749-f40cc04de3fa"
            },
            {
                "key": 2,
                "value": "sub_task",
                "name": "Sub Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FsubtaskGreen.png?alt=media&token=fd11d4f4-8567-453c-8037-9ddcd2134df7"
            },
            {
                "key": 3,
                "value": "bug",
                "name": "Bug",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fbug.png?alt=media&token=884f70da-9664-4b3e-91bd-df0ba5f73d07"
            }
        ]
    },
    {
        "ProjectCurrency": {
            "rounding": 0,
            "name_plural": "Indian rupees",
            "code": "INR",
            "symbol": "₹",
            "name": "Indian Rupee",
            "symbol_native": "টকা",
            "decimal_digits": 2
        },
        "TemplateTaskStatusId": "",
        "TemplateTaskCloseKey": 2,
        "projectStatusData": [
            {
                "key": 1,
                "type": "default_active",
                "default": true,
                "value": "open",
                "backgroundColor": "#E3E1FC35",
                "name": "Open",
                "textColor": "#7367F0"
            },
            {
                "key": 2,
                "type": "close",
                "value": "close",
                "backgroundColor": "#ED514535",
                "name": "Close",
                "textColor": "#ED5145"
            },
            {
                "key": 3,
                "type": "active",
                "value": "Progress",
                "backgroundColor": "#FF9128",
                "name": "Progress",
                "textColor": "#FFECDA"
            }
        ],
        "Description": "",
        "TaskTypeTemplateId": "",
        "TemplateRequiredComponent": [
            {
                "name": "List",
                "keyName": "ProjectListView",
                "setAsDefault": true,
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Flistrequiredview.png?alt=media&token=80163486-00e0-40b8-a415-4d359de406c2",
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_LIST.svg?alt=media&token=f8fb2539-939f-4357-a6ef-95423b5d998d",
                "viewStatus": true,
                "value": "list"
            },
            {
                "setAsDefault": false,
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FBoardrequiredview.png?alt=media&token=0b04dde0-b70f-475b-a2a4-e73398c50b45",
                "keyName": "ProjectKanban",
                "viewStatus": true,
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_BOARD.svg?alt=media&token=e4df3658-a821-46d1-8f86-f139a01cb88c",
                "name": "Board",
                "value": "ProjectKanban"
            }
        ],
        "AssigneeUserId": [],
        "TemplateTaskActiveKey": [
            1,
            3
        ],
        "TemplateCategory": {
            "key": 2,
            "name": "Engineering & Product"
        },
        "TemplateTaskType": [
            {
                "key": 1,
                "value": "task",
                "name": "Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Ftask.png?alt=media&token=a3c55f9b-42d3-426d-9749-f40cc04de3fa"
            },
            {
                "key": 2,
                "value": "sub_task",
                "name": "Sub Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FsubtaskGreen.png?alt=media&token=fd11d4f4-8567-453c-8037-9ddcd2134df7"
            },
            {
                "key": 3,
                "value": "bug",
                "name": "Bug",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fbug.png?alt=media&token=884f70da-9664-4b3e-91bd-df0ba5f73d07"
            }
        ],
        "apps": [
            {
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FtimeBlue.png?alt=media&token=1d03956e-1e42-4e32-a78f-551d22735f2d",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Ftimegrey.png?alt=media&token=04962a07-7b98-47ce-b45d-0231cee6573e",
                "key": "TimeEstimates",
                "name": "Time Estimate",
                "appStatus": true
            },
            {
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflagblue.png?alt=media&token=4d034b73-9ede-4dd2-9420-ab2428ddb266",
                "appStatus": true,
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflaggrey.png?alt=media&token=2dfa1fea-3fcc-4c06-964f-c0a17eee9953",
                "key": "Milestones",
                "name": "Milestones"
            },
            {
                "appStatus": true,
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflagblue.png?alt=media&token=700e1b95-0b5f-47a6-9f3e-5ecd6a643d7e",
                "key": "Priority",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflaggrey.png?alt=media&token=daacdb59-13a6-4554-82e5-77fb0f87ee72",
                "name": "Priority"
            }
        ],
        "LeadUserId": [],
        "TemplateTaskDoneKey": [],
        "TemplateName": "Product marketing",
        "taskStatusData": [
            {
                "key": 1,
                "name": "To Do",
                "textColor": "#000000",
                "bgColor": "#00000035",
                "type": "default_active"
            },
            {
                "key": 2,
                "name": "In Progress",
                "textColor": "#E0E550",
                "bgColor": "#E0E55035",
                "type": "active"
            },
            {
                "key": 3,
                "name": "Complete",
                "textColor": "#6BC950",
                "bgColor": "#6BC95035",
                "type": "close"
            }
        ]
    },
    {
        "projectStatusData": [
            {
                "key": 1,
                "type": "default_active",
                "default": true,
                "value": "open",
                "backgroundColor": "#E3E1FC35",
                "name": "Open",
                "textColor": "#7367F0"
            },
            {
                "key": 2,
                "type": "close",
                "value": "close",
                "backgroundColor": "#ED514535",
                "name": "Close",
                "textColor": "#ED5145"
            },
            {
                "key": 3,
                "type": "active",
                "value": "Progress",
                "backgroundColor": "#FF9128",
                "name": "Progress",
                "textColor": "#FFECDA"
            }
        ],
        "TemplateCategory": {
            "name": "Creative & Design",
            "key": 1
        },
        "AssigneeUserId": [],
        "taskStatusData": [
            {
                "key": 1,
                "name": "To Do",
                "textColor": "#000000",
                "bgColor": "#00000035",
                "type": "default_active"
            },
            {
                "key": 2,
                "name": "In Progress",
                "textColor": "#E0E550",
                "bgColor": "#E0E55035",
                "type": "active"
            },
            {
                "key": 3,
                "name": "Complete",
                "textColor": "#6BC950",
                "bgColor": "#6BC95035",
                "type": "close"
            }
        ],
        "TemplateTaskCloseKey": 2,
        "TemplateTaskActiveKey": [
            1,
            3
        ],
        "apps": [
            {
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Ftimegrey.png?alt=media&token=04962a07-7b98-47ce-b45d-0231cee6573e",
                "appStatus": true,
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FtimeBlue.png?alt=media&token=1d03956e-1e42-4e32-a78f-551d22735f2d",
                "key": "TimeEstimates",
                "name": "Time Estimate"
            },
            {
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflaggrey.png?alt=media&token=2dfa1fea-3fcc-4c06-964f-c0a17eee9953",
                "name": "Milestones",
                "key": "Milestones",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflagblue.png?alt=media&token=4d034b73-9ede-4dd2-9420-ab2428ddb266",
                "appStatus": true
            },
            {
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflaggrey.png?alt=media&token=daacdb59-13a6-4554-82e5-77fb0f87ee72",
                "name": "Priority",
                "key": "Priority",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflagblue.png?alt=media&token=700e1b95-0b5f-47a6-9f3e-5ecd6a643d7e",
                "appStatus": true
            }
        ],
        "LeadUserId": [],
        "ProjectCurrency": {
            "symbol_native": "টকা",
            "rounding": 0,
            "name": "Indian Rupee",
            "code": "INR",
            "name_plural": "Indian rupees",
            "symbol": "₹",
            "decimal_digits": 2
        },
        "TemplateRequiredComponent": [
            {
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Flistrequiredview.png?alt=media&token=80163486-00e0-40b8-a415-4d359de406c2",
                "name": "List",
                "value": "list",
                "setAsDefault": true,
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_LIST.svg?alt=media&token=f8fb2539-939f-4357-a6ef-95423b5d998d",
                "viewStatus": true,
                "keyName": "ProjectListView"
            },
            {
                "viewStatus": true,
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FBoardrequiredview.png?alt=media&token=0b04dde0-b70f-475b-a2a4-e73398c50b45",
                "name": "Board",
                "keyName": "ProjectKanban",
                "value": "ProjectKanban",
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_BOARD.svg?alt=media&token=e4df3658-a821-46d1-8f86-f139a01cb88c",
                "setAsDefault": false
            }
        ],
        "TemplateTaskStatusId": "",
        "TemplateTaskType": [
            {
                "key": 1,
                "value": "task",
                "name": "Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Ftask.png?alt=media&token=a3c55f9b-42d3-426d-9749-f40cc04de3fa"
            },
            {
                "key": 2,
                "value": "sub_task",
                "name": "Sub Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FsubtaskGreen.png?alt=media&token=fd11d4f4-8567-453c-8037-9ddcd2134df7"
            },
            {
                "key": 3,
                "value": "bug",
                "name": "Bug",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fbug.png?alt=media&token=884f70da-9664-4b3e-91bd-df0ba5f73d07"
            }
        ],
        "TaskTypeTemplateId": "",
        "TemplateName": "Design",
        "TemplateTaskDoneKey": [],
        "Description": ""
    },
    {
        "TemplateTaskCloseKey": 2,
        "ProjectCurrency": {
            "code": "INR",
            "name_plural": "Indian rupees",
            "symbol": "₹",
            "name": "Indian Rupee",
            "decimal_digits": 2,
            "rounding": 0,
            "symbol_native": "টকা"
        },
        "taskStatusData": [
            {
                "key": 1,
                "name": "To Do",
                "textColor": "#000000",
                "bgColor": "#00000035",
                "type": "default_active"
            },
            {
                "key": 2,
                "name": "In Progress",
                "textColor": "#E0E550",
                "bgColor": "#E0E55035",
                "type": "active"
            },
            {
                "key": 3,
                "name": "Complete",
                "textColor": "#6BC950",
                "bgColor": "#6BC95035",
                "type": "close"
            }
        ],
        "apps": [
            {
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FtimeBlue.png?alt=media&token=1d03956e-1e42-4e32-a78f-551d22735f2d",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Ftimegrey.png?alt=media&token=04962a07-7b98-47ce-b45d-0231cee6573e",
                "name": "Time Estimate",
                "key": "TimeEstimates",
                "appStatus": true
            },
            {
                "key": "Milestones",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflagblue.png?alt=media&token=4d034b73-9ede-4dd2-9420-ab2428ddb266",
                "appStatus": true,
                "name": "Milestones",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflaggrey.png?alt=media&token=2dfa1fea-3fcc-4c06-964f-c0a17eee9953"
            },
            {
                "name": "Priority",
                "appStatus": true,
                "key": "Priority",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflaggrey.png?alt=media&token=daacdb59-13a6-4554-82e5-77fb0f87ee72",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflagblue.png?alt=media&token=700e1b95-0b5f-47a6-9f3e-5ecd6a643d7e"
            }
        ],
        "TemplateRequiredComponent": [
            {
                "value": "list",
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_LIST.svg?alt=media&token=f8fb2539-939f-4357-a6ef-95423b5d998d",
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Flistrequiredview.png?alt=media&token=80163486-00e0-40b8-a415-4d359de406c2",
                "setAsDefault": true,
                "viewStatus": true,
                "keyName": "ProjectListView",
                "name": "List"
            },
            {
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FBoardrequiredview.png?alt=media&token=0b04dde0-b70f-475b-a2a4-e73398c50b45",
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_BOARD.svg?alt=media&token=e4df3658-a821-46d1-8f86-f139a01cb88c",
                "setAsDefault": false,
                "name": "Board",
                "keyName": "ProjectKanban",
                "viewStatus": true,
                "value": "ProjectKanban"
            }
        ],
        "projectStatusData": [
            {
                "key": 1,
                "type": "default_active",
                "default": true,
                "value": "open",
                "backgroundColor": "#E3E1FC35",
                "name": "Open",
                "textColor": "#7367F0"
            },
            {
                "key": 2,
                "type": "close",
                "value": "close",
                "backgroundColor": "#ED514535",
                "name": "Close",
                "textColor": "#ED5145"
            },
            {
                "key": 3,
                "type": "active",
                "value": "Progress",
                "backgroundColor": "#FF9128",
                "name": "Progress",
                "textColor": "#FFECDA"
            }
        ],
        "TemplateCategory": {
            "key": 3,
            "name": "Finance & Accounting"
        },
        "TemplateName": "Accounting",
        "TaskTypeTemplateId": "",
        "Description": "",
        "LeadUserId": [],
        "TemplateTaskStatusId": "",
        "TemplateTaskDoneKey": [],
        "TemplateTaskType": [
            {
                "key": 1,
                "value": "task",
                "name": "Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Ftask.png?alt=media&token=a3c55f9b-42d3-426d-9749-f40cc04de3fa"
            },
            {
                "key": 2,
                "value": "sub_task",
                "name": "Sub Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FsubtaskGreen.png?alt=media&token=fd11d4f4-8567-453c-8037-9ddcd2134df7"
            },
            {
                "key": 3,
                "value": "bug",
                "name": "Bug",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fbug.png?alt=media&token=884f70da-9664-4b3e-91bd-df0ba5f73d07"
            }
        ],
        "AssigneeUserId": [],
        "TemplateTaskActiveKey": [
            1,
            3
        ]
    },
    {
        "TemplateTaskStatusId": "",
        "apps": [
            {
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Ftimegrey.png?alt=media&token=04962a07-7b98-47ce-b45d-0231cee6573e",
                "key": "TimeEstimates",
                "name": "Time Estimate",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FtimeBlue.png?alt=media&token=1d03956e-1e42-4e32-a78f-551d22735f2d",
                "appStatus": true
            },
            {
                "key": "Milestones",
                "name": "Milestones",
                "appStatus": true,
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflaggrey.png?alt=media&token=2dfa1fea-3fcc-4c06-964f-c0a17eee9953",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fcheckflagblue.png?alt=media&token=4d034b73-9ede-4dd2-9420-ab2428ddb266"
            },
            {
                "appStatus": true,
                "key": "Priority",
                "beforeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflaggrey.png?alt=media&token=daacdb59-13a6-4554-82e5-77fb0f87ee72",
                "afterIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Fflagblue.png?alt=media&token=700e1b95-0b5f-47a6-9f3e-5ecd6a643d7e",
                "name": "Priority"
            }
        ],
        "TemplateCategory": {
            "name": "Engineering & Product",
            "key": 2
        },
        "TemplateTaskActiveKey": [
            1,
            3
        ],
        "TemplateTaskType": [
            {
                "key": 1,
                "value": "task",
                "name": "Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Ftask.png?alt=media&token=a3c55f9b-42d3-426d-9749-f40cc04de3fa"
            },
            {
                "key": 2,
                "value": "sub_task",
                "name": "Sub Task",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FsubtaskGreen.png?alt=media&token=fd11d4f4-8567-453c-8037-9ddcd2134df7"
            },
            {
                "key": 3,
                "value": "bug",
                "name": "Bug",
                "taskImage": "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fbug.png?alt=media&token=884f70da-9664-4b3e-91bd-df0ba5f73d07"
            }
        ],
        "AssigneeUserId": [],
        "taskStatusData": [
            {
                "key": 1,
                "name": "To Do",
                "textColor": "#000000",
                "bgColor": "#00000035",
                "type": "default_active"
            },
            {
                "key": 2,
                "name": "In Progress",
                "textColor": "#E0E550",
                "bgColor": "#E0E55035",
                "type": "active"
            },
            {
                "key": 3,
                "name": "Complete",
                "textColor": "#6BC950",
                "bgColor": "#6BC95035",
                "type": "close"
            }
        ],
        "ProjectCurrency": {
            "name": "Indian Rupee",
            "symbol_native": "টকা",
            "decimal_digits": 2,
            "code": "INR",
            "name_plural": "Indian rupees",
            "rounding": 0,
            "symbol": "₹"
        },
        "TemplateRequiredComponent": [
            {
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2Flistrequiredview.png?alt=media&token=80163486-00e0-40b8-a415-4d359de406c2",
                "viewStatus": true,
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_LIST.svg?alt=media&token=f8fb2539-939f-4357-a6ef-95423b5d998d",
                "keyName": "ProjectListView",
                "name": "List",
                "value": "list",
                "setAsDefault": true
            },
            {
                "icon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FBoardrequiredview.png?alt=media&token=0b04dde0-b70f-475b-a2a4-e73398c50b45",
                "value": "ProjectKanban",
                "keyName": "ProjectKanban",
                "viewStatus": true,
                "setAsDefault": false,
                "activeIcon": "https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/ProjectDefaultIcon%2FSELECTED_BOARD.svg?alt=media&token=e4df3658-a821-46d1-8f86-f139a01cb88c",
                "name": "Board"
            }
        ],
        "TemplateName": "Marketing",
        "TaskTypeTemplateId": "",
        "LeadUserId": [],
        "Description": "",
        "TemplateTaskDoneKey": [],
        "projectStatusData": [
            {
                "key": 1,
                "type": "default_active",
                "default": true,
                "value": "open",
                "backgroundColor": "#E3E1FC35",
                "name": "Open",
                "textColor": "#7367F0"
            },
            {
                "key": 2,
                "type": "close",
                "value": "close",
                "backgroundColor": "#ED514535",
                "name": "Close",
                "textColor": "#ED5145"
            },
            {
                "key": 3,
                "type": "active",
                "value": "Progress",
                "backgroundColor": "#FF9128",
                "name": "Progress",
                "textColor": "#FFECDA"
            }
        ],
        "TemplateTaskCloseKey": 2
    }
]