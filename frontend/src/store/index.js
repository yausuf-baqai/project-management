import { createStore } from 'vuex'

import projectData from './ProjectData'
import settings from './Settings'
import users from './Users'
import mainChat from './MainChats'
import brandSettingTab from './brandSettings'
export default createStore({
    modules: {
        projectData,
        settings,
        users,
        mainChat,
        brandSettingTab
    }
})
