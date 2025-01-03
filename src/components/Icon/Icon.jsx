import PropTypes from 'prop-types'
import icons from './assets'
import classNames from 'classnames'
import './Icon.scss'

console.log('icons are : ', icons)

const Icon = ({ name, size, className }) => {
	const IconComponent = icons[name]

	if (!IconComponent) {
		console.warn(`Icon "${name}" not found.`)
		return null
	}

	return <IconComponent className={classNames('icon', className)} style={size && { width: `${size}px`, height: `${size}px` }} />
}

Icon.propTypes = {
	name: PropTypes.string.isRequired,
	size: PropTypes.number,
	className: PropTypes.string,
}

Icon.defaultProps = {
	className: '',
}

export default Icon
