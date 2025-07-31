import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ButtonGroup from '../../components/ButtonGroup';
import Checkbox from '../../components/Checkbox';
import Pagination from '../../components/Pagination';
import Card from '../../components/Card';
import './DataTable.scss';

const WorkflowStatsTable = ({
  stats,
  selectedStats,
  setSelectedStats,
  timeFilterOptions,
  statsTimeFilter,
  setStatsTimeFilter,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange
}) => {
  // Selection template for checkbox
  const selectionTemplate = (rowData) => (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
        <Checkbox 
          checked={selectedStats.includes(rowData.id)} 
          onChange={(checked) => {
            if (checked) {
              setSelectedStats([...selectedStats, rowData.id]);
            } else {
              setSelectedStats(selectedStats.filter(id => id !== rowData.id));
            }
          }} 
        />
      </div>
    </div>
  );
  
  // Header checkbox template
  const headerCheckboxTemplate = () => (
    <Checkbox
      checked={selectedStats.length === stats.length && stats.length > 0}
      onChange={(checked) => {
        if (checked) {
          setSelectedStats(stats.map(stat => stat.id));
        } else {
          setSelectedStats([]);
        }
      }}
    />
  );

  return (
    <Card className="workflow-stats-wrapper" style={{ marginBottom: '30px' }}>
      <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 className="section-title" style={{ fontFamily: 'Bitter', fontSize: '18px', fontWeight: 600, margin: 0 }}>Workflow Stats</h3>
        <div className="time-filter">
          <ButtonGroup 
            options={timeFilterOptions} 
            value={statsTimeFilter}
            onChange={(value) => setStatsTimeFilter(value)}
          />
        </div>
      </div>
      
      <div className="table-container" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <DataTable 
          value={stats} 
          className="workflow-stats-table"
          responsive
          selection={selectedStats}
          onSelectionChange={e => setSelectedStats(e.value)}
          dataKey="id"
          rowClassName={() => 'p-table-row'}
          showGridlines={false}
        >
          <Column 
            body={selectionTemplate}
            header={headerCheckboxTemplate}
            headerStyle={{ width: '80px' }}
          />
          <Column field="month" header="Month" />
          <Column field="emailsSent" header="Emails Sent" />
          <Column header="Opened" body={(rowData) => `${rowData.opened} | ${rowData.openedPercent}%`} />
          <Column header="Clicked" body={(rowData) => `${rowData.clicked} | ${rowData.clickedPercent}%`} />
          <Column header="Unsubscribed" body={(rowData) => `${rowData.unsubscribed} | ${rowData.unsubscribedPercent}%`} />
          <Column header="Spams" body={(rowData) => `${rowData.spams} | ${rowData.spamsPercent}%`} />
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

export default WorkflowStatsTable;