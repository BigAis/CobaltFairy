import './App.css'
import Button from './components/Button'
import ButtonGroup from './components/ButtonGroup'
import Pagination from './components/Pagination'
import SubsCounter from './components/SubsCounter'

function App() {
	return (
		<>
			<div className="d-flex flex-column gap-20">
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Default</p>
					<Button icon={'plus'}>Primary</Button>
					<Button>Primary</Button>
					<Button type="secondary" icon={'plus'}>
						Primary
					</Button>
					<Button type="secondary">Primary</Button>
				</div>
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Hover (hover the mouse)</p>
					<Button icon={'plus'} hovered>
						Primary
					</Button>
					<Button hovered>Primary</Button>
					<Button type="secondary" icon={'plus'} hovered>
						Primary
					</Button>
					<Button type="secondary" hovered>
						Primary
					</Button>
				</div>
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Active</p>
					<Button icon={'plus'} active>
						Primary
					</Button>
					<Button active>Primary</Button>
					<Button type="secondary" icon={'plus'} active>
						Primary
					</Button>
					<Button type="secondary" active>
						Primary
					</Button>
				</div>
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Inactive</p>
					<Button icon={'plus'} inactive>
						Primary
					</Button>
					<Button inactive>Primary</Button>
					<Button type="secondary" icon={'plus'} inactive>
						Primary
					</Button>
					<Button type="secondary" inactive>
						Primary
					</Button>
				</div>
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Disabled</p>
					<Button icon={'plus'} disabled>
						Primary
					</Button>
					<Button disabled>Primary</Button>
					<Button type="secondary" icon={'plus'} disabled>
						Primary
					</Button>
					<Button type="secondary" disabled>
						Primary
					</Button>
				</div>
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Loading</p>
					<Button icon={'plus'} loading>
						Primary
					</Button>
					<Button loading>Primary</Button>
					<Button type="secondary" icon={'plus'} loading>
						Primary
					</Button>
					<Button type="secondary" loading>
						Primary
					</Button>
				</div>
			</div>
			<div className="d-flex flex-column gap-20">
				<div className="d-flex flex-row gap-10">
					<p>&nbsp;</p>
					<p>&nbsp;</p>
					<p>&nbsp;</p>
				</div>
			</div>
			<div className="d-flex flex-column gap-20">
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Button Group</p>
					<ButtonGroup value='today' options={[
						{value:'today',label:'Today'},
						{value:'7days',label:'7 Days'},
						{value:'30days',label:'30 Days'},
						{value:'all',label:'All'},
					]} onChange={(value)=>{
						console.log(value)
					}}>

					</ButtonGroup>
				</div>
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Pagination</p>
					<Pagination currentPage={1} totalResults={120} resultsPerPage={20} onChange={(page)=>{
						console.log('Selected page is ',page)
					}}></Pagination>
				</div>
			</div>
			<div className="d-flex flex-column gap-20">
				<div className="d-flex flex-row gap-10">
					<p>&nbsp;</p>
					<p>&nbsp;</p>
					<p>&nbsp;</p>
				</div>
			</div>
			<div className="d-flex flex-column gap-20">
				<div className="d-flex flex-row gap-10">
					<p style={{ width: '100px' }}>Subs Counter</p>
					<SubsCounter currentSubs={200} subsLimit={1500} onClick={()=>{
						console.log('SubsCounter clicked!')
					}}> </SubsCounter>
				</div>
			</div>
		</>
	)
}

export default App
