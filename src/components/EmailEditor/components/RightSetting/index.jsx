import { useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ColorPicker from '../ColorPicker'
import { GlobalContext } from '../../reducers'
import { InputNumber, Input, Select } from 'antd'
import StyleSettings from '../StyleSettings'
import useLayout from '../../utils/useStyleLayout'
import useTranslation from '../../translation'
import InputText from '../../../InputText/InputText'
import useDataSource from '../../configs/useDataSource'
import ImageUploadPopup from '../StyleSettings/ImageUploadPopup'
import Button from '../../../Button'

const RightSetting = () => {
	const { currentItem, isDragStart, blockList, setBlockList, bodySettings, setBodySettings } = useContext(GlobalContext)
	const { fontsList } = useDataSource()
	const [fontFamily, setFontFamily] = useState('Inter, sans-serif')
	const [pickerVisible, setPickerVisible] = useState(false)

	const { t } = useTranslation()
	const { cardItemElement } = useLayout()
	const blockTitle = () => {
		let title = 'Block'
		const type = currentItem?.data.key
		switch (type) {
			case 'text':
				title = t('text_settings')
				break
			case 'column':
				title = t('column_settings')
				break
			case 'heading':
				title = t('heading_settings')
				break
			case 'button':
				title = t('button_settings')
				break
			case 'divider':
				title = t('divider_settings')
				break
			case 'image':
				title = t('image_settings')
				break
			case 'social_link':
				title = t('social_link_settings')
				break
			default:
				break
		}
		return title
	}

	const colorChange = (key) => (color) => {
		setBodySettings({ ...bodySettings, styles: { ...bodySettings.styles, [key]: color.hex } }, 'set_body_settings')
		if (key === 'linkColor') {
			recursivelyUpdateBlocks(blockList, color.hex, bodySettings.styles?.fontFamily ?? 'Inter')
		}
		console.log(blockList)
	}

	const updateFontFamily = (value) => {
		console.log('updateFontFamily', value)
		setFontFamily(value)
		setBodySettings({ ...bodySettings, styles: { ...bodySettings.styles, fontFamily: value } }, 'set_body_settings')
		recursivelyUpdateBlocks(blockList, bodySettings?.styles?.linkColor ?? '#000', value)
	}

	const recursivelyUpdateBlocks = (items, linkColor = '', fontFamily = '', returndata = false) => {
		console.log('recursivelyUpdateBlocks', items, linkColor, fontFamily, returndata)
		let newblockList = items.map((obj) => {
			if (obj.text && obj.text.includes('<a')) {
				const parser = new DOMParser()
				const doc = parser.parseFromString(obj.text, 'text/html')
				const link = doc.querySelector('a')
				if (link) {
					link.style.color = linkColor
				}
				const newHtmlString = doc.body.innerHTML
				if (newHtmlString) obj.text = newHtmlString
			}

			if (obj.text && obj.styles) {
				console.log('obj.styles', obj.styles)
				obj.styles = {
					...obj.styles,
					desktop: { ...obj.styles.desktop, fontFamily },
					mobile: { ...obj.styles.mobile, fontFamily },
				}
			}
			if (Array.isArray(obj.children)) {
				obj.children = recursivelyUpdateBlocks(obj.children, linkColor, fontFamily, true)
			}
			return obj
		})
		if (returndata) return newblockList
		setBlockList([...newblockList])
	}

	const bgImageUrlChange = (key) => (event) => {
		setBodySettings(
			{ ...bodySettings, styles: { ...bodySettings.styles, backgroundImage: `url('${event.target.value}')` }, backgroundSize: 'auto', backgroundPosition: 'center center' },
			'set_body_settings'
		)
	}

	const bgImagePick = (src) => {
		setBodySettings({ ...bodySettings, styles: { ...bodySettings.styles, backgroundImage: `url('${src}')`, backgroundSize: 'auto', backgroundPosition: 'center center' } }, 'set_body_settings')
	}

	const stripUrlStyle = (src) => {
		return src.replace("url('", '').replace("')", '')
	}

	const themeElement = () => {
		return (
			<>
				<div className="subject-settings">{t('body_settings')}</div>
				<div className="margin-top-32">
					{cardItemElement(t('text_color'), <ColorPicker color={bodySettings.styles.color} setColor={colorChange('color')} />)}
					{cardItemElement('Links Color', <ColorPicker color={bodySettings.styles.linkColor ?? '#fff'} setColor={colorChange('linkColor')} />)}
					{cardItemElement('Background Color (Theme)', <ColorPicker color={bodySettings.styles.backgroundColor} setColor={colorChange('backgroundColor')} />)}
					<div className="card-item">
						<div className="width-full">
							<div className="card-item-title">Background Image</div>
							<div className="margin-top-6">
								<Input value={stripUrlStyle(bodySettings.styles?.backgroundImage ?? '')} placeholder="Paste Image URL here or choose below:" onChange={bgImageUrlChange('src')} />
							</div>
							<Button
								type="secondary"
								onClick={() => {
									setPickerVisible(true)
								}}
								className={'imagePicker'}
							>
								Choose Image
							</Button>
							<ImageUploadPopup shown={pickerVisible} setShown={setPickerVisible} selectImage={bgImagePick}></ImageUploadPopup>
						</div>
					</div>
					{cardItemElement(
						t('font_family'),
						<Select className="input-width" value={fontFamily} onChange={updateFontFamily}>
							{fontsList.map((item) => (
								<Select.Option key={item.name} value={item.attribute}>
									{item.name}
								</Select.Option>
							))}
						</Select>
					)}

					{cardItemElement(
						'Container Width',
						<InputNumber
							className="input-width"
							addonAfter="px"
							min={0}
							max={900}
							value={Number(bodySettings.contentWidth)}
							onChange={(value) => setBodySettings({ ...bodySettings, contentWidth: value }, 'set_body_settings')}
						/>
					)}
					<div>
						{/* <div className="pre_header">{t("pre_header")}</div> */}
						<InputText
							label="Pre header"
							className=""
							value={bodySettings.preHeader}
							onChange={(event) => setBodySettings({ ...bodySettings, preHeader: event.target.value }, 'set_body_settings')}
						/>
						<div className="pre_header-desc" style={{ textAlign: 'left' }}>
							{t('pre_header_description')}
						</div>
					</div>
				</div>
			</>
		)
	}

	const stopPropagation = (event) => {
		event.stopPropagation()
	}

	return (
		<div className="right-settings default-scrollbar" onClick={stopPropagation}>
			<AnimatePresence mode="wait">
				{!isDragStart && currentItem && currentItem.type === 'edit' ? (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }} key={0}>
						<h2 className="right-setting-block-title">{blockTitle()}</h2>
						<div className="margin-top-18">
							<StyleSettings />
						</div>
					</motion.div>
				) : (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }} key={1}>
						{themeElement()}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default RightSetting
