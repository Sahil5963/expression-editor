import React, { useState } from 'react';
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { Link } from 'react-router-dom';
import { Code2, Sparkles, Zap, Palette, Copy, Check } from 'lucide-react';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
	const [expression, setExpression] = useState('{{user.name}}');
	const [copied, setCopied] = useState(false);

	const autocompleteData = {
		user: {
			name: 'John Doe',
			email: 'john@example.com',
			role: 'Developer',
			company: {
				name: 'Acme Inc',
				location: 'San Francisco',
			},
		},
		order: {
			id: 12345,
			total: 299.99,
			items: [
				{ name: 'Laptop', price: 1299 },
				{ name: 'Mouse', price: 29 },
			],
		},
	};

	const handleCopy = () => {
		navigator.clipboard.writeText('npm install react-dynamic-expression-editor');
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="landing-page">
			{/* Header */}
			<header className="header">
				<div className="container">
					<div className="header-content">
						<div className="logo">
							<Code2 className="logo-icon" />
							<span className="logo-text">react-dynamic-expression-editor</span>
						</div>
						<nav className="nav">
							<Link to="/lab" className="nav-link">
								Playground
							</Link>
							<a
								href="https://github.com/Sahil5963/expression-editor"
								target="_blank"
								rel="noopener noreferrer"
								className="nav-link"
							>
								GitHub
							</a>
							<a
								href="https://www.npmjs.com/package/react-dynamic-expression-editor"
								target="_blank"
								rel="noopener noreferrer"
								className="nav-link"
							>
								npm
							</a>
						</nav>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="hero">
				<div className="container">
					<div className="hero-content">
						<div className="badge">
							<Sparkles size={16} />
							<span>Zero CSS Imports • Full TypeScript Support</span>
						</div>

						<h1 className="hero-title">
							Build Powerful Expression Editors
							<span className="gradient-text"> in React</span>
						</h1>

						<p className="hero-description">
							A feature-rich expression editor with smart autocomplete, syntax highlighting,
							and customizable theming. Perfect for building dynamic forms, workflow builders,
							and data transformation tools.
						</p>

						{/* Installation */}
						<div className="install-section">
							<div className="install-box">
								<code className="install-code">npm install react-dynamic-expression-editor</code>
								<button onClick={handleCopy} className="copy-button" aria-label="Copy install command">
									{copied ? <Check size={18} /> : <Copy size={18} />}
								</button>
							</div>
						</div>

						{/* Live Demo */}
						<div className="demo-section">
							<div className="demo-label">
								<Zap size={16} />
								<span>Try it live - Type {"{{u"} to see autocomplete</span>
							</div>
							<div className="editor-wrapper dark-editor">
								<ExpressionEditor
									value={expression}
									onChange={(data: { value: string }) => setExpression(data.value)}
									autocompleteData={autocompleteData}
									placeholder="Type {{ to start..."
									rows={1}
								/>
							</div>
							<div className="output-preview">
								<span className="output-label">Output:</span>
								<code className="output-value">{expression || 'Empty'}</code>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="features">
				<div className="container">
					<h2 className="section-title">Features</h2>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<Code2 size={24} />
							</div>
							<h3 className="feature-title">Smart Autocomplete</h3>
							<p className="feature-description">
								Deep object navigation with type detection. Supports nested properties, arrays, and
								custom data structures.
							</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<Sparkles size={24} />
							</div>
							<h3 className="feature-title">Zero CSS Imports</h3>
							<p className="feature-description">
								All styles injected via CSS-in-JS. No external CSS files required. Works out of the
								box.
							</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<Palette size={24} />
							</div>
							<h3 className="feature-title">Fully Customizable</h3>
							<p className="feature-description">
								Theme via props, CSS variables, or class names. Dark mode ready with preset themes.
							</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<Zap size={24} />
							</div>
							<h3 className="feature-title">Drag & Drop</h3>
							<p className="feature-description">
								Built-in drag and drop support with customizable callbacks. Perfect for workflow
								builders.
							</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<Code2 size={24} />
							</div>
							<h3 className="feature-title">TypeScript First</h3>
							<p className="feature-description">
								Full type safety with comprehensive TypeScript definitions. Great IntelliSense
								support.
							</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<Sparkles size={24} />
							</div>
							<h3 className="feature-title">CodeMirror Powered</h3>
							<p className="feature-description">
								Built on CodeMirror 6 for robust editing. Syntax highlighting, line wrapping, and
								more.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Start */}
			<section className="quick-start">
				<div className="container">
					<h2 className="section-title">Quick Start</h2>
					<div className="code-block">
						<pre>
							<code>{`import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { useState } from 'react';

function App() {
  const [value, setValue] = useState('');

  return (
    <ExpressionEditor
      value={value}
      onChange={({ value }) => setValue(value)}
      autocompleteData={{
        user: { name: 'John', email: 'john@example.com' },
        product: { id: 123, title: 'Laptop' }
      }}
    />
  );
}`}</code>
						</pre>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="cta">
				<div className="container">
					<div className="cta-content">
						<h2 className="cta-title">Ready to get started?</h2>
						<p className="cta-description">
							Explore the full playground with all features, examples, and customization options.
						</p>
						<Link to="/lab" className="cta-button">
							<Sparkles size={20} />
							Open Playground
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="footer">
				<div className="container">
					<div className="footer-content">
						<p className="footer-text">
							Built with ❤️ by{' '}
							<a
								href="https://github.com/Sahil5963"
								target="_blank"
								rel="noopener noreferrer"
								className="footer-link"
							>
								Sahil
							</a>
						</p>
						<div className="footer-links">
							<a
								href="https://github.com/Sahil5963/expression-editor"
								target="_blank"
								rel="noopener noreferrer"
								className="footer-link"
							>
								GitHub
							</a>
							<span>•</span>
							<a
								href="https://www.npmjs.com/package/react-dynamic-expression-editor"
								target="_blank"
								rel="noopener noreferrer"
								className="footer-link"
							>
								npm
							</a>
							<span>•</span>
							<span>MIT License</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};
