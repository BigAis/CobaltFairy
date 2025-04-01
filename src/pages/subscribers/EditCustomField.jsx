import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import InputText from '../../components/InputText/InputText'
import Button from '../../components/Button'
import PopupText from '../../components/PopupText/PopupText'
import Dropdown from '../../components/Dropdown'

const EditCustomField = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const { user, account } = useAccount()
	const [subscriber, setSubscriber] = useState(null)
	const [field, setField] = useState(null)

	const customFields = [
		{ uuid: 'kDyvIO1kzX', fieldName: 'Birthday', type: 'date', format: 'DD-MM-YYYY' },
		{ uuid: 'gLCodNrUoo', fieldName: 'Age', type: 'number' },
		{ uuid: 'f5zZltwTs1', fieldName: 'Name Day', type: 'string' },
	]

	const typeOptions = [
		{ label: 'String', value: 'string' },
		{ label: 'Date', value: 'date' },
		{ label: 'Number', value: 'number' },
	]

	useEffect(() => {
		// const fetchSubscriber = async () => {
		// 	try {
		// 		const response = await ApiService.get(`fairymailer/getSubscribers/?filters[udid]=${uuid}&populate=*`, user.jwt)
		// 		console.log('Subscriber is : ', response)
		// 		if (response && response.data && response.data.data) setSubscriber(response.data.data[0])
		// 	} catch (error) {
		// 		console.error('Error fetching subscriber:', error)
		// 	}
		// }

		if (user && account) {
			const field = customFields.find((field) => field.uuid === uuid)
			if (field) {
				setField(field)
			}
		}
	}, [uuid, user, account])

	const saveSubscriber = async () => {
		const response = await ApiService.post(`fairymailer/updateSubscriber`, { data: subscriber }, user.jwt)
		if (response.data && response.data.code == 200) {
			navigate('/subscribers/')
		}
	}

	const unsubscribeSubscriber = async () => {
		const subscriberData = {
			...subscriber,
			active: !subscriber.active,
		}
		const response = await ApiService.post(`fairymailer/updateSubscriber`, { data: subscriberData }, user.jwt)
		if (response.data && response.data.code == 200) {
			navigate('/subscribers/')
		}
	}

	const deleteSubscriber = async () => {
		PopupText.fire({
			text: `Do you really want to remove subscriber ${subscriber.email}? This action will unsubscribe them from all groups until they subscribe again manually.`,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				console.log('Confirmed with input:', result)
				const response = await ApiService.post(`fairymailer/removeSubscriber`, { data: subscriber }, user.jwt)
				if (response.data && response.data.code == 200) {
					navigate('/subscribers/')
				}
			}
		})
	}

	// if (!subscriber) {
	// 	return <div>Loading...</div>
	// }

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}

					<div className="page-name-container">
						<div className="page-name">Custom Fields</div>
					</div>
					{field && (
						<Card className={'d-flex flex-column gap-10'}>
							<InputText label={'Name'} value={field.fieldName} />

							<Dropdown
								selectedValue={typeOptions.find((option) => option.value === field.type)}
								options={typeOptions}
								active
								onOptionSelect={(value) => {
									setField((prevState) => {
										return {
											...prevState,
											type: value.value,
										}
									})
								}}
							>
								{'Select Condition'}
							</Dropdown>

							{field.type === 'date' && <InputText label={'Format'} value={field.format} />}

							<div className="d-flex gap-20">
								<Button type="secondary" onClick={deleteSubscriber}>
									Delete
								</Button>
								<Button onClick={saveSubscriber}>Save</Button>
							</div>
						</Card>
					)}
				</div>
			</div>
		</>
	)
}

export default EditCustomField
