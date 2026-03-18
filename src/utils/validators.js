import { useTranslation } from 'react-i18next'; // Note: used in hooks if needed, but functions are pure

/**
 * Validates email format: must be user@domain.extension (rejects abc@gmail, accepts user@gmail.com)
 * @param {string} email - Email to validate
 * @returns {boolean} true if valid
 */
export const validateEmail = email => {
    const trimmed = email.trim();
    const regex = /^[^@]+@[^@]+\.[^.]+$/;
    return regex.test(trimmed);
};

/**
 * Gets email validation error message using i18n
 * @param {string} email - Email to check
 * @param {function} t - i18next t function
 * @returns {string} Error message or empty string if valid
 */
export const getEmailError = (email, t) => {
    const trimmed = email.trim();
    if (!trimmed) {
        return t('validate.required', { field: t('setting.email') });
    }
    if (!validateEmail(email)) {
        return t('validate.invalidEmail');
    }
    return '';
};
