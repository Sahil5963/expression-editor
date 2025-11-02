import {
	closeBrackets,
	closeBracketsKeymap,
	startCompletion,
	type CloseBracketConfig,
} from '@codemirror/autocomplete';
import { EditorSelection, Text } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

const expressionBracketSpacing = EditorView.updateListener.of((update) => {
	if (!update.changes || update.changes.empty) return;

	// {{|}} --> {{|}} (no spacing by default)
	update.changes.iterChanges((_fromA, _toA, fromB, toB, inserted) => {
		const doc = update.state.doc;
		if (
			inserted.eq(Text.of(['{}'])) &&
			doc.sliceString(fromB - 1, fromB) === '{' &&
			doc.sliceString(toB, toB + 1) === '}'
		) {
			// Don't add spacing - just trigger autocomplete
			startCompletion(update.view);
		}
	});
});

export const expressionCloseBracketsConfig: CloseBracketConfig = {
	brackets: ['{', '(', '"', "'", '['],
	// <> so bracket completion works in HTML tags
	before: ')]}:;<>\'"',
};

export const expressionCloseBrackets = () => [
	expressionBracketSpacing,
	closeBrackets(),
	keymap.of(closeBracketsKeymap),
];
