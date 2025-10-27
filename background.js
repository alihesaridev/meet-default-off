// Default settings
const DEFAULT_SETTINGS = {
  camera: 'block',
  microphone: 'block',
  blockingMethod: 'permissions'
};

// Icon mapping for different states
const ICON_STATES = {
  'camera-off-mic-off': { color: '#e74c3c', emoji: '🚫', name: 'Both Blocked' },
  'camera-off-mic-on': { color: '#f39c12', emoji: '🎤', name: 'Mic Only' },
  'camera-on-mic-off': { color: '#3498db', emoji: '📹', name: 'Camera Only' },
  'camera-on-mic-on': { color: '#27ae60', emoji: '📹🎤', name: 'Both Allowed' }
};


// Update extension badge based on current settings
async function updateIcon(camera, microphone) {
  try {
    const cameraState = camera === 'allow' ? 'on' : 'off';
    const micState = microphone === 'allow' ? 'on' : 'off';
    
    // Create badge text to show current state
    let badgeText = '';
    let badgeColor = '#e74c3c'; // Default red
    
    if (cameraState === 'off' && micState === 'off') {
      badgeText = '🚫';
      badgeColor = '#e74c3c'; // Red - both blocked
    } else if (cameraState === 'off' && micState === 'on') {
      badgeText = '🎤';
      badgeColor = '#f39c12'; // Orange - mic only
    } else if (cameraState === 'on' && micState === 'off') {
      badgeText = '📹';
      badgeColor = '#3498db'; // Blue - camera only
    } else if (cameraState === 'on' && micState === 'on') {
      badgeText = '✅';
      badgeColor = '#27ae60'; // Green - both allowed
    }
    
    // Set badge text and color
    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    
    console.log(`🎨 Badge updated: ${badgeText} (${badgeColor})`);
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Apply settings to content settings
async function applySettings(camera, microphone, blockingMethod) {
  try {
    if (blockingMethod === 'permissions') {
      // Clear any existing keyboard method settings first
      console.log('🔐 Switching to permissions method - clearing keyboard method');
      
      await chrome.contentSettings.camera.set({
        primaryPattern: "https://meet.google.com/*",
        setting: camera
      });
      
      await chrome.contentSettings.microphone.set({
        primaryPattern: "https://meet.google.com/*",
        setting: microphone
      });
      
      // Send to content script for getUserMedia override
      const tabs = await chrome.tabs.query({ url: "https://meet.google.com/*" });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'applyPermissionSettings',
            camera: camera,
            microphone: microphone
          });
          console.log(`📨 Permission settings sent to tab ${tab.id}`);
        } catch (error) {
          console.log(`⚠️ Could not send permission message to tab ${tab.id}:`, error.message);
        }
      }
      
      console.log(`✅ Permission settings applied: Camera=${camera}, Microphone=${microphone}`);
    } else if (blockingMethod === 'keyboard') {
      // Keyboard method - NO browser permissions, only keyboard shortcuts
      console.log('⌨️ Switching to keyboard method - using ONLY keyboard shortcuts');
      
      // Don't set any browser permissions - let Google Meet handle permissions naturally
      // The keyboard method will use Ctrl+E/D to toggle camera/mic based on current state
      
      // Send message to content script for keyboard shortcuts
      const tabs = await chrome.tabs.query({ url: "https://meet.google.com/*" });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'applyKeyboardSettings',
            camera: camera,
            microphone: microphone
          });
          console.log(`📨 Keyboard settings sent to tab ${tab.id}`);
        } catch (error) {
          console.log(`⚠️ Could not send message to tab ${tab.id}:`, error.message);
        }
      }
      
      console.log(`✅ Keyboard shortcut settings applied: Camera=${camera}, Microphone=${microphone}`);
    }
    
    // Update icon to reflect current settings
    await updateIcon(camera, microphone);
  } catch (error) {
    console.error('Error applying settings:', error);
  }
}

// Initialize extension with default or saved settings
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Get saved settings or use defaults
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    const camera = result.camera || DEFAULT_SETTINGS.camera;
    const microphone = result.microphone || DEFAULT_SETTINGS.microphone;
    const blockingMethod = result.blockingMethod || DEFAULT_SETTINGS.blockingMethod;
    
    // Apply the settings
    await applySettings(camera, microphone, blockingMethod);
    
    console.log("✅ Meet Default Off extension initialized with settings:", { camera, microphone, blockingMethod });
  } catch (error) {
    console.error('Error initializing extension:', error);
    // Fallback to default settings
    await applySettings(DEFAULT_SETTINGS.camera, DEFAULT_SETTINGS.microphone, DEFAULT_SETTINGS.blockingMethod);
  }
});

// Listen for settings changes from popup
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync' && (changes.camera || changes.microphone || changes.blockingMethod)) {
    try {
      const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      const camera = result.camera || DEFAULT_SETTINGS.camera;
      const microphone = result.microphone || DEFAULT_SETTINGS.microphone;
      const blockingMethod = result.blockingMethod || DEFAULT_SETTINGS.blockingMethod;
      
      await applySettings(camera, microphone, blockingMethod);
      console.log("✅ Settings updated and applied:", { camera, microphone, blockingMethod });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }
});
