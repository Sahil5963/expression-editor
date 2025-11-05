import { EditorView } from '@codemirror/view';
import { defaultTheme } from './defaultTheme';
import type { ThemeConfig } from './types';
import { CSS_VARIABLES } from './types';
import { highlighter } from '@/lib/codemirror-plugins/resolvableHighlighter';

/**
 * Merges user theme with default theme
 */
function mergeTheme(userTheme?: ThemeConfig): Required<ThemeConfig> {
	return {
		colors: { ...defaultTheme.colors, ...userTheme?.colors },
		typography: { ...defaultTheme.typography, ...userTheme?.typography },
		spacing: { ...defaultTheme.spacing, ...userTheme?.spacing },
		border: { ...defaultTheme.border, ...userTheme?.border },
	};
}

/**
 * Creates CSS variable string with fallback
 * Example: var(--expr-editor-bg, #1a202c)
 */
function cssVar(varName: string, fallback: string): string {
	return `var(${varName}, ${fallback})`;
}

/**
 * Creates a CodeMirror theme with CSS variable support
 * Theme priority: CSS Variables > userTheme prop > defaultTheme
 */
export function createEditorTheme(userTheme?: ThemeConfig, options?: { rows?: number; isReadOnly?: boolean }) {
	const theme = mergeTheme(userTheme);
	const { rows = 5, isReadOnly = false } = options || {};
	const isSingleLine = rows === 1;
	const maxHeight = isSingleLine ? 30 : rows * 22 + 8;

	return EditorView.theme({
		'&': {
			backgroundColor: cssVar(CSS_VARIABLES.BACKGROUND, theme.colors.background),
			maxHeight: `${maxHeight}px`,
			minHeight: '30px',
			width: '100%',
			fontSize: cssVar(CSS_VARIABLES.FONT_SIZE, theme.typography.fontSize),
			padding: `0 0 0 ${theme.spacing['2xs']}`,
			borderWidth: theme.border.width,
			borderStyle: theme.border.style,
			borderColor: cssVar(CSS_VARIABLES.BORDER_COLOR, theme.colors.border),
			borderRadius: cssVar(CSS_VARIABLES.BORDER_RADIUS, theme.border.radius),
			borderTopLeftRadius: '0',
			borderBottomLeftRadius: '0',
			...(isSingleLine ? { overflow: 'hidden' } : {}),
		},

		'&.cm-focused': {
			outline: '0 !important',
		},

		'.cm-content': {
			fontFamily: cssVar(CSS_VARIABLES.FONT_FAMILY, theme.typography.fontFamilyMono),
			color: cssVar(CSS_VARIABLES.TEXT, theme.colors.text),
			caretColor: isReadOnly ? 'transparent' : cssVar(CSS_VARIABLES.CARET, theme.colors.caretColor),
		},

		'.cm-line': {
			padding: '0',
		},

		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: cssVar(CSS_VARIABLES.CARET, theme.colors.caretColor),
		},

		'.cm-scroller': {
			lineHeight: cssVar(CSS_VARIABLES.LINE_HEIGHT, theme.typography.lineHeight),
			...(isSingleLine ? { overflow: 'hidden !important' } : {}),
		},

		'.cm-lineWrapping': {
			wordBreak: 'break-all',
		},

		'.cm-selectionBackground, ::selection': {
			backgroundColor: theme.colors.selectionBackground,
		},

		'&.cm-focused .cm-selectionBackground, &.cm-focused ::selection': {
			backgroundColor: theme.colors.selectionBackground,
		},

		// Resolvable highlighting
		'.cm-valid-resolvable': {
			color: cssVar(CSS_VARIABLES.RESOLVABLE_VALID_FG, theme.colors.resolvableValidFg),
			backgroundColor: cssVar(CSS_VARIABLES.RESOLVABLE_VALID_BG, theme.colors.resolvableValidBg),
			padding: '0 2px',
			borderRadius: theme.border.radiusSm,
		},

		'.cm-invalid-resolvable': {
			color: cssVar(CSS_VARIABLES.RESOLVABLE_INVALID_FG, theme.colors.resolvableInvalidFg),
			backgroundColor: cssVar(CSS_VARIABLES.RESOLVABLE_INVALID_BG, theme.colors.resolvableInvalidBg),
			padding: '0 2px',
			borderRadius: theme.border.radiusSm,
		},

		'.cm-pending-resolvable': {
			color: cssVar(CSS_VARIABLES.RESOLVABLE_PENDING_FG, theme.colors.resolvablePendingFg),
			backgroundColor: cssVar(CSS_VARIABLES.RESOLVABLE_PENDING_BG, theme.colors.resolvablePendingBg),
			padding: '0 2px',
			borderRadius: theme.border.radiusSm,
		},

		// Autocomplete styles
		'.cm-tooltip-autocomplete': {
			backgroundColor: cssVar(CSS_VARIABLES.AUTOCOMPLETE_BG, theme.colors.autocompleteBackground),
			border: `${theme.border.width} ${theme.border.style} ${cssVar(CSS_VARIABLES.AUTOCOMPLETE_BORDER, theme.colors.autocompleteBorder)}`,
			borderRadius: theme.border.radius,
			boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
			fontFamily: theme.typography.fontFamily,
			'& > ul': {
				maxHeight: '300px',
				overflowY: 'auto',
				fontFamily: theme.typography.fontFamily,
			},
			'& > ul > li': {
				padding: `${theme.spacing['3xs']} ${theme.spacing['2xs']}`,
				color: cssVar(CSS_VARIABLES.AUTOCOMPLETE_TEXT, theme.colors.autocompleteText),
				cursor: 'pointer',
			},
			'& > ul > li:hover': {
				backgroundColor: cssVar(CSS_VARIABLES.AUTOCOMPLETE_HOVER_BG, theme.colors.autocompleteItemHoverBackground),
			},
			'& > ul > li[aria-selected="true"]': {
				backgroundColor: cssVar(CSS_VARIABLES.AUTOCOMPLETE_SELECTED_BG, theme.colors.autocompleteSelectedBackground),
			},
		},

		'.cm-completionLabel': {
			color: cssVar(CSS_VARIABLES.AUTOCOMPLETE_TEXT, theme.colors.autocompleteText),
			fontSize: theme.typography.fontSize,
		},

		'.cm-completionDetail': {
			color: cssVar(CSS_VARIABLES.TEXT_SECONDARY, theme.colors.textSecondary),
			fontSize: '11px',
			marginLeft: theme.spacing['2xs'],
		},

		'.cm-completionInfo': {
			backgroundColor: cssVar(CSS_VARIABLES.AUTOCOMPLETE_BG, theme.colors.autocompleteBackground),
			border: `${theme.border.width} ${theme.border.style} ${cssVar(CSS_VARIABLES.AUTOCOMPLETE_BORDER, theme.colors.autocompleteBorder)}`,
			borderRadius: theme.border.radius,
			padding: theme.spacing['2xs'],
			color: cssVar(CSS_VARIABLES.AUTOCOMPLETE_TEXT, theme.colors.autocompleteText),
			maxWidth: '300px',
		},

		// Tooltip styles
		'.cm-tooltip': {
			backgroundColor: cssVar(CSS_VARIABLES.AUTOCOMPLETE_BG, theme.colors.autocompleteBackground),
			border: `${theme.border.width} ${theme.border.style} ${cssVar(CSS_VARIABLES.AUTOCOMPLETE_BORDER, theme.colors.autocompleteBorder)}`,
			borderRadius: theme.border.radius,
			padding: theme.spacing['2xs'],
			color: cssVar(CSS_VARIABLES.AUTOCOMPLETE_TEXT, theme.colors.autocompleteText),
		},
	});

	// Return both the theme and the resolvable highlighter style
	return [theme, highlighter.resolvableStyle];
}
