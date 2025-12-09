# Box 24

*Source: [https://jane.app/guide/box-24](https://jane.app/guide/box-24)*

*Category: US Insurance Billing Additional Resources*

*Scraped: 2025-08-07 04:09:42*

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
Feature OverviewBox 24
US Insurance Billing Additional Resources
Box 24
22 min read
Practice Plan
Thrive Plan
Skip to the box you’re looking for:
.
Box 24
Box 24a
Box 24b
Box 24c
Box 24d
Box 24e
Box 24f
Box 24g
Box 24h
Box 24i
Box 24j
Box 24- Service Lines Shaded (1-6)
What’s in the box?
This box is used to communicate additional information about the service line.
When billing an Unlisted CPT code, Jane will include the billing code Label in this box to communicate what was performed to the insurer. Learn more about billing Unlisted CPT codes
here
.
When submitting to
secondary payers
, oftentimes adjudication information from the primary payer is sent in this line.
Where does this info live in Jane?
You can manually add info to this box after generating a CMS1500.
Box 24a- Date(s) of Service
What’s in the box?
This box indicates the date a procedure was performed. It contains a section for a
From
and
To
date, but these dates will always be the same in Jane.
📌
Note:
If your practice would like to be able to include a different date range in this box, let us know why!
Where does this info live in Jane?
The date of the appointment on the Schedule (or purchase date of the product) is automatically used for every procedure.
Is this required?
Yes - but there’s nothing extra you have to do to set this box.
What about the EDI file?
The Date of Service is sent in
Loop 2400 - Service Line Info
For
each procedure
billed on a claim, the Date of Service is sent in
Loop 2400, DTP03
DTP01 includes the qualifier
472
, which means
Service
Box 24b- Place of Service Code
What’s in the box?
The
Place of Service
(POS) code identifies the type of location where the service was rendered. There is a spot for a POS code for each procedure being billed.
Where does this info live in Jane?
When creating or editing a
Location
, you can
assign a default POS code
that will be the default for all of your treatments.
This is found in
Settings > Locations > Edit > Place of Service Code.
Each POS code is
two digits
, and we regularly update our list. If you can’t find a POS code that you need, then let us know and we’ll add it!
If you have some treatments that are offered in a different location than your default POS (virtual visits are a great example of this!) then you can override this by updating the POS code in the treatment setting.
You can read more about Place of Service codes here:
Setting a Place of Service Code
.
What about the EDI file?
The Place of Service code is sent in
Loop 2300 - Claim Info
.
Specifically:
The Place of Service Code is sent in
Loop 2300, Segment CLM05
Box 24c- Emergency Service
What’s in the box?
This Box indicates that the procedure was performed to address a medical emergency.
Where does this info live in Jane?
This box is not currently supported in Jane (blank by default on the CMS1500). If your practice would like this box to be supported, let us know!
Box 24d- CPT & Modifier(s)
What’s in the box?
This Box indicates the procedure that was performed (applicable
CPT code
) as well as any
Modifiers
(limit of 4) made on the procedure.
On each claim form, a maximum of
6 procedures
can be billed.
📍
Key Note:
This limit only applies to the CMS1500. The limit of 6 procedures doesn’t apply to electronic submissions.
Where does this info live in Jane?
You can add CPT codes to an appointment in multiple areas of Jane. From the
Schedule
, you can add CPT codes under the
Insurance Info
section of the Appointment Panel.
Once you’ve added a code, you’ll be given the option to add a
Modifier.
There’s a little box under each CPT where you can do this. Simply type in your two-digit Modifier, and press the Enter on your keyboard.
📍
Key Note:
The order of the CPT codes on your claim form mirrors the order of the codes attached to the Insurance Policy in the Appointment Panel.
Before you start billing Insurance, you’ll want to make sure you’ve
assigned fees
to your CPT codes. This can be done in
Settings > Billing Codes
. For more info on setting up your billing codes, check out our Insurance Billing Course:
US Insurance Step 2
.
For more info on adding CPT codes to your appointments, have a look at the following guide:
Start Billing 2: CPT & Diagnosis codes
.
Lastly, you can save some time when billing by setting up some
Default Modifiers
. To learn how, you can check out our guide on
Billing Code Default Allowed Amounts & Modifiers
.
Is this required?
You need
at least one CPT
code to bill a claim, but Modifiers are
optional.
You should follow instructions from the Insurance company if you’re unsure about Modifier requirements.
What about the EDI file?
CPT code info is sent in
Loop 2400 - Service Line Info.
An
SV1
segment is sent for each CPT code on the claim.
SV101
includes both the CPT code and any modifiers assigned to that code
SV101-02
includes the CPT code
SV101-03
includes the CPT code modifier(s)
Copy of Box 24e - Diagnosis Pointer
What’s in the box?
This Box ‘points’ to the applicable diagnosis codes reported in
Box 21
for each CPT code (i.e. Procedure 99204 was performed to treat the diagnosis A, B, and C). Note that the first code listed is the
primary diagnosis
.
Where does this info live in Jane?
Diagnosis codes can be added to an
Appointment
as soon as you’ve added the CPT code(s). There’s a little box under each CPT code where you can add and rearrange your diagnosis codes.
For more info on adding CPT & diagnosis codes to your appointments, you can check out our guide:
Start Billing 2: CPT & Diagnosis codes
.
Is this required?
Yes. Each procedure needs to point to at least one diagnosis code. However, Jane assigns the pointers on the claim for you based on which diagnosis codes you’ve added— and the order in which you’ve added them— to the appointment.
What about the EDI file?
CPT code info is sent in
Loop 2400 - Service Line Info.
An
SV1
segment
**
is sent for each CPT code on the claim.
SV101 includes the CPT code
SV107
includes the diagnosis code pointers
Each sub-element of SV107 points to a specific diagnosis code. A procedure can point to a
maximum of 12 diagnosis codes
.
The first diagnosis code (sub-element
SV107-01
) is the
primary diagnosis
for the procedure. Subsequent diagnosis codes are listed in an order of declining importance to the procedure.
📍 Pro Tip
On the CMS1500, diagnosis pointers are managed with letters (A-L) but on the EDI they are managed with numbers (1-12).
Box 24f - Charges (CPT Price)
What’s in the box?
This Box indicates the price of a procedure (CPT code). Note that
Box 28
reflects the sum of all procedure charges.
Where does this info live in Jane?
Before you start billing Insurance, you’ll want to make sure you’ve
assigned fees
to your CPT codes. This can be done in
Settings > Billing Codes
. For more info on setting up your billing codes, check out our Insurance Billing Course:
US Insurance Step 2
.
For more info on adding CPT codes to your appointments, have a look at the following guide:
Start Billing 2: CPT & Diagnosis codes
.
Jane uses the price assigned to the CPT code (Settings > Billing Codes) for each procedure on the CMS1500.
📍
Key Note:
The price of the treatment (which is configured in Settings > Treatments & Classes)
is not considered when billing Insurance
. When you add a billing code to a visit in Jane, the billing code fee
overrides the price of the treatment
(aka your ‘cash’ price).
Is this required?
Yes! A claim must have at least one CPT code, and if you don’t assign a price to your CPT codes, it will look like you’re billing $0 claims.
What about the EDI file?
CPT code fees are sent in
Loop 2400 - Service Line Info.
An
SV1
segment
**
is sent for each CPT code on the claim.
SV101-02 includes the CPT code
SV102
includes the
price
of the CPT code
Box 24g - CPT Units
What’s in the box?
The number of billed units of a particular CPT code.
Where does this info live in Jane?
After adding a CPT code to an Appointment, you can change the number of units simply by clicking on the price of the code.
For more info on adding CPT codes to your appointments, have a look at the following guide:
Start Billing 2: CPT & Diagnosis codes
.
Is this required?
Yes - each CPT code needs an assigned number of units. By default, CPT codes are billed for a
single
unit in Jane.
What about the EDI file?
CPT code info is sent in
Loop 2400 - Service Line Info.
An
SV1 segment
is sent for each CPT code on the claim.
SV101 includes the CPT code
SV102 includes the price of the CPT code
SV103 is hardcoded to
UN
, which indicates the procedure is billed in terms of units
> 📍
Note
: we always send
UN
, but it is possible that some providers need to bill in
minutes
instead of units, in which case
MJ
would be needed. We don’t currently support minutes, but let us know if this is something your practice needs!
SV104
includes the number of
units
Box 24h - EPSDT/Family Planning
What’s in the box?
Box 24h is used to identify services that may be covered under specific state-funded plans.
EPSDT info is sent in the shaded portion of 24H, while Family Planning info is sent in the unshaded portion of box 24H.
📍Note that Jane supports EPSDT information on paper and electronic claims. If your practice would like support for Family Planning info, let us know!
Where does this info live in Jane?
Clinics can set EPSDT Referral info in a patient’s insurance policy.
By default, this field will be set to “Not Applicable” for all insurance policies. When set to “Not Applicable”,  nothing will get sent in the shaded portion of Box 24H. If a different option is chosen, the corresponding qualifier code will be sent in the shaded portion of Box 24H (i.e.
NU
for Not Used).
Is this required?
EPSDT information is only required by Medicaid in some states depending on your speciality and services.
What about the EDI file?
The 837p implementation is a little more complicated than the CMS1500 implementation. It all depends on what you’ve selected in the patient’s policy!
Box 24i - Rendering Provider ID Type
What’s in the box?
This box indicates the type of identifying number that is reported in
box 24j
of the CMS1500. This info helps the Insurer identify the rendering provider.
There is a
shaded
and
unshaded
section of Box 24i for each service line.
Unshaded:
Includes text ‘NPI’ by default.
Shaded:
Blank by default.
Only used if a non-NPI rendering provider identifier (i.e. staff License number) or Rendering Provider Taxonomy Code needs to be reported.
If the shaded area of box 24i is used, then a 2-digit qualifier will be sent to identify the type of number being reported in box 24j.
Here’s a list of qualifiers that are currently supported:
State License (OB)
Provider UPIN (1G)
Provider Commercial Number (G2)
Location Number (LU)
Taxonomy (ZZ)
Where does this info live in Jane?
The Rendering Provider ID is set within a Staff Member’s Billing tab, specifically within the
Default Claim Information
or within an
Insurance Specific Claim Information
form.
There’s nothing extra required to set box 24i if the Insurance company requires an NPI to identify the rendering provider!
However, if the Insurance company requires a License number (a non-NPI ID), then you will need to click the
‘Use License Number instead of NPI?’
option when setting up your claim information and enter a
License Number
and
License Type.
The
License Type
will set the qualifier in box 24i of the CMS1500.
📍
Key Note:
The majority of Insurance companies require a Rendering Provider NPI. Only use a Rendering Provider License Number if advised to by the Insurance company.
If an Insurance company requires a Taxonomy Code to accompany the Rendering Provider NPI, then the qualifier ‘ZZ’ will be set in the shaded area of box 24i.
Is this required?
You are
required
to specify the types of numbers that identify the Rendering Provider.
What about the EDI file?
The Rendering Provider ID Type is sent in
Loop 2310B - Rendering Provider Info
. What qualifier is used and where it’s sent depends on whether the ID is an
NPI
(most common) or a
License Number
.
If an
NPI
is used, then the
‘XX’
qualifier will be included in
Loop 2310B, Segment NM108
.
If a
Taxonomy Code
is sent along with an
NPI
, then it is sent in
Loop 2310B, Segment PRV.
The qualifier ‘PXC’, which is the EDI qualifier for Taxonomy Codes, is sent in PRV02
The Taxonomy Code is sent in PRV03
If a
License Number
is used, then the
License Number Type
you’ve selected will determine the qualifier sent in
Loop 2310B, Segment PRV02
.
Here is the list of Rendering Provider IDs available in Jane with their qualifiers in brackets:
NPI (XX)
State License (OB)
Provider UPIN (1G)
Provider Commercial Number (G2)
Location Number (LU)
Taxonomy (PXC)
Box 24j - Rendering Provider ID Number
What’s in the box?
This box is used by the Insurer to identify the provider who performed the service— the Rendering Provider. Note that this box is closely linked with Box 24i, as well as the other sub-sections of box 24.
There is a
shaded
and
unshaded
section of Box 24j for each service line.
Unshaded:
The Rendering Provider NPI is reported in the unshaded section
If a Rendering Provider License ID is used in place of an NPI, then this section is left blank.
Shaded:
In some cases, an Insurer may require that a License or PIN be used instead of the NPI to identify the Rendering Provider. In these cases, the shaded section is used to report the license number.
Some Insurers require the Rendering Provider to report the Taxonomy Code assigned to their NPI. In these cases, the Taxonomy Code is set in this box.
Where does this info live in Jane?
The Rendering Provider ID of the
staff member receiving compensation
for the visit is used in Box 24j. This is typically the staff member who the patient is booked in with,
but not always
(see the
Billing Under a Different Staff Member
section below for more info).
You can check which
Staff member
is receiving compensation for an
Appointment
by hovering your mouse over the
Billing Info
section of the
Appointment Panel
and clicking the blue
View
button that appears.
Rendering Provider IDs are set within a
Staff Member’s Billing tab,
specifically within the
Default Claim Information,
or within an
Insurance Specific Claim Information
form.
The Rendering Provider ID can either be set by adding a
Rendering Provider NPI
or a
License Number
. Note that only
one
Rendering Provider ID can be set (Either an NPI, or a license number, but not both).
Typically, the
Rendering Provider NPI
will be used as the Rendering Provider ID, but in some cases, an Insurance company may identify the rendering provider with a non-NPI identifier. In these cases, click the
‘Use License Number instead of NPI?’
option and enter a
License Number
and
License Type
📍
Key Note:
The majority of Insurance companies require a Rendering Provider NPI. Only use a Rendering Provider License Number if advised to by the Insurance company.
📍
Pro Tip:
Rendering Provider Taxonomy Codes- Some Insurance companies require the main Taxonomy Code assigned to the Rendering Provider NPI in order to identify the Rendering Provider.
Billing Under a Different Staff Member
If you need to bill a claim under a different provider, then you’ll need to change the
staff member receiving compensation
for the Purchase. By default, the staff member receiving compensation will be the staff member with whom the patient is booked.
For example, let’s say that Andy is a student practicing under Susan. Some visits are booked in Andy’s Schedule, but we need to bill claims for those appointments under Susan’s credentials.
For each Insured visit in Andy’s Schedule, we’ll need to edit the Purchase and change the
staff member receiving compensation
from Andy to Susan.
To do this, you can hover your mouse over the
Billing Info
section of the
Appointment Panel
and click the blue
View
button that appears. This will lead you to the
Purchase
screen, where you can use the blue
Change
text next to the Staff Member’s name to switch Practitioners.
Keep in mind that making this change will also affect your Reports. For example, each visit where the staff member receiving compensation is changed will show up under Susan’s
Sales
and
Compensation
Reports (instead of Andy’s).
Is this required?
A Rendering Provider ID (NPI or License) is
required
when billing paper and electronic claims. A Rendering Provider Taxonomy Code is
optional
.
What about the EDI file?
The Rendering Provider ID is sent in
Loop 2310B - Rendering Provider Info
. Where it’s sent depends on whether the ID is an
NPI
(most common) or a
License Number
.
If an
NPI
is used, then it will be included in
Loop 2310B, Segment NM109
.
If a
License Number
is used, then it will be included in Loop 2310B,
Segment REF02
.
Note that the License Number Type (the ‘qualifier’) will be included in Loop 2310B, Segment REF01 - but this maps to box
24i
on the CMS1500
Here is the list of Rendering Provider IDs available in Jane with their qualifiers in brackets:
NPI (XX)
State License (OB)
Provider UPIN (1G)
Provider Commercial Number (G2)
Location Number (LU)
Taxonomy (PXC)
If a
Rendering Provider Taxonomy Code
is used, then it is sent in
Loop 2310B, Segment PRV
The qualifier ‘PXC’, which is the EDI qualifier for Taxonomy Codes, is sent in PRV02
The Taxonomy Code is sent in PRV03
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
How to reset your email password and enable Two-Factor Authentication (2FA)Box 24
US Insurance Billing Additional Resources
Box 24
22 min read
Practice Plan
Thrive PlanSkip to the box you’re looking for:
.
Box 24
Box 24a
Box 24b
Box 24c
Box 24d
Box 24e
Box 24f
Box 24g
Box 24h
Box 24i
Box 24j
Box 24- Service Lines Shaded (1-6)
What’s in the box?
This box is used to communicate additional information about the service line.
When billing an Unlisted CPT code, Jane will include the billing code Label in this box to communicate what was performed to the insurer. Learn more about billing Unlisted CPT codes
here
.
When submitting to
secondary payers
, oftentimes adjudication information from the primary payer is sent in this line.
Where does this info live in Jane?
You can manually add info to this box after generating a CMS1500.
Box 24a- Date(s) of Service
What’s in the box?
This box indicates the date a procedure was performed. It contains a section for a
From
and
To
date, but these dates will always be the same in Jane.
📌
Note:
If your practice would like to be able to include a different date range in this box, let us know why!
Where does this info live in Jane?
The date of the appointment on the Schedule (or purchase date of the product) is automatically used for every procedure.
Is this required?
Yes - but there’s nothing extra you have to do to set this box.
What about the EDI file?
The Date of Service is sent in
Loop 2400 - Service Line Info
For
each procedure
billed on a claim, the Date of Service is sent in
Loop 2400, DTP03
DTP01 includes the qualifier
472
, which means
Service
Box 24b- Place of Service Code
What’s in the box?
The
Place of Service
(POS) code identifies the type of location where the service was rendered. There is a spot for a POS code for each procedure being billed.
Where does this info live in Jane?
When creating or editing a
Location
, you can
assign a default POS code
that will be the default for all of your treatments.
This is found in
Settings > Locations > Edit > Place of Service Code.
Each POS code is
two digits
, and we regularly update our list. If you can’t find a POS code that you need, then let us know and we’ll add it!
If you have some treatments that are offered in a different location than your default POS (virtual visits are a great example of this!) then you can override this by updating the POS code in the treatment setting.
You can read more about Place of Service codes here:
Setting a Place of Service Code
.
What about the EDI file?
The Place of Service code is sent in
Loop 2300 - Claim Info
.
Specifically:
The Place of Service Code is sent in
Loop 2300, Segment CLM05
Box 24c- Emergency Service
What’s in the box?
This Box indicates that the procedure was performed to address a medical emergency.
Where does this info live in Jane?
This box is not currently supported in Jane (blank by default on the CMS1500). If your practice would like this box to be supported, let us know!
Box 24d- CPT & Modifier(s)
What’s in the box?
This Box indicates the procedure that was performed (applicable
CPT code
) as well as any
Modifiers
(limit of 4) made on the procedure.
On each claim form, a maximum of
6 procedures
can be billed.
📍
Key Note:
This limit only applies to the CMS1500. The limit of 6 procedures doesn’t apply to electronic submissions.
Where does this info live in Jane?
You can add CPT codes to an appointment in multiple areas of Jane. From the
Schedule
, you can add CPT codes under the
Insurance Info
section of the Appointment Panel.
Once you’ve added a code, you’ll be given the option to add a
Modifier.
There’s a little box under each CPT where you can do this. Simply type in your two-digit Modifier, and press the Enter on your keyboard.
📍
Key Note:
The order of the CPT codes on your claim form mirrors the order of the codes attached to the Insurance Policy in the Appointment Panel.
Before you start billing Insurance, you’ll want to make sure you’ve
assigned fees
to your CPT codes. This can be done in
Settings > Billing Codes
. For more info on setting up your billing codes, check out our Insurance Billing Course:
US Insurance Step 2
.
For more info on adding CPT codes to your appointments, have a look at the following guide:
Start Billing 2: CPT & Diagnosis codes
.
Lastly, you can save some time when billing by setting up some
Default Modifiers
. To learn how, you can check out our guide on
Billing Code Default Allowed Amounts & Modifiers
.
Is this required?
You need
at least one CPT
code to bill a claim, but Modifiers are
optional.
You should follow instructions from the Insurance company if you’re unsure about Modifier requirements.
What about the EDI file?
CPT code info is sent in
Loop 2400 - Service Line Info.
An
SV1
segment is sent for each CPT code on the claim.
SV101
includes both the CPT code and any modifiers assigned to that code
SV101-02
includes the CPT code
SV101-03
includes the CPT code modifier(s)
Copy of Box 24e - Diagnosis Pointer
What’s in the box?
This Box ‘points’ to the applicable diagnosis codes reported in
Box 21
for each CPT code (i.e. Procedure 99204 was performed to treat the diagnosis A, B, and C). Note that the first code listed is the
primary diagnosis
.
Where does this info live in Jane?
Diagnosis codes can be added to an
Appointment
as soon as you’ve added the CPT code(s). There’s a little box under each CPT code where you can add and rearrange your diagnosis codes.
For more info on adding CPT & diagnosis codes to your appointments, you can check out our guide:
Start Billing 2: CPT & Diagnosis codes
.
Is this required?
Yes. Each procedure needs to point to at least one diagnosis code. However, Jane assigns the pointers on the claim for you based on which diagnosis codes you’ve added— and the order in which you’ve added them— to the appointment.
What about the EDI file?
CPT code info is sent in
Loop 2400 - Service Line Info.
An
SV1
segment
**
is sent for each CPT code on the claim.
SV101 includes the CPT code
SV107
includes the diagnosis code pointers
Each sub-element of SV107 points to a specific diagnosis code. A procedure can point to a
maximum of 12 diagnosis codes
.
The first diagnosis code (sub-element
SV107-01
) is the
primary diagnosis
for the procedure. Subsequent diagnosis codes are listed in an order of declining importance to the procedure.
📍 Pro Tip
On the CMS1500, diagnosis pointers are managed with letters (A-L) but on the EDI they are managed with numbers (1-12).
Box 24f - Charges (CPT Price)
What’s in the box?
This Box indicates the price of a procedure (CPT code). Note that
Box 28
reflects the sum of all procedure charges.
Where does this info live in Jane?
Before you start billing Insurance, you’ll want to make sure you’ve
assigned fees
to your CPT codes. This can be done in
Settings > Billing Codes
. For more info on setting up your billing codes, check out our Insurance Billing Course:
US Insurance Step 2
.
For more info on adding CPT codes to your appointments, have a look at the following guide:
Start Billing 2: CPT & Diagnosis codes
.
Jane uses the price assigned to the CPT code (Settings > Billing Codes) for each procedure on the CMS1500.
📍
Key Note:
The price of the treatment (which is configured in Settings > Treatments & Classes)
is not considered when billing Insurance
. When you add a billing code to a visit in Jane, the billing code fee
overrides the price of the treatment
(aka your ‘cash’ price).
Is this required?
Yes! A claim must have at least one CPT code, and if you don’t assign a price to your CPT codes, it will look like you’re billing $0 claims.
What about the EDI file?
CPT code fees are sent in
Loop 2400 - Service Line Info.
An
SV1
segment
**
is sent for each CPT code on the claim.
SV101-02 includes the CPT code
SV102
includes the
price
of the CPT code
Box 24g - CPT Units
What’s in the box?
The number of billed units of a particular CPT code.
Where does this info live in Jane?
After adding a CPT code to an Appointment, you can change the number of units simply by clicking on the price of the code.
For more info on adding CPT codes to your appointments, have a look at the following guide:
Start Billing 2: CPT & Diagnosis codes
.
Is this required?
Yes - each CPT code needs an assigned number of units. By default, CPT codes are billed for a
single
unit in Jane.
What about the EDI file?
CPT code info is sent in
Loop 2400 - Service Line Info.
An
SV1 segment
is sent for each CPT code on the claim.
SV101 includes the CPT code
SV102 includes the price of the CPT code
SV103 is hardcoded to
UN
, which indicates the procedure is billed in terms of units
> 📍
Note
: we always send
UN
, but it is possible that some providers need to bill in
minutes
instead of units, in which case
MJ
would be needed. We don’t currently support minutes, but let us know if this is something your practice needs!
SV104
includes the number of
units
Box 24h - EPSDT/Family Planning
What’s in the box?
Box 24h is used to identify services that may be covered under specific state-funded plans.
EPSDT info is sent in the shaded portion of 24H, while Family Planning info is sent in the unshaded portion of box 24H.
📍Note that Jane supports EPSDT information on paper and electronic claims. If your practice would like support for Family Planning info, let us know!
Where does this info live in Jane?
Clinics can set EPSDT Referral info in a patient’s insurance policy.
By default, this field will be set to “Not Applicable” for all insurance policies. When set to “Not Applicable”,  nothing will get sent in the shaded portion of Box 24H. If a different option is chosen, the corresponding qualifier code will be sent in the shaded portion of Box 24H (i.e.
NU
for Not Used).
Is this required?
EPSDT information is only required by Medicaid in some states depending on your speciality and services.
What about the EDI file?
The 837p implementation is a little more complicated than the CMS1500 implementation. It all depends on what you’ve selected in the patient’s policy!
Box 24i - Rendering Provider ID Type
What’s in the box?
This box indicates the type of identifying number that is reported in
box 24j
of the CMS1500. This info helps the Insurer identify the rendering provider.
There is a
shaded
and
unshaded
section of Box 24i for each service line.
Unshaded:
Includes text ‘NPI’ by default.
Shaded:
Blank by default.
Only used if a non-NPI rendering provider identifier (i.e. staff License number) or Rendering Provider Taxonomy Code needs to be reported.
If the shaded area of box 24i is used, then a 2-digit qualifier will be sent to identify the type of number being reported in box 24j.
Here’s a list of qualifiers that are currently supported:
State License (OB)
Provider UPIN (1G)
Provider Commercial Number (G2)
Location Number (LU)
Taxonomy (ZZ)
Where does this info live in Jane?
The Rendering Provider ID is set within a Staff Member’s Billing tab, specifically within the
Default Claim Information
or within an
Insurance Specific Claim Information
form.
There’s nothing extra required to set box 24i if the Insurance company requires an NPI to identify the rendering provider!
However, if the Insurance company requires a License number (a non-NPI ID), then you will need to click the
‘Use License Number instead of NPI?’
option when setting up your claim information and enter a
License Number
and
License Type.
The
License Type
will set the qualifier in box 24i of the CMS1500.
📍
Key Note:
The majority of Insurance companies require a Rendering Provider NPI. Only use a Rendering Provider License Number if advised to by the Insurance company.
If an Insurance company requires a Taxonomy Code to accompany the Rendering Provider NPI, then the qualifier ‘ZZ’ will be set in the shaded area of box 24i.
Is this required?
You are
required
to specify the types of numbers that identify the Rendering Provider.
What about the EDI file?
The Rendering Provider ID Type is sent in
Loop 2310B - Rendering Provider Info
. What qualifier is used and where it’s sent depends on whether the ID is an
NPI
(most common) or a
License Number
.
If an
NPI
is used, then the
‘XX’
qualifier will be included in
Loop 2310B, Segment NM108
.
If a
Taxonomy Code
is sent along with an
NPI
, then it is sent in
Loop 2310B, Segment PRV.
The qualifier ‘PXC’, which is the EDI qualifier for Taxonomy Codes, is sent in PRV02
The Taxonomy Code is sent in PRV03
If a
License Number
is used, then the
License Number Type
you’ve selected will determine the qualifier sent in
Loop 2310B, Segment PRV02
.
Here is the list of Rendering Provider IDs available in Jane with their qualifiers in brackets:
NPI (XX)
State License (OB)
Provider UPIN (1G)
Provider Commercial Number (G2)
Location Number (LU)
Taxonomy (PXC)
Box 24j - Rendering Provider ID Number
What’s in the box?
This box is used by the Insurer to identify the provider who performed the service— the Rendering Provider. Note that this box is closely linked with Box 24i, as well as the other sub-sections of box 24.
There is a
shaded
and
unshaded
section of Box 24j for each service line.
Unshaded:
The Rendering Provider NPI is reported in the unshaded section
If a Rendering Provider License ID is used in place of an NPI, then this section is left blank.
Shaded:
In some cases, an Insurer may require that a License or PIN be used instead of the NPI to identify the Rendering Provider. In these cases, the shaded section is used to report the license number.
Some Insurers require the Rendering Provider to report the Taxonomy Code assigned to their NPI. In these cases, the Taxonomy Code is set in this box.
Where does this info live in Jane?
The Rendering Provider ID of the
staff member receiving compensation
for the visit is used in Box 24j. This is typically the staff member who the patient is booked in with,
but not always
(see the
Billing Under a Different Staff Member
section below for more info).
You can check which
Staff member
is receiving compensation for an
Appointment
by hovering your mouse over the
Billing Info
section of the
Appointment Panel
and clicking the blue
View
button that appears.
Rendering Provider IDs are set within a
Staff Member’s Billing tab,
specifically within the
Default Claim Information,
or within an
Insurance Specific Claim Information
form.
The Rendering Provider ID can either be set by adding a
Rendering Provider NPI
or a
License Number
. Note that only
one
Rendering Provider ID can be set (Either an NPI, or a license number, but not both).
Typically, the
Rendering Provider NPI
will be used as the Rendering Provider ID, but in some cases, an Insurance company may identify the rendering provider with a non-NPI identifier. In these cases, click the
‘Use License Number instead of NPI?’
option and enter a
License Number
and
License Type
📍
Key Note:
The majority of Insurance companies require a Rendering Provider NPI. Only use a Rendering Provider License Number if advised to by the Insurance company.
📍
Pro Tip:
Rendering Provider Taxonomy Codes- Some Insurance companies require the main Taxonomy Code assigned to the Rendering Provider NPI in order to identify the Rendering Provider.
Billing Under a Different Staff Member
If you need to bill a claim under a different provider, then you’ll need to change the
staff member receiving compensation
for the Purchase. By default, the staff member receiving compensation will be the staff member with whom the patient is booked.
For example, let’s say that Andy is a student practicing under Susan. Some visits are booked in Andy’s Schedule, but we need to bill claims for those appointments under Susan’s credentials.
For each Insured visit in Andy’s Schedule, we’ll need to edit the Purchase and change the
staff member receiving compensation
from Andy to Susan.
To do this, you can hover your mouse over the
Billing Info
section of the
Appointment Panel
and click the blue
View
button that appears. This will lead you to the
Purchase
screen, where you can use the blue
Change
text next to the Staff Member’s name to switch Practitioners.
Keep in mind that making this change will also affect your Reports. For example, each visit where the staff member receiving compensation is changed will show up under Susan’s
Sales
and
Compensation
Reports (instead of Andy’s).
Is this required?
A Rendering Provider ID (NPI or License) is
required
when billing paper and electronic claims. A Rendering Provider Taxonomy Code is
optional
.
What about the EDI file?
The Rendering Provider ID is sent in
Loop 2310B - Rendering Provider Info
. Where it’s sent depends on whether the ID is an
NPI
(most common) or a
License Number
.
If an
NPI
is used, then it will be included in
Loop 2310B, Segment NM109
.
If a
License Number
is used, then it will be included in Loop 2310B,
Segment REF02
.
Note that the License Number Type (the ‘qualifier’) will be included in Loop 2310B, Segment REF01 - but this maps to box
24i
on the CMS1500
Here is the list of Rendering Provider IDs available in Jane with their qualifiers in brackets:
NPI (XX)
State License (OB)
Provider UPIN (1G)
Provider Commercial Number (G2)
Location Number (LU)
Taxonomy (PXC)
If a
Rendering Provider Taxonomy Code
is used, then it is sent in
Loop 2310B, Segment PRV
The qualifier ‘PXC’, which is the EDI qualifier for Taxonomy Codes, is sent in PRV02
The Taxonomy Code is sent in PRV03Subscribe to our monthly newsletter.Jane Software Inc.
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
- ![](https://jane.app/thumbs/95d498df-ca9a-4610-a89a-b604d84e5fbb)
- ![](https://jane.app/thumbs/d080ea0f-fa7f-421b-931e-603172658366)
- ![](https://jane.app/thumbs/1f40e2b8-75d7-43ff-ba32-21b6966a629d)
- ![](https://jane.app/thumbs/7ba58a32-dfec-4d73-ad1c-42e7951e7264)
- ![](https://jane.app/thumbs/1a8c0885-0518-4d73-a6bc-ef174a1e02c6)
- ![](https://jane.app/thumbs/c7d89d1f-0ae5-4ffd-8a5d-2981f107a288)
- ![](https://jane.app/thumbs/4e944e35-fec6-43e2-8b05-34f527491641)
- ![](https://jane.app/thumbs/5f1b4197-5626-446f-90bc-a43d48f8e335)
- ![](https://jane.app/thumbs/097e8c5c-8c60-4eeb-8b6c-a1a7c50795a2)
- ![](https://jane.app/thumbs/172d7ed9-d313-4f14-a7ea-1b534a8c540f)
- ![](https://jane.app/thumbs/bc789a0e-16d8-487a-9deb-28a2f92b2324)
- ![](https://jane.app/thumbs/192dcb18-70d7-43db-b8cc-72757693309e)
- ![](https://jane.app/thumbs/ce47ef93-1467-454e-842d-7d1b4daa9420)
- ![](https://jane.app/thumbs/50b67d85-ed38-4501-9f20-7021bc52c313)
- ![](https://jane.app/thumbs/28920bed-ce76-407f-865e-53c104c42776)
- ![](https://jane.app/thumbs/041eaf6d-fff2-4cde-9fef-eecf3a9d0c8f)
- ![](https://jane.app/thumbs/20b039b2-970a-4844-ae89-72e0887d9a1f)
- ![](https://jane.app/thumbs/04d96f96-0f9c-4834-a22e-5c68d259df7f)
- ![](https://jane.app/thumbs/45b9f433-7eeb-4637-922e-9997bc6ad5b9)
- ![](https://jane.app/thumbs/bac4a7c0-ab89-4cf5-8522-add5c8737ab7)
- ![](https://jane.app/thumbs/f00cfdcb-78d1-4d66-a802-70375746a1c1)
- ![](https://jane.app/thumbs/1d7f3db6-01fb-4fc5-a9ad-e6897656150b)
- ![](https://jane.app/thumbs/19a75ac7-da7c-469a-ae5c-89487ec46006)
- ![](https://jane.app/thumbs/38793327-2f34-4ffa-b7cd-d30d54eef532)
- ![](https://jane.app/thumbs/327576ae-e0d8-4760-a817-c6dc12cb08c9)
- ![](https://jane.app/thumbs/4229c86a-1174-49ee-96e8-b1b868c494c1)
- ![](https://jane.app/thumbs/9cc373ee-19c4-46cb-9fc1-1af90b64bfc5)
- ![](https://jane.app/thumbs/802b70f1-3cf4-4bbc-b49c-19854649aeef)
- ![](https://jane.app/thumbs/b3685232-8de6-4d8e-9340-ae2935596a6d)
- ![](https://jane.app/thumbs/5f7973b1-1aa6-4595-ad27-4d3172fd2253)
- ![](https://jane.app/thumbs/808404d2-68a3-40e2-a351-a24104b3157a)
- ![](https://jane.app/thumbs/26848383-aeee-40fd-87a9-97f341415573)
- ![](https://jane.app/thumbs/4e473e5a-d3a7-41c4-b007-2fa554306fdd)
- ![](https://jane.app/thumbs/96f79280-9c79-40a2-ab54-6beb80907e41)
- ![](https://jane.app/thumbs/0ea267be-b21a-4d60-9a1b-9c277e5a556c)
- ![See Jane run your practice](https://jane.app/assets/see-jane-run-3391a88ce3b589c298b8f49eed29f6e88b867c00e0cf51fcb2294d395acd6472.svg)
