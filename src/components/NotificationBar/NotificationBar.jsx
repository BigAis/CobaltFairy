import PropTypes from 'prop-types'
import classNames from 'classnames'
import './NotificationBar.scss'

const NotificationBar = ({ message, type = 'default', onClose, autoClose=-1 }) => {
	if(autoClose && autoClose>0){
		setTimeout(()=>{onClose()},autoClose)
	}
	return (
		<div className={classNames('notification-bar', type)}>
			<span className="notification-message">{message}</span>
			<button className="close-button" onClick={onClose}>
				×
			</button>
		</div>
	)
}

NotificationBar.propTypes = {
	message: PropTypes.string.isRequired,
	type: PropTypes.oneOf(['default', 'warning']), // Restrict type to "default" or "warning"
	onClose: PropTypes.func.isRequired, // Callback for the close button
	autoClose: PropTypes.number, // 
}

export default NotificationBar
