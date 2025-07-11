import './login.scss'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3'
import { checkUserExists, checkUserCrendentials, forgotPassword, googleLogIn, isUserLoggedIn } from '../../service/api-service'
import { useGoogleLogin } from '@react-oauth/google'
import Button from '../../components/Button'
import Logo from '../../components/Logo/Logo'
import InputText from '../../components/InputText/InputText'
import Checkbox from '../../components/Checkbox'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import { useAccount } from '../../context/AccountContext'
import NotificationBar from '../../components/NotificationBar/NotificationBar'

const LogIn = () => {
	const [showPassword, setShowPassword] = useState(false)
	const [passwordError, setPasswordError] = useState('')
	const [password, setPassword] = useState('')
	const [emailError, setEmailError] = useState('')
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isValidUser, setIsValidUser] = useState(false)
	const [reCaptchaToken, setReCaptchaToken] = useState('')
	const [refreshReCaptcha, setRefreshReCaptcha] = useState(false)
	const { createNotification } = useAccount()

	const navigate = useNavigate()

	useEffect(() => {
		// Check if user is already logged in
		if (isUserLoggedIn()) {
			console.log('User already logged in, redirecting to dashboard')
			navigate('/dashboard', { replace: true })
		}
	}, [navigate])

	const handleRemoveNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id))
	}

	const checkEmail = async (e) => {
		if (e) e.preventDefault()
		
		setIsLoading(true)

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (!email || !emailRegex.test(email)) {
			setEmailError('Please type a valid email address.')
			setIsLoading(false)
			return
		}

		try {
			console.log("Checking if email exists:", email)
			const response = await checkUserExists(email)
			console.log("Email check response:", response)
			
			if (response === true) {
				// Email exists, show password screen
				setIsValidUser(true)
			} else {
				// Email doesn't exist, redirect to register
				console.log("Email doesn't exist, redirecting to register")
				navigate('/register', { 
					state: { email }, 
					replace: true 
				})
				return // Stop execution here to prevent setIsLoading(false)
			}
		} catch (error) {
		console.error("Error checking email:", error)
		createNotification({ 
			message: 'Error checking email. Please try again.', 
			type: 'warning'
		})
		} finally {
		setIsLoading(false)
		}
	}

	const checkValidPassword = async (e) => {
		if (e) e.preventDefault()
		
		setIsLoading(true)
	  
		// Clear any previous error
		setPasswordError('')
	  
		// First check for minimum length
		if (!password || password.length < 6) {
		  setPasswordError('Invalid Password')
		  setIsLoading(false)
		  return
		}
	  
		try {
		  console.log("Checking credentials for:", email)
		  const response = await checkUserCrendentials(email, password, reCaptchaToken)
		  console.log("Credentials check response:", response)
		  
		  if (response === true) {
			// Credentials are valid, proceed to 2FA using React Router navigation
			navigate('/login/2FA', { 
			  state: { email },
			  replace: true
			})
		  } else {
			// Show error under the input field instead of notification
			setPasswordError('Incorrect password. Please try again.')
			setRefreshReCaptcha(!refreshReCaptcha)
		  }
		} catch (error) {
		  console.error("Error validating password:", error)
		  // Show error under the input field
		  setPasswordError('Error validating credentials. Please try again.')
		  setRefreshReCaptcha(!refreshReCaptcha)
		} finally {
		  setIsLoading(false)
		}
	}

	const resetPassword = async () => {
		if (!email) {
			createNotification({ 
				message: 'Email is required for password reset.', 
				type: 'warning' 
			})
			return
		}
		
		setIsLoading(true)

		try {
			const response = await forgotPassword(email)
			console.log("Password reset response:", response)
			
			if (response === true) {
				createNotification({ 
					message: `We've sent you an email with a password reset link. Please check your inbox and follow the instructions.`, 
					type: 'default' 
				})
			} else {
				throw new Error("Failed to send reset email")
			}
		} catch (error) {
			console.error("Error resetting password:", error)
			createNotification({ 
				message: 'Failed to send reset email. Please try again.', 
				type: 'warning' 
			})
			setRefreshReCaptcha(!refreshReCaptcha)
		} finally {
			setIsLoading(false)
		}
	}

	const login = useGoogleLogin({
		onSuccess: (tokenResponse) => googleSignIn(tokenResponse),
		onError: (error) => {
			console.error("Google login error:", error)
			createNotification({ 
				message: 'Google login failed. Please try again.', 
				type: 'warning' 
			})
		}
	})

	const googleSignIn = async (tokenResponse) => {
		setIsLoading(true)

		try {
			console.log("Attempting Google sign in")
			const response = await googleLogIn(tokenResponse)
			console.log("Google sign in response:", response)

			if (response.data.code === 200) {
				// Successfully authenticated with Google - use React Router navigation instead of page reload
				navigate('/dashboard', { replace: true })
			} else if (response.data.code === 201) {
				// New Google user, redirect to register
				navigate('/register', { 
					state: { 
						isGoogleSignIn: true, 
						userData: response.data.data, 
						googleSignInToken: tokenResponse 
					},
					replace: true
				})
			} else {
				throw new Error("Unexpected response from Google sign in")
			}
		} catch (error) {
			console.error("Error during Google Sign In:", error)
			createNotification({ 
				message: 'Error during Google Sign In. Please try again.', 
				type: 'warning' 
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<GoogleReCaptchaProvider reCaptchaKey={'6LcZZbkqAAAAAKGBvr79Mj42sMIQf86Z7A31xdbo'}>
			<GoogleReCaptcha className="google-recaptcha-custom-class" onVerify={setReCaptchaToken} refreshReCaptcha={refreshReCaptcha} />

			<div className="login-component">
				<div className="login-wrapper">
					<Logo />
					<Card className="card">
						<div className="container">
							{!isValidUser ? (
								<>
									<div className="header-info">
										<header>
											<h1>Welcome</h1>
											<p>Enter your email to sign in or join</p>
										</header>
									</div>
									<div className="login-options">
										<button className="google-login-btn" onClick={() => login()}>
											<img className="google-logo" alt="Google Logo" src="/images/Googlelogo.svg" />
											Continue with Google
										</button>
										<div className="breakpoint-or">
											<span>or</span>
										</div>
										<form className="email-form" onSubmit={checkEmail}>
											<InputText
												onChange={(e) => {
													setEmail(e.target.value)
													setEmailError('')
												}}
												placeholder="Enter your email"
												label="Enter your email"
												hasError={emailError.length > 0}
												errorMessage={emailError}
												value={email}
											/>
											<Button 
												disabled={isLoading} 
												loading={isLoading} 
												type="submit"
											>
												Continue
											</Button>
										</form>
									</div>
								</>
							) : (
								<>
									<Button 
										className="back-button" 
										onClick={() => setIsValidUser(false)} 
										type={'link'} 
										icon="Caret"
									>
										Back
									</Button>

									<div className="header-info">
										<header>
											<h1>Welcome</h1>
											<p>Type in the password for the account</p>
											<p>{email}</p>
										</header>
									</div>

									<form onSubmit={checkValidPassword}>
										<div className="input-rows">
											<div className="password-input-wrapper">
												<InputText
													className="user-password"
													placeholder="Password"
													type={showPassword ? 'text' : 'password'}
													label="Password"
													hasError={passwordError.length > 0}
													errorMessage={passwordError}
													style={{ width: '100%' }}
													onChange={(e) => {
														setPassword(e.target.value)
														setPasswordError('')
													}}
													value={password}
												/>

												<button
													type="button"
													className="eye-button"
													onClick={() => {
														setShowPassword(!showPassword)
													}}
													aria-label={showPassword ? 'Hide password' : 'Show password'}
												>
													<Icon name="Eye" size={25} />
												</button>
											</div>
										</div>

										<p
											className="forgot-password"
											onClick={resetPassword}
										>
											Forgot Password
										</p>

										<label className="remember-me">
											<Checkbox className="remember-me" checked={true} label="Remember Me"></Checkbox>
										</label>

										<Button
											className="complete-button"
											disabled={isLoading}
											loading={isLoading}
											type="submit"
										>
											Continue
										</Button>
									</form>
								</>
							)}
						</div>
					</Card>
				</div>
			</div>
		</GoogleReCaptchaProvider>
	)
}

export default LogIn