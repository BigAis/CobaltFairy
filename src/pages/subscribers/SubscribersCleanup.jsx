import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InputText from '../../components/InputText/InputText';
import DatePicker from '../../components/DatePicker';
import Dropdown from '../../components/Dropdown';
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown';
import Checkbox from '../../components/Checkbox';
import PopupText from '../../components/PopupText/PopupText';
import { ApiService } from '../../service/api-service';
import './SubscribersCleanup.scss';

const SubscribersCleanup = ({ user, account, groups, onUpdate }) => {
  const [filters, setFilters] = useState({
    status: { value: 'all', label: 'All Subscribers' },
    interactionType: { value: 'all', label: 'All' },
    dateFrom: '',
    dateTo: '',
    groups: [],
    includeHardBounces: true,
    includeSoftBounces: true,
    minSoftBounceCount: 3,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [matchingCount, setMatchingCount] = useState(0);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Subscribers' },
    { value: 'active', label: 'Active Subscribers' },
    { value: 'inactive', label: 'Inactive Subscribers' }
  ];
  
  // Interaction options
  const interactionOptions = [
    { value: 'all', label: 'All' },
    { value: 'unopened', label: 'Never Opened Emails' },
    { value: 'unclicked', label: 'Never Clicked Links' },
    { value: 'no_interaction', label: 'No Interaction' },
    { value: 'bounced', label: 'Bounced Emails' }
  ];
  
  // Group options from props
  const groupOptions = groups && groups.map(group => ({
    value: group.udid,
    label: group.name
  }));
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleGroupSelection = (selected) => {
    setFilters(prev => ({
      ...prev,
      groups: selected
    }));
  };
  
  // Count matching subscribers
  const countMatchingSubscribers = async () => {
    if (!user || !user.jwt) return;
    
    setIsLoading(true);
    
    try {
      // Prepare filter object for API
      const filterCriteria = {
        status: filters.status?.value || 'all',
        interactionType: filters.interactionType?.value || 'all',
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
        dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : null,
        groups: filters.groups.map(g => g.value),
        includeHardBounces: filters.includeHardBounces,
        includeSoftBounces: filters.includeSoftBounces,
        minSoftBounceCount: filters.minSoftBounceCount
      };
      
      const response = await ApiService.post(
        'fairymailer/countMatchingSubscribers',
        { filters: filterCriteria },
        user.jwt
      );
      
      if (response.data && response.data.count !== undefined) {
        setMatchingCount(response.data.count);
      }
    } catch (error) {
      console.error('Error counting matching subscribers:', error);
      PopupText.fire({
        text: 'Error counting matching subscribers. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load subscribers matching criteria
  const loadMatchingSubscribers = async () => {
    if (!user || !user.jwt) return;
    
    setIsLoading(true);
    
    try {
      // Prepare filter object for API
      const filterCriteria = {
        status: filters.status?.value || 'all',
        interactionType: filters.interactionType?.value || 'all',
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
        dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : null,
        groups: filters.groups.map(g => g.value),
        includeHardBounces: filters.includeHardBounces,
        includeSoftBounces: filters.includeSoftBounces,
        minSoftBounceCount: filters.minSoftBounceCount,
        pagination: {
          page: 1,
          pageSize: 100 // Adjust as needed
        }
      };
      
      const response = await ApiService.post(
        'fairymailer/getFilteredSubscribers',
        { filters: filterCriteria },
        user.jwt
      );
      
      if (response.data && response.data.data) {
        setSubscribers(response.data.data);
        setMatchingCount(response.data.meta?.pagination?.total || response.data.data.length);
        setHasAppliedFilters(true);
      }
    } catch (error) {
      console.error('Error loading matching subscribers:', error);
      PopupText.fire({
        text: 'Error loading subscribers. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters
  const applyFilters = async () => {
    await countMatchingSubscribers();
    setHasAppliedFilters(true);
  };
  
  // Export subscribers
  const exportSubscribers = async () => {
    if (!user || !user.jwt || matchingCount === 0) return;
    
    try {
      setIsLoading(true);
      
      // Prepare filter object for API
      const filterCriteria = {
        status: filters.status?.value || 'all',
        interactionType: filters.interactionType?.value || 'all',
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
        dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : null,
        groups: filters.groups.map(g => g.value),
        includeHardBounces: filters.includeHardBounces,
        includeSoftBounces: filters.includeSoftBounces,
        minSoftBounceCount: filters.minSoftBounceCount
      };
      
      const response = await ApiService.post(
        'fairymailer/exportCleanupSubscribers',
        { filters: filterCriteria },
        user.jwt,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscribers_cleanup_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      PopupText.fire({
        text: 'Error exporting subscribers. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete subscribers
  const deleteSubscribers = async () => {
    if (!user || !user.jwt || matchingCount === 0) return;
    
    // Show confirmation dialog
    const result = await PopupText.fire({
      title: 'Delete Subscribers',
      text: `Are you sure you want to delete ${matchingCount} subscribers? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        
        // Prepare filter object for API
        const filterCriteria = {
          status: filters.status?.value || 'all',
          interactionType: filters.interactionType?.value || 'all',
          dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
          dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : null,
          groups: filters.groups.map(g => g.value),
          includeHardBounces: filters.includeHardBounces,
          includeSoftBounces: filters.includeSoftBounces,
          minSoftBounceCount: filters.minSoftBounceCount
        };
        
        const response = await ApiService.post(
          'fairymailer/deleteCleanupSubscribers',
          { filters: filterCriteria },
          user.jwt
        );
        
        if (response.data && response.data.success) {
          PopupText.fire({
            text: `Successfully deleted ${response.data.count} subscribers.`,
            icon: 'success'
          });
          
          // Reset counts and selections
          setMatchingCount(0);
          setSubscribers([]);
          setSelectedSubscribers([]);
          setHasAppliedFilters(false);
          
          // Update parent component
          if (onUpdate) onUpdate();
        }
      } catch (error) {
        console.error('Error deleting subscribers:', error);
        PopupText.fire({
          text: 'Error deleting subscribers. Please try again.',
          icon: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="subscribers-cleanup">
      <Card className="filter-card">
        <h3>Cleanup Filters</h3>
        
        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-item">
              <label>Subscriber Status</label>
              <Dropdown
                options={statusOptions}
                selectedValue={filters.status}
                onOptionSelect={(option) => handleFilterChange('status', option)}
              >
                Select Status
              </Dropdown>
            </div>
            
            <div className="filter-item">
              <label>Interaction Type</label>
              <Dropdown
                options={interactionOptions}
                selectedValue={filters.interactionType}
                onOptionSelect={(option) => handleFilterChange('interactionType', option)}
              >
                Select Interaction Type
              </Dropdown>
            </div>
            
            <div className="filter-item">
              <label>Groups</label>
              <MultipleDropdown
                placeholder="Select Groups"
                options={groupOptions || []}
                selectedValues={filters.groups}
                onOptionSelect={handleGroupSelection}
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-item">
              <label>Date From</label>
              <DatePicker
                hasMinDate={false}
                hasDefaultDate={false}
                dateFormat="d/m/Y"
                timeFormat="H:i"
                pickerType="date"
                onChange={(date) => handleFilterChange('dateFrom', date)}
                value={filters.dateFrom}
              />
            </div>
            
            <div className="filter-item">
              <label>Date To</label>
              <DatePicker
                hasMinDate={false}
                hasDefaultDate={false}
                dateFormat="d/m/Y"
                timeFormat="H:i"
                pickerType="date"
                onChange={(date) => handleFilterChange('dateTo', date)}
                value={filters.dateTo}
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-item bounce-options">
              <label>Bounce Options</label>
              <div className="bounce-checkboxes">
                <Checkbox
                  checked={filters.includeHardBounces}
                  onChange={(checked) => handleFilterChange('includeHardBounces', checked)}
                  label="Include Hard Bounces"
                />
                <Checkbox
                  checked={filters.includeSoftBounces}
                  onChange={(checked) => handleFilterChange('includeSoftBounces', checked)}
                  label="Include Soft Bounces"
                />
              </div>
              
              {filters.includeSoftBounces && (
                <div className="soft-bounce-count">
                  <label>Minimum Soft Bounce Count</label>
                  <InputText
                    type="number"
                    value={filters.minSoftBounceCount.toString()}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 0) {
                        handleFilterChange('minSoftBounceCount', value);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="filter-actions">
            <Button onClick={applyFilters} loading={isLoading}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {hasAppliedFilters && (
        <Card className="results-card">
          <div className="results-header">
            <h3>Matching Subscribers: {matchingCount}</h3>
            <div className="action-buttons">
              <Button 
                type="secondary" 
                onClick={exportSubscribers} 
                disabled={matchingCount === 0 || isLoading}
                loading={isLoading}
              >
                Export
              </Button>
              <Button 
                type="secondary" 
                onClick={deleteSubscribers}
                disabled={matchingCount === 0 || isLoading}
                loading={isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
          
          <div className="results-description">
            <p>The filters you've applied match {matchingCount} subscriber(s). Use the buttons above to export or delete these subscribers.</p>
            
            {filters.interactionType?.value === 'unopened' && (
              <p className="info-text">These subscribers have never opened any of your emails.</p>
            )}
            
            {filters.interactionType?.value === 'unclicked' && (
              <p className="info-text">These subscribers have never clicked on any links in your emails.</p>
            )}
            
            {filters.interactionType?.value === 'no_interaction' && (
              <p className="info-text">These subscribers have neither opened nor clicked on any of your emails.</p>
            )}
            
            {filters.interactionType?.value === 'bounced' && (
              <p className="info-text">
                These subscribers have had emails bounce. 
                {filters.includeHardBounces && filters.includeSoftBounces && 
                  ` Includes both hard bounces and soft bounces (${filters.minSoftBounceCount}+ occurrences).`}
                {filters.includeHardBounces && !filters.includeSoftBounces && 
                  ` Includes only hard bounces.`}
                {!filters.includeHardBounces && filters.includeSoftBounces && 
                  ` Includes only soft bounces (${filters.minSoftBounceCount}+ occurrences).`}
              </p>
            )}
          </div>
          
          {/* We could include a preview of the first few subscribers here if needed */}
        </Card>
      )}
    </div>
  );
};

export default SubscribersCleanup;