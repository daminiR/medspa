# ERA Management Tool FAQ

*Source: [https://jane.app/guide/era-management-tool-faq](https://jane.app/guide/era-management-tool-faq)*

*Category: US Insurance Billing Additional Resources*

*Scraped: 2025-08-07 04:01:28*

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
Feature OverviewERA Management Tool FAQ
US Insurance Billing Additional Resources
ERA Management Tool FAQ
26 min read
Practice Plan
Thrive Plan
We’ve been making some updates to make insurance billing simpler. Check out
what’s new
and see how our Claim.MD integration can help you manage your entire revenue cycle in Jane.
Have some specific questions about our
ERA Management Tool
that weren’t answered in our
Posting Insurer Payments With ERAs
guide? If so, you’re in the right place!
Terms
What is a Remittance?
What is a Claim Response?
General
Does this feature only work for particular clearinghouses?
Can I get my clearinghouse to automatically send ERAs to Jane?
What is the Response Received folder? When does a claim move to Response Received?
Where do I upload my ERAs?
What does Unlinked mean, and why is my claim response Unlinked?
How can I add different insurer payment methods on the remittance screen?
Uploading an ERA
What happens if we upload an ERA file we have already manually reconciled in Jane?
What happens if we upload an ERA that includes claims responses from multiple insurers?
What types of ERA files are not supported?
Can I delete a remittance?
Getting Specific
How do I manage claim reversals/reversals of previous payments?
What happens if I get a claim response for a claim that has a previously entered EOB?
What if the insurer states a portion of the visit is the patient’s responsibility, but it isn’t a copay, coinsurance, or deductible?
How are Claim Responses organized/filtered by default in a given remittance?
What happens if a claim response is linked to the incorrect date of service in the ERA?
How can I change the payer of an ERA I received?
What is a Provider Level Adjustment? What is an Overpayment Recovery?
How do I enable Integrated Claims with Claim.MD?
How do I download ERAs from Office Ally?
Office Ally gave me two remittance files. Which one should I upload to Jane?
How do I download ERAs from Availity?
How do I download ERAs from TriZetto?
How do I download ERAs from Claim.MD?
How do I download ERAs from Waystar?
How do I upload an ERA from Claim.MD that wasn’t submitted through Jane?
Terms
What is a Remittance?
A paper or electronic transaction that includes adjudication information (who is paying for what) and payment information for one or more claims. A
remittance
includes a single payment amount - and parts of the payment amount are assigned to some but not necessarily all claims responses included in the remittance.
A remittance usually has many claim responses.
Paper Remittance
In short, a remittance that is external (i.e. a piece of paper). Some clearinghouses will use the term *Readable Remittance*. Paper remittances have to be recorded manually in Jane.
See the following guide for more info:
Posting Insurer Payments for Paper Remittances
Electronic Remittance (ERA)
A remittance in the form of a 835 transaction. Basically one big text file that different systems - like Jane - can process to make it much easier for clinics to post payments.
What is a Claim Response?
A claim response is our Jane term for the adjudication and payment information for a
single
claim. A
remittance
usually has many
claim responses
.
All claim responses under a remittance show in a list when viewing a remittance:
And when you View one of the claim responses, you’re brought to a page with the adjudication info for that claim (ERA details), as well as the Jane EOB screen:
General
Does this feature only work for particular clearinghouses?
Although we only support electronic claim submissions to
four clearinghouses
(Claim.MD, Office Ally, Availity & TriZetto), our ERA Management Tool will
work for remittances from any clearinghouse or insurer portal
!
Can I get my clearinghouse to automatically send ERAs to Jane?
If you’re using Claim.MD as your clearinghouse, yes! Check out our
Integrated Claims with Claim.MD beta
to learn more.
If you’re working with another clearinghouse, you can manually upload ERAs to Jane.
What is the Response Received folder? When does a claim move to Response Received?
The
Response Received
folder was introduced as part of our ERA Management Tool workflow.
This folder holds all of the claims that have been submitted and are linked to a claim responses that are still Awaiting Review. All the claims in this folder are waiting for your review - which can be done through the Remittances tab.
A claim will move to
Response Received
in two scenarios:
If you upload a remittance and Jane automatically links one of the claim responses in the remittance to that claim.
If you manually link a claim response to a claim on your account.
Once you apply the EOB/payment in the claim response, the claim will move out of the Response Received folder (i.e. if everything billed has been accounted for after the EOB, it’ll move to the Approved folder).
Where do I upload my ERAs?
In the
Remittances folder
, which can be found in the
Billing tab
.
What does Unlinked mean, and why is my claim response Unlinked?
A claim response will start as
Unlinked
if
Jane isn’t able to automatically link it to a claim
on your account. This usually only happens if you didn’t submit the claim through Jane!
If you’re working with an Unlinked claim response, you can manually link it to a claim on your account by using the search bar in the claim response view. You can use the details found at the top of the claim response to help determine which claim to link!
If you accidentally link a claim response to the wrong claim, you
unlink
it by clicking the broken chainlink icon.
How can I add different insurer payment methods on the remittance screen?
To view and update the list of payment methods that appears on the remittance screen, a staff member with
Full Access
can head over to the
Settings
tab and click on
Payment Methods
within the left sidebar menu. Next, you’ll want to click on the blue
New
button.
For more step-by-step instructions on this process, check out our
Creating a New Payment Method
guide.
Uploading an ERA
What happens if we upload an ERA file we have already manually reconciled in Jane?
You have two choices!
First choice
: If you’ve already manually posted the entire payment, then you can simply delete the ERA file you’ve uploaded!
Second choice
: If you’ve manually processed EOBs under claims for some but not all claim responses in the remittance, then you can use the ERA workflow to process the remaining EOBs, and manually mark the redundant claim responses as ‘Reviewed’.
Manually marking a claim response as ‘Reviewed’
does not apply an EOB or payment
to the linked claim - it just tells Jane you’re done with that claim response. Since you’ve already applied an EOB and payment to the claim, there’s no need to apply another EOB through the claim response!
What happens if we upload an ERA that includes claims responses from multiple insurers?
Sometimes you might be managing the same insurance company as two different insurers in Jane. Or, a big insurance company might have multiple entities that you submit claims to, but just a single place where money is sent from, which causes you to create multiple insurers for each submission entity.
In both of these cases, Jane has you covered.
If you upload a remittance with claim responses that are automatically linked to claims from
multiple insurers
in your Jane account, then Jane will ask which insurer you’d like to record the overall payment under in step 1. You’ll be able to apply the payment to all claims in the remittance, so just choose the insurer you’d like to have the payment under for your records.
What types of ERA files are not supported?
Electronic remittances can come in a ton of different file extensions. Oddly enough, every clearinghouse tends to have a different default ERA file extension. But that’s okay, because Jane supports many different files extensions.
The only file types we don’t support are PDF, ZIP, and Spreadsheets (CSV or XLSX). Electronic remittances typically don’t come in any of these file types anyways, and your clearinghouse will definitely have a different file option.
Can I delete a remittance?
Yes
- but only if all the claim responses in the remittance are still Awaiting Review.
If you’ve uploaded an ERA, and realize afterwards that you’ve already posted that payment manually as a paper remittance, then you can select that remittance in the Remittances list, click the Selected dropdown, and choose the Delete button.
Note that you can
only delete remittances that are Awaiting Review or Unlinked
. You can’t delete remittances if they are In Progress or Approved (since that means you’ve posted some or all of the payment)!
Getting Specific
How do I manage claim reversals/reversals of previous payments?
To fully answer this question, we need to really dive deep into an example. But before we do that, here’s the
TL:DR
of how to manage a claim reversal:
If the insurer is changing how they originally adjudicated a claim, then you should get
two
new claim responses in the remittance:
a claim response that reverses the previous claim/payment (
Reversal
). This claim response typically includes all negative amounts to reverse the previous allowed, paid, and patient amounts!
a claim response that states the new
total
adjudication amounts of the claim. “Total” meaning if an insurer paid you $20 originally, and then decides that they will actually be paying you $30, the new total amount on the claim response would be $30.
To manage these new claims responses, you’ll want to:
Manually mark the reversal claim response as Reviewed (do not apply an EOB in this claim response - just acknowledge that you’ve seen it!).
Follow the typical “additional EOB” workflow for the new claim response. Applying the EOB for the adjusted amounts will apply any additional insurer payment in this remittance, or it will create a credit for previous insurer payment(s) depending on if the insurer is sending more money or telling you they paid you too much before.
Okay, let’s walk through an example together in the following video tutorial. In this example, the insurer did not pay us the first time we submitted the claim because we forgot some key information. However, after we re-billed the claim, they paid!
Managing Claim Reversals/Reversals of Previous Payments
What happens if I get a claim response for a claim that has a previously entered EOB?
First off, when we say “claim that has a previously entered EOB”, we mean that you’ve already applied an EOB to that claim in Jane. In other words, a claim that has already had at least one response from the insurer.
When you view a claim response that is linked to a claim that has a previously recorded EOB, the new claim response will still start in Awaiting Review (just like all other claim responses!). Because an EOB has already been applied to this claim, Jane will not automatically pre-fill the EOB screen with the new response values when viewing the new claim response.
Instead, you will see the “additional EOB” screen; Where the totals from the previously entered EOB are displayed, and are greyed out.
Jane doesn’t pre-fill the EOB screen with the values from the new claim response so you don’t lose any previous EOB information!
That said, you still can make adjustments to the previously entered EOB when reviewing the new claim response - you’ll just need to
make these changes manually.
Here are some examples of when you’d likely need to adjust the previous EOB to reflect the newest response from the insurer:
you received more money from insurance
the insurer is recovering an overpayment from the previous response
the patient responsibility has changed
If you need to update the EOB, then you can click
Edit Existing Amounts
button for each procedure that requires a change.
When you press that button, you’ll be able to adjust any of the procedures values as needed. Once you’ve updated all your procedures, hit
Apply Changes
and you’re done reviewing the claim response!
More on the
recording additional insurer payments
can be found
here
**
What if the insurer states a portion of the visit is the patient’s responsibility, but it isn’t a copay, coinsurance, or deductible?
Jane has you covered!
How are Claim Responses organized/filtered by default in a given remittance?
Jane groups related claim responses together! If there is more than one claim response for the same claim (i.e. if there is a claim reversal), then they will be next to each other in the list.
What happens if a claim response is linked to the incorrect date of service in the ERA?
Jane has some checks and safeguards in place to link a claim response in an ERA to the correct claim, including parameters like:
Checking for a match in the patient’s name
Checking for a match in the date of service
Checking for a match in the Claim Submitter’s ID (the unique ID associated with the claim batch it was submitted with)
However, if a claim response is linked to the incorrect claim, you will be able to Unlink it from the claim using the Unlink button when viewing the claim response:
When a claim response is unlinked, you can search for and find the appropriate claim and click
Link
:
How can I change the payer of an ERA that I have received?
Jane will do some checks to confirm with the payer that the ERA matches the insurers that you have set up in your account.
If there is a situation where it isn’t clear from the ERA who the payer is, in
Step 1: Payment Informatio
n, the Payer field will be a dropdown where you can specify the insurer who has sent this payment:
If in this first step, you indicate the incorrect insurer using the dropdown, you can
Select
the remittance, then by clicking Selected (1) you can
Delete
that ERA. From here, you can upload it again.
💡
Pro Tip
: When posting remittances from an ERA, you can actually apply the claim responses to claims from other payers. This can be helpful if you receive a payment from an insurer that processes and pays out claims on behalf of another insurer.
What is a Provider Adjustment? What is an Overpayment Recovery?
When an insurer processes a claim, they typically make adjustments to each procedure. Adjustments made to procedures are commonly referred to as
service adjustments
. Each service adjustment is accompanied by a dollar amount and a reason code. Adjustments essentially explain why an insurer isn’t reimbursing you for the full amount that you billed. The most common examples of service level adjustments are related to contractual obligations (i.e. CO:45 — billing more than your contracted rate), and patient responsiblity (i.e. PO:1 — which means the amount is going towards the patient’s deductible).
In addition to service adjustments, insurers will occasionally adjust the total payment amount of a remittance to account for a reason that’s unrelated to any of the claims or procedures in the remittance. Adjustments made to the entire remittance (not made to one specific claim or procedure) are called
provider adjustments
.
If a remittance has provider adjustments, Jane will display them in the top right hand corner of the remittance view. You’ll see the type of adjustment, the amount (positive or negative), and the reference number the insurer has assigned to it. If you have any questions or concerns about a particular provider adjustment, it can be helpful to use that reference number when following up with the insurer.
Here are some common examples of provider adjustments that you might see on your remittances:
50: Late Charge (late claim filing penalty)
51: Interest Penalty Charge (interest assessment for late claim filing)
IP: Incentive Premium Payment (one of the few positive Provider Adjustments you can receive)
WO: Overpayment Recovery
(the recovery of an overpayment from a previous remittance)
The most common — and most difficult to reconcile — provider adjustments are
Overpayment Recoveries
. Overpayment Recoveries occur when an insurer reviews their previous payment records and finds that they paid you too much for some previously adjudicated claims — claims that have likely been sitting as Paid and Approved in your Jane account for quite some time.
When an insurer identifies an overpayment, they will send you a notice that explains the overpayment amount (i.e. why you should have been paid less, which claims were overpaid etc). The notice will state the recovery amount, and will give the option to either return the money (i.e. write them a check), or if you do nothing, have them take the amount out of a future remittance.
Like most clinics, you’ll most likely choose the latter (although you could make things easier on your bookkeeper by taking the former option).
If you choose the latter, then you’ll eventually receive a remittance with an overpayment provider adjustment that reduces the total amount of the payment.
For example, let’s say that your remittance includes responses for 5 claims, and sum of the paid amounts for all 5 claims in $500. If the insurer previously overpaid you by $100 in a payment from 2 months ago, then you’ll only receive a payment of $400 with this remittance.
So, when you review your last couple responses, you won’t have the available funds (the remaining $100) to apply. The remaining funds that you need are from the previous overpayment in your account — a payment you likely recorded and applied months ago! The insurer is basically saying “apply the $100 we accidentally sent you months ago — money that’s probably applied to another patient’s claim at the moment —  to pay for the remaining claims in this remittance”.
To find that $100, you’re going to have to reference the notice the insurer originally sent you, because the new ERA (with the Provider Adjustment) doesn’t tell you which claims were previously overpaid.
Once you find that $100, you’ll need to manually apply it to the remaining claim responses.
How do I enable Integrated Claims with Claim.MD?
In your Claim.MD account
Before connecting your Claim.MD account with Jane, you’ll need to log in to Claim.MD and adjust a couple of settings. Choose Settings from the list on the left and then click the Account Settings tab at the top of the page.
Start by setting the SFTP Active field to Yes.
📣 While on this screen, note down your SFTP Username and Password. The password is only visible once in Claim.MD, so be sure to note down your password before leaving this page.
Some other key settings to check:
•
Claim Status Format
should be
277
•
Receive ERA/835
should be
835
•
Transmit Approval Required
should be
unchecked
(if it’s on, you’ll have to log in to Claim.MD to approve all claims submitted through the integration)
These settings will ensure that Jane automatically sends claims to Claim.MD and that Claim.MD automatically sends claim acknowledgements (like Rejections) and ERAs back to Jane.
**In your Jane account
**
Now that you have your Claim.MD SFTP username and password, you can connect your Claim.MD account with Jane in
Settings > Integrations > Clearinghouse.
Next, enter your Claim.MD SFTP username and SFTP password — the username and password that you noted down when enabling SFTP in your Claim.MD account.
Note that your SFTP login credentials are different than the username and password you use to login to your Claim.MD account.
And that’s all! You’re ready to start billing through Integrated Claims with Claim.MD!
How do I download ERAs from Office Ally?
For full instructions on how to download ERAs, check out
Office Ally’s ERA User Manual
Click on Download
EOB/ERA 835
.
Select a date on the calendar.Pink dates are days that have pending ERAs.
Click the View link in the Download/View column next to the ERA file you wish to download. This will download the
zip file which contains both the
actual 835 file
and a readable text version (txt) of the ERA.
You’ll need to upload the 835 file to Jane. Jane can’t process the readable text version!
Office Ally gave me two remittance files. Which one should I upload to Jane?
Download the 835 file. The txt file is the paper remittance.
How do I download ERAs from Availity?
Head into your
Claims & Payments
folder, and select the
Remittance Viewer
. You’ll be able to download remittances on the next screen!
If you are having trouble locating your ERA’s in the correct format, you may need to enroll first. Below are some steps to walk you through the enrollment process.
You can start the enrollment for ERAs/EFTs by navigating to
My Providers > Enrollment Center > Transaction Enrollment.
From here, select
Enroll > Enroll a Provider.
If you would like your ERAs to be forwarded to another Clearinghouse besides Availity, make sure to check the box after selecting your Organization that states
“Forward ERA files to another Clearinghouse”
The ERA files will now be delivered to your FTP mailbox located under
Claims & Payments > Send/Receive EDI Files > Receive Files.
How do I download ERAs from TriZetto?
You can download new remittances in a folder in your account call
Remits
!.
We’re sorry this is so short! The TriZetto team doesn’t have any public resources available for downloading ERAs from their system that we can share here. They recommend that you go to the Resources tab in your account, and click Help Videos or Online Help. Both of these options have ERA-related content.
How do I download ERAs from Claim.MD?
Select
View ERA
which can be found under the Claim Menu. Next, select all the ERAs you haven’t processed yet (you can select multiple in one go!). The last step is click the Select Action dropdown, and choose the Download Selected 835 option.
How do I download ERAs from Waystar?
Although we don’t explicitly support electronic claim submissions to Waystar, some Jane clinics continue to successfully use it for their insurance billing needs.
Here’s how you can download a remittance from Waystar:
Head to your Remits tab and click Payments.
Choose your remit, click the dropdown arrow, and select Download.
A new Downloads screen will appear. You’ll want to click Go To Downloads.
Lastly, head to the Downloads area in the Remits tab, and click the dropdown beside the remittance. This will download the ERA onto your device!
How do I upload an ERA from Claim.MD that wasn’t submitted through Jane?
In general, claims should be automatically syncing with Jane and if this is not the case, the recommendation here is to take a peek at your settings in Claim.MD.
To get started,, log into your Claim.MD account and head over to the
Settings
tab and then click on
Account Settings
.
From there, scroll down to the
SFTP Settings
section and set the
Receive ERA/835
field to
*835
.
This setting will make sure your ERAs are in the correct format so that they’re able to automatically drop into your Remittances folder in your Jane account.
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
How to reset your email password and enable Two-Factor Authentication (2FA)ERA Management Tool FAQ
US Insurance Billing Additional Resources
ERA Management Tool FAQ
26 min read
Practice Plan
Thrive PlanWe’ve been making some updates to make insurance billing simpler. Check out
what’s new
and see how our Claim.MD integration can help you manage your entire revenue cycle in Jane.
Have some specific questions about our
ERA Management Tool
that weren’t answered in our
Posting Insurer Payments With ERAs
guide? If so, you’re in the right place!
Terms
What is a Remittance?
What is a Claim Response?
General
Does this feature only work for particular clearinghouses?
Can I get my clearinghouse to automatically send ERAs to Jane?
What is the Response Received folder? When does a claim move to Response Received?
Where do I upload my ERAs?
What does Unlinked mean, and why is my claim response Unlinked?
How can I add different insurer payment methods on the remittance screen?
Uploading an ERA
What happens if we upload an ERA file we have already manually reconciled in Jane?
What happens if we upload an ERA that includes claims responses from multiple insurers?
What types of ERA files are not supported?
Can I delete a remittance?
Getting Specific
How do I manage claim reversals/reversals of previous payments?
What happens if I get a claim response for a claim that has a previously entered EOB?
What if the insurer states a portion of the visit is the patient’s responsibility, but it isn’t a copay, coinsurance, or deductible?
How are Claim Responses organized/filtered by default in a given remittance?
What happens if a claim response is linked to the incorrect date of service in the ERA?
How can I change the payer of an ERA I received?
What is a Provider Level Adjustment? What is an Overpayment Recovery?
How do I enable Integrated Claims with Claim.MD?
How do I download ERAs from Office Ally?
Office Ally gave me two remittance files. Which one should I upload to Jane?
How do I download ERAs from Availity?
How do I download ERAs from TriZetto?
How do I download ERAs from Claim.MD?
How do I download ERAs from Waystar?
How do I upload an ERA from Claim.MD that wasn’t submitted through Jane?
Terms
What is a Remittance?
A paper or electronic transaction that includes adjudication information (who is paying for what) and payment information for one or more claims. A
remittance
includes a single payment amount - and parts of the payment amount are assigned to some but not necessarily all claims responses included in the remittance.
A remittance usually has many claim responses.
Paper Remittance
In short, a remittance that is external (i.e. a piece of paper). Some clearinghouses will use the term *Readable Remittance*. Paper remittances have to be recorded manually in Jane.
See the following guide for more info:
Posting Insurer Payments for Paper Remittances
Electronic Remittance (ERA)
A remittance in the form of a 835 transaction. Basically one big text file that different systems - like Jane - can process to make it much easier for clinics to post payments.
What is a Claim Response?
A claim response is our Jane term for the adjudication and payment information for a
single
claim. A
remittance
usually has many
claim responses
.
All claim responses under a remittance show in a list when viewing a remittance:
And when you View one of the claim responses, you’re brought to a page with the adjudication info for that claim (ERA details), as well as the Jane EOB screen:
General
Does this feature only work for particular clearinghouses?
Although we only support electronic claim submissions to
four clearinghouses
(Claim.MD, Office Ally, Availity & TriZetto), our ERA Management Tool will
work for remittances from any clearinghouse or insurer portal
!
Can I get my clearinghouse to automatically send ERAs to Jane?
If you’re using Claim.MD as your clearinghouse, yes! Check out our
Integrated Claims with Claim.MD beta
to learn more.
If you’re working with another clearinghouse, you can manually upload ERAs to Jane.
What is the Response Received folder? When does a claim move to Response Received?
The
Response Received
folder was introduced as part of our ERA Management Tool workflow.
This folder holds all of the claims that have been submitted and are linked to a claim responses that are still Awaiting Review. All the claims in this folder are waiting for your review - which can be done through the Remittances tab.
A claim will move to
Response Received
in two scenarios:
If you upload a remittance and Jane automatically links one of the claim responses in the remittance to that claim.
If you manually link a claim response to a claim on your account.
Once you apply the EOB/payment in the claim response, the claim will move out of the Response Received folder (i.e. if everything billed has been accounted for after the EOB, it’ll move to the Approved folder).
Where do I upload my ERAs?
In the
Remittances folder
, which can be found in the
Billing tab
.
What does Unlinked mean, and why is my claim response Unlinked?
A claim response will start as
Unlinked
if
Jane isn’t able to automatically link it to a claim
on your account. This usually only happens if you didn’t submit the claim through Jane!
If you’re working with an Unlinked claim response, you can manually link it to a claim on your account by using the search bar in the claim response view. You can use the details found at the top of the claim response to help determine which claim to link!
If you accidentally link a claim response to the wrong claim, you
unlink
it by clicking the broken chainlink icon.
How can I add different insurer payment methods on the remittance screen?
To view and update the list of payment methods that appears on the remittance screen, a staff member with
Full Access
can head over to the
Settings
tab and click on
Payment Methods
within the left sidebar menu. Next, you’ll want to click on the blue
New
button.
For more step-by-step instructions on this process, check out our
Creating a New Payment Method
guide.
Uploading an ERA
What happens if we upload an ERA file we have already manually reconciled in Jane?
You have two choices!
First choice
: If you’ve already manually posted the entire payment, then you can simply delete the ERA file you’ve uploaded!
Second choice
: If you’ve manually processed EOBs under claims for some but not all claim responses in the remittance, then you can use the ERA workflow to process the remaining EOBs, and manually mark the redundant claim responses as ‘Reviewed’.
Manually marking a claim response as ‘Reviewed’
does not apply an EOB or payment
to the linked claim - it just tells Jane you’re done with that claim response. Since you’ve already applied an EOB and payment to the claim, there’s no need to apply another EOB through the claim response!
What happens if we upload an ERA that includes claims responses from multiple insurers?
Sometimes you might be managing the same insurance company as two different insurers in Jane. Or, a big insurance company might have multiple entities that you submit claims to, but just a single place where money is sent from, which causes you to create multiple insurers for each submission entity.
In both of these cases, Jane has you covered.
If you upload a remittance with claim responses that are automatically linked to claims from
multiple insurers
in your Jane account, then Jane will ask which insurer you’d like to record the overall payment under in step 1. You’ll be able to apply the payment to all claims in the remittance, so just choose the insurer you’d like to have the payment under for your records.
What types of ERA files are not supported?
Electronic remittances can come in a ton of different file extensions. Oddly enough, every clearinghouse tends to have a different default ERA file extension. But that’s okay, because Jane supports many different files extensions.
The only file types we don’t support are PDF, ZIP, and Spreadsheets (CSV or XLSX). Electronic remittances typically don’t come in any of these file types anyways, and your clearinghouse will definitely have a different file option.
Can I delete a remittance?
Yes
- but only if all the claim responses in the remittance are still Awaiting Review.
If you’ve uploaded an ERA, and realize afterwards that you’ve already posted that payment manually as a paper remittance, then you can select that remittance in the Remittances list, click the Selected dropdown, and choose the Delete button.
Note that you can
only delete remittances that are Awaiting Review or Unlinked
. You can’t delete remittances if they are In Progress or Approved (since that means you’ve posted some or all of the payment)!
Getting Specific
How do I manage claim reversals/reversals of previous payments?
To fully answer this question, we need to really dive deep into an example. But before we do that, here’s the
TL:DR
of how to manage a claim reversal:
If the insurer is changing how they originally adjudicated a claim, then you should get
two
new claim responses in the remittance:
a claim response that reverses the previous claim/payment (
Reversal
). This claim response typically includes all negative amounts to reverse the previous allowed, paid, and patient amounts!
a claim response that states the new
total
adjudication amounts of the claim. “Total” meaning if an insurer paid you $20 originally, and then decides that they will actually be paying you $30, the new total amount on the claim response would be $30.
To manage these new claims responses, you’ll want to:
Manually mark the reversal claim response as Reviewed (do not apply an EOB in this claim response - just acknowledge that you’ve seen it!).
Follow the typical “additional EOB” workflow for the new claim response. Applying the EOB for the adjusted amounts will apply any additional insurer payment in this remittance, or it will create a credit for previous insurer payment(s) depending on if the insurer is sending more money or telling you they paid you too much before.
Okay, let’s walk through an example together in the following video tutorial. In this example, the insurer did not pay us the first time we submitted the claim because we forgot some key information. However, after we re-billed the claim, they paid!
Managing Claim Reversals/Reversals of Previous Payments
What happens if I get a claim response for a claim that has a previously entered EOB?
First off, when we say “claim that has a previously entered EOB”, we mean that you’ve already applied an EOB to that claim in Jane. In other words, a claim that has already had at least one response from the insurer.
When you view a claim response that is linked to a claim that has a previously recorded EOB, the new claim response will still start in Awaiting Review (just like all other claim responses!). Because an EOB has already been applied to this claim, Jane will not automatically pre-fill the EOB screen with the new response values when viewing the new claim response.
Instead, you will see the “additional EOB” screen; Where the totals from the previously entered EOB are displayed, and are greyed out.
Jane doesn’t pre-fill the EOB screen with the values from the new claim response so you don’t lose any previous EOB information!
That said, you still can make adjustments to the previously entered EOB when reviewing the new claim response - you’ll just need to
make these changes manually.
Here are some examples of when you’d likely need to adjust the previous EOB to reflect the newest response from the insurer:
you received more money from insurance
the insurer is recovering an overpayment from the previous response
the patient responsibility has changed
If you need to update the EOB, then you can click
Edit Existing Amounts
button for each procedure that requires a change.
When you press that button, you’ll be able to adjust any of the procedures values as needed. Once you’ve updated all your procedures, hit
Apply Changes
and you’re done reviewing the claim response!
More on the
recording additional insurer payments
can be found
here
**
What if the insurer states a portion of the visit is the patient’s responsibility, but it isn’t a copay, coinsurance, or deductible?
Jane has you covered!
How are Claim Responses organized/filtered by default in a given remittance?
Jane groups related claim responses together! If there is more than one claim response for the same claim (i.e. if there is a claim reversal), then they will be next to each other in the list.
What happens if a claim response is linked to the incorrect date of service in the ERA?
Jane has some checks and safeguards in place to link a claim response in an ERA to the correct claim, including parameters like:
Checking for a match in the patient’s name
Checking for a match in the date of service
Checking for a match in the Claim Submitter’s ID (the unique ID associated with the claim batch it was submitted with)
However, if a claim response is linked to the incorrect claim, you will be able to Unlink it from the claim using the Unlink button when viewing the claim response:
When a claim response is unlinked, you can search for and find the appropriate claim and click
Link
:
How can I change the payer of an ERA that I have received?
Jane will do some checks to confirm with the payer that the ERA matches the insurers that you have set up in your account.
If there is a situation where it isn’t clear from the ERA who the payer is, in
Step 1: Payment Informatio
n, the Payer field will be a dropdown where you can specify the insurer who has sent this payment:
If in this first step, you indicate the incorrect insurer using the dropdown, you can
Select
the remittance, then by clicking Selected (1) you can
Delete
that ERA. From here, you can upload it again.
💡
Pro Tip
: When posting remittances from an ERA, you can actually apply the claim responses to claims from other payers. This can be helpful if you receive a payment from an insurer that processes and pays out claims on behalf of another insurer.
What is a Provider Adjustment? What is an Overpayment Recovery?
When an insurer processes a claim, they typically make adjustments to each procedure. Adjustments made to procedures are commonly referred to as
service adjustments
. Each service adjustment is accompanied by a dollar amount and a reason code. Adjustments essentially explain why an insurer isn’t reimbursing you for the full amount that you billed. The most common examples of service level adjustments are related to contractual obligations (i.e. CO:45 — billing more than your contracted rate), and patient responsiblity (i.e. PO:1 — which means the amount is going towards the patient’s deductible).
In addition to service adjustments, insurers will occasionally adjust the total payment amount of a remittance to account for a reason that’s unrelated to any of the claims or procedures in the remittance. Adjustments made to the entire remittance (not made to one specific claim or procedure) are called
provider adjustments
.
If a remittance has provider adjustments, Jane will display them in the top right hand corner of the remittance view. You’ll see the type of adjustment, the amount (positive or negative), and the reference number the insurer has assigned to it. If you have any questions or concerns about a particular provider adjustment, it can be helpful to use that reference number when following up with the insurer.
Here are some common examples of provider adjustments that you might see on your remittances:
50: Late Charge (late claim filing penalty)
51: Interest Penalty Charge (interest assessment for late claim filing)
IP: Incentive Premium Payment (one of the few positive Provider Adjustments you can receive)
WO: Overpayment Recovery
(the recovery of an overpayment from a previous remittance)
The most common — and most difficult to reconcile — provider adjustments are
Overpayment Recoveries
. Overpayment Recoveries occur when an insurer reviews their previous payment records and finds that they paid you too much for some previously adjudicated claims — claims that have likely been sitting as Paid and Approved in your Jane account for quite some time.
When an insurer identifies an overpayment, they will send you a notice that explains the overpayment amount (i.e. why you should have been paid less, which claims were overpaid etc). The notice will state the recovery amount, and will give the option to either return the money (i.e. write them a check), or if you do nothing, have them take the amount out of a future remittance.
Like most clinics, you’ll most likely choose the latter (although you could make things easier on your bookkeeper by taking the former option).
If you choose the latter, then you’ll eventually receive a remittance with an overpayment provider adjustment that reduces the total amount of the payment.
For example, let’s say that your remittance includes responses for 5 claims, and sum of the paid amounts for all 5 claims in $500. If the insurer previously overpaid you by $100 in a payment from 2 months ago, then you’ll only receive a payment of $400 with this remittance.
So, when you review your last couple responses, you won’t have the available funds (the remaining $100) to apply. The remaining funds that you need are from the previous overpayment in your account — a payment you likely recorded and applied months ago! The insurer is basically saying “apply the $100 we accidentally sent you months ago — money that’s probably applied to another patient’s claim at the moment —  to pay for the remaining claims in this remittance”.
To find that $100, you’re going to have to reference the notice the insurer originally sent you, because the new ERA (with the Provider Adjustment) doesn’t tell you which claims were previously overpaid.
Once you find that $100, you’ll need to manually apply it to the remaining claim responses.
How do I enable Integrated Claims with Claim.MD?
In your Claim.MD account
Before connecting your Claim.MD account with Jane, you’ll need to log in to Claim.MD and adjust a couple of settings. Choose Settings from the list on the left and then click the Account Settings tab at the top of the page.
Start by setting the SFTP Active field to Yes.
📣 While on this screen, note down your SFTP Username and Password. The password is only visible once in Claim.MD, so be sure to note down your password before leaving this page.
Some other key settings to check:
•
Claim Status Format
should be
277
•
Receive ERA/835
should be
835
•
Transmit Approval Required
should be
unchecked
(if it’s on, you’ll have to log in to Claim.MD to approve all claims submitted through the integration)
These settings will ensure that Jane automatically sends claims to Claim.MD and that Claim.MD automatically sends claim acknowledgements (like Rejections) and ERAs back to Jane.
**In your Jane account
**
Now that you have your Claim.MD SFTP username and password, you can connect your Claim.MD account with Jane in
Settings > Integrations > Clearinghouse.
Next, enter your Claim.MD SFTP username and SFTP password — the username and password that you noted down when enabling SFTP in your Claim.MD account.
Note that your SFTP login credentials are different than the username and password you use to login to your Claim.MD account.
And that’s all! You’re ready to start billing through Integrated Claims with Claim.MD!
How do I download ERAs from Office Ally?
For full instructions on how to download ERAs, check out
Office Ally’s ERA User Manual
Click on Download
EOB/ERA 835
.
Select a date on the calendar.Pink dates are days that have pending ERAs.
Click the View link in the Download/View column next to the ERA file you wish to download. This will download the
zip file which contains both the
actual 835 file
and a readable text version (txt) of the ERA.
You’ll need to upload the 835 file to Jane. Jane can’t process the readable text version!
Office Ally gave me two remittance files. Which one should I upload to Jane?
Download the 835 file. The txt file is the paper remittance.
How do I download ERAs from Availity?
Head into your
Claims & Payments
folder, and select the
Remittance Viewer
. You’ll be able to download remittances on the next screen!
If you are having trouble locating your ERA’s in the correct format, you may need to enroll first. Below are some steps to walk you through the enrollment process.
You can start the enrollment for ERAs/EFTs by navigating to
My Providers > Enrollment Center > Transaction Enrollment.
From here, select
Enroll > Enroll a Provider.
If you would like your ERAs to be forwarded to another Clearinghouse besides Availity, make sure to check the box after selecting your Organization that states
“Forward ERA files to another Clearinghouse”
The ERA files will now be delivered to your FTP mailbox located under
Claims & Payments > Send/Receive EDI Files > Receive Files.
How do I download ERAs from TriZetto?
You can download new remittances in a folder in your account call
Remits
!.
We’re sorry this is so short! The TriZetto team doesn’t have any public resources available for downloading ERAs from their system that we can share here. They recommend that you go to the Resources tab in your account, and click Help Videos or Online Help. Both of these options have ERA-related content.
How do I download ERAs from Claim.MD?
Select
View ERA
which can be found under the Claim Menu. Next, select all the ERAs you haven’t processed yet (you can select multiple in one go!). The last step is click the Select Action dropdown, and choose the Download Selected 835 option.
How do I download ERAs from Waystar?
Although we don’t explicitly support electronic claim submissions to Waystar, some Jane clinics continue to successfully use it for their insurance billing needs.
Here’s how you can download a remittance from Waystar:
Head to your Remits tab and click Payments.
Choose your remit, click the dropdown arrow, and select Download.
A new Downloads screen will appear. You’ll want to click Go To Downloads.
Lastly, head to the Downloads area in the Remits tab, and click the dropdown beside the remittance. This will download the ERA onto your device!
How do I upload an ERA from Claim.MD that wasn’t submitted through Jane?
In general, claims should be automatically syncing with Jane and if this is not the case, the recommendation here is to take a peek at your settings in Claim.MD.
To get started,, log into your Claim.MD account and head over to the
Settings
tab and then click on
Account Settings
.
From there, scroll down to the
SFTP Settings
section and set the
Receive ERA/835
field to
*835
.
This setting will make sure your ERAs are in the correct format so that they’re able to automatically drop into your Remittances folder in your Jane account.Subscribe to our monthly newsletter.Jane Software Inc.
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
- ![](https://jane.app/thumbs/2161fa7e-ce8b-4988-bdb2-ad8d513d2540)
- ![](https://jane.app/thumbs/a6103bcc-ee74-44a4-83c5-1c8406836022)
- ![](https://jane.app/thumbs/560e33ee-ed59-4aba-a0b5-acf17df54a9c)
- ![](https://jane.app/thumbs/a08f07f7-2955-4976-9ef1-b0236434efc5)
- ![](https://jane.app/thumbs/1384360d-2b0d-48ca-a629-f659fdffc881)
- ![](https://jane.app/thumbs/6706aa74-ef0b-47db-8b12-1288a0305cdb)
- ![](https://jane.app/thumbs/6c2f3f91-17a5-4059-bab9-51f7a1dbc7c5)
- ![](https://jane.app/thumbs/3177e448-d08a-48d5-b8ad-d388007169a8)
- ![](https://jane.app/thumbs/fc6a83c7-2604-4c3d-aa46-852d93fc4a25)
- ![](https://jane.app/thumbs/a181ae94-5c44-44a3-bfd3-d88e5bcfe4e2)
- ![](https://jane.app/thumbs/2952ef42-e638-4780-8dde-085dc8f8bcfc)
- ![](https://jane.app/thumbs/fe6aefdb-faac-4392-b8b4-780fa74811c3)
- ![](https://jane.app/thumbs/65342826-c4ce-44cb-8971-2b540fca150c)
- ![](https://jane.app/thumbs/9e434a44-07ef-4cfb-9afe-0793c1837064)
- ![](https://jane.app/thumbs/72f348c4-313b-47dc-913a-1ce73565fcb0)
- ![](https://jane.app/thumbs/27e47443-632a-4206-baba-e6f30f931c88)
- ![](https://jane.app/thumbs/3da3b2ab-c8ed-4329-a63a-639860b84dbc)
- ![](https://jane.app/thumbs/2782c358-9615-438c-9c7b-5c18aa590cf0)
- ![](https://jane.app/thumbs/5532e9a6-f9ca-4442-b0f8-ff5a01ae73f7)
- ![](https://jane.app/thumbs/918d673a-399d-4fd6-9329-d0e530246820)
- ![](https://jane.app/thumbs/685ffbf2-405a-4eff-abd2-de44e8399325)
- ![](https://jane.app/thumbs/d935f769-ac54-4839-bd63-855f6009056f)
- ![](https://jane.app/thumbs/ed83a37e-6e3c-46f2-9bd9-089b0a6be6ff)
- ![](https://jane.app/thumbs/af855364-c914-4747-ada4-157089d8772e)
- ![](https://jane.app/thumbs/4a19c2e0-cb0c-4487-b9c2-3c65ee45a5b4)
- ![](https://jane.app/thumbs/ccf52a92-0136-4075-9184-59b6fae023c4)
- ![](https://jane.app/thumbs/7e7afbdd-0f01-4cae-8a04-5a3d6bcd8e20)
- ![](https://jane.app/thumbs/9c14c774-76cf-4db7-b976-05eb211dea79)
- ![](https://jane.app/thumbs/fd4af927-b01f-40ca-9a70-cc92a36a36d1)
- ![](https://jane.app/thumbs/229529b0-705a-4971-8eb6-8cdad4234cb9)
- ![](https://jane.app/thumbs/d34c355c-4798-4b25-8090-2030273eb8f0)
- ![](https://jane.app/thumbs/ac787908-c6f7-4f73-9ea0-68b20fad3350)
- ![](https://jane.app/thumbs/bdd4651e-cff8-4634-a693-fc8eb83d7999)
- ![](https://jane.app/thumbs/780cd172-f382-492a-b02d-cc78a424216b)
- ![](https://jane.app/thumbs/a0a0fd48-d396-4579-923f-9a5cbc8c2ffb)
- ![An image of the navigational steps and where to update the specific era settings](https://jane.app/thumbs/393ecb8d-2499-4be6-a191-6eaf25b8c532)
- ![See Jane run your practice](https://jane.app/assets/see-jane-run-3391a88ce3b589c298b8f49eed29f6e88b867c00e0cf51fcb2294d395acd6472.svg)
