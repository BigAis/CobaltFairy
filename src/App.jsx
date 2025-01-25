import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/dashboard'
import LogIn from './pages/login/login'
import User from './pages/register/register'
import Desing from './desing'
import TwoFactorLogin from './pages/login/two-factor-login/two-factor-login'
import ResetPassword from './pages/resetPassword/reset-password'
import PaymentPlan from './pages/payment-plan/payment-plan'
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
				<Route path="/reset-password/:id" element={<ResetPassword/>}/>
				<Route path="/payment-plan" element={<PaymentPlan/>}/>
			</Routes>
		</div>
	)
}

export default App
