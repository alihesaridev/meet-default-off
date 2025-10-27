// Meet Default Off - Content Script
// Handles keyboard shortcuts for camera and microphone control

console.log('🎬 Meet Default Off content script loaded');

// Detect operating system
function detectOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) {
    return 'mac';
  } else if (userAgent.includes('win')) {
    return 'windows';
  } else if (userAgent.includes('linux')) {
    return 'linux';
  }
  return 'windows'; // Default to Windows shortcuts
}

// Get correct keyboard shortcuts based on OS
function getShortcuts(os) {
  switch (os) {
    case 'mac':
      return {
        video: { key: 'e', metaKey: true }, // Cmd+E
        audio: { key: 'd', metaKey: true }   // Cmd+D
      };
    case 'windows':
    case 'linux':
    default:
      return {
        video: { key: 'e', ctrlKey: true }, // Ctrl+E
        audio: { key: 'd', ctrlKey: true }  // Ctrl+D
      };
  }
}

// Store original getUserMedia function
const originalGetUserMedia = navigator.mediaDevices.getUserMedia;

// Current settings
let currentSettings = {
  camera: 'block',
  microphone: 'block',
  blockingMethod: 'permissions'
};

// Method isolation - ensure only one method is active
let activeMethod = null;

// Override getUserMedia based on user settings
async function overrideGetUserMedia(constraints) {
  // Only block if using permission-based method and user wants to block
  // Keyboard method should NOT interfere with getUserMedia at all
  if (currentSettings.blockingMethod === 'permissions') {
    const shouldBlockVideo = constraints.video && currentSettings.camera === 'block';
    const shouldBlockAudio = constraints.audio && currentSettings.microphone === 'block';
    
    if (shouldBlockVideo || shouldBlockAudio) {
      console.log('🚫 Blocked camera/mic request by Meet Default Off (permissions method):', { 
        video: shouldBlockVideo, 
        audio: shouldBlockAudio 
      });
      return Promise.reject(new DOMException('Blocked by Meet Default Off extension'));
    }
  }
  
  // For keyboard method, always allow getUserMedia - we'll control via keyboard shortcuts
  console.log('✅ Allowing getUserMedia request (keyboard method or permissions allow)');
  return originalGetUserMedia.call(navigator.mediaDevices, constraints);
}

// Apply the override
navigator.mediaDevices.getUserMedia = overrideGetUserMedia;

// Update current settings
function updateSettings(camera, microphone, blockingMethod) {
  currentSettings = { camera, microphone, blockingMethod };
  console.log('🔄 Settings updated in content script:', currentSettings);
}

// Debounce function to prevent rapid repeated executions
let permissionSettingsTimeout = null;
let lastPermissionSettings = null;

// Check if Google Meet is showing a permission dialog
function isPermissionDialogOpen() {
  // Look for common Google Meet permission dialog elements
  const dialogSelectors = [
    '[role="dialog"]',
    '.dialog',
    '[aria-modal="true"]',
    '[data-dialog]',
    '.permission-dialog',
    '[aria-label*="camera"]',
    '[aria-label*="microphone"]'
  ];
  
  for (const selector of dialogSelectors) {
    const dialog = document.querySelector(selector);
    if (dialog && dialog.offsetParent !== null) {
      return true;
    }
  }
  
  return false;
}

// Apply permission-based settings (enable/disable camera and mic)
function applyPermissionSettings(camera, microphone) {
  // Method isolation - only run if this is the active method
  if (activeMethod && activeMethod !== 'permissions') {
    console.log('🔐 Skipping permission settings - keyboard method is active');
    return;
  }
  activeMethod = 'permissions';
  
  const os = detectOS();
  const shortcuts = getShortcuts(os);
  
  // Debounce: if same settings are being applied, skip
  const currentSettings = `${camera}-${microphone}`;
  if (lastPermissionSettings === currentSettings) {
    console.log('🔐 Skipping duplicate permission settings:', { camera, microphone });
    return;
  }
  lastPermissionSettings = currentSettings;
  
  // Clear any existing timeout
  if (permissionSettingsTimeout) {
    clearTimeout(permissionSettingsTimeout);
  }
  
  console.log(`🔐 Applying permission settings:`, { camera, microphone });
  
  // Single execution with proper timing
  permissionSettingsTimeout = setTimeout(() => {
    try {
      // Check if Google Meet is showing a permission dialog - if so, don't interfere
      if (isPermissionDialogOpen()) {
        console.log('🚫 Google Meet permission dialog is open, skipping auto-enable to avoid interference');
        return;
      }
      
      // Only try to enable if user wants to allow camera/mic
      if (camera === 'allow' || microphone === 'allow') {
        // Method 1: Try to find and click Google Meet buttons (more conservative)
        const enableCameraAndMicButtons = () => {
          // Look for camera button (video toggle) - more specific selectors
          if (camera === 'allow') {
            const cameraButton = document.querySelector('[aria-label*="Turn on camera"]:not([aria-label*="Turn off camera"])');
            if (cameraButton && cameraButton.offsetParent !== null) { // Check if visible
              cameraButton.click();
              console.log('📹 Clicked camera button to enable');
            }
          }
          
          // Look for microphone button (audio toggle) - more specific selectors
          if (microphone === 'allow') {
            const micButton = document.querySelector('[aria-label*="Turn on microphone"]:not([aria-label*="Turn off microphone"])');
            if (micButton && micButton.offsetParent !== null) { // Check if visible
              micButton.click();
              console.log('🎤 Clicked microphone button to enable');
            }
          }
        };
        
        // Only use button clicking for permissions method - no keyboard shortcuts
        // Keyboard shortcuts are handled separately by the keyboard method
        enableCameraAndMicButtons();
      }
      
    } catch (error) {
      console.error('❌ Error applying permission settings:', error);
    }
  }, 500); // Reduced delay for faster response
}

// Immediate version for user-initiated changes (no delay)
function applyPermissionSettingsImmediate(camera, microphone) {
  // Method isolation - only run if this is the active method
  if (activeMethod && activeMethod !== 'permissions') {
    console.log('🔐 Skipping permission settings - keyboard method is active');
    return;
  }
  activeMethod = 'permissions';
  
  console.log(`🔐 Applying permission settings immediately:`, { camera, microphone });
  
  try {
    // Check if Google Meet is showing a permission dialog - if so, don't interfere
    if (isPermissionDialogOpen()) {
      console.log('🚫 Google Meet permission dialog is open, skipping auto-enable to avoid interference');
      return;
    }
    
    // Only try to enable if user wants to allow camera/mic
    if (camera === 'allow' || microphone === 'allow') {
      // Look for camera button (video toggle) - more specific selectors
      if (camera === 'allow') {
        const cameraButton = document.querySelector('[aria-label*="Turn on camera"]:not([aria-label*="Turn off camera"])');
        if (cameraButton && cameraButton.offsetParent !== null) { // Check if visible
          cameraButton.click();
          console.log('📹 Clicked camera button to enable (immediate)');
        }
      }
      
      // Look for microphone button (audio toggle) - more specific selectors
      if (microphone === 'allow') {
        const micButton = document.querySelector('[aria-label*="Turn on microphone"]:not([aria-label*="Turn off microphone"])');
        if (micButton && micButton.offsetParent !== null) { // Check if visible
          micButton.click();
          console.log('🎤 Clicked microphone button to enable (immediate)');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying permission settings immediately:', error);
  }
}

// Debounce for keyboard settings
let keyboardSettingsTimeout = null;
let lastKeyboardSettings = null;

// Detect current camera and microphone state in Google Meet (improved)
function detectCurrentMediaState() {
  const state = { camera: 'unknown', microphone: 'unknown' };
  
  try {
    console.log('🔍 Detecting media state in Google Meet...');
    
    // Look for camera button state with multiple selectors
    const cameraSelectors = [
      '[aria-label*="Turn off camera"]',
      '[aria-label*="Turn on camera"]', 
      '[data-is-muted="true"]',
      '[data-is-muted="false"]',
      '[jsname="BOHaEe"]',
      'button[aria-label*="camera"]',
      'button[aria-label*="video"]'
    ];
    
    for (const selector of cameraSelectors) {
      const cameraButton = document.querySelector(selector);
      if (cameraButton) {
        const ariaLabel = cameraButton.getAttribute('aria-label') || '';
        const dataMuted = cameraButton.getAttribute('data-is-muted');
        const isPressed = cameraButton.getAttribute('aria-pressed');
        
        console.log(`📹 Found camera button:`, { ariaLabel, dataMuted, isPressed });
        
        if (ariaLabel.includes('Turn off camera') || dataMuted === 'false' || isPressed === 'true') {
          state.camera = 'on';
          break;
        } else if (ariaLabel.includes('Turn on camera') || dataMuted === 'true' || isPressed === 'false') {
          state.camera = 'off';
          break;
        }
      }
    }
    
    // Look for microphone button state with multiple selectors
    const micSelectors = [
      '[aria-label*="Turn off microphone"]',
      '[aria-label*="Turn on microphone"]',
      '[data-is-muted="true"]',
      '[data-is-muted="false"]',
      '[jsname="BOHaEe"]',
      'button[aria-label*="microphone"]',
      'button[aria-label*="audio"]'
    ];
    
    for (const selector of micSelectors) {
      const micButton = document.querySelector(selector);
      if (micButton) {
        const ariaLabel = micButton.getAttribute('aria-label') || '';
        const dataMuted = micButton.getAttribute('data-is-muted');
        const isPressed = micButton.getAttribute('aria-pressed');
        
        console.log(`🎤 Found mic button:`, { ariaLabel, dataMuted, isPressed });
        
        if (ariaLabel.includes('Turn off microphone') || dataMuted === 'false' || isPressed === 'true') {
          state.microphone = 'on';
          break;
        } else if (ariaLabel.includes('Turn on microphone') || dataMuted === 'true' || isPressed === 'false') {
          state.microphone = 'off';
          break;
        }
      }
    }
    
    // Additional fallback: look for visual indicators
    if (state.camera === 'unknown') {
      // Look for camera icon states
      const cameraIcon = document.querySelector('svg[aria-label*="camera"], svg[aria-label*="video"]');
      if (cameraIcon) {
        const iconPath = cameraIcon.querySelector('path');
        if (iconPath) {
          const pathData = iconPath.getAttribute('d') || '';
          // Google Meet uses different path data for on/off states
          if (pathData.includes('M12') || pathData.includes('M6')) {
            state.camera = 'off'; // Common pattern for "off" state
          } else {
            state.camera = 'on';
          }
        }
      }
    }
    
    if (state.microphone === 'unknown') {
      // Look for microphone icon states
      const micIcon = document.querySelector('svg[aria-label*="microphone"], svg[aria-label*="audio"]');
      if (micIcon) {
        const iconPath = micIcon.querySelector('path');
        if (iconPath) {
          const pathData = iconPath.getAttribute('d') || '';
          if (pathData.includes('M12') || pathData.includes('M6')) {
            state.microphone = 'off'; // Common pattern for "off" state
          } else {
            state.microphone = 'on';
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error detecting media state:', error);
  }
  
  console.log('🔍 Detected current media state:', state);
  return state;
}

// Send keyboard shortcut with improved targeting for Google Meet
function sendKeyboardShortcut(key, ctrlKey, metaKey, description) {
  try {
    console.log(`⌨️ Attempting to send ${description} shortcut:`, { key, ctrlKey, metaKey });
    
    // Create a more realistic keyboard event that Google Meet will recognize
    const createKeyboardEvent = (target) => {
      return new KeyboardEvent('keydown', {
        key: key,
        code: key === 'e' ? 'KeyE' : 'KeyD', // Add proper key code
        ctrlKey: ctrlKey || false,
        metaKey: metaKey || false,
        shiftKey: false,
        altKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
        isTrusted: false, // We'll try both trusted and non-trusted events
        charCode: 0,
        keyCode: key === 'e' ? 69 : 68, // Add keyCode for compatibility
        which: key === 'e' ? 69 : 68
      });
    };
    
    let successCount = 0;
    
    // Method 1: Dispatch to window with trusted event simulation
    try {
      const event1 = createKeyboardEvent(window);
      window.dispatchEvent(event1);
      successCount++;
      console.log(`✅ Dispatched ${description} to window`);
    } catch (e) {
      console.log(`❌ Failed to dispatch to window:`, e);
    }
    
    // Method 2: Dispatch to document
    try {
      const event2 = createKeyboardEvent(document);
      document.dispatchEvent(event2);
      successCount++;
      console.log(`✅ Dispatched ${description} to document`);
    } catch (e) {
      console.log(`❌ Failed to dispatch to document:`, e);
    }
    
    // Method 3: Dispatch to body element
    try {
      const event3 = createKeyboardEvent(document.body);
      document.body.dispatchEvent(event3);
      successCount++;
      console.log(`✅ Dispatched ${description} to body`);
    } catch (e) {
      console.log(`❌ Failed to dispatch to body:`, e);
    }
    
    // Method 4: Try to find Google Meet's main container and dispatch there
    try {
      const meetContainer = document.querySelector('[data-meeting-title], .crqnQb, [jsname="BOHaEe"]') || 
                           document.querySelector('body > div') ||
                           document.querySelector('#yDmH0d');
      if (meetContainer) {
        const event4 = createKeyboardEvent(meetContainer);
        meetContainer.dispatchEvent(event4);
        successCount++;
        console.log(`✅ Dispatched ${description} to Meet container`);
      }
    } catch (e) {
      console.log(`❌ Failed to dispatch to Meet container:`, e);
    }
    
    // Method 5: Try simulating a real user interaction
    try {
      // Focus on the document first
      document.body.focus();
      
      // Create and dispatch keydown
      const keydownEvent = createKeyboardEvent(document);
      document.dispatchEvent(keydownEvent);
      
      // Create and dispatch keyup
      const keyupEvent = new KeyboardEvent('keyup', {
        key: key,
        code: key === 'e' ? 'KeyE' : 'KeyD',
        ctrlKey: ctrlKey || false,
        metaKey: metaKey || false,
        shiftKey: false,
        altKey: false,
        bubbles: true,
        cancelable: true,
        composed: true
      });
      document.dispatchEvent(keyupEvent);
      
      successCount++;
      console.log(`✅ Dispatched ${description} keydown + keyup sequence`);
    } catch (e) {
      console.log(`❌ Failed keydown + keyup sequence:`, e);
    }
    
    console.log(`⌨️ Sent ${description} shortcut (${key}) - ${successCount} methods succeeded`);
    return successCount > 0;
  } catch (error) {
    console.error(`❌ Error sending ${description} shortcut:`, error);
    return false;
  }
}

// Apply keyboard shortcuts based on settings
function applyKeyboardSettings(camera, microphone) {
  // Method isolation - only run if this is the active method
  if (activeMethod && activeMethod !== 'keyboard') {
    console.log('⌨️ Skipping keyboard settings - permissions method is active');
    return;
  }
  activeMethod = 'keyboard';
  
  const os = detectOS();
  const shortcuts = getShortcuts(os);
  
  // Debounce: if same settings are being applied, skip
  const currentSettings = `${camera}-${microphone}`;
  if (lastKeyboardSettings === currentSettings) {
    console.log('⌨️ Skipping duplicate keyboard settings:', { camera, microphone });
    return;
  }
  lastKeyboardSettings = currentSettings;
  
  // Clear any existing timeout
  if (keyboardSettingsTimeout) {
    clearTimeout(keyboardSettingsTimeout);
  }
  
  console.log(`⌨️ Applying keyboard shortcuts for ${os}:`, { camera, microphone });
  
  // Single execution with proper timing
  keyboardSettingsTimeout = setTimeout(() => {
    try {
      // Detect current state
      const currentState = detectCurrentMediaState();
      
      // Apply camera setting
      const desiredCameraState = camera === 'allow' ? 'on' : 'off';
      if (currentState.camera !== desiredCameraState && currentState.camera !== 'unknown') {
        console.log(`📹 Camera state: ${currentState.camera} → ${desiredCameraState}`);
        const success = sendKeyboardShortcut(
          shortcuts.video.key,
          shortcuts.video.ctrlKey,
          shortcuts.video.metaKey,
          'video toggle'
        );
        
        // Retry if first attempt failed
        if (!success) {
          setTimeout(() => {
            sendKeyboardShortcut(
              shortcuts.video.key,
              shortcuts.video.ctrlKey,
              shortcuts.video.metaKey,
              'video toggle (retry)'
            );
          }, 200);
        }
      }
      
      // Apply microphone setting
      const desiredMicState = microphone === 'allow' ? 'on' : 'off';
      if (currentState.microphone !== desiredMicState && currentState.microphone !== 'unknown') {
        console.log(`🎤 Microphone state: ${currentState.microphone} → ${desiredMicState}`);
        const success = sendKeyboardShortcut(
          shortcuts.audio.key,
          shortcuts.audio.ctrlKey,
          shortcuts.audio.metaKey,
          'audio toggle'
        );
        
        // Retry if first attempt failed
        if (!success) {
          setTimeout(() => {
            sendKeyboardShortcut(
              shortcuts.audio.key,
              shortcuts.audio.ctrlKey,
              shortcuts.audio.metaKey,
              'audio toggle (retry)'
            );
          }, 200);
        }
      }
      
      // If we couldn't detect state, try toggling anyway (fallback)
      // For keyboard method, be more aggressive with fallbacks
      if (currentState.camera === 'unknown') {
        if (camera === 'block') {
          console.log('📹 Unknown camera state, sending toggle shortcut to turn OFF');
          sendKeyboardShortcut(
            shortcuts.video.key,
            shortcuts.video.ctrlKey,
            shortcuts.video.metaKey,
            'video toggle OFF (fallback)'
          );
        } else if (camera === 'allow') {
          console.log('📹 Unknown camera state, sending toggle shortcut to turn ON');
          sendKeyboardShortcut(
            shortcuts.video.key,
            shortcuts.video.ctrlKey,
            shortcuts.video.metaKey,
            'video toggle ON (fallback)'
          );
        }
      }
      
      if (currentState.microphone === 'unknown') {
        if (microphone === 'block') {
          console.log('🎤 Unknown microphone state, sending toggle shortcut to turn OFF');
          sendKeyboardShortcut(
            shortcuts.audio.key,
            shortcuts.audio.ctrlKey,
            shortcuts.audio.metaKey,
            'audio toggle OFF (fallback)'
          );
        } else if (microphone === 'allow') {
          console.log('🎤 Unknown microphone state, sending toggle shortcut to turn ON');
          sendKeyboardShortcut(
            shortcuts.audio.key,
            shortcuts.audio.ctrlKey,
            shortcuts.audio.metaKey,
            'audio toggle ON (fallback)'
          );
        }
      }
      
      // Additional fallback: Try direct button clicking if keyboard shortcuts fail
      setTimeout(() => {
        console.log('🔄 Checking if keyboard shortcuts worked, trying button clicking as fallback...');
        
        const newState = detectCurrentMediaState();
        const cameraStillNeedsToggle = (camera === 'allow' && newState.camera === 'off') || 
                                     (camera === 'block' && newState.camera === 'on');
        const micStillNeedsToggle = (microphone === 'allow' && newState.microphone === 'off') || 
                                  (microphone === 'block' && newState.microphone === 'on');
        
        if (cameraStillNeedsToggle) {
          console.log('📹 Keyboard shortcut didn\'t work for camera, trying button click');
          const cameraButton = document.querySelector('[aria-label*="Turn on camera"], [aria-label*="Turn off camera"]');
          if (cameraButton) {
            cameraButton.click();
            console.log('📹 Clicked camera button as fallback');
          }
        }
        
        if (micStillNeedsToggle) {
          console.log('🎤 Keyboard shortcut didn\'t work for microphone, trying button click');
          const micButton = document.querySelector('[aria-label*="Turn on microphone"], [aria-label*="Turn off microphone"]');
          if (micButton) {
            micButton.click();
            console.log('🎤 Clicked microphone button as fallback');
          }
        }
      }, 1000); // Reduced delay for faster fallback
      
    } catch (error) {
      console.error('❌ Error applying keyboard shortcuts:', error);
    }
  }, 500); // Reduced delay for faster response
}

// Immediate version for user-initiated changes (no delay)
function applyKeyboardSettingsImmediate(camera, microphone) {
  // Method isolation - only run if this is the active method
  if (activeMethod && activeMethod !== 'keyboard') {
    console.log('⌨️ Skipping keyboard settings - permissions method is active');
    return;
  }
  activeMethod = 'keyboard';
  
  const os = detectOS();
  const shortcuts = getShortcuts(os);
  
  console.log(`⌨️ Applying keyboard shortcuts immediately for ${os}:`, { camera, microphone });
  
  try {
    // Detect current state
    const currentState = detectCurrentMediaState();
    
    // Apply camera setting
    const desiredCameraState = camera === 'allow' ? 'on' : 'off';
    if (currentState.camera !== desiredCameraState && currentState.camera !== 'unknown') {
      console.log(`📹 Camera state: ${currentState.camera} → ${desiredCameraState} (immediate)`);
      sendKeyboardShortcut(
        shortcuts.video.key,
        shortcuts.video.ctrlKey,
        shortcuts.video.metaKey,
        'video toggle (immediate)'
      );
    }
    
    // Apply microphone setting
    const desiredMicState = microphone === 'allow' ? 'on' : 'off';
    if (currentState.microphone !== desiredMicState && currentState.microphone !== 'unknown') {
      console.log(`🎤 Microphone state: ${currentState.microphone} → ${desiredMicState} (immediate)`);
      sendKeyboardShortcut(
        shortcuts.audio.key,
        shortcuts.audio.ctrlKey,
        shortcuts.audio.metaKey,
        'audio toggle (immediate)'
      );
    }
    
    // If we couldn't detect state, try toggling anyway (fallback)
    if (currentState.camera === 'unknown') {
      if (camera === 'block') {
        console.log('📹 Unknown camera state, sending toggle shortcut to turn OFF (immediate)');
        sendKeyboardShortcut(
          shortcuts.video.key,
          shortcuts.video.ctrlKey,
          shortcuts.video.metaKey,
          'video toggle OFF (immediate fallback)'
        );
      } else if (camera === 'allow') {
        console.log('📹 Unknown camera state, sending toggle shortcut to turn ON (immediate)');
        sendKeyboardShortcut(
          shortcuts.video.key,
          shortcuts.video.ctrlKey,
          shortcuts.video.metaKey,
          'video toggle ON (immediate fallback)'
        );
      }
    }
    
    if (currentState.microphone === 'unknown') {
      if (microphone === 'block') {
        console.log('🎤 Unknown microphone state, sending toggle shortcut to turn OFF (immediate)');
        sendKeyboardShortcut(
          shortcuts.audio.key,
          shortcuts.audio.ctrlKey,
          shortcuts.audio.metaKey,
          'audio toggle OFF (immediate fallback)'
        );
      } else if (microphone === 'allow') {
        console.log('🎤 Unknown microphone state, sending toggle shortcut to turn ON (immediate)');
        sendKeyboardShortcut(
          shortcuts.audio.key,
          shortcuts.audio.ctrlKey,
          shortcuts.audio.metaKey,
          'audio toggle ON (immediate fallback)'
        );
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying keyboard shortcuts immediately:', error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyKeyboardSettings') {
    console.log('📨 Received keyboard settings:', message);
    updateSettings(message.camera, message.microphone, 'keyboard');
    // Apply immediately for user-initiated changes
    applyKeyboardSettingsImmediate(message.camera, message.microphone);
    sendResponse({ success: true });
  } else if (message.action === 'applyPermissionSettings') {
    console.log('📨 Received permission settings:', message);
    updateSettings(message.camera, message.microphone, 'permissions');
    // Apply immediately for user-initiated changes
    applyPermissionSettingsImmediate(message.camera, message.microphone);
    sendResponse({ success: true });
  }
});

// Auto-apply settings when page loads (with debouncing)
let pageLoadTimeout = null;
let hasAppliedSettings = false;

window.addEventListener('load', async () => {
  // Prevent multiple executions
  if (hasAppliedSettings) {
    console.log('🔄 Settings already applied on page load, skipping');
    return;
  }
  
  // Clear any existing timeout
  if (pageLoadTimeout) {
    clearTimeout(pageLoadTimeout);
  }
  
  pageLoadTimeout = setTimeout(async () => {
    try {
      const result = await chrome.storage.sync.get({
        camera: 'block',
        microphone: 'block',
        blockingMethod: 'permissions'
      });
      
      // Update current settings
      updateSettings(result.camera, result.microphone, result.blockingMethod);
      
      if (result.blockingMethod === 'keyboard') {
        console.log('🔄 Auto-applying keyboard settings on page load');
        applyKeyboardSettings(result.camera, result.microphone);
      } else {
        console.log('🔄 Auto-applying permission settings on page load');
        applyPermissionSettings(result.camera, result.microphone);
      }
      
      hasAppliedSettings = true;
    } catch (error) {
      console.error('❌ Error auto-applying settings:', error);
    }
  }, 1000); // Reduced delay for faster page load response
});

console.log('✅ Meet Default Off content script ready');

