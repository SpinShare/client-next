<template>
    <LayoutBase>
        <section class="page-connect-login">
            <div class="box">
                <h1>{{ $t('connect.login.header') }}</h1>
                <p v-html="$t('connect.login.body', { link: '<a href=\'https://spinsha.re\' v-interactable>spinsha.re</a>'})" />
            </div>
            <div class="box">
                <h1>{{ $t('connect.code.header') }}</h1>
                <p v-html="$t('connect.code.body', { link: '<a href=\'https://spinsha.re/settings/connect\' v-interactable>' + $t('connect.code.link_label') + '</a>'})" />
            </div>
            <div class="box">
                <h1>{{ $t('connect.input.header') }}</h1>
                <p v-html="$t('connect.input.body')" />

                <div
                    class="inputs"
                    v-if="!isLoading"
                >
                    <input
                        v-interactable
                        class="input"
                        type="text"
                        min="6"
                        max="6"
                        :placeholder="$t('connect.input.placeholder')"
                        v-model="connectCode"
                    />
                    <button
                        class="button brand shrink-0"
                        @click="handleLogin"
                        :disabled="connectCode.length !== 6"
                        v-interactable
                    >
                        <span>{{ $t('connect.input.login') }}</span>
                    </button>
                </div>
                <section
                    class="section-center py-4"
                    v-else
                >
                    <Loader
                        :size="24"
                        :border-width="4"
                    />
                </section>
                <div
                    class="error"
                    v-if="errorCodeWrong"
                >
                    {{ $t('connect.input.errorIncorrect') }}
                </div>
                <div
                    class="error"
                    v-if="errorServer"
                >
                    {{ $t('connect.input.errorServer') }}
                </div>
            </div>
        </section>
    </LayoutBase>
</template>
<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import Loader from '@/components/Loader.vue';

const router = useRouter();
const connectCode = ref('');
const connect = inject('connect');
const isLoading = ref(false);
const errorCodeWrong = ref(false);
const errorServer = ref(false);

async function handleLogin() {
    errorCodeWrong.value = false;
    errorServer.value = false;
    isLoading.value = true;

    const result = await connect.login(connectCode.value);
    isLoading.value = false;

    if (result) {
        router.push(`/`);
    } else if (result === null) {
        errorServer.value = true;
    } else {
        errorCodeWrong.value = true;
    }
}
</script>

<style>
.page-connect-login {
    & a {
        @apply underline text-brand-500;
    }
    & a:hover {
        @apply no-underline;
    }
}
</style>

<style scoped>
.page-connect-login {
    @apply max-w-xl mx-auto flex flex-col gap-5 py-20;

    & .box {
        @apply border border-base-300 dark:border-base-800 rounded-md p-5 flex flex-col gap-2;

        & h1 {
            @apply font-bold;
        }
        & p {
            @apply leading-6 text-base-500 dark:text-base-300;
        }
        & .inputs {
            @apply mt-4 flex gap-2;
        }

        & .error {
            @apply text-sm text-red-400;
        }
    }
}
</style>
