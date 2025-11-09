import React, { useState, useMemo, useCallback } from 'react';
import { ExpressionEditor, type AutocompleteData, darkTheme, lightTheme } from '@n8n/react-expression-editor';

// Move data outside component to prevent re-creation on every render
const ecommerceData: AutocompleteData = {
		cart: {
			items: [
				{ id: 1, name: 'Laptop', price: 1299, quantity: 1 },
				{ id: 2, name: 'Mouse', price: 29, quantity: 2 },
			],
			total: 1357,
			currency: 'USD',
			discount: { code: 'SAVE10', amount: 135.7 },
		},
		customer: {
			id: 'cust_123',
			email: 'john@shop.com',
			name: 'John Doe',
			tier: 'premium',
			address: {
				street: '123 Market St',
				city: 'San Francisco',
				zipCode: '94102',
			},
		},
};

const apiResponseData: AutocompleteData = {
		response: {
			statusCode: 200,
			headers: {
				'content-type': 'application/json',
				'x-rate-limit': '1000',
				'x-rate-remaining': '999',
			},
			body: {
				success: true,
				data: {
					users: [
						{ id: 1, username: 'alice', active: true },
						{ id: 2, username: 'bob', active: false },
					],
					pagination: {
						page: 1,
						perPage: 10,
						total: 2,
					},
				},
			},
		},
};

const weatherData: AutocompleteData = {
		weather: {
			current: {
				temperature: 72,
				humidity: 65,
				conditions: 'partly cloudy',
				windSpeed: 12,
			},
			forecast: [
				{ day: 'Monday', high: 75, low: 60, rain: 0.1 },
				{ day: 'Tuesday', high: 78, low: 62, rain: 0.0 },
			],
			location: {
				city: 'San Francisco',
				country: 'USA',
				coordinates: { lat: 37.7749, lng: -122.4194 },
			},
		},
};

const databaseData: AutocompleteData = {
		query: {
			results: [
				{
					id: 1,
					title: 'Product A',
					category: 'Electronics',
					inStock: true,
					metadata: {
						tags: ['featured', 'bestseller'],
						rating: 4.5,
						reviews: 128,
					},
				},
			],
			count: 1,
			executionTime: '23ms',
		},
};

/**
 * Themed Examples - Showcasing different styling approaches
 */
export const ThemedExamples: React.FC = () => {
	const [values, setValues] = useState({
		darkThemed: '={{cart.items.length}} items',
		lightThemed: '={{response.statusCode}}',
		cssVars: '={{weather.current.temperature}}°F',
		customClass: '={{query.results[0].title}}',
		dragDrop1: '',
		dragDrop2: '',
	});

	const handleDragStart = useCallback((e: React.DragEvent, text: string) => {
		e.dataTransfer.setData('text/plain', text);
		e.dataTransfer.effectAllowed = 'copy';
	}, []);

	// Create stable onChange handlers with useCallback
	const handleDarkThemedChange = useCallback(
		({ value }: { value: string }) => {
			setValues((prev) => ({ ...prev, darkThemed: value }));
		},
		[],
	);

	const handleLightThemedChange = useCallback(
		({ value }: { value: string }) => {
			setValues((prev) => ({ ...prev, lightThemed: value }));
		},
		[],
	);

	const handleCssVarsChange = useCallback(
		({ value }: { value: string }) => {
			setValues((prev) => ({ ...prev, cssVars: value }));
		},
		[],
	);

	const handleCustomClassChange = useCallback(
		({ value }: { value: string }) => {
			setValues((prev) => ({ ...prev, customClass: value }));
		},
		[],
	);

	const handleDragDrop1Change = useCallback(
		({ value }: { value: string }) => {
			setValues((prev) => ({ ...prev, dragDrop1: value }));
		},
		[],
	);

	const handleDragDrop2Change = useCallback(
		({ value }: { value: string }) => {
			setValues((prev) => ({ ...prev, dragDrop2: value }));
		},
		[],
	);

	return (
		<div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
			<h1 style={{ marginBottom: '10px' }}>🎨 Themed Expression Editor Examples</h1>
			<p style={{ color: '#666', marginBottom: '40px' }}>
				Different styling approaches: Dark theme, Light theme, CSS variables, and custom classes
			</p>

			{/* Dark Theme Section */}
			<section style={{ marginBottom: '50px' }}>
				<h2 style={{ marginBottom: '10px' }}>🌙 Dark Theme (via theme prop)</h2>
				<p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
					E-commerce cart data • Drag items from sidebar
				</p>
				<div style={{ display: 'flex', gap: '20px' }}>
					<div style={{ flex: 1 }}>
						<ExpressionEditor
							value={values.darkThemed}
							onChange={handleDarkThemedChange}
							theme={darkTheme}
							autocompleteData={ecommerceData}
							rows={3}
						/>
						<div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
							<strong>Try:</strong> cart.items[0].name, cart.total, customer.tier
						</div>
					</div>
					<div
						style={{
							width: '200px',
							background: '#2d3748',
							padding: '15px',
							borderRadius: '8px',
							color: '#e2e8f0',
						}}
					>
						<div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
							Draggable Variables
						</div>
						{[
							'{{cart.total}}',
							'{{cart.discount.code}}',
							'{{customer.name}}',
							'{{customer.tier}}',
						].map((item) => (
							<div
								key={item}
								draggable
								onDragStart={(e) => handleDragStart(e, item)}
								style={{
									padding: '8px',
									marginBottom: '5px',
									background: '#4a5568',
									borderRadius: '4px',
									cursor: 'move',
									fontSize: '12px',
									fontFamily: 'monospace',
								}}
							>
								{item}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Light Theme Section */}
			<section style={{ marginBottom: '50px' }}>
				<h2 style={{ marginBottom: '10px' }}>☀️ Light Theme (via theme prop)</h2>
				<p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
					API response data • Status codes and headers
				</p>
				<div style={{ display: 'flex', gap: '20px' }}>
					<div style={{ flex: 1 }}>
						<ExpressionEditor
							value={values.lightThemed}
							onChange={handleLightThemedChange}
							theme={lightTheme}
							autocompleteData={apiResponseData}
							rows={3}
						/>
						<div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
							<strong>Try:</strong> response.body.data.users, response.headers
						</div>
					</div>
					<div
						style={{
							width: '200px',
							background: '#f7fafc',
							padding: '15px',
							borderRadius: '8px',
							border: '1px solid #e2e8f0',
						}}
					>
						<div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
							Draggable Variables
						</div>
						{[
							'{{response.statusCode}}',
							'{{response.body.success}}',
							'{{response.body.data.users[0].username}}',
						].map((item) => (
							<div
								key={item}
								draggable
								onDragStart={(e) => handleDragStart(e, item)}
								style={{
									padding: '8px',
									marginBottom: '5px',
									background: '#ffffff',
									border: '1px solid #cbd5e0',
									borderRadius: '4px',
									cursor: 'move',
									fontSize: '12px',
									fontFamily: 'monospace',
								}}
							>
								{item}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CSS Variables Section */}
			<section style={{ marginBottom: '50px' }}>
				<h2 style={{ marginBottom: '10px' }}>🎨 CSS Variables (highest priority override)</h2>
				<p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
					Weather data • Custom colors via CSS variables
				</p>
				<div
					style={{
						'--expr-editor-bg': '#1a365d',
						'--expr-editor-text': '#90cdf4',
						'--expr-editor-caret': '#4299e1',
						'--expr-editor-border': '#2c5282',
						'--expr-editor-autocomplete-bg': '#2c5282',
						'--expr-editor-autocomplete-text': '#e6fffa',
					} as React.CSSProperties}
				>
					<div style={{ display: 'flex', gap: '20px' }}>
						<div style={{ flex: 1 }}>
							<ExpressionEditor
								value={values.cssVars}
								onChange={handleCssVarsChange}
								autocompleteData={weatherData}
								rows={3}
							/>
							<div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
								<strong>CSS Variables set:</strong> --expr-editor-bg, --expr-editor-text,
								--expr-editor-caret
							</div>
						</div>
						<div
							style={{
								width: '200px',
								background: '#2c5282',
								padding: '15px',
								borderRadius: '8px',
								color: '#e6fffa',
							}}
						>
							<div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
								Draggable Variables
							</div>
							{[
								'{{weather.current.temperature}}',
								'{{weather.current.conditions}}',
								'{{weather.location.city}}',
								'{{weather.forecast[0].high}}',
							].map((item) => (
								<div
									key={item}
									draggable
									onDragStart={(e) => handleDragStart(e, item)}
									style={{
										padding: '8px',
										marginBottom: '5px',
										background: '#2d3748',
										borderRadius: '4px',
										cursor: 'move',
										fontSize: '12px',
										fontFamily: 'monospace',
									}}
								>
									{item}
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Custom Class Section */}
			<section style={{ marginBottom: '50px' }}>
				<h2 style={{ marginBottom: '10px' }}>🎯 Custom Classes (className prop)</h2>
				<p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
					Database query results • Gradient background via custom CSS
				</p>
				<style>{`
					.custom-gradient-editor .expression-editor__input .cm-editor {
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
					}
					.custom-gradient-editor .expression-editor__input .cm-content {
						color: #ffffff !important;
						font-weight: 500;
					}
					.custom-gradient-editor .expression-editor__input .cm-cursor {
						border-left-color: #ffd700 !important;
					}
				`}</style>
				<div style={{ display: 'flex', gap: '20px' }}>
					<div style={{ flex: 1 }}>
						<ExpressionEditor
							value={values.customClass}
							onChange={handleCustomClassChange}
							autocompleteData={databaseData}
							className="custom-gradient-editor"
							rows={3}
						/>
						<div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
							<strong>Custom CSS:</strong> .custom-gradient-editor with gradient background
						</div>
					</div>
					<div
						style={{
							width: '200px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							padding: '15px',
							borderRadius: '8px',
							color: '#ffffff',
						}}
					>
						<div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
							Draggable Variables
						</div>
						{[
							'{{query.results[0].title}}',
							'{{query.results[0].category}}',
							'{{query.results[0].metadata.rating}}',
							'{{query.executionTime}}',
						].map((item) => (
							<div
								key={item}
								draggable
								onDragStart={(e) => handleDragStart(e, item)}
								style={{
									padding: '8px',
									marginBottom: '5px',
									background: 'rgba(255, 255, 255, 0.2)',
									borderRadius: '4px',
									cursor: 'move',
									fontSize: '12px',
									fontFamily: 'monospace',
									backdropFilter: 'blur(10px)',
								}}
							>
								{item}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Border Radius / Tailwind Classes */}
			<section style={{ marginBottom: '50px' }}>
				<h2 style={{ marginBottom: '10px' }}>🔲 Border Radius Customization</h2>
				<p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
					Default 4px • Override via theme prop, CSS variables, or Tailwind/utility classes
				</p>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
					<div>
						<h3 style={{ fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
							Default (4px)
						</h3>
						<ExpressionEditor
							value="={{cart.total}}"
							onChange={() => {}}
							autocompleteData={ecommerceData}
							rows={2}
						/>
						<div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
							No customization
						</div>
					</div>
					<div>
						<h3 style={{ fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
							Via CSS Variable
						</h3>
						<div style={{ '--expr-editor-radius': '12px' } as React.CSSProperties}>
							<ExpressionEditor
								value="={{response.statusCode}}"
								onChange={() => {}}
								autocompleteData={apiResponseData}
								rows={2}
							/>
						</div>
						<div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
							--expr-editor-radius: 12px
						</div>
					</div>
					<div>
						<h3 style={{ fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
							Via Theme Prop
						</h3>
						<ExpressionEditor
							value="={{weather.current.temperature}}"
							onChange={() => {}}
							autocompleteData={weatherData}
							theme={{ border: { radius: '20px' } }}
							rows={2}
						/>
						<div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
							theme={`{{ border: { radius: '20px' } }}`}
						</div>
					</div>
				</div>
				<div style={{ marginTop: '30px' }}>
					<h3 style={{ fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
						Via Inline Style or Tailwind Classes
					</h3>
					<style>{`
						.rounded-xl .cm-editor {
							border-radius: 0.75rem !important; /* Tailwind rounded-xl */
						}
						.rounded-full .cm-editor {
							border-radius: 9999px !important; /* Tailwind rounded-full */
						}
					`}</style>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
						<div>
							<ExpressionEditor
								value="={{query.results[0].title}}"
								onChange={() => {}}
								autocompleteData={databaseData}
								className="rounded-xl"
								rows={2}
							/>
							<div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
								className="rounded-xl" (Tailwind style)
							</div>
						</div>
						<div>
							<ExpressionEditor
								value="={{cart.discount.code}}"
								onChange={() => {}}
								autocompleteData={ecommerceData}
								style={{ borderRadius: '24px' }}
								rows={2}
							/>
							<div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
								style={`{{ borderRadius: '24px' }}`}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Side by Side Drag Drop */}
			<section style={{ marginBottom: '50px' }}>
				<h2 style={{ marginBottom: '10px' }}>🎯 Drag & Drop Between Editors</h2>
				<p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
					Try dragging variables between these two editors
				</p>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
					<div>
						<h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Editor 1 (E-commerce)</h3>
						<ExpressionEditor
							value={values.dragDrop1}
							onChange={handleDragDrop1Change}
							autocompleteData={ecommerceData}
							rows={4}
							theme={{
								colors: {
									background: '#1a202c',
									text: '#e2e8f0',
									primary: '#48bb78',
									caretColor: '#48bb78',
								},
							}}
						/>
					</div>
					<div>
						<h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Editor 2 (Weather)</h3>
						<ExpressionEditor
							value={values.dragDrop2}
							onChange={handleDragDrop2Change}
							autocompleteData={weatherData}
							rows={4}
							theme={{
								colors: {
									background: '#1a202c',
									text: '#e2e8f0',
									primary: '#ed8936',
									caretColor: '#ed8936',
								},
							}}
						/>
					</div>
				</div>
			</section>

			{/* All Current Values */}
			<section>
				<h2 style={{ marginBottom: '10px' }}>📊 Current Values</h2>
				<div
					style={{
						background: '#f7fafc',
						padding: '20px',
						borderRadius: '8px',
						fontFamily: 'monospace',
						fontSize: '12px',
					}}
				>
					{Object.entries(values).map(([key, value]) => (
						<div key={key} style={{ marginBottom: '10px' }}>
							<strong style={{ color: '#667eea' }}>{key}:</strong>{' '}
							<span style={{ color: '#2d3748' }}>{value || '(empty)'}</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
};
