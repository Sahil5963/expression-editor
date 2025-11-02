import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { IDataObject } from '@/types/workflow';

/**
 * Custom autocomplete for standalone Expression Playground
 * This reads from provided data instead of Pinia stores
 */

let mockData: IDataObject = {};

export function setMockAutocompleteData(data: IDataObject) {
	mockData = data;
	console.log('📝 Custom autocomplete data set:', mockData);
}

function getNestedValue(obj: any, path: string): any {
	const parts = path.split('.');
	let current = obj;

	for (const part of parts) {
		if (current && typeof current === 'object' && part in current) {
			current = current[part];
		} else {
			return undefined;
		}
	}

	return current;
}

function getCompletionsForObject(obj: any): Completion[] {
	if (!obj || typeof obj !== 'object') return [];

	const completions: Completion[] = [];

	for (const key of Object.keys(obj)) {
		const value = obj[key];
		const type = Array.isArray(value) ? 'array' : typeof value;

		completions.push({
			label: key,
			type: type,
			info: typeof value === 'object' && !Array.isArray(value)
				? `Object with ${Object.keys(value).length} properties`
				: Array.isArray(value)
				? `Array with ${value.length} items`
				: `${type}: ${String(value).substring(0, 50)}`,
		});
	}

	return completions;
}

/**
 * Custom dollar completions for $json, $input, etc.
 */
export function customDollarCompletions(context: CompletionContext): CompletionResult | null {
	const word = context.matchBefore(/\$[\w.]*/);

	if (!word) return null;
	if (word.from === word.to && !context.explicit) return null;

	const text = word.text;
	console.log('🔍 Autocomplete triggered for:', text);

	// Just typed $
	if (text === '$') {
		const rootCompletions: Completion[] = Object.keys(mockData).map(key => {
			// Remove leading $ if it exists in the key
			const cleanKey = key.startsWith('$') ? key.substring(1) : key;
			return {
				label: `$${cleanKey}`,
				type: 'variable',
				info: `Root variable: ${cleanKey}`,
			};
		});

		console.log('✅ Showing root completions:', rootCompletions.map(c => c.label));

		return {
			from: word.from,
			options: rootCompletions,
		};
	}

	// Typed $json. or $input.something.
	if (text.includes('.')) {
		const parts = text.substring(1).split('.'); // Remove $ and split
		const rootKey = parts[0]; // e.g., "json"
		const path = parts.slice(1, -1).join('.'); // e.g., "address.coordinates"
		const incomplete = parts[parts.length - 1]; // Current typing

		console.log('🔎 Nested lookup:', { rootKey, path, incomplete });

		// Get the object we're completing from
		// Try with $ prefix first, then without
		let targetObj = mockData[`$${rootKey}`] || mockData[rootKey];

		if (path) {
			targetObj = getNestedValue(targetObj, path);
		}

		console.log('📦 Target object:', targetObj);

		if (!targetObj || typeof targetObj !== 'object') {
			console.log('❌ No object found at path');
			return null;
		}

		const completions = getCompletionsForObject(targetObj);

		// Filter by what user is typing
		const filtered = incomplete
			? completions.filter(c => c.label.toLowerCase().startsWith(incomplete.toLowerCase()))
			: completions;

		console.log('✅ Showing nested completions:', filtered.map(c => c.label));

		if (filtered.length === 0) return null;

		return {
			from: word.to - incomplete.length,
			options: filtered,
		};
	}

	// Typed $json (no dot yet)
	if (text.startsWith('$') && text.length > 1) {
		const typed = text.substring(1);
		const rootCompletions: Completion[] = Object.keys(mockData)
			.map(key => {
				// Remove leading $ if it exists in the key
				const cleanKey = key.startsWith('$') ? key.substring(1) : key;
				return { cleanKey, originalKey: key };
			})
			.filter(({ cleanKey }) => cleanKey.toLowerCase().startsWith(typed.toLowerCase()))
			.map(({ cleanKey }) => ({
				label: `$${cleanKey}`,
				type: 'variable',
				info: `Root variable: ${cleanKey}`,
			}));

		console.log('✅ Showing filtered root completions:', rootCompletions.map(c => c.label));

		if (rootCompletions.length === 0) return null;

		return {
			from: word.from,
			options: rootCompletions,
		};
	}

	return null;
}
