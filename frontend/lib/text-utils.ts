// Utility functions for handling multilingual text objects

export type MultilingualText = {
  ar: string;
  en?: string;
} | string;

/**
 * Extracts Arabic text from multilingual object or returns string as-is
 * @param text - Either a string or an object with ar/en keys
 * @returns Arabic text string
 */
export const getArabicText = (text: MultilingualText): string => {
  if (typeof text === 'string') return text;
  return text.ar || text.en || '';
};

/**
 * Safely renders multilingual text for React components
 * Always returns a string that can be rendered as a React child
 */
export const renderText = (text: MultilingualText | undefined | null): string => {
  if (!text) return '';
  return getArabicText(text);
};

/**
 * Gets text with fallback for undefined/null values
 */
export const getTextWithFallback = (
  text: MultilingualText | undefined | null, 
  fallback: string = ''
): string => {
  if (!text) return fallback;
  return getArabicText(text);
};
