# Poeto - A Social Home for Poets 🎭✨

A modern, production-ready social media platform where poets can share their work, connect with fellow writers, and discover beautiful poetry from around the world.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)

## 🌟 Features

### 👤 Authentication & User Management
- **Email/Password Authentication**: Secure user registration and login
- **Google OAuth**: Sign in with your Google account
- **User Profiles**: Customizable profiles with bio, avatar, and display name
- **Profile Editing**: Update your information anytime
- **Follow System**: Follow your favorite poets

### ✍️ Poetry Features
- **Create Poems**: Share your poetry with optional titles and preserved formatting
- **Edit & Delete**: Full control over your poems with edit history tracking
- **Rich Display**: Beautiful typography-focused poem cards
- **Single Poem View**: Dedicated page for each poem with full details

### 💬 Social Interaction
- **Like System**: Show appreciation with heart reactions
- **Comments**: Engage in discussions about poems
- **Home Feed**: See poems from poets you follow
- **Follow/Unfollow**: Build your poetry network
- **Followers & Following Lists**: View and manage your connections

### 🔍 Discovery
- **Explore Page**: Browse latest and trending poems
- **Search**: Find users by username or poems by content
- **Suggested Users**: Discover new poets to follow
- **Full-Text Search**: Powerful search with PostgreSQL indexes

### 🛡️ Admin Features
- **Admin Dashboard**: Manage users and content
- **Content Moderation**: Delete inappropriate poems or comments
- **User Management**: View all users and manage admin status
- **Statistics**: View platform metrics

### 🎨 UI/UX
- **Mobile-First Design**: Responsive layout for all devices
- **Toast Notifications**: Real-time feedback for actions
- **Loading States**: Skeleton screens for smooth UX
- **Empty States**: Helpful messages when no content
- **Optimistic Updates**: Instant UI feedback

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: Custom shadcn/ui-style components
- **Icons**: Lucide React

### Backend
- **Runtime**: Next.js API Routes & Server Actions
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (for avatars)

### Database Schema
- Users with profiles
- Poems with content and metadata
- Likes (many-to-many)
- Comments with threading support
- Followers (self-referential many-to-many)

### Security
- Row Level Security (RLS) policies
- Server-side validation
- Protected routes and API endpoints
- Input sanitization

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/prasiddhasubedi/Poeto.git
cd Poeto
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** to get your credentials
3. Run the database migrations in **SQL Editor**:
   - Execute `supabase/migrations/00001_initial_schema.sql`
   - Execute `supabase/migrations/00002_add_search_indexes.sql`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace the placeholder values with your actual Supabase credentials.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Database Setup

### Running Migrations

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_add_search_indexes.sql`
5. Run each migration

### Creating an Admin User

After signing up, make your user an admin:

1. Go to **Table Editor** in Supabase Dashboard
2. Open the `users` table
3. Find your user row
4. Set `is_admin` to `true`

### Storage Setup

The storage bucket for avatars is automatically created by the migration. To verify:

1. Go to **Storage** in Supabase Dashboard
2. You should see an `avatars` bucket
3. The bucket is public for reading, restricted for writing

## 🏗️ Project Structure

```
poeto/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/
│   │   └── signup/
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── admin/
│   │   ├── follow/
│   │   └── poems/
│   ├── auth/                     # OAuth callback
│   ├── create/                   # Create poem page
│   ├── explore/                  # Explore page
│   ├── home/                     # Home feed
│   ├── poem/[id]/                # Single poem view
│   ├── search/                   # Search page
│   ├── settings/                 # Profile settings
│   ├── [username]/               # User profiles
│   │   ├── followers/
│   │   └── following/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── admin/                    # Admin components
│   ├── auth/                     # Auth components
│   ├── layout/                   # Layout components (Navbar)
│   ├── poem/                     # Poem-related components
│   ├── profile/                  # Profile components
│   ├── shared/                   # Shared components
│   └── ui/                       # Base UI components
├── hooks/                        # Custom React hooks
│   └── use-toast.tsx
├── lib/
│   ├── supabase/                 # Supabase clients & types
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── supabase/
│   └── migrations/               # Database migrations
├── types/                        # TypeScript types
├── .env.example                  # Example environment vars
├── .gitignore
├── middleware.ts                 # Next.js middleware
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## 🔒 Security Features

- **Row Level Security**: All database tables have RLS policies
- **Protected Routes**: Authentication required for sensitive actions
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user input
- **CSRF Protection**: Built into Next.js
- **Secure Sessions**: Supabase handles session management
- **Admin Authorization**: Admin-only routes check permissions

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL)
5. Deploy!

### Environment Variables in Production

Make sure to update:
- `NEXT_PUBLIC_SITE_URL` to your production URL
- Google OAuth redirect URLs in Supabase (if using OAuth)

## 📖 API Routes

### Poems
- `POST /api/poems/[id]` - Update poem
- `DELETE /api/poems/[id]` - Delete poem
- `POST /api/poems/[id]/like` - Toggle like
- `POST /api/poems/[id]/comments` - Add comment
- `DELETE /api/poems/[id]/comments` - Delete comment

### Follow
- `POST /api/follow` - Follow/Unfollow user

### Admin
- `DELETE /api/admin/poems/[id]` - Delete any poem (admin)
- `DELETE /api/admin/users/[id]` - Delete user (admin)

## 🧪 Building for Production

```bash
npm run build
npm run start
```

The build should complete without errors. Check for:
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ All routes compile successfully

## 📱 Responsive Design

Tested and optimized for:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🎯 Core Features Checklist

- ✅ User authentication (email/password + Google OAuth)
- ✅ User profiles with edit capability
- ✅ Create, edit, delete poems
- ✅ Like/unlike system with optimistic updates
- ✅ Comment system
- ✅ Follow/unfollow system
- ✅ Home feed (poems from followed users)
- ✅ Explore page (latest & trending)
- ✅ Search (users & poems)
- ✅ Admin dashboard with moderation
- ✅ Mobile responsive design
- ✅ Toast notifications
- ✅ Loading states & skeleton screens
- ✅ Empty states
- ✅ Row Level Security policies
- ✅ Profile picture support
- ✅ Followers/Following pages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for poets by poets**

For questions or support, please open an issue on GitHub.
