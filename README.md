# SiteScribe

SiteScribe is a modern, responsive web application designed to simplify employee attendance tracking for construction sites. Built with Next.js and Supabase, it provides a clean, user-friendly interface for managing employee records and marking daily attendance.

## Features

*   **Employee Directory**: Add, view, edit, and delete employee records.
*   **Daily Attendance Tracking**: Mark employees as 'Present' or 'Absent' for any given day.
*   **Interactive Calendar**: A monthly calendar view shows a clear overview of an individual employee's attendance record.
*   **Data Export**: Easily export monthly attendance reports to an Excel file, formatted for clarity and ready for payroll or record-keeping.
*   **Responsive Design**: The application is fully optimized for both desktop and mobile devices, ensuring a seamless experience for managers on-site or in the office.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
*   **Database**: [Supabase](https://supabase.com/) for the PostgreSQL database and real-time data synchronization.
*   **UI Components**: Built with [ShadCN UI](https://ui.shadcn.com/) for a consistent and accessible design system.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first styling approach.
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, global state management.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A Supabase account

### Supabase Setup

1.  **Create a Supabase Project**: Go to your Supabase dashboard and create a new project.
2.  **Set up Database Schema**: Navigate to the `SQL Editor` in your Supabase project dashboard. Open the `schema.sql` file from this repository, copy its content, and run it to create the `employees` and `attendance` tables with the necessary security policies.
3.  **Get API Keys**: In your Supabase project dashboard, go to `Project Settings` > `API`. You will need the `Project URL` and the `anon` `public` key.

### Local Configuration

1.  **Create an Environment File**: In the root of the project, create a new file named `.env.local`. You can copy the contents of the `.env` file as a template.
2.  **Add Your Credentials**: Add your Supabase URL and anon key to the `.env.local` file:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the actual credentials from your Supabase project. This file is ignored by Git and should not be committed.

### Running the Development Server

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) (or the port specified in your `package.json`) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
