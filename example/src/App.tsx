import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { LabPage } from './lab/LabPage';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/lab" element={<LabPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
