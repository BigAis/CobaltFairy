import { React } from 'react'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import { useNavigate } from 'react-router-dom'


const getNameInitials = (name) =>
	name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')


const PageHeader = ({user,account})=>{

    const navigate = useNavigate();
    return (
        <div className="fm-page-head">
            <Card className="account-info-card">
                <div className="account-info" onClick={()=>{ navigate('/payment-plan', { replace: true }) }}>
                    <div>
                        <h4>{account.name}</h4>
                        <span>{account.plan}</span>
                    </div>
                    <Icon name="Caret" size={16} />
                </div>
            </Card>
            <div className="user-info">
                <Card>{getNameInitials(user.name)}</Card>
                <div className="user">
                    <h4>{user.name}</h4>
                    <span>{user.email}</span>
                </div>
                <Icon name="Caret" size={24} />
            </div>
        </div>
    )
}
export default PageHeader;