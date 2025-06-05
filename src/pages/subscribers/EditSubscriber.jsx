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
import DatePicker from '../../components/DatePicker'
import dayjs from 'dayjs'
import GoBackButton from '../../components/GoBackButton'

const EditSubscriber = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const { user, account } = useAccount()
	const [subscriber, setSubscriber] = useState(null)

	useEffect(() => {
		const fetchSubscriber = async () => {
			try {
				const response = await ApiService.get(`fairymailer/getSubscribers/?filters[udid]=${uuid}&populate=*`, user.jwt)
				console.log('Subscriber is : ', response)
				if (response && response.data && response.data.data) {
					const subscriberData = response.data.data[0]

					// Initialize fields as an empty array if it doesn't exist
					if (!subscriberData.fields || !Array.isArray(subscriberData.fields)) {
						subscriberData.fields = []
					}

					setSubscriber(subscriberData)
				}
			} catch (error) {
				console.error('Error fetching subscriber:', error)
			}
		}

		if (user && account) {
			fetchSubscriber()
		}
	}, [uuid, user, account])

	const saveSubscriber = async () => {
		const response = await ApiService.post(`fairymailer/updateSubscriber`, { data: subscriber }, user.jwt)
		if (response.data && response.data.code == 200) {
			navigate('/subscribers')
		}
	}

	const unsubscribeSubscriber = async () => {
		const subscriberData = {
			...subscriber,
			active: !subscriber.active,
		}
		const response = await ApiService.post(`fairymailer/updateSubscriber`, { data: subscriberData }, user.jwt)
		if (response.data && response.data.code == 200) {
			navigate('/subscribers')
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
					navigate('/subscribers')
				}
			}
		})
	}

	const handleCustomFieldChange = (fieldUuid, value) => {
		setSubscriber((prevState) => {
			const existingFields = prevState.fields || []
			const fieldIndex = existingFields.findIndex((field) => field.uuid === fieldUuid)

			const updatedFields = [...existingFields]
			if (fieldIndex !== -1) {
				updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], value }
			} else {
				updatedFields.push({ uuid: fieldUuid, value })
			}

			return {
				...prevState,
				fields: updatedFields,
			}
		})
	}

	const formatDateForField = (date, format) => {
		if (!date) return ''

		let d
		// Αν είναι ήδη αντικείμενο Date
		if (date instanceof Date) {
			d = date
		} else {
			// Προσπάθησε να μετατρέψεις το string σε Date
			try {
				d = new Date(date)
			} catch (e) {
				console.error('Invalid date format:', e)
				return ''
			}
		}

		// Έλεγχος εγκυρότητας
		if (isNaN(d.getTime())) {
			console.error('Invalid date')
			return ''
		}

		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')

		// Εφαρμογή του format
		let formatted = format || 'Y-m-d'
		formatted = formatted.replace('YYYY', year).replace('Y', year)
		formatted = formatted.replace('MM', month).replace('m', month)
		formatted = formatted.replace('DD', day).replace('d', day)

		return formatted
	}

	const getDateFormat = (format) => {
		if (format === 'YYYY/MM/DD') {
			return 'Y/m/d'
		} else if (format === 'YYYY-DD-MM') {
			return 'Y-d-m'
		} else if (format === 'DD/MM/YYYY') {
			return 'd/m/Y'
		} else if (format === 'MM/DD/YYYY') {
			return 'm/d/Y'
		}
		return 'Y/m/d'
	}

	const renderCustomFields = () => {
		if (!account || !account.fields || account.fields.length === 0 || !subscriber) {
			return null
		}

		console.log('Subscriber is : ', subscriber)
		console.log('AccountFields is : ', account.fields)
		
		// Ensure subscriber.fields is always an array
		const subscriberFields = Array.isArray(subscriber.fields) ? subscriber.fields : [];
		
		return (
			<>
				{account.fields.map((field) => {
					const fieldData = subscriberFields.find((f) => f.uuid === field.uuid) || { value: '' }
					const fieldValue = fieldData.value

					if (field.type.toLowerCase() === 'date') {
						let dateValue = fieldValue
						console.log('fieldValue is : ', fieldValue)
						if (fieldValue && typeof fieldValue === 'string') {
							try {
								dateValue = dayjs(fieldValue)
							} catch (e) {
								console.error('Error parsing date:', e)
							}
						}

						return (
							<DatePicker
								key={field.uuid}
								label={field.name}
								value={dateValue}
								dateFormat={getDateFormat(field.format)}
								timeFormat="H:i:s"
								pickerType="date"
								onChange={(date) => {
									const formattedDate = dayjs(date).toISOString()
									handleCustomFieldChange(field.uuid, formattedDate)
								}}
							/>
						)
					} else {
						return <InputText key={field.uuid} label={field.name} value={fieldValue} onChange={(e) => handleCustomFieldChange(field.uuid, e.target.value)} />
					}
				})}
			</>
		)
	}

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}

					<GoBackButton destination="/subscribers" />
					
					<div className="page-name-container">
						<div className="page-name">Edit Subscriber</div>
					</div>
					
					{subscriber && (
						<Card>
							<InputText label={'Email'} value={subscriber.email} disabled={true} />
							<InputText
								label={'Name'}
								value={subscriber.name}
								onChange={(e) => {
									setSubscriber((prevState) => ({
										...prevState,
										name: e.target.value,
									}))
								}}
							/>

							{renderCustomFields()}

							<p>History</p>
							<div className="d-flex gap-20">
								<Button type="secondary" onClick={unsubscribeSubscriber}>
									{subscriber.active ? 'Unsubscribe' : 'Subscribe'}
								</Button>
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

export default EditSubscriber