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

const Sidemenu = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, account } = useAccount()
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const [menuOpen, setMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const userMenuRef = useRef(null)

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
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Updated click handler to close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			// Close menu when clicking outside on mobile
			if (isMobile && menuOpen && !e.target.closest('.sidemenu')) {
				setMenuOpen(false)
			}
			
			// Close user menu when clicking outside
			if (isMobile && userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
				setUserMenuOpen(false)
			}
		}
		
		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [isMobile, menuOpen, userMenuOpen])

	const activeItem = getActiveItem();
	
	// Helper function to get user initials
	const getNameInitials = (name) => {
		if(!name) return "";
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

	return (
		<>
			<div className={`sidemenu ${isMobile ? 'mobile' : ''} ${menuOpen ? 'open' : ''}`}>
				<div className="sidemenu-inner">
					{isMobile && (
						<>
							<button className="menu-toggle" onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
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
								}}>
									{getNameInitials(user?.user?.name)}
								</div>
								
								{userMenuOpen && (
									<Card className="user-menu">
										{userMenuOptions.map((option) => (
											<div key={option.label} className="user-menu-option" onClick={() => option.callback()}>
												{option.label}
											</div>
										))}
									</Card>
								)}
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
													if(isMobile) setMenuOpen(false)
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
														if(isMobile) setMenuOpen(false)
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
								<Button 
									style={{ width: '100%', marginTop: '15px' }} 
									onClick={() => {
										navigate('/campaigns/new');
										if(isMobile) setMenuOpen(false);
									}}
								>
									+ Create
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
			{isMobile && menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
		</>
	)
}

export default Sidemenu