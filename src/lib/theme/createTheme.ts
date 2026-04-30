import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { defaultTheme } from './defaultTheme';
import type { ThemeConfig } from './types';
import { CSS_VARIABLES } from './types';
import { highlighter } from '@/lib/codemirror-plugins/resolvableHighlighter';

function mergeTheme(userTheme?: ThemeConfig): Required<ThemeConfig> {
	return {
		colors: { ...defaultTheme.colors, ...userTheme?.colors },
		typography: { ...defaultTheme.typography, ...userTheme?.typography },
		spacing: { ...defaultTheme.spacing, ...userTheme?.spacing },
		border: { ...defaultTheme.border, ...userTheme?.border },
	};
}

function cssVar(varName: string, fallback: string): string {
	return `var(${varName}, ${fallback})`;
}

/**
 * Creates a CodeMirror theme with CSS variable support.
 *
 * Sizing modes (mutually exclusive; rows takes priority):
 *   rows    — strictly pinned to N rows; rows=1 also hides overflow and blocks Enter
 *   minRows — auto-grow from N rows; combine with maxRows to cap growth
 *   maxRows — caps auto-grow height; implies minRows=1 if minRows is not set
 *
 * Defaults to minRows=5 (auto-grow) when nothing is specified.
 *
 * Theme priority: CSS Variables > userTheme prop > defaultTheme
 */
export function createEditorTheme(
	userTheme?: ThemeConfig,
	options?: { rows?: number; minRows?: number; maxRows?: number; isReadOnly?: boolean },
): Extension[] {
	const theme = mergeTheme(userTheme);
	const { rows, minRows, maxRows, isReadOnly = false } = options || {};

	const lineHeightPx = parseFloat(theme.typography.fontSize) * parseFloat(theme.typography.lineHeight);
	const rowHeight = Math.ceil(lineHeightPx) + 2;

	const isStrictMode = rows !== undefined;
	let minContentHeight: number;
	let maxContentHeight: number | undefined;
	let isSingleLine = false;

	if (isStrictMode) {
		const safeRows = Math.max(1, rows!);
		isSingleLine = safeRows === 1;
		minContentHeight = safeRows * rowHeight + 8;
	} else {
		const safeMin = Math.max(1, minRows ?? 5);
		const safeMax = Math.max(safeMin, maxRows ?? 10);
		minContentHeight = safeMin * rowHeight + 8;
		maxContentHeight = safeMax * rowHeight + 8;
	}

	const themeExtension = EditorView.theme({
		'&': {
			backgroundColor: cssVar(CSS_VARIABLES.BACKGROUND, theme.colors.background),
			width: '100%',
			fontSize: cssVar(CSS_VARIABLES.FONT_SIZE, theme.typography.fontSize),
			padding: `0 0 0 ${theme.spacing['2xs']}`,
			borderWidth: theme.border.width,
			borderStyle: theme.border.style,
			borderColor: cssVar(CSS_VARIABLES.BORDER_COLOR, theme.colors.border),
			borderRadius: cssVar(CSS_VARIABLES.BORDER_RADIUS, theme.border.radius),
			...(isStrictMode
				? {
					height: `${minContentHeight}px`,
					minHeight: `${minContentHeight}px`,
					...(isSingleLine ? { overflow: 'hidden' } : {}),
				}
				: { height: '100%' }),
		},

		'&.cm-focused': {
			outline: '0 !important',
		},

		'.cm-content': {
			fontFamily: cssVar(CSS_VARIABLES.FONT_FAMILY, theme.typography.fontFamilyMono),
			fontSize: cssVar(CSS_VARIABLES.FONT_SIZE, theme.typography.fontSize),
			color: cssVar(CSS_VARIABLES.TEXT, theme.colors.text),
			caretColor: isReadOnly ? 'transparent' : cssVar(CSS_VARIABLES.CARET, theme.colors.caretColor),
			minHeight: `${minContentHeight}px`,
		},

		'.cm-line': {
			padding: '0',
		},

		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: cssVar(CSS_VARIABLES.CARET, theme.colors.caretColor),
		},

		'.cm-scroller': {
			lineHeight: cssVar(CSS_VARIABLES.LINE_HEIGHT, theme.typography.lineHeight),
			// strict single-line: hide all overflow
			...(isSingleLine
				? {
					overflow: 'hidden !important',
					height: `${minContentHeight}px`,
					maxHeight: `${minContentHeight}px`,
				}
				// strict multi-row: fixed height, content scrollable
				: isStrictMode
				? {
					overflow: 'auto',
					height: `${minContentHeight}px`,
					maxHeight: `${minContentHeight}px`,
				}
				// auto-grow with maxRows: scrollable once ceiling is hit
				: maxContentHeight !== undefined
				? {
					overflow: 'auto',
					maxHeight: `${maxContentHeight}px`,
				}
				: {}),
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

		'.cm-unresolved-resolvable': {
			color: cssVar(CSS_VARIABLES.RESOLVABLE_UNRESOLVED_FG, theme.colors.resolvableUnresolvedFg),
			backgroundColor: cssVar(CSS_VARIABLES.RESOLVABLE_UNRESOLVED_BG, theme.colors.resolvableUnresolvedBg),
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
			overflow: 'visible !important',
			'& > ul': {
				maxHeight: '300px',
				overflowY: 'auto',
				overflowX: 'visible',
				fontFamily: theme.typography.fontFamily,
			},
			'& > ul > li': {
				padding: '2px 4px',
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
			padding: '6px 8px',
			color: cssVar(CSS_VARIABLES.AUTOCOMPLETE_TEXT, theme.colors.autocompleteText),
			maxWidth: '300px',
			boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
			zIndex: '1000',
			whiteSpace: 'pre-wrap',
			wordWrap: 'break-word',
		},

		'.cm-tooltip': {
			backgroundColor: cssVar(CSS_VARIABLES.AUTOCOMPLETE_BG, theme.colors.autocompleteBackground),
			border: `${theme.border.width} ${theme.border.style} ${cssVar(CSS_VARIABLES.AUTOCOMPLETE_BORDER, theme.colors.autocompleteBorder)}`,
			borderRadius: theme.border.radius,
			padding: theme.spacing['2xs'],
			color: cssVar(CSS_VARIABLES.AUTOCOMPLETE_TEXT, theme.colors.autocompleteText),
		},
	});

	return [themeExtension, highlighter.resolvableStyle];
}
