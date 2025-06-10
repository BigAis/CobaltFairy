// Update for PageHeader.jsx
import { React, useState, useEffect, useRef } from 'react'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../../components/PopupText/PopupText'

const getNameInitials = (name) => {
	if(!name) return "";
	return name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')
}

const PageHeader = () => {
	const navigate = useNavigate()
	const { user, account, loading, error, createNotification } = useAccount()
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const userMenuRef = useRef(null);
	
	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	
	// Handle click outside of dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
				setUserMenuOpen(false);
			}
		};
		
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);
	
	const userMenuOptions = [
		{
			label:'Profile',
			callback: () => {
				setUserMenuOpen(false);
				navigate('/settings/profile');
			}
		},
		{
			label:'Change Password',
			callback: () => {
				setUserMenuOpen(false);
				createNotification({
					message: 'Password change feature coming soon!',
					type: 'default',
					autoClose: 3000
				});
			}
		},
		{
			label:'Sign out',
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
					createNotification({
						message: 'You have been signed out successfully',
						type: 'default',
						autoClose: 3000
					});
					navigate('/login')
				}
			}
		}
	]
	
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
				<div className="user-info" ref={userMenuRef} onClick={(e) => {
					e.stopPropagation();
					setUserMenuOpen(!userMenuOpen);
				}}>
					<Card style={{marginRight:'20px', cursor:'pointer'}}>{getNameInitials(user?.user?.name)}</Card>
					<div className="user">
						<h4>{user?.user?.name}</h4>
						<span>{user?.user?.email}</span>
					</div>
					<Icon name="Caret" size={24}/>
					{userMenuOpen && (
						<Card className="user-menu" style={{background:'#FFF9EF'}}>
							{userMenuOptions.map((option) => (
								<div style={{fontSize:'16px'}} key={option.label} className="user-menu-option" onClick={() => {option.callback()}}>
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