import type { ThemeConfig } from './types';

/**
 * Dark theme preset (default)
 */
export const darkTheme: ThemeConfig = {
	colors: {
		background: '#1a202c',
		backgroundLight: '#2d3748',
		text: '#e2e8f0',
		textSecondary: '#a0aec0',
		primary: '#667eea',
		caretColor: '#667eea',
		border: '#4a5568',
		autocompleteBackground: '#2d3748',
		autocompleteText: '#e2e8f0',
		autocompleteBorder: '#4a5568',
	},
	typography: {
		fontSize: '12px',
		fontFamilyMono: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
	},
};

/**
 * Light theme preset
 */
export const lightTheme: ThemeConfig = {
	colors: {
		background: '#ffffff',
		backgroundLight: '#f7fafc',
		text: '#2d3748',
		textSecondary: '#718096',
		primary: '#667eea',
		caretColor: '#667eea',
		border: '#e2e8f0',
		autocompleteBackground: '#ffffff',
		autocompleteText: '#2d3748',
		autocompleteBorder: '#e2e8f0',
	},
	typography: {
		fontSize: '12px',
		fontFamilyMono: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
	},
};

/**
 * n8n branded theme
 */
export const n8nTheme: ThemeConfig = {
	colors: {
		background: '#1a202c',
		text: '#e2e8f0',
		primary: '#ff6d4d',
		caretColor: '#ff6d4d',
		resolvableValidFg: '#10b981',
		resolvableInvalidFg: '#ef4444',
	},
	typography: {
		fontSize: '12px',
		fontFamilyMono: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
	},
};
