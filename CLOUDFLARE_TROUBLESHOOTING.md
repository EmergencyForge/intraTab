# Cloudflare Tunnels Troubleshooting Guide

If you're experiencing issues where the tablet displays but clicking within the iframe doesn't navigate to new pages, this is likely due to server-side security headers that block iframe embedding.

## Common Issue: iframe Content Blocked

### Symptoms
- Tablet opens successfully
- Initial page loads
- Clicking links inside the tablet does nothing
- Console shows warnings about blocked content

### Root Cause
Your web server (through Cloudflare Tunnels or directly) is sending HTTP headers that prevent the content from being displayed in an iframe. This is a **server-side issue**, not a client-side intraTab issue.

## Diagnostic Steps

### 1. Check Browser Console (F12)
Open the browser console in FiveM and look for messages starting with `[intraTab]`:
- `[intraTab] iframe load event fired` - iframe attempted to load
- `Cannot access iframe content - likely blocked by X-Frame-Options or CSP headers` - **This is the issue!**

### 2. Test Your IntraRP URL
Run this command to check your server headers:
```bash
curl -I https://your-intrarp-url.com/enotf/
```

Look for these problematic headers:
```
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
```

## Solutions (Server-Side Configuration Required)

### Solution 1: Apache (.htaccess or httpd.conf)

Add or modify these lines in your IntraRP installation:

```apache
# Allow iframe embedding
Header always unset X-Frame-Options
Header always set Content-Security-Policy "frame-ancestors *"

# Or for more security, specify FiveM NUI:
# Header always set Content-Security-Policy "frame-ancestors nui://* file://* https://*"
```

### Solution 2: Nginx (nginx.conf)

```nginx
# Remove X-Frame-Options
add_header X-Frame-Options "" always;

# Allow iframe embedding
add_header Content-Security-Policy "frame-ancestors *" always;
```

### Solution 3: PHP (in IntraRP's index.php or config)

```php
// Remove X-Frame-Options
header_remove('X-Frame-Options');

// Allow iframe embedding
header("Content-Security-Policy: frame-ancestors *");
```

### Solution 4: Cloudflare Tunnel Dashboard

1. Log in to Cloudflare Zero Trust Dashboard
2. Go to **Access** > **Tunnels**
3. Find your tunnel and click **Configure**
4. Go to **Public Hostname** for your IntraRP domain
5. Under **Additional application settings** > **HTTP Settings**:
   - Look for "Remove X-Frame-Options"
   - Or configure CSP headers to allow framing

### Solution 5: Cloudflare Page Rules (if using Cloudflare DNS)

1. Go to your domain in Cloudflare Dashboard
2. Go to **Rules** > **Transform Rules** > **HTTP Response Header Modification**
3. Create a rule to remove or modify `X-Frame-Options` header
4. Create a rule to set `Content-Security-Policy` to allow framing

### Solution 6: Cloudflare-Specific Features That May Block iframes

Some Cloudflare features can interfere with iframe functionality:

#### Disable Browser Integrity Check
1. Go to Cloudflare Dashboard
2. Navigate to **Security** > **Settings**
3. Scroll to **Browser Integrity Check**
4. **Disable** this feature

This check can block FiveM's embedded browser (CEF) from loading iframes properly.

#### Disable or Configure Bot Fight Mode
1. Go to Cloudflare Dashboard
2. Navigate to **Security** > **Bots**
3. Review **Bot Fight Mode** settings
4. Either disable it or add FiveM's user agent to the allowlist

Bot Fight Mode may incorrectly identify FiveM's requests as bot traffic.

#### Disable Rocket Loader (if enabled)
1. Go to Cloudflare Dashboard
2. Navigate to **Speed** > **Optimization**
3. Find **Rocket Loader**
4. **Disable** this feature

Rocket Loader can interfere with JavaScript execution in iframes.

#### Configure Firewall Rules
1. Go to Cloudflare Dashboard
2. Navigate to **Security** > **WAF**
3. Check for rules that might block iframe requests
4. Consider adding a bypass rule for your FiveM server IP

### Solution 7: Cookie Settings (for authenticated content)

If IntraRP requires authentication, cookies must work in iframe context:

**Server-side (PHP example):**
```php
// Set SameSite=None for cookies to work in iframes
setcookie('session_name', $value, [
    'samesite' => 'None',
    'secure' => true,  // Required when SameSite=None
    'httponly' => true
]);
```

**Or via headers:**
```
Set-Cookie: session_name=value; SameSite=None; Secure; HttpOnly
```

### Solution 8: Meta Tag CSP (as fallback)

Some configurations require CSP in both headers AND meta tags. Add this to your IntraRP's HTML `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="frame-ancestors *">
```

## Alternative: Open in External Browser

If you cannot modify server configuration, you can open IntraRP in an external browser instead of embedding it in the tablet. This would require modifying the intraTab resource to open links externally.

## Testing After Changes

1. Restart your web server / Cloudflare Tunnel
2. Clear browser cache in FiveM
3. Restart the intraTab resource in FiveM
4. Open the tablet and test clicking links
5. Check the browser console (F12) for diagnostic messages

## Still Having Issues?

If you've made these changes and it still doesn't work:

1. Verify the headers were actually changed (use `curl -I` again)
2. Check if there's a reverse proxy or firewall adding headers
3. Check FiveM client console for detailed error messages
4. Ensure you're using HTTPS for both the tunnel and IntraRP
5. Check for mixed content warnings (HTTP/HTTPS conflicts)

## Why This Happens

Web servers add `X-Frame-Options` and `Content-Security-Policy` headers to prevent **clickjacking attacks**, where malicious websites embed your content in iframes to trick users. While this is good security for public websites, it prevents legitimate iframe embedding like intraTab.

Since you control both the IntraRP server and the intraTab client, it's safe to allow iframe embedding from your FiveM server.

## Summary

**The issue is NOT with intraTab code** - it's a server configuration issue. You need to:
1. ✅ Modify server headers to allow iframe embedding
2. ✅ Configure Cloudflare Tunnels to not add restrictive headers
3. ✅ Test with the diagnostic messages added in the latest version

For more help, check your web server documentation or Cloudflare Tunnels documentation about iframe embedding and security headers.
