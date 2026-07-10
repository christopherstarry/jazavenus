# PRD: Manage Users Page

## 1. Summary
A single page where Developer and SuperAdmin can view all users, edit their roles/permissions, and reset passwords. Accessible from user menu under avatar. SuperAdmin cannot modify Developer accounts.

## 2. Access Rules
| Action | Developer | SuperAdmin |
|--------|-----------|------------| 
| View list | ✅ | ✅ |
| Edit Admin/Sales | ✅ | ✅ |
| Edit Developer | ✅ | ❌ |
| Reset password (Admin/Sales) | ✅ | ✅ |
| Reset password (Developer) | ✅ | ❌ |

## 3. Route
`/system/manage-users` — SuperAdmin only sidebar, Developer + SuperAdmin via user menu

## 4. API
All existing. New backend check: SuperAdmin cannot modify Developer accounts.
