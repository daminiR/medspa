# Referral Program - Quick Start Guide

## Testing the Implementation

### 1. View Referral Card on Dashboard
```bash
# Navigate to patient mobile app
cd apps/patient-mobile

# Run the app
npm start
# or
yarn start
```

Navigate to the Dashboard tab. You should see:
- A beautiful purple gradient "Referral Program" card
- Shows total earnings and available credits
- Displays "You Get $25" + "Friend Gets $25"
- Tap to open full referral program

### 2. Access from Profile
Navigate to Profile tab > Account section
- Look for "Referral Program" menu item
- Shows earnings badge (e.g., "$75 earned")
- Has gift icon
- Tap to open full program

### 3. Explore Full Referral Program Screen
The screen includes:

**Your Referral Code:**
- Large, bold code (e.g., "SARAH25")
- Tap the copy icon to copy to clipboard
- See "Copied to clipboard!" confirmation

**Share Your Code:**
- Primary purple button opens share modal
- Quick share buttons: SMS, Email, Social

**Your Stats (4 cards):**
- Total Referrals: 7
- Pending: 2
- Successful: 5
- Earned: $125

**Milestones:**
- 5 Referrals ✅ - Extra $10 bonus (Achieved)
- 10 Referrals - Extra $25 bonus (7/10 progress)
- 25 Referrals - Free HydraFacial ($250 value)

**Referral History:**
- List of friends you've referred
- Status badges (Completed, First Visit, Signed Up, Pending)
- Earnings shown for completed referrals
- Dates displayed

**How It Works:**
- Step 1: Share your code
- Step 2: Friend signs up and books
- Step 3: Both get $25!

### 4. Test Share Modal
Tap "Share Your Code" button:

**Features:**
- See your referral code prominently displayed
- Copy code with one tap
- Choose share method:
  - SMS - Opens messages with pre-filled text
  - Email - Opens email client with template
  - WhatsApp - Opens WhatsApp with message
  - Instagram - Copies message, prompts to open Instagram
  - Facebook - Native share dialog
  - Twitter - Opens Twitter with pre-filled tweet
- Copy Link button - Copies tracking URL
- Message Preview at bottom

**Pre-filled Messages:**
All messages include:
- Your referral code
- $25 off value proposition
- Personal recommendation
- Trackable link

### 5. Test Interactions

**Pull to Refresh:**
- Pull down on referral program screen
- See loading indicator
- Data refreshes

**Copy Code:**
- Tap copy icon next to referral code
- See green checkmark
- See "Copied to clipboard!" message
- Paste in notes app to verify

**Navigation:**
- Tap back button (top left) to go back
- Tap referral card on dashboard to open program
- Tap profile menu item to open program

## Mock Data Included

The app includes realistic mock data for development:

**User Profile:**
- Code: SARAH25
- Total Referrals: 7
- Pending: 2
- Successful: 5
- Total Earnings: $125
- Available Credits: $75

**Sample Referrals:**
1. Emily Johnson - Completed ($25 earned)
2. Jessica Martinez - First Visit scheduled
3. Amanda - Signed up, not booked yet
4. Michelle - Pending (code shared)
5. Lisa - Pending (code shared)

**Milestones:**
- 5 referrals milestone achieved on Nov 15, 2024
- 10 referrals milestone at 70% (7/10)
- 25 referrals milestone locked

## Key Features to Test

### Visual Elements
- [ ] Purple gradient backgrounds
- [ ] Smooth animations on scroll
- [ ] Icon badges for different statuses
- [ ] Progress bars for milestones
- [ ] Avatar circles with initials
- [ ] Decorative sparkle icons
- [ ] Shadow effects on cards

### Interactions
- [ ] Code copy functionality
- [ ] Share button opens modal
- [ ] Modal close button works
- [ ] Each share method functions
- [ ] Pull to refresh works
- [ ] Back navigation works
- [ ] All tap targets responsive

### Content
- [ ] All text is readable
- [ ] Numbers format correctly (e.g., $125, not 125)
- [ ] Dates format nicely (e.g., "Dec 11, 2024")
- [ ] Status badges show correct colors
- [ ] Milestone progress accurate

## Expected User Flow

### New User:
1. Opens app, sees dashboard
2. Sees attractive referral card
3. Taps card, views referral program
4. Sees code "SARAH25"
5. Taps "Share Your Code"
6. Chooses SMS
7. Sends message to friend with code
8. Closes modal
9. Views "No referrals yet" in history
10. Reads "How it works" section

### Active User:
1. Opens profile
2. Sees "Referral Program - $75 earned"
3. Taps menu item
4. Views stats: 7 total, 5 successful, $125 earned
5. Sees milestone: "First 5 Referrals" achieved ✅
6. Scrolls to history
7. Sees 5 referrals with various statuses
8. Pulls to refresh for latest data
9. Taps share button
10. Shares via Instagram
11. Closes modal

## Troubleshooting

### Referral card not showing on dashboard?
- Check that `referralService.getReferralProgram()` is working
- Look for console errors
- Verify mock data is being returned

### Share methods not working?
- SMS/Email: Requires device with email/messaging apps
- Social: Requires apps installed
- Use iOS Simulator or Android Emulator with test accounts

### Navigation not working?
- Verify route exists at `/app/referrals/program.tsx`
- Check Expo Router configuration
- Look for navigation errors in console

### Styles look off?
- Check that LinearGradient is imported from 'expo-linear-gradient'
- Verify Ionicons working
- Check device screen size (tested on iPhone 14 Pro size)

## Next Steps for Backend

To connect to real API:
1. Update `referralService.ts`:
   - Replace `API_BASE_URL` with production URL
   - Add authentication tokens from auth store
   - Remove mock data fallbacks

2. Create API endpoints:
   - `GET /api/referrals/program`
   - `GET /api/referrals/history`
   - `POST /api/referrals/share`
   - `POST /api/referrals/apply`
   - `GET /api/referrals/stats`

3. Test with real data:
   - Create test referrals
   - Verify tracking works
   - Test reward application
   - Check milestone calculations

## Support

For issues or questions:
- Check console logs for errors
- Verify all files are in correct locations
- Review type definitions in `@medical-spa/types`
- Test on real device for share functionality

## Success Criteria

The implementation is successful when:
- ✅ Referral card visible on dashboard
- ✅ Profile menu includes referral program
- ✅ Full program screen loads with all sections
- ✅ Code can be copied
- ✅ Share modal opens and functions
- ✅ All share methods work (on device)
- ✅ Stats display correctly
- ✅ Milestones show progress
- ✅ History lists referrals
- ✅ Animations smooth
- ✅ No console errors
- ✅ Navigation works both ways

Enjoy your new referral program system!
