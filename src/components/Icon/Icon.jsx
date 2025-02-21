import PropTypes from 'prop-types'
import icons from './assets'
import classNames from 'classnames'
import './Icon.scss'

console.log('icons are : ', icons)

const Icon = ({ name, size, className, style }) => {
	const IconComponent = icons[name]

	if (!IconComponent) {
		console.warn(`Icon "${name}" not found.`)
		return null
	}

	return <IconComponent className={classNames('icon', className)} style={size && { width: `${size}px`, height: `${size}px`, ...style }} />
}

Icon.propTypes = {
	name: PropTypes.string.isRequired,
	size: PropTypes.number,
	rightIcon: PropTypes.bool,
	className: PropTypes.string,
	style: PropTypes.object,
}

Icon.defaultProps = {
	className: '',
}

export default Icon
