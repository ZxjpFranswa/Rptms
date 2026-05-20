  

School of Computer & Information Sciences




Software Project Analysis 
and Design Document

of

Tax Billing & Collection
(RPTMS)




Submitted by:
Vince A. Abellano


SOFTWARE PROJECT ROADMAP (20pts)

Project Description

Project Goal
The Tax Billing & Collection Module is engineered to digitize the manual fiscal operations of local government units, focusing on Efficiency, Dependability, and Maintainability. By automating the calculation of Basic RPT and SEF (Special Education Fund), the system eliminates manual computation errors (Dependability). It ensures that revenue collection is optimized through high-speed transaction processing at the cashier’s booth (Efficiency) and allows for easy updates to tax ordinances or penalty rates without requiring a system overhaul (Maintainability).

Stakeholders
The objectives of the stakeholders are strategically aligned with Acceptability, Security, and Reliability.

Municipal Treasurer: Seeks Security and oversight; needs to approve waivers and monitor real-time collection summaries.
Revenue Clerk: Focuses on Accuracy and Reliability; responsible for generating accurate Statements of Account (SOA), managing billing cycles, and ensuring property assessments are correctly translated into tax dues.
Cashier: Requires Acceptability (Usability); needs a fast, intuitive interface to process payments and issue Official Receipts (OR) within seconds.
Taxpayer: Demands Reliability; seeks transparent billing statements and immediate confirmation of payment to maintain a "Cleared" property status.

Key Features
The Tax Billing & Collection Module is classified as a Business Processing System specifically engineered as a "bespoke" (custom-tailored) solution for local government infrastructure. Its primary role is to serve as the financial engine of the RPTMS, transitioning the municipality from high-risk manual ledgers to a secure, automated digital environment. As a Transaction Processing System (TPS), it is designed to handle high-volume, face-to-face interactions at the municipal hall, ensuring that every tax payment—from basic RPT to Special Education Fund (SEF) contributions—is processed with absolute mathematical precision and immediate data synchronization.

Automated Tax Calculation Engine - Dependability & Reliability: By automating the logic for Basic RPT, SEF, and legally mandated discounts or penalties, the system eliminates human calculation errors, ensuring that the "Single Source of Truth" remains financially accurate and trustworthy.
Real-Time Property Ledger Sync - Efficiency: The moment a Cashier validates a payment, the system instantly updates the property status across all modules. This eliminates the "fragmented database" problem where a property might appear delinquent in one office but paid in another.
Role-Based Audit Trails - Security: Every transaction, manual penalty waiver, or adjustment is logged with a unique User ID and timestamp. This ensures high Maintainability of administrative standards and prevents unauthorized revenue leakage or fraudulent record tampering.
Streamlined Cashiering Interface - Usability (Acceptability): Designed for high-pressure municipal environments, the interface minimizes clicks and data entry. This ensures that even staff with minimal technical training can process walk-in taxpayers quickly, reducing wait times and increasing public satisfaction.
Automated Delinquency Flagging - Efficiency: The system automatically identifies accounts that have missed fiscal deadlines, generating "Notice of Delinquency" reports without requiring manual audits of physical folders, thus optimizing revenue mobilization.

Development Plan

Agile Development Model. Justification of why this model is appropriate for the project, aligned with the advantages of the Agile Development Model

Tax Billing and Collection Module
Phases
Timeframe
Key Activities
Deliverables
Planning
Week 1–2
Identify stakeholders: Local Treasurer, Cashier, and Taxpayer.


Define user stories for tax calculation, billing issuance, and payment collection.


Gather requirements for tax rates (Basic vs. SEF) and discount/penalty logic (early bird discounts vs. late interest).


Define billing cycles (Annual, Quarterly, or Semi-annual options).


Approved Billing Scope


Product Backlog (Billing & Collection)


Tax Logic Documentation




Design
Week 3–4
Design Tax Computation Engine (linking Assessed Value from Property Module to Tax Rates).


Create ERD for Billing Records, Payment Transactions, and Official Receipts (OR).


Design UI for the Tax Billing Statement and Cashiering Interface.


Map workflows for partial payments and "delinquency" status triggers.


Database Schema (Billing/Payment)


UI Wireframes for Cashier Dashboard


Electronic Official Receipt (e-OR) Template


Tax Calculation Flowcharts


Development
Week 5–8
Develop the Automated Billing Engine to generate mass statements based on property records.


Implement Cashiering Module with real-time validation of payments.


Code the Penalty/Discount logic (automated calculation based on payment date).


Develop Reporting Features: Abstract of Collections, List of Delinquent Accounts, and Daily Collection Reports.


Functional Billing System


Integrated Cashiering Interface


Automated Penalty/Discount Module


Collection Report Generator


Testing
Week 9–10
Perform Calculation Testing to ensure taxes match manual computations for various property classes.


Conduct Stress Testing for bulk billing generation.


Validate Integration Testing (ensure payment in this module updates the "Paid" status in the Property Module).


User Acceptance Testing (UAT) with the Municipal Treasury staff.


Test Execution Logs


Calculation Accuracy Report


Signed UAT Results


Bug Fix Documentation


Deployment
-
-
-


Development Team

Team Member
Key Roles
Assigned Module & Features
Joseph Francois S. Payago
Leader
Property Management Module
Vincent L. Julia
Member
Tax Appraisal and Assessment Module
Vince A. Abellano
Member
Tax Billing and Collection Module: This module is responsible for the computation and collection of the tax money.



SYSTEM SPECIFICATIONS & ANALYSIS (30pts)

Software Requirement Specification

Tax Billing Generation
Revenue Clerk User Requirements
The System shall allow the Revenue Clerk to generate a Statement of Account (SOA) based on the Assessed Value synced from the Property Management Module.
The System shall automatically calculate the Basic Real Property Tax (RPT) and Special Education Fund (SEF) based on current municipal ordinances.
The System shall apply Early Payment Discounts automatically if the billing date falls within the incentive period.
The System shall compute Penalties and Interest for delinquent accounts based on the number of months past the due date.
The System shall allow for Partial Payment scheduling (Quarterly or Semi-Annual installments).


Payment Collection & Cashiering
Cashier User Requirements
The System shall enable the Cashier to search for taxpayer records using the Property Identification Number (PIN) or Transaction Reference Number.
The System shall generate and print an Electronic Official Receipt (e-OR) immediately upon validation of payment.
The System shall support multiple payment modes, including Cash, Check, and Online Fund Transfers.
The System shall automatically update the property status to "Paid/Current" across all modules once a transaction is finalized.

Billing & Collection Approval
Municipal Treasurer User Requirements
The System shall provide the Municipal Treasurer the capability to review and approve Tax Exemptions or Tax Adjustments (e.g., for government-owned land or special cases).
The System shall require Treasurer approval for any Manual Penalty Waivers or corrections to historical billing errors.
The System shall mark transactions as "Cleared" in the Daily Collection Report after end-of-day reconciliation.

Delinquency & History Management
Revenue Clerk User Requirements
The System shall automatically flag properties as "Delinquent" if no payment is recorded by the end of the fiscal year.
The System shall generate a Notice of Delinquency for properties with outstanding balances exceeding a specific duration.
The System shall preserve a Payment History Log, allowing users to view all past receipts, amounts paid, and dates for any specific PIN.

Audit & Reporting
Municipal Treasurer User Requirements
The System shall generate a Daily Abstract of Collections categorized by tax type (Basic, SEF, Penalties).
The System shall maintain a Real-Time Collection Dashboard showing actual revenue versus projected targets.
The System shall generate a Change Log capturing every instance of a manual tax adjustment, including the user ID, timestamp, and reason for the change.

	Non-Functional Requirements

Performance: Tax calculations and receipt generation must occur within 3 seconds of the request.
Security: Access to "Penalty Waivers" must be restricted to the Municipal Treasurer role only.




Process Flow Model
Tax Billing & Collection

Process Flow Diagram of the Billing and Collection Module









Data Flow Model (Notation Used)
Context Diagram











Level-0 Diagram 














Child Diagrams

Process 1.0 Tax Billing and Collection Module





Data Model

Data Dictionary

Tax Billing and Collection Module

Tax Billing = Bill ID + PIN + Fiscal Year + Basic RPT + SEF Tax + Penalties + Total Due + Billing Status
Total Due = Basic RPT + SEF Tax + Penalties
Billing Status = ("Paid", "Unpaid", "Delinquent", etc.)

Payment Transaction = Transaction ID + Bill ID + Payment Date + Payment Method + Amount Paid + Cashier ID
Payment Method = ("Cash")

Delinquency Record = Delinquency ID + Bill ID + Months Overdue + Accumulated Interest + Notice Sent
Notice Sent = (Boolean: "True" or "False")

Official Receipt = OR Number + Transaction ID + Issue Date + Payor Name

Audit Trail = Log ID + User ID + Action Performed + Timestamp
Action Performed = ("Created Bill", "Processed Payment", "Updated Delinquency", etc.)
 


































Database Design
Physical Data Model(Crow’s Foot Notation)

It illustrates the relationships between six core entities—Property, Tax Billing, Payment Transaction, Delinquency Record, Official Receipt, and Audit Trail—complete with data types and primary/foreign keys.





SOFTWARE DESIGNS (50 points)

Architectural Design

Headless Architecture provides superior security and scalability by ensuring the database is never directly exposed to the user interface, requiring every staff action to be validated by a centralized Session Manager. Additionally, this decoupled approach allows for high-speed performance and easy maintenance, as municipal tax rules can be updated in the Business Logic layer without needing to modify or redistribute the front-end software to staff terminals.
System Models
Use Case Diagram

This Use Case Diagram illustrates the functional interactions within the Tax Billing & Collection Module between various stakeholders and system processes. It defines specific roles for the Municipal Treasurer, Cashier, and Revenue Clerk, while highlighting the Taxpayer as the primary recipient of generated outputs like the Statement of Account (SOA) and Official Receipt (OR).
Use Case Scenario & Sequence Diagram
Use Case 1: Generate Statement of Account (SOA)
Primary Actor: Revenue Clerk
Pre-condition: Property must have an "Approved Assessment" status from the Appraisal Module.
Main Success Scenario:
Clerk inputs the Property Identification Number (PIN).
System retrieves the Assessed Value and Property Class.
The system calculates Basic RPT (1%) and SEF (1%).
The system checks the current date against the "Early Payment" incentive schedule.
The system generates a printable SOA showing the breakdown of dues and discounts.
Post-condition: SOA is issued to the Taxpayer; Billing record is created in the TAX_BILLING table.

2.2.2. Primary Actor: Cashier
Pre-condition: Taxpayer presents a valid SOA or PIN.	
Main Success Scenario:

The cashier searches for the billing record via PIN.
The cashier enters the payment amount and selects the payment method (Cash/Check).
The system validates the amount against the total due (handles partial or full payment).
System updates the PAYMENT_TRANSACTION and PROPERTY_LEDGER.
The system triggers the printing of the Electronic Official Receipt (e-OR).
Post-condition: Property status is updated to "Paid" or "Partially Paid" in real-time.




Sequence Diagram


This Sequence Diagram details the step-by-step workflow of the tax billing process, divided into two distinct phases: SOA Generation and Payment Collection. It visualizes the chronological interactions between stakeholders (Revenue Clerk, Cashier, Taxpayer) and system components (Interface, Computation Engine, and Database) to ensure accurate tax calculation and real-time ledger updates.


Class Diagram 

This image is a Class Diagram, which shifts the focus from database storage to the functional behavior and logic of the system. It showcases the same core entities but adds methods (actions) like calculateTotalDue(), processPayment(), and generatePDF(), defining how the system objects interact and manipulate their data.



Activity Diagram


This System Flowchart maps the operational logic of the tax billing process, detailing the decision paths for discounts, penalties, and payment status updates. It acts as the "procedural bridge" between the database structure and the actual user experience by showing exactly how data flows from the initial PIN input to the final issuance of an Official Receipt.
