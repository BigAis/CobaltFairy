export const USER_ROLES = [
	{
		value: 'administrator',
		label: 'Administrator',
		description: 'Full access to all features and system settings.',
		permissions: {
			accounts: { list: true, view: true, create: true, edit: true, delete: true },
			users: { list: true, view: true, create: true, edit: true, delete: true },
			campaigns: { list: true, view: true, create: true, edit: true, delete: true },
			templates: { list: true, view: true, create: true, edit: true, delete: true },
			subscribers: { list: true, view: true, create: true, edit: true, delete: true, import: true, export: true },
			automations: { list: true, view: true, create: true, edit: true, delete: true },
			integrations: { list: true, view: true, create: true, edit: true, delete: true },
			billing: { access: true },
			stats: { access: true },
		},
	},
	{
		value: 'manager',
		label: 'Manager',
		description: 'Can manage campaigns, subscribers, and basic settings.',
		permissions: {
			accounts: { list: true, view: true, create: false, edit: true, delete: false },
			users: { list: true, view: true, create: false, edit: false, delete: false },
			campaigns: { list: true, view: true, create: true, edit: true, delete: true },
			templates: { list: true, view: true, create: true, edit: true, delete: true },
			subscribers: { list: true, view: true, create: true, edit: true, delete: true, import: true, export: false },
			automations: { list: true, view: true, create: true, edit: true, delete: true },
			integrations: { list: true, view: true, create: true, edit: true, delete: true },
			billing: { access: false },
			stats: { access: true },
		},
	},
	{
		value: 'editor',
		label: 'Editor',
		description: 'Can create and edit content, campaigns, and templates.',
		permissions: {
			accounts: { list: true, view: true, create: false, edit: true, delete: false },
			users: { list: true, view: true, create: false, edit: false, delete: false },
			campaigns: { list: true, view: true, create: true, edit: true, delete: true },
			templates: { list: true, view: true, create: true, edit: true, delete: true },
			subscribers: { list: true, view: true, create: false, edit: false, delete: false, import: false, export: false },
			automations: { list: true, view: true, create: true, edit: true, delete: true },
			integrations: { list: false, view: false, create: false, edit: false, delete: false },
			billing: { access: false },
			stats: { access: true },
		},
	},
	{
		value: 'viewer',
		label: 'Viewer',
		description: 'Read-only access to view data and reports.',
		permissions: {
			accounts: { list: false, view: false, create: false, edit: false, delete: false },
			users: { list: false, view: false, create: false, edit: false, delete: false },
			campaigns: { list: true, view: true, create: false, edit: false, delete: false },
			templates: { list: false, view: false, create: false, edit: false, delete: false },
			subscribers: { list: true, view: true, create: false, edit: false, delete: false, import: false, export: false },
			automations: { list: true, view: true, create: false, edit: false, delete: false },
			integrations: { list: false, view: false, create: false, edit: false, delete: false },
			billing: { access: false },
			stats: { access: true },
		},
	},
	{
		value: 'custom',
		label: 'Custom',
		description: 'Custom permissions defined individually.',
		permissions: null, // Custom permissions are defined individually
	},
]

export const getRoleByValue = (value) => {
	return USER_ROLES.find((role) => role.value === value)
}

export const getRoleLabel = (value) => {
	const role = getRoleByValue(value)
	return role ? role.label : value
}

export const getRolePermissions = (value) => {
	const role = getRoleByValue(value)
	return role ? role.permissions : null
}

export const hasPermission = (roleValue, resource, action) => {
	const permissions = getRolePermissions(roleValue)
	if (!permissions || !permissions[resource]) {
		return false
	}
	return permissions[resource][action] === true
}

export const canAccessResource = (roleValue, resource) => {
	const permissions = getRolePermissions(roleValue)
	if (!permissions || !permissions[resource]) {
		return false
	}

	// For resources with 'access' property (like billing, stats)
	if (permissions[resource].access !== undefined) {
		return permissions[resource].access
	}

	// For other resources, check if user can at least list or view
	return permissions[resource].list === true || permissions[resource].view === true
}
