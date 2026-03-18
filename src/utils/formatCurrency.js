import i18n from '../config/i18n';

/**
 * Format JPY price amount according to language-specific format
 * The numeric value remains in JPY - only display format changes
 * @param {number} amount - Amount in JPY (e.g., 8000)
 * @param {string} language - Language code (vi, en, jp). If not provided, will use i18n current language
 * @returns {string} - Formatted price string
 *
 * @example
 * formatCurrency(8000) // "8.000 yên" (if language is vi)
 * formatCurrency(8000, 'en') // "8,000 yen"
 * formatCurrency(33000, 'jp') // "33,000円"
 */
export const formatCurrency = (amount, language = null) => {
    // Handle null/undefined/empty values
    if (amount == null || amount === '' || isNaN(amount)) {
        return '-';
    }

    // Get current language if not provided
    const currentLanguage = language || i18n.language || 'vi';

    // Convert number to string
    const amountString = Math.round(amount).toString();

    // Format number according to language
    switch (currentLanguage) {
        case 'vi': {
            // Vietnamese format: 8.000 yên
            const formattedVi = amountString.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                '.',
            );
            return `${formattedVi} yên`;
        }

        case 'en': {
            // English format: 8,000 yen
            const formattedEn = amountString.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ',',
            );
            return `${formattedEn} yen`;
        }

        case 'jp': {
            // Japanese format: 33,000円
            const formattedJp = amountString.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ',',
            );
            return `${formattedJp}円`;
        }

        default: {
            // Default to Vietnamese format
            const formattedDefault = amountString.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                '.',
            );
            return `${formattedDefault} yên`;
        }
    }
};
