
/**
 * Formats seconds into a human-readable time string (e.g., "3 h 15 min 23 sek" or "53 min 24 sek")
 * @param seconds Total duration in seconds
 * @returns Formatted time string
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return "0 sek";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours} h ${minutes} min ${secs} sek`;
  } else {
    return `${minutes} min ${secs} sek`;
  }
};

/**
 * Formats hours, minutes, seconds component values into a human-readable time string
 * @param hours Hours component
 * @param minutes Minutes component
 * @param seconds Seconds component
 * @returns Formatted time string
 */
export const formatTime = (hours: number, minutes: number, seconds: number): string => {
  if (hours > 0) {
    return `${hours} h ${minutes} min ${seconds} sek`;
  } else {
    return `${minutes} min ${seconds} sek`;
  }
};

/**
 * Formats a time string like "3:37.14" into a human-readable format
 * @param timeString Time string in format "H:MM.SS" or "MM:SS"
 * @returns Formatted time string
 */
export const parseAndFormatTimeString = (timeString: string): string => {
  // Try to parse different time formats
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  
  if (!timeString) {
    return "0 min 0 sek";
  }
  
  // Format: "H:MM.SS" or "MM:SS"
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      // Format: "MM:SS"
      minutes = parseInt(parts[0], 10) || 0;
      const secondParts = parts[1].split('.');
      seconds = parseInt(secondParts[0], 10) || 0;
    } else if (parts.length === 3) {
      // Format: "H:MM:SS"
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      seconds = parseInt(parts[2], 10) || 0;
    }
  }
  
  return formatTime(hours, minutes, seconds);
};
