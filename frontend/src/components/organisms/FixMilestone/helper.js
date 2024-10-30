import * as env from '@/config/env';
import {useToast} from 'vue-toast-notification';
import { apiRequest } from '../../../services';
const $toast = useToast();
export function milestoneData() {
    // deleteMilestoneHelper
    function deleteMilestoneHelper(projectId,companyId,user,milestoneObjForDelete,ProjectName,check,amount){
        try {
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'userDetail':user,
                    'ProjectName': ProjectName,
                    'milestoneObjForDelete':milestoneObjForDelete,
                    'fixOrHourlyMilCheck':check,
                    'onlyNumber':amount
                }
                apiRequest("post", env.DELETE_MILESTONE, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone deleted successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error('Error in deleting milestone',{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    console.error("Error in Add Milestone",error);
                    reject(error);
                });
            });
        }catch (e) {
            console.error(e);
        }
    }
    // addMilestoneHelper
    function addMilestoneHelper(projectId,companyId,user,ProjectName,value,statusObj,check){
        try{
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'userDetail':user,
                    'ProjectName': ProjectName,
                    'milestoneObject':value,
                    'milestoneStatusObj':statusObj,
                    'fixOrHourlyMilCheck':check
                }
                apiRequest("post", env.ADD_MILESTONE, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone added successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error('Error in adding milestone',{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    reject(error);
                    console.error("Error in Add Milestone",error);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }
    // edit milestone helper function
    function editMilestoneHelper(projectId,companyId,user,ProjectName,val,status,prevMilestoneName,obj,check,amount){
        try{
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'userDetail':user,
                    'ProjectName': ProjectName,
                    'milestoneObject':val,
                    'milestoneStatusObj':status,
                    'prevMilestoneName':prevMilestoneName,
                    'statusObj':obj[0],
                    'fixOrHourlyMilCheck':check,
                    'onlyNumber':amount
                }
                apiRequest("post", env.UPDATE_MILESTONE, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone update successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error('Error in updating milestone',{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    console.error("Error in Add Milestone",error);
                    reject(error);
                });
            });
        }catch (e) {
            console.error(e);
        }
    }
    // clear milestone helper function
    function clearMilestoneHelper(projectId,companyId,user,ProjectName,status){
        try{
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'userDetail':user,
                    'ProjectName': ProjectName,
                    'milestoneObject':status
                }
                apiRequest("post", env.CLEAR_MILESTONE_STATUS, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone status update successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error("Error in updating milestone status",{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    console.error("Error in Add Milestone",error);
                    reject(error);
                });
            });
        }catch (e) {
            console.error(e);
        }
    }
    // cancel Milestone status Helper
    function cancelMilestoneHelper(projectId,companyId,user,ProjectName,status,obj,check,amount){
        try{
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'userDetail':user,
                    'ProjectName': ProjectName,
                    'milestoneObject':status,
                    'statusObj':obj[0],
                    'fixOrHourlyMilCheck':check,
                    'onlyNumber':amount
                }
                apiRequest("post", env.CANCEL_MILESTONE_STATUS, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone status update successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error('Error in updating milestone status',{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    console.error("Error in Add Milestone",error);
                    reject(error);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }
    // refund Milestone Helper function
    function refundMilestoneHelper(projectId,companyId,milestoneArray,check,onlyNumber){
        try{
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'milestoneObject':milestoneArray,
                    'fixOrHourlyMilCheck':check,
                    'onlyNumber':onlyNumber
                }
                apiRequest("post", env.REFUND_AMOUNT, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone refund amount update successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error('Error in updating milestone refund amount',{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    console.error("Error in Add Milestone",error);
                    reject(error);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }
    //handle Draggable Milestone Helper function
    function handleDraggableMilestone(projectId,companyId,user,ProjectName,milestoneArray){
        try{
            return new Promise((resolve, reject) => {
                const axiosData = {
                    'projectId':projectId,
                    'companyId':companyId,
                    'userDetail':user,
                    'ProjectName': ProjectName,
                    'milestoneObject':milestoneArray
                }
                apiRequest("post", env.DRAGGABLE_MILESTONE, axiosData).then((result)=>{
                    if(result.data.status){
                        $toast.success("Milestone update successfully",{position: 'top-right'});
                        resolve(result.data.data);
                    }else{
                        $toast.error('Error in updating milestone',{position: 'top-right'});
                        reject(result.data.statusText);
                    }
                }).catch((error)=>{
                    console.error("Error in Add Milestone",error);
                    reject(error);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }
    function getCommaSeperatedNumber (n) {
        let numVal = Number(n)
        return numVal.toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: true})
    }
    return {
        deleteMilestoneHelper,
        addMilestoneHelper,
        editMilestoneHelper,
        clearMilestoneHelper,
        cancelMilestoneHelper,
        refundMilestoneHelper,
        handleDraggableMilestone,
        getCommaSeperatedNumber
    }
}