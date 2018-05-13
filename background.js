
/**
 * Toggle window type between normal and popup.
 * 
 * @param {number} windowId Target window
 * @param {boolean=} toPopup Override to be popup
 */
function togglePopup(windowId, toPopup) {
	chrome.windows.get(windowId, {
		populate: true,
	}, (window) => {
		const isPopup = (window.type === 'normal');
		if (typeof toPopup === 'undefined') {
			// State not defined, so toggle it to opposite
			// of current state.
			toPopup = !isPopup;
		} else if (toPopup == isPopup) {
			// No change in window type.
			return;	
		}
	
		// Separate all the tabs to different windows
		// and apply the window type.
		window.tabs.forEach((tab) => {
			chrome.windows.create({
				tabId: tab.id,
				type: toPopup ? 'popup' : 'normal',
			});
		});
	});
}

// Make popup windows from tabs of a window with a tab
// that have finished loading a website.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (
		changeInfo.status !== 'loading' ||
		tab.url === 'chrome://newtab/'
	) return;
	
	togglePopup(tab.windowId, true);
});

// Listen for toggle-popup command which is usually
// fired with a keyboard shortcut.
chrome.commands.onCommand.addListener((command) => {
	if (command !== 'toggle-popup') return;

	chrome.windows.getCurrent((window) => {
		if (window) {
			togglePopup(window.id);
		}
	});
});