# Reconciling Your Accounts Receivable (A/R) Between Periods

*Source: [https://jane.app/guide/reconciling-your-accounts-receivable-a-r-between-periods](https://jane.app/guide/reconciling-your-accounts-receivable-a-r-between-periods)*

*Category: Reports*

*Scraped: 2025-08-07 02:28:59*

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
Feature OverviewReconciling Your Accounts Receivable (A/R) Between Periods
Reports
Reconciling Your Accounts Receivable (A/R) Between Periods
17 min read
Balance Plan
Practice Plan
Thrive Plan
Nothing is more satisfying than having all your accounts balance after some careful calculations! This guide was designed as a deep dive into how a clinic can reconcile their accounts receivable from the end of the previous period to the number shown at the end of the current period.
We do want to mention right away that this reconciliation step is
not mandatory
as Jane’s A/R report will provide you with a live representation of which invoices are still outstanding as of a given date.
With that said, we understand that some clinics are interested in further exploring how money is flowing in and out of their business, so we wanted to capture all of the different moving parts that one must consider when working with this financial information.
We recommend chatting with your friendly neighbourhood bookkeeper or accountant if you’d like a better understanding of these numbers.
📍
Note:
Since this is a bit of a longer guide, we wanted to emphasize that you’ll need to follow both #1 - Using the Right Formula and #2 - Turn on Invoice Reversals, in order for A/R to properly reconcile in your account. The section “How to Arrive at this Calculation” takes a closer look at the importance of using the right formula, but is not required reading!
1️⃣ Use the Right Formula
The A/R Reconciliation Formula
Here it is, the golden formula for reconciling your accounts receivable between two periods.
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits - Credit Memos Created + Tips = Closing A/R
Let’s quickly go over what each of these variables represents, and where you can find this information in Jane.
Opening A/R
This number represents the final A/R value for the end of the previous period. For example, if you were trying to reconcile your A/R for the month of February, you would be looking for the A/R amount for January 31st.
In Jane
: This would be the total A/R shown on your Accounts Receivable Report run for the end of the past period.
Closing
A/R
This goes hand-in-hand with the opening A/R number and represents the final A/R value for the end of the current period you are working with. If you are reconciling the month of February, this would be the A/R as of February 28th.
In Jane:
Same as above— run the Accounts Receivable report for the end of the current period.
Sales
This represents the total value of new invoices generated within the period of interest, based on the
invoiced date
(more on that a bit later). For example, in the month of February, we billed out a total of $10,000.00 worth of new invoices for the clinic’s services and products.
In Jane
: Run the
Sales Report
for the entire period and filter by the Invoice Date (rather than the Purchase Date).
Transactions
This is the total value of payments that had been received during the period to pay off outstanding balances.
In Jane:
Run the Transactions Report for the period you are working with and use the Total value (summing all the payment methods).
Opening Credits
This represents all of the outstanding credit that is available on patient’s accounts that could be used to potentially pay off an invoice balance. This figure includes both credits that are a result of an
unapplied payment
, as well as any
credit memos
(that are not backed by a transaction).
In Jane:
Run the
Credit Report
for the last date of the previous period.
Closing Credits
This is the other half of the credit puzzle— this is the amount of credit that is still outstanding at the end of the period we are working with. This helps determine the change in credit over time.
In Jane:
Run the
Credit Report
for the last date of the current period.
Credit Memos Created
Since credit memos are not backed by a particular transaction that was collected by the clinic, we’ll want to make sure that we account for them since they contribute towards the general credit amounts.
In Jane:
Run the
Credit Memo Report
for the period that you are working with and use the number shown in the
Total
column.
Tips
If you have Tips enabled in your account (under Settings > Billing Settings), we’ll also want to take these into account.
In Jane
: Run the
Billing Summary Report
for the period and scroll down to the Tips section
💭
How to Arrive at this Calculation
This section will go into a bit more detail on why each of these different values should be considered, building towards the final formula. Feel free to skip this section if you have a good grasp of how these numbers work together.
Starting Principle
Alrighty, let’s get started. There is a very fundamental principle at work here which will act as our starting place:
I had this amount owing to start with. I increased the amount owing this period but also collected a handful of payments. When I add what I billed out and payments that I took in to what I started with, I should get the current amount owing
.
This starting principle can be summarized as:
Opening A/R + Sales - Transactions = Closing A/R
Hopefully, this part is fairly straight-forward and intuitive!
The Effect of Credit (Unapplied Payments)
Now, let’s start adding a few more layers here. Jane’s A/R report is a list of all invoices that a patient has outstanding, and does
not
take into account any account credit the patient might have. Account credit represents a payment that was previously collected but has not yet been applied to an invoice.
The previous formula assumes that any payment that has been collected is applied to an invoice right away. We know that this might not always be the case (we might take payments in advance, or have overcharged a patient). For that reason, we also have to factor in the change in credit over time.
💭
Here’s an example to illustrate the importance of credits:
At the end of March, the clinic’s A/R was $500. Of this $500, Alice had a $30 invoice owing on her account. There was also $50 of credit on her account as well, but by the end of March, the payment had not been connected (applied) to the invoice.
Let’s say in the month of April, no new invoices were generated and no new payments were received. However, Alice used some of her $50 credit to pay for her $30 invoice.
At the end of April, it would appear that the A/R had reduced to $470 (-$30), but no new payments or invoices were involved. With the starting formula, we’d end up with something like this which wouldn’t make any sense:
❌
$500 + $0 - $0 = $470
So, this is where that credit comes in… let’s update the formula to reflect this:
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits = Closing A/R
If we were to plug in the numbers into this updated formula, the two sides of the equation now balance out.
✅
$500 + $0 - $0 + $20 - $50 = $470
Effect of Credit Memos
Credit memos are a special type of payment method because they do not create a transaction record in Jane, and are designed to represent a payment that was not actually collected.
Due to their unique nature, we also have to be mindful of these types of credits when reconciling our A/R.
💭
Let’s look at another example with credit memos thrown into the mix:
At the end of March, our clinic’s A/R is $500. During the month of April, no new transactions or payments are collected. However, midway through April, a credit memo of $50 is created for Alice. This generates an account credit on her account, although no transaction actually took place. No invoices were paid during the period, so the final A/R at the end of April is still $500. However, since credit memos are included in the credit total we pull from the Credit Report, this is what happens with our formula in its current state:
❌
$500 + $0 - $0 + $50 - $0 = $550 (when the A/R should be remain at $500)
However, we can’t rule out credit memos completely, because they can still be used to pay for an invoice. We don’t want to factor in newly created credit memos as transactions, but we will want to consider any credit memos used during the period. Here is our updated formula:
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits - Credit Memos Created = Closing A/R
And now our calculation from before should now balance out.
✅
$500 + $0 - $0 + ($50 - $0) - $50 = $500
Just to make sure we’re on the right track, let’s see what happens with our updated formula if Alice were to use her $50 credit memo in full to pay off an invoice during April (we would expect A/R to go down by $50). This means at the beginning of the period, the Credit Report would have shown $50, but at the end there would be no credit available to use.
✅
$500 + $0 - $0 + ($0 - $50) - $0 = $450
Effect of Tips
If your clinic allows for tips, you’ll also want to account for these in your final calculation. While a tip is a part of the payments you’ve received, they do not have a corresponding invoice that makes up the Sales total. In other words, we’ll want to make sure to factor them in so that everything balances out.
💭
Time to look at one final example, now with tips:
At the end of March our A/R is $500, no new invoices are generated, but a tip was collected for $10. This would show up in Jane as a $10 transaction, although there isn’t a corresponding invoice. Final A/R at the end of April has NOT changed, since the tip payment was not used to pay an already outstanding invoice. With our current formula, we get a confusing outcome:
❌
$500 + $0 - $10 + 0 - 0 - 0 = $490 (when it should be $500)
You know what time it is now… time to update our formula to also take tips into consideration, which will bring us to the final iteration of the A/R formula we introduced at the beginning of this guide.
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits - Credit Memos Created + Tips = Closing A/R
As one final check, let’s plug things in and make sure everything balances out:
✅
$500 + 0 - $10 + 0 - 0 - 0 + $10 = $500
2️⃣
Turn on Invoice Reversals
Great! Now that we are confident that we’re using the right formula, we’ll want to also make sure that the numbers that we are using make sense with this calculation.
If you are unfamiliar with
Invoice Reversals
, we have a whole guide dedicated to them which you can read here:
Understanding Invoice Reversals
There is also a companion guide that covers setting the
Reconciliation Date
, which will enable invoice reversals in your account:
Working with the Reconciliation Date
In particular, we’ll want to make sure that the values that we are using for the opening and closing A/R, as well as the Sales amounts are historically accurate (and therefore make sense to use with this formula).
As a bit of context, by default Jane’s reports display
live information
. In other words, if any changes are made to an invoice, Jane will
replace
the old line item with a new line item reflecting the updated information. Just for emphasis, this means that the original line item will no longer be recorded anywhere in the report.
This benefit of this style of reporting is that all of the data that you are seeing is
active
data in the account, so you know that you are seeing the current status of any particular value at a given point in time. It also makes the data look rather consistent and neat, making it quite approachable for users who find reporting a bit overwhelming.
With that said, this type of reporting is not compatible with the reconciliation that we might are looking to do here, because there is no historical record of line items that existed at a previous time.
By setting a reconciliation date which enables
invoice reversals,
any changes that are made to an invoice will be tracked. Instead of replacing the original line item, Jane will initiate a reversal (a negative line item for the same value) and then generate a new line item representing the updated invoice. You will be able to read all about this in further detail in the guides above, but we just wanted to provide you with the necessary context for these next sections.
📍
Note:
Keep in mind that Invoice Reversals will start to track as soon as you turn on the reconciliation date. However, turning this setting on
will not retroactively display invoice reversals
for changes that had been made prior to the reconciliation date enabled.
WITHOUT Invoice Reversals:
Let’s look at an example at why the A/R reconciliation calculation will not balance if we do not have invoice reversals enabled.
Imagine that a brand new clinic invoiced their first patient for $100 as of April 30th, but didn’t collect a payment from them yet. This means that the A/R at the end of the month would be $100. The next day on May 1st, they realize they forgot to apply their grand opening discount of 10% and added it to the invoice when they remembered.
What happens here is that without invoice reversals, the invoice for April 30th has been replaced for an updated May 1st invoice of $90. This means going back to the A/R report in April 30th will now show $0 worth of A/R on that date, but $90 for May 1st.
This appears to be a $90 increase in A/R between the months, but is not associated with a corresponding sale during that period.
WITH Invoice Reversals:
Now, let’s consider the same scenario but with invoice reversals enabled in your account. Since the original April 30th invoice has been modified, Jane will add a negative -$100 line item on May 1st when the change was made, and a subsequent +$90 invoice to represent the newly updated price.
This is different from the previous example because the A/R report for April 30th will still have the original $100 line item recorded, and the A/R report for May 1st will display $90.
One of the main changes is that when considering the
Sales
, there will be a corresponding change of -$10 that we can point to which will match up with the -$10 change in A/R between the periods. This is the information that isn’t quite captured when invoice reversals are not enabled.
A friendly reminder that since the Accounts Receivable report is based on an appointment or product’s
invoice date
, that you’ll want to use the
invoice date
version of the Sales Report to ensure that all of these reversals are captured correctly.
Still have a few questions about some of the numbers that you’re seeing in your reports? Feel free to reach out to us at
support@janeapp.com
and we’d be happy to guide you in the right direction.
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
How to reset your email password and enable Two-Factor Authentication (2FA)Reconciling Your Accounts Receivable (A/R) Between Periods
Reports
Reconciling Your Accounts Receivable (A/R) Between Periods
17 min read
Balance Plan
Practice Plan
Thrive PlanNothing is more satisfying than having all your accounts balance after some careful calculations! This guide was designed as a deep dive into how a clinic can reconcile their accounts receivable from the end of the previous period to the number shown at the end of the current period.
We do want to mention right away that this reconciliation step is
not mandatory
as Jane’s A/R report will provide you with a live representation of which invoices are still outstanding as of a given date.
With that said, we understand that some clinics are interested in further exploring how money is flowing in and out of their business, so we wanted to capture all of the different moving parts that one must consider when working with this financial information.
We recommend chatting with your friendly neighbourhood bookkeeper or accountant if you’d like a better understanding of these numbers.
📍
Note:
Since this is a bit of a longer guide, we wanted to emphasize that you’ll need to follow both #1 - Using the Right Formula and #2 - Turn on Invoice Reversals, in order for A/R to properly reconcile in your account. The section “How to Arrive at this Calculation” takes a closer look at the importance of using the right formula, but is not required reading!
1️⃣ Use the Right Formula
The A/R Reconciliation Formula
Here it is, the golden formula for reconciling your accounts receivable between two periods.
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits - Credit Memos Created + Tips = Closing A/R
Let’s quickly go over what each of these variables represents, and where you can find this information in Jane.
Opening A/R
This number represents the final A/R value for the end of the previous period. For example, if you were trying to reconcile your A/R for the month of February, you would be looking for the A/R amount for January 31st.
In Jane
: This would be the total A/R shown on your Accounts Receivable Report run for the end of the past period.
Closing
A/R
This goes hand-in-hand with the opening A/R number and represents the final A/R value for the end of the current period you are working with. If you are reconciling the month of February, this would be the A/R as of February 28th.
In Jane:
Same as above— run the Accounts Receivable report for the end of the current period.
Sales
This represents the total value of new invoices generated within the period of interest, based on the
invoiced date
(more on that a bit later). For example, in the month of February, we billed out a total of $10,000.00 worth of new invoices for the clinic’s services and products.
In Jane
: Run the
Sales Report
for the entire period and filter by the Invoice Date (rather than the Purchase Date).
Transactions
This is the total value of payments that had been received during the period to pay off outstanding balances.
In Jane:
Run the Transactions Report for the period you are working with and use the Total value (summing all the payment methods).
Opening Credits
This represents all of the outstanding credit that is available on patient’s accounts that could be used to potentially pay off an invoice balance. This figure includes both credits that are a result of an
unapplied payment
, as well as any
credit memos
(that are not backed by a transaction).
In Jane:
Run the
Credit Report
for the last date of the previous period.
Closing Credits
This is the other half of the credit puzzle— this is the amount of credit that is still outstanding at the end of the period we are working with. This helps determine the change in credit over time.
In Jane:
Run the
Credit Report
for the last date of the current period.
Credit Memos Created
Since credit memos are not backed by a particular transaction that was collected by the clinic, we’ll want to make sure that we account for them since they contribute towards the general credit amounts.
In Jane:
Run the
Credit Memo Report
for the period that you are working with and use the number shown in the
Total
column.
Tips
If you have Tips enabled in your account (under Settings > Billing Settings), we’ll also want to take these into account.
In Jane
: Run the
Billing Summary Report
for the period and scroll down to the Tips section
💭
How to Arrive at this Calculation
This section will go into a bit more detail on why each of these different values should be considered, building towards the final formula. Feel free to skip this section if you have a good grasp of how these numbers work together.
Starting Principle
Alrighty, let’s get started. There is a very fundamental principle at work here which will act as our starting place:
I had this amount owing to start with. I increased the amount owing this period but also collected a handful of payments. When I add what I billed out and payments that I took in to what I started with, I should get the current amount owing
.
This starting principle can be summarized as:
Opening A/R + Sales - Transactions = Closing A/R
Hopefully, this part is fairly straight-forward and intuitive!
The Effect of Credit (Unapplied Payments)
Now, let’s start adding a few more layers here. Jane’s A/R report is a list of all invoices that a patient has outstanding, and does
not
take into account any account credit the patient might have. Account credit represents a payment that was previously collected but has not yet been applied to an invoice.
The previous formula assumes that any payment that has been collected is applied to an invoice right away. We know that this might not always be the case (we might take payments in advance, or have overcharged a patient). For that reason, we also have to factor in the change in credit over time.
💭
Here’s an example to illustrate the importance of credits:
At the end of March, the clinic’s A/R was $500. Of this $500, Alice had a $30 invoice owing on her account. There was also $50 of credit on her account as well, but by the end of March, the payment had not been connected (applied) to the invoice.
Let’s say in the month of April, no new invoices were generated and no new payments were received. However, Alice used some of her $50 credit to pay for her $30 invoice.
At the end of April, it would appear that the A/R had reduced to $470 (-$30), but no new payments or invoices were involved. With the starting formula, we’d end up with something like this which wouldn’t make any sense:
❌
$500 + $0 - $0 = $470
So, this is where that credit comes in… let’s update the formula to reflect this:
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits = Closing A/R
If we were to plug in the numbers into this updated formula, the two sides of the equation now balance out.
✅
$500 + $0 - $0 + $20 - $50 = $470
Effect of Credit Memos
Credit memos are a special type of payment method because they do not create a transaction record in Jane, and are designed to represent a payment that was not actually collected.
Due to their unique nature, we also have to be mindful of these types of credits when reconciling our A/R.
💭
Let’s look at another example with credit memos thrown into the mix:
At the end of March, our clinic’s A/R is $500. During the month of April, no new transactions or payments are collected. However, midway through April, a credit memo of $50 is created for Alice. This generates an account credit on her account, although no transaction actually took place. No invoices were paid during the period, so the final A/R at the end of April is still $500. However, since credit memos are included in the credit total we pull from the Credit Report, this is what happens with our formula in its current state:
❌
$500 + $0 - $0 + $50 - $0 = $550 (when the A/R should be remain at $500)
However, we can’t rule out credit memos completely, because they can still be used to pay for an invoice. We don’t want to factor in newly created credit memos as transactions, but we will want to consider any credit memos used during the period. Here is our updated formula:
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits - Credit Memos Created = Closing A/R
And now our calculation from before should now balance out.
✅
$500 + $0 - $0 + ($50 - $0) - $50 = $500
Just to make sure we’re on the right track, let’s see what happens with our updated formula if Alice were to use her $50 credit memo in full to pay off an invoice during April (we would expect A/R to go down by $50). This means at the beginning of the period, the Credit Report would have shown $50, but at the end there would be no credit available to use.
✅
$500 + $0 - $0 + ($0 - $50) - $0 = $450
Effect of Tips
If your clinic allows for tips, you’ll also want to account for these in your final calculation. While a tip is a part of the payments you’ve received, they do not have a corresponding invoice that makes up the Sales total. In other words, we’ll want to make sure to factor them in so that everything balances out.
💭
Time to look at one final example, now with tips:
At the end of March our A/R is $500, no new invoices are generated, but a tip was collected for $10. This would show up in Jane as a $10 transaction, although there isn’t a corresponding invoice. Final A/R at the end of April has NOT changed, since the tip payment was not used to pay an already outstanding invoice. With our current formula, we get a confusing outcome:
❌
$500 + $0 - $10 + 0 - 0 - 0 = $490 (when it should be $500)
You know what time it is now… time to update our formula to also take tips into consideration, which will bring us to the final iteration of the A/R formula we introduced at the beginning of this guide.
Opening A/R + Sales - Transactions + Closing Credits - Opening Credits - Credit Memos Created + Tips = Closing A/R
As one final check, let’s plug things in and make sure everything balances out:
✅
$500 + 0 - $10 + 0 - 0 - 0 + $10 = $500
2️⃣
Turn on Invoice Reversals
Great! Now that we are confident that we’re using the right formula, we’ll want to also make sure that the numbers that we are using make sense with this calculation.
If you are unfamiliar with
Invoice Reversals
, we have a whole guide dedicated to them which you can read here:
Understanding Invoice Reversals
There is also a companion guide that covers setting the
Reconciliation Date
, which will enable invoice reversals in your account:
Working with the Reconciliation Date
In particular, we’ll want to make sure that the values that we are using for the opening and closing A/R, as well as the Sales amounts are historically accurate (and therefore make sense to use with this formula).
As a bit of context, by default Jane’s reports display
live information
. In other words, if any changes are made to an invoice, Jane will
replace
the old line item with a new line item reflecting the updated information. Just for emphasis, this means that the original line item will no longer be recorded anywhere in the report.
This benefit of this style of reporting is that all of the data that you are seeing is
active
data in the account, so you know that you are seeing the current status of any particular value at a given point in time. It also makes the data look rather consistent and neat, making it quite approachable for users who find reporting a bit overwhelming.
With that said, this type of reporting is not compatible with the reconciliation that we might are looking to do here, because there is no historical record of line items that existed at a previous time.
By setting a reconciliation date which enables
invoice reversals,
any changes that are made to an invoice will be tracked. Instead of replacing the original line item, Jane will initiate a reversal (a negative line item for the same value) and then generate a new line item representing the updated invoice. You will be able to read all about this in further detail in the guides above, but we just wanted to provide you with the necessary context for these next sections.
📍
Note:
Keep in mind that Invoice Reversals will start to track as soon as you turn on the reconciliation date. However, turning this setting on
will not retroactively display invoice reversals
for changes that had been made prior to the reconciliation date enabled.
WITHOUT Invoice Reversals:
Let’s look at an example at why the A/R reconciliation calculation will not balance if we do not have invoice reversals enabled.
Imagine that a brand new clinic invoiced their first patient for $100 as of April 30th, but didn’t collect a payment from them yet. This means that the A/R at the end of the month would be $100. The next day on May 1st, they realize they forgot to apply their grand opening discount of 10% and added it to the invoice when they remembered.
What happens here is that without invoice reversals, the invoice for April 30th has been replaced for an updated May 1st invoice of $90. This means going back to the A/R report in April 30th will now show $0 worth of A/R on that date, but $90 for May 1st.
This appears to be a $90 increase in A/R between the months, but is not associated with a corresponding sale during that period.
WITH Invoice Reversals:
Now, let’s consider the same scenario but with invoice reversals enabled in your account. Since the original April 30th invoice has been modified, Jane will add a negative -$100 line item on May 1st when the change was made, and a subsequent +$90 invoice to represent the newly updated price.
This is different from the previous example because the A/R report for April 30th will still have the original $100 line item recorded, and the A/R report for May 1st will display $90.
One of the main changes is that when considering the
Sales
, there will be a corresponding change of -$10 that we can point to which will match up with the -$10 change in A/R between the periods. This is the information that isn’t quite captured when invoice reversals are not enabled.
A friendly reminder that since the Accounts Receivable report is based on an appointment or product’s
invoice date
, that you’ll want to use the
invoice date
version of the Sales Report to ensure that all of these reversals are captured correctly.
Still have a few questions about some of the numbers that you’re seeing in your reports? Feel free to reach out to us at
support@janeapp.com
and we’d be happy to guide you in the right direction.Subscribe to our monthly newsletter.Jane Software Inc.
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
- ![](https://jane.app/thumbs/0b3997a8-491e-454b-8528-b724a773d0e3)
- ![](https://jane.app/thumbs/51008f39-2ab5-496c-a04f-0717e510ac38)
- ![](https://jane.app/thumbs/0bd32ad7-77ff-482e-8ed6-bcf5c4eddbe5)
- ![](https://jane.app/thumbs/bbce36fd-c756-4a8c-9fe1-8f347d4b030c)
- ![](https://jane.app/thumbs/a4a1a75b-fa40-4ffd-8af0-b5def1282878)
- ![](https://jane.app/thumbs/5f11a931-f13a-41a7-ab98-2caf14a837ec)
- ![See Jane run your practice](https://jane.app/assets/see-jane-run-3391a88ce3b589c298b8f49eed29f6e88b867c00e0cf51fcb2294d395acd6472.svg)
