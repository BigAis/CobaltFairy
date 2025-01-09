import {React} from 'react'
import './Sidemenu.scss'
import Logo from '../Logo/Logo'
import SubsCounter from '../SubsCounter'
import Button from '../Button'
import Icon from '../Icon/Icon'

const menu_items_upper = [
    {label:'Dashboard',path:'/',icon:'Dashboard'},
    {label:'Campaigns',path:'/campaigns',icon:'Campaigns'},
    {label:'Subscribers',path:'/subscribers',icon:'Subscribers'},
    {label:'Automations',path:'/automations',icon:'Automations'},
    {label:'Integrations',path:'/integrations',icon:'Integrations'},
    {label:'Stats',path:'/stats',icon:'Stats'},
]
const menu_items_lower = [
    {label:'Settings',path:'/settings',icon:'Settings'},
    {label:'Billing',path:'/billing',icon:'Billing'},
    {label:'Team',path:'/team',icon:'Team'},
    {label:'Refer a friend',path:'/refer-a-friend',icon:'ReferAFriend'},
]

const Sidemenu = ()=>{
    return (
        <>
        <div className='sidemenu'>
            <Logo/>

            <div className='menu_upper'>
                <ul>
                    {menu_items_upper.map(item=>{
                        return (
                            <>
                                <li>
                                    <Icon name={item.icon}></Icon>
                                    <a className='menu-entry'>{item.label}</a>
                                </li>
                            </>
                        )
                    })}
                </ul>
                
            </div>
            <div className='menu_lower'>
                <ul>
                    {menu_items_lower.map(item=>{
                        return (
                            <>
                                <li>
                                    <Icon name={item.icon}></Icon>
                                    <a className='menu-entry'>{item.label}</a>
                                </li>
                            </>
                        )
                    })}
                </ul>
                

            </div>
            <div className='menu_bottom'>
                <SubsCounter
                    currentSubs={500}
                    subsLimit={1500}
                    onClick={() => {
                        console.log('SubsCounter clicked!')
                    }}
                >
                    {' '}
                </SubsCounter>
                <br></br>
                <Button style={{width:'100%'}}>+ Create</Button>

            </div>

        </div>
        </>
    )
}

export default Sidemenu;