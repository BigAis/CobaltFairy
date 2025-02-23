import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Switch.scss'; // Ensure you link the CSS file correctly

const Switch = ({ checked, label, onChange, className, ...props }) => {
    const computedClassName = classNames('switch' , className)
    
    const [isChecked, setIsChecked] = useState(checked);

    if(!onChange){
        onChange = ()=>{}
    }

    return (
        <label className="toggle-switch" style={props.style}>
            <input type="checkbox" checked={isChecked} onChange={()=>{
                onChange(!isChecked)
                setIsChecked(!isChecked)
            }} />
            <span className="slider"></span>
            {label && (<span className='switch-label'>{label}</span>)}
        </label>
    );
}

Switch.propTypes = {
    checked: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
}


export default Switch;
