import { computed, inject } from "vue";
import { useCustomComposable } from ".";
import Swal from "sweetalert2";
import { apiRequest } from "@/services";
import * as env from '@/config/env';
import { useRouter } from "vue-router";
import Store from '@/store/index'

const { checkGenerateResponseLimit, checkPermission } = useCustomComposable();

export function useAiApiFunction() {
    const userId = inject("$userId");
    const router = useRouter();
    const currentCompany = computed(() => Store.getters["settings/selectedCompany"]);

    // FOR GENERATE AI REQUEST
    async function generateAiRequestForFunction (apiObj,title = '',description = '',promptTitle = '',isFindPrompt = false,type,permission) {
        const aiRequestLimit = checkPermission("artificial_intelligence.per_user_generate_limit",permission, {gettersVal: Store.getters});
        return new Promise((resolve, reject) => {
            try {
                if(!currentCompany.value?.planFeature?.aiPermission){
                    resolve({status : false});
                    Swal.fire({
                        title: "Please Upgrade your plan to use AI",
                        text: `AI is only available for purchase on our paid plans.Upgrade and add AI now! `,
                        icon: 'info',
                        confirmButtonColor: '#28C76F',
                        confirmButtonText: 'Upgrade Now',
                        showCloseButton:true    
                    }).then((result) => {
                        if (result.isConfirmed) {
                            router.push({name: 'Upgrade', params: {cid: apiObj.companyId}})
                        }
                    })
                    return;
                }
                if(checkGenerateResponseLimit(aiRequestLimit,userId.value) == true){

                    findPromptPromise(isFindPrompt,promptTitle).then((res) => {
                        if(res.status){
                            if(isFindPrompt){
                                let response = res.result;
                                response.fields[0].value = title;
                                response.fields[1].value = description;
                                let obj = {
                                    fields: response.fields,
                                    id: response._id
                                }
                                apiObj.prompt = obj;
                            }
                            let endpoint = type === 'single' ? '/api/v1/generatePrompt' : '/api/v1/generatePromptChat';
                            apiRequest("post", endpoint, apiObj).then((result)=>{
                                try {
                                    if(result.data.status === true){
                                        if(result.data.isNotAi){
                                            resolve({status : false,statusText : 'AI is not integrated in your system.', isNotAi : true});
                                            return;
                                        }
                                        resolve({status : true,statusText : result});
                                    }else{
                                        reject({status : false,statusText : result});
                                    }
                                } catch (error) {
                                    reject({status : false,statusText : error});
                                }
                            }).catch((error) => {
                                reject({status : false,statusText : error});
                            })
                        }else{
                            reject({status : false,statusText : res.result});
                        }
                    }).catch((err) => {
                        reject({status : false,statusText : err});
                    })
                }else{
                    resolve({status : false,statusText : 'You have reached your limit', isReachedLimit : true});
                }
            } catch (error) {
                reject({status : false,statusText:error})
            }
        })
    }

    function findPromptPromise (isFindPrompt,promptTitle) {
        return new Promise((resolve,reject) => {
            try {
                if(isFindPrompt){
                    const datas = {
                        query: [{title : promptTitle}]
                    };
                    apiRequest("post",env.FINDONEPROMPTS,datas).then((result)=>{
                        if(result.data.status === true){
                            resolve({status : true, result : result.data.statusText})
                        }else{
                            reject({status : false, result:result.data.statusText })
                        }
                    }).catch((error) => {
                        reject({status : false,result:error});
                    })
                }else{
                    resolve({status : true});
                }
            } catch (error) {
                reject({status : false,result:error});
            }
        })
    }

    return {
        generateAiRequestForFunction,
    }
}
