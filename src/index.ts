/**
 * @n8n/react-expression-editor
 *
 * React package for n8n Expression Editor with full autocomplete and CodeMirror support
 */

// Import base styles that should be included in the package
import './styles/variables.css';
import './styles/autocomplete.css';

export { ExpressionEditor, type ExpressionEditorProps, type ExpressionEditorRef } from './components/ExpressionEditor';
export { useExpressionEditor, type UseExpressionEditorOptions, type UseExpressionEditorReturn } from './lib/hooks/useExpressionEditor';
export type { IDataObject } from './types/workflow';
export type { Segment } from './types/expressions';
