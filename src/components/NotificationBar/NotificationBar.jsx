import PropTypes from 'prop-types'
import classNames from 'classnames'
import './NotificationBar.scss'

const NotificationBar = ({ message, type = 'default', onClose, autoClose=-1, count = null }) => {
	if(autoClose && autoClose>0){
		setTimeout(()=>{onClose()},autoClose)
	}
	return (
		<div className={classNames('notification-bar', type)}>
			<span className="notification-message">
				{message}
				{count && <span className="notification-count">({count})</span>}
			</span>
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
	autoClose: PropTypes.number, // Auto-close timeout in ms, -1 for no auto-close
	count: PropTypes.number, // Number of duplicate notifications
}

export default NotificationBar