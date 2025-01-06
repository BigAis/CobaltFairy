import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './TemplateBadge.scss'

const VerificationBadge = ({ type, className, ...props }) => {
    
const computedClassName = classNames(`template-badge template-badge-${type=="custom"?'custom':'premade'}` , className)
    return (
        <>
            <div className={computedClassName}>
                <p>{type=="custom"?'Custom':'Premade'}</p>
            </div>
        </>
    )
}


VerificationBadge.propTypes = {
    isVerified: PropTypes.bool,
    className: PropTypes.string,
}

export default VerificationBadge
