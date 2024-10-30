const mongoose = require('mongoose');
const schema = {
    tasks: {
        "legacyId": {
            type: String,
            required: false
        },
        'TaskName': {
            type: String,
            required: true,
        },
        'TaskKey': {
            type: String,
            required: true,
        },
        'AssigneeUserId': {
            type: Array,
            default: [],
            required: false,
        },
        'watchers': {
            type: Array,
            default: [],
            required: false,
        },
        'DueDate': {
            type: Date,
            required: false,
        },
        'dueDateDeadLine': {
            type: Array,
            default: [],
            required: false,
        },
        'TaskType': {
            type: String,
            required: true,
        },
        'TaskTypeKey': {
            type: Number,
            required: true,
        },
        'ParentTaskId': {
            type: String,
            required: false,
        },
        'ProjectID': {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        'CompanyId': {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        'status': {
            type: Object,
            required: true,
        },
        'isParentTask': {
            type: Boolean,
            required: true,
        },
        'Task_Leader': {
            type: String,
            required: true,
        },
        'sprintArray': {
            type: Object,
            required: true,
        },
        'Task_Priority': {
            type: String,
            required: true,
        },
        'deletedStatusKey': {
            type: Number,
            required: true,
        },
        'sprintId': {
            type:  mongoose.Schema.Types.ObjectId,
            required: true,
        },
        'groupByAssigneeIndex': {
            type: Number,
            required: false,
        },
        'groupByPriorityIndex': {
            type: Number,
            required: false,
        },
        'groupByDueDateIndex': {
            type: Number,
            required: false,
        },
        'groupByStatusIndex': {
            type: Number,
            required: false,
        },
        'queueListArray': {
            type: Array,
            required: false,
        },
        'attachments': {
            type: Array,
            required: false,
        },
        'checklistArray': {
            type: Array,
            required: false,
        },
        'tagsArray': {
            type: Array,
            required: false,
        },
        'favouriteTasks': {
            type: Array,
            required: false,
        },
        'subTasks': {
            type: Number,
            required: false,
        },
        'rawDescription': {
            type: String,
            required: false,
        },
        'description': {
            type: String,
            required: false,
        },
        'statusType': {
            type: String,
            required: true,
        },
        'startDate': {
            type: Date,
            required: false,
        },
        'statusKey': {
            type: Number,
            required: true,
        },
        'updateToken':{
            type: Object,
            required: false,
        },
        'islocalSnapStop':{
            type: Boolean,
            required: false,
        },
        'folderObjId': {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        descriptionBlock: {
            type : Object,
            required: false
        }
    },
    timesheet: {
        LogDescription: {
            type: String,
            required: true,
        },
        LogEndTime: {
            type: Number,
            required: true,
        },
        LogStartTime: {
            type: Number,
            required: true,
        },
        LogTimeDuration: {
            type: Number,
            required: true,
        },
        Loggeduser: {
            type: String,
            required: true,
        },
        ProjectId: {
            type: String,
            required: true,
        },
        TicketID: {
            type: String,
            required: true,
        },
        logAddType: {
            type: Number,
            required: false,
        },
        trackShots: {
            type: Array,
            default: [],
            required: false,
        },
        // strokes:{
        //     type : Array , 
        //     default : [],
        //     required: false,
        // },
        startTimeTracker: {
            type: Number,
            required: false,
        },
    },
    history: {
        Key: {
            type: String,
            required: true,
        },
        Message: {
            type: String,
            required: true,
        },
        ProjectId: {
            type: String,
            required: true,
        },
        TaskId: {
            type: String,
            required: false,
        },
        Type: {
            type: String,
            required: true,
        },
        UserId: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
        },
        updatedAt: {
            type: Date,
            required: true,
        },
    },
    userId: {
        userId: {
            type: String,
            required: true
        },
    },
    users: {
        "legacyId": {
            type: String,
            required: false
        },
        Employee_Email: {
            type: String,
            required: false,
        },
        Employee_FName: {
            type: String,
            required: false,
        },
        Employee_LName: {
            type: String,
            required: false,
        },
        Employee_Name: {
            type: String,
            required: false,
        },
        Time_Format: {
            type: String,
            required: false,
        },
        isActive: {
            type: Boolean,
            required: false,
        },
        isOnline: {
            type: Boolean,
            required: false,
        },
        verificationToken: {
            type: String,
            required: false
        },
        verificationTokenTime: {
            type: Date,
            required: false
        },
        AssignCompany: {
            type: Array,
            required: false
        },
        Employee_profileImage: {
            type: String,
            required: false
        },
        Employee_profileImageURL: {
            type: String,
            required: false
        },
        webTokens: {
            type: Array,
            required: false
        },
        forgotPasswordToken: {
            type: String,
            required: false
        },
        forgotPasswordTokenTime: {
            type: Date,
            required: false
        },
        lastActive: {
            type: Date,
            required: false
        },
        isEmailVerified: {
            type: Boolean,
            required: true
        },
        customerId: {
            type: String,
            required: false
        },
        isProductOwner: {
            type: Boolean,
            required: false
        }
    },
    adminDetail: {
        companyName: {
            type: String,
            required: true
        },
        address1: {
            type: String,
            required: true,
        },
        address2: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        }
    },
    wasabicredentials: {
        accessKeyId: {
            type: String,
            required: true
        },
        secretAccessKey: {
            type: String,
            required: true
        }
    },
    ProjectTemplate: {
        AssigneeUserId: {
            type: Array,
            required: true
        },
        Description: {
            type: String,
            required: false
        },
        LeadUserId: {
            type: Array,
            required: true
        },
        ProjectCurrency: {
            type: Map,
            required: true
        },
        TaskTypeTemplateId: {
            type: String,
            required: false
        },
        TemplateCategory: {
            type: Map,
            required: true
        },
        TemplateName: {
            type: String,
            required: true
        },
        TemplateRequiredComponent: {
            type: Array,
            required: true
        },
        TemplateTaskActiveKey: {
            type: Array,
            required: true
        },
        TemplateTaskCloseKey: {
            type: Number,
            required: true
        },
        TemplateTaskDoneKey: {
            type: Array,
            required: true
        },
        TemplateTaskStatusId: {
            type: String,
            required: false
        },
        TemplateTaskType: {
            type: Array,
            required: true
        },
        apps: {
            type: Array,
            required: true
        },
        projectStatusData: {
            type: Array,
            required: true
        },
        taskStatusData: {
            type: Array,
            required: true
        }
    },
    timeTrackerDownload: {
        downloadUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        version: {
            type: String,
            required: true
        }
    },
    companies: {
        "legacyId": {
            type: String,
            required: false
        },
        Cst_City: {
            type: String,
            required: true
        },
        Cst_Country: {
            type: String,
            required: true
        },
        Cst_CompanyName: {
            type: String,
            required: true
        },
        Cst_DialCode: {
            type: Map,
            required: true
        },
        Cst_LogTimeDays: {
            type: String,
            required: true
        },
        Cst_Phone: {
            type: String,
            required: true
        },
        Cst_State: {
            type: String,
            required: true
        },
        customerId: {
            type: String,
            required: false
        },
        isInactive: {
            type: Boolean,
            required: false
        },
        SubcriptionId: {
            type: String,
            required: false
        },
        totalData: {
            type: Map,
            required: true
        },
        totalProjects: {
            type: String,
            required: true
        },
        userId: {
            type : mongoose.Schema.Types.ObjectId,
            required : false
        },
        Cst_profileImage: {
            type : String,
            required : false
        },
        planFeature: {
            type: Map,
            required: false
        },
        cancelledSubscriptionId: {
            type: String,
            required: false
        },
        availableUser: {
            type: Number,
        },
        projectCount: {
            type : Object,
            required : false
        },
        isPlanShchedule: {
            type: Boolean,
        },
        bucketSize: {
            type : Number,
            required : false
        },
        isPaymentFailed: {
            type: Boolean,
            required: false,
        },
        paymentFailed_error_text: {
            type: String,
            required: false,
        },
        trackerUsers: {
            type: Number,
            required: false,
        },
        companyData: {
            type: Array,
            required: false
        },
        subscriptionRenewalDate: {
            type: Number,
        },
        isDisable: {
            type: Boolean,
            required: false
        },
        billingDetails: {
            type: Object,
            required : false
        },
        aiTotalRequestedCount: {
            type: Number,
            required: false
        }
    },
    companyProjectTemplate: {
        AssigneeUserId: {
            type: Array,
            required: true
        },
        CompanyId: {
            type: String,
            required: false
        },
        CompanyName: {
            type: String,
            required: false
        },
        Description: {
            type: String,
            required: false
        },
        LeadUserId: {
            type: Array,
            required: true
        },
        ProjectCurrency: {
            type: Map,
            required: true
        },
        ProjectRequiredDefaultComponent: {
            type: String,
            required: true
        },
        TaskTypeTemplateId: {
            type: String,
            required: false
        },
        TemplateName: {
            type: String,
            required: true
        },
        TemplateRequiredComponent: {
            type: Array,
            required: true
        },
        TemplateTaskActiveKey: {
            type: Array,
            required: true
        },
        TemplateTaskCloseKey: {
            type: Number,
            required: true
        },
        TemplateTaskDoneKey: {
            type: Array,
            required: true
        },
        TemplateTaskStatusId: {
            type: String,
            required: false
        },
        TemplateTaskType: {
            type: Array,
            required: true
        },
        apps: {
            type: Array,
            required: true
        },
        projectStatusData: {
            type: Array,
            required: true
        },
        taskStatusData: {
            type: Array,
            required: true
        },
        templateImageURL: {
            type: Map,
            required: false
        }
    },
    proejctTabComponents: {
        activeIcon: {
            type: String,
            required: false
        },
        icon: {
            type: String,
            required: false
        },
        keyName: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        setAsDefault: {
            type: Boolean,
            required: true
        },
        sortIndex: {
            type: Number,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        viewStatus: {
            type: Boolean,
            required: true
        }
    },
    projectStatusTemplate: {
        TemplateName: {
            type: String,
            required: true
        },
        projectActiveStatus: {
            type: Array,
            required: true
        },
        projectCompletedStatus: {
            type: Map,
            required: true
        },
        projectDoneStatus: {
            type: Array,
            required: true
        },
        default: {
            type: Boolean,
            required: false
        }
    },
    taskTypeTemplates: {
        TemplateName: {
            type: String,
            required: true
        },
        taskTypes: {
            type: Array,
            required: true
        },
        default: {
            type: Boolean,
            required: false
        },
    },
    taskStatusTemplates: {
        ActiveStatusList: {
            type: Array,
            required: true
        },
        DoneStatusList: {
            type: Array,
            required: true
        },
        TemplateName: {
            type: String,
            required: true
        },
        defaultActive: {
            type: Map,
            required: true
        },
        defaultComplete: {
            type: Map,
            required: true
        },
        default: {
            type: Boolean,
            required: false
        },
        taskActiveStatus: {
            type: Array,
            required: false
        },
        taskcloseStatus: {
            type: Number,
            required: false
        }
    },
    temsManagment: {
        assigneeUsersArray: {
            type: Array,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        teamColor: {
            type: Map,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    },
    companyUsers: {
        "legacyId": {
            type: String,
            required: false
        },
        companyId: {
            type: String,
            required: true
        },
        designation: {
            type: Number,
            required: true
        },
        isDelete: {
            type: Boolean,
            required: true,
            default: false
        },
        linkId: {
            type: String,
            required: false,
            default: ""
        },
        roleType: {
            type: Number,
            required: true
        },
        sendInvitationTime: {
            type: Number,
            required: false
        },
        status: {
            type: Number,
            required: true
        },
        userEmail: {
            type: String,
            required: true
        },
        embedViews: {
            type: Map,
            required: false
        },
        userId: {
            type: String,
            required: false
        },
        isTrackerUser: {
            type: Boolean,
            required: false
        },
        isRestrict: {
            type : Boolean,
            required: false,
            default : false
        },
        aiRequestedCount: {
            type: Number,
            required: false
        }
    },
    rules: {
        dependency: {
            type: String,
            required: false,
            default: ""
        },
        desc: {
            type: String,
            required: false,
            default: ""
        },
        isParent: {
            type: Boolean,
            required: true,
            default: false
        },
        key: {
            type: String,
            required: true,
            default: ""
        },
        name: {
            type: String,
            required: true,
            default: ""
        },
        parentId: {
            type: String,
            required: false,
            default: ""
        },
        priorityIndex: {
            type: Number,
            required: false,
        },
        roles: {
            type: Array,
            required: true,
            default: []
        },
        allowAdminForPrivateSpace : {
            type:Boolean,
            required : false
        },
        showAllTasks : {
            type:Boolean,
            required : false
        },
        showAllProjects : {
            type:Boolean,
            required : false
        },

    },
    estimatedTime: {
        Date: {
            type: Date,
            required: true
        },
        ProjectId: {
            type: String,
            required: true
        },
        TaskId: {
            type: String,
            required: true
        },
        UserId: {
            type: String,
            required: true
        },
        EstimatedTime: {
            type: Number,
            required: true
        }

    },
    currency_list: {
        code: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            required: true
        },
        decimal_digits: {
            type: Number,
            required: true
        },
        isDefault: {
            type: Boolean,
            required: true
        },
        isDelete: {
            type: Boolean,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        name_plural: {
            type: String,
            required: true
        },
        rounding: {
            type: Number,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        symbol_native: {
            type: String,
            required: true
        }
    },
    projects: {
        "legacyId": {
            type: String,
            required: false
        },
        AssigneeUserId: {
            type: Array,
            default: [],
            required: false
        },
        BillingPeriod: {
            type: String,
            required: false
        },
        CompanyId: {
            type: String,
            required: true
        },
        DueDate: {
            type: Date,
            required: false
        },
        EndDate: {
            type: Date,
            required: false
        },
        LeadUserId: {
            type: Array,
            default: [],
            required: true
        },
        ProjectCategory: {
            type: String,
            required: true
        },
        ProjectCode: {
            type: String,
            required: true
        },
        ProjectCurrency: {
            type: Object,
            required: true
        },
        ProjectSource: {
            type: String,
            required: false
        },
        ProjectName: {
            type: String,
            required: true
        },
        ProjectRequiredComponent: {
            type: Array,
            required: true,
            default: []
        },
        ProjectRequiredDefaultComponent: {
            type: String,
            required: true
        },
        ProjectType: {
            type: String,
            required: true
        },
        StartDate: {
            type: Date,
            required: false
        },
        TaskTypeTemplateId: {
            type: String,
            required: false,
            default: ""
        },
        TemplateId: {
            type: String,
            required: false,
            default: ""
        },
        TemplateTaskStatusId: {
            type: String,
            required: false,
            default: ""
        },
        apps: {
            type: Array,
            required: true,
            default: []
        },
        checklistArray: {
            type: Array,
            required: false,
            default: []
        },
        attachments: {
            type: Array,
            required: false,
            default: []
        },
        description: {
            type: String,
            required: false,
            default: ""
        },
        dueDateDeadLine: {
            type: Array,
            required: false,
            default: []
        },
        isPrivateSpace: {
            type: Boolean,
            required: true,
            default: false
        },
        lastTaskId: {
            type: Number,
            required: false,
            default: 0
        },
        milestoneAmount: {
            type: Number,
            required: false,
            default: 0
        },
        projectCreatedBy: {
            type: String,
            required: true,
        },
        projectIcon: {
            type: Object,
            required: true
        },
        projectStatusData: {
            type: Array,
            required: true,
            default: []
        },
        projectStatusTemplateId: {
            type: String,
            required: false,
        },
        sprintsObj: {
            type: Object,
            required: false,
            default: {}
        },
        sprintsfolders: {
            type: Object,
            required: false,
            default: {}
        },
        status: {
            type: String,
            required: true,
        },
        statusType: {
            type: String,
            required: true,
        },
        taskStatusData: {
            type: Array,
            required: true,
            default: []
        },
        taskTypeCounts: {
            type: Array,
            required: true,
            default: []
        },
        milestoneAmount: {
            type: Number,
            required: false,
            default: 0
        },
        deletedStatusKey: {
            type: Number,
            required: false,
            default: 0
        },
        isGlobalPermission : {
            type: Boolean,
            required: true,
            default : true
        },
        lastProjectActivity: {
            type: Number,
            required: false
        },
        userActivity: {
            type: Object,
            required: false,
            default: {}
        },
        isRestrict: {
            type: Boolean,
            required: false,
            default: false
        },
        viewColumn: {
            type: Array,
            required: false,
        }
    },
    mainChats: {
        "legacyId": {
            type: String,
            required: false
        },
        default: {
            type: Boolean,
            required: true
        },
        AssigneeUserId: {
            type: Array,
            default: [],
            required: false
        },
        DueDate: {
            type: Number,
            required: false
        },
        EndDate: {
            type: Number,
            required: false
        },
        LeadUserId: {
            type: Array,
            default: [],
            required: true
        },
        ProjectCode: {
            type: String,
            required: true
        },
        ProjectName: {
            type: String,
            required: true
        },
        ProjectRequiredComponent: {
            type: Array,
            required: true,
            default: []
        },
        StartDate: {
            type: Number,
            required: false
        },
        TaskTypeTemplateId: {
            type: String,
            required: false,
            default: ""
        },
        TemplateId: {
            type: String,
            required: false,
            default: ""
        },
        TemplateTaskStatusId: {
            type: String,
            required: false,
            default: ""
        },
        apps: {
            type: Array,
            required: true,
            default: []
        },
        checklistArray: {
            type: Array,
            required: false,
            default: []
        },
        description: {
            type: String,
            required: false,
            default: ""
        },
        dueDateDeadLine: {
            type: Array,
            required: false,
            default: []
        },
        isPrivateSpace: {
            type: Boolean,
            required: true,
            default: false
        },
        lastTaskId: {
            type: Number,
            required: false,
            default: 0
        },
        milestoneAmount: {
            type: Number,
            required: false,
            default: 0
        },
        projectIcon: {
            type: Object,
            required: false
        },
        projectStatusData: {
            type: Array,
            required: true,
            default: []
        },
        projectStatusTemplateId: {
            type: String,
            required: false,
        },
        sprintsObj: {
            type: Object,
            required: false,
            default: {}
        },
        sprintsfolders: {
            type: Object,
            required: false,
            default: {}
        },
        status: {
            type: String,
            required: false,
        },
        statusType: {
            type: String,
            required: false,
        },
        taskStatusData: {
            type: Array,
            required: true,
            default: []
        },
        taskTypeCounts: {
            type: Array,
            required: true,
            default: []
        }
    },
    settings: {
        settings: {
            type: Array,
            required: true,
            default: []
        },
        name: {
            type: String,
            required: true
        },
        totalStatus: {
            type: Number,
            required: false
        }
    },
    milestone: {
        milestoneName:{
            type: String,
            required: true,
        },
        amount:{
            type: Number,
            required: true,
        },
        projectId:{
            type: String,
            required: true,
        },
        // createdAt:{
        //     type: Number,
        //     required: true,
        // },
        // updatedAt:{
        //     type: Number,
        //     required: true,
        // },
        // type:{
        //     type: String,
        //     required: true,
        // },
        startDate:{
            type: Number,
            required: false,
        },
        endDate:{
            type: Number,
            required: false,
        },
        dueDate:{
            type: Number,
            required: false,
        },
        statusDate:{
            type: Number,
            required: false,
        },
        statusId:{
            type: String,
            required: false,
        },
        refundedAmount:{
            type: Array,
            required: false,
        },
        statusArray:{
            type: Array,
            required: false,
        },
        order:{
            type: String,
            required: false,
        },
        maxRefundDate:{
            type: Number,
            required: false,
        },
        minRefundDate:{
            type: Number,
            required: false,
        },
        minute:{
            type:Number,
            required:false
        },
        hours:{
            type:Number,
            required:false
        },
        amountPerHours:{
            type:Number,
            required:false
        },
        billingPeriod:{
            type:String,
            required:false
        }
    },
    apps: {
        afterIcon: {
            type: String,
            required: true,
        },
        appStatus: {
            type: Boolean,
            required: true,
        },
        beforeIcon: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        sortIndex: {
            type: Number,
            required: true,
        }
    },
    notifications: {
        key: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        projectId: {
            type: String,
            required: true,
        },
        taskId: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        assigneeUsers: {
            type: Array,
            required: true,
        },
        folderId: {
            type: String,
            required: false,
        },
        isSelected: {
            type: Boolean,
            required: false,
        },
        notSeen: {
            type: Array,
            required: true,
            default: []
        },
        sprintId: {
            type: String,
            required: false,
        },
        companyId: {
            type: String,
            required: false,
        },
        task_leader_ID: {
            type: String,
            required: false,
        },
        changeType: {
            type: String,
            required: false,
        },
        changeData: {
            type: Object,
            required: false,
        },
        receiverID: {
            type: String,
            required: false,
        },
        notificationType: {
            type: String,
            required: true,
            default: "push"
        },
        uniqueId:{
            type: String,
            required: true,
        },
        isSchedule:{
            type: Boolean,
            required:false
        },
        Employee_Email: {
            type: String,
            required: false,
        },
        Employee_Name: {
            type: String,
            required: false,
        },
        Employee_profileImage: {
            type: String,
            required: false,
        },
        User_Employee_Email: {
            type: String,
            required: false,
        },
        User_Employee_Name: {
            type: String,
            required: false,
        },
        User_Employee_profileImage: {
            type: String,
            required: false,
        },
        notificationStatus: {
            type: String,
            required: false,
        },
        isSeen:{
            type: Boolean,
            required:false
        },
        webTokens:{
            type: Array,
            required: false,
        },
        notificationId:{
            type: String,
            required:false
        }
    },
    notificationsSettings: {
        before: {
            type: Object,
            required: true
        },
        project: {
            type: Object,
            required: true
        },
        tasks: {
            type: Object,
            required: true
        },
        chat: {
            type: Object,
            required: true
        },
        userId: {
            type: String,
            required: true,
        }
    },
    mentions: {
        comment_id: {
            type: String,
            required: true
        },
        comment_mediaOriginalName: {
            type: String,
            required: false
        },
        comment_mediaName: {
            type: String,
            required: false
        },
        comment_mediaSize: {
            type: Number,
            required: false
        },
        comment_mediaURL: {
            type: String,
            required: false
        },
        comment_message: {
            type: String,
            required: false
        },
        comment_reply_id: {
            type: String,
            required: false
        },
        comment_reply_mediaOriginalName: {
            type: String,
            required: false
        },
        comment_reply_mediaName: {
            type: String,
            required: false
        },
        comment_reply_mediaSize: {
            type: Number,
            required: false
        },
        comment_reply_mediaURL: {
            type: String,
            required: false
        },
        comment_reply_message: {
            type: String,
            required: false
        },
        comment_reply_type: {
            type: String,
            required: false
        },
        comment_reply_userId: {
            type: String,
            required: false
        },
        comment_type: {
            type: String,
            required: true
        },
        folderId: {
            type: String,
            required: false
        },
        mentionIds: {
            type: Array,
            required: true
        },
        notSeen: {
            type: Array,
            required: false
        },
        projectId: {
            type: String,
            required: true
        },
        sprintId: {
            type: String,
            required: false
        },
        taskId: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        mainChat:{
            type: Boolean,
            required: false,
            default: false
        }
    },
    comments: {
        "legacyId": {
            type: String,
            required: false
        },
        "hasReply": {
            type: Boolean,
            required: false
        },
        "isDeleted": {
            type: Boolean,
            required: false
        },
        "mediaName": {
            type: String,
            required: false
        },
        "message": {
            type: String,
            required: false
        },
        "mediaSize": {
            type: Number,
            required: false
        },
        "mediaURL": {
            type: String,
            required: false
        },
        "sprintId": {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        },
        "project": {
            type: Boolean,
            required: true
        },
        "projectId": {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        "reply_userId": {
            type: String,
            required: false
        },
        "reply_type": {
            type: String,
            required: false
        },
        "reply_message": {
            type: String,
            required: false
        },
        "reply_mediaURL": {
            type: String,
            required: false
        },
        "taskId": {
            type: mongoose.Schema.Types.Mixed,
            required: false
        },
        "reply_mediaSize": {
            type: Number,
            required: false
        },
        "reply_mediaName": {
            type: String,
            required: false
        },
        "reply_mediaOriginalName": {
            type: String,
            required: false
        },
        "reply_id": {
            type: String,
            required: false
        },
        "userId": {
            type: String,
            required: true
        },
        "type": {
            type: String,
            required: true
        },
        "reply_createdAt": {
            type: Date,
            required: false
        },
        "mentionIds": {
            type: Array,
            required: false
        },
        "pinnedMessage": {
            type: Boolean,
            default: false,
            required: false
        },
        "mediaOriginalName": {
            type: String,
            required: false
        }
    },
    mainChat: {
        ProjectCode: {
            type: String,
            required: true
        }, 
        ProjectName: {
            type: String,
            required: true
        }, 
        default: {
            type: Boolean,
            required: true
        },
        sprintsfolders: {
            type: Object,
            required: true,
            default: {}
        },
        taskStatusData: {
            type: Array,
            required: true
        },
        taskTypeCounts: {
            type: Array,
            required: true
        },
        name : {
            type : String,
            required : true
        }
    },
    subscriptionPlan: {
        addonPriceArray: {
            type: Array,
            required: false
        },
        status: {
            type: Number,
            required: false
        },
        planName: {
            type: String,
            required: true
        },
        itemPriceArray: {
            type: Array,
            required: false
        },
        planDetails: {
            type: Object,
            required: false
        },
        isDefaultShow: {
            type: Boolean,
            required: false
        },
        defaultSubscribe: {
            type: Boolean,
            required: false,
        },
        status: {
            type: Number,
            required: false,
        }
    },
    planFeature:{
        planName: {
            type: String,
            required: true
        }
    },
    projectRules: {
        dependency: {
            type: String,
            required: false,
            default: ""
        },
        desc: {
            type: String,
            required: false,
            default: ""
        },
        isParent: {
            type: Boolean,
            required: true,
            default: false
        },
        key: {
            type: String,
            required: true,
            default: ""
        },
        name: {
            type: String,
            required: true,
            default: ""
        },
        parentId: {
            type: String,
            required: false,
            default: ""
        },
        priorityIndex: {
            type: Number,
            required: false,
        },
        roles: {
            type: Array,
            required: true,
            default: []
        },
        allowAdminForPrivateSpace : {
            type:Boolean,
            required : false
        },
        showAllTasks : {
            type:Boolean,
            required : false
        },
        showAllProjects : {
            type:Boolean,
            required : false
        },
        projectId : {
            type : String,
            required : true,
            default : ''
        }
    },
    planFeatureDisplay:{
        planName: {
            type: String,
            required: true
        }
    },
    subscriptions: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    invoices: {},
    creditNotes: {},
    globalCustomFields: {
        cfPrimaryColor: {
            type: String,
            required: true
        },
        cfType: {
            type: String,
            required: true
        },
        cfDescrption: {
            type: String,
            required: true
        },
        cfIcon: {
            type: String,
            required: true
        },
        cfTitle: {
            type: String,
            required: true
        },
        cfIconGrey: {
            type: String,
            required: true
        },
        cfBackgroundColor: {
            type: String,
            required: true
        }
    },
    customFields:{
        fieldTitle : {
            type: String, 
            required:false,
            default:''
        },
        fieldPlaceholder: {
            type: String, 
            required:false,
            default:''
        },
        fieldDescription: {
            type: String, 
            required:false,
            default:''
        },
        fieldRequired: {
            type: Array, 
            required:false,
            default:[]
        },
        fieldMinimum: {
            type: String, 
            required:false,
            default:''
        },
        fieldMaximum: {
            type: String, 
            required:false,
            default:''
        },
        fieldHide: {
            type: Array, 
            required:false,
            default:[]
        },
        fieldValidation: {
            type: String, 
            required:false,
            default:''
        },
        fieldType: {
            type: String, 
            required:true,
            default:''
        },
        global: {
            type: Boolean,
            required: false,
            default: false
        },
        projectId: {
            type:String,
            required: false,
            default:''
        }
    },
    sprints: {
        sendMessage: {
            type: Boolean,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        iconName: {
            type: String,
            required: false,
        },
        prefix: {
            type: String,
            required: false,
        },
        name:{
            type: String,
            required: true,
        },
        projectId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        tasks:{
            type: Number,
            required: false,
        },
        private:{
            type: Boolean,
            required:true
        },
        deletedStatusKey:{
            type: Number,
            required: true
        },
        archiveTaskCount:{
            type: Number,
            required: false,
        },
        folderId:{
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        AssigneeUserId:{
            type: Array,
            required:false
        },
        watchers:{
            type: Array,
            required:false
        },
        favouriteTasks:{
            type: Array,
            required:false
        },
        legacyId : {
            type: String,
            required:false
        },
        url : {
            type: String,
            required: false
        }
    },
    folders:{
        name:{
            type: String,
            required: true,
        },
        projectId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        deletedStatusKey:{
            type: Number,
            required: true
        },
        legacyId : {
            type: String,
            required:false
        }
    },
    preCompanies: {
        isAvailable: {
            type:Boolean,
            required: true
        },
        pickupCount: {
            type: Number,
            required: true
        }
    },
    restrictedExtensions: {
        extensions: {
            type: Array,
            required: true,
            default: []
        }
    },
    tours: {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        isCompleted: {
            type: Boolean,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    }
}

module.exports = { schema };