import { WASABI_RETRIVE_OBJECT, WASABI_RETRIVE_USER_PROFILE } from "@/config/env";
import { apiRequest, apiRequestWithoutCompnay } from "@/services";
import { getMessaging, getToken } from "firebase/messaging";
const messaging = getMessaging();

export const fcmToken = () => {
    return new Promise((resolve, reject) => {
        try {
            if(Notification.permission === 'granted'){
                getToken(messaging).then((currentToken) => {
                    if (currentToken) {
                        resolve({status:true, token:currentToken, message:'granted'});
                    } else {
                        console.info('No registration token available. Request permission to generate one.');
                    }
                }).catch((err) => {
                    reject({status:true,token:'',message:err});
                    console.error('An error occurred while retrieving token. ', err);
                });
            } else {
                reject({status:true,token:'',message:'denied'});
            }
        } catch (error) {
            reject(error);
        }
    })
}


export const getConvertedTimeString = (n,type) =>{
    try{
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        if (type == 'update') {
            if(rhours > 0 || rminutes > 0 || (rhours > 0 && rminutes > 0)){
                // return rhours.toString().padStart(2, '0') + ':' + rminutes.toString().padStart(2, '0');
                return (rhours >= 0 && rhours <= 9 ? "0"+rhours : rhours) + ':' + ((rminutes >= 0 && rminutes <= 9) ? "0"+ rminutes : rminutes);
            }else{
                return ''
            }
        } else if (type == 'fetch') {
            return rhours.toString().padStart(2, '0') + 'h' + ' ' + rminutes.toString().padStart(2, '0') + 'm';
        } else if (type == 'onSelectItem') {
            if (rminutes < 60) {
                return rminutes.toString() + 'm';
            } else if (rminutes == 60) {
                return rhours.toString() + 'h';
            } else if (rminutes > 60) {
                return rhours.toString() + 'h' + ' ' + rminutes.toString() + 'm';
            }
        }
        if (type == 'estimatedSuggestion') {
            let array = [];
            array.push(rhours.toString().padStart(2, '0') + 'hour' + ' ' + rminutes.toString().padStart(2, '0') + 'minute');
            return array
        }
    }
    catch(error){
        console.error(error);
    }
}

export const totalDateRowLog = (colName,array,key) =>{
    let finalTotal = 0;
    try{
        let idArray = [];
        let tempObj = colName[key] ? colName[key] : null;
        if(array.length > 0){
            array.map((val)=>{
                if(Object.keys(tempObj).length){
                    if(Object.keys(tempObj).includes(val.id)){
                       finalTotal += tempObj[`${val.id}`]
                    }
                }
                idArray.push(val.id)
            })
        }
        return finalTotal;
    }
    catch(error){
        console.error(error);
        return finalTotal;
    }
}


export const totalDateProjectRowLog = (colName,array, key) =>{
    let finalTotal = 0;
    try{
        let idArray = [];
        let tempObj = colName[key] ? colName[key] : null;
        if(array.length > 0){
            array.map((val)=>{
                if(Object.keys(tempObj).length){
                    if(Object.keys(tempObj).includes(val.id)){
                       finalTotal += tempObj[`${val.id}`]
                    }
                }
                idArray.push(val.id)
            })
        }
        return finalTotal;
    }
    catch(error){
        console.error(error);
        return finalTotal;
    }
}

export const projectComponentsIcons = (key) => {

    let data = [
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_list_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_list_active.svg"),
            keyName: "ProjectListView"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_board_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_board_active.svg"),
            keyName: "ProjectKanban"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_project_detail_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_project_details_active.svg"),
            keyName: "ProjectDetail"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_comments_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_comments_active.svg"),
            keyName: "Comments"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_calender_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_calender_active.svg"),
            keyName: "Calendar"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_activity_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_activity_active.svg"),
            keyName: "ActivityLog"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_workload_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_workload_active.svg"),
            keyName: "Workload"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_gantt_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_gantt_active.svg"),
            keyName: "Gantt"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_table_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_table_active.svg"),
            keyName: "TableView"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_timeline_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_timeline_active.svg"),
            keyName: "Timeline"
        },
        {
            icon: require("@/assets/images/svg/compoment_inactive_icons/comp_embed_inactive.svg"),
            activeIcon: require("@/assets/images/svg/compoment_active_icons/comp_embed_active.svg"),
            keyName: "Embed"
        }
    ];

    const result = data.filter(x => x.keyName === key);
    return result[0];
}

export const projectAppsIcons = (key) => {

    let data = [
        {
            key: "Priority",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_priority_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_priority_active.svg")
        },
        {
            key: "MultipleAssignees",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_mulitple_assignee_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_mulitple_assignee_active.svg")
        },
        {
            key: "TimeEstimates",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_estimate_time_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_estimate_time_active.svg")
        },
        {
            key: "Milestones",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_milstone_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_milstone_active.svg")
        },
        {
            key: "tags",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_tags_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_tags_active.svg")
        },
        {
            key: "CustomFields",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/app_custom_field_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/app_custom_field_active.svg")
        },
        {
            key: "TimeTracking",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_time_tracking_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_time_tracking_active.svg")
        },
        {
            key: "IncompleteWarning",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_incomplete_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_incomplete_active.svg")
        },
        {
            key: "AI",
            beforeIcon: require("@/assets/images/svg/project_apps_inactive_icons/apps_ai_inactive.svg"),
            afterIcon: require("@/assets/images/svg/project_apps_active_icons/apps_ai_active.svg")
        }
    ];

    const result = data.filter(x => x.key === key);
    return result[0];
}

export const companyPrioritiesIcons = (key) => {

    let data = [
        {
            value: "HIGH",
            statusImage: require("@/assets/images/png/priority_high.png")
        },
        {
            value: "MEDIUM",
            statusImage: require("@/assets/images/png/priority_medium.png")
        },
        {
            value: "LOW",
            statusImage: require("@/assets/images/png/priority_low.png")
        }
    ];

    const result = data.filter(x => x.value === key);
    return result[0];
}

export const getImageUrl = (item) => {
    if(item.name === 'Multiple Assignees' && item.appStatus === false){
        return require("@/assets/images/png/mutiplegrey.png");
    }
    if(item.name === 'Multiple Assignees' && item.appStatus === true){
        return require("@/assets/images/png/mutipleblue.png");
    }
    if(item.name === 'Time Estimate' && item.appStatus === true){
        return require("@/assets/images/timeBlue.png");
    }
    if(item.name === 'Time Estimate' && item.appStatus === false){
        return require("@/assets/images/timegrey.png");
    }
    if(item.name === 'Priority' && item.appStatus === true){
        return require("@/assets/images/priorityblue.png");
    }
    if(item.name === 'Priority' && item.appStatus === false){
        return require("@/assets/images/prioritygrey.png");
    }
    if(item.name === 'Time Tracking' && item.appStatus === true){
        return require("@/assets/images/timevalueblue.png");
    }
    if(item.name === 'Time Tracking' && item.appStatus === false){
        return require("@/assets/images/timetracking.png");
    }
    if(item.name === 'Milestones' && item.appStatus === true){
        return require("@/assets/images/checkflagblue.png");
    }
    if(item.name === 'Milestones' && item.appStatus === false){
        return require("@/assets/images/checkflaggrey.png");
    }
    if(item.name === 'Tags' && item.appStatus === true){
        return require("@/assets/images/tagsblue.png");
    }
    if(item.name === 'Tags' && item.appStatus === false){
        return require("@/assets/images/tagsgrey.png");
    }
    if(item.name === 'Custom Fields'){
        if(item.appStatus === false) {
            return require("@/assets/images/editgrey.png");
        } else {
            return require("@/assets/images/editblue.png");
        }
    }
}

export const storageHelper = () => {
    function getStorageImage(data = {companyId: null, data: null, userImage: null, tuhumbnailSize: null}) {
        return new Promise((resolve, reject) => {
            try {
                if(!data) {
                    reject(new Error("No data provided"))
                    return;
                }

                const cid = data.companyId;
                let path = ''
                if (data.tuhumbnailSize) {
                    const [filename, extension] = data.data.url.split(".");
                    path = `${filename}-${data.tuhumbnailSize}.${extension}`;
                } else {
                    path = data.data.url
                }
                const formData = {
                    companyId: cid,
                    path: path
                }
                let url = data.userImage ? WASABI_RETRIVE_USER_PROFILE : WASABI_RETRIVE_OBJECT;
                let reqAPi;
                if (data.userImage) {
                    reqAPi = apiRequestWithoutCompnay("post", url, formData);
                } else {
                    reqAPi = apiRequest("post", url, formData);
                }
                reqAPi.then((response)=>{
                    if(response.data.status === true){
                        resolve(response.data.statusText)
                    }
                }).catch((error)=>{
                    reject(error);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    return {
        getStorageImage
    }
}