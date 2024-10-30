export default [
    {
        path: '/:cid/timesheet/user',
        name: 'User Timesheet',
        meta: {
            title: "Time Sheet",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "UserTimesheet" */ '@/views/Timesheet/UserTimeSheet/UserTimesheet.vue'),
    },
    {
        path: '/:cid/timesheet/workload',
        name: 'Workload Timesheet',
        meta: {
            title: "Workload Sheet",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "UserTimesheet" */ '@/views/Timesheet/WorkloadTimesheet/WorkloadTimesheet.vue'),
    },
    {
        path: '/:cid/timesheet/project',
        name: 'project Timesheet',
        meta: {
            title: "Project Time Sheet",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "ProjectTimesheet" */ '@/views/Timesheet/ProjectTimesheet/ProjectTimesheet.vue'),
    },
    {
        path: '/:cid/timesheet/tracker',
        name: 'Tracker Timesheet',
        meta: {
            title: "Tracker TimeSheet",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "ProjectTimesheet" */ '@/views/Timesheet/TrackerTimeSheet/TrackerTimesheet.vue'),
    },
    
]