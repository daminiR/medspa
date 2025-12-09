# TELUS eClaims FAQ + Troubleshooting

*Source: [https://jane.app/guide/telus-eclaims-faq-troubleshooting](https://jane.app/guide/telus-eclaims-faq-troubleshooting)*

*Category: Integrations*

*Scraped: 2025-08-07 04:55:42*

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
Feature OverviewTELUS eClaims FAQ + Troubleshooting
Insurance Billing (Canada)
TELUS eClaims FAQ + Troubleshooting
31 min read
Practice Plan
Thrive Plan
This guide is a compilation of some of the most frequently asked questions around Jane’s TELUS eClaims integration, errors and troubleshooting tips.
If you haven’t seen them already, we do have a few other dedicated guides that may come in handy on setting up your integration, submitting claims and reversing submissions.
Setting Up Your TELUS eClaims Integration
Submitting Claims and Eligibility Checks Through the TELUS eClaims Integration
Reversing Submissions Through the TELUS eClaims Integration
Feel free to scroll through the different topics, or jump straight to a particular question:
General Integration Features
I’m in Ontario, can I bill to WSIB through Jane’s eClaim integration?
Can I submit dental claims through Jane?
Where can I see a list of participating insurers?
Will I be able to see the submissions I make through Jane in the eClaims portal?
When and how can I expect to get paid by the insurance companies?
Everyone at my clinic has their own independent eClaims account, can we link them all to Jane?
Can you link eClaims accounts for multiple locations in Jane?
How can I update/change the Telus eClaims password in Jane?
I don’t see Telus eClaims in my Integrations list — why not?
How do I print a Telus eClaims EOB?
Can I fill out the TELUS eClaims consent forms through Jane?
Submitting Claims
Can you batch submit multiple claims all at once?
Can I courtesy bill (submit on the patient’s behalf) or select the patient as the payee through the integration?
Will On Hold/Pended responses update automatically?
How can I submit claims for assigned or supervised care through the integration (physiotherapy)?
Can you void claims in the integration, and during what timeframe?
Can the explanation of benefits forms (EOBs) be accessed forever?
Will Jane let the clinic know when the patient is out of coverage?
Can I still enter default coverage amounts on policies?
Can you submit secondary plans through the integration?
Are coordination of benefits (Canada Life, Claim Secure) submissions supported through Jane?
How long do I have to submit a claim?
Can I direct bill to Alberta Blue Cross through the Telus eClaims Integration?
Errors and Troubleshooting
I’m having a hard time finding the credentials I need in the eClaims portal - Is there anywhere else I can find the information I need?
How can I contact Telus eClaims?
KEY204 – The policy or group number is missing, invalid, or not found.
NL37 – the insurer does not allow electronic submissions for this policy or group.
NL20: VALIDAT - the Provider (Author) is invalid; not registered for TELUS eClaims or is unauthorized for the User
Error-17 – Unable to authenticate the user.  Incorrect password error. OR SoapServerError Error Code: wsse:FailedAuthentication. Your password for TELUS Health eClaims is incorrect.
ArgumentError - account recipient must be an organization or account. Got NilClass
NL23 - the servicing provider role is not registered for the TELUS eClaims service
NL49: New terms and conditions for eClaims must be accepted by an admin user before you can submit claims or predeterminations to the Canada Life - PSHCP insurer
SOAP-ENV: Server – Internal Error
NL107- INVALID DATA TYPE SPECIFICATION FORMAT OR STRUCTURE USED DOES NOT MATCH THE EXPECTED DATA TYPE FOR THE ELEMENT PUBLIC EXTENSION MUST HAVE AT LEAST 1 CHARACTER MAX OF 20 CHARACTERS INVALID DATA TYPE
NL300 - Can’t extract policyholder’s last name from the request.
EC11 - Missing/Invalid Subscriber Identification Number error message
How can I resolve the ‘missing provider information’ error when the details appear to be entered correctly under the integration settings?
NL310 - “Adjudicator is not available. Please try again later.”
Object reference not set to an instance of an object
I’m in Ontario, can I bill to WSIB through Jane’s eClaims integration?
Because WSIB claims in Ontario are submitted through a separate system that TELUS offers, these submissions aren’t able to be managed through our TELUS eClaims integration. These submissions would need to be done outside of Jane, but you can use Jane’s Insurance Features to keep track of the submissions and payments.
Can I submit dental claims through Jane?
Jane’s eClaims integration which is an alternative to the TELUS Provider Portal is specifically for extended healthcare benefits and does not include Drug/Pharmacy or Dental Services. Dental claim submissions are facilitated by TELUS through a different system.
Where can I see a list of participating insurers?
Telus has a handy
Insurer toolkit page here
where you can enter your discipline and province for an up-to-date list of participating insurers.
We also have a list in our guide on
Setting Up Your TELUS eClaims Integration
.
Will I be able to see the submissions I make through Jane in the eClaims portal?
TELUS eClaims actually has separate systems for their portal and integration submissions. Since the two systems don’t speak to each other, the submissions you make and the responses you get in Jane won’t be visible within the portal.
When and how can I expect to get paid by the insurance companies?
Submitting your claims through Jane will not change how you are paid by the different insurance companies - you will continue to receive payments and statements from the insurers in the same way you are used to from submitting through the eClaims portal. 
If you would like to know more about how and when payments are issued for each participating insurer check out TELUS Health’s handy
Insurer Payment Guide
Everyone at my clinic has their own independent eClaims account, can we link them all to Jane?
Jane’s eClaims integration can accommodate just about any clinic situation - including multiple independent eClaims accounts. In this scenario, you’ll need to pick one provider’s account to link in the Location set up (doesn’t matter who!) and then set every practitioner up as an Independent Provider. For each practitioner whose account credentials were
not
used in the Location set up, enter in their specific username, password, and other details in the Alternate TELUS eClaims Account section.
We go over this set up as part of our video on How to Set up Your Integration for Organizations & Groups of Practitioners:
https://player.vimeo.com/video/500658166
Can you link eClaims accounts for multiple locations in Jane?
You can link a different eClaims account to each Location you have created in Jane. However, each Location in Jane can only accommodate
one
Organization type eClaims account
but
any number of independent accounts (e.g. one organization account and 5 independent eClaims accounts linked to a single Jane Location).
If your clinic is set up such that you use more than one Organization type account under a single location this cannot be accommodated.
See
Everyone at my clinic has their own independent eClaims account, can we link them all to Jane?
for details about linking more than one Independent account to Jane.
How can I update/change the Telus eClaims password in Jane?
Note
📝:
If you need to update your password for your Telus eClaims/Health login, you’ll first want to log into the portal directly. Once the password is changed on their platform, you can update it for the integration. For more details on how you can change your Telus password within the portal, check out their guide on
Managing Passwords
.
As a
Full Access
user, there are two ways you can update your password once you’ve changed it on the Telus eClaims portal:
For clinic’s set up as an Organization:
To start, you’ll want to head over to the
Settings
tab >
Integrations
>
1 Integration
on the Telus eClaims section.
When you’re updating the password in this area, you’ll want to ensure you’re doing it under
Locations
.
And you’ll be able to update the password here:
For Independent/Solo Providers:
While this change happens in a similar area under the
Settings
tab,
Integrations
on the left sidebar menu and
1 Integration
within the Telus eClaims section, you’ll want to make sure to update the password under
Providers
:
Under the
Alternate Telus eClaims Account
section, update the
Password
and click
Update Provider
at the bottom of the page
Can you batch submit multiple claims all at one time?
Batch claim submission is not possible. Each claim must be submitted individually even if they are for the same patient.
Can I courtesy bill (submit on patient’s behalf) or select the patient as the payee through the integration?
You sure can! To do this, you’ll just need to set the
Insurance Mode
on the visit to
Patient Pre-Pay
before submitting:
From there, you can just submit the claim normally and Jane will send along the preference for the patient to be reimbursed.
Also, when you switch a purchase to Patient Pre-Pay, Jane will still generate an insurer invoice for the full amount of what was billed, but Jane will also push that full amount down to the patient so you can accept their payment at the time of service.
Will On Hold/Pended responses update in Jane automatically?
In the case that a submission comes back as On Hold or Pending, these claims
won’t
update automatically to a “Paid” or “Rejected” status.
When Jane gets a response, typically it will specify
who
can expect to be reimbursed, the clinic or the patient. If you’d like to read more about how to manage on hold and pending claims,
check out our guide on that here
.
How can I submit claims for assigned or supervised care through the integration (physiotherapy)?
You can set this up in Jane by adding your physiotherapy assistants, athletic therapists, kinesiologists, etc. as providers in the TELUS integration but use the supervising physiotherapist’s credentials.
When we send the submissions to TELUS/insurer we don’t send the staff member’s name as it is entered in Jane, just the credentials so this will end up being the same as you are doing in the portal already.
It is important to note if you have any multiple physiotherapists that “share” the same assistants, you would need to edit the credentials in the integration to match the correct physiotherapist’s details for the given submission since we don’t have a way to manage switching between multiple sets of credentials to accommodate that type of set up.
Also, just a friendly reminder to make sure that when you are submitting claims for these types of visits that you are adhering to your College’s specific regulations around assigned or supervised care (as I am sure you already do!) to avoid any troubles in the event of an audit.
Can you void claims in the integration, and during what timeframe?
You are able to void (or reverse) a submission through Jane only on the same day it was submitted. Read more about
Reversing Submissions through the TELUS eClaims Integration
in our guide.
Can the explanation of benefits forms (EOBs) be accessed forever?
The EOBs you receive will be accessible indefinitely within Jane from the submission view on any given appointment. However, once the policy is removed from the appointment, we lose that paper trail for the claim and won’t be able to recover it. If you plan on removing a claim from a visit, you’ll want to make sure to save the EOB first.
Will Jane let the clinic know when the patient is out of coverage?
Jane only connects with the eClaims system when you perform an eligibility check or actually submit a claim so there are no automatic updates that will happen in that sense. If a patient’s coverage has been exhausted for the year that’ll be communicated to you in the response you receive when you submit a claim or eligibility check.
Can I still enter default coverage amounts on policies?
You do not need to enter in default coverage amounts because Jane will auto-fill the amounts when the submission is done 🙂
As well, clinics that have already been tracking their eClaims portal submissions in Jane don’t need to remove default coverage amounts when upgrading their insurers - we’ve built the integration so that when you “enable electronic submission” Jane will automatically erase those fields on the visit if they are filled out. So you can save yourself some work here and let Jane do it for you.
Can you submit secondary plans through the integration?
You should only submit to the primary insurer and have the patient submit manually to their secondary insurer. In order to correctly and accurately adjudicate secondary claims, the insurance company needs to see the details of the primary coverage adjudication and this is not something that is possible through eClaims.
Are coordination of benefits (Canada Life, Claim Secure) submission supported through Jane?
At the moment coordination of benefits (primary and secondary coverage under the same company) submissions are not supported in Jane. It is something that we will be adding down the road for the insurers that do offer this so stay tuned! In the meantime, it is best to submit these types of claims directly in the eClaims portal.
How long do I have to submit a claim?
You have a
31-day deadline
from the date of service to submit to TELUS eClaims within Jane. After 31 days, you’ll need to get the patient to submit it themselves or contact the insurer.
Can I direct bill to Alberta Blue Cross through the Telus eClaims Integration?
Only clinics located
outside of Alberta
are able to use the Telus eClaims integration to submit claims to Alberta Blue Cross.
Clinics
located in Alberta
will need to submit the claim outside of Jane and then manually record the claim and payment in Jane. Check out our guide on
Working with Claim Submissions and Online Insurer Portals
for more detailed steps.
KEY204 – The policy or group number is missing, invalid, or not found.
You may get a KEY204 message in the case where the patient, certificate, or policy was not found in the insurer’s database. Double-check the policy or group numbers, as well as the member ID or certificate number from the patient’s benefits card. Also, verify that you have selected the correct “Relationship to Insured” in the insurance policy in Jane.
NL37 – the insurer does not allow electronic submissions for this policy or group.
There might be a restriction on the patient’s plan to not allow electronic submission or allow the provider to receive payment on the member’s behalf. In these cases, have the patient contact the insurer or their plan administrator directly to confirm and if possible, to remove the restriction.
NL20: VALIDAT - the Provider (Author) is invalid; not registered for TELUS eClaims or is unauthorized for the User
This error means that the provider details configured in the integration set up in Jane do not match what TELUS has on file (
note that the name you will see in this error will always be whomever’s name was input for the login details you entered to link your eClaims location - it does not mean that that person’s details are being pulled in for the submission
).
You’ll want to log into the TELUS eClaims portal and double-check the license number you have entered in Jane’s TELUS eClaims integration settings matches what shows in the TELUS portal
exactly
.
If you have confirmed the details match and still continue to receive this error please contact TELUS to verify and make any changes to the provider license numbers they have on file for you or reach out to our Jane support team.
This error can also come up if you have entered the incorrect Provider TELUS ID number or if you have set a provider as an “Associate” when they should be “Independent”.
Error-17 – Unable to authenticate the user.  Incorrect password error. OR SoapServerError Error Code: wsse:FailedAuthentication. Your password for TELUS Health eClaims is incorrect.
Despite this error’s wording, it doesn’t always mean that you have entered the incorrect password. This error message can also come up if you have entered in the incorrect username. To resolve this error double check that the username you have provided is correct (it will follow the format of XX0000123456, and will
not
be an email address) and/or ensure that the password entered is correct and is not expired.
To confirm or update your TELUS password in Jane, head to the
Settings > Integrations
area and select TELUS eClaims.
Hit the
Edit
button next to any locations that are setup and you will see the password section under the username field. If you are using the same TELUS account credentials in more than one location in Jane remember to update ALL location passwords.
Also, double-check that any password credentials entered in Independent Provider’s integration profiles are also updated with the new password. To do this click
Edit
beside the practitioner’s name and scroll down to the “Alternate TELUS eClaims Account” section, enter the new password and save your changes. If you are a solo practitioner or you entered the same independent provider credentials in the location settings of the integration, you don’t actually need to complete this section of the provider integration profile. By leaving this area blank, Jane will use the credentials at the location level for that practitioner and save you some clicks when updating your password.
ArgumentError - account recipient must be an organization or account. Got NilClass
Typically we see this error when you have answered “No” to “Is your clinic set up as an Organization?” in the Location set up of the integration which means you are an independent provider but have selected “Associate” in the Provider set up.
We have also seen this error when the incorrect information has been entered in the Organization CPR ID field of the integration Location settings.
To resolve this error, double-check that you have made the correct selections for your eClaims account set up. If you are an Organization select “yes” in your Location settings and all providers under that account should be set as “Associates”. If you answered “no” in the location settings all providers would need to be set as “Independent/Solo”. Also, verify that you have entered to correct credentials for Organization CPR ID if you are an organization (this number will match the numbers in your username).
NL23 - the servicing provider role is not registered for the TELUS eClaims service
You may receive this error if:
(1) The practitioner’s discipline being sent to TELUS doesn’t match up with what TELUS has on file for that practitioner. We can see this for practitioners who are licensed as one type of provider but who are able to provide services that can fall under a separate discipline when you have set up a separate discipline for those services. e.g. Naturopaths who do acupuncture and have separate Acupuncture and Naturopathic disciplines. To resolve this error, you’ll need to edit the Category associated with the Discipline to match the practitioner’s officially licensed discipline. e.g. edit Acupuncture discipline and change “Category” to “Naturopathy”
(2) You have incorrectly answered “Is your clinic set up as an Organization?” in the Location set up of the integration. To resolve this error please verify if your eClaims account is set up for an Organization or as an Independent. To learn more about how to set your Organization or Independent account status, this guide can be helpful:
TELUS eClaims - Setting Up Your TELUS eClaims Integration
(3) You may have the incorrect TELUS Provider ID for the staff member listed in Jane. This can be fixed by checking your TELUS eClaims portal on the Banking Information page. The TELUS eClaims Provider ID will be a 4-7 digit number. To learn more about how to add a staff member’s TELUS Provider ID number, this guide can be helpful:
TELUS eClaims - Setting Up Your TELUS eClaims Integration
NL49: New terms and conditions for eClaims must be accepted by an admin user before you can submit claims or predeterminations to the Canada Life - PSHCP insurer.
You may receive this error if there are new terms and conditions that haven’t been accepted by an admin user in the Telus portal.
To resolve this error, you’ll want to log into the Telus portal as an administrator. Next, click the Menu (the three lines) on the main page. Select
Services
under “Manage my business”. From here, you’ll be able to accept the new terms and conditions for both Telus and WSIB if applicable.
Once these steps are complete, you may need to remove the claim from the appointment in Jane and add a fresh one before trying to submit it again.
SOAP-ENV: Server – Internal Error
You will receive this error if bad/unexpected data was sent in the request.
e.g. If there are extra spaces either at the start or end of one of the credentials you have entered  in the integration settings
e.g. If you have entered a username in the Provider CPR ID field
To resolve this error, review your account credentials, correct or remove the incorrect data, save your changes and resubmit.
NL107- INVALID DATA TYPE SPECIFICATION FORMAT OR STRUCTURE USED DOES NOT MATCH THE EXPECTED DATA TYPE FOR THE ELEMENT PUBLIC EXTENSION MUST HAVE AT LEAST 1 CHARACTER MAX OF 20 CHARACTERS INVALID DATA TYPE
You will receive this error if you have entered invalid data into a field in your integration settings. 
e.g. If you have entered your clinic address into the “Location ID” field when setting up your Location in the integration
e.g. If you have entered an email address into the provider License ID field
To resolve this error, review your account credentials, correct or remove the incorrect data, save your changes and resubmit.
NL300 - Can’t extract policy-holder last name from the request.
This error usually means that the date of birth is missing for the policyholder when the relationship to the insured has been set to anything other than “Self”. To resolve this error, edit the patient’s policy to add the insured member’s DOB, save the changes and resubmit.
What is the EC11: Missing/Invalid Subscriber Identification Number error message?
The EC11 error message is similar to a KEY204 error message, however, typically means the Telus eClaims portal is completely down or the portal is down for one specific insurer.
We recommend logging into the portal itself to submit the claim. If you are still unable to submit the claim, it would be best to contact Telus eClaims or the insurer directly. You can find their contact information
here
💙
I’m having a hard time finding the credentials I need in the eClaims portal - Is there anywhere else I can find the information I need?
If you are having trouble locating the eClaims account credentials you need to enter in Jane, there are some other ways you can get the information you need. One way is to log into the eClaims portal and view a previous submission. The submission should contain all the info you need. 
Alternatively, you can also contact the TELUS team and request a spreadsheet of your account credentials.
How can I contact Telus eClaims?
If you need to speak with TELUS eClaims directly, you can call their phone number
1 (866) 240-7492
or visit their
Contact TELUS Health
page for more information.
Telus eClaims isn’t in my Integrations list — why not?
If you can’t find Telus eClaims in
Settings
>
Integrations
, there could be two reasons:
You may be on Jane’s
Base Plan
instead of the Insurance Plan
You may not be a
Full Access user
in the Jane account
Only a Full Access user can see and manage the Telus eClaims integration, if the Jane account is on the Insurance Plan. If you need to upgrade to the Insurance Plan, the Account Owner can do so in their
Jane Subscription
area.
How do I print a Telus eClaims EOB?
On a Submitted Telus Claim, click on the
View
button. Next, in the claims response window that opens up, scroll down and click on the blue
View Explanation of Benefits
(EOB) text.
This will open the EOB in a new tab to view where you can select print or download
Can I fill out the TELUS eClaims consent forms through Jane?
No
- It isn’t possible for patients to sign forms other than intake forms created in Jane currently.
While some clinics have worked it into their Jane intake forms/consents, TELUS requires patients to complete and sign their own consent forms and there isn’t a way to accommodate that in Jane at the moment. Once the form is signed externally of Jane, you can
upload a copy of it to the Files area within their Profile
.
How can I resolve the ‘missing provider information’ error when the details appear to be entered correctly under the integration settings?
There are two main reasons that can cause this issue:
Reason #1:
The
Category
selected for the discipline does not match how the staff member is registered with Telus. The name of the discipline can be whatever the clinic likes - it’s the
category
that is sent to Telus for a claim.
To view and update the category a discipline is assigned to, you can head over to the
Settings
tab and then select
Disciplines
within the left sidebar menu. Next, click on the word
Edit
to the right of the discipline.
From there, you can use the dropdown menu to select the
Category
the staff member’s license is registered as or how they are registered with Telus eClaims.
Make sure to hit the blue
Update Disciplin
e button to confirm those changes and you can try to submit the claim again.
Reason #2
: The
location/staff member
has not been set up with the Telus Integration yet.
For this reason, you’ll want to log into the Telus eClaims portal or contact Telus eClaims support to confirm that the location and the staff member are set up correctly on their portal.
If you need to speak with TELUS eClaims directly, you can call their phone number 1 (866) 240-7492 or visit their
Contact TELUS Health
page for more information.
NL310 - “Adjudicator is not available. Please try again later.”
The error message indicates that there is an issue on the insurer’s side preventing the submission from going through. Most commonly, their website or the Telus eClaims portal is down.
While we’re limited in resolving this error message in the moment, here’s are our recommendations:
Try submitting the claim later or the following day
If the error persists, you can  contact the insurer directly to confirm if the claim was received and adjudicated:
If the insurer received the claim, you can save the EOB (Explanation of Benefits), disable electronic submission and manually enter the covered amounts.
If the insurer did not receive the claim, you can try resubmitting either through Jane or directly on the Telus eClaims portal once it’s up and running again.
To speak with TELUS eClaims directly, you can call their phone number 1 (866) 240-7492 or visit their
Contact TELUS Health
page for more information.
Object reference not set to an instance of an object
The error message “Object reference not set to an instance of an object” comes from RWAM Insurance Administrators and usually indicates an issue on their end. We recommend contacting RWAM directly for more details. In many cases, this error resolves itself, so please try submitting the claim again later that day or the next, or consider submitting the claim through RWAM’s portal as an alternative.
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
How to reset your email password and enable Two-Factor Authentication (2FA)TELUS eClaims FAQ + Troubleshooting
Insurance Billing (Canada)
TELUS eClaims FAQ + Troubleshooting
31 min read
Practice Plan
Thrive PlanThis guide is a compilation of some of the most frequently asked questions around Jane’s TELUS eClaims integration, errors and troubleshooting tips.
If you haven’t seen them already, we do have a few other dedicated guides that may come in handy on setting up your integration, submitting claims and reversing submissions.
Setting Up Your TELUS eClaims Integration
Submitting Claims and Eligibility Checks Through the TELUS eClaims Integration
Reversing Submissions Through the TELUS eClaims Integration
Feel free to scroll through the different topics, or jump straight to a particular question:
General Integration Features
I’m in Ontario, can I bill to WSIB through Jane’s eClaim integration?
Can I submit dental claims through Jane?
Where can I see a list of participating insurers?
Will I be able to see the submissions I make through Jane in the eClaims portal?
When and how can I expect to get paid by the insurance companies?
Everyone at my clinic has their own independent eClaims account, can we link them all to Jane?
Can you link eClaims accounts for multiple locations in Jane?
How can I update/change the Telus eClaims password in Jane?
I don’t see Telus eClaims in my Integrations list — why not?
How do I print a Telus eClaims EOB?
Can I fill out the TELUS eClaims consent forms through Jane?
Submitting Claims
Can you batch submit multiple claims all at once?
Can I courtesy bill (submit on the patient’s behalf) or select the patient as the payee through the integration?
Will On Hold/Pended responses update automatically?
How can I submit claims for assigned or supervised care through the integration (physiotherapy)?
Can you void claims in the integration, and during what timeframe?
Can the explanation of benefits forms (EOBs) be accessed forever?
Will Jane let the clinic know when the patient is out of coverage?
Can I still enter default coverage amounts on policies?
Can you submit secondary plans through the integration?
Are coordination of benefits (Canada Life, Claim Secure) submissions supported through Jane?
How long do I have to submit a claim?
Can I direct bill to Alberta Blue Cross through the Telus eClaims Integration?
Errors and Troubleshooting
I’m having a hard time finding the credentials I need in the eClaims portal - Is there anywhere else I can find the information I need?
How can I contact Telus eClaims?
KEY204 – The policy or group number is missing, invalid, or not found.
NL37 – the insurer does not allow electronic submissions for this policy or group.
NL20: VALIDAT - the Provider (Author) is invalid; not registered for TELUS eClaims or is unauthorized for the User
Error-17 – Unable to authenticate the user.  Incorrect password error. OR SoapServerError Error Code: wsse:FailedAuthentication. Your password for TELUS Health eClaims is incorrect.
ArgumentError - account recipient must be an organization or account. Got NilClass
NL23 - the servicing provider role is not registered for the TELUS eClaims service
NL49: New terms and conditions for eClaims must be accepted by an admin user before you can submit claims or predeterminations to the Canada Life - PSHCP insurer
SOAP-ENV: Server – Internal Error
NL107- INVALID DATA TYPE SPECIFICATION FORMAT OR STRUCTURE USED DOES NOT MATCH THE EXPECTED DATA TYPE FOR THE ELEMENT PUBLIC EXTENSION MUST HAVE AT LEAST 1 CHARACTER MAX OF 20 CHARACTERS INVALID DATA TYPE
NL300 - Can’t extract policyholder’s last name from the request.
EC11 - Missing/Invalid Subscriber Identification Number error message
How can I resolve the ‘missing provider information’ error when the details appear to be entered correctly under the integration settings?
NL310 - “Adjudicator is not available. Please try again later.”
Object reference not set to an instance of an object
I’m in Ontario, can I bill to WSIB through Jane’s eClaims integration?
Because WSIB claims in Ontario are submitted through a separate system that TELUS offers, these submissions aren’t able to be managed through our TELUS eClaims integration. These submissions would need to be done outside of Jane, but you can use Jane’s Insurance Features to keep track of the submissions and payments.
Can I submit dental claims through Jane?
Jane’s eClaims integration which is an alternative to the TELUS Provider Portal is specifically for extended healthcare benefits and does not include Drug/Pharmacy or Dental Services. Dental claim submissions are facilitated by TELUS through a different system.
Where can I see a list of participating insurers?
Telus has a handy
Insurer toolkit page here
where you can enter your discipline and province for an up-to-date list of participating insurers.
We also have a list in our guide on
Setting Up Your TELUS eClaims Integration
.
Will I be able to see the submissions I make through Jane in the eClaims portal?
TELUS eClaims actually has separate systems for their portal and integration submissions. Since the two systems don’t speak to each other, the submissions you make and the responses you get in Jane won’t be visible within the portal.
When and how can I expect to get paid by the insurance companies?
Submitting your claims through Jane will not change how you are paid by the different insurance companies - you will continue to receive payments and statements from the insurers in the same way you are used to from submitting through the eClaims portal. 
If you would like to know more about how and when payments are issued for each participating insurer check out TELUS Health’s handy
Insurer Payment Guide
Everyone at my clinic has their own independent eClaims account, can we link them all to Jane?
Jane’s eClaims integration can accommodate just about any clinic situation - including multiple independent eClaims accounts. In this scenario, you’ll need to pick one provider’s account to link in the Location set up (doesn’t matter who!) and then set every practitioner up as an Independent Provider. For each practitioner whose account credentials were
not
used in the Location set up, enter in their specific username, password, and other details in the Alternate TELUS eClaims Account section.
We go over this set up as part of our video on How to Set up Your Integration for Organizations & Groups of Practitioners:
https://player.vimeo.com/video/500658166
Can you link eClaims accounts for multiple locations in Jane?
You can link a different eClaims account to each Location you have created in Jane. However, each Location in Jane can only accommodate
one
Organization type eClaims account
but
any number of independent accounts (e.g. one organization account and 5 independent eClaims accounts linked to a single Jane Location).
If your clinic is set up such that you use more than one Organization type account under a single location this cannot be accommodated.
See
Everyone at my clinic has their own independent eClaims account, can we link them all to Jane?
for details about linking more than one Independent account to Jane.
How can I update/change the Telus eClaims password in Jane?
Note
📝:
If you need to update your password for your Telus eClaims/Health login, you’ll first want to log into the portal directly. Once the password is changed on their platform, you can update it for the integration. For more details on how you can change your Telus password within the portal, check out their guide on
Managing Passwords
.
As a
Full Access
user, there are two ways you can update your password once you’ve changed it on the Telus eClaims portal:
For clinic’s set up as an Organization:
To start, you’ll want to head over to the
Settings
tab >
Integrations
>
1 Integration
on the Telus eClaims section.
When you’re updating the password in this area, you’ll want to ensure you’re doing it under
Locations
.
And you’ll be able to update the password here:
For Independent/Solo Providers:
While this change happens in a similar area under the
Settings
tab,
Integrations
on the left sidebar menu and
1 Integration
within the Telus eClaims section, you’ll want to make sure to update the password under
Providers
:
Under the
Alternate Telus eClaims Account
section, update the
Password
and click
Update Provider
at the bottom of the page
Can you batch submit multiple claims all at one time?
Batch claim submission is not possible. Each claim must be submitted individually even if they are for the same patient.
Can I courtesy bill (submit on patient’s behalf) or select the patient as the payee through the integration?
You sure can! To do this, you’ll just need to set the
Insurance Mode
on the visit to
Patient Pre-Pay
before submitting:
From there, you can just submit the claim normally and Jane will send along the preference for the patient to be reimbursed.
Also, when you switch a purchase to Patient Pre-Pay, Jane will still generate an insurer invoice for the full amount of what was billed, but Jane will also push that full amount down to the patient so you can accept their payment at the time of service.
Will On Hold/Pended responses update in Jane automatically?
In the case that a submission comes back as On Hold or Pending, these claims
won’t
update automatically to a “Paid” or “Rejected” status.
When Jane gets a response, typically it will specify
who
can expect to be reimbursed, the clinic or the patient. If you’d like to read more about how to manage on hold and pending claims,
check out our guide on that here
.
How can I submit claims for assigned or supervised care through the integration (physiotherapy)?
You can set this up in Jane by adding your physiotherapy assistants, athletic therapists, kinesiologists, etc. as providers in the TELUS integration but use the supervising physiotherapist’s credentials.
When we send the submissions to TELUS/insurer we don’t send the staff member’s name as it is entered in Jane, just the credentials so this will end up being the same as you are doing in the portal already.
It is important to note if you have any multiple physiotherapists that “share” the same assistants, you would need to edit the credentials in the integration to match the correct physiotherapist’s details for the given submission since we don’t have a way to manage switching between multiple sets of credentials to accommodate that type of set up.
Also, just a friendly reminder to make sure that when you are submitting claims for these types of visits that you are adhering to your College’s specific regulations around assigned or supervised care (as I am sure you already do!) to avoid any troubles in the event of an audit.
Can you void claims in the integration, and during what timeframe?
You are able to void (or reverse) a submission through Jane only on the same day it was submitted. Read more about
Reversing Submissions through the TELUS eClaims Integration
in our guide.
Can the explanation of benefits forms (EOBs) be accessed forever?
The EOBs you receive will be accessible indefinitely within Jane from the submission view on any given appointment. However, once the policy is removed from the appointment, we lose that paper trail for the claim and won’t be able to recover it. If you plan on removing a claim from a visit, you’ll want to make sure to save the EOB first.
Will Jane let the clinic know when the patient is out of coverage?
Jane only connects with the eClaims system when you perform an eligibility check or actually submit a claim so there are no automatic updates that will happen in that sense. If a patient’s coverage has been exhausted for the year that’ll be communicated to you in the response you receive when you submit a claim or eligibility check.
Can I still enter default coverage amounts on policies?
You do not need to enter in default coverage amounts because Jane will auto-fill the amounts when the submission is done 🙂
As well, clinics that have already been tracking their eClaims portal submissions in Jane don’t need to remove default coverage amounts when upgrading their insurers - we’ve built the integration so that when you “enable electronic submission” Jane will automatically erase those fields on the visit if they are filled out. So you can save yourself some work here and let Jane do it for you.
Can you submit secondary plans through the integration?
You should only submit to the primary insurer and have the patient submit manually to their secondary insurer. In order to correctly and accurately adjudicate secondary claims, the insurance company needs to see the details of the primary coverage adjudication and this is not something that is possible through eClaims.
Are coordination of benefits (Canada Life, Claim Secure) submission supported through Jane?
At the moment coordination of benefits (primary and secondary coverage under the same company) submissions are not supported in Jane. It is something that we will be adding down the road for the insurers that do offer this so stay tuned! In the meantime, it is best to submit these types of claims directly in the eClaims portal.
How long do I have to submit a claim?
You have a
31-day deadline
from the date of service to submit to TELUS eClaims within Jane. After 31 days, you’ll need to get the patient to submit it themselves or contact the insurer.
Can I direct bill to Alberta Blue Cross through the Telus eClaims Integration?
Only clinics located
outside of Alberta
are able to use the Telus eClaims integration to submit claims to Alberta Blue Cross.
Clinics
located in Alberta
will need to submit the claim outside of Jane and then manually record the claim and payment in Jane. Check out our guide on
Working with Claim Submissions and Online Insurer Portals
for more detailed steps.
KEY204 – The policy or group number is missing, invalid, or not found.
You may get a KEY204 message in the case where the patient, certificate, or policy was not found in the insurer’s database. Double-check the policy or group numbers, as well as the member ID or certificate number from the patient’s benefits card. Also, verify that you have selected the correct “Relationship to Insured” in the insurance policy in Jane.
NL37 – the insurer does not allow electronic submissions for this policy or group.
There might be a restriction on the patient’s plan to not allow electronic submission or allow the provider to receive payment on the member’s behalf. In these cases, have the patient contact the insurer or their plan administrator directly to confirm and if possible, to remove the restriction.
NL20: VALIDAT - the Provider (Author) is invalid; not registered for TELUS eClaims or is unauthorized for the User
This error means that the provider details configured in the integration set up in Jane do not match what TELUS has on file (
note that the name you will see in this error will always be whomever’s name was input for the login details you entered to link your eClaims location - it does not mean that that person’s details are being pulled in for the submission
).
You’ll want to log into the TELUS eClaims portal and double-check the license number you have entered in Jane’s TELUS eClaims integration settings matches what shows in the TELUS portal
exactly
.
If you have confirmed the details match and still continue to receive this error please contact TELUS to verify and make any changes to the provider license numbers they have on file for you or reach out to our Jane support team.
This error can also come up if you have entered the incorrect Provider TELUS ID number or if you have set a provider as an “Associate” when they should be “Independent”.
Error-17 – Unable to authenticate the user.  Incorrect password error. OR SoapServerError Error Code: wsse:FailedAuthentication. Your password for TELUS Health eClaims is incorrect.
Despite this error’s wording, it doesn’t always mean that you have entered the incorrect password. This error message can also come up if you have entered in the incorrect username. To resolve this error double check that the username you have provided is correct (it will follow the format of XX0000123456, and will
not
be an email address) and/or ensure that the password entered is correct and is not expired.
To confirm or update your TELUS password in Jane, head to the
Settings > Integrations
area and select TELUS eClaims.
Hit the
Edit
button next to any locations that are setup and you will see the password section under the username field. If you are using the same TELUS account credentials in more than one location in Jane remember to update ALL location passwords.
Also, double-check that any password credentials entered in Independent Provider’s integration profiles are also updated with the new password. To do this click
Edit
beside the practitioner’s name and scroll down to the “Alternate TELUS eClaims Account” section, enter the new password and save your changes. If you are a solo practitioner or you entered the same independent provider credentials in the location settings of the integration, you don’t actually need to complete this section of the provider integration profile. By leaving this area blank, Jane will use the credentials at the location level for that practitioner and save you some clicks when updating your password.
ArgumentError - account recipient must be an organization or account. Got NilClass
Typically we see this error when you have answered “No” to “Is your clinic set up as an Organization?” in the Location set up of the integration which means you are an independent provider but have selected “Associate” in the Provider set up.
We have also seen this error when the incorrect information has been entered in the Organization CPR ID field of the integration Location settings.
To resolve this error, double-check that you have made the correct selections for your eClaims account set up. If you are an Organization select “yes” in your Location settings and all providers under that account should be set as “Associates”. If you answered “no” in the location settings all providers would need to be set as “Independent/Solo”. Also, verify that you have entered to correct credentials for Organization CPR ID if you are an organization (this number will match the numbers in your username).
NL23 - the servicing provider role is not registered for the TELUS eClaims service
You may receive this error if:
(1) The practitioner’s discipline being sent to TELUS doesn’t match up with what TELUS has on file for that practitioner. We can see this for practitioners who are licensed as one type of provider but who are able to provide services that can fall under a separate discipline when you have set up a separate discipline for those services. e.g. Naturopaths who do acupuncture and have separate Acupuncture and Naturopathic disciplines. To resolve this error, you’ll need to edit the Category associated with the Discipline to match the practitioner’s officially licensed discipline. e.g. edit Acupuncture discipline and change “Category” to “Naturopathy”
(2) You have incorrectly answered “Is your clinic set up as an Organization?” in the Location set up of the integration. To resolve this error please verify if your eClaims account is set up for an Organization or as an Independent. To learn more about how to set your Organization or Independent account status, this guide can be helpful:
TELUS eClaims - Setting Up Your TELUS eClaims Integration
(3) You may have the incorrect TELUS Provider ID for the staff member listed in Jane. This can be fixed by checking your TELUS eClaims portal on the Banking Information page. The TELUS eClaims Provider ID will be a 4-7 digit number. To learn more about how to add a staff member’s TELUS Provider ID number, this guide can be helpful:
TELUS eClaims - Setting Up Your TELUS eClaims Integration
NL49: New terms and conditions for eClaims must be accepted by an admin user before you can submit claims or predeterminations to the Canada Life - PSHCP insurer.
You may receive this error if there are new terms and conditions that haven’t been accepted by an admin user in the Telus portal.
To resolve this error, you’ll want to log into the Telus portal as an administrator. Next, click the Menu (the three lines) on the main page. Select
Services
under “Manage my business”. From here, you’ll be able to accept the new terms and conditions for both Telus and WSIB if applicable.
Once these steps are complete, you may need to remove the claim from the appointment in Jane and add a fresh one before trying to submit it again.
SOAP-ENV: Server – Internal Error
You will receive this error if bad/unexpected data was sent in the request.
e.g. If there are extra spaces either at the start or end of one of the credentials you have entered  in the integration settings
e.g. If you have entered a username in the Provider CPR ID field
To resolve this error, review your account credentials, correct or remove the incorrect data, save your changes and resubmit.
NL107- INVALID DATA TYPE SPECIFICATION FORMAT OR STRUCTURE USED DOES NOT MATCH THE EXPECTED DATA TYPE FOR THE ELEMENT PUBLIC EXTENSION MUST HAVE AT LEAST 1 CHARACTER MAX OF 20 CHARACTERS INVALID DATA TYPE
You will receive this error if you have entered invalid data into a field in your integration settings. 
e.g. If you have entered your clinic address into the “Location ID” field when setting up your Location in the integration
e.g. If you have entered an email address into the provider License ID field
To resolve this error, review your account credentials, correct or remove the incorrect data, save your changes and resubmit.
NL300 - Can’t extract policy-holder last name from the request.
This error usually means that the date of birth is missing for the policyholder when the relationship to the insured has been set to anything other than “Self”. To resolve this error, edit the patient’s policy to add the insured member’s DOB, save the changes and resubmit.
What is the EC11: Missing/Invalid Subscriber Identification Number error message?
The EC11 error message is similar to a KEY204 error message, however, typically means the Telus eClaims portal is completely down or the portal is down for one specific insurer.
We recommend logging into the portal itself to submit the claim. If you are still unable to submit the claim, it would be best to contact Telus eClaims or the insurer directly. You can find their contact information
here
💙
I’m having a hard time finding the credentials I need in the eClaims portal - Is there anywhere else I can find the information I need?
If you are having trouble locating the eClaims account credentials you need to enter in Jane, there are some other ways you can get the information you need. One way is to log into the eClaims portal and view a previous submission. The submission should contain all the info you need. 
Alternatively, you can also contact the TELUS team and request a spreadsheet of your account credentials.
How can I contact Telus eClaims?
If you need to speak with TELUS eClaims directly, you can call their phone number
1 (866) 240-7492
or visit their
Contact TELUS Health
page for more information.
Telus eClaims isn’t in my Integrations list — why not?
If you can’t find Telus eClaims in
Settings
>
Integrations
, there could be two reasons:
You may be on Jane’s
Base Plan
instead of the Insurance Plan
You may not be a
Full Access user
in the Jane account
Only a Full Access user can see and manage the Telus eClaims integration, if the Jane account is on the Insurance Plan. If you need to upgrade to the Insurance Plan, the Account Owner can do so in their
Jane Subscription
area.
How do I print a Telus eClaims EOB?
On a Submitted Telus Claim, click on the
View
button. Next, in the claims response window that opens up, scroll down and click on the blue
View Explanation of Benefits
(EOB) text.
This will open the EOB in a new tab to view where you can select print or download
Can I fill out the TELUS eClaims consent forms through Jane?
No
- It isn’t possible for patients to sign forms other than intake forms created in Jane currently.
While some clinics have worked it into their Jane intake forms/consents, TELUS requires patients to complete and sign their own consent forms and there isn’t a way to accommodate that in Jane at the moment. Once the form is signed externally of Jane, you can
upload a copy of it to the Files area within their Profile
.
How can I resolve the ‘missing provider information’ error when the details appear to be entered correctly under the integration settings?
There are two main reasons that can cause this issue:
Reason #1:
The
Category
selected for the discipline does not match how the staff member is registered with Telus. The name of the discipline can be whatever the clinic likes - it’s the
category
that is sent to Telus for a claim.
To view and update the category a discipline is assigned to, you can head over to the
Settings
tab and then select
Disciplines
within the left sidebar menu. Next, click on the word
Edit
to the right of the discipline.
From there, you can use the dropdown menu to select the
Category
the staff member’s license is registered as or how they are registered with Telus eClaims.
Make sure to hit the blue
Update Disciplin
e button to confirm those changes and you can try to submit the claim again.
Reason #2
: The
location/staff member
has not been set up with the Telus Integration yet.
For this reason, you’ll want to log into the Telus eClaims portal or contact Telus eClaims support to confirm that the location and the staff member are set up correctly on their portal.
If you need to speak with TELUS eClaims directly, you can call their phone number 1 (866) 240-7492 or visit their
Contact TELUS Health
page for more information.
NL310 - “Adjudicator is not available. Please try again later.”
The error message indicates that there is an issue on the insurer’s side preventing the submission from going through. Most commonly, their website or the Telus eClaims portal is down.
While we’re limited in resolving this error message in the moment, here’s are our recommendations:
Try submitting the claim later or the following day
If the error persists, you can  contact the insurer directly to confirm if the claim was received and adjudicated:
If the insurer received the claim, you can save the EOB (Explanation of Benefits), disable electronic submission and manually enter the covered amounts.
If the insurer did not receive the claim, you can try resubmitting either through Jane or directly on the Telus eClaims portal once it’s up and running again.
To speak with TELUS eClaims directly, you can call their phone number 1 (866) 240-7492 or visit their
Contact TELUS Health
page for more information.
Object reference not set to an instance of an object
The error message “Object reference not set to an instance of an object” comes from RWAM Insurance Administrators and usually indicates an issue on their end. We recommend contacting RWAM directly for more details. In many cases, this error resolves itself, so please try submitting the claim again later that day or the next, or consider submitting the claim through RWAM’s portal as an alternative.Subscribe to our monthly newsletter.Jane Software Inc.
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
- ![](https://jane.app/thumbs/8bc477d6-55e5-4906-abb9-a2f51aba406a)
- ![](https://jane.app/thumbs/07c87408-3fa2-401a-881f-b6e41b45e8ee)
- ![](https://jane.app/thumbs/97c9b6f2-1e04-4f42-b279-dfcff285699e)
- ![](https://jane.app/thumbs/d7d957fd-4c0d-4df7-bace-0d3f04a7310c)
- ![](https://jane.app/thumbs/d8416c1d-68fe-4ac5-940b-e33d1387695d)
- ![https://d33v4339jhl8k0.cloudfront.net/inline/18598/d6e75323759601b3c70f431bc4721f766f1d9362/10ac37679a2c36d6ab09f2462c9e0cf51acf7792/e3dc7cc041db4b2a9dd8f7e94227f868.png](https://d33v4339jhl8k0.cloudfront.net/inline/18598/d6e75323759601b3c70f431bc4721f766f1d9362/10ac37679a2c36d6ab09f2462c9e0cf51acf7792/e3dc7cc041db4b2a9dd8f7e94227f868.png)
- ![](https://jane.app/thumbs/01496a08-fdb7-4f50-9db7-fa55243d09ef)
- ![](https://jane.app/thumbs/cd8c9cb0-2a35-4bd8-8fce-def743b92d28)
- ![](https://jane.app/thumbs/ff8366b5-4bb5-469f-9e05-19ec10136f17)
- ![](https://jane.app/thumbs/abba8824-48d3-46c0-9e0d-92a823ade393)
- ![An image of where to view the disable electronic submission option within the claim](https://jane.app/thumbs/c5df171f-0daf-4ef1-a529-d4cbc151b288)
- ![See Jane run your practice](https://jane.app/assets/see-jane-run-3391a88ce3b589c298b8f49eed29f6e88b867c00e0cf51fcb2294d395acd6472.svg)
