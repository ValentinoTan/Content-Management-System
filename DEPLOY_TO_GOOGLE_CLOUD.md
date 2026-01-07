# Deploying to Google Cloud

This application is a static site (HTML, CSS, JS) that uses Firebase Realtime Database and Storage directly from the browser. It does not require a backend server (Node.js) for deployment.

You have two main options for hosting this on Google Cloud Platform (GCP). **Option 1 (Firebase Hosting)** is recommended as it's the easiest and includes free SSL (HTTPS).

## Prerequisites

1.  **Google Cloud / Firebase Project**: You should have a project created.
2.  **Free Credit**: If you have GCP free credits, you can use them for both options, but Firebase Hosting has a generous free tier that might not even touch your credits.

---

## Option 1: Firebase Hosting (Recommended)

This is the standard way to host Firebase web apps. It provides a global CDN and automatic HTTPS.

### 1. Install Node.js
If you haven't already, install Node.js from [nodejs.org](https://nodejs.org/).

### 2. Install Firebase CLI
Open your terminal or command prompt and run:
```bash
npm install -g firebase-tools
```

### 3. Login
Log in to your Google account:
```bash
firebase login
```

### 4. Connect to Your Project
Run the following command in the root directory of this project:
```bash
firebase use --add
```
*   Select your existing project from the list.
*   Give it an alias (e.g., `default`).

### 5. Update Configuration
**Crucial Step:** Open `public/config.js` and ensure the `window.firebaseConfig` object contains the keys for **your** project.
*   Go to [Firebase Console](https://console.firebase.google.com/).
*   Open your project.
*   Go to **Project Settings** (gear icon) -> **General**.
*   Scroll down to "Your apps".
*   If you haven't created a web app, click the `</>` icon to create one.
*   Copy the `firebaseConfig` object and paste it into `public/config.js`.

### 6. Deploy
Deploy the application:
```bash
firebase deploy
```
*   The command will output a "Hosting URL" (e.g., `https://your-project-id.web.app`).
*   Click that link to view your live site.

---

## Option 2: Google Cloud Storage (Bucket Hosting)

If you prefer to use a standard Google Cloud Storage bucket (using your GCP credits directly), follow these steps.

**Note:** Hosting directly from a bucket only supports **HTTP** (not HTTPS) unless you set up a Load Balancer (which is more complex and incurs costs). For a simple HTTPS site, use Option 1.

### 1. Create a Bucket
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **Cloud Storage** > **Buckets**.
3.  Click **Create**.
4.  **Name:** Choose a globally unique name (e.g., `my-cms-app-bucket`).
5.  **Location:** Choose a region close to your users (e.g., `asia-southeast1`).
6.  **Public Access Prevention:** Uncheck "Enforce public access prevention on this bucket". This is required for a website.
7.  **Access Control:** Select "Uniform".
8.  Click **Create**.

### 2. Upload Files
1.  Click on your newly created bucket.
2.  Click **Upload Files** or **Upload Folder**.
3.  Upload the **contents** of the `public` folder from this project.
    *   **Important:** Do not upload the `public` folder itself as a subfolder. `index.html` should be at the root of the bucket.
    *   Upload `index.html`, `app.js`, `config.js`.
    *   (Optional) You don't need `package.json` or `server.js` here.

### 3. Make the Bucket Public
1.  Go to the **Permissions** tab of your bucket.
2.  Click **Grant Access**.
3.  **New Principals:** Type `allUsers`.
4.  **Role:** Search for and select `Storage Object Viewer`.
5.  Click **Save** and confirm "Allow Public Access".

### 4. Configure Website Settings
1.  Go back to the bucket list or click the three dots (`...`) next to your bucket name.
2.  Select **Edit website configuration**.
3.  **Index page:** Enter `index.html`.
4.  **Error page:** Enter `index.html` (since this is a Single Page Application, redirecting 404s to index.html handles routing better, though strictly optional here).
5.  Click **Save**.

### 5. Access Your Site
Your website will be available at:
`http://STORAGE_BUCKET_NAME.storage.googleapis.com/index.html`
or
`http://STORAGE_BUCKET_NAME.storage.googleapis.com/`

### 6. Update Configuration
Just like in Option 1, make sure `public/config.js` is updated with your Firebase project credentials before uploading. If you change them later, you must re-upload `config.js` to the bucket.
