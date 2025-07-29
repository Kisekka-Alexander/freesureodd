# Next.js Starter Template

A comprehensive Next.js starter template built with TypeScript, Tailwind CSS, and a full-stack tech stack for rapid development. Perfect as a foundation for any modern web application.

## Tech Stack

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit with Redux Persist
- **Authentication**: NextAuth.js
- **Forms**: Formik with Yup validation
- **HTTP Client**: Axios
- **Charts**: ApexCharts
- **Email**: EmailJS
- **Notifications**: React Hot Toast
- **Analytics**: Vercel Analytics & Plausible
- **Testing/Mocking**: MSW (Mock Service Worker)
- **Icons**: FontAwesome

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

The project includes a basic `.env.local` file. For production or additional features, update the environment variables in `.env.local`:

```bash
# Basic setup is already configured
# Update these values for production or additional features:
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Using as a Starter Template

This project is designed to be a comprehensive starter template for your Next.js projects:

### Quick Start for New Projects

**Option 1: Automated Setup (Recommended)**

```bash
npm run setup
```

This will guide you through customizing the project name, title, and description.

**Option 2: Manual Setup**

1. **Clone or download** this repository
2. **Rename** the project folder to your new project name
3. **Update** `package.json` name field
4. **Update** branding in `src/components/hero.tsx` and `src/app/layout.tsx`
5. **Configure** environment variables in `.env.local`
6. **Start building** your amazing project!

### What's Already Configured

✅ **Complete TypeScript setup**  
✅ **Tailwind CSS with design system**  
✅ **Authentication flow (NextAuth)**  
✅ **State management (Redux Toolkit)**  
✅ **Form handling (Formik + Yup)**  
✅ **API integration (Axios)**  
✅ **Development tools (ESLint, MSW)**  
✅ **Production optimizations**

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── ui/            # Reusable UI components
│   └── providers.tsx  # App providers
├── hooks/             # Custom React hooks
├── lib/              # Utility libraries
├── mocks/            # MSW mock definitions
├── store/            # Redux store and slices
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Features

- ✅ **Modern Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Redux Toolkit** for state management
- ✅ **Redux Persist** for state persistence
- ✅ **NextAuth.js** for authentication
- ✅ **Form handling** with Formik + Yup
- ✅ **API integration** with Axios
- ✅ **Charts** with ApexCharts
- ✅ **Email functionality** with EmailJS
- ✅ **Toast notifications** with React Hot Toast
- ✅ **Analytics** with Vercel Analytics and Plausible
- ✅ **API mocking** with MSW
- ✅ **Icon support** with FontAwesome

## Environment Variables

Copy `.env.example` to `.env.local` and update the following variables:

```env
# NextAuth Configuration (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production

# EmailJS Configuration (Optional - update when needed)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-emailjs-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-emailjs-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-emailjs-public-key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Analytics Configuration (Optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

**Important**: Make sure to set `NEXTAUTH_SECRET` to a secure random string in production.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
