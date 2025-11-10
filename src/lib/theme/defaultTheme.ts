import type { ThemeConfig } from './types';

/**
 * Default theme based on n8n dark theme
 */
export const defaultTheme: Required<ThemeConfig> = {
	colors: {
		// Background colors
		background: '#1a202c',
		backgroundLight: '#f7fafc',

		// Text colors
		text: '#4a5568',
		textSecondary: '#718096',
		textDanger: '#dc2626',

		// Primary colors
		primary: '#667eea',
		primaryShade: '#5568d3',
		primaryTint: '#8097f0',

		// Secondary colors
		secondary: '#ff6d4d',

		// State colors
		success: '#10b981',
		successBackground: 'rgba(34, 197, 94, 0.15)',
		warning: '#fbbf24',
		danger: '#ef4444',

		// Editor specific
		caretColor: '#667eea',
		border: '#2d3748',
		selectionBackground: 'rgba(102, 126, 234, 0.3)',

		// Resolvable highlighting
		resolvableValidFg: '#22c55e',
		resolvableValidBg: 'rgba(34, 197, 94, 0.15)',
		resolvableInvalidFg: '#ef4444',
		resolvableInvalidBg: 'rgba(239, 68, 68, 0.15)',
		resolvablePendingFg: '#f59e0b',
		resolvablePendingBg: 'rgba(245, 158, 11, 0.15)',
		resolvableUnresolvedFg: '#60a5fa',
		resolvableUnresolvedBg: 'rgba(96, 165, 250, 0.15)',

		// Autocomplete
		autocompleteBackground: '#2d3748',
		autocompleteSelectedBackground: 'rgba(102, 126, 234, 0.2)',
		autocompleteItemHoverBackground: 'rgba(102, 126, 234, 0.1)',
		autocompleteText: '#e2e8f0',
		autocompleteBorder: '#4a5568',
	},

	typography: {
		fontSize: '12px',
		fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		fontFamilyMono: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
		lineHeight: '1.68',
		fontWeight: '400',
		fontWeightBold: '600',
	},

	spacing: {
		'5xs': '2px',
		'4xs': '4px',
		'3xs': '6px',
		'2xs': '8px',
		xs: '12px',
		sm: '16px',
		md: '20px',
		lg: '24px',
		xl: '32px',
		'2xl': '48px',
		'3xl': '64px',
	},

	border: {
		width: '1px',
		style: 'solid',
		radius: '4px',
		radiusSm: '2px',
		radiusLg: '8px',
		radiusXl: '12px',
	},
};
