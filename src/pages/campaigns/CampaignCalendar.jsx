import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import './CampaignCalendar.scss';

const CampaignCalendar = ({ campaigns, selectedCampaignType, onCampaignClick }) => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      // Filter out draft campaigns that don't have a date
      const filteredCampaigns = campaigns.filter(campaign => {
        // Only include campaigns with dates
        if (selectedCampaignType === 'sent' && campaign.sent_at) {
          return true;
        } else if (selectedCampaignType === 'outbox' && campaign.date) {
          return true;
        }
        return false;
      });
      
      // Transform campaigns to calendar events
      const formattedEvents = filteredCampaigns.map(campaign => {
        // Determine the date for the event
        let eventDate;
        
        if (selectedCampaignType === 'sent' && campaign.sent_at) {
          eventDate = campaign.sent_at;
        } else if (selectedCampaignType === 'outbox' && campaign.date) {
          eventDate = campaign.date;
        } else {
          // Fallback to created date
          eventDate = campaign.createdAt || new Date();
        }
        
        // Determine color based on campaign type
        let color;
        if (campaign.status === 'sent') {
          color = '#FFCEB5'; // Lighter color for sent campaigns (swapped)
        } else if (campaign.status === 'draft' && campaign.date) {
          color = '#FF635D'; // Primary color for scheduled/outbox campaigns (swapped)
        }
        
        return {
          id: campaign.uuid,
          title: campaign.name,
          start: eventDate,
          color: color,
          textColor: '#100F1C', // Dark text for better readability
          extendedProps: {
            campaign: campaign,
            type: selectedCampaignType
          }
        };
      });
      
      setEvents(formattedEvents);
    } else {
      setEvents([]);
    }
  }, [campaigns, selectedCampaignType]);
  
  const handleEventClick = (info) => {
    if (onCampaignClick) {
      onCampaignClick(info.event.extendedProps.campaign);
    }
  };
  
  const renderEventContent = (eventInfo) => {
    const campaign = eventInfo.event.extendedProps.campaign;
    
    return (
      <div className="campaign-event-content">
        <div className="campaign-event-title">{eventInfo.event.title}</div>
        <div className="campaign-event-details">
          {campaign.subject && (
            <div className="campaign-event-subject" title={campaign.subject}>
              {campaign.subject.length > 30 ? campaign.subject.substring(0, 27) + '...' : campaign.subject}
            </div>
          )}
          
          {selectedCampaignType === 'outbox' && campaign.date && (
            <div className="campaign-event-time">
              {dayjs(campaign.date).format('HH:mm')}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="campaign-calendar">
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#FFCEB5'}}></div>
          <span>Sent</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#FF635D'}}></div>
          <span>Outbox</span>
        </div>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="auto"
        contentHeight="auto"
        dayMaxEvents={3}
        moreLinkClick="popover"
      />
    </div>
  );
};

export default CampaignCalendar;