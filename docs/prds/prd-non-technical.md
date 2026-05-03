# PRD for Non-Technical Users — Write Expectations, Let AI Figure Out the Rest

If you don't know coding, don't worry. Describe **what the user should see and do**, and the AI will handle the technical side.

You are the QA: after AI builds it, you open the page, test every bullet, and say "this works" or "fix this".

---

## The Simple PRD Template

Just fill in these 6 sections. Use plain language. Skip anything you don't know.

```markdown
# PRD: [Feature Name]

## 1. What is this screen for?
[Explain in 1-2 sentences. Who uses it? Why do they come here?]

Example: "This is where warehouse staff view all purchase orders. They search by supplier name and check order status."

## 2. What screens / pages are needed?
[List every page. Give each a simple name.]

- **List page** — shows all records in a table
- **New form** — create a new record
- **Edit form** — change an existing record

## 3. What data does the user see?
[List every field the user should see. Don't worry about types or formats — just describe it.]

- PO Number (auto-generated, like "PO-2026-0001")
- Supplier Name (company name)
- Order Date (date only, no time)
- Status (Draft / Submitted / Received / Cancelled)
- Total Amount (money, with currency)
- Line items: Product Name, Quantity, Price each

## 4. What can the user do?
[For each screen, list every action the user can take.]

### List Page
- [ ] See all purchase orders in a table
- [ ] Search by PO number or supplier name
- [ ] Filter by status (dropdown with Draft, Submitted, etc.)
- [ ] Click a row to view/edit it
- [ ] Click "New Purchase Order" button to create one
- [ ] Go to next/previous page if there are many records

### Create / Edit Form
- [ ] Select supplier from a dropdown list
- [ ] Pick order date from a calendar
- [ ] Add products one by one (search, pick, enter quantity and price)
- [ ] Remove a product from the order
- [ ] See the total amount update automatically as items are added
- [ ] Save as Draft or Submit

## 5. What rules must the system follow?
[List any business rules. What's allowed, what's not.]

- PO Number is auto-generated, user cannot type it
- Cannot submit a PO with zero line items
- Quantity must be greater than 0
- If status is "Received", the PO cannot be edited anymore
- Only SuperAdmin can delete a PO

## 6. What should it look like?
[Describe the general look. Reference existing screens if possible.]

- Header at top with page title and "New" button
- Table below with sortable columns
- Search bar above the table
- Follows the same style as the other "Master" pages already in the app
- Status badges use colors: Draft=gray, Submitted=blue, Received=green, Cancelled=red
```

---

## Example: A Real Feature for Jaza Venus

Here's a PRD written by someone who knows the warehouse business but not the code:

```markdown
# PRD: Purchase Order

## 1. What is this screen for?
Warehouse staff create purchase orders to buy stock from suppliers. They need to see all POs, search by supplier, and check what's been ordered vs received.

## 2. What screens / pages are needed?
- Purchase Order List page
- New Purchase Order form
- Edit Purchase Order form (same form as New, but pre-filled)

## 3. What data does the user see?
- PO Number (auto)
- Supplier name
- Order date
- Expected delivery date
- Payment terms (Net 30, Net 60, etc.)
- Notes (optional, free text)
- Status (Draft, Submitted, Received, Cancelled)
- Total amount
- List of products ordered (each with: product code, name, quantity, unit, price per unit, discount %, line total)

## 4. What can the user do?

### List Page
- [ ] View all purchase orders
- [ ] Search by PO number
- [ ] Search by supplier name
- [ ] Filter by status
- [ ] Click "New Purchase Order"
- [ ] Click a row to edit

### Form
- [ ] Pick supplier from list
- [ ] Set order date with date picker
- [ ] Set expected date with date picker
- [ ] Pick payment terms from dropdown
- [ ] Add products (search product, pick, add quantity and price)
- [ ] Remove products from the list
- [ ] See total auto-calculate
- [ ] Save as Draft
- [ ] Submit (changes status to Submitted)

## 5. Rules
- Must have at least one product to save or submit
- Quantity must be > 0
- Price must be >= 0
- Once Submitted, cannot go back to Draft
- Once Received, cannot edit anything
- Only SuperAdmin can delete

## 6. What should it look like?
Same style as the rest of the app. Table with columns, search on top, "New" button top right. Form has sections: header info on top, line items table below, totals at bottom.
```

That's it. The AI reads this, figures out the data model, API shape, component structure, and builds it. You open the result and check every checkbox.

---

## How to Review (QA Checklist)

After the AI builds the feature, go through this list:

1. **Open the page** — does it exist at the URL the AI tells you?
2. **Look at the data** — are all fields from Section 3 visible?
3. **Test every action** — can you do everything in Section 4?
4. **Try to break it** — type nothing and submit, type huge numbers, search for nonsense
5. **Test the rules** — try to do things Section 5 says you can't do
6. **Check loading** — does it show a spinner while loading?
7. **Check empty** — what happens when there's no data?
8. **Check error** — turn off the server, does it show an error or crash?

If something doesn't match, tell the AI: "The search doesn't find suppliers by name" or "The total doesn't update when I change quantity".

---

## Tips for Good PRDs

| Do | Don't |
|----|-------|
| "Search by supplier name" | "Implement a debounced search with LIKE query" |
| "Date picker, no time" | "ISO 8601 datetime input with timezone" |
| "Pick product from a dropdown list" | "Async select with infinite scroll and fuzzy search" |
| "Show error if name is empty" | "Validate with Zod schema and display FormMessage" |
| "Same style as the Customer page" | "Use shadcn/ui DataTable with TanStack Table" |

**The AI will translate your plain language into technical decisions. Your job is to describe what the user experiences.**
