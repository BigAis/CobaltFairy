import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import InputText from '../../components/InputText/InputText'
import Button from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import PopupText from '../../components/PopupText/PopupText'

const NewCustomField = () => {
	const navigate = useNavigate()
	const { user, account, setAccount } = useAccount()
	const [field, setField] = useState({
		name: '',
		type: 'string',
		format: 'DD/MM/YYYY',
	})

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

	const createCustomField = async () => {
		try {
			const response = await ApiService.post(
				`fairymailer/updateCustomField`,
				{
					data: field,
				},
				user.jwt
			)

			if (response.data && response.data.code == 200) {
				// Ενημερώνουμε το account στο context με τα νέα δεδομένα
				if (response.data.data) {
					setAccount(response.data.data)
				}

				PopupText.fire({
					text: `Custom field "${field.name}" created successfully!`,
					confirmButtonText: 'OK',
					icon: 'success',
				}).then(() => {
					navigate('/subscribers/')
				})
			}
		} catch (error) {
			console.error('Error creating custom field:', error)
			PopupText.fire({
				text: `Error creating custom field: ${error.message}`,
				confirmButtonText: 'OK',
				icon: 'error',
			})
		}
	}

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}

					<div className="page-name-container">
						<div className="page-name">New Field</div>
					</div>
					<Card className={'d-flex flex-column gap-10'}>
						<InputText label={'Name'} value={field.name} onChange={(e) => setField({ ...field, name: e.target.value })} />

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
							{'Select Type'}
						</Dropdown>

						{field.type === 'date' && (
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
							<Button type="secondary" onClick={() => navigate('/subscribers/')}>
								Cancel
							</Button>
							<Button onClick={createCustomField}>Create</Button>
						</div>
					</Card>
				</div>
			</div>
		</>
	)
}

export default NewCustomField
