# Deploying to Hostinger (Shared Hosting)

Since your Hostinger plan does not support Node.js, we have refactored the application to work as a static site (Single Page Application) that connects directly to Firebase. This allows you to host it on any standard web hosting plan, including Hostinger's Shared Hosting.

## Prerequisites

1.  **Firebase Project:** You must have a Firebase project with Realtime Database and Storage enabled.
2.  **Firebase Security Rules:** Ensure your Firebase Realtime Database rules allow read/write access.
    *   **Note:** For a production app, you should restrict these rules. However, since the admin logic is now client-side, anyone with the config could potentially write to the DB. Ensure you trust the users of this CMS or implement Firebase Authentication.
    *   Example "Test Mode" Rules (allows anyone to read/write - **Use with caution**):
        ```json
        {
          "rules": {
            ".read": true,
            ".write": true
          }
        }
        ```

## Deployment Steps

1.  **Prepare the Files:**
    The only folder you need to deploy is the `public` folder.

2.  **Configure Firebase:**
    *   Open the file `public/config.js` in a text editor.
    *   Replace the placeholder values (e.g., `"YOUR_API_KEY"`, `"YOUR_PROJECT_ID"`) with your actual Firebase project configuration. You can find these in your Firebase Console under Project Settings > General > Your apps > SDK setup and configuration (select "CDN" or "Config").

3.  **Upload to Hostinger:**
    *   Log in to your Hostinger Control Panel (hPanel).
    *   Go to **File Manager** (usually under the "Files" section).
    *   Navigate to the `public_html` directory.
    *   Delete the default `default.php` or `index.php` if present.
    *   Upload all the files **inside** the `public` folder to `public_html`.
        *   `index.html` should be directly inside `public_html`.
        *   `app.js`, `config.js` should be directly inside `public_html`.
        *   `package.json` inside `public` is not needed but harmless.

4.  **Test:**
    *   Open your website URL.
    *   You should see the CMS interface.
    *   Try uploading an image or creating a session to verify the connection to Firebase.

## Troubleshooting

*   **White Screen / Nothing loads:** Open the browser developer console (F12 > Console). If you see errors about `firebaseConfig`, ensure you updated `config.js` correctly.
*   **Permission Denied:** If you see "Permission denied" errors in the console when trying to save data, check your Firebase Realtime Database Rules in the Firebase Console.
