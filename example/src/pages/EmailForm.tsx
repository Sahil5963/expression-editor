import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { ArrowLeft, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

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
					className="json-node json-leaf py-1 px-2 flex items-center gap-2 text-sm cursor-grab"
					draggable
					onDragStart={(e) => handleDragStart(e, parentKey)}
				>
					<GripVertical size={14} className="text-gray-400" />
					<span className="text-gray-700 font-medium">{parentKey}:</span>
					<span className="text-gray-500">null</span>
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
						className="json-node-header py-1 px-2 flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
						onClick={() => toggleExpand(parentPath)}
						draggable
						onDragStart={(e) => handleDragStart(e, parentKey)}
					>
						<GripVertical size={14} className="text-gray-400" />
						{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
						<span className="text-gray-700 font-medium">{parentKey}:</span>
						<span className="text-gray-500 text-xs">
							{type === 'array' ? `Array[${data.length}]` : 'Object'}
						</span>
					</div>
					{isExpanded && (
						<div className="json-children pl-4">
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
				className="json-node json-leaf py-1 px-2 flex items-center gap-2 text-sm cursor-grab"
				draggable
				onDragStart={(e) => handleDragStart(e, parentKey)}
			>
				<GripVertical size={14} className="text-gray-400" />
				<span className="text-gray-700 font-medium">{parentKey}:</span>
				<span className={`text-gray-500 ${type === 'string' ? '' : 'font-mono'}`}>
					{type === 'string' ? `"${data}"` : String(data)}
				</span>
			</div>,
		];
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navigation */}
			<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div>
							<Link
								to="/"
								className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
							>
								<ArrowLeft size={20} />
								Back to Home
							</Link>
						</div>
						<h1 className="text-xl font-semibold text-gray-900">Email Form - Multi-Field Test</h1>
						<div className="w-40" />
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-12 gap-6">
					{/* Left Panel - Available Data */}
					<div className="col-span-3">
						<div className="bg-white rounded-lg shadow p-4 sticky top-24">
							<h2 className="text-lg font-semibold text-gray-900 mb-2">Available Data</h2>
							<p className="text-sm text-gray-600 mb-4">Drag variables into the form fields</p>

							<div className="space-y-1 text-sm max-h-96 overflow-y-auto">
								{renderJsonTree(autocompleteData)}
							</div>

							<p className="text-xs text-gray-500 mt-4 pt-4 border-t">
								💡 Drag any item to form fields
							</p>
						</div>
					</div>

					{/* Right Panel - Email Form */}
					<div className="col-span-9">
						<div className="bg-white rounded-lg shadow p-8">
							<h2 className="text-lg font-semibold text-gray-900 mb-6">Email Configuration</h2>

							{/* Subject */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
								<div className="expression-editor-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
									<ExpressionEditor
										value={formData.subject}
										onChange={(data) => setFormData({ ...formData, subject: data.value })}
										autocompleteData={autocompleteData}
										rows={1}
										placeholder="e.g., Hello {{user.name}}!"
										enableDragDrop={true}
									/>
								</div>
							</div>

							{/* From Fields */}
							<div className="grid grid-cols-2 gap-6 mb-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
									<div className="expression-editor-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
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
									<label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
									<div className="expression-editor-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
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

							{/* Reply-To */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">Reply-To</label>
								<div className="expression-editor-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
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
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
								<div className="expression-editor-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
									<ExpressionEditor
										value={formData.body}
										onChange={(data) => setFormData({ ...formData, body: data.value })}
										autocompleteData={autocompleteData}
										rows={6}
										placeholder="Enter email body..."
										enableDragDrop={true}
									/>
								</div>
							</div>

							{/* Output - Current Values */}
							<div className="mt-8 pt-8 border-t border-gray-200">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Current Field Values</h3>
								<div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto">
									<pre>{JSON.stringify(formData, null, 2)}</pre>
								</div>
							</div>

							{/* Instructions */}
							<div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
								<h4 className="font-semibold text-blue-900 mb-2">💡 How to test:</h4>
								<ul className="text-sm text-blue-800 space-y-1">
									<li>• Drag any variable from the left panel into any form field</li>
									<li>• Type <code className="bg-blue-100 px-1 rounded">{'{{'}</code> to trigger autocomplete</li>
									<li>• Use <code className="bg-blue-100 px-1 rounded">{'{{'}</code> for single-line fields (rows=1)</li>
									<li>• Multi-line body field (rows=6) supports Enter key and text wrapping</li>
									<li>• Watch the "Current Field Values" section update in real-time</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
