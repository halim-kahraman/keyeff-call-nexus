
# KeyEff Call Panel - PHP Backend

This is the backend API for the KeyEff Call Panel, a web-based communication and sales management tool for internal telemarketing, with GDPR-compliant tracking of customer contacts.

## Installation Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache or Nginx web server
- XAMPP, MAMP, or similar for local development

## Installation Instructions

1. **Set up the database**:
   - Create a new MySQL database named `keyeff_callpanel`
   - Import the database structure from `backend/sql/database.sql`

2. **Configure the backend**:
   - Edit `backend/config/database.php` to match your database credentials
   - Edit `backend/config/config.php` and update the `APP_URL` and `API_URL` to match your environment
   - Make sure to change the `JWT_SECRET` to a secure value

3. **Set up the server**:
   - Configure your web server to serve the backend from the `backend` directory
   - Ensure PHP has write permissions to the `exports` directory

4. **Test the installation**:
   - Access `http://localhost/keyeff_callpanel/backend/api/auth/login.php` to test if the API is working
   - You should receive a JSON response indicating a method not allowed error (since it requires a POST request)

## API Endpoints

### Authentication
- `POST /api/auth/login.php` - Login with email and password
- `POST /api/auth/verify.php` - Verify 2FA code
- `GET /api/auth/logout.php` - Logout

### Customers
- `GET /api/customers/list.php` - Get all customers

### Calls
- `POST /api/calls/log.php` - Log a call

### Appointments
- `POST /api/appointments/create.php` - Create a new appointment
- `GET /api/appointments/list.php` - Get appointments (with optional date range)

### Settings
- `GET /api/settings/get.php?category=smtp` - Get settings by category
- `POST /api/settings/save.php` - Save settings

### Logs
- `GET /api/logs/list.php` - Get logs (admin only)
- `GET /api/logs/export.php` - Export logs as CSV (admin only)

### Statistics
- `GET /api/statistics/get.php` - Get statistics (admin and filialleiter only)

## Frontend Integration

To connect this backend to the React frontend:

1. Update the API URLs in the React application to point to this PHP backend
2. Implement the API service in React to handle authentication and data fetching
3. Store the JWT token in localStorage or a secure HTTP-only cookie for authentication

## Security Considerations

- This backend uses a simple JWT implementation for demo purposes. In production, use a proper JWT library.
- Password hashing is implemented with PHP's `password_hash()` function
- CORS is configured to allow requests from the frontend application only
- All API endpoints validate JWT tokens before processing requests
- User roles and permissions are checked for restricted endpoints

## GDPR Compliance

- All user actions are logged with timestamps and IP addresses
- Logs can be exported for compliance reporting
- Authentication attempts are tracked
- Access to sensitive data is restricted by role
