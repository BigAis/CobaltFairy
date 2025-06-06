import { useContext } from 'react'
import { GlobalContext } from '../../reducers'
import classNames from '../../utils/classNames'
import { InputNumber, Select } from 'antd'
import Dropdown from '../../../Dropdown'
import ColorPicker from '../ColorPicker'
import PaddingSettings from './PaddingSettings'
import useLayout from '../../utils/useStyleLayout'
import { faAlignCenter, faAlignLeft, faAlignRight, faAlignJustify } from '@fortawesome/free-solid-svg-icons'
import useTranslation from '../../translation'
import useDataSource from '../../configs/useDataSource'

const TextStyleSettings = () => {
	const { currentItem } = useContext(GlobalContext)
	const { t } = useTranslation()
	const { findStyleItem, cardItemElement, colorChange, paddingChange, otherStylesChange, inputChange } = useLayout()

	const PaddingStylesElement = () => {
		return (
			<>
				<div className="right-setting-block-item-title">{t('padding_settings')}</div>
				<PaddingSettings
					padding={{
						paddingTop: findStyleItem(currentItem.data.styles, 'paddingTop'),
						paddingRight: findStyleItem(currentItem.data.styles, 'paddingRight'),
						paddingLeft: findStyleItem(currentItem.data.styles, 'paddingLeft'),
						paddingBottom: findStyleItem(currentItem.data.styles, 'paddingBottom'),
					}}
					setPadding={paddingChange}
				/>
			</>
		)
	}

	const textStylesElement = () => {
		const color = findStyleItem(currentItem.data.styles, 'color')
		const textAlign = findStyleItem(currentItem.data.styles, 'textAlign')
		const fontFamily = findStyleItem(currentItem.data.styles, 'fontFamily')
		const fontSize = findStyleItem(currentItem.data.styles, 'fontSize')
		const lineHeight = findStyleItem(currentItem.data.styles, 'lineHeight')
		const fontFamilyList = ['sans-serif', 'Inter', 'Arial', 'Verdana', 'Times New Roman', 'Garamond', 'Georgia', 'Courier New', 'cursive']
		const { fontsList } = useDataSource()

		return (
			<>
				<div className="right-setting-block-item-title">{t('text_styles')}</div>
				{cardItemElement(t('font_color'), <ColorPicker color={color} setColor={colorChange('color')} />)}
				{cardItemElement(
					t('text_align'),
					<div className="flex justify-center items-center">
						{[
							{ icon: faAlignLeft, value: 'left' },
							{ icon: faAlignCenter, value: 'center' },
							{ icon: faAlignRight, value: 'right' },
							{ icon: faAlignJustify, value: 'justify' },
						].map(({ icon, value }) => {
							return (
								<div
									key={value}
									className={classNames(textAlign === value ? 'align-style-item-active' : 'align-style-item-un_active', 'align-style-item')}
									onClick={() => otherStylesChange('textAlign', value)}
								>
									<img src={`/images/align-${value}.png`} />
									{/* <FontAwesomeIcon icon={icon} className="tag-style-size" /> */}
								</div>
							)
						})}
					</div>
				)}
				{cardItemElement(
					t('font_family'),
					/**
           *   <Dropdown options={fontFamilyList.map((item) => {return {label:item,value:item}})} onChange={inputChange("fontFamily")}>
            {fontFamily}
          </Dropdown>
       
           * 
           */
					<Select className="input-width" value={fontFamily} onChange={inputChange('fontFamily')}>
						{fontsList.map((item) => (
							<Select.Option key={item.name} value={item.attribute}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				)}
				{cardItemElement(t('font_size'), <InputNumber min={0} className="input-width" addonAfter="px" value={fontSize} onChange={inputChange('fontSize')} />)}
				{cardItemElement(
					t('line_height'),
					<InputNumber className="input-width" addonAfter="%" min={0} value={Number(lineHeight.replace('%', ''))} onChange={(value) => inputChange('lineHeight')(value + '%')} />
				)}
			</>
		)
	}
	return (
		<div className="margin-y-30">
			{textStylesElement()}
			{PaddingStylesElement()}
		</div>
	)
}

export default TextStyleSettings
