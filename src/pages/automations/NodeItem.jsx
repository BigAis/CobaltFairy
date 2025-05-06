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

const NodeItem = ({ node, type, onAdd, onSelect, removeNode, children, nodes, getChildrenOfCondition, data, onUpdate, handleAdditionalChange, setSideBarShown }) => {
	const [nodeAction, setNodeAction] = useState(null)
	const [showAddPopover, setShowAddPopover] = useState(-1)

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
	// const getTplIdLinks = (nodeId) => {
	// 	let links = []
	// 	const tplNode = nodes.filter((node) => node.id === nodeId)[0]
	// 	if(!tplNode) return [];
	// 	const tplId = tplNode?.data?.tplId
	// 	let templates = data.templates;
	// 	if (templates.length > 0 && tplId) {
	// 		const tplDesign = JSON.parse(templates.filter((template) => template.id === tplId)[0]?.attributes?.design)
	// 		console.log('tplId: ',tplDesign)
	// 		const templateLinks = extractLinksFromCampaignDesign(tplDesign.components ?? tplDesign.blockList)
	// 		if (templateLinks.length > 0) {
	// 			templateLinks.forEach((ll) => {
	// 				if (!links.includes(ll)) links.push(ll)
	// 			})
	// 		}
	// 		links = links.map((link) => ({
	// 			value: link,
	// 			label: link,
	// 		}))
	// 	}
	// 	return links
	// }
	const getTplIdLinks = (nodeId) => {
		let links = []
		const tplNode = nodes.filter((node) => node.id === nodeId)[0]

		if (!tplNode) return []

		const tplId = tplNode?.data?.tplId

		let templates = data.templates

		if (templates.length > 0 && tplId) {
			const tplDesign = JSON.parse(templates.filter((template) => template.id === tplId)[0]?.attributes?.design)
			const templateLinks = extractLinksFromCampaignDesign(tplDesign.components ?? tplDesign.blockList)
			if (templateLinks.length > 0) {
				templateLinks.forEach((ll) => {
					if (typeof ll === 'undefined') return
					if (!links.includes(ll)) links.push(ll)
				})
			}
			links = links.map((link) => ({
				value: link,
				label: link,
			}))
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
				<li
					className="d-flex flex-column align-items-center automation-node-item"
					data-nodeid={node.id}
					onClick={() => {
						onSelect(node)
					}}
				>
					<div className="automation-node-vertical-line"></div>
					<div className="d-flex flex-column automation-node-content-wrapper">
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem' }}>
							<h4 className="node-type">{triggerOptions.find((option) => option.value === node.name).label}</h4>
							<Dropdown
								icon={'Plus'}
								options={data.groups}
								onOptionSelect={(value) => {
									handleAdditionalChange(data.groups.filter((g) => g.value == value.value))
								}}
							>
								{node.meta && node.meta.label ? node.meta.label : 'Select a group'}
							</Dropdown>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!node.output || !node.output[0] || !node.output[0].id ? (
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
			// const [isImgLoading,setIsImgLoading] = useState(true);
			const imageUrl = node?.data?.tplUuid ? `https://cdn.cobaltfairy.com/fairymail/template/img/${node.data.tplUuid}` : ''
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
						<Icon name="Close" className="close" onClick={handleRemove} />
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<h4 className="node-type">Send an email</h4>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
								<Dropdown
									className={'delay-dropdown'}
									style={{ width: '350px' }}
									options={data.templates.map((t) => {
										return { label: t.attributes.name, value: t.id, uuid: t.attributes.uuid }
									})}
									onOptionSelect={(v) => {
										console.log('data.templates', data.templates)
										node = {
											...node,
											templateName: data.templates.filter((t) => t.id == v.value)[0].attributes.name,
											data: { ...node.data, tplId: v.value, tplUuid: v.uuid, tplImageLoading: true },
										}
										onUpdate(node)
									}}
								>
									{' '}
									{node.meta && node.meta.label ? node.meta.label : 'Select a template'}
								</Dropdown>
								<InputText
									type="text"
									style={{ marginTop: '10px', minWidth: '350px' }}
									label="Subject"
									value={node?.data?.emailSubject ?? ''}
									onChange={(e) => {
										node = { ...node, name: node.type, data: { ...node.data, emailSubject: e.target.value } }
										onUpdate(node)
									}}
								/>
								{node?.data?.tplUuid && (
									<>
										<img
											src={imageUrl}
											alt=""
											style={{ display: 'none' }}
											onLoad={() => {
												node = { ...node, data: { ...node.data, tplImageLoading: false } }
												onUpdate(node)
											}}
										/>
										{node?.data?.tplImageLoading && (
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
															<circle fill="none" stroke-width="10" stroke="#fff2df" r="30" cy="50" cx="50"></circle>
															<circle fill="none" stroke-linecap="round" stroke-width="8" stroke="#ff635e" r="30" cy="50" cx="50">
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
										{!node?.data?.tplImageLoading && (
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
																	window.open(`/templates/edit/${node?.data?.tplUuid}`)
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
					{!node.output || !node.output[0] || !node.output[0].id ? (
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
						<Icon name="Close" className="close" onClick={handleRemove} />
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<h4 className="node-type">{node?.name ? actionOptions.find((option) => option.value === node.name).label : ''}</h4>
							{('copy-to-group' == node?.name || 'move-to-group' == node?.name) && (
								<Dropdown
									style={{ minWidth: '270px' }}
									onOptionSelect={(v, l) => {
										node = { ...node, data: { group: [v] }, meta: { label: v.label } }
										onUpdate(node)
									}}
									options={data.groups}
								>
									{node.meta && node.meta.label ? node.meta.label : 'Choose destination group'}
								</Dropdown>
							)}
							{'remove-from-group' == node?.name && (
								<Dropdown
									style={{ minWidth: '270px' }}
									onOptionSelect={(v, l) => {
										node = { ...node, data: { group: [v] }, meta: { label: v.label } }
										onUpdate(node)
									}}
									options={data.groups}
								>
									{node.meta && node.meta.label ? node.meta.label : 'Choose group to remove'}
								</Dropdown>
							)}
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!node.output || !node.output[0] || !node.output[0].id ? (
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
						<Icon name="Close" className="close" onClick={handleRemove} />
						<Card className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
							<div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '180px' }}>
								<Icon name="Clock" style={{ marginRight: '20px' }} />
								<h4 className="node-type">Add a delay</h4>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<InputText
									type="number"
									style={{ marginTop: '10px', width: '140px', marginRight: '10px' }}
									label="Delay"
									value={node?.data?.delay[0] ?? ''}
									onChange={(e) => {
										onUpdate({ ...node, data: { ...node.data, delay: [e.target.value] } })
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
									onOptionSelect={(v, l) => {
										node = { ...node, name: node.type, data: { ...node.data, delayValue: [v], meta: { label: v.label } } }
										onUpdate(node)
									}}
								>
									{' '}
									{node?.meta?.label ?? 'Select delay type'}
								</Dropdown>
							</div>
						</Card>
					</div>
					<div className="d-flex flex-column align-items-center">
						<div className="automation-node-vertical-line"></div>
					</div>
					{!node.output || !node.output[0] || !node.output[0].id ? (
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
			let howManyConditions = 0
			howManyConditions += children && children[0] ? countConditions(children[0], 0) : 0
			const isFirstCondition = nodes.filter((n) => n.type == 'condition')[0].id == node.id
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
							<Icon name="Close" className="close" onClick={handleRemove} />
							<div className="automation-node-content" style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
								<h4 className="node-type">Condition: {node?.name ? conditionOptions.find((option) => option.value === node.name)?.label : 'Select a condition'}</h4>
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<Dropdown
										options={conditionOptions}
										style={{ width: '350px' }}
										onOptionSelect={(v, l) => {
											node = { ...node, name: v.value, data: { ...(node.data || {}) }, meta: { label: v.label } }
											onUpdate(node)
										}}
									>
										{' '}
										{node?.meta?.label ?? 'Select a condition'}{' '}
									</Dropdown>
									{node.name && node.name == 'cmp-activity' && (
										<>
											<Dropdown
												options={data.avlCampaigns}
												style={{ width: '350px' }}
												onOptionSelect={(v, l) => {
													node = { ...node, data: { ...node.data, cmp: v }, meta: {} }
													onUpdate(node)
												}}
											>
												{' '}
												Select a campaign{' '}
											</Dropdown>

											{node.data?.cmp && (
												<>
													<Dropdown
														options={workflowConditionOptions}
														style={{ width: '350px' }}
														onOptionSelect={(v) => {
															node = { ...node, data: { ...node.data, trigger: v } }
															onUpdate(node)
														}}
													>
														{' '}
														Select a trigger{' '}
													</Dropdown>
													{node.data?.trigger && ['cmp_link_clicked', 'cmp_link_not_clicked'].includes(node.data?.trigger) && (
														<>
															<Dropdown
																options={data.cmpLinks}
																style={{ width: '350px', maxWidth: '350px' }}
																onOptionSelect={(v) => {
																	node = { ...node, data: { ...node.data, link: v} }
																	onUpdate(node)
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
									{node.name && node.name == 'workflow-activity' && (
										<>
											<Dropdown
												options={data.workflowCampaigns}
												style={{ width: '350px' }}
												onOptionSelect={(v) => {
													node = { ...node, data: { ...node.data, cmp: v.value, email_node_id: v.value }, meta: { ...node.meta, cmpname: v.label } }
													onUpdate(node)
												}}
											>
												{' '}
												{node.meta?.cmpname ?? 'Select a campaign'}
											</Dropdown>

											{node.data?.cmp && (
												<>
													<Dropdown
														options={workflowConditionOptions}
														style={{ width: '350px' }}
														onOptionSelect={(v) => {
															node = { ...node, data: { ...node.data, trigger: v.value }, meta: { ...node.meta, triggerName: v.label } }
															onUpdate(node)
														}}
													>
														{' '}
														{node.meta?.triggerName ?? 'Select a trigger'}{' '}
													</Dropdown>
													{node.data?.trigger && ['cmp_link_clicked', 'cmp_link_not_clicked'].includes(node.data?.trigger) && (
														<>
															<Dropdown
																options={getTplIdLinks(node?.data?.email_node_id)}
																style={{ width: '350px', maxWidth: '350px' }}
																onOptionSelect={(v) => {
																	node = { ...node, data: { ...node.data, link: v } }
																	onUpdate(node)
																}}
															>
																{' '}
																{node.data?.link?.value ?? 'Select a link'}
															</Dropdown>
														</>
													)}
												</>
											)}
										</>
									)}
									{node.name && node.name == 'when-user-opens-campaign' && (
										<>
											<Dropdown
												options={data.avlCampaigns}
												style={{ width: '350px' }}
												onOptionSelect={(v) => {
													node = { ...node, data: { ...node.data, cmp: v } }
													onUpdate(node)
												}}
											>
												{' '}
												Select a campaign{' '}
											</Dropdown>
										</>
									)}
									{node.name && node.name == 'when-user-clicks-link' && (
										<>
											<Dropdown
												options={data.cmpLinks}
												style={{ width: '350px' }}
												onOptionSelect={(v) => {
													node = { ...node, data: { ...node.data, link: v.value } }
													onUpdate(node)
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
								{children && children[0] && children[0].length > 0 && <div className="automation-node-vertical-line"></div>}
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
							{/* END OF LEFT LEG (true) */}
							{/* START OF RIGHT LEG (true) */}
							<div className="d-flex flex-column align-items-end" style={{ alignItems: 'center', marginRight: '-40px' }}>
								<div className="automation-node-vertical-line"></div>
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

								{children && children[1] && children[1].length > 0 && <div className="automation-node-vertical-line"></div>}

								<ul style={{ listStyleType: 'none', display: 'flex', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 0, padding: 0 }}>
									{children &&
										children[1] &&
										children[1].map((child) => {
											let children1 = [0, 1].map((index) => {
												if (child && child.id) return getChildrenOfCondition(nodes, child.id, index)
											})
											// if (closestCondition(child.id) == node.id)
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
