import React, { useState, useEffect } from 'react'
import './Sidemenu.scss'
import Logo from '../Logo/Logo'
import SubsCounter from '../SubsCounter'
import Button from '../Button'
import Icon from '../Icon/Icon'
import { useNavigate, useLocation } from 'react-router-dom'

const menu_items_upper = [
	{ label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' },
	{ label: 'Campaigns', path: '/campaigns', icon: 'Campaigns' },
	{ label: 'Subscribers', path: '/subscribers', icon: 'Subscribers' },
	{ label: 'Automations', path: '/automations', icon: 'Automations' },
	{ label: 'Integrations', path: '/integrations', icon: 'Integrations' },
	{ label: 'Stats', path: '/stats', icon: 'Stats', disabled: true },
]
const menu_items_lower = [
	{ label: 'Settings', path: '/settings', icon: 'Settings', disabled: true },
	{ label: 'Billing', path: '/billing', icon: 'Billing', disabled: true },
	{ label: 'Team', path: '/team', icon: 'Team', disabled: true },
	{ label: 'Refer a Friend', path: '/refer-a-friend', icon: 'ReferAFriend', disabled: true },
]

const Sidemenu = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const [menuOpen, setMenuOpen] = useState(false)

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

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
			if (window.innerWidth > 768) {
				setMenuOpen(false)
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Close menu when clicking outside on mobile
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (isMobile && menuOpen && !e.target.closest('.sidemenu')) {
				setMenuOpen(false)
			}
		}
		
		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [isMobile, menuOpen])

	const activeItem = getActiveItem();

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
							{menuOpen ? null : (
								<div className="mobile-title">
									{activeItem && activeItem.label}
								</div>
							)}
						</>
					)}

					<Logo />

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
							currentSubs={200}
							subsLimit={500}
							onClick={() => {
								console.log('SubsCounter clicked!')
							}}
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
				</div>
			</div>
			{isMobile && menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
		</>
	)
}

export default Sidemenu