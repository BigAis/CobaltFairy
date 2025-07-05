import { useMemo, useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons'
import useSection from '../../utils/useSection'
import classNames from '../../utils/classNames'
import { GlobalContext } from '../../reducers'
import { Modal, Input } from 'antd'
import PopupText from '../../../PopupText/PopupText'
import { useAccount } from '../../../../context/AccountContext'

const Link = ({ modifyText, setTextContent }) => {
	const { selectionRange, blockList, bodySettings } = useContext(GlobalContext)
	const { getSelectionNode } = useSection()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [inputConfig, setInputConfig] = useState({
		value: '',
		range: null,
	})
	const accountContext = useAccount();

	const node = useMemo(() => {
		if (selectionRange) {
			return getSelectionNode(selectionRange.commonAncestorContainer, 'a')
		} else {
			return null
		}
	}, [selectionRange, blockList])

	// We need to check this function if it works with the new editor
	// The code that I added is the following:
	const addLink = () => {
		const { range, value, rangeIsLink } = inputConfig

		// Validate input
		if (!value.trim()) {
			return
		}

		if (rangeIsLink) {
			range.commonAncestorContainer.parentNode.href = `https://link${accountContext?.account?.sending_identity?.domain?.includes('cobaltfairy.com') ? '-':'.'}${accountContext?.account?.sending_identity?.domain}/?url=${window.encodeURIComponent(value)}/${window.encodeURIComponent(accountContext?.account?.sending_identity?.domain.startsWith('http')?accountContext?.account?.sending_identity?.domain:'https://'+accountContext?.account?.sending_identity?.domain)}`
		} else {
			try {
				// Check if the range can be surrounded
				if (range.collapsed) {
					// If collapsed, we need to expand it to include the text
					const textNode = range.startContainer
					if (textNode.nodeType === Node.TEXT_NODE) {
						range.selectNodeContents(textNode.parentNode)
					}
				}

				// Try to surround contents, but handle cases where it fails
				let link = document.createElement('a')
				link.target = '_blank'
				// link.href = `https://link.${accountContext?.account?.sending_identity?.domain}/?url=${window.encodeURIComponent(value)}/${window.encodeURIComponent(accountContext?.account?.sending_identity?.domain.startsWith('http')?accountContext?.account?.sending_identity?.domain:'https://'+accountContext?.account?.sending_identity?.domain)}`
				link.href = `https://link${accountContext?.account?.sending_identity?.domain?.includes('cobaltfairy.com') ? '-':'.'}${accountContext?.account?.sending_identity?.domain}/?url=${window.encodeURIComponent(value)}/${window.encodeURIComponent(accountContext?.account?.sending_identity?.domain.startsWith('http')?accountContext?.account?.sending_identity?.domain:'https://'+accountContext?.account?.sending_identity?.domain)}`
				if (bodySettings.styles.linkColor) link.style = `color:${bodySettings.styles.linkColor}`

				// Use a more robust approach for creating links
				if (range.toString().trim()) {
					// If we have selected text, try to surround it
					try {
						range.surroundContents(link)
					} catch (surroundError) {
						// If surroundContents fails, use a different approach
						const selectedText = range.toString()
						const linkElement = document.createElement('a')
						linkElement.target = '_blank'
						linkElement.href = `https://link${accountContext?.account?.sending_identity?.domain?.includes('cobaltfairy.com') ? '-':'.'}${accountContext?.account?.sending_identity?.domain}/?url=${window.encodeURIComponent(value)}/${window.encodeURIComponent(accountContext?.account?.sending_identity?.domain.startsWith('http')?accountContext?.account?.sending_identity?.domain:'https://'+accountContext?.account?.sending_identity?.domain)}`
						if (bodySettings.styles.linkColor) linkElement.style = `color:${bodySettings.styles.linkColor}`
						linkElement.textContent = selectedText

						// Delete the selected content and insert the link
						range.deleteContents()
						range.insertNode(linkElement)
					}
				} else {
					// If no text is selected, insert the link at cursor position
					const linkElement = document.createElement('a')
					linkElement.target = '_blank'
					linkElement.href = `https://link${accountContext?.account?.sending_identity?.domain?.includes('cobaltfairy.com') ? '-':'.'}${accountContext?.account?.sending_identity?.domain}/?url=${window.encodeURIComponent(value)}/${window.encodeURIComponent(accountContext?.account?.sending_identity?.domain.startsWith('http')?accountContext?.account?.sending_identity?.domain:'https://'+accountContext?.account?.sending_identity?.domain)}`
					if (bodySettings.styles.linkColor) linkElement.style = `color:${bodySettings.styles.linkColor}`
					linkElement.textContent = value
					range.insertNode(linkElement)
				}
			} catch (error) {
				console.error('Error creating link:', error)
				// Could show user feedback here
			}
		}

		setTextContent()
		closeModal()
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setInputConfig({ value: '', range: null })
	}

	const addLinkTag = async () => {
		let selection = window.getSelection()
		let range = selection.getRangeAt(0)
		const rangeParentNode = range.commonAncestorContainer.parentNode
		const rangeIsLink = rangeParentNode.nodeName === 'A'
		const newInputConfig = { ...inputConfig, range }
		if (rangeIsLink) {
			if (rangeParentNode.href.includes('api/unsubscribe') && rangeParentNode.href.includes('pixel_uid')) {
				await PopupText.fire({ text: 'Unsubscribe links cannot be edited.', showCancelButton: false })
				return
			}
			newInputConfig.rangeIsLink = true
			let currenthref = rangeParentNode.href
			if(rangeParentNode.href.includes('link.') && rangeParentNode.href.includes('?url=')){
				currenthref = currenthref.split('?url=')[1];
				currenthref = currenthref.split('/https')[0];
				currenthref = decodeURIComponent(currenthref)
			}
			newInputConfig.value = currenthref //.replace("https://", "").replace("http://","");
		}
		setInputConfig(newInputConfig)
		setIsModalOpen(true)
		setTextContent()
	}

	return (
		<>
			<button className={classNames('rich-text-tools-button ', node && 'rich-text-tools-button-active')} title="Link" onClick={addLinkTag}>
				<FontAwesomeIcon icon={faLink} className="rich-text-tools-button-icon" />
			</button>
			<button
				className={classNames('rich-text-tools-button')}
				title="Remove link"
				onClick={async () => {
					let selection = window.getSelection()
					let range = selection.getRangeAt(0)
					let rangeParentNode
					if (selection.rangeCount > 0 && selection.isCollapsed) {
						rangeParentNode = range.startContainer
						if (rangeParentNode.nodeType === Node.TEXT_NODE) {
							rangeParentNode = rangeParentNode.parentNode
						}
						selection = window.getSelection()
						range = document.createRange()
						range.selectNodeContents(rangeParentNode)
						selection.removeAllRanges()
						selection.addRange(range)
						if (rangeParentNode.href && rangeParentNode.href.includes('api/unsubscribe') && rangeParentNode.href.includes('pixel_uid')) {
							await PopupText.fire({ text: 'Unsubscribe links cannot be removed.', showCancelButton: false })
							return
						}
						modifyText('unlink', false, null)
						modifyText('removeformat', false, null)
						setTextContent()
					} else {
						rangeParentNode = range.commonAncestorContainer.parentNode
						if (rangeParentNode.href && rangeParentNode.href.includes('api/unsubscribe') && rangeParentNode.href.includes('pixel_uid')) {
							await PopupText.fire({ text: 'Unsubscribe links cannot be removed.', showCancelButton: false })
							return
						}
						modifyText('unlink', false, null)
						modifyText('removeformat', false, null)
						setTextContent()
					}
				}}
			>
				<FontAwesomeIcon icon={faUnlink} className="rich-text-tools-button-icon" />
			</button>
			<Modal title="Link URL" open={isModalOpen} zIndex={1100} onOk={addLink} onCancel={closeModal} okText="Ok" cancelText="Cancel">
				<Input
					// addonBefore="https://"
					value={inputConfig.value} //.replace("https://", "")
					onChange={(event) => setInputConfig({ ...inputConfig, value: event.target.value })} //"https://" +
				/>
			</Modal>
		</>
	)
}

export default Link
