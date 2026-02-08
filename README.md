# Sky Photography Gallery - Simple Client-Side Version 🌅

A clean, aesthetic, community-friendly photo gallery where images appear **immediately after upload**. Only the project owner can delete images using a password.

## ✨ Features

- ✅ **Immediate Upload** - Images appear in gallery instantly
- ✅ **No Backend** - Pure client-side (HTML/CSS/JavaScript)
- ✅ **localStorage** - Images stored in browser
- ✅ **Password-Protected Delete** - Only owner can remove images
- ✅ **BG2.webp Background** - Beautiful background on all pages
- ✅ **Responsive Design** - Works on all devices

## 🚀 Quick Start

### 1. Start a Local Server

```bash
# Using Python (recommended)
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000
```

### 2. Open in Browser

- **Upload Page:** http://localhost:8000
- **Gallery Page:** http://localhost:8000/gallery.html

### 3. Upload Your First Photo

1. Fill in photographer name and phone model
2. Select a nature/sky image
3. Check "I agree to rules"
4. Click "Upload Photo"
5. Image appears in gallery immediately!

## 📁 Project Structure

```
Sky_Pic_Website/
├── index.html              # Upload page
├── gallery.html            # Gallery page
├── README.md               # This file
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── config.js           # Owner password & settings
│   ├── upload.js           # Upload functionality
│   └── gallery.js          # Gallery & delete functionality
└── assets/
    └── BG2.webp            # Background image
```

## 🔐 Owner Password

**Default Password:** `skyowner123`

To delete images, you'll need this password. Change it in `js/config.js`:

```javascript
const CONFIG = {
  OWNER_PASSWORD: 'your_new_password_here',
  // ...
};
```

## 🎯 How It Works

### Upload Flow

1. User fills form (photographer name, phone model, image)
2. JavaScript converts image to base64
3. Saves to browser's localStorage
4. Success message displays
5. Image immediately visible in gallery

### Gallery Display

1. Loads all images from localStorage
2. Displays in responsive grid
3. Click image → Opens modal with details
4. Delete button (password-protected)

### Delete Flow

1. Click "Delete Image (Owner Only)" in modal
2. Enter owner password
3. Confirm deletion
4. Image removed from localStorage
5. Gallery updates immediately

## 📊 Storage Limits

- **localStorage Limit:** ~5-10MB (browser-dependent)
- **Recommended:** 10-20 images max
- **Image Format:** Base64 (larger than original)

## 🧪 Testing

### Test Upload

```
1. Open http://localhost:8000
2. Fill form and upload image
3. Check for success message
4. Verify no console errors (F12)
```

### Test Gallery

```
1. Navigate to gallery.html
2. Verify image appears
3. Click image to open modal
4. Check photographer details display
```

### Test Delete

```
1. Click delete button in modal
2. Enter wrong password → Should fail
3. Enter correct password (skyowner123)
4. Confirm → Image should be deleted
```

### Clear All Data

Open browser console (F12) and run:

```javascript
localStorage.removeItem('sky_gallery_images');
location.reload();
```

## ⚙️ Configuration

Edit `js/config.js`:

```javascript
const CONFIG = {
  // Owner password for deleting images
  OWNER_PASSWORD: 'skyowner123',
  
  // localStorage key
  STORAGE_KEY: 'sky_gallery_images',
  
  // Max file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Allowed formats
  ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};
```

## 🎨 Customization

### Change Background

Replace `assets/BG2.webp` with your own image, or edit `css/styles.css`:

```css
.background-image {
  background-image: url('../assets/your-image.jpg');
}
```

### Change Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --primary-color: #4a90e2;
  --secondary-color: #50c878;
  --accent-color: #ff6b6b;
  /* ... */
}
```

## ⚠️ Limitations

- **Storage:** Limited to ~5-10MB (10-20 images)
- **Browser-Specific:** Data not shared across browsers
- **No Backup:** Clearing browser data deletes images
- **Password Visible:** Owner password in source code
- **Single Owner:** No multi-user support

## 🔒 Security Notes

> **Warning:** The owner password is visible in `js/config.js` source code. This is acceptable for personal projects or trusted communities, but not for public production use.

**For production:**
- Implement backend authentication
- Use environment variables
- Add proper user management

## 🐛 Troubleshooting

### Images not appearing

1. Open console (F12)
2. Run: `localStorage.getItem('sky_gallery_images')`
3. Should show JSON array
4. If null, no images uploaded yet

### Upload fails

- Check file size (< 10MB)
- Check file type (JPEG, PNG, WebP)
- Check browser console for errors
- Verify localStorage not full

### Delete doesn't work

- Verify password: `skyowner123`
- Check browser console for errors
- Ensure modal is open

### Background not showing

- Verify `assets/BG2.webp` exists
- Hard refresh (Ctrl+F5)
- Check file path in CSS

## 📈 Upgrade Path

Need more features? Consider:

1. **Backend Server** - For unlimited storage
2. **Database** - For better data management
3. **Admin Panel** - For approval workflow
4. **Cloud Storage** - For image hosting
5. **User Authentication** - For multi-user support

## 📝 License

Open source - free for personal and commercial use

---

**Built with ❤️ for nature photography lovers**

Enjoy your simple, beautiful photo gallery! 🌅
