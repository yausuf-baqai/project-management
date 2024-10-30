<template>
    <div>
        <h2 class="task_priority_wrapper_value">Currencies</h2>
        <template v-if="currencyArray && currencyArray.length">
            <div class="mySettingSection priorityWrapper">
                <button type="button" class="blue_btn" id="blue_btn" @click="isVisible = true" v-if="checkPermission('project.project_milestone') === true">Add/Remove Currencies</button>
                <template v-if="removedOption && removedOption.length">
                    <div class="addExtentionWrapper">
                        <span class="font_family_status currencies_wrapper_setting" v-for="(currency,index) in removedOption" :key="index">
                            {{currency.name}}
                        </span>
                    </div>
                </template>
            </div>
            <Sidebar
                v-model:visible="isVisible"
                title="Currencies"
                :enable-search="true"
                :options="option"
                :multiSelect="true"
                :showClear="false"
                :listenKeys="true"
                @selected="handleSelect"
                @removed="handleRemove"
                :value="removedOption"
                :isDefault="true"
            ></Sidebar>
        </template>
    </div>
</template>

<script setup>
    // import 
    import { useStore } from "vuex";
    import { BSON } from "realm-web";
    import { ref, computed } from "vue";
    import { useToast } from "vue-toast-notification";
    import { useCustomComposable } from '@/composable';
    import { dbCollections } from '@/utils/FirebaseCollections';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
    const { checkPermission } = useCustomComposable();
    // getter
    const $toast = useToast();
    const { getters } = useStore();
    // variable
    const isVisible = ref(false);
    // computed
    const allCurrencyArray = computed(() => JSON.parse(JSON.stringify((getters['settings/allCurrencyArray']))));
    const currencyArray = ref(allCurrencyArray.value);
    const option = computed(()=>{
        if(currencyArray.value && currencyArray.value.length){
            let filterCurency = JSON.parse(JSON.stringify(currencyArray.value));
            const currency = filterCurency.map((x)=> ({
                ...x,
                label: x.name,
                value:x.code
            }))
            return currency.sort((a, b) => {
                const labelComparison = (a.label?.trim()?.toLowerCase() > b.label?.trim()?.toLowerCase()) ? 1 : -1;
                
                if (a.isDelete && !b.isDelete) {
                    return -1;
                } else if (!a.isDelete && b.isDelete) {
                    return 1;
                } else {
                    return labelComparison;
                }
            });
        }else{
            return [];
        }
    });
    const removedOption = computed (() => {
        if(currencyArray.value && currencyArray.value.length){
            let filterCurency = JSON.parse(JSON.stringify(currencyArray.value));
            const currency = filterCurency.filter((xt)=> xt.isDelete === true).map((x)=> ({
                ...x,
                label: x.name,
                value:x.code
            }));
            return currency.sort((a, b) => {
                const labelComparison = (a.label?.trim()?.toLowerCase() > b.label?.trim()?.toLowerCase()) ? 1 : -1;
                
                if (a.isDelete && !b.isDelete) {
                    return -1;
                } else if (!a.isDelete && b.isDelete) {
                    return 1;
                } else {
                    return labelComparison;
                }
            });
        }else{
            return [];
        }
    });
    

    // function
    const handleSelect = (item) => {
        updateFunction(item,true);
    };
    const handleRemove = (item) => {
        updateFunction(item,false);
    };
    const updateFunction = (item,action) =>{
        let queryObj = [
            { _id: BSON.ObjectId(item._id) },
            {$set: { isDelete:action }}
        ];
        const queryUpdate = {
            type: "updateOne",
            collection: dbCollections.CURRENCY_LIST,
            data: queryObj
        };
        /* 
            - collection called 'currency_list'.
            - we are matching items based on their 'id' and updating or deleting the 'isDelete' field.
        */
        mongoQuery.mongodbCrudOperations(queryUpdate).then(()=>{
            if(action === true){
                currencyArray.value = currencyArray.value.map((x)=> x._id === item._id ? {...x, isDelete: action } : x);
                $toast.success("Currency added successfully",{position: 'top-right'});
            }else{
                currencyArray.value = currencyArray.value.map((x)=> x._id === item._id ? {...x, isDelete: action } : x);
                $toast.success("Currency removed successfully",{position: 'top-right'});
            }
        }).catch((error) => {
            $toast.error('Some thing went wrong', { position: 'top-right' });
            console.error("ERROR in currency", error);
        });
    };
</script>
<style scoped>
    .currencies_wrapper_setting {
        background: #ECEEF1;
        padding: 3.5px 10px !important;
        border-radius: 23px;
        margin: 0px 10px 10px 0px !important;
    }
</style>