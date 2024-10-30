import { createProject } from '@/utils/NotificationTemplate';
import { apiRequest } from '../../../services';
import * as env from '@/config/env';

export const HandleProject = async (path,dataObj,userData,CompanyId,action) => {
    return new Promise((resolve, reject) => {
        try {
            dataObj.isTemplate = action;
            apiRequest("post", env.CREATE_PROJECT, dataObj).then((result)=>{
                if(result.data.status === true){
                    let id = result.data.data
                    if(result.data.customFieldVal !== undefined) {
                        resolve({status: true, id: id, message: "Project created successfully.",customFieldValueArray:result.data.customFieldVal});
                    } else {
                        resolve({status: true, id: id, message: "Project created successfully."});
                    }
                    let historyObj = {
                        'message': `<b>${userData.Employee_Name}</b> has created new </b> as <b>${dataObj.ProjectName}</b> project`,
                        'key' : 'Project_Created',
                    }
                    let notificationObject = {
                        'message': createProject({
                            projectName: dataObj.ProjectName,
                        }),
                        'key': 'Project_Created',
                        'projectId': id,
                    }
                    apiRequest("post", env.HANDLE_HISTORY, {
                        type: 'project', 
                        companyId: CompanyId,
                        projectId: id,
                        taskId: null,
                        object: historyObj,
                        userData: userData
                    })
                    .catch((error) => {
                        console.error("ERROR in update history", error);
                    })
    
                    apiRequest("post", env.HANDLE_NOTIFICATION, {
                        type: 'project',
                        companyId: CompanyId,
                        projectId: id,
                        object: notificationObject,
                        userData: userData
                    })
                    .catch((error) => {
                        console.error("ERROR in update notification", error);
                    })
                }else{
                    resolve({status: false, message: "Error In creating Project."});
                }
            })
            .catch((error) => {
                reject(error);
            })
        }
        catch(error){
            reject(error);
        }
    })
}