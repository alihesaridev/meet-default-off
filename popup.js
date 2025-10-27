// Default settings
const DEFAULT_SETTINGS = {
  camera: 'block',
  microphone: 'block',
  blockingMethod: 'permissions'
};

// Load settings from storage and populate UI
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    // Set camera setting
    const cameraRadio = document.getElementById(`camera-${result.camera}`);
    if (cameraRadio) {
      cameraRadio.checked = true;
    }
    
    // Set microphone setting
    const micRadio = document.getElementById(`mic-${result.microphone}`);
    if (micRadio) {
      micRadio.checked = true;
    }
    
    // Set blocking method
    const methodRadio = document.getElementById(`method-${result.blockingMethod}`);
    if (methodRadio) {
      methodRadio.checked = true;
    }
    
    // Update badge to reflect current settings
    await updateBadge(result.camera, result.microphone);
    
    showStatus('Settings loaded successfully', false);
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', true);
  }
}

// Update badge to show current settings
async function updateBadge(camera, microphone) {
  try {
    const cameraState = camera === 'allow' ? 'on' : 'off';
    const micState = microphone === 'allow' ? 'on' : 'off';
    
    let badgeText = '';
    let badgeColor = '#e74c3c';
    
    if (cameraState === 'off' && micState === 'off') {
      badgeText = '🚫';
      badgeColor = '#e74c3c';
    } else if (cameraState === 'off' && micState === 'on') {
      badgeText = '🎤';
      badgeColor = '#f39c12';
    } else if (cameraState === 'on' && micState === 'off') {
      badgeText = '📹';
      badgeColor = '#3498db';
    } else if (cameraState === 'on' && micState === 'on') {
      badgeText = '✅';
      badgeColor = '#27ae60';
    }
    
    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  } catch (error) {
    console.error('Error updating badge from popup:', error);
  }
}

// Save settings to storage
async function saveSettings(camera, microphone, blockingMethod) {
  try {
    await chrome.storage.sync.set({
      camera: camera,
      microphone: microphone,
      blockingMethod: blockingMethod
    });
    
    // Apply settings immediately (this will also update the badge)
    await applySettings(camera, microphone, blockingMethod);
    
    // Also update badge immediately from popup
    await updateBadge(camera, microphone);
    
    showStatus('Settings saved and applied!', false);
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', true);
  }
}

// Apply settings to content settings
async function applySettings(camera, microphone, blockingMethod) {
  try {
    if (blockingMethod === 'permissions') {
      // Clear any existing keyboard method settings first
      console.log('🔐 Switching to permissions method - clearing keyboard method');
      
      // Apply camera setting
      await chrome.contentSettings.camera.set({
        primaryPattern: "https://meet.google.com/*",
        setting: camera
      });
      
      // Apply microphone setting
      await chrome.contentSettings.microphone.set({
        primaryPattern: "https://meet.google.com/*",
        setting: microphone
      });
      
      // Also send to content script for getUserMedia override
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
  } catch (error) {
    console.error('Error applying settings:', error);
    throw error;
  }
}

// Show status message
function showStatus(message, isError = false) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = isError ? 'status error' : 'status';
  statusDiv.style.display = 'block';
  
  // Hide status after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Handle radio button changes
function setupEventListeners() {
  // Camera setting change
  document.querySelectorAll('input[name="camera"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const camera = e.target.value;
      const micSetting = document.querySelector('input[name="microphone"]:checked').value;
      const blockingMethod = document.querySelector('input[name="blockingMethod"]:checked').value;
      await saveSettings(camera, micSetting, blockingMethod);
    });
  });
  
  // Microphone setting change
  document.querySelectorAll('input[name="microphone"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const microphone = e.target.value;
      const cameraSetting = document.querySelector('input[name="camera"]:checked').value;
      const blockingMethod = document.querySelector('input[name="blockingMethod"]:checked').value;
      await saveSettings(cameraSetting, microphone, blockingMethod);
    });
  });
  
  // Blocking method change
  document.querySelectorAll('input[name="blockingMethod"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const blockingMethod = e.target.value;
      const cameraSetting = document.querySelector('input[name="camera"]:checked').value;
      const micSetting = document.querySelector('input[name="microphone"]:checked').value;
      await saveSettings(cameraSetting, micSetting, blockingMethod);
    });
  });
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});
