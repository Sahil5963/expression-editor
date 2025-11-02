/**
 * Minimal n8n-workflow types for standalone operation
 */

export type IDataObject = Record<string, any>;

export type DocMetadata = {
	name: string;
	returnType: string;
	description?: string;
	args?: DocMetadataArgument[];
	examples?: DocMetadataExample[];
	section?: string;
	hidden?: boolean;
	aliases?: string[];
};

export type DocMetadataArgument = {
	name: string;
	type: string;
	optional?: boolean;
	description?: string;
	default?: string | number | boolean;
};

export type DocMetadataExample = {
	example: string;
	evaluated?: string;
	description?: string;
};

export type NativeDoc = {
	typeName?: string;
	properties: Record<string, DocMetadata>;
};

export enum NodeConnectionTypes {
	Main = 'main',
}

export type CodeExecutionMode = 'runOnceForAllItems' | 'runOnceForEachItem';

export type INodeExecutionData = {
	json: IDataObject;
	binary?: IDataObject;
};
