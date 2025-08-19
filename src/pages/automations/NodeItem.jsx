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
import PopupText from '../../components/PopupText/PopupText'

const NodeItem = ({ node, type, onAdd, onSelect, removeNode, children, nodes, getChildrenOfCondition, data, onUpdate, handleAdditionalChange, setSideBarShown, isReadOnly = false }) => {
	const [nodeAction, setNodeAction] = useState(null)
	const [showAddPopover, setShowAddPopover] = useState(-1)

	// Safe access to check if node data exists
	const nodeData = node?.data || {};
	const nodeMeta = node?.meta || {};

	const handleAdd = (type, position = 0) => {
		if (type.includes('-')) {
			let subtype = type.split('-')
			console.log('subtype', subtype)
			switch (subtype[0]) {
				case 'action':
					type = 'action'
					switch (subtype[1]) {
						case 'copy':
							onAdd(type, node.id, position, 'copy-to-group')
							break
						case 'move':
							onAdd(type, node.id, position, 'move-to-group')
							break
						case 'remove':
							onAdd(type, node.id, position, 'remove-from-group')
							break
						case 'unsubscribe':
							onAdd(type, node.id, position, 'unsubscribe')
							break
					}
					break
			}
		} else [onAdd(type, node.id, position)]
	}

	const handleRemove = () => {
		removeNode(node.id)
	}
	const extractLinksFromCampaignDesign = (components = [], links = []) => {
		if (!components || !Array.isArray(components)) return links;
		
		components.forEach((component) => {
			if (component.components && component.components.length > 0) {
				links = [...extractLinksFromCampaignDesign(component.components, links)]
			}
			if (component.children && component.children.length > 0) {
				links = [...extractLinksFromCampaignDesign(component.children, links)]
			}
			if (component.type && component.type === 'link') {
				links.push(component?.attributes?.href)
			}
			if (component.key && ['image', 'button'].includes(component.key) && component.linkURL && component.linkURL.length > 9) {
				links.push(component.linkURL)
			}
		})
		return links
	}
	
	const getTplIdLinks = (nodeId) => {
		let links = []
		const tplNode = nodes.filter((node) => node.id === nodeId)[0]

		if (!tplNode) return []

		const tplId = tplNode?.data?.tplId

		let templates = data?.templates || []

		if (templates.length > 0 && tplId) {
			// Find the template and check if it exists
			const template = templates.filter((template) => template.id === tplId)[0];
			if (!template || !template.attributes || !template.attributes.design) {
				return [];
			}
			
			try {
				const tplDesign = JSON.parse(template.attributes.design);
				const components = tplDesign.components || tplDesign.blockList || [];
				const templateLinks = extractLinksFromCampaignDesign(components);
				
				if (templateLinks && templateLinks.length > 0) {
					templateLinks.forEach((ll) => {
						if (typeof ll === 'undefined' || ll === null) return;
						if (!links.includes(ll)) links.push(ll);
					});
				}
				
				links = links.map((link) => ({
					value: link,
					label: link,
				}));
			} catch (error) {
				console.error("Error parsing template design:", error);
				return [];
			}
		}
		return links
	}

	const closestCondition = (nodeId, keymap) => {
		if (!keymap) {
			keymap = {}
			nodes.forEach((c) => {
				if (c && c.id) keymap[c.id] = c
			})
		}
		// Check if nodeId exists in keymap
		if (!keymap[nodeId]) return 0;
		
		if (keymap[nodeId] && keymap[nodeId].input && keymap[nodeId].input[0]) {
			// Check if the input node has a type property and it's a condition
			if (keymap[nodeId].input[0].type && keymap[nodeId].input[0].type == 'condition') {
				return keymap[nodeId].input[0].id;
			}
			// Check if the input node exists but is not a condition
			if (keymap[nodeId].input[0].id) {
				return closestCondition(keymap[nodeId].input[0].id, keymap);
			}
		}
		return 0
	}

	const countConditions = (children = [], count = 0) => {
		if (!children || !Array.isArray(children)) return count;
		
		children.forEach((child) => {
			if (child && child.type && child.type == 'condition') count++
		});
		return count;
	}

	let content = ''
	switch (type) {
		case 'trigger':
			const triggerOptions = [
				{ value: 'when-user-subscribes', label: 'When Subscriber Joins Group' },
				{ value: 'when-user-opens-campaign', label: 'When Subscriber Opens Campaign' },
				{ value: 'when-user-clicks-link', label: 'When Subscriber Clicks Link' },
			]

			// Find the matching trigger option or provide a default
			const triggerOption = node.name ? 
				triggerOptions.find((option) => option.value === node.name) : 
				{ label: 'Select a trigger' };

			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					data-nodeid={node.id}
					onClick={() => {
						onSelect(node)
					}}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						{!isReadOnly && <Icon name="Close" className="close" onClick={handleRemove} />}
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem' }}>
							<h4 className="node-type">{triggerOption?.label || 'Select a trigger'}</h4>
							{node.name === 'when-user-subscribes' && (
								<Dropdown
									icon={'Plus'}
									options={data.groups || []}
									disabled={isReadOnly}
									selectedValue={
										nodeData.group && data.groups ? 
											(data.groups.find((g) => Array.isArray(nodeData.group) ? nodeData.group.includes(g.value) : nodeData.group === g.value) || null) : null
									}
									onOptionSelect={(value) => {
										const updatedNode = { 
											...node, 
											data: { ...nodeData, group: [value.value] }, 
											meta: { ...nodeMeta, label: value.label } 
										};
										onUpdate(updatedNode);
									}}
								>
									{nodeMeta.label ? nodeMeta.label : 'Select a group'}
								</Dropdown>
							)}
							{node.name === 'when-user-opens-campaign' && (
								<Dropdown
									icon={'Plus'}
									options={data.avlCampaigns || []}
									disabled={isReadOnly}
									selectedValue={
										nodeData.cmp && data.avlCampaigns ? 
											(data.avlCampaigns.find((c) => c.value === nodeData.cmp) || null) : null
									}
									onOptionSelect={(value) => {
										const updatedNode = { 
											...node, 
											data: { ...nodeData, cmp: value.value }, 
											meta: { ...nodeMeta, label: value.label } 
										};
										onUpdate(updatedNode);
									}}
								>
									{nodeMeta.label ? nodeMeta.label : 'Select a campaign'}
								</Dropdown>
							)}
							{node.name === 'when-user-clicks-link' && (
								<Dropdown
									icon={'Plus'}
									options={data.cmpLinks || []}
									disabled={isReadOnly}
									searchable={true}
									selectedValue={
										nodeData.link && data.cmpLinks ? 
											(data.cmpLinks.find((l) => l.value === nodeData.link) || null) : null
									}
									onOptionSelect={(value) => {
										const updatedNode = { 
											...node, 
											data: { ...nodeData, link: value.value }, 
											meta: { ...nodeMeta, label: value.label } 
										};
										onUpdate(updatedNode);
									}}
								>
									{nodeMeta.label ? nodeMeta.label : 'Select a link'}
								</Dropdown>
							)}

						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!isReadOnly && (!node.output || !node.output[0] || !node.output[0].id) ? (
						<Card
							style={{ padding: '1em', minHeight: 0, border: '2px dashed #dad1c5', minWidth: '80px' }}
							onDragOver={(e) => {
								e.preventDefault()
							}}
							onDrop={(e) => {
								e.preventDefault()
								const type = e.dataTransfer.getData('text/plain')
								handleAdd(type)
							}}
						>
							{' '}
							<Icon name="Plus" />
						</Card>
					) : (
						''
					)}
				</li>
			)
			break
	case 'email':
			// Use safe access for node data
			const imageUrl = nodeData.tplUuid ? `https://cdn.cobaltfairy.com/fairymail/template/img/${nodeData.tplUuid}` : ''
			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					style={{ minWidth: '240px' }}
					data-nodeid={node.id}
					onClick={() => {
						onSelect(node)
					}}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						{!isReadOnly && <Icon name="Close" className="close" onClick={handleRemove} />}
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<h4 className="node-type">Send an email</h4>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
								<Dropdown
									className={'delay-dropdown'}
									style={{ width: '350px' }}
									disabled={isReadOnly}
									searchable={true}
									options={(data.templates || []).map((t) => {
										return { label: t.attributes.name, value: t.id, uuid: t.attributes.uuid }
									})}
									selectedValue={
										nodeData.tplId ? 
										(data.templates || [])
											.filter(t => t.id === nodeData.tplId)
											.map(t => ({ label: t.attributes.name, value: t.id, uuid: t.attributes.uuid }))[0] || null
										: null
									}
									onOptionSelect={(v) => {
										console.log('data.templates', data.templates)
										const updatedNode = {
											...node,
											templateName: data.templates.filter((t) => t.id == v.value)[0]?.attributes?.name || '',
											data: { 
												...nodeData, 
												tplId: v.value, 
												tplUuid: v.uuid, 
												tplImageLoading: true 
											},
										}
										onUpdate(updatedNode)
									}}
								>
									{' '}
									{nodeMeta.label ? nodeMeta.label : 'Select a template'}
								</Dropdown>
								<InputText
									type="text"
									style={{ marginTop: '10px', minWidth: '350px' }}
									disabled={isReadOnly}
									label="Subject"
									value={nodeData.emailSubject || ''}
									onChange={(e) => {
										const updatedNode = { 
											...node, 
											name: node.type, 
											data: { ...nodeData, emailSubject: e.target.value } 
										};
										onUpdate(updatedNode)
									}}
								/>
								{nodeData.tplUuid && (
									<>
										<img
											src={imageUrl}
											alt=""
											style={{ display: 'none' }}
											onLoad={() => {
												const updatedNode = { 
													...node, 
													data: { ...nodeData, tplImageLoading: false } 
												};
												onUpdate(updatedNode)
											}}
											onError={() => {
												const updatedNode = { 
													...node, 
													data: { ...nodeData, tplImageLoading: false } 
												};
												onUpdate(updatedNode)
											}}
										/>
										{(nodeData.tplImageLoading === true) && (
											<div style={{ minHeight: '100px' }}>
												<div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, 5%) scale(.5)' }}>
													<svg
														viewBox="0 0 100 100"
														preserveAspectRatio="xMidYMid"
														width="200"
														height="200"
														style={{ shapeRendering: 'auto', display: 'block', background: 'transparent' }}
													>
														<g>
															<circle fill="none" strokeWidth="10" stroke="#fff2df" r="30" cy="50" cx="50"></circle>
															<circle fill="none" strokeLinecap="round" strokeWidth="8" stroke="#ff635e" r="30" cy="50" cx="50">
																<animateTransform
																	keyTimes="0;0.5;1"
																	values="0 50 50;180 50 50;720 50 50"
																	dur="1.5625s"
																	repeatCount="indefinite"
																	type="rotate"
																	attributeName="transform"
																></animateTransform>
																<animate
																	keyTimes="0;0.5;1"
																	values="18.84955592153876 169.64600329384882;94.2477796076938 94.24777960769377;18.84955592153876 169.64600329384882"
																	dur="1.5625s"
																	repeatCount="indefinite"
																	attributeName="stroke-dasharray"
																></animate>
															</circle>
															<g></g>
														</g>
													</svg>
												</div>
											</div>
										)}
										{(!nodeData.tplImageLoading) && (
											<>
												<div
													style={{
														minHeight: '200px',
														width: '100%',
														background: `url('${imageUrl}')`,
														backgroundRepeat: 'no-repeat',
														backgroundSize: 'cover',
														backgroundPositionY: 0,
													}}
												>
													<Button
														type="secondary"
														style={{ position: 'absolute', background: 'white', bottom: '30px', right: '50px' }}
														onClick={async () => {
															await PopupText.fire({
																text: 'The template editor will now open in a new tab. Once you save any changes, you can safely close that tab and return to this one.',
																showCancelButton: true,
																confirmButtonText: 'OK',
																onConfirm: () => {
																	if (nodeData.tplUuid) {
																		window.open(`/templates/edit/${nodeData.tplUuid}`);
																	}
																},
															})
														}}
													>
														Edit template
													</Button>
												</div>
											</>
										)}
									</>
								)}
							</div>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!isReadOnly && (!node.output || !node.output[0] || !node.output[0].id) ? (
						<Card
							style={{ padding: '1em', minHeight: 0, border: '2px dashed #dad1c5', minWidth: '80px' }}
							onDragOver={(e) => {
								e.preventDefault()
							}}
							onDrop={(e) => {
								e.preventDefault()
								const type = e.dataTransfer.getData('text/plain')
								handleAdd(type)
							}}
						>
							{' '}
							<Icon name="Plus" />
						</Card>
					) : (
						''
					)}
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

			// Safely find the action option
			const actionOption = node.name ? 
				actionOptions.find((option) => option.value === node.name) : 
				null;

			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					data-nodeid={node.id}
					onClick={() => {
						onSelect(node)
					}}
					style={{ minWidth: '200px' }}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						{!isReadOnly && <Icon name="Close" className="close" onClick={handleRemove} />}
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<h4 className="node-type">{actionOption?.label || 'Select an action'}</h4>
							{['copy-to-group', 'move-to-group'].includes(node.name) && (
								<Dropdown
									style={{ minWidth: '270px' }}
									disabled={isReadOnly}
									onOptionSelect={(v, l) => {
										const updatedNode = { 
											...node, 
											data: { group: [v] }, 
											meta: { label: v.label } 
										};
										onUpdate(updatedNode)
									}}
									options={
										// Filter out the trigger group
										(data.groups || []).filter(group => {
											// Find trigger node
											const triggerNode = nodes.find(n => n.type === 'trigger' && n.name === 'when-user-subscribes');
											// If there's a trigger node with a group, filter it out
											return !triggerNode || 
												!triggerNode.data || 
												!triggerNode.data.group || 
												!triggerNode.data.group[0] || 
												triggerNode.data.group[0] !== group.value;
										})
									}
								>
									{nodeMeta.label ? nodeMeta.label : 'Choose destination group'}
								</Dropdown>
							)}
							{node.name === 'remove-from-group' && (
								<Dropdown
									style={{ minWidth: '270px' }}
									disabled={isReadOnly}
									onOptionSelect={(v, l) => {
										const updatedNode = { 
											...node, 
											data: { group: [v] }, 
											meta: { label: v.label } 
										};
										onUpdate(updatedNode)
									}}
									options={data.groups || []}
								>
									{nodeMeta.label ? nodeMeta.label : 'Choose group to remove'}
								</Dropdown>
							)}
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!isReadOnly && (!node.output || !node.output[0] || !node.output[0].id) ? (
						<Card
							style={{ padding: '1em', minHeight: 0, border: '2px dashed #dad1c5', minWidth: '80px' }}
							onDragOver={(e) => {
								e.preventDefault()
							}}
							onDrop={(e) => {
								e.preventDefault()
								const type = e.dataTransfer.getData('text/plain')
								handleAdd(type)
							}}
						>
							{' '}
							<Icon name="Plus" />
						</Card>
					) : (
						''
					)}
				</li>
			)
			break
		case 'delay':
			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					data-nodeid={node.id}
					onClick={() => {
						onSelect(node)
					}}
					style={{ minWidth: '200px' }}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						{!isReadOnly && <Icon name="Close" className="close" onClick={handleRemove} />}
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '180px' }}>
								<Icon name="Clock" style={{ marginRight: '20px' }} />
								<h4 className="node-type">Add a delay</h4>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<InputText
									type="number"
									style={{ marginTop: '10px', width: '140px', marginRight: '10px' }}
									disabled={isReadOnly}
									label="Delay"
									value={nodeData.delay && nodeData.delay[0] ? nodeData.delay[0] : ''}
									onChange={(e) => {
										const updatedNode = { 
											...node, 
											data: { 
												...nodeData, 
												delay: [e.target.value] 
											} 
										};
										onUpdate(updatedNode)
									}}
								/>
								<Dropdown
									className={'delay-dropdown'}
									disabled={isReadOnly}
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
									onOptionSelect={(v, l) => {
										const updatedNode = { 
											...node, 
											name: node.type, 
											data: { 
												...nodeData, 
												delayValue: [v], 
												meta: { 
													...nodeData.meta, 
													label: v.label 
												} 
											} 
										};
										onUpdate(updatedNode)
									}}
								>
									{' '}
									{nodeMeta.label || (nodeData.meta?.label) || 
									(nodeData.delayValue && nodeData.delayValue[0] && nodeData.delayValue[0].label) || 
									'Select delay type'}
								</Dropdown>
							</div>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!isReadOnly && (!node.output || !node.output[0] || !node.output[0].id) ? (
						<Card
							style={{ padding: '1em', minHeight: 0, border: '2px dashed #dad1c5', minWidth: '80px' }}
							onDragOver={(e) => {
								e.preventDefault()
							}}
							onDrop={(e) => {
								e.preventDefault()
								const type = e.dataTransfer.getData('text/plain')
								handleAdd(type)
							}}
						>
							{' '}
							<Icon name="Plus" />
						</Card>
					) : (
						''
					)}
				</li>
			)
			break
		case 'condition':
			const conditionOptions = [
				{ value: 'workflow-activity', label: 'Workflow Activity' },
				{ value: 'cmp-activity', label: 'Campaign Activity' },
			]
			const workflowConditionOptions = [
				{ value: 'cmp_open', label: 'was opened' },
				{ value: 'cmp_not_open', label: 'was not opened' },
				{ value: 'cmp_link_clicked', label: 'had a specific link clicked' },
				{ value: 'cmp_link_not_clicked', label: 'had a specific link not clicked' },
			]
			
			// Safely compute condition variables
			const howManyConditions = (children && children[0]) ? countConditions(children[0], 0) : 0;
			const nodesWithConditions = nodes.filter((n) => n && n.type === 'condition');
			const isFirstCondition = nodesWithConditions.length > 0 && 
				nodesWithConditions[0].id === node.id;
			
			// Find matching condition option safely
			const conditionOption = node.name ? 
				conditionOptions.find((option) => option.value === node.name) : 
				null;
			
			content = (
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					data-nodeid={node.id}
					onClick={() => {
						onSelect(node)
					}}
					style={{ minWidth: 340 + 2 * howManyConditions * 100 + 'px' }}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Card>
							{!isReadOnly && <Icon name="Close" className="close" onClick={handleRemove} />}
							<div className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
								<h4 className="node-type">Condition: {conditionOption?.label || 'Select a condition'}</h4>
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<Dropdown
										options={conditionOptions}
										style={{ width: '350px' }}
										disabled={isReadOnly}
										onOptionSelect={(v, l) => {
											const updatedNode = { 
												...node, 
												name: v.value, 
												data: { ...(nodeData || {}) }, 
												meta: { label: v.label } 
											};
											onUpdate(updatedNode)
										}}
									>
										{' '}
										{nodeMeta.label || 'Select a condition'}{' '}
									</Dropdown>
									{node.name === 'cmp-activity' && (
										<>
											<Dropdown
												options={data.avlCampaigns || []}
												style={{ width: '350px' }}
												disabled={isReadOnly}
												onOptionSelect={(v, l) => {
													const updatedNode = { 
														...node, 
														data: { ...nodeData, cmp: v }, 
														meta: {} 
													};
													onUpdate(updatedNode)
												}}
											>
												{' '}
												Select a campaign{' '}
											</Dropdown>

											{nodeData.cmp && (
												<>
													<Dropdown
														options={workflowConditionOptions}
														style={{ width: '350px' }}
														disabled={isReadOnly}
														onOptionSelect={(v) => {
															const updatedNode = { 
																...node, 
																data: { ...nodeData, trigger: v } 
															};
															onUpdate(updatedNode)
														}}
													>
														{' '}
														Select a trigger{' '}
													</Dropdown>
													{nodeData.trigger && ['cmp_link_clicked', 'cmp_link_not_clicked'].includes(nodeData.trigger) && (
														<>
															<Dropdown
																options={data.cmpLinks || []}
																style={{ width: '350px', maxWidth: '350px' }}
																disabled={isReadOnly}
																onOptionSelect={(v) => {
																	const updatedNode = { 
																		...node, 
																		data: { ...nodeData, link: v } 
																	};
																	onUpdate(updatedNode)
																}}
															>
																{' '}
																Select a link
															</Dropdown>
														</>
													)}
												</>
											)}
										</>
									)}
									{node.name === 'workflow-activity' && (
										<>
											<Dropdown
												options={data.workflowCampaigns || []}
												style={{ width: '350px' }}
												disabled={isReadOnly}
												onOptionSelect={(v) => {
													const updatedNode = { 
														...node, 
														data: { ...nodeData, cmp: v.value, email_node_id: v.value }, 
														meta: { ...nodeMeta, cmpname: v.label } 
													};
													onUpdate(updatedNode)
												}}
											>
												{' '}
												{nodeMeta.cmpname || 'Select a campaign'}
											</Dropdown>

											{nodeData.cmp && (
												<>
													<Dropdown
														options={workflowConditionOptions}
														style={{ width: '350px' }}
														disabled={isReadOnly}
														onOptionSelect={(v) => {
															const updatedNode = { 
																...node, 
																data: { ...nodeData, trigger: v.value }, 
																meta: { ...nodeMeta, triggerName: v.label } 
															};
															onUpdate(updatedNode)
														}}
													>
														{' '}
														{nodeMeta.triggerName || 'Select a trigger'}{' '}
													</Dropdown>
													{nodeData.trigger && ['cmp_link_clicked', 'cmp_link_not_clicked'].includes(nodeData.trigger) && (
														<>
															<Dropdown
																options={getTplIdLinks(nodeData.email_node_id) || []}
																style={{ width: '350px', maxWidth: '350px' }}
																disabled={isReadOnly}
																onOptionSelect={(v) => {
																	const updatedNode = { 
																		...node, 
																		data: { ...nodeData, link: v } 
																	};
																	onUpdate(updatedNode)
																}}
															>
																{' '}
																{nodeData.link?.value || 'Select a link'}
															</Dropdown>
														</>
													)}
												</>
											)}
										</>
									)}
									{node.name === 'when-user-opens-campaign' && (
										<>
											<Dropdown
												options={data.avlCampaigns || []}
												style={{ width: '350px' }}
												disabled={isReadOnly}
												onOptionSelect={(v) => {
													const updatedNode = { 
														...node, 
														data: { ...nodeData, cmp: v } 
													};
													onUpdate(updatedNode)
												}}
											>
												{' '}
												Select a campaign{' '}
											</Dropdown>
										</>
									)}
									{node.name === 'when-user-clicks-link' && (
										<>
											<Dropdown
												options={data.cmpLinks || []}
												style={{ width: '350px' }}
												disabled={isReadOnly}
												onOptionSelect={(v) => {
													const updatedNode = { 
														...node, 
														data: { ...nodeData, link: v.value } 
													};
													onUpdate(updatedNode)
												}}
											>
												{' '}
												Select a link{' '}
											</Dropdown>
										</>
									)}
								</div>
							</div>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center" style={{ minWidth: isFirstCondition ? '1000px' : '1px' }}>
						<div className="automation-node-vertical-line"></div>
						<div className="automation-node-horizontal-line" style={{ width: 650 + howManyConditions * 50 + (isFirstCondition ? 300 : 0) + 'px' }} />

						<div className="d-flex flex-row w-100" style={{ justifyContent: 'space-between', alignItems: 'start' }}>
							{/* START OF LEFT LEG (true) */}
							<div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', marginLeft: '-40px' }}>
								<div className="automation-node-vertical-line"></div>
								{!isReadOnly ? (
									<Card
										style={{ padding: '1em', minHeight: 0, border: '2px dashed #dad1c5', minWidth: '80px' }}
										onDrop={(e) => {
											e.preventDefault()
											const type = e.dataTransfer.getData('text/plain')
											handleAdd(type)
										}}
										onDragOver={(e) => {
											e.preventDefault()
										}}
									>
										<Icon name="Check" />
									</Card>
								) : (
									<div style={{ padding: '1em', minHeight: 0, minWidth: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
										<Icon name="Check" />
									</div>
								)}
								{children && Array.isArray(children[0]) && children[0].length > 0 && <div className="automation-node-vertical-line"></div>}
								<ul style={{ listStyleType: 'none', display: 'flex', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 0, padding: 0 }}>
									{children &&
										Array.isArray(children[0]) &&
										children[0].map((child) => {
											// Safely handle child checking
											if (!child) return null;
											
											// Generate children for this node
											let children0 = [undefined, undefined];
											if (child && child.id) {
												children0 = [0, 1].map((index) => getChildrenOfCondition(nodes, child.id, index));
											}
											
											// Only render if this node is connected to the current condition
											const nodeCondition = closestCondition(child.id);
											if (nodeCondition === node.id) {
												return (
													<NodeItem
														key={child.id || Math.random()}
														node={child}
														type={child.type || ''}
														onAdd={onAdd}
														onSelect={onSelect}
														nodes={nodes}
														removeNode={removeNode}
														children={children0}
														getChildrenOfCondition={getChildrenOfCondition}
														handleAdditionalChange={handleAdditionalChange}
														setSideBarShown={setSideBarShown}
														data={data}
														onUpdate={onUpdate}
														isReadOnly={isReadOnly}
													/>
												);
											}
											return null;
										})}
								</ul>
							</div>
							{/* END OF LEFT LEG (true) */}
							{/* START OF RIGHT LEG (true) */}
							<div className="d-flex flex-column align-items-end" style={{ alignItems: 'center', marginRight: '-40px' }}>
								<div className="automation-node-vertical-line"></div>
								{!isReadOnly ? (
									<Card
										style={{ padding: '1em', minHeight: 0, border: '2px dashed #dad1c5', minWidth: '80px' }}
										onDrop={(e) => {
											e.preventDefault()
											const type = e.dataTransfer.getData('text/plain')
											handleAdd(type, 1)
										}}
										onDragOver={(e) => {
											e.preventDefault()
										}}
									>
										<Icon name="Close" />
									</Card>
								) : (
									<div style={{ padding: '1em', minHeight: 0, minWidth: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
										<Icon name="Close" />
									</div>
								)}

								{children && Array.isArray(children[1]) && children[1].length > 0 && <div className="automation-node-vertical-line"></div>}

								<ul style={{ listStyleType: 'none', display: 'flex', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 0, padding: 0 }}>
									{children &&
										Array.isArray(children[1]) &&
										children[1].map((child) => {
											// Safely handle child checking
											if (!child) return null;
											
											// Generate children for this node
											let children1 = [undefined, undefined];
											if (child && child.id) {
												children1 = [0, 1].map((index) => getChildrenOfCondition(nodes, child.id, index));
											}
											
											// Only render if this node is connected to the current condition
											const nodeCondition = closestCondition(child.id);
											if (nodeCondition === node.id) {
												return (
													<NodeItem
														key={child.id || Math.random()}
														node={child}
														type={child.type || ''}
														onAdd={onAdd}
														onSelect={onSelect}
														nodes={nodes}
														removeNode={removeNode}
														children={children1}
														data={data}
														setSideBarShown={setSideBarShown}
														getChildrenOfCondition={getChildrenOfCondition}
														handleAdditionalChange={handleAdditionalChange}
														onUpdate={onUpdate}
														isReadOnly={isReadOnly}
													/>
												);
											}
											return null;
										})}
								</ul>
							</div>
							{/* END OF RIGHT LEG (true) */}
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