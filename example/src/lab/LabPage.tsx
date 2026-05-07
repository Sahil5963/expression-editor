import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExpressionPlayground } from './ExpressionPlayground';
import { ThemedExamples } from './ThemedExamples';
import { FocusTests } from './FocusTests';
import { ArrowLeft } from 'lucide-react';

export const LabPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'playground' | 'themed' | 'focus'>('playground');

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
						>
							<ArrowLeft size={20} />
							<span className="font-medium">Back to Home</span>
						</Link>

						<div className="flex gap-2">
							<button
								onClick={() => setActiveTab('playground')}
								className={`px-4 py-2 rounded-lg font-medium transition ${
									activeTab === 'playground'
										? 'bg-purple-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								🎮 Full Playground
							</button>
							<button
								onClick={() => setActiveTab('themed')}
								className={`px-4 py-2 rounded-lg font-medium transition ${
									activeTab === 'themed'
										? 'bg-purple-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								🎨 Themed Examples
							</button>
							<button
								onClick={() => setActiveTab('focus')}
								className={`px-4 py-2 rounded-lg font-medium transition ${
									activeTab === 'focus'
										? 'bg-purple-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								🎯 Focus Tests
							</button>
						</div>
					</div>
				</div>
			</nav>

			{activeTab === 'playground' ? (
				<ExpressionPlayground />
			) : activeTab === 'themed' ? (
				<ThemedExamples />
			) : (
				<FocusTests />
			)}
		</div>
	);
};
