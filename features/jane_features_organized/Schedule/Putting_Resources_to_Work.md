# Putting Resources to Work

*Source: [https://jane.app/guide/putting-resources-to-work](https://jane.app/guide/putting-resources-to-work)*

*Category: Schedule*

*Scraped: 2025-08-07 00:20:18*

---

Features
Online Booking
Custom-branded, client-friendly online booking
Payments
Online and in-person PCI-compliant payments
Reporting & Analytics
Custom reporting and real-time business insights
Staff & Appointment Scheduling
Manage services, rooms and resources with multi-location support
Online Appointments
HIPAA, PIPEDA and GDPR-compliant telehealth for 1 - 12 clients
Support & Training
Unlimited, award-winning phone, email and chat support — with free data migrations
Charting
Custom forms, charts, SOAP notes, and 1000+ templates
Billing & Insurance
Manage and track cash or insurance-based billing
Security
Fully compliant with remote data storage and 99.9% uptime
More from Jane
Jane Payments
Come see how Jane can help you get paid
Integrations
Discover more options with integrations
Websites
Flexible website builder for healthcare practitioners
Feature OverviewPutting Resources to Work
Schedule
Putting Resources to Work
28 min read
Thrive Plan
📣
Please note that Resources are a part of our Thrive Plan. For more info on the different plan options in Jane, check out our
Pricing Page
.
We’ve put together this handy guide to share some examples of ways you can use our
Resources
feature to manage your Online Booking availability. We hope these examples help you understand how this feature works.
👩‍🏫 Just a friendly reminder that Resources is a complex feature so this guide is a longer read. We’d recommend grabbing a refreshment and setting aside some time to really dive in as we explore Resources together.
To use Resources, a Full Access user will need to enable advanced scheduling features. Head to
Settings > Schedule Settings
to check on
Advanced Scheduling
and
Save
.
We’d also recommend checking out our guide on
Resource booking - Working with limited resources
to learn more about Resources as a feature before we jump into scenarios.
Scenario One - Rooms are a Resource
Scenario Two - Practitioner is the Resource
Scenario Three - Both Rooms and the practitioner are a Resource
Scenario Four - Rooms, the practitioner, and a piece of equipment are a Resource
Scenario Five - Rooms, multiple practitioners, and a piece of equipment are a Resource
Scenario One - Rooms are a Resource
You have shared rooms that are booked on a first come first served basis.
In our example scenario, we have three rooms shared by our RMTs, Amy and Susan.
Here is how your Resources would be set up:
One Resource Pool for your different rooms
In our example, we called this “Treatment Rooms”
Each available room would be a Resource within that Resource Pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” goes in the “Treatment Rooms” Resource Pool and so on….
Here is how your appointments would be set up:
Each treatment will need
1 required
Resource from the Resource Pool
For regular RMT appointments:
📍 When booking appointments administratively, staff can select a specific room from the Resource Pool; however, when appointments are booked online Jane will randomly select the first available room as the Resource for that appointment.
🔥 Hot Tip: If you’d like to see what practitioner is booked into what room for their appointment, you can head to your schedule and use the
Resources
button to view the schedule for each Resource.
🔝
Skip back to top
Scenario Two - Practitioner is the Resource
You have a practitioner who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types.
In our example scenario, we are working with a chiropractor, Marcus, who can see three clients at a time for subsequent appointments but only one client at a time for initial appointments
.
❗️Before we jump into this scenario, since you are working with a practitioner who can potentially see multiple clients at once, you’ll want to make sure you use our Rooms feature to create multiple Shifts within that practitioner’s schedule. We recommend using the
Manage Shifts
function covered in our
Setting Up Shifts
guide coupled with the
Room Booking
guide.
Here is how your Resources would be set up:
One Resource Pool for your practitioner
In our example, we called this “Marcus”
Within that Resource Pool, you would create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we will create three practitioner Resources for our Resource Pool
❗️ Something to keep in mind as you set up this scenario is that you will need to create your practitioner Resource appointments so that they are assigned to a specific staff member if there is more than one staff member opted into this discipline, rather than using a No Staff Member (Shared Treatment). This is so that one practitioner is not affected by the Resource availability of another practitioner within that same discipline.
❗️Since you are now working with appointments that are assigned to specific staff members, you’ll want to make sure that
Book by Staff Member
in your
Settings > Online Booking
is enabled so that your patients are able to book staff specific appointments.
Here is how your appointments would be set up:
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit for example, would be set to need
All Required
Resources from the Resource Pool
For subsequent chiropractic appointments where Marcus can see up to three clients at once:
For initial chiropractic appointments where Marcus can only see one client at a time:
In our example, when we go to book Marcus’ Subsequent Treatment, we can see that Jane requires only one of our Resources from the “Marcus” Resource Pool:
However, when we go to book Marcus’ Initial Treatment & Assessment, we can see that Jane requires all three of the Resources from the “Marcus” Resource Pool:
🔥 Hot Tip #1: We always recommend using the
Magnifying Glass
🔎 as a quick and easy way to check your work and how it reflects on your Online Booking Site.
In our example, when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Subsequent Treatment, we can see that clients can book into any available time slots where an Initial Assessment And Treatment is not booked:
However, when we use the Magnifying Glass to check the availability for Marcus’ Initial Assessment And Treatment, we can see that clients can only book into an available time slot where no other appointments are booked:
🔥 Hot Tip #2: If you would prefer your appointments start at staggering times, check out Scenario 1 in our
Staggered Booking Set Up (Multiple Rooms or Clients Overlapping)
guide for info on how to enable Stagger Online Bookings.
🔝
Skip back to top
Scenario Three - Both Rooms and the Practitioner are a Resource
You have multiple rooms which are booked on a first come first serve basis. You also have a practitioner who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types.
📍Scenario three is a mix of scenario one and scenario two together. Feel free to check out both scenario one and scenario two for hot tips (marked with a  🔥) and additional notes (marked with a ❗️) on this scenario.
In this example scenario, we are working with RMTs, Amy and Susan, and a chiropractor, Marcus, who require a room for their appointments. Our chiropractor can see three clients at a time for subsequent appointments but only one client at a time for initial appointments
.
Here is how your Resources would be set up:
Two Resource Pools are needed
One Resource Pool for your Rooms
In our example, we called this “Treatment Rooms”
One Resource Pool for your Practitioner
In our example, we called this “Marcus”
When setting up the Resource Pool for your rooms, each available room will be its own resource within that pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” opted into the “Treatment Rooms” Resource Pool and so on….
When setting up the Resource Pool for your practitioner, you will create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we have created three Resources for Marcus: so “Marcus 1” opted into the “Marcus” Resource Pool and so on…
Here is how your appointments would be set up:
Each appointment type would be set to need
1 required
Resource from the room Resource Pool
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
practitioner Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit for example, would be set to need
All Required
practitioner Resources from the Resource Pool
For regular RMT appointments:
For subsequent chiropractic appointments where Marcus can see up to three clients at once:
For initial chiropractic appointments where Marcus can only see one client at a time:
In our example, when we go to book a regular 30 Minute Massage appointment, we can see that Jane requires only one of our room Resources from the “Treatment Rooms” Resource Pool because our RMT, Amy, can only ever see one client at a time (so we have not created nor are we using a practitioner Resource Pool for Amy):
However, when we go to book Marcus’ Subsequent Treatment, we can see that Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool AND one of the practitioner Resources from the “Marcus” Resource Pool because Marcus needs a room for his appointment and he can see multiple clients at once for his subsequent appointments:
🔥 As we did in scenario two, let’s use our handy Magnifying Glass 🔎 to check our work in the schedule:
Notice how when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Subsequent Treatment, we can see that Jane isn’t offering the 10:30 AM slot in Marcus’ schedule even though he could technically take a third client at that time. This is because there is no room availability since Susan and Amy, our RMTs, are already using Room 3 at that time:
🔝
Skip back to top
Scenario Four - Rooms, the practitioner, and a piece of equipment are a Resource
You have multiple rooms booked on a first come first serve basis, a practitioner who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types, and a piece of equipment shared among the clinic.
📍Scenario four is a mix of scenario one and scenario two with an added Resource for a shared piece of equipment among the clinic. Feel free to check out both scenario one and scenario two for hot tips (marked with a  🔥) and additional notes (marked with a ❗️) on this scenario.
In this example scenario, we are working with RMTs, Amy and Susan, a chiropractor, Marcus, and a physiotherapist, Jonathan, who require a room for their appointments. Our chiropractor can see three clients at a time for subsequent appointments but only one client at a time for initial appointments
.
Both our chiropractor and our physiotherapist require X-ray equipment for their initial appointments.
Here is how your Resources would be set up:
Three Resource Pools are needed
One Resource Pool for your Rooms
In our example, we called this “Treatment Rooms”
One Resource Pool for your Practitioner
In our example, we called this “Marcus”
One Resource Pool for your piece of equipment
In our example, we called this “X-Ray”
When setting up the Resource Pool for your rooms, each available room will be a Resource within that pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” opted into the “Treatment Rooms” Resource Pool and so on….
When setting up the Resource Pool for your practitioner, you will create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we have created three Resources for Marcus: so “Marcus 1” opted into the “Marcus” Resource Pool and so on…
When setting up the Resource Pool for your piece of equipment, the equipment will be a Resource within that pool
In our example, we only have one X-Ray in the clinic which is shared among the clinic so we created one Resource for it within its own Resource Pool: so “X-Ray” opted into the “X-Ray” Resource Pool
Here is how your appointments would be set up:
Each appointment type would be set to need
1 required
Resource from the room Resource Pool
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
practitioner Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit, for example, would be set to need
All Required
practitioner Resources from the Resource Pool
Appointment types that require your piece of equipment, an initial visit for example, would be set to need
1 Required
equipment Resource from the Resource Pool
For regular RMT appointments:
For initial physiotherapy appointments that require our x-ray equipment:
For subsequent chiropractic appointments where Marcus can see up to three clients at once and does not need the x-ray equipment:
For initial chiropractic appointments where Marcus can only see one client at a time and requires the x-ray equipment:
In our example, when we go to book a regular 60 Minute Massage appointment, we can see that Jane requires only one of our room Resources from the “Treatment Rooms” Resource Pool because our RMT, Amy, can only ever see one client at a time (so we have not created nor are we using a practitioner Resource Pool for Amy) nor does she require the x-ray Resource from the “X-Ray” Resource Pool:
Then when we book a physiotherapy Initial Assessment & Treatment, Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool and our x-ray Resource from our “X-Ray” Resource Pool. However, since our physiotherapist, Jonathan, can only ever see one client at a time we have not created or used a practitioner Resource Pool for these appointments:
Lastly, when we book Marcus’ Initial Assessment & Treatment, Jane requiresone of our room Resources from the “Treatment Rooms” Resource Pool, three of the practitioner Resources from the “Marcus” Resource Pool, and also the x-ray Resource from the “X-Ray”  Resource Pool because Marcus needs a room for his appointment, he can only see one client at a time for his initial appointments, and he requires the x-ray for those initial appointments:
🔥 As we did in scenarios two and three, let’s use our handy Magnifying Glass 🔎 to check our work in the schedule:
Notice how when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Initial Assessment And Treatment, we can see that Jane isn’t offering the 10:30 AM slot in Marcus’ schedule even though he doesn’t have any clients booked at that time and Room 3 is available. This is because the x-ray is not available since it is being used by Jonathan, our physiotherapist, at that time:
🔝
Skip back to top
Scenario Five - Rooms, multiple practitioners, and a piece of equipment are a Resource
You have multiple rooms booked on a first come first serve basis, multiple practitioners who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types, and a piece of equipment shared among the clinic.
📍Scenario five is a mix of scenario one and scenario two with a second practitioner Resource and an added Resource for a shared piece of equipment among the clinic. Feel free to check out both scenario one and scenario two for hot tips (marked with a  🔥) and additional notes (marked with a ❗️) on this scenario.
In this example scenario, we are working with RMTs, Amy and Susan, and two chiropractors, Marcus and Frank, who require a room for their appointments. Our chiropractor, Marcus, can see three clients at a time for subsequent appointments but only one client at a time for initial appointments. Our chiropractor, Frank, can see two clients at a time for subsequent appointments but only one client at a time for initial appointments. Both chiropractors require X-ray equipment for their initial appointments.
Here is how your Resources would be set up:
Four Resource Pools are needed
One Resource Pool for your Rooms
In our example, we called this “Treatment Rooms”
One Resource Pool for your first Practitioner
In our example, we called this “Marcus”
One Resource Pool for your second Practitioner
In our example, we called this “Frank”
One Resource Pool for your piece of equipment
In our example, we called this “X-Ray”
When setting up the Resource Pool for your rooms, each available room will be a Resource within that pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” opted into the “Treatment Rooms” Resource Pool and so on….
When setting up the Resource Pool for each of your practitioners, you will create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we have created three Resources for Marcus: so “Marcus 1” opted into the “Marcus” Resource Pool and so on…
However, because our chiropractor, Frank, can only see up to two clients at a time for subsequent appointments, we have created two Resources for Frank: so “Frank 1” opted into the “Frank” Resource Pool and so on…
When setting up the Resource Pool for your piece of equipment, the equipment will be a Resource within that pool
In our example, we only have one X-Ray in the clinic which is shared among the clinic so we created one Resource for it within its own Resource Pool: so “X-Ray” opted into the “X-Ray” Resource Pool
❗️ Something to keep in mind as you set up this scenario is that you will need to create your practitioner Resource dependant appointments so that they are assigned to a specific staff member. This is so that one practitioner is not affected by the Resource availability of another practitioner within that same discipline.
In our example, this would be the appointments for Marcus and Frank. Both Marcus and Frank would require their own set of appointments which are assigned to them directly. This way, when we set up Marcus’ appointments, we can specify how many of the “Marcus” Resources are needed for each appointment and the same would go for setting up Frank’s appointments with the “Frank” Resources.
❗️Since you are now working with appointments that are assigned to specific staff members, you’ll want to make sure that
Book by Staff Member
in your
Settings > Online Booking
is enabled so that your patients are able to book staff specific appointments.
Here is how your appointments would be set up:
Each appointment type would be set to need
1 required
Resource from the room Resource Pool
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
practitioner Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit for example, would be set to need
All Required
practitioner Resources from the Resource Pool
Appointment types that require your piece of equipment, an initial visit for example, would be set to need
1 Required
equipment Resource from the Resource Pool
For regular RMT appointments:
For initial chiropractic appointments with Marcus that require our x-ray equipment:
For subsequent chiropractic appointments with Marcus where Marcus can see up to three clients at once and does not need the x-ray equipment:
For initial chiropractic appointments with Frank that require our x-ray equipment:
For subsequent chiropractic appointments with Frank where Frank can see up to two clients at once and does not need the x-ray equipment:
In our example, when we book a regular 60 Minute Massage appointment, Jane requires only one of our room Resources from the “Treatment Rooms” Resource Pool because our RMT, Amy, can only ever see one client at a time (so we have not created nor are we using a practitioner Resource Pool for Amy) nor does she require the x-ray Resource from the “X-Ray” Resource Pool:
Then, when we book Marcus’ Initial Assessment & Treatment, Jane  requires one of our room Resources from the “Treatment Rooms” Resource Pool, three of the practitioner Resources from the “Marcus” Resource Pool, and also the x-ray Resource from the “X-Ray”  Resource Pool because Marcus needs a room for his appointment, he can only see one client at a time for his initial appointments, and he requires the x-ray for those initial appointments:
Next, when we book Frank’s Initial Assessment & Treatment, Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool, two of the practitioner Resources from the “Frank” Resource Pool, and also the x-ray Resource from the “X-Ray”  Resource Pool because Frank needs a room for his appointment, he can only see one client at a time for his initial appointments, and he requires the x-ray for those initial appointments:
Lastly, when we book either of the chiropractor’s Subsequent Treatment, Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool and one of the practitioner Resources from either the “Marcus” or the “Frank” Resource Pool because each chiropractor needs a room for their appointment, they can see multiple clients at a time for their subsequent appointments, and they don’t require the x-ray Resource from the “X-Ray” Resource Pool for their subsequent appointments:
🔥 As we did in scenarios two, three, and four, let’s use our handy Magnifying Glass 🔎 to check our work in the schedule:
Notice how when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Initial Assessment And Treatment, we can see that Jane is offering the 11:15 AM slot as the next available appointment. This is because Jane is scanning the schedule for all three of the practitioner Resources from the “Marcus” Resource Pool, one of the room Resources from the “Treatment Rooms” Resource Pool, and the x-ray equipment from the “X-Ray” Resource Pool:
🔝
Skip back to top
There you have it friends! 🤩 Those are a few common scenarios we see Resources used for and we hope these help you get a better understanding of how this amazing feature can help you manage your scheduling.
That being said, if your scenario doesn’t match one of those outlined above, or even if you’d just like a helping hand with your setup, we’d be happy to chat with you. Feel free to check out our
Contact Us
page if you’d like.
We’ll also plug our
Resource booking - Working with limited resources
and
Resource FAQ & Troubleshooting
guides for you in case you’d like to pop into those.
We would really appreciate any feedback you may have regarding Resources as a feature or this example scenarios guide. If you’d like to leave your feedback about the Resources feature, please feel free to pop into our
Feature Request
page. If you have suggestions on how this guide could be more helpful, we’d love it if you could
reach out and let us know
.
Subscribe to our monthly newsletter.
Welcome
Welcome to the Jane Guide
Code of Conduct
Feature Requests
Jane's Brand Assets
Account Setup Consultations
What's new in Jane?
What's new in Jane Webinar
Jane's Changelog
Jane's Monthly Newsletter
Updates to Interchange Fees for Visa & Mastercard in Canada 🇨🇦
Howard Spector joins Jane!
Jane Appoints Dan Davidow as Chief Marketing Officer
Jane App's Support Team Wins a Bronze Stevie® Award
Demo Videos
Practitioner's Home Base: Day Sheets & Charts
Jane in Action
Practitioner Training:  Initial Signing In and Overview
Insurance: Billing a Visit to a 3rd Party
Scheduling: Managing the Schedule with Many Practitioners
Disciplines, Treatments, & Billing Settings
Setting up Staff & Scheduling Shifts
Charting: Signing, Duplicating & Symbols
Scheduling: Complete Schedule Overview
Billing: Accepting Payments
Launching an Insurer Portal
Quick Start
Step 1: Clinic Information
Step 2: Disciplines
Step 3: Treatments
Step 4: Staff
Step 5: Schedule or Diary
Additional Set Up Recommendations
Practitioner Step 1: Practitioner Training
Practitioner Step 2: Treatments
Practitioner Step 3: Shifts
Practitioner Step 4: Online Booking
Practitioner Step 5: Charting
Account Setup Consultations
Switching to Jane
Switching is easy with Jane on your team
Jane vs. SimplePractice
Account Basics
How To Check Who's Listed As Account Owner
Checklist for Starting with Jane
Browser Requirements
Device & Network Recommendations
Using Jane on a Tablet
Using Jane on a Smartphone
Keyboard Shortcuts
Auto-Logout Duration
Updating Your Clinic Email Address & Phone Number
Log In Help: Username and Password
Enabling Patient Self Check-in
Adding a Location
Booking  a Break on a Mobile Device (Phone or other Small Screen)
Moving Your Practice to a New Location
Multiple Locations or Multiple Accounts: How to Set Up Jane for Independent Locations or Practitioners
Accessibility in Jane
I Can't Access My Jane Account: A Troubleshooting Guide
How to Archive a Treatment, Class or Group Appointment
Bookmarking Your Jane Account for Easy Access
Viewing Protected Financial Documents (For Patients)
Switching to the Balance Plan
Adding a Billing Address for Locations
Unauthorized Access: What to Do if Your Laptop/Phone is Lost or Stolen
How to Archive/Unarchive a Discipline
How to Change the Name of Your Clinic
Importing to Jane
How to Import Data to Jane (Overview)
Basics of Importing to Jane
Diving Deeper Into Importing to Jane
Where Can You Import From? Our Software Import Guides
Reviewing Import Data
After Your Import: What to Expect!
Post Import FAQs
Teleplan Transition
Transitioning Your Patient Credits/Receivables to Jane
Jane to Jane Chart Transfer (Data Transfers) - FAQs
Reassigning Appointments (Updating All Imported Appointments At Once)
Updating an Imported Appointment Individually
Time Zones, Big Data and Your Import
Jane to Jane Chart Transfer (Data Transfers)
How to Create a Zip File
Manual Chart Transfers: Transferring Selected Charts to Another Jane Account
Importing from Jane
Importing Other Types of Data Alongside a Jane-to-Jane Chart Transfer (Data Transfer)
Subset (Manual) Chart Transfer Authorization Form Explainer
Importing from Other Software
Importing from Abelmed
Importing from Accuro
Importing from Acuity
Importing from Acusimple
Importing from Aesthetic Record
Importing from AppointmentPlus (DaySmart)
Importing from Atlas Chiropractic Software
Importing from Booker
Importing from Cerbo
Importing from Charm EHR
Importing from ChiroFusion
Importing from Chirosoft
Importing from ChiroSpring
Importing from ChiroSuite
Importing from ChiroTouch
Importing from ChiroTouch (Cloud Version)
Importing from Click4Time
Importing from ClientTracker (Gingko Software)
Importing from Clinic Essentials Backup
Importing from ClinicMaster (Cloud version)
Importing from Clinicmaster (Desktop Version)
Importing from ClinicND
Importing from Cliniko
Importing from ClinicSense
Importing from CounSol.com
Importing from DrChrono EHR
Importing from Eclipse
Importing from E-Z Bis
Importing from EZFacility
Importing from Full Slate
Importing from Fresha
Importing from Booksy (Previously Genbook)
Importing from Google Calendar/Contacts
Importing from Healthquest by Microquest
Importing from Innocare (Previously Clinic Server)
Importing from IntakeQ
Importing from Insight
Importing from Juvonno
Importing from MacPractice
Importing from massagebook
Importing from mBiz
Importing from Mindbody
Importing from Practice Jewel/mindZplay
Importing from Medexa
Importing from MRX
Importing from My Client Schedule
Importing from NexySoft
Importing from Noterro
Importing from NousTalk
Importing from OCA Aspire
Importing from Office Ally
Importing from OptimisPT
Importing from Orchestra One (formerly AirCare)
Importing from Owl Practice
Importing from Platinum Chiropractic Software
Importing from Power Diary (Zanda)
Importing from PMP
Importing from PPS/PPS Express (Rushcliff Software)
Importing from Practice Better
Importing from Practice Fusion
Importing from PracticeHub
Importing from Practice Perfect
Importing from Prompt Health
Importing from PTEverywhere
Importing from QuickBooks
Importing from Schedulicity
Importing from Schedulista
Importing from Setmore
EMR data migration: How to import data from SimplePractice
Importing from SimplyBook.me
Importing from SmartND (Outsmart EMR)
Importing from Square
Importing from Tebra
Importing from TheraLink
Importing from Ensora Health (formerly TheraNest)
Importing From TherapyNotes
Importing from Timely
Importing from TM2/TM3
Importing from Unified Practice
Importing from Universal Office/Antibex Software
Importing from Vagaro
Importing from WebPT
Importing from WellnessLiving
Importing from Wix
Importing from Wolf EMR (Telus)
Importing from Write Upp
Importing from Zenoti
Front-Desk Training
Chapter 1: Schedule
Chapter 2: Appointments
Chapter 3: Payments
Chapter 4: Charting
Chapter 5: Patient Experience
Chapter 6: 🇨🇦 Canadian insurance
Chapter 6: 🇺🇸 US insurance
Chapter 7: Happy Dance
🇨🇦 Canadian Insurance Mini-Course
Practitioner Training
Lesson 1: Schedule
Lesson 2: Charting Basics
Lesson 3: Charting Tips & Tricks
Lesson 4: Charting Privacy & Changes
Lesson 5: Patient Experience
Lesson 6: Online Booking
Lesson 7: 🇺🇸 US insurance
Lesson 7: 🇨🇦 Canadian insurance
Lesson 8: Happy Dance
The Practitioner Dashboard for Clinic Owners
Using Jane’s Demo Clinic
Schedule
Adding a Location
Edit Individual Shifts
Setting Up Shifts
Booking, Changing or Moving an Appointment (Staff)
​Booking a Break, Vacation and Holidays on Your Schedule
Class Booking
Couples or Related Groups - Booking, Billing, Charting and Notifications
Deleting a Class or Group Appointment
Keyboard Shortcuts
Late Cancellations
Online Booking: Checking What is Offered Using the Magnifying Glass
Online Booking: Choosing What Is Offered Online
Patient Arrivals & No Shows
Patient Privacy and Privacy Mode
Print Daysheet
Re-Booking Appointments
Recurring Appointments
Reordering Treatments, Disciplines and Staff Members (Admin Schedule and Online Booking)
Resource Booking - Working With Limited Resources
Room Booking
Self Check In (For Patients)
Setting a Post Treatment Reset Time or Break
Setting the Schedule Grid
Setting up Treatments
Staggered Booking Set Up (Multiple Rooms or Clients Overlapping)
Special Notes
Subscribing to Your Calendar (for Staff)
Tags – Limiting Treatment Availability
Using the Wait List
Who was Cancelled/Deleted from the Schedule?
Working With the Schedule or Diary
Schedule Opening & Closing Time
Cancel or Delete an Appointment from the Schedule
Staff Member not Showing up on Schedule
Directing New Clients to Book an Initial Visit Only
Removing a Location
Contact to Book
Accessibility in Jane
How to Hide Your Location from Your Online Booking Site
Setting Up Shifts FAQ
Allow Post-Treatment Time After Shift Ends
Prevent Staff from Booking Outside of Shifts
Administrative Double Booking
Changing the Length of a Scheduled Appointment
Putting Tags to Work
Group Appointments
Group Appointments: Client Experience
How to Book Services or Resources Without a Staff Member
Chapter 1: Schedule
Icons on the Schedule
Save Space on Your Screen by Minimizing Weekends
Booking  a Break on a Mobile Device (Phone or other Small Screen)
Medical Aesthetics Hub
How to View the Booking History of an Appointment
Putting Resources to Work
Resource FAQ & Troubleshooting
Editing an Appointment Marked as 'Arrived'
Schedule View Settings
Online Booking
Online Booking: Choosing What Is Offered Online
Setting up Online Booking like a Boss
Adding "Book Online" Buttons to Your Website
Booking an Appointment Online (For Patients)
Cancellation Policy
Enabling Patient Self Check-in
Family Profiles - Managing Family Members (For Patients)
Family Profiles - Managing Family Members from the Patient Profile
Family Profiles - Online Booking & Intake Forms
Family Profiles - Payments with Shared Credit Cards
Google Analytics
Link Online Booking to Instagram
Not Accepting New Patients - Return Clients Only
Online Booking: Checking What is Offered Using the Magnifying Glass
Only Allow Approved Online Booking
Turning on Online Booking and Setting up Different Permissions
Online Rolling Availability
Reordering Treatments, Disciplines and Staff Members (Admin Schedule and Online Booking)
Self Check In (For Patients)
Save Space on Your Screen by Minimizing Weekends
Tags – Limiting Treatment Availability
Online Booking Pre-Payments
Notice / Message on Online Booking Pages (for Announcements or Instructions)
Directing New Clients to Book an Initial Visit Only
Contact to Book
How to Hide Your Location from Your Online Booking Site
Customizing Your Online Booking, My Account & Email Branding
Putting Tags to Work
Working with Patients across Time Zones
How to Disable Online Booking
Behavioral Health Hub
Mobile Services Hub
Reserve with Google
Customizing Your Online Booking Background
Patient's Preferred Time Zone
Online Double Booking
Booking Multiple Appointments: Client Experience
How to Change (and Find!) Your Online Booking Website Address (URL)
Tips for Simplifying Online Booking for New Clients
Limiting the Number of Appointments that Patients Can Book Online
Working with Patients in Different Timezones Hub
Jane's Mobile App for Clients: Signing in and Troubleshooting
Online Booking Grace Period
Jane's Mobile App for Clients
Jane's Mobile App for Clients (Guide for Clinics)
Understanding "Booked" vs "No Availability" on Your Online Booking Site
Online Booking: Individual Staff Preference
Online Booking Availability for 1:1 and Group Online Appointments
Jane's Mobile App for Clients
Jane's Mobile App for Clients: Signing in and Troubleshooting
Jane's Mobile App for Clients
Jane's Mobile App for Clients (Guide for Clinics)
A Message From Ali on Jane's Mobile App for Clients
Online Appointments (Telehealth)
Getting Started with Online Appointments
Privacy & Security for Online Appointments
Online Appointments for Groups FAQ
Turning on Virtual Backgrounds for Online Appointments
How to Join Your Online Appointment (For Clients)
Behavioral Health Hub
Weighing the Benefits of Telehealth: Questions and Considerations
Online Appointments FAQ
Setting up Online Appointments
Online Appointments for Groups
How to Join Your Online Appointment (For Practitioners)
Joining an Online Appointment in Jane's Mobile App
Online Appointments: A Troubleshooting Guide (Mobile Device on a Browser)
AI Scribe
AI Scribe: Getting Started
AI Scribe: Sample Prompts
AI Scribe: Working with Recordings
AI Scribe: FAQ and Troubleshooting
Jane's AI Principles
Charting
Adding a Signature to Charts & Invoices/Receipts
Use Phrases For Faster Charting
Appointment Charting Status
Chart Parts for Creating a Chart Template
Chart Template Library
Charting for a Past Date
Charting New Territory: Tips for Switching to Electronic Charts
Charting Privacy Options
Consent for Assessment/Treatment of Sensitive Areas
Couples or Related Groups - Booking, Billing, Charting and Notifications
Chart Templates: Creating, Editing and Deleting a Template
Deleting, Moving or Changing a Chart
Files Area in Chart
Exporting Chart Notes (Print or PDF)
Adding CPT & Diagnosis Codes to Charts (US)
Adding Billing & Diagnosis Codes to Charts on the Base Plan
Keyboard Shortcuts
Letters in Jane
Photos in Chart Notes/Documentation
How to add a Medical Alert, Pin or Star your Chart Entries
Prescriptions
Print to PDF
Printing or Sharing Chart Entries (Treatment Plans)
Scanning and Uploading to Jane Charts
Sign & Lock Charts
Day View: Sign and Lock Workflow
Supervisor Sign Off (Manual Workflow)
Switching from Paper Charts to Electronic Charts
Uploads for Review - Labs, X-Rays and Other Reporting
Customizing Your Chart Footer
Making a Chart Amendment
Smart Options & Narrative for Charting
Help! I accidentally archived a draft chart entry.
Sharing Patient Charts with a Third Party
The chart entry is complete, so why isn't the lock showing?
Batch Chart Export for Practitioners
Creating a Narrative Chart
Formatting Chart Entries
Charting for Classes and Group Appointments
Tips for Charting During Your Online Appointment
Outcome Measure Surveys
Clinical Surveys
Treatment Plans
How to Face Chart
Supervision
Client Aftercare Information
AI Scribe: Getting Started
Medical Aesthetics Hub
Mobile Services Hub
AI Scribe: Sample Prompts
Charting on a Mobile Device (Tablet or Smartphone)
AI Scribe: FAQ and Troubleshooting
AI Scribe: Working with Recordings
Billing
Add Upcoming Appointments to the Bottom of Printed and Emailed Receipts
Adjusting Invoice Dates
Applying Patient Credit to a Specific Invoice
Assigning Product/Inventory to Staff
Billing for Per Unit (Mileage, Botox, Materials Used, Reporting etc.)
Discounts and Price Adjustments
Changing Payment Method
Creating a Credit Memo (Patient Credit when No Payment Received)
Creating or Deleting a New Payment Method
Creating a Patient Credit
Creating a Product
Credits and Owings - Investigating
Customize Patient Invoice Details
Delete a Patient Payment (Taken or Applied in Error)
Editing an Invoice with Payment Already Applied
How to Customize Receipts
How to Manually Override an Invoice
Increasing Your Fees
Multiple Payment Methods
Partially Pay an Invoice
Patient and Insurer Info on Receipts
Patient Statements
Paying Balances Online
Printing or Emailing Receipts
Refunding a Product/Inventory Purchase
Searching by Invoice Number
Selling a Product
Supervising Therapist on Receipts
Transitioning Your Patient Credits/Receivables to Jane
Unapplying a Payment
Understanding Invoice Reversals
Writing Off Unpaid Amounts (and Reversing Them!)
Reconciliation Date: Reporting Invoice Changes Made Prior to a Certain Period
Online Booking Pre-Payments
Creating an Invoice
Email a Patient Invoice
Things to Know When Taking Your First Payments In Jane
An insurance company has sent me a credit card to process for reimbursement, what should I do?
Jane's Tips for Year End
Importing Sales to Xero from Jane
Importing Sales to Quickbooks Online (QBO) from Jane
Multiple License Numbers
Setting Up Your Billing Settings
Tips and Gratuities
Hide Client Information from Financial Emails
Customizing the Details & Price on an Unpaid Invoice
Shipping Fees on Products
FAQ: Subscription Licenses and Jane's Usage Report
Refunding a Patient Payment for an Appointment
Working with Online Gift Cards
Payments for Related Clients
Accounting Software and Jane
How to Bill Filler
How to Bill Neurotoxins (Botox, Dysport, Xeomin)
How to Bill and Manage Service Add-Ons for Online Booking
How to Create an Invoice for Administrative Tasks
How to Edit the Received and Applied Dates of Payments
Setting up Multiple Jane Payments Accounts
Failed Jane Payments Payouts
Changing Your Jane Payments Banking Information
Verification for your Jane Payments account 🇨🇦 🇺🇸
How To Get Paid Instantly with Jane Payments 🇨🇦
Deleting a Credit Card from a Patient’s Profile
U.S. 1099 tax forms
HSA / FSA cards
How to confirm whether or not a refund was successfully processed?
Creating Treatment Combinations
Partially Refund a Payment
How to Redeem a Past Treatment under a Package
Deleting or Reversing a Refund Recorded in Error
Disabling Tax on an Individual Purchase
How to Manage a Wallet or Bank Style Package and Membership
Invoicing for Minors
Mobile Services Hub
Sales Tax: Updating Past Invoices
Deleting a Sales Tax
Creating a Patient Invoice without an Appointment
What's that odd, small charge on my patient's credit card?
Why did my client's card decline?
Reordering Diagnosis Codes
Billing Insurance Claims For Telehealth Appointments (US)
Using HICAPS with Jane
How to Create and Send Quotes to Patients
Collecting Payment for a No Show or Late Cancellation
Jane Payments & Stripe Canadian Verification FAQs 2024 🇨🇦💰
Customizing or Removing the Footer on Financial Documents
Products Hub
Bookkeeping Hub
Automated Balance Reminder (Insurance)
How to Delete an Invoice
Issuing a Receipt for a Refund
Family Profiles - Turning Off Financial Communications for Children or Teens
Jane Payments
Jane Payments: Start Here
Setting Up and Using Jane Payments
Jane Payments Terminal
Jane Payments FAQ
Jane Payments & Stripe KYC Verification
Switching to Jane Payments
How to Verify if a Jane Payment Transaction Was Processed Successfully
Tips on the Jane Payments Terminal
Jane Payments Payouts Report
Jane Payments Transactions Report
Jane Payments Monthly Processing Report
What You’ll See on the Jane Payments Terminal
When do I get my Jane Payments deposits?
Chargebacks & Disputes
Reports
Accounts Receivable Report
Appointments Reports
Applied & Unapplied Payments Report
Billing Reports
Billing Summary Report
Cash Reconciliation Report
The Inventory Report, Product Price Lists and Calculating Retail Value
Day End Procedures
Employee & Contractor Taxes with Jane
Exporting Reports and Customizing them in Excel
Hours Scheduled / Booked Report
Patients Reports
Patient Retention Report
Referral Report
Referral Commission
Return Visit Reminders
Reconciliation Date: Reporting Invoice Changes Made Prior to a Certain Period
Reconciling Your Accounts Receivable (A/R) Between Periods
Product Performance Report
Sales Report
Strategies for Investigating Reports
Transaction or "Cash Out" Report
The Practitioner Dashboard, Explained
The Practitioner Dashboard for Clinic Owners
Unscheduled Patient Report
Working with the Purchase, Invoice, Received At, and Applied Dates
Reporting FAQs
Online Appointment Usage Report
Compensating Product Sales by Profit Margin
Insurance Policies Report
How to generate a list of Birthdays in Jane
Reports Overview
Reporting on New Patients
Insurance Specific Reporting (US)
Your 2024 with Jane FAQ
Income Categories (Compensation at Different Rates)
Patient Forms Report (Beta)
Community Resources
Community Stories
Jane Community Guidelines
Webinars & Events
🎟 Jane Webinars & Events Library
Allied 2022: Jane Summer School
Jane Summer School 2022: All Sessions
What’s New in Jane: The Latest & Greatest (& What’s Coming Next!)
Developing Your Collaborative Leadership Team
Kick A$$ Customer Service: Create a Stellar Patient Experience
Getting Started with Jane: Everything You Need For a Smooth Transition
Level Up to a 7-Figure Group Practice!
How to Set Your Virtual Office up for Ultimate Practice Success
How Networking Can Help You Build Your Business & Avoid Burnout
Operations Secrets for Easier Growth: How To Grow With Less Marketing
Zoom & Healthcare: A Conversation Between Jane Co-Founder, Alison Taylor & Zoom Head of Healthcare, Ron Emerson
Roundtable: Security, Compliance & Data Privacy
Roundtable: So You Want To Be a Therapist – Best Practices for Starting Your Practice
Payment Powered Practice: Let Jane Help You Get Paid
Elements Required To Scale Your Business
New Workflow: Billing Secondary Insurance Claims
Pivot: Adversity is just an Opportunity
Marketing Essentials: How a Children’s Game Can Teach You Everything You Need To Know About Marketing
From Chart to Finish: Tips, Tricks & Tools to Master Charting in Jane
You’re Not in This Alone: Harnessing the Power of Community for Practice Success
Rethinking the Traditional Front Desk Model & Improving the Patient Experience
Workshop: Unlocking the Power of Jane’s Reports
Patient Communication Strategies that grow Your Practice & Increase Trust
Combatting Virtual Fatigue: Restoring Your Voice, Brain & Body After Online Sessions
How to Turn Appointment Data into Repeat Business, Reviews & Revenue
Roundtable: Secrets to Successful Customer Support – Tips for Training & Maintaining Your Team
Q&A: The Healthy Leader – Preparing Yourself For Practice Growth
Allied 2021: Jane Summer School
Jane Summer School 2021: All Sessions
Back to the Future: Where Jane's Been & Where We're Headed
Hiring, Training & Retaining an Exceptional Front Desk Team
🇨🇦 General, Professional & Cyber Liability Insurance for Practitioners
Working With Couples & Families in Jane
Turning Trust into Treatment: Practitioner-Patient Communication
Virtual Assistant vs. Virtual Reception
Money Talks: How Jane Makes It Easy To Get Paid
Building an Inclusive Workplace
Front Desk Solutions For The SOLO Practitioner
Chart Smarter, Not Harder, With Jane
🇬🇧 Cuppa with the Jane UK Team
A Practitioner's Journey Through Burnout & Recovery
The Five Essentials Of Clinic Websites (& One Thing To Avoid)
Fantastic Reports & Where To Find Them
🇺🇸 Billing in the USA: Tips & Tricks From Billers
Best Practices: Privacy & Security in Jane (Webinar)
Caring for Clients Near End-Of-Life & Coping With Loss as a Caregiver
🇺🇸 A New ERA: US Insurance Billing Features in Jane
Building Your Authentic Brand Story
Allied 2020: The Virtual Community Conference
Allied 2020: The Jane Virtual Community Conference: All Sessions
Privacy
Is Jane PIPEDA compliant?
Is Jane GDPR compliant?
Is Jane HIPAA compliant?
FIPPA/FOIPPA for the BC Public Sector
Jane for BCACC Members
Privacy Compliance for Clinics in British Columbia
Privacy: Compliance for Clinics in Alberta
Privacy Compliance for Clinics in Ontario
PIPEDA and Other Privacy Laws in Canada
GDPR Consent Language
GDPR Consent Rules
GDPR and Jane in the EU and the UK
GDPR and Reminder Emails
HIPAA and Appointment Emails
HIPAA and Marketing Emails
California Consumer Privacy Act (CCPA)
Is Jane PCI-Compliant?
Protecting Patient Data
Online Appointments and Privacy Laws
Creating & Storing Compliant Clinical Notes
Working on a Shared Computer/Device
The U.S. Cures Act and Jane: Giving Your Patients Access to Their EHR
Security and Privacy Best Practices
What is a SOC 2 report?
Who should be the Jane Account Owner?
Receiving Support Securely
How To: Reset Your Jane Password
Jane's AI Principles
Staff Access Levels
Deleting Patient Data
Security
Security FAQ
List of Security Features
Activity Log
Auto-Logout Duration
Email Encryption FAQ for Canada
Password Best Practices
Security and Privacy Best Practices
All About the New Device Sign-in Email
Phishing Safety
What is a SOC 2 report?
Who should be the Jane Account Owner?
Receiving Support Securely
Third Party Messaging Service FAQ
How To: Reset Your Jane Password
2-Step Verification
Cloud Security White Paper
Unauthorized Access: What to Do if Your Laptop/Phone is Lost or Stolen
How to reset your email password and enable Two-Factor Authentication (2FA)
Wait List Management
Using the Wait List
Using Automatic Wait List Notifications
Wait List Notifications: FAQ, Troubleshooting & Feature Development
Why Didn't my Patient Receive a Wait List Notification?: A Troubleshooting Guide
Notifications & Reminders
Add Upcoming Appointments to the Bottom of Printed and Emailed Receipts
Updating Your Clinic Email Address & Phone Number
Customizing Language in Jane
Email Notifications
Email & SMS Reminders
GDPR and Reminder Emails
How to Send an Email to All Patients
Phone Reminders List
Return Visit Reminders
Tasks or To Dos
My Client Didn't Receive their Clinical or Outcome Measures Survey: A Troubleshooting Guide
Email Customization Cheatsheet (Appointment Reminder)
Email Customization Cheatsheet (Thanks for Booking)
Why Does My Patient or Client’s Email Say ”Bounced”?
Intake Form Reminder Email FAQ
Why Does My Patient or Client’s Email Say ”Complaint”?
How to Verify your Email Address (for Staff and Patients)
Forms, Surveys, and Ratings
Forms, Surveys, and Ratings
Intake Form FAQ
Intake Forms
How to Format Text in Jane: A Markdown Cheatsheet
My Patient Didn’t Receive Their Intake Form: A Troubleshooting Guide
Creating & Sending a Manual Intake Form
Consent Forms
Update Forms
Why Can’t My Client Access Their Intake Form?
Intake Forms
Take back your treatment time with Online Intake Forms
Behavioral Health Hub
Patient Profiles
Couples or Related Groups - Booking, Billing, Charting and Notifications
Deleting a Patient or Client Profile
Family Profiles - Managing Family Members (For Patients)
Family Profiles - Online Booking & Intake Forms
Family Profiles - Managing Family Members from the Patient Profile
Family Profiles - Payments with Shared Credit Cards
Helping Patients Log In
Marking a Patient as Inactive (Discharged or Deceased)
Mass Welcome Email
Merging and Unmerging Patients
Communications Log
My Account - Your Patient/Client Portal
Patient Preferred Name
Patients Relationships
Prefixes, Titles & Honorifics
How to View and Print Appointments for a Patient (Past or Upcoming Appointments)
Pronouns
Sharing Chart Entries with Patients
Add a Credit Card from the Client My Account Portal
Online Appointments and Privacy Laws
Troubleshooting Tips for Subscribed Calendars
Subscribing to your Calendar (For Patients)
Updating the Default Email Account On Your Device
Customizable Patient Sign Up Form
Creating a Group
Groups and Group Appointments FAQ
Payments for Related Clients
How To: Reset Your Jane Password
Test Patient/Client
How to Create a Client Profile Administratively
Jane's Mobile App for Clients
Jane's Mobile App for Clients (Guide for Clinics)
Help! My Patient Keeps Getting Logged in as a Family Member
The Patients Tab: A Snapshot of Your Full Patient List
Patient/Client Help Hub
How to find Your Clinic’s Contact Information (for Patients)
Messaging (Beta)
Jane's Mobile App for Clients: Signing in and Troubleshooting
Family Profiles - Turning Off Financial Communications for Children or Teens
Staff Profiles
Edit Individual Shifts
Auto-Logout Duration
Charting Privacy Options
Log In Help: Username and Password
Deactivating a Staff Member
Helping Staff Sign In
How to Add a Profile Photo
Keyboard Shortcuts
Merging and Unmerging Staff Profiles
Communications Log
Patient Privacy and Privacy Mode
Registration Numbers
Staff Access Levels
Setting up Staff and Adding a Staff Member to Your Jane Subscription
Setting up Treatments
Subscribing to Your Calendar (for Staff)
Supervising Therapist on Receipts
Setting Up Sales Taxes in Jane
Troubleshooting Tips for Subscribed Calendars
Help! I’m a Practitioner but Keep Getting Logged In as a Patient
Transitioning an Intern to a Practitioner
Commission Rates by Location
Managing Your Jane Subscription
How To: Reset Your Jane Password
Offboarding Checklist: What to Do When Staff Leave
Editing your Staff Email and/or Phone Number
Income Categories (Compensation at Different Rates)
Practitioner Profiles
Device & Network Recommendations
Using Jane on a Tablet
Using Jane on a Smartphone
Booking  a Break on a Mobile Device (Phone or other Small Screen)
Practitioner Sign In
​Booking a Break, Vacation and Holidays on Your Schedule
Log In Help: Username and Password
Chart Parts for Creating a Chart Template
Chart Templates: Creating, Editing and Deleting a Template
Employee & Contractor Taxes with Jane
Helping Staff Sign In
Increasing Your Fees
Keyboard Shortcuts
Print to PDF
Day View: Sign and Lock Workflow
Who was Cancelled/Deleted from the Schedule?
Subscribing to Your Calendar (for Staff)
Practitioner's Home Base: Day Sheets & Charts
Practitioner Training: Initial Signing In and Overview
I Can't Access My Jane Account: A Troubleshooting Guide
Day End Procedures: for Practitioners
Jane's Workshop
Payroll
Payroll Guide Hub
Timesheets
Income Categories (Compensation at Different Rates)
Compensation Report
Referral Commission
Commission Rates by Location
Compensating Product Sales by Profit Margin
Understanding Package & Membership Compensation
Calculating Hourly Wages Based on Booked Hours
Calculating Flat Fee Compensation Based on the Number of Services Provided
Messaging
Messaging (Beta)
Insurance Billing (Canada)
Billing No Shows and Late Cancellations to Third Party Payers
Billing MSP Through Teleplan
Billing To Insurers Without an Appointment (For Phone Calls/Chart Notes/Letters, etc.)
Billing to WorkSafe BC - Physiotherapy
Booking and Billing No Charge WSBC (WCB) Subsequent Visits
Create Custom Billing Codes
Creating a Patient Policy (CA)
Creating and Setting Up Insurers (CA)
Direction to Pay - Billing to Lawyers
Grouping and Ungrouping Insurer Invoices
How to Bill for Multiple Services on a Single Visit Using Billing Codes
How to Manually Override an Invoice
ICBC Invoicing and Reporting - Effective April 1, 2019
ICBC - Acupuncture
ICBC - Chiropractic
ICBC - Clinical Counselling
ICBC - Kinesiology
ICBC - Psychology
ICBC - Massage Therapy
ICBC - Physiotherapy
Insurance Coverage & Taxes
Insurer Underpayment (Adjusting Amount Paid by Insurer)
Receiving an Insurer Payment
Teleplan (MSP & WorkSafeBC) Rejections
Resetting Insurance Policy Counts and Limits
Searching by Invoice Number
Teleplan Late Submission Reason Code
Apply or Unapply an Insurer Payment
Working with Claim Submissions (Paper Insurer Invoices)
Pacific Blue Cross - Setting up your PROVIDERnet Integration
Pacific Blue Cross - Submitting Claims Through the PROVIDERnet Integration
Pacific Blue Cross - Reversing Claims Through the PROVIDERnet Integration
Adding Billing Codes to Paid Invoices
Billing to WorkSafe BC – Chiropractic
TELUS eClaims - Submitting Claims and Eligibility Checks Through the TELUS eClaims Integration
Setting Up a Fillable PDF Form
How to Populate a Fillable PDF File
TELUS eClaims - Setting Up Your TELUS eClaims Integration
TELUS eClaims - Reversing Submissions Through the TELUS eClaims Integration
​Missing the Insurers Tab? Adding the Insurance add-on to the Practice or Thrive Plan
Working with Claim Submissions and Online Insurer Portals
Insurer Statements
Duplicate Insurers
TELUS eClaims FAQ + Troubleshooting
Pended and On Hold Submissions with TELUS eClaims
Collect Insurance Information on Intake Forms From Your Clients 📸
HCAI billing in Jane: Block Billing Workflow
HCAI billing in Jane: FAQ
Insurance Mode on Claims: Payable to Patient vs Payable to the Clinic (CA)
How to Archive and Unarchive an Insurer
Recording an Insurer is covering $0 (CA)
Booking an Insured Visit
HCAI billing in Jane: Third Party Billing Workflow
HCAI billing in Jane: Hub
Teleplan (MSP & WorkSafeBC) Rejection Codes
Coordination of Benefits and Secondary Claims (CA) 🇨🇦
How to Set Up and Bill to a Third-Party Payer (CA)
Where to find a Teleplan Sequence Number in Jane
Removing the Insurance Add On and what to expect!
Delete an Insurer Payment
Pacific Blue Cross Troubleshooting and Error Codes
Billing Patients for Rejected Pacific Blue Cross PROVIDERnet Claims
How to Resubmit a Rejected TELUS eClaim
US Insurance Billing Training
US Insurance Billing Training Hub
​Missing the Insurers Tab? Adding the Insurance add-on to the Practice or Thrive Plan
US Insurance Step 1
US Insurance Step 2
US Insurance Step 3
Start Billing 1: Patient Insurance
Start Billing 2: CPT & Diagnosis codes
Start Billing 3: Insuring the Visit
Start Billing 4: Claim Management & CMS1500 Forms
Start Billing 5: EDI Claim Submission
Start Billing 6: Posting Insurer Payments & EOBs
US Insurance Training Survey
Removing the Insurance Add On and what to expect!
Managing Resubmissions & Corrected Claims
Biller Training
Welcome to Jane's US Biller Training Course 👋
Module 1: Setting Up Insurers, Billing Codes & Billing Info
Module 2: Claim Submissions & Management
Module 3: Modifiers, creating a custom billing code, and changing & adding billing codes
Module 4: Remittances
Module 5: A/R Tracking (Aging Claims)
Jane's Insurance Billing USA
US Insurance Billing Additional Resources
​Missing the Insurers Tab? Adding the Insurance add-on to the Practice or Thrive Plan
🇺🇸 Integrated Claims with Claim.MD
🇺🇸 Secondary Claims in Jane
🇺🇸 Billing Secondary Insurance Claims
🇺🇸 What's an ERA in Insurance Billing?
ERA Management Tool FAQ
Posting Insurer Payments With Electronic Remittances (ERAs)
CMS1500 Reference Sheet
Billing Under a Different Practitioner (Rendering Provider)
Billing Unlisted CPT Codes to Insurance
Cash Visits & Superbills
Collect Insurance Information on Intake Forms From Your Clients 📸
Courtesy Billing or Patient Pre-Pay (US)
ICD-10 Code Set Updates FAQ
Insurance Claims & The CMS1500
Creating & Managing Good Faith Estimates in Jane
Adding CPT & Diagnosis Codes to Charts (US)
Setting a Place of Service Code
How To Reconcile Insurance Claim Reversals
Posting Insurer Payments With Paper EOBs
Superbills on the Base Plan
Switching Clearinghouses to Claim.MD
🇺🇸 Integrated Claims with Claim.MD - FAQs
Box 16
Box 24
Box 11
Box 9
Box 17
Box 32
Box 12
Box 13
Box 1
Box 10
Box 15
Box 21
Box 22
Box 29
Box 28
Box 31
Box 3
Box 2
The Top Right Corner
Box 4
Box 5
Box 6
Box 7
Box 14
Box 18
Box 19
Box 20
Box 23
Box 25
Box 26
Box 27
Box 33
How to Archive and Unarchive an Insurer
Creating a Patient Insurance Policy (US)
Re-booking Clients with the Same Insurance Info
Adding Billing Codes to a Paid Invoice (to Create a Superbill)
🇺🇸 Eligibility Checks with Claim.MD
Uploading an EDI File to Office Ally
Jane's Clearinghouse Integration 🇺🇸
Creating and Setting Up Insurers (US)
Reordering Diagnosis Codes
Refreshed Insurance Workflows: Transitioning Your Insurance Appointments
Billing Insurance Claims For Telehealth Appointments (US)
Insurance Specific Reporting (US)
Submitting a Claim when Medicare is the Secondary Payer
Delete an Insurer Payment
How to Attach Supporting Documents to Claims in Claim.MD
How to Temporarily Disable the Claim.MD Integration
Creating an EDI File to Submit to a Clearinghouse
Recording an Additional Insurer Payment
Creating Billing Codes (US)
Treatment-Specific CPT Codes
UK Insurance Billing
UK Insurance Step 1 - Setting up Insurers 🇬🇧
UK Insurance Step 2 - Billing Codes & Contract Rates 🇬🇧
UK Insurance Step 3 - Insurance Policies 🇬🇧
UK Insurance Step 4 - Insuring an Appointment 🇬🇧
UK Insurance Step 5 - Invoicing & Payments 🇬🇧
Gift Cards
Donating Gift Cards or Promos
Gift Cards Overview
Loading a Gift Card Using a Credit on File
Redeeming a Gift Card
Refunding and Deleting a Gift Card
Reload an Existing Gift Card
Tips for Ordering Gift Cards
Transferring a Gift Card Balance
Working with Online Gift Cards
Create and Load a Gift Card Administratively
Teleplan
Adding a Note to a Teleplan Claim
Adding Your Data Centre to Jane
Billing MSP Through Teleplan
Billing to WorkSafe BC - Physiotherapy
Billing to WorkSafe BC – Chiropractic
Booking and Billing No Charge WSBC (WCB) Subsequent Visits
Debit Request (Return Payment to Teleplan)
Editing an Invoice with Payment Already Applied
Favourite Teleplan Codes
GST and Modifying Teleplan Billing Codes
Sending Teleplan Claims
Signing Up for Teleplan
Teleplan Diagnostic Codes (Area of Treatment)
Teleplan Late Submission Reason Code
Teleplan Status - Opted In Versus Opted Out
Teleplan Transition
Compensating Multiple Practitioners for Block Billing
Billing for Photocopies / Records to WSBC
Packages & Memberships
Setting up a Package
Package & Membership Reports
Selling, Redeeming and Refunding a Package
Working with Package & Membership Receipts
Understanding Package & Membership Compensation
Packages FAQs
Setting up a Membership
Selling a Membership
Deleting and Cancelling Memberships
Memberships FAQ
Redeeming or Refunding Memberships
How to Redeem a Past Treatment under a Package
Packages on a Payment Plan
Insurance Friendly Packages
Packages & Memberships Hub
Integrations
Fullscript and Jane
Fullscript - Recommendation Templates
Clinic Sites - Jane’s Website Integration
Google Analytics
Mailchimp
Mailchimp Integration: A Troubleshooting Guide
Physitrack - Setting Up Your Integration
Physitrack - Using Jane & Physitrack Together
Pacific Blue Cross - Setting up your PROVIDERnet Integration
Pacific Blue Cross - Submitting Claims Through the PROVIDERnet Integration
Pacific Blue Cross - Reversing Claims Through the PROVIDERnet Integration
TELUS eClaims - Setting Up Your TELUS eClaims Integration
TELUS eClaims - Submitting Claims and Eligibility Checks Through the TELUS eClaims Integration
TELUS eClaims - Reversing Submissions Through the TELUS eClaims Integration
Subscribing to your Calendar (For Patients)
Deep dive into calendar subscription issues with iCalendar
Subscribing to Your Calendar (for Staff)
Troubleshooting Tips for Subscribed Calendars
Fullscript FAQ + Troubleshooting
Physitrack FAQ + Troubleshooting
TELUS eClaims FAQ + Troubleshooting
How to Send an Automated Birthday Email
Integrations Hub & FAQ
Integrated Outbound Fax
Training Video Playlists
Getting Started with Jane
Jane's Scheduling Basics
Jane's Charting Basics
Jane's Payment Basics
Jane's Online Booking Basics
Jane's Insurance Billing 🇨🇦
Jane's Integrations
Why The Name "Jane"?
Patient Feedback
Setting up Ratings and Reviews
Review your Ratings Report (for Clinic Owners & Practitioners)
Filling out a rating survey (for Patients)
Setting Up Your Location for Google Reviews
Ratings & Reviews FAQs
Troubleshooting
Mailchimp Integration: A Troubleshooting Guide
My Client Didn't Receive their Clinical or Outcome Measures Survey: A Troubleshooting Guide
Troubleshooting Blurry Logos, Email Headers and Online Booking Backgrounds
Why isn't my Availability Displaying Online? A Troubleshooting Guide
Staff Member not Showing up on Schedule
Jane Support & Resources: Getting Help With Your Account
​Missing the Insurers Tab? Adding the Insurance add-on to the Practice or Thrive Plan
My Patient or Client Didn’t Get Their Email Reminder: A Troubleshooting Guide
Deep dive into calendar subscription issues with iCalendar
Troubleshooting Tips for Subscribed Calendars
Help! I’m a Practitioner but Keep Getting Logged In as a Patient
Fullscript FAQ + Troubleshooting
Contact to Book
Why Does My Patient or Client’s Email Say ”Bounced”?
I Can't Access My Jane Account: A Troubleshooting Guide
Jane Payments Terminal Troubleshooting
Online Appointments: A Troubleshooting Guide
Unauthorized Access: What to Do if Your Laptop/Phone is Lost or Stolen
How to Update Your Microsoft Edge Browser
How to Update Your Google Chrome Browser
How to Update Your Firefox Browser
How to Update Your Safari Browser
Why Does My Patient's SMS Notification Say "Failed"?
Security
How to reset your email password and enable Two-Factor Authentication (2FA)Putting Resources to Work
Schedule
Putting Resources to Work
28 min read
Thrive Plan📣
Please note that Resources are a part of our Thrive Plan. For more info on the different plan options in Jane, check out our
Pricing Page
.
We’ve put together this handy guide to share some examples of ways you can use our
Resources
feature to manage your Online Booking availability. We hope these examples help you understand how this feature works.
👩‍🏫 Just a friendly reminder that Resources is a complex feature so this guide is a longer read. We’d recommend grabbing a refreshment and setting aside some time to really dive in as we explore Resources together.
To use Resources, a Full Access user will need to enable advanced scheduling features. Head to
Settings > Schedule Settings
to check on
Advanced Scheduling
and
Save
.
We’d also recommend checking out our guide on
Resource booking - Working with limited resources
to learn more about Resources as a feature before we jump into scenarios.
Scenario One - Rooms are a Resource
Scenario Two - Practitioner is the Resource
Scenario Three - Both Rooms and the practitioner are a Resource
Scenario Four - Rooms, the practitioner, and a piece of equipment are a Resource
Scenario Five - Rooms, multiple practitioners, and a piece of equipment are a Resource
Scenario One - Rooms are a Resource
You have shared rooms that are booked on a first come first served basis.
In our example scenario, we have three rooms shared by our RMTs, Amy and Susan.
Here is how your Resources would be set up:
One Resource Pool for your different rooms
In our example, we called this “Treatment Rooms”
Each available room would be a Resource within that Resource Pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” goes in the “Treatment Rooms” Resource Pool and so on….
Here is how your appointments would be set up:
Each treatment will need
1 required
Resource from the Resource Pool
For regular RMT appointments:
📍 When booking appointments administratively, staff can select a specific room from the Resource Pool; however, when appointments are booked online Jane will randomly select the first available room as the Resource for that appointment.
🔥 Hot Tip: If you’d like to see what practitioner is booked into what room for their appointment, you can head to your schedule and use the
Resources
button to view the schedule for each Resource.
🔝
Skip back to top
Scenario Two - Practitioner is the Resource
You have a practitioner who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types.
In our example scenario, we are working with a chiropractor, Marcus, who can see three clients at a time for subsequent appointments but only one client at a time for initial appointments
.
❗️Before we jump into this scenario, since you are working with a practitioner who can potentially see multiple clients at once, you’ll want to make sure you use our Rooms feature to create multiple Shifts within that practitioner’s schedule. We recommend using the
Manage Shifts
function covered in our
Setting Up Shifts
guide coupled with the
Room Booking
guide.
Here is how your Resources would be set up:
One Resource Pool for your practitioner
In our example, we called this “Marcus”
Within that Resource Pool, you would create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we will create three practitioner Resources for our Resource Pool
❗️ Something to keep in mind as you set up this scenario is that you will need to create your practitioner Resource appointments so that they are assigned to a specific staff member if there is more than one staff member opted into this discipline, rather than using a No Staff Member (Shared Treatment). This is so that one practitioner is not affected by the Resource availability of another practitioner within that same discipline.
❗️Since you are now working with appointments that are assigned to specific staff members, you’ll want to make sure that
Book by Staff Member
in your
Settings > Online Booking
is enabled so that your patients are able to book staff specific appointments.
Here is how your appointments would be set up:
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit for example, would be set to need
All Required
Resources from the Resource Pool
For subsequent chiropractic appointments where Marcus can see up to three clients at once:
For initial chiropractic appointments where Marcus can only see one client at a time:
In our example, when we go to book Marcus’ Subsequent Treatment, we can see that Jane requires only one of our Resources from the “Marcus” Resource Pool:
However, when we go to book Marcus’ Initial Treatment & Assessment, we can see that Jane requires all three of the Resources from the “Marcus” Resource Pool:
🔥 Hot Tip #1: We always recommend using the
Magnifying Glass
🔎 as a quick and easy way to check your work and how it reflects on your Online Booking Site.
In our example, when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Subsequent Treatment, we can see that clients can book into any available time slots where an Initial Assessment And Treatment is not booked:
However, when we use the Magnifying Glass to check the availability for Marcus’ Initial Assessment And Treatment, we can see that clients can only book into an available time slot where no other appointments are booked:
🔥 Hot Tip #2: If you would prefer your appointments start at staggering times, check out Scenario 1 in our
Staggered Booking Set Up (Multiple Rooms or Clients Overlapping)
guide for info on how to enable Stagger Online Bookings.
🔝
Skip back to top
Scenario Three - Both Rooms and the Practitioner are a Resource
You have multiple rooms which are booked on a first come first serve basis. You also have a practitioner who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types.
📍Scenario three is a mix of scenario one and scenario two together. Feel free to check out both scenario one and scenario two for hot tips (marked with a  🔥) and additional notes (marked with a ❗️) on this scenario.
In this example scenario, we are working with RMTs, Amy and Susan, and a chiropractor, Marcus, who require a room for their appointments. Our chiropractor can see three clients at a time for subsequent appointments but only one client at a time for initial appointments
.
Here is how your Resources would be set up:
Two Resource Pools are needed
One Resource Pool for your Rooms
In our example, we called this “Treatment Rooms”
One Resource Pool for your Practitioner
In our example, we called this “Marcus”
When setting up the Resource Pool for your rooms, each available room will be its own resource within that pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” opted into the “Treatment Rooms” Resource Pool and so on….
When setting up the Resource Pool for your practitioner, you will create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we have created three Resources for Marcus: so “Marcus 1” opted into the “Marcus” Resource Pool and so on…
Here is how your appointments would be set up:
Each appointment type would be set to need
1 required
Resource from the room Resource Pool
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
practitioner Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit for example, would be set to need
All Required
practitioner Resources from the Resource Pool
For regular RMT appointments:
For subsequent chiropractic appointments where Marcus can see up to three clients at once:
For initial chiropractic appointments where Marcus can only see one client at a time:
In our example, when we go to book a regular 30 Minute Massage appointment, we can see that Jane requires only one of our room Resources from the “Treatment Rooms” Resource Pool because our RMT, Amy, can only ever see one client at a time (so we have not created nor are we using a practitioner Resource Pool for Amy):
However, when we go to book Marcus’ Subsequent Treatment, we can see that Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool AND one of the practitioner Resources from the “Marcus” Resource Pool because Marcus needs a room for his appointment and he can see multiple clients at once for his subsequent appointments:
🔥 As we did in scenario two, let’s use our handy Magnifying Glass 🔎 to check our work in the schedule:
Notice how when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Subsequent Treatment, we can see that Jane isn’t offering the 10:30 AM slot in Marcus’ schedule even though he could technically take a third client at that time. This is because there is no room availability since Susan and Amy, our RMTs, are already using Room 3 at that time:
🔝
Skip back to top
Scenario Four - Rooms, the practitioner, and a piece of equipment are a Resource
You have multiple rooms booked on a first come first serve basis, a practitioner who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types, and a piece of equipment shared among the clinic.
📍Scenario four is a mix of scenario one and scenario two with an added Resource for a shared piece of equipment among the clinic. Feel free to check out both scenario one and scenario two for hot tips (marked with a  🔥) and additional notes (marked with a ❗️) on this scenario.
In this example scenario, we are working with RMTs, Amy and Susan, a chiropractor, Marcus, and a physiotherapist, Jonathan, who require a room for their appointments. Our chiropractor can see three clients at a time for subsequent appointments but only one client at a time for initial appointments
.
Both our chiropractor and our physiotherapist require X-ray equipment for their initial appointments.
Here is how your Resources would be set up:
Three Resource Pools are needed
One Resource Pool for your Rooms
In our example, we called this “Treatment Rooms”
One Resource Pool for your Practitioner
In our example, we called this “Marcus”
One Resource Pool for your piece of equipment
In our example, we called this “X-Ray”
When setting up the Resource Pool for your rooms, each available room will be a Resource within that pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” opted into the “Treatment Rooms” Resource Pool and so on….
When setting up the Resource Pool for your practitioner, you will create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we have created three Resources for Marcus: so “Marcus 1” opted into the “Marcus” Resource Pool and so on…
When setting up the Resource Pool for your piece of equipment, the equipment will be a Resource within that pool
In our example, we only have one X-Ray in the clinic which is shared among the clinic so we created one Resource for it within its own Resource Pool: so “X-Ray” opted into the “X-Ray” Resource Pool
Here is how your appointments would be set up:
Each appointment type would be set to need
1 required
Resource from the room Resource Pool
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
practitioner Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit, for example, would be set to need
All Required
practitioner Resources from the Resource Pool
Appointment types that require your piece of equipment, an initial visit for example, would be set to need
1 Required
equipment Resource from the Resource Pool
For regular RMT appointments:
For initial physiotherapy appointments that require our x-ray equipment:
For subsequent chiropractic appointments where Marcus can see up to three clients at once and does not need the x-ray equipment:
For initial chiropractic appointments where Marcus can only see one client at a time and requires the x-ray equipment:
In our example, when we go to book a regular 60 Minute Massage appointment, we can see that Jane requires only one of our room Resources from the “Treatment Rooms” Resource Pool because our RMT, Amy, can only ever see one client at a time (so we have not created nor are we using a practitioner Resource Pool for Amy) nor does she require the x-ray Resource from the “X-Ray” Resource Pool:
Then when we book a physiotherapy Initial Assessment & Treatment, Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool and our x-ray Resource from our “X-Ray” Resource Pool. However, since our physiotherapist, Jonathan, can only ever see one client at a time we have not created or used a practitioner Resource Pool for these appointments:
Lastly, when we book Marcus’ Initial Assessment & Treatment, Jane requiresone of our room Resources from the “Treatment Rooms” Resource Pool, three of the practitioner Resources from the “Marcus” Resource Pool, and also the x-ray Resource from the “X-Ray”  Resource Pool because Marcus needs a room for his appointment, he can only see one client at a time for his initial appointments, and he requires the x-ray for those initial appointments:
🔥 As we did in scenarios two and three, let’s use our handy Magnifying Glass 🔎 to check our work in the schedule:
Notice how when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Initial Assessment And Treatment, we can see that Jane isn’t offering the 10:30 AM slot in Marcus’ schedule even though he doesn’t have any clients booked at that time and Room 3 is available. This is because the x-ray is not available since it is being used by Jonathan, our physiotherapist, at that time:
🔝
Skip back to top
Scenario Five - Rooms, multiple practitioners, and a piece of equipment are a Resource
You have multiple rooms booked on a first come first serve basis, multiple practitioners who can take multiple clients at once for certain appointment types but can only take one client at a time for other appointment types, and a piece of equipment shared among the clinic.
📍Scenario five is a mix of scenario one and scenario two with a second practitioner Resource and an added Resource for a shared piece of equipment among the clinic. Feel free to check out both scenario one and scenario two for hot tips (marked with a  🔥) and additional notes (marked with a ❗️) on this scenario.
In this example scenario, we are working with RMTs, Amy and Susan, and two chiropractors, Marcus and Frank, who require a room for their appointments. Our chiropractor, Marcus, can see three clients at a time for subsequent appointments but only one client at a time for initial appointments. Our chiropractor, Frank, can see two clients at a time for subsequent appointments but only one client at a time for initial appointments. Both chiropractors require X-ray equipment for their initial appointments.
Here is how your Resources would be set up:
Four Resource Pools are needed
One Resource Pool for your Rooms
In our example, we called this “Treatment Rooms”
One Resource Pool for your first Practitioner
In our example, we called this “Marcus”
One Resource Pool for your second Practitioner
In our example, we called this “Frank”
One Resource Pool for your piece of equipment
In our example, we called this “X-Ray”
When setting up the Resource Pool for your rooms, each available room will be a Resource within that pool
In our example, we have three total rooms and have created each one as a Resource: so “Room 1” opted into the “Treatment Rooms” Resource Pool and so on….
When setting up the Resource Pool for each of your practitioners, you will create a practitioner Resource for the maximum amount of clients your practitioner can see at a time
In our example, because our chiropractor, Marcus, can see up to three clients at a time for subsequent appointments, we have created three Resources for Marcus: so “Marcus 1” opted into the “Marcus” Resource Pool and so on…
However, because our chiropractor, Frank, can only see up to two clients at a time for subsequent appointments, we have created two Resources for Frank: so “Frank 1” opted into the “Frank” Resource Pool and so on…
When setting up the Resource Pool for your piece of equipment, the equipment will be a Resource within that pool
In our example, we only have one X-Ray in the clinic which is shared among the clinic so we created one Resource for it within its own Resource Pool: so “X-Ray” opted into the “X-Ray” Resource Pool
❗️ Something to keep in mind as you set up this scenario is that you will need to create your practitioner Resource dependant appointments so that they are assigned to a specific staff member. This is so that one practitioner is not affected by the Resource availability of another practitioner within that same discipline.
In our example, this would be the appointments for Marcus and Frank. Both Marcus and Frank would require their own set of appointments which are assigned to them directly. This way, when we set up Marcus’ appointments, we can specify how many of the “Marcus” Resources are needed for each appointment and the same would go for setting up Frank’s appointments with the “Frank” Resources.
❗️Since you are now working with appointments that are assigned to specific staff members, you’ll want to make sure that
Book by Staff Member
in your
Settings > Online Booking
is enabled so that your patients are able to book staff specific appointments.
Here is how your appointments would be set up:
Each appointment type would be set to need
1 required
Resource from the room Resource Pool
Appointment types that allow the practitioner to see more than one client at a time would be set to need
1 Required
practitioner Resource from the Resource Pool
Appointment types that require the practitioner exclusively, an initial visit for example, would be set to need
All Required
practitioner Resources from the Resource Pool
Appointment types that require your piece of equipment, an initial visit for example, would be set to need
1 Required
equipment Resource from the Resource Pool
For regular RMT appointments:
For initial chiropractic appointments with Marcus that require our x-ray equipment:
For subsequent chiropractic appointments with Marcus where Marcus can see up to three clients at once and does not need the x-ray equipment:
For initial chiropractic appointments with Frank that require our x-ray equipment:
For subsequent chiropractic appointments with Frank where Frank can see up to two clients at once and does not need the x-ray equipment:
In our example, when we book a regular 60 Minute Massage appointment, Jane requires only one of our room Resources from the “Treatment Rooms” Resource Pool because our RMT, Amy, can only ever see one client at a time (so we have not created nor are we using a practitioner Resource Pool for Amy) nor does she require the x-ray Resource from the “X-Ray” Resource Pool:
Then, when we book Marcus’ Initial Assessment & Treatment, Jane  requires one of our room Resources from the “Treatment Rooms” Resource Pool, three of the practitioner Resources from the “Marcus” Resource Pool, and also the x-ray Resource from the “X-Ray”  Resource Pool because Marcus needs a room for his appointment, he can only see one client at a time for his initial appointments, and he requires the x-ray for those initial appointments:
Next, when we book Frank’s Initial Assessment & Treatment, Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool, two of the practitioner Resources from the “Frank” Resource Pool, and also the x-ray Resource from the “X-Ray”  Resource Pool because Frank needs a room for his appointment, he can only see one client at a time for his initial appointments, and he requires the x-ray for those initial appointments:
Lastly, when we book either of the chiropractor’s Subsequent Treatment, Jane requires one of our room Resources from the “Treatment Rooms” Resource Pool and one of the practitioner Resources from either the “Marcus” or the “Frank” Resource Pool because each chiropractor needs a room for their appointment, they can see multiple clients at a time for their subsequent appointments, and they don’t require the x-ray Resource from the “X-Ray” Resource Pool for their subsequent appointments:
🔥 As we did in scenarios two, three, and four, let’s use our handy Magnifying Glass 🔎 to check our work in the schedule:
Notice how when we use the Magnifying Glass to check the Online Booking Site availability for Marcus’ Initial Assessment And Treatment, we can see that Jane is offering the 11:15 AM slot as the next available appointment. This is because Jane is scanning the schedule for all three of the practitioner Resources from the “Marcus” Resource Pool, one of the room Resources from the “Treatment Rooms” Resource Pool, and the x-ray equipment from the “X-Ray” Resource Pool:
🔝
Skip back to top
There you have it friends! 🤩 Those are a few common scenarios we see Resources used for and we hope these help you get a better understanding of how this amazing feature can help you manage your scheduling.
That being said, if your scenario doesn’t match one of those outlined above, or even if you’d just like a helping hand with your setup, we’d be happy to chat with you. Feel free to check out our
Contact Us
page if you’d like.
We’ll also plug our
Resource booking - Working with limited resources
and
Resource FAQ & Troubleshooting
guides for you in case you’d like to pop into those.
We would really appreciate any feedback you may have regarding Resources as a feature or this example scenarios guide. If you’d like to leave your feedback about the Resources feature, please feel free to pop into our
Feature Request
page. If you have suggestions on how this guide could be more helpful, we’d love it if you could
reach out and let us know
.Subscribe to our monthly newsletter.Jane Software Inc.
500 - 138 13th Street East, North Vancouver
British Columbia, Canada V7L 0E5
Contact Us
+1 844-310-JANE (5263)
+44 808 164 0893
+61 1 800 940 893
+1 604-670-JANE (5263)
seejanerun@janeapp.com
Want to keep up-to-date with everything that’s new in Jane? Subscribe to our monthly newsletter.

## Images

- ![](https://jane.app/assets/jane-header-logo-5ed0c48b9f7d1634665009efe48392b1f8e34416b9753ead206154f8e6083036.svg)
- ![](https://jane.app/assets/jane-header-logo-5ed0c48b9f7d1634665009efe48392b1f8e34416b9753ead206154f8e6083036.svg)
- ![Features](https://jane.app/assets/icons/stack_3_layers_dark_grey-ee2e7f7383bf4e2a645d41a092cdd5705017731466ea8e5f68819423887cdac0.svg)
- ![More from Jane](https://jane.app/assets/icons/stack_2_layers_dark_grey-7320907fa4e9bc366bdbf1c0f0851e53cd0eae755c37f0e143098652126300a5.svg)
- ![Feature Overview](https://jane.app/assets/icons/arrow_right_aqua-44fd64c285b864d54d7b80a7e51fe92c373aa86ded9e6e4fa710b8ba4995339f.svg)
- ![Features](https://jane.app/assets/icons/stack_3_layers_dark_grey-ee2e7f7383bf4e2a645d41a092cdd5705017731466ea8e5f68819423887cdac0.svg)
- ![More from Jane](https://jane.app/assets/icons/stack_2_layers_dark_grey-7320907fa4e9bc366bdbf1c0f0851e53cd0eae755c37f0e143098652126300a5.svg)
- ![Feature Overview](https://jane.app/assets/icons/arrow_right_aqua-44fd64c285b864d54d7b80a7e51fe92c373aa86ded9e6e4fa710b8ba4995339f.svg)
- ![screenshot of enabling Advance Scheduling settings](https://jane.app/thumbs/abbf755d-1198-442e-a652-73569ec424ca)
- ![screenshot of resource setup](https://jane.app/thumbs/91d5eb7e-01c5-497f-9199-9df2e7f4ca35)
- ![](https://jane.app/thumbs/8d6c21c5-24ad-45a7-acfe-71d59750b65b)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/c3b7023e-a8a6-4e32-82d6-aa27572a803a)
- ![](https://jane.app/thumbs/59f14fe7-e94e-4892-b350-f77cdfc69b81)
- ![](https://jane.app/thumbs/0f8d2c39-825b-40df-92a3-f5cfef1f04c4)
- ![](https://jane.app/thumbs/a6902c3f-7b00-4928-b43f-9035a24cc8ec)
- ![](https://jane.app/thumbs/bafa7bd5-7d5f-4e11-abc3-c3c5009f939a)
- ![](https://jane.app/thumbs/e8f4ad2c-b817-499f-88fb-495b87e0c8fb)
- ![](https://jane.app/thumbs/79004979-a8e7-48c1-a1cd-43963c803b54)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/15ab917f-879e-4534-ba19-be420a1983a7)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/bc0250c7-6aca-40e2-947d-6154243ceaca)
- ![](https://jane.app/thumbs/4bbf083a-7c8c-4ce3-ac44-e141f6370f17)
- ![](https://jane.app/thumbs/8be76a68-7dd1-4622-9391-323320fb25a6)
- ![](https://jane.app/thumbs/c0d67695-59a0-4d52-acd8-b0bf0f1d6fbb)
- ![](https://jane.app/thumbs/b10807b5-d9b1-462c-8a83-0284652244e0)
- ![](https://jane.app/thumbs/ac2c9f81-6343-4c9f-a975-8a81306d25d9)
- ![](https://jane.app/thumbs/2444f7c0-fefa-437c-a4ff-06ea6cf0cd84)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/d8237e06-61f7-4d8b-ae53-e95c33de6db1)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/afcbbe3e-a81c-45e0-a36d-8cf90b48c719)
- ![](https://jane.app/thumbs/6a85b5f6-ec7a-4227-a24b-71d1042fa1c7)
- ![](https://jane.app/thumbs/7fcf7f53-dadc-42e8-b955-36e552cb379d)
- ![](https://jane.app/thumbs/23c451b7-d5ad-4eaf-83d4-2481728b85f6)
- ![](https://jane.app/thumbs/25108f18-0172-4d90-8843-7c1bddfea1a4)
- ![](https://jane.app/thumbs/f57d35c5-1ab2-45ed-b38d-64395aed9f4e)
- ![](https://jane.app/thumbs/fb5d1582-c475-4058-beba-1dffb4829769)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/4d4a3594-5be6-4889-9315-2d290d363da2)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/dd754732-411a-49ff-abfa-b80f32064e01)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/764bf81b-1233-4b71-a381-893eec3ccc71)
- ![](https://jane.app/thumbs/675f438a-8b36-487b-a2d6-44aa74895943)
- ![](https://jane.app/thumbs/6813a9ac-d311-447a-ad58-231f0875d709)
- ![](https://jane.app/thumbs/5f4e86e5-24c9-4610-9e32-1d6063db416a)
- ![](https://jane.app/thumbs/1d02e155-0c6c-49c1-aeab-1b72403b76cd)
- ![](https://jane.app/thumbs/8fde1421-516c-43e7-9a53-88ca8f2174f4)
- ![](https://jane.app/thumbs/d6d3e479-b9d8-4f5b-a537-ec958cc8a4de)
- ![](https://jane.app/thumbs/6eca8a52-f4ca-4cf9-b039-679889faa586)
- ![](https://jane.app/thumbs/1a46ef7a-b687-4913-9883-bba1985655f1)
- ![](https://jane.app/thumbs/31cce8d1-59a9-4549-9104-846fac033336)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/2d2a0a85-4235-471c-b7c0-cde8265484df)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/a0eef44a-5e60-4f7f-8bc8-8cb35e424260)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/375a7754-ec6b-4649-a0ff-baa5921048a3)
- ![a screenshot of resources in the appointment panel](https://jane.app/thumbs/3ea2c020-1610-411d-8c63-26785a469a29)
- ![](https://jane.app/thumbs/19b08a90-0491-42c4-9b8e-23b372036f74)
- ![See Jane run your practice](https://jane.app/assets/see-jane-run-3391a88ce3b589c298b8f49eed29f6e88b867c00e0cf51fcb2294d395acd6472.svg)
