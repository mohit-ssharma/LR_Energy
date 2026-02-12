# GoDaddy MySQL Database Setup Guide

## Step 1: Login to GoDaddy cPanel

1. Go to: https://www.godaddy.com
2. Login to your account
3. Go to: **My Products** → **Web Hosting** → **Manage**
4. Click: **cPanel Admin**

---

## Step 2: Create MySQL Database

### 2.1 Open MySQL Databases

1. In cPanel, find section: **Databases**
2. Click: **MySQL® Databases**

### 2.2 Create New Database

```
Database Name: [your_prefix]_scada

Example: If your cPanel username is "lrenergy"
Full database name will be: lrenergy_scada
```

1. Enter database name: `scada`
2. Click: **Create Database**
3. Note down the full name (including prefix)

### 2.3 Create Database User

```
Username: [your_prefix]_scadauser
Password: [Generate a strong password - SAVE THIS!]
```

1. Scroll down to **MySQL Users**
2. Enter username: `scadauser`
3. Enter password (use strong password generator)
4. Click: **Create User**
5. **IMPORTANT: Save the password somewhere safe!**

### 2.4 Add User to Database

1. Scroll down to **Add User To Database**
2. Select user: `[your_prefix]_scadauser`
3. Select database: `[your_prefix]_scada`
4. Click: **Add**
5. On privileges page, check: **ALL PRIVILEGES**
6. Click: **Make Changes**

---

## Step 3: Run SQL Schema

### 3.1 Open phpMyAdmin

1. In cPanel, find section: **Databases**
2. Click: **phpMyAdmin**

### 3.2 Select Database

1. In left panel, click your database: `[your_prefix]_scada`

### 3.3 Import Schema

**Option A: Import SQL File**
1. Click: **Import** tab at top
2. Click: **Choose File**
3. Select: `schema.sql` file (download from this project)
4. Click: **Go**

**Option B: Copy-Paste SQL**
1. Click: **SQL** tab at top
2. Copy entire contents of `schema.sql`
3. Paste into the query box
4. Click: **Go**

### 3.4 Verify Tables Created

1. In left panel, expand your database
2. You should see 5 tables:
   - `scada_readings`
   - `users`
   - `api_logs`
   - `sync_status`
   - `alerts`

---

## Step 4: Update User Passwords

The default password hashes in the schema are placeholders. Update them:

### 4.1 Generate Password Hash

1. In phpMyAdmin, click: **SQL** tab
2. Run this query to generate hash for password "qwerty":

```sql
SELECT PASSWORD('qwerty');
```

Or use PHP (create a temporary file on server):
```php
<?php
echo password_hash('qwerty', PASSWORD_DEFAULT);
?>
```

### 4.2 Update User Passwords

Run this SQL (replace HASH with actual hash):

```sql
UPDATE users SET password = '$2y$10$ACTUAL_HASH_HERE' WHERE email = 'it@lrenergy.in';
UPDATE users SET password = '$2y$10$ACTUAL_HASH_HERE' WHERE email = 'it1@lrenergy.in';
```

---

## Step 5: Note Your Credentials

Fill in and save these details:

```
╔═══════════════════════════════════════════════════════════════╗
║                 DATABASE CREDENTIALS                          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  MySQL Host:     localhost                                    ║
║                  (always "localhost" for GoDaddy shared)      ║
║                                                               ║
║  Database Name:  ____________________________                 ║
║                  (e.g., lrenergy_scada)                       ║
║                                                               ║
║  Username:       ____________________________                 ║
║                  (e.g., lrenergy_scadauser)                   ║
║                                                               ║
║  Password:       ____________________________                 ║
║                  (the password you created)                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Step 6: Test Database Connection

### 6.1 Create Test File

In cPanel File Manager, create file: `public_html/test_db.php`

```php
<?php
// Database credentials
$host = 'localhost';
$dbname = 'YOUR_DATABASE_NAME';  // e.g., lrenergy_scada
$username = 'YOUR_USERNAME';      // e.g., lrenergy_scadauser
$password = 'YOUR_PASSWORD';

// Test connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>✅ Database Connection Successful!</h2>";
    
    // Test query
    $stmt = $conn->query("SELECT COUNT(*) as count FROM scada_readings");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Records in scada_readings: " . $result['count'] . "</p>";
    
    // Show tables
    $stmt = $conn->query("SHOW TABLES");
    echo "<h3>Tables:</h3><ul>";
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "<li>" . $row[0] . "</li>";
    }
    echo "</ul>";
    
} catch(PDOException $e) {
    echo "<h2>❌ Connection Failed!</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?>
```

### 6.2 Test Connection

1. Open browser: `https://yourdomain.com/test_db.php`
2. Should see: "✅ Database Connection Successful!"

### 6.3 Delete Test File

**IMPORTANT:** After testing, delete `test_db.php` for security!

---

## Step 7: Share Credentials With Me

Once database is set up, share with me:

| Item | Your Value |
|------|------------|
| Domain | e.g., karnal.lrenergy.in |
| Database Name | |
| Username | |
| Password | |

Then I'll create the PHP API files for you!

---

## Troubleshooting

### Error: "Access denied for user"
- Double-check username and password
- Verify user is added to database with ALL PRIVILEGES

### Error: "Unknown database"
- Check database name (including prefix)
- Make sure database was created successfully

### Error: "Connection refused"
- Host should be `localhost` for GoDaddy shared hosting
- Not an IP address!

### Tables not showing
- Make sure you ran the SQL in correct database
- Check left panel in phpMyAdmin shows correct database selected

---

## Security Notes

1. **Never share database password** in emails or chat
2. **Delete test_db.php** after testing
3. **Change default user passwords** (it@lrenergy.in, it1@lrenergy.in)
4. **Keep credentials in secure location**
