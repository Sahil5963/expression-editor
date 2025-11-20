import type { DecorationSet } from '@codemirror/view';
import { EditorView, Decoration } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';

// Stub for Sentry - just log to console in standalone mode
const captureException = (error: Error) => {
};

import type {
	ColoringStateEffect,
	Plaintext,
	Resolvable,
	ResolvableState,
} from '@/types/expressions';

const cssClasses = {
	validResolvable: 'cm-valid-resolvable',
	invalidResolvable: 'cm-invalid-resolvable',
	pendingResolvable: 'cm-pending-resolvable',
	unresolvedResolvable: 'cm-unresolved-resolvable',
	plaintext: 'cm-plaintext',
};

const resolvablesTheme = EditorView.theme({
	['.' + cssClasses.validResolvable]: {
		color: 'var(--expression-editor--resolvable--color--foreground--valid)',
		backgroundColor: 'var(--expression-editor--resolvable--color--background--valid)',
		padding: '2px 3px',
		borderRadius: '3px',
		fontWeight: '500',
		display: 'inline-block',
	},
	['.' + cssClasses.invalidResolvable]: {
		color: 'var(--expression-editor--resolvable--color--foreground--invalid)',
		backgroundColor: 'var(--expression-editor--resolvable--color--background--invalid)',
		padding: '2px 3px',
		borderRadius: '3px',
		fontWeight: '500',
		display: 'inline-block',
	},
	['.' + cssClasses.pendingResolvable]: {
		color: 'var(--expression-editor--resolvable--color--foreground--pending)',
		backgroundColor: 'var(--expression-editor--resolvable--color--background--pending)',
		padding: '2px 3px',
		borderRadius: '3px',
		fontWeight: '500',
		display: 'inline-block',
	},
	['.' + cssClasses.unresolvedResolvable]: {
		color: 'var(--expression-editor--resolvable--color--foreground--unresolved)',
		backgroundColor: 'var(--expression-editor--resolvable--color--background--unresolved)',
		padding: '2px 3px',
		borderRadius: '3px',
		fontWeight: '500',
		display: 'inline-block',
	},
});

const resolvableStateToDecoration: Record<ResolvableState, Decoration> = {
	valid: Decoration.mark({ class: cssClasses.validResolvable }),
	invalid: Decoration.mark({ class: cssClasses.invalidResolvable }),
	pending: Decoration.mark({ class: cssClasses.pendingResolvable }),
	unresolved: Decoration.mark({ class: cssClasses.unresolvedResolvable }),
};

const coloringStateEffects = {
	addColorEffect: StateEffect.define<ColoringStateEffect.Value>({
		map: ({ from, to, kind, state }, change) => ({
			from: change.mapPos(from),
			to: change.mapPos(to),
			kind,
			state,
		}),
	}),
	removeColorEffect: StateEffect.define<ColoringStateEffect.Value>({
		map: ({ from, to }, change) => ({
			from: change.mapPos(from),
			to: change.mapPos(to),
		}),
	}),
};

const coloringStateField = StateField.define<DecorationSet>({
	provide: (stateField) => EditorView.decorations.from(stateField),
	create() {
		return Decoration.none;
	},
	update(colorings, transaction) {
		try {
			const initialSize = colorings.size;
			colorings = colorings.map(transaction.changes); // recalculate positions for new doc


			for (const txEffect of transaction.effects) {
				if (txEffect.is(coloringStateEffects.removeColorEffect)) {
					const beforeSize = colorings.size;
					colorings = colorings.update({
						filter: (from, to) => txEffect.value.from !== from && txEffect.value.to !== to,
					});
				}

				if (txEffect.is(coloringStateEffects.addColorEffect)) {
					const beforeSize = colorings.size;
					// First filter out any existing decoration at the same position
					colorings = colorings.update({
						filter: (from, to) => txEffect.value.from !== from && txEffect.value.to !== to,
					});

					const decoration = resolvableStateToDecoration[txEffect.value.state ?? 'pending'];

					if (txEffect.value.from === 0 && txEffect.value.to === 0) {
						continue;
					}

					colorings = colorings.update({
						add: [decoration.range(txEffect.value.from, txEffect.value.to)],
					});
				}
			}

		} catch (error) {
			captureException(error);
		}

		return colorings;
	},
});

function addColor(view: EditorView, segments: Resolvable[]) {

	const effects: Array<StateEffect<unknown>> = segments.map(({ from, to, kind, state }) =>
		coloringStateEffects.addColorEffect.of({ from, to, kind, state }),
	);

	if (effects.length === 0) {
		return;
	}

	const hasField = !!view.state.field(coloringStateField, false);

	if (!hasField) {
		effects.push(StateEffect.appendConfig.of([coloringStateField, resolvablesTheme]));
	}

	view.dispatch({ effects });
}

function removeColor(view: EditorView, segments: Plaintext[]) {

	const effects: Array<StateEffect<unknown>> = segments.map(({ from, to }) =>
		coloringStateEffects.removeColorEffect.of({ from, to }),
	);

	if (effects.length === 0) {
		return;
	}

	const hasField = !!view.state.field(coloringStateField, false);

	if (!hasField) {
		effects.push(StateEffect.appendConfig.of([coloringStateField, resolvablesTheme]));
	}

	view.dispatch({ effects });
}

const resolvableStyle = syntaxHighlighting(
	HighlightStyle.define([
		{
			tag: tags.content,
			class: cssClasses.plaintext,
		},
		/**
		 * CSS classes for valid and invalid resolvables
		 * dynamically applied based on state fields
		 */
	]),
);

export const highlighter = {
	addColor,
	removeColor,
	resolvableStyle,
};
