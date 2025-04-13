export function cn(...classes) {
    return classes.filter(Boolean).join(" ")
}

/**
 * Formats a date string into "Month Day, Year" format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    
    let formattedDate = `${month} ${day}, ${year}`;
    
    // Add time if requested
    if (options.includeTime) {
        let hours = dateObj.getHours();
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        formattedDate += ` at ${hours}:${minutes} ${ampm}`;
    }
    
    return formattedDate;
}