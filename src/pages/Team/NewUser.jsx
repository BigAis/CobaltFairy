import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { USER_ROLES, getRoleByValue } from './userRoles'

import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Dropdown from '../../components/Dropdown'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import Stepper from '../../components/Stepper/Stepper'
import Switch from '../../components/Switch'
import GoBackButton from '../../components/GoBackButton'
import Icon from '../../components/Icon/Icon'
import './NewUser.scss'
import User from '../../service/User'
import { ApiService } from '../../service/api-service'

const NewUser = () => {
	const navigate = useNavigate()
	const { user, createNotification } = useAccount()

	const [currentStep, setCurrentStep] = useState(2)
	const [userData, setUserData] = useState({
		email: '',
		name: '',
		surname: '',
		username: '',
		role: '',
	})
	const [emailInvites, setEmailInvites] = useState('')
	const [createMode, setCreateMode] = useState(true)
	const [selectedRole, setSelectedRole] = useState('administrator')
	const [selectedAccounts, setSelectedAccounts] = useState([])
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [customPermissions, setCustomPermissions] = useState({
		accounts: { list: false, view: false, create: false, edit: false, delete: false },
		users: { list: false, view: false, create: false, edit: false, delete: false },
		campaigns: { list: false, view: false, create: false, edit: false, delete: false },
		templates: { list: false, view: false, create: false, edit: false, delete: false },
		subscribers: { list: false, view: false, create: false, edit: false, delete: false, import: false, export: false },
		automations: { list: false, view: false, create: false, edit: false, delete: false },
		integrations: { list: false, view: false, create: false, edit: false, delete: false },
		billing: { access: false },
		stats: { access: false },
	})
	const [createdUserUuid, setCreatedUserUuid] = useState('')
	const [errors, setErrors] = useState({
		email: '',
		name: '',
		surname: '',
		username: '',
		role: '',
		newPassword: '',
		confirmPassword: '',
		emailInvites: '',
	})

	const steps = [{ label: 'Users' }, { label: 'Add New' }, { label: 'Permissions' }]

	// Get available accounts from User service and transform for dropdown
	const getAvailableAccounts = () => {
		const accounts = User.getAccounts()
		if (!accounts || !Array.isArray(accounts)) {
			return []
		}

		// Transform accounts to dropdown format, only include active accounts
		return accounts
			.filter((account) => account.active)
			.map((account) => ({
				value: account.id.toString(),
				label: account.name,
			}))
	}

	const availableAccounts = getAvailableAccounts()

	// Helper function to get current permissions based on selected role
	const getCurrentPermissions = () => {
		if (selectedRole === 'custom') {
			return customPermissions
		}
		const role = getRoleByValue(selectedRole)
		return role ? role.permissions : {}
	}

	// Helper function to handle custom permission changes
	const handleCustomPermissionChange = (resource, action, value) => {
		if (selectedRole !== 'custom') return

		setCustomPermissions((prev) => ({
			...prev,
			[resource]: {
				...prev[resource],
				[action]: value,
			},
		}))
	}

	// Helper function to handle role selection change
	const handleRoleSelectionChange = (roleValue) => {
		setSelectedRole(roleValue)
	}

	// Handle complete setup - update user role
	const handleCompleteSetup = async () => {
		if (!createdUserUuid) {
			createNotification({
				message: 'User UUID not found. Please try creating the user again.',
				type: 'error',
				autoClose: 5000,
			})
			return
		}

		try {
			// Build the payload
			const payload = {
				uuid: createdUserUuid,
				role: selectedRole,
			}

			// Add custom permissions if role is custom
			if (selectedRole === 'custom') {
				payload.custom_permissions = customPermissions
			}

			console.log('Updating user role with payload:', payload)

			// Get JWT token from AccountContext
			if (!user || !user.jwt) {
				throw new Error('Authentication required. Please log in again.')
			}

			// Make API call to update user role
			const roleResponse = await ApiService.post('fairymailer/update-user-role', payload, user.jwt)
			console.log('Role update response:', roleResponse)

			// Check if the response contains an error code (even with HTTP 200)
			if (roleResponse.data.code && roleResponse.data.code !== 200) {
				throw new Error(roleResponse.data.message || 'Failed to update user role')
			}

			createNotification({
				message: 'User role updated successfully!',
				type: 'default',
				autoClose: 3000,
			})

			// Navigate back to team page
			navigate('/team')
		} catch (error) {
			console.error('Error updating user role:', error)

			let errorMessage = 'Failed to update user role. Please try again.'

			if (error.message === 'Authentication required. Please log in again.') {
				errorMessage = 'Authentication required. Please log in again.'
			} else if (error.response?.status === 401) {
				errorMessage = 'Authentication failed. Please log in again.'
			} else if (error.response?.data?.message) {
				errorMessage = error.response.data.message
			} else if (error.message && error.message !== 'Authentication required. Please log in again.') {
				// Handle manually thrown errors (like API response errors)
				errorMessage = error.message
			}

			createNotification({
				message: errorMessage,
				type: 'error',
				autoClose: 5000,
			})
		}
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setUserData({
			...userData,
			[name]: value,
		})
		// Clear error for this field when user starts typing
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: '',
			})
		}
	}

	const handleEmailInvitesChange = (e) => {
		setEmailInvites(e.target.value)
		// Clear error when user starts typing
		if (errors.emailInvites) {
			setErrors({
				...errors,
				emailInvites: '',
			})
		}
	}

	const validateEmailInvites = () => {
		if (!emailInvites.trim()) {
			return 'Please enter at least one email address'
		}

		// Split by comma and validate each email
		const emails = emailInvites
			.split(',')
			.map((email) => email.trim())
			.filter((email) => email.length > 0)

		if (emails.length === 0) {
			return 'Please enter at least one email address'
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const invalidEmails = emails.filter((email) => !emailRegex.test(email))

		if (invalidEmails.length > 0) {
			if (invalidEmails.length === 1) {
				return `Invalid email address: ${invalidEmails[0]}`
			} else {
				return `Invalid email addresses: ${invalidEmails.join(', ')}`
			}
		}

		return ''
	}

	const handleRoleChange = (selectedRole) => {
		setUserData({
			...userData,
			role: selectedRole.value,
		})
		// Clear role error when user selects a role
		if (errors.role) {
			setErrors({
				...errors,
				role: '',
			})
		}
	}

	const handleAccountsChange = (selectedAccounts) => {
		setSelectedAccounts(selectedAccounts)
	}

	const handlePasswordChange = (field, value) => {
		if (field === 'newPassword') {
			setNewPassword(value)
		} else {
			setConfirmPassword(value)
		}

		// Clear password errors when user starts typing
		if (errors.newPassword || errors.confirmPassword) {
			setErrors({
				...errors,
				newPassword: '',
				confirmPassword: '',
			})
		}
	}

	const validateForm = () => {
		let newErrors = {
			email: '',
			name: '',
			surname: '',
			username: '',
			role: '',
			newPassword: '',
			confirmPassword: '',
		}
		let isValid = true

		if (createMode) {
			// Validate email
			if (!userData.email) {
				newErrors.email = 'Email is required'
				isValid = false
			} else if (!/\S+@\S+\.\S+/.test(userData.email)) {
				newErrors.email = 'Please enter a valid email address'
				isValid = false
			}

			// Validate name
			if (!userData.name) {
				newErrors.name = 'Name is required'
				isValid = false
			}

			// Validate surname
			if (!userData.surname) {
				newErrors.surname = 'Surname is required'
				isValid = false
			}

			// Validate username
			if (!userData.username) {
				newErrors.username = 'Username is required'
				isValid = false
			}

			// Validate role
			if (!userData.role) {
				newErrors.role = 'Please select a role'
				isValid = false
			}

			// Validate passwords
			if (!newPassword) {
				newErrors.newPassword = 'Password is required'
				isValid = false
			} else if (newPassword.length < 6) {
				newErrors.newPassword = 'Password must be at least 6 characters long'
				isValid = false
			}

			if (!confirmPassword) {
				newErrors.confirmPassword = 'Please confirm your password'
				isValid = false
			} else if (newPassword !== confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match'
				isValid = false
			}
		}

		setErrors(newErrors)
		return isValid
	}

	const goToNextStep = () => {
		// Simple step navigation for non-create mode steps
		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1)
		}
	}

	const goToPrevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		} else {
			navigate('/team')
		}
	}

	const handleCreateUser = async () => {
		if (createMode) {
			// Validate form before creating user and updating role
			if (!validateForm()) {
				return
			}

			try {
				// Step 1: Create the user via API with accounts included
				const createData = {
					name: userData.name,
					surname: userData.surname,
					email: userData.email,
					username: userData.username,
					password: newPassword,
					role: userData.role,
				}

				// Add accounts array if accounts are selected
				if (selectedAccounts && selectedAccounts.length > 0) {
					createData.accounts = selectedAccounts.map((account) => parseInt(account.value))
				}

				console.log('Creating user with data:', createData)

				// Get JWT token from AccountContext
				if (!user || !user.jwt) {
					throw new Error('Authentication required. Please log in again.')
				}

				// Make API call to create user with accounts
				const userResponse = (await ApiService.post('fairymailer/add-team-member', createData, user.jwt)).data
				console.log('User creation response:', userResponse)

				// Check if the response contains an error code (even with HTTP 200)
				if (userResponse.code && userResponse.code !== 200) {
					throw new Error(userResponse.message || 'Failed to create user')
				}

				// Store the user UUID for step 3
				setCreatedUserUuid(userResponse.data.uuid)

				createNotification({
					message: 'User created successfully with account access!',
					type: 'default',
					autoClose: 3000,
				})

				// Proceed to permissions step
				if (currentStep < steps.length) {
					// Set the selected role in step 3 to match the role selected in step 2
					setSelectedRole(userData.role)
					setCurrentStep(currentStep + 1)
				}
			} catch (error) {
				console.error('Error creating user or assigning accounts:', error)

				let errorMessage = 'Failed to create user or assign accounts. Please try again.'

				if (error.message === 'Authentication required. Please log in again.') {
					errorMessage = 'Authentication required. Please log in again.'
				} else if (error.response?.status === 401) {
					errorMessage = 'Authentication failed. Please log in again.'
				} else if (error.response?.data?.message) {
					errorMessage = error.response.data.message
				} else if (error.message && error.message !== 'Authentication required. Please log in again.') {
					// Handle manually thrown errors (like API response errors)
					errorMessage = error.message
				}

				createNotification({
					message: errorMessage,
					type: 'error',
					autoClose: 5000,
				})
			}
		} else {
			// Handle invite users mode
			const emailValidationError = validateEmailInvites()
			if (emailValidationError) {
				setErrors({
					...errors,
					emailInvites: emailValidationError,
				})
				return
			}

			try {
				// Prepare the payload for sending invitations
				const inviteData = {
					emails: emailInvites.trim(), // Send as comma-separated string
				}

				console.log('Sending invitations with data:', inviteData)

				// Get JWT token from AccountContext
				if (!user || !user.jwt) {
					throw new Error('Authentication required. Please log in again.')
				}

				// Make API call to send invitations
				const inviteResponse = await ApiService.post('fairymailer/send-invitations', inviteData, user.jwt)
				console.log('Invite response:', inviteResponse)

				// Check if the response contains an error code (even with HTTP 200)
				if (inviteResponse.data.code && inviteResponse.data.code !== 200) {
					throw new Error(inviteResponse.data.message || 'Failed to send invitations')
				}

				createNotification({
					message: 'Invitations sent successfully!',
					type: 'default',
					autoClose: 3000,
				})

				navigate('/team')
			} catch (error) {
				console.error('Error sending invitations:', error)

				let errorMessage = 'Failed to send invitations. Please try again.'

				if (error.message === 'Authentication required. Please log in again.') {
					errorMessage = 'Authentication required. Please log in again.'
				} else if (error.response?.status === 401) {
					errorMessage = 'Authentication failed. Please log in again.'
				} else if (error.response?.data?.message) {
					errorMessage = error.response.data.message
				} else if (error.message && error.message !== 'Authentication required. Please log in again.') {
					// Handle manually thrown errors (like API response errors)
					errorMessage = error.message
				}

				createNotification({
					message: errorMessage,
					type: 'error',
					autoClose: 5000,
				})
			}
		}
	}

	const renderStep1 = () => {
		return (
			<div className="team-members-container">
				<h2>Team Members</h2>
				<p>View and manage your team members.</p>
				<Button type="primary" onClick={goToNextStep}>
					Continue
				</Button>
			</div>
		)
	}

	const renderStep2 = () => {
		return (
			<div className="add-new-user-container">
				<h2>Add new user</h2>

				<div className="toggle-buttons">
					<Button
						type={createMode ? 'primary' : 'secondary'}
						onClick={() => {
							setCreateMode(true)
							// Clear password fields when switching to create mode
							setNewPassword('')
							setConfirmPassword('')
							setSelectedAccounts([])
							setErrors({
								email: '',
								name: '',
								surname: '',
								username: '',
								role: '',
								newPassword: '',
								confirmPassword: '',
								emailInvites: '',
							})
						}}
						style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
					>
						Create User
					</Button>
					<Button
						type={!createMode ? 'primary' : 'secondary'}
						onClick={() => {
							setCreateMode(false)
							// Clear password fields and errors when switching to invite mode
							setNewPassword('')
							setConfirmPassword('')
							setSelectedAccounts([])
							setErrors({
								email: '',
								name: '',
								surname: '',
								username: '',
								role: '',
								newPassword: '',
								confirmPassword: '',
								emailInvites: '',
							})
						}}
						style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
					>
						Invite Users
					</Button>
				</div>

				{createMode ? (
					<div className="form-container">
						<InputText label="Email" name="email" value={userData.email} onChange={handleInputChange} placeholder="Email address" hasError={!!errors.email} errorMessage={errors.email} />

						<InputText label="Name" name="name" value={userData.name} onChange={handleInputChange} placeholder="First name" hasError={!!errors.name} errorMessage={errors.name} />

						<InputText
							label="Surname"
							name="surname"
							value={userData.surname}
							onChange={handleInputChange}
							placeholder="Last name"
							hasError={!!errors.surname}
							errorMessage={errors.surname}
						/>

						<InputText
							label="Username"
							name="username"
							value={userData.username}
							onChange={handleInputChange}
							placeholder="Username"
							hasError={!!errors.username}
							errorMessage={errors.username}
						/>

						<div className="dropdown-wrapper">
							<Dropdown options={USER_ROLES} selectedValue={userData.role ? getRoleByValue(userData.role) : null} onOptionSelect={handleRoleChange}>
								Select Role
							</Dropdown>
							{errors.role && (
								<span className="error-message d-flex gap-5" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
									<Icon name="Attention" size={16} />
									{errors.role}
								</span>
							)}
						</div>

						<MultipleDropdown options={availableAccounts} selectedValues={selectedAccounts} onOptionSelect={handleAccountsChange} placeholder="Select accounts to grant access" />

						<InputText
							label="New Password"
							name="newPassword"
							type="password"
							value={newPassword}
							onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
							placeholder="Enter password"
							hasError={!!errors.newPassword}
							errorMessage={errors.newPassword}
						/>
						<InputText
							label="Confirm New Password"
							name="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
							placeholder="Confirm password"
							hasError={!!errors.confirmPassword}
							errorMessage={errors.confirmPassword}
						/>
					</div>
				) : (
					//here is the invite section
					<div className="form-container">
						<InputText
							label="Emails (separated by commas)"
							value={emailInvites}
							onChange={handleEmailInvitesChange}
							placeholder="Email addresses separated by commas"
							hasError={!!errors.emailInvites}
							errorMessage={errors.emailInvites}
						/>
					</div>
				)}

				<div className="action-buttons">
					<Button type="secondary" onClick={goToPrevStep}>
						Back
					</Button>
					<Button type="primary" onClick={handleCreateUser}>
						{createMode ? 'Save & Go to Permissions' : 'Send Invite'}
					</Button>
				</div>
			</div>
		)
	}

	const renderStep3 = () => {
		return (
			<div className="permissions-container">
				<h2>Permissions</h2>

				<div className="permissions-layout">
					{/* Left side - Role selection */}
					<div className="roles-section">
						{USER_ROLES.map((role) => (
							<div key={role.value} className="role-option">
								<input type="radio" id={`role-${role.value}`} name="role" checked={selectedRole === role.value} onChange={() => handleRoleSelectionChange(role.value)} />
								<label htmlFor={`role-${role.value}`}>{role.label}</label>
								<p className="role-description">{role.description}</p>
							</div>
						))}
					</div>

					{/* Right side - Permission categories */}
					<div className="permissions-categories">
						{getCurrentPermissions() && Object.keys(getCurrentPermissions()).length > 0 ? (
							<>
								{/* First column */}
								<div className="permissions-column">
									{/* Accounts */}
									{getCurrentPermissions().accounts && (
										<div className="permission-category">
											<h3>Accounts</h3>
											{Object.entries(getCurrentPermissions().accounts).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch checked={allowed} disabled={selectedRole !== 'custom'} onChange={(checked) => handleCustomPermissionChange('accounts', action, checked)} />
												</div>
											))}
										</div>
									)}

									{/* Users */}
									{getCurrentPermissions().users && (
										<div className="permission-category">
											<h3>Users</h3>
											{Object.entries(getCurrentPermissions().users).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch checked={allowed} disabled={selectedRole !== 'custom'} onChange={(checked) => handleCustomPermissionChange('users', action, checked)} />
												</div>
											))}
										</div>
									)}

									{/* Campaigns */}
									{getCurrentPermissions().campaigns && (
										<div className="permission-category">
											<h3>Campaigns</h3>
											{Object.entries(getCurrentPermissions().campaigns).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch checked={allowed} disabled={selectedRole !== 'custom'} onChange={(checked) => handleCustomPermissionChange('campaigns', action, checked)} />
												</div>
											))}
										</div>
									)}

									{/* Subscribers */}
									{getCurrentPermissions().subscribers && (
										<div className="permission-category">
											<h3>Subscribers</h3>
											{Object.entries(getCurrentPermissions().subscribers).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch
														checked={allowed}
														disabled={selectedRole !== 'custom'}
														onChange={(checked) => handleCustomPermissionChange('subscribers', action, checked)}
													/>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Second column */}
								<div className="permissions-column">
									{/* Templates */}
									{getCurrentPermissions().templates && (
										<div className="permission-category">
											<h3>Templates</h3>
											{Object.entries(getCurrentPermissions().templates).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch checked={allowed} disabled={selectedRole !== 'custom'} onChange={(checked) => handleCustomPermissionChange('templates', action, checked)} />
												</div>
											))}
										</div>
									)}

									{/* Automations */}
									{getCurrentPermissions().automations && (
										<div className="permission-category">
											<h3>Automations</h3>
											{Object.entries(getCurrentPermissions().automations).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch
														checked={allowed}
														disabled={selectedRole !== 'custom'}
														onChange={(checked) => handleCustomPermissionChange('automations', action, checked)}
													/>
												</div>
											))}
										</div>
									)}

									{/* Integrations */}
									{getCurrentPermissions().integrations && (
										<div className="permission-category">
											<h3>Integrations</h3>
											{Object.entries(getCurrentPermissions().integrations).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch
														checked={allowed}
														disabled={selectedRole !== 'custom'}
														onChange={(checked) => handleCustomPermissionChange('integrations', action, checked)}
													/>
												</div>
											))}
										</div>
									)}

									{/* Billing */}
									{getCurrentPermissions().billing && (
										<div className="permission-category">
											<h3>Billing</h3>
											{Object.entries(getCurrentPermissions().billing).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch checked={allowed} disabled={selectedRole !== 'custom'} onChange={(checked) => handleCustomPermissionChange('billing', action, checked)} />
												</div>
											))}
										</div>
									)}

									{/* Stats */}
									{getCurrentPermissions().stats && (
										<div className="permission-category">
											<h3>Stats</h3>
											{Object.entries(getCurrentPermissions().stats).map(([action, allowed]) => (
												<div key={action} className="permission-item">
													<span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
													<Switch checked={allowed} disabled={selectedRole !== 'custom'} onChange={(checked) => handleCustomPermissionChange('stats', action, checked)} />
												</div>
											))}
										</div>
									)}
								</div>
							</>
						) : (
							<div className="no-permissions">
								<p>No permissions defined for this role.</p>
							</div>
						)}
					</div>
				</div>

				<div className="action-button-container">
					<Button type="primary" onClick={handleCompleteSetup}>
						Complete Setup
					</Button>
				</div>
			</div>
		)
	}

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return renderStep1()
			case 2:
				return renderStep2()
			case 3:
				return renderStep3()
			default:
				return null
		}
	}

	return (
		<div className="fm-page-wrapper">
			<div className="fm-page-container no-margin-left-container">
				<div className="go-back-container" style={{ margin: '0 0 20px 20px' }}>
					<GoBackButton onClick={() => navigate('/team')} />
				</div>

				<div className="stepper-container">
					<Stepper steps={steps} current={currentStep - 1} setStep={(step) => setCurrentStep(step + 1)} hasBack={false} />
				</div>

				<div className="new-user-content">{renderCurrentStep()}</div>
			</div>
		</div>
	)
}

export default NewUser
