// import { useEffect, useState } from 'react'
// import Select from 'react-select'

// const RcpFilter = ({ id, campaigns, links, onComplete, onDelete, initialKey, initialValue, initialCondition }) => {
// 	const [key, setKey] = useState(initialKey || null)
// 	const [condition, setCondition] = useState(initialCondition || null)
// 	const [value, setValue] = useState(initialValue || null)

// 	useEffect(() => {
// 		if (key && key.value && condition && condition.value && value && value.value) {
// 			let filter = {} // Initialize an empty filter object

// 			switch (key.value) {
// 				case 'ocmp':
// 					filter = {
// 						$or: [condition.value === 'contains' ? { ocmp_ids: { $contains: value.value } } : { ocmp_ids: { $notContains: value.value } }],
// 					}
// 					break
// 				case 'link':
// 					filter = {
// 						$or: [condition.value === 'contains' ? { links_clicked: { $contains: value.value } } : { links_clicked: { $notContains: value.value } }],
// 					}
// 					break
// 				default:
// 					break
// 			}

// 			// Call onComplete with the filter object
// 			onComplete(id, filter)
// 		}
// 	}, [key, value, condition, id])
// 	return (
// 		<>
// 			<small> - And - </small>
// 			<br></br>
// 			<div className="rcp-filter-row" key={id}>
// 				<Select
// 					options={[
// 						{ label: 'Link of prev. cmp.', value: 'link' },
// 						{ label: 'Previous Campaign', value: 'ocmp' },
// 					]}
// 					className="select-control"
// 					value={key}
// 					onChange={(evt) => {
// 						setKey(evt)
// 					}}
// 				/>
// 				<Select
// 					options={key.value == 'ocmp' ? campaigns : links}
// 					className="select-control"
// 					value={value}
// 					onChange={(evt) => {
// 						setValue(evt)
// 					}}
// 				/>
// 				<Select
// 					options={[
// 						{ label: `Was ${key.value == 'ocmp' ? 'opened' : 'clicked'}`, value: 'contains' },
// 						{ label: `Was NOT ${key.value == 'ocmp' ? 'opened' : 'clicked'}`, value: 'notContains' },
// 					]}
// 					className="select-control"
// 					value={condition}
// 					onChange={(evt) => {
// 						setCondition(evt)
// 					}}
// 				/>
// 				<button className="btn btn-danger ml-1" onClick={() => onDelete(id)}>
// 					X
// 				</button>
// 			</div>
// 		</>
// 	)
// }

// export default RcpFilter

import { useEffect, useState } from 'react'
import Dropdown from '../../components/Dropdown'
import Button from '../../components/Button'

const RcpFilter = ({ id, campaigns, links, onComplete, onDelete, initialKey, initialValue, initialCondition }) => {
	const [key, setKey] = useState(initialKey || null)
	const [condition, setCondition] = useState(initialCondition || null)
	const [value, setValue] = useState(initialValue || null)

	useEffect(() => {
		if (key && key.value && condition && condition.value && value && value.value) {
			let filter = {} // Initialize an empty filter object

			switch (key.value) {
				case 'ocmp':
					filter = {
						$or: [condition.value === 'contains' ? { ocmp_ids: { $contains: value.value } } : { ocmp_ids: { $notContains: value.value } }],
					}
					break
				case 'link':
					filter = {
						$or: [condition.value === 'contains' ? { links_clicked: { $contains: value.value } } : { links_clicked: { $notContains: value.value } }],
					}
					break
				default:
					break
			}

			// Call onComplete with the filter object
			onComplete(id, filter)
		}
	}, [key, value, condition, id])

	return (
		<>
			<p className={'mt20'} style={{ textAlign: 'left' }}>
				{' '}
				- And -{' '}
			</p>
			<div className="rcp-filter-row d-flex gap-10" key={id}>
				<div className="d-flex flex-column gap-10" style={{ flexGrow: 0, flexBasis: '90%' }}>
					<Dropdown
						options={[
							{ label: 'Link of prev. cmp.', value: 'link' },
							{ label: 'Previous Campaign', value: 'ocmp' },
						]}
						active
						onOptionSelect={(value) => {
							const selected = { label: value === 'link' ? 'Link of prev. cmp.' : 'Previous Campaign', value }
							setKey(selected)
						}}
					>
						{key ? key.label : 'Select Filter Type'}
					</Dropdown>

					<Dropdown
						options={key?.value === 'ocmp' ? campaigns : links}
						active
						onOptionSelect={(value) => {
							const selected = campaigns.concat(links).find((opt) => opt.value === value)
							setValue(selected)
						}}
					>
						{value ? value.label : 'Select Option'}
					</Dropdown>

					<Dropdown
						options={[
							{ label: `Was ${key?.value === 'ocmp' ? 'opened' : 'clicked'}`, value: 'contains' },
							{ label: `Was NOT ${key?.value === 'ocmp' ? 'opened' : 'clicked'}`, value: 'notContains' },
						]}
						active
						onOptionSelect={(value) => {
							const selected = {
								label: value === 'contains' ? `Was ${key?.value === 'ocmp' ? 'opened' : 'clicked'}` : `Was NOT ${key?.value === 'ocmp' ? 'opened' : 'clicked'}`,
								value,
							}
							setCondition(selected)
						}}
					>
						{condition ? condition.label : 'Select Condition'}
					</Dropdown>
				</div>

				<Button onClick={() => onDelete(id)}>X</Button>
				{/* <button className="btn btn-danger ml-1" onClick={() => onDelete(id)}>
					X
				</button> */}
			</div>
		</>
	)
}

export default RcpFilter
