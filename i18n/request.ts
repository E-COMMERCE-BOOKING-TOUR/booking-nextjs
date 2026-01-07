import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// Pre-import all locale files for standalone build compatibility
const commonMessages: Record<string, () => Promise<{ default: Record<string, any> }>> = {
    en: () => import('../public/locales/en/common.json'),
    vi: () => import('../public/locales/vi/common.json'),
};

const adminMessages: Record<string, () => Promise<{ default: Record<string, any> }>> = {
    en: () => import('../public/locales/en/admin.json'),
    vi: () => import('../public/locales/vi/admin.json'),
};

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    const common = (await commonMessages[locale]()).default;
    const admin = (await adminMessages[locale]()).default;

    return {
        locale,
        messages: {
            common,
            admin
        }
    };
});