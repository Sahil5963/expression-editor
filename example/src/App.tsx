import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { LabPage } from './lab/LabPage';
import { EmailForm } from './pages/EmailForm';
import { PromptBuilder } from './pages/PromptBuilder';
import './App.css';

function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
}

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/lab" element={<LabPage />} />
				<Route path="/email-form" element={<EmailForm />} />
				<Route path="/prompt-builder" element={<PromptBuilder />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
