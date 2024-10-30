const task = {
    "enable_nested_fields": true,
    'fields': [
        {
            'name': 'Created_At',
            'type': 'float',
            "facet": true
        },
        {
            'name': 'Updated_At',
            'type': 'float',
        },
        {
            'name': 'AssigneeUserId',
            'type': 'string[]',
            "facet": true
        },
        {
            'name': 'queueListArray',
            'type': 'string[]',
            'optional' :true
        },
        {
            'name': 'CompanyId',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'DueDate',
            'type': 'float',
            "facet": true ,
            'optional' :true
        },
        {
            'name': 'Journey',
            'type': 'string',
            'optional' :true
        },
        {
            'name': 'ProjectID',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'TaskKey',
            'type': 'string',
            "facet": true,
            "sort": true
        },
        {
            'name': 'TaskType',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'TaskTypeKey',
            'type': 'float',
            "facet": true
        },
        {
            'name': 'TaskName',
            'type': 'string',
            "facet": true,
            "sort": true
        },
        {
            'name': 'Task_Leader',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'Task_Priority',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'dueDateDeadLine',
            'type': 'string[]',
            'optional' :true,
            "facet": true
        },
        {
            'name': 'isParentTask',
            'type': 'bool',
            "facet": true
        },
        {
            'name': 'markAsStar',
            'type': 'bool',
            'optional' :true,
        },
        {
            'name': 'sprintArray',
            'type': 'auto',
        },
        {
            'name': 'status',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'kanbanBoardPosition',
            'type': 'string',
            'optional' :true
        },
        {
            'name':'description',
            'type':'string',
            'optional':true,
        },
        {
            'name':'attachments',
            'type':'string[]',
            'optional':true
        },
        {
            'name':'mediaName',
            'type':'string[]',
            'optional':true,
            "facet": true
        },
        {
            'name':'checklistArray',
            'type':'string[]',
            'optional':true
        },
        {
            'name':'watchers',
            'type':'string[]',
            'optional':true
        },
        {
            'name':'tagsArray',
            'type':'string[]',
            'optional':true,
            "facet": true
        },
        {
            'name':'commentCounts',
            'type':'auto',
            'optional':true,
        },
        {
            "facet": true,
            "name": "deletedStatusKey",
            "optional": true,
            "sort": false,
            "type": "int32"
        },
        {
            "facet": true,
            "name": "statusType",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "name": "statusKey",
            "optional": true,
            "sort": false,
            "type": "int32"
        },
        {
            "facet": true,
            "name": "sprintId",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "name": "favouriteTasks",
            "optional": true,
            "type": "string[]"
        },
        {
            "facet": true,
            "name": "subTasks",
            "optional": true,
            "sort": false,
            "type": "int32"
        },
        {
            "facet": true,
            "name":"rawDescription",
            "type":"string",
            "optional":true
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "ParentTaskId",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "name": "startDate",
            "optional": true,
            "sort": true,
            "type": "float"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "groupByStatusIndex",
            "optional": true,
            "sort": true,
            "type": "float"
          },
          {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "groupByPriorityIndex",
            "optional": true,
            "sort": true,
            "type": "float"
          },
          {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "groupByDueDateIndex",
            "optional": true,
            "sort": true,
            "type": "float"
          },
          {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "groupByAssigneeIndex",
            "optional": true,
            "sort": true,
            "type": "float"
          }
    ],
};

const timeLog = {
    "enable_nested_fields": true,
    "default_sorting_field": "",
    "fields": [
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "TicketID",
            "optional": false,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "ProjectId",
            "optional": false,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogStartTime",
            "optional": false,
            "sort": true,
            "type": "int32"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "startTimeTracker",
            "optional": true,
            "sort": false,
            "type": "int32"
        },
        {
            "facet": false,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogEndTime",
            "optional": false,
            "sort": true,
            "type": "int32"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogTimeDuration",
            "optional": false,
            "sort": true,
            "type": "int32"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogTimes",
            "optional": true,
            "sort": false,
            "type": "auto"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "logTimeDate",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "logTimeDateNumbers",
            "optional": true,
            "sort": true,
            "type": "float"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogDescription",
            "optional": false,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "Loggeduser",
            "optional": false,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "logTimeYear",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "logTimeMonth",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogTimes_EndTime",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogTimes_StartTime",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "CreatedAt",
            "optional": false,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "UpdatedAt",
            "optional": false,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "LogTimes",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "trackShots",
            "optional": true,
            "sort": false,
            "type": "auto"
        },
        {
            "facet": true,
            "index": true,
            "infix": false,
            "locale": "",
            "name": "strokes",
            "optional": true,
            "sort": false,
            "type": "string"
        },
        {
            "name": "logAddType",
            "optional": true,
            "sort": false,
            "type": "int32"
        },
    ]
};

let fixMilestone = {
    "enable_nested_fields": true,
    'fields': [
        {
            'name':'id',
            'type': 'string',
            'facet': false,
        },
        {
            'name':'milestoneName',
            'type': 'string',
            'facet': true,
            'optional':false
        },
        {
            'name':'amount',
            'type': 'float',
            'facet': false,
            'optional':false
        },
        {
            'name':'startDate',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'endDate',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'dueDate',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'refundedAmount',
            'type': 'string[]',
            'facet': false,
            'optional':true
        },
        {
            'name':'statusArray',
            'type': 'string[]',
            'facet': true,
            'optional':true
        },
        {
            'name':'projectId',
            'type': 'string',
            'facet': true
        },
        {
            'name':'updatedAt',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'createdAt',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'order',
            'type': 'string',
            'facet': false,
            'optional':true
        },
        {
            'name':'amountPerHours',
            'type': 'float',
            'facet': false,
            'optional':true
        },
        {
            'name':'hours',
            'type': 'float',
            'facet': false,
            'optional':true
        },
        {
            'name':'minute',
            'type': 'float',
            'facet': false,
            'optional':true
        },
        {
            'name':'billingPeriod',
            'type': 'string',
            'facet': true,
            'optional':true
        },
        {
            'name':'statusDate',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'statusId',
            'type': 'string',
            'facet': true,
            'optional':true
        },
        {
            'name':'maxRefundDate',
            'type': 'float',
            'facet': true,
            'optional':true
        },
        {
            'name':'minRefundDate',
            'type': 'float',
            'facet': true,
            'optional':true
        }
    ]
}

const projects = {
    "enable_nested_fields": true,
    "default_sorting_field": "",
    'fields': [
        {
            'name': 'BillingPeriod',
            'type': 'string',
            "facet": true,
            "optional": true
        },
        {
            'name': 'Created_At',
            'type': 'float',
            "facet": true
        },
        {
            'name': 'Updated_At',
            'type': 'float',
            "facet": true
        },
        {
            'name': 'id',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'AssigneeUserId',
            'type': 'string[]',
            "facet": true
        },
        {
            'name': 'CompanyId',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'CompanyName',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'DueDate',
            'type': 'float',
            "facet": true,
            'optional': true
        },
        {
            'name': 'StartDate',
            'type': 'float',
            "facet": true,
            'optional': true
        },
        {
            'name': 'EndDate',
            'type': 'float',
            "facet": true,
            'optional': true
        },
        {
            'name': 'LeadUserId',
            'type': 'string[]',
            "facet": true
        },
        {
            'name': 'ProjectCategory',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'ProjectCode',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'ProjectCurrency',
            'type': 'string',
            "facet": true,
        },
        {
            'name': 'ProjectName',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'ProjectRequiredComponent',
            'type': 'string[]',
            "facet": true
        },
        {
            'name': 'ProjectRequiredDefaultComponent',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'ProjectType',
            'type': 'string',
            "facet": true
        },
        {
            'name': 'TaskTypeTemplateId',
            'type': 'string',
            "facet": true,
            'optional' :true,
        },
        {
            'name': 'Task_Priority',
            'type': 'string',
            "facet": true,
            'optional': true,
        },
        {
            'name': 'TemplateId',
            'type': 'string',
            "facet": true,
            'optional': true
        },
        {
            'name': 'TemplateName',
            'type': 'string',
            "facet": true,
            'optional': true
        },
        {
            'name': 'TemplateTaskActiveKey',
            'type': 'int32[]',
            "facet": true,
            'optional' :true
        },
        {
            'name': 'TemplateTaskCloseKey',
            'type': 'int32',
            "facet": true
        },
        {
            'name':'TemplateTaskDoneKey',
            'type':'int32[]',
            "facet": true,
            'optional': true
        },
        {
            'name':'TemplateTaskStatusId',
            'type':'string',
            "facet": true,
            'optional': true
        },
        {
            'name':'apps',
            'type':'string[]',
            'optional':true,
            "facet": true
        },
        {
            'name':'description',
            'type':'string',
            'optional':true,
            "facet": true
        },
        {
            'name':'dueDateDeadLine',
            'type':'string[]',
            'optional':true,
            "facet": true
        },
        {
            'name':'isPrivateSpace',
            'type':'bool',
            'optional':true,
            "facet": true
        },
        {
            'name':'isProjectPermissionEnable',
            'type':'bool',
            'optional':true,
            "facet": true
        },
        {
            'name':'lastTaskId',
            'type':'int32',
            'optional':true,
            "facet": true
        },
        {
            "name": "projectCreatedBy",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "projectIcon",
            "type": "string",
            "facet": true
        },
        {
            "name": "projectStatusData",
            "type": "string[]",
            "facet": true
        },
        {
            "name": "projectStatusTemplateId",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name":"sprintsObj",
            "type":"string",
            "facet": true,
            "optional":true
        },
        {
            "name": "sprintsfolders",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "status",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "statusType",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "taskFields",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "taskLastCreateKey",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "taskStatusData",
            "type": "string[]",
            "facet": true,
            "optional": true
        },
        {
            "name": "taskTypeCounts",
            "type": "string[]",
            "facet": true,
            "optional": true
        },
        {
            "name": "watchers",
            "type": "string",
            "facet": true,
            "optional": true
        },
        {
            "name": "updatedAt",
            "type": "float",
            "facet": true,
            "optional": true
        },
        {
            'name':'attachments',
            'type':'string[]',
            "facet": true,
            'optional':true
        },
        {
            "name": "deletedStatusKey",
            "type": "int32",
            "facet": true,
            "optional": true,
            "sort": false
        },
        {
            'name':'tagsArray',
            'type':'string[]',
            "facet": true,
            'optional':true
        },
        {
            "name":"favouriteTasks",
            "type":"string[]",
            "facet": true,
            "optional":true
        }
    ],
}

const companyUsers = {
    "enable_nested_fields": true,
    "default_sorting_field": "",
    "fields": [
        {
            'name': 'id',
            'type': 'string',
            "facet": true
        },
        {
            "name": "ProjectRequiredComponent",
            "type": "string",
            "facet": true,
            "optional":true
        },
        {
            "name": "companyId",
            "type": "string",
            "facet": true
        },
        {
            "name": "designation",
            "type": "int32",
            "facet": true,
            "optional":true
        },
        {
            "name": "isDelete",
            "type": "bool",
            "facet": true
        },
        {
            "name": "linkId",
            "type": "string",
            "facet": true,
            "optional":true
        },
        {
            "name": "roleType",
            "type": "int32",
            "facet": true
        },
        {
            "name": "sendInvitationTime",
            "type": "float",
            "facet": true,
            "optional":true
        },
        {
            "name": "status",
            "type": "int32",
            "facet": true
        },
        {
            "name": "createdAt",
            "type": "float",
            "facet": true
        },
        {
            "name": "updatedAt",
            "type": "float",
            "facet": true
        },
        {
            "name": "userEmail",
            "type": "string",
            "facet": true
        },
        {
            "name": "userId",
            "type": "string",
            "facet": true
        }
    ]
}

module.exports = {
    task,
    timeLog,
    fixMilestone,
    projects,
    companyUsers
}