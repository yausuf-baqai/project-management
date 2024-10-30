<template>
	<AuthTemplate v-if="isShowResend === false">
		<div class="ah-rightside" :class="[{'disableInputField':submitted}]">
			<div class="sinup-login-title-wrapper">
                <h3>Login to your Account</h3>
                <p>See what is going on with your business</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="email">Email ID<span class="invalid-feedback red">*</span></label>
                <InputText
                    id="email"
                    class="login-input"
                    placeHolder="mail@abc.com"
                    v-model="formData.email.value"
                    height="56px"
                    width="100%"
                    @keyup="checkErrors({'field':formData.email,
                    'name':formData.email.name,
                    'validations':formData.email.rules,
                    'type':formData.email.type,
                    'event':$event.event})"
                    @input="formData.email.value = formData.email.value.toLowerCase()"
                    maxlength="254"
                    ref="useremail"
                    type="text"
                    @enter="handleSubmit"
                 />
                <div class="invalid-feedback red">{{formData.email.error}}</div>
            </div>

            <div class="form-group">
                <label for="password">Password<span class="invalid-feedback red">*</span></label>
                <InputText
                    id="password"
                    class="login-input pwd_login pwd__input"
                    placeHolder="*****"
                    v-model="formData.password.value"
                    height="56px"
                    width="100%"
                    @keyup="checkErrors({'field':formData.password,
                    'name':formData.password.name,
                    'validations':formData.password.rules,
                    'type':formData.password.type,
                    'event':$event.event})"
                    maxlength="150"
                    ref="useremail"
                    :type="inputType"
                    @enter="handleSubmit"
                 />
                <div class="invalid-feedback red">{{formData.password.error}}</div>
                <span @click="togglePasswordInput" class="cursor-pointer position-ab d-flex align-items-center eye">
                    <img v-if="inputType === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                    <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                </span>
            </div>

            <div class="form-group d-flex checkbox-label login-checkbox">
                <div class="login-check-box-wrpper">
                    <input type="checkbox" class="styled-checkbox position-ab opacity-none" id="chk-remember-me" v-model="rememberMe" :disabled="isSpinner">
                    <label for="chk-remember-me" class="chk-label d-flex align-items-center">
                    <span class="gray"> Remember Me</span>
                    </label>
                </div>
                <router-link :style="[{'pointer-events' : isSpinner ? 'none' : ''}]" to="/forgot-password">Forgot Password?</router-link>
            </div>

            <div class="form-group">
                <button v-if="!isSpinner" type="submit" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" tabindex="3">Login</button>
                <button v-else type="button" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" tabindex="3" disabled>
                    Loading
                    <div class="load">
                        <div class="progress"></div>
                        <div class="progress"></div>
                        <div class="progress"></div>
                    </div>
                </button>
            </div>
            </form>
		</div>
	</AuthTemplate>
    <Template v-if="isShowResend === true">
        <div class="ah-rightside">
            <div>
                <h3 class="title-login dark-gray">Resend Email</h3>
                <p class="GunPowder">Please check your email, If you didn't receive it or misplaced it, please click below to resend the email.</p>
            </div>
            <form action="#" @submit.prevent="handleSubmitResend">
                <div class="form-group">
                    <button  v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white font-weight-500 cursor-pointer" type="submit">Resend Email</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled opacity-7 white bg-blue font-weight-500 font-roboto-sans" disabled><span id="btn-spinner"></span>Loading...</button>
                </div>
            </form>
            <div class="create-accountlink text-center">
                <span class="font-roboto-sans font-weight-normal font-weight-400 gray cursor-pointer" @click="backToLogin">Back to Login? <span class="light-purple font-weight-500">Login</span></span>
            </div>
        </div>
    </Template>
</template>

<script setup>
// PACKAGES
import {  defineComponent, inject } from "vue";
import { App, Credentials , MongoDBRealmError } from "realm-web";

// COMPONENTS
import AuthTemplate from "@/components/templates/Authentication/index.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { useRouter , useRoute} from 'vue-router'
import { useValidation } from "@/composable/Validation.js";
import { ref , onMounted} from 'vue';
import {useToast} from 'vue-toast-notification';
import Template from "@/components/templates/Authentication/index.vue";
import { apiRequestWithoutCompnay, getAuth } from '../../../services';
const $toast = useToast();
const rememberMe = ref(false)   
const submitted = ref(false)
const isSpinner = ref(false)
const isShowResend = ref(false);
const userData = ref();
const router = useRouter()
const route = useRoute()
const  { checkErrors , checkAllFields } = useValidation();
import * as env from '@/config/env';
const axios = inject("$axios");


defineComponent({
	name: "Login-Page",

	components: {
		AuthTemplate
	}
});


    const formData = ref({
        email: {
            value: "",
            rules:
            "required | regex: \\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+",
            name: "Email",
            error: "",
        },
        password: {
            value: "",
            rules:
            "required",
            name: "Password",
            error: "",
        },
    })
    const inputType = ref("password")

    const togglePasswordInput = () => {
        inputType.value = (inputType.value === "password") ? "text" : "password";
    }
    onMounted(() => {
        // Check remember me functionality
        var rem_data = localStorage.getItem("remember");
        var rem_array = JSON.parse(rem_data);
        if (rem_array) {
            var rem_email = rem_array.email;
            var rem_password = decode(rem_array.password);
            formData.value.email.value = rem_email;
            formData.value.password.value = rem_password;
            rememberMe.value = true;
        }
    })
    const encode = (source) => {
        var str = source;
        var length = str.length;
        var encodedStr = str.charCodeAt(0);
        var position = 1;
        while(position<length) {
            var n = str.charCodeAt(position++);
            encodedStr = encodedStr + ", " + n;
        }
        return encodedStr;
    }

    // //Decode user password
    const decode = (source) => {
        var source_array = source.split(','); // Convert string (CSV) to array.
        var decodedStr = String.fromCharCode.apply(null, source_array);
        return decodedStr;
    }

    //Update user status
    const updateUserStatus = (uid) => {
        return new Promise((resolve, reject) => {
            apiRequestWithoutCompnay("post",env.USER_STATUS_UPATE,{userId:uid}).then(()=>{
                resolve(true)
            }).catch((err)=>{
                console.error(err);
                reject(false)
            })
        })
    }
    //Update user comapny check
    const userCompanyStatusCheck = (uid) => {
        return new Promise((resolve, reject) => {
            apiRequestWithoutCompnay("post",env.USER_AND_COMAPNY_CHECK,{userId:uid}).then((res)=>{
                resolve(res)
            }).catch((err)=>{
                console.error(err);
                reject(false)
            })
        })
    }
    //Hanlde login v4
    const handleSubmit = async () => {
        const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });

        try {
            const valid = await checkAllFields(formData.value);
            if (!valid) return;

            document.getElementById('password').blur();
            document.getElementById('email').blur();
            submitted.value = true;

            const { email, password } = formData.value;
            const encodedPassword = encode(password.value);

            if (rememberMe.value) {
                localStorage.setItem("remember", JSON.stringify({
                    email: email.value,
                    password: encodedPassword,
                }));
            } else {
                localStorage.removeItem("remember");
            }

            isSpinner.value = true;

            const credentials = Credentials.emailPassword(email.value, password.value);
            const user = await app.logIn(credentials);
            
            const userId = user.id;
            
            localStorage.setItem("userId", userId);

            const [userResponse] = await Promise.all([
                userCompanyStatusCheck(userId),
                getAuth(userId, true)
            ]); 

            userData.value = userResponse?.data?.data.userData;
            if(userResponse.data.status == false) {
                if (userResponse.data.statusText === "Email Not Verified") {
                    throw new Error('Email Not Verified')
                }
                throw new Error('MongoDB Error from Api')
            }
            const {userData: uData, companyId: cid, isCompanyFind} = userResponse.data.data;

            if (!uData.isEmailVerified) {
                throw new Error("Verify your email and try again");
            }

            localStorage.setItem('SubmenuScreen', 'project');

            if (uData.AssignCompany && uData.AssignCompany.length) {
                updateUserStatus(userId);
                if (cid && isCompanyFind === false) {
                    router.push({ name: "Create_Company" });
                    return;
                } else {
                    localStorage.setItem('selectedCompany', cid);
                }
            } else {
                updateUserStatus(userId);
                router.push({ name: "Create_Company" });
                return;
            }

            localStorage.setItem("isLogging", "true");

            if (route.query.redirect_url && route.query.redirect_url !== '/login') {
                await router.replace(route.query.redirect_url);
                window.location.reload();
            } else {
                localStorage.setItem("ENDDATE",new Date().getTime());
                window.location.reload();
            }
            submitted.value = false;

        } catch (error) {
            console.error(error);
            isSpinner.value = false;
            submitted.value = false;
            localStorage.removeItem("token");
            localStorage.removeItem("updateToken");
            app?.currentUser?.logOut();

            if (error.message === "Verify your email and try again") {
                $toast.error(error.message, { position: 'top-right' });
                isShowResend.value = true;
            } else if (error.error === 'invalid username/password' || error.error_code === 'InvalidPassword' || error instanceof MongoDBRealmError) {
                $toast.error("Invalid username or password.", { position: 'top-right' });
            } else if (error.message === "Email Not Verified") {
                $toast.error("Email Not Verified.", { position: 'top-right' });
            } else {
                $toast.error("Something went wrong.", { position: 'top-right' });
            }

            localStorage.removeItem("userId");
            localStorage.removeItem("isLogging");
            localStorage.removeItem("remember");
        }
    };

    const handleSubmitResend = () => {
        const axiosData = {
            "uid": userData.value._id,
            "email": userData.value.Employee_Email
        };
        isSpinner.value = true;
        axios.post(env.API_URI + env.SEND_VARIFICATION_EMAIL, axiosData).then((result) => {
            if(result.data.status === true) {
                $toast.success("Verification mail has been send successfully",{position: 'top-right'});
                isShowResend.value = false;
                isSpinner.value = false;
                // router.push({name:'Log-in'})
            } else {
                isSpinner.value = false;
                $toast.success(result.data.statusText,{position: 'top-right'});
            }
        }).catch((error) => {
            isSpinner.value = false;
            console.error(error,"Error");
        })
    }

    const backToLogin = () => {
        isShowResend.value = false;
    }
</script>
<style>
.load {
  display: flex;
  border-radius: 50%;
  flex-direction: row;
}

.progress {
  width: 0.6em;
  height: 0.6em;
  margin: 0.2em;
  scale: 0;
  border-radius: 50%;
  background: rgb(255, 255, 255);
  animation: loading_492 0.9s ease infinite;
  animation-delay: 0s;
}

@keyframes loading_492 {
  50% {
    scale: 1;
  }
}

.progress:nth-child(2) {
  animation-delay: 0.3s;
}

.progress:nth-child(3) {
  animation-delay: 0.6s;
}
</style>
<style src="./style.css">
</style>