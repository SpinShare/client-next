<template>
    <div>
    <SpinButton
        icon="filter-variant"
        label="Filter"
        :disabled="disabled"
        @click="toggleModal"
    />
    <transition name="queue">
        <div
            v-if="showModal"
            class="modal"
        >
            <div class="filters">
                <div class="group">
                    <div class="header">Included Difficulties</div>
                    <label class="filter">
                        <span>Easy</span>
                        <SpinSwitch v-model="diffEasy" />
                    </label>
                    <label class="filter">
                        <span>Normal</span>
                        <SpinSwitch v-model="diffNormal" />
                    </label>
                    <label class="filter">
                        <span>Hard</span>
                        <SpinSwitch v-model="diffHard" />
                    </label>
                    <label class="filter">
                        <span>Expert</span>
                        <SpinSwitch v-model="diffExpert" />
                    </label>
                    <label class="filter">
                        <span>XD</span>
                        <SpinSwitch v-model="diffXD" />
                    </label>
                </div>
                <div class="group">
                    <div class="header">Difficulty Rating</div>
                    <label class="filter">
                        <span>Lowest Rating</span>
                        <input type="number" v-model="diffRatingFrom" @change="roundDiffRatingFrom" />
                    </label>
                    <label class="filter">
                        <span>Highest Rating</span>
                        <input type="number" v-model="diffRatingTo" @change="roundDiffRatingTo" />
                    </label>
                </div>
                <div class="group">
                    <label class="filter">
                        <span>Show Explicit</span>
                        <SpinSwitch v-model="showExplicit" />
                    </label>
                </div>
                
                <div class="actions">
                    <SpinButton
                        label="Cancel"
                        @click="handleCancel"
                    />
                    <SpinButton
                        label="Apply"
                        color="primary"
                        @click="handleApply"
                    />
                </div>
            </div>
        </div>
    </transition>
    </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const props = defineProps({
    modelValue: Object,
    disabled: {
        type: Boolean,
        default: false,
    },
});

const showModal = ref(false);
const emit = defineEmits(['apply']);
const val = ref(props.modelValue);

const diffEasy = ref(val.value?.diffEasy ?? true);
const diffNormal = ref(val.value?.diffNormal ?? true);
const diffHard = ref(val.value?.diffHard ?? true);
const diffExpert = ref(val.value?.diffExpert ?? true);
const diffXD = ref(val.value?.diffXD ?? true);
const diffRatingFrom = ref(val.value?.diffRatingFrom ?? null);
const diffRatingTo = ref(val.value?.diffRatingTo ?? null);
const showExplicit = ref(val.value?.showExplicit ?? true);

const toggleModal = () => {
    if(props.disabled) return;
    showModal.value = !showModal.value;
};

const handleCancel = () => {
    showModal.value = false;
    
    diffEasy.value = val.value?.diffEasy ?? true;
    diffNormal.value = val.value?.diffNormal ?? true;
    diffHard.value = val.value?.diffHard ?? true;
    diffExpert.value = val.value?.diffExpert ?? true;
    diffXD.value = val.value?.diffXD ?? true;
    diffRatingFrom.value = val.value?.diffRatingFrom ?? null;
    diffRatingTo.value = val.value?.diffRatingTo ?? null;
    showExplicit.value = val.value?.showExplicit ?? true;
};
const handleApply = () => {
    showModal.value = false;
    let newValue = {
        diffEasy: diffEasy.value,
        diffNormal: diffNormal.value,
        diffHard: diffHard.value,
        diffExpert: diffExpert.value,
        diffXD: diffXD.value,
        diffRatingFrom: diffRatingFrom.value,
        diffRatingTo: diffRatingTo.value,
        showExplicit: showExplicit.value
    };
    emit('update:modelValue', newValue);
};

const roundDiffRatingFrom = () => {
    diffRatingFrom.value = Math.round(diffRatingFrom.value);
};

const roundDiffRatingTo = () => {
    diffRatingTo.value = Math.round(diffRatingTo.value);
};

watch(
    () => props.modelValue,
    (nVal) => (val.value = nVal),
    {
        immediate: true,
    },
);
</script>

<style lang="scss" scoped>
.modal {
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(5px);
    position: fixed;
    top: 0;
    left: 60px;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;

    & .filters {
        width: calc(100% - 50px);
        max-width: 400px;
        background: rgb(var(--colorBase2));
        color: rgb(var(--colorBaseText));
        display: flex;
        gap: 20px;
        flex-direction: column;
        padding: 20px;
        border-radius: 4px;
        
        & .group {
            border: 1px solid rgba(var(--colorBaseText), 0.07);
            padding: 20px;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            
            & .header {
                color: rgb(var(--colorPrimary));
                font-weight: bold;
                font-size: 0.75rem;
            }
            & .filter {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 10px;
                align-items: center;
                
                & input[type=number] {
                    max-width: 100px;
                    background: rgba(var(--colorBaseText), 0.07);
                    border: 0;
                    color: rgb(var(--colorBaseText));
                    font-family: 'Work Sans', sans-serif;
                    font-size: 1rem;
                    border-radius: 4px;
                    padding: 0 15px;
                    height: 40px;
                    transition: 0.15s ease-in-out all;

                    &:disabled {
                        opacity: 0.4;
                        cursor: not-allowed;
                    }
                    &:not(:disabled):hover {
                        background: rgba(var(--colorBaseText), 0.14);
                    }
                }
            }
        }
        & .actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
        }
    }
}
</style>
