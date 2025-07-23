import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Switch from '../../components/Switch'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './automations.scss'
import AutomationOverview from './AutomationOverview'
import AutomationSubscribers from './AutomationSubscribers'
import AutomationHistory from './AutomationHistory'
import PopupText from '../../components/PopupText/PopupText'

const AutomationDetail = () => {
  const { user, account, createNotification } = useAccount()
  const navigate = useNavigate()
  const { autId } = useParams()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [automation, setAutomation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        
        createNotification({
          message: 'Failed to update automation status.',
          type: 'warning',
          autoClose: 3000
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
      
      createNotification({
        message: 'Error updating automation status. Please try again.',
        type: 'warning',
        autoClose: 3000
      })
      return false
    }
  }

  // Handle edit button click
  const handleEditClick = () => {
    if (isMobile) {
      PopupText.fire({
        icon: 'warning',
        text: 'The automation flow editor is not available on mobile devices. Please use a desktop computer to edit your automation flow.',
        showCancelButton: false,
        confirmButtonText: 'OK',
      })
    } else {
      navigate(`/automations/${autId}/edit`)
    }
  }

  // Handle flow edit button click
  const handleFlowEditClick = () => {
    if (isMobile) {
      PopupText.fire({
        icon: 'warning',
        text: 'The automation flow editor is not available on mobile devices. Please use a desktop computer to edit your automation flow.',
        showCancelButton: false,
        confirmButtonText: 'OK',
      })
    } else {
      navigate(`/automations/editor/${automation.uuid}`)
    }
  }

  return (
    <div className="fm-page-wrapper">
      <Sidemenu />
      <div className="fm-page-container">
        <PageHeader />
        
        <div className="page-name-container">
          <div className="page-name">
            <Link to="/automations" className="automation-breadcrumb">
              Automations
            </Link>{' '}
            {'>'}{' '}
            <span>
              {loading ? <Skeleton width={150} /> : automation?.name || 'Demo Automation'}
            </span>
          </div>
          
          {!loading && (
            <div className="automation-controls">
              {/* Switch for automation status */}
              <div className="status-switch">
                <Switch
                  checked={automation?.active || false}
                  label={automation?.active ? 'Running' : 'Stopped'}
                  onChange={(value) => updateAutomationStatus(value)}
                />
              </div>
              
              {/* Action buttons */}
              <div className="action-buttons">
                <Button
                  type="secondary"
                  onClick={handleEditClick}
                >
                  Edit Details
                </Button>
                <Button
                  icon="Edit"
                  type="action"
                  onClick={handleFlowEditClick}
                  disabled={isReadOnly}
                >
                  {isReadOnly ? 'View Flow' : 'Edit Flow'}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="automation-tabs">
          <Button
            type={activeTab === 'overview' ? 'primary' : 'secondary'} 
            className={activeTab === 'overview' ? 'active-tab' : ''}
            onClick={() => navigate(`/automations/${autId}`)}
          >
            Overview
          </Button>
          <Button
            type={activeTab === 'subscribers' ? 'primary' : 'secondary'}
            className={activeTab === 'subscribers' ? 'active-tab' : ''}
            onClick={() => navigate(`/automations/${autId}/subscribers`)}
          >
            Subscribers
          </Button>
          <Button
            type={activeTab === 'history' ? 'primary' : 'secondary'}
            className={activeTab === 'history' ? 'active-tab' : ''}
            onClick={() => navigate(`/automations/${autId}/history`)}
          >
            History
          </Button>
        </div>
        
        {/* Tab content */}
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
      
      <style jsx>{`
        .automation-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .active-tab {
          background-color: rgba(255, 99, 93, 0.1);
          border-color: #FF635D;
          color: #FF635D;
        }
        
        .automation-breadcrumb {
          color: #887D76;
          text-decoration: none;
          cursor: pointer;
        }
        
        .automation-breadcrumb:hover {
          text-decoration: underline;
        }
        
        .automation-controls {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .status-switch {
          display: flex;
          align-items: center;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .automation-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .action-buttons {
            width: 100%;
            justify-content: flex-start;
          }
          
          .action-buttons button {
            flex: 1;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  )
}

export default AutomationDetail