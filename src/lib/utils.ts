/**
 * Utility functions for standalone operation
 */

export const unwrapExpression = (expr: string) => {
	return expr.replace(/^={{|}}$/g, '').trim();
};

export const sanitizeHtml = (html: string) => {
	const div = document.createElement('div');
	div.textContent = html;
	return div.innerHTML;
};

export const getMappedExpression = () => null;

export const getExpressionErrorMessage = (error: any, hasRunData?: boolean) => {
	if (error?.message) return error.message;
	return String(error);
};

export const getResolvableState = (error: any, isAutocompleting?: boolean) => {
	if (error) return 'invalid' as const;
	if (isAutocompleting) return 'pending' as const;
	return 'valid' as const;
};

export const isEventTargetContainedBy = (target: EventTarget | null, container: HTMLElement | null | undefined) => {
	if (!target || !container) return false;
	return container.contains(target as Node);
};

export const escapeMappingString = (str: string) => {
	return str.replace(/[\[\]'"]/g, '\\$&');
};
