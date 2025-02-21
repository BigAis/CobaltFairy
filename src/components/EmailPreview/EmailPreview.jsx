import React from 'react'

const EmailPreview = () => {
	const previewUrl = 'https://fairymail.cobaltfairy.com/api/fairymailer/load-campaign-body/ecef95ec-1fab-4054-aa33-4f7d8df5140b'

	return (
		<div style={{ width: '400px', height: '500px', border: '1px solid #ccc', overflow: 'hidden', borderRadius: '8px' }}>
			<iframe src={previewUrl} title="Email Preview" style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }} />
		</div>
	)
}

export default EmailPreview
