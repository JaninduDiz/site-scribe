# SiteScribe

SiteScribe is a modern, responsive web application designed to simplify employee attendance tracking for construction sites. Built with Next.js and Firebase, it provides a clean, user-friendly interface for managing employee records and marking daily attendance.

## Features

*   **Employee Directory**: Add, view, edit, and delete employee records.
*   **Daily Attendance Tracking**: Mark employees as 'Present' or 'Absent' for any given day.
*   **Interactive Calendar**: A monthly calendar view shows a clear overview of an individual employee's attendance record.
*   **Data Export**: Easily export monthly attendance reports to an Excel file, formatted for clarity and ready for payroll or record-keeping.
*   **Responsive Design**: The application is fully optimized for both desktop and mobile devices, ensuring a seamless experience for managers on-site or in the office.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
*   **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) for real-time data synchronization.
*   **UI Components**: Built with [ShadCN UI](https://ui.shadcn.com/) for a consistent and accessible design system.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first styling approach.
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, global state management.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

### Firebase Setup

This application is configured to connect to a Firebase project. Ensure your Firebase project is set up and the configuration in `src/lib/firebase.ts` matches your project's credentials. You will need to enable Firestore in your Firebase project.

### Running the Development Server

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) (or the port specified in your `package.json`) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
