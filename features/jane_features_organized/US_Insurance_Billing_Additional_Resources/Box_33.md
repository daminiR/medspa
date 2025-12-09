# Box 33

*Source: [https://jane.app/guide/box-33](https://jane.app/guide/box-33)*

*Category: US Insurance Billing Additional Resources*

*Scraped: 2025-08-07 04:24:19*

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
Feature OverviewBox 33
US Insurance Billing Additional Resources
Box 33
14 min read
Practice Plan
Thrive Plan
Box 33
Skip to the box you’re looking for:
Box 33
Box 33a
Box 33b
Box 33 - Billing Provider Info
What’s in box 33?
This box contains the Billing Provider’s name, address, and phone number. This information lets the Insurance company know where to direct payment.
Note that the Billing Provider can be an
individual
or a
group/organization
. This depends on how a practitioner is contracted with an Insurance company.
Where to configure box 33 in Jane
There are
two
different areas that can be used to configure box 33 on both CMS1500 and EDI files:
Option 1: Clinic Location
This is the preferred option when all practitioners at your clinic require the same information in box 33 for all Insurance companies. If more flexibility is required (i.e. some Insurance companies require each practitioner’s name in box 33), then scroll down to
Option 2
.
This information is set up within
Settings > Locations> Edit Location
. If the
Location Address is the same as the Billing Address
, then you would need to ensure to select
Use my location address for billing
under the heading
Billing Address
. If the Billing Address is different from the Location Address, de-select
Use my location address for billing
& any information entered in the fields under the heading Billing Address will be used instead.
OR
Option 2: Staff Insurance Billing Settings
This is the preferred option when practitioners need a little more flexibility with box 33.
Within each Staff Member’s Billing tab, both
Default Claim Information
and
Insurance Specific Claim Information
can be configured.
Personalizing Billing Details: Default Claim Information
If a provider at your clinic wants a custom name and/or address in box 33 (that differs from the Location Billing Info), and they want that same information for
all Insurance companies
they bill, then all they need to do is add
Default Claim Information
.
To add Default Claim Information, head to
Staff Profile > Billing
and click the
View
button beside your Default Claim Info.
To add a
Custom Billing Provider Name
, check the ‘
Staff Member is the Billing Provider?
’ box. Note that you will need to enter both a First and Last name. If you have a Custom Billing Provider Name entered, then it will be used on the CMS1500 and EDI files instead of the Location Billing Legal name.
📍
Key Note:
If you add a Custom Billing Provider Name to your Staff Billing Settings, you will likely also need to add a
Custom Billing Provider NPI
in Box 33a. If you don’t, you will likely experience rejected claims.
When you submit a Custom Billing Provider Name, you are essentially saying the billing provider is an individual. If you don’t add Custom Billing Provider NPI, then your Organization NPI (set in your location) is sent. This means you’re telling the Insurance company that the Billing Provider has an Organizational NPI but is an individual, which is quite confusing!
To add a
Custom Billing Provider Address
, check the ‘
Use Customer Billing Provider Address?
’ box. Note that all address fields will need to be completed. If you have a Custom Billing Provider Address, then Jane will use it on the CMS1500 and EDI files instead of the Location Billing Address.
Adding Insurance Specific Claim Information
If a provider needs the same info in box 33 for most Insurance companies they bill, but there are a few Insurers that require different information, then in addition to creating default claim information, they may need to set up
Insurance Specific Claim Information
. This can be set up in the same way as Default Claim Information (see above).
For example, if I am contracted with most Insurers under a group/organization, but I’m contracted with
Blue Cross/Blue Shield
as an individual, then I can head to my
Staff Profile> Billing
tab, and click
Add New
under
Insurance Specific Claim Information
.
Here, you can select the Insurance company you are required to submit custom information for (ex. Blue Cross/Blue Shield) and enter a
Custom Billing Provider Name
and/or a
Custom Billing Provider Address
.
Note:
The
phone number
listed in box 33 will always come from the phone number present in the
Location
(Settings> Clinic Info & Locations) where the service/sale was scheduled.
Which boxes are mandatory?
The
billing provider name
and
address
are
optional
when setting up a Location in Jane, but are
required
on the CMS1500, so should be treated as required in Jane. The
phone number
is
optional
and can be treated as optional.
The
billing provider name
and
address
are
required
when billing via EDI file. The
phone number
is
optional.
Box 33 in EDI files
The Billing Provider info is sent in
Loop 2010AA - Billing Provider.
The Billing Location Name or Billing Provider Last Name is sent in
Loop 2010AA - Billing Provider,Segment NM103.
The Billing Provider First Name (if present) is sent in
Loop 2010AA, Segment NM104
.
The Billing Provider Address is sent in
Loop 2010AA, Segments NM3 and N4
.
Street Address line 1 is sent in N301
Street Address line 2 (if present) is sent in N302
City is sent in N401
State is sent in N402
Zip Code is sent in N403
The Location Phone Number is not sent in the Billing Provider Loop in EDI files.
The Location Phone Number is sent in
Loop 1000A - Submitter Info, Segment PER04
.
📍Key differences between the CMS1500 & EDI
Address line 2 is not included on CMS1500s, but it is included on EDIs.
Location Phone Number is only relevant to the Billing Provider on CMS1500s.
Box 33a - Billing Provider NPI
What’s in box 33A?
This box contains the Billing Provider’s NPI. This can either be the NPI of an individual (usually the Rendering Provider), or it can be an organizational type 2 NPI if the claim is being billed under a group. The NPI in this box helps the Insurer identify the individual or group billing the claim.
Where to configure Box 33A in Jane
There are
two
different areas that can be used to fill box 33a on both the CMS1500 and EDI files:
Option 1: Clinic Location
This is the preferred option if all staff members at your clinic bill under the same group (Type 2) NPI to all Insurance companies. If more flexibility is required (i.e. some staff members need to send a different NPI in box 33a), then scroll down to option 2.
This information is set up within
Settings > Locations
. If you have multiple Locations, you’ll need to enter this information for all Locations.
If a staff member does not have a
Custom Billing Provider NPI
configured in their Staff Profile> Billing settings, then the NPI in the Location where the service/sale took place will be used in box 33a on all claim submissions.
Option 2: Staff Insurance Billing Settings
If a provider needs a custom NPI to be sent in box 33a, or they need the same NPI but sent as an Individual/Type 1 NPI for one or more Insurers, then they’ll need to set up
Default
and/or
Insurance Specific Claim Information
in their Staff Profile Billing Settings.
Personalizing Billing Details: Default Claim Information
If a provider needs a custom NPI in box 33a for all or most Insurers that they bill, they’ll want to set
Default Claim Information.
To add Default Claim Information, head to
Staff Profile > Billing
and click the
View
button beside your Default Claim Info.
To add a
Custom Billing Provider NPI
&
NPI Type
, check the
‘Us Custom Billing Provider NPI?’
box. Be sure to add the NPI and the NPI type. If you have a Custom Billing Provider NPI entered, then it will be used on the CMS1500 and EDI files instead of the NPI that’s present in your Clinic Location.
Adding Insurance Specific Claim Information
If a provider only needs a custom NPI in box 33a for a couple of Insurers (and otherwise wants to use the NPI in the Clinic Location or in their Default Claim Information), then they likely need to set up
Insurance Specific Claim Information
. This can be set up in the same way as Default Claim Information (see above).
For example, if I am contracted with most Insurers under a group/organization NPI, but I’m contracted with
Blue Cross/Blue Shield
with my individual NPI, then I can head to my
Staff Profile> Billing
tab, and click click
Add New
under
Insurance Specific Claim Information.
Next, select the Insurance company you are required to submit custom information to (ex. Blue Cross/Blue Shield). Lastly, enter in a
Custom Billing Provider NPI
and
NPI Type
and Save.
Which boxes are mandatory?
The
billing provider NPI
is
optional
when setting up a Location in Jane, but is
required
on the CMS1500, so should be treated as required in Jane.
The
billing provider NPI
is
required
when billing via EDI file.
Box 33A in EDI files
The Billing Provider NPI & NPI type is sent in
Loop 2010AA - Billing Provider Info
The
Billing Provider NPI Type
(Individual/Type 1 or Organization/Type 2) is sent in
Loop 2010AA, Segment NM102
.
If the NPI Type is Individual, then ‘1’ will be sent
If the NPI Type is Organization, then ‘2’ will be sent
The Billing Provider NPI is sent in
Loop 2010AA, Segment NM109
.
Note that the qualifier that denotes an NPI (‘XX’) is sent in
Loop 2010AA, Segment NM108.
The qualifier
‘85’
, which means Billing Provider, is sent in
Loop 2010AA, Segment NM102.
📍
Key note about the billing NPI
If you do not have a
Custom Billing Provider NPI
and
NPI Type
in your Staff Insurance Billing settings, then the NPI in the
Location
will be used. The Location NPI is sent as an Organization/Type 2 NPI.
If you do have a Customer Billing Provider NPI and NPI type, you can choose to send the NPI as an Individual/Type 1 or Organization/Type 2.
Box 33b - Billing Provider Secondary ID
What’s in box 33b?
This box is used to indicate the non-NPI payer-assigned identifier of the Billing Provider. This box would be used in cases where Insurers require, for example, that claims be submitted with the Billing Provider’s Taxonomy in 33b.
This box should only be used if advised by the payer
.
Where to configure box 33b in Jane
If one or more Insurers require that you submit claims with a Billing Provider Taxonomy, then you can enter a Taxonomy within your
Staff Profile> Billing> Default and/or Insurance Specific Claim Information.
If
all
Insurers you submit to require the same Taxonomy in box 33b, then you can just set up
Default Claim Information
. If
only some
Insurers require a Taxonomy for Billing Provider identification, then
Insurance Specific Claim Information
will be needed.
Which boxes are mandatory?
A
Taxonomy Code
is
optional
when generating a CMS1500 in Jane.
A
Taxonomy Code
is
optional
when billing via EDI file.
Note:
You should only enter a Taxonomy Code if advised to do so by an Insurance company. Sending a Taxonomy Code in this box when the Insurer isn’t expecting one can cause a rejection.
Box 33b in EDI files
If present, the Taxonomy Code is sent in
HL Loop 2000A - Billing Provider Info
The Taxonomy Code is sent in Segment
PRV03
Note the qualifier
‘BI’
, which means Billing, is sent in
PRV01
. This tells the Insurer that the ID in this segment belongs to the Billing Provider.
Note, that the Taxonomy qualifier
‘PXC’
, which is used to tell the Insurer the non-NPI billing provider ID is a Taxonomy, is sent in
Segment PRV02
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
How to reset your email password and enable Two-Factor Authentication (2FA)Box 33
US Insurance Billing Additional Resources
Box 33
14 min read
Practice Plan
Thrive PlanBox 33
Skip to the box you’re looking for:
Box 33
Box 33a
Box 33b
Box 33 - Billing Provider Info
What’s in box 33?
This box contains the Billing Provider’s name, address, and phone number. This information lets the Insurance company know where to direct payment.
Note that the Billing Provider can be an
individual
or a
group/organization
. This depends on how a practitioner is contracted with an Insurance company.
Where to configure box 33 in Jane
There are
two
different areas that can be used to configure box 33 on both CMS1500 and EDI files:
Option 1: Clinic Location
This is the preferred option when all practitioners at your clinic require the same information in box 33 for all Insurance companies. If more flexibility is required (i.e. some Insurance companies require each practitioner’s name in box 33), then scroll down to
Option 2
.
This information is set up within
Settings > Locations> Edit Location
. If the
Location Address is the same as the Billing Address
, then you would need to ensure to select
Use my location address for billing
under the heading
Billing Address
. If the Billing Address is different from the Location Address, de-select
Use my location address for billing
& any information entered in the fields under the heading Billing Address will be used instead.
OR
Option 2: Staff Insurance Billing Settings
This is the preferred option when practitioners need a little more flexibility with box 33.
Within each Staff Member’s Billing tab, both
Default Claim Information
and
Insurance Specific Claim Information
can be configured.
Personalizing Billing Details: Default Claim Information
If a provider at your clinic wants a custom name and/or address in box 33 (that differs from the Location Billing Info), and they want that same information for
all Insurance companies
they bill, then all they need to do is add
Default Claim Information
.
To add Default Claim Information, head to
Staff Profile > Billing
and click the
View
button beside your Default Claim Info.
To add a
Custom Billing Provider Name
, check the ‘
Staff Member is the Billing Provider?
’ box. Note that you will need to enter both a First and Last name. If you have a Custom Billing Provider Name entered, then it will be used on the CMS1500 and EDI files instead of the Location Billing Legal name.
📍
Key Note:
If you add a Custom Billing Provider Name to your Staff Billing Settings, you will likely also need to add a
Custom Billing Provider NPI
in Box 33a. If you don’t, you will likely experience rejected claims.
When you submit a Custom Billing Provider Name, you are essentially saying the billing provider is an individual. If you don’t add Custom Billing Provider NPI, then your Organization NPI (set in your location) is sent. This means you’re telling the Insurance company that the Billing Provider has an Organizational NPI but is an individual, which is quite confusing!
To add a
Custom Billing Provider Address
, check the ‘
Use Customer Billing Provider Address?
’ box. Note that all address fields will need to be completed. If you have a Custom Billing Provider Address, then Jane will use it on the CMS1500 and EDI files instead of the Location Billing Address.
Adding Insurance Specific Claim Information
If a provider needs the same info in box 33 for most Insurance companies they bill, but there are a few Insurers that require different information, then in addition to creating default claim information, they may need to set up
Insurance Specific Claim Information
. This can be set up in the same way as Default Claim Information (see above).
For example, if I am contracted with most Insurers under a group/organization, but I’m contracted with
Blue Cross/Blue Shield
as an individual, then I can head to my
Staff Profile> Billing
tab, and click
Add New
under
Insurance Specific Claim Information
.
Here, you can select the Insurance company you are required to submit custom information for (ex. Blue Cross/Blue Shield) and enter a
Custom Billing Provider Name
and/or a
Custom Billing Provider Address
.
Note:
The
phone number
listed in box 33 will always come from the phone number present in the
Location
(Settings> Clinic Info & Locations) where the service/sale was scheduled.
Which boxes are mandatory?
The
billing provider name
and
address
are
optional
when setting up a Location in Jane, but are
required
on the CMS1500, so should be treated as required in Jane. The
phone number
is
optional
and can be treated as optional.
The
billing provider name
and
address
are
required
when billing via EDI file. The
phone number
is
optional.
Box 33 in EDI files
The Billing Provider info is sent in
Loop 2010AA - Billing Provider.
The Billing Location Name or Billing Provider Last Name is sent in
Loop 2010AA - Billing Provider,Segment NM103.
The Billing Provider First Name (if present) is sent in
Loop 2010AA, Segment NM104
.
The Billing Provider Address is sent in
Loop 2010AA, Segments NM3 and N4
.
Street Address line 1 is sent in N301
Street Address line 2 (if present) is sent in N302
City is sent in N401
State is sent in N402
Zip Code is sent in N403
The Location Phone Number is not sent in the Billing Provider Loop in EDI files.
The Location Phone Number is sent in
Loop 1000A - Submitter Info, Segment PER04
.
📍Key differences between the CMS1500 & EDI
Address line 2 is not included on CMS1500s, but it is included on EDIs.
Location Phone Number is only relevant to the Billing Provider on CMS1500s.
Box 33a - Billing Provider NPI
What’s in box 33A?
This box contains the Billing Provider’s NPI. This can either be the NPI of an individual (usually the Rendering Provider), or it can be an organizational type 2 NPI if the claim is being billed under a group. The NPI in this box helps the Insurer identify the individual or group billing the claim.
Where to configure Box 33A in Jane
There are
two
different areas that can be used to fill box 33a on both the CMS1500 and EDI files:
Option 1: Clinic Location
This is the preferred option if all staff members at your clinic bill under the same group (Type 2) NPI to all Insurance companies. If more flexibility is required (i.e. some staff members need to send a different NPI in box 33a), then scroll down to option 2.
This information is set up within
Settings > Locations
. If you have multiple Locations, you’ll need to enter this information for all Locations.
If a staff member does not have a
Custom Billing Provider NPI
configured in their Staff Profile> Billing settings, then the NPI in the Location where the service/sale took place will be used in box 33a on all claim submissions.
Option 2: Staff Insurance Billing Settings
If a provider needs a custom NPI to be sent in box 33a, or they need the same NPI but sent as an Individual/Type 1 NPI for one or more Insurers, then they’ll need to set up
Default
and/or
Insurance Specific Claim Information
in their Staff Profile Billing Settings.
Personalizing Billing Details: Default Claim Information
If a provider needs a custom NPI in box 33a for all or most Insurers that they bill, they’ll want to set
Default Claim Information.
To add Default Claim Information, head to
Staff Profile > Billing
and click the
View
button beside your Default Claim Info.
To add a
Custom Billing Provider NPI
&
NPI Type
, check the
‘Us Custom Billing Provider NPI?’
box. Be sure to add the NPI and the NPI type. If you have a Custom Billing Provider NPI entered, then it will be used on the CMS1500 and EDI files instead of the NPI that’s present in your Clinic Location.
Adding Insurance Specific Claim Information
If a provider only needs a custom NPI in box 33a for a couple of Insurers (and otherwise wants to use the NPI in the Clinic Location or in their Default Claim Information), then they likely need to set up
Insurance Specific Claim Information
. This can be set up in the same way as Default Claim Information (see above).
For example, if I am contracted with most Insurers under a group/organization NPI, but I’m contracted with
Blue Cross/Blue Shield
with my individual NPI, then I can head to my
Staff Profile> Billing
tab, and click click
Add New
under
Insurance Specific Claim Information.
Next, select the Insurance company you are required to submit custom information to (ex. Blue Cross/Blue Shield). Lastly, enter in a
Custom Billing Provider NPI
and
NPI Type
and Save.
Which boxes are mandatory?
The
billing provider NPI
is
optional
when setting up a Location in Jane, but is
required
on the CMS1500, so should be treated as required in Jane.
The
billing provider NPI
is
required
when billing via EDI file.
Box 33A in EDI files
The Billing Provider NPI & NPI type is sent in
Loop 2010AA - Billing Provider Info
The
Billing Provider NPI Type
(Individual/Type 1 or Organization/Type 2) is sent in
Loop 2010AA, Segment NM102
.
If the NPI Type is Individual, then ‘1’ will be sent
If the NPI Type is Organization, then ‘2’ will be sent
The Billing Provider NPI is sent in
Loop 2010AA, Segment NM109
.
Note that the qualifier that denotes an NPI (‘XX’) is sent in
Loop 2010AA, Segment NM108.
The qualifier
‘85’
, which means Billing Provider, is sent in
Loop 2010AA, Segment NM102.
📍
Key note about the billing NPI
If you do not have a
Custom Billing Provider NPI
and
NPI Type
in your Staff Insurance Billing settings, then the NPI in the
Location
will be used. The Location NPI is sent as an Organization/Type 2 NPI.
If you do have a Customer Billing Provider NPI and NPI type, you can choose to send the NPI as an Individual/Type 1 or Organization/Type 2.
Box 33b - Billing Provider Secondary ID
What’s in box 33b?
This box is used to indicate the non-NPI payer-assigned identifier of the Billing Provider. This box would be used in cases where Insurers require, for example, that claims be submitted with the Billing Provider’s Taxonomy in 33b.
This box should only be used if advised by the payer
.
Where to configure box 33b in Jane
If one or more Insurers require that you submit claims with a Billing Provider Taxonomy, then you can enter a Taxonomy within your
Staff Profile> Billing> Default and/or Insurance Specific Claim Information.
If
all
Insurers you submit to require the same Taxonomy in box 33b, then you can just set up
Default Claim Information
. If
only some
Insurers require a Taxonomy for Billing Provider identification, then
Insurance Specific Claim Information
will be needed.
Which boxes are mandatory?
A
Taxonomy Code
is
optional
when generating a CMS1500 in Jane.
A
Taxonomy Code
is
optional
when billing via EDI file.
Note:
You should only enter a Taxonomy Code if advised to do so by an Insurance company. Sending a Taxonomy Code in this box when the Insurer isn’t expecting one can cause a rejection.
Box 33b in EDI files
If present, the Taxonomy Code is sent in
HL Loop 2000A - Billing Provider Info
The Taxonomy Code is sent in Segment
PRV03
Note the qualifier
‘BI’
, which means Billing, is sent in
PRV01
. This tells the Insurer that the ID in this segment belongs to the Billing Provider.
Note, that the Taxonomy qualifier
‘PXC’
, which is used to tell the Insurer the non-NPI billing provider ID is a Taxonomy, is sent in
Segment PRV02
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
- ![](https://jane.app/thumbs/8ad8d02e-e92d-4848-88cf-922ba1edb940)
- ![](https://jane.app/thumbs/6d5f076a-6171-42d0-9ccc-526d47def894)
- ![](https://jane.app/thumbs/b5824906-2790-4146-af94-ce2eff752ae2)
- ![](https://jane.app/thumbs/532725f3-e487-45f4-a1ce-6ac3f230af83)
- ![](https://jane.app/thumbs/2bcd91da-7549-4cc8-937d-aa3f1b0a9ea5)
- ![](https://jane.app/thumbs/b344cfec-8e62-4aea-9c65-708bd140dfc0)
- ![](https://jane.app/thumbs/64aa27d0-ec88-4694-b58d-4126d8f4ae37)
- ![](https://jane.app/thumbs/f6e9c953-fbf0-4485-a0b7-6b9424203458)
- ![](https://jane.app/thumbs/54301158-b58d-4035-a390-2d53d79a184e)
- ![](https://jane.app/thumbs/75c50552-c627-4ec3-b9ad-28d278c9925d)
- ![](https://jane.app/thumbs/6d5f076a-6171-42d0-9ccc-526d47def894)
- ![](https://jane.app/thumbs/caec22eb-168e-45a7-94c2-cf110cbac309)
- ![](https://jane.app/thumbs/7a28aa3b-36f2-436a-b37b-b9cc07ccc1fc)
- ![](https://jane.app/thumbs/662294a5-0d33-4d31-a7aa-9a9bb0a81da1)
- ![](https://jane.app/thumbs/7d950294-0cb4-4008-be28-51f2a50d794e)
- ![](https://jane.app/thumbs/c9fe198f-b019-4686-aa78-93df46625ca4)
- ![](https://jane.app/thumbs/df23c7d4-6d51-42da-9609-76ece13f34ac)
- ![](https://jane.app/thumbs/2722ab5a-d473-4cf3-acc3-931b935f31ad)
- ![](https://jane.app/thumbs/132a9d4c-3241-435a-96bc-ea8652a77f39)
- ![](https://jane.app/thumbs/7cf454b9-3f84-479b-be40-4de163b29363)
- ![See Jane run your practice](https://jane.app/assets/see-jane-run-3391a88ce3b589c298b8f49eed29f6e88b867c00e0cf51fcb2294d395acd6472.svg)
