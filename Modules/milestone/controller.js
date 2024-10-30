const {HandleNotification} = require("../tasks/helpers/handleNotification");
const logger = require("../../Config/loggerConfig");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries.js");
const { SCHEMA_TYPE } = require("../../Config/schemaType");
const hlp = require("../tasks/helpers/helper");
const mongoose = require("mongoose")
const moment = require('moment');

exports.addMilestone = async (req, res) => {
    try{
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!(req.body.milestoneObject && Object.keys(req.body.milestoneObject).length)){
            res.send({status: false, statusText: 'milestoneObject is required'});
            return;
        }
        if(!(req.body.ProjectName)){
            res.send({status: false, statusText: 'ProjectName is required'});
            return;
        }
        if(!(req.body.userDetail && Object.keys(req.body.userDetail).length)){
            res.send({status: false, statusText: 'userDetail is required'});
            return;
        }
        let historyObj ={};
        let notificationObj = {};
        let milestoneStatusObj = req.body.milestoneStatusObj ? req.body.milestoneStatusObj : '';
        let milestoneObject = req.body.milestoneObject ? JSON.parse(JSON.stringify(req.body.milestoneObject)) : '';
        let milestoneName = milestoneObject.milestoneName ? milestoneObject.milestoneName : '';
        historyObj.message = `<b>${req.body.userDetail.Employee_Name}</b> has created new milestone as <b>${milestoneName}</b> in <b>${req.body.ProjectName}</b> project.`;
        historyObj.key = 'Project_Milestone_Changed';
        notificationObj.message = `<p>In Project <strong>${req.body.ProjectName}</strong> a new Milestone named <strong>${milestoneName}</strong> is Created.</p>`;
        notificationObj.key = 'project_milestone';

        if(req.body?.fixOrHourlyMilCheck === false){
            milestoneObject.dueDate = milestoneObject.dueDate ? new Date(milestoneObject.dueDate) : '';
        }
        milestoneObject.startDate = milestoneObject.startDate ? new Date(milestoneObject.startDate) : '';
        milestoneObject.endDate = milestoneObject.endDate ? new Date(milestoneObject.endDate) : '';
        if(milestoneObject.statusArray && milestoneObject.statusArray.length){
            milestoneObject.statusArray[0].statusDateValue = new Date(milestoneObject.statusArray[0].statusDateValue);
        }
        milestoneObject.amount = Number(milestoneObject.amount);
        milestoneObject.statusDate = milestoneObject.statusDate ? new Date(milestoneObject.statusDate) : '';
        milestoneObject.maxRefundDate = milestoneObject.maxRefundDate ? milestoneObject.maxRefundDate : '';
        milestoneObject.minRefundDate = milestoneObject.minRefundDate ? milestoneObject.minRefundDate : '';
        let object = {
            type:SCHEMA_TYPE.PROJECTS,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                {$inc: {"milestoneAmount": milestoneObject.amount}}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,object, "updateOne").then((res) => {
        }).catch((err)=>{
            logger.error(`handle addMilestone project update amount : ${err}`);
        });
        let typsObj = {};
        if(req.body?.fixOrHourlyMilCheck === false){
            typsObj = {
                'milestoneName': milestoneObject.milestoneName,
                'amount': milestoneObject.amount,
                'startDate':milestoneObject.startDate? new Date(milestoneObject.startDate).getTime() : 0,
                'endDate': milestoneObject.endDate ? new Date(milestoneObject.endDate).getTime() : 0,
                'dueDate': milestoneObject.dueDate ? new Date(milestoneObject.dueDate).getTime() : 0,
                'statusDate':milestoneObject.statusDate ? new Date(milestoneObject.statusDate).getTime() : 0,
                'statusId':milestoneObject.statusId ? milestoneObject.statusId : '',
                'refundedAmount': milestoneObject.refundedAmount && milestoneObject.refundedAmount.length ? milestoneObject.refundedAmount : [],
                'statusArray': milestoneObject.statusArray && milestoneObject.statusArray.length ? milestoneObject.statusArray : [],
                'projectId': req.body.projectId,
                'order': milestoneObject.order,
                'maxRefundDate' : milestoneObject.maxRefundDate ? new Date(milestoneObject.maxRefundDate).getTime() : 0,
                'minRefundDate' : milestoneObject.minRefundDate ? new Date(milestoneObject.minRefundDate).getTime() : 0
            };
        }else {
            typsObj = {
                'milestoneName': milestoneObject.milestoneName,
                'amount': milestoneObject.amount,
                'startDate': milestoneObject.startDate ? new Date(milestoneObject.startDate).getTime() : 0,
                'endDate': milestoneObject.endDate ? new Date(milestoneObject.endDate).getTime() : 0,
                'statusDate':milestoneObject.statusDate ? new Date(milestoneObject.statusDate).getTime() : 0,
                'statusId':milestoneObject.statusId ? milestoneObject.statusId : '',
                'refundedAmount': milestoneObject.refundedAmount && milestoneObject.refundedAmount.length ? milestoneObject.refundedAmount : [],
                'statusArray': milestoneObject.statusArray && milestoneObject.statusArray.length ? milestoneObject.statusArray : [],
                'projectId': req.body.projectId,
                'minute':milestoneObject.minute,
                'hours':milestoneObject.hours,
                'amountPerHours':milestoneObject.amountPerHours,
                'billingPeriod':milestoneObject.billingPeriod,
                'maxRefundDate' : milestoneObject.maxRefundDate ? new Date(milestoneObject.maxRefundDate).getTime() : 0,
                'minRefundDate' : milestoneObject.minRefundDate ? new Date(milestoneObject.minRefundDate).getTime() : 0
            };
        }
        let obj = {
            data: typsObj,
            type:SCHEMA_TYPE.MILESTONE
        }
        // add data
        MongoDbCrudOpration(req.body.companyId,obj, "save").then((response) => {
            res.send({
                status: true,
                statusText: "Milestone Added",
                data:response
            });
        }).catch((error)=>{
            res.send({status: false, statusText: error});
            logger.error(`add milestone mongodb crud opration: ${error}`);
        });
        exports.addMilestoneHistoryNotification(req.body.companyId, req.body.projectId,req.body.userDetail,milestoneStatusObj,historyObj,notificationObj,milestoneName,req.body.ProjectName);
        exports.addMilestoneHistory(milestoneObject,req.body.companyId, req.body.projectId,req.body.userDetail,milestoneStatusObj);
    }catch(err){
        res.send({status: false, statusText: err});
        logger.error(`add milestone: ${err}`);
    }
};

exports.addMilestoneHistoryNotification = async (companyId, projectId,userDetail,milestoneStatusObj,historyObj,notificationObj,milestoneName,ProjectName) => {
    try{
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).then((res)=>{
        }).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
        HandleNotification({type: 'project', companyId: companyId, projectId: projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: notificationObj, userData: userDetail}).catch((err) => {
            logger.error(`handle notification for name: ${err}`);
        });
        if(milestoneStatusObj){
            let notificationStatusObj = {};
            notificationStatusObj.message = 
            `<p>Status of <strong>${milestoneName}</strong> Milestone is added <strong>
                <span style="padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;background-color:${milestoneStatusObj.backgroundColor}; 
                    color:#fff;">${milestoneStatusObj.name}
                </span>
                </strong> for <strong>${ProjectName}</strong> project.
            </p>`;
            notificationStatusObj.key = 'project_milestone_status_change';
            HandleNotification({type: 'project', companyId: companyId, projectId: projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: notificationStatusObj, userData: userDetail}).catch((err) => {
                logger.error(`handle notification for status: ${err}`);
            });
            try {
                if(milestoneStatusObj.value === 'FUNDED' || milestoneStatusObj.value === 'RELEASED'){
                    let obj = {
                        type:SCHEMA_TYPE.SETTINGS,
                        data: [
                            { "name": "milestone_status" },
                            { $set: {'settings.$[elementIndex].isCount':0 }},
                            {arrayFilters: [{ "elementIndex.value": milestoneStatusObj.value }]}
                        ]
                    }
                    MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                    }).catch((err)=>{
                        logger.error(`handle addMilestoneHistoryNotification setting update : ${err}`);
                    });
                }else{
                    let obj = {
                        type:SCHEMA_TYPE.SETTINGS,
                        data: [
                            { "name": "milestone_status" },
                            {$inc: {"settings.$[elementIndex].isCount": 1}},
                            {arrayFilters: [{ "elementIndex.value": milestoneStatusObj.value }]}
                        ]
                    }
                    MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                    }).catch((err)=>{
                        logger.error(`handle addMilestoneHistoryNotification setting update : ${err}`);
                    });
                }
            }catch(err){
                logger.error(`handle addMilestoneHistoryNotification setting : ${err}`);
            }
        }
    }catch(err){
        logger.error(`handle addMilestoneHistoryNotification : ${err}`);
    }
}

exports.updateMilestone = async (req, res) => {
    try {
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!(req.body.milestoneObject && Object.keys(req.body.milestoneObject).length)){
            res.send({status: false, statusText: 'milestoneArray is required'});
            return;
        }
        if(!(req.body.ProjectName)){
            res.send({status: false, statusText: 'ProjectName is required'});
            return;
        }
        if(!(req.body.userDetail && Object.keys(req.body.userDetail).length)){
            res.send({status: false, statusText: 'userDetail is required'});
            return;
        }
        if(req.body?.fixOrHourlyMilCheck === false){
            req.body.milestoneObject.dueDate = req.body.milestoneObject.dueDate ? req.body.milestoneObject.dueDate.seconds ? new Date(req.body.milestoneObject.dueDate.seconds * 1000 + req.body.milestoneObject.dueDate.nanoseconds / 1000000) : new Date(req.body.milestoneObject.dueDate) : '';
        }
        req.body.milestoneObject.startDate = req.body.milestoneObject.startDate ? req.body.milestoneObject.startDate.seconds ? new Date(req.body.milestoneObject.startDate.seconds * 1000 + req.body.milestoneObject.startDate.nanoseconds / 1000000) : new Date(req.body.milestoneObject.startDate) : '';
        req.body.milestoneObject.endDate = req.body.milestoneObject.endDate ? req.body.milestoneObject.endDate.seconds ? new Date(req.body.milestoneObject.endDate.seconds * 1000 + req.body.milestoneObject.endDate.nanoseconds / 1000000) : new Date(req.body.milestoneObject.endDate) : '';
        req.body.milestoneObject.maxRefundDate = req.body.milestoneObject.maxRefundDate ? req.body.milestoneObject.maxRefundDate.seconds ? new Date(req.body.milestoneObject.maxRefundDate.seconds * 1000) : new Date(req.body.milestoneObject.maxRefundDate)  : '';
        req.body.milestoneObject.minRefundDate = req.body.milestoneObject.minRefundDate ? req.body.milestoneObject.minRefundDate.seconds ? new Date(req.body.milestoneObject.minRefundDate.seconds * 1000) : new Date(req.body.milestoneObject.minRefundDate) : '';
        
        if(req.body.milestoneObject.statusArray && req.body.milestoneObject.statusArray.length){
            req.body.milestoneObject.statusArray.forEach((element) => {
                if(element.statusDateValue.seconds){
                    element.statusDateValue = new Date(element.statusDateValue.seconds * 1000);
                }else{
                    element.statusDateValue = new Date(element.statusDateValue);
                }
            });
            req.body.milestoneObject.statusId = req.body.milestoneObject.statusArray[req.body.milestoneObject.statusArray.length - 1].milestoneStatusColor;
            req.body.milestoneObject.statusDate = req.body.milestoneObject.statusArray[req.body.milestoneObject.statusArray.length - 1].statusDateValue;
        };
        if(req.body.milestoneObject.refundedAmount && req.body.milestoneObject.refundedAmount.length){
            req.body.milestoneObject.refundedAmount.forEach((e)=>{
                e.date = e.date ? e.date.seconds ? new Date(e.date.seconds * 1000) : new Date(e.date) : '' 
            });
        };
        let object = {
            type:SCHEMA_TYPE.PROJECTS,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                {$inc: {"milestoneAmount": req.body.onlyNumber}}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,object, "updateOne").then((res) => {
        }).catch((err)=>{
            logger.error(`handle updateMilestone project update amount : ${err}`);
        });
        let typsObj = {};
        if(req.body?.fixOrHourlyMilCheck === false){
            typsObj = {
                'milestoneName': req.body.milestoneObject.milestoneName,
                'amount': req.body.milestoneObject.amount,
                'startDate': req.body.milestoneObject.startDate ? new Date(req.body.milestoneObject.startDate).getTime() : 0,
                'endDate': req.body.milestoneObject.endDate ? new Date(req.body.milestoneObject.endDate).getTime() : 0,
                'dueDate': req.body.milestoneObject.dueDate ? new Date(req.body.milestoneObject.dueDate).getTime() : 0,
                'statusId':req.body.milestoneObject.statusId ? req.body.milestoneObject.statusId : '',
                'statusDate':req.body.milestoneObject.statusDate ? new Date(req.body.milestoneObject.statusDate).getTime() : 0,
                'refundedAmount': req.body.milestoneObject.refundedAmount && req.body.milestoneObject.refundedAmount.length ? req.body.milestoneObject.refundedAmount : [],
                'statusArray': req.body.milestoneObject.statusArray && req.body.milestoneObject.statusArray.length ? req.body.milestoneObject.statusArray : [],
                'order': req.body.milestoneObject.order,
                'maxRefundDate' : req.body.milestoneObject.maxRefundDate ? new Date(req.body.milestoneObject.maxRefundDate).getTime() : 0,
                'minRefundDate' : req.body.milestoneObject.minRefundDate ? new Date(req.body.milestoneObject.minRefundDate).getTime() : 0
            };
        }else{
            typsObj = {
                'milestoneName': req.body.milestoneObject.milestoneName,
                'startDate': req.body.milestoneObject.startDate ? new Date(req.body.milestoneObject.startDate).getTime() : 0,
                'endDate': req.body.milestoneObject.endDate ? new Date(req.body.milestoneObject.endDate).getTime() : 0,
                'amount': Number(req.body.milestoneObject.amount),
                'amountPerHours': Number(req.body.milestoneObject.amountPerHours),
                'hours':Number(req.body.milestoneObject.hours),
                'minute':Number(req.body.milestoneObject.minute),
                'statusId':req.body.milestoneObject.statusId ? req.body.milestoneObject.statusId : '',
                'statusDate':req.body.milestoneObject.statusDate ? new Date(req.body.milestoneObject.statusDate).getTime() : 0,
                'statusArray':req.body.milestoneObject.statusArray && req.body.milestoneObject.statusArray.length ? req.body.milestoneObject.statusArray : [],
                'refundedAmount':req.body.milestoneObject.refundedAmount && req.body.milestoneObject.refundedAmount.length ? req.body.milestoneObject.refundedAmount : [],
                'maxRefundDate' : req.body.milestoneObject.maxRefundDate ? new Date(req.body.milestoneObject.maxRefundDate).getTime() : 0,
                'minRefundDate' : req.body.milestoneObject.minRefundDate ? new Date(req.body.milestoneObject.minRefundDate).getTime() : 0
            };
        }
        let obj = {
            type:SCHEMA_TYPE.MILESTONE,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.milestoneObject.id) },
                {...typsObj}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,obj, "updateOne").then((response) => {
            res.send({
                status: true,
                statusText: "Milestone Update",
                data:''
            });
        }).catch((err)=>{
            res.send({
                status: false,
                statusText: err,
            });
            logger.error(`update milestone mongodb crud opration : ${err}`);
        });
        let prevMilestoneName = req.body.prevMilestoneName.milestoneName;
        let milestoneName = req.body.milestoneObject.milestoneName;
        exports.updateMilestoneNotification(prevMilestoneName,req.body.milestoneStatusObj,req.body.companyId, req.body.projectId,req.body.userDetail,milestoneName,req.body.milestoneObject,req.body.ProjectName,req.body.statusObj);
        exports.updateMilestoneHistory(req.body.companyId,req.body.projectId,req.body.userDetail,req.body.prevMilestoneName,req.body.milestoneObject);
    } catch (err) {
        res.send({status: false, statusText: err});
        logger.error(`handle updateMilestone : ${err}`);
    }
}

exports.updateMilestoneNotification = async (prevMilestoneName,milestoneStatusObj,companyId, projectId,userDetail,milestoneName,milestoneArray,ProjectName,statusObj) => {
    try{
        if(prevMilestoneName !== milestoneName){
            let historyObj ={};
            let notificationObj = {};
            historyObj.message = `<b>${userDetail.Employee_Name}</b> has update milestone as <b>${milestoneName}</b> from <b>${prevMilestoneName}</b> in <b>${ProjectName}</b> project.`;
            historyObj.key = 'Project_Milestone_Edit_Name';
            notificationObj.message = `<p>In Project <strong>${ProjectName}</strong> a Milestone named is update as <strong>${milestoneName}</strong> form <strong>${prevMilestoneName}</strong>.</p>`;
            notificationObj.key = 'project_milestone_edit_name';
            hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
                logger.error(`handle history: ${err}`);
            });
            HandleNotification({type: 'project', companyId: companyId, projectId: projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: notificationObj, userData: userDetail}).catch((err) => {
                logger.error(`handle notification for name: ${err}`);
            });
        }
        if(milestoneStatusObj){
            let statusHistoryObj ={};
            let historyObj ={};
            statusHistoryObj.key = 'Project_Milestone_Status_Changed';
            historyObj.key = 'Project_Milestone_Status_Changed';
            if(milestoneArray.statusArray && milestoneArray.statusArray.length){
                if(milestoneArray.statusArray.length !== 1){
                    let lastStatusName = statusObj.name;
                    let backgroundColor = statusObj.backgroundColor;
                    statusHistoryObj.message = 
                    `<p>Status of <strong>${milestoneName}</strong> Milestone is changed from <strong><span style="padding-right: 5px;
                    padding-left: 5px; border-radius: 5px; font-weight: 500;background-color:${backgroundColor}; color:#fff;">${lastStatusName}</span></strong> to <strong><span style="padding-right: 5px;
                    padding-left: 5px;  border-radius: 5px; font-weight: 500;background-color:${milestoneStatusObj.backgroundColor}; color:#fff;">${milestoneStatusObj.name}</span></strong> for <strong>${ProjectName}</strong> project.</p>`;  
                    historyObj.message = `<b>${userDetail.Employee_Name}</b> changed <b>${milestoneName}</b> milestone status from <b>${lastStatusName}</b> to <b>${milestoneStatusObj.name}</b> and status date set to <b>${moment(new Date(milestoneStatusObj.statusDate)).format('DD-MM-YYYY')}</b>.`
                }else{
                    let backgroundColor = statusObj.backgroundColor;
                    let milestoneStatus = statusObj.name;
                    statusHistoryObj.message = 
                    `<p>Status of <strong>${milestoneName}</strong> Milestone is added <strong>
                        <span style="padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;background-color:${backgroundColor}; 
                            color:#fff;">${milestoneStatus}
                        </span>
                        </strong> for <strong>${ProjectName}</strong> project.
                    </p>`;
                    historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the status of milestone ${milestoneName} to  ${milestoneStatus} and the status date is set to <b>${moment(new Date(milestoneStatusObj.statusDate)).format('DD-MM-YYYY')}</b>.`;
                }
            }
            hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
                logger.error(`handle history: ${err}`);
            });
            HandleNotification({type: 'project', companyId: companyId, projectId: projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: statusHistoryObj, userData: userDetail}).catch((err) => {
                logger.error(`handle notification for name: ${err}`);
            });
            try {
                if(milestoneStatusObj.value === 'FUNDED' || milestoneStatusObj.value === 'RELEASED'){
                    let obj = {
                        type:SCHEMA_TYPE.SETTINGS,
                        data: [
                            { "name": "milestone_status" },
                            { $set: {'settings.$[elementIndex].isCount':0 }},
                            {arrayFilters: [{ "elementIndex.value": milestoneStatusObj.value }]}
                        ]
                    }
                    MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                    }).catch((err)=>{
                        logger.error(`handle updateMilestoneNotification setting update : ${err}`);
                    });
                }else{
                    let obj = {
                        type:SCHEMA_TYPE.SETTINGS,
                        data: [
                            { "name": "milestone_status" },
                            {$inc: {"settings.$[elementIndex].isCount": 1}},
                            {arrayFilters: [{ "elementIndex.value": milestoneStatusObj.value }]}
                        ]
                    }
                    MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                    }).catch((err)=>{
                        logger.error(`handle updateMilestoneNotification setting update : ${err}`);
                    });
                }
            }catch(err){
                logger.error(`handle updateMilestoneNotification setting : ${err}`);
            }
        }
    } catch (err) {
        logger.error(`handle updateMilestoneNotification : ${err}`);
    }
}

exports.deleteMilestone = async (req, res) => {
    try {
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!(req.body.milestoneObjForDelete && Object.keys(req.body.milestoneObjForDelete).length)){
            res.send({status: false, statusText: 'milestoneArray is required'});
            return;
        }
        if(!(req.body.ProjectName)){
            res.send({status: false, statusText: 'ProjectName is required'});
            return;
        }
        if(!(req.body.userDetail && Object.keys(req.body.userDetail).length)){
            res.send({status: false, statusText: 'userDetail is required'});
            return;
        }
        let milestoneName = req.body.milestoneObjForDelete.milestoneName;
        let historyObj ={};
        let notificationObj = {};
        historyObj.message = `<b>${req.body.userDetail.Employee_Name}</b> has deleted milestone <b>${milestoneName}</b> in <b>${req.body.ProjectName}</b> project.`;
        historyObj.key = 'Project_Milestone_delete';
        notificationObj.message = `<p>In Project <strong>${req.body.ProjectName}</strong> a Milestone named <strong>${milestoneName}</strong> is deleted.</p>`;
        notificationObj.key = 'project_milestone_delete';
        let object = {
            type:SCHEMA_TYPE.PROJECTS,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                {$inc: {"milestoneAmount": -req.body.onlyNumber}}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,object, "updateOne").then((response) => {
        }).catch((err)=>{
            logger.error(`handle deleteMilestone project update amount : ${err}`);
        });
        let obj = {
            type: SCHEMA_TYPE.MILESTONE,
            data: [
                {
                    _id: new mongoose.Types.ObjectId(req.body.milestoneObjForDelete._id)
                }
            ]
        }
        MongoDbCrudOpration(req.body.companyId, obj, "deleteOne").then((response)=>{
            res.send({
                status: true,
                statusText: "Milestone Delete",
                data:response
            });
        }).catch((err)=>{
            res.send({status: false, statusText: err});
            logger.error(`delete milestone mongodb crud opration : ${err}`);
        })
        
        exports.deleteMilestoneNotification(req.body.companyId, req.body.projectId,req.body.userDetail,req.body.milestoneObjForDelete,historyObj,notificationObj);
    } catch (err) {
        res.send({status: false, statusText: err});
        logger.error(`handle deleteMilestone: ${err}`);
    }
};

exports.deleteMilestoneNotification = async (companyId, projectId,userDetail,milestoneObjForDelete,historyObj,notificationObj) => {
    try {
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
        HandleNotification({type: 'project', companyId: companyId, projectId: projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: notificationObj, userData: userDetail}).catch((err) => {
            logger.error(`handle notification for name: ${err}`);
        });
        if(milestoneObjForDelete.statusArray && milestoneObjForDelete.statusArray.length){
            try {
                milestoneObjForDelete.statusArray.forEach((element2) => {
                    if(element2.milestoneStatusColor === 'CANCELLED' || 
                        element2.milestoneStatusColor === 'RELEASED' ||
                        element2.milestoneStatusColor === 'FUNDED' ||
                        element2.milestoneStatusColor === 'REFUNDED'){
                        let obj = {
                            type:SCHEMA_TYPE.SETTINGS,
                            data: [
                                { "name": "milestone_status" },
                                { $set: {'settings.$[elementIndex].isCount':0 }},
                                {arrayFilters: [{ "elementIndex.value": element2.milestoneStatusColor }]}
                            ]
                        }
                        MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                        }).catch((err)=>{
                            logger.error(`handle deleteMilestoneNotification setting update : ${err}`);
                        });
                    }else{
                        let obj = {
                            type:SCHEMA_TYPE.SETTINGS,
                            data: [
                                { "name": "milestone_status" },
                                {$inc: {"settings.$[elementIndex].isCount": -1}},
                                {arrayFilters: [{ "elementIndex.value": element2.milestoneStatusColor }]}
                            ]
                        }
                        MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                        }).catch((err)=>{
                            logger.error(`handle deleteMilestoneNotification setting update : ${err}`);
                        });
                    }
                })
            }catch(err){
                logger.error(`handle deleteMilestoneNotification setting : ${err}`);
            }
        };
    } catch (err) {
        logger.error(`handle deleteMilestoneNotification : ${err}`);
    }
}

exports.clearMilestoneStatus = async (req, res) => {
    try {
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!(req.body.milestoneObject && Object.keys(req.body.milestoneObject).length)){
            res.send({status: false, statusText: 'milestoneArray is required'});
            return;
        }
        if(!(req.body.ProjectName)){
            res.send({status: false, statusText: 'ProjectName is required'});
            return;
        }
        if(!(req.body.userDetail && Object.keys(req.body.userDetail).length)){
            res.send({status: false, statusText: 'userDetail is required'});
            return;
        }
        let historyObj ={};
        let notificationObj = {};
        historyObj.message = `<b>${req.body.userDetail.Employee_Name}</b> has clear all the milestone status of milestone <b>${req.body.milestoneObject.milestoneName}</b> in <b>${req.body.ProjectName}</b> project.`;
        historyObj.key = 'Project_Milestone_status_clear';
        notificationObj.message = `<p>The milestone named <strong>${req.body.milestoneObject.milestoneName}</strong> in Project <strong>${req.body.ProjectName}</strong> the milestone status have been cleared.</p>`;
        notificationObj.key = 'project_milestone_status_clear';
        let typsObj = {
            statusArray: [],
            refundedAmount:[],
            minRefundDate:0,
            maxRefundDate:0,
            statusDate:0,
            statusId:''
        }
        if(req.body.milestoneObject && req.body.milestoneObject.statusArray && req.body.milestoneObject.statusArray.length && req.body.milestoneObject.statusArray[req.body.milestoneObject.statusArray.length - 1].milestoneStatusColor === "CANCELLED"){
            let objectAmount = {
                type:SCHEMA_TYPE.PROJECTS,
                data: [
                    { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                    {$inc: {"milestoneAmount": req.body.milestoneObject.amount}}
                ]
            }
            MongoDbCrudOpration(req.body.companyId,objectAmount, "updateOne").then((response) => {
            }).catch((err)=>{
                logger.error(`handle clearMilestoneStatus project update amount : ${err}`);
            });
        }else if(req.body.milestoneObject && req.body.milestoneObject.refundedAmount && req.body.milestoneObject.refundedAmount){
            let refundAmount = 0;
            req.body.milestoneObject.refundedAmount.forEach((ele)=>{
                refundAmount += ele.amount;
            });
            let objectAmount = {
                type:SCHEMA_TYPE.PROJECTS,
                data: [
                    { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                    {$inc: {"milestoneAmount": refundAmount}}
                ]
            }
            MongoDbCrudOpration(req.body.companyId,objectAmount, "updateOne").then((response) => {
            }).catch((err)=>{
                logger.error(`handle clearMilestoneStatus project update amount : ${err}`);
            });
        }
        let obj = {
            type:SCHEMA_TYPE.MILESTONE,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.milestoneObject._id) },
                {...typsObj}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,obj, "updateOne").then((response) => {
            res.send({
                status: true,
                statusText: "Milestone Clear Status",
                data:''
            });
        }).catch((err)=>{
            res.send({
                status: false,
                statusText: err,
            });
            logger.error(`clear status milestone mongodb crud opration : ${err}`);
        });
        exports.clearMilestoneStatusNotification(req.body.companyId, req.body.projectId,req.body.userDetail,req.body.milestoneObject,historyObj,notificationObj);
    } catch (err) {
        res.send({status: false, statusText: err});
    }
};

exports.clearMilestoneStatusNotification = async (companyId, projectId,userDetail,milestoneObjFor,historyObj,notificationObj) => {
    try {
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
        HandleNotification({type: 'project', companyId: companyId, projectId: projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: notificationObj, userData: userDetail}).catch((err) => {
            logger.error(`handle notification for name: ${err}`);
        });
        try {
            if(milestoneObjFor.statusArray && milestoneObjFor.statusArray.length){
                milestoneObjFor.statusArray.forEach((element2) => {
                    if(element2.milestoneStatusColor === 'CANCELLED' || 
                        element2.milestoneStatusColor === 'RELEASED' ||
                        element2.milestoneStatusColor === 'FUNDED' ||
                        element2.milestoneStatusColor === 'REFUNDED'){
                        let obj = {
                            type:SCHEMA_TYPE.SETTINGS,
                            data: [
                                { "name": "milestone_status" },
                                { $set: {'settings.$[elementIndex].isCount':0 }},
                                {arrayFilters: [{ "elementIndex.value": element2.milestoneStatusColor }]}
                            ]
                        }
                        MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                        }).catch((err)=>{
                            logger.error(`handle clearMilestoneStatusNotification setting update : ${err}`);
                        });
                    }else{
                        let obj = {
                            type:SCHEMA_TYPE.SETTINGS,
                            data: [
                                { "name": "milestone_status" },
                                {$inc: {"settings.$[elementIndex].isCount": -1}},
                                {arrayFilters: [{ "elementIndex.value": element2.milestoneStatusColor }]}
                            ]
                        }
                        MongoDbCrudOpration(companyId,obj, "updateOne").then(() => {
                        }).catch((err)=>{
                            logger.error(`handle clearMilestoneStatusNotification setting update : ${err}`);
                        });
                    }
                });
            }
        } catch (err) {
            logger.error(`handle clearMilestoneStatusNotification setting : ${err}`);
        }
    } catch (err) {
        logger.error(`handle clearMilestoneStatusNotification : ${err}`);
    }
};

exports.cancelMilestoneStatus = async (req, res) => {
    try {
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!(req.body.milestoneObject && Object.keys(req.body.milestoneObject).length)){
            res.send({status: false, statusText: 'milestoneArray is required'});
            return;
        }
        if(!(req.body.ProjectName)){
            res.send({status: false, statusText: 'ProjectName is required'});
            return;
        }
        if(!(req.body.userDetail && Object.keys(req.body.userDetail).length)){
            res.send({status: false, statusText: 'userDetail is required'});
            return;
        }
        if(!(req.body.statusObj && Object.keys(req.body.statusObj).length)){
            res.send({status: false, statusText: 'statusObj is required'});
            return;
        }
        let milestoneName = req.body.milestoneObject.milestoneName;
        req.body.milestoneObject.statusArray.forEach((element) => {
            element.statusDateValue = element.statusDateValue.seconds ? new Date(element.statusDateValue.seconds * 1000) : new Date(element.statusDateValue);
        });
        let objectAmount = {
            type:SCHEMA_TYPE.PROJECTS,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                {$inc: {"milestoneAmount": -req.body.onlyNumber}}
            ]
        }
        let typobject = {
            'statusArray': req.body.milestoneObject.statusArray ? req.body.milestoneObject.statusArray : [],
            'statusId' : req.body.milestoneObject.statusArray[req.body.milestoneObject.statusArray.length - 1].milestoneStatusColor,
            'statusDate' : new Date(req.body.milestoneObject.statusArray[req.body.milestoneObject.statusArray.length - 1].statusDateValue).getTime()
        }
        
        let obj = {
            type:SCHEMA_TYPE.MILESTONE,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.milestoneObject._id) },
                {...typobject}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,objectAmount, "updateOne").then((response) => {
        }).catch((err)=>{
            logger.error(`handle cancelMilestoneStatus project update amount : ${err}`);
        });
        MongoDbCrudOpration(req.body.companyId,obj, "updateOne").then((response) => {
            res.send({
                status: true,
                statusText: "Milestone Cancel Status",
                data:''
            });
        }).catch((err)=>{
            res.send({
                status: false,
                statusText: err,
            });
            logger.error(`cancel status milestone mongodb crud opration : ${err}`);
        });
        let notificationObj = {};
        notificationObj.message =
        `<p>In Project <strong>${req.body.ProjectName}</strong> a Milestone named <strong>${milestoneName}</strong> has updated the status <strong style="padding-right: 5px;padding-left: 5px;border-radius: 5px;font-weight: 500;background-color:${req.body.statusObj.backgroundColor};
        color:#fff;">${req.body.statusObj.name}</strong>.</p>`;
        notificationObj.key = 'Project_Milestone_Status_Changed';
        HandleNotification({type: 'project', companyId: req.body.companyId, projectId: req.body.projectId, taskId: undefined, folderId: undefined, sprintId: undefined, object: notificationObj, userData: req.body.userDetail}).catch((err) => {
            logger.error(`handle notification for name: ${err}`);
        });
    } catch (err) {
        res.send({status: false, statusText: err});
        logger.error(`cancelMilestoneStatus milestone: ${err}`);
    }
};

exports.refundAmount = async (req, res) => {
    try {
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!req.body.onlyNumber){
            res.send({status: false, statusText: 'onlyNumber is required'});
            return;
        }
        if(!(req.body.milestoneObject && Object.keys(req.body.milestoneObject).length)){
            res.send({status: false, statusText: 'milestoneArray is required'});
            return;
        }
        req.body.milestoneObject.refundedAmount.forEach((ele) => {
            if(ele.date){
                ele.date = ele.date ? ele.date.seconds ? new Date(ele.date.seconds * 1000) : new Date(ele.date) : '';
            }
        });
        const { minDate, maxDate } = req.body.milestoneObject.refundedAmount.reduce((acc, obj) => {
            const currentDate = new Date(obj.date).getTime(0,0,0);
            if (currentDate < acc.minDate) {
                acc.minDate = currentDate;
            }
            if (currentDate > acc.maxDate) {
                acc.maxDate = currentDate;
            }
            return acc;
        }, { minDate: new Date(req.body.milestoneObject.refundedAmount[0].date).getTime(0,0,0), maxDate: new Date(req.body.milestoneObject.refundedAmount[0].date).getTime(0,0,0)});
        const setMaxDate = new Date(maxDate).setHours(0,0,0);
        const setMinDate = new Date(minDate).setHours(0,0,0);
        let objectAmount = {
            type:SCHEMA_TYPE.PROJECTS,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.projectId) },
                {$inc: {"milestoneAmount": -req.body.onlyNumber}}
            ]
        }
        let typobject = {
            'refundedAmount': req.body.milestoneObject.refundedAmount ? req.body.milestoneObject.refundedAmount : [],
            'maxRefundDate' : new Date(setMaxDate).getTime(),
            'minRefundDate' : new Date(setMinDate).getTime()
        }
        let obj = {
            type:SCHEMA_TYPE.MILESTONE,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.milestoneObject._id) },
                {...typobject}
            ]
        }
        MongoDbCrudOpration(req.body.companyId,objectAmount, "updateOne").then((response) => {
        }).catch((err)=>{
            logger.error(`handle refundAmount project update amount : ${err}`);
        });
        MongoDbCrudOpration(req.body.companyId,obj, "updateOne").then((response) => {
            res.send({
                status: true,
                statusText: "Milestone Refund Amount",
                data:''
            });
        }).catch((err)=>{
            res.send({
                status: false,
                statusText: err,
            });
            logger.error(`refund amount milestone mongodb crud opration : ${err}`);
        });        
    } catch (err) {
        res.send({status: false, statusText: err});
        logger.error(`refundAmount milestone: ${err}`);
    }
};

exports.draggableMilestone = async (req, res) => {
    try {
        if(!req.body){
            res.send({status: false, statusText: 'Request body is required'});
            return;
        }
        if(!req.body.companyId){
            res.send({status: false, statusText: 'Company Id is required'});
            return;
        }
        if(!req.body.projectId){
            res.send({status: false, statusText: 'project Id is required'});
            return;
        }
        if(!(req.body.milestoneObject && Object.keys(req.body.milestoneObject).length)){
            res.send({status: false, statusText: 'milestoneObject is required'});
            return;
        }
        let object = {
            'order': req.body.milestoneObject.order,
        };
        let obj = {
            type:SCHEMA_TYPE.MILESTONE,
            data: [
                { _id: new mongoose.Types.ObjectId(req.body.milestoneObject._id) },
                {...object}
            ]
        };
        MongoDbCrudOpration(req.body.companyId,obj, "updateOne").then((response) => {
            res.send({
                status: true,
                statusText: "Milestone Drag",
                data:''
            });
        }).catch((err)=>{
            res.send({
                status: false,
                statusText: err,
            });
            logger.error(`refund amount milestone mongodb crud opration : ${err}`);
        });
        
    } catch (err) {
        res.send({status: false, statusText: err});
        logger.error(`draggableMilestone milestone: ${err}`);
    }
};

exports.addMilestoneHistory = (milestoneObject,companyId, projectId,userDetail,statusobj) => {
    if(milestoneObject.startDate){
        let historyObj = {};
        historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the start date of milestone <b>${milestoneObject.milestoneName}</b> to <b>${moment(new Date(milestoneObject.startDate)).format('DD-MM-YYYY')}</b>`;
        historyObj.key = 'Project_Milestone_Changed';
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
    }
    if(milestoneObject.endDate){
        let historyObj = {};
        historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the end date of milestone <b>${milestoneObject.milestoneName}</b> to <b>${moment(new Date(milestoneObject.endDate)).format('DD-MM-YYYY')}</b>`;
        historyObj.key = 'Project_Milestone_Changed';
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
    }
    if(milestoneObject.dueDate){
        let historyObj = {};
        historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the due date of milestone <b>${milestoneObject.milestoneName}</b> to <b>${moment(new Date(milestoneObject.dueDate)).format('DD-MM-YYYY')}</b>`;
        historyObj.key = 'Project_Milestone_Changed';
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
    }
    if(milestoneObject.statusArray.length > 0){
        let historyObj = {};
        historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the status date of milestone <b>${milestoneObject.milestoneName}</b> to <b>${moment(new Date(milestoneObject.statusArray[0].statusDateValue)).format('DD-MM-YYYY')}</b>`;
        historyObj.key = 'Project_Milestone_Changed';
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
    }
    if(statusobj){
        let historyObj = {};
        historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the status of milestone <b>${milestoneObject.milestoneName}</b> to <b>${statusobj.label}</b>`;
        historyObj.key = 'Project_Milestone_Changed';
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
    }
    if(milestoneObject.amount){
        let historyObj = {};
        historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the amount of milestone <b>${milestoneObject.milestoneName}</b> to <b>${milestoneObject.amount}</b>`;
        historyObj.key = 'Project_Milestone_Changed';
        hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
            logger.error(`handle history: ${err}`);
        });
    }
}

exports.updateMilestoneHistory = (companyId,projectId,userDetail,oldObject,newObject) => {
    if(newObject.startDate){
        let historyObj = {
            key : 'Project_Milestone_Changed'
        }
        if (oldObject.startDate === '' && newObject.startDate) {
            historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the start date of  milestone <b>${newObject.milestoneName}</b> to ${moment(new Date(newObject.startDate)).format('DD-MM-YYYY')}</b>.`
        }
        else if(new Date(oldObject.startDate).getTime() !== new Date(newObject.startDate).getTime()){
            historyObj.message = `<b>${userDetail.Employee_Name}</b> changed <b>${newObject.milestoneName}</b> milestone start date from <b>${moment(new Date(oldObject.startDate)).format('DD-MM-YYYY')}</b> to <b>${moment(new Date(newObject.startDate)).format('DD-MM-YYYY')}</b>`
        } 
        if(historyObj.message){
            hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
                logger.error(`handle history: ${err}`);
            });
        }
    }

    if(newObject.endDate){
        let historyObj = {
            key : 'Project_Milestone_Changed'
        }
        if (oldObject.endDate === '' && newObject.endDate) {
            historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the end date of  milestone <b>${newObject.milestoneName}</b> to ${moment(new Date(newObject.endDate)).format('DD-MM-YYYY')}</b>.`
        }
        else if(new Date(oldObject.endDate).getTime() !== new Date(newObject.endDate).getTime()){
            historyObj.message = `<b>${userDetail.Employee_Name}</b> changed <b>${newObject.milestoneName}</b> milestone end date from <b>${moment(new Date(oldObject.endDate)).format('DD-MM-YYYY')}</b> to <b>${moment(new Date(newObject.endDate)).format('DD-MM-YYYY')}</b>`
        }
        if(historyObj.message){
            hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
                logger.error(`handle history: ${err}`);
            });
        }
    }

    if(newObject.amount){
        let historyObj = {
            key : 'Project_Milestone_Changed'
        }
        if (oldObject.amount === '' && newObject.amount) {
            historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the amount of milestone <b>${newObject.milestoneName}</b> to ${newObject.amount}</b>.`
        }
        else  if(oldObject.amount !== newObject.amount){
            historyObj.message = `<b>${userDetail.Employee_Name}</b> changed <b>${newObject.milestoneName}</b> milestone amount from <b>${oldObject.amount}</b> to <b>${newObject.amount}</b>`
        }
        if(historyObj.message){
            hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
                logger.error(`handle history: ${err}`);
            });
        }
    }

    if(newObject.dueDate){
        let historyObj = {
            key : 'Project_Milestone_Changed'
        }
        if (oldObject.dueDate === '' && newObject.dueDate) {
            historyObj.message = `<b>${userDetail.Employee_Name}</b> has set the due date of  milestone <b>${newObject.milestoneName}</b> to ${moment(new Date(newObject.dueDate)).format('DD-MM-YYYY')}</b>.`
        } 
        else if(new Date(oldObject.dueDate).getTime() !== new Date(newObject.dueDate).getTime()){
            historyObj.message = `<b>${userDetail.Employee_Name}</b> changed <b>${newObject.milestoneName}</b> milestone due date from <b>${moment(new Date(oldObject.dueDate)).format('DD-MM-YYYY')}</b> to <b>${moment(new Date(newObject.dueDate)).format('DD-MM-YYYY')}</b>`
        }
        if(historyObj.message){
            hlp.HandleHistory('project',companyId, projectId,null,historyObj, userDetail).catch((err) => {
                logger.error(`handle history: ${err}`);
            });
        }
    }
}