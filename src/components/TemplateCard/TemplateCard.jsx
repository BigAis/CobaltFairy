import PropTypes from 'prop-types'
import Card from '../Card'
import Button from '../Button'
import VerificationBadge from '../TemplateBadge'
import { useState } from 'react'

const TemplateCard = ({ template_udid, templateName, onPreviewClick, onEditClick, onDeleteClick }) => {
	const [isImgLoading,setIsImgLoading] = useState(true);
	const imageUrl= `https://cdn.cobaltfairy.com/fairymail/template/img/${template_udid}`;
	return (
		<Card style={{ position: 'relative', textAlign: 'left' }}>
			<VerificationBadge type={'custom'}/>
			<div className="template-card-contents d-flex flex-column gap-10">
				<img src={imageUrl} alt="" style={{ display: 'none' }} onLoad={()=>{setIsImgLoading(false)}} />
				{isImgLoading && <div style={{minHeight:'150px'}}><div style={{ position:'absolute',top: '40%', left: '50%', transform: 'translate(-50%, -50%) scale(.5)' }}><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="200" height="200" style={{shapeRendering:'auto',display:'block',background:'transparent'}}><g><circle fill="none" stroke-width="10" stroke="#fff2df" r="30" cy="50" cx="50"></circle><circle fill="none" stroke-linecap="round" stroke-width="8" stroke="#ff635e" r="30" cy="50" cx="50"><animateTransform keyTimes="0;0.5;1" values="0 50 50;180 50 50;720 50 50" dur="1.5625s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform><animate keyTimes="0;0.5;1" values="18.84955592153876 169.64600329384882;94.2477796076938 94.24777960769377;18.84955592153876 169.64600329384882" dur="1.5625s" repeatCount="indefinite" attributeName="stroke-dasharray"></animate></circle><g></g></g></svg></div></div>}
				{!isImgLoading && <div style={{minHeight:'200px',width:'100%',background:`url('${imageUrl}')`,backgroundRepeat:'no-repeat',backgroundSize:'cover',backgroundPositionY:0}}></div>}
				<p>{templateName}</p>
				<div className="d-flex gap-5">
					<Button style={{ flex: '1' }} type="secondary" onClick={onPreviewClick}>
						Preview
					</Button>
					<Button style={{ flex: '1' }} type="secondary" onClick={onEditClick}>
						Edit
					</Button>
					<Button 
						type="secondary" 
						icon="Trash" 
						onClick={onDeleteClick}
						blackIcon={true}
						className="delete-template-btn"
					/>
				</div>
			</div>
		</Card>
	)
}

// Prop validation
TemplateCard.propTypes = {
	template_udid: PropTypes.string.isRequired,
	templateName: PropTypes.string.isRequired,
	onPreviewClick: PropTypes.func.isRequired,
	onEditClick: PropTypes.func.isRequired,
	onDeleteClick: PropTypes.func.isRequired,
}

export default TemplateCard
