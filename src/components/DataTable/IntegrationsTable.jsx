import React, { useState } from 'react';
import './IntegrationsTable.scss'; 
import Pagination from '../Pagination';
import InputText from '../InputText/InputText';
import Card from '../Card';
import Button from '../Button';

const IntegrationsTable = ({ integrations }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIntegrations, setSelectedIntegrations] = useState([]);
    const [availableIntegrations, setAvailableIntegrations] = useState(integrations);
    const rowsPerPage = 6;

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddIntegration = (integration) => {
        setSelectedIntegrations((prev) => {
            if (!prev.some((item) => item.label === integration.label)) {
                return [...prev, integration];
            }
            return prev;
        });
        setAvailableIntegrations((prev) => prev.filter((item) => item.label !== integration.label));
        setSearchQuery('');
    };

    const filteredIntegrations = availableIntegrations.filter((integration) =>
        integration.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredIntegrations.slice(startIndex, endIndex);

    return (
        <div className='integrations-table-container'>
            <h2 className="integrations-title">Integrations</h2>
            <p className="integrations-subtitle">Active</p>
            <div className="selected-integrations">
                {selectedIntegrations.map((integration, index) => (
                    <Card key={index} className="selected-integration-card">
                        <img src={integration.img} alt={integration.label} className="integration-icon" />
                        <h3 className="integration-title">{integration.label}</h3>
                        <p className="integration-description">{integration.Description}</p>
                        <Button className="integration-remove-button" type='secondary'>Deactivate</Button>
                    </Card>
                ))}
            </div>

            <p className="integrations-subtitle">All Available</p>
            
            <div className="integrations-container">
                <InputText
                    style={{ width: '100%' }}
                    placeholder="Search"
                    label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="integrations-grid">
                    {paginatedData.map((integration, index) => (
                        <Card key={index} className="integration-card">
                            <img src={integration.img} alt={integration.label} className="integration-icon" />
                            <h3 className="integration-title">{integration.label}</h3>
                            <p className="integration-description">{integration.Description}</p>
                            <Button className="integration-add-button" type='secondary' onClick={() => handleAddIntegration(integration)}>Add</Button>
                        </Card>
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalResults={filteredIntegrations.length}
                    resultsPerPage={rowsPerPage}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default IntegrationsTable;