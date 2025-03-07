import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ApiService, isJwtTokenExpired } from './service/api-service'
import Dashboard from './pages/dashboard/dashboard'
import LogIn from './pages/login/login'
import User from './pages/register/register'
import Desing from './desing'
import TwoFactorLogin from './pages/login/two-factor-login/two-factor-login'
import ResetPassword from './pages/resetPassword/reset-password'
import PaymentPlan from './pages/payment-plan/payment-plan'
import Campaigns from './pages/campaigns/Campaigns'
import EditCampaign from './pages/campaigns/EditCampaign'
import Subscribers from './pages/subscribers/subscribers'
import NewCampaign from './pages/campaigns/NewCampaign'
import Integrations from './pages/integrations/integrations'
import Automations from './pages/automations/automations'
import EditAutomation from './pages/automations/edit-automation'
import AccountPicker from './pages/accountPicker/accountPicker'
import FlowEditor from './pages/automations/FlowEditor'
import EditTemplate from './pages/templates/EditTemplate'
import EditSubscriber from './pages/subscribers/EditSubscriber'
import EditGroup from './pages/subscribers/EditGroup'

function App() {
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		const fairymail_session = localStorage.getItem('fairymail_session')
		//ckesisis fix
		if (!fairymail_session) navigate('/login')
		//ckesisis fix
		if (fairymail_session) {
			const userData = JSON.parse(decodeURIComponent(fairymail_session))
			if (!userData.jwt || isJwtTokenExpired(userData.jwt)) {
				localStorage.removeItem('fairymail_session')
				navigate('/login')
			}
		}
	}, [navigate])

	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Navigate to={localStorage.getItem('fairymail_session') ? '/dashboard' : '/login'} />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/login" element={<LogIn />} />
				<Route path="/login/2FA" element={<TwoFactorLogin />} />
				<Route path="/register" element={<User />} />
				<Route path="/design" element={<Desing />} />
				<Route path="/reset-password/:id" element={<ResetPassword />} />
				<Route path="/payment-plan" element={<PaymentPlan />} />
				<Route path="/campaigns" element={<Campaigns />} />
				<Route path="/campaigns/new" element={<NewCampaign />} />
				<Route path="/campaigns/edit/:uuid" element={<NewCampaign />} />
				<Route path="/templates/edit/:uuid" element={<EditTemplate />} />
				<Route path="/campaigns/overview/:uuid" element={<EditCampaign />} />
				<Route path="/subscribers" element={<Subscribers />} />
				<Route path="/subscribers/:uuid" element={<EditSubscriber />} />
				<Route path="/subscribers/filters/:filterString" element={<Subscribers />} />
				<Route path="/subscribers/group/new" element={<EditGroup />} />
				<Route path="/subscribers/group/:uuid" element={<EditGroup />} />
				<Route path="/integrations" element={<Integrations />} />
				<Route path="/automations" element={<Automations />} />
				<Route path="/automations/:autId" element={<EditAutomation />} />
				<Route path="/automations/editor/:autId" element={<FlowEditor />} />
				<Route path="/choose-account" element={<AccountPicker />} />
				<Route path="/stats" element={<Dashboard />} />
			</Routes>
		</div>
	)
}

export default App
