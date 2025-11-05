/**
 * Theme configuration types for Expression Editor
 */

export interface ThemeColors {
	// Background colors
	background?: string;
	backgroundLight?: string;

	// Text colors
	text?: string;
	textSecondary?: string;
	textDanger?: string;

	// Primary colors
	primary?: string;
	primaryShade?: string;
	primaryTint?: string;

	// Secondary colors
	secondary?: string;

	// State colors
	success?: string;
	successBackground?: string;
	warning?: string;
	danger?: string;

	// Editor specific
	caretColor?: string;
	border?: string;
	selectionBackground?: string;

	// Resolvable highlighting
	resolvableValidFg?: string;
	resolvableValidBg?: string;
	resolvableInvalidFg?: string;
	resolvableInvalidBg?: string;
	resolvablePendingFg?: string;
	resolvablePendingBg?: string;

	// Autocomplete
	autocompleteBackground?: string;
	autocompleteSelectedBackground?: string;
	autocompleteItemHoverBackground?: string;
	autocompleteText?: string;
	autocompleteBorder?: string;
}

export interface ThemeTypography {
	fontSize?: string;
	fontFamily?: string;
	fontFamilyMono?: string;
	lineHeight?: string;
	fontWeight?: string;
	fontWeightBold?: string;
}

export interface ThemeSpacing {
	'5xs'?: string;
	'4xs'?: string;
	'3xs'?: string;
	'2xs'?: string;
	xs?: string;
	sm?: string;
	md?: string;
	lg?: string;
	xl?: string;
	'2xl'?: string;
	'3xl'?: string;
}

export interface ThemeBorder {
	width?: string;
	style?: string;
	radius?: string;
	radiusSm?: string;
	radiusLg?: string;
	radiusXl?: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
	colors?: ThemeColors;
	typography?: ThemeTypography;
	spacing?: ThemeSpacing;
	border?: ThemeBorder;
}

/**
 * CSS class names for targeting editor elements
 */
export const EDITOR_CLASS_NAMES = {
	ROOT: 'expression-editor',
	INPUT: 'expression-editor__input',
	AUTOCOMPLETE: 'cm-tooltip-autocomplete',
	AUTOCOMPLETE_ITEM: 'cm-completionLabel',
	TOOLTIP: 'cm-tooltip',
	CURSOR: 'cm-cursor',
	SELECTION: 'cm-selectionBackground',
} as const;

/**
 * CSS variable names used by the editor
 * Users can override these variables to customize the editor
 */
export const CSS_VARIABLES = {
	// Background
	BACKGROUND: '--expr-editor-bg',
	BACKGROUND_LIGHT: '--expr-editor-bg-light',

	// Text
	TEXT: '--expr-editor-text',
	TEXT_SECONDARY: '--expr-editor-text-secondary',

	// Primary
	PRIMARY: '--expr-editor-primary',
	CARET: '--expr-editor-caret',

	// Editor
	FONT_SIZE: '--expr-editor-font-size',
	FONT_FAMILY: '--expr-editor-font-family',
	LINE_HEIGHT: '--expr-editor-line-height',
	BORDER_RADIUS: '--expr-editor-radius',
	BORDER_COLOR: '--expr-editor-border',

	// Autocomplete
	AUTOCOMPLETE_BG: '--expr-editor-autocomplete-bg',
	AUTOCOMPLETE_SELECTED_BG: '--expr-editor-autocomplete-selected-bg',
	AUTOCOMPLETE_HOVER_BG: '--expr-editor-autocomplete-hover-bg',
	AUTOCOMPLETE_TEXT: '--expr-editor-autocomplete-text',
	AUTOCOMPLETE_BORDER: '--expr-editor-autocomplete-border',

	// Resolvable
	RESOLVABLE_VALID_FG: '--expr-editor-resolvable-valid-fg',
	RESOLVABLE_VALID_BG: '--expr-editor-resolvable-valid-bg',
	RESOLVABLE_INVALID_FG: '--expr-editor-resolvable-invalid-fg',
	RESOLVABLE_INVALID_BG: '--expr-editor-resolvable-invalid-bg',
	RESOLVABLE_PENDING_FG: '--expr-editor-resolvable-pending-fg',
	RESOLVABLE_PENDING_BG: '--expr-editor-resolvable-pending-bg',
} as const;
