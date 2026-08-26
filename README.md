# XSeven Monochrome Minimal

A sleek, cyberpunk-inspired, monochrome web and mobile application built with React, Vite, and Supabase. The project is designed with a minimalistic aesthetic featuring "binary rain" effects and cyberpunk dialogs, offering a modern user experience with a robust backend.

## Features

- **Authentication**: Secure user login and registration powered by Supabase Auth.
- **Social Feed & Profile**: Interactive feed screens, user profiles, and replying/notification systems.
- **Admin Dashboard**: Specialized administrative interface for managing the platform.
- **Cyberpunk Aesthetics**: Custom components including `BinaryRain` and `CyberpunkDialog` for a unique look and feel.
- **Cross-Platform**: Web-first approach, fully deployable to Android and iOS using Capacitor.

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI & Styling**: Tailwind CSS, shadcn-ui, Radix UI, Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Auth)
- **Mobile**: Capacitor (Cross-platform native mobile deployment)
- **Routing & State**: React Router DOM, React Query, Zustand (or context)
- **Forms**: React Hook Form, Zod

## Project Structure

```
├── src/
│   ├── components/    # Reusable UI components (shadcn, Cyberpunk dialogs, etc.)
│   ├── pages/         # Application screens (Auth, Feed, Profile, Admin, etc.)
│   ├── hooks/         # Custom React hooks (e.g., useNotifications)
│   ├── services/      # External service integrations
│   └── supabaseClient.ts # Supabase initialization and connection
├── public/            # Static assets
├── android/           # Generated Android project (Capacitor)
├── ios/               # Generated iOS project (Capacitor)
└── ...
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mayorx7/xseven-monochrome-minimal.git
   cd xseven-monochrome-minimal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   - Copy `.env.example` to `.env` (or `.env.local`).
   - Fill in your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Database Setup:**
   - Execute the provided SQL scripts (`database-schema.sql`, `database-notifications-replies.sql`, etc.) in your Supabase SQL editor to create the necessary tables and row-level security policies.

## How to Run Locally

Start the Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:8080` (or the port specified by Vite).

## Building for Production

To create a production build for the web:

```bash
npm run build
```

## Mobile Development (Capacitor)

The project includes Capacitor for mobile deployment.

**Sync Capacitor with the latest web build:**
```bash
npm run build:mobile
```

**Run on Android:**
```bash
npm run android
```

**Run on iOS:**
```bash
npm run ios
```

## Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the web app for production.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run cap:sync`: Syncs Capacitor configuration and web assets.
- `npm run build:mobile`: Builds the web app and syncs with Capacitor.
- `npm run android` / `npm run ios`: Builds and opens the respective mobile IDEs.

## Important Notes

- Do **NOT** commit your `.env` files to version control.
- When making schema changes, always update your Supabase backend using SQL migrations.
- If you face mobile deployment issues, ensure you have Android Studio or Xcode installed correctly.

## License

This project is licensed under the MIT License.
