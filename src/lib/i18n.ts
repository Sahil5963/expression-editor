/**
 * Simple i18n stub for standalone operation
 */

export const i18n = {
	baseText: (key: string) => key,
};

export const useI18n = () => ({
	locale: { value: 'en' },
	baseText: (key: string) => key,
});
