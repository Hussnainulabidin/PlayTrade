/**
 * Utility functions for handling image loading and Cloudinary URLs
 */

/**
 * Creates a more reliable version of a Cloudinary URL by adding parameters 
 * to help prevent connection resets or loading issues
 * 
 * @param {string} url - The original Cloudinary image URL
 * @returns {string} - The optimized URL with additional parameters
 */
export const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    // Add timestamp parameter to bust cache
    const timestamp = new Date().getTime();
    const separator = url.includes('?') ? '&' : '?';

    // Add quality=auto and fetch_format=auto for better performance
    return `${url}${separator}t=${timestamp}&q=auto&f=auto`;
};

/**
 * Handles image loading error with multiple fallback strategies
 * 
 * @param {Event} event - The error event from the img tag
 * @param {string} originalSrc - The original image source URL
 * @param {string} fallbackSrc - The fallback image source URL
 */
export const handleImageError = (event, originalSrc, fallbackSrc = '/images/placeholder.png') => {
    console.log(`Image failed to load: ${originalSrc}`);

    // Prevent infinite error loops
    event.target.onerror = null;

    if (originalSrc && originalSrc.includes('cloudinary.com')) {
        // Try with a cache buster and optimized params
        const optimizedUrl = optimizeCloudinaryUrl(originalSrc);

        // Use a new Image to test the optimized URL before setting it
        const img = new Image();
        img.onload = () => { event.target.src = optimizedUrl; };
        img.onerror = () => { event.target.src = fallbackSrc; };
        img.src = optimizedUrl;
    } else {
        // Use fallback for non-Cloudinary images
        event.target.src = fallbackSrc;
    }
};

/**
 * Creates an optimized image source that can be used directly in img tags
 * 
 * @param {string} src - The original image source URL
 * @param {string} fallbackSrc - The fallback image source URL
 * @returns {Object} - An object with src and onError properties for the img tag
 */
export const createOptimizedImageProps = (src, fallbackSrc = '/images/placeholder.png') => {
    return {
        src: src || fallbackSrc,
        onError: (e) => handleImageError(e, src, fallbackSrc)
    };
}; 