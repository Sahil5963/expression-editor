import React, { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap, dropCursor } from '@codemirror/view';
import { EditorState, Prec, type SelectionRange } from '@codemirror/state';
import { history } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import type { IDataObject } from '@/types/workflow';
import type { Segment } from '@/types/expressions';

import { useExpressionEditor } from '@/lib/hooks/useExpressionEditor';
import { n8nLang } from '@/lib/codemirror-plugins/n8nLang';
import { editorKeymap } from '@/lib/codemirror-plugins/keymap';
import { inputTheme } from '@/lib/theme/theme';
import { expressionCloseBrackets } from '@/lib/codemirror-plugins/expressionCloseBrackets';
import { infoBoxTooltips } from '@/lib/codemirror-plugins/tooltips/InfoBoxTooltip';
import { customDollarCompletions, setMockAutocompleteData } from './customAutocomplete';
import './ExpressionEditor.module.scss';

export interface ExpressionEditorProps {
	value: string;
	onChange: (data: { value: string; segments: Segment[] }) => void;
	onSelectionChange?: (data: { state: EditorState; selection: SelectionRange }) => void;
	onFocus?: () => void;
	path?: string;
	rows?: number;
	readOnly?: boolean;
	additionalData?: IDataObject;
	placeholder?: string;
	className?: string;
}

export interface ExpressionEditorRef {
	focus: () => void;
	setCursorPosition: (position: 'lastExpression' | number) => void;
	handleDrop: (event: React.DragEvent) => void;
}

export const ExpressionEditor = forwardRef<ExpressionEditorRef, ExpressionEditorProps>(
	(props, ref) => {
		const {
			value,
			onChange,
			onSelectionChange,
			onFocus,
			path = 'expression',
			rows = 5,
			readOnly = false,
			additionalData = {},
			className = '',
		} = props;

		// Update mock autocomplete data when additionalData changes
		useEffect(() => {
			setMockAutocompleteData(additionalData);
		}, [additionalData]);

		// Create custom extensions
		const extensions = React.useMemo(
			() => [
				Prec.highest(keymap.of(editorKeymap)),
				n8nLang(),
				// Use our custom autocomplete
				autocompletion({
					override: [customDollarCompletions],
					icons: false,
					aboveCursor: true,
					closeOnBlur: false,
				}),
				inputTheme({ isReadOnly: readOnly, rows }),
				history(),
				dropCursor(),
				expressionCloseBrackets(),
				EditorView.lineWrapping,
				infoBoxTooltips(),
			],
			[readOnly, rows],
		);

		const {
			editorRef,
			editor,
			segments,
			selection,
			hasFocus,
			readEditorValue,
			setCursorPosition,
			focus,
		} = useExpressionEditor({
			value: value.replace(/^=/, ''), // Remove leading '=' if present
			extensions,
			additionalData,
			isReadOnly: readOnly,
			autocompleteTelemetry: { enabled: true, parameterPath: path },
			onDocChange: (content: string) => {
				// Emit update on every document change for real-time sync
				onChange({
					value: '=' + content,
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
		});

		// Handle drag over
		const handleDragOver = useCallback((event: React.DragEvent) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		}, []);

		// Handle drop
		const handleDrop = useCallback(
			(event: React.DragEvent) => {
				event.preventDefault();

				const dragValue = event.dataTransfer?.getData('text/plain');

				if (!dragValue || !editor) {
					return;
				}

				// Get the drop position
				const pos = editor.posAtCoords(
					{ x: event.clientX, y: event.clientY },
					false,
				);

				if (pos !== null) {
					// Insert the value at the drop position
					editor.dispatch({
						changes: { from: pos, insert: dragValue },
						selection: { anchor: pos + dragValue.length },
						userEvent: 'input.drop',
					});

					setTimeout(() => editor.focus());
				}
			},
			[editor],
		);

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				focus,
				setCursorPosition,
				handleDrop,
			}),
			[focus, setCursorPosition, handleDrop],
		);

		return (
			<div
				ref={editorRef}
				className={`expression-editor ${className}`}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			/>
		);
	},
);

ExpressionEditor.displayName = 'ExpressionEditor';
