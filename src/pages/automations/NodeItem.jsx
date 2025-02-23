import React, { useState } from 'react'
import NodeTypeSelector from './NodeTypeSelector'

import action from '/images/automations/action.png'
import clock from '/images/automations/clock.png'
import condition from '/images/automations/condition.png'
import mail from '/images/automations/mail.png'
import Button from '../../components/Button'
import Switch from '../../components/Switch'
import Dropdown from '../../components/Dropdown'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import InputText from '../../components/InputText/InputText'


const NodeItem = ({ node, type, onAdd, onSelect, removeNode, children, nodes, getChildrenOfCondition, data, onUpdate, handleAdditionalChange, setSideBarShown }) => {
	const [nodeAction, setNodeAction] = useState(null)
	const [showAddPopover, setShowAddPopover] = useState(-1)

	const handleAdd = (type, position = 0) => {
		setShowAddPopover(-1)
		onAdd(type, node.id, position)
	}

	const showPopover = (type = 0) => {
		setShowAddPopover(type)
	}

	const handleRemove = () => {
		removeNode(node.id)
	}

	const closestCondition = (nodeId, keymap) => {
		if (!keymap) {
			keymap = {}
			nodes.forEach((c) => {
				if (c && c.id) keymap[c.id] = c
			})
		}
		if (keymap[nodeId] && keymap[nodeId].input && keymap[nodeId].input[0] && keymap[nodeId].input[0].type && keymap[nodeId].input[0].type == 'condition') return keymap[nodeId].input[0].id
		if (keymap[nodeId] && keymap[nodeId].input && keymap[nodeId].input[0] && keymap[nodeId].input[0].type && keymap[nodeId].input[0].type != 'condition')
			return closestCondition(keymap[nodeId].input[0].id, keymap)
		return 0
	}

	const countConditions = (children = [], count = 0) => {
		if (children) {
			children.map((child) => {
				if (child && child.type && child.type == 'condition') count++
				// let children0 = [0, 1].map((index) => {
				// 	if (child && child.id) return getChildrenOfCondition(nodes, child.id, index)
				// })
				// count = countConditions(children0[0],count);
				// count = countConditions(children0[1],count);
			})
		}
		return count
	}

	let content = ''
	switch (type) {
		case 'trigger':
			const triggerOptions = [
				{ value: 'when-user-subscribes', label: 'When Subscriber Joins Group' },
				{ value: 'when-user-opens-campaign', label: 'When Subscriber Opens Campaign' },
				{ value: 'when-user-clicks-link', label: 'When Subscriber Clicks Link' },
			]

			content = (
				<li className="d-flex flex-column align-items-center automation-node-item" data-nodeid={node.id} onClick={onSelect}>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem' }}>
							<h4 className='node-type'>{triggerOptions.find((option) => option.value === node.name).label}</h4>
							<br></br>
							{node?.meta && node?.meta.label ? (
								<>
									<br></br>
									<p style={{ width: '100%', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>{node?.meta.label}</p>
								</>
							) : (
								(
									<Dropdown icon={'Plus'} options={data.groups} onOptionSelect={(value)=>{handleAdditionalChange(data.groups.filter(g=>g.value==value))}}>
										Select a group
									</Dropdown>
								)
							)}
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					<NodeTypeSelector
						shown={showAddPopover == 0}
						onSelected={handleAdd}
						onDismissed={() => {
							setShowAddPopover(-1)
						}}
					/>
				</li>
			)
			break
		case 'email':
			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					style={{ minWidth: '240px' }}
					data-nodeid={node.id}
					onClick={(e) => {
						onSelect(e)
					}}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Icon name="Close" className="close"  onClick={handleRemove}/>
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							
							<h4 className='node-type'>Send an email</h4>
							<div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between'}}>
								
								<Dropdown
									className={'delay-dropdown'}
									style={{width:'350px'}}
									options={data.templates.map(t=>{return {label:t.attributes.name, value:t.id}})}
									onOptionSelect={(v)=>{
										onUpdate({...node,templateName: data.templates.filter(t=>t.id==v)[0].attributes.name, data: { ...node.data, tplId: v }})
										
									}}> Select a template
								</Dropdown>
								<InputText 
									type="text"
									style={{marginTop:'10px', minWidth:'350px', marginRight:'10px'}}
									label="Subject"
									onChange={(e)=>{
										onUpdate({...node, data: { ...node.data, emailSubject: e.target.value }})
									}}
								/>
							</div>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					<NodeTypeSelector
						shown={showAddPopover == 0}
						onSelected={handleAdd}
						onDismissed={() => {
							setShowAddPopover(-1)
						}}
					/>
				</li>
			)
			break
		case 'action':
			const actionOptions = [
				{ value: 'copy-to-group', label: 'Copy to Group' },
				{ value: 'move-to-group', label: 'Move to Group' },
				{ value: 'remove-from-group', label: 'Remove from Group' },
				{ value: 'unsubscribe', label: 'Unsubscribe' },
			]

			content = (
				<li className="d-flex flex-column align-items-center automation-node-item" data-nodeid={node.id} onClick={onSelect} style={{ minWidth: '200px' }}>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Icon name="Close" className="close"  onClick={handleRemove}/>
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<h4 className='node-type'>{node?.name ? actionOptions.find((option) => option.value === node.name).label : ''}</h4>
							{ ("copy-to-group" == node?.name || "move-to-group" == node?.name) && (
								<Dropdown
									style={{minWidth:'270px'}}
									onOptionSelect={()=>{}}
									options={data.groups}
								>Choose destination group</Dropdown>
							)}
							{ ("remove-from-group" == node?.name) && (
								<Dropdown
									style={{minWidth:'270px'}}
									onOptionSelect={()=>{}}
									options={data.groups}
								>Choose group to remove</Dropdown>
							)}
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					<NodeTypeSelector
						shown={showAddPopover == 0}
						onSelected={handleAdd}
						onDismissed={() => {
							setShowAddPopover(-1)
						}}
					/>
				</li>
			)
			break
		case 'delay':
			content = (
				<li className="d-flex flex-column align-items-center automation-node-item" data-nodeid={node.id} onClick={onSelect} style={{ minWidth: '200px' }}>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Icon name="Close" className="close"  onClick={handleRemove}/>
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<div style={{display:'flex', justifyContent:'space-evenly', alignItems:'center', width:'180px'}}>
								<Icon name="Clock" style={{marginRight:'20px'}}/>
								<h4 className='node-type'>Add a delay</h4>
							</div>
							<div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
								<InputText 
									type="number"
									style={{marginTop:'10px', width:'140px', marginRight:'10px'}}
									label="Delay"
									onChange={(e)=>{
										onUpdate({...node,data:{...node.data,delay:e.target.value}})
									}}
								/>
								<Dropdown
								className={'delay-dropdown'}
									options={[
										{
											label: 'Days',
											value: 'days',
										},
										{
											label: 'Hours',
											value: 'hours',
										},
									]}
								 onOptionSelect={(v)=>{
									onUpdate({...node,data:{...node.data,delayValue:v}})
								 }}> Select delay type 
								</Dropdown>
								
							</div>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					<NodeTypeSelector
						shown={showAddPopover == 0}
						onSelected={handleAdd}
						onDismissed={() => {
							setShowAddPopover(-1)
						}}
					/>
				</li>
			)
			break
		case 'condition':
			// const conditionOptions = [
			// 	{ value: 'when-user-opens-campaign', label: 'If Subscriber has opened a campaign' },
			// 	{ value: 'when-user-clicks-link', label: 'If Subscriber has clicked a link' },
			// ]

			const conditionOptions = [
				{ value: 'workflow-activity', label: 'Workflow Activity' },
				{ value: 'cmp-activity', label: 'Campaign Activity' },
			]

			let howManyConditions = 0
			howManyConditions += children && children[0] ? countConditions(children[0], 0) : 0
			// console.log(node.id, howManyConditions)
			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					data-nodeid={node.id}
					onClick={(e) => {
						onSelect(e)
					}}
					style={{ minWidth: 340 + 2 * howManyConditions * 100 + 'px' }}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Icon name="Close" className="close"  onClick={handleRemove}/>
						<div className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<img src={condition} style={{ width: '30px' }} />
							<br></br>
							{node?.name ? conditionOptions.find((option) => option.value === node.name)?.label : 'Select a condition'}
							{node?.meta && node?.meta?.label ? (
								<>
									<br></br>
									<p style={{ width: '100%', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>{node?.meta.label}</p>
								</>
							) : (
								''
							)}
						</div>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
						<div className="automation-node-horizontal-line" style={{ width: 340 + 2 * howManyConditions * 100 + 'px' }} />

						<div className="d-flex flex-row justify-content-between w-100">
							<div>
								<div className="automation-node-vertical-line"></div>
								<button className="automation-btn-success btn-border-secondary" style={{ marginLeft: '-12px' }}>
									<i className="fa fa-check" />
								</button>
								<div className="automation-node-vertical-line"></div>
								{!node.output || !node.output[0] || !node.output[0].id ? (
									<button
										className="border-secondary automation-node-plus-btn"
										style={{ marginLeft: '-12px' }}
										onClick={() => {
											showPopover(0)
										}}
									>
										+
									</button>
								) : (
									''
								)}
								<NodeTypeSelector
									key={0}
									shown={showAddPopover == 0}
									selectedCondition={true}
									onSelected={handleAdd}
									onDismissed={() => {
										setShowAddPopover(-1)
									}}
								/>
								<ul style={{ listStyleType: 'none', display: 'flex', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 0, padding: 0 }}>
									{children &&
										children[0] &&
										children[0].map((child) => {
											let children0 = [0, 1].map((index) => {
												if (child && child.id) return getChildrenOfCondition(nodes, child.id, index)
											})
											if (closestCondition(child.id) == node.id)
												return (
													<NodeItem
														key={child ? child.id : 0}
														node={child}
														type={child ? child.type : ''}
														onAdd={onAdd}
														onSelect={onSelect} // Use onSelect here, not selectNode
														nodes={nodes}
														removeNode={removeNode}
														children={children0}
														getChildrenOfCondition={getChildrenOfCondition}
														handleAdditionalChange={handleAdditionalChange}
														setSideBarShown={setSideBarShown}
														data={data}
														onUpdate={onUpdate}
													/>
												)
										})}
								</ul>
							</div>

							<div className="d-flex flex-column align-items-end">
								<div className="automation-node-vertical-line"></div>

								<button className="automation-btn-danger btn-danger border-secondary " style={{ marginRight: '-12px' }}>
									<i className="fa fa-times" />
								</button>
								<div className="automation-node-vertical-line"></div>
								{!node.output || !node.output[1] || !node.output[1].id ? (
									<button
										className="border-secondary automation-node-plus-btn"
										style={{ marginRight: '-12px' }}
										onClick={() => {
											showPopover(1)
										}}
									>
										+
									</button>
								) : (
									''
								)}
								<NodeTypeSelector
									key={1}
									shown={showAddPopover == 1}
									selectedCondition={false}
									onSelected={handleAdd}
									onDismissed={() => {
										setShowAddPopover(-1)
									}}
								/>
								<ul style={{ listStyleType: 'none', display: 'flex', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 0, padding: 0 }}>
									{children &&
										children[1] &&
										children[1].map((child) => {
											let children1 = [0, 1].map((index) => {
												if (child && child.id) return getChildrenOfCondition(nodes, child.id, index)
											})
											if (closestCondition(child.id) == node.id)
												return (
													<NodeItem
														key={child ? child.id : 0}
														node={child}
														type={child ? child.type : ''}
														onAdd={onAdd}
														onSelect={onSelect} // Use onSelect here, not selectNode
														nodes={nodes}
														removeNode={removeNode}
														children={children1}
														data={data}
														setSideBarShown={setSideBarShown}
														getChildrenOfCondition={getChildrenOfCondition}
														handleAdditionalChange={handleAdditionalChange}
														onUpdate={onUpdate}
													/>
												)
										})}
								</ul>
							</div>
						</div>
					</div>
				</li>
			)
			break
		default:
			content = ''
			break
	}

	return <>{content}</>
}

export default NodeItem
