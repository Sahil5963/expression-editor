<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { EditorView, keymap, dropCursor } from '@codemirror/view';
import { EditorState, Prec, type SelectionRange, EditorSelection } from '@codemirror/state';
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
	dropCursor(), // Native CodeMirror drop cursor for visual feedback
	EditorView.domEventHandlers({
		drop: () => true, // Disable CodeMirror's built-in drop handling
	}),
	expressionCloseBrackets(),
	EditorView.lineWrapping,
	infoBoxTooltips(),
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
	event.preventDefault();
	event.dataTransfer!.dropEffect = 'copy';
}

function handleDrop(event: DragEvent) {
	event.preventDefault();
	event.stopPropagation(); // Prevent CodeMirror's default drop handling

	const value = event.dataTransfer?.getData('text/plain');
	if (!value || !editorRef.value) return;

	// Get the drop position
	const view = editorRef.value;
	const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);

	// Insert the value at the drop position
	const changes = view.state.changes({ from: pos, insert: value });
	const anchor = changes.mapPos(pos, -1);
	const head = changes.mapPos(pos, 1);
	const selectionRange = EditorSelection.single(anchor, head);

	view.dispatch({
		changes,
		selection: selectionRange,
		userEvent: 'input.drop',
	});

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
		color: #e2e8f0 !important;
	}

	:deep(.cm-content) {
		color: #e2e8f0 !important;
	}

	:deep(.cm-line) {
		color: #e2e8f0 !important;
	}
}
</style>
