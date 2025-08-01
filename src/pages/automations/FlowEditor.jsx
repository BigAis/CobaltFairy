import React, { useState, useEffect, useContext, useRef } from 'react'
import Select from 'react-select' // Add this import if missing

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
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const FlowEditor = () => {
	// Get context, params, and navigation first
	const { user, account, createNotification } = useAccount()
	const { autId } = useParams()
	const location = useLocation();
	const navigate = useNavigate()
	
	// Setup refs
	const automationContainerRef = useRef(null)
	const isDragging = useRef(false)
	const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
	
	// Initialize state variables
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
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [selectedNode, setSelectedNode] = useState(null)
	
	// Get URL parameters
  	const queryParams = new URLSearchParams(location.search);
  	const isViewOnlyParam = queryParams.get('viewOnly') === 'true';
  	const [isReadOnly, setIsReadOnly] = useState(isViewOnlyParam);
	
	// Define steps for stepper
	const steps = [{ label: 'Automations' }, { label: 'Edit Automation' }, { label: 'Editor' }]
	
	// Function definitions
	const loadData = async (autId) => {
		if (!autId || !user || !user.jwt) {
			console.log('Cannot load data, missing autId or user JWT');
			return null;
		}
		
		try {
			// Add timestamp to ensure fresh data
			const timestamp = new Date().getTime();
			console.log(`Loading automation ${autId} at ${timestamp}`);
			
			let resp = await ApiService.get(
				`fairymailer/getAutomations?filters[uuid]=${autId}&populate=*&_t=${timestamp}`, 
				user.jwt
			);
			
			if (resp.data && resp.data.data && resp.data.data.length > 0) {
				const loadedNodes = resp.data.data[0].design.map(node => {
					// Handle special case for condition nodes with link data
					if(node.type === "condition" && ["cmp_link_clicked"].includes(node.data?.trigger) && node.data?.link){
						if(!node.data.link.value) node.data.link = {value:node.data.link}
					}
					return node;
				});
				
				console.log('loadedNodes', loadedNodes, resp.data);
				if (loadedNodes && loadedNodes.length > 0) {
					setNodes(transformNodes(loadedNodes));
					setHasTrigger(true);
				}
				
				// Important: Update data state and isReadOnly state
				setData(resp.data.data[0]);
				
				// Always set isReadOnly based on active state from API, overriding any local state
				const isActive = resp.data.data[0].active;
				setIsReadOnly(isActive || isViewOnlyParam);
				
				// Log the active status to confirm it's loaded correctly
				console.log('Automation active status from API:', isActive);
				console.log('isReadOnly set to:', isActive || isViewOnlyParam);
				
				return resp.data.data[0];
			} else {
				console.error('No automation data found for ID:', autId);
				if (createNotification) {
					createNotification({
						message: 'Automation not found',
						type: 'warning',
						autoClose: 3000
					});
				}
				navigate('/automations');
				return null;
			}
		} catch (error) {
			console.error("Error loading automation data:", error);
			return null;
		}
	};
	
	const transformNodes = (nodes) => {
		//transforms old fairy mail automations to new version.
		nodes = nodes.map((node) => {
			switch (node.type) {
				case 'email':
					if (!node.meta) node.meta = {}
					if (!node.meta.label && node.templateName) {
						node.meta.label = node.templateName
					}
					break
				case 'delay':
					if (!node.data) node.data = {}
					if (!node.data.meta) node.data.meta = {}
					if (!node.data.meta.label && node.data?.meta?.label) {
						node.data.meta.label = node.meta.label
					}
					if ((!node.data.delay || isNaN(node.data.delay)) && node.data.delayValue) {
						node.data.delay = [node.data.delayValue]
					}
					break
				case 'condition':
					if (!node.meta) node.meta = {}
					if (!node.meta.cmpname && node.meta.label) {
						node.meta.cmpname = node.meta.label
						node.meta.label = node.name == 'workflow-activity' ? 'Workflow Activity' : 'Campaign Activity'
					}
					if (!node.data.cmp && node.data.email_node_id) node.data.cmp = node.data.email_node_id
					if (!node.meta.triggerName && node.data.trigger) {
						switch (node.data.trigger) {
							case 'cmp_open':
								node.meta.triggerName = 'was opened'
								break
							case 'cmp_not_open':
								node.meta.triggerName = 'was not opened'
								break
							case 'cmp_link_clicked':
								node.meta.triggerName = 'had a specific link clicked'
								break
							case 'cmp_link_not_clicked':
								node.meta.triggerName = 'had a specific link not clicked'
								break
						}
					}
					break
			}
			return node
		})
		return nodes
	}
	
	const loadGroups = async () => {
		if (!user || !user.jwt || !account) return;
		
		try {
			let resp = await ApiService.get(`groups?polulate=*&filters[account]=${account.id}&pagination[pageSize]=100`, user.jwt)
			setGroups(resp.data.data.map((v) => ({ value: `${v.id}`, label: v.attributes.name })))
		} catch (error) {
			console.error("Error loading groups:", error);
		}
	}

	const loadCampaigns = async () => {
		if (!user || !user.jwt || !account) return;
		
		try {
			let resp = await ApiService.get(`campaigns?filters[account]=${account.id}&pagination[pageSize]=100&pagination[page]=1&sort[createdAt]=desc`, user.jwt)
			setAvlCampaigns(resp.data.data.map((v) => ({ value: v.id, label: v.attributes.name })))
		} catch (error) {
			console.error("Error loading campaigns:", error);
		}
	}

	const loadTemplates = async () => {
		if (!user || !user.jwt || !account) return;
		
		try {
			let resp = await ApiService.get(`templates?polulate=*&filters[account]=${account.id}`, user.jwt)
			setTemplates(resp.data.data)
		} catch (error) {
			console.error("Error loading templates:", error);
		}
	}

	const loadCmpLinks = async () => {
		if (!user || !user.jwt || !account) return;
		
		try {
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
		} catch (error) {
			console.error("Error loading campaign links:", error);
		}
	}
	
	const updateAutomationStatus = async (newStatus) => {
		if (!user || !user.jwt || !data || !data.id) {
			console.error("Cannot update automation status: missing user or data");
			return false;
		}
		
		try {
			console.log('Updating automation status in FlowEditor to:', newStatus);
			
			// First update the local state immediately for better UX
			setData(prevData => ({
				...prevData,
				active: newStatus
			}));

			// Update the read-only state immediately
			setIsReadOnly(newStatus || isViewOnlyParam);

			// Then update in the backend
			let resp = await ApiService.put(
				`automations/${data.id}`, 
				{ data: { active: newStatus } }, 
				user.jwt
			);

			if (resp.status === 200) {
				// Show notification of success
				if (createNotification) {
					createNotification({
						message: `Automation ${newStatus ? 'activated' : 'deactivated'} successfully.`,
						type: 'default',
						autoClose: 3000
					});
				}
				
				console.log('Automation status updated successfully in backend');
				
				// Reload data from server to ensure we have the latest state
				// This is crucial for maintaining consistency across views
				if (autId) {
					const refreshedData = await loadData(autId);
					console.log('Refreshed data after status update:', refreshedData);
				}
				
				return true;
			} else {
				console.error('Failed to update automation status:', resp);
				
				// Revert local state change if API call fails
				setData(prevData => ({
					...prevData,
					active: !newStatus
				}));
				
				// Make sure isReadOnly is consistent with active state
				setIsReadOnly(!newStatus || isViewOnlyParam);
				
				PopupText.fire({ 
					icon: 'error', 
					text: 'Failed to update automation status.', 
					showConfirmButton: false 
				});
				return false;
			}
		} catch (error) {
			console.error("Error updating automation status:", error);
			
			// Revert local state change if API call fails
			setData(prevData => ({
				...prevData,
				active: !newStatus
			}));
			
			// Make sure isReadOnly is consistent with active state
			setIsReadOnly(!newStatus || isViewOnlyParam);
			
			PopupText.fire({ 
				icon: 'error', 
				text: 'Error updating automation status. Please try again.', 
				showCancelButton: false 
			});
			return false;
		}
	};
	
	const exportData = async (showSuccessMessage = true) => {
		console.log("exportData called with showSuccessMessage:", showSuccessMessage);
		
		if (!user || !user.jwt) {
			console.error("Export failed: Missing user or JWT");
			PopupText.fire({ 
				icon: 'error', 
				text: 'Authentication error. Please try logging in again.', 
				showCancelButton: false 
			});
			return false;
		}
		
		if (!data || !data.id) {
			console.error("Export failed: Missing automation data", data);
			PopupText.fire({ 
				icon: 'error', 
				text: 'Could not identify the automation to save. Please try reloading the page.', 
				showCancelButton: false 
			});
			return false;
		}
		
		// Log before validation
		console.log("Starting validation check. Nodes:", nodes);
		
		const isAutomationValid = validateNodes();
		if (!isAutomationValid) {
			PopupText.fire({ 
				icon: 'error', 
				text: 'You have empty or invalid actions in your flow. Please check all nodes and remove any unwanted actions.', 
				showCancelButton: false 
			});
			return false;
		}
		
		// Prepare the data to save
		const newData = { 
			id: data.id, 
			data: { 
				design: nodes,
				active: data.active,
				name: data.name || "Unnamed Automation"
			} 
		};
		
		console.log("Saving automation with data:", newData);
		
		try {
			// Save the automation
			const resp = await ApiService.post(`fairymailer/save-automation/`, newData, user.jwt);
			console.log("Save response:", resp);
			
			if (resp?.data?.data?.id) {
				// Success case
				if (showSuccessMessage) {
					await PopupText.fire({ 
						icon: 'success', 
						text: 'Your changes are successfully saved!', 
						showCancelButton: false 
					});
				}
				return true;
			} else {
				// API returned but without expected data
				console.error("API returned unexpected response:", resp);
				PopupText.fire({ 
					icon: 'error', 
					text: 'The server returned an unexpected response. Please try again.', 
					showCancelButton: false 
				});
				return false;
			}
		} catch (error) {
			// API call failed
			console.error("Save automation API error:", error);
			PopupText.fire({ 
				icon: 'error', 
				text: 'Failed to save your changes. Please check your connection and try again.', 
				showCancelButton: false 
			});
			return false;
		}
	}
	
	// Other helper functions
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
	
	const handleGoBack = () => {
		navigate(`/automations/${autId}/edit`);
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
	
	// Define all necessary options constants
	const actionOptions = [
		{ value: 'copy-to-group', label: 'Copy to Group' },
		{ value: 'move-to-group', label: 'Move to Group' },
		{ value: 'remove-from-group', label: 'Remove from Group' },
		{ value: 'unsubscribe', label: 'Unsubscribe' },
	];
	
	// Get workflow campaigns based on email nodes
	const workflowCampaigns = nodes.filter((node) => node.type === 'email').length > 0
		? nodes
			.filter((node) => node.type === 'email')
			.map((node) => {
				if (node.data) return { 
					value: node.id, 
					label: node.data.emailSubject || node.meta?.label || `Email #${node.id}` 
				}
				return null;
			}).filter(Boolean)
		: [];
	
	// Define workflow condition options
	const workflowConditionOptions = [
		{ value: 'cmp_open', label: 'was opened' },
		{ value: 'cmp_not_open', label: 'was not opened' },
		{ value: 'cmp_link_clicked', label: 'had a specific link clicked' },
		{ value: 'cmp_link_not_clicked', label: 'had a specific link not clicked' },
	];
	
	// Handler for additional change (dropdown selection)
	const handleAdditionalChange = (selectedOptions) => {
		if (!selectedNode) return;
		
		// Check if selectedOptions is an array (isMulti) or a single object
		if (!Array.isArray(selectedOptions)) {
			selectedOptions = [selectedOptions];
		}

		let selectedValue = selectedOptions.length > 0 ? selectedOptions.map((option) => option?.value) : [];
		let selectedLabel = selectedOptions.length > 0 ? selectedOptions.map((option) => option?.label) : [];
		let triggerType;
		
		if (!selectedNode.name) selectedNode.name = selectedNode.type;
		
		switch (selectedNode.name) {
			case 'when-user-subscribes':
				triggerType = 'group';
				setHasTrigger(true);
				break;
			case 'when-user-opens-campaign':
				triggerType = 'cmp';
				setHasTrigger(true);
				break;
			case 'when-user-clicks-link':
				triggerType = 'link';
				setHasTrigger(true);
				break;
			case 'delay':
				selectedValue = selectedValue[0];
				triggerType = 'delay';
				if (['days', 'hours'].includes(selectedValue)) triggerType = 'delayValue';
				break;
			case 'copy-to-group':
			case 'move-to-group':
			case 'remove-from-group':
				triggerType = 'group';
				break;
			case 'workflow-activity':
				triggerType = 'email_node_id';
				selectedValue = selectedValue[0];
				break;
			case 'cmp-activity':
				triggerType = 'cmp';
				selectedValue = selectedValue[0];
				break;
			default:
				break;
		}
		
		let newNode = { 
			...selectedNode, 
			data: { ...(selectedNode.data || {}), [triggerType]: selectedValue }, 
			meta: { ...(selectedNode.meta || {}), label: selectedLabel && selectedLabel[0] ? selectedLabel[0] : '' } 
		};
		
		const updatedNodes = nodes.map((node) => (node.id === selectedNode.id ? newNode : node));
		setNodes(updatedNodes);
		setSelectedNode(newNode);
	};
	
	// Handler for trigger select change
	const handleTriggerSelectChange = (ev) => {
		if (!selectedNode) return;
		
		// Update the `name` and reset additional settings in `selectedNode`
		if (selectedNode.type === 'delay') {
			ev.value = 'delay';
		}

		const updatedNode = {
			...selectedNode,
			name: ev.value
		};

		if (selectedNode.type === 'email' && ev.value) {
			const template = templates.find(item => item.attributes.uuid === ev.value);
			if (template) {
				updatedNode.templateName = ev.label;
				updatedNode.data = { 
					...updatedNode.data, 
					tplId: template.id,
					tplUuid: template.attributes.uuid 
				};
			}
		}

		setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
		setSelectedNode(updatedNode);
	};
	
	// Handle workflow condition change
	const handleWorkflowCondition = (ev) => {
		if (!selectedNode || !ev) return;
		
		const updatedNode = { 
			...selectedNode, 
			data: { ...selectedNode.data, trigger: ev.value },
			meta: { ...selectedNode.meta, triggerName: ev.label }
		};
		
		setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
		setSelectedNode(updatedNode);
	};
	
	// Handle workflow email link selection
	const handleWorkflowEmailLink = (ev) => {
		if (!selectedNode || !ev) return;
		
		const updatedNode = { 
			...selectedNode, 
			data: { ...selectedNode.data, link: ev.value }
		};
		
		setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
		setSelectedNode(updatedNode);
	};
	
	// Handle campaign email link selection
	const handleCmpEmailLink = (ev) => {
		if (!selectedNode || !ev) return;
		
		const updatedNode = { 
			...selectedNode, 
			data: { ...selectedNode.data, link: ev.value }
		};
		
		setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
		setSelectedNode(updatedNode);
	};
	
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
						console.log('No o.id', o)
					}
				})
			}
		})
		console.log('before setExcludeNodes', tmp)
		setExcludeNodes(tmp)
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
	
	const removeNode = async (node) => {
		let res = await PopupText.fire({ icon: 'question', text: 'Are you sure you want to remove this node?', showCancelButton: true, focusCancel: true })
		if (res.isConfirmed) {
			getNodesToRemove(node, nodes)
		}
	}
	
	const getNodesToRemove = (nodeId, nodes) => {
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
	}
	
	const validateNode = (node) => {
		let result = true;
		console.log('Validating node:', node);
		
		// Check if node exists
		if (!node) {
			console.error('Node is undefined or null');
			return false;
		}
		
		// Check for required fields
		if (!node.type) {
			console.error('Node missing type property');
			return false;
		}
		
		// Basic safety check for data object
		if (!node.data) {
			node.data = {};
			console.warn('Node data was missing, added empty object');
		}
		
		switch (node.type) {
			case 'trigger':
				if (!node.name || !node.name.length > 0) {
					console.error('Trigger node missing name');
					result = false;
				} else {
					switch (node.name) {
						case 'when-user-subscribes':
							if (!node.data.group || !node.data.group[0] || !node.data.group.length > 0) {
								console.error('Trigger node missing group data');
								result = false;
							}
							break;
						case 'when-user-opens-campaign':
							if (!node.data.cmp || !node.data.cmp[0] || !node.data.cmp.length > 0) {
								console.error('Trigger node missing campaign data');
								result = false;
							}
							break;
						case 'when-user-clicks-link':
							if (!node.data.link || !node.data.link[0] || !node.data.link.length > 0) {
								console.error('Trigger node missing link data');
								result = false;
							}
							break;
						default:
							break;
					}
				}
				break;
			case 'action':
				if (!node.name || !node.name.length > 0) {
					console.error('Action node missing name');
					result = false;
				} else {
					switch (node.name) {
						case 'copy-to-group':
						case 'move-to-group':
						case 'remove-from-group':
							if (!node.data.group || !node.data.group[0] || !node.data.group.length > 0) {
								console.error('Action node missing group data');
								result = false;
							}
							break;
						default:
							break;
					}
				}
				break;
			case 'email':
				if (!node.name || !node.name.length > 0) {
					console.error('Email node missing name');
					result = false;
				} else {
					if (!node.data.emailSubject || !node.data.emailSubject.length > 0) {
						console.error('Email node missing subject');
						result = false;
					}
					if (!node.data.tplId || (Array.isArray(node.data.tplId) && !isNaN(node.data.tplId[0]))) {
						console.error('Email node missing or invalid template ID');
						result = false;
					}
				}
				break;
			case 'delay':
				if (!node.name || !node.name.length > 0) {
					console.error('Delay node missing name');
					result = false;
				} else {
					if (!node.data.delay || !node.data.delay.length > 0) {
						console.error('Delay node missing delay value');
						result = false;
					}
					if (!node.data.delayValue || !node.data.delayValue.length > 0) {
						console.error('Delay node missing delay type');
						result = false;
					}
				}
				break;
			case 'condition':
				if (!node.name || !node.name.length > 0) {
					console.error('Condition node missing name');
					result = false;
				} else {
					switch (node.name) {
						case 'workflow-activity':
							if (!node.data.email_node_id || !(typeof node.data.email_node_id === 'number')) {
								console.error('Workflow condition missing email node ID');
								result = false;
							}

							if (!node.data.trigger || !node.data.trigger.length > 0) {
								console.error('Workflow condition missing trigger');
								result = false;
							} else {
								if (node.data.trigger === 'cmp_link_clicked' || node.data.trigger === 'cmp_link_not_clicked') {
									if (!node.data.link || !node.data.link.value || !node.data.link.value.length > 0) {
										console.error('Workflow condition missing link value');
										result = false;
									}
								}
							}
							break;
						case 'cmp-activity':
							if (!node.data.cmp || !node.data.cmp > 0) {
								console.error('Campaign condition missing campaign ID');
								result = false;
							}

							if (!node.data.trigger || !node.data.trigger.length > 0) {
								console.error('Campaign condition missing trigger');
								result = false;
							} else {
								if (node.data.trigger === 'cmp_link_clicked' || node.data.trigger === 'cmp_link_not_clicked') {
									if (!node.data.link || !node.data.link.length > 0) {
										console.error('Campaign condition missing link value');
										result = false;
									}
								}
							}
							break;
						default:
							break;
					}
				}
				break;
			default:
				console.error('Unknown node type:', node.type);
				result = false;
				break;
		}
		console.log('Validation result for node', node.id, ':', result);
		return result;
	}

	const validateNodes = () => {
		console.log('Starting validation of all nodes');
		
		// Check if nodes array exists
		if (!nodes || nodes.length === 0) {
			console.error('No nodes to validate');
			return false;
		}
		
		let result = true;
		let validationErrors = [];
		
		// Validate each node
		nodes.forEach((node) => {
			const nodeValid = validateNode(node);
			if (!nodeValid) {
				validationErrors.push(`Node ${node.id} (${node.type}) failed validation`);
				result = false;
			}
		});
		
		if (!result) {
			console.error('Validation errors found:', validationErrors);
		}
		
		console.log('Final validation result:', result);
		return result;
	}
	
	// Function to get template links
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
	
	// useEffects
	
	// Initialize component
	useEffect(() => {
		const init = async () => {
			if (autId && user && user.jwt) loadData(autId);
			if (user && user.jwt && account) {
				loadGroups();
				loadCampaigns();
				loadTemplates();
				loadCmpLinks();
			}
		};
		
		if (account && user) init();
		
		// Add an event listener to refresh data when the page becomes visible again
		const handleVisibilityChange = async () => {
		if (document.visibilityState === 'visible' && user && account && autId) {
			console.log('🔄 Page visible again - forcing fresh data load');
			
			try {
			// Force a direct API call to get the current active state
			const timestamp = new Date().getTime();
			const resp = await ApiService.get(
				`automations/${data?.id}?_t=${timestamp}`, 
				user.jwt
			);
			
			if (resp.data && resp.data.data) {
				const serverActiveState = resp.data.data.attributes?.active;
				
				// Check if we need to update our local state
				if (data && serverActiveState !== undefined && serverActiveState !== data.active) {
				console.log('🔄 Visibility check found state mismatch:', 
					'Local:', data.active, 
					'Server:', serverActiveState
				);
				
				// Immediately update local state
				setData(prevData => ({
					...prevData,
					active: serverActiveState
				}));
				
				// Update isReadOnly state
				setIsReadOnly(serverActiveState || isViewOnlyParam);
				}
			}
			
			// Also perform a full data reload to refresh all fields
			loadData(autId);
			} catch (error) {
			console.error('Error in visibility state check:', error);
			
			// Fall back to normal data load if direct check fails
			loadData(autId);
			}
		}
		};
		
		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [user, account, autId, isViewOnlyParam]);
	// Add these two useEffect hooks in FlowEditor.jsx right after the other useEffect hooks
	// This ensures immediate state updates when data changes

	// Immediate sync for data.active changes
	useEffect(() => {
	// This effect ensures isReadOnly is immediately updated when data.active changes
	if (data) {
		console.log('⚡ data.active sync effect - value is:', data.active);
		setIsReadOnly(data.active || isViewOnlyParam);
	}
	}, [data?.active, isViewOnlyParam]);

	// Additional polling with shorter interval for faster updates
	useEffect(() => {
	// This effect adds a faster polling interval specifically for active state changes
	if (!user || !user.jwt || !account || !autId) return;
	
	const fastInterval = setInterval(async () => {
		try {
		const timestamp = new Date().getTime();
		const resp = await ApiService.get(
			`automations/${data?.id}?_t=${timestamp}`, 
			user.jwt
		);
		
		if (resp.data && resp.data.data) {
			const currentActiveState = resp.data.data.attributes?.active;
			
			if (data && currentActiveState !== undefined && currentActiveState !== data.active) {
			console.log('⚡ Fast polling detected active state change:', 
				'Current:', data.active, 
				'New:', currentActiveState
			);
			
			// Force an immediate data update without a full reload
			setData(prevData => ({
				...prevData,
				active: currentActiveState
			}));
			}
		}
		} catch (error) {
		// Silent error - don't log to avoid console spam
		}
	}, 1000); // Check every 1 second specifically for active state changes
	
	return () => clearInterval(fastInterval);
	}, [user, account, autId, data?.id]);
	// Add effect to monitor data.active changes
	useEffect(() => {
		if (data && data.active !== undefined) {
			console.log('data.active changed to:', data.active);
			// This ensures isReadOnly always reflects the current active state
			setIsReadOnly(data.active || isViewOnlyParam);
		}
	}, [data?.active, isViewOnlyParam]);
	
	// Add polling mechanism to check for changes
	useEffect(() => {
		// Add polling to check for changes from other views
		const interval = setInterval(async () => {
			if (user && user.jwt && account && autId) {
				// Get latest data without updating any state
				try {
					const timestamp = new Date().getTime();
					const resp = await ApiService.get(
						`fairymailer/getAutomations?filters[uuid]=${autId}&populate=*&_t=${timestamp}`, 
						user.jwt
					);
					
					if (resp.data && resp.data.data && resp.data.data.length > 0) {
						const freshData = resp.data.data[0];
						
						// Only update if active state has changed
						if (data && freshData.active !== data.active) {
							console.log('Detected active state change from polling:', 
								'Current:', data.active, 
								'New:', freshData.active
							);
							
							// Update the data state to match the server
							setData(freshData);
							
							// Ensure isReadOnly is updated
							setIsReadOnly(freshData.active || isViewOnlyParam);
						}
					}
				} catch (error) {
					console.error('Error in polling check:', error);
				}
			}
		}, 5000); // Check every 5 seconds
		
		return () => clearInterval(interval);
	}, [user, account, autId, data?.active]);
	
	// Add the drag-and-drop functionality
	useEffect(() => {
		const el = automationContainerRef.current
		if (!el) return

		const onMouseDown = (e) => {
			isDragging.current = true
			el.style.cursor = 'grabbing'
			el.style.userSelect = 'none'

			dragStart.current = {
				x: e.pageX,
				y: e.pageY,
				scrollLeft: el.scrollLeft,
				scrollTop: el.scrollTop,
			}
		}

		const onMouseMove = (e) => {
			if (!isDragging.current) return
			const dx = e.pageX - dragStart.current.x
			const dy = e.pageY - dragStart.current.y
			el.scrollLeft = dragStart.current.scrollLeft - dx
			el.scrollTop = dragStart.current.scrollTop - dy
		}

		const stopDragging = () => {
			isDragging.current = false
			el.style.cursor = 'grab'
			el.style.removeProperty('user-select')
		}

		el.addEventListener('mousedown', onMouseDown)
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', stopDragging)

		// Clean up
		return () => {
			el.removeEventListener('mousedown', onMouseDown)
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', stopDragging)
		}
	}, [])

	// Add this useEffect for mobile detection
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Update isReadOnly when data changes (to check active status)
	useEffect(() => {
		if (data?.active) {
			setIsReadOnly(true);
		} else if (!isViewOnlyParam) {
			setIsReadOnly(false);
		}
	}, [data, isViewOnlyParam]);

	// Add this useEffect to redirect mobile users away from the editor
	useEffect(() => {
		if (isMobile) {
			PopupText.fire({
				icon: 'warning',
				text: 'The automation flow editor is not available on mobile devices. Please use a desktop computer to edit your automation flow.',
				showCancelButton: false,
				confirmButtonText: 'OK',
			}).then(() => {
				navigate(`/automations/${autId}`);
			});
		}
	}, [isMobile, autId, navigate]);
	
	useEffect(() => {
		refreshNodes()
	}, [nodes])
	
	useEffect(() => {
		const container = automationContainerRef.current
		if (container) {
			// const centerPosition = (container.clientWidth/2) +300
			// container.scrollLeft = centerPosition
			const contentWidth = container.scrollWidth
			const containerWidth = container.clientWidth
			const sidebarWidth = 200

			const centerPosition = (contentWidth - containerWidth) / 2 + sidebarWidth
			container.scrollLeft = centerPosition
		}
	}, [])

	// Render the component
	return (
		<div className="flow-editor-container">
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
			<div className="header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
				<Stepper
				steps={steps}
				current={2}
				setStep={handleGoBack}
				style={{width:'70%'}}
				hasBack={true}
				/>
				<div className="buttons" style={{width:'40%'}}>
				{!isReadOnly ? (
					<>
					<Button type="secondary" icon="Save" onClick={exportData}>
						Save
					</Button>
					<Switch
						style={{ margin: '0 10px' }}
						label={data && data.active ? 'Automation is running' : 'Automation is stopped'}
						checked={data?.active || false}
						onChange={(value) => {
							console.log('Switch toggled to:', value);
							updateAutomationStatus(value);
						}}
					/>
					<Button
						onClick={async () => {
							console.log("Done Editing button clicked");
							try {
								// First save the automation
								const saveResult = await exportData(false);
								console.log("Save result:", saveResult);
								
								if (saveResult) {
									// Only navigate if save was successful
									console.log("Save successful, navigating to:", `/automations/${autId}/edit`);
									navigate(`/automations/${autId}/edit`);
								} else {
									console.log("Save failed, not navigating");
									// Show error if save failed but didn't already show a message
									PopupText.fire({ 
										icon: 'warning', 
										text: 'Changes could not be saved. Please try again.', 
										showCancelButton: false 
									});
								}
							} catch (error) {
								console.error("Error during Done Editing:", error);
								PopupText.fire({ 
									icon: 'error', 
									text: 'An unexpected error occurred. Please try again.', 
									showCancelButton: false 
								});
							}
						}}
					>
						Done Editing
					</Button>
					</>
				) : (
					<>
					<div style={{ 
						color: '#ff635d', 
						fontWeight: 'bold', 
						marginRight: '20px',
						fontFamily: 'Inter, sans-serif'
					}}>
						This automation is currently active and cannot be edited
					</div>
					<Switch
						style={{ margin: '0 10px' }}
						label={data && data.active ? 'Automation is running' : 'Automation is stopped'}
						checked={data?.active || false}
						// Make sure we don't disable the switch even in read-only mode
						disabled={false}
						onChange={(value) => {
							console.log('Switch toggled to:', value);
							updateAutomationStatus(value);
						}}
					/>
					<Button
						onClick={handleGoBack}
					>
						Back to Edit
					</Button>
					</>
				)}
				</div>
			</div>
			<div className="body">
				<div id="automation-builder" ref={automationContainerRef}>
					<ul style={{ listStyleType: 'none', color: 'black', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: '4500px', paddingBottom: '200px' }}>
					{nodes.map((node, idx) => {
					let children
					if (node.type == 'condition') {
						children = [getChildrenOfCondition(nodes, node.id, 0), getChildrenOfCondition(nodes, node.id, 1)]
					} else {
						children = []
					}
					if (excludeNodes.map(Number).includes(node.id)) return ''
					console.log('node.id', node.id, excludeNodes, excludeNodes.includes(node.id))
					return (
						<>
						{console.log('Renders', node.id)}
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
							isReadOnly={isReadOnly}
							onUpdate={(data) => {
							setNodes(
								nodes.map((n) => {
								if (n.id == data.id) return data
								return n
								})
							)
							}}
						/>
						</>
					)
					})}
					</ul>
				</div>
				{!isReadOnly && (
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
								</div>
							)}
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
				)}
			</div>
		</div>
	);
}

export default FlowEditor