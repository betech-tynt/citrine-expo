/**
 * SessionManager - Module-level utilities to track if session expiry has been handled.
 * Prevents multiple session expired alerts during logout/navigation.
 * Note: Flag is in-memory, resets on app restart.
 */

let isSessionExpiredHandled = false;

/**
 * Check if session expiry alert can be shown (not handled yet).
 * @returns {boolean} true if can handle (show alert), false if already handled.
 */
export const canHandleSessionExpired = () => {
    return !isSessionExpiredHandled;
};

/**
 * Mark session expiry as handled (prevents future alerts in this app session).
 */
export const markSessionExpiredHandled = () => {
    isSessionExpiredHandled = true;
};

/**
 * Reset the handled flag (for testing or manual reset).
 */
export const resetSessionExpired = () => {
    isSessionExpiredHandled = false;
};
