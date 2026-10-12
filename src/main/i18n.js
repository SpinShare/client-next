import enMessages from '../renderer/locales/en.json';
import deMessages from '../renderer/locales/de.json';
import frMessages from '../renderer/locales/fr.json';
import esMessages from '../renderer/locales/es.json';
import nlMessages from '../renderer/locales/nl.json';
import ruMessages from '../renderer/locales/ru.json';
import zhMessages from '../renderer/locales/zh.json';
import speenMessages from '../renderer/locales/speen.json';

const messages = {
    en: enMessages,
    de: deMessages,
    fr: frMessages,
    es: esMessages,
    nl: nlMessages,
    ru: ruMessages,
    zh: zhMessages,
    speen: speenMessages,
};

function lookup(locale, key) {
    const value = key.split('.').reduce((node, part) => node?.[part], messages[locale]);
    return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * Translates a key for the main process using the renderer's locale files. Falls back to English, then to the key itself.
 * @param {SettingsManager} settingsManager
 * @param {string} key
 * @param {Object} params - Replaces {name} placeholders
 * @returns {string}
 */
export function translate(settingsManager, key, params = {}) {
    const message = lookup(settingsManager.get('language'), key) ?? lookup('en', key) ?? key;
    return message.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}
