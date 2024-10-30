import db from "@/config/firebaseInit";
import { collection, doc, endAt, endBefore, limit, orderBy, query, startAfter, startAt, where } from "firebase/firestore";
import { computed, inject, ref } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import * as env from '@/config/env';
import { apiRequest } from '../services';
import { useToast } from "vue-toast-notification";
import Store from '@/store/index'

export function useCustomComposable() {
    const urlRegex = inject("$urlRegex")

    function debounce(func, timeout = 300) {
        let timer = null;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(null, args); }, timeout);
        };
    }

    function setTitle({title = "", prefix = ""}) {
        document.title = prefix + title;
    }

    function makeUniqueId(length = 6) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 
            charactersLength));
        }
        return result;
    }

    function checkPermission(path = '', globalPermission= true, options = {gettersVal: null}) {
        try {
            const {gettersVal} = options;

            let tmpGetter = {};
            if(gettersVal) {
                tmpGetter = gettersVal
            } else {
                tmpGetter = Store.getters
            }
            const user = computed(() => tmpGetter["settings/companyUserDetail"]);
            const globalRules = computed(() => tmpGetter["settings/rules"]);
            const projectRules = computed(() => tmpGetter["settings/projectRules"])
            const rules = globalPermission === true ? globalRules : projectRules;

            if(!path.length || !Object.keys(user.value).length || !Object.keys(rules.value).length) return null;
            let rule = null;
            try {
                path.split('.').forEach((x) => {
                    rule = rule ? rule[x] : rules.value[x];
                })
            } catch (error) {
                console.error(error);
                return null;
            }
            // For Project specific permission
            if(globalPermission === false && path === 'project.project_list'){
                return true;
            }
    
            if(user.value.roleType === 1 || user.value.roleType === 2) {
                return true;
            } else if(user.value.roleType === null) {
                console.error("2nd parameter is required");
                return null;
            } else if(rule === undefined || !Object.keys(rule).length) {
                console.error("1st parameter is required");
                return null;
            }
    
            if(!rule.roles.filter((x) => x.key === user.value.roleType).length) {
                return null
            } else {
                return rule.roles.filter((x) => x.key === user.value.roleType)[0].permission
            }
        } catch (error) {
            console.error(error,"ERROR IN PERMISSION",path);
        }
    }

    function checkApps(app = null,projectData) {
        if(app === null) {
            return false;
        }
        
        const project = inject("selectedProject");
        const checkProject = project && Object.keys(project?.value).length > 0 ? project.value : projectData;
        if(!checkProject?.apps) return false;

        const appIndex = checkProject?.apps?.findIndex((x) => x.key === app);
        if(appIndex !== -1) {
            return checkProject.apps[appIndex].appStatus;
        } else {
            return null;
        }
    }

    function showCounts({project, key = "project", sprints = [], showArchived = false}){
        if(!project || !Object.keys(project).length) return {count: 0, color: "#FF0000"};

        const {getters} = useStore();
        const myCounts = computed(() => getters["users/myCounts"]?.data || {})

        let count = 0;

        let color = "";

        const getSprintCount = (arr) => {
            if(arr && Object.keys(myCounts.value || {}).length) {
                let counts = 0
                Object.keys(myCounts.value).forEach((key2) => {
                    if(arr.filter((x) => key2.includes(x.id)).length && key2.includes("sprint_") && key2.includes("_comments")) {
                        counts += myCounts.value[key2] || 0;
                    }
                })
                return counts;
            } else {
                return 0;
            }
        }

        if(key === "project" || key === "project_only") {
            if(myCounts.value?.[`project_${project._id}_comments`]) {
                count += myCounts.value?.[`project_${project._id}_comments`];
                color = "#EABB00";
            }
            if(key === "project") {
                let count2 = 0;
                if(project.sprintsObj && Object.keys(project.sprintsObj).length) {
                    let tmpSprints = Object.values(project.sprintsObj)
                    if(showArchived) {
                        tmpSprints = tmpSprints.filter((x) => x.deletedStatusKey === 2 || x.archiveTaskCount);
                    } else {
                        tmpSprints = tmpSprints.filter((x) => !x.deletedStatusKey);
                    }
                    count2 += getSprintCount(tmpSprints);
                }
                project.sprintsfolders && Object.keys(project.sprintsfolders).forEach((key) => {
                    if(project.sprintsfolders[key].sprintsObj && Object.keys(project.sprintsfolders[key].sprintsObj).length) {
                        let tmpSprints = Object.values(project.sprintsfolders[key].sprintsObj)
                        if(showArchived) {
                            tmpSprints = tmpSprints.filter((x) => x.deletedStatusKey === 2 || x.archiveTaskCount);
                        } else {
                            tmpSprints = tmpSprints.filter((x) => !x.deletedStatusKey);
                        }
                        count2 += getSprintCount(tmpSprints);
                    }
                })
                if(count2 > 0) {
                    if(count > 0) {
                        color = "#FF9600";
                    } else {
                        color = "#FF0000";
                    }
                    count += count2;
                }
            }
        } else {
            color = "#FF0000";
            let tmpSprints = JSON.parse(JSON.stringify(sprints))

            if(showArchived) {
                tmpSprints = tmpSprints.filter((x) => x.deletedStatusKey === 2 || x.archiveTaskCount);
            } else {
                tmpSprints = tmpSprints.filter((x) => !x.deletedStatusKey);
            }
            count += getSprintCount(tmpSprints);
        }

        return {count, color};
    }

    function changeText(msg, wrapStart = `<b class="mentioned">`, wrapEnd = `</b>`) {
        const mentionRegex = /@\[[\w ]+?\]\(\w{4,30}\)/gi;
        let mentions = msg.match(mentionRegex);

        if(mentions !== null) {
            mentions.forEach((mention) => {
                msg = msg.replace(mention, `${wrapStart}@${mention.split("]")[0].replace("@[", "")}${wrapEnd}`)
            })
        }

        return msg;
    }

    function addZero(val) {
        return val > 9 ? val : "0"+val;
    }

    function checkLink(msg, forRender = false) {
        let links = msg.match(urlRegex.value);

        if(links === null) {
            if(forRender) {
                return msg;
            } else {
                return null;
            }
        }

        links = links.sort((a, b) => a?.length > b?.length ? 1 : -1)

        links.forEach(link=>{
            msg = msg.replace(link, `<a href="${link}" target="_blank">${link}</a>`);
        })
        return msg;
    }

    function compareObjects(object1, object2, key) {
        const obj1 = object1[key];
        const obj2 = object2[key];
        if (obj1 < obj2) {
          return -1
        }
        if (obj1 > obj2) {
          return 1
        }
        return 0
    }

    function compareSprints(newObj = null, oldObj = null) {
        let sprintsUpdated = false;

        if(!newObj || !oldObj) return true;

        if(Object.keys(newObj).length === Object.keys(oldObj).length) {
            if(Object.keys(newObj).filter((x) => !Object.keys(oldObj).includes(x)).length) {
                sprintsUpdated = true;
            } else {
                Object.keys(newObj).forEach(key => {
                    if(JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
                        sprintsUpdated = true;
                    }
                })
            }
        } else {
            sprintsUpdated = true;
        }

        return sprintsUpdated;
    }

    // CHECK TOTAL AVAILABLE BUCKET SIZE
    function checkBucketStorage(fileSizes,options = {gettersVal: null,defineFileSize: null}) {
        try {
            const {gettersVal,defineFileSize} = options;
            const $toast = useToast();
            let tmpGetter = {};
            if(gettersVal) {
                tmpGetter = gettersVal
            } else {
                const { getters } = useStore();
                tmpGetter = getters
            }
            const currentCompany = computed(() => tmpGetter['settings/selectedCompany']);
            if(currentCompany.value?.planFeature === undefined){
                $toast.error(`Upgrade your plan.`,{position: 'top-right'});
                return false;
            }

            if(fileSizes.includes(undefined)){
                $toast.error(`Please select valid file.`, { position: 'top-right' });
                return false;
            }else{
                const totalSizeInMB = fileSizes.reduce((acc, current) => acc + current / (1024 * 1024), 0); // total size of selected images in mb
                let wasabiBucketStorage = currentCompany.value.planFeature.bucketStorage; // file storage according to plan feature in mb
                let usedSpace = currentCompany.value.bucketSize; // used space in wasabi buckets in mb

                if(wasabiBucketStorage === null){
                    return checkFileSize(fileSizes,currentCompany.value,defineFileSize);
                }else{
                    const totalAvailableSpace = wasabiBucketStorage - usedSpace; // total available space in wasabi buckets

                    if (totalAvailableSpace > totalSizeInMB) {
                        return checkFileSize(fileSizes,currentCompany.value,defineFileSize);
                    }else{
                        $toast.error(`Storage exceeded. Upgrade your plan`, { position: 'top-right' });
                        return false;
                    }
                }
            }
        } catch (error) {
            console.error(error,"Error in check file");
        }
    }


    // Check per file Max Upload Size Plan condition
    function checkFileSize(fileSizes,currentCompany,defineFileSize) {
        try {
            const $toast = useToast();
            let maxFileSize = currentCompany.planFeature.maxFileSize;
            // 'defineFileSize' deafine as the already existing particular size in the file. If `maxFileSize` is greater than `fileSize`, then we use `fileSize`; otherwise, we use `maxFileSize`.
            if(defineFileSize != null){
                if(maxFileSize > defineFileSize){
                    maxFileSize = defineFileSize;
                }
            }
            let fileSize = maxFileSize

            if(maxFileSize === null){
                return true;
            }else{
                maxFileSize = maxFileSize * 1024 * 1024;
                const isValidFileSize = fileSizes.every(size => size <= maxFileSize);
    
                if (!isValidFileSize) {
                    $toast.error(`The max file size is ${fileSize} MB.`, { position: 'top-right' });
                }
                return isValidFileSize;
            }
        } catch (error) {
            console.error(error,"Error in check file");
        }
    }

    let delayTime = null;
    function debouncerWithPromise(timeout = 1000) {
        return new Promise((resolve) => {
            if(delayTime) {
                clearTimeout(delayTime);
            }
            delayTime = setTimeout(() => {
                resolve();
            }, timeout);
        })
    }
    
    function getWasabiImageLink(companyId,path) {
        return new Promise((resolve, reject) => {
                try {
                    let url = env.WASABI_RETRIVE_OBJECT;
                    const formData = {
                        companyId: companyId,
                        path: path
                    }
                    let reqAPi = apiRequest("post", url, formData);
                    reqAPi.then((response)=>{
                        if(response.data.status === true){
                            resolve(response.data.statusText);
                        } else {
                            resolve('');
                        }
                    }).catch((err)=>{
                        reject(err);
                        console.error(err,"error in get link");
                    })
                } catch (error) {
                    reject(error);
                    console.error(error,"error in get link");
                }
            })
    }

    function checkGenerateResponseLimit(totalLimit,id) {
        const currentCompany = computed(() => Store.getters['settings/selectedCompany']);
        const companyUsers = ref(Store.getters["settings/companyUsers"]);
        const companyIndex = companyUsers.value.findIndex((x) => x.userId === id);
        let userUsedCount = companyUsers.value[companyIndex]?.aiRequestedCount || 0;
        if(currentCompany.value?.planFeature === undefined || currentCompany.value?.planFeature?.aiRequest === undefined){
            return false;
		}
        let totalAiCount = currentCompany.value?.planFeature?.aiRequest; // Plan ai Count

        if(totalAiCount === null){
            // totalLimit to -1 means unlimited access, and true indicates that the user is either the owner or an admin
            if(totalLimit == -1 || totalLimit === true){
                return true;
            }else{
                //totalLimit set to null or 0 means the user has no rights.
                if(totalLimit === null || totalLimit === 0){
                    return false;
                }
                return userUsedCount < totalLimit;
            }
        }else{
            return checkResponse(totalLimit,userUsedCount);
        }
    }

    function checkResponse (totalLimit,userUsedCount) {
        const currentCompany = computed(() => Store.getters['settings/selectedCompany']);

        let totalAiCount = currentCompany.value?.planFeature?.aiRequest; // Plan ai Count
        let totalUsedCount = currentCompany.value?.aiTotalRequestedCount || 0; // Total used count

        if(totalLimit === null || totalLimit === 0){
            return false;
        }
 
        if(totalLimit == true){
            totalLimit = totalAiCount;
        }

        let availableCount = totalAiCount - totalUsedCount;

        if(availableCount > 0) {
            return userUsedCount < totalLimit;
        }else{
            return false;
        }
    }

    return {
        debounce,
        setTitle,
        makeUniqueId,
        checkPermission,
        checkApps,
        showCounts,
        changeText,
        checkLink,
        compareObjects,
        compareSprints,
        addZero,
        checkBucketStorage,
        debouncerWithPromise,
        checkGenerateResponseLimit,
        checkResponse,
        getWasabiImageLink
    }
}

export function useMoment() {
    const dateFormat = inject("$dateFormat");

    function getMoment(date, format = null) {
        if(format) {
            return moment(date, format);
        } else {
            return moment(date);
        }
    }
    function changeDateFormate(date, formate) {
        if(!date) return null;
        if(formate) {
            return moment(date).format(formate);
        } else {
            return moment(date).format(dateFormat.value);
        }
    }

    function getMonthDateRange(year, month) {
        var startDate = moment([year, month]);
        var endDate = moment(startDate).endOf('month');
        return { start: new Date(startDate), end: new Date(endDate) };
    }

    return {
        changeDateFormate,
        getMonthDateRange,
        getMoment
    }
}

export function useFirebase() {

    function generatePath(path) {
        const queryRef = ref(db);
        const splitPath = ref(path.split('/'));
        const isCollection = ref(splitPath.value.length%2 !== 0);

        if(isCollection.value) {
            for (let index = 0; index < splitPath.value.length; index++) {
                const element = splitPath.value[index];
                if(index >= splitPath.value.length - 1) {
                    queryRef.value = collection(queryRef.value, element)
                } else {
                    queryRef.value = doc(queryRef.value, element, splitPath.value[index+1]);
                    index++;
                }
            }
        } else {
            for (let index = 0; index < splitPath.value.length; index++) {
                const element = splitPath.value[index];
                queryRef.value = doc(queryRef.value, element, splitPath.value[index+1]);
                index++;
            }
        }

        return {
            pathRef: queryRef.value,
            isCollection: isCollection.value
        };
    }

    function generateQuery({path, whereConditions = [], queryOrderBy = null, queryStartAt = null, queryEndAt = null, queryEndBefore = null, queryStartAfter = null, queryLimit = 0}) {
        const params = ref([])

        const { isCollection, pathRef } = generatePath(path);

        params.value.push(pathRef);

        if(isCollection) {
            if(queryOrderBy) {
                params.value.push(orderBy(queryOrderBy.field, queryOrderBy.order === "asc" ? "asc" : "desc"));
            }
            if(queryStartAt) {
                params.value.push(startAt(queryStartAt));
            }
            if(queryEndAt) {
                params.value.push(endAt(queryEndAt));
            }
            if(queryEndBefore) {
                params.value.push(endBefore(queryEndBefore));
            }
            if(queryStartAfter) {
                params.value.push(startAfter(queryStartAfter));
            }
            if(queryLimit !== 0) {
                params.value.push(limit(queryLimit));
            }
            if(whereConditions.length) {
                whereConditions.forEach((obj) => {
                    params.value.push(where(obj.field, obj.condition, obj.value));
                })
            }
        }

        return query.apply(null, [...params.value]);
    }

    return {
        generateQuery,
        generatePath
    }
}


export function useGetterFunctions() {
    const { getters, dispatch } = useStore();
    const defaultUserAvatar = inject("$defaultUserAvatar");

    /**
     * Get Task Status
     * @param { Number } key key for task status
     * @returns task status object
     */
    function getTaskStatus(key) {

        const obj = ref({});

        const project = ref(getters["projectData/currentProjectDetails"]);

        if(!project.value || !project.value.taskStatusData) return obj.value;

        const taskStatus = ref([...project.value.taskStatusData]);

        const index = taskStatus.value.findIndex((x) => x.key === key);

        if(index !== -1) {
            obj.value = taskStatus.value[index];
        }

        return obj.value
    }

    /**
     * Get Task Type
     * @param { Number } key key for task type
     * @returns task type object
     */
    function getTaskType(key, projectData = null) {
        const obj = ref({});

        const project = ref(projectData ? projectData : getters["projectData/currentProjectDetails"]);

        if(!project.value || !project.value.taskTypeCounts) return obj.value;

        const taskTypes = ref([...project.value.taskTypeCounts]);
        const index = taskTypes.value.findIndex((x) => x.key === key);
        if(index !== -1) {
            obj.value = taskTypes.value[index];
        }

        return obj.value
    }

    /**
     * Get User Details
     * @param { String } id id for user
     * @returns user object
     */
    function getUser(id,type = null) {
        const obj = ref({
            id: id,
            _id: id,
            Employee_Name: "Ghost User",
            Employee_profileImage: defaultUserAvatar,
            Employee_profileImageURL: defaultUserAvatar,
            isOnline: false,
            timeFormat:"",
            companyOwnerId: "",
            Time_Zone:"",
            assigneeCompany : [],
            WebTokens:[],
            Employee_Email : "",
            ghostUser: true,
            customerId: "",
        });

        const users = ref(getters["users/users"]);
        const companyUsers = ref(getters["settings/companyUsers"]);


        const index = users.value.findIndex((x) => x._id === id);
        const companyIndex = companyUsers.value.findIndex((x) => x.userId === id);

    
        if(index !== -1) {
            if(type == null){
                obj.value = {
                    id: id,
                    _id:id,
                    Employee_Name: users.value[index].Employee_Name,
                    Employee_profileImage: users.value[index].Employee_profileImage ? users.value[index].Employee_profileImage : defaultUserAvatar,
                    Employee_profileImageURL: users.value[index].Employee_profileImageURL ? users.value[index].Employee_profileImageURL : defaultUserAvatar,
                    isOnline: users.value[index].isOnline,
                    timeFormat:users.value[index].Time_Format,
                    companyOwnerId: getters["settings/companyOwnerDetail"]?.userId,
                    timeZone:users.value[index].Time_Zone ? users.value[index].Time_Zone : 'Asia/Kolkata',
                    assigneeCompany:users.value[index].AssignCompany  ? users.value[index].AssignCompany : [],
                    WebTokens:users.value[index].webTokens ? users.value[index].webTokens : [],
                    Employee_Email : users.value[index].Employee_Email,
                    ghostUser: false,
                    customerId: users.value[index].customerId ? users.value[index].customerId : "",
                    tourStatus: users.value[index]?.tour ? users.value[index]?.tour : {}
                };
            } else {
                obj.value = {
                    ...users.value[index],
                    id: id,
                    companyOwnerId: getters["settings/companyOwnerDetail"]?.userId,
                    _id:id,
                    Employee_profileImage: users.value[index].Employee_profileImage ? users.value[index].Employee_profileImage : defaultUserAvatar,
                    Employee_profileImageURL: users.value[index].Employee_profileImageURL ? users.value[index].Employee_profileImageURL : defaultUserAvatar,
                    ghostUser: false,
                    tourStatus: users.value[index]?.tour ? users.value[index]?.tour : {}
                };
            }
        }
        if(companyIndex !== -1 && companyUsers.value[companyIndex]?.designation) {
            obj.value.designation = companyUsers.value[companyIndex]?.designation
        }

        return obj.value
    }
    // tourStatus: users.value[index]?.tour ? users.value[index]?.tour : {}

    function getTeam(id) {
        const teams = ref(getters["settings/teams"]);
        const index = teams.value.findIndex((x) => x._id === id);
        if(index !== -1) {
            return {
                ...teams.value[index]
            }
        }
    }
    function getPriorities() {
        const pList = ref(getters["settings/companyPriority"]);
        return pList.value.map((x) => {
            x.label = x.name
            return {...x};
        })
    }

    function getPriority(val = "") {
        if(!val.length) return;

        let obj = {
            image: inject('$defaultTaskStatusImg'),
            name: "N/A",
            value: ''
        }

        const priorities = computed(() => getters["settings/companyPriority"])

        if(priorities.value.length) {
            const priorityIndex = priorities.value.findIndex((x) => x.value === val)

            if(priorityIndex !== -1) {
                obj.image = priorities.value[priorityIndex].statusImage
                obj.name = priorities.value[priorityIndex].name
                obj.value = priorities.value[priorityIndex].value
            }
        }

        return obj
    }

    function getTeamsData() {
        return new Promise((resolve) =>{
            try {
                if(getters["settings/teams"] && getters["settings/teams"].length === 0){
                    dispatch("settings/setTeams").then((response) => {
                        resolve(response);
                    })
                }else{
                    resolve(getters["settings/teams"]);
                }
            } catch (error) {
                console.error(error,"settings");
            }
        })
    }

    return {
        getTaskType,
        getUser,
        getTeam,
        getTaskStatus,
        getPriority,
        getPriorities,
        getTeamsData
    }
}

export function useConvertDate() {
    function convertDateFormat(dueDate, format = '', options = {showDayName: true, minuteDifference: false}) {
        const { getters } = useStore();

        try {
            if (format === '') {
                format = getters['settings/companyDateFormat'].dateFormat;
            }
            let date = dueDate && dueDate.seconds ? moment(dueDate.seconds * 1000) : moment(dueDate);
            if(options.showDayName) {
                return date.calendar(null, {
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    nextWeek: 'dddd',
                    lastDay: '[Yesterday]',
                    lastWeek: format,
                    sameElse: format,
                });
            } else if(options.minuteDifference) {
                return date.calendar(null, {
                    sameDay: 'HH:mm:A',
                    nextDay: '[Tomorrow]',
                    nextWeek: 'dddd',
                    lastDay: '[Yesterday]',
                    lastWeek: "DD/MM/YYYY",
                    sameElse: "DD/MM/YYYY",
                });
            } else {
                return date.format(format);
            }
        } catch (error) {
            console.error('ERROR in due date convert function', error);
        }
    }

    return {
        convertDateFormat
    }
}

export function useHistoryNotification() {

    function addHistory(obj) {
        apiRequest("post", env.HANDLE_HISTORY, obj)
        .catch((error) => {
            console.error("ERROR in addHistory: ", error);
        })
    }
    function addNotification(obj) {
        apiRequest("post", env.HANDLE_NOTIFICATION, obj)
        .catch((error) => {
            console.error("ERROR in notification: ", error);
        })
    }

    return {
        addHistory,
        addNotification
    }
}
export function draggble() {
    function generateOrder (prev, next) {
        try{
            var p, n, pos, str;
            for (pos = 0; p == n; pos++) {               // find leftmost non-matching character
                p = pos < prev.length ? prev.charCodeAt(pos) : 96;
                n = pos < next.length ? next.charCodeAt(pos) : 123;
            }
            str = prev.slice(0, pos - 1);                // copy identical part of string
            if (p == 96) {                               // prev string equals beginning of next
                while (n == 97) {                        // next character is 'a'
                    n = pos < next.length ? next.charCodeAt(pos++) : 123;  // get char from next
                    str += 'a';                          // insert an 'a' to match the 'a'
                }
                if (n == 98) {                           // next character is 'b'
                    str += 'a';                          // insert an 'a' to match the 'b'
                    n = 123;                             // set to end of alphabet
                }
            }
            else if (p + 1 == n) {                       // found consecutive characters
                str += String.fromCharCode(p);           // insert character from prev
                n = 123;                                 // set to end of alphabet
                while ((p = pos < prev.length ? prev.charCodeAt(pos++) : 96) == 122) {  // p='z'
                    str += 'z';                          // insert 'z' to match 'z'
                }
            }
            return str + String.fromCharCode(Math.ceil((p + n) / 2)); // append middle character
        } catch (error) {
            console.error(error);
        }
    }
    return{
        generateOrder
    }
}