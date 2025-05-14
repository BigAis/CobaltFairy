// src/components/WorldMapComponent/WorldMapComponent.jsx
import React, { useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import './WorldMapComponent.scss';
import { WorldMap } from 'world-svg';

const WorldMapComponent = ({ countryData = {}, colorRanges, onCountryClick, countryNames = {} }) => {
  const [maxValue, setMaxValue] = useState(100);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mapRef, setMapRef] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Extract the max value for percentage calculations
  useEffect(() => {
    if (Object.keys(countryData).length > 0) {
      setMaxValue(Math.max(...Object.values(countryData)));
    }
  }, [countryData]);

  // Create a color scale for shading countries
  const colorScale = scaleLinear()
    .domain([0, maxValue * 0.33, maxValue * 0.66, maxValue])
    .range(colorRanges || ['#FFE8DC', '#FFC3AD', '#FF9A8A', '#FF635D']);

  // This effect runs after the component mounts
  useEffect(() => {
    // We need to find and modify the SVG elements after they're rendered
    if (!mapRef) return;

    // Find the SVG element inside our map reference
    const svgElement = mapRef.querySelector('svg');
    if (!svgElement) return;

    // Find all path and polygon elements (countries)
    const countryElements = svgElement.querySelectorAll('path, polygon');
    
    // Apply colors based on data
    countryElements.forEach(element => {
      const countryCode = element.id?.toUpperCase();
      if (countryCode && countryData[countryCode]) {
        // Country has data, apply color based on value
        element.style.fill = colorScale(countryData[countryCode]);
        element.dataset.value = countryData[countryCode];
      }
      
      // Add event listeners for tooltip
      element.addEventListener('mouseenter', (e) => {
        setHoveredCountry(countryCode);
        setTooltipVisible(true);
      });
      
      element.addEventListener('mouseleave', () => {
        setHoveredCountry(null);
        setTooltipVisible(false);
      });
      
      element.addEventListener('mousemove', (e) => {
        // Get the position relative to the container
        const rect = mapRef.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setTooltipPosition({ x, y });
      });
    });
    
    // Add event listener for clicks
    if (onCountryClick) {
      svgElement.addEventListener('click', (e) => {
        // Get the target element - could be path or polygon
        let target = e.target;
        
        // Check if it's a country
        if (target.tagName === 'path' || target.tagName === 'polygon') {
          const countryCode = target.id?.toUpperCase();
          if (countryCode && countryData[countryCode]) {
            onCountryClick(countryCode);
          }
        }
      });
    }
  }, [mapRef, countryData, colorScale, onCountryClick]);

  // Function to get tooltip content
  const getTooltipContent = () => {
    if (!hoveredCountry) return null;
    
    const countryName = countryNames[hoveredCountry] || hoveredCountry;
    const clicks = countryData[hoveredCountry] || 0;
    const percentage = maxValue ? Math.round((clicks / maxValue) * 100) : 0;
    
    return (
      <div className="tooltip-content">
        <div className="tooltip-title">{countryName}</div>
        <div className="tooltip-stats">
          <div>Clicks: {clicks.toLocaleString()}</div>
          <div>Activity: {percentage}%</div>
        </div>
      </div>
    );
  };

  return (
    <div className="world-map-component">
      {/* Reference to capture the map container */}
      <div 
        ref={el => setMapRef(el)} 
        className="map-container"
      >
        {/* Use the actual WorldMap component from world-svg */}
        <WorldMap 
          landColor="#FFF8EF"
          hoverColor="#FFC3AD"
          landBorder="#DAD1C5"
          tooltipBgColor="#FFFFFF"
          tooltipTextColor="#000000"
          tooltip="off" // We'll handle tooltips ourselves
        />
      </div>
      
      {/* Custom tooltip */}
      {tooltipVisible && hoveredCountry && (
        <div 
          className="custom-tooltip"
          style={{
            top: tooltipPosition.y > 200 ? tooltipPosition.y - 80 : tooltipPosition.y + 20,
            left: tooltipPosition.x > 500 ? tooltipPosition.x - 150 : tooltipPosition.x + 10,
          }}
        >
          {getTooltipContent()}
        </div>
      )}
    </div>
  );
};

export default WorldMapComponent;