import React, { useState } from 'react'
import './OnboardingGuide.scss'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../../context/AccountContext'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon/Icon'

const OnboardingGuide = ({ onSetupComplete, onClose }) => {
  const { user, account, createNotification } = useAccount()
  const navigate = useNavigate()
  const [steps, setSteps] = useState([
    { 
      id: 1, 
      label: 'Set up a sender', 
      completed: true, 
      description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.',
      action: 'Set up sender',
      actionLink: '/settings/sender',
      iconName: 'Group45'
    },
    { 
      id: 2, 
      label: 'Add your subscribers or migrate from Mailchimp', 
      completed: false, 
      description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.',
      action: 'Add Subscribers',
      actionLink: '/subscribers/import',
      additionalAction: {
        label: 'Migrate from Mailchimp',
        link: '/subscribers/import'
      },
      iconName: 'Group46'
    },
    { 
      id: 3, 
      label: 'Create your first campaign', 
      completed: false, 
      description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.',
      action: 'Create Campaign',
      actionLink: '/campaigns/new',
      iconName: 'Group44'
    }
  ])

  const completeStep = async (stepId) => {
    // Mark step as completed
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    )
    setSteps(updatedSteps)

    try {
      if (user && user.jwt) {
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

  const handleStepAction = (stepId, link) => {
    navigate(link)
    completeStep(stepId)
  }

  return (
    <Card className="onboarding-guide-container">
      <div className="onboarding-guide-header">
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
                  <Icon name="Check" size={16} />
                ) : (
                  step.id
                )}
              </div>
              <div className="connector-line" style={{ display: index === steps.length - 1 ? 'none' : 'block' }}></div>
            </div>
            
            <div className="step-content">
              <h3>{step.label}</h3>
              <p>{step.description}</p>
              <div className="step-actions">
                <Button 
                  onClick={() => handleStepAction(step.id, step.actionLink)}
                  disabled={step.completed}
                  type="secondary"
                >
                  {step.completed ? 'Completed' : step.action}
                </Button>
                
                {step.additionalAction && (
                  <Button 
                    onClick={() => handleStepAction(step.id, step.additionalAction.link)}
                    type="secondary"
                  >
                    {step.additionalAction.label}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="step-preview-container">
              <div className="step-icon-preview">
                <Icon name={step.iconName} size={140} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default OnboardingGuide