import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all namespaces
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import landingEN from './locales/en/landing.json';
import dashboardEN from './locales/en/dashboard.json';
import poolsEN from './locales/en/pools.json';
import transactionsEN from './locales/en/transactions.json';
import categoriesEN from './locales/en/categories.json';
import settingsEN from './locales/en/settings.json';
import validationEN from './locales/en/validation.json';
import banksEN from './locales/en/banks.json';

const resources = {
    en: {
        common: commonEN,
        auth: authEN,
        landing: landingEN,
        dashboard: dashboardEN,
        pools: poolsEN,
        transactions: transactionsEN,
        categories: categoriesEN,
        settings: settingsEN,
        validation: validationEN,
        banks: banksEN,
    },
    // Future: hi (Hindi), te (Telugu), etc.
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: Object.keys(resources.en),
        interpolation: {
            escapeValue: false, // React already escapes
        },
        react: {
            useSuspense: true,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
