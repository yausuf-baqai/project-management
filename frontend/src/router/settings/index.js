export default [
    {
        path: '/:cid/settings',
        redirect: { name: 'Setting' },
        name: "Settings",
        meta: {
            title: "Settings",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: Settings */ '@/components/templates/Settings/Settings.vue'),
        children: [
            {
                path: "setting",
                name: "Setting",
                meta: {
                    title: "Settings",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Settings */ '@/views/Settings/Setting/Setting.vue')
            },
            {
                path: "custom-field",
                name: "Custom-Fields",
                meta: {
                    title: "Custom Field Manager",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Custom-Fields */ '@/components/molecules/SettingCustomFieldComponent/SettingCustomFieldComponent.vue')
            },
            {
                path: "members",
                name: "Members",
                meta: {
                    title: "Members",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Members */ '@/views/Settings/Members/Members.vue')
            },
            {
                path: "teams",
                name: "Teams",
                meta: {
                    title: "Teams",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Teams */ '@/views/Settings/Teams/Teams.vue')
            },
            {
                path: "projects",
                name: "Settings-Projects",
                meta: {
                    title: "Projects",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Projects */ '@/views/Settings/Projects/Projects.vue')
            },
            {
                path: "template",
                name: "Template",
                meta: {
                    title: "Templates",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Template */ '@/views/Settings/Template/Template.vue')
            },
            // 
            {
                path: "security-permissions",
                name: "Security & Permissions",
                meta: {
                    title: "Security & Permissions",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Security & Permissions */ '@/views/Settings/SecurityPermissions/SecurityPermissions.vue')
            },
            {
                path: "my-settings",
                name: "My Settings",
                meta: {
                    title: "My Settings",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: My Settings */ '@/views/Settings/MySettings/MySettings.vue')
            },
            {
                path: "company",
                name: "Company",
                meta: {
                    title: "Company",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Company */ '@/views/Settings/Company/Company.vue')
            },
            {
                path: "notifications",
                name: "Notifications",
                meta: {
                    title: "Notifications",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Notifications */ '@/views/Settings/Notifications/Notifications.vue')
            },
            {
                path: "time-tracking",
                name: "Time Tracking",
                meta: {
                    title: "Time Tracking",
                    requiresAuth: true
                },
                component: () => import(/* webpackChunkName: Time Tracking */ '@/views/Settings/TimeTracking/TimeTracking.vue')
            },
        ]
    },
]