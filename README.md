This repository contains the source code for a full stack travel and tourism management platform I built at work in 2024. Contains the backend,frontend and an admin CMS Panel. Sharing because the company changed tech stack to Java from JS and this codebase is no longer needed for them.

# Features

## Technology Stack

### Backend
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** bcrypt, JSON Web Token (JWT)
- **API:** RESTful API

### Frontend (Admin & User)
- **Library:** React.js
- **Styling:** CSS, Bootstrap (Admin), Tailwind CSS (User)
- **Routing:** React Router
- **API Client:** Axios

## Admin Panel Features:
- **Dashboard:** A central overview for administrators.
- **User Management:** Admins can manage user accounts.
- **Destination Management:** Add, edit, and remove travel destinations.
- **Package Management:** Create and manage travel packages.
- **Accommodation Management:** Handle accommodation listings.
- **Transportation Management:** Manage transportation options.
- **Itinerary Management:** Create and customize itineraries for travel packages.
- **Discount Management:** Apply and manage discounts.
- **Authentication:** Secure login for administrators.

## User-Facing Website Features:
- **User Authentication:** Users can register and log in to their accounts.
- **User Profiles:** Registered users have a profile page.
- **Browse Destinations:** View popular and available travel destinations.
- **View Packages:** Browse featured and available travel packages.
- **Contact Form:** A way for users to send inquiries.
- **About Page:** Information about the Traviante platform.


## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v14 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

To get the project up and running, you will need to start each component (admin interface, backend, and user interface) in separate terminals.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add the necessary environment variables. An example can be found in `.env.example`.

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start on the port specified in your environment configuration (e.g., `http://localhost:5000`).

### Admin Interface Setup

1.  **Navigate to the admin interface directory:**
    ```bash
    cd admin_interface/traviante-admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the admin interface:**
    ```bash
    npm start
    ```
    The admin interface will open in your browser at `http://localhost:3000`.

### User Interface Setup

1.  **Navigate to the user interface directory:**
    ```bash
    cd user
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the user interface:**
    ```bash
    npm start
    ```
    The user interface will open in your browser at a different port (e.g., `http://localhost:3001`), which will be specified in the terminal output.

## Project Structure

-   **`admin_interface/traviante-admin/`**: Contains the React source code for the admin panel.
-   **`backend/`**: Contains the Node.js/Express server, API endpoints, and database logic.
-   **`user/`**: Contains the React source code for the main user-facing application.

Each directory has its own `package.json` file with the required dependencies and scripts.

