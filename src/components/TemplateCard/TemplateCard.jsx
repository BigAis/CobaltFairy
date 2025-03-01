import PropTypes from 'prop-types'
import Card from '../Card'
import Button from '../Button'

const TemplateCard = ({ templateName, onPreviewClick, onEditClick }) => {
	return (
		<Card style={{ position: 'relative', textAlign: 'left' }}>
			<p className="template-card-label">Premade</p>
			<div className="template-card-contents d-flex flex-column gap-10">
				<img src="/src/pages/campaigns/cmp_preview.png" alt="Template Preview" />
				<p>{templateName}</p>
				<div className="d-flex gap-5">
					<Button style={{ flex: '1' }} type="secondary" onClick={onPreviewClick}>
						Preview
					</Button>
					<Button style={{ flex: '1' }} type="secondary" onClick={onEditClick}>
						Edit
					</Button>
				</div>
			</div>
		</Card>
	)
}

// Prop validation
TemplateCard.propTypes = {
	templateName: PropTypes.string.isRequired,
	onPreviewClick: PropTypes.func.isRequired,
	onEditClick: PropTypes.func.isRequired,
}

export default TemplateCard
