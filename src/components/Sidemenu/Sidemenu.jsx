import React, { useState, useEffect, useRef } from 'react'
import './Sidemenu.scss'
import Logo from '../Logo/Logo'
import SubsCounter from '../SubsCounter'
import Button from '../Button'
import Icon from '../Icon/Icon'
import Card from '../Card'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../PopupText/PopupText'
import AccountPicker from '../../pages/accountPicker/accountPicker';

const menu_items_upper = [
	{ label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' },
	{ label: 'Campaigns', path: '/campaigns', icon: 'Campaigns' },
	{ label: 'Subscribers', path: '/subscribers', icon: 'Subscribers' },
	{ label: 'Automations', path: '/automations', icon: 'Automations' },
	{ label: 'Integrations', path: '/integrations', icon: 'Integrations' },
	{ label: 'Stats', path: '/stats', icon: 'Stats', disabled: false },
]
const menu_items_lower = [
	{ label: 'Settings', path: '/settings', icon: 'Settings', disabled: false },
	{ label: 'Billing', path: '/billing', icon: 'Billing', disabled: false },
	{ label: 'Team', path: '/team', icon: 'Team', disabled: false },
	{ label: 'Refer a Friend', path: '/refer-a-friend', icon: 'ReferAFriend', disabled: true },
]

// Create dropdown options
const createDropdownOptions = [
	{
		label: 'Create Campaign',
		path: '/campaigns/new',
		icon: 'Campaigns'
	},
	{
		label: 'Import Contacts',
		path: '/subscribers/import',
		icon: 'Contacts'
	},
	{
		label: 'Create Automation',
		path: '/automations/new',
		icon: 'Automations',
		requiresDesktop: true
	},
]

const Sidemenu = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, account } = useAccount()
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const [menuOpen, setMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [createDropdownOpen, setCreateDropdownOpen] = useState(false)
	const userMenuRef = useRef(null)
	const createDropdownRef = useRef(null)

	// Determine active menu item
	const getActiveItem = () => {
		const path = location.pathname;
		const activeUpperItem = menu_items_upper.find(item =>
			path === item.path || path.startsWith(item.path + '/')
		);
		const activeLowerItem = menu_items_lower.find(item =>
			path === item.path || path.startsWith(item.path + '/')
		);
		return activeUpperItem || activeLowerItem || null;
	}

	const userMenuOptions = [
		{
			label: 'Profile',
			callback: () => {
				setUserMenuOpen(false);
				navigate('/settings/profile');
			}
		},
		{
			label: 'Change Password',
			callback: () => {
				setUserMenuOpen(false);
				navigate('/settings/profile');
			}
		},
		{
			label: 'Logout',
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
					window.localStorage.removeItem('fairymail_session');
					navigate('/login')
				}
			}
		}
	]

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
			if (window.innerWidth > 768) {
				setMenuOpen(false)
				setUserMenuOpen(false)
				setCreateDropdownOpen(false)
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Updated click handler to close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			// Close create dropdown when clicking outside
			if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
				setCreateDropdownOpen(false)
			}

			// Close menu when clicking outside on mobile
			if (isMobile && menuOpen && !e.target.closest('.sidemenu')) {
				setMenuOpen(false)
			}

			// Close user menu when clicking outside on mobile (only for desktop behavior)
			if (!isMobile && userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
				setUserMenuOpen(false)
			}
		}

		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [isMobile, menuOpen, userMenuOpen])

	const activeItem = getActiveItem();

	// Helper function to get user initials
	const getNameInitials = (name) => {
		if (!name) return "";
		return name
			.split(' ')
			.map((word) => word[0].toUpperCase())
			.join('')
	}

	// Handle the case when navigating to billing/payment plan
	const handleSubsCounterClick = () => {
		// If user is on or below the limit, take them to settings/billing
		if (account && account.active_subs <= account.subscriber_limit) {
			navigate('/billing');
		} else {
			// If user is over the limit, take them to payment plan page
			navigate('/payment-plan');
		}
	}

	// Handle create dropdown option click
	const handleCreateOptionClick = (option) => {
		if (option.requiresDesktop && isMobile) {
			PopupText.fire({
				icon: 'warning',
				text: 'Automation editor is not available on mobile devices. Please use a desktop to design your automations.',
				showCancelButton: false,
				confirmButtonText: 'OK',
			})
		} else if (option.path === '/campaigns/new' && isMobile) {
			PopupText.fire({
				icon: 'info',
				text: 'You can create a campaign on mobile, but the campaign editor is not available. You will be able to set up campaign details and review, but design editing requires a desktop device.',
				showCancelButton: false,
				confirmButtonText: 'Continue',
			}).then(() => {
				navigate(option.path)
				setCreateDropdownOpen(false)
				if (isMobile) setMenuOpen(false)
			})
		} else {
			navigate(option.path)
			setCreateDropdownOpen(false)
			if (isMobile) setMenuOpen(false)
		}
	}

	return (
		<>
			<div className={`sidemenu ${isMobile ? 'mobile' : ''} ${menuOpen ? 'open' : ''}`}>
				<div className="sidemenu-inner">
					{isMobile && (
						<>
							<button className="menu-toggle" onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
								// Close user menu if it's open
								if (userMenuOpen) setUserMenuOpen(false);
							}}>
								<span className="menu-icon">{menuOpen ? '×' : '☰'}</span>
							</button>

							<div className="mobile-logo">
								<Logo />
							</div>

							<div className="user-menu-wrapper" ref={userMenuRef}>
								<div className="user-avatar" onClick={(e) => {
									e.stopPropagation();
									setUserMenuOpen(!userMenuOpen);
									// Close main menu if it's open
									if (menuOpen) setMenuOpen(false);
								}}>
									{getNameInitials(user?.user?.name)}
								</div>
							</div>
						</>
					)}

					{!isMobile && <Logo />}

					{(!isMobile || menuOpen) && (
						<>
							{menuOpen && isMobile && (
								<div className="mobile-account-picker">
									<Card className="account-info-card">
										<div
											className="account-info"
											onClick={() => {
												navigate('/choose-account', { replace: true });
												setMenuOpen(false);
											}}
										>
											<div>
												<h4>{account?.name}</h4>
												<span>{account?.payment_plan?.name || ''}</span>
											</div>
											<Icon name="Caret" />
										</div>
									</Card>
								</div>
							)}

							<div className="menu_upper">
								<ul>
									{menu_items_upper.map((item, index) => {
										const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
										return (
											<li
												key={index}
												onClick={() => {
													navigate(item.path)
													if (isMobile) setMenuOpen(false)
												}}
												disabled={item.disabled}
												className={isActive ? 'active' : ''}
											>
												<Icon name={item.icon}></Icon>
												<a className="menu-entry">{item.label}</a>
											</li>
										)
									})}
								</ul>
							</div>
							<div className="menu_lower">
								<ul>
									{menu_items_lower.map((item, index) => {
										const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
										return (
											<li
												key={index}
												onClick={() => {
													if (!item.disabled) {
														navigate(item.path)
														if (isMobile) setMenuOpen(false)
													}
												}}
												disabled={item.disabled}
												className={isActive ? 'active' : ''}
											>
												<Icon name={item.icon}></Icon>
												<a className="menu-entry">{item.label}</a>
											</li>
										)
									})}
								</ul>
							</div>
							<div className="menu_bottom">
								<SubsCounter
									currentSubs={account?.active_subs || 0}
									subsLimit={account?.subscriber_limit || 1000}
									onClick={handleSubsCounterClick}
								/>

								{/* Create Button with Dropdown */}
								<div className="create-button-wrapper" ref={createDropdownRef}>
									<Button
										style={{ width: '100%', marginTop: '15px' }}
										onClick={(e) => {
											e.stopPropagation();
											setCreateDropdownOpen(!createDropdownOpen);
										}}
										className={createDropdownOpen ? 'active' : ''}
									>
										+ Create
									</Button>

									{/* Create Dropdown Menu */}
									{createDropdownOpen && (
										<div className="create-dropdown-menu">
											{createDropdownOptions.map((option, index) => (
												<div
													key={index}
													className="create-dropdown-item"
													onClick={() => {
														handleCreateOptionClick(option)
													}}
												>
													<Icon name={option.icon} size={20} />
													<span>{option.label}</span>
												</div>
											))}
										</div>
										
									)}
									
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Mobile User Menu Fullscreen - matches Figma exactly */}
			{isMobile && userMenuOpen && (
				<>
					<div className="mobile-user-menu-overlay" onClick={() => setUserMenuOpen(false)}></div>
					<div className="mobile-user-menu-fullscreen">
						<div className="mobile-user-menu-header">
							<div className="header-top-bar">
								<button
									className="hamburger-menu-icon"
									onClick={() => {
										setUserMenuOpen(false);
										setMenuOpen(true);
									}}
								>
									☰
								</button>
								<div className="mobile-logo">
									<Logo />
								</div>
								<div className="header-right">
									{/* User avatar that closes the menu when clicked */}
									<div 
										className="user-avatar-large"
										onClick={() => setUserMenuOpen(false)}
									>
										{getNameInitials(user?.user?.name)}
									</div>
								</div>
							</div>
							<div className="menu-items-in-header">
								{userMenuOptions.map((option, index) => (
									<div
										key={index}
										className="mobile-user-menu-item"
										onClick={option.callback}
									>
										{option.label}
									</div>
								))}
							</div>
						</div>

						{/* Account Picker Section - Added below the menu items */}
						<div className="mobile-account-picker-section">
							<div className="mobile-account-picker-content">
								<Card className="account-info-card">
									<div
										className="account-info"
										onClick={() => {
											setUserMenuOpen(false);
											navigate('/choose-account', { replace: true });
										}}
									>
										<div>
											<h4>{account?.name}</h4>
											<span>{account?.payment_plan?.name || ''}</span>
										</div>
										<Icon name="Caret" />
									</div>
								</Card>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Desktop User Menu (keep existing behavior) */}
			{!isMobile && userMenuOpen && (
				<Card
					className="user-menu"
					style={{
						background: '#FFF9EF',
						position: 'absolute',
						right: '0',
						top: '100%',
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

			{isMobile && menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
		</>
	)
}

export default Sidemenu