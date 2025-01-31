import SubscribersTable from '../../components/DataTable/SubscribersTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import './subscribers.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'

const account = {
	name: 'Cobalt Fairy',
	plan: 'Free Plan',
}
const user = {
	name: 'Cobalt Fairy',
	email: 'cf@fairymail.app',
}
const getNameInitials = (name) =>
	name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')
const stats = [
	{
		label: 'Emails Sent',
		value: '752',
		percentage: -12,
		defaultValue: false, // This will be the default selected option
	},
	{
		label: 'Totals Clicks',
		value: '159',
		percentage: 17,
		defaultValue: false,
	},
	{
		label: 'Total Opens',
		value: '340',
		percentage: 19,
		defaultValue: false,
	},
	{
		label: 'Spam',
		value: '85',
		percentage: 5,
		defaultValue: false,
	},
]
const subs_stats = [
	{
		label: 'Total',
		value: '752',
		default: false,
		percentage: 5,
	},
	{
		label: 'Unsubscribed',
		value: '159',
		default: true,
		percentage: 5,
	},
]

const subscribers = [{"firstName":"Nanette","lastName":"Stephen","email":"nstephen0@cbsnews.com","emailSent":"4","emailOpens":"636","emailClicks":"63","subscribed":"9/15/2024"},
    {"firstName":"Leeann","lastName":"Wapol","email":"lwapol1@unesco.org","emailSent":"40289","emailOpens":"53","emailClicks":"482","subscribed":"10/30/2024"},
    {"firstName":"Gasper","lastName":"Ayars","email":"gayars2@state.gov","emailSent":"07971","emailOpens":"56","emailClicks":"8","subscribed":"12/12/2024"},
    {"firstName":"Halley","lastName":"Felix","email":"hfelix3@shareasale.com","emailSent":"27425","emailOpens":"96687","emailClicks":"79","subscribed":"9/12/2024"},
    {"firstName":"Rubetta","lastName":"Jakubowski","email":"rjakubowski4@issuu.com","emailSent":"03302","emailOpens":"0","emailClicks":"34774","subscribed":"1/16/2025"},
    {"firstName":"Chrisy","lastName":"Girth","email":"cgirth5@youtube.com","emailSent":"224","emailOpens":"68","emailClicks":"32","subscribed":"3/9/2024"},
    {"firstName":"Leyla","lastName":"Gerckens","email":"lgerckens6@wix.com","emailSent":"9","emailOpens":"53","emailClicks":"1","subscribed":"2/21/2024"},
    {"firstName":"Dael","lastName":"Dibsdale","email":"ddibsdale7@ed.gov","emailSent":"55","emailOpens":"461","emailClicks":"8835","subscribed":"4/1/2024"},
    {"firstName":"Barbaraanne","lastName":"Gallear","email":"bgallear8@psu.edu","emailSent":"08","emailOpens":"7","emailClicks":"9817","subscribed":"12/12/2024"},
    {"firstName":"Madison","lastName":"Doddemeede","email":"mdoddemeede9@wsj.com","emailSent":"08","emailOpens":"201","emailClicks":"61","subscribed":"2/2/2024"},
    {"firstName":"Jocko","lastName":"Molian","email":"jmoliana@washingtonpost.com","emailSent":"4061","emailOpens":"9143","emailClicks":"119","subscribed":"11/20/2024"},
    {"firstName":"Lennard","lastName":"Krienke","email":"lkrienkeb@google.cn","emailSent":"0","emailOpens":"60","emailClicks":"5059","subscribed":"3/19/2024"},
    {"firstName":"Emilia","lastName":"Devenny","email":"edevennyc@sciencedaily.com","emailSent":"77","emailOpens":"52","emailClicks":"75","subscribed":"8/5/2024"},
    {"firstName":"Halli","lastName":"Dykas","email":"hdykasd@cbslocal.com","emailSent":"4","emailOpens":"441","emailClicks":"913","subscribed":"2/24/2024"},
    {"firstName":"Claretta","lastName":"Paulton","email":"cpaultone@dell.com","emailSent":"4","emailOpens":"5","emailClicks":"36998","subscribed":"9/18/2024"},
    {"firstName":"Derry","lastName":"Ridolfi","email":"dridolfif@parallels.com","emailSent":"5","emailOpens":"173","emailClicks":"19","subscribed":"5/15/2024"},
    {"firstName":"Torrence","lastName":"Ganford","email":"tganfordg@mit.edu","emailSent":"4390","emailOpens":"357","emailClicks":"95","subscribed":"1/15/2025"},
    {"firstName":"Ronny","lastName":"Lagden","email":"rlagdenh@dyndns.org","emailSent":"776","emailOpens":"59568","emailClicks":"72862","subscribed":"2/10/2024"},
    {"firstName":"Carma","lastName":"Keeltagh","email":"ckeeltaghi@sciencedirect.com","emailSent":"4016","emailOpens":"1540","emailClicks":"199","subscribed":"11/17/2024"},
    {"firstName":"Malvina","lastName":"Lamonby","email":"mlamonbyj@newsvine.com","emailSent":"538","emailOpens":"037","emailClicks":"50","subscribed":"4/25/2024"},
    {"firstName":"Alanson","lastName":"Trazzi","email":"atrazzik@skype.com","emailSent":"02571","emailOpens":"668","emailClicks":"729","subscribed":"9/12/2024"},
    {"firstName":"Cami","lastName":"Bessell","email":"cbesselll@seesaa.net","emailSent":"6071","emailOpens":"94823","emailClicks":"1","subscribed":"7/29/2024"},
    {"firstName":"Edithe","lastName":"Elmhurst","email":"eelmhurstm@usda.gov","emailSent":"50","emailOpens":"5","emailClicks":"1","subscribed":"4/12/2024"},
    {"firstName":"Fayina","lastName":"Farrin","email":"ffarrinn@sogou.com","emailSent":"53","emailOpens":"01780","emailClicks":"0693","subscribed":"11/4/2024"},
    {"firstName":"Desiree","lastName":"Perkis","email":"dperkiso@hugedomains.com","emailSent":"66266","emailOpens":"65901","emailClicks":"349","subscribed":"12/15/2024"},
    {"firstName":"Tammi","lastName":"Sketchley","email":"tsketchleyp@ucoz.ru","emailSent":"9","emailOpens":"1","emailClicks":"40","subscribed":"5/15/2024"},
    {"firstName":"Ashlan","lastName":"Giacubo","email":"agiacuboq@storify.com","emailSent":"03441","emailOpens":"872","emailClicks":"6706","subscribed":"3/16/2024"},
    {"firstName":"Angela","lastName":"Flicker","email":"aflickerr@huffingtonpost.com","emailSent":"3137","emailOpens":"2926","emailClicks":"64745","subscribed":"1/20/2025"},
    {"firstName":"Cori","lastName":"Dillow","email":"cdillows@netlog.com","emailSent":"2","emailOpens":"02865","emailClicks":"1368","subscribed":"10/13/2024"},
    {"firstName":"Grenville","lastName":"Dashper","email":"gdashpert@qq.com","emailSent":"0408","emailOpens":"5","emailClicks":"52039","subscribed":"11/24/2024"},
    {"firstName":"Cord","lastName":"Hymor","email":"chymoru@ox.ac.uk","emailSent":"92","emailOpens":"89","emailClicks":"50","subscribed":"8/25/2024"},
    {"firstName":"Hillery","lastName":"Knowles","email":"hknowlesv@fotki.com","emailSent":"5","emailOpens":"98","emailClicks":"7","subscribed":"1/9/2025"},
    {"firstName":"Hakim","lastName":"Orrocks","email":"horrocksw@amazon.de","emailSent":"50837","emailOpens":"68425","emailClicks":"0358","subscribed":"2/8/2024"},
    {"firstName":"Phillis","lastName":"Dudek","email":"pdudekx@vinaora.com","emailSent":"86","emailOpens":"6207","emailClicks":"3","subscribed":"9/22/2024"},
    {"firstName":"Shani","lastName":"Blankhorn","email":"sblankhorny@desdev.cn","emailSent":"14730","emailOpens":"7891","emailClicks":"689","subscribed":"12/29/2024"},
    {"firstName":"Lind","lastName":"Manston","email":"lmanstonz@mlb.com","emailSent":"93","emailOpens":"27467","emailClicks":"6","subscribed":"7/8/2024"},
    {"firstName":"Sumner","lastName":"Slimings","email":"sslimings10@jugem.jp","emailSent":"258","emailOpens":"4","emailClicks":"2495","subscribed":"3/25/2024"},
    {"firstName":"Frank","lastName":"Pallasch","email":"fpallasch11@csmonitor.com","emailSent":"9893","emailOpens":"70949","emailClicks":"0208","subscribed":"1/10/2025"},
    {"firstName":"Viole","lastName":"Sporle","email":"vsporle12@cornell.edu","emailSent":"5","emailOpens":"92","emailClicks":"89438","subscribed":"8/7/2024"},
    {"firstName":"Niko","lastName":"Tunsley","email":"ntunsley13@miibeian.gov.cn","emailSent":"98","emailOpens":"5983","emailClicks":"6","subscribed":"4/13/2024"},
    {"firstName":"Harriott","lastName":"Risbie","email":"hrisbie14@sakura.ne.jp","emailSent":"2","emailOpens":"83056","emailClicks":"0","subscribed":"11/10/2024"},
    {"firstName":"Anica","lastName":"Morson","email":"amorson15@facebook.com","emailSent":"6021","emailOpens":"696","emailClicks":"121","subscribed":"2/21/2024"},
    {"firstName":"Lorena","lastName":"Wainman","email":"lwainman16@google.com.br","emailSent":"2","emailOpens":"85146","emailClicks":"8","subscribed":"1/8/2025"},
    {"firstName":"Eben","lastName":"Heinssen","email":"eheinssen17@mtv.com","emailSent":"60","emailOpens":"976","emailClicks":"79","subscribed":"11/2/2024"},
    {"firstName":"Glennis","lastName":"Haddleton","email":"ghaddleton18@hexun.com","emailSent":"6","emailOpens":"3230","emailClicks":"48","subscribed":"7/3/2024"},
    {"firstName":"Audie","lastName":"Merton","email":"amerton19@harvard.edu","emailSent":"900","emailOpens":"890","emailClicks":"82253","subscribed":"7/6/2024"},
    {"firstName":"Even","lastName":"Hulett","email":"ehulett1a@4shared.com","emailSent":"3","emailOpens":"600","emailClicks":"72308","subscribed":"6/23/2024"},
    {"firstName":"Konstance","lastName":"Oats","email":"koats1b@freewebs.com","emailSent":"5357","emailOpens":"614","emailClicks":"1193","subscribed":"2/13/2024"},
    {"firstName":"Hillier","lastName":"MacNamara","email":"hmacnamara1c@nationalgeographic.com","emailSent":"2677","emailOpens":"89239","emailClicks":"63356","subscribed":"3/9/2024"},
    {"firstName":"Cherilynn","lastName":"Moger","email":"cmoger1d@geocities.jp","emailSent":"7495","emailOpens":"9326","emailClicks":"8","subscribed":"9/14/2024"}]

const Subscribers = () => {
	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account}/>
					<div className="page-name-container">
						<div className="page-name">Subsribers</div>
						<Button icon={'Plus'} type="action">
							Add Subscribers
						</Button>
					</div>
					<div className="filters-container">
						<div className="row">
							<ButtonGroup
								options={[
									{ label: 'All Subscribers (524)' },
									{ label: 'Segments (4)' },
									{ label: 'Groups (5)' },
									{ label: 'Fields (4)' },
                                    { label: 'History' },
									{ label: 'Stats' },
									{ label: 'Clean up' },

								]}
								onChange={(value) => {
									console.log(value)
								}}
							></ButtonGroup>
						</div>
						<div className="row d-flex content-space-between">
							<InputText style={{ width: '85%' }} placeholder="Search Subscribers" label="Search Subscribers" hasError={false} errorMessage="Name must be at least 3 characters long." />
							<Button type="secondary" icon={'Filters'}>
								Filters
							</Button>
						</div>
					</div>

                    <div className="">
                        <SubscribersTable subscribers={subscribers} />
					</div>
				</div>
			</div>
		</>
	)
}

export default Subscribers
