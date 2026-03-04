import i18n from '../config/i18n';

/**
 * Format currency amount according to language-specific format
 * @param {number} amount - Amount to format
 * @param {string} language - Language code (vi, en, jp). If not provided, will use i18n current language
 * @returns {string} - Formatted currency string
 *
 * @example
 * formatCurrency(5500000) // "5.500.000đ" (if language is vi)
 * formatCurrency(5500000, 'en') // "5,500,000 VND"
 * formatCurrency(5500000, 'jp') // "5,500,000円"
 */
export const formatCurrency = (amount, language = null) => {
    // Get current language if not provided
    const currentLanguage = language || i18n.language || 'vi';

    // Convert number to string
    const amountString = amount.toString();

    // Format number according to language
    switch (currentLanguage) {
        case 'vi': {
            // Vietnamese format: 5.500.000đ
            const formattedVi = amountString.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                '.',
            );
            return `${formattedVi}đ`;
        }

        case 'en': {
            // English format: 5,500,000 VND
            const formattedEn = amountString.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ',',
            );
            return `${formattedEn} VND`;
        }

        case 'jp': {
            // Japanese format: 5,500,000円
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
            return `${formattedDefault}đ`;
        }
    }
};
