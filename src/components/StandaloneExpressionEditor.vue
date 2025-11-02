<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { EditorView, keymap, dropCursor } from '@codemirror/view';
import { EditorState, Prec, type SelectionRange } from '@codemirror/state';
import { history } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import type { IDataObject } from '@/types/workflow';
import type { Segment } from '@/types/expressions';

import { useExpressionEditor } from '@/lib/composables/useExpressionEditorSimple';
import { n8nLang } from '@/lib/codemirror-plugins/n8nLang';
import { editorKeymap } from '@/lib/codemirror-plugins/keymap';
import { inputTheme } from '@/lib/theme/theme';
import { expressionCloseBrackets } from '@/lib/codemirror-plugins/expressionCloseBrackets';
import { infoBoxTooltips } from '@/lib/codemirror-plugins/tooltips/InfoBoxTooltip';
import { customDollarCompletions, setMockAutocompleteData } from './customAutocomplete';

type Props = {
	modelValue: string;
	path: string;
	rows?: number;
	isReadOnly?: boolean;
	additionalData?: IDataObject;
};

const props = withDefaults(defineProps<Props>(), {
	rows: 5,
	isReadOnly: false,
	additionalData: () => ({}),
});

const emit = defineEmits<{
	'update:model-value': [value: { value: string; segments: Segment[] }];
	'update:selection': [value: { state: EditorState; selection: SelectionRange }];
	focus: [];
}>();

// Set the mock data for our custom autocomplete
watch(() => props.additionalData, (data) => {
	setMockAutocompleteData(data);
}, { immediate: true, deep: true });

const root = ref<HTMLElement>();

// Create custom extensions with our autocomplete
const extensions = computed(() => [
	Prec.highest(keymap.of(editorKeymap)),
	n8nLang(),
	// Use our custom autocomplete instead of n8n's store-based one
	autocompletion({
		override: [customDollarCompletions],
		icons: false,
		aboveCursor: true,
		closeOnBlur: false,
	}),
	inputTheme({ isReadOnly: props.isReadOnly, rows: props.rows }),
	history(),
	dropCursor(), // Native CodeMirror drop cursor - provides visual feedback
	expressionCloseBrackets(),
	EditorView.lineWrapping,
	infoBoxTooltips(),
	// Handle drop at CodeMirror level - do the insertion here with direct view access
	EditorView.domEventHandlers({
		drop: (event, view) => {
			console.log('[CODEMIRROR] domEventHandler.drop called', {
				clientX: event.clientX,
				clientY: event.clientY,
				target: event.target
			});

			event.preventDefault();
			event.stopPropagation();

			const value = event.dataTransfer?.getData('text/plain');
			if (!value) {
				console.log('[CODEMIRROR] No value to drop');
				return true;
			}

			// Get position HERE where we have guaranteed view access
			const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
			console.log('[CODEMIRROR] Position at coords:', pos);

			if (pos !== null) {
				console.log('[CODEMIRROR] Dispatching insert at', pos);
				view.dispatch({
					changes: { from: pos, insert: value },
					selection: { anchor: pos + value.length },
					userEvent: 'input.drop',
				});
				console.log('[CODEMIRROR] After insert, doc:', view.state.doc.toString());
			}

			return true; // We handled it
		},
	}),
]);

const editorValue = computed(() => props.modelValue);

const {
	editor: editorRef,
	segments,
	selection,
	readEditorValue,
	setCursorPosition,
	hasFocus,
	focus,
} = useExpressionEditor({
	editorRef: root,
	editorValue,
	extensions,
	disableSearchDialog: true,
	isReadOnly: computed(() => props.isReadOnly),
	autocompleteTelemetry: { enabled: true, parameterPath: props.path },
	additionalData: props.additionalData,
});

// Handle drag and drop
function handleDragOver(event: DragEvent) {
	console.log('[DRAG] handleDragOver', { clientX: event.clientX, clientY: event.clientY });
	event.preventDefault();
	event.dataTransfer!.dropEffect = 'copy';
}

function handleDrop(event: DragEvent) {
	console.log('[DROP] handleDrop START', {
		clientX: event.clientX,
		clientY: event.clientY,
		target: event.target,
		currentTarget: event.currentTarget
	});

	event.preventDefault();

	const value = event.dataTransfer?.getData('text/plain');
	console.log('[DROP] Got value:', value);

	if (!value || !editorRef.value) {
		console.log('[DROP] Early return - no value or no editor');
		return;
	}

	// Get the drop position
	const view = editorRef.value;
	const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
	console.log('[DROP] Drop position:', pos);
	console.log('[DROP] Current doc content:', view.state.doc.toString());

	// Insert the value at the drop position
	console.log('[DROP] Dispatching insert at position', pos);
	view.dispatch({
		changes: { from: pos, insert: value },
		selection: { anchor: pos + value.length },
		userEvent: 'input.drop',
	});

	console.log('[DROP] After dispatch, doc content:', view.state.doc.toString());
	setTimeout(() => view.focus());
}

// Expose the drop handler to parent
defineExpose({
	focus,
	setCursorPosition,
	handleDrop,
});

watch(segments.display, (newSegments) => {
	emit('update:model-value', {
		value: '=' + readEditorValue(),
		segments: newSegments,
	});
});

watch(selection, (newSelection: SelectionRange) => {
	if (editorRef.value) {
		emit('update:selection', {
			state: editorRef.value.state,
			selection: newSelection,
		});
	}
});

watch(hasFocus, (focused) => {
	if (focused) emit('focus');
});
</script>

<template>
	<div
		ref="root"
		class="standalone-expression-editor"
		@dragover="handleDragOver"
		@drop="handleDrop"
	></div>
</template>

<style lang="scss" scoped>
.standalone-expression-editor {
	:deep(.cm-editor) {
		background: #1a202c !important;
		font-size: var(--font-size--2xs) !important; // 12px - matches n8n
		letter-spacing: 0 !important;
	}

	:deep(.cm-content) {
		color: #cbd5e0 !important; // Softer gray, not bright white
		font-family: var(--font-family--monospace) !important;
	}

	:deep(.cm-line) {
		color: #cbd5e0 !important; // Softer gray
		padding: 0 !important;
	}

	:deep(.cm-scroller) {
		line-height: 1.68 !important; // Matches n8n exactly
	}
}
</style>
