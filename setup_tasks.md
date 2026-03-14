# Core Inventory - Setup & Next Steps

This log outlines the tasks you need to complete to get the application fully operational with your own Supabase instance.

## 1. Environment Configuration
Your application needs to know how to connect to Supabase.
- [ ] Create a new file named `.env` in the root of your project (`c:/Projects/CoreInventory/.env`).
- [ ] Add the following two lines to it, replacing the placeholders with your actual Supabase project credentials. You can find these in your Supabase Dashboard under **Project Settings > API**.

```env
VITE_SUPABASE_URL=your_actual_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

## 2. Supabase Dashboard Configuration
You need to configure your Supabase project to allow the authentication methods you requested.

- [ ] **Email/Password Auth**: 
  - Go to **Authentication > Providers** in Supabase.
  - Ensure "Email" is enabled.
- [ ] **Google OAuth**: 
  - Go to **Authentication > Providers > Google**.
  - Enable it and provide your Google OAuth Client ID and Secret (you get these from the Google Cloud Console).
- [ ] **OTP / Password Reset**:
  - Go to **Authentication > Email Templates**.
  - Review the "Reset Password" template to ensure it fits your needs. Supabase handles the OTP logic securely via the `verifyOtp` method we used in `OTPReset.tsx`.

## 3. Code Adjustments (Next Steps)
The current UI is built, but you will need to add routing logic to navigate the user once they successfully authenticate.

- [ ] **Redirect After Login**: In `src/pages/Login.tsx`, inside the `handleEmailLogin` and `handleGoogleLogin` functions, add logic to redirect the user to a dashboard once `error` is null (e.g., using `const navigate = useNavigate()` from `react-router-dom`).
- [ ] **Create the Dashboard Page**: Create a placeholder `src/pages/Dashboard.tsx` and add a new `<Route path="/dashboard" element={<Dashboard />} />` to your `App.tsx`.
- [ ] **Protected Routes**: Wrap your dashboard route in a component that checks if a Supabase user session exists, redirecting unauthenticated users back to `/`.

## 4. Running the Application
Once the `.env` file is set up:
- [ ] Run `npm run dev` in your terminal to start the development server.
- [ ] Test the email signup/login flow.
- [ ] Test the password reset flow.
