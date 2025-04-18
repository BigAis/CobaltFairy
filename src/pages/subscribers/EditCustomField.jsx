import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
	const navigate = useNavigate()
	const location = useLocation()
	const { user, account, setAccount } = useAccount()
	const [field, setField] = useState(null)

	const typeOptions = [
		{ label: 'String', value: 'string' },
		{ label: 'Date', value: 'date' },
		{ label: 'Number', value: 'number' },
	]

	const dateFormatOptions = [
		{ label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
		{ label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
		{ label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
		{ label: 'YYYY-DD-MM', value: 'YYYY-DD-MM' },
	]

	useEffect(() => {
		console.log('location.state.fieldData', location)
		if (location.state?.fieldData) {
			setField(location.state.fieldData)
		} else if (account?.fields && account.fields.length > 0) {
			const firstField = account.fields[0]
			console.log('Using field from account context:', firstField)
			setField(firstField)
		}
	}, [location, account])

	const saveField = async () => {
		try {
			const response = await ApiService.post(
				`fairymailer/updateCustomField`,
				{
					data: field,
				},
				user.jwt
			)

			if (response.data && response.data.code == 200) {
				if (response.data.data) {
					setAccount(response.data.data)
				}

				PopupText.fire({
					text: `Custom field "${field.name}" saved successfully!`,
					confirmButtonText: 'OK',
					icon: 'success',
				}).then(() => {
					navigate('/subscribers/')
				})
			}
		} catch (error) {
			console.error('Error updating custom field:', error)
			PopupText.fire({
				text: `Error updating custom field: ${error.message}`,
				confirmButtonText: 'OK',
				icon: 'error',
			})
		}
	}

	const deleteField = async () => {
		PopupText.fire({
			text: `Do you really want to remove custom field "${field.name}"? This action cannot be undone.`,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const response = await ApiService.post(`fairymailer/removeCustomField`, { data: field }, user.jwt)
					if (response.data && response.data.code == 200) {
						navigate('/subscribers/')
					}
				} catch (error) {
					console.error('Error deleting custom field:', error)
					PopupText.fire({
						text: `Error deleting custom field: ${error.message}`,
						confirmButtonText: 'OK',
					})
				}
			}
		})
	}

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
							<InputText
								label={'Name'}
								value={field.name}
								onChange={(e) => {
									setField((prevState) => ({
										...prevState,
										name: e.target.value,
									}))
								}}
							/>

							<Dropdown
								selectedValue={typeOptions.find((option) => option.value.toLowerCase() === field.type.toLowerCase())}
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
								{'Select Type'}
							</Dropdown>

							{field.type.toLowerCase() === 'date' && (
								<Dropdown
									selectedValue={dateFormatOptions.find((option) => option.value === field.format)}
									options={dateFormatOptions}
									active
									onOptionSelect={(value) => {
										setField((prevState) => {
											return {
												...prevState,
												format: value.value,
											}
										})
									}}
								>
									{'Select Date Format'}
								</Dropdown>
							)}

							<div className="d-flex gap-20">
								<Button type="secondary" onClick={deleteField}>
									Delete
								</Button>
								<Button onClick={saveField}>Save</Button>
							</div>
						</Card>
					)}
				</div>
			</div>
		</>
	)
}

export default EditCustomField
