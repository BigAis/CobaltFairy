import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/dashboard'
import LogIn from './pages/login/login'
import User from './pages/register/register'
import Desing from './desing'
import TwoFactorLogin from './pages/login/two-factor-login/two-factor-login'
function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Navigate to="/login" />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/login" element={<LogIn />} />
				<Route path="/login/2FA" element={<TwoFactorLogin />} />
				<Route path="/register" element={<User />} />
				<Route path="/design" element={<Desing />} />
			</Routes>
		</div>
	)
}

export default App
