import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

/**
 * Autocomplete provider function type
 * Takes a CompletionContext and returns CompletionResult or null
 */
export type AutocompleteProvider = (context: CompletionContext) => CompletionResult | null;

/**
 * Autocomplete data schema
 * Simple key-value object where values can be nested objects, arrays, primitives, etc.
 */
export interface AutocompleteData {
	[key: string]: any;
}
