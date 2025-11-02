/**
 * Stub implementations for n8n dependencies
 * These replace Pinia stores and other n8n-specific modules
 */

// Mock i18n
export const useI18n = () => ({
	locale: { value: 'en' },
	baseText: (key: string) => key, // Just return the key as-is
});

// Mock device support
export const useDeviceSupport = () => ({
	isMacOs: /Mac|iPod|iPhone|iPad/.test(navigator.platform),
});

// Mock workflow helpers
export const useWorkflowHelpers = () => ({
	// Add any needed helper methods here
});

// Mock stores
export const useNDVStore = () => ({
	// Mock NDV store methods
});

export const useWorkflowsStore = () => ({
	// Mock workflows store methods
});

// Mock autocomplete telemetry
export const useAutocompleteTelemetry = () => ({
	// Mock telemetry methods
});

// Mock constants
export const EXPRESSION_EDITOR_PARSER_TIMEOUT = 1000;
export const ExpressionLocalResolveContextSymbol = Symbol('ExpressionLocalResolveContext');

// Mock HTML utils
export const isEventTargetContainedBy = (target: EventTarget | null, container: HTMLElement | null) => {
	if (!target || !container) return false;
	return container.contains(target as Node);
};

// Mock force parse
export const ignoreUpdateAnnotation = () => null;

// Mock expression utils
export const getExpressionErrorMessage = (error: Error) => error.message;
export const getResolvableState = () => 'valid' as const;

// Mock resolveParameter (workflow helper)
export const resolveParameter = (expression: string, context?: unknown) => {
	// Simple stub - just return undefined for autocomplete
	// In real n8n this would evaluate the expression
	return undefined;
};

// Mock UI store
export const useUIStore = () => ({
	modalsById: {},
});
