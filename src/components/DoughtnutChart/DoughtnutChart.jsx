import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const DoughnutChart = ({ stats }) => {
	// Extracting labels and data from stats.metadata.deviceType
	const deviceTypeData = stats?.metadata?.deviceType || {}
	const labels = Object.keys(deviceTypeData)
	const dataValues = Object.values(deviceTypeData)

	// Define colors for each label dynamically
	const colors = ['#2D2A6E', '#2FA9E0', '#78E0C5', '#F4A261', '#E76F51', '#264653', '#6A0572']
	const backgroundColors = labels.map((_, index) => colors[index % colors.length])

	const data = {
		labels: labels,
		datasets: [
			{
				data: dataValues,
				backgroundColor: backgroundColors,
				hoverBackgroundColor: backgroundColors.map((color) => color + 'CC'), // Slightly darker on hover
				borderWidth: 10,
				borderColor: '#FFF9F0',
				cutout: '70%', // Creates the doughnut effect
				borderRadius: 10,
			},
		],
	}

	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: false, // Hide default legend to create a custom layout
			},
		},
	}

	return (
		<div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
			{/* Donut Chart takes 60% width */}
			<div style={{ flex: '60%', display: 'flex', justifyContent: 'center' }}>
				<Doughnut data={data} options={options} />
			</div>

			{/* Custom Legend takes 40% width */}
			<div style={{ flex: '40%', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px' }}>
				{labels.map((label, index) => (
					<div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						{/* Custom legend box with rounded corners */}
						<div
							style={{
								width: '15px',
								height: '15px',
								backgroundColor: backgroundColors[index],
								borderRadius: '5px',
							}}
						/>
						<span style={{ fontSize: '14px', color: '#333' }}>{label}</span>
					</div>
				))}
			</div>
		</div>
	)
}

export default DoughnutChart
