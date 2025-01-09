import './desing.css'

import { useState } from 'react'
import Button from './components/Button'
import ButtonGroup from './components/ButtonGroup'
import Pagination from './components/Pagination'
import SubsCounter from './components/SubsCounter'
import Dropdown from './components/Dropdown'
import InputText from './components/InputText/InputText'
import ColorPicker from './components/ColorPicker'
import ImagePicker from './components/ImagePicker'
import DatePicker from './components/DatePicker'
import CreditCardPicker from './components/CreditCardPicker'
import Card from './components/Card'
import VerificationBadge from './components/VerificationBadge'
import TemplateBadge from './components/TemplateBadge'
import Switch from './components/Switch'
import Checkbox from './components/Checkbox'
import RadioButton from './components/RadioButton'
import NotificationBar from './components/NotificationBar/NotificationBar'
import Slider from './components/Slider_ck/Slider'
import Stat from './components/Stat/Stat'

function Desing() {
	const stats = [
		{
			label: 'Emails Sent',
			value: '752',
			percentage: -12,
			defaultValue: false, // This will be the default selected option
		},
		{
			label: 'Totals Clicks',
			value: '159',
			percentage: 17,
			defaultValue: false,
		},
		{
			label: 'Total Opens',
			value: '340',
			percentage: 19,
			defaultValue: false,
		},
		{
			label: 'Spam',
			value: '85',
			percentage: 5,
			defaultValue: false,
		},
	]

	const handleLeftClick = () => {
		alert('Left action triggered!')
	}

	const [inputValue, setInputValue] = useState('Search Campaign')
	const handleInputChange = (newValue) => {
		setInputValue(newValue) // Update the value in state
	}

	const dropdownOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
	]

	const [notifications, setNotifications] = useState([
		{ id: 1, message: 'This is a default notification.', type: 'default' },
		{ id: 2, message: 'This is a warning notification.', type: 'warning' },
	])

	const handleRemoveNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id))
	}
	return (
		<>
			<div className="main-wrapper d-flex gap-30">
				<div className="column">
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Default</p>

							<Button icon={'Plus'}>Primary</Button>
							<Button>Primary</Button>
							<Button type="secondary" icon={'Plus'}>
								Primary
							</Button>
							<Button type="secondary">Primary</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Hover (hover the mouse)</p>
							<Button icon={'Plus'} hovered>
								Primary
							</Button>
							<Button hovered>Primary</Button>
							<Button type="secondary" icon={'Plus'} hovered>
								Primary
							</Button>
							<Button type="secondary" hovered>
								Primary
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Active</p>
							<Button icon={'Plus'} active>
								Primary
							</Button>
							<Button active>Primary</Button>
							<Button type="secondary" icon={'Plus'} active>
								Primary
							</Button>
							<Button type="secondary" active>
								Primary
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Inactive</p>
							<Button icon={'Plus'} inactive>
								Primary
							</Button>
							<Button inactive>Primary</Button>
							<Button type="secondary" icon={'Plus'} inactive>
								Primary
							</Button>
							<Button type="secondary" inactive>
								Primary
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Disabled</p>
							<Button icon={'Plus'} disabled>
								Primary
							</Button>
							<Button disabled>Primary</Button>
							<Button type="secondary" icon={'Plus'} disabled>
								Primary
							</Button>
							<Button type="secondary" disabled>
								Primary
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Loading</p>
							<Button icon={'Plus'} loading>
								Primary
							</Button>
							<Button loading>Primary</Button>
							<Button type="secondary" icon={'Plus'} loading>
								Primary
							</Button>
							<Button type="secondary" loading>
								Primary
							</Button>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Button Group</p>
							<ButtonGroup
								value="today"
								options={[
									{ value: 'today', label: 'Today' },
									{ value: '7days', label: '7 Days' },
									{ value: '30days', label: '30 Days' },
									{ value: 'all', label: 'All' },
								]}
								onChange={(value) => {
									console.log(value)
								}}
							></ButtonGroup>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Pagination</p>
							<Pagination
								currentPage={1}
								totalResults={120}
								resultsPerPage={20}
								onChange={(page) => {
									console.log('Selected page is ', page)
								}}
							></Pagination>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Switch</p>
							<Switch checked={false} label="Test Label"></Switch>
						</div>
					</div>

					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>RadioButton</p>
							<RadioButton
								data-inline="true"
								options={[
									{ label: 'Option 1', value: 1 },
									{ label: 'Option 2', value: 2 },
									{ label: 'Option 3', value: 3 },
								]}
								value={3}
							></RadioButton>
						</div>
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}></p>
							<RadioButton
								options={[
									{ label: 'Option 1', value: 1 },
									{ label: 'Option 2', value: 2 },
									{ label: 'Option 3', value: 3 },
								]}
								value={3}
							></RadioButton>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Checkbox</p>
							<Checkbox checked={false} label="Test Checkbox"></Checkbox>
							<Checkbox checked={true} label="Test Checkbox"></Checkbox>
						</div>
					</div>

					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>ColorPicker</p>
							<ColorPicker
								initColorAlpha={1}
								initColorHex={'#f00'}
								onChange={(color) => {
									console.log('Chosen color', color)
								}}
							></ColorPicker>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Subs Counter</p>
							<SubsCounter
								currentSubs={700}
								subsLimit={1500}
								onClick={() => {
									console.log('SubsCounter clicked!')
								}}
							>
								{' '}
							</SubsCounter>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>ImagePicker</p>
							<div style={{ width: '200px' }}>
								<ImagePicker
									onChange={(image) => {
										console.log('image', image)
									}}
								></ImagePicker>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>DatePicker</p>
							<div style={{ width: '200px' }}>
								<DatePicker
									dateFormat="d/m/Y"
									timeFormat={'H:i'}
									pickerType="date"
									onChange={(selection) => {
										console.log('selected date', selection)
									}}
								></DatePicker>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>TimePicker</p>
							<div style={{ width: '200px' }}>
								<DatePicker
									dateFormat="d/m/Y"
									timeFormat={'H:i'}
									pickerType={'time'}
									onChange={(selection) => {
										console.log('selected time', selection)
									}}
								></DatePicker>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>DateTime</p>
							<div style={{ width: '200px' }}>
								<DatePicker
									dateFormat="d/m/Y"
									timeFormat={'H:i'}
									pickerType="datetime"
									onChange={(selection) => {
										console.log('selected date-time', selection)
									}}
								></DatePicker>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Credit Card</p>
							<div style={{ width: '200px' }}>
								<CreditCardPicker></CreditCardPicker>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Credit Card</p>
							<div style={{ width: '200px' }}>
								<Card>
									<h3>test</h3>
								</Card>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Verified Badge</p>
							<div style={{ width: '300px', display: 'flex' }}>
								<div style={{ width: '150px' }}>
									<VerificationBadge isVerified={false}></VerificationBadge>
								</div>
								<div style={{ width: '150px' }}>
									<VerificationBadge isVerified={true}></VerificationBadge>
								</div>
							</div>
						</div>
					</div>

					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Template Badge</p>
							<div style={{ width: '300px', display: 'flex' }}>
								<div style={{ width: '100px' }}>
									<TemplateBadge></TemplateBadge>
								</div>
								<div style={{ width: '100px' }}>
									<TemplateBadge type={'custom'}></TemplateBadge>
								</div>
							</div>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
						</div>
					</div>
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							<p style={{ width: '100px' }}>Template Badge</p>
							<div style={{ display: 'flex' }}>
								<div>
									{notifications.map((notification) => (
										<NotificationBar
											key={notification.id}
											message={notification.message}
											type={notification.type} // Pass type here
											onClose={() => handleRemoveNotification(notification.id)} // Handle close
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="column">
					<div className="d-flex flex-column gap-20">
						<div className="d-flex flex-row gap-10">
							{/* <p style={{ width: '100px' }}>Dropdown</p> */}
							<Dropdown withDivider icon={'Plus'} options={dropdownOptions} onLeftClick={handleLeftClick}>
								test
							</Dropdown>
							<Dropdown icon={'Plus'} options={dropdownOptions}>
								test
							</Dropdown>
						</div>

						<div className="d-flex flex-row gap-10">
							{/* <p style={{ width: '100px' }}>Dropdown</p> */}
							<Dropdown withDivider icon={'Plus'} hovered options={dropdownOptions}>
								test
							</Dropdown>
							<Dropdown icon={'Plus'} hovered options={dropdownOptions}>
								test
							</Dropdown>
						</div>
						<div className="d-flex flex-row gap-10">
							{/* <p style={{ width: '100px' }}>Dropdown</p> */}
							<Dropdown withDivider icon={'Plus'} active options={dropdownOptions}>
								test
							</Dropdown>
							<Dropdown icon={'Plus'} active options={dropdownOptions}>
								test
							</Dropdown>
						</div>
						<div className="d-flex flex-row gap-10">
							{/* <p style={{ width: '100px' }}>Dropdown</p> */}
							<Dropdown withDivider icon={'Plus'} inactive options={dropdownOptions}>
								test
							</Dropdown>
							<Dropdown icon={'Plus'} inactive options={dropdownOptions}>
								test
							</Dropdown>
						</div>
						<div className="d-flex flex-row gap-10">
							{/* <p style={{ width: '100px' }}>Dropdown</p> */}
							<Dropdown withDivider icon={'Plus'} disabled options={dropdownOptions}>
								test
							</Dropdown>
							<Dropdown icon={'Plus'} disabled options={dropdownOptions}>
								test
							</Dropdown>
						</div>
						<div className="d-flex flex-row gap-10">
							{/* <p style={{ width: '100px' }}>Dropdown</p> */}
							<Dropdown withDivider options={dropdownOptions}>
								test
							</Dropdown>
							<Dropdown options={dropdownOptions}>test</Dropdown>
						</div>
					</div>
				</div>
				<div className="column">
					<div className="d-flex flex-column gap-10">
						<div className="d-flex flex-row gap-10">
							<Button icon={'Envelope'} type="action">
								Action Button
							</Button>
							<Button type="action">Action</Button>
						</div>

						<div className="d-flex flex-row gap-10">
							<Button icon={'Envelope'} type="action">
								Action Button
							</Button>
							<Button type="action">Action</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<Button icon={'Envelope'} type="action" active>
								Action Button
							</Button>
							<Button type="action" active>
								Action
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<Button icon={'Envelope'} type="action" inactive>
								Action Button
							</Button>
							<Button type="action" inactive>
								Action
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<Button icon={'Envelope'} type="action" disabled>
								Action Button
							</Button>
							<Button type="action" disabled>
								Action
							</Button>
						</div>
						<div className="d-flex flex-row gap-10">
							<Button icon={'Envelope'} type="action" loading>
								Action Button
							</Button>
							<Button type="action" loading>
								Action
							</Button>
						</div>
					</div>
				</div>
				<div className="column">
					<div className="flex flex-column gap-20">
						<div className="flex flex-row gap-10">
							<InputText placeholder="Search Campaign" label="Search Campaign" hasError={false} errorMessage="Name must be at least 3 characters long." />
							<InputText
								placeholder="Search Campaign"
								value={inputValue}
								onChange={handleInputChange}
								label="Search Campaign"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
							/>
							<InputText placeholder="Search Campaign" label="Search Campaign" hasError={false} errorMessage="Name must be at least 3 characters long." disabled />
							<InputText
								placeholder="Search Campaign"
								value={inputValue}
								onChange={handleInputChange}
								label="Search Campaign"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
								icon={'Envelope'}
							/>
							<InputText
								placeholder="Enter your name"
								value={inputValue}
								onChange={handleInputChange}
								label="Search Campaign"
								hasError={true}
								errorMessage="Name must be at least 3 characters long."
							/>
							<InputText
								placeholder="Enter your name"
								value={inputValue}
								onChange={handleInputChange}
								label="Search Campaign"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
								isRequired
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="main-wrapper d-flex gap-30" style={{ width: '500px' }}>
				<Slider min={0} max={1500} defaultValue={0} step={100} staticTooltip={false} />
			</div>
			<div className="main-wrapper d-flex gap-30" style={{ width: '500px' }}>
				<Stat stats={stats} hasChart={true} defaultLabel={'Emails Sent'} />
				<Stat stats={stats} hasChart={true} defaultLabel={'Total Clicks'} />
				<Stat stats={stats} hasChart={true} defaultLabel={'Total Opens'} />
				<Stat stats={stats} hasChart={true} defaultLabel={'Spam'} />
			</div>
		</>
	)
}

export default Desing
