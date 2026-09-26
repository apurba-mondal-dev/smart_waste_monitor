# Smart Waste Monitor — Security & Quality Hardening Changelog

**Date:** 26 September 2026  
**Version:** Post-launch hardening pass  
**Total files changed:** 8

---

## 1. `src/services/supabase.js`

**Issue:** Debug diagnostic logs (including env var state) were printing to the browser console in production, leaking configuration information.

**Changes:**
- Wrapped all `console.log` calls inside `if (import.meta.env.DEV)` — logs are now **silent in production** (Vercel) and only visible during local development
- Removed the debug line `console.log('Missing env vars:', { hasUrl, hasAnonKey })` entirely — no config state exposed to users

```js
// BEFORE
console.log('Missing env vars:', { hasUrl: !!supabaseUrl, hasAnonKey: !!supabaseAnonKey });

// AFTER — removed entirely
```

---

## 2. `src/services/mockData.js`

**Issue:** Hardcoded test accounts (`admin@campus.edu / admin123` and `staff@campus.edu / staff123`) were shipped as seed data — a known credential risk.

**Changes:**
- Cleared `initialProfiles` to an empty array — no default accounts are seeded

```js
// BEFORE
const initialProfiles = [
  { id: 'user-admin', email: 'admin@campus.edu', ... role: 'admin' },
  { id: 'user-staff', email: 'staff@campus.edu', ... role: 'staff' }
];

// AFTER
const initialProfiles = [];
```

---

## 3. `src/context/AuthContext.jsx`

**Issue:** `console.warn` and `console.error` calls printed internal auth diagnostics (including raw Supabase error objects) to the browser console in production.

**Changes:**
- All `console.warn(...)` and `console.error(...)` wrapped in `if (import.meta.env.DEV)` guards

```js
// BEFORE
console.warn('Profile not found, creating a default profile', error);
console.error('Error fetching user profile', err);

// AFTER
if (import.meta.env.DEV) console.warn('Profile not found', error);
if (import.meta.env.DEV) console.error('Error fetching user profile', err);
```

---

## 4. `src/components/LocationsTab.jsx`

**Issue (4a):** Raw `console.error(err)` calls throughout the component printed stack traces to the browser console in production.

**Issue (4b):** User-facing error messages included `err.message` — exposing raw Supabase/database error details to end users.

**Issue (4c):** File upload only validated file size, not file type — any file type could be submitted.

**Issue (4d):** Form inputs were not trimmed — leading/trailing spaces could cause duplicate entries or validation bypasses.

**Changes:**

**4a — Console logs:**
- All 5 `console.error(err)` calls wrapped in `if (import.meta.env.DEV)` guards

**4b — Sanitized error messages:**
```js
// BEFORE
setAddError('Failed to create location: ' + err.message);
setEditError('Failed to update details: ' + err.message);
setReportError('Failed to log report: ' + err.message);
alert('Failed to delete: ' + err.message);

// AFTER
setAddError('Failed to create location. Please try again.');
setEditError('Failed to update location. Please try again.');
setReportError('Failed to submit report. Please try again.');
alert('Failed to delete location. Please try again.');
```

**4c — File type validation:**
```js
// ADDED before the size check in handleImageFileChange
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
  setReportError('Only JPEG, PNG, WebP, or GIF images are allowed.');
  e.target.value = '';
  return;
}
```

**4d — Input trimming:**
```js
// BEFORE
await createLocation({ name: newName, building: newBuilding, ... });

// AFTER
await createLocation({ name: newName.trim(), building: newBuilding.trim(), description: newDescription.trim() });
```

---

## 5. `src/components/DashboardTab.jsx`

**Issue:** Failed alert resolution used `alert()` with raw `err.message` — exposing internal error details in a native browser popup.

**Changes:**
- Replaced `alert('Could not resolve alert: ' + err.message)` with `setError('Failed to resolve alert. Please try again.')`
- All `console.error` calls wrapped in `if (import.meta.env.DEV)` guards

```js
// BEFORE
alert('Could not resolve alert: ' + err.message);

// AFTER
if (import.meta.env.DEV) console.error(err);
setError('Failed to resolve alert. Please try again.');
```

---

## 6. `src/App.jsx`

**Issue:** The Admin tab component was rendered based only on `activeTab === 'admin'` — a non-admin user who somehow set the tab state could trigger the admin panel.

**Changes:**
- Destructured `isAdmin` from `useAuth()` in `AppContent`
- Added `isAdmin &&` to the admin tab render condition

```jsx
// BEFORE
const { user, loading } = useAuth();
{activeTab === 'admin' && <AdminTab />}

// AFTER
const { user, loading, isAdmin } = useAuth();
{activeTab === 'admin' && isAdmin && <AdminTab />}
```

---

## 7. `src/services/members.js`

**Issue:** `full_name` and `email` were passed directly to the database without sanitization — leading spaces or uppercase emails could create inconsistent records.

**Changes:**
- Added input sanitization at the start of `createMember`:

```js
// ADDED at the top of createMember
full_name = full_name.trim();
email = email.trim().toLowerCase();
```

---

## 8. `src/components/Login.jsx`

**Issue:** No rate limiting — an attacker could attempt unlimited passwords against any account.

**Changes:**
- Added `failedAttempts` and `lockedUntil` state variables
- After each failed login: shows remaining attempts (`"4 attempts remaining"`)
- After 5 failures: 60-second lockout with a clear user message
- Submit button disabled during lockout
- Attempt counter and lock cleared on successful login

```js
// New states added
const [failedAttempts, setFailedAttempts] = useState(0);
const [lockedUntil, setLockedUntil] = useState(null);

// Lockout check at start of handleSubmit
if (lockedUntil && Date.now() < lockedUntil) {
  const secsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
  setErrorMsg(`Too many failed attempts. Please wait ${secsLeft}s.`);
  return;
}

// On failure
const newAttempts = failedAttempts + 1;
setFailedAttempts(newAttempts);
if (newAttempts >= 5) {
  setLockedUntil(Date.now() + 60000); // 60 second lock
  setErrorMsg('Too many failed attempts. Please wait 60 seconds.');
} else {
  const remaining = 5 - newAttempts;
  setErrorMsg(`Incorrect email or password. ${remaining} attempt(s) remaining.`);
}
```

---

## Manual Testing Checklist (Items 12 & 13)

> [!IMPORTANT]
> These cannot be automated — must be done manually before go-live.

### 12 — Mobile layouts
1. Open your Vercel URL in Chrome
2. Press `F12` → click the **device toolbar** icon (`Ctrl+Shift+M`)
3. Test at these breakpoints:
   - **375px** — iPhone SE (smallest common phone)
   - **390px** — iPhone 14
   - **768px** — iPad
4. Check: Login page, Dashboard, Locations drawer, Admin panel, Alerts tab

### 13 — Slow internet simulation
1. Open Chrome DevTools (`F12`) → **Network** tab
2. Click the **throttle** dropdown (defaults to "No throttling")
3. Select **"Slow 3G"**
4. Test: Login, page load, submitting a report, resolving an alert
5. Verify: Loading spinners appear, no broken UI, errors are handled gracefully

---

## Deployment

Push all changes to trigger a Vercel redeploy:

```bash
git add .
git commit -m "Security hardening: rate limiting, input sanitization, guard admin route, hide errors"
git push
```
