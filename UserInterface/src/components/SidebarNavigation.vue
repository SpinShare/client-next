<template>
    <aside>
        <div class="brand">
            <img src="@/assets/icon.svg" />
        </div>
        
        <nav>
            <router-link to="/" class="item" v-tooltip.right="'Discover & Featured'">
                <span class="mdi mdi-view-dashboard-outline"></span>
            </router-link>
            <router-link to="/search" class="item" v-tooltip.right="'Search'">
                <span class="mdi mdi-magnify"></span>
            </router-link>
            <router-link to="/lists/new" class="item" v-tooltip.right="'New'">
                <span class="mdi mdi-new-box"></span>
            </router-link>
            <router-link to="/lists/updated" class="item" v-tooltip.right="'Updated'">
                <span class="mdi mdi-update"></span>
            </router-link>
            <router-link to="/lists/hot" class="item" v-tooltip.right="'Trending'">
                <span class="mdi mdi-fire"></span>
            </router-link>
        </nav>
        
        <nav>
            <router-link to="/library" class="item" v-tooltip.right="'Your Library'">
                <span class="mdi mdi-archive-music-outline"></span>
            </router-link>
            <div class="item" v-tooltip.right="'Downloads'">
                <span class="mdi mdi-download-box-outline"></span>
            </div>
            <router-link to="/settings" class="item" v-tooltip.right="'Settings'">
                <span class="mdi mdi-cog-outline"></span>
            </router-link>
        </nav>
    </aside>
</template>

<style lang="scss" scoped>
aside {
    border-right: 1px solid rgba(255,255,255,0.07);
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-gap: 15px;
	justify-content: center;
    align-items: center;
    padding: 25px 0;
    
    & .brand {
        width: 42px;
        display: flex;
        justify-content: center;
        align-items: center;
        
        & img {
            width: 24px;
            height: 24px;
        }
    }
    
    & nav {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        
        & .item {
            width: 42px;
            height: 42px;
            display: flex;
            border-radius: 100px;
            justify-content: center;
            align-items: center;
            transition: 0.15s ease-in-out all;
            
            & > span {
                font-size: 22px;
            }

            &.router-link-exact-active {
                background: rgba(var(--colorPrimary), 15%);
                color: rgba(var(--colorPrimary), 100%);
            }
            
            &:not(.router-link-exact-active):hover {
                background: rgba(255,255,255,0.07);
                cursor: pointer;
            }
        }
    }
}
</style>
<script setup>
</script>