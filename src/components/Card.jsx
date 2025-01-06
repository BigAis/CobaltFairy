import { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Card.scss'

const Card = ({ children, onClick, className, ...props }) => {
	
const computedClassName = classNames('card' , className)

    return (
        <>
            <div className={computedClassName}>
                {children}
            </div>
        </>
    )
}


Card.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
}

export default Card
