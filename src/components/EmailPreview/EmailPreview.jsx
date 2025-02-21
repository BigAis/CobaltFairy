import React from 'react'

const EmailPreview = () => {
	const previewUrl = 'https://en.wikipedia.org/wiki/Main_Page'

	return (
		<div style={{ width: '100%', height: '600px', border: '1px solid #ccc', overflow: 'hidden', borderRadius: '8px' }}>
			<iframe src={previewUrl} title="Email Preview" style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }} />
		</div>
	)
}

export default EmailPreview
