import { useState } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import Card from '../../components/Card'
import Button from '../../components/Button'
import DatePicker from '../../components/DatePicker'
import Dropdown from '../../components/Dropdown'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import Checkbox from '../../components/Checkbox'
import PopupText from '../../components/PopupText/PopupText'
import { ApiService } from '../../service/api-service'
import './SubscribersCleanup.scss'

const SubscribersCleanup = ({ user, groups, onUpdate }) => {
	const [filters, setFilters] = useState({
		active: true,
		interactionType: { value: 'all', label: 'All' },
		includeHardBounces: false,
		includeSoftBounces: false,
		belongsToGroups: [],
		excludeGroups: [],
		subscribedFrom: dayjs().startOf('year').format('YYYY-MM-DD'),
		subscribedTo: dayjs().format('YYYY-MM-DD'),
	})

	const [isLoading, setIsLoading] = useState(false)
	const [matchingCount, setMatchingCount] = useState(0)
	const [hasAppliedFilters, setHasAppliedFilters] = useState(false)
	const [showFilters, setShowFilters] = useState(true)

	// Interaction options
	const interactionOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'never_opened', label: 'Never opened emails' },
		{ value: 'never_clicked', label: 'Never Click' },
		{ value: 'no_interaction', label: 'No interaction' },
	]

	// Group options from props
	const groupOptions =
		groups &&
		groups.map((group) => ({
			value: group.udid,
			label: group.name,
		}))

	// Get bounce type based on checkboxes
	const getBounceType = () => {
		if (filters.includeHardBounces && filters.includeSoftBounces) {
			return 'all'
		} else if (filters.includeHardBounces) {
			return 'hard'
		} else if (filters.includeSoftBounces) {
			return 'soft'
		}
		return ''
	}

	// Handle filter changes
	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	const handleGroupSelection = (key, selected) => {
		setFilters((prev) => ({
			...prev,
			[key]: selected,
		}))
	}

	// Map interaction type to boolean flags
	const getInteractionFlags = (interactionType) => {
		const flags = {
			neverOpened: false,
			neverClicked: false,
			noInteraction: false,
			hasBounces: false,
		}

		switch (interactionType) {
			case 'all':
				flags.neverOpened = true
				flags.neverClicked = true
				flags.noInteraction = true
				// hasBounces determined by checkbox state
				flags.hasBounces = filters.includeHardBounces || filters.includeSoftBounces
				break
			case 'never_opened':
				flags.neverOpened = true
				break
			case 'never_clicked':
				flags.neverClicked = true
				break
			case 'no_interaction':
				flags.noInteraction = true
				break
			default:
				break
		}

		return flags
	}

	// Count matching subscribers
	const countMatchingSubscribers = async () => {
		if (!user || !user.jwt) return

		setIsLoading(true)

		try {
			const interactionFlags = getInteractionFlags(filters.interactionType?.value || 'all')
			const bounceType = getBounceType()

			// Prepare filter object for API
			const filterCriteria = {
				active: filters.active,
				...interactionFlags,
				belongsToGroups: filters.belongsToGroups.map((g) => g.value),
				excludeGroups: filters.excludeGroups.map((g) => g.value),
				subscribedFrom: filters.subscribedFrom ? dayjs(filters.subscribedFrom).format('YYYY-MM-DD') : null,
				subscribedTo: filters.subscribedTo ? dayjs(filters.subscribedTo).format('YYYY-MM-DD') : null,
			}

			// Only include bounceType if hasBounces is true
			if (interactionFlags.hasBounces && bounceType) {
				filterCriteria.bounceType = bounceType
			} else if (interactionFlags.hasBounces) {
				filterCriteria.bounceType = ''
			}

			const response = await ApiService.post('fairymailer/cleanup-subs-query', { filters: filterCriteria }, user.jwt)

			if (response.data) {
				// Handle the count field
				if (typeof response.data.count === 'number') {
					setMatchingCount(response.data.count)
				}

				// Optionally log the message for debugging
				if (response.data.message) {
					console.log('API Message:', response.data.message)
				}
			}
		} catch (error) {
			console.error('Error counting matching subscribers:', error)
			PopupText.fire({
				text: 'Error counting matching subscribers. Please try again.',
				icon: 'error',
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Apply filters
	const applyFilters = async () => {
		await countMatchingSubscribers()
		setHasAppliedFilters(true)
		setShowFilters(false)
	}

	// Edit filters
	const editFilters = () => {
		setShowFilters(true)
		setHasAppliedFilters(false)
	}

	// Export subscribers
	const exportSubscribers = async () => {
		if (!user || !user.jwt || matchingCount === 0) return

		try {
			setIsLoading(true)

			const interactionFlags = getInteractionFlags(filters.interactionType?.value || 'all')
			const bounceType = getBounceType()

			// Prepare filter object for API
			const filterCriteria = {
				active: filters.active,
				...interactionFlags,
				belongsToGroups: filters.belongsToGroups.map((g) => g.value),
				excludeGroups: filters.excludeGroups.map((g) => g.value),
				subscribedFrom: filters.subscribedFrom ? dayjs(filters.subscribedFrom).format('YYYY-MM-DD') : null,
				subscribedTo: filters.subscribedTo ? dayjs(filters.subscribedTo).format('YYYY-MM-DD') : null,
			}

			// Only include bounceType if hasBounces is true
			if (interactionFlags.hasBounces && bounceType) {
				filterCriteria.bounceType = bounceType
			} else if (interactionFlags.hasBounces) {
				filterCriteria.bounceType = ''
			}

			const response = await ApiService.post('fairymailer/cleanup-subs-export', { filters: filterCriteria }, user.jwt)

			if (response.data && response.data.success && response.data.downloadUrl) {
				// Create download link using the provided URL
				const link = document.createElement('a')
				link.href = response.data.downloadUrl
				link.setAttribute('download', response.data.filename || `subscribers_cleanup_${new Date().toISOString().slice(0, 10)}.csv`)
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)

				// Show success message
				PopupText.fire({
					text: response.data.message || `Successfully exported ${response.data.count || matchingCount} subscribers.`,
					icon: 'success',
				})
			} else {
				throw new Error('Invalid response format or missing download URL')
			}
		} catch (error) {
			console.error('Error exporting subscribers:', error)
			PopupText.fire({
				text: 'Error exporting subscribers. Please try again.',
				icon: 'error',
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Delete subscribers
	const deleteSubscribers = async () => {
		if (!user || !user.jwt || matchingCount === 0) return

		// Show confirmation dialog with validation loop
		let isValidated = false
		let showError = false

		while (!isValidated) {
			const result = await PopupText.fire({
				title: 'Delete Subscribers',
				html: (
					<div>
						<p>
							Are you sure you want to delete <strong>{matchingCount} subscribers</strong>?
						</p>
						<p style={{ color: '#e74c3c', fontWeight: 'bold' }}>⚠️ This action cannot be undone!</p>
						<p>
							To confirm this action, please type <strong>DELETE</strong> below:
						</p>
					</div>
				),
				icon: 'warning',
				inputField: true,
				inputPlaceholder: 'Type DELETE to confirm',
				inputLabel: 'Confirmation Text',
				hasError: showError,
				errorMessage: showError ? 'You must type DELETE exactly to confirm this action.' : '',
				showCancelButton: true,
				confirmButtonText: 'Delete Subscribers',
				cancelButtonText: 'Cancel',
			})

			if (result.isCancelled) {
				return // User cancelled, exit completely
			}

			if (result.isConfirmed) {
				if (result.inputValue === 'DELETE') {
					isValidated = true // Correct input, proceed with deletion
				} else {
					showError = true // Show error on next iteration
				}
			}
		}

		// Proceed with deletion if validation passes
		try {
			setIsLoading(true)

			const interactionFlags = getInteractionFlags(filters.interactionType?.value || 'all')
			const bounceType = getBounceType()

			// Prepare filter object for API
			const filterCriteria = {
				active: filters.active,
				...interactionFlags,
				belongsToGroups: filters.belongsToGroups.map((g) => g.value),
				excludeGroups: filters.excludeGroups.map((g) => g.value),
				subscribedFrom: filters.subscribedFrom ? dayjs(filters.subscribedFrom).format('YYYY-MM-DD') : null,
				subscribedTo: filters.subscribedTo ? dayjs(filters.subscribedTo).format('YYYY-MM-DD') : null,
			}

			// Only include bounceType if hasBounces is true
			if (interactionFlags.hasBounces && bounceType) {
				filterCriteria.bounceType = bounceType
			} else if (interactionFlags.hasBounces) {
				filterCriteria.bounceType = ''
			}

			const response = await ApiService.post('fairymailer/cleanup-subs-delete', { filters: filterCriteria }, user.jwt)

			if (response.data && response.data.success) {
				PopupText.fire({
					text: response.data.message || `Successfully deleted ${response.data.count || matchingCount} subscribers.`,
					icon: 'success',
				})

				// Reset counts and selections
				setMatchingCount(0)
				setHasAppliedFilters(false)
				setShowFilters(true)

				// Update parent component
				if (onUpdate) onUpdate()
			} else {
				throw new Error('Delete operation failed')
			}
		} catch (error) {
			console.error('Error deleting subscribers:', error)
			PopupText.fire({
				text: 'Error deleting subscribers. Please try again.',
				icon: 'error',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="subscribers-cleanup">
			{showFilters && (
				<Card className="filter-card">
					<h3>Cleanup Filters</h3>

					<div className="filters-section">
						<div className="filter-row">
							<div className="filter-item">
								<label>Subscriber Status</label>
								<div className="checkbox-group">
									<Checkbox checked={filters.active} onChange={(checked) => handleFilterChange('active', checked)} label="Active Subscribers Only" />
								</div>
							</div>

							<div className="filter-item">
								<label>Interaction Criteria</label>
								<Dropdown options={interactionOptions} selectedValue={filters.interactionType} onOptionSelect={(option) => handleFilterChange('interactionType', option)}>
									Select Interaction Type
								</Dropdown>
							</div>
						</div>

						<div className="filter-row">
							<div className="filter-item">
								<label>Groups to Include</label>
								<MultipleDropdown
									placeholder="Select Groups to Include"
									options={groupOptions || []}
									selectedValues={filters.belongsToGroups}
									onOptionSelect={(selected) => handleGroupSelection('belongsToGroups', selected)}
								/>
							</div>

							<div className="filter-item">
								<label>Groups to Exclude</label>
								<MultipleDropdown
									placeholder="Select Groups to Exclude"
									options={groupOptions || []}
									selectedValues={filters.excludeGroups}
									onOptionSelect={(selected) => handleGroupSelection('excludeGroups', selected)}
								/>
							</div>
						</div>

						<div className="filter-row">
							<div className="filter-item">
								<label>Subscribed From</label>
								<DatePicker
									hasMinDate={false}
									hasDefaultDate={false}
									dateFormat="d/m/Y"
									timeFormat="H:i"
									pickerType="date"
									onChange={(date) => handleFilterChange('subscribedFrom', date)}
									value={filters.subscribedFrom}
								/>
							</div>

							<div className="filter-item">
								<label>Subscribed To</label>
								<DatePicker
									hasMinDate={false}
									hasDefaultDate={false}
									dateFormat="d/m/Y"
									timeFormat="H:i"
									pickerType="date"
									onChange={(date) => handleFilterChange('subscribedTo', date)}
									value={filters.subscribedTo}
								/>
							</div>
						</div>

						<div className="filter-row">
							<div className="filter-item">
								<label>Bounce Options</label>
								<div className="checkbox-group">
									<Checkbox checked={filters.includeHardBounces} onChange={(checked) => handleFilterChange('includeHardBounces', checked)} label="Include Hard Bounces" />
									<Checkbox checked={filters.includeSoftBounces} onChange={(checked) => handleFilterChange('includeSoftBounces', checked)} label="Include Soft Bounces" />
								</div>
							</div>
						</div>

						<div className="filter-actions">
							<Button onClick={applyFilters} loading={isLoading}>
								Apply Filters
							</Button>
						</div>
					</div>
				</Card>
			)}

			{hasAppliedFilters && (
				<Card className="results-card">
					<div className="results-header">
						<h3>Matching Subscribers: {matchingCount}</h3>
						<div className="action-buttons">
							<Button type="secondary" onClick={editFilters} disabled={isLoading}>
								Edit Filters
							</Button>
							<Button type="secondary" onClick={exportSubscribers} disabled={matchingCount === 0 || isLoading} loading={isLoading}>
								Export
							</Button>
							<Button type="secondary" onClick={deleteSubscribers} disabled={matchingCount === 0 || isLoading} loading={isLoading}>
								Delete
							</Button>
						</div>
					</div>

					<div className="results-description">
						<p>The filters you&apos;ve applied match {matchingCount} subscriber(s). Use the buttons above to export or delete these subscribers.</p>

						{filters.interactionType?.value === 'never_opened' && <p className="info-text">Including subscribers who have never opened any of your emails.</p>}

						{filters.interactionType?.value === 'never_clicked' && <p className="info-text">Including subscribers who have never clicked on any links in your emails.</p>}

						{filters.interactionType?.value === 'no_interaction' && <p className="info-text">Including subscribers who have neither opened nor clicked on any of your emails.</p>}

						{filters.interactionType?.value === 'all' && <p className="info-text">Including all interaction types: never opened, never clicked, and no interaction.</p>}

						{(filters.includeHardBounces || filters.includeSoftBounces) && (
							<p className="info-text">
								Additionally including bounced emails
								{filters.includeHardBounces && filters.includeSoftBounces && ' (both hard and soft bounces)'}
								{filters.includeHardBounces && !filters.includeSoftBounces && ' (hard bounces only)'}
								{!filters.includeHardBounces && filters.includeSoftBounces && ' (soft bounces only)'}.
							</p>
						)}

						{filters.belongsToGroups.length > 0 && <p className="info-text">Including only subscribers from selected groups: {filters.belongsToGroups.map((g) => g.label).join(', ')}.</p>}

						{filters.excludeGroups.length > 0 && <p className="info-text">Excluding subscribers from these groups: {filters.excludeGroups.map((g) => g.label).join(', ')}.</p>}
					</div>
				</Card>
			)}
		</div>
	)
}

SubscribersCleanup.propTypes = {
	user: PropTypes.shape({
		jwt: PropTypes.string.isRequired,
	}).isRequired,
	groups: PropTypes.arrayOf(
		PropTypes.shape({
			udid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})
	),
	onUpdate: PropTypes.func,
}

export default SubscribersCleanup
