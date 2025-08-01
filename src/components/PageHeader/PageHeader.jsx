// Update for PageHeader.jsx
import { React, useState, useEffect, useRef } from 'react'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../../components/PopupText/PopupText'
import { BASE_URL } from '../../service/api-service'

const getNameInitials = (name) => {
	if (!name) return ''
	return name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')
}

const getAvatarUrl = (account) => {
	if (account?.avatar?.url) {
		const avatarBaseUrl = BASE_URL.replace('/api', '')
		return avatarBaseUrl + account.avatar.url
	}
	return null
}

const PageHeader = () => {
	const navigate = useNavigate()
	const { user, account, loading, error, createNotification } = useAccount()
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const userMenuRef = useRef(null)

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Handle click outside of dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
				setUserMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const userMenuOptions = [
		{
			label: 'Profile',
			callback: () => {
				setUserMenuOpen(false)
				navigate('/settings/profile')
			},
		},
		{
			label: 'Change Password',
			callback: () => {
				setUserMenuOpen(false)
				createNotification({
					message: 'Password change feature coming soon!',
					type: 'default',
					autoClose: 3000,
				})
			},
		},
		{
			label: 'Sign out',
			callback: async () => {
				const result = await PopupText.fire({
					icon: 'question',
					text: 'Are you sure you want to sign out?',
					focusCancel: false,
					showConfirmButton: true,
					showDenyButton: false,
					showCancelButton: true,
					confirmButtonText: 'Yes, Sign Out',
					cancelButtonText: 'Cancel',
				})
				if (result.isConfirmed) {
					window.localStorage.removeItem('fairymail_session')
					createNotification({
						message: 'You have been signed out successfully',
						type: 'default',
						autoClose: 3000,
					})
					navigate('/login')
				}
			},
		},
	]

	// Direct navigation to profile settings
	const goToProfile = () => {
		navigate('/settings/profile')
	}

	return (
		<div className="fm-page-head">
			<Card className="account-info-card">
				<div
					className="account-info"
					onClick={() => {
						navigate('/choose-account', { replace: true })
					}}
				>
					<div>
						<h4>{account?.name}</h4>
						<span>{account?.payment_plan?.name || ''}</span>
					</div>
					<Icon name="Caret" size={16} />
				</div>
			</Card>

			{/* Hide user menu in mobile view */}
			{!isMobile && (
				<div className="user-info" ref={userMenuRef}>
					{/* Make initials card clickable and go directly to profile */}
					<Card style={{ marginRight: '20px', cursor: 'pointer' }} onClick={goToProfile}>
						{getAvatarUrl(account) ? (
							<img
								src={getAvatarUrl(account)}
								alt="Profile"
								style={{
									width: '40px',
									height: '40px',
									objectFit: 'cover',
									borderRadius: '50%',
								}}
							/>
						) : (
							getNameInitials(user?.user?.name)
						)}
					</Card>

					<div className="user">
						{/* User info section - name and email always visible */}
						<h4>{user?.user?.name}</h4>
						<span>{user?.user?.email}</span>
					</div>

					{/* Separate clickable area for dropdown toggle */}
					<div
						className="dropdown-toggle"
						onClick={(e) => {
							e.stopPropagation()
							setUserMenuOpen(!userMenuOpen)
						}}
						style={{ cursor: 'pointer', padding: '0 8px' }}
					>
						<Icon name="Caret" size={24} />
					</div>

					{userMenuOpen && (
						<Card
							className="user-menu"
							style={{
								background: '#FFF9EF',
								position: 'absolute',
								right: '0',
								top: '100%' /* Position below the user info */,
								marginTop: '10px',
								zIndex: '1000',
							}}
						>
							{userMenuOptions.map((option) => (
								<div
									style={{ fontSize: '16px' }}
									key={option.label}
									className="user-menu-option"
									onClick={() => {
										option.callback()
									}}
								>
									{option.label}
								</div>
							))}
						</Card>
					)}
				</div>
			)}
		</div>
	)
}
export default PageHeader
