import IntegrationsTable from '../../components/DataTable/IntegrationsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import './integrations.scss'
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

const integrations = [{"img":"http://dummyimage.com/184x100.png/ff4444/ffffff","label":"Hessel-Pouros","Description":"reinvent innovative platforms"},
	{"img":"http://dummyimage.com/169x100.png/cc0000/ffffff","label":"Block LLC","Description":"seize 24/7 deliverables"},
	{"img":"http://dummyimage.com/232x100.png/5fa2dd/ffffff","label":"Ledner, Wuckert and Zieme","Description":"synergize robust schemas"},
	{"img":"http://dummyimage.com/127x100.png/5fa2dd/ffffff","label":"Turner LLC","Description":"disintermediate rich content"},
	{"img":"http://dummyimage.com/210x100.png/dddddd/000000","label":"Huels, Swaniawski and Klein","Description":"morph sexy schemas"},
	{"img":"http://dummyimage.com/154x100.png/5fa2dd/ffffff","label":"Ledner-Kuhic","Description":"architect bleeding-edge web-readiness"},
	{"img":"http://dummyimage.com/124x100.png/5fa2dd/ffffff","label":"Daniel-Kshlerin","Description":"leverage next-generation relationships"},
	{"img":"http://dummyimage.com/139x100.png/cc0000/ffffff","label":"Kulas Inc","Description":"utilize cutting-edge e-services"},
	{"img":"http://dummyimage.com/137x100.png/dddddd/000000","label":"Shields, Prohaska and Barrows","Description":"revolutionize cross-platform markets"},
	{"img":"http://dummyimage.com/138x100.png/dddddd/000000","label":"Wisoky Group","Description":"unleash best-of-breed functionalities"},
	{"img":"http://dummyimage.com/155x100.png/ff4444/ffffff","label":"Sporer, Torp and Kerluke","Description":"repurpose extensible systems"},
	{"img":"http://dummyimage.com/239x100.png/5fa2dd/ffffff","label":"West Group","Description":"envisioneer world-class models"},
	{"img":"http://dummyimage.com/213x100.png/5fa2dd/ffffff","label":"Rolfson Inc","Description":"optimize front-end initiatives"},
	{"img":"http://dummyimage.com/196x100.png/cc0000/ffffff","label":"Langosh-Schowalter","Description":"revolutionize extensible niches"},
	{"img":"http://dummyimage.com/149x100.png/5fa2dd/ffffff","label":"McKenzie, Feeney and Wunsch","Description":"harness clicks-and-mortar portals"},
	{"img":"http://dummyimage.com/129x100.png/dddddd/000000","label":"Kuhlman, Ernser and Boyle","Description":"matrix bricks-and-clicks models"},
	{"img":"http://dummyimage.com/170x100.png/dddddd/000000","label":"Stroman-Howell","Description":"leverage revolutionary users"},
	{"img":"http://dummyimage.com/111x100.png/5fa2dd/ffffff","label":"Hills-Mohr","Description":"enable integrated technologies"},
	{"img":"http://dummyimage.com/216x100.png/cc0000/ffffff","label":"Jerde Inc","Description":"integrate cutting-edge paradigms"},
	{"img":"http://dummyimage.com/145x100.png/dddddd/000000","label":"Konopelski-Flatley","Description":"leverage seamless schemas"},
	{"img":"http://dummyimage.com/142x100.png/dddddd/000000","label":"Cormier, Ledner and Smitham","Description":"enhance user-centric portals"},
	{"img":"http://dummyimage.com/171x100.png/dddddd/000000","label":"Borer-Schamberger","Description":"extend 24/365 portals"},
	{"img":"http://dummyimage.com/214x100.png/5fa2dd/ffffff","label":"Lebsack-Stokes","Description":"optimize world-class vortals"},
	{"img":"http://dummyimage.com/198x100.png/cc0000/ffffff","label":"Schultz-Corkery","Description":"repurpose bleeding-edge action-items"},
	{"img":"http://dummyimage.com/167x100.png/cc0000/ffffff","label":"Will-Hilll","Description":"recontextualize best-of-breed e-tailers"},
	{"img":"http://dummyimage.com/227x100.png/ff4444/ffffff","label":"Aufderhar, Krajcik and Weimann","Description":"disintermediate out-of-the-box interfaces"},
	{"img":"http://dummyimage.com/238x100.png/5fa2dd/ffffff","label":"Fay LLC","Description":"disintermediate ubiquitous bandwidth"},
	{"img":"http://dummyimage.com/133x100.png/5fa2dd/ffffff","label":"Weber-Schiller","Description":"strategize efficient deliverables"},
	{"img":"http://dummyimage.com/182x100.png/cc0000/ffffff","label":"Larkin Group","Description":"revolutionize revolutionary communities"},
	{"img":"http://dummyimage.com/247x100.png/cc0000/ffffff","label":"Schumm-Pfeffer","Description":"maximize cutting-edge solutions"},
	{"img":"http://dummyimage.com/212x100.png/5fa2dd/ffffff","label":"Mayert, Schiller and Rutherford","Description":"productize vertical channels"},
	{"img":"http://dummyimage.com/237x100.png/cc0000/ffffff","label":"Dach-Macejkovic","Description":"syndicate seamless solutions"},
	{"img":"http://dummyimage.com/131x100.png/dddddd/000000","label":"Beahan Inc","Description":"orchestrate clicks-and-mortar eyeballs"},
	{"img":"http://dummyimage.com/196x100.png/ff4444/ffffff","label":"Grimes Inc","Description":"brand sticky paradigms"},
	{"img":"http://dummyimage.com/197x100.png/5fa2dd/ffffff","label":"Stark and Sons","Description":"morph ubiquitous niches"},
	{"img":"http://dummyimage.com/103x100.png/ff4444/ffffff","label":"Harris-Tromp","Description":"recontextualize cross-platform e-commerce"},
	{"img":"http://dummyimage.com/176x100.png/dddddd/000000","label":"Shanahan and Sons","Description":"deploy dynamic supply-chains"},
	{"img":"http://dummyimage.com/203x100.png/cc0000/ffffff","label":"Swaniawski Inc","Description":"utilize virtual deliverables"},
	{"img":"http://dummyimage.com/182x100.png/ff4444/ffffff","label":"Doyle LLC","Description":"embrace turn-key networks"},
	{"img":"http://dummyimage.com/213x100.png/ff4444/ffffff","label":"Kling-Bruen","Description":"iterate synergistic supply-chains"},
	{"img":"http://dummyimage.com/162x100.png/cc0000/ffffff","label":"Stiedemann-Koch","Description":"engineer visionary vortals"},
	{"img":"http://dummyimage.com/160x100.png/5fa2dd/ffffff","label":"Pouros, Kuhn and Reichel","Description":"incentivize ubiquitous systems"},
	{"img":"http://dummyimage.com/140x100.png/cc0000/ffffff","label":"Cruickshank-Gulgowski","Description":"facilitate B2C portals"},
	{"img":"http://dummyimage.com/152x100.png/dddddd/000000","label":"Kertzmann, Larson and Hilll","Description":"repurpose value-added deliverables"},
	{"img":"http://dummyimage.com/227x100.png/cc0000/ffffff","label":"Hartmann-Ullrich","Description":"grow plug-and-play models"},
	{"img":"http://dummyimage.com/249x100.png/cc0000/ffffff","label":"Kuhlman-Johns","Description":"seize out-of-the-box systems"},
	{"img":"http://dummyimage.com/134x100.png/cc0000/ffffff","label":"Fahey-Schaden","Description":"seize sexy markets"},
	{"img":"http://dummyimage.com/208x100.png/ff4444/ffffff","label":"Dach-Botsford","Description":"grow wireless content"},
	{"img":"http://dummyimage.com/141x100.png/cc0000/ffffff","label":"Bosco, Smith and Kemmer","Description":"streamline customized portals"},
	{"img":"http://dummyimage.com/242x100.png/5fa2dd/ffffff","label":"Nader Group","Description":"engineer scalable supply-chains"},
	{"img":"http://dummyimage.com/102x100.png/cc0000/ffffff","label":"Fadel LLC","Description":"innovate e-business convergence"},
	{"img":"http://dummyimage.com/115x100.png/dddddd/000000","label":"Batz, Emard and Runolfsson","Description":"seize turn-key infomediaries"},
	{"img":"http://dummyimage.com/124x100.png/5fa2dd/ffffff","label":"Zieme, Boyle and Larkin","Description":"aggregate 24/7 supply-chains"},
	{"img":"http://dummyimage.com/219x100.png/cc0000/ffffff","label":"Mueller-Gutmann","Description":"strategize bricks-and-clicks partnerships"},
	{"img":"http://dummyimage.com/215x100.png/dddddd/000000","label":"Ankunding-Hoeger","Description":"drive interactive vortals"},
	{"img":"http://dummyimage.com/213x100.png/5fa2dd/ffffff","label":"Sanford, Pacocha and Stiedemann","Description":"evolve out-of-the-box niches"},
	{"img":"http://dummyimage.com/237x100.png/5fa2dd/ffffff","label":"Gutmann, Crona and Gulgowski","Description":"redefine next-generation solutions"},
	{"img":"http://dummyimage.com/200x100.png/cc0000/ffffff","label":"McLaughlin, Carter and Larkin","Description":"integrate B2C interfaces"},
	{"img":"http://dummyimage.com/141x100.png/5fa2dd/ffffff","label":"Swaniawski-Yost","Description":"deliver end-to-end metrics"},
	{"img":"http://dummyimage.com/203x100.png/dddddd/000000","label":"DuBuque Inc","Description":"extend seamless portals"},
	{"img":"http://dummyimage.com/163x100.png/5fa2dd/ffffff","label":"Gorczany-Legros","Description":"incentivize 24/365 models"},
	{"img":"http://dummyimage.com/181x100.png/ff4444/ffffff","label":"Gleason Group","Description":"utilize viral infrastructures"},
	{"img":"http://dummyimage.com/152x100.png/ff4444/ffffff","label":"Deckow, Marks and Koelpin","Description":"visualize revolutionary action-items"},
	{"img":"http://dummyimage.com/219x100.png/ff4444/ffffff","label":"Prohaska and Sons","Description":"aggregate 24/365 web services"},
	{"img":"http://dummyimage.com/183x100.png/cc0000/ffffff","label":"Hartmann-Walter","Description":"scale killer functionalities"},
	{"img":"http://dummyimage.com/202x100.png/ff4444/ffffff","label":"Denesik-Roberts","Description":"whiteboard end-to-end mindshare"},
	{"img":"http://dummyimage.com/228x100.png/5fa2dd/ffffff","label":"Turner Group","Description":"cultivate seamless interfaces"},
	{"img":"http://dummyimage.com/186x100.png/dddddd/000000","label":"Ziemann, Rau and Stanton","Description":"exploit intuitive systems"},
	{"img":"http://dummyimage.com/213x100.png/5fa2dd/ffffff","label":"Schneider Group","Description":"incubate frictionless e-markets"},
	{"img":"http://dummyimage.com/106x100.png/ff4444/ffffff","label":"Koss, Goodwin and Reinger","Description":"aggregate 24/7 eyeballs"},
	{"img":"http://dummyimage.com/173x100.png/ff4444/ffffff","label":"Miller and Sons","Description":"visualize transparent portals"},
	{"img":"http://dummyimage.com/142x100.png/ff4444/ffffff","label":"Senger, Ruecker and Luettgen","Description":"enhance efficient relationships"},
	{"img":"http://dummyimage.com/124x100.png/dddddd/000000","label":"Schultz-Ankunding","Description":"enable e-business supply-chains"},
	{"img":"http://dummyimage.com/130x100.png/cc0000/ffffff","label":"Shanahan, Runte and Thiel","Description":"cultivate customized architectures"},
	{"img":"http://dummyimage.com/111x100.png/cc0000/ffffff","label":"O'Hara-Rippin","Description":"matrix open-source e-commerce"},
	{"img":"http://dummyimage.com/237x100.png/dddddd/000000","label":"Koelpin-Emard","Description":"productize one-to-one experiences"},
	{"img":"http://dummyimage.com/148x100.png/5fa2dd/ffffff","label":"Hilll-Stamm","Description":"iterate wireless web-readiness"},
	{"img":"http://dummyimage.com/210x100.png/dddddd/000000","label":"Rath-Mertz","Description":"syndicate clicks-and-mortar users"},
	{"img":"http://dummyimage.com/158x100.png/dddddd/000000","label":"Fisher LLC","Description":"synergize customized experiences"},
	{"img":"http://dummyimage.com/248x100.png/cc0000/ffffff","label":"Sporer Group","Description":"deliver 24/7 mindshare"},
	{"img":"http://dummyimage.com/166x100.png/5fa2dd/ffffff","label":"Toy Inc","Description":"visualize integrated content"},
	{"img":"http://dummyimage.com/239x100.png/ff4444/ffffff","label":"Willms-Champlin","Description":"e-enable bleeding-edge synergies"},
	{"img":"http://dummyimage.com/190x100.png/5fa2dd/ffffff","label":"Heidenreich, Nienow and Legros","Description":"synthesize wireless architectures"},
	{"img":"http://dummyimage.com/107x100.png/ff4444/ffffff","label":"Connelly LLC","Description":"empower cross-platform e-services"},
	{"img":"http://dummyimage.com/163x100.png/5fa2dd/ffffff","label":"Kshlerin-Walsh","Description":"reintermediate vertical platforms"},
	{"img":"http://dummyimage.com/223x100.png/ff4444/ffffff","label":"Prohaska Inc","Description":"aggregate magnetic applications"},
	{"img":"http://dummyimage.com/197x100.png/ff4444/ffffff","label":"Mayert-Crona","Description":"reinvent efficient bandwidth"},
	{"img":"http://dummyimage.com/195x100.png/cc0000/ffffff","label":"Kuvalis-Kiehn","Description":"repurpose global content"},
	{"img":"http://dummyimage.com/201x100.png/cc0000/ffffff","label":"Armstrong-Wisoky","Description":"cultivate cross-platform initiatives"},
	{"img":"http://dummyimage.com/207x100.png/5fa2dd/ffffff","label":"Graham Inc","Description":"whiteboard customized methodologies"},
	{"img":"http://dummyimage.com/127x100.png/cc0000/ffffff","label":"Hessel Group","Description":"enhance cross-media solutions"},
	{"img":"http://dummyimage.com/248x100.png/ff4444/ffffff","label":"Blick Group","Description":"leverage 24/7 experiences"},
	{"img":"http://dummyimage.com/226x100.png/cc0000/ffffff","label":"Erdman-Schulist","Description":"recontextualize clicks-and-mortar networks"},
	{"img":"http://dummyimage.com/113x100.png/ff4444/ffffff","label":"Kshlerin Group","Description":"synergize value-added applications"},
	{"img":"http://dummyimage.com/207x100.png/cc0000/ffffff","label":"Runolfsdottir-Kilback","Description":"optimize dot-com supply-chains"},
	{"img":"http://dummyimage.com/244x100.png/ff4444/ffffff","label":"Mosciski Group","Description":"mesh holistic metrics"},
	{"img":"http://dummyimage.com/159x100.png/5fa2dd/ffffff","label":"Auer, Jacobs and Zboncak","Description":"incubate next-generation communities"},
	{"img":"http://dummyimage.com/113x100.png/5fa2dd/ffffff","label":"Streich-McClure","Description":"mesh bricks-and-clicks e-business"},
	{"img":"http://dummyimage.com/144x100.png/cc0000/ffffff","label":"Collier and Sons","Description":"implement proactive mindshare"},
	{"img":"http://dummyimage.com/107x100.png/5fa2dd/ffffff","label":"Boyer-Weber","Description":"architect value-added e-tailers"}]

const Integrations = () => {
    
    
    return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account}/>
					<div className="page-name-container">
						<div className="page-name">Integrations</div>
						<p>All availabel</p>

					</div>


      <div className="intergrations">
                        <IntegrationsTable integrations={integrations} />
					</div>
				</div>
			</div>
		</>
	)
}
 
export default Integrations;