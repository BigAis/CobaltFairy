import './redirection.scss'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';

import Button from '../../components/Button'
import Logo from '../../components/Logo/Logo'
import Card from '../../components/Card'

const Redirection = () => {
	const { url, redirect } = useParams()

	useEffect(() => {
		console.log(url)
		console.log(redirect)
	}, [url, redirect])

	return (
		<>
			<div className="redirection-component">
				<div className="redirection-wrapper">
					<Logo />
					<Card className="card">
						<div className="container">
						<>
									<div className="header-info">
										<header>
											<p>You are being redirected to an external URL:</p>
											<pre>{window.decodeURIComponent(url)}</pre>
											<p>Do you want to continue?</p>
										</header>
									</div>
									<div className="login-options">
										<Button type="secondary" onClick={() => window.location.href = redirect && redirect.length>0 ? window.decodeURIComponent(redirect) : 'https://fairymail.app'}>No</Button>&nbsp;
										<Button onClick={() => window.location.href = window.decodeURIComponent(url)}>Yes</Button>
									</div>
								</>
						</div>
					</Card>
				</div>
			</div>
		</>


	)
}

export default Redirection