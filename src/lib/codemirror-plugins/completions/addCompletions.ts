import { ifIn } from '@codemirror/autocomplete';
import { datatypeCompletions } from './datatype.completions';

/**
 * Completion sources for n8n expressions
 * Most n8n-specific completions have been removed as they were dead code
 * Only the datatype completions stub remains for compatibility
 */
export function n8nCompletionSources() {
	return [
		datatypeCompletions,
	].map((source) => ({
		autocomplete: ifIn(['Resolvable'], source),
	}));
}
