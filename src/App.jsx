import './App.css'
import { useState } from 'react'
import Button from './components/Button'
import ButtonGroup from './components/ButtonGroup'
import Pagination from './components/Pagination'
import SubsCounter from './components/SubsCounter'
import Dropdown from './components/Dropdown'
import InputText from './components/InputText/InputText'

function App() {
	const [hasError, setHasError] = useState(true)

	const handleLeftClick = () => {
		alert('Left action triggered!')
	}
	const dropdownOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
	]
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
							<p style={{ width: '100px' }}>Subs Counter</p>
							<SubsCounter
								currentSubs={200}
								subsLimit={1500}
								onClick={() => {
									console.log('SubsCounter clicked!')
								}}
							>
								{' '}
							</SubsCounter>
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
							<Dropdown withDivider loading options={dropdownOptions}>
								test
							</Dropdown>
							<Dropdown loading options={dropdownOptions}>
								test
							</Dropdown>
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
			</div>

			<div className="main-wrapper d-flex gap-30" style={{ marginTop: '25px' }}>
				<div className="column">
					<div className="flex flex-column gap-20">
						<div className="flex flex-row gap-10">
							<InputText placeholder="Enter your name" label="name" hasError={hasError} errorMessage="Name must be at least 3 characters long." />
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default App
