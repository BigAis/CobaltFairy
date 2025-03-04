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
				if (response && response.data && response.data.data) setSubscriber(response.data.data[0])
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
						<div className="page-name">Subscribers</div>
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
