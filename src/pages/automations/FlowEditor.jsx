import React, { useState, useEffect, useContext, useRef } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import NodeItem from './NodeItem'
import { ApiService } from '../../service/api-service'
import User from '../../service/User'
import { useAccount } from '../../context/AccountContext'
import Stepper from '../../components/Stepper/Stepper'
import Button from '../../components/Button'
import Switch from '../../components/Switch'
import Dropdown from '../../components/Dropdown'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import PopupText from '../../components/PopupText/PopupText'

const FlowEditor = () => {
	const { autId } = useParams()
	const automationContainerRef = useRef(null)
	const navigate = useNavigate()
	const [tab, setTab] = useState('actions')
	const [data, setData] = useState({})
	const [groups, setGroups] = useState([])
	const [templates, setTemplates] = useState([])
	const [hasTrigger, setHasTrigger] = useState(false)
	const [avlCampaigns, setAvlCampaigns] = useState([])
	const [cmpLinks, setCmpLinks] = useState([])
	const [workflowEmails, setWorkflowEmails] = useState([])
	const [sidebarShown, setSideBarShown] = useState(true)
	const [excludeNodes, setExcludeNodes] = useState([])
	const [nodes, setNodes] = useState([])

	const { user, account } = useAccount()
	const steps = [{ label: 'Automations' }, { label: 'Edit Automation' }, { label: 'Editor' }]
	//State for Sidebar Setting
	const [selectedNode, setSelectedNode] = useState(null)

	useEffect(() => {
		const init = async () => {
			if (autId) loadData(autId)
			loadGroups()
			loadCampaigns()
			loadTemplates()
			loadCmpLinks()
		}
		if (account && user) init()
	}, [user, account])

	const loadData = async (autId) => {
		let resp = await ApiService.get(`fairymailer/getAutomations?filters[uuid]=${autId}&populate=*`, user.jwt)
		const loadedNodes = resp.data.data[0].design
		console.log('loadedNodes', loadedNodes, resp.data)
		if (loadedNodes && loadedNodes.length > 0) {
			setNodes(transformNodes(loadedNodes))
			setHasTrigger(true)
		}
		setData(resp.data.data[0])
	}

	const transformNodes = (nodes)=> { //tranforms old fairy mail automations to new version.
		nodes = nodes.map((node)=>{
			switch(node.type){
				case "email": 
					if(!node.meta) node.meta = {}; 
					if(!node.meta.label && node.templateName){
						node.meta.label = node.templateName;
					}
				break;
				case "delay": 
					if(!node.data) node.data = {}; 
					if(!node.data.meta) node.data.meta = {}; 
					if(!node.data.meta.label && node.data?.meta?.label){ node.data.meta.label = node.meta.label; }
					if((!node.data.delay || isNaN(node.data.delay)) && node.data.delayValue){ node.data.delay = [node.data.delayValue]; }
				break;
				case "condition": 
					if(!node.meta) node.meta = {};
					if(!node.meta.cmpname && node.meta.label){
						node.meta.cmpname = node.meta.label;
						node.meta.label = node.name=="workflow-activity" ? 'Workflow Activity' : 'Campaign Activity'
					}
					if(!node.data.cmp && node.data.email_node_id)node.data.cmp = node.data.email_node_id
					if(!node.meta.triggerName && node.data.trigger) {
						switch(node.data.trigger){
							case "cmp_open": node.meta.triggerName = 'was opened'; break;
							case "cmp_not_open": node.meta.triggerName = 'was not opened'; break;
							case "cmp_link_clicked": node.meta.triggerName = 'had a specific link clicked'; break;
							case "cmp_link_not_clicked": node.meta.triggerName = 'had a specific link not clicked'; break;
						}
						
						//
					}
				break;
			}
			return node;
		})
		return nodes;
	}

	const loadGroups = async () => {
		let resp = await ApiService.get(`groups?polulate=*&filters[account]=${account.id}&pagination[pageSize]=100`, user.jwt)
		setGroups(resp.data.data.map((v) => ({ value: `${v.id}`, label: v.attributes.name })))
	}

	const loadCampaigns = async () => {
		let resp = await ApiService.get(`campaigns?filters[account]=${account.id}&pagination[pageSize]=100&pagination[page]=1&sort[createdAt]=desc`, user.jwt)
		setAvlCampaigns(resp.data.data.map((v) => ({ value: v.id, label: v.attributes.name })))
	}

	const loadTemplates = async () => {
		let resp = await ApiService.get(`templates?polulate=*&filters[account]=${account.id}`, user.jwt)
		setTemplates(resp.data.data)
	}

	const loadCmpLinks = async () => {
		let campaigns = (await ApiService.get(`campaigns?filters[account]=${account.id}&pagination[pageSize]=100&pagination[page]=1&sort[createdAt]=desc`, user.jwt)).data.data
		if (campaigns) {
			let links = []
			campaigns.forEach((cmp) => {
				if (cmp.attributes && cmp.attributes && cmp.attributes.design) {
					let dsgn = cmp.attributes.design
					let cmplinks = extractLinksFromCampaignDesign(dsgn.components)
					if (cmplinks.length > 0)
						cmplinks.forEach((ll) => {
							if (!links.includes(ll)) links.push(ll)
						})
				}
			})

			const finalLinks = links
				.map((link) => {
					return {
						label: link,
						value: link,
					}
				})
				.filter((item) => item.label !== null && item.label !== undefined && item.label !== '')

			setCmpLinks(finalLinks)
		}
	}

	useEffect(() => {
		console.log('Updated groups: ', groups) //DONT ERASE THIS.
	}, [groups])

	const extractLinksFromCampaignDesign = (components = [], links = []) => {
		components.forEach((component) => {
			if (component.components && component.components.length > 0) {
				links = [...extractLinksFromCampaignDesign(component.components, links)]
			}
			if (component.type === 'link') {
				links.push(component?.attributes?.href)
			}
		})
		return links
	}

	const exportData = async (showSuccessMessage = true) => {
		const isAutomationValid = validateNodes()
		if (!isAutomationValid) {
			PopupText.fire({ icon: 'error', text: 'You have empty actions in your flow. You need to delete unwanted actions.', showCancelButton: false })
			return
		}

		let newData = { id: data.id, data: { design: nodes, active: data.active } }

		let resp
		if (data && data.id > 0) {
			resp = await ApiService.post(`fairymailer/save-automation/`, newData, user.jwt)
		} else {
			PopupText.fire({ icon: 'error', text: 'Failed to save your changes :(', showCancelButton: false })
		}
		if (resp?.data?.data?.id) {
			if (showSuccessMessage) PopupText.fire({ icon: 'success', text: 'You changes are successfully saved!', showCancelButton: false })
		} else {
			PopupText.fire({ icon: 'error', text: 'Failed to save your changes. If this problem persists, contact our support team.', showCancelButton: false })
		}
	}

	const addNode = (type, input = 0, position = 0, name = '') => {
		let maxid = 0
		nodes.map((n) => {
			if (n && n.id && n.id > maxid) maxid = n.id
		})
		const newNode = { id: maxid + 1, type, input: [{ id: input }], output: [] }
		if (name && name.length > 0) {
			newNode.name = name
		}
		let tmp = nodes
		tmp.forEach((n, i) => {
			if (n.id == input) {
				tmp[i].output[position] = { id: newNode.id }
			}
		})
		tmp.push(newNode)
		setNodes(tmp)
		refreshNodes()
		setTimeout(() => {
			setExcludeNodes([...excludeNodes])
			setSelectedNode(nodes[nodes.length - 1])
		}, 100) //refresh state, re-render
	}

	const selectNode = (node) => {
		setSelectedNode(node)
	}

	const workflowConditionOptions = [
		{ value: 'cmp_open', label: 'was opened' },
		{ value: 'cmp_not_open', label: 'was not opened' },
		{ value: 'cmp_link_clicked', label: 'had a specific link clicked' },
		{ value: 'cmp_link_not_clicked', label: 'had a specific link not clicked' },
	]

	const getTplIdLinks = (nodeId) => {
		let links = []
		const tplId = nodes.filter((node) => node.id === nodeId)[0]?.data?.tplId

		console.log('node inside getTplLinks are : ', nodeId)

		if (templates.length > 0 && tplId) {
			const tplDesign = JSON.parse(templates.filter((template) => template.id === tplId)[0]?.attributes?.design)
			const templateLinks = extractLinksFromCampaignDesign(tplDesign.components)

			console.log('templateLinks', templateLinks)

			if (templateLinks.length > 0) {
				templateLinks.forEach((ll) => {
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

	const workflowEmailLinkOptions = getTplIdLinks()

	const conditionOptions = [
		{ value: 'when-user-opens-campaign', label: 'If Subscriber has opened a campaign' },
		{ value: 'when-user-clicks-link', label: 'If Subscriber has clicked a link' },
	]

	const actionOptions = [
		{ value: 'copy-to-group', label: 'Copy to Group' },
		{ value: 'move-to-group', label: 'Move to Group' },
		{ value: 'remove-from-group', label: 'Remove from Group' },
		{ value: 'unsubscribe', label: 'Unsubscribe' },
	]

	const templateOptions = templates.map((v) => ({ value: v.attributes.uuid, label: v.attributes.name }))
	// const workflowCampaigns = workflowEmails.map(()=>({value : v.attributes.uuid, label: v.attributes.name}))
	// const workflowCampaigns = [
	// 	{ value: '123', label: 'This is a test email from workflow' },
	// 	{ value: '1234', label: 'This is a test email from workflow 2' },
	// ]

	const workflowCampaigns =
		nodes.filter((node) => node.type === 'email').length > 0
			? nodes
					.filter((node) => node.type === 'email')
					.map((node) => {
						if (node.data) return { value: node.id, label: node.data.emailSubject }
					})
			: []
	console.log('updated workflowCampaigns', workflowCampaigns)

	console.log('workflow campaigns are : ', workflowCampaigns)

	const handleTriggerSelectChange = (ev) => {
		// Update the `name` and reset additional settings in `selectedNode`

		if (selectedNode.type === 'delay') {
			ev.value = 'delay'
		}

		setSelectedNode((prevNode) => ({
			...prevNode,
			name: ev.value, // Assign selected trigger option to name
			// data: { ...prevNode.data, group: '' }, // Reset group data if the trigger changes
		}))

		if (selectedNode.type === 'email') {
			const tplId = templates.find((item) => {
				return item.attributes.uuid === ev.value
			}).id

			console.log('tplId is ', tplId)

			setSelectedNode((prevNode) => ({
				...prevNode,
				templateName: ev.label,
				data: { ...prevNode.data, tplId: tplId },
			}))
		}
	}

	const handleDelayData = (ev) => {
		if (!ev) return
		console.log('handleDelayData event', ev)
		// `selectedOptions` is an array of selected values for isMulti

		if (ev.target.name === 'delayNumber') console.log(ev.target.value)

		setSelectedNode((prevNode) => ({
			...prevNode,
			name: 'delay',
			data: { ...prevNode.data, delayValue: ev.target.value }, // Update data.group with an array of selected groups
		}))
	}

	const handleEmailSubjectData = (ev) => {
		// `selectedOptions` is an array of selected values for isMulti

		console.log(ev.target.name)

		// return

		if (ev.target.name === 'emailSubject') {
			console.log('asdas', ev.target.value)
		}

		setSelectedNode((prevNode) => ({
			...prevNode,
			// name: 'emailSubject',
			data: { ...prevNode.data, emailSubject: ev.target.value }, // Update data.group with an array of selected groups
		}))
	}

	const handleWorkflowCondition = (ev) => {
		if (!ev) return
		console.log('workflowCondtion is : ', ev.value)

		setSelectedNode((prevNode) => ({
			...prevNode,
			data: { ...prevNode.data, trigger: ev.value },
		}))
	}

	const handleWorkflowEmailLink = (ev) => {
		if (!ev) return
		console.log('workflowLink is : ', ev.value)

		setSelectedNode((prevNode) => ({
			...prevNode,
			data: { ...prevNode.data, link: ev.value },
		}))
	}

	const handleCmpEmailLink = (ev) => {
		if (!ev) return
		console.log('cmpLink is : ', ev.value)

		setSelectedNode((prevNode) => ({
			...prevNode,
			data: { ...prevNode.data, link: ev.value },
		}))
	}

	const handleAdditionalChange = (selectedOptions) => {
		// Check if selectedOptions is an array (isMulti) or a single object
		if (!Array.isArray(selectedOptions)) {
			selectedOptions = [selectedOptions]
		}

		let selectedValue = selectedOptions.length > 0 ? selectedOptions.map((option) => option?.value) : []
		let selectedLabel = selectedOptions.length > 0 ? selectedOptions.map((option) => option?.label) : []
		let triggerType
		if (!selectedNode.name) selectedNode.name = selectedNode.type
		switch (selectedNode.name) {
			case 'when-user-subscribes':
				triggerType = 'group'
				setHasTrigger(true)
				break
			case 'when-user-opens-campaign':
				triggerType = 'cmp'
				setHasTrigger(true)
				break
			case 'when-user-clicks-link':
				triggerType = 'link'
				setHasTrigger(true)
				break
			case 'delay':
				selectedValue = selectedValue[0]
				triggerType = 'delay'
				if (['days', 'hours'].includes(selectedValue)) triggerType = 'delayValue'
				break
			case 'copy-to-group':
				triggerType = 'group'
				break
			case 'move-to-group':
				triggerType = 'group'
				break
			case 'remove-to-group':
				triggerType = 'group'
				break
			case 'workflow-activity':
				console.log('selectedValue inside workflow activity is : ', selectedValue)
				triggerType = 'email_node_id'
				selectedValue = selectedValue[0]
				break
			case 'cmp-activity':
				console.log('selectedValue inside workflow activity is : ', selectedValue)
				triggerType = 'cmp'
				selectedValue = selectedValue[0]
				break
			default:
				break
		}
		console.log(triggerType, selectedValue)
		let newNode = { ...selectedNode, data: { [triggerType]: selectedValue }, meta: { label: selectedLabel && selectedLabel[0] ? selectedLabel[0] : '' } }
		console.log('new Node', newNode)
		const updatedNodes = nodes.map((node) => (node.id === selectedNode.id ? { ...newNode } : node))
		console.log('updatedNodes ', updatedNodes)
		setNodes(updatedNodes)
		setSelectedNode(null)
	}
	const handleApply = async () => {
		if (selectedNode) {
			if (selectedNode.type === 'email') {
				const getResponse = await ApiService.post(
					'fairymailer/get-automation-campaigns',
					{
						automation_udid: autId,
					},
					User.get().jwt
				)
				console.log('get workflow cmp[s ', getResponse)
			}
			const updatedNodes = nodes.map((node) => (node.id === selectedNode.id ? { ...selectedNode } : node))
			setNodes(updatedNodes)
			setSelectedNode(null)
			console.log('Updated nodes:', updatedNodes)
		}
		setSelectedNode(null)
	}

	const removeNode = async (node) => {
		let res = await PopupText.fire({ icon: 'question', text: 'Are you sure you want to remove this node?', showCancelButton: true, focusCancel: true })
		if (res.isConfirmed) {
			getNodesToRemove(node, nodes)
		}
	}
	const recursRemove = (nodeId, initNodes) => {
		console.log('node id is ', nodeId)

		initNodes = initNodes.filter((n) => n.id != nodeId)
		console.log('initNodes are inside remove', initNodes)
		setNodes(initNodes)

		initNodes = initNodes.filter((n) => !n.input || n.input.length < 1 || (n.input && n.input[0] && n.input[0].id != nodeId))
		console.log('initNodes are inside remove', initNodes)

		for (let i = 0; i < initNodes.length; i++) {
			if (initNodes[i] && initNodes[i].output && initNodes[i].output.length > 0) {
				// initNodes[i].output = initNodes[i].output.filter((o) => o.id != nodeId)
				if (initNodes[i].output[0] && initNodes[i].output[0].id && initNodes[i].output[0].id == nodeId) initNodes[i].output[0] = {}
				if (initNodes[i].output[1] && initNodes[i].output[1].id && initNodes[i].output[1].id == nodeId) initNodes[i].output[0] = initNodes[i].output = [initNodes[i].output[0]]
			}
		}

		console.log('initNodes are 2: ', initNodes)

		setNodes(initNodes)
		refreshNodes()
	}

	function recursRemoveCK(nodeIdToRemove, nodes) {
		// console.log('node to remove : ', nodeIdToRemove)
		// console.log('nodes ', nodes)

		let nodeToRemove = nodes.find((node) => node.id === nodeIdToRemove)

		let finalNodes = nodes
		if (nodeToRemove.type !== 'condition') {
			let nodeHasOutput = false
			let output = -1

			do {
				if (Array.isArray(nodeToRemove.output) && nodeToRemove.output.length !== 0) {
					output = nodeToRemove.output[0].id
					finalNodes = finalNodes.filter((node) => node.id !== nodeToRemove.id)
					nodeToRemove = finalNodes.find((node) => node.id === output)
					nodeHasOutput = true
				} else {
					finalNodes = finalNodes.filter((node) => node.id !== nodeToRemove.id)
					nodeHasOutput = false
				}
				console.log('finalNodes : ', finalNodes)
				console.log('output : ', output)
				console.log('nodeToRemove : ', nodeToRemove)
			} while (nodeHasOutput)
		} else {
			console.log('nodeToRemove', nodeToRemove)
			let nodesToBeRemoved = [nodeIdToRemove]

			for (let i = 0; i < 2; i++) {
				console.log('i is ', i)
				let tempNodeToBeRemoved = nodeToRemove

				while (tempNodeToBeRemoved.output.length !== 0) {
					let output = tempNodeToBeRemoved.output.id
					nodesToBeRemoved.push(output)
					console.log('output is ', output)
					tempNodeToBeRemoved = nodes.find((node) => node.id === output)
					console.log('asda2', tempNodeToBeRemoved)
					console.log('nodeToRemove.output.length !== 0', tempNodeToBeRemoved.output.length !== 0)
				}
			}

			console.log('nodesToBeRemoved : ', nodesToBeRemoved)
		}

		setNodes(finalNodes)
		refreshNodes()
	}

	function getNodesToRemove(nodeId, nodes) {
		const nodesToBeRemoved = []
		function traverse(nodeId) {
			const node = nodes.find((n) => n.id === nodeId)
			if (node) {
				nodesToBeRemoved.push(node.id)
				for (let output of node.output) {
					if (output && output.id) traverse(output.id)
				}
			}
		}
		traverse(nodeId)

		console.log(nodesToBeRemoved)
		console.log(
			'final nodes are : ',
			nodes.filter((node) => {
				return !nodesToBeRemoved.includes(node.id)
			})
		)

		const finalNodes = nodes.filter((node) => {
			return !nodesToBeRemoved.includes(node.id)
		})
		for (let i = 0; i < finalNodes.length; i++) {
			if (finalNodes[i] && finalNodes[i].output && finalNodes[i].output.length > 0) {
				finalNodes[i].output = finalNodes[i].output.map((ni) => {
					return ni && ni.id && !nodesToBeRemoved.includes(ni.id) ? ni : {}
				})
				if (!finalNodes[i].output[1] && (!finalNodes[i].output[0] || !finalNodes[i].output[0].id)) finalNodes[i].output = []
			}
		}
		setNodes(finalNodes)
		setSelectedNode(null)
		refreshNodes()
		// return nodesToBeRemoved
	}

	function recursivelyRemoe(nodeIdToRemove, nodes) {
		const nodesToRemove = new Set()

		function addNodeAndDescendants(nodeId) {
			nodesToRemove.add(nodeId)
			const node = nodes.find((n) => n.id === nodeId)

			if (node && node.output && node.output.length > 0) {
				node.output.forEach((outputNode) => {
					addNodeAndDescendants(outputNode.id)
				})
			}
		}

		addNodeAndDescendants(nodeIdToRemove)
		const initNodes = nodes.filter((node) => !nodesToRemove.has(node.id))
		setNodes(initNodes)
		refreshNodes()
	}

	const getChildrenOfCondition = (nodes, nodeId, conditionIndex) => {
		const node = nodes.find((n) => n && n.id && n.id == nodeId)
		if (!node || !node.output) {
			return []
		}
		let nextNodeId
		if (node.type == 'condition') {
			nextNodeId = node.output[conditionIndex] ? node.output[conditionIndex].id : false
		} else {
			nextNodeId = node.output[conditionIndex] ? node.output[conditionIndex].id : node.output[conditionIndex - 1] ? node.output[conditionIndex - 1].id : false
		}
		if (!nextNodeId) {
			return []
		}
		let children = getChildrenOfCondition(nodes, nextNodeId, conditionIndex)
		let nextNode = nodes.filter((n) => n && n.id && n.id == nextNodeId)
		let nextChildren = []
		if (nextNode[0] && nextNode[0].output && nextNode[0].output.length > 0) {
			if (nextNode[0].output[0]) nextChildren = [...nextChildren, ...getChildrenOfCondition(nodes, nextNode[0].output[0].id, conditionIndex)]
			if (nextNode[0].output[1]) nextChildren = [...nextChildren, ...getChildrenOfCondition(nodes, nextNode[0].output[1].id, conditionIndex)]
		}
		let childrenof = [nextNode[0], ...children]
		let keymap = {}
		nodes.forEach((c) => {
			if (c && c.id) keymap[c.id] = c
		})
		for (let c = 0; c < childrenof.length; c++) {
			if (childrenof[c] && childrenof[c].input && childrenof[c].input[0] && childrenof[c].input[0].id) {
				childrenof[c].input[0] = keymap[childrenof[c].input[0].id]
			}
		}
		return childrenof
	}
	const refreshNodes = () => {
		let tmp = excludeNodes
		nodes.forEach((n) => {
			if (n.type == 'condition') {
				n.output.forEach((o) => {
					if (o && o.id) {
						if (!excludeNodes.includes(o.id)) tmp.push(o.id)
						let children0 = getChildrenOfCondition(nodes, o.id, 0).map((t) => t && t.id)
						let children1 = getChildrenOfCondition(nodes, o.id, 1).map((t) => t && t.id)
						children0.forEach((c) => {
							if (!excludeNodes.includes(c)) tmp.push(c)
						})
						children1.forEach((c) => {
							if (!excludeNodes.includes(c)) tmp.push(c)
						})
					} else {
						console.log('No o', o)
					}
				})
			}
		})
		setExcludeNodes(tmp)
	}

	useEffect(() => {
		console.log('Selected Node is : ', selectedNode)
		console.log('Nodes are : ', nodes)
	}, [selectedNode])

	useEffect(() => {
		refreshNodes()
	}, [nodes])
	useEffect(() => {
		const container = automationContainerRef.current
		if (container) {
			const centerPosition = container.clientWidth
			container.scrollLeft = centerPosition
		}
	}, [])

	const validateNode = (node) => {
		let result = true
		console.log('validateNode',node)
		switch (node.type) {
			case 'trigger':
				if (!node.name || !node.name.length > 0) {
					result = false
				} else {
					switch (node.name) {
						case 'when-user-subscribes':
							if (!node.data.group[0] || !node.data.group.length > 0) {
								result = false
							}
							break
						case 'when-user-opens-campaign':
							if (!node.data.cmp[0] || !node.data.cmp.length > 0) {
								result = false
							}
							break
						case 'when-user-clicks-link':
							if (!node.data.link[0] || !node.data.link.length > 0) {
								result = false
							}
							break
						default:
							break
					}
				}
				break
			case 'action':
				if (!node.name || !node.name.length > 0) {
					result = false
				} else {
					switch (node.name) {
						case 'copy-to-group':
						case 'move-to-group':
						case 'remove-from-group':
							if (!node.data.group[0] || !node.data.group.length > 0) {
								result = false
							}
							break
						default:
							break
					}
				}
				break
			case 'email':
				if (!node.name || !node.name.length > 0) {
					result = false
				} else {
					if (!node.data.emailSubject || !node.data.emailSubject.length > 0) {
						result = false
					}
					if (!node.data.tplId || !isNaN(node.data.tplId[0])) {
						result = false
					}
				}
				break
			case 'delay':
				if (!node.name || !node.name.length > 0) {
					result = false
				} else {
					if (!node.data.delay || !node.data.delay.length > 0) {
						result = false
					}
					if (!node.data.delayValue || !node.data.delayValue.length > 0) {
						result = false
					}
				}
				break
			case 'condition':
				if (!node.name || !node.name.length > 0) {
					result = false
				} else {
					switch (node.name) {
						case 'workflow-activity':
							if (!node.data.email_node_id || !(typeof node.data.email_node_id === 'number')) {
								result = false
							}

							if (!node.data.trigger || !node.data.trigger.length > 0) {
								result = false
							} else {
								if (node.data.trigger === 'cmp_link_clicked' || node.data.trigger === 'cmp_link_not_clicked') {
									if (!node.data.link || !node.data.link.length > 0) result = false
								}
							}

							// if (!node.data.cmp[0] || !node.data.cmp.length > 0) {
							// 	result = false
							// }
							break
						case 'cmp-activity':
							if (!node.data.cmp || !node.data.cmp > 0) {
								result = false
							}

							if (!node.data.trigger || !node.data.trigger.length > 0) {
								result = false
							} else {
								if (node.data.trigger === 'cmp_link_clicked' || node.data.trigger === 'cmp_link_not_clicked') {
									if (!node.data.link || !node.data.link.length > 0) result = false
								}
							}

							// if (!node.data.link[0] || !node.data.link.length > 0) {
							// 	result = false
							// }
							break
						default:
							break
					}
				}
				break
			default:
				break
		}
		console.log('Validation of', node, result)
		return result
	}

	const validateNodes = () => {
		let result = true
		nodes.forEach((node) => {
			if (!validateNode(node)) result = false
		})
		console.log('final validation result is ', result)
		return result
	}

	return (
		<div className="flow-editor-container">
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
			<div className="header">
				<Stepper
					steps={steps}
					current={3}
					setStep={() => {
						navigate(`/automations/${autId}`)
					}}
				/>
				<div className="buttons">
					<Button type="secondary" icon="Save" onClick={exportData}>
						Save
					</Button>
					<Switch
						style={{ margin: '0 10px' }}
						label={data && data.active ? 'Automation is running' : 'Automation is stopped'}
						checked={data?.active}
						onChange={(value) => {
							setData({
								...data,
								active: value,
							})
						}}
					/>
					<Button
						onClick={async () => {
							await exportData(false)
							navigate('/automations')
						}}
					>
						Done Editing
					</Button>
				</div>
			</div>
			<div className="body">
				<div id="automation-builder" ref={automationContainerRef}>
					<ul style={{ listStyleType: 'none', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: '90vw', paddingBottom: '200px' }}>
						{nodes.map((node, idx) => {
							let children
							if (node.type == 'condition') {
								children = [getChildrenOfCondition(nodes, node.id, 0), getChildrenOfCondition(nodes, node.id, 1)]
							} else {
								children = []
							}
							if (!excludeNodes.includes(node.id))
								return (
									<NodeItem
										onSelect={(_node) => selectNode(_node)}
										key={node.id}
										node={node}
										type={node.type}
										onAdd={addNode}
										removeNode={removeNode}
										nodes={nodes}
										children={children}
										getChildrenOfCondition={getChildrenOfCondition}
										handleAdditionalChange={handleAdditionalChange}
										data={{ groups, avlCampaigns, workflowCampaigns, templates, cmpLinks }}
										setSideBarShown={setSideBarShown}
										onUpdate={(data) => {
											console.log('OnUpdate Node: ', data)
											setNodes(
												nodes.map((n) => {
													if (n.id == data.id) return data
													return n
												})
											)
										}}
									/>
								)
						})}
					</ul>
				</div>
				<div className={'flow-sidebar ' + (sidebarShown && 'visible')}>
					{!hasTrigger ? (
						<>
							{!selectedNode && (
								<div>
									<h3 className="triggers-header">Triggers</h3>
									<br></br>
									<Card
										onClick={() => {
											addNode('trigger', 0, 0, 'when-user-subscribes')
											selectNode(nodes[0])
										}}
										style={{ cursor: 'pointer' }}
									>
										<h5>
											<img src="/images/automations/when_user_subscribes.png" />
											&nbsp;When subscriber joins a group
										</h5>
										<p>
											Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.
										</p>
									</Card>
									<br></br>
									<Card
										onClick={() => {
											addNode('trigger', 0, 0, 'when-user-opens-campaign')
											selectNode(nodes[0])
										}}
										style={{ cursor: 'pointer' }}
									>
										<h5>
											<img src="/images/automations/wehen_user_opens_cmp.png" />
											&nbsp;When opens a campaign
										</h5>
										<p>
											Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.
										</p>
									</Card>
									<br></br>
									<Card
										onClick={() => {
											addNode('trigger', 0, 0, 'when-user-clicks-link')
											selectNode(nodes[0])
										}}
										style={{ cursor: 'pointer' }}
									>
										<h5>
											<img src="/images/automations/when_user_clicks_link.png" />
											&nbsp;When clicks a link
										</h5>
										<p>
											Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.
										</p>
									</Card>
									<br></br>
								</div>
							)}
							{selectedNode && selectedNode.type === 'trigger' && (
								<div style={{ flexGrow: '1' }}>
									{/* Render the additional select based on the trigger option */}
									{selectedNode.name === 'when-user-subscribes' && (
										<>{/* <h4 style={{fontFamily:'Inter',fontSize:'16px', textAlign:'left', marginBottom:'10px'}}>Select a group</h4> */}</>
									)}
									{selectedNode.name === 'when-user-opens-campaign' && (
										<Select
											onChange={handleAdditionalChange}
											value={avlCampaigns.filter((cmp) => selectedNode.data?.cmp?.includes(cmp.value))}
											options={avlCampaigns}
											styles={{
												option: (provided) => ({
													...provided,
													color: 'black',
												}),
												control: (provided) => ({
													...provided,
													color: 'black',
												}),
												singleValue: (provided) => ({
													...provided,
													color: 'black',
												}),
											}}
											className="form-control form-control-lg"
											placeholder="Select a campaign" // Default placeholder for additional select
										/>
									)}

									{selectedNode.name === 'when-user-clicks-link' && (
										<Select
											onChange={handleAdditionalChange}
											value={cmpLinks.filter((cmp) => selectedNode.data?.link?.includes(cmp.value))}
											options={cmpLinks}
											isSearchable
											styles={{
												option: (provided) => ({
													...provided,
													color: 'black',
												}),
												control: (provided) => ({
													...provided,
													color: 'black',
												}),
												singleValue: (provided) => ({
													...provided,
													color: 'black',
												}),
											}}
											className="form-control form-control-lg"
											placeholder="Select a link" // Default placeholder for additional select
										/>
									)}
								</div>
							)}

							{selectedNode && selectedNode.type === 'action' && (
								<div style={{ flexGrow: '1' }}>
									<Select
										onChange={handleTriggerSelectChange}
										value={
											selectedNode.name
												? {
														value: selectedNode.name,
														label: actionOptions.find((option) => {
															return option.value === selectedNode.name
														}).label,
												  }
												: null // Handle the case where `name` is null or undefined
										}
										options={actionOptions}
										styles={{
											option: (provided) => ({
												...provided,
												color: 'black',
											}),
											control: (provided) => ({
												...provided,
												color: 'black',
											}),
											singleValue: (provided) => ({
												...provided,
												color: 'black',
											}),
										}}
										className="form-control form-control-lg"
										placeholder="Select an action" // Default placeholder when no name is present
									/>

									{(selectedNode.name === 'move-to-group' || selectedNode.name === 'copy-to-group' || selectedNode.name === 'remove-from-group') && (
										<Select
											onChange={handleAdditionalChange}
											value={groups.filter((group) => selectedNode.data?.group?.includes(group.value))}
											options={groups}
											styles={{
												option: (provided) => ({
													...provided,
													color: 'black',
												}),
												control: (provided) => ({
													...provided,
													color: 'black',
												}),
												singleValue: (provided) => ({
													...provided,
													color: 'black',
												}),
											}}
											className="form-control form-control-lg"
											placeholder="Select a group" // Default placeholder for additional select
										/>
									)}

									{/* Apply button to save the settings */}
									{/* <div className="form-control form-control-lg ">
										<button className="btn btn-primary mt-3" onClick={handleApply}>
											Save Changes
										</button>
									</div> */}
								</div>
							)}

							{selectedNode && selectedNode.type === 'condition' && (
								<div style={{ flexGrow: '1' }}>
									{selectedNode.name === 'workflow-activity' && (
										<>
											<Select
												options={workflowCampaigns}
												value={workflowCampaigns.filter((cmp) => selectedNode.data?.email_node_id === cmp.value)}
												onChange={handleAdditionalChange}
												styles={{
													option: (provided) => ({
														...provided,
														color: 'black',
													}),
													control: (provided) => ({
														...provided,
														color: 'black',
													}),
													singleValue: (provided) => ({
														...provided,
														color: 'black',
													}),
												}}
												className="form-control form-control-lg"
												placeholder="Select Workflow Email"
											/>

											{selectedNode.name === 'workflow-activity' && selectedNode?.data?.email_node_id && (
												<>
													<Select
														options={workflowConditionOptions}
														value={workflowConditionOptions.filter((option) => selectedNode.data?.trigger === option.value)}
														onChange={handleWorkflowCondition}
														styles={{
															option: (provided) => ({
																...provided,
																color: 'black',
															}),
															control: (provided) => ({
																...provided,
																color: 'black',
															}),
															singleValue: (provided) => ({
																...provided,
																color: 'black',
															}),
														}}
														className="form-control form-control-lg"
														placeholder="Select a trigger"
													/>
												</>
											)}

											{selectedNode.name === 'workflow-activity' &&
												selectedNode?.data?.email_node_id &&
												(selectedNode?.data?.trigger === 'cmp_link_clicked' || selectedNode?.data?.trigger === 'cmp_link_not_clicked') && (
													<>
														<Select
															options={getTplIdLinks(selectedNode?.data?.email_node_id)}
															// value={workflowConditionOptions.filter((option) => electedNode.data?.trigger === option.value)}
															value={getTplIdLinks(selectedNode?.data?.email_node_id).filter((option) => selectedNode.data?.link === option.value)}
															onChange={handleWorkflowEmailLink}
															styles={{
																option: (provided) => ({
																	...provided,
																	color: 'black',
																}),
																control: (provided) => ({
																	...provided,
																	color: 'black',
																}),
																singleValue: (provided) => ({
																	...provided,
																	color: 'black',
																}),
															}}
															className="form-control form-control-lg"
															placeholder="Select a link"
														/>
													</>
												)}
										</>
									)}
									{selectedNode.name === 'cmp-activity' && (
										<>
											<Select
												onChange={handleAdditionalChange}
												value={avlCampaigns.filter((cmp) => selectedNode.data?.cmp === cmp.value)}
												options={avlCampaigns}
												styles={{
													option: (provided) => ({
														...provided,
														color: 'black',
													}),
													control: (provided) => ({
														...provided,
														color: 'black',
													}),
													singleValue: (provided) => ({
														...provided,
														color: 'black',
													}),
												}}
												className="form-control form-control-lg"
												placeholder="Select a campaign" // Default placeholder for additional select
											/>

											{selectedNode.name === 'cmp-activity' && selectedNode?.data?.cmp && (
												<>
													<Select
														options={workflowConditionOptions}
														value={workflowConditionOptions.filter((option) => selectedNode.data?.trigger === option.value)}
														onChange={handleWorkflowCondition}
														styles={{
															option: (provided) => ({
																...provided,
																color: 'black',
															}),
															control: (provided) => ({
																...provided,
																color: 'black',
															}),
															singleValue: (provided) => ({
																...provided,
																color: 'black',
															}),
														}}
														className="form-control form-control-lg"
														placeholder="Select a trigger"
													/>
												</>
											)}

											{selectedNode.name === 'cmp-activity' &&
												selectedNode?.data?.cmp &&
												(selectedNode?.data?.trigger === 'cmp_link_clicked' || selectedNode?.data?.trigger === 'cmp_link_not_clicked') && (
													<>
														<Select
															onChange={handleCmpEmailLink}
															value={cmpLinks.filter((cmp) => selectedNode.data?.link?.includes(cmp.value))}
															options={cmpLinks}
															styles={{
																option: (provided) => ({
																	...provided,
																	color: 'black',
																}),
																control: (provided) => ({
																	...provided,
																	color: 'black',
																}),
																singleValue: (provided) => ({
																	...provided,
																	color: 'black',
																}),
															}}
															isSearchable
															className="form-control form-control-lg"
															placeholder="Select a link" // Default placeholder for additional select
														/>
													</>
												)}
										</>
									)}

									{selectedNode.name === 'when-user-opens-campaign' && (
										<Select
											onChange={handleAdditionalChange}
											value={avlCampaigns.filter((cmp) => selectedNode.data?.cmp?.includes(cmp.value))}
											options={avlCampaigns}
											styles={{
												option: (provided) => ({
													...provided,
													color: 'black',
												}),
												control: (provided) => ({
													...provided,
													color: 'black',
												}),
												singleValue: (provided) => ({
													...provided,
													color: 'black',
												}),
											}}
											className="form-control form-control-lg"
											placeholder="Select a trigger" // Default placeholder for additional select
										/>
									)}
									{selectedNode.name === 'when-user-clicks-link' && (
										<Select
											onChange={handleAdditionalChange}
											value={cmpLinks.filter((cmp) => selectedNode.data?.link?.includes(cmp.value))}
											options={cmpLinks}
											styles={{
												option: (provided) => ({
													...provided,
													color: 'black',
												}),
												control: (provided) => ({
													...provided,
													color: 'black',
												}),
												singleValue: (provided) => ({
													...provided,
													color: 'black',
												}),
											}}
											isSearchable
											className="form-control form-control-lg"
											placeholder="Select a link" // Default placeholder for additional select
										/>
									)}
									{/* Apply button to save the settings */}
									{/* <div className="form-control form-control-lg ">
										<button className="btn btn-primary mt-3" onClick={handleApply}>
											Save Changes
										</button>
									</div> */}
								</div>
							)}

							{/*<div className="p-4 dragflow-save-action-container" style={{ flexShrink: '0' }}>
								 <div className="d-flex" style={{ gap: '10px' }}>
									{selectedNode && (
										<div
											className="flow-save-btn btn  btn-success"
											draggable={false}
											onClick={() => {
												//exportData()
												handleApply()
											}}
										>
											Save Node
										</div>
									)}
									<div
										className="flow-save-btn btn btn-success"
										draggable={false}
										onClick={() => {
											exportData()
											// handleApply()
										}}
									>
										Save Flow
									</div>
								</div>
							</div> */}
						</>
					) : (
						<>
							<div className="toolbox">
								<div className="panel-header">
									<Icon name={'Caret'} />
									<h5>Actions</h5>
								</div>
								<div className="panel">
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'delay')
										}}
									>
										{' '}
										<img draggable="false" src="/images/automations/action_delay.png" />{' '}
									</Card>
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'action-copy-group')
										}}
									>
										{' '}
										<img draggable="false" src="/images/automations/action_copy_group.png" />{' '}
									</Card>
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'action-remove-group')
										}}
									>
										{' '}
										<img draggable="false" src="/images/automations/action_remove_group.png" />{' '}
									</Card>
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'email')
										}}
									>
										{' '}
										<img draggable="false" src="/images/automations/action_template.png" />{' '}
									</Card>
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'action-move-group')
										}}
									>
										{' '}
										<img draggable="false" src="/images/automations/action_move_group.png" />{' '}
									</Card>
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'action-unsubscribe')
										}}
									>
										{' '}
										<img draggable="false" src="/images/automations/action_unsubscribe.png" />{' '}
									</Card>
								</div>
								<div className="panel-header">
									<Icon name={'Caret'} />
									<h5>Conditions</h5>
								</div>
								<div className="panel">
									<Card
										draggable="true"
										onDragStart={(e) => {
											e.dataTransfer.setData('text/plain', 'condition')
										}}
									>
										{' '}
										<img src="/images/automations/condition.png" />{' '}
									</Card>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default FlowEditor
