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

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Create a `.env` file in the `backend` directory.**
    *   Copy the contents of `.env.example` into a new file named `.env`.
    *   Update the values in the `.env` file with your Firebase project's credentials.

4.  **Create a `serviceAccountKey.json` file in the `backend` directory.**
    *   Go to your Firebase project settings, then to the "Service accounts" tab.
    *   Click "Generate new private key" to download the JSON file.
    *   Rename the downloaded file to `serviceAccountKey.json` and place it in the `backend` directory.

## Running the application

1.  **Start the backend server:**
    ```bash
    cd backend
    npm start
    ```

2.  **Open the application in your browser:**
    *   Navigate to `http://localhost:3000` in your web browser.

## How it works

*   The backend is an Express.js server that serves the frontend files and provides API endpoints to get and save image URLs to Firebase RTDB.
*   The frontend is a single HTML page styled with Tailwind CSS via a CDN, with JavaScript to handle image uploads to Firebase Storage and communicate with the backend API.
*   The Unity program can fetch the image URLs from the `/api/images` endpoint.