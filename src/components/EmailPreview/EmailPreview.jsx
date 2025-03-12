import React from 'react'

const EmailPreview = (uuid) => {
	const previewUrl = `https://fairymail.cobaltfairy.com/api/fairymailer/load-campaign-body/${uuid}`

	return (
		<div style={{ width: '100%', height: '600px', border: '1px solid #ccc', overflow: 'hidden', borderRadius: '8px' }}>
			<iframe src={previewUrl} title="Email Preview" style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }} />
		</div>
	)
}

export default EmailPreview
