# ASU API Example

This directory contains example files for setting up an API endpoint to receive Atemschutzüberwachung (Breathing Apparatus Monitoring) data from the FiveM server.

## Files

- **asu-sync.php**: Example PHP endpoint for receiving ASU protocol data
- **asu_schema.sql**: MySQL/MariaDB database schema for storing protocols
- **README.md**: This file

## Installation

### 1. Web Server Setup

1. Copy `asu-sync.php` to your web server (e.g., `/var/www/html/api/asu-sync.php`)
2. Ensure the web server has write permissions for log files
3. Make sure HTTPS is enabled (required by FiveM)

### 2. Database Setup (Optional)

If you want to store protocols in a database:

1. Import the SQL schema:
   ```bash
   mysql -u your_user -p your_database < asu_schema.sql
   ```

2. Edit `asu-sync.php` and uncomment the database configuration:
   ```php
   $DB_HOST = 'localhost';
   $DB_NAME = 'your_database';
   $DB_USER = 'your_username';
   $DB_PASS = 'your_password';
   ```

3. Uncomment the database code in the `saveToDatabase()` function

### 3. Configure API Key

1. Edit `asu-sync.php`:
   ```php
   $VALID_API_KEY = 'your_secure_api_key_here';
   ```

2. Update your FiveM config.lua:
   ```lua
   -- Enable the ASU system
   Config.ASUEnabled = true  -- Set to false to disable the entire ASU system
   
   -- Set the API key in EMDSync (used by both EMD and ASU)
   Config.EMDSync = {
       APIKey = 'your_secure_api_key_here'
   }
   
   -- Enable ASU sync
   Config.ASUSync = {
       Enabled = true,
       APIEndpoint = 'https://your-domain.com/api/asu-sync.php'
       -- API key is automatically taken from Config.EMDSync.APIKey
   }
   ```

## Testing

### Test the Endpoint

You can test the endpoint with curl:

```bash
curl -X POST https://your-domain.com/api/asu-sync.php \
  -H "Content-Type: application/json" \
  -d '{
    "intraRP_API_Key": "your_secure_api_key_here",
    "timestamp": 1234567890,
    "type": "asu_protocol",
    "data": {
      "missionNumber": "E-2024-TEST",
      "missionLocation": "Test Street 123",
      "missionDate": "2024-12-23",
      "supervisor": "Test User",
      "trupp1": {
        "tf": "John Doe",
        "tm1": "Jane Smith"
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Protocol received and saved",
  "missionNumber": "E-2024-TEST"
}
```

## File Storage

By default, protocols are saved as JSON files in the `asu_protocols/` directory:

```
asu_protocols/
├── E-2024-001_1703347200.json
├── E-2024-002_1703350800.json
└── ...
```

## Database Storage

If you configure database storage, protocols are saved in two tables:

1. **asu_protocols**: Main protocol information
2. **asu_trupps**: Detailed trupp information (optional normalized structure)

### Example Queries

```sql
-- Get all protocols
SELECT * FROM asu_protocols ORDER BY created_at DESC;

-- Get protocols from today
SELECT * FROM asu_protocols WHERE DATE(mission_date) = CURDATE();

-- Get statistics
SELECT * FROM asu_trupp_statistics;
```

## Logging

The endpoint logs all requests to `asu_sync.log`:

```
[2024-12-23 14:30:00] [INFO] Received request from 123.45.67.89
[2024-12-23 14:30:00] [INFO] Processing protocol for mission: E-2024-001
[2024-12-23 14:30:00] [SUCCESS] Protocol saved successfully: E-2024-001
```

To disable logging, set:
```php
$LOG_FILE = null;
```

## Security

### Important Security Considerations

1. **Always use HTTPS** - FiveM requires it
2. **Use a strong API key** - Don't use the default "CHANGE_ME"
3. **Restrict file permissions** - Ensure log files aren't publicly accessible
4. **Validate all input** - The example includes basic validation
5. **Use prepared statements** - When using database storage
6. **Rate limiting** - Consider implementing rate limiting for production

### .htaccess Example

Protect log files:

```apache
<Files "asu_sync.log">
    Require all denied
</Files>

<Files "*.json">
    Require all denied
</Files>
```

### Nginx Example

Protect log files:

```nginx
location ~* \.(log|json)$ {
    deny all;
}
```

## Troubleshooting

### "Invalid API Key" Error

- Check that the API key in `asu-sync.php` matches the one in FiveM config.lua
- Ensure there are no extra spaces or characters

### "Method not allowed" Error

- Make sure you're using POST method
- Check that the endpoint URL is correct

### "Failed to save protocol" Error

- Check file/directory permissions
- Check database connection and credentials (if using database)
- Review the log file for detailed error messages

### No Response

- Verify HTTPS is enabled
- Check server error logs
- Ensure PHP is installed and configured correctly

## Support

For issues or questions, please refer to the main ASU_README.md file or create an issue in the GitHub repository.
