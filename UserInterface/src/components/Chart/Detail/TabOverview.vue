<template>
    <section class="chart-detail-tab-overview">
        <div class="description">
            {{ description }}
        </div>
        <div class="tags">
            <div
                v-for="tag in tags"
                class="item"
            >
                #{{ tag }}
            </div>
        </div>
        <div class="details">
            <div class="item">
                <span class="mdi mdi-eye"></span>
                <div class="value">{{ views }}</div>
                <div class="label">Views</div>
            </div>
            <div class="item">
                <span class="mdi mdi-download"></span>
                <div class="value">{{ downloads }}</div>
                <div class="label">Downloads</div>
            </div>
            <div class="item">
                <span class="mdi mdi-police-badge"></span>
                <div class="value">{{ isExplicit ? 'Explicit content' : 'No explicit content' }}</div>
                <div class="label">Explicit</div>
            </div>
            <div class="item">
                <span class="mdi mdi-calendar-clock-outline"></span>
                <div class="value">{{ relativeUploadDate }}</div>
                <div class="label">Uploaded</div>
            </div>
            <div class="item">
                <span class="mdi mdi-update"></span>
                <div class="value">{{ relativeUpdateDate }}</div>
                <div class="label">Last update</div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import moment from 'moment';

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

const relativeUploadDate = computed(() => moment(props.uploadDate.date).startOf("minute").fromNow());
const relativeUpdateDate = computed(() => props.updateDate ? moment(props.updateDate?.date).startOf("minute").fromNow() : "Never");
</script>

<style lang="scss" scoped>
.chart-detail-tab-overview {
    padding: 40px;
    display: flex;
    gap: 40px;
    flex-direction: column;
    
    & .description {
        line-height: 1.5em;
        white-space: pre-line;
        color: rgba(255,255,255,0.6);
        -webkit-user-select: auto;
        -moz-user-select: auto;
        user-select: auto;
        cursor: text;
    }
    & .tags {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        
        & .item {
            display: block;
            padding: 5px 10px;
            background: rgba(255,255,255, 0.14);
            color: rgb(255, 255, 255);
            border-radius: 4px;
            font-size: 0.9em;
            transition: 0.15s ease-in-out all;
            
            &:hover {
                background: rgba(255,255,255, 0.21);
                cursor: pointer;
            }
        }
    }
    & .details {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
        
        & .item {
            padding: 15px;
            border: 1px solid rgba(255,255,255,0.14);
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
                color: rgba(255,255,255,0.4);
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
