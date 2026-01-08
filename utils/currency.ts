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

/**
 * Formats a price in compact notation for display in tight spaces.
 * Examples:
 * - VND: 1,500,000 -> "1.5tr", 500,000 -> "500K"
 * - USD: 1,500,000 -> "1.5M", 50,000 -> "50K"
 */
export const formatCompactPrice = (price: number, currencyCode?: string): string => {
    if (!price || price === 0) return '0';

    const code = currencyCode?.toUpperCase();
    const isVND = code === 'VND' || !code;

    // For VND, use Vietnamese-style abbreviations
    if (isVND) {
        if (price >= 1_000_000_000) {
            const value = price / 1_000_000_000;
            return `${value % 1 === 0 ? value : value.toFixed(1)}tỷ`;
        }
        if (price >= 1_000_000) {
            const value = price / 1_000_000;
            return `${value % 1 === 0 ? value : value.toFixed(1)}tr`;
        }
        if (price >= 1_000) {
            const value = price / 1_000;
            return `${value % 1 === 0 ? value : value.toFixed(1)}K`;
        }
        return price.toString();
    }

    // For other currencies, use standard abbreviations
    if (price >= 1_000_000_000) {
        const value = price / 1_000_000_000;
        return `${value % 1 === 0 ? value : value.toFixed(1)}B`;
    }
    if (price >= 1_000_000) {
        const value = price / 1_000_000;
        return `${value % 1 === 0 ? value : value.toFixed(1)}M`;
    }
    if (price >= 1_000) {
        const value = price / 1_000;
        return `${value % 1 === 0 ? value : value.toFixed(1)}K`;
    }

    return price.toLocaleString(getLocaleFromCurrency(currencyCode));
};
