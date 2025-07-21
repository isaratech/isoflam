/**
 * Utility function to detect if the user is on a mobile device
 * @returns true if the user is on a mobile device, false otherwise
 */
export const isMobileDevice = (): boolean => {
    // Check user agent for mobile indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
        'android',
        'webos',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
        'mobile',
        'tablet'
    ];

    const isMobileUserAgent = mobileKeywords.some(keyword =>
        userAgent.includes(keyword)
    );

    // Check for touch capability (additional indicator)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check screen size (mobile-like dimensions)
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

    // Combine checks: mobile user agent OR (touch device AND small screen)
    return isMobileUserAgent || (isTouchDevice && isSmallScreen);
};