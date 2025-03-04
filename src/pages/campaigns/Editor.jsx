import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailEditor from '../../components/EmailEditor/index'
import PopupText from '../../components/PopupText/PopupText'

function Editor({ editorType = 'campaign', currentCampaign, setStep }) {
	const navigate = useNavigate()
	const emailEditorRef = useRef(null)
	const [language, setLanguage] = useState('en')
	const [design, setDesign] = useState(null)
	const [key, setKey] = useState(0)

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
	useEffect(() => {
		//Should also implement design B here.
		if (currentCampaign && currentCampaign.design) {
			let des = JSON.parse(currentCampaign.design)
			parseDesign(des)
		} else {
			setDesign({ blockList: [], bodySettings: [], fontList: [] })
		}
	}, [currentCampaign])

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
