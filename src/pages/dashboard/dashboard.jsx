import './dashboard.scss';
import '../../fullpage.scss';
import {React} from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu';
import Card from '../../components/Card';
import Icon from '../../components/Icon/Icon';
import Button from '../../components/Button';
import Stat from '../../components/Stat/Stat';
import ButtonGroup from '../../components/ButtonGroup';

const account = {
    name:'Cobalt Fairy',
    plan:'Free Plan'
}
const user ={
    name:'Cobalt Fairy',
    email:'cf@fairymail.app'
}
const getNameInitials = (name)=> name.split(' ').map(word => word[0].toUpperCase()).join('');
const stats = [
    {
        label: 'Emails Sent',
        value: '752',
        percentage: -12,
        defaultValue: false, // This will be the default selected option
    },
    {
        label: 'Totals Clicks',
        value: '159',
        percentage: 17,
        defaultValue: false,
    },
    {
        label: 'Total Opens',
        value: '340',
        percentage: 19,
        defaultValue: false,
    },
    {
        label: 'Spam',
        value: '85',
        percentage: 5,
        defaultValue: false,
    },
]
const subs_stats = [
    {
        label: 'Total',
        value: '752',
        default:false,
        percentage: 5,
    },
    {
        label: 'Unsubscribed',
        value: '159',
        default:true,
        percentage: 5,
    },
]
const Dashboard = () => {
    return (
        <>
            <div className='dashboard-wrapper'>
                <Sidemenu/>
                <div className='dashboard-container'>
                    <div className='dashboard-head'>
                        <Card className='account-info-card'>
                            <div className='account-info'>
                                <div>
                                    <h4>{account.name}</h4>
                                    <span>{account.plan}</span>
                                </div>
                                <Icon name="Caret" size={16}/>
                            </div>
                        </Card>
                        <div className="user-info">
                            <Card>
                                {getNameInitials(user.name)}
                            </Card>
                            <div className='user'>
                                <h4>{user.name}</h4>
                                <span>{user.email}</span>
                            </div>
                            <Icon name="Caret" size={24}/>
                        </div>
                    </div>
                    <div className='page-name'>
                        Dashboard
                    </div>
                    <Card className='dashboard-stats'>
                        <div className='stats-head'>
                            <span className='stats-title'>Campaigns</span>
                            <ButtonGroup
								value="today"
								options={[
									{ value: 'today', label: 'Today' },
									{ value: '7days', label: '7 Days' },
									{ value: '30days', label: '30 Days' },
									{ value: 'all', label: 'All' },
								]}
								onChange={(value) => {
									console.log(value)
								}}
							></ButtonGroup>
                        </div>
                        <div>
                            <div className="campaign-charts d-flex gap-30">
                                <Stat stats={stats} hasChart={true} defaultLabel={'Emails Sent'} />
                                <Stat stats={stats} hasChart={true} defaultLabel={'Total Clicks'} />
                                <Stat stats={stats} hasChart={true} defaultLabel={'Total Opens'} />
                                <Stat stats={stats} hasChart={true} defaultLabel={'Spam'} />
                            </div>
                        </div>
                    </Card>
                    <div className='dashboard-ctas'>
                        <Button type={'secondary'}><Icon name="Campaigns"/>Create Campaign</Button>
                        <Button type={'secondary'}><Icon name="Contacts"/>Import Contacts</Button>
                        <Button type={'secondary'}><Icon name="Automations"/>Create Automation</Button>
                    </div>
                    <div className='columns-2'>
                        <Card className='subscribers-stats'>
                            <div className='stats-head'>
                                <span className='stats-title'>Subscribers</span>
                                <ButtonGroup
                                    value="today"
                                    options={[
                                        { value: 'today', label: 'Today' },
                                        { value: '7days', label: '7 Days' },
                                        { value: 'all', label: 'All' },
                                    ]}
                                    onChange={(value) => {
                                        console.log(value)
                                    }}
                                ></ButtonGroup>
                            </div>
                            <br></br>
                            <div className="campaign-charts d-flex gap-30">
                                <div>
                                    <Stat stats={subs_stats} hasChart={false} defaultLabel={'Total'} />
                                </div>
                                <div>
                                    <Stat stats={subs_stats} hasChart={false} defaultLabel={'Unsubscribed'} />
                                </div>
                            </div>
                            <br></br>
                            <Button type={'secondary'}>All Subscribers</Button>
                        </Card>
                        <Card className='subscribers-stats'>
                            <div className='stats-head'>
                                <span className='stats-title'>Latest Campaigns</span>
                                <ButtonGroup
                                    value="today"
                                    options={[
                                        { value: 'today', label: 'Today' },
                                        { value: '7days', label: '7 Days' },
                                        { value: 'all', label: 'All' },
                                    ]}
                                    onChange={(value) => {
                                        console.log(value)
                                    }}
                                ></ButtonGroup>
                            </div>
                            <br></br>
                            <Button type={'secondary'}>All Campaigns</Button>
                        </Card>
                    </div>

                </div>
            </div>
        </>

     );
}
 
export default Dashboard;