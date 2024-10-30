<template>
<div class="lognote_main_row">
    <div class="logNot_detail_wrapper" v-for="(row, index) in versions" v-bind:key="index">
        <span>{{row.versionNumber}}</span>
        <ul>
            <li v-for="(dataList,index) in row.versionData" v-bind:key="index">
                {{dataList.data}}
            </li>
        </ul>
    </div>
</div>
</template>
<script>
import moment from 'moment';
import * as env from '@/config/env';
export default {
    data(){
        return{
            versions : [],
            varsion: `${env.APP_VERSION} (${moment().format('DD-MM-YYYY, LT')})`
        }
    },
    created(){
        var self = this;
        self.versions = [
            {
                'id': 78,
                'versionNumber': 'v4.2.1 (21-04-2023, 02:23 PM)',
                'versionData':
                [
                    {'data': 'AHE-501, AHE-551, AHE-552'},
                ]
            },
            {
                'id': 77,
                'versionNumber': 'v4.2.0 (19-04-2023, 02:23 PM)',
                'versionData':
                [
                    {'data': 'AHE-418, AHE-503, AHE-540, AHE-400, AHE-498, AHE-407(AHE-541)'},
                ]
            },
            {
                'id': 73,
                'versionNumber': 'v4.1.39 (11-04-2023, 05:45 PM)',
                'versionData':
                [
                    {'data': 'AHE-306, AHE-497, AHE-407, AHE-494'},
                ]
            },
            {
                'id': 72,
                'versionNumber': 'v4.1.38 (10-04-2023, 02:00 PM)',
                'versionData':
                [
                    {'data': 'AHE-400, AHE-425, AHE-3,AHE-295'},
                ]
            },
            {
                'id': 71,
                'versionNumber': 'v4.1.37 (06-04-2023, 03:00 PM)',
                'versionData':
                [
                    {'data': 'AHE-295, AHE-415, AHE-20, AHE-411, AHE-416, AHE-417, AHE-406, AHE-400'},
                ]
            },
            {
                'id': 70,
                'versionNumber': 'v4.1.36 (05-04-2023, 03:50 PM)',
                'versionData':
                [
                    {'data': 'AHE-419, AHE-422, AHE-421, AHE-39, AHE-414'},
                ]
            },
            {
                'id': 69,
                'versionNumber': 'v4.1.35 (05-04-2023, 09:25 PM)',
                'versionData':
                [
                    {'data': 'AHE-410, AHE-39, AHE-79, AHE-385'},
                ]
            },
            {
                'id': 68,
                'versionNumber': 'v4.1.34 (04-04-2023, 05:16 PM)',
                'versionData':
                [
                    {'data': 'AHE-295, AHE-370, AHE-381, AHE-371, AHE-372, AHE-378, AHE-410, AHE-39, AHE-79, AHE-400, AHE-403'},
                ]
            },
            {
                'id': 67,
                'versionNumber': 'v4.1.33 (03-04-2023, 08:55 AM)',
                'versionData':
                [
                    {'data': 'AHE-20, AHE-210, AHE-287, AHE-384(create project from template), AHE-288, AHE-383'},
                ]
            },
            {
                'id': 66,
                'versionNumber': 'v4.1.32 (30-03-2023, 10:55 AM)',
                'versionData':
                [
                    {'data': 'AHE-359, AHE-2, AHE-382, AHE-308, AHE- 304, AHE-245, AHE-141'},
                ]
            },
            {
                'id': 65,
                'versionNumber': 'v4.1.31 (29-03-2023, 10:44 AM)',
                'versionData':
                [
                    {'data': 'AHE-295, AHE-312, AHE-306, AHE-360, AHE-342(comments), AHE-175, AHE-290, AHE-215'},
                ]
            },
            {
                'id': 64,
                'versionNumber': 'v4.1.30 (27-03-2023, 10:10 AM)',
                'versionData':
                [
                    {'data': 'AHE-337, AHE-336, AHE-294, AHE-318, AHE-215(342), AHE-337, AHE-346, AHE-348, AHE-39, AHE-55, AHE-125, AHE-130, AHE-51, AHE-290, AHE-342'},
                ]
            },
            {
                'id': 63,
                'versionNumber': 'v4.1.29 (24-03-2023, 01:44 AM)',
                'versionData':
                [
                    {'data': 'AHE-318, AHE-215 (342), AHE-337, AHE-345, AHE-343, AHE-342'},
                ]
            },
            {
                'id': 62,
                'versionNumber': 'v4.1.28 (23-03-2023, 05:12 PM)',
                'versionData':
                [
                    {'data': 'AHE-209, AHE-339, AHE-340, AHE-341, AHE-39, AHE-333m, AHE-335m, AHE-336m, AHE-215'},
                ]
            },
            {
                'id': 61,
                'versionNumber': 'v4.1.27 (23-03-2023, 09:44 AM)',
                'versionData':
                [
                    {'data': 'AHE-312, AHE-175, AHE-215(AHE-333, AHE-335, AHE-336), AHE-39, AHE-209'},
                ]
            },
            {
                'id': 60,
                'versionNumber': 'v4.1.26 (22-03-2023, 10:30 AM)',
                'versionData':
                [
                    {'data': 'AHE-310, AHE-294, AHE-298, AHE-317, AHE-318, AHE-323, AHE 332, AHE-333, AHE-316, AHE-319, AHE-305, AHE-175(AHE-320, AHE-331, AHE-327, AHE-322), AHE- 303, AHE- 304, AHE- 309, AHE- 311, AHE-308, AHE-306, AHE-269, AHE-270, AHE-215, AHE-39, AHE-209'},
                ]
            },
            {
                'id': 59,
                'versionNumber': 'v4.1.25 (20-03-2023, 02:45 AM)',
                'versionData':
                [
                    {'data': 'AHE-294, AHE-298, AHE-297, AHE-66, AHE-71, AHE-215, AHE-305'},
                ]
            },
            {
                'id': 58,
                'versionNumber': 'v4.1.24 (16-03-2023, 11:01 AM)',
                'versionData':
                [
                    {'data': 'AHE-265, AHE-266, AHE-267, AHE-262, AHE-66, AHE-71, AHE-68, AHE-11, AHE-74, AHE-207, AHE-2, AHE-217, AHE-264, AHE-120, AHE-47'},
                ]
            },
            {
                'id': 57,
                'versionNumber': 'v4.1.23 (14-03-2023, 01:07 PM)',
                'versionData':
                [
                    {'data': 'AHE-243, AHE-220, AHE-216, AHE-47, AHE-127, AHE-217, AHE-197, AHE-101'},
                ]
            },
            {
                'id': 56,
                'versionNumber': 'v4.1.22 (13-03-2023, 09:41 AM)',
                'versionData':
                [
                    {'data': 'AHE-175, AHE-217, AHE-197, AHE-141, AHE-20'},
                ]
            },
            {
                'id': 55,
                'versionNumber': 'v4.1.21 (10-03-2023, 05:03 PM)',
                'versionData':
                [
                    {'data': 'AHE-104, AHE-199, AHE-20, AHE-197, AHE-127'},
                ]
            },
            {
                'id': 54,
                'versionNumber': 'v4.1.20 (09-03-2023, 05:59 PM)',
                'versionData':
                [
                    {'data': 'AHE-47. AHE-120, AHE-199, AHE-200, AHE-20, AHE-202, AHE-209, AHE-208, AHE-39, AHE-207'},
                ]
            },
            {
                'id': 53,
                'versionNumber': 'v4.1.19 (07-03-2023, 04:06 PM)',
                'versionData':
                [
                    {'data': 'AHE-206, AHE-204, AHE-203, AHE-202, AHE-39'},
                ]
            },
            {
                'id': 52,
                'versionNumber': 'v4.1.18 (07-03-2023, 01:20 PM)',
                'versionData':
                [
                    {'data': 'AHE-141'},
                ]
            },
            {
                'id': 51,
                'versionNumber': 'v4.1.17 (07-03-2023, 09:53 AM)',
                'versionData':
                [
                    {'data': 'AHE-160, AHE-74, AHE-167, AHE-178, AHE-185, AHE-183, AHE-109, AHE-96, AHE-71, AHE-75, AHE-76, AHE-66, AHE-2, AHE-39'},
                ]
            },
            {
                'id': 50,
                'versionNumber': 'v4.1.16 (06-03-2023, 09:53 AM)',
                'versionData':
                [
                    {'data': 'AHE-74, AHE-174, AHE-160, AHE-173, AHE-167, AHE-182'},
                ]
            },
            {
                'id': 49,
                'versionNumber': 'v4.1.15 (03-03-2023, 11:25 AM)',
                'versionData':
                [
                    {'data': 'AHE-104, AHE-174, AHE-19, AHE-172, AHE-171, AHE-169, AHE- 170'},
                ]
            },
            {
                'id': 48,
                'versionNumber': 'v4.1.14 (02-03-2023, 09:36 AM)',
                'versionData':
                [
                    {'data': 'AHE-160, AHE-148, AHE-167, AHE-74, AHE-168, AHE-171, AHE-169'},
                ]
            },
            {
                'id': 47,
                'versionNumber': 'v4.1.13 (01-03-2023, 10:38 AM)',
                'versionData':
                [
                    {'data': 'AHE-160, AHE-10, AHE - 156, AHE - 157, AHE - 158, AHE-65'},
                ]
            },
            {
                'id': 46,
                'versionNumber': 'v4.1.12 (28-02-2023, 02:56 PM)',
                'versionData':
                [
                    {'data': 'AHE-104, AHE-147, AHE-151, AHE-68, AHE-148, AHE-149, AHE-150'},
                ]
            },
            {
                'id': 45,
                'versionNumber': 'v4.1.11 (27-02-2023, 03:15 PM)',
                'versionData':
                [
                    {'data': 'AHE-103, AHE-47, AHE-10, AHE-144, AHE-65'},
                ]
            },
            {
                'id': 44,
                'versionNumber': 'v4.1.10 (24-02-2023, 09:46 AM)',
                'versionData':
                [
                    {'data': 'AHE-87, AHE-129, AHE-50'},
                ]
            },
            {
                'id': 43,
                'versionNumber': 'v4.1.9 (22-02-2023, 02:54 PM)',
                'versionData':
                [
                    {'data': 'AHE-123, AHE-128, AHE-90, AHE-104'},
                ]
            },
            {
                'id': 42,
                'versionNumber': 'v4.1.8 (21-02-2023, 09:36 AM)',
                'versionData':
                [
                    {'data': 'AHE-98, AHE-100, AHE-43'},
                ]
            },
            {
                'id': 41,
                'versionNumber': 'v4.1.7 (20-02-2023, 11:24 PM)',
                'versionData':
                [
                    {'data': '#455, #482, #257, AHE-49, AHE-47, #584, AHE-103'},
                ]
            },
            {
                'id': 40,
                'versionNumber': 'v4.1.6 (16-02-2023, 02:55 PM)',
                'versionData':
                [
                    {'data': 'Dashboard functionality update'},
                ]
            },
            {
                'id': 39,
                'versionNumber': 'v4.1.5 (15-02-2023, 10:08 AM)',
                'versionData':
                [
                    {'data': '#145, #320, #372'},
                ]
            },
            {
                'id': 38,
                'versionNumber': 'v4.1.4 (14-02-2023, 02:17 PM)',
                'versionData':
                [
                    {'data': '#455'},
                    {'data': 'Show closed projects in - settings > projects list.'},
                    {'data': 'Changes while opening task detail sidebar from view other then list view.'},
                    {'data': 'UI change in project list for public/private indication in - settings > projects list.'},
                    {'data': 'Search functionalilty fix in project list view.'}
                ]
            },
            {
                'id': 37,
                'versionNumber': 'v4.1.3 (13-02-2023, 04:43 PM)',
                'versionData':
                [
                    {'data': '#540, #316, #487, #531'},
                    {'data': 'AHE-45 - Made all timesheet total as per filtered. result.'},
                    {'data': 'AHE-47 - Add View button in Attachments and when user click on view button it redirect new tab and preview image or file'},
                    {'data': 'AHE-49 - Added changes to redirect between child task and parent task from task detail sidebar'},
                    {'data': 'GBS-14 - Solved activity listing issue --> https://prnt.sc/KPz3gYre4KzV'},
                    {'data': 'GBS-2 - Now here current time will be selected on the start time field.'},
                    {'data': 'Project list view due date popup issue resolved.'},
                ]
            },
            {
                'id': 36,
                'versionNumber': 'v4.1.2 (13-02-2023, 10:49 AM)',
                'versionData':
                [
                    {'data': '#489, #533, #228'}
                ]
            },
            {
                'id': 35,
                'versionNumber': 'v4.1.1 (09-02-2023, 06:22 AM)',
                'versionData':
                [
                    {'data': '#482, #488, #455'}
                ]
            },
            {
                'id': 34,
                'versionNumber': 'v4.1.0 (09-02-2023, 10:16 AM)',
                'versionData':
                [
                    {'data': '#495, #315, #437'}
                ]
            },
            {
                'id': 33,
                'versionNumber': 'v4.0.32 (07-02-2023, 05:30 PM)',
                'versionData':
                [
                    {'data': '#481, #455, #151, #437'}
                ]
            },
            {
                'id': 32,
                'versionNumber': 'v4.0.31 (07-02-2023, 10:03 AM)',
                'versionData':
                [
                    {'data': '#488, #494, #74, #314, #481, #492'}
                ]
            },
            {
                'id': 31,
                'versionNumber': 'v4.0.30 (02-02-2023, 10:57 AM)',
                'versionData':
                [
                    {'data': '#455, #481, #484'}
                ]
            },
            {
                'id': 30,
                'versionNumber': 'v4.0.29 (01-02-2023, 10:30 AM)',
                'versionData':
                [
                    {'data': '#66, #381, #316, #320, #372, #49, #436'}
                ]
            },
            {
                'id': 29,
                'versionNumber': 'v4.0.28 (31-01-2023, 10:16 AM)',
                'versionData':
                [
                    {'data': '#455, #437'}
                ]
            },
            {
                'id': 28,
                'versionNumber': 'v4.0.27 (30-01-2023, 05:41 PM)',
                'versionData':
                [
                    {'data': '#66, #445, #257'}
                ]
            },
            {
                'id': 27,
                'versionNumber': 'v4.0.26 (30-01-2023, 09:50 AM)',
                'versionData':
                [
                    {'data': '#425, #435, #457'}
                ]
            },
            {
                'id': 26,
                'versionNumber': 'v4.0.25 (27-01-2023, 02:10 PM)',
                'versionData':
                [
                    {'data': '#438, #434, #436, #435, #66, #426'}
                ]
            },
            {
                'id': 25,
                'versionNumber': 'v4.0.24 (25-01-2023, 03:50 PM)',
                'versionData':
                [
                    {'data': '#425, #427, #440, #441, #442 '}
                ]
            },
            {
                'id': 24,
                'versionNumber': 'v4.0.23 (24-01-2023, 02:50 PM)',
                'versionData':
                [
                    {'data': '#440, #441'}
                ]
            },
            {
                'id': 23,
                'versionNumber': 'v4.0.22 (24-01-2023, 01:40 PM)',
                'versionData':
                [
                    {'data': '#427, #425, #428, #442, #58'}
                ]
            },
            {
                'id': 22,
                'versionNumber': 'v4.0.21 (23-01-2023, 6:30 PM)',
                'versionData':
                [
                    {'data': '#66'}
                ]
            },
            {
                'id': 21,
                'versionNumber': 'v4.0.20 (23-01-2023, 10:20 AM)',
                'versionData':
                [
                    {'data': '#402, #219, #404'}
                ]
            },
            {
                'id': 20,
                'versionNumber': 'v4.0.19 (20-01-2023, 11:00 AM)',
                'versionData':
                [
                    {'data': '#47, #291, #320, #372, #145, #387, #69, #70, #399, #314, #66'}
                ]
            },
            {
                'id': 19,
                'versionNumber': 'v4.0.18 (19-01-2023, 12:30 PM)',
                'versionData':
                [
                    {'data': 'Design changes - #52, #383, #384'},
                    {'data': 'Project Settings - #58'}
                ]
            },
            {
                'id': 18,
                'versionNumber': 'v4.0.17 (19-01-2023, 09:30 AM)',
                'versionData':
                [
                    {'data': 'Project settings - #343, #302, #58, #345'},
                    {'data': 'Task watcher functionality - #258, #382'},
                ]
            },
            {
                'id': 17,
                'versionNumber': 'v4.0.16 (18-01-2023, 10:00 AM)',
                'versionData':
                [
                    {'data': 'Kanban view'},
                    {'data': 'Settings - Projects'},
                ]
            },
            {
                'id': 16,
                'versionNumber': 'v4.0.15 (17-01-2023, 12:30 PM)',
                'versionData':
                [
                    {'data': 'Milestone report - #207'},
                    {'data': 'Hourly Milestone - #145'},
                    {'data': 'Notifications Functioanlity - #49'},
                    {'data': 'Settings - Notification - #151'},
                ]
            },
            {
                'id': 15,
                'versionNumber': 'v4.0.14 (16-01-2023, 04:00 PM)',
                'versionData':
                [
                    {'data': 'Dashboard'},
                    {'data': 'Create new project'},
                ]
            },
            {
                'id': 14,
                'versionNumber': 'v4.0.13 (16-01-2023, 11:54 AM)',
                'versionData':
                [
                    {'data': 'Title changes on all the timesheets'},
                ]
            },
            {
                'id': 13,
                'versionNumber': 'v4.0.12 (13-01-2023, 04:20 PM)',
                'versionData':
                [
                    {'data': 'Here from error message remove " _ " https://prnt.sc/1R-VNJy3CRM1. when i enter project name "A( 3 space) " it allow me to do that. so here in this field it should be trim. also check template #340'},
                    {'data': 'Profile Pic is not updated and not display at project task list. "https://prnt.sc/VwQ1fzlVE_s5 #312'},
                    {'data': 'Calender View Development #156'},
                    {'data': 'Add icon on every subtask in calender view #354'},
                    {'data': 'Project task list sidebar is not proper design wise please compare it with figma design. https://prnt.sc/aWvBWuN1g5l1 #294'},
                    {'data': 'No Search Results #326'},
                    {'data': 'In validation message should be displayed "exists" instead of "exits" https://prnt.sc/NiI4TjrE-g9e https://prnt.sc/U8GHHCoM0H_- #341'},
                    {'data': 'What are the statuses of task you want to setup? #290'},
                    {'data': 'Should be displayed name when we hover on it. https://prnt.sc/7Jfze-mjKhxc #342'},
                    {'data': 'For create project if error is at step 1 and user is reach at last step and try to click on submit that time action is not perform #347'},
                    {'data': 'For Chat count if I will "Mark as Unread" then counter should be again increase. #314'},
                    {'data': 'Navbar - @ functioanality #105'},
                    {'data': 'Comment Mentions Functionality'},
                    {'data': 'Chat count is not proper check screen recorder. #313'},
                ]
            },
            {
                'id': 12,
                'versionNumber': 'v4.0.11 (12-01-2023, 04:40 PM)',
                'versionData':
                [
                    {'data': 'Navbar - Timesheet - Workload Timesheet #109'},
                    {'data': 'Navbar - Timesheet - User Timesheet #107'},
                    {'data': 'Design issue in Time sheet. https://prnt.sc/q-mRSKMJvXkh , https://prnt.sc/eFD__vIcJxjt #297'},
                ]
            },
            {
                'id': 11,
                'versionNumber' :'v4.0.10 (12-01-2023, 09:03 AM)',
                'versionData':
                [
                    {'data': 'Navbar - Timesheet - Project Timesheet #108'},
                    {'data': 'Log time not display in Workload, User time sheet, Project time sheet. https://www.awesomescreenshot.com/video/13838827?key=d25eed9b12eeaa615d331a5de2155d38#298'},
                    {'data': 'Check this issue when i click on close/open project 2 to 3 times then at close tab found the same project is created 2 times. "https://prnt.sc/CdSeKRXRBrPS%22#300'},
                    {'data': 'Created project not display in project time sheet. https://prnt.sc/LpXy1x-2pOGJ #299'},
                    {'data': 'Calender View Development #156'},
                    {'data': 'Create project steps at color selection steps found this issues. "https://prnt.sc/sEjNvH013x1S #292'},
                    {'data': 'Development- Table View #204'},
                    {'data': 'Issue found on table view check the description. #303'},
                    {'data': 'Project Tab Views Components #228'},
                    {'data': 'Check this design issue. how can user select and save changes. https://prnt.sc/3Zf9QphdUFFt #304'},
                    {'data': 'Not display properly as per image. https://prnt.sc/960y4e62NiHj #316'},
                    {'data': 'Project icon should be displayed as per figma design https://prnt.sc/i6zmX_KVCUlN #324'},
                    {'data': 'From this icon we can create a checklist but right now its not working https://prnt.sc/f4np71HrwXe2 #328'},
                    {'data': 'Calendar not displayed proper in create task https://prnt.sc/K7lSr5423MVs #327'},
                    {'data': 'Should be displayed "Tasks" https://prnt.sc/3KDy2S8MgbCE #325'},
                    {'data': 'Project task list sidebar is not proper design wise please compare it with figma design. https://prnt.sc/aWvBWuN1g5l1#294'},
                    {'data': 'When create project that time filled this details https://prnt.sc/YCLaCUYVhRON, https://prnt.sc/z1UG1NKbz3b8 but when review at last tab that time data is not proper " https://prnt.sc/hhGm9vJMwpZT, " #288'},
                    {'data': 'At project create steps. "Add statuses for the project" when change color at that time found issue as below. #289'},
                    {'data': 'What are the statuses of task you want to setup? #290'},
                    {'data': 'Dashboard Development #66'},
                ]
            },
            {
                'id': 10,
                'versionNumber' :'v4.0.9 (10-01-2023, 09:32 AM)',
                'versionData':
                [
                    {'data': 'Task "Watcher" notification functionality #258'},
                    {'data': 'Dashboard Development #66'}
                ]
            },
            {
                'id': 9,
                'versionNumber' :'v4.0.8 (09-01-2023, 09:23 AM)',
                'versionData':
                [
                    {'data': 'Calender View Development #156'},
                    {'data': 'Settings - Company profile #55'}
                ]
            },
            {
                'id': 8,
                'versionNumber' :'v4.0.7 (06-01-2023, 09:44 AM)',
                'versionData':
                [
                    {'data': 'Calender View Development #156'},
                    {'data': 'Settings - Teams #57'},
                    {'data': 'Settings - Company profile #55'}
                ]
            },
            {
                'id': 7,
                'versionNumber' :'v4.0.6 (05-01-2023, 12:02 PM)',
                'versionData':
                [
                    {'data': 'Calender View Development #156'},
                    {'data': 'Settings - Projects #58'},
                    {'data': 'Settings - Teams #57'}
                ]
            },
            {
                'id': 6,
                'versionNumber' :'v4.0.5 (04-01-2023, 03:32 PM)',
                'versionData':
                [
                    {'data': 'Settings - Company profile #55'},
                    {'data': 'Calender View Development #156'}
                ]
            },
            {
                'id': 5,
                'versionNumber' :'v4.0.4 (04-01-2023, 10:32 AM)',
                'versionData':
                [
                    {'data': 'Close a Project Functionality is not working #110'},
                    {'data': 'Settings - Teams #57'},
                    {'data': 'Settings - My Workspaces #64'},
                ]
            },
            {
                'id': 4,
                'versionNumber' :'v4.0.3 (02-01-2023, 09:15 AM)',
                'versionData':
                [
                    {'data': 'Settings - Profile Page #63'},
                    {'data': 'Settings - Company profile #55'},
                    {'data': 'Fixed default company settings import issue'},
                    {'data': 'Settings - Notification #151'},
                    {'data': 'Settings - My Workspaces #64'},
                    {'data': 'Settings - Roles and Permission Management #54'},
                    {'data': 'Folder and sprint name should be editable #113'},
                    {'data': 'Estimated time functionality #48'},
                    {'data': 'Calender View Development #156'}
                ]
            },
            {
                'id': 3,
                'versionNumber' :'v4.0.2 (29-12-2022, 02:36 PM)',
                'versionData':
                [
                    {'data': 'Settings - Profile Page #63'},
                    {'data': 'Settings - Company profile #55'},
                    {'data': 'Fixed default company settings import issue'}
                ]
            },
            {
                'id': 2,
                'versionNumber' :'v4.0.1 (27-12-2022, 11:07 AM)',
                'versionData':
                [
                    {'data': 'Settings - Profile Page #63'},
                    {'data': 'Fixed default company settings import issue'}
                ]
            },
            {
                'id': 1,
                'versionNumber' :'v4.0.0 (26-12-2022, 10:47 AM)',
                'versionData':
                [
                    {'data': 'Settings - Notification #151'},
                    {'data': 'Settings - Teams #57'},
                    {'data': 'Settings - My Workspaces #64'},
                    {'data': 'Settings - Company profile #55'},
                    {'data': 'Settings - Profile Page #63'},
                    {'data': 'Settings - People #56'},
                    {'data': 'Settings - Roles and Permission Management #54'},
                    {'data': 'Create Project with new wizard screen #47'},
                    {'data': 'Folder and sprint name should be editable #113'},
                    {'data': 'Estimated time functionality #48'},
                    {'data': 'Calender View Development #156'},
                ]
            }
        ]
    }
}
</script>
<style>
.lognote_main_row {
    padding: 50px 100px;
    font-family: "-apple-system","BlinkMacSystemFont","Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
}
.lognote_main_row span {
    font-size: 22px;
    margin-bottom: 12px;
    display: inline-block;
    font-weight: 600;
}
.lognote_main_row li {
    font-size: 15px;
    padding-bottom: 5px;
    font-weight: 500;
}
.logNot_detail_wrapper {
    margin-bottom: 20px;
}
</style>