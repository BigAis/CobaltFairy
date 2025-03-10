import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from './Button'
import './Pagination.scss'

const Pagination = ({ currentPage = 1, totalResults, resultsPerPage, siblingCount = 1, onChange, className, ...props }) => {
	const totalPages = Math.ceil(totalResults / resultsPerPage)

	const [current, setCurrent] = useState(currentPage)

	const computedClassName = classNames('pagination', 'd-flex', className)

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrent(page)
			if (onChange) {
				onChange(page)
			}
		}
	}

	const paginationNumbers = useMemo(() => {
		const totalPageNumbers = siblingCount + 5

		if (totalPageNumbers >= totalPages) {
			return Array.from({ length: totalPages }, (_, i) => i + 1)
		}

		const leftSiblingIndex = Math.max(current - siblingCount, 1)
		const rightSiblingIndex = Math.min(current + siblingCount, totalPages)

		const shouldShowLeftDots = leftSiblingIndex > 2
		const shouldShowRightDots = rightSiblingIndex < totalPages - 2

		const firstPageIndex = 1
		const lastPageIndex = totalPages

		const pages = []

		if (!shouldShowLeftDots && shouldShowRightDots) {
			const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1)
			pages.push(...leftRange, '...', lastPageIndex)
		} else if (shouldShowLeftDots && !shouldShowRightDots) {
			const rightRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1)
			pages.push(firstPageIndex, '...', ...rightRange)
		} else if (shouldShowLeftDots && shouldShowRightDots) {
			const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i)
			pages.push(firstPageIndex, '...', ...middleRange, '...', lastPageIndex)
		}

		return pages
	}, [current, siblingCount, totalPages])

	return (
		<div className={computedClassName}>
			{/* Left Button */}
			<Button disabled={current === 1} onClick={() => goToPage(current - 1)} type="secondary" className={current !== 1 ? 'active' : ''}>
				<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8.15991 1.41L3.57991 6L8.15991 10.59L6.74991 12L0.749912 6L6.74991 0L8.15991 1.41Z" fill="#100F1C" />
				</svg>
			</Button>

			{/* Page Buttons */}
			{paginationNumbers.map((page, index) =>
				page === '...' ? (
					<Button key={`dots-${index}`} type="secondary" disabled={true} style={{ padding: '0', width: '35px' }}>
						...
					</Button>
				) : (
					<Button key={page} active={page === current} onClick={() => goToPage(page)} type="secondary" className={page === current ? 'selected' : ''}>
						{page}
					</Button>
				)
			)}

			{/* Right Button */}
			<Button disabled={current === totalPages} onClick={() => goToPage(current + 1)} type="secondary" className={current !== totalPages ? 'active' : ''}>
				<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M0.839966 1.41L5.41997 6L0.839966 10.59L2.24997 12L8.24997 6L2.24997 0L0.839966 1.41Z" fill="#100F1C" />
				</svg>
			</Button>
		</div>
	)
}

Pagination.propTypes = {
	currentPage: PropTypes.number,
	totalResults: PropTypes.number.isRequired,
	resultsPerPage: PropTypes.number.isRequired,
	siblingCount: PropTypes.number,
	onChange: PropTypes.func.isRequired,
	className: PropTypes.string,
}

export default Pagination
