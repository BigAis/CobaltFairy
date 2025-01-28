// import React, { useState } from 'react';
// import PropTypes from 'prop-types'
// import classNames from 'classnames'
// import './Checkbox.scss';

// const Checkbox = ({ checked, label, onChange, className, ...props }) => {
//   const [isChecked, setIsChecked] = useState(checked);

//   if(!onChange){
//     onChange=()=>{}
//   }
//   const toggleCheckbox = () => {
//     onChange(!isChecked);
//     setIsChecked(!isChecked);
//   };

//   return (
//     <label className="custom-checkbox">
//       <input
//         type="checkbox"
//         checked={isChecked}
//         onChange={toggleCheckbox}
//       />
//       <span className="checkmark"></span>
//       <span>{label}</span>
//     </label>
//   );
// }

// Checkbox.propTypes = {
//     checked: PropTypes.bool,
//     label: PropTypes.string,
//     onChange: PropTypes.func,
//     className: PropTypes.string,
// }
// export default Checkbox;

import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Checkbox.scss'

const Checkbox = ({ checked, label, onChange, className, ...props }) => {
	return (
		<label className={classNames('custom-checkbox', className)}>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => {
					if (onChange) {
						onChange(e.target.checked)
					}
				}}
				{...props}
			/>
			<span className="checkmark"></span>
			<span>{label}</span>
		</label>
	)
}

Checkbox.propTypes = {
	checked: PropTypes.bool,
	label: PropTypes.string,
	onChange: PropTypes.func,
	className: PropTypes.string,
}

export default Checkbox
