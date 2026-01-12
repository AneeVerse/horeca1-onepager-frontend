/**
 * Get the current hour in India Standard Time (IST)
 * @returns {number} - Hour from 0 to 23
 */
export const getCurrentISTHour = () => {
    // Check for test hour override from env
    // This helps in testing promo logic (6pm-9am) at any time of day
    const testHour = process.env.NEXT_PUBLIC_TEST_HOUR;
    if (testHour !== undefined && testHour !== '') {
        return parseInt(testHour, 10);
    }

    // Get current time in Asia/Kolkata timezone
    // This ensures the site follows the Indian market schedule regardless of visitor's location
    const now = new Date();
    try {
        const istTimeString = now.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            hour12: false,
            hour: "numeric",
        });
        return parseInt(istTimeString, 10);
    } catch (error) {
        // Fallback to system time if timezone conversion fails
        console.error("IST Time conversion failed:", error);
        return now.getHours();
    }
};

/**
 * Check if the current time is within "Happy Hour" (6 PM to 9 AM IST)
 * @returns {boolean}
 */
export const checkIsPromoTime = () => {
    const hours = getCurrentISTHour();
    // 18 (6 PM) to 23 (11 PM) OR 0 (Midnight) to 8 (8:59 AM)
    return hours >= 18 || hours < 9;
};
