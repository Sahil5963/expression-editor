import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './LandingPage';
import { LabPage } from './LabPage';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/lab" element={<LabPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
