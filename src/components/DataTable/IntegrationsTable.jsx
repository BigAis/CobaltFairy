import React, { useState } from 'react';
import './IntegrationsTable.scss'; 
import Pagination from '../Pagination';
import InputText from '../InputText/InputText';

const IntegrationsTable = ({ integrations }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const rowsPerPage = 6;

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Filter integrations based on search query
    const filteredIntegrations = integrations.filter((integration) =>
        integration.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredIntegrations.slice(startIndex, endIndex);

    return (
       <div className='integrations-table-container'>

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
                    <div key={index} className="integration-card">
                        <img src={integration.img} alt={integration.label} className="integration-icon" />
                        <h3 className="integration-title">{integration.label}</h3>
                        <p className="integration-description">{integration.Description}</p>
                        <button className="integration-add-button">Add</button>
                    </div>
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