// Test file to debug time alignment
import moment from 'moment'

// Test time formatting
const testHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

console.log('Time formatting test:')
testHours.forEach(hour => {
  const time = moment().hour(hour).minute(0).format('h:mm A')
  console.log(`Hour ${hour} (24h) => ${time}`)
})

// Test shift positioning calculation
const calendarStartHour = 8
const timeSlotHeight = 60 // pixels per hour

console.log('\nShift positioning test:')
const testShift = {
  startHour: 11,
  startMinute: 0,
  endHour: 19,
  endMinute: 0
}

const topOffset = ((testShift.startHour - calendarStartHour) * 60 + testShift.startMinute) / 60 * timeSlotHeight
const duration = (testShift.endHour - testShift.startHour) * 60 + (testShift.endMinute - testShift.startMinute)
const height = (duration / 60) * timeSlotHeight

console.log(`Shift 11am-7pm:`)
console.log(`- Calendar starts at: ${calendarStartHour}am`)
console.log(`- Shift starts at: ${testShift.startHour}am`)
console.log(`- Top offset: ${topOffset}px (should be ${(11-8) * 60}px = 180px)`)
console.log(`- Height: ${height}px (should be ${(19-11) * 60}px = 480px)`)