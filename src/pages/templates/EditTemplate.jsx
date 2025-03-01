import { useParams } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import InputText from '../../components/InputText/InputText'
import Card from '../../components/Card'
import Slider from '../../components/Slider_ck/Slider'
import { ApiService } from '../../service/api-service'
import { useUser } from '../../context/UserContext'
import { useAccount } from '../../context/AccountContext'
import Icon from '../../components/Icon/Icon'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import AreaChart from '../../components/AreaChart/AreaChart'
import Pagination from '../../components/Pagination'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Checkbox from '../../components/Checkbox'
import EmailPreview from '../../components/EmailPreview/EmailPreview'
import Editor from '../campaigns/Editor'

import '../dashboard/dashboard.scss'
import '../../fullpage.scss'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const EditTemplate = () => {
	const { uuid } = useParams()
	const { user, account } = useAccount()
	const [template, setTemplate] = useState(null)

	const fetchTemplate = async () => {
		try {
			const response = await ApiService.get(`fairymailer/getTemplates/?filters[uuid]=${uuid}`, user.jwt)
			if (response && response.data && response.data.data) setTemplate(response.data.data[0])
			console.log(response.data.data[0])
		} catch (error) {
			console.log('Error inside edit campaign : ', error)
		}
	}

	useEffect(() => {
		if (user && account) {
			fetchTemplate()
		}
	}, [user, account])

	return (
		<>
			<div className="fm-page-wrapper">
				{/* <Sidemenu /> */}
				<div className="fm-page-container">
					{/* {user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />} */}
					{template && (
						<>
							<p>Editing template : {template && template.name}</p>
							<Editor editorType="template" currentCampaign={template} />
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default EditTemplate
