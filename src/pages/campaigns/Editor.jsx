import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailEditor from '../../components/EmailEditor/index'
import PopupText from '../../components/PopupText/PopupText'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import { defaultState } from '../../components/EmailEditor/reducers/index'

function Editor({ editorType = 'campaign', currentCampaign, setStep }) {
	const navigate = useNavigate()
	const emailEditorRef = useRef(null)
	const [language, setLanguage] = useState('en')
	const [design, setDesign] = useState(null)
	const [key, setKey] = useState(0)
	const { account } = useAccount()

	const parseDesign = async (des) => {
		if (des) {
			console.log('in des', des)
			console.log('editorType is', editorType)
			//check if old builder
			if (des.components || des.styles) {
				await PopupText.fire({
					icon: 'warning',
					text: 'This campaign was created with the old version of Fairy Mail. You need to edit it with that version.',
					showCancelButton: false,
					onConfirm: () => {
						editorType === 'campaign' ? setStep(2) : navigate('/campaigns')
					},
				})
				return
			}
			if (des.bodySettings && des.blockList) {
				setDesign(des)
				console.log('after set design')
			}
		}
	}

	// Load or initialize design based on the current campaign
	useEffect(() => {
		//Should also implement design B here.
		if (currentCampaign && currentCampaign.design) {
			let des = JSON.parse(currentCampaign.design)
			parseDesign(des)
		} else {
			// For new templates/campaigns, initialize with presets if available
			const initialDesign = { blockList: [], fontList: [] };
			
			// Add bodySettings from presets if available
			if (account && account.custom_component && account.custom_component.presets) {
				const presets = account.custom_component.presets;
				
				// Use presets for bodySettings
				initialDesign.bodySettings = {
					styles: {
						color: presets.styles?.color ?? defaultState.bodySettings.styles.color,
						backgroundColor: presets.styles?.backgroundColor ?? defaultState.bodySettings.styles.backgroundColor,
						linkColor: presets.styles?.linkColor ?? '#FF635D',
						fontFamily: presets.styles?.fontFamily ?? defaultState.bodySettings.styles.fontFamily,
						backgroundImage: presets.styles?.backgroundImage ?? '',
					},
					contentWidth: presets.contentWidth ?? defaultState.bodySettings.contentWidth,
					preHeader: presets.preHeader ?? '',
					// Apply button defaults if available
					buttonDefaults: presets.buttonDefaults ? {
						...presets.buttonDefaults
					} : undefined,
					// Apply footer settings if available
					footerSettings: presets.footerSettings ? {
						...presets.footerSettings
					} : undefined,
					// Apply social links if available
					socialLinks: presets.socialLinks ? [...presets.socialLinks] : undefined
				};
				
				console.log('Using presets for new design:', initialDesign);
			} else {
				// Default settings if no presets available
				initialDesign.bodySettings = {
					styles: {
						...defaultState.bodySettings.styles,
						linkColor: '#FF635D',
						backgroundImage: '',
					},
					contentWidth: defaultState.bodySettings.contentWidth,
					preHeader: ''
				};
			}
			
			setDesign(initialDesign);
		}
	}, [currentCampaign, account])

	useEffect(() => {
		setKey((prevState) => prevState + 1)
		console.log('design from the editor is : ', design)
	}, [design])

	return (
		<div className="editor" style={{ width: '100%' }}>
			<div className="editor-content">
				{currentCampaign && design && design.blockList && (
					<EmailEditor
						key={key}
						ref={emailEditorRef}
						blockList={design.blockList}
						fontList={design.fontList}
						bodySettings={design.bodySettings}
						language={language}
						setStep={setStep}
						currentCampaign={currentCampaign}
						editorType={editorType}
						setDesign={setDesign}
					/>
				)}
			</div>
		</div>
	)
}

export default Editor