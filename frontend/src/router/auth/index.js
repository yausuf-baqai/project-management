export default [
    {
        path: '/login',
        name: 'Log-in',
        component: () => import(/* webpackChunkName: "login" */ '@/views/Authentication/Login/Login.vue'),
		meta: {
            title: "Login",
            requiresAuth: false,
        },
    },
    {
        path: '/forgot-password',
        name: 'Forgot_Password',
        component: () => import(/* webpackChunkName: "Forgot_Password" */ '@/views/Authentication/ForgotPassword/ForgotPassword.vue'),
        meta: {
            title: 'Forgot Password',
            requiresAuth: false
        }
    },
    {
        path: '/reset-password/:id/:token/:realmToken/:realmTokenId',
        name: 'Reset_Password',
        component: () => import(/* webpackChunkName: "Reset_Password" */ '@/views/Authentication/ResetPassword/ResetPassword.vue'),
        meta: {
            title: 'Reset Password',
            requiresAuth: false
        }
    },
    {
        path: '/signup',
        name: 'Sign_Up',
        component: () => import(/* webpackChunkName: "Register" */ '../../views/Authentication/Register/Register.vue'),
        meta: {
            title: 'Register',
            requiresAuth: false
        }
    },
    {
        path: '/verify-email/:id/:token',
        name: 'Verify_Email',
        component: () => import(/* webpackChunkName: "Verify_Email" */ '../../views/Authentication/VerifyEmail/VerifyEmail.vue'),
        meta: {
            title: 'Verify Email',
            requiresAuth: false
        }
    },
    {
        path: '/business',
        name: 'Create_Company',
        component: () => import(/* webpackChunkName: "Create_Company" */ '../../views/Company/CreateCompany.vue'),
        meta: {
            title: 'Company Information',
            requiresAuth: true,
            hideHeader: true,
            preventAdvanceSearch: true
        }
    },
    {
        path: '/verify-invitation',
        name: 'Verify_Invitation',
        component: () => import(/* webpackChunkName: "Verify_Email" */ '@/views/Authentication/VerifyInvitation/VerifyInvitation.vue'),
        meta: {
            title: 'Verify Invitation',
            hideHeader: true
        }
    },
]