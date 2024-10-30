import { createRouter, createWebHashHistory } from 'vue-router'
import auth from './auth'
import projects from './projects'
import chat from './chat'
import settings from './settings'
import timesheet from './timesheet'
import milestonesheet from './milestonesheet'
// 
// import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useCustomComposable } from '@/composable'
import { App } from "realm-web";
const routes = [
	...auth,

	// PROJECT ROUTES
	...projects,

	// PROJECT ROUTES
	...chat,

	// SETTINGS ROUTES
	...settings,
	
	// TIMESHEET ROUTES
	...timesheet,

	//MILESTONE ROUTES
	...milestonesheet,

	// 
	{
		path: "/",
		name: "Home",
		component: () => import(/* webpackChunkName: "home" */ '@/views/Home'),
		meta: {
			title: 'Home',
			requiresAuth: true,
		}
	}, {
		path: "/:catchAll(.*)",
		name: "404",
		component: () => import(/* webpackChunkName: "404" */ '@/views/NotFound'),
		meta: {
			title: '404'
		}
	},
	// 
]

const router = createRouter({
	history: createWebHashHistory(process.env.BASE_URL),
	routes
})

// const authInst = getAuth();
const jsonData = require('../../../brandSettings.json');
const {setTitle} = useCustomComposable()
router.beforeEach((to, _, next) => {
	const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
	let user = app.currentUser;
	// onAuthStateChanged(authInst, (user) => {
		// CHECK META FOR AUTH REQUIRED
		// const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
		const requiresAuth = to.meta.requiresAuth;

		// SET PAGE TITLE
		setTitle({title: to.meta.title, prefix: jsonData?.productName ? `${jsonData.productName} | ` : ''});

		if(user === null && requiresAuth === true) {
			// IF USER IS NOT LOGGED IN AND REQUESTS AUTH REQUIRED PAGE
			next({name: 'Log-in', query: {redirect_url: to.fullPath}});
			return;
		} else if(user !== null && requiresAuth === false) {
			// IF USER IS LOGGED IN AND REQUESTS NO AUTH REQUIRED PAGE
			if(to.meta.title === 'Support'){
				next();
			}else{
				next({name: "Home"});
			}
			return;
		} else {
			next();
			return;
		}
	// })
})

export default router;
