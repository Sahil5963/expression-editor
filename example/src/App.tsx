import React, { useState } from 'react';
import { ExpressionPlayground } from './ExpressionPlayground';
import { ThemedExamples } from './ThemedExamples';
import './App.css';

function App() {
	const [activeTab, setActiveTab] = useState<'playground' | 'themed'>('themed');

	return (
		<div>
			<nav
				style={{
					background: '#2d3748',
					padding: '15px 20px',
					display: 'flex',
					gap: '20px',
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
				}}
			>
				<button
					onClick={() => setActiveTab('themed')}
					style={{
						padding: '10px 20px',
						background: activeTab === 'themed' ? '#667eea' : 'transparent',
						color: '#ffffff',
						border: 'none',
						borderRadius: '6px',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: '500',
						transition: 'all 0.2s',
					}}
				>
					🎨 Themed Examples
				</button>
				<button
					onClick={() => setActiveTab('playground')}
					style={{
						padding: '10px 20px',
						background: activeTab === 'playground' ? '#667eea' : 'transparent',
						color: '#ffffff',
						border: 'none',
						borderRadius: '6px',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: '500',
						transition: 'all 0.2s',
					}}
				>
					🎮 Full Playground
				</button>
			</nav>
			{activeTab === 'themed' ? <ThemedExamples /> : <ExpressionPlayground />}
		</div>
	);
}

export default App;
