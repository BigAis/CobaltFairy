import { React, useState } from 'react'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../../components/PopupText/PopupText'

const getNameInitials = (name) =>{
	if(!name) return "";
	return name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')
}

const PageHeader = () => {
	const navigate = useNavigate()
	const { user, account, loading, error } = useAccount()
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const userMenuOptions = [
		{
			label:'Sign out',
			callback: async ()=>{
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
	return (
		<div className="fm-page-head" onClick={()=>{setUserMenuOpen(false)}}>
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
			<div className="user-info" onClick={(e)=>{setUserMenuOpen(true);e.stopPropagation()}}>
				<Card style={{marginRight:'20px', cursor:'pointer'}} onClick={()=>{}}>{getNameInitials(user?.user?.name)}</Card>
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
		</div>
	)
}
export default PageHeader
