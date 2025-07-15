import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Switch from '../../components/Switch'
import ButtonGroup from '../../components/ButtonGroup'
import PopupText from '../../components/PopupText/PopupText'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './automations.scss'
import AutomationOverview from './AutomationOverview'
import AutomationSubscribers from './AutomationSubscribers'
import AutomationHistory from './AutomationHistory'

const AutomationDetail = () => {
  const { user, account, createNotification } = useAccount()
  const navigate = useNavigate()
  const { autId } = useParams()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [automation, setAutomation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  // Get active tab from URL
  useEffect(() => {
    const pathname = location.pathname
    if (pathname.includes('/subscribers')) {
      setActiveTab('subscribers')
    } else if (pathname.includes('/history')) {
      setActiveTab('history')
    } else {
      setActiveTab('overview')
    }
  }, [location])

  // Load automation data
  useEffect(() => {
    const loadAutomation = async () => {
      try {
        setLoading(true)
        const resp = await ApiService.get(`fairymailer/getAutomations?filters[uuid]=${autId}&populate=*`, user.jwt)
        if (resp.data && resp.data.data && resp.data.data.length > 0) {
          setAutomation(resp.data.data[0])
          setIsReadOnly(resp.data.data[0].active)
        } else {
          createNotification({
            message: 'Automation not found',
            type: 'warning',
            autoClose: 3000
          })
          navigate('/automations')
        }
      } catch (error) {
        console.error('Error loading automation:', error)
        createNotification({
          message: 'Failed to load automation details',
          type: 'warning',
          autoClose: 3000
        })
      } finally {
        setLoading(false)
      }
    }

    if (user && autId) {
      loadAutomation()
    }
  }, [user, autId])

  // Update automation status
  const updateAutomationStatus = async (newStatus) => {
    try {
      // First update the local state
      setAutomation({
        ...automation,
        active: newStatus
      })

      // Then update in the backend
      let resp = await ApiService.put(`automations/${automation.id}`, 
        { data: { active: newStatus } }, 
        user.jwt
      )

      if (resp.status === 200) {
        // Show notification of success
        createNotification({
          message: `Automation ${newStatus ? 'activated' : 'deactivated'} successfully.`,
          type: 'default',
          autoClose: 3000
        })
        
        // Update read-only status
        setIsReadOnly(newStatus)
        
        return true
      } else {
        // Revert local state change if API call fails
        setAutomation(prevData => ({
          ...prevData,
          active: !newStatus
        }))
        
        PopupText.fire({ 
          icon: 'error', 
          text: 'Failed to update automation status.', 
          showCancelButton: false 
        })
        return false
      }
    } catch (error) {
      console.error("Error updating automation status:", error)
      
      // Revert local state change if API call fails
      setAutomation(prevData => ({
        ...prevData,
        active: !newStatus
      }))
      
      PopupText.fire({ 
        icon: 'error', 
        text: 'Error updating automation status. Please try again.', 
        showCancelButton: false 
      })
      return false
    }
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === 'overview') {
      navigate(`/automations/${autId}`)
    } else {
      navigate(`/automations/${autId}/${tab}`)
    }
  }

  // Handle edit button click
  const handleEditClick = () => {
    navigate(`/automations/${autId}/edit`)
  }

  return (
    <>
      <div className="fm-page-wrapper">
        <Sidemenu />
        <div className="fm-page-container">
          <PageHeader />
          
          <div className="automation-detail-container">
            {/* Header with breadcrumb and title */}
            <div className="automation-header">
              <div className="automation-breadcrumb" onClick={() => navigate('/automations')}>
                <span>Automations</span> &gt; <span className="automation-name">{loading ? <Skeleton width={100} /> : automation?.name}</span>
              </div>
              
              <div className="automation-title-actions">
                <h1 className="automation-title">{loading ? <Skeleton width={200} /> : automation?.name || 'Demo Automation'}</h1>
                
                <div className="automation-actions">
                  {!loading && (
                <>
                  <Switch
                    checked={automation?.active || false}
                    label={automation?.active ? 'Automation is running' : 'Automation is stopped'}
                    onChange={(value) => updateAutomationStatus(value)}
                  />
                  <Button
                    icon="Edit"
                    type="action"
                    onClick={handleEditClick}
                    disabled={isReadOnly}
                  >
                    Edit Flow
                  </Button>
                </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tab navigation */}
            <div className="automation-tabs-container">
              <div className="automation-tabs">
                <button 
                  className={`automation-tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => handleTabChange('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`automation-tab ${activeTab === 'subscribers' ? 'active' : ''}`}
                  onClick={() => handleTabChange('subscribers')}
                >
                  Subscribers
                </button>
                <button 
                  className={`automation-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => handleTabChange('history')}
                >
                  History
                </button>
              </div>
            </div>
            
            {/* Tab content */}
            <div className="automation-tab-content">
              {loading ? (
                <Card>
                  <Skeleton height={300} />
                </Card>
              ) : (
                <>
                  {activeTab === 'overview' && <AutomationOverview automation={automation} />}
                  {activeTab === 'subscribers' && <AutomationSubscribers automation={automation} />}
                  {activeTab === 'history' && <AutomationHistory automation={automation} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AutomationDetail