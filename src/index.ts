/**
 * react-dynamic-expression-editor
 *
 * A powerful React component for expression editing with autocomplete,
 * syntax highlighting, and customizable theming. Zero CSS imports required!
 *
 * @example
 * ```tsx
 * import { ExpressionEditor } from 'react-dynamic-expression-editor';
 *
 * function App() {
 *   const [expr, setExpr] = useState('');
 *   return (
 *     <ExpressionEditor
 *       value={expr}
 *       onChange={({ value }) => setExpr(value)}
 *     />
 *   );
 * }
 * ```
 */

// Main component
export { ExpressionEditor } from './components/ExpressionEditor';
export type {
	ExpressionEditorProps,
	ExpressionEditorRef,
	SelectionInfo,
} from './components/ExpressionEditor';

// Hooks
export { useExpressionEditor } from './lib/hooks/useExpressionEditor';
export type {
	UseExpressionEditorOptions,
	UseExpressionEditorReturn,
} from './lib/hooks/useExpressionEditor';

// Theme system
export { createEditorTheme, defaultTheme, darkTheme, lightTheme, n8nTheme } from './lib/theme';
export { EDITOR_CLASS_NAMES, CSS_VARIABLES } from './lib/theme';
export type {
	ThemeConfig,
	ThemeColors,
	ThemeTypography,
	ThemeSpacing,
	ThemeBorder,
} from './lib/theme';

// Autocomplete system
export { createDefaultAutocompleteProvider } from './lib/autocomplete';
export type { AutocompleteProvider, AutocompleteData } from './lib/autocomplete';

// Types
export type { IDataObject } from './types/workflow';
export type { Segment } from './types/expressions';
