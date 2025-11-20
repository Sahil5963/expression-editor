import React, { useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap, dropCursor, placeholder as placeholderExt } from '@codemirror/view';
import { EditorState, Prec, type SelectionRange } from '@codemirror/state';
import { history } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import type { Segment } from '@/types/expressions';

import { useExpressionEditor } from '@/lib/hooks/useExpressionEditor';
import { n8nLang } from '@/lib/codemirror-plugins/n8nLang';
import { editorKeymap } from '@/lib/codemirror-plugins/keymap';
import { expressionCloseBrackets } from '@/lib/codemirror-plugins/expressionCloseBrackets';
import { createEditorTheme, EDITOR_CLASS_NAMES, type ThemeConfig } from '@/lib/theme';
import { createDefaultAutocompleteProvider, type AutocompleteProvider, type AutocompleteData } from '@/lib/autocomplete';

/**
 * Props for the ExpressionEditor component
 */
export interface ExpressionEditorProps {
	/** Current value of the editor (controlled) */
	value: string;

	/** Callback when the value changes */
	onChange: (data: { value: string; segments: Segment[] }) => void;

	/** Autocomplete data object for default autocomplete provider */
	autocompleteData?: AutocompleteData;

	/** Custom autocomplete provider function */
	autocompleteProvider?: AutocompleteProvider;

	/** Theme configuration */
	theme?: ThemeConfig;

	/** Enable drag and drop support */
	enableDragDrop?: boolean;

	/** Callback when something is dropped */
	onDrop?: (value: string, position: number) => void;

	/** Additional CSS class name */
	className?: string;

	/** Inline styles */
	style?: React.CSSProperties;

	/** Number of rows (1 for single-line) */
	rows?: number;

	/** Maximum height (CSS value) */
	maxHeight?: string | number;

	/** Read-only mode */
	readOnly?: boolean;

	/** Placeholder text */
	placeholder?: string;

	/** Callback when editor receives focus */
	onFocus?: () => void;

	/** Callback when editor loses focus */
	onBlur?: () => void;

	/** Callback when selection changes */
	onSelectionChange?: (data: { state: EditorState; selection: SelectionRange }) => void;

	/** Parameter path for telemetry */
	path?: string;

	/** Enable debug console logs for development */
	enableDebugLogs?: boolean;

	/** Disable automatic '=' prefix for non-expression usage */
	disableExpressionPrefix?: boolean;
}

/**
 * Selection info returned by getSelection()
 */
export interface SelectionInfo {
	/** Start position of selection */
	from: number;
	/** End position of selection */
	to: number;
	/** Selected text content */
	text: string;
}

/**
 * Ref interface for imperative API
 */
export interface ExpressionEditorRef {
	/** Focus the editor */
	focus: () => void;

	/** Set cursor position */
	setCursorPosition: (position: 'lastExpression' | number) => void;

	/** Handle drop event programmatically */
	handleDrop: (event: React.DragEvent) => void;

	/** Get current selection info */
	getSelection: () => SelectionInfo;

	/**
	 * Insert or replace text in the editor
	 * @param text Text to insert
	 * @param from Optional start position (defaults to selection start)
	 * @param to Optional end position (defaults to selection end)
	 */
	insertText: (text: string, from?: number, to?: number) => void;

	/**
	 * Set selection range
	 * @param from Start position
	 * @param to End position (if same as from, sets cursor position)
	 */
	setSelection: (from: number, to?: number) => void;
}

/**
 * Expression Editor Component
 *
 * A powerful code editor for expressions with autocomplete, syntax highlighting,
 * and customizable theming.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ExpressionEditor
 *   value={expression}
 *   onChange={({ value }) => setExpression(value)}
 * />
 *
 * // With autocomplete data
 * <ExpressionEditor
 *   value={expression}
 *   onChange={({ value }) => setExpression(value)}
 *   autocompleteData={{ user: { name: 'John' }, order: { id: 123 } }}
 * />
 *
 * // With custom theme
 * <ExpressionEditor
 *   value={expression}
 *   onChange={({ value }) => setExpression(value)}
 *   theme={{ colors: { background: '#000', text: '#fff' } }}
 * />
 * ```
 */
export const ExpressionEditor = forwardRef<ExpressionEditorRef, ExpressionEditorProps>(
	(props, ref) => {
		const {
			value,
			onChange,
			autocompleteData,
			autocompleteProvider,
			theme,
			enableDragDrop = true,
			onDrop,
			className = '',
			style = {},
			rows = 5,
			maxHeight,
			readOnly = false,
			placeholder,
			onFocus,
			onBlur,
			onSelectionChange,
			path = 'expression',
			enableDebugLogs = false,
			disableExpressionPrefix = false,
		} = props;

		// Create theme with options (returns array of [theme, highlighter])
		const editorTheme = useMemo(
			() => createEditorTheme(theme, { rows, isReadOnly: readOnly }),
			[theme, rows, readOnly],
		);

		// Create autocomplete provider
		const autocompleteFn = useMemo(() => {
			if (autocompleteProvider) return autocompleteProvider;
			if (autocompleteData) return createDefaultAutocompleteProvider(autocompleteData);
			return null;
		}, [autocompleteProvider, autocompleteData]);

		// Create custom extensions
		const extensions = useMemo(() => {
			const isSingleLine = rows === 1;

			const exts = [
				...editorTheme, // Spread the theme extensions array
				Prec.highest(keymap.of(editorKeymap)),
				n8nLang(),
				history(),
				expressionCloseBrackets(),
			];

			// Add placeholder if provided
			if (placeholder) {
				exts.push(placeholderExt(placeholder));
			}

			// Block Enter key for single-line inputs
			if (isSingleLine) {
				exts.push(
					Prec.highest(
						keymap.of([
							{
								key: 'Enter',
								run: () => true, // Block Enter key
							},
						]),
					),
				);
			} else {
				// Only enable line wrapping for multi-line inputs
				exts.push(EditorView.lineWrapping);
			}

			// Add autocomplete if provider exists
			if (autocompleteFn) {
				exts.push(
					autocompletion({
						override: [autocompleteFn],
						icons: false,
						aboveCursor: true,
						closeOnBlur: false,
						tooltipClass: () => 'cm-completionInfo',
						activateOnTyping: true,
					}),
				);
			}

			// Add drag and drop support
			if (enableDragDrop) {
				exts.push(
					dropCursor(), // Native CodeMirror drop cursor - provides visual feedback
					EditorView.domEventHandlers({
						drop: (event, view) => {
							event.preventDefault();
							event.stopPropagation();

							const value = event.dataTransfer?.getData('text/plain');
							if (!value) return true;

							// Get position where drop occurred
							const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);

							if (pos !== null) {
								// Call custom onDrop callback if provided
								if (onDrop) {
									onDrop(value, pos);
								}

								// Insert the value at the drop position
								view.dispatch({
									changes: { from: pos, insert: value },
									selection: { anchor: pos + value.length },
									userEvent: 'input.drop',
								});
							}

							return true; // We handled it
						},
					}),
				);
			}

			return exts;
		}, [editorTheme, rows, autocompleteFn, enableDragDrop, onDrop, placeholder]);

		const {
			editorRef,
			editor,
			segments,
			selection,
			hasFocus,
			readEditorValue,
			setCursorPosition,
			focus,
			getSelection,
			insertText,
			setEditorSelection,
		} = useExpressionEditor({
			value: disableExpressionPrefix ? value : value.replace(/^=/, ''), // Conditionally remove '=' prefix
			extensions,
			additionalData: autocompleteData || {},
			isReadOnly: readOnly,
			autocompleteTelemetry: { enabled: true, parameterPath: path },
			enableDebugLogs,
			onDocChange: (content: string) => {
				// Emit update on every document change for real-time sync
				onChange({
					value: disableExpressionPrefix ? content : '=' + content, // Conditionally add '=' prefix
					segments: segments.display,
				});
			},
			onSelectionChange: (newSelection) => {
				if (editor && onSelectionChange) {
					onSelectionChange({
						state: editor.state,
						selection: newSelection,
					});
				}
			},
			onFocus: () => {
				if (onFocus) onFocus();
			},
			onBlur: () => {
				if (onBlur) onBlur();
			},
		});

		// Handle drag over
		const handleDragOver = useCallback((event: React.DragEvent) => {
			if (!enableDragDrop) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		}, [enableDragDrop]);

		// Handle drop - This is a backup handler, CodeMirror handler should handle it first
		const handleDrop = useCallback(
			(event: React.DragEvent) => {
				if (!enableDragDrop) return;

				event.preventDefault();
				event.stopPropagation();

				const dragValue = event.dataTransfer?.getData('text/plain');

				if (!dragValue || !editor) return;

				// Get the drop position
				const pos = editor.posAtCoords({ x: event.clientX, y: event.clientY }, false);

				if (pos !== null) {
					// Call custom onDrop callback if provided
					if (onDrop) {
						onDrop(dragValue, pos);
					}

					// Insert the value at the drop position
					editor.dispatch({
						changes: { from: pos, insert: dragValue },
						selection: { anchor: pos + dragValue.length },
						userEvent: 'input.drop',
					});

					setTimeout(() => editor.focus());
				}
			},
			[editor, enableDragDrop, onDrop],
		);

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				focus,
				setCursorPosition,
				handleDrop,
				getSelection,
				insertText,
				setSelection: setEditorSelection,
			}),
			[focus, setCursorPosition, handleDrop, getSelection, insertText, setEditorSelection],
		);

		// Merge flex container styles with user styles
		const containerStyle = useMemo(() => {
			const baseStyle: React.CSSProperties = {
				display: 'flex',
				flexDirection: 'column',
				...style, // User styles override/extend defaults
			};
			if (maxHeight) {
				baseStyle.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
			}
			return baseStyle;
		}, [style, maxHeight]);

		return (
			<div
				ref={editorRef}
				className={`${EDITOR_CLASS_NAMES.ROOT} ${className}`.trim()}
				style={containerStyle}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			/>
		);
	},
);

ExpressionEditor.displayName = 'ExpressionEditor';
