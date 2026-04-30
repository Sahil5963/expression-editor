import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { ArrowLeft, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import './EmailForm.css';

export const EmailForm: React.FC = () => {
	const [formData, setFormData] = useState({
		subject: 'Hello {{user.name}}!',
		fromName: '{{variables.companyName}} Support',
		fromEmail: '{{variables.supportEmail}}',
		replyTo: 'support@example.com',
		body: 'Hi {{user.name}},\n\nThank you for contacting {{variables.companyName}}!\n\nYour support ticket ID is: {{variables.ticketId}}\n\nWe are here to help.',
	});

	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));

	const autocompleteData = useMemo(
		() => ({
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
			},
			variables: {
				companyName: 'Acme Corp',
				supportEmail: 'support@acme.com',
				ticketId: 'TKT-4523',
				priority: 'high',
			},
			message: {
				content: 'Can you help me?',
				role: 'user',
				timestamp: '2024-01-20T14:30:00Z',
			},
		}),
		[]
	);

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
		<div className="email-page">
			{/* Navigation */}
			<nav className="email-nav">
				<div className="email-nav-inner">
					<Link to="/" className="email-nav-back">
						<ArrowLeft size={18} />
						Back to Home
					</Link>
					<span className="email-nav-title">Email Form — Multi-Field Demo</span>
					<div className="email-nav-spacer" />
				</div>
			</nav>

			{/* Main Content */}
			<div className="email-container">
				<div className="email-layout">
					{/* Left Panel - Available Data */}
					<aside className="email-data-panel">
						<div className="panel-header">
							<h3 className="panel-title">Available Data</h3>
							<p className="panel-subtitle">Drag variables into form fields</p>
						</div>

						<div className="json-tree">
							{renderJsonTree(autocompleteData)}
						</div>

						<div className="panel-footer">
							<p className="hint">💡 Drag any item to the editor</p>
						</div>
					</aside>

					{/* Right Panel - Email Form */}
					<main className="email-form-panel">
						<h2 className="email-form-title">Email Configuration</h2>

						{/* Subject */}
						<div className="email-field-group">
							<label className="email-field-label">Subject</label>
							<div className="email-field-editor dark-editor">
								<ExpressionEditor
									value={formData.subject}
									onChange={(data) => setFormData({ ...formData, subject: data.value })}
									autocompleteData={autocompleteData}
									maxRows={10}
									placeholder="e.g., Hello {{user.name}}!"
									enableDragDrop={true}
								/>
							</div>
						</div>

						{/* From Fields */}
						<div className="email-field-group">
							<div className="email-fields-row">
								<div>
									<label className="email-field-label">From Name</label>
									<div className="email-field-editor dark-editor">
										<ExpressionEditor
											value={formData.fromName}
											onChange={(data) => setFormData({ ...formData, fromName: data.value })}
											autocompleteData={autocompleteData}
											rows={1}
											placeholder="e.g., John Doe"
											enableDragDrop={true}
										/>
									</div>
								</div>
								<div>
									<label className="email-field-label">From Email</label>
									<div className="email-field-editor dark-editor">
										<ExpressionEditor
											value={formData.fromEmail}
											onChange={(data) => setFormData({ ...formData, fromEmail: data.value })}
											autocompleteData={autocompleteData}
											rows={1}
											placeholder="e.g., sender@example.com"
											enableDragDrop={true}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Reply-To */}
						<div className="email-field-group">
							<label className="email-field-label">Reply-To</label>
							<div className="email-field-editor dark-editor">
								<ExpressionEditor
									value={formData.replyTo}
									onChange={(data) => setFormData({ ...formData, replyTo: data.value })}
									autocompleteData={autocompleteData}
									rows={1}
									placeholder="e.g., reply@example.com"
									enableDragDrop={true}
								/>
							</div>
						</div>

						{/* Body */}
						<div className="email-field-group">
							<label className="email-field-label">Body</label>
							<div className="email-field-editor dark-editor">
								<ExpressionEditor
									value={formData.body}
									onChange={(data) => setFormData({ ...formData, body: data.value })}
									autocompleteData={autocompleteData}
									minRows={4}
									maxRows={12}
									placeholder="Enter email body..."
									enableDragDrop={true}
								/>
							</div>
						</div>

						{/* Output */}
						<div className="email-output-section">
							<label className="email-output-label">Current Field Values</label>
							<div className="email-output-box">
								<pre>{JSON.stringify(formData, null, 2)}</pre>
							</div>
						</div>

						{/* Tips */}
						<div className="email-info-section">
							<h4 className="email-info-title">Try these actions:</h4>
							<ul className="email-info-list">
								<li>Drag any variable from the left panel into any form field</li>
								<li>Type <code>{'{{'}</code> to trigger autocomplete</li>
								<li>Single-line fields (<code>rows=1</code>) — strictly pinned, Enter blocked</li>
								<li>Body uses <code>minRows=4 maxRows=12</code> — grows with content, scrolls past 12 rows</li>
								<li>Watch the "Current Field Values" section update in real-time</li>
							</ul>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};
