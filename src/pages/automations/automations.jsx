// Updated version of src/pages/automations/automations.jsx

import { React, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './automations.scss'

import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import SearchBar from '../../components/SearchBar/SearchBar'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import AutomationsTable from '../../components/DataTable/AutomationsTable'

const Automations = () => {
    const { user, account } = useAccount()
    const [automations, setAutomations] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Load automations data
    const loadData = async () => {
        try {
            setLoading(true)
            // Add a cache-busting parameter to ensure we get fresh data
            const timestamp = new Date().getTime()
            let resp = await ApiService.get(
                `fairymailer/getAutomations?sort[0]=createdAt:desc&pagination[pageSize]=1000&pagination[page]=1&_t=${timestamp}`,
                user.jwt
            )
            if (resp.data && resp.data.data) {
                setAutomations(resp.data.data.map(data => {
                    data.createdAt = data.createdAt.split('T')[0]
                    return data
                }))
            }
        } catch (error) {
            console.error('Error fetching automations:', error)
        } finally {
            setLoading(false)
        }
    }

    // Search function for automations
    const searchAutomations = async (term) => {
        try {
            setSearchTerm(term)
            setLoading(true)
            
            let resp = await ApiService.get(
                `fairymailer/getAutomations?sort[0]=createdAt:desc&filters[name][$contains]=${term}&pagination[pageSize]=1000&pagination[page]=1&`,
                user.jwt
            )
            
            if (resp.data && resp.data.data) {
                setAutomations(resp.data.data.map(data => {
                    data.createdAt = data.createdAt.split('T')[0]
                    return data
                }))
            }
        } catch (error) {
            console.error('Error searching automations:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            loadData()
        }
        
        // Add an event listener to refresh data when the page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                loadData()
            }
        }
        
        document.addEventListener('visibilitychange', handleVisibilityChange)
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [user])

    return (
        <>
            <div className="fm-page-wrapper">
                <Sidemenu />
                <div className="fm-page-container">
                    <PageHeader user={user} account={account} />
                    <div className="page-name-container">
                        <div className="page-name">Automations</div>
                        <Button icon={'Plus'} type="action" onClick={() => navigate('/automations/new')}>
                            Add Automation
                        </Button>
                    </div>
                    
                    {/* Search Bar - Added margin-bottom for spacing */}
                    <div className="filters-container" style={{ marginBottom: '20px' }}>
                        <div className="input-text-container" style={{
                            marginTop: '10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between'
                        }}>
                            <SearchBar
                                placeholder="Search Automations" 
                                label="Search Automations"
                                initialValue={searchTerm}
                                onSearch={searchAutomations}
                                style={{ width: '100%' }}
                            />
                            {/* Filters button temporarily hidden
                            <Button type="secondary" icon={'Filters'} className="button-filters">
                                Filters
                            </Button>
                            */}
                        </div>
                    </div>

                    <div className="groups">
                        {loading ? (
                            <Card>
                                <div className="text-center p-4">Loading automations...</div>
                            </Card>
                        ) : automations && automations.length > 0 ? (
                            <AutomationsTable incomingAutomations={automations} refreshData={loadData} />
                        ) : (
                            <Card>
                                <div className="text-center p-4">
                                    <p>No automations found.</p>
                                    {searchTerm && (
                                        <Button type="secondary" onClick={() => {
                                            setSearchTerm('')
                                            loadData()
                                        }}>
                                            Clear Search
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Automations