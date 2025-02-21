import { useState } from 'react'
import Checkbox from '../../components/Checkbox'
import Icon from '../../components/Icon/Icon'
import InputText from '../../components/InputText/InputText'
import Sidemenu from '../../components/Sidemenu/Sidemenu'

const NewCampaign = () => {
	const [abSplit, setAbSplit] = useState(false)

	const handleCheckAbSplit = () => {
		setAbSplit(!abSplit)
	}

	return (
		<>
			<div className="fm-page-wrapper justify-content-center">
				<div className="fm-content-wrapper d-flex gap-50 align-items-center justify-content-center">
					<div className="new-campaign-left flex-1">
						<h1 className="campaign-title">Campaign Details</h1>
						<InputText label={'Campaign Title'} />
						<InputText label={'Subject'} icon={'Envelope'} />
						<div className="d-flex align-items-center">
							<Icon name={'Plus'} />
							<p>Add Personalization</p>
						</div>
						<Checkbox label={'A/B Split Campaign'} onChange={handleCheckAbSplit} />
						{abSplit && (
							<>
								<InputText label={'A/B Split Campaign'} />
							</>
						)}
					</div>
					<div className="new-campaign-right flex-1">
						<div className="campaign-preview-wrapper d-flex flex-column align-items-center">
							<div className="campaign-preview-title w-90 d-flex align-items-center">
								{' '}
								<Icon name="Envelope" className={'mr10'} />
								Inbox Preview
							</div>
							<div className="campaign-preview-first-row w-90">
								<div className="skeleton-1"></div>
								<div className="skeleton-2"></div>
							</div>
							<div className="campaign-preview-second-row campaign-preview-active-row w-100">
								<p>Sender</p>
								<p>Subject Goes Here</p>
								<p>Your email preheader will appear here.</p>
							</div>
							<div className="campaign-preview-third-row w-90">
								<div className="skeleton-1"></div>
								<div className="skeleton-2"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NewCampaign
