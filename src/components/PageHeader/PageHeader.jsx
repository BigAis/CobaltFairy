import { React } from 'react'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'

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
	console.log('user account',user,account)
	return (
		<div className="fm-page-head">
			<Card className="account-info-card">
				<div
					className="account-info"
					onClick={() => {
						navigate('/payment-plan', { replace: true })
					}}
				>
					<div>
						<h4>{account?.name}</h4>
						<span>{account?.payment_plan?.name || ''}</span>
					</div>
					<Icon name="Caret" size={16} />
				</div>
			</Card>
			<div className="user-info">
				<Card style={{marginRight:'20px', cursor:'pointer'}} onClick={()=>{navigate('/choose-account')}}>{getNameInitials(account?.name)}</Card>
				<div className="user">
					<h4>{user?.user?.name}</h4>
					<span>{user?.user?.email}</span>
				</div>
				<Icon name="Caret" size={24} />
			</div>
		</div>
	)
}
export default PageHeader
