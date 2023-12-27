<template>
    <section class="chart-detail-tab-overview">
        <div class="description">
            {{ description }}
        </div>
        <div class="tags">
            <div
                v-for="tag in tags"
                class="item"
                @click="router.push({ path: '/search', query: { type: 'charts', query: tag }})"
            >
                #{{ tag }}
            </div>
        </div>
        <div class="details">
            <div class="item">
                <span class="mdi mdi-eye"></span>
                <div class="value">{{ views }}</div>
                <div class="label">{{ t('chart.detail.overview.views.label') }}</div>
            </div>
            <div class="item">
                <span class="mdi mdi-download"></span>
                <div class="value">{{ downloads }}</div>
                <div class="label">{{ t('chart.detail.overview.downloads.label') }}</div>
            </div>
            <div class="item">
                <span class="mdi mdi-police-badge"></span>
                <div class="value">{{ isExplicit ? t('chart.detail.overview.explicit.explicitContent') : t('chart.detail.overview.explicit.noExplicitContent') }}</div>
                <div class="label">{{ t('chart.detail.overview.explicit.label') }}</div>
            </div>
            <div class="item">
                <span class="mdi mdi-calendar-clock-outline"></span>
                <div class="value">{{ relativeUploadDate }}</div>
                <div class="label">{{ t('chart.detail.overview.uploaded.label') }}</div>
            </div>
            <div class="item">
                <span class="mdi mdi-update"></span>
                <div class="value">{{ relativeUpdateDate }}</div>
                <div class="label">{{ t('chart.detail.overview.lastUpdate.label') }}</div>
            </div>
        </div>
        <div
            v-if="uploaderUser"
            class="uploader"
        >
            <UserItem v-bind="uploaderUser" />
        </div>
    </section>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import moment from 'moment';
import {getUser} from "@/api/api";
import UserItem from "@/layout_desktop/components/Common/UserItem.vue";
import router from "@/router";

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    description: {
        type: String,
        default: '',
    },
    tags: {
        type: Array,
        default: () => [],
    },
    views: {
        type: Number,
        default: 0,
    },
    downloads: {
        type: Number,
        default: 0,
    },
    isExplicit: {
        type: Boolean,
        default: false,
    },
    uploadDate: {
        type: Object,
        default: () => {},
    },
    updateDate: {
        type: Object,
        default: () => {},
    },
    uploader: {
        type: Number,
        default: 0,
    },
});

const uploaderUser = ref(null);

const relativeUploadDate = computed(() => moment(props.uploadDate.date).startOf("minute").fromNow());
const relativeUpdateDate = computed(() => props.updateDate ? moment(props.updateDate?.date).startOf("minute").fromNow() : "Never");

onMounted(async () => {
    uploaderUser.value = await getUser(props.uploader);
});
</script>

<style lang="scss" scoped>
.chart-detail-tab-overview {
    padding: 40px;
    display: flex;
    gap: 40px;
    flex-direction: column;
    
    & .description {
        line-height: 1.5rem;
        white-space: pre-line;
        color: rgba(var(--colorBaseText),0.6);
        -webkit-user-select: text;
        -moz-user-select: text;
        user-select: text;
        cursor: text;
    }
    & .tags {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        
        & .item {
            display: block;
            padding: 5px 10px;
            background: rgba(var(--colorBaseText), 0.14);
            color: rgb(var(--colorBaseText));
            border-radius: 4px;
            font-size: 0.9rem;
            transition: 0.15s ease-in-out all;
            
            &:hover {
                background: rgba(var(--colorBaseText), 0.21);
                cursor: pointer;
            }
        }
    }
    & .uploader {
        margin: 0 auto;
        width: 100%;
        max-width: 500px;
    }
    & .details {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
        
        & .item {
            padding: 15px;
            border: 1px solid rgba(var(--colorBaseText),0.14);
            border-radius: 6px;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 2px 15px;
            align-items: center;
            
            & .mdi {
                grid-row: 1 / span 2;
                font-size: 24px;
            }
            
            & .label {
                color: rgba(var(--colorBaseText),0.4);
            }
        }
    }
}

@media screen and (max-width: 1000px) {
    .chart-detail-tab-overview {
        & .details {
            grid-template-columns: 1fr 1fr;
        }
    }
}

@media screen and (max-width: 600px) {
    .chart-detail-tab-overview {
        & .details {
            grid-template-columns: 1fr;
        }
    }
}
</style>
