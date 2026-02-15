/** Format a Date to 'YYYY-MM-DD' for API payloads */
export const formatDateISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Format 'YYYY-MM-DD' string to 'YYYY/M/D' for display */
export const formatDateDisplay = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

/** Format 'YYYY-MM-DD' (or ISO datetime) string to 'M/D' for grouping / short display */
export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/** Format a Date to 'HH:MM' */
export const formatTime = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

/** Format an ISO datetime string to 'M/D HH:MM' */
export const formatDatetime = (datetime: string): string => {
  const date = new Date(datetime);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Parse 'YYYY-MM-DD' string to Date, returns null if invalid */
export const parseDate = (str: string): Date | null => {
  const d = new Date(`${str}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};
