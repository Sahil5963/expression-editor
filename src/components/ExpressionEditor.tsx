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
import '@/styles/variables.css';
import '@/styles/autocomplete.css';
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
			() => {
				const isSingleLine = rows === 1;

				return [
					Prec.highest(keymap.of(editorKeymap)),
					n8nLang(),
					// Block Enter key for single-line inputs
					...(isSingleLine
						? [
								Prec.highest(
									keymap.of([
										{
											key: 'Enter',
											run: () => true, // Block Enter key
										},
									]),
								),
						  ]
						: []),
					// Use our custom autocomplete
					autocompletion({
						override: [customDollarCompletions],
						icons: false,
						aboveCursor: true,
						closeOnBlur: false,
					}),
					inputTheme({ isReadOnly: readOnly, rows }),
					history(),
					dropCursor(), // Native CodeMirror drop cursor - provides visual feedback
					expressionCloseBrackets(),
					// Only enable line wrapping for multi-line inputs
					...(isSingleLine ? [] : [EditorView.lineWrapping]),
					infoBoxTooltips(),
					// Handle drop at CodeMirror level - do the insertion here with direct view access
					EditorView.domEventHandlers({
						drop: (event, view) => {
							console.log('[CODEMIRROR] domEventHandler.drop called', {
								clientX: event.clientX,
								clientY: event.clientY,
								target: event.target,
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
				];
			},
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
			console.log('[REACT-DRAG] handleDragOver', {
				clientX: event.clientX,
				clientY: event.clientY,
			});
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		}, []);

		// Handle drop - This is a backup handler, CodeMirror handler should handle it first
		const handleDrop = useCallback(
			(event: React.DragEvent) => {
				console.log('[REACT-DROP] handleDrop START', {
					clientX: event.clientX,
					clientY: event.clientY,
					target: event.target,
					currentTarget: event.currentTarget,
				});

				event.preventDefault();
				event.stopPropagation();

				const dragValue = event.dataTransfer?.getData('text/plain');
				console.log('[REACT-DROP] Got value:', dragValue);

				if (!dragValue || !editor) {
					console.log('[REACT-DROP] Early return - no value or no editor');
					return;
				}

				// Get the drop position
				const pos = editor.posAtCoords({ x: event.clientX, y: event.clientY }, false);
				console.log('[REACT-DROP] Drop position:', pos);
				console.log('[REACT-DROP] Current doc content:', editor.state.doc.toString());

				if (pos !== null) {
					// Insert the value at the drop position
					console.log('[REACT-DROP] Dispatching insert at position', pos);
					editor.dispatch({
						changes: { from: pos, insert: dragValue },
						selection: { anchor: pos + dragValue.length },
						userEvent: 'input.drop',
					});
					console.log('[REACT-DROP] After dispatch, doc content:', editor.state.doc.toString());

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
