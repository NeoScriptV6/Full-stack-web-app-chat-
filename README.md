# Match-Me: A Gaming Partner Lookup Platform

Match-Me is a full-stack web application designed to connect gamers based on their profile information, preferences, and interests. Whether you're looking for a teammate for competitive matches, a co-op partner, or someone to share casual gaming sessions with, Match-Me uses an intelligent recommendation algorithm to help you find the perfect gaming partner.


## Installation/Testing


## 📦 Postman Collection

You can import this collection into Postman for easier testing. Go ROOT

<details>
<summary>The Postman collection is in the root of the project</summary>



## API Endpoints


**POST** `/api/register`

Registers a new user.

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "mypassword"
}
```

---

## 🔐 Login

**POST** `/api/login`

Logs in a user and returns a JWT token.

### Request Body

```json
{
  "email": "Hulk123@gmail.com",
  "password": "Hulk123"
}
```

---

## 👥 Get Recommendations

**GET** `/api/recommendations`

Returns a list of recommended users.

### Request Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 🔁 Get Connections

**GET** `/api/connections`

Returns the current user's connections.

---

## 🧪 Create Test Users

**POST** `/api/test-data/generate?count=100`

Generates test user accounts for development.

### Request Headers

```
Authorization: Bearer <your-jwt-token>
```

---

## 🧹 Delete Test Users

**DELETE** `/api/test-data/clean`

Deletes test users from the system.

### Request Headers

```
Authorization: Bearer <your-jwt-token>
```

### Request Body

```json
{
  "name": "Alice123",
  "email": "alice123@example.com",
  "password": "yourpassword"
}
```

---

## 👤 User Profile Endpoints (`/me`)

| Endpoint           | Method | Description                      |
| ------------------ | ------ | -------------------------------- |
| `/me/username-pic` | GET    | Get username and profile picture |
| `/me/about`        | GET    | Get "about me" section           |
| `/me/biographical` | GET    | Get biographical data            |

---

## 📁 Deprecated / Duplicated Endpoints?

These may duplicate `/me` routes (verify and remove if unused):

- `GET /get-username-and-profilePic`
- `GET /get-aboutMe`
- `GET /get-biographical-data`

---


## Features

### User Authentication
- **Registration**: Users can sign up with a unique email and password.
- **Login**: Secure login using JWT-based session management.
- **Logout**: Users can log out from any page.
- **Password Security**: Passwords are encrypted using bcrypt with a salt.

### User Profiles
- **Profile Completion**: Users must complete their profile to access recommendations.
- **Profile Information**:
  - Name, bio, and profile picture.
  - Biographical data points such as favorite games, genres, platforms, availability, and interests.
- **Profile Picture Management**: Users can upload, change, or remove their profile picture. A placeholder image is shown if no picture is uploaded.
- **Profile Editing**: Users can modify their profile information at any time.

### Recommendations
- **Personalized Matching**: Recommendations are based on at least 5 biographical data points, including shared games, genres, platforms, availability, and interests.
- **Scoring System**: Recommendations are scored and prioritized to show the strongest matches first.
- **Dismissal**: Users can dismiss recommendations, ensuring they are not shown again.
- **Limit**: A maximum of 10 recommendations is displayed at a time.

### Connections
- **Connection Requests**: Users can send, accept, or decline connection requests.
- **Connection Management**: Users can view pending requests, manage existing connections, and disconnect from users.

### Real-Time Chat
- **Messaging**: Connected users can chat in real-time.
- **Chat History**: Persistent chat history with pagination.
- **Unread Notifications**: Users are notified of unread messages.

### Test Data
- **Generate Test Users**: Populate the system with a minimum of 100 fictitious users for testing and demonstration purposes.
- **Reset Database**: Drop and reload the database to test with different user scales.

## Recommendation Algorithm

The recommendation algorithm is the core of Match-Me, designed to connect users based on their compatibility. Here's how it works:

1. **Biographical Data Points**:
   - The algorithm evaluates at least 5 key biographical data points:
     - Shared favorite games (highest weight).
     - Shared favorite genres.
     - Compatible gaming platforms.
     - Matching availability schedules.
     - Common interests or keywords.

2. **Proximity Filtering** (not enabbled, currently can connect any location):
   - Users are matched only if they are within a practical distance of each other.

3. **Scoring System**:
   - Each match is assigned a score based on the number of shared attributes.
   - Higher weights are given to more relevant data points (e.g., shared games and availability).
   - Matches are sorted by score, with the strongest matches appearing first.

4. **Dynamic Filtering**:
   - Users can dismiss recommendations, ensuring they are not shown again.
   - The algorithm dynamically adjusts to avoid weak recommendations.

5. **Limitations**:
   - A maximum of 10 recommendations is displayed at a time to keep the experience focused and manageable.

This algorithm ensures that users are presented with the most relevant and compatible matches, improving the likelihood of meaningful connections.

## API Endpoints

The application provides a RESTful API with the following endpoints:
   Examples above.

## Technical Stack

### Backend
- **Language**: Java
- **Framework**: Spring Boot
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-Time Features**: WebSocket

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Styling**: Bootstrap
- **Real-Time Features**: Socket.IO

### Deployment
- **Containerization**: Docker and Docker Compose

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Docker (optional for containerized setup)

### Running Locally

#### Backend
1. Navigate to the backend directory:
   ```bash
   cd API/matchme
   ```
2. Install dependencies:
   ```bash
   ./mvnw install
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

#### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npm start
   ```

### Using Docker
1. Build and start the application:
   ```bash
   docker-compose up -d
   ```
2. Access the application at `http://localhost:5173`.

## Useful Commands
- **Database Access**: Access the PostgreSQL database from the command line:
  ```bash
  docker exec -it match-me-db-1 psql -U matchme_user -d matchme
  ```
- **View All Users**: Run a SQL query to view all users:
  ```sql
  SELECT * FROM app_user;
  ```