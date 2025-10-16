![spotifair](https://github.com/user-attachments/assets/12ef034d-a94d-49d9-a9d6-89fe4934cf46)
## 🎧 Spotify Playlist Fairness Tracker

> Analyze how "fair" your Spotify playlists are based on your actual listening history.
> Built from scratch as a full-stack solo project using modern web technologies.

---

### 🚀 Live Demo

**🔗 [Visit the Live App](https://spotifair.vercel.app/)**
*(limited to approved Spotify users due to API restrictions)*

---

### 🛠️ Tech Stack
Backend:
<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
</p>

Frontend:
<p align="left">
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

---

### 🧠 Features

* 🔐 **Spotify OAuth2 PKCE** authentication
* ⏱️ **Background syncing** of playlists and listening history
* 📊 **Statistical analysis** of track fairness and play distribution
* ⚡ **Optimized performance** for large playlists (~10,000 songs)
* 🖼️ **Custom UI components** and unique, modern animations
* 📱 **Fully responsive** design for mobile and desktop

---

### 📸 User Flows

#### 1. 🏠 Home & Playlist Overview

Users see their synced playlists and sync status in a fun and dynamic animated way.

![home](https://github.com/user-attachments/assets/2de243c4-4f6c-4711-8d34-dbbe8cb0979d)

---

#### 2. 🔄 Sync a Playlist

Users can selectively sync playlists, which pulls all related artists, albums, and tracks, and begins tracking your listening history for that playlist.

![to_sync](https://github.com/user-attachments/assets/9320a08c-f18a-474c-8b30-16e3ff2fa705)

---

#### 3. 🎵 View, Filter, and Sort Tracks

Playlists are shown as interactive tracklists with sorting, filtering, and virtualized scrolling.

![tracklist](https://github.com/user-attachments/assets/c00ee5e8-939c-4bd9-8558-5d3d9422d0c8)

---

#### 4. 📈 Analyze Playlist Fairness

Fairness is evaluated via a multinomial bootstrap and shown in a bar chart via your tracklist.

![analysis](https://github.com/user-attachments/assets/8d1e73ca-e100-4534-b5f7-440e69b2df23)

---

#### 5. 👤 View Profile Statistics

Profile-wide statistics can be viewed for additional depth in listening history analysis

![profile](https://github.com/user-attachments/assets/c80a2410-6312-43cb-b31f-d4c811a4a24e)

---

### 🧪 Limitations

* 🔒 Spotify's API limits this app to **25 authorized users** due to approval restrictions.
* 📈 Fairness metric is approximate and based on bootstrapped multinomial distributions.
* Mobile use currently requires cross-site cookies enabled (fix planned)

---

### 📥 Installation & Setup (for local development)

```bash
# Clone the repo
git clone <repo_url>

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
# (create .env files with your Spotify API credentials and DB URL, required variables will be prompted)

# Run the app
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

---

### 🙌 Acknowledgments

* Built entirely solo over the course of several weeks
* Special thanks to friends & family who helped test the app

---

## ⭐️ Want to try it?

Unfortunately the Spotify member access list for the deployed app will be limited for now (due to Spotify's new restrictions), though running locally enables you to try it for yourself.
