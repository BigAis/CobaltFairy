import { useEffect, useState } from 'react'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from './Button'
import './Pagination.scss'

const Pagination = ({ children, currentPage, totalResults, resultsPerPage, onChange, className, ...props }) => {
	const totalPages = Math.ceil(totalResults / resultsPerPage)
	const [current, setCurrent] = useState('')
	useEffect(() => {
		setCurrent(currentPage)
	}, [])
	const computedClassName = classNames('pagination', 'd-flex', className)
	const goToPage = (page) => {
		setCurrent(page)
		// onChange(page);
	}
	const getPaginationNumbers = () => {
		const pages = []
		let startPage, endPage

		if (totalPages <= 3) {
			// Less than 3 total pages so show all
			startPage = 1
			endPage = totalPages
		} else {
			// More than 3 total pages so calculate start and end pages
			if (currentPage === 1) {
				startPage = 1
				endPage = 3
			} else if (currentPage === totalPages) {
				startPage = totalPages - 2
				endPage = totalPages
			} else {
				startPage = currentPage - 1
				endPage = currentPage + 1
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i)
		}

		return pages
	}
	const paginationNumbers = getPaginationNumbers()
	const firstPage = paginationNumbers[0]
	const lastPage = paginationNumbers[paginationNumbers.length - 1]
	return (
		<>
			<div className={computedClassName}>
				<Button disabled={current === 1} onClick={() => goToPage(current - 1)} type="secondary" className={current !== 1 ? 'active' : ''}>
					<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M8.15991 1.41L3.57991 6L8.15991 10.59L6.74991 12L0.749912 6L6.74991 0L8.15991 1.41Z" fill="#100F1C" />
					</svg>
				</Button>
				{firstPage > 1 && (
					<>
						<Button onClick={() => goToPage(1)} type="secondary" active={current === 1}>
							1
						</Button>
						{firstPage > 2 && (
							<Button type="secondary" disabled={true} style={{ padding: '0', width: '35px' }}>
								...
							</Button>
						)}
					</>
				)}
				{paginationNumbers.map((page) => (
					<Button key={page} active={page === current} onClick={() => goToPage(page)} type="secondary">
						{page}
					</Button>
				))}
				{lastPage < totalPages && (
					<>
						{lastPage < totalPages - 1 && (
							<Button type="secondary" disabled={true} style={{ padding: '0', width: '35px' }}>
								...
							</Button>
						)}
						<Button onClick={() => goToPage(totalPages)} type="secondary" active={current == totalPages}>
							{totalPages}
						</Button>
					</>
				)}
				<Button disabled={current === totalPages} onClick={() => goToPage(current + 1)} type="secondary" className={current !== 1 ? 'active' : ''}>
					<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M0.839966 1.41L5.41997 6L0.839966 10.59L2.24997 12L8.24997 6L2.24997 0L0.839966 1.41Z" fill="#100F1C" />
					</svg>
				</Button>
			</div>
		</>
	)
}

Pagination.propTypes = {
	children: PropTypes.node,
	onChange: PropTypes.func,
	currentPage: PropTypes.number,
	totalResults: PropTypes.number,
	resultsPerPage: PropTypes.number,
	className: PropTypes.string,
}

export default Pagination
