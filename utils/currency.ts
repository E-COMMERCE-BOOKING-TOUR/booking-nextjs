/**
 * Maps currency codes to appropriate locales for formatting.
 * Add more mappings as needed.
 */
export const getLocaleFromCurrency = (currencyCode?: string): string => {
    if (!currencyCode) return 'en-US';

    const code = currencyCode.toUpperCase();

    switch (code) {
        case 'VND':
            return 'vi-VN';
        case 'USD':
            return 'en-US';
        case 'EUR':
            return 'de-DE'; // German locale usually implies . as thousand separator, , as decimal
        case 'JPY':
            return 'ja-JP';
        case 'KRW':
            return 'ko-KR';
        case 'CNY':
            return 'zh-CN';
        case 'THB':
            return 'th-TH';
        case 'SGD':
            return 'en-SG';
        case 'AUD':
            return 'en-AU';
        case 'GBP':
            return 'en-GB';
        default:
            return 'en-US';
    }
};

/**
 * Formats a price with the given currency code's locale conventions.
 * Does NOT include the currency symbol, as that is handled separately.
 */
export const formatPriceValue = (price: number, currencyCode?: string): string => {
    const locale = getLocaleFromCurrency(currencyCode);
    return price.toLocaleString(locale);
};
