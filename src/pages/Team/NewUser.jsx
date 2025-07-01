import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Stepper from '../../components/Stepper/Stepper'
import Switch from '../../components/Switch'
import GoBackButton from '../../components/GoBackButton'
import './NewUser.scss'

const NewUser = () => {
  const navigate = useNavigate()
  const { user, account, createNotification } = useAccount()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'Viewer'
  })
  const [emailInvites, setEmailInvites] = useState('')
  const [createMode, setCreateMode] = useState(true)
  const [selectedRole, setSelectedRole] = useState('Owner')
  
  const steps = [
    { label: 'Users' },
    { label: 'Add New' },
    { label: 'Permissions' }
  ]
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value
    })
  }
  
  const handleEmailInvitesChange = (e) => {
    setEmailInvites(e.target.value)
  }
  
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate('/team')
    }
  }
  
  const handleCreateUser = () => {
    createNotification({
      message: 'User created successfully!',
      type: 'default',
      autoClose: 3000
    })
    navigate('/team')
  }
  
  const handleInviteUsers = () => {
    createNotification({
      message: 'Invitations sent successfully!',
      type: 'default',
      autoClose: 3000
    })
    navigate('/team')
  }
  
  const renderStep1 = () => {
    return (
      <div className="team-members-container">
        <h2>Team Members</h2>
        <p>View and manage your team members.</p>
        <Button type="primary" onClick={goToNextStep}>Continue</Button>
      </div>
    )
  }
  
  const renderStep2 = () => {
    return (
      <div className="add-new-user-container">
        <h2>Add new user</h2>
        
        <div className="toggle-buttons">
          <Button 
            type={createMode ? "primary" : "secondary"}
            onClick={() => setCreateMode(true)}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            Create User
          </Button>
          <Button 
            type={!createMode ? "primary" : "secondary"}
            onClick={() => setCreateMode(false)}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            Invite Users
          </Button>
        </div>
        
        {createMode ? (
          <div className="form-container">
            <InputText
              label="Email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              placeholder="Email address"
            />
            
            <InputText
              label="Name"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              placeholder="Full name"
            />
            
            <InputText
              label="Password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleInputChange}
              placeholder="Password"
            />
          </div>
        ) : (
          <div className="form-container">
            <InputText
              label="Emails (separated by commas)"
              value={emailInvites}
              onChange={handleEmailInvitesChange}
              placeholder="Email addresses separated by commas"
            />
          </div>
        )}
        
        <div className="action-buttons">
          <Button type="secondary" onClick={goToPrevStep}>Back</Button>
          <Button type="primary" onClick={goToNextStep}>Continue to Permissions</Button>
        </div>
      </div>
    )
  }
  
  const renderStep3 = () => {
    return (
      <div className="permissions-container">
        <h2>Permissions</h2>
        
        <div className="permissions-layout">
          {/* Left side - Role selection */}
          <div className="roles-section">
            <div className="role-option">
              <input 
                type="radio" 
                id="role-owner" 
                name="role" 
                checked={selectedRole === 'Owner'} 
                onChange={() => setSelectedRole('Owner')}
              />
              <label htmlFor="role-owner">Owner</label>
              <p className="role-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo.</p>
            </div>
            
            <div className="role-option">
              <input 
                type="radio" 
                id="role-admin" 
                name="role" 
                checked={selectedRole === 'Admin'} 
                onChange={() => setSelectedRole('Admin')}
              />
              <label htmlFor="role-admin">Admin</label>
              <p className="role-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo.</p>
            </div>
            
            <div className="role-option">
              <input 
                type="radio" 
                id="role-manager" 
                name="role" 
                checked={selectedRole === 'Manager'} 
                onChange={() => setSelectedRole('Manager')}
              />
              <label htmlFor="role-manager">Manager</label>
              <p className="role-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo.</p>
            </div>
            
            <div className="role-option">
              <input 
                type="radio" 
                id="role-author" 
                name="role" 
                checked={selectedRole === 'Author'} 
                onChange={() => setSelectedRole('Author')}
              />
              <label htmlFor="role-author">Author</label>
              <p className="role-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo.</p>
            </div>
            
            <div className="role-option">
              <input 
                type="radio" 
                id="role-viewer" 
                name="role" 
                checked={selectedRole === 'Viewer'} 
                onChange={() => setSelectedRole('Viewer')}
              />
              <label htmlFor="role-viewer">Viewer</label>
              <p className="role-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo.</p>
            </div>
            
            <div className="role-option">
              <input 
                type="radio" 
                id="role-custom" 
                name="role" 
                checked={selectedRole === 'Custom'} 
                onChange={() => setSelectedRole('Custom')}
              />
              <label htmlFor="role-custom">Custom</label>
              <p className="role-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo.</p>
            </div>
          </div>
          
          {/* Right side - Permission categories */}
          <div className="permissions-categories">
            {/* First column */}
            <div className="permissions-column">
              <div className="permission-category">
                <h3>Campaigns</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Subscribers</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Export</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Import</span>
                  <Switch checked={true} />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Integrations</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Stats</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
              </div>
            </div>
            
            {/* Second column */}
            <div className="permissions-column">
              <div className="permission-category">
                <h3>Templates</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Export</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Import</span>
                  <Switch checked={true} />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Automations</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Billing</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch checked={true} />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch checked={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="action-button-container">
          <Button type="primary" onClick={handleCreateUser}>Add user</Button>
        </div>
      </div>
    );
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  }
  
  return (
    <div className="fm-page-wrapper">
      <Sidemenu />
      <div className="fm-page-container">
        <PageHeader user={user} account={account} />
        
        <div className="go-back-container" style={{ margin: '0 0 20px 20px' }}>
          <GoBackButton onClick={() => navigate('/team')} />
        </div>
        
        <div className="stepper-container">
          <Stepper steps={steps} current={currentStep-1} setStep={(step) => setCurrentStep(step+1)} hasBack={false} />
        </div>
        
        <div className="new-user-content">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
}

export default NewUser