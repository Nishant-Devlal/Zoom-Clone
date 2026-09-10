# Zoom Clone

In this project, I have made a full-stack video conferencing platform inspired by Zoom,
built with **Next.js, FastAPI, PostgreSQL, JWT authentication, and LiveKit Cloud**.
The application supports user authentication, instant and scheduled meetings, unique meeting links,
real-time video/audio communication, screen sharing, participant management, chat, meeting history, profiles, and host controls.


##  Features

### 🔐 Authentication
- User registration and login
- Secure password hashing using Argon2
- JWT-based authentication
- Protected API endpoints
- Persistent user sessions
- Logout functionality

### 🏠 Dashboard
- Personalized user dashboard
- Current date and time
- Quick meeting actions
- Create an instant meeting
- Join an existing meeting
- Schedule a future meeting
- Upcoming meetings
- Previous meeting history
- User profile access

### 📅 Meeting Management
- Create instant meetings
- Schedule meetings for a future date/time
- Generate unique meeting IDs
- Join meetings using a meeting ID
- Start and end meetings
- Host-based meeting controls
- Meeting history
- Upcoming meeting list

### 🎥 Real-Time Video Conferencing

Powered by **LiveKit Cloud**.
- Real-time video
- Real-time audio
- Multiple participants
- Camera controls
- Microphone controls
- Screen sharing
- Participant list
- In-meeting chat
- Leave meeting
- Host-controlled meeting termination

### 👥 Host Controls

Meeting hosts can:

- Mute participants
- Mute all participants
- Stop a participant's video
- Remove participants
- End the meeting

### 💬 Meeting Chat
- Real-time messaging
- Chat panel inside meetings
- Send messages without leaving the meeting
- Open/close chat panel

### 👤 User Profile
- View profile information
- Update name/email information
- Upload profile picture
- Cloud-hosted profile images using Cloudinary

### ⚙️ Settings
- User settings
- Profile management
- Logout

### 📱 Responsive UI
Designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile


#  Tech Stack

## Frontend

Next.js - Frontend framework  
React - UI development  
TypeScript - Type-safe frontend development  
CSS - Styling and responsive layouts  
Lucide React - Icons  
LiveKit Components - Video conferencing UI  
LiveKit Client SDK - Real-time communication  


## Backend

Python - Backend development  
FastAPI - REST API framework  
SQLAlchemy - ORM  
PostgreSQL - Relational database  
Pydantic - Data validation  
PyJWT - JWT authentication  
pwdlib - Secure password hashing  
Argon2 - Password hashing algorithm  
python-multipart - File uploads  
LiveKit API - Meeting/token management  
Cloudinary - Profile image storage  


## Infrastructure & Deployment

Vercel - Frontend & backend deployment  
Neon PostgreSQL - Production database  
LiveKit Cloud - Real-time video/audio infrastructure  
Cloudinary - Image storage  
GitHub - Source control  

# .env file format
(PostgreSQL)
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME

(JWT)
SECRET_KEY=your-long-random-secret-key  

(LiveKit Cloud)
LIVEKIT_API_KEY=your_livekit_api_key  
LIVEKIT_API_SECRET=your_livekit_api_secret  
LIVEKIT_URL=wss://your-project.livekit.cloud  

(Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name  
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret  

# Screenshots
1. Home Page
<img width="1920" height="1080" alt="Screenshot (229)" src="https://github.com/user-attachments/assets/5179b35c-496e-420b-952d-65d3b79de7de" />  
  
2. History Page
<img width="1920" height="1080" alt="Screenshot (230)" src="https://github.com/user-attachments/assets/113221fc-7274-4b29-87e7-263b8d264a8c" />
  
3. Profile Page
<img width="1920" height="1080" alt="Screenshot (231)" src="https://github.com/user-attachments/assets/e2137a69-54f5-4c4d-83bb-cada8b0fec23" />
  
4. Meeting Page
<img width="1920" height="1080" alt="Screenshot (232)" src="https://github.com/user-attachments/assets/6024fd82-5877-40ae-9d70-2a7af195e2e7" />
  
5. Settings Page
<img width="1920" height="1080" alt="Screenshot (233)" src="https://github.com/user-attachments/assets/85027035-2429-4d61-ad1f-fec29fd111f5" />
  
Try yourself at https://zoom-clone-nishant.vercel.app/  


