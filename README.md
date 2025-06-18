You can view this website from the link in the sidebar or at the bottom of this README. Alternatively, to run this code locally, you can clone this repo and follow the steps below.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)


```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

Key Features:
Once you sign up/log in, you should be able to access all features. These include:
- Creating contacts and adding details (such as name, email, number, description, as well as favouriting a contact) (from Quick Nav or the All Contacts page),
- Updating or deleting contacts (from the All Contacts page),
- Seeing a history of changes for a contact (on their specific Contact page),
- Exporting all contacts in form of a CSV,
- Importing one or more contacts from a CSV exported from our platform (both from the All Contacts page),
- Seeing your activity, favorites and contact metrics (from the index page),
- and setting Reminders (from the Reminders page).
Reminders include a title, description, time, and can optionally specify a contact, and can be marked as complete or incomplete. A feature for receiving email notifications for your reminders is currently in development.

This app was created with Lovable and ChatGPT, and is hosted on Supabase. Lovable was used to design the app and add changes, and ChatGPT was used to design detailed, exhaustive prompts for Lovable to maximize efficiency, reduce errors and ambiguity and independent decision-making. The backend, database and authentication are hosted on Supabase.

Website link: https://contact-verse-nexus.lovable.app
