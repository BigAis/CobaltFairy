import React, { useState } from 'react'

import action from '/images/automations/action.png'
import clock from '/images/automations/clock.png'
import condition from '/images/automations/condition.png'
import mail from '/images/automations/mail.png'

import Card from '../../components/Card'

const NodeTypeSelector = ({ shown, onSelected, onDismissed, selectedCondition=true }) => {
	return shown ? (
        <Card className="popover workflow-steps">
            <div className="arrow" ></div>
  
            <div className="popover-content">
                <div className="steps-popup ng-scope">
                    <h3 className="ng-binding">Add a next step to your workflow&nbsp;&nbsp;&nbsp;&nbsp;
                        <i className="fa fa-times" style={{fontWeight:'normal',cursor:'pointer'}} onClick={onDismissed}></i>
                    </h3>
                    <ul> 
                    <li onClick={()=>{onSelected('email',selectedCondition?0:1)}}>
                            <img src={mail}/>
                            <div className="ng-binding">Email</div>
                        </li>
                        <li onClick={()=>{onSelected('delay',selectedCondition?0:1)}}>
                            <img src={clock}/>
                            <div className="ng-binding">Delay</div>
                        </li>
                        <li onClick={()=>{onSelected('condition',selectedCondition?0:1)}}>
                            <img src={condition}/>
                            <div className="ng-binding">Condition</div>
                        </li>
                        <li onClick={()=>{onSelected('action',selectedCondition?0:1)}}>
                            <img src={action}/>
                            <div className="ng-binding">Action</div>
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
    ) : <></>
}

export default NodeTypeSelector
