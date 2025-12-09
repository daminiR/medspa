# Capability-Based Booking System

## Overview
An advanced scheduling system that validates appointments based on practitioner certifications and equipment availability, replacing traditional tag-based systems with a more intuitive and flexible approach.

## Problem Solved
Traditional tag-based booking systems (like Jane App) mix practitioner skills with equipment availability, leading to confusion and booking failures. Our system separates these concerns for clearer business logic and better user experience.

## Key Features

### 1. Practitioner Capabilities
- **Certifications**: Track regulatory certifications (e.g., laser-certified, injector-certified)
- **Specialties**: Areas of expertise (e.g., facial-aesthetics, body-contouring)
- **Experience Levels**: Skill level per service type (beginner to expert)

### 2. Service Requirements
- **Required Capabilities**: Must-have certifications for performing the service
- **Preferred Capabilities**: Nice-to-have qualifications for optimal service
- **Required Equipment**: Specific equipment needed for the service

### 3. Shift Resources
- **Available Equipment**: Equipment accessible during specific shifts
- **Assigned Services**: Optional dedication of shifts to specific services

### 4. Intelligent Matching
- Validates practitioner capabilities against service requirements
- Checks equipment availability for the selected time slot
- Provides clear feedback on booking eligibility

## Benefits

### For Staff
- **Clear Error Messages**: "Practitioner needs laser certification" vs "Tag mismatch"
- **Administrative Override**: Ability to bypass restrictions when necessary
- **Better Scheduling**: Understand exactly why bookings can or cannot be made

### For Management
- **Regulatory Compliance**: Track and enforce certification requirements
- **Resource Optimization**: Manage expensive equipment scheduling
- **Flexibility**: Different equipment available at different times/locations

### For Business
- **Reduced Errors**: Prevent booking services with uncertified practitioners
- **Improved Efficiency**: Less time spent figuring out scheduling conflicts
- **Scalability**: Easy to add new capabilities and equipment as business grows

## Technical Implementation

### Architecture Overview
The capability system is implemented across several key components:
- **Data Models**: Extended practitioner, service, and shift interfaces
- **Matching Engine**: Core logic in `/src/utils/capabilityMatcher.ts`
- **UI Integration**: Seamless integration with appointment booking flow
- **Backward Compatibility**: Maintains support for existing tag-based data

### Data Model
```typescript
// Practitioner
{
  certifications: ['laser-certified', 'injector-certified'],
  specialties: ['facial-aesthetics'],
  experienceLevel: { 'botox': 'expert' }
}

// Service
{
  requiredCapabilities: ['injector-certified'],
  preferredCapabilities: ['experienced-injector'],
  requiredEquipment: ['injection-station']
}

// Shift
{
  availableEquipment: ['injection-station', 'CO2-laser'],
  assignedServices: ['botox', 'fillers'] // optional
}
```

### Matching Algorithm
1. Check if practitioner has all required capabilities
2. Verify shift has all required equipment
3. Determine match quality (perfect/good/basic/incompatible)
4. Provide actionable feedback

### Match Types
- **Perfect**: Has all required + preferred capabilities
- **Good**: Meets all requirements
- **Basic**: Legacy tag match or no requirements
- **Incompatible**: Missing requirements

## User Experience

### Booking Flow
1. Select service and practitioner
2. System validates capabilities and equipment
3. Clear feedback if booking cannot be made
4. Suggestions for alternative times/practitioners

### Error Messages
Instead of: "Tag mismatch on shift"
Users see: "Cannot book: Missing equipment: CO2-laser"

### Administrative Features
- Override capability restrictions when needed
- Track why overrides were used
- Audit trail for compliance

## Comparison with Tag-Based Systems

| Feature | Tag System (Jane App) | Capability System (Ours) |
|---------|----------------------|-------------------------|
| Practitioner Skills | Mixed with shift tags | Separate certifications |
| Equipment | Mixed with shift tags | Dedicated equipment list |
| Error Messages | "Tag mismatch" | Specific missing items |
| Flexibility | All or nothing | Required vs preferred |
| Business Logic | Unclear | Matches real operations |

## Future Enhancements

### Planned Features
- Visual certification badges on practitioner profiles
- Equipment availability calendar view
- Capability requirement preview when hovering services
- Bulk capability assignment tools
- Certification expiry tracking
- Equipment maintenance scheduling

### Integration Opportunities
- Training management system
- Equipment inventory tracking
- Compliance reporting
- Staff scheduling optimization

## Configuration Examples

### Aesthetic Service Setup
```javascript
{
  name: 'CO2 Laser Resurfacing',
  requiredCapabilities: ['laser-certified', 'advanced-laser'],
  requiredEquipment: ['CO2-laser', 'sterilization-unit'],
  preferredCapabilities: ['senior-technician']
}
```

### Practitioner Setup
```javascript
{
  name: 'Susan Lo',
  certifications: [
    'laser-certified',
    'advanced-laser',
    'injector-certified',
    'hydrafacial-trained'
  ],
  experienceLevel: {
    'laser-treatments': 'expert',
    'injectables': 'advanced'
  }
}
```

## Migration Guide

### From Tag-Based System
1. Map existing tags to capabilities/equipment
2. Assign capabilities to practitioners
3. Configure equipment per shift/room
4. Test with administrative override enabled
5. Remove legacy tags once validated

### Backward Compatibility
- System falls back to tag matching if no capabilities defined
- Gradual migration supported
- No disruption to existing bookings

## Best Practices

### Capability Naming
- Use lowercase with hyphens (e.g., 'laser-certified')
- Be specific about certification levels
- Group related capabilities

### Equipment Management
- List all equipment available in each room
- Update shift equipment when items move
- Include support equipment (e.g., 'sterilization-unit')

### Service Configuration
- Only add truly required capabilities
- Use preferred capabilities for quality indicators
- Keep equipment requirements minimal

## Implementation Details

### File Structure
```
src/
├── lib/
│   └── data.ts              # Capability constants and data models
├── utils/
│   └── capabilityMatcher.ts # Core matching logic
└── components/
    └── appointments/
        └── AppointmentSidebar.tsx # UI integration
```

### Key Functions
- `checkServiceCapabilityMatch()`: Main validation function
- `getAllShiftsForDate()`: Shift retrieval including templates
- `getServicesForPractitioner()`: Service filtering logic

## Support & Troubleshooting

### Common Issues
1. **"No shifts available"**: Check shift templates and equipment configuration
2. **"Missing capabilities"**: Verify practitioner certifications are set
3. **"Equipment not found"**: Ensure shift includes required equipment

### Debugging Tools
- Console logging for shift generation
- Capability match explanations
- Administrative override tracking

## Metrics & Success Indicators

### Key Metrics
- Reduction in booking errors
- Decreased time to schedule appointments
- Fewer capability-related complaints
- Administrative override usage

### ROI Indicators
- Improved staff utilization
- Better equipment usage rates
- Reduced compliance issues
- Faster onboarding for new staff

## API Reference

### Capability Constants
```typescript
export const AVAILABLE_CAPABILITIES = {
  // Certifications
  LASER_CERTIFIED: 'laser-certified',
  INJECTOR_CERTIFIED: 'injector-certified',
  ADVANCED_LASER: 'advanced-laser',
  HYDRAFACIAL_TRAINED: 'hydrafacial-trained',
  
  // Specialties
  FACIAL_AESTHETICS: 'facial-aesthetics',
  BODY_CONTOURING: 'body-contouring',
  SKIN_REJUVENATION: 'skin-rejuvenation',
  
  // Experience Levels
  EXPERIENCED_INJECTOR: 'experienced-injector',
  SENIOR_TECHNICIAN: 'senior-technician'
}
```

### Equipment Constants
```typescript
export const AVAILABLE_EQUIPMENT = {
  // Laser Equipment
  CO2_LASER: 'CO2-laser',
  ND_YAG_LASER: 'Nd-YAG-laser',
  IPL_MACHINE: 'IPL-machine',
  
  // Injection Equipment
  INJECTION_STATION: 'injection-station',
  ULTRASOUND_GUIDE: 'ultrasound-guide',
  
  // Treatment Equipment
  HYDRAFACIAL_MACHINE: 'hydrafacial-machine',
  CRYOLIPOLYSIS_UNIT: 'cryolipolysis-unit',
  RF_DEVICE: 'RF-device'
}
```

---

*Last Updated: August 2025*
*Version: 1.0*
*Status: Production Ready*