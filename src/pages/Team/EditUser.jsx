import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Stepper from '../../components/Stepper/Stepper'
import Switch from '../../components/Switch'
import GoBackButton from '../../components/GoBackButton'
import './EditUser.scss'

const EditUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, account, createNotification } = useAccount()
  
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(2)
  const [userData, setUserData] = useState({
    id: 0,
    name: 'Alice',
    username: 'alice89',
    email: 'alice@example.com',
    role: 'Admin',
    permissions: {
      campaigns: {
        view: true,
        edit: true
      },
      subscribers: {
        view: true,
        edit: true,
        export: true,
        import: true
      },
      templates: {
        view: true,
        edit: true,
        export: true,
        import: true
      },
      automations: {
        view: true,
        edit: true
      },
      integrations: {
        view: true,
        edit: true
      },
      billing: {
        view: true,
        edit: true
      },
      stats: {
        view: true,
        edit: true
      }
    }
  })
  
  const [selectedRole, setSelectedRole] = useState('Admin')
  
  const steps = [
    { label: 'Users' },
    { label: 'Add New' },
    { label: 'Permissions' }
  ]
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [id])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value
    })
  }
  
  const handleRoleChange = (value) => {
    setUserData({
      ...userData,
      role: value
    })
    setSelectedRole(value)
  }
  
  const handlePermissionChange = (category, permission) => {
    setUserData({
      ...userData,
      permissions: {
        ...userData.permissions,
        [category]: {
          ...userData.permissions[category],
          [permission]: !userData.permissions[category][permission]
        }
      }
    })
  }
  
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const goToPrevStep = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate('/team')
    }
  }
  
  const handleSave = () => {
    createNotification({
      message: 'User updated successfully!',
      type: 'default',
      autoClose: 3000
    })
    navigate('/team')
  }
  
  const renderStep1 = () => {
    return (
      <div className="team-members-container">
        <h2>Users</h2>
        <p>View and manage your users.</p>
        <Button type="primary" onClick={goToNextStep}>Continue</Button>
      </div>
    )
  }
  
  const renderStep2 = () => {
    return (
      <div className="add-new-user-container">
        <h2>Edit User</h2>
        
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
            label="Username"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            placeholder="Username"
          />
          
          <div className="password-container">
            <Button type="secondary">Change Password</Button>
          </div>
        </div>
        
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
                  <Switch 
                    checked={userData.permissions.campaigns.view}
                    onChange={() => handlePermissionChange("campaigns", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.campaigns.edit}
                    onChange={() => handlePermissionChange("campaigns", "edit")}
                  />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Subscribers</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch 
                    checked={userData.permissions.subscribers.view}
                    onChange={() => handlePermissionChange("subscribers", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.subscribers.edit}
                    onChange={() => handlePermissionChange("subscribers", "edit")}
                  />
                </div>
                <div className="permission-item">
                  <span>Export</span>
                  <Switch 
                    checked={userData.permissions.subscribers.export}
                    onChange={() => handlePermissionChange("subscribers", "export")}
                  />
                </div>
                <div className="permission-item">
                  <span>Import</span>
                  <Switch 
                    checked={userData.permissions.subscribers.import}
                    onChange={() => handlePermissionChange("subscribers", "import")}
                  />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Integrations</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch 
                    checked={userData.permissions.integrations.view}
                    onChange={() => handlePermissionChange("integrations", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.integrations.edit}
                    onChange={() => handlePermissionChange("integrations", "edit")}
                  />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Stats</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch 
                    checked={userData.permissions.stats.view}
                    onChange={() => handlePermissionChange("stats", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.stats.edit}
                    onChange={() => handlePermissionChange("stats", "edit")}
                  />
                </div>
              </div>
            </div>
            
            {/* Second column */}
            <div className="permissions-column">
              <div className="permission-category">
                <h3>Templates</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch 
                    checked={userData.permissions.templates?.view || false}
                    onChange={() => handlePermissionChange("templates", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.templates?.edit || false}
                    onChange={() => handlePermissionChange("templates", "edit")}
                  />
                </div>
                <div className="permission-item">
                  <span>Export</span>
                  <Switch 
                    checked={userData.permissions.templates?.export || false}
                    onChange={() => handlePermissionChange("templates", "export")}
                  />
                </div>
                <div className="permission-item">
                  <span>Import</span>
                  <Switch 
                    checked={userData.permissions.templates?.import || false}
                    onChange={() => handlePermissionChange("templates", "import")}
                  />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Automations</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch 
                    checked={userData.permissions.automations.view}
                    onChange={() => handlePermissionChange("automations", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.automations.edit}
                    onChange={() => handlePermissionChange("automations", "edit")}
                  />
                </div>
              </div>
              
              <div className="permission-category">
                <h3>Billing</h3>
                <div className="permission-item">
                  <span>View</span>
                  <Switch 
                    checked={userData.permissions.billing.view}
                    onChange={() => handlePermissionChange("billing", "view")}
                  />
                </div>
                <div className="permission-item">
                  <span>Edit</span>
                  <Switch 
                    checked={userData.permissions.billing.edit}
                    onChange={() => handlePermissionChange("billing", "edit")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="action-button-container">
          <Button type="primary" onClick={handleSave}>Update user</Button>
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
  
  if (loading) {
    return (
      <div className="fm-page-wrapper">
        <Sidemenu />
        <div className="fm-page-container">
          <PageHeader user={user} account={account} />
          <div className="loading-container">
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    )
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

export default EditUser