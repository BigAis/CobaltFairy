import { React } from 'react'
import './Logo.scss'

const Logo = ({style}) => {
    return (
        <>
            <div className='fairymail-logo-container' style={style}>
                <div className='fairymail-logo'></div>    
            </div>
        </>
    )
}

export default Logo