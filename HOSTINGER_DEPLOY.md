# Deploying to Hostinger (VPS or Cloud/Shared Node.js Hosting)

This guide explains how to deploy the restructured application to Hostinger. The project is now set up as a standard Node.js application where `server.js` serves both the API and the static frontend files from the `public/` directory.

## Option 1: Hostinger Shared/Cloud Web Hosting (with Node.js support)

Hostinger's shared and cloud plans support Node.js applications via the "Node.js" feature in hPanel.

### 1. Prepare Your Files
1.  **Zip the project:** Create a ZIP file of the entire project folder, **excluding** `node_modules`.
    *   Include: `public/`, `server.js`, `package.json`, `.htaccess` (if you created one, though usually not needed for the Node app itself, see below).

### 2. Create the Node.js Application in hPanel
1.  Log in to Hostinger hPanel.
2.  Navigate to **Websites** -> **Manage** -> **Advanced** -> **Node.js**.
3.  **Create Application:**
    *   **Node.js Version:** Select a version compatible with your local environment (e.g., 18 or 20).
    *   **Application Mode:** Production.
    *   **Application Root:** Enter a folder name (e.g., `cms-app`).
    *   **Application URL:** Select your domain or subdomain.
    *   **Application Startup File:** Enter `server.js`.
4.  Click **Create**.

### 3. Upload Files
1.  After creating the app, click the **File Manager** button (or open the File Manager separately).
2.  Navigate to the directory you specified as **Application Root** (e.g., `domains/yourdomain.com/public_html/cms-app` or just `cms-app` depending on setup).
3.  **Upload** your project ZIP file.
4.  **Extract** the ZIP file content into this folder. Ensure `server.js` and `package.json` are directly in the Application Root.

### 4. Install Dependencies
1.  Go back to the **Node.js** section in hPanel.
2.  Click the **NPM Install** button. This will run `npm install` on the server to install dependencies defined in `package.json`.

### 5. Configure Environment Variables
1.  In the **Node.js** section of hPanel, look for **Environment Variables** (if available) or create a `.env` file in the Application Root using the File Manager.
2.  **Important:** You need to add all your Firebase configuration variables here.
    *   `PORT`: (Hostinger usually sets this automatically, but you can leave it or set it to the port provided in the UI).
    *   `FIREBASE_SERVICE_ACCOUNT`: Copy the JSON string content of your service account key.
    *   `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc. (All variables from your local `.env`).

### 6. Start the Application
1.  Click **Restart** in the Node.js section to start the server.
2.  Visit your URL. You should see the application.

### Troubleshooting (Shared Hosting)
*   **Static Files:** If static files (images/CSS) don't load, ensure your `.htaccess` in `public_html` is rewriting requests to the Node.js app properly. Hostinger usually handles this when you create the Node app, but sometimes you need to ensure the `Application URL` points to the root.
*   **Logs:** Check `error.log` in the application root if the app fails to start.

---

## Option 2: Hostinger VPS

If you are using a VPS (Virtual Private Server), you have full control.

1.  **SSH into your VPS.**
2.  **Install Node.js & NPM:**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
3.  **Upload Code:** Use `scp` or `git clone` to get your code onto the server (e.g., `/var/www/cms-app`).
4.  **Install Dependencies:**
    ```bash
    cd /var/www/cms-app
    npm install
    ```
5.  **Setup Environment:** Create a `.env` file with your variables.
6.  **Run with PM2 (Process Manager):**
    ```bash
    sudo npm install -g pm2
    pm2 start server.js --name "cms-app"
    pm2 save
    pm2 startup
    ```
7.  **Setup Nginx (Reverse Proxy):**
    *   Install Nginx: `sudo apt install nginx`
    *   Configure a site block to proxy port 80 to your Node app's port (default 3000).

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
