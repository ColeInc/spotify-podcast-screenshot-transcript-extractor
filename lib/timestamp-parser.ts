export interface ParsedTimestamp {
  milliseconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isValid: boolean;
  error?: string;
}

export function parseTimestamp(timestamp: string): ParsedTimestamp {
  const trimmed = timestamp.trim();

  // Match HH:MM:SS or MM:SS format
  const timeRegex = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
  const match = trimmed.match(timeRegex);

  if (!match) {
    return {
      milliseconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isValid: false,
      error: "Invalid format. Use HH:MM:SS or MM:SS",
    };
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (match[3]) {
    // HH:MM:SS format
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    seconds = parseInt(match[3], 10);
  } else {
    // MM:SS format
    minutes = parseInt(match[1], 10);
    seconds = parseInt(match[2], 10);
  }

  // Validate ranges
  if (hours > 99) {
    return {
      milliseconds: 0,
      hours,
      minutes,
      seconds,
      isValid: false,
      error: "Hours must be 99 or less",
    };
  }

  if (minutes > 59) {
    return {
      milliseconds: 0,
      hours,
      minutes,
      seconds,
      isValid: false,
      error: "Minutes must be 59 or less",
    };
  }

  if (seconds > 59) {
    return {
      milliseconds: 0,
      hours,
      minutes,
      seconds,
      isValid: false,
      error: "Seconds must be 59 or less",
    };
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const milliseconds = totalSeconds * 1000;

  return {
    milliseconds,
    hours,
    minutes,
    seconds,
    isValid: true,
  };
}

export function formatTimestamp(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
