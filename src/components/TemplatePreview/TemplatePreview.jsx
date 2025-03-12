import { useState } from 'react'
import Icon from '../Icon/Icon'
import './TemplatePreview.scss'

const TemplatePreview = ({ template_udid, show=false, onClose }) => {
    const [isLoading, setLoading] = useState(true);

    return (
        <>
        {show && 
            <div className="preview-overlay" onClick={onClose}>
                <div className="preview-container">
                    <Icon name={'Close'} className={'close-icon'}/>
                    {isLoading && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                           <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="200" height="200" style={{shapeRendering:'auto',display:'block',background:'transparent'}}>
                                <g><circle fill="none" stroke-width="10" stroke="#fff2df" r="30" cy="50" cx="50"></circle>
                                <circle fill="none" stroke-linecap="round" stroke-width="8" stroke="#ff635e" r="30" cy="50" cx="50">
                                <animateTransform keyTimes="0;0.5;1" values="0 50 50;180 50 50;720 50 50" dur="1.5625s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform>
                                <animate keyTimes="0;0.5;1" values="18.84955592153876 169.64600329384882;94.2477796076938 94.24777960769377;18.84955592153876 169.64600329384882" dur="1.5625s" repeatCount="indefinite" attributeName="stroke-dasharray"></animate>
                                </circle><g></g></g>
                            </svg>
                        </div>
                    )}
                    <iframe onLoad={() => {setLoading(false)}} src={`https://fairymail.cobaltfairy.com/api/fairymailer/load-campaign-body/${template_udid}`} border="0" style={{width:'100%', height:'100%', border:0, display: isLoading ? 'none' : 'block'}}/>
                </div>
            </div>  
    }
        </>
    )
}


export default TemplatePreview
