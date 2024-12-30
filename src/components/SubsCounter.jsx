import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from './Button'
import './SubsCounter.scss'

const SubsCounter = ({ children, currentSubs, subsLimit, onClick, className, ...props }) => {

    const computedClassName = classNames(
        'subs-counter',
        'd-flex',
        className 
    )
    const formatNum = (num) => {
        if (num < 1000) { return num; 0}
        if (num < 1000000) { return (num / 1000).toFixed(1) + 'k'; }
        if (num < 1000000000) { return (num / 1000000).toFixed(1) + 'M';  }
        if (num < 1000000000000) { return (num / 1000000000).toFixed(1) + 'B';  }
        return (num / 1000000000000).toFixed(1) + 'T';  
    }
    const progressValue = () => {
       return (currentSubs / subsLimit) * 100;
    }

    return (
        <div className={computedClassName}>
            <div className='leftPart'>
                <div className='text'>{currentSubs}/{formatNum(subsLimit)} Subscribers</div>
                <div className='progress-container'>
                    <div className="progress-bar" id="progressBar" style={{width:progressValue()+'%'}}></div>
                </div>
            </div>
            <div className='rightPart' onClick={onClick}>
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.32999 18.17C9.11931 17.9591 9.00098 17.6731 9.00098 17.375C9.00098 17.0769 9.11931 16.791 9.32999 16.58L13.41 12.5L9.32999 8.42001C9.21946 8.31702 9.1308 8.19282 9.06931 8.05482C9.00783 7.91682 8.97476 7.76785 8.9721 7.6168C8.96943 7.46574 8.99722 7.3157 9.0538 7.17562C9.11038 7.03553 9.1946 6.90828 9.30143 6.80146C9.40826 6.69463 9.53551 6.61041 9.67559 6.55383C9.81567 6.49725 9.96572 6.46946 10.1168 6.47213C10.2678 6.47479 10.4168 6.50785 10.5548 6.56934C10.6928 6.63083 10.817 6.71948 10.92 6.83001L15.795 11.705C16.0057 11.916 16.124 12.2019 16.124 12.5C16.124 12.7981 16.0057 13.0841 15.795 13.295L10.92 18.17C10.709 18.3807 10.4231 18.499 10.125 18.499C9.82686 18.499 9.54092 18.3807 9.32999 18.17Z" fill="black"/>
                </svg>
            </div>
        </div>
    )
}


SubsCounter.propTypes = {
    children: PropTypes.node,
    currentSubs: PropTypes.number,
    subsLimit: PropTypes.number,
    onClick: PropTypes.func,
    className: PropTypes.string,
}

export default SubsCounter


