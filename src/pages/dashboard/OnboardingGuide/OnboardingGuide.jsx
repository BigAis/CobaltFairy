import React, { useState } from 'react'
import './OnboardingGuide.scss'
import { useNavigate } from 'react-router-dom'
import { ApiService } from '../../../service/api-service'
import { useAccount } from '../../../context/AccountContext'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import Logo from '../../../components/Logo/Logo'

const OnboardingGuide = ({ onSetupComplete, onClose }) => {
  const { user, account, createNotification } = useAccount()
  const navigate = useNavigate()
  const [steps, setSteps] = useState([
    { id: 1, label: 'Set up a sender', completed: false, description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.' },
    { id: 2, label: 'Add your subscribers or migrate from Mailchimp', completed: false, description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.' },
    { id: 3, label: 'Create your first campaign', completed: false, description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.' }
  ])

  const completeStep = async (stepId) => {
    // Mark step as completed
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    )
    setSteps(updatedSteps)

    // In the future, this will send an API request to update the account setup status
    try {
      if (user && user.jwt) {
        // This is commented out as we're using state-only approach for now
        // await ApiService.post('fairymailer/update-account-setup', {
        //   step: stepId,
        //   completed: true,
        //   setupDate: new Date().toISOString()
        // }, user.jwt)
        console.log(`Step ${stepId} marked as completed (would be saved to API in production)`)
      }
    } catch (error) {
      console.error('Error updating setup status:', error)
    }

    // If all steps are completed, show completion notification
    const allCompleted = updatedSteps.every(step => step.completed)
    if (allCompleted) {
      if (createNotification) {
        createNotification({
          message: 'Setup completed! You\'re all set to start using FairyMail.',
          type: 'default',
          autoClose: 5000
        })
      }
      if (onSetupComplete) onSetupComplete()
    }
  }

  const handleStepAction = (stepId) => {
    switch (stepId) {
      case 1:
        navigate('/settings/sender')
        completeStep(1)
        break
      case 2:
        navigate('/subscribers/import')
        completeStep(2)
        break
      case 3:
        navigate('/campaigns/new')
        completeStep(3)
        break
      default:
        break
    }
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        <Logo />
        <Card className="onboarding-guide">
          <div className="guide-header">
            <h2>Get Started</h2>
            {onClose && (
              <button className="close-button" onClick={onClose}>×</button>
            )}
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={step.id} className={`step-item ${step.completed ? 'completed' : ''}`}>
                <div className="step-indicator">
                  <div className="step-number">
                    {step.completed ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="white"/>
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="connector-line" style={{ display: index === steps.length - 1 ? 'none' : 'block' }}></div>
                </div>
                
                <div className="step-content">
                  <h3>{step.label}</h3>
                  <p>{step.description}</p>
                  <Button 
                    onClick={() => handleStepAction(step.id)}
                    disabled={step.completed}
                  >
                    {step.completed ? 'Completed' : `Set up ${step.label.toLowerCase()}`}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OnboardingGuide