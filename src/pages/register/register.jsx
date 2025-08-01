import './register.scss'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3'
import { registerUser, isUserLoggedIn, validateInvitation } from '../../service/api-service'
import InputText from '../../components/InputText/InputText'
import Checkbox from '../../components/Checkbox'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Logo from '../../components/Logo/Logo'
import Icon from '../../components/Icon/Icon'

const Register = () => {
	const [reCaptchaToken, setReCaptchaToken] = useState('')
	const [refreshReCaptcha, setRefreshReCaptcha] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isGoogleSignIn, setIsGoogleSignIn] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [passwordError, setPasswordError] = useState('')
	const [acceptTerms, setAcceptTerms] = useState(false)
	const [invitationData, setInvitationData] = useState(null)
	const [invitationError, setInvitationError] = useState('')
	const [isValidatingInvitation, setIsValidatingInvitation] = useState(false)
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		accountName: '',
		email: '',
		password: '',
		sendNews: false,
	})

	const navigate = useNavigate()
	const location = useLocation()
	const { token } = useParams()
	const data = location.state

	useEffect(() => {
		if (isUserLoggedIn()) navigate('/dashboard')

		console.log(data)

		if (data?.isGoogleSignIn) {
			console.log('pass')

			setIsGoogleSignIn(true)
			setFormData((prev) => ({
				...prev,
				email: data.userData.email,
				lastName: data.userData.last_name,
				firstName: data.userData.first_name,
			}))
		}

		if (data?.email) {
			setFormData((prev) => ({ ...prev, email: data.email }))
		}
	}, [data, navigate])

	// Handle invitation token validation
	useEffect(() => {
		const validateInvitationToken = async () => {
			if (token) {
				setIsValidatingInvitation(true)
				setInvitationError('')

				try {
					const result = await validateInvitation(token)

					if (result.success) {
						console.log('result.data', result.data)
						const invitationInfo = result.data.data

						// Check if user already exists
						if (invitationInfo.user_exists) {
							setInvitationError('User already exists. Please login instead.')
							return
						}

						// Check if invitation is expired
						if (invitationInfo.expired) {
							setInvitationError('This invitation has expired.')
							return
						}

						setInvitationData(invitationInfo)
						// Pre-fill form data if invitation contains user information
						if (invitationInfo?.email) {
							setFormData((prev) => ({ ...prev, email: invitationInfo.email }))
						}
						if (invitationInfo?.firstName) {
							setFormData((prev) => ({ ...prev, firstName: invitationInfo.firstName }))
						}
						if (invitationInfo?.lastName) {
							setFormData((prev) => ({ ...prev, lastName: invitationInfo.lastName }))
						}
					} else {
						setInvitationError(result.error)
					}
				} catch (error) {
					console.error('Error validating invitation token:', error)
					setInvitationError('Failed to validate invitation token')
				} finally {
					setIsValidatingInvitation(false)
				}
			}
		}

		validateInvitationToken()
	}, [token])

	const checkForm = () => {
		if (isGoogleSignIn) return true

		if (!formData.password || formData.password.length < 6) {
			setPasswordError('Invalid Password')
			setIsLoading(false)
			return false
		}
		return true
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			if (isGoogleSignIn) {
				const response = await registerUser(formData, reCaptchaToken, data.googleSignInToken)

				if (response) {
					navigate('/dashboard')
				} else {
					setRefreshReCaptcha(!refreshReCaptcha)
					console.error('Error during Registration')
					setPasswordError('Registration failed. Please try again.')
				}
			} else if (token && invitationData) {
				// Register user directly when using invitation token
				if (checkForm()) {
					const response = await registerUser(formData, reCaptchaToken, null, token)

					if (response) {
						navigate('/dashboard')
					} else {
						setRefreshReCaptcha(!refreshReCaptcha)
						console.error('Error during Registration with invitation')
						setPasswordError('Registration failed. Please try again.')
					}
				} else {
					setPasswordError('Please fix the form errors and try again.')
				}
			} else if (checkForm()) {
				// Normal registration flow - redirect to 2FA
				const emailToUse = formData.email || data?.email
				navigate('/login/2FA', { state: { email: emailToUse } })
			} else {
				setPasswordError('Please fix the form errors and try again.')
			}
		} catch (error) {
			console.error('Error during registration:', error)
			setPasswordError('Registration failed. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
		setPasswordError('')
	}

	return (
		<GoogleReCaptchaProvider reCaptchaKey={'6LcZZbkqAAAAAKGBvr79Mj42sMIQf86Z7A31xdbo'}>
			<GoogleReCaptcha className="google-recaptcha-custom-class" onVerify={setReCaptchaToken} refreshReCaptcha={refreshReCaptcha} />
			<div className="register-wrapper">
				<Logo />
				<Card>
					<Button
						className="back-button"
						onClick={() => {
							navigate('/login')
						}}
						type={'link'}
						icon="Caret"
					>
						Back
					</Button>
					<div className="header-info">
						<header>
							<h1>Welcome</h1>
							{token ? (
								<>
									{isValidatingInvitation ? (
										<p>Validating invitation...</p>
									) : invitationError ? (
										<p style={{ color: 'red' }}>Invitation Error: {invitationError}</p>
									) : invitationData ? (
										<>
											<p>Complete your account setup using the invitation</p>
											<p>
												for the email: <strong>{invitationData.email}</strong>
											</p>
										</>
									) : null}
								</>
							) : (
								<>
									<p>Complete the account for the email</p>
									<p>{formData.email}</p>
								</>
							)}
						</header>
					</div>

					<div className="inputs-container">
						<form onSubmit={handleSubmit}>
							<div className="input-row">
								<div className="input-group">
									<InputText name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} label="First Name" />
								</div>
								<div className="input-group">
									<InputText name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} label="Last Name" />
								</div>
							</div>

							<div className="input-row">
								<div className="input-group">
									<InputText name="accountName" placeholder="Account Name" onChange={handleChange} label="Account Name" />
								</div>
								{!isGoogleSignIn && (
									<div className="input-group">
										<InputText
											className="user-password"
											name="password"
											placeholder="password"
											onChange={handleChange}
											type={showPassword ? 'text' : 'password'}
											label="Password"
											hasError={passwordError.length > 0}
											errorMessage={passwordError}
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
								)}
							</div>

							<div className="checkboxes">
								<div className="checkbox-group">
									<label className="checkbox-text">
										<Checkbox checked={acceptTerms} onChange={() => setAcceptTerms(!acceptTerms)} label="Accept privacy policy and terms and conditions"></Checkbox>
									</label>
								</div>

								<div className="checkbox-group">
									<label className="checkbox-text">
										<Checkbox
											checked={formData.sendNews}
											onChange={() => {
												setFormData((prev) => ({ ...prev, ['sendNews']: !prev['sendNews'] }))
											}}
											label="Send me news and offers"
										></Checkbox>
									</label>
								</div>
							</div>
							<Button className="complete-button" disabled={!acceptTerms || isLoading || (token && (isValidatingInvitation || invitationError))} loading={isLoading}>
								Complete
							</Button>
						</form>
					</div>
				</Card>
			</div>
		</GoogleReCaptchaProvider>
	)
}

export default Register
