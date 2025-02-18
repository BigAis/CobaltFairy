import './index.scss'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { UserProvider } from './context/UserContext'
import { AccountProvider } from './context/AccountContext.jsx'

const GOOGLE_OAUTH2_CLIENT_ID = '457841658757-rfqfg2uh7thfm3ftmdrdcsdb7gt5mk8u.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
	<GoogleOAuthProvider clientId={GOOGLE_OAUTH2_CLIENT_ID}>
		<UserProvider>
			<AccountProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</AccountProvider>
		</UserProvider>
	</GoogleOAuthProvider>
)
