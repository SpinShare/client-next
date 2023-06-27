<template>
    <section class="search-intro">
        <div class="content">
            <span class="mdi mdi-card-search"></span>
            <h1>Chart, Playlist & User Search</h1>
            <p>Select whether you want to find charts, playlists, or users, type in your query, and apply filters for precise results. Your rhythm journey begins here!</p>
        </div>
    </section>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.search-intro {
    display: flex;
    justify-content: center;
    align-items: center;

    & .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        & .mdi {
            font-size: 64px;
        }
        & h1 {
            font-size: 1.5rem;
        }
        & p {
            color: rgba(var(--colorBaseText),0.6);
            max-width: 400px;
            line-height: 1.5rem;
            text-align: center;
        }
    }
}
</style>
