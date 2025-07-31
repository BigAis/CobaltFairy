import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Button from '../../components/Button';
import Switch from '../../components/Switch';
import Checkbox from '../../components/Checkbox';
import Pagination from '../../components/Pagination';
import Dropdown from '../../components/Dropdown';
import Card from '../../components/Card';
import './DataTable.scss';

const WorkflowEmailsTable = ({
  emails,
  selectedEmails,
  setSelectedEmails,
  updateEmailStatus,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange
}) => {
  // Selection template for checkboxes
  const selectionTemplate = (rowData) => (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
        <Checkbox 
          checked={selectedEmails.some(email => email.id === rowData.id)} 
          onChange={(checked) => {
            if (checked) {
              setSelectedEmails([...selectedEmails, rowData]);
            } else {
              setSelectedEmails(selectedEmails.filter(email => email.id !== rowData.id));
            }
          }} 
        />
      </div>
    </div>
  );
  
  // Header checkbox template
  const headerCheckboxTemplate = () => (
    <Checkbox
      checked={selectedEmails.length === emails.length && emails.length > 0}
      onChange={(checked) => {
        if (checked) {
          setSelectedEmails([...emails]);
        } else {
          setSelectedEmails([]);
        }
      }}
    />
  );

  // Status toggle template
  const statusTemplate = (rowData) => (
    <Switch 
      checked={rowData.active} 
      onChange={() => {
        updateEmailStatus(rowData.id, !rowData.active);
      }}
    />
  );
  
  // Actions template
  const actionsTemplate = (rowData) => (
    <div>
      <Dropdown
        withDivider={true}
        icon={'Plus'}
        options={[
          { value: 'report', label: 'Report' }
        ]}
        onLeftClick={() => {
          console.log('Report clicked for', rowData.name);
        }}
        onOptionSelect={(option) => {
          console.log('Option selected', option);
        }}
      >
        Report
      </Dropdown>
    </div>
  );
  
  // Campaign row template with image and subject
  const campaignRowTemplate = (rowData) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '12px' }}>
        <img 
          src={rowData.previewImage || "https://via.placeholder.com/40"} 
          alt={rowData.name}
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
        />
      </div>
      <div>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{rowData.name}</div>
        <div style={{ fontSize: '12px', color: '#887D76' }}>{rowData.subject}</div>
      </div>
    </div>
  );

  return (
    <Card className="workflow-emails-wrapper" style={{ marginBottom: '30px' }}>
      <h3 style={{ fontFamily: 'Bitter', fontSize: '18px', fontWeight: 600, margin: '0 0 15px 0' }}>Workflow Emails</h3>
      
      <div className="table-container" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <DataTable 
          value={emails} 
          className="workflow-emails-table"
          responsive
          selection={selectedEmails}
          onSelectionChange={e => setSelectedEmails(e.value)}
          dataKey="id"
          rowClassName={() => 'p-table-row'}
          showGridlines={false}
        >
          <Column 
            body={selectionTemplate}
            header={headerCheckboxTemplate}
            headerStyle={{ width: '80px' }}
          />
          <Column header="Name" body={campaignRowTemplate} />
          <Column field="recipients" header="Recipients" />
          <Column header="Opens" body={(rowData) => `${rowData.opens}% | ${rowData.opensTotal}`} />
          <Column header="Clicks" body={(rowData) => `${rowData.clicks}% | ${rowData.clicksTotal}`} />
          <Column field="type" header="Type" />
          <Column field="date" header="Date" />
          <Column header="Status" body={statusTemplate} />
          <Column header="Actions" body={actionsTemplate} />
        </DataTable>
      </div>
      
      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          currentPage={currentPage}
          totalResults={totalItems}
          resultsPerPage={itemsPerPage}
          onChange={onPageChange}
        />
      </div>
    </Card>
  );
};

export default WorkflowEmailsTable;