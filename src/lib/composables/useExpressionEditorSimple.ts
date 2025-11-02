/**
 * Simplified useExpressionEditor for standalone operation
 * This version removes all Pinia store dependencies and n8n-workflow integration
 */
import {
	computed,
	onBeforeUnmount,
	onMounted,
	ref,
	toValue,
	watch,
	type MaybeRefOrGetter,
	type Ref,
} from 'vue';

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

export const useExpressionEditor = ({
	editorRef,
	editorValue,
	extensions = [],
	additionalData = {},
	autocompleteTelemetry,
	isReadOnly = false,
	disableSearchDialog = false,
}: {
	editorRef: MaybeRefOrGetter<HTMLElement | undefined>;
	editorValue?: MaybeRefOrGetter<string>;
	extensions?: MaybeRefOrGetter<Extension[]>;
	additionalData?: MaybeRefOrGetter<IDataObject>;
	autocompleteTelemetry?: MaybeRefOrGetter<{ enabled: true; parameterPath: string }>;
	isReadOnly?: MaybeRefOrGetter<boolean>;
	disableSearchDialog?: MaybeRefOrGetter<boolean>;
}) => {
	const editor = ref<EditorView>();
	const hasFocus = ref(false);
	const segments = ref<{ display: Segment[] }>({ display: [] });
	const selection = ref<SelectionRange>(EditorSelection.cursor(0)) as Ref<SelectionRange>;

	// Parse and highlight {{ }} expressions using the syntax tree
	const parseAndHighlight = (text: string, view: EditorView) => {
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

		segments.value.display = resolvables;

		// Apply highlighting
		if (resolvables.length > 0) {
			highlighter.addColor(view, resolvables);
		}
	};

	const readEditorValue = (): string => {
		return editor.value?.state.doc.toString() || '';
	};

	const setCursorPosition = (position: 'lastExpression' | number) => {
		if (!editor.value) return;

		const pos = position === 'lastExpression'
			? editor.value.state.doc.length
			: position;

		editor.value.dispatch({
			selection: EditorSelection.cursor(pos),
		});
	};

	const focus = () => {
		editor.value?.focus();
		hasFocus.value = true;
	};

	onMounted(() => {
		const container = toValue(editorRef);
		if (!container) return;

		const state = EditorState.create({
			doc: toValue(editorValue) || '',
			extensions: [
				...(toValue(extensions) || []),
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						selection.value = update.state.selection.main;
					}
					if (update.focusChanged) {
						hasFocus.value = update.view.hasFocus;
					}
					if (update.docChanged) {
						parseAndHighlight(update.state.doc.toString(), update.view);
					}
				}),
				EditorState.readOnly.of(toValue(isReadOnly)),
			],
		});

		editor.value = new EditorView({
			state,
			parent: container,
		});

		// Initial parse and highlight
		parseAndHighlight(toValue(editorValue) || '', editor.value);
	});

	// Watch for value changes
	watch(
		() => toValue(editorValue),
		(newValue) => {
			if (!editor.value) return;
			const currentValue = editor.value.state.doc.toString();
			if (newValue !== currentValue) {
				editor.value.dispatch({
					changes: { from: 0, to: currentValue.length, insert: newValue || '' },
				});
			}
		}
	);

	// Watch for extensions changes
	watch(
		() => toValue(extensions),
		(newExtensions) => {
			if (!editor.value || !newExtensions) return;
			// Recreate editor with new extensions
			const currentValue = editor.value.state.doc.toString();
			const container = editor.value.dom.parentElement;
			editor.value.destroy();

			if (container) {
				const state = EditorState.create({
					doc: currentValue,
					extensions: [
						...newExtensions,
						EditorView.updateListener.of((update) => {
							if (update.selectionSet) {
								selection.value = update.state.selection.main;
							}
							if (update.focusChanged) {
								hasFocus.value = update.view.hasFocus;
							}
						}),
						EditorState.readOnly.of(toValue(isReadOnly)),
					],
				});

				editor.value = new EditorView({
					state,
					parent: container,
				});
			}
		}
	);

	onBeforeUnmount(() => {
		editor.value?.destroy();
	});

	return {
		editor,
		segments,
		selection,
		readEditorValue,
		setCursorPosition,
		hasFocus,
		focus,
	};
};
