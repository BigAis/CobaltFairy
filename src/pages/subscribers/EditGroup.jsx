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
import GoBackButton from '../../components/GoBackButton'

import { v4 as uuidv4 } from 'uuid'

const EditGroup = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const { user, account } = useAccount()
	const [group, setGroup] = useState({ name: '', udid: '' })
	const [isEdit, setIsEdit] = useState(!!uuid)
	const [loading, setLoading] = useState(false)

	const fetchSubscriber = async () => {
		if (!uuid || !user?.jwt) return
		
		setLoading(true)
		try {
			const response = await ApiService.get(`fairymailer/getGroups/?filters[udid]=${uuid}&populate=*`, user.jwt)
			console.log('group is : ', response)
			
			// Check if we have data and it's an array
			if (response?.data?.data && Array.isArray(response.data.data)) {
				// Find the group with matching UUID
				const foundGroup = response.data.data.find(g => g.udid === uuid)
				
				if (foundGroup) {
					console.log('Found matching group:', foundGroup)
					setGroup(foundGroup)
				} else {
					console.error('No group found with UUID:', uuid)
					// Set default empty group with the current UUID
					setGroup({ name: '', udid: uuid })
				}
			} else {
				console.error('Invalid response format:', response?.data)
				// Set default empty group with the current UUID
				setGroup({ name: '', udid: uuid })
			}
		} catch (error) {
			console.error('Error fetching group:', error)
			// Set default empty group with the current UUID
			setGroup({ name: '', udid: uuid })
		} finally {
			setLoading(false)
		}
	}

	const saveGroup = async () => {
		if (isEdit) {
			const response = await ApiService.post(`fairymailer/updateSubscriber`, { data: group }, user.jwt)
			if (response.data && response.data.code == 200) {
				navigate('/subscribers/groups')
			}
		} else {
			const newGroup = {
				...group,
				udid: uuidv4(),
				account: account.id,
				click_rate: 0,
				open_rate: 0
			}
			const response = await ApiService.post(`groups`, { data: newGroup }, user.jwt)
			if (response && response.data) {
				navigate('/subscribers/groups')
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
					navigate('/subscribers/groups')
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
					navigate('/subscribers/groups')
				}
			}
		})
	}

	// Fetch data when component mounts or when dependencies change
	useEffect(() => {
		if (user && account && uuid) {
			console.log('Fetching group with UUID:', uuid)
			fetchSubscriber()
		}
	}, [user, account, uuid]) // uuid in the dependencies triggers a refetch when it changes

	// This ensures the form is reset when changing between different groups
	useEffect(() => {
		if (!loading && uuid) {
			// Make sure the UUID in the form always matches the URL
			setGroup(prevGroup => {
				if (prevGroup.udid !== uuid) {
					return { ...prevGroup, udid: uuid }
				}
				return prevGroup
			})
		}
	}, [uuid, loading])

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}

					<GoBackButton destination="/subscribers/groups" />
					
					<div className="page-name-container">
						<div className="page-name">{isEdit ? 'Edit Group' : 'New Group'}</div>
					</div>
					
					{/* Display loading state if needed */}
					{loading ? (
						<Card>
							<div>Loading group data...</div>
						</Card>
					) : (
						<Card>
							<InputText
								label={'Name'}
								value={group.name || ''}
								onChange={(e) => {
									setGroup((prevState) => ({
										...prevState,
										name: e.target.value,
									}))
								}}
							/>
							{isEdit && <InputText label={'Group UUID'} value={group.udid || uuid || ''} disabled={true} />}

							<div className="d-flex gap-20">
								<Button onClick={saveGroup}>Save</Button>
								{isEdit && group.name && (
									<Button type="secondary" onClick={deleteGroup}>
										Delete
									</Button>
								)}
							</div>
						</Card>
					)}
				</div>
			</div>
		</>
	)
}

export default EditGroup