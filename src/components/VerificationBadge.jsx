import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './VerificationBadge.scss'

const VerificationBadge = ({ isVerified, className, ...props }) => {
    
const computedClassName = classNames('verified-badge' , className)
    return (
        <>
            <div className={computedClassName}>
                <div className={`badge badge-${isVerified?'verified':'unverified'}`}></div>
                <p>{isVerified?'Verified':'Unverified'}</p>
            </div>
        </>
    )
}


VerificationBadge.propTypes = {
    isVerified: PropTypes.bool,
    className: PropTypes.string,
}

export default VerificationBadge
