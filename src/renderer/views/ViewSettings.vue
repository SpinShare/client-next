<template>
    <LayoutBase>
        <section class="page-settings">
            <SettingsSection label="General">
                <SettingsItem
                    label="SpinShare Client Next"
                    description="Version 3.20.0"
                >
                    <button class="button">
                        <Remixicon icon="refresh" />
                        <span>Check for updates</span>
                    </button>
                </SettingsItem>
                <SettingsItem label="Theme">
                    <select class="select">
                        <option
                            selected
                            value="dark"
                        >
                            Dark Mode
                        </option>
                        <option value="light">Light Mode</option>
                    </select>
                </SettingsItem>
                <SettingsItem
                    label="Language"
                    description="Translated by SpinShare"
                >
                    <select class="select">
                        <option
                            selected
                            value="en"
                        >
                            English
                        </option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="nl">Dutch</option>
                        <option value="speen">SPEEN</option>
                    </select>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection label="Interface">
                <SettingsItem
                    label="Show Explicit"
                    description="Automatically unblur explicit charts metadata"
                >
                    <Switch />
                </SettingsItem>
                <SettingsItem
                    label="Download Notifications"
                    description="Notify when a chart was downloaded or the queue finished"
                >
                    <Switch />
                </SettingsItem>
                <SettingsItem
                    label="Open Download Queue"
                    description="Automatically open the download queue whenever a new chart has been added to the queue"
                >
                    <Switch />
                </SettingsItem>
            </SettingsSection>

            <SettingsSection label="Account">
                <SettingsItem
                    label="Logout"
                    description="After logging out, you should also remove access to 'SpinShare Next' on spinsha.re"
                >
                    <button class="button">
                        <Remixicon icon="door-open" />
                        <span>Logout</span>
                    </button>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection label="Game">
                <SettingsItem
                    label="Game path"
                    description="Path to the game executable"
                >
                    <input
                        class="input"
                        type="text"
                        placeholder="Not set"
                    />
                    <button class="button">
                        <Remixicon icon="folder-open" />
                        <span>Select</span>
                    </button>
                    <button class="button">
                        <Remixicon icon="brain" />
                        <span>Detect</span>
                    </button>
                </SettingsItem>
                <SettingsItem
                    label="Customs path"
                    description="Path to your custom charts folder"
                >
                    <input
                        class="input"
                        type="text"
                        placeholder="Not set"
                    />
                    <button class="button">
                        <Remixicon icon="folder-open" />
                        <span>Select</span>
                    </button>
                    <button class="button">
                        <Remixicon icon="brain" />
                        <span>Detect</span>
                    </button>
                </SettingsItem>
            </SettingsSection>
        </section>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import SettingsSection from '@/components/Settings/SettingsSection.vue';
import SettingsItem from '@/components/Settings/SettingsItem.vue';
import Remixicon from '@/components/Remixicon.vue';
import Switch from '@/components/Switch.vue';
</script>

<style scoped>
.page-settings {
    @apply p-10 flex flex-col gap-10;

    & select {
        @apply grow;
    }
}
</style>
