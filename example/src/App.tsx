import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoPage } from './DemoPage';
import { LabPage } from './LabPage';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<DemoPage />} />
				<Route path="/lab" element={<LabPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
