import i18n from '../config/i18n';

/**
 * Format date according to current language
 * @param {string|number|Date} date - Date value (ISO string, timestamp, or Date)
 * @param {string} [language] - Language code (vi, en, jp). If not provided, will use i18n current language
 * @returns {string} - Formatted date string
 *
 * @example
 * formatDate('2024-08-12') // "12/08/2024" (if language is vi)
 * formatDate('2024-08-12', 'en') // "2024-08-12"
 * formatDate('2024-08-12', 'jp') // "2024/08/12"
 */
export const formatDate = (date, language = null) => {
    if (!date) return '';

    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    const currentLanguage = language || i18n.language || 'vi';

    const day = parsedDate.getDate();
    const month = parsedDate.getMonth() + 1;
    const year = parsedDate.getFullYear();

    switch (currentLanguage) {
        case 'vi': {
            // Vietnamese format: dd/MM/yyyy
            const dd = `${day}`.padStart(2, '0');
            const mm = `${month}`.padStart(2, '0');
            return `${dd}/${mm}/${year}`;
        }
        case 'jp': {
            // Japanese format: yyyy年M月d日 (no leading zeros)
            return `${year}年${month}月${day}日`;
        }
        case 'en':
        default: {
            // English (US) format: MM/DD/YYYY
            const mm = `${month}`.padStart(2, '0');
            const dd = `${day}`.padStart(2, '0');
            return `${mm}/${dd}/${year}`;
        }
    }
};


