// src/components/LocationData/LocationData.jsx
import React, { useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import ButtonGroup from '../../components/ButtonGroup';
import Card from '../../components/Card';
import WorldMapComponent from '../WorldMapComponent/WorldMapComponent';

const LocationData = ({ campaign }) => {
  const [viewMode, setViewMode] = useState('map');
  const [countryData, setCountryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // In a real implementation, this would fetch data from the campaign stats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        // await ApiService.get(`fairymailer/getCampaignLocationStats?uuid=${campaign.uuid}`, user.jwt)
        
        // Generate data from campaign stats if available
        let locationData = {};
        
        if (campaign?.stats?.metadata?.countries) {
          // If your API already provides location data, use it
          locationData = campaign.stats.metadata.countries;
        } else {
          // Mock data for demonstration
          locationData = {
            'US': 80000,
            'GR': 90000,
            'FR': 50000,
            'DE': 60000,
            'GB': 45000,
            'CA': 30000,
            'AU': 25000,
            'JP': 40000,
            'BR': 35000,
            'IN': 70000,
            'CN': 85000,
            'ZA': 15000,
            'ES': 20000,
            'IT': 18000,
            'MX': 22000,
          };
        }
        
        setCountryData(locationData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading location data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [campaign]);

  // Find maximum click value for scaling
  const maxClicks = Math.max(...Object.values(countryData), 100);
  
  // Get color for a specific country based on click count
  const getCountryColor = (code) => {
    const clicks = countryData[code];
    if (!clicks) return '#FFF8EF';
    return colorScale(clicks);
  };

  // Country name mapping
  const countryNames = {
    'US': 'United States',
    'GR': 'Greece',
    'FR': 'France',
    'DE': 'Germany',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'JP': 'Japan',
    'BR': 'Brazil',
    'IN': 'India',
    'CN': 'China',
    'ZA': 'South Africa',
    'ES': 'Spain',
    'IT': 'Italy',
    'MX': 'Mexico',
  };

  // Handler for country clicks - can be used for additional functionality
  const handleCountryClick = (countryCode) => {
    if (countryData[countryCode]) {
      console.log(`${countryNames[countryCode] || countryCode}: ${countryData[countryCode].toLocaleString()} clicks`);
    }
  };

  // Define color ranges for the map
  const colorRanges = ['#FFE8DC', '#FFC3AD', '#FF9A8A', '#FF635D'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <ButtonGroup
          value={viewMode}
          options={[
            { value: 'map', label: 'Map View' },
            { value: 'table', label: 'Table View' }
          ]}
          onChange={setViewMode}
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          viewMode === 'map' ? (
            <div className="position-relative">
              {/* World Map Component */}
              <div style={{ width: '100%', height: 'auto', minHeight: '400px' }}>
                <WorldMapComponent 
                  countryData={countryData}
                  colorRanges={colorRanges}
                  onCountryClick={handleCountryClick}
                  countryNames={countryNames}
                />
              </div>
              
              {/* Legend */}
              <div className="d-flex justify-content-center mt-4">
                <div className="d-flex align-items-center mr-4">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FFE8DC', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#887D76' }}>Low (0-33%)</span>
                </div>
                <div className="d-flex align-items-center mr-4">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FFC3AD', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#887D76' }}>Medium (34-66%)</span>
                </div>
                <div className="d-flex align-items-center mr-4">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FF9A8A', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#887D76' }}>High (67-99%)</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FF635D', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#887D76' }}>Very High (100%)</span>
                </div>
              </div>
            </div>
          ) : (
            <table className="w-100" style={{ borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #DAD1C5' }}>
                  <th style={{ textAlign: 'left', padding: '8px 16px', color: '#887D76', fontWeight: 500 }}>Country</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', color: '#887D76', fontWeight: 500 }}>Clicks</th>
                  <th style={{ textAlign: 'left', padding: '8px 16px', color: '#887D76', fontWeight: 500 }}>Activity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(countryData)
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, clicks], index) => {
                    const percentage = Math.round((clicks / maxClicks) * 100);
                    return (
                      <tr key={code} style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 248, 239, 0.5)', borderRadius: '8px' }}>
                        <td style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>{countryNames[code] || code}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{clicks.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#DAD1C5', borderRadius: '3px', marginRight: '10px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  backgroundColor: colorRanges[
                                    percentage <= 33 ? 0 : 
                                    percentage <= 66 ? 1 : 
                                    percentage <= 99 ? 2 : 3
                                  ],
                                  borderRadius: '3px',
                                }}
                              ></div>
                            </div>
                            <span style={{ whiteSpace: 'nowrap', width: '40px', fontSize: '14px' }}>{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )
        )}
      </Card>
    </div>
  );
};

export default LocationData;