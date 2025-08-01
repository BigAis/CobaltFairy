import { Line } from 'react-chartjs-2'
import PropTypes from 'prop-types'
import {
	Chart as ChartJS,
	LineElement,
	PointElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	Filler, // Import the Filler plugin
} from 'chart.js'

// Register all required components including Filler plugin
ChartJS.register(LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale, Filler)

const AreaChart = ({
	timeseriesData = [],
	dataset1Key = 'value1',
	dataset2Key = 'value2',
	dataset1Label = 'Dataset 1',
	dataset2Label = 'Dataset 2',
	dataset1Color = '#2FBF2F',
	dataset2Color = '#F4A622',
}) => {
	// Function to create a gradient - will be called when chart renders
	const createGradient = (ctx, area, color) => {
		// Convert hex color to RGB for gradient
		const hexToRgb = (hex) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
			return result
				? {
						r: parseInt(result[1], 16),
						g: parseInt(result[2], 16),
						b: parseInt(result[3], 16),
				  }
				: null
		}

		const rgb = hexToRgb(color)
		if (!rgb) return color

		const gradient1 = ctx.createLinearGradient(0, 0, 0, area.height)
		gradient1.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`)
		gradient1.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)

		const gradient2 = ctx.createLinearGradient(0, 0, 0, area.height)
		gradient2.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`)
		gradient2.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)

		return [gradient1, gradient2]
	}

	// Format data from timeseries
	const formatChartData = () => {
		console.log('AreaChart - Processing timeseries data:', timeseriesData)
		console.log('AreaChart - Using dataset keys:', { dataset1Key, dataset2Key })

		if (!timeseriesData || timeseriesData.length === 0) {
			console.log('AreaChart - No timeseries data available')
			return {
				labels: ['No Data'],
				dataset1: [0],
				dataset2: [0],
			}
		}

		// Process labels with proper date validation
		const labels = timeseriesData.map((item) => {
			if (!item.date) return ''

			const date = new Date(item.date)
			if (isNaN(date.getTime())) return ''

			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
		})

		// Process data with proper fallbacks
		const dataset1 = timeseriesData.map((item) => {
			const value = item[dataset1Key]
			return value !== undefined ? value : 0
		})

		const dataset2 = timeseriesData.map((item) => {
			const value = item[dataset2Key]
			return value !== undefined ? value : 0
		})

		console.log('AreaChart - Final chart data:', { labels, dataset1, dataset2 })
		return { labels, dataset1, dataset2 }
	}

	const { labels, dataset1, dataset2 } = formatChartData()

	const data = {
		labels,
		datasets: [
			{
				label: dataset1Label,
				data: dataset1,
				borderColor: dataset1Color,
				backgroundColor: function (context) {
					const chart = context.chart
					const { ctx, chartArea } = chart

					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return `${dataset1Color}33` // Add transparency
					}
					return createGradient(ctx, chartArea, dataset1Color)[0]
				},
				borderWidth: 3,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
			},
			{
				label: dataset2Label,
				data: dataset2,
				borderColor: dataset2Color,
				backgroundColor: function (context) {
					const chart = context.chart
					const { ctx, chartArea } = chart

					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return `${dataset2Color}33` // Add transparency
					}
					return createGradient(ctx, chartArea, dataset2Color)[1]
				},
				borderWidth: 3,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
			},
		],
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: true,
				mode: 'index',
				intersect: false,
				callbacks: {
					title: function (tooltipItems) {
						if (!tooltipItems || tooltipItems.length === 0) return ''

						const index = tooltipItems[0].dataIndex

						// Try to get date from series data
						if (timeseriesData && timeseriesData[index]) {
							const item = timeseriesData[index]
							if (item.date) {
								const date = new Date(item.date)
								if (!isNaN(date.getTime())) {
									return date.toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})
								}
							}
						}

						// Fallback to the label if date parsing fails
						return tooltipItems[0].label || ''
					},
					label: function (context) {
						const datasetLabel = context.dataset.label
						const value = context.parsed.y
						return `${datasetLabel}: ${value.toLocaleString()}`
					},
				},
			},
		},
		scales: {
			x: {
				display: true,
				grid: {
					display: false,
				},
				ticks: {
					autoSkip: true,
					maxTicksLimit: Math.min(labels.length, 8), // Responsive to data length
					maxRotation: 45,
					minRotation: 0,
					color: '#887D76',
					font: {
						family: 'Inter',
						size: 12,
					},
				},
			},
			y: {
				display: false,
				grid: {
					display: false,
				},
				beginAtZero: true,
				// Add proper scaling for zero values
				suggestedMax: Math.max(...dataset1, ...dataset2) * 1.1 || 5,
			},
		},
	}

	return (
		<div style={{ width: '100%', height: '300px' }}>
			<Line data={data} options={options} />
		</div>
	)
}

AreaChart.propTypes = {
	timeseriesData: PropTypes.array,
	dataset1Key: PropTypes.string,
	dataset2Key: PropTypes.string,
	dataset1Label: PropTypes.string,
	dataset2Label: PropTypes.string,
	dataset1Color: PropTypes.string,
	dataset2Color: PropTypes.string,
}

export default AreaChart
