import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import { USER_ROLES, getRoleByValue } from './userRoles'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Dropdown from '../../components/Dropdown'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import Stepper from '../../components/Stepper/Stepper'
import Switch from '../../components/Switch'
import GoBackButton from '../../components/GoBackButton'
import User from '../../service/User'
import './EditUser.scss'

const EditUser = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user, account, createNotification } = useAccount()

	const [loading, setLoading] = useState(true)
	const [currentStep, setCurrentStep] = useState(2)
	const [userData, setUserData] = useState({
		id: '',
		name: '',
		surname: '',
		username: '',
		email: '',
		role: '',
	})

	const [selectedRole, setSelectedRole] = useState('')
	const [selectedAccounts, setSelectedAccounts] = useState([])
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
	const [error, setError] = useState(null)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')

	const steps = [{ label: 'Users' }, { label: 'Edit User' }, { label: 'Permissions' }]

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

	const handleAccountsChange = (selectedAccounts) => {
		setSelectedAccounts(selectedAccounts)
	}

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
		setUserData({
			...userData,
			role: roleValue,
		})
	}

	const fetchUserData = async () => {
		try {
			setLoading(true)
			setError(null)

			if (!user || !user.jwt) {
				throw new Error('No valid session found')
			}

			// Fetch all team members and find the one with matching UUID
			const response = await ApiService.get('fairymailer/team-members', user.jwt)

			if (response.data.code === 200) {
				const teamMember = response.data.data.find((member) => member.uuid === id)

				if (!teamMember) {
					throw new Error('Team member not found')
				}

				// Split fullName into name and surname
				const fullNameParts = teamMember.fullName ? teamMember.fullName.split(' ') : ['', '']
				const firstName = fullNameParts[0] || ''
				const lastName = fullNameParts.slice(1).join(' ') || ''

				// Map the API response to the userData format
				const mappedUserData = {
					id: teamMember.uuid,
					name: firstName,
					surname: lastName,
					username: teamMember.username,
					email: teamMember.email,
					role: teamMember.role, // Keep role in lowercase to match USER_ROLES
					confirmed: teamMember.confirmed,
					blocked: teamMember.blocked,
				}

				setUserData(mappedUserData)
				setSelectedRole(mappedUserData.role)

				// Set custom permissions if the role is custom
				if (teamMember.role === 'custom' && teamMember.customPermissions) {
					setCustomPermissions(teamMember.customPermissions)
				}

				// Set account assignments if available in the API response
				if (teamMember.accounts && Array.isArray(teamMember.accounts)) {
					const userAccounts = teamMember.accounts.map((account) => ({
						value: account.id.toString(),
						label: account.name,
					}))
					setSelectedAccounts(userAccounts)
				}
				// Clear password fields when loading user data
				setNewPassword('')
				setConfirmPassword('')
				setPasswordError('')
			} else {
				throw new Error('Failed to fetch team member data')
			}
		} catch (error) {
			console.error('Error fetching user data:', error)
			setError('Failed to load user data. Please try again.')
			createNotification({
				message: 'Failed to load user data. Please try again.',
				type: 'error',
				autoClose: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (id) {
			fetchUserData()
		}
	}, [id]) // eslint-disable-line react-hooks/exhaustive-deps

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setUserData({
			...userData,
			[name]: value,
		})
	}

	const handleRoleChange = (selectedRole) => {
		const roleValue = typeof selectedRole === 'string' ? selectedRole : selectedRole.value
		setUserData({
			...userData,
			role: roleValue,
		})
		setSelectedRole(roleValue)
	}

	const handlePasswordChange = (field, value) => {
		if (field === 'newPassword') {
			setNewPassword(value)
		} else {
			setConfirmPassword(value)
		}

		// Clear password error when user starts typing
		if (passwordError) {
			setPasswordError('')
		}
	}

	const validatePasswords = () => {
		if (newPassword || confirmPassword) {
			if (newPassword !== confirmPassword) {
				setPasswordError('Passwords do not match')
				return false
			} else if (newPassword.length < 6) {
				setPasswordError('Password must be at least 6 characters long')
				return false
			}
		}
		setPasswordError('')
		return true
	}

	const goToNextStep = async () => {
		if (currentStep === 2) {
			// Validate passwords before proceeding to permissions step
			if (!validatePasswords()) {
				return
			}

			// Update team member data before proceeding to permissions step
			if (!userData.id) {
				createNotification({
					message: 'User ID not found. Please try again.',
					type: 'error',
					autoClose: 5000,
				})
				return
			}

			try {
				// Build the payload for the update-team-member endpoint
				const updatePayload = {
					uuid: userData.id,
					name: userData.name,
					surname: userData.surname,
					email: userData.email,
					role: selectedRole,
				}

				// Add password if provided
				if (newPassword && newPassword.trim()) {
					updatePayload.password = newPassword
				}

				// Add accounts array if selected
				if (selectedAccounts && selectedAccounts.length > 0) {
					updatePayload.accounts = selectedAccounts.map((account) => parseInt(account.value))
				}

				console.log('Updating team member with payload:', updatePayload)

				// Get JWT token from AccountContext
				if (!user || !user.jwt) {
					throw new Error('Authentication required. Please log in again.')
				}

				// Make API call to update team member
				const updateResponse = await ApiService.post('fairymailer/update-team-member', updatePayload, user.jwt)
				console.log('Team member update response:', updateResponse)

				// Check if the response contains an error code (even with HTTP 200)
				if (updateResponse.data.code && updateResponse.data.code !== 200) {
					throw new Error(updateResponse.data.message || 'Failed to update team member')
				}

				createNotification({
					message: 'Team member updated successfully!',
					type: 'default',
					autoClose: 3000,
				})
			} catch (error) {
				console.error('Error updating team member:', error)

				let errorMessage = 'Failed to update team member. Please try again.'

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
				return // Don't proceed to next step if update fails
			}
		}

		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1)
		}
	}

	const goToPrevStep = () => {
		if (currentStep > 2) {
			setCurrentStep(currentStep - 1)
		} else {
			navigate('/team')
		}
	}

	const handleSave = async () => {
		if (!userData.id) {
			createNotification({
				message: 'User ID not found. Please try again.',
				type: 'error',
				autoClose: 5000,
			})
			return
		}

		try {
			// Update custom permissions if role is custom
			if (selectedRole === 'custom') {
				const permissionsPayload = {
					uuid: userData.id,
					role: selectedRole,
					custom_permissions: customPermissions,
				}

				console.log('Updating custom permissions with payload:', permissionsPayload)

				// Get JWT token from AccountContext
				if (!user || !user.jwt) {
					throw new Error('Authentication required. Please log in again.')
				}

				// Make API call to update custom permissions
				const permissionsResponse = await ApiService.post('fairymailer/update-team-member', permissionsPayload, user.jwt)
				console.log('Permissions update response:', permissionsResponse)

				// Check if the response contains an error code (even with HTTP 200)
				if (permissionsResponse.data.code && permissionsResponse.data.code !== 200) {
					throw new Error(permissionsResponse.data.message || 'Failed to update permissions')
				}

				createNotification({
					message: 'Custom permissions updated successfully!',
					type: 'default',
					autoClose: 3000,
				})
			} else {
				createNotification({
					message: 'Permissions updated successfully!',
					type: 'default',
					autoClose: 3000,
				})
			}

			// Navigate back to team page
			navigate('/team')
		} catch (error) {
			console.error('Error updating permissions:', error)

			let errorMessage = 'Failed to update permissions. Please try again.'

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

	const renderStep1 = () => {
		return (
			<div className="team-members-container">
				<h2>Users</h2>
				<p>View and manage your users.</p>
				<Button type="primary" onClick={goToNextStep}>
					Continue
				</Button>
			</div>
		)
	}

	const renderStep2 = () => {
		return (
			<div className="add-new-user-container">
				<h2>Edit User</h2>

				<div className="form-container">
					<InputText label="Email" name="email" value={userData.email} onChange={handleInputChange} placeholder="Email address" />

					<InputText label="Name" name="name" value={userData.name} onChange={handleInputChange} placeholder="First name" />

					<InputText label="Surname" name="surname" value={userData.surname} onChange={handleInputChange} placeholder="Last name" />

					<InputText label="Username" name="username" value={userData.username} onChange={handleInputChange} placeholder="Username" />

					<Dropdown options={USER_ROLES} selectedValue={getRoleByValue(userData.role)} onOptionSelect={handleRoleChange} placeholder="Select role">
						{getRoleByValue(userData.role)?.label || 'Select role'}
					</Dropdown>

					<MultipleDropdown options={availableAccounts} selectedValues={selectedAccounts} onOptionSelect={handleAccountsChange} placeholder="Select accounts to grant access" />

					<InputText label="New Password" type="password" value={newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} placeholder="Enter new password" />

					<InputText
						label="Confirm New Password"
						type="password"
						value={confirmPassword}
						onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
						placeholder="Confirm new password"
					/>

					{passwordError && (
						<div className="password-error" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
							{passwordError}
						</div>
					)}
				</div>

				<div className="action-buttons">
					<Button type="secondary" onClick={goToPrevStep}>
						Back
					</Button>
					<Button type="primary" onClick={goToNextStep}>
						Save & Go to Permissions
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
					<Button type="primary" onClick={handleSave}>
						Update user
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

	if (loading) {
		return (
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="loading-container">
						<p>Loading user data...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="go-back-container" style={{ margin: '0 0 20px 20px' }}>
						<GoBackButton onClick={() => navigate('/team')} />
					</div>
					<div className="error-container" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
						{error}
						<br />
						<Button type="action" onClick={fetchUserData} style={{ marginTop: '10px' }}>
							Retry
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fm-page-wrapper">
			<Sidemenu />
			<div className="fm-page-container">
				<PageHeader user={user} account={account} />

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

export default EditUser
