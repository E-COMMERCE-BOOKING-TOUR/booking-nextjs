import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// Pre-import all locale files for standalone build compatibility
const localeMessages: Record<string, () => Promise<{ default: Record<string, string> }>> = {
    en: () => import('../public/locales/en/common.json'),
    vi: () => import('../public/locales/vi/common.json'),
};

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    const commonMessages = (await localeMessages[locale]()).default;

    return {
        locale,
        messages: {
            common: commonMessages
        }
    };
});