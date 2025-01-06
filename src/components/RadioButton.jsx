import React, { useState } from 'react';
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './RadioButton.scss';

const RadioButton = ({ options, value, onChange, className, ...props }) => {
  const [selectedOption, setSelectedOption] = useState(value ? value : null);
  const computedClassName = classNames('radio-buttons' , className)

  if(!onChange){
    onChange = ()=>{}
  }
  const handleChange = (event) => {
    setSelectedOption(event.target.value);
    onChange(event.target.value)
  };

  return (
    <div className={computedClassName} {...props}>

        {options.map(o=>(
            <>
                <label className="radio-button">
                    {o.label}
                    <input
                    type="radio"
                    value={o.value}
                    checked={selectedOption == o.value}
                    onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                </label>
            </>
        ))}
    </div>
  );
}
RadioButton.propTypes = {
    options: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
}

export default RadioButton;
