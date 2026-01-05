# 🎵 Spotify-Style Web Music Player 

A Spotify-inspired **web music player** built using **HTML, CSS, and Vanilla JavaScript**.  
The application implements playlist-based audio playback with custom controls, real-time UI synchronization, and a responsive, app-like interface across different screen sizes.

---

## ✨ Features

- 🎶 Multiple playlists loaded dynamically from folders
- ▶️ Play / Pause / Next / Previous controls
- ⏱ Real-time seek bar with click & drag support
- 🔊 Volume control with drag + mute toggle
- 🔁 Loop mode
- 📂 Dynamic “Your Library” sidebar for selected playlists
- 🟢 Active song highlighting & “Now Playing” indicator
- 📱 Fully responsive layout (desktop → tablet → mobile)
- ⚡ Smooth UI interactions without any JavaScript frameworks

---

## 🧠 What This Project Focuses On

This project was built to practice and understand:

- HTML5 **Audio API**
- Managing **multiple audio instances**
- UI ↔ state synchronization without frameworks
- Handling complex user interactions (dragging, seeking)
- Event propagation and control
- Responsive, app-like layouts using pure CSS
- Writing non-trivial Vanilla JavaScript logic

---

## 📁 Project Structure

project-root/
│
├── index.html        # Main HTML structure
├── style.css         # Complete styling & responsive design
├── script.js         # Core player logic & UI interactivity
├── songs.json        # Playlist manifest for GitHub/static hosting
│
├── images/           # Playlist thumbnail images
├── SVGs/             # UI Icons (play, pause, volume, loop, etc.)
│
└── songs/            # Music library organized by playlist
    ├── F1/           # Playlist 1 directory
    │   ├── song1.mp3
    │   └── song2.mp3
    ├── F2/           # Playlist 2 directory
    └── ...           # Folders F3 through F6

Each `F*` folder represents a **playlist**.  
Songs are discovered dynamically — no hardcoding of track names.

---

## ▶️ How It Works

1. The app fetches each playlist folder (`songs/F1`, `songs/F2`, etc.)
2. `.mp3` files are extracted and converted into `Audio` objects
3. Clicking a playlist dynamically builds the sidebar library
4. The player synchronizes:
   - Playback state
   - UI highlights
   - Seek bar & time display
   - Volume & mute state
5. All interactions are handled using **Vanilla JavaScript**

---

## ⚠️ Important Note on Playlist Loading

This project supports **two different behaviors depending on how it is served**:

### Local Development
When run using a local development server (e.g. Live Server or `python -m http.server`), the player is able to automatically discover songs by reading playlist folders.  
Adding a new audio file to a playlist directory makes it immediately available in the UI without any additional configuration.

### GitHub Pages / Static Hosting
On static hosting platforms such as GitHub Pages, directory listing is not supported.  
As a result, automatic folder-based song discovery is not possible.

To ensure compatibility with static hosting, playlist data is loaded from a **static JSON manifest (`songs.json`)**.  
When adding new songs in this setup, the corresponding file paths must be added to `songs.json`.

This is a limitation of static hosting and browser security models, not of the application logic itself.

---

## 🖥 How to Run Locally

This project requires a **local server** (due to usage of `fetch()`).

### Option 1: VS Code Live Server

1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

### Option 2: Python HTTP Server

```bash
python -m http.server
```

Then open: `http://localhost:8000`

---

## 📱 Responsive Design

- **Desktop**: Full player with library & volume controls  
- **Tablet**: Compact layout with adjusted spacing  
- **Mobile**:
  - Fixed bottom music player  
  - Simplified controls  
  - Non-essential UI hidden for better usability  

---

## 🚫 Known Limitations

- The navigation bar elements (Search, Login, Premium, Support, etc.) are present for UI completeness but are not functionally implemented. They currently serve as static interface components.
- The interface is optimized primarily for larger screens. While the application remains fully usable and visually consistent on smaller screens, certain layout elements are simplified and the overall visual density is reduced compared to the desktop experience.
- No backend or data persistence  
- No authentication  
- Uses browser directory listing (works best on local/dev servers) 
- Not optimized for very large music libraries  
- Not intended for deployment or production use  





