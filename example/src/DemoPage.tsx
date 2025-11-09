import React, { useState, useEffect } from 'react';
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { ChevronRight, ChevronDown, GripVertical, Copy, Check } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import './DemoPage.css';

export const DemoPage: React.FC = () => {
	const mockData = {
		message: {
			content: 'Can you help me reset my password?',
			role: 'user',
			timestamp: '2024-01-20T14:30:00Z',
			id: 'msg_abc123',
			metadata: {
				language: 'en',
				channel: 'web',
				deviceType: 'desktop',
			},
		},
		user: {
			name: 'Sarah Johnson',
			email: 'sarah.j@company.com',
			id: 'usr_12345',
			plan: 'premium',
			joinedAt: '2023-06-15',
			profile: {
				company: 'TechCorp Inc',
				role: 'Product Manager',
				timezone: 'America/New_York',
			},
			preferences: {
				notifications: {
					email: true,
					sms: false,
					push: true,
				},
				language: 'en-US',
			},
		},
		conversation: {
			id: 'conv_789',
			messageCount: 5,
			topic: 'Account Support',
			history: [
				{ role: 'user', content: 'Hello', timestamp: '14:25:00' },
				{ role: 'assistant', content: 'Hi! How can I help?', timestamp: '14:25:02' },
			],
			tags: ['password', 'account', 'support'],
			metadata: {
				source: 'web-chat',
				sessionId: 'sess_xyz',
			},
		},
		context: {
			previousQuery: 'login issues',
			userIntent: 'password_reset',
			sentiment: 'neutral',
			sessionDuration: 245,
			analytics: {
				pageViews: 12,
				lastPage: '/account/settings',
				referrer: 'google.com',
			},
		},
		variables: {
			companyName: 'Acme Corp',
			supportEmail: 'support@acme.com',
			ticketId: 'TKT-4523',
			priority: 'high',
			workflow: {
				name: 'Password Reset Flow',
				step: 'verification',
				status: 'in_progress',
			},
		},
	};

	const datasets = [
		{ label: 'User', value: 'user' },
		{ label: 'Message', value: 'message' },
		{ label: 'Conversation', value: 'conversation' },
		{ label: 'Context', value: 'context' },
		{ label: 'Variables', value: 'variables' },
	];

	const [expression, setExpression] = useState('Hello {{user.name}}! Your email is {{user.email}} and you are on the {{user.plan}} plan.');
	const [apiData, setApiData] = useState<any>(mockData.user);
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
	const [selectedDataset, setSelectedDataset] = useState<string>('user');
	const [copied, setCopied] = useState(false);
	const [showCustomJson, setShowCustomJson] = useState(false);
	const [customJsonInput, setCustomJsonInput] = useState('');

	useEffect(() => {
		setApiData(mockData[selectedDataset as keyof typeof mockData]);
	}, [selectedDataset]);

	const toggleExpand = (path: string) => {
		setExpandedPaths((prev) => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	const handleDragStart = (e: React.DragEvent, path: string) => {
		e.dataTransfer.setData('text/plain', `{{${path}}}`);
		e.dataTransfer.effectAllowed = 'copy';
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText('npm install react-dynamic-expression-editor');
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const handleCustomJsonSubmit = () => {
		try {
			const parsed = JSON.parse(customJsonInput);
			setApiData(parsed);
			setSelectedDataset('');
			setExpandedPaths(new Set(['root']));
		} catch (err) {
			alert('Invalid JSON. Please check your input.');
		}
	};

	const renderJsonTree = (data: any, parentPath: string = 'root', parentKey: string = 'data'): JSX.Element[] => {
		if (data === null || data === undefined) {
			return [
				<div
					key={parentPath}
					className="json-node json-leaf"
					draggable
					onDragStart={(e) => handleDragStart(e, parentKey)}
				>
					<GripVertical size={14} className="drag-icon" />
					<span className="json-key">{parentKey}:</span>
					<span className="json-value json-null">null</span>
				</div>,
			];
		}

		const type = Array.isArray(data) ? 'array' : typeof data;

		if (type === 'object' || type === 'array') {
			const isExpanded = expandedPaths.has(parentPath);
			const entries = type === 'array' ? data.map((item: any, i: number) => [i, item]) : Object.entries(data);

			return [
				<div key={parentPath} className="json-node">
					<div
						className="json-node-header"
						onClick={() => toggleExpand(parentPath)}
						draggable
						onDragStart={(e) => handleDragStart(e, parentKey)}
					>
						<GripVertical size={14} className="drag-icon" />
						{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
						<span className="json-key">{parentKey}:</span>
						<span className="json-type">
							{type === 'array' ? `Array[${data.length}]` : 'Object'}
						</span>
					</div>
					{isExpanded && (
						<div className="json-children">
							{entries.map(([key, value]: [any, any]) => {
								const childPath = `${parentPath}.${key}`;
								const childKey = parentKey === 'data' ? String(key) : `${parentKey}.${key}`;
								return renderJsonTree(value, childPath, childKey);
							})}
						</div>
					)}
				</div>,
			];
		}

		// Primitive values
		return [
			<div
				key={parentPath}
				className="json-node json-leaf"
				draggable
				onDragStart={(e) => handleDragStart(e, parentKey)}
			>
				<GripVertical size={14} className="drag-icon" />
				<span className="json-key">{parentKey}:</span>
				<span className={`json-value json-${type}`}>
					{type === 'string' ? `"${data}"` : String(data)}
				</span>
			</div>,
		];
	};

	return (
		<div className="demo-page">
			{/* Simple Header */}
			<header className="demo-header">
				<div className="demo-container header-content">
					<h1 className="demo-title">react-dynamic-expression-editor</h1>
					<p className="demo-subtitle">
						Build dynamic input fields that combine static text with runtime variables from APIs,
						code blocks, or any data source. Perfect for agent flows, prompt engineering, and workflow automation.
					</p>
					<div className="install-command">
						<code>npm install react-dynamic-expression-editor</code>
						<button onClick={handleCopy} className="copy-button" title="Copy to clipboard">
							{copied ? <Check size={18} /> : <Copy size={18} />}
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="demo-container">
				<ResizablePanelGroup direction="horizontal" className="demo-layout">
					{/* Left Panel - API Data */}
					<ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
						<aside className="data-panel">
						<div className="panel-header">
							<h3 className="panel-title">Available Data</h3>
							<p className="panel-subtitle">Chatbot & prompt context data</p>
						</div>

						<div className="endpoint-selector">
							{datasets.map((dataset) => (
								<button
									key={dataset.value}
									onClick={() => {
										setSelectedDataset(dataset.value);
										setShowCustomJson(false);
									}}
									className={`endpoint-btn ${selectedDataset === dataset.value && !showCustomJson ? 'active' : ''}`}
								>
									{dataset.label}
								</button>
							))}
							<button
								onClick={() => setShowCustomJson(!showCustomJson)}
								className={`endpoint-btn ${showCustomJson ? 'active' : ''}`}
							>
								Custom JSON
							</button>
						</div>

						{showCustomJson && (
							<div className="custom-json-input">
								<textarea
									value={customJsonInput}
									onChange={(e) => setCustomJsonInput(e.target.value)}
									placeholder='{"key": "value", "nested": {"field": 123}}'
									className="json-textarea"
								/>
								<button onClick={handleCustomJsonSubmit} className="json-submit-btn">
									Load JSON
								</button>
							</div>
						)}

						<div className="json-tree">
							{apiData ? (
								renderJsonTree(apiData)
							) : (
								<div className="loading">Loading data...</div>
							)}
						</div>

						<div className="panel-footer">
							<p className="hint">💡 Drag any item to the editor</p>
						</div>
						</aside>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Right Panel - Editor */}
					<ResizablePanel defaultSize={75}>
						<main className="editor-panel">
						<div className="editor-section">
							<label className="editor-label">Expression Editor</label>
							<div className="editor-wrapper dark-editor">
								<ExpressionEditor
									value={expression}
									onChange={({ value }) => setExpression(value)}
									autocompleteData={apiData || {}}
									placeholder="Drag variables here or type {{ to start..."
									rows={6}
									enableDragDrop={true}
								/>
							</div>
						</div>

						<div className="output-section">
							<label className="output-label">Current Expression</label>
							<div className="output-box">
								<code>{expression.replace(/^=/, '') || '(empty)'}</code>
							</div>
						</div>

						<div className="info-section">
							<h4 className="info-title">Try these actions:</h4>
							<ul className="info-list">
								<li>Drag any variable from the left panel into the editor</li>
								<li>Type <code>{'{{'}</code> to trigger autocomplete</li>
								<li>Switch between different API endpoints to see different data</li>
								<li>Build complex expressions like <code>{'{{user.email}}'}</code></li>
							</ul>
						</div>
					</main>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	</div>
	);
};
