import React, { useState } from 'react'
import './OnboardingGuide.scss'
import { useNavigate } from 'react-router-dom'
import { ApiService } from '../../../service/api-service'
import { useAccount } from '../../../context/AccountContext'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon/Icon'
import InputText from '../../../components/InputText/InputText'

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
      preview: {
        type: 'input',
        placeholder: 'hi@fairymail.gr'
      }
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
      preview: {
        type: 'importBox',
        title: 'Import Subscribers',
        subtitle: 'Import 156 subscribers',
        button: 'Continue with Mailchimp'
      }
    },
    { 
      id: 3, 
      label: 'Create your first campaign', 
      completed: false, 
      description: 'Vivamus commodo nunc et metus sagittis, at malesuada erat scelerisque. Vestibulum volutpat sodales volutpat. Vestibulum posuere vulputate posuere. Morbi ultrices velit auctor, venenatis neque vel.',
      action: 'Create Campaign',
      actionLink: '/campaigns/new',
      preview: {
        type: 'emailPreview',
        sender: 'Sender',
        subject: 'Subject goes here',
        preheader: 'Your email preheader will appear here.'
      }
    }
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

  const handleStepAction = (stepId, link) => {
    navigate(link)
    completeStep(stepId)
  }

  const renderStepPreview = (preview) => {
    switch (preview.type) {
      case 'input':
        return (
          <div className="step-preview input-preview">
            <div className="input-container">
              <InputText
                value={preview.placeholder}
                onChange={() => {}}
                placeholder={preview.placeholder}
                className="sender-input"
              />
              <div className="cursor-pointer"></div>
            </div>
          </div>
        )
      case 'importBox':
        return (
          <div className="step-preview import-preview">
            <Card className="import-box">
              <div className="import-header">
                <h3>{preview.title}</h3>
              </div>
              <p>{preview.subtitle}</p>
              <Button 
                type="secondary" 
                className="mailchimp-button"
                onClick={() => {}}
              >
                <span className="mailchimp-icon">ᛙ</span> {preview.button}
              </Button>
            </Card>
          </div>
        )
      case 'emailPreview':
        return (
          <div className="step-preview email-preview">
            <div className="preview-label">
              <Icon name="Email" size={12} /> Inbox Preview
            </div>
            <Card className="email-box">
              <div className="email-header-preview"></div>
              <div className="email-content-preview">
                <div className="sender-info">
                  <div className="sender-label">Sender</div>
                  <div className="subject-line">{preview.subject}</div>
                  <div className="preheader">{preview.preheader}</div>
                </div>
                <div className="email-body-preview"></div>
              </div>
            </Card>
          </div>
        )
      default:
        return null
    }
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
              {renderStepPreview(step.preview)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default OnboardingGuide