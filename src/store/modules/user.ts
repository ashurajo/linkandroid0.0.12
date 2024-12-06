import {defineStore} from "pinia"
import store from "../index";
import {userInfoApi} from "../../api/user";
import {toRaw} from "vue";
import {AppConfig} from "../../config";
import {useSettingStore} from "./setting";

const setting = useSettingStore()

export const userStore = defineStore("user", {
    state() {
        return {
            isInit: false,
            lastSavedJson: '',
            apiToken: null as string | null,
            user: {
                id: null as string | null,
                name: null as string | null,
                avatar: null as string | null,
            },
            data: {
                basic: {},
            },
        }
    },
    actions: {
        async init() {
            await this.load()
        },
        async load() {
            const {apiToken, user, data} = await window.$mapi.user.get()
            this.apiToken = apiToken
            this.user = Object.assign(this.user, user)
            this.data = data
            await setting.initBasic(this.data.basic)
            this.isInit = true
        },
        onChangeBroadcast() {
            this.load().then()
        },
        async waitInit() {
            if (this.isInit) {
                return
            }
            await new Promise((resolve) => {
                const timer = setInterval(() => {
                    if (this.isInit) {
                        clearInterval(timer)
                        resolve(undefined)
                    }
                }, 100)
            })
        },
        async webUrl() {
            await this.waitInit()
            return `${AppConfig.apiBaseUrl}/app_manager/user_web?api_token=${this.apiToken}`
        }
    }
})

export const user = userStore(store)

user.init().then()

window.__page.onBroadcast('UserChange', user.onChangeBroadcast)

export const useUserStore = () => {
    return user
}
