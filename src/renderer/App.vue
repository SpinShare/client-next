<template>
    <router-view v-slot="{ Component, route }">
        <component
            :is="Component"
        />
    </router-view>
</template>

<script setup></script>
