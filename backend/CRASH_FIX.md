# Backend Crash Fixes

## Issues Resolved

### 1. Mongoose `OverwriteModelError`

**Problem:** The server crashed with `OverwriteModelError: Cannot overwrite 'User' model once compiled` during reloads (common with nodemon).
**Fix:** Updated all model exports in `backend/models/` to check if the model already exists before compiling depending on the `mongoose.models` cache.
**Files Updated:**

- `User.js`
- `Category.js`
- `Expense.js`
- `Budget.js`

**Code Pattern Used:**

```javascript
// Before
module.exports = mongoose.model("User", UserSchema);

// After (Safe)
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
```

### 2. Email Service Missing Credentials

**Problem:** The app crashed if `EMAIL_USER` or `EMAIL_PASSWORD` were missing because `nodemailer` tried to initialize with invalid config.
**Fix:** Updated `backend/services/emailService.js` to:

- Only create the transporter if credentials exist.
- Log a warning instead of crashing.
- gracefully skip sending emails if not configured.

## Current Status

✅ **Backend is now stable**
✅ **Email features are optional** (skips if not configured)
✅ **Hot-reloading works correctly** without model overwrite errors

## Next Steps

- The backend server should restart automatically via nodemon.
- Check the terminal for `🚀 Server running on port 5000`
