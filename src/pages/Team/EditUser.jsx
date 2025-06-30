import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Card from '../../components/Card'
import RadioButton from '../../components/RadioButton'
import Switch from '../../components/Switch'
import GoBackButton from '../../components/GoBackButton'
import './EditUser.scss'

const EditUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, account, createNotification } = useAccount()
  
  const [loading, setLoading] = useState(true)
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
  
  const handleSave = () => {
    createNotification({
      message: 'User updated successfully!',
      type: 'default',
      autoClose: 3000
    })
    navigate('/team')
  }
  
  const getRoleDescription = (role) => {
    switch(role) {
      case 'Owner':
        return 'Full access to all features and settings. Can manage billing and team members.'
      case 'Admin':
        return 'Can manage all features except billing settings. Can add or remove team members.'
      case 'Manager':
        return 'Can create and edit campaigns, manage subscribers, and view reports.'
      case 'Author':
        return 'Can create and edit campaigns, but cannot manage subscribers or billing.'
      case 'Viewer':
        return 'Read-only access to campaigns and reports. Cannot make changes.'
      default:
        return ''
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
        
        <div className="go-back-container">
          <GoBackButton onClick={() => navigate('/team')} />
        </div>
        
        <div className="edit-user-container">
          <h1 className="page-title">Edit User</h1>
          
          <Card className="user-details-card">
            <h2 className="card-title">User Details</h2>
            <div className="form-fields">
              <div className="input-field">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="input-field">
                <label>Username</label>
                <input 
                  type="text" 
                  name="username"
                  value={userData.username}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="input-field">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="password-container">
                <Button type="secondary">Change Password</Button>
              </div>
            </div>
          </Card>
          
          <Card className="role-permissions-card">
            <h2 className="card-title">Role & Permissions</h2>
            
            <div className="role-section">
              <h3 className="section-title">Role</h3>
              <div className="role-options">
                <div className="role-option">
                  <input 
                    type="radio" 
                    id="role-owner" 
                    name="role" 
                    value="Owner"
                    checked={userData.role === "Owner"}
                    onChange={() => handleRoleChange("Owner")}
                  />
                  <label htmlFor="role-owner">Owner</label>
                </div>
                
                <div className="role-option">
                  <input 
                    type="radio" 
                    id="role-admin" 
                    name="role" 
                    value="Admin"
                    checked={userData.role === "Admin"}
                    onChange={() => handleRoleChange("Admin")}
                  />
                  <label htmlFor="role-admin">Admin</label>
                </div>
                
                <div className="role-option">
                  <input 
                    type="radio" 
                    id="role-manager" 
                    name="role" 
                    value="Manager"
                    checked={userData.role === "Manager"}
                    onChange={() => handleRoleChange("Manager")}
                  />
                  <label htmlFor="role-manager">Manager</label>
                </div>
                
                <div className="role-option">
                  <input 
                    type="radio" 
                    id="role-author" 
                    name="role" 
                    value="Author"
                    checked={userData.role === "Author"}
                    onChange={() => handleRoleChange("Author")}
                  />
                  <label htmlFor="role-author">Author</label>
                </div>
                
                <div className="role-option">
                  <input 
                    type="radio" 
                    id="role-viewer" 
                    name="role" 
                    value="Viewer"
                    checked={userData.role === "Viewer"}
                    onChange={() => handleRoleChange("Viewer")}
                  />
                  <label htmlFor="role-viewer">Viewer</label>
                </div>
              </div>
              
              <div className="role-description">
                {getRoleDescription(userData.role)}
              </div>
            </div>
            
            <div className="custom-permissions-section">
              <h3 className="section-title">Custom Permissions</h3>
              
              <div className="permissions-grid">
                <div className="permissions-column">
                  <div className="permission-category">
                    <h4 className="category-title">Campaigns</h4>
                    <div className="permission-items">
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
                  </div>
                  
                  <div className="permission-category">
                    <h4 className="category-title">Subscribers</h4>
                    <div className="permission-items">
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
                    </div>
                  </div>
                  
                  <div className="permission-category">
                    <h4 className="category-title">Automations</h4>
                    <div className="permission-items">
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
                  </div>
                  
                  <div className="permission-category">
                    <h4 className="category-title">Stats</h4>
                    <div className="permission-items">
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
                </div>
                
                <div className="permissions-column">
                  <div className="permission-category">
                    <h4 className="category-title">Integrations</h4>
                    <div className="permission-items">
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
                  </div>
                  
                  <div className="permission-category">
                    <h4 className="category-title">Templates</h4>
                    <div className="permission-items">
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
                  </div>
                  
                  <div className="permission-category">
                    <h4 className="category-title">Billing</h4>
                    <div className="permission-items">
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
            </div>
          </Card>
          
          <div className="actions-container">
            <Button type="secondary" onClick={() => navigate('/team')}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUser
