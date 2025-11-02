<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue';
import type { IDataObject } from '@/types/workflow';
import StandaloneExpressionEditor from '@/components/StandaloneExpressionEditor.vue';

/**
 * Expression Editor Playground - Isolated Testing Environment
 *
 * This is a standalone page that works without authentication or backend dependencies.
 * Comprehensive testing environment for all n8n expression editor types and features:
 * - Multiple editor variants (inline, multiline, readonly, large)
 * - Drag & drop variables
 * - Nested autocomplete with deep object structures
 * - Example expressions library
 * - Live output preview
 */

// Error boundary to catch any component errors
const componentError = ref<string | null>(null);
onErrorCaptured((err) => {
	componentError.value = err.message;
	console.error('Expression playground error:', err);
	return false; // Prevent error propagation
});

/**
 * IMPORTANT NOTE ABOUT AUTOCOMPLETE:
 *
 * n8n's expression editor autocomplete system is deeply integrated with Pinia stores
 * and the workflow execution context. The autocomplete completions directly query:
 * - workflowsStore.getWorkflowRunData() for execution data
 * - ndvStore for active node context
 * - Various other stores for workflow state
 *
 * The `additionalData` prop we pass to InlineExpressionEditorInput is ONLY used for
 * validation/resolution (checking if expressions are correct), NOT for autocomplete
 * suggestions.
 *
 * To make autocomplete work in this isolated playground, we would need to:
 * 1. Mock the entire Pinia store infrastructure
 * 2. Set up a fake workflow with nodes and connections
 * 3. Populate execution data in the correct nested structure
 * 4. Handle all the edge cases that the autocomplete system expects
 *
 * This is beyond the scope of a simple playground. The editor still provides:
 * ✅ Syntax highlighting
 * ✅ Real-time validation
 * ✅ Expression evaluation
 * ✅ Beautiful UI for testing editor configurations
 */

interface EditorDemo {
	id: string;
	title: string;
	description: string;
	defaultValue: string;
	rows: number;
	isReadOnly: boolean;
}

const editorDemos: EditorDemo[] = [
	{
		id: 'inline',
		title: 'Inline Expression Editor',
		description: 'Compact single-line editor for quick expressions',
		defaultValue: '{{ $json.name }}',
		rows: 1,
		isReadOnly: false,
	},
	{
		id: 'multiline',
		title: 'Multi-line Expression Editor',
		description: 'Full-featured editor with autocomplete, syntax highlighting, and drag-drop',
		defaultValue: '{{ $json.address.city }}\n{{ $json.email }}\n{{ $json.age }}',
		rows: 5,
		isReadOnly: false,
	},
	{
		id: 'complex',
		title: 'Complex Expression Editor',
		description: 'For advanced expressions with method calls and operations',
		defaultValue: '{{ $json.orders.map(order => order.product).join(", ") }}',
		rows: 3,
		isReadOnly: false,
	},
	{
		id: 'readonly',
		title: 'Read-only Expression Display',
		description: 'Display-only mode for showing computed or locked expressions',
		defaultValue: '{{ $json.metadata.tags.filter(tag => tag !== "premium") }}',
		rows: 2,
		isReadOnly: true,
	},
	{
		id: 'large',
		title: 'Large Text Area',
		description: 'For complex multi-line expressions with lots of space',
		defaultValue: `{{
  const user = $json;
  const fullAddress = \`\${user.address.street}, \${user.address.city}, \${user.address.state} \${user.address.zipCode}\`;
  return fullAddress;
}}`,
		rows: 10,
		isReadOnly: false,
	},
];

// State for each editor
const editorValues = ref<Record<string, string>>(
	editorDemos.reduce((acc, demo) => ({
		...acc,
		[demo.id]: demo.defaultValue,
	}), {}),
);

// Draggable state
const draggedItem = ref<string | null>(null);

// Comprehensive autocomplete data with nested structures
const autocompleteData = computed((): IDataObject => {
	const data = {
	$json: {
		name: 'John Doe',
		email: 'john@example.com',
		age: 30,
		verified: true,
		address: {
			street: '123 Main St',
			city: 'San Francisco',
			state: 'CA',
			zipCode: '94102',
			country: 'USA',
			coordinates: {
				lat: 37.7749,
				lng: -122.4194,
				accuracy: 10,
			},
		},
		orders: [
			{
				id: 1,
				product: 'Laptop',
				price: 1299.99,
				quantity: 1,
				date: '2024-01-15',
				status: 'delivered',
			},
			{
				id: 2,
				product: 'Mouse',
				price: 29.99,
				quantity: 2,
				date: '2024-01-20',
				status: 'pending',
			},
			{
				id: 3,
				product: 'Keyboard',
				price: 89.99,
				quantity: 1,
				date: '2024-01-22',
				status: 'shipped',
			},
		],
		metadata: {
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-15T10:30:00Z',
			tags: ['premium', 'active', 'verified'],
			preferences: {
				theme: 'dark',
				language: 'en',
				notifications: {
					email: true,
					sms: false,
					push: true,
				},
			},
		},
		stats: {
			totalOrders: 3,
			totalSpent: 1419.97,
			averageOrderValue: 473.32,
			lastOrderDate: '2024-01-22',
		},
	},
	$input: {
		first: () => ({ data: 'First item' }),
		last: () => ({ data: 'Last item' }),
		all: () => [{ data: 'Item 1' }, { data: 'Item 2' }],
		item: {
			json: {
				id: 123,
				name: 'Sample Item',
				nested: {
					value: 'deep value',
				},
			},
		},
	},
	$prevNode: {
		name: 'HTTP Request',
		outputIndex: 0,
		runIndex: 0,
		json: {
			statusCode: 200,
			body: {
				success: true,
				data: {
					userId: 456,
					username: 'testuser',
				},
			},
		},
	},
	$execution: {
		id: '123e4567-e89b-12d3-a456-426614174000',
		mode: 'manual',
		startedAt: '2024-01-15T10:00:00Z',
		resumeUrl: 'https://example.com/resume',
		customData: {
			userId: '12345',
			sessionId: 'abc-def-ghi',
			metadata: {
				source: 'web',
				campaign: 'winter-sale',
			},
		},
	},
	$workflow: {
		id: 'workflow-123',
		name: 'My Sample Workflow',
		active: true,
		tags: ['production', 'automated'],
		settings: {
			timezone: 'America/New_York',
			saveDataErrorExecution: 'all',
			saveDataSuccessExecution: 'all',
		},
	},
	$vars: {
		API_KEY: 'sk_test_1234567890',
		BASE_URL: 'https://api.example.com',
		MAX_RETRIES: 3,
		TIMEOUT: 30000,
		DEBUG: false,
		config: {
			database: {
				host: 'localhost',
				port: 5432,
				name: 'mydb',
			},
			cache: {
				enabled: true,
				ttl: 3600,
			},
		},
	},
	$now: new Date().toISOString(),
	$today: new Date().toISOString().split('T')[0],
	};
	console.log('Autocomplete data:', data);
	return data;
});

// Draggable variables
const draggableVariables = [
	{ path: '$json.name', description: 'User name' },
	{ path: '$json.email', description: 'User email' },
	{ path: '$json.address.city', description: 'City' },
	{ path: '$json.address.coordinates.lat', description: 'Latitude' },
	{ path: '$json.orders[0].product', description: 'First order product' },
	{ path: '$json.metadata.tags', description: 'User tags array' },
	{ path: '$json.stats.totalSpent', description: 'Total spent' },
	{ path: '$prevNode.json.body.data.userId', description: 'Previous node user ID' },
	{ path: '$execution.id', description: 'Execution ID' },
	{ path: '$workflow.name', description: 'Workflow name' },
	{ path: '$vars.API_KEY', description: 'API Key' },
	{ path: '$now', description: 'Current timestamp' },
];

// Example expressions by category
const exampleExpressions = [
	{
		category: 'Basic Access',
		examples: [
			{ label: 'Simple property', value: '{{ $json.name }}' },
			{ label: 'Nested property', value: '{{ $json.address.city }}' },
			{ label: 'Deep nesting', value: '{{ $json.address.coordinates.lat }}' },
			{ label: 'Array access', value: '{{ $json.orders[0].product }}' },
		],
	},
	{
		category: 'String Operations',
		examples: [
			{ label: 'String method', value: '{{ $json.email.includes("@") }}' },
			{ label: 'Template literal', value: '{{ `Hello, ${$json.name}!` }}' },
			{ label: 'String concat', value: '{{ $json.address.city + ", " + $json.address.state }}' },
			{ label: 'Uppercase', value: '{{ $json.name.toUpperCase() }}' },
		],
	},
	{
		category: 'Array Operations',
		examples: [
			{ label: 'Array length', value: '{{ $json.orders.length }}' },
			{ label: 'Array join', value: '{{ $json.metadata.tags.join(", ") }}' },
			{ label: 'Array map', value: '{{ $json.orders.map(o => o.product) }}' },
			{ label: 'Array filter', value: '{{ $json.orders.filter(o => o.price > 50) }}' },
		],
	},
	{
		category: 'Conditional Logic',
		examples: [
			{ label: 'Ternary operator', value: '{{ $json.age > 18 ? "Adult" : "Minor" }}' },
			{ label: 'Boolean check', value: '{{ $json.verified ? "✓ Verified" : "✗ Not verified" }}' },
			{ label: 'Null coalescing', value: '{{ $json.middleName || "N/A" }}' },
		],
	},
	{
		category: 'Math Operations',
		examples: [
			{ label: 'Sum', value: '{{ $json.stats.totalSpent + 100 }}' },
			{ label: 'Average', value: '{{ $json.stats.totalSpent / $json.stats.totalOrders }}' },
			{ label: 'Percentage', value: '{{ ($json.orders.length / 10 * 100).toFixed(2) + "%" }}' },
		],
	},
	{
		category: 'Complex Expressions',
		examples: [
			{
				label: 'Multi-line calculation',
				value: `{{
  const total = $json.orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
  return total.toFixed(2);
}}`,
			},
			{
				label: 'Formatted address',
				value: '{{ `${$json.address.street}\\n${$json.address.city}, ${$json.address.state} ${$json.address.zipCode}\\n${$json.address.country}` }}',
			},
		],
	},
];

// Methods
const handleEditorChange = (id: string, data: { value: string; segments: any[] }) => {
	editorValues.value[id] = data.value.replace(/^=/, '');
};

const resetEditor = (id: string) => {
	const demo = editorDemos.find(d => d.id === id);
	if (demo) {
		editorValues.value[id] = demo.defaultValue;
	}
};

const clearEditor = (id: string) => {
	editorValues.value[id] = '';
};

const applyExample = (editorId: string, value: string) => {
	editorValues.value[editorId] = value;
};

const handleDragStart = (event: DragEvent, item: string) => {
	draggedItem.value = item;
	// Set the data to be transferred
	event.dataTransfer!.effectAllowed = 'copy';
	event.dataTransfer!.setData('text/plain', `{{ ${item} }}`);
};

const handleDragEnd = () => {
	draggedItem.value = null;
};

// Helper to format variable path with expression syntax
const formatExpression = (path: string) => `{{ ${path} }}`;
</script>

<template>
	<div class="expression-playground">
		<!-- Error display -->
		<div v-if="componentError" class="error-banner">
			<strong>⚠️ Component Error:</strong> {{ componentError }}
			<button @click="componentError = null" class="dismiss-btn">Dismiss</button>
		</div>

		<!-- Header -->
		<header class="playground-header">
			<h1>n8n Expression Editor Playground</h1>
			<p class="subtitle">
				Standalone testing environment - No authentication required
			</p>
			<div class="feature-badges">
				<span class="badge">🎨 Syntax Highlighting</span>
				<span class="badge">💡 Autocomplete</span>
				<span class="badge">🔍 Nested Typing</span>
				<span class="badge">🖱️ Drag & Drop</span>
				<span class="badge">⌨️ Keyboard Shortcuts</span>
			</div>
		</header>

		<!-- Main layout -->
		<div class="playground-layout">
			<!-- Left sidebar - Draggable variables -->
			<aside class="sidebar">
				<h2>Draggable Variables</h2>
				<p class="sidebar-hint">
					Drag these into any editor below
				</p>
				<div class="draggable-list">
					<div
						v-for="variable in draggableVariables"
						:key="variable.path"
						:class="['draggable-item', { dragging: draggedItem === variable.path }]"
						draggable="true"
						@dragstart="handleDragStart($event, variable.path)"
						@dragend="handleDragEnd"
					>
						<code class="variable-path">{{ formatExpression(variable.path) }}</code>
						<span class="variable-desc">{{ variable.description }}</span>
					</div>
				</div>

				<div class="data-section">
					<h3>Available Data Structure</h3>
					<details>
						<summary>View JSON (click to expand)</summary>
						<pre class="data-preview">{{ JSON.stringify(autocompleteData, null, 2) }}</pre>
					</details>
				</div>
			</aside>

			<!-- Main content -->
			<main class="main-content">
				<!-- Editor demos section -->
				<section class="editors-section">
					<h2>Editor Types</h2>
					<p class="section-hint">
						💡 <strong>Standalone Expression Editor</strong> with custom autocomplete! Type <code v-text="'{{ $'"></code> to see root variables, or <code v-text="'{{ $json.'"></code> for nested properties.
						Features: syntax highlighting, validation, and full autocomplete from mock data!
					</p>

					<div
						v-for="demo in editorDemos"
						:key="demo.id"
						class="editor-demo"
					>
						<div class="demo-header">
							<div>
								<h3>{{ demo.title }}</h3>
								<p class="demo-description">{{ demo.description }}</p>
							</div>
							<div class="demo-controls">
								<button
									class="reset-btn"
									@click="resetEditor(demo.id)"
									title="Reset to default"
								>
									Reset
								</button>
								<button
									class="clear-btn"
									@click="clearEditor(demo.id)"
									title="Clear"
								>
									Clear
								</button>
							</div>
						</div>

						<div class="editor-wrapper">
							<StandaloneExpressionEditor
								:modelValue="editorValues[demo.id]"
								:path="`playground.${demo.id}`"
								:rows="demo.rows"
								:isReadOnly="demo.isReadOnly"
								:additionalData="autocompleteData"
								@update:model-value="handleEditorChange(demo.id, $event)"
							/>
						</div>

						<div class="editor-output">
							<strong>Current Value:</strong>
							<pre class="output-display">{{ editorValues[demo.id] }}</pre>
						</div>
					</div>
				</section>

				<!-- Example expressions section -->
				<section class="examples-section">
					<h2>Example Expressions</h2>
					<p class="section-hint">
						Click any example to apply it to the multi-line editor
					</p>

					<div
						v-for="category in exampleExpressions"
						:key="category.category"
						class="example-category"
					>
						<h3>{{ category.category }}</h3>
						<div class="example-grid">
							<button
								v-for="(example, idx) in category.examples"
								:key="idx"
								class="example-btn"
								@click="applyExample('multiline', example.value)"
								:title="example.value"
							>
								<span class="example-label">{{ example.label }}</span>
								<code class="example-preview">
									{{ example.value.length > 50 ? example.value.substring(0, 50) + '...' : example.value }}
								</code>
							</button>
						</div>
					</div>
				</section>

				<!-- Features showcase section -->
				<section class="features-section">
					<h2>Editor Features</h2>
					<div class="features-grid">
						<div class="feature-card">
							<h3>🔍 Autocomplete</h3>
							<p>Type <code v-text="'{{ $'"></code> to see all available variables</p>
							<p>Navigate nested objects with dot notation</p>
						</div>
						<div class="feature-card">
							<h3>🎨 Syntax Highlighting</h3>
							<p>Expression syntax <code v-text="'{{ ... }}'"></code> is highlighted</p>
							<p>JavaScript code within expressions is syntax-colored</p>
						</div>
						<div class="feature-card">
							<h3>🖱️ Drag & Drop</h3>
							<p>Drag variables from the sidebar into editors</p>
							<p>Variables automatically wrapped in expression syntax</p>
						</div>
						<div class="feature-card">
							<h3>⌨️ Keyboard Shortcuts</h3>
							<ul>
								<li><kbd>Ctrl</kbd>+<kbd>Space</kbd> - Trigger autocomplete</li>
								<li><kbd>Tab</kbd> - Accept suggestion</li>
								<li><kbd>Esc</kbd> - Close autocomplete</li>
								<li><kbd>Enter</kbd> - New line (multi-line mode)</li>
							</ul>
						</div>
						<div class="feature-card">
							<h3>📝 Smart Brackets</h3>
							<p>Auto-closing of brackets: <code>( ) [ ] { }</code></p>
							<p>Auto-wrapping of selected text</p>
						</div>
						<div class="feature-card">
							<h3>💡 Tooltips</h3>
							<p>Hover over variables to see their values</p>
							<p>Type information for nested objects</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.expression-playground {
	min-height: 100vh;
	background: #f5f5f5;
}

.error-banner {
	background: var(--color--danger--tint-3);
	border: 2px solid var(--color--danger);
	border-radius: var(--radius--lg);
	padding: var(--spacing--md);
	margin: var(--spacing--lg);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: var(--spacing--md);

	strong {
		color: var(--color--danger--shade-1);
	}

	.dismiss-btn {
		background: var(--color--danger);
		color: white;
		border: none;
		padding: var(--spacing--3xs) var(--spacing--sm);
		border-radius: var(--radius);
		cursor: pointer;
		font-size: var(--font-size--xs);

		&:hover {
			background: var(--color--danger--shade-1);
		}
	}
}

.playground-header {
	background: white;
	padding: var(--spacing--xl) var(--spacing--2xl);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	text-align: center;
	border-bottom: var(--border-width) var(--border-style) var(--color--foreground--tint-2);

	h1 {
		margin: 0;
		font-size: var(--font-size--2xl);
		color: var(--color--text--shade-1);
		font-weight: var(--font-weight--bold);
	}

	.subtitle {
		margin: var(--spacing--xs) 0 var(--spacing--lg);
		color: var(--color--text--tint-1);
		font-size: var(--font-size--md);
	}

	.feature-badges {
		display: flex;
		gap: var(--spacing--xs);
		justify-content: center;
		flex-wrap: wrap;

		.badge {
			background: var(--color--primary);
			color: white;
			padding: var(--spacing--3xs) var(--spacing--sm);
			border-radius: 20px;
			font-size: var(--font-size--xs);
			font-weight: var(--font-weight--bold);
		}
	}
}

.playground-layout {
	display: grid;
	grid-template-columns: 300px 1fr;
	gap: 0;
	min-height: calc(100vh - 200px);
}

/* Sidebar */
.sidebar {
	background: #2d3748;
	color: white;
	padding: var(--spacing--lg);
	overflow-y: auto;
	max-height: calc(100vh - 200px);
	border-right: 1px solid #1a202c;

	h2 {
		margin: 0 0 var(--spacing--xs);
		font-size: var(--font-size--lg);
		color: #e2e8f0;
	}

	.sidebar-hint {
		color: #cbd5e0;
		font-size: var(--font-size--xs);
		margin-bottom: var(--spacing--md);
	}

	.draggable-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing--xs);
		margin-bottom: var(--spacing--2xl);
	}

	.draggable-item {
		background: #4a5568;
		border: 2px dashed #718096;
		border-radius: var(--radius--lg);
		padding: var(--spacing--sm);
		cursor: move;
		transition: all 0.2s;

		&:hover {
			background: #5a6678;
			border-color: #a0aec0;
			transform: translateX(4px);
		}

		&.dragging {
			opacity: 0.5;
			transform: scale(0.95);
		}

		.variable-path {
			display: block;
			color: #fbbf24;
			font-family: var(--font-family);
			font-size: var(--font-size--xs);
			margin-bottom: var(--spacing--4xs);
			word-break: break-all;
		}

		.variable-desc {
			color: #cbd5e0;
			font-size: var(--font-size--2xs);
		}
	}

	.data-section {
		margin-top: var(--spacing--2xl);
		padding-top: var(--spacing--lg);
		border-top: 1px solid #4a5568;

		h3 {
			margin: 0 0 var(--spacing--md);
			font-size: var(--font-size--md);
			color: #e2e8f0;
		}

		details {
			background: #1a202c;
			border-radius: var(--radius--lg);
			padding: var(--spacing--sm);

			summary {
				cursor: pointer;
				color: #a0aec0;
				font-size: var(--font-size--xs);
				user-select: none;

				&:hover {
					color: #cbd5e0;
				}
			}

			.data-preview {
				margin-top: var(--spacing--sm);
				background: #0f1419;
				color: #10b981;
				padding: var(--spacing--sm);
				border-radius: var(--radius);
				overflow-x: auto;
				font-size: var(--font-size--2xs);
				line-height: var(--line-height--lg);
				max-height: 400px;
				overflow-y: auto;
			}
		}
	}
}

/* Main content */
.main-content {
	background: #4a5568;
	padding: var(--spacing--2xl);
	overflow-y: auto;
	max-height: calc(100vh - 200px);

	.section-hint {
		color: #e2e8f0;
		margin-bottom: var(--spacing--lg);
		font-size: var(--font-size--sm);

		code {
			background: #2d3748;
			padding: var(--spacing--4xs) var(--spacing--2xs);
			border-radius: var(--radius--sm);
			color: #fbbf24;
			font-family: var(--font-family);
			font-size: var(--font-size--sm);
		}
	}
}

/* Editor demos */
.editors-section {
	margin-bottom: var(--spacing--3xl);

	h2 {
		margin: 0 0 var(--spacing--md);
		font-size: var(--font-size--xl);
		color: #f7fafc;
	}

	.editor-demo {
		background: #2d3748;
		border: 2px solid #1a202c;
		border-radius: var(--radius--xl);
		padding: var(--spacing--lg);
		margin-bottom: var(--spacing--xl);

		.demo-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: var(--spacing--md);

			h3 {
				margin: 0;
				font-size: var(--font-size--lg);
				color: #e2e8f0;
			}

			.demo-description {
				color: #a0aec0;
				margin: var(--spacing--4xs) 0 0;
				font-size: var(--font-size--sm);
			}

			.demo-controls {
				display: flex;
				gap: var(--spacing--xs);

				button {
					background: #1a202c;
					border: 1px solid #4a5568;
					padding: var(--spacing--3xs) var(--spacing--sm);
					border-radius: var(--radius);
					cursor: pointer;
					font-size: var(--font-size--xs);
					color: #e2e8f0;
					transition: all 0.2s;

					&.reset-btn:hover {
						background: #667eea;
						color: white;
						border-color: #667eea;
					}

					&.clear-btn:hover {
						background: #f56565;
						color: white;
						border-color: #f56565;
					}
				}
			}
		}

		.editor-wrapper {
			margin-bottom: var(--spacing--md);

			// Style the expression editor inputs to match dark theme
			:deep(.inline-expression-editor-input) {
				background: #1a202c !important;
				color: #e2e8f0 !important;
				border-color: #4a5568 !important;
			}

			:deep(.cm-editor) {
				background: #1a202c !important;
				color: #e2e8f0 !important;
			}

			:deep(.cm-content) {
				color: #e2e8f0 !important;
			}

			:deep(.cm-line) {
				color: #e2e8f0 !important;
			}

			:deep(textarea),
			:deep(input) {
				background: #1a202c !important;
				color: #e2e8f0 !important;
				border: 1px solid #4a5568 !important;
			}
		}

		.editor-output {
			background: #1a202c;
			border-radius: var(--radius--lg);
			padding: var(--spacing--sm);

			strong {
				color: #a0aec0;
				font-size: var(--font-size--xs);
				display: block;
				margin-bottom: var(--spacing--xs);
			}

			.output-display {
				background: #0f1419;
				color: #10b981;
				padding: var(--spacing--sm);
				border-radius: var(--radius);
				margin: 0;
				overflow-x: auto;
				font-family: var(--font-family);
				font-size: var(--font-size--sm);
				line-height: var(--line-height--xl);
				white-space: pre-wrap;
				word-break: break-all;
			}
		}
	}
}

/* Examples section */
.examples-section {
	margin-bottom: var(--spacing--3xl);

	h2 {
		margin: 0 0 var(--spacing--md);
		font-size: var(--font-size--xl);
		color: #f7fafc;
	}

	.example-category {
		margin-bottom: var(--spacing--2xl);

		h3 {
			margin: 0 0 var(--spacing--md);
			font-size: var(--font-size--md);
			color: #e2e8f0;
			border-bottom: 2px solid #4a5568;
			padding-bottom: var(--spacing--xs);
		}

		.example-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: var(--spacing--md);

			.example-btn {
				background: #2d3748;
				border: 2px solid #1a202c;
				border-radius: var(--radius--lg);
				padding: var(--spacing--sm);
				cursor: pointer;
				transition: all 0.2s;
				text-align: left;
				display: flex;
				flex-direction: column;
				gap: var(--spacing--xs);

				&:hover {
					border-color: #667eea;
					background: #1a202c;
					transform: translateY(-2px);
					box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
				}

				.example-label {
					font-weight: var(--font-weight--bold);
					color: #f7fafc;
					font-size: var(--font-size--sm);
				}

				.example-preview {
					background: #1a202c;
					color: #fbbf24;
					padding: var(--spacing--xs);
					border-radius: var(--radius--sm);
					font-family: var(--font-family);
					font-size: var(--font-size--2xs);
					line-height: var(--line-height--lg);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}
	}
}

/* Features section */
.features-section {
	margin-bottom: var(--spacing--2xl);

	h2 {
		margin: 0 0 var(--spacing--lg);
		font-size: var(--font-size--xl);
		color: #f7fafc;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--spacing--lg);

		.feature-card {
			background: #2d3748;
			border: 2px solid #1a202c;
			border-radius: var(--radius--xl);
			padding: var(--spacing--lg);
			transition: all 0.3s;

			&:hover {
				border-color: #667eea;
				transform: translateY(-4px);
				box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
			}

			h3 {
				margin: 0 0 var(--spacing--sm);
				font-size: var(--font-size--md);
				color: #f7fafc;
			}

			p {
				margin: 0 0 var(--spacing--xs);
				color: #cbd5e0;
				font-size: var(--font-size--sm);
				line-height: var(--line-height--xl);
			}

			ul {
				margin: var(--spacing--xs) 0 0;
				padding-left: var(--spacing--lg);
				color: #cbd5e0;
				font-size: var(--font-size--sm);
				line-height: 1.8;

				li {
					margin-bottom: var(--spacing--4xs);
				}
			}

			code {
				background: #1a202c;
				padding: var(--spacing--5xs) var(--spacing--3xs);
				border-radius: 3px;
				color: #fbbf24;
				font-family: var(--font-family);
				font-size: var(--font-size--xs);
			}

			kbd {
				background: #1a202c;
				color: white;
				padding: var(--spacing--5xs) var(--spacing--2xs);
				border-radius: var(--radius--sm);
				font-family: var(--font-family);
				font-size: var(--font-size--2xs);
				font-weight: var(--font-weight--bold);
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
				border: 1px solid #4a5568;
			}
		}
	}
}

/* Responsive design */
@media (max-width: 1024px) {
	.playground-layout {
		grid-template-columns: 1fr;
	}

	.sidebar {
		max-height: 400px;
	}

	.main-content {
		max-height: none;
	}

	.features-grid {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}
}

@media (max-width: 768px) {
	.playground-header h1 {
		font-size: var(--font-size--xl);
	}

	.example-grid {
		grid-template-columns: 1fr !important;
	}

	.features-grid {
		grid-template-columns: 1fr !important;
	}

	.demo-header {
		flex-direction: column;
		gap: var(--spacing--md);

		.demo-controls {
			width: 100%;

			button {
				flex: 1;
			}
		}
	}
}
</style>
