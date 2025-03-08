<template>
    <router-view v-slot="{ Component, route }">
        <component
            :is="Component"
            :key="route.path"
        />
    </router-view>
</template>

<script setup></script>
