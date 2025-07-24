import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Switch.scss'; // Ensure you link the CSS file correctly

const Switch = ({ checked, label, onChange, className, ...props }) => {
    const computedClassName = classNames('switch' , className)
    
    const [isChecked, setIsChecked] = useState(checked);

    // CRITICAL FIX: Add this effect to update isChecked when the checked prop changes
    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    if(!onChange){
        onChange = ()=>{}
    }

    return (
        <label className="toggle-switch" style={props.style}>
            <input 
                type="checkbox" 
                checked={isChecked} 
                disabled={props.disabled}
                onChange={()=>{
                    onChange(!isChecked)
                    setIsChecked(!isChecked)
                }} 
            />
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
    disabled: PropTypes.bool
}


export default Switch;