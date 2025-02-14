const User = {
	get: () => JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session'))),
	set: (userdata) => localStorage.setItem('cfmmuser', encodeURIComponent(JSON.stringify(userdata))),
	setAccounts: (accoutnsdata) => localStorage.setItem('cfmaccounts', encodeURIComponent(JSON.stringify(accoutnsdata))),
	getAccounts: () => JSON.parse(decodeURIComponent(localStorage.getItem('cfmaccounts'))),
	setSelectedAccount: (accoutnsdata) => localStorage.setItem('cfmselacc', encodeURIComponent(JSON.stringify(accoutnsdata))),
	getSelectedAccount: () => JSON.parse(decodeURIComponent(localStorage.getItem('cfmselacc'))),
	logout: () => {
		localStorage.setItem('cfmmuser', null)
		localStorage.setItem('cfmaccounts', null)
	},
}

export default User
