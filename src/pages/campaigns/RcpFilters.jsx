import { useEffect, useState } from 'react'
import Dropdown from '../../components/Dropdown'
import Button from '../../components/Button'

const RcpFilter = ({ id, campaigns, links, onComplete, onDelete, initialKey, initialValue, initialCondition }) => {
	const [key, setKey] = useState(initialKey || null)
	const [condition, setCondition] = useState(initialCondition || null)
	const [value, setValue] = useState(initialValue || null)

	const campaignOptions =
		campaigns.length > 0
			? campaigns.map((cmp) => {
					return { value: cmp.id, label: cmp.name }
			  })
			: []

	function extractLinksV2(data) {
		const links = []

		function walk(node) {
			if (Array.isArray(node)) {
				node.forEach(walk)
			} else if (typeof node === 'object' && node !== null) {
				if (node.linkURL && typeof node.linkURL === 'string') {
					links.push(node.linkURL.trim())
				}
				Object.values(node).forEach(walk)
			}
		}

		function cleanLinks(links) {
			return links.filter((link) => link !== 'https://')
		}

		walk(data)
		return cleanLinks(links)
	}

	const extractLinksV1 = (components = [], links = []) => {
		components.forEach((component) => {
			if (component.components && component.components.length > 0) {
				links = [...extractLinksV1(component.components, links)]
			}
			if (component.type === 'link') {
				links.push(component?.attributes?.href)
			}
		})
		return links
	}

	useEffect(() => {
		console.log('key', key)
		console.log('condition', condition)
		console.log('value', value)
		console.log('id', id)

		if (!value || !value?.value) {
			const filter = {
				$or: [],
			}
			onComplete(id, filter)
			return
		}

		if (key && key.value && condition && condition.value && value && value.value) {
			let filter = {} // Initialize an empty filter object
			const meta = []

			switch (key.value) {
				case 'ocmp':
					if (condition.value === 'clicked') {
						console.log('value.value inside clicked', value.value)

						let links = []
						const selectedCampaign = campaigns.find((cmp) => cmp.id === value.value)
						if (selectedCampaign) {
							console.log('selectedCampaing', selectedCampaign)
							const desing = JSON.parse(selectedCampaign.design)

							if (Object.prototype.hasOwnProperty.call(desing, 'components')) {
								console.log('this is old FM design')
								links = extractLinksV1(desing.components)
								console.log('links', links)
							} else {
								links = extractLinksV2(JSON.parse(selectedCampaign.design))
								console.log('links', links)
							}
						}

						const arrayOfAllLinksClicked = links.map((link) => ({
							links_clicked: { $contains: link },
						}))

						filter = {
							$or: arrayOfAllLinksClicked,
						}
						meta[id] = {
							type: 'ocmp',
							condition: condition.value,
							value: value.value,
						}
						console.log('arrayOfAllLinksClicked filter', filter)
					} else if (condition.value == 'notClicked') {
						let links = []
						const selectedCampaign = campaigns.find((cmp) => cmp.id === value.value)
						if (selectedCampaign) {
							console.log('selectedCampaing', selectedCampaign)
							const desing = JSON.parse(selectedCampaign.design)

							if (Object.prototype.hasOwnProperty.call(desing, 'components')) {
								console.log('this is old FM design')
								links = extractLinksV1(desing.components)
								console.log('links', links)
							} else {
								links = extractLinksV2(JSON.parse(selectedCampaign.design))
								console.log('links', links)
							}
						}

						const arrayOfAllLinksClicked = links.map((link) => ({
							links_clicked: { $notContains: link },
						}))

						filter = {
							$or: arrayOfAllLinksClicked,
						}
						console.log('arrayOfAllLinksClicked filter', filter)
						meta[id] = {
							type: 'ocmp',
							condition: condition.value,
							value: value.value,
						}
					} else {
						filter = {
							$or: [condition.value === 'contains' ? { ocmp_ids: { $contains: value.value } } : { ocmp_ids: { $notContains: value.value } }],
						}
						meta[id] = {
							type: 'ocmp',
							condition: condition.value,
							value: value.value,
						}
					}
					break
				case 'link':
					filter = {
						$or: [condition.value === 'contains' ? { links_clicked: { $contains: value.value } } : { links_clicked: { $notContains: value.value } }],
					}
					meta[id] = {
						type: 'link',
						condition: condition.value,
						value: value.value,
					}

					break
				default:
					break
			}

			// Call onComplete with the filter object

			onComplete(id, filter, meta)
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
						selectedValue={key}
						options={[
							{ label: 'Link of previous campaign', value: 'link' },
							{ label: 'Previous Campaign', value: 'ocmp' },
						]}
						active
						onOptionSelect={(value) => {
							console.log('value on dropdown', value.value == 'link')
							setValue(null)
							if (value.value == 'link') {
								setCondition({ label: 'Was clicked', value: 'contains' })
							} else {
								setCondition({ label: 'Was opened', value: 'opened' })
							}
							// value.value == 'link' ? setCondition({ label: 'Was clicked', value: 'contains' }) : setCondition({ label: 'Was opened', value: 'opened' })
							setKey(value)
						}}
					>
						{key ? key.label : 'Select Filter Type'}
					</Dropdown>

					<Dropdown
						selectedValue={value}
						options={key?.value === 'ocmp' ? campaignOptions : links}
						active
						searchable
						onOptionSelect={(value) => {
							setValue(value)
						}}
					>
						{!value ? (key?.value === 'ocmp' ? 'Select Campaign' : 'Select Link') : value.label}
					</Dropdown>

					<Dropdown
						selectedValue={condition}
						options={
							key?.value === 'ocmp'
								? [
										{ label: 'Was opened', value: 'opened' },
										{ label: 'Was NOT opened', value: 'notOpened' },
										{ label: 'Was clicked', value: 'clicked' },
										{ label: 'Was NOT clicked', value: 'notClicked' },
								  ]
								: [
										{ label: 'Was clicked', value: 'contains' },
										{ label: 'Was NOT clicked', value: 'notContains' },
								  ]
						}
						active
						onOptionSelect={(value) => {
							setCondition(value)
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
