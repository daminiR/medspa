/**
 * Embeddable Booking Widget
 * Other websites can embed this to add booking functionality
 * 
 * Usage:
 * <script src="https://yourdomain.com/booking-widget.js"></script>
 * <div id="luxe-booking" data-clinic-id="12345"></div>
 */

(function() {
  'use strict';
  
  // Widget styles
  const styles = `
    .luxe-booking-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 20px auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .luxe-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    .luxe-body {
      padding: 20px;
      background: white;
    }
    .luxe-form-group {
      margin-bottom: 15px;
    }
    .luxe-label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #374151;
    }
    .luxe-select, .luxe-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
    }
    .luxe-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      width: 100%;
    }
    .luxe-button:hover {
      background: #5a67d8;
    }
    .luxe-time-slots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
      margin-top: 10px;
    }
    .luxe-time-slot {
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .luxe-time-slot:hover {
      border-color: #667eea;
      background: #f3f4f6;
    }
    .luxe-time-slot.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
  `;
  
  // Main widget code
  class LuxeBookingWidget {
    constructor(container) {
      this.container = container;
      this.clinicId = container.dataset.clinicId || 'default';
      this.apiUrl = container.dataset.apiUrl || 'http://localhost:3001/api/booking/public';
      this.data = null;
      this.selectedService = null;
      this.selectedProvider = null;
      this.selectedDate = null;
      this.selectedTime = null;
      
      this.init();
    }
    
    async init() {
      // Add styles
      if (!document.getElementById('luxe-widget-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'luxe-widget-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
      }
      
      // Load data
      await this.loadData();
      
      // Render widget
      this.render();
    }
    
    async loadData() {
      try {
        const response = await fetch(`${this.apiUrl}?clinicId=${this.clinicId}`);
        this.data = await response.json();
      } catch (error) {
        console.error('Failed to load booking data:', error);
        this.data = null;
      }
    }
    
    render() {
      if (!this.data) {
        this.container.innerHTML = '<div class="luxe-booking-widget">Error loading booking system</div>';
        return;
      }
      
      this.container.innerHTML = `
        <div class="luxe-booking-widget">
          <div class="luxe-header">
            <h2>Book Your Appointment</h2>
            <p>${this.data.clinic.name}</p>
          </div>
          <div class="luxe-body">
            <form id="luxe-booking-form">
              <div class="luxe-form-group">
                <label class="luxe-label">Select Service</label>
                <select class="luxe-select" id="luxe-service">
                  <option value="">Choose a service...</option>
                  ${this.data.services.map(s => `
                    <option value="${s.id}" data-duration="${s.duration}" data-price="${s.price}">
                      ${s.name} - $${s.price} (${s.duration} min)
                    </option>
                  `).join('')}
                </select>
              </div>
              
              <div class="luxe-form-group">
                <label class="luxe-label">Select Provider</label>
                <select class="luxe-select" id="luxe-provider">
                  <option value="">Choose a provider...</option>
                  ${this.data.providers.map(p => `
                    <option value="${p.id}">${p.name} - ${p.title}</option>
                  `).join('')}
                </select>
              </div>
              
              <div class="luxe-form-group">
                <label class="luxe-label">Select Date</label>
                <input type="date" class="luxe-input" id="luxe-date" 
                  min="${new Date().toISOString().split('T')[0]}"
                  max="${new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}"
                />
              </div>
              
              <div class="luxe-form-group" id="luxe-times-container" style="display: none;">
                <label class="luxe-label">Select Time</label>
                <div class="luxe-time-slots" id="luxe-time-slots"></div>
              </div>
              
              <div id="luxe-patient-info" style="display: none;">
                <h3 style="margin: 20px 0 10px;">Your Information</h3>
                <div class="luxe-form-group">
                  <label class="luxe-label">Full Name</label>
                  <input type="text" class="luxe-input" id="luxe-name" required />
                </div>
                <div class="luxe-form-group">
                  <label class="luxe-label">Email</label>
                  <input type="email" class="luxe-input" id="luxe-email" required />
                </div>
                <div class="luxe-form-group">
                  <label class="luxe-label">Phone</label>
                  <input type="tel" class="luxe-input" id="luxe-phone" required />
                </div>
                <button type="submit" class="luxe-button">Book Appointment</button>
              </div>
            </form>
            
            <div id="luxe-confirmation" style="display: none;">
              <h3>Appointment Confirmed!</h3>
              <p>Thank you for booking with us. You'll receive a confirmation email shortly.</p>
            </div>
          </div>
        </div>
      `;
      
      this.attachEventListeners();
    }
    
    attachEventListeners() {
      // Service selection
      document.getElementById('luxe-service').addEventListener('change', (e) => {
        this.selectedService = e.target.value;
        this.checkFormProgress();
      });
      
      // Provider selection
      document.getElementById('luxe-provider').addEventListener('change', (e) => {
        this.selectedProvider = e.target.value;
        this.checkFormProgress();
      });
      
      // Date selection
      document.getElementById('luxe-date').addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.loadAvailableTimes();
      });
      
      // Form submission
      document.getElementById('luxe-booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitBooking();
      });
    }
    
    checkFormProgress() {
      if (this.selectedService && this.selectedProvider) {
        document.getElementById('luxe-date').removeAttribute('disabled');
      }
    }
    
    loadAvailableTimes() {
      const timesContainer = document.getElementById('luxe-times-container');
      const slotsContainer = document.getElementById('luxe-time-slots');
      
      // Find available times for selected date
      const daySlots = this.data.availability.find(a => a.date === this.selectedDate);
      
      if (daySlots && daySlots.times.length > 0) {
        timesContainer.style.display = 'block';
        slotsContainer.innerHTML = daySlots.times.map(time => `
          <div class="luxe-time-slot" data-time="${time}">${time}</div>
        `).join('');
        
        // Add click handlers to time slots
        slotsContainer.querySelectorAll('.luxe-time-slot').forEach(slot => {
          slot.addEventListener('click', () => {
            // Remove previous selection
            slotsContainer.querySelectorAll('.luxe-time-slot').forEach(s => {
              s.classList.remove('selected');
            });
            // Add selection to clicked slot
            slot.classList.add('selected');
            this.selectedTime = slot.dataset.time;
            
            // Show patient info form
            document.getElementById('luxe-patient-info').style.display = 'block';
          });
        });
      } else {
        timesContainer.style.display = 'none';
        slotsContainer.innerHTML = '<p>No available times for this date</p>';
      }
    }
    
    async submitBooking() {
      const booking = {
        service: this.selectedService,
        provider: this.selectedProvider,
        date: this.selectedDate,
        time: this.selectedTime,
        patient: {
          name: document.getElementById('luxe-name').value,
          email: document.getElementById('luxe-email').value,
          phone: document.getElementById('luxe-phone').value,
        }
      };
      
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });
        
        const result = await response.json();
        
        if (result.success) {
          document.getElementById('luxe-booking-form').style.display = 'none';
          document.getElementById('luxe-confirmation').style.display = 'block';
        }
      } catch (error) {
        console.error('Booking failed:', error);
        alert('Booking failed. Please try again.');
      }
    }
  }
  
  // Auto-initialize widgets when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgets);
  } else {
    initializeWidgets();
  }
  
  function initializeWidgets() {
    // Find all widget containers
    const containers = document.querySelectorAll('[id^="luxe-booking"]');
    containers.forEach(container => {
      new LuxeBookingWidget(container);
    });
  }
  
  // Expose to global scope for manual initialization
  window.LuxeBookingWidget = LuxeBookingWidget;
})();