<template>
    <LayoutBase>
        <section class="page-connect-login">
            <div class="box">
                <h1>Log into your account</h1>
                <p>Go to <a href="https://spinsha.re">spinsha.re</a> and log into your account.</p>
            </div>
            <div class="box">
                <h1>Find your connect code</h1>
                <p>Click <a href="https://spinsha.re/settings/connect">here</a> or click on your profile picture in the top right and go to <strong>Settings</strong>. Go to the <strong>Connect</strong> tab and find your connect code.</p>
            </div>
            <div class="box">
                <h1>Enter your connect code</h1>
                <p>Enter your connect code below and click on <strong>Log into your account</strong>.</p>

                <div
                    class="inputs"
                    v-if="!isLoading"
                >
                    <input
                        class="input"
                        type="text"
                        min="6"
                        max="6"
                        placeholder="Connect code..."
                        v-model="connectCode"
                    />
                    <button
                        class="button brand shrink-0"
                        @click="handleLogin"
                        :disabled="connectCode.length !== 6"
                    >
                        Log into your account
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
                    Your connect code was not correct. Please try again.
                </div>
                <div
                    class="error"
                    v-if="errorServer"
                >
                    Couldn't log you in. Please try again later.
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

<style scoped>
.page-connect-login {
    @apply max-w-xl mx-auto flex flex-col gap-5 py-20;

    & .box {
        @apply border border-base-800 rounded-md p-5 flex flex-col gap-2;

        & h1 {
            @apply font-bold;
        }
        & p {
            @apply leading-6 text-base-400;

            & a {
                @apply underline text-brand-500;
            }
            & a:hover {
                @apply no-underline;
            }
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
