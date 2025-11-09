import React, { useState, useEffect } from 'react';
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import './DemoPage.css';

export const DemoPage: React.FC = () => {
	const [expression, setExpression] = useState('{{user.name}}');
	const [apiData, setApiData] = useState<any>(null);
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
	const [selectedEndpoint, setSelectedEndpoint] = useState<string>('users/1');

	const endpoints = [
		{ label: 'User', value: 'users/1' },
		{ label: 'Post', value: 'posts/1' },
		{ label: 'Album', value: 'albums/1' },
		{ label: 'Photo', value: 'photos/1' },
		{ label: 'Todo', value: 'todos/1' },
	];

	useEffect(() => {
		fetch(`https://jsonplaceholder.typicode.com/${selectedEndpoint}`)
			.then((res) => res.json())
			.then((data) => setApiData(data))
			.catch((err) => console.error('Failed to fetch data:', err));
	}, [selectedEndpoint]);

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
				<div className="demo-container">
					<h1 className="demo-title">Dynamic Expression Editor for Prompts & Workflows</h1>
					<p className="demo-subtitle">
						Build dynamic input fields that combine static text with runtime variables from APIs,
						code blocks, or any data source. Perfect for agent flows, prompt engineering, and workflow automation.
					</p>
					<div className="install-command">
						<code>npm install react-dynamic-expression-editor</code>
					</div>
					<Link to="/lab" className="lab-link">
						Advanced Playground →
					</Link>
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
							<p className="panel-subtitle">JSONPlaceholder API</p>
						</div>

						<div className="endpoint-selector">
							{endpoints.map((endpoint) => (
								<button
									key={endpoint.value}
									onClick={() => setSelectedEndpoint(endpoint.value)}
									className={`endpoint-btn ${selectedEndpoint === endpoint.value ? 'active' : ''}`}
								>
									{endpoint.label}
								</button>
							))}
						</div>

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
