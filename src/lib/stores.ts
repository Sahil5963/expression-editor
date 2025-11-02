/**
 * Store stubs for standalone operation
 */

export const useNDVStore = () => ({
	hasInputData: false,
	isInputParentOfActiveNode: false,
	activeNode: null,
	ndvInputNodeName: '',
	ndvInputRunIndex: 0,
	ndvInputBranchIndex: 0,
	expressionTargetItem: null,
	isDraggableDragging: false,
	draggableType: null,
});

export const useEnvironmentsStore = () => ({
	allVariables: [],
});

export const useExternalSecretsStore = () => ({
	secretNames: [],
});

export const useWorkflowsStore = () => ({
	getWorkflowExecution: null,
	getWorkflowRunData: null,
	workflowExecutionData: null,
	getNodeByName: () => null,
	workflow: { nodes: [] },
	workflowObject: {
		getChildNodes: () => [],
		getParentNodesByDepth: () => [],
	},
});
