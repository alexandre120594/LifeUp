Act as a senior product engineer, product designer, and software architect. Build a complete feature called Personal Financial Organizer for an app.

Your job is not to be generic. Think like someone shipping a real product that users will actually use weekly. The feature must be practical, simple to maintain, and financially useful.

Context:
The feature is for a personal finance app focused on helping one person organize money, understand spending, plan bills, and improve decisions. The user is not an accountant. The experience must be clear, fast, and low-friction.

Main goal:
Design and specify a Personal Financial Organizer feature that helps users:
- track income and expenses
- categorize spending
- monitor monthly cash flow
- manage recurring bills
- define budgets by category
- visualize financial health
- plan savings goals
- detect overspending patterns
- organize all financial information in one place

Deliver the output with depth and concrete detail.

You must produce:

1. Feature overview
- Explain what the Personal Financial Organizer is
- Explain the real problem it solves
- Explain who it is for
- Explain why users would keep using it

2. Core user flows
Describe step-by-step flows for:
- first-time onboarding
- adding an income
- adding an expense
- creating categories
- setting a monthly budget
- adding recurring bills
- viewing monthly summary
- tracking savings goals
- receiving alerts for overspending or upcoming bills
- editing and deleting financial records

3. Main modules
Break the feature into modules such as:
- Dashboard
- Transactions
- Categories
- Budgets
- Recurring bills
- Savings goals
- Reports and insights
- Notifications and reminders
For each module, explain responsibilities, UI behavior, and business rules.

4. Data model
Design the entities and relationships with clear fields.
Include at least:
- User
- Transaction
- Category
- Budget
- RecurringBill
- SavingsGoal
- FinancialSummary
- Notification
For each entity provide:
- purpose
- fields
- field types
- validations
- relationships

5. Business rules
Define practical rules such as:
- expense reduces balance, income increases it
- recurring bills can auto-generate expected transactions
- budget alerts trigger at percentage thresholds
- overdue bills are highlighted
- categories can be fixed or custom
- savings goals track current amount vs target
- month summaries close by calendar month
Be explicit. Do not stay abstract.

6. UX and UI structure
Describe the screens in detail:
- dashboard screen
- add transaction screen
- transaction history screen
- budget screen
- recurring bills screen
- savings goals screen
- reports screen
For each screen include:
- sections
- components
- actions
- empty states
- error states
- important visual hierarchy

7. Metrics and calculations
Define the formulas or logic for:
- total income
- total expenses
- net cash flow
- remaining budget
- savings progress
- upcoming bill totals
- category spending percentages
- month-over-month comparison
Explain calculation rules clearly.

8. Smart insights
Add intelligent but realistic insights the app can generate, such as:
- category with highest spending
- unusual spending spikes
- risk of exceeding budget
- missed savings target
- recurring bill pressure next month
- low cash flow warning
Make them useful, not gimmicky.

9. Technical architecture
Propose a clean and scalable architecture for implementation.
Include:
- frontend structure
- backend modules
- API endpoints
- database tables
- validation layer
- notification system
- cron jobs for recurring bills/reminders
- state management
- permissions and privacy concerns
Be concrete.

10. API design
List REST endpoints for the feature, such as:
- create transaction
- list transactions
- update transaction
- delete transaction
- create budget
- list budgets
- create recurring bill
- create savings goal
- get dashboard summary
For each endpoint define:
- method
- route
- purpose
- request body
- response example

11. Edge cases
Think like a real engineer. Include cases such as:
- duplicate recurring bills
- deleted categories with linked transactions
- negative values
- invalid dates
- budget without transactions
- transactions edited after monthly summary generation
- timezone issues for bill due dates
- partially completed savings goals

12. MVP vs future versions
Separate:
- MVP version
- Version 2 improvements
- Advanced future ideas
Do not mix them.

13. Final implementation plan
Provide:
- development phases
- priority order
- dependencies
- risks
- recommended first release scope

Important constraints:
- Keep it simple enough for a small team to build
- Avoid fake complexity
- Avoid crypto, stocks, or enterprise accounting unless explicitly justified
- Focus on personal finance organization, clarity, and retention
- Prefer practical product decisions over flashy ideas

Output format:
Use these sections exactly:
- Feature Summary
- Problems Solved
- Target User
- User Flows
- Modules
- Data Model
- Business Rules
- UI/UX Structure
- Calculations and Metrics
- Smart Insights
- Technical Architecture
- API Design
- Edge Cases
- MVP vs Future Versions
- Implementation Plan

Write like a serious product and engineering lead. Be specific, structured, and implementation-ready.