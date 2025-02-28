import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './PopupText.scss' // Import external SCSS file
import Button from '../Button'

let popupRoot = null

const PopupText = ({
	text,
	html,
	icon,
	focusCancel = true,
	showConfirmButton = true,
	showDenyButton = false,
	showCancelButton = true,
	confirmButtonText = 'OK',
	denyButtonText = 'Deny',
	cancelButtonText = 'Cancel',
	onConfirm = () => {},
	onDeny = () => {},
	onCancel = () => {},
}) => {
	useEffect(() => {
		if (focusCancel) {
			setTimeout(() => {
				document.getElementById('popup-cancel')?.focus()
			}, 100)
		}
	}, [focusCancel])

	return (
		<div className="popup-overlay">
			<div className="popup-container">
				{icon && <div className={classNames('popup-icon', `popup-${icon}`)} />}
				{html ? <div className="popup-html">{html}</div> : <p className="popup-text">{text}</p>}
				<div className="popup-buttons">
					{showDenyButton && (
						<button className="popup-deny" onClick={onDeny}>
							{denyButtonText}
						</button>
					)}
					{showCancelButton && (
						<>
							<Button type="secondary" onClick={onCancel} className="popup-cancel" id="popup-cancel">
								{cancelButtonText}
							</Button>
						</>
					)}
					{showConfirmButton && (
						<>
							<Button onClick={onConfirm} className="popup-confirm">
								{confirmButtonText}
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

PopupText.propTypes = {
	text: PropTypes.string.isRequired,
	html: PropTypes.node,
	icon: PropTypes.oneOf(['question', 'success', 'error', 'warning', 'info']),
	focusCancel: PropTypes.bool,
	showConfirmButton: PropTypes.bool,
	showDenyButton: PropTypes.bool,
	showCancelButton: PropTypes.bool,
	confirmButtonText: PropTypes.string,
	denyButtonText: PropTypes.string,
	cancelButtonText: PropTypes.string,
	onConfirm: PropTypes.func,
	onDeny: PropTypes.func,
	onCancel: PropTypes.func,
}

PopupText.fire = (options) => {
	return new Promise((resolve) => {
		const div = document.createElement('div')
		document.body.appendChild(div)
		popupRoot = ReactDOM.createRoot(div) // Create root

		const handleClose = (action) => {
			PopupText.close() // Close popup
			resolve(action)
			if (action.isConfirmed && typeof options.onConfirm === 'function') {
				options.onConfirm() // Ensure onConfirm runs when OK is clicked
			}
		}

		popupRoot.render(
			<PopupText {...options} onConfirm={() => handleClose({ isConfirmed: true })} onDeny={() => handleClose({ isDenied: true })} onCancel={() => handleClose({ isCancelled: true })} />
		)
	})
}
PopupText.close = () => {
	if (popupRoot) {
		popupRoot.unmount() // Properly unmount in React 18
		popupRoot = null
	}
	const popupDiv = document.getElementById('popup-container')?.parentElement
	if (popupDiv) {
		document.body.removeChild(popupDiv)
	}
}

export default PopupText
