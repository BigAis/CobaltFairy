import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const DoughnutChart = () => {
	const data = {
		labels: ['Desktop', 'Mobile', 'Tablet'],
		datasets: [
			{
				data: [50, 30, 20], // Adjust these values as needed
				backgroundColor: ['#2D2A6E', '#2FA9E0', '#78E0C5'], // Colors similar to the image
				hoverBackgroundColor: ['#241F5E', '#1E85B2', '#60C1A8'],
				borderWidth: 10, // Remove borders for a clean look
				borderColor: '#FFF9F0',
				cutout: '70%', // Creates the doughnut effect,
				borderRadius: 10,
				innerSize: '80%',
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
				{data.labels.map((label, index) => (
					<div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						{/* Custom legend box with rounded corners */}
						<div
							style={{
								width: '15px',
								height: '15px',
								backgroundColor: data.datasets[0].backgroundColor[index],
								borderRadius: '5px', // Adjust for rounded effect
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
