import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { IDataObject } from '@/types/workflow';

/**
 * Custom autocomplete for standalone Expression Playground
 * This reads from provided data instead of Pinia stores
 */

let mockData: IDataObject = {};

export function setMockAutocompleteData(data: IDataObject) {
	mockData = data;
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

function getCompletionsForObject(obj: any, parentPath?: string): Completion[] {
	if (!obj || typeof obj !== 'object') return [];

	const completions: Completion[] = [];

	for (const key of Object.keys(obj)) {
		const value = obj[key];
		const type = Array.isArray(value) ? 'array' : typeof value;
		const fullPath = parentPath ? `${parentPath}.${key}` : key;

		// Create custom info content
		let infoContent: string;
		if (typeof value === 'object' && !Array.isArray(value)) {
			const propCount = Object.keys(value).length;
			const preview = Object.keys(value).slice(0, 3).join(', ');
			infoContent = `📦 Object (${propCount} ${propCount === 1 ? 'property' : 'properties'})\n\nProperties: ${preview}${propCount > 3 ? '...' : ''}`;
		} else if (Array.isArray(value)) {
			const preview = value.length > 0 ? `\n\nFirst item: ${JSON.stringify(value[0]).substring(0, 50)}` : '';
			infoContent = `📚 Array (${value.length} ${value.length === 1 ? 'item' : 'items'})${preview}`;
		} else if (typeof value === 'string') {
			infoContent = `📝 String\n\nValue: "${value.substring(0, 100)}"${value.length > 100 ? '...' : ''}`;
		} else if (typeof value === 'number') {
			infoContent = `🔢 Number\n\nValue: ${value}`;
		} else if (typeof value === 'boolean') {
			infoContent = `✓ Boolean\n\nValue: ${value}`;
		} else {
			infoContent = `${type}\n\nValue: ${String(value).substring(0, 100)}`;
		}

		completions.push({
			label: key,
			type: type,
			info: infoContent,
			detail: `${type}`, // Shows next to the label
		});
	}

	return completions;
}

/**
 * Custom completions for variables (without $ prefix requirement)
 */
export function customDollarCompletions(context: CompletionContext): CompletionResult | null {
	// Match any word with dots (e.g., "json", "json.name", "user.address.city")
	const word = context.matchBefore(/[\w.]*/);

	if (!word) return null;
	if (word.from === word.to && !context.explicit) return null;

	const text = word.text;

	// Empty or just starting - show all root variables
	if (text === '' || context.explicit) {
		const rootCompletions: Completion[] = Object.keys(mockData).map(key => {
			return {
				label: key,
				type: 'variable',
				info: `Root variable: ${key}`,
			};
		});


		return {
			from: word.from,
			options: rootCompletions,
		};
	}

	// Typed "json." or "user.address."
	if (text.includes('.')) {
		const parts = text.split('.');
		const rootKey = parts[0]; // e.g., "json"
		const path = parts.slice(1, -1).join('.'); // e.g., "address"
		const incomplete = parts[parts.length - 1]; // Current typing


		// Get the object we're completing from
		let targetObj = mockData[rootKey];

		if (path) {
			targetObj = getNestedValue(targetObj, path);
		}


		if (!targetObj || typeof targetObj !== 'object') {
			return null;
		}

		const completions = getCompletionsForObject(targetObj);

		// Filter by what user is typing
		const filtered = incomplete
			? completions.filter(c => c.label.toLowerCase().startsWith(incomplete.toLowerCase()))
			: completions;


		if (filtered.length === 0) return null;

		return {
			from: word.to - incomplete.length,
			options: filtered,
		};
	}

	// Typed "json" (no dot yet) - filter root completions
	if (text.length > 0) {
		const rootCompletions: Completion[] = Object.keys(mockData)
			.filter(key => key.toLowerCase().startsWith(text.toLowerCase()))
			.map(key => ({
				label: key,
				type: 'variable',
				info: `Root variable: ${key}`,
			}));


		if (rootCompletions.length === 0) return null;

		return {
			from: word.from,
			options: rootCompletions,
		};
	}

	return null;
}
