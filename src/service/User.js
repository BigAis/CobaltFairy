const User = {
	get: () => JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session'))),
	set: (userdata) => localStorage.setItem('cfmmuser', encodeURIComponent(JSON.stringify(userdata))),
	setAccounts: (accoutnsdata) => localStorage.setItem('cfmaccounts', encodeURIComponent(JSON.stringify(accoutnsdata))),
	getAccounts: () => JSON.parse(decodeURIComponent(localStorage.getItem('cfmaccounts'))),
	setSelectedAccount: (accoutnsdata) => localStorage.setItem('cfmselacc', encodeURIComponent(JSON.stringify(accoutnsdata))),
	getSelectedAccount: () => JSON.parse(decodeURIComponent(localStorage.getItem('cfmselacc'))),
	
	// Account setup methods
	getAccountSetup: () => {
		try {
			const setupData = localStorage.getItem('fairymail_account_setup')
			return setupData ? JSON.parse(setupData) : null
		} catch (error) {
			console.error('Error parsing account setup data:', error)
			return null
		}
	},
	
	setAccountSetup: (setupData) => {
		try {
			localStorage.setItem('fairymail_account_setup', JSON.stringify(setupData))
			return true
		} catch (error) {
			console.error('Error saving account setup data:', error)
			return false
		}
	},
	
	updateSetupStep: (stepId, completed = true) => {
		try {
			const setupData = User.getAccountSetup() || {
				accountId: null,
				setupDate: new Date().toISOString(),
				completedSteps: []
			}
			
			// If the step is already in the completedSteps array, we don't need to update it
			if (completed && !setupData.completedSteps.includes(stepId)) {
				setupData.completedSteps.push(stepId)
			} else if (!completed) {
				// Remove step from completedSteps if setting to incomplete
				setupData.completedSteps = setupData.completedSteps.filter(step => step !== stepId)
			}
			
			// Update the setupDate
			setupData.setupDate = new Date().toISOString()
			
			return User.setAccountSetup(setupData)
		} catch (error) {
			console.error('Error updating setup step:', error)
			return false
		}
	},
	
	isSetupComplete: () => {
		try {
			const setupData = User.getAccountSetup()
			if (!setupData) return false
			
			// Check if all three setup steps are completed
			return setupData.completedSteps.includes(1) && 
				   setupData.completedSteps.includes(2) && 
				   setupData.completedSteps.includes(3)
		} catch (error) {
			console.error('Error checking if setup is complete:', error)
			return false
		}
	},
	
	logout: () => {
		localStorage.setItem('cfmmuser', null)
		localStorage.setItem('cfmaccounts', null)
		// Don't clear setup data on logout - it's tied to the account, not the session
	},
}

export default User