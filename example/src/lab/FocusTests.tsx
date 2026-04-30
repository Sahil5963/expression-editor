import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ExpressionEditor } from 'react-dynamic-expression-editor';

interface Config {
	rows: number;
	fontSize: number;
	lineHeight: number;
}

const PRESETS: { label: string; config: Config; note?: string }[] = [
	{ label: 'Default', config: { rows: 5, fontSize: 12, lineHeight: 1.68 } },
	{ label: 'Large font', config: { rows: 5, fontSize: 16, lineHeight: 2.0 }, note: 'Custom typography edge case' },
	{ label: 'Small font', config: { rows: 5, fontSize: 10, lineHeight: 1.4 } },
	{ label: 'rows=1', config: { rows: 1, fontSize: 12, lineHeight: 1.68 } },
	{ label: 'rows=0', config: { rows: 0, fontSize: 12, lineHeight: 1.68 }, note: 'Invalid — should clamp to 1' },
	{ label: 'rows=-3', config: { rows: -3, fontSize: 12, lineHeight: 1.68 }, note: 'Invalid — should clamp to 1' },
];

function computeExpectedMinHeight(rows: number, fontSize: number, lineHeight: number): number {
	const safeRows = Math.max(1, rows);
	const lineHeightPx = fontSize * lineHeight;
	const rowHeight = Math.ceil(lineHeightPx) + 2;
	return safeRows * rowHeight + 8;
}

export const FocusTests: React.FC = () => {
	const [config, setConfig] = useState<Config>({ rows: 5, fontSize: 12, lineHeight: 1.68 });
	const [value, setValue] = useState('');
	const [actualMinHeight, setActualMinHeight] = useState<string>('—');
	const wrapperRef = useRef<HTMLDivElement>(null);

	const themeProp = useMemo(
		() => ({ typography: { fontSize: `${config.fontSize}px`, lineHeight: String(config.lineHeight) } }),
		[config.fontSize, config.lineHeight],
	);

	// Read actual DOM minHeight after each render
	useEffect(() => {
		const read = () => {
			const el = wrapperRef.current?.querySelector('.cm-content') as HTMLElement | null;
			if (el) {
				setActualMinHeight(getComputedStyle(el).minHeight);
			}
		};
		// Small delay for CodeMirror to finish attaching
		const id = setTimeout(read, 50);
		return () => clearTimeout(id);
	}, [config]);

	const expected = computeExpectedMinHeight(config.rows, config.fontSize, config.lineHeight);
	const safeRows = Math.max(1, config.rows);

	return (
		<div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
			<h1 style={{ marginBottom: '4px' }}>Focus & Rows Tests</h1>
			<p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>
				Tests the fix for focus dead zones when rows &gt; content lines. Inspect the computed vs actual{' '}
				<code>min-height</code> on <code>.cm-content</code>.
			</p>

			{/* Presets */}
			<div style={{ marginBottom: '28px' }}>
				<div style={{ fontSize: '12px', fontWeight: 600, color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets</div>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{PRESETS.map((p) => (
						<button
							key={p.label}
							onClick={() => setConfig(p.config)}
							title={p.note}
							style={{
								padding: '6px 14px',
								borderRadius: '6px',
								border: '1px solid',
								fontSize: '13px',
								cursor: 'pointer',
								borderColor:
									config.rows === p.config.rows &&
									config.fontSize === p.config.fontSize &&
									config.lineHeight === p.config.lineHeight
										? '#6366f1'
										: '#d1d5db',
								background:
									config.rows === p.config.rows &&
									config.fontSize === p.config.fontSize &&
									config.lineHeight === p.config.lineHeight
										? '#eef2ff'
										: '#fff',
								color:
									config.rows === p.config.rows &&
									config.fontSize === p.config.fontSize &&
									config.lineHeight === p.config.lineHeight
										? '#4338ca'
										: '#374151',
							}}
						>
							{p.label}
							{p.note && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#9ca3af' }}>⚠</span>}
						</button>
					))}
				</div>
			</div>

			{/* Controls */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: '20px',
					marginBottom: '28px',
					padding: '20px',
					background: '#f9fafb',
					borderRadius: '8px',
					border: '1px solid #e5e7eb',
				}}
			>
				<label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
					<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
						rows = {config.rows}
						{config.rows < 1 && (
							<span style={{ color: '#ef4444', marginLeft: '8px' }}>→ clamped to {safeRows}</span>
						)}
					</span>
					<input
						type="range"
						min={-2}
						max={12}
						step={1}
						value={config.rows}
						onChange={(e) => setConfig((c) => ({ ...c, rows: Number(e.target.value) }))}
					/>
					<input
						type="number"
						value={config.rows}
						onChange={(e) => setConfig((c) => ({ ...c, rows: Number(e.target.value) }))}
						onFocus={(e) => e.target.select()}
						style={{ width: '70px', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', color: '#111', background: '#fff' }}
					/>
				</label>

				<label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
					<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>fontSize = {config.fontSize}px</span>
					<input
						type="range"
						min={8}
						max={24}
						step={1}
						value={config.fontSize}
						onChange={(e) => setConfig((c) => ({ ...c, fontSize: Number(e.target.value) }))}
					/>
					<input
						type="number"
						value={config.fontSize}
						onChange={(e) => setConfig((c) => ({ ...c, fontSize: Number(e.target.value) }))}
						onFocus={(e) => e.target.select()}
						style={{ width: '70px', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', color: '#111', background: '#fff' }}
					/>
				</label>

				<label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
					<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>lineHeight = {config.lineHeight}</span>
					<input
						type="range"
						min={1}
						max={3}
						step={0.1}
						value={config.lineHeight}
						onChange={(e) => setConfig((c) => ({ ...c, lineHeight: Number(Number(e.target.value).toFixed(1)) }))}
					/>
					<input
						type="number"
						step={0.1}
						value={config.lineHeight}
						onChange={(e) => setConfig((c) => ({ ...c, lineHeight: Number(e.target.value) }))}
						onFocus={(e) => e.target.select()}
						style={{ width: '70px', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', color: '#111', background: '#fff' }}
					/>
				</label>
			</div>

			{/* Inspector */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '12px',
					marginBottom: '20px',
					padding: '16px',
					background: '#1e1e2e',
					borderRadius: '8px',
					fontFamily: 'monospace',
					fontSize: '13px',
					color: '#cdd6f4',
				}}
			>
				<div>
					<div style={{ color: '#6c7086', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Formula</div>
					<div>safeRows = Math.max(1, {config.rows}) = <span style={{ color: '#a6e3a1' }}>{safeRows}</span></div>
					<div>lineHeightPx = {config.fontSize} × {config.lineHeight} = <span style={{ color: '#a6e3a1' }}>{(config.fontSize * config.lineHeight).toFixed(2)}</span></div>
					<div>rowHeight = ceil({(config.fontSize * config.lineHeight).toFixed(2)}) + 2 = <span style={{ color: '#a6e3a1' }}>{Math.ceil(config.fontSize * config.lineHeight) + 2}</span></div>
					<div style={{ marginTop: '8px', color: '#f38ba8' }}>
						minHeight = {safeRows} × {Math.ceil(config.fontSize * config.lineHeight) + 2} + 8 ={' '}
						<span style={{ color: '#cba6f7', fontWeight: 'bold' }}>{expected}px</span>
					</div>
				</div>
				<div>
					<div style={{ color: '#6c7086', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>DOM Inspector</div>
					<div>
						<span style={{ color: '#89b4fa' }}>.cm-content</span> min-height:{' '}
						<span style={{ color: actualMinHeight === `${expected}px` ? '#a6e3a1' : '#f38ba8', fontWeight: 'bold' }}>
							{actualMinHeight}
						</span>
					</div>
					{actualMinHeight !== '—' && (
						<div style={{ marginTop: '8px' }}>
							{actualMinHeight === `${expected}px` ? (
								<span style={{ color: '#a6e3a1' }}>✓ matches expected</span>
							) : (
								<span style={{ color: '#f38ba8' }}>✗ mismatch (expected {expected}px)</span>
							)}
						</div>
					)}
				</div>
			</div>

			{/* The Editor */}
			<div style={{ marginBottom: '12px', fontSize: '13px', color: '#6b7280' }}>
				Click anywhere in the empty area below the text — the cursor should appear and the editor should focus.
			</div>
			<div ref={wrapperRef}>
				<ExpressionEditor
					value={value}
					onChange={({ value: v }) => setValue(v)}
					rows={config.rows}
					theme={themeProp}
					placeholder="Click anywhere to focus…"
				/>
			</div>
		</div>
	);
};
