import React, { useState, useRef, useMemo } from 'react';
import { ExpressionEditor, type ExpressionEditorRef, type AutocompleteData, type Segment } from 'react-expression-editor';
import './ExpressionPlayground.css';

/**
 * Expression Editor Playground - React Demo Application
 *
 * Comprehensive testing environment for all expression editor features:
 * - Multiple editor variants (inline, multiline, readonly, large)
 * - Drag & drop variables
 * - Nested autocomplete with deep object structures
 * - Example expressions library
 * - Live output preview
 */

interface EditorDemo {
	id: string;
	title: string;
	description: string;
	defaultValue: string;
	rows: number;
	readOnly: boolean;
}

const editorDemos: EditorDemo[] = [
	{
		id: 'inline',
		title: 'Inline Expression Editor',
		description: 'Compact single-line editor for quick expressions',
		defaultValue: '{{json.name}}',
		rows: 1,
		readOnly: false,
	},
	{
		id: 'multiline',
		title: 'Multi-line Expression Editor',
		description: 'Full-featured editor with autocomplete, syntax highlighting, and drag-drop',
		defaultValue: '{{json.address.city}}\n{{json.email}}\n{{json.age}}',
		rows: 5,
		readOnly: false,
	},
	{
		id: 'complex',
		title: 'Complex Expression Editor',
		description: 'For advanced expressions with method calls and operations',
		defaultValue: '{{json.orders.map(order => order.product).join(", ")}}',
		rows: 3,
		readOnly: false,
	},
	{
		id: 'readonly',
		title: 'Read-only Expression Display',
		description: 'Display-only mode for showing computed or locked expressions',
		defaultValue: '{{json.metadata.tags.filter(tag => tag !== "premium")}}',
		rows: 2,
		readOnly: true,
	},
	{
		id: 'large',
		title: 'Large Text Area',
		description: 'For complex multi-line expressions with lots of space',
		defaultValue: `{{
  const user = json;
  const fullAddress = \`\${user.address.street}, \${user.address.city}, \${user.address.state} \${user.address.zipCode}\`;
  return fullAddress;
}}`,
		rows: 10,
		readOnly: false,
	},
];

// Draggable variables
const draggableVariables = [
	{ path: 'json.name', description: 'User name' },
	{ path: 'json.email', description: 'User email' },
	{ path: 'json.address.city', description: 'City' },
	{ path: 'json.address.coordinates.lat', description: 'Latitude' },
	{ path: 'json.orders[0].product', description: 'First order product' },
	{ path: 'json.metadata.tags', description: 'User tags array' },
	{ path: 'json.stats.totalSpent', description: 'Total spent' },
	{ path: 'prevNode.json.body.data.userId', description: 'Previous node user ID' },
	{ path: 'execution.id', description: 'Execution ID' },
	{ path: 'workflow.name', description: 'Workflow name' },
	{ path: 'vars.API_KEY', description: 'API Key' },
	{ path: 'now', description: 'Current timestamp' },
];

// Example expressions by category
const exampleExpressions = [
	{
		category: 'Basic Access',
		examples: [
			{ label: 'Simple property', value: '{{json.name}}' },
			{ label: 'Nested property', value: '{{json.address.city}}' },
			{ label: 'Deep nesting', value: '{{json.address.coordinates.lat}}' },
			{ label: 'Array access', value: '{{json.orders[0].product}}' },
		],
	},
	{
		category: 'String Operations',
		examples: [
			{ label: 'String method', value: '{{json.email.includes("@")}}' },
			{ label: 'Template literal', value: '{{`Hello, ${json.name}!`}}' },
			{
				label: 'String concat',
				value: '{{json.address.city + ", " + json.address.state}}',
			},
			{ label: 'Uppercase', value: '{{json.name.toUpperCase()}}' },
		],
	},
	{
		category: 'Array Operations',
		examples: [
			{ label: 'Array length', value: '{{json.orders.length}}' },
			{ label: 'Array join', value: '{{json.metadata.tags.join(", ")}}' },
			{ label: 'Array map', value: '{{json.orders.map(o => o.product)}}' },
			{ label: 'Array filter', value: '{{json.orders.filter(o => o.price > 50)}}' },
		],
	},
	{
		category: 'Conditional Logic',
		examples: [
			{ label: 'Ternary operator', value: '{{json.age > 18 ? "Adult" : "Minor"}}' },
			{
				label: 'Boolean check',
				value: '{{json.verified ? "✓ Verified" : "✗ Not verified"}}',
			},
			{ label: 'Null coalescing', value: '{{json.middleName || "N/A"}}' },
		],
	},
	{
		category: 'Math Operations',
		examples: [
			{ label: 'Sum', value: '{{json.stats.totalSpent + 100}}' },
			{
				label: 'Average',
				value: '{{json.stats.totalSpent / json.stats.totalOrders}}',
			},
			{
				label: 'Percentage',
				value: '{{(json.orders.length / 10 * 100).toFixed(2) + "%"}}',
			},
		],
	},
	{
		category: 'Complex Expressions',
		examples: [
			{
				label: 'Multi-line calculation',
				value: `{{
  const total = json.orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
  return total.toFixed(2);
}}`,
			},
			{
				label: 'Formatted address',
				value:
					'{{`${json.address.street}\\n${json.address.city}, ${json.address.state} ${json.address.zipCode}\\n${json.address.country}`}}',
			},
		],
	},
];

export const ExpressionPlayground: React.FC = () => {
	const [editorValues, setEditorValues] = useState<Record<string, string>>(() =>
		editorDemos.reduce(
			(acc, demo) => ({
				...acc,
				[demo.id]: demo.defaultValue,
			}),
			{},
		),
	);

	const [draggedItem, setDraggedItem] = useState<string | null>(null);
	const editorRefs = useRef<Record<string, React.RefObject<ExpressionEditorRef>>>({});

	// Initialize refs
	editorDemos.forEach((demo) => {
		if (!editorRefs.current[demo.id]) {
			editorRefs.current[demo.id] = React.createRef();
		}
	});

	// Comprehensive autocomplete data
	const autocompleteData = useMemo((): AutocompleteData => {
		return {
			json: {
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
			input: {
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
			prevNode: {
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
			execution: {
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
			workflow: {
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
			vars: {
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
			now: new Date().toISOString(),
			today: new Date().toISOString().split('T')[0],
		};
	}, []);

	const handleEditorChange = (id: string, data: { value: string; segments: Segment[] }) => {
		setEditorValues((prev) => ({
			...prev,
			[id]: data.value.replace(/^=/, ''),
		}));
	};

	const resetEditor = (id: string) => {
		const demo = editorDemos.find((d) => d.id === id);
		if (demo) {
			setEditorValues((prev) => ({
				...prev,
				[id]: demo.defaultValue,
			}));
		}
	};

	const clearEditor = (id: string) => {
		setEditorValues((prev) => ({
			...prev,
			[id]: '',
		}));
	};

	const applyExample = (editorId: string, value: string) => {
		setEditorValues((prev) => ({
			...prev,
			[editorId]: value,
		}));
	};

	const handleDragStart = (event: React.DragEvent, item: string) => {
		setDraggedItem(item);
		event.dataTransfer.effectAllowed = 'copy';
		event.dataTransfer.setData('text/plain', `{{${item}}}`);
	};

	const handleDragEnd = () => {
		setDraggedItem(null);
	};

	const formatExpression = (path: string) => `{{${path}}}`;

	return (
		<div className="expression-playground">
			<div className="playground-layout">
				{/* Left sidebar - Draggable variables */}
				<aside className="sidebar">
					<h2>Draggable Variables</h2>
					<p className="sidebar-hint">Drag these into any editor below</p>
					<div className="draggable-list">
						{draggableVariables.map((variable) => (
							<div
								key={variable.path}
								className={`draggable-item ${draggedItem === variable.path ? 'dragging' : ''}`}
								draggable
								onDragStart={(e) => handleDragStart(e, variable.path)}
								onDragEnd={handleDragEnd}
							>
								<code className="variable-path">{formatExpression(variable.path)}</code>
								<span className="variable-desc">{variable.description}</span>
							</div>
						))}
					</div>

					<div className="data-section">
						<h3>Available Data Structure</h3>
						<details>
							<summary>View JSON (click to expand)</summary>
							<pre className="data-preview">
								{JSON.stringify(autocompleteData, null, 2)}
							</pre>
						</details>
					</div>
				</aside>

				{/* Main content */}
				<main className="main-content">
					{/* Editor demos section */}
					<section className="editors-section">
						<h2>Editor Types</h2>
						<p className="section-hint">
							💡 <strong>React Expression Editor</strong> with custom autocomplete! Type{' '}
							<code>{'{{j'}</code> to see root variables, or <code>{'{{json.'}</code> for
							nested properties. Features: syntax highlighting, validation, and full
							autocomplete from mock data!
						</p>

						{editorDemos.map((demo) => (
							<div key={demo.id} className="editor-demo">
								<div className="demo-header">
									<div>
										<h3>{demo.title}</h3>
										<p className="demo-description">{demo.description}</p>
									</div>
									<div className="demo-controls">
										<button
											className="reset-btn"
											onClick={() => resetEditor(demo.id)}
											title="Reset to default"
										>
											Reset
										</button>
										<button
											className="clear-btn"
											onClick={() => clearEditor(demo.id)}
											title="Clear"
										>
											Clear
										</button>
									</div>
								</div>

								<div className="editor-wrapper">
									<ExpressionEditor
										ref={editorRefs.current[demo.id]}
										value={editorValues[demo.id]}
										onChange={(data) => handleEditorChange(demo.id, data)}
										path={`playground.${demo.id}`}
										rows={demo.rows}
										readOnly={demo.readOnly}
										autocompleteData={autocompleteData}
									/>
								</div>

								<div className="editor-output">
									<strong>Current Value:</strong>
									<pre className="output-display">{editorValues[demo.id]}</pre>
								</div>
							</div>
						))}
					</section>

					{/* Example expressions section */}
					<section className="examples-section">
						<h2>Example Expressions</h2>
						<p className="section-hint">
							Click any example to apply it to the multi-line editor
						</p>

						{exampleExpressions.map((category) => (
							<div key={category.category} className="example-category">
								<h3>{category.category}</h3>
								<div className="example-grid">
									{category.examples.map((example, idx) => (
										<button
											key={idx}
											className="example-btn"
											onClick={() => applyExample('multiline', example.value)}
											title={example.value}
										>
											<span className="example-label">{example.label}</span>
											<code className="example-preview">
												{example.value.length > 50
													? example.value.substring(0, 50) + '...'
													: example.value}
											</code>
										</button>
									))}
								</div>
							</div>
						))}
					</section>

					{/* Features showcase section */}
					<section className="features-section">
						<h2>Editor Features</h2>
						<div className="features-grid">
							<div className="feature-card">
								<h3>🔍 Autocomplete</h3>
								<p>
									Type <code>{'{{j'}</code> to see all available variables
								</p>
								<p>Navigate nested objects with dot notation</p>
							</div>
							<div className="feature-card">
								<h3>🎨 Syntax Highlighting</h3>
								<p>
									Expression syntax <code>{'{{}}'}</code> is highlighted
								</p>
								<p>JavaScript code within expressions is syntax-colored</p>
							</div>
							<div className="feature-card">
								<h3>🖱️ Drag & Drop</h3>
								<p>Drag variables from the sidebar into editors</p>
								<p>Variables automatically wrapped in expression syntax</p>
							</div>
							<div className="feature-card">
								<h3>⌨️ Keyboard Shortcuts</h3>
								<ul>
									<li>
										<kbd>Ctrl</kbd>+<kbd>Space</kbd> - Trigger autocomplete
									</li>
									<li>
										<kbd>Tab</kbd> - Accept suggestion
									</li>
									<li>
										<kbd>Esc</kbd> - Close autocomplete
									</li>
									<li>
										<kbd>Enter</kbd> - New line (multi-line mode)
									</li>
								</ul>
							</div>
							<div className="feature-card">
								<h3>📝 Smart Brackets</h3>
								<p>
									Auto-closing of brackets: <code>( ) [ ] {'{ }'}</code>
								</p>
								<p>Auto-wrapping of selected text</p>
							</div>
							<div className="feature-card">
								<h3>💡 Tooltips</h3>
								<p>Hover over variables to see their values</p>
								<p>Type information for nested objects</p>
							</div>
						</div>
					</section>
				</main>
			</div>
		</div>
	);
};
