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

import { v4 as uuidv4 } from 'uuid'

const EditGroup = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const { user, account } = useAccount()
	const [group, setGroup] = useState({ name: '' })
	const [isEdit, setIsEdit] = useState(!!uuid)

	const fetchSubscriber = async () => {
		try {
			const response = await ApiService.get(`fairymailer/getGroups/?filters[udid]=${uuid}&populate=*`, user.jwt)
			console.log('group is : ', response)
			if (response && response.data && response.data.data) setGroup(response.data.data[0])
		} catch (error) {
			console.error('Error fetching subscriber:', error)
		}
	}

	const saveGroup = async () => {
		if (isEdit) {
			const response = await ApiService.post(`fairymailer/updateSubscriber`, { data: group }, user.jwt)
			if (response.data && response.data.code == 200) {
				navigate('/subscribers/')
			}
		} else {
			group.udid = uuidv4()
			group.account = account.id
			group.click_rate = 0
			group.open_rate = 0
			const response = await ApiService.post(`groups`, { data: group }, user.jwt)
			if (response && response.data) {
				navigate('/subscribers/')
			}
		}
	}

	const deleteSubscriber = async () => {
		PopupText.fire({
			text: `Do you really want to remove subscriber ${group.email}? This action will unsubscribe them from all groups until they subscribe again manually.`,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				console.log('Confirmed with input:', result)
				const response = await ApiService.post(`fairymailer/removeSubscriber`, { data: group }, user.jwt)
				if (response.data && response.data.code == 200) {
					navigate('/subscribers/')
				}
			}
		})
	}

	const deleteGroup = async () => {
		PopupText.fire({
			text: `Do you really want to remove group ${group.name}? `,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				console.log('Confirmed with input:', result)
				const deleteResponse = await ApiService.post(`fairymailer/deleteGroupByGuid/${group.udid}`, { data: {} }, user.jwt)
				if (deleteResponse) {
					console.log('on update running')
					// navigate('/subscribers/')
				}
			}
		})
	}

	useEffect(() => {
		if (user && account && isEdit) {
			fetchSubscriber()
		}
	}, [uuid, user, account, isEdit])

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
						<div className="page-name">{isEdit ? 'Edit Group' : 'New Group'}</div>
					</div>
					{group && (
						<Card>
							<InputText
								label={'Name'}
								value={group.name}
								onChange={(e) => {
									setGroup((prevState) => ({
										...prevState,
										name: e.target.value,
									}))
								}}
							/>
							{isEdit && <InputText label={'Group UUID'} value={group.udid} disabled={true} />}

							<div className="d-flex gap-20">
								{isEdit && (
									<Button type="secondary" onClick={()=>{
										navigate('/subscribers')
									}}>
										Go Back
									</Button>
								)}
								<Button onClick={saveGroup}>Save</Button>
							</div>
						</Card>
					)}
				</div>
			</div>
		</>
	)
}

export default EditGroup
