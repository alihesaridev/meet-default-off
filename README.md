# Meet Default Off

A Chrome extension that automatically manages camera and microphone permissions for Google Meet, giving you control over your privacy by default. Now with **two blocking methods** and **intelligent state detection** for maximum reliability.

## 🎯 Features

- **🔐 Dual Blocking Methods**: Choose between browser-level permissions or keyboard shortcuts
- **🎯 Smart State Detection**: Automatically detects current camera/mic state and toggles intelligently
- **⌨️ Keyboard Shortcuts**: Uses Ctrl+E (video) and Ctrl+D (mic) to toggle states
- **🔄 Automatic Fallback**: If keyboard shortcuts fail, automatically falls back to button clicking
- **📊 Real-Time Status**: Visual badge shows current camera/mic state
- **🛡️ Dialog Detection**: Prevents interference with Google Meet's permission dialogs
- **⚡ Debounced Execution**: Prevents rapid repeated executions and race conditions
- **🔍 Comprehensive Logging**: Detailed console logging for debugging and monitoring
- **💾 Persistent Storage**: Settings saved and synced across all Chrome browsers
- **🎨 User-Friendly Interface**: Clean popup with clear status indicators

## 🚀 Installation

### From Source (Developer Mode)

1. **Download or Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Files Structure

```
meet-default-off/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Content script with smart state detection
├── popup.html            # Settings popup interface
├── popup.js              # Popup functionality
└── README.md             # This file
```

## 📖 How to Use

### 1. **Access Settings**
- Click on the extension icon in your Chrome toolbar
- The settings popup will open

### 2. **Configure Default Settings**
Choose your preferred default behavior for:

- **📹 Camera**: 
  - **Block (Ask permission)**: Camera is blocked by default, you'll be prompted to allow access
  - **Allow (Auto-enable)**: Camera is automatically enabled when joining meetings

- **🎤 Microphone**:
  - **Block (Ask permission)**: Microphone is blocked by default, you'll be prompted to allow access
  - **Allow (Auto-enable)**: Microphone is automatically enabled when joining meetings

- **⌨️ Blocking Method**:
  - **Permissions (Recommended)**: Uses browser-level permission blocking for maximum reliability
  - **Keyboard Shortcuts**: Uses Ctrl+E (video) and Ctrl+D (mic) to toggle states

### 3. **Settings Are Applied Automatically**
- Your preferences are saved immediately
- Settings are applied to Google Meet (`https://meet.google.com/*`)
- Changes take effect for all future Google Meet sessions
- Visual badge shows current camera/mic state

## ⚙️ Configuration Options

### Blocking Methods

| Method | Description | Pros | Cons |
|--------|-------------|------|------|
| **Permissions** | Browser-level blocking | Most reliable, works immediately | Requires browser permission |
| **Keyboard Shortcuts** | Uses Ctrl+E/D to toggle | Works without browser permissions | Requires Google Meet UI to be loaded |

### Settings Combinations

| Setting | Camera | Microphone | Badge | Description |
|---------|--------|------------|-------|-------------|
| **Privacy Mode** | Block | Block | 🚫 | Both camera and mic blocked by default |
| **Mic Only** | Block | Allow | 🎤 | Camera blocked, microphone auto-enabled |
| **Camera Only** | Allow | Block | 📹 | Camera auto-enabled, microphone blocked |
| **Full Access** | Allow | Allow | ✅ | Both camera and microphone auto-enabled |

## 🔧 Technical Details

### Permissions Used

- **`contentSettings`**: Manages camera and microphone permissions for specific websites
- **`storage`**: Saves your preferences using Chrome's sync storage
- **`tabs`**: Communicates with Google Meet tabs to apply keyboard shortcuts

### How It Works

1. **Background Service Worker** (`background.js`):
   - Manages camera and microphone permissions for Google Meet
   - Listens for setting changes and applies them immediately
   - Handles extension initialization and badge updates
   - Communicates with content scripts for keyboard shortcuts

2. **Content Script** (`content.js`):
   - **Smart State Detection**: Analyzes Google Meet UI to detect current camera/mic state
   - **Keyboard Shortcuts**: Sends Ctrl+E (video) and Ctrl+D (mic) events with multiple dispatch methods
   - **Automatic Fallback**: Falls back to button clicking if keyboard shortcuts fail
   - **Dialog Detection**: Prevents interference with Google Meet's permission dialogs
   - **Debounced Execution**: Prevents rapid repeated executions and race conditions

3. **Settings Popup** (`popup.html` + `popup.js`):
   - Provides user interface for configuration
   - Saves settings to Chrome's sync storage
   - Triggers immediate application of new settings
   - Updates visual badge to show current state

4. **Dual Blocking Methods**:
   - **Permissions Method**: Uses Chrome's `contentSettings` API for browser-level blocking
   - **Keyboard Method**: Uses intelligent state detection and keyboard events for UI-level control

## 🛠️ Development

### Prerequisites

- Chrome browser (version 88+)
- Basic knowledge of Chrome extension development

### Building from Source

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd meet-default-off
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the project folder

### File Descriptions

- **`manifest.json`**: Extension configuration and permissions
- **`background.js`**: Service worker handling permissions, settings, and badge updates
- **`content.js`**: Content script with smart state detection and keyboard shortcuts
- **`popup.html`**: Settings interface markup with blocking method selection
- **`popup.js`**: Settings interface logic and storage management

## 🔒 Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any personal data
- **Local Storage Only**: All settings are stored locally using Chrome's sync storage
- **Minimal Permissions**: Only requests necessary permissions for camera/microphone management
- **Open Source**: Full source code is available for review

## 🐛 Troubleshooting

### Extension Not Working

1. **Check Permissions**: Ensure the extension has necessary permissions
2. **Reload Extension**: Go to `chrome://extensions/` and click the reload button
3. **Check Console**: Open Chrome DevTools (F12) to see detailed logging
4. **Check Badge**: Look at the extension badge to see current state

### Keyboard Shortcuts Not Working

1. **Check Method**: Ensure "Keyboard Shortcuts" is selected in settings
2. **Wait for UI**: Keyboard shortcuts require Google Meet UI to be fully loaded
3. **Check Console**: Look for detailed logging about state detection and shortcuts
4. **Try Permissions Method**: Switch to "Permissions" method for more reliable blocking

### Settings Not Saving

1. **Check Storage**: Verify Chrome sync is enabled
2. **Clear Storage**: Reset extension storage if needed
3. **Reinstall**: Remove and reinstall the extension

### Google Meet Still Asking for Permissions

1. **Check URL**: Ensure you're on `https://meet.google.com/*`
2. **Browser Settings**: Check Chrome's site permissions
3. **Extension Status**: Verify the extension is enabled
4. **Check Method**: Try switching between "Permissions" and "Keyboard Shortcuts"

### Debug Mode

The extension provides comprehensive logging. To debug:

1. **Open Chrome DevTools** (F12)
2. **Go to Console tab**
3. **Look for messages starting with**:
   - `🎬` - Content script loading
   - `🔍` - State detection
   - `⌨️` - Keyboard shortcuts
   - `📹` - Camera operations
   - `🎤` - Microphone operations
   - `✅` - Success messages
   - `❌` - Error messages

## 📝 Changelog

### Version 1.1 (Latest)
- **🔐 Dual Blocking Methods**: Added keyboard shortcuts method alongside permissions
- **🎯 Smart State Detection**: Automatically detects current camera/mic state
- **⌨️ Enhanced Keyboard Shortcuts**: Multiple dispatch methods with retry logic
- **🔄 Automatic Fallback**: Falls back to button clicking if shortcuts fail
- **🛡️ Dialog Detection**: Prevents interference with Google Meet dialogs
- **⚡ Debounced Execution**: Prevents race conditions and rapid executions
- **📊 Visual Badge**: Real-time status indicator showing camera/mic state
- **🔍 Comprehensive Logging**: Detailed console logging for debugging
- **🐛 Bug Fixes**: Fixed random dialog opening and click interference issues

### Version 1.0
- Initial release
- Camera and microphone permission management
- Settings popup interface
- Persistent storage
- Real-time setting application

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. **Report Issues**: Submit bug reports or feature requests
2. **Submit Pull Requests**: Contribute code improvements
3. **Suggest Features**: Propose new functionality

## 📄 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 🙏 Acknowledgments

- Built for privacy-conscious users who want control over their camera and microphone access
- Inspired by the need for better privacy defaults in video conferencing

## 🎯 Keyboard Shortcuts Reference

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl+E** (Windows/Linux)<br>**Cmd+E** (Mac) | Toggle Video | Turns camera on/off |
| **Ctrl+D** (Windows/Linux)<br>**Cmd+D** (Mac) | Toggle Audio | Mutes/unmutes microphone |

## 🔍 Advanced Features

### Smart State Detection
The extension analyzes Google Meet's UI to determine current camera/microphone state using:
- `aria-label` attributes on buttons
- `data-is-muted` attributes
- `aria-pressed` states
- SVG icon path analysis (fallback)

### Multiple Dispatch Methods
When using keyboard shortcuts, the extension tries multiple methods:
1. Window-level event dispatch
2. Document-level event dispatch  
3. Body element dispatch
4. Google Meet container dispatch
5. Focused element dispatch with keydown/keyup sequence

### Automatic Fallback System
If keyboard shortcuts fail, the extension automatically:
1. Detects the failure after 2 seconds
2. Falls back to direct button clicking
3. Provides detailed logging of the process

---

**Note**: This extension only affects Google Meet permissions. Other websites and applications are not impacted by these settings.
