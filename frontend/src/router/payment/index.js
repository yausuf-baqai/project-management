export default [
    {
        path: '/:cid/billingHistory',
        name: 'Billing History',
        meta: {
            title: "Billing History",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "BillingHistory" */ '@/views/Payment/BillingHistory.vue'),
    },
]