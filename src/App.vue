<template>
    <router-view v-slot="{ Component, route }">
        <transition
            :name="transitionName"
            mode="out-in"
        >
            <component
                :is="Component"
                :key="route.path"
            />
        </transition>
    </router-view>
</template>

<script setup>
</script>