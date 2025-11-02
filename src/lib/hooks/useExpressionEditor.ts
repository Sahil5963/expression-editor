/**
 * React hook for Expression Editor
 * Converted from Vue composable to React hook
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import {
	EditorSelection,
	EditorState,
	type Extension,
	type SelectionRange,
} from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { IDataObject } from '@/types/workflow';
import type { Segment } from '@/types/expressions';
import { highlighter } from '@/lib/codemirror-plugins/resolvableHighlighter';
import { syntaxTree } from '@codemirror/language';

export interface UseExpressionEditorOptions {
	value?: string;
	extensions?: Extension[];
	additionalData?: IDataObject;
	autocompleteTelemetry?: { enabled: true; parameterPath: string };
	isReadOnly?: boolean;
	disableSearchDialog?: boolean;
	onDocChange?: (content: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	onSelectionChange?: (selection: SelectionRange) => void;
}

export interface UseExpressionEditorReturn {
	editorRef: React.RefObject<HTMLDivElement>;
	editor: EditorView | null;
	segments: { display: Segment[] };
	selection: SelectionRange;
	hasFocus: boolean;
	readEditorValue: () => string;
	setCursorPosition: (position: 'lastExpression' | number) => void;
	focus: () => void;
}

export const useExpressionEditor = (
	options: UseExpressionEditorOptions = {},
): UseExpressionEditorReturn => {
	const {
		value = '',
		extensions = [],
		additionalData = {},
		isReadOnly = false,
		disableSearchDialog = false,
		onDocChange,
		onFocus,
		onBlur,
		onSelectionChange,
	} = options;

	const editorRef = useRef<HTMLDivElement>(null);
	const [editor, setEditor] = useState<EditorView | null>(null);
	const [hasFocus, setHasFocus] = useState(false);
	const [segments, setSegments] = useState<{ display: Segment[] }>({ display: [] });
	const [selection, setSelection] = useState<SelectionRange>(EditorSelection.cursor(0));

	// Parse and highlight {{ }} expressions using the syntax tree
	const parseAndHighlight = useCallback((text: string, view: EditorView) => {
		const tree = syntaxTree(view.state);
		const resolvables: Segment[] = [];

		// Use the Lezer syntax tree to find all Resolvable nodes
		tree.cursor().iterate((node) => {
			if (node.name === 'Resolvable') {
				const from = node.from;
				const to = node.to;
				const content = text.slice(from + 2, to - 2).trim(); // Remove {{ and }}

				// Simple validation - just check if it's not empty
				const state = content.length > 0 ? 'valid' : 'invalid';

				resolvables.push({
					from,
					to,
					kind: 'resolvable',
					state,
				} as Segment);
			}
		});

		setSegments({ display: resolvables });

		// Apply highlighting
		if (resolvables.length > 0) {
			highlighter.addColor(view, resolvables);
		}
	}, []);

	const readEditorValue = useCallback((): string => {
		return editor?.state.doc.toString() || '';
	}, [editor]);

	const setCursorPosition = useCallback(
		(position: 'lastExpression' | number) => {
			if (!editor) return;

			const pos = position === 'lastExpression' ? editor.state.doc.length : position;

			editor.dispatch({
				selection: EditorSelection.cursor(pos),
			});
		},
		[editor],
	);

	const focus = useCallback(() => {
		editor?.focus();
		setHasFocus(true);
	}, [editor]);

	// Initialize editor
	useEffect(() => {
		if (!editorRef.current || editor) return;

		const state = EditorState.create({
			doc: value || '',
			extensions: [
				...extensions,
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						setSelection(update.state.selection.main);
						onSelectionChange?.(update.state.selection.main);
					}
					if (update.focusChanged) {
						const newHasFocus = update.view.hasFocus;
						setHasFocus(newHasFocus);
						if (newHasFocus) {
							onFocus?.();
						} else {
							onBlur?.();
						}
					}
					if (update.docChanged) {
						const content = update.state.doc.toString();
						parseAndHighlight(content, update.view);
						// Notify parent of content changes
						onDocChange?.(content);
					}
				}),
				EditorState.readOnly.of(isReadOnly),
			],
		});

		const view = new EditorView({
			state,
			parent: editorRef.current,
		});

		setEditor(view);

		// Initial parse and highlight
		parseAndHighlight(value || '', view);

		// Cleanup
		return () => {
			view.destroy();
			setEditor(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run on mount

	// Watch for value changes
	useEffect(() => {
		if (!editor) return;

		const currentValue = editor.state.doc.toString();
		if (value !== currentValue) {
			editor.dispatch({
				changes: { from: 0, to: currentValue.length, insert: value || '' },
			});
		}
	}, [value, editor]);

	// Watch for extensions changes
	useEffect(() => {
		if (!editor || extensions.length === 0) return;

		// Recreate editor with new extensions
		const currentValue = editor.state.doc.toString();
		const container = editor.dom.parentElement;
		editor.destroy();

		if (container) {
			const state = EditorState.create({
				doc: currentValue,
				extensions: [
					...extensions,
					EditorView.updateListener.of((update) => {
						if (update.selectionSet) {
							setSelection(update.state.selection.main);
							onSelectionChange?.(update.state.selection.main);
						}
						if (update.focusChanged) {
							const newHasFocus = update.view.hasFocus;
							setHasFocus(newHasFocus);
							if (newHasFocus) {
								onFocus?.();
							} else {
								onBlur?.();
							}
						}
						if (update.docChanged) {
							const content = update.state.doc.toString();
							parseAndHighlight(content, update.view);
							onDocChange?.(content);
						}
					}),
					EditorState.readOnly.of(isReadOnly),
				],
			});

			const view = new EditorView({
				state,
				parent: container,
			});

			setEditor(view);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extensions, isReadOnly]);

	return {
		editorRef,
		editor,
		segments,
		selection,
		hasFocus,
		readEditorValue,
		setCursorPosition,
		focus,
	};
};
