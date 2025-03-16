<template>
    <LayoutBase>
        <h1>Hello World</h1>

        <p>{{ user }}</p>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { onMounted, ref } from 'vue';
import { SpinShareClient } from '@spinshare/api-js';

const user = ref(null);
const client = new SpinShareClient();

onMounted(async () => {
    user.value = await client.getUserDetail(4);
});
</script>

<style>
@reference "@/assets/css/app.css";
</style>
