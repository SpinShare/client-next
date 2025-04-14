<template>
    <section class="page-chart-detail">
        <div class="meta">
            <div
                class="description"
                v-html="description"
            ></div>
            <div class="tags">
                <RouterLink
                    to="/search"
                    class="tag"
                    v-for="tag in chart.tags"
                    :key="tag"
                >
                    {{ tag }}
                </RouterLink>
            </div>
        </div>

        <div class="statistics">
            <div class="split">
                <div class="item">
                    <span class="label">Views</span>
                    <span class="number">{{ chart.views }}</span>
                </div>
                <div class="item">
                    <span class="label">Downloads</span>
                    <span class="number">{{ chart.downloads }}</span>
                </div>
            </div>
            <div class="item">
                <span class="label">Uploaded</span>
                <span class="time">{{ uploadDateRelative }}</span>
                <span class="time-absolute">{{ uploadDateAbsolute }}</span>
            </div>
            <div
                class="item"
                v-if="chart.updateDate"
            >
                <span class="label">Updated</span>
                <span class="time">{{ updateDateRelative }}</span>
                <span class="time-absolute">{{ updateDateAbsolute }}</span>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { TZDate } from '@date-fns/tz';
import { formatDistanceToNow } from 'date-fns';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const props = defineProps({
    chart: {
        type: Object,
        default: null,
    },
});

const description = computed(() => {
    const converter = new MarkdownIt({
        html: false,
        linkify: true,
        breaks: true,
    });
    let rendered = converter.render(props.chart.description + ' ![image](https://picsum.photos/200/300)');
    console.log(rendered);
    return DOMPurify.sanitize(rendered, {
        ALLOWED_TAGS: ['br', 'em', 'p', 'b', 'strong', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
        ALLOWED_ATTR: ['href'],
    });
});

const parseDateWithTimezone = ({ date, timezone }) => {
    const [year, month, day, hours, minutes, seconds] = date
        .replace(/\.\d+$/, '') // Remove milliseconds
        .split(/[- :]/)
        .map(Number);

    // Create TZDate using timezone
    return new TZDate(year, month - 1, day, hours, minutes, seconds, timezone); // Months are 0-indexed
};

const uploadDateRelative = computed(() => {
    let date = parseDateWithTimezone(props.chart.uploadDate);
    return formatDistanceToNow(date, { addSuffix: true });
});
const uploadDateAbsolute = computed(() => {
    let date = parseDateWithTimezone(props.chart.uploadDate);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
});
const updateDateRelative = computed(() => {
    let date = parseDateWithTimezone(props.chart.updateDate);
    return formatDistanceToNow(date, { addSuffix: true });
});
const updateDateAbsolute = computed(() => {
    let date = parseDateWithTimezone(props.chart.updateDate);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
});
</script>

<style>
@reference "@/assets/css/app.css";
.page-chart-detail .meta .description h1 {
    @apply text-3xl font-bold mt-5;
}
.page-chart-detail .meta .description h2 {
    @apply text-2xl font-bold mt-5;
}
.page-chart-detail .meta .description h3 {
    @apply text-xl font-bold mt-2.5;
}
.page-chart-detail .meta .description h4 {
    @apply text-lg font-bold mt-2.5;
}
.page-chart-detail .meta .description h5 {
    @apply font-bold mt-1;
}
.page-chart-detail .meta .description h6 {
    @apply font-bold text-xs;
}
.page-chart-detail .meta .description a {
    @apply underline text-brand-500;
}
.page-chart-detail .meta .description a:hover {
    @apply no-underline;
}
</style>

<style scoped>
@reference "@/assets/css/app.css";

.page-chart-detail {
    @apply p-10 grid grid-cols-[1fr_350px] gap-10;

    & .meta {
        & .description {
            @apply leading-6;
        }

        & .tags {
            @apply mt-5 flex gap-1 flex-wrap;

            & .tag {
                @apply rounded text-sm px-2 py-1 transition-all bg-brand-800 text-brand-50;

                &:hover {
                    @apply bg-brand-700;
                }
            }
        }
    }

    & .statistics {
        @apply flex flex-col gap-5;

        & .item {
            @apply flex flex-col gap-1 bg-base-900 rounded p-5;

            & .label {
                @apply text-base-400;
            }
            & .number {
                @apply text-3xl font-bold;
            }
            & .time-absolute {
                @apply text-xs text-base-400 mt-[-4px];
            }
        }
        & .split {
            @apply grid grid-cols-2 gap-2.5;
        }
    }
}
</style>
