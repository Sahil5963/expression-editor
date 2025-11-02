// Minimal n8n-workflow types needed for standalone operation
export type IDataObject = Record<string, any>;

export interface Basic {
	name?: string;
	value?: any;
}
