import * as mutations from "./mutations";
import * as actions from "./actions";

export default {
    namespaced: true,

    state: {
        chats: {snap: null, data: []},
        mainChatProjects: {snap: null, data: []},
        mainChatSprints: {snap: null, data: {}},
        mainChatFolders: {snap: null, data: {}},
    },

    getters: {
        chats: state => state.chats,
        mainChatProjects: (state) => {
            return JSON.parse(JSON.stringify(state.mainChatProjects));
        },
        mainChatSprints: (state) => {
            return JSON.parse(JSON.stringify(state.mainChatSprints));
        },
        mainChatFolders: (state) => {
            return JSON.parse(JSON.stringify(state.mainChatFolders));
        }
    },

    mutations: mutations,
    actions: actions
}