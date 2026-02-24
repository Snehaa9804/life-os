# YouTube Integration Guide

To enable YouTube analytics in your **Life OS** dashboard, you need to provide your **Channel ID** and a **Google Cloud API Key**.

## 1. Get Your YouTube Channel ID
1. Go to your [YouTube Channel](https://youtube.com).
2. Click your profile picture and select **Settings**.
3. In the left sidebar, click **Advanced settings**.
4. Copy the **Channel ID** (it looks like `UC_x5XG1OV2P6uZZ5FSM9Ttw`).

## 2. Get a Google Cloud API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Life OS").
3. In the search bar at the top, search for **"YouTube Data API v3"**.
4. Click on it and select **Enable**.
5. Once enabled, go to **Credentials** in the left sidebar.
6. Click **Create Credentials** -> **API Key**.
7. Copy the generated API Key (it starts with `AIzaSy...`).

## 3. Connect in Life OS
1. Open the **Settings** page in your Life OS app.
2. Scroll to the **Integrations** section.
3. Paste your **Channel ID** and **API Key**.
4. Click **Connect & Sync**.

Your subscriber count, view count, and video count will now sync to your Dashboard!
