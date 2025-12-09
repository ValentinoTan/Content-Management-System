# Content Management System for Unity

This is a simple content management system (CMS) for managing images for a Unity program. It uses an Express.js backend and a Tailwind CSS frontend. The workflow involves uploading an image to Firebase Storage, saving the image's URL to the Firebase Realtime Database (RTDB), and then allowing a Unity program to fetch this URL to display the image.

## Prerequisites

*   Node.js and npm
*   A Firebase project

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the root directory.
    *   Add your Firebase configuration variables (see `HOSTINGER_DEPLOY.md` or source code for required variables like `FIREBASE_DATABASE_URL`, `FIREBASE_STORAGE_BUCKET`, etc.).

4.  **Service Account Key (Optional/Alternative):**
    *   If you prefer using a service account key file instead of environment variables for credentials:
        *   Go to your Firebase project settings -> "Service accounts" tab.
        *   Generate a new private key.
        *   Save the file as `serviceAccountKey.json` in the **root** directory.
    *   Alternatively, you can set the `FIREBASE_SERVICE_ACCOUNT` environment variable with the JSON content of the key.

## Running the application locally

1.  **Start the server:**
    ```bash
    npm start
    ```

2.  **Open the application:**
    *   Navigate to `http://localhost:3000` in your web browser.

## Deployment

See [HOSTINGER_DEPLOY.md](HOSTINGER_DEPLOY.md) for instructions on how to deploy to Hostinger.

## How it works

*   The backend is an Express.js server (`server.js`) that serves the frontend files from the `public/` directory and provides API endpoints.
*   The frontend uses Tailwind CSS and communicates with the backend API via relative paths.
