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
- Mobile-sized screens


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
PostgreSQL - Production database
LiveKit Cloud - Real-time video/audio infrastructure
Cloudinary - Image storage
GitHub - Source control

# Screenshots
