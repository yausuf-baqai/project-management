<template>
       <div class="trending__comp-wrapper pb-28px">
        <div class="trending__comptitle-wrapper d-flex align-items-center">
            <h2 class="font-size-22 font-weight-500 black font-roboto-sans m-0 d-flex align-items-center position-re quelist__title">Trending <span class="font-size-13 font-weight-400 GunPowder trending__count">(2)</span></h2>
        </div>
        <div class="trending__comp-task">
            <div class="trending__comp-taskdetail-wrapper d-flex pt-10px pb-10px pl-2px">
                <div class="trending__comp-taskdetail d-flex align-items-center border-radius-3-px mr-7px">
                    <span class="font-size-14 font-weight-400 GunPowder cursor-pointer"><img :src="greyCheck" class="mr-7px" />Test Design</span>
                </div>
                <div class="trending__comp-taskdetail d-flex align-items-center border-radius-3-px p-10px pt-10px pb-10px">
                    <div class="font-size-14 font-weight-400 GunPowder cursor-pointer"><span class="status__color d-inline-block"></span>Design</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const greyCheck = require('@/assets/images/svg/grayCheckSvg.svg');
</script>
<style scoped src="../Home/style.css"></style>