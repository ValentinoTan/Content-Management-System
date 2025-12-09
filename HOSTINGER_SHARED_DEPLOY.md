# Deploying to Hostinger Shared Web Hosting

This guide explains how to deploy the Content Management System to Hostinger's Shared Web Hosting plan (or any standard static web hosting) without using Node.js.

The application has been refactored to run entirely in the browser, communicating directly with Firebase.

## Prerequisites

1.  **A Firebase Project:** You must have a Firebase project set up with:
    *   **Realtime Database:** Enabled.
    *   **Storage:** Enabled.
2.  **Firebase Security Rules:**
    *   Since there is no backend server to validate requests, you must configure your Firebase Security Rules to allow appropriate access.
    *   **Warning:** For a simple setup, you might set rules to `read: true, write: true`, but this is **insecure** for production as anyone can modify your data. You should research "Firebase Security Rules" to restrict access (e.g., only allow writes from authenticated users, even if you just add a simple login later).

## 1. Configuration

1.  Open the file `public/config.js` in a text editor.
2.  Go to your **Firebase Console** -> **Project Settings** -> **General** -> **Your apps** -> **SDK setup and configuration**.
3.  Select **CDN** or **Config**.
4.  Copy the `firebaseConfig` object values (apiKey, authDomain, etc.).
5.  Paste them into `public/config.js` replacing the placeholders.

## 2. Prepare Files

1.  Locate the `public` folder in your project. This folder contains everything you need:
    *   `index.html`
    *   `app.js`
    *   `config.js`
    *   (Any other CSS/images if present)

2.  **Zip the contents** of the `public` folder (not the folder itself, but the files inside it) into a file named `website.zip`.

## 3. Upload to Hostinger

1.  Log in to **Hostinger hPanel**.
2.  Go to **Websites** -> **Manage** -> **File Manager**.
3.  Navigate to `public_html`.
4.  Delete the default `default.php` or `index.php` if present.
5.  **Upload** your `website.zip`.
6.  **Right-click** the zip file and select **Extract**. Extract it to the current directory (`public_html`).
    *   Ensure `index.html` is directly inside `public_html`.

## 4. Verify

1.  Visit your website URL.
2.  The application should load.
3.  Test uploading an image or creating a session. If it fails, check the Browser Console (F12) for errors.
    *   If you see "Permission Denied" errors, check your Firebase Database/Storage Rules in the Firebase Console.
