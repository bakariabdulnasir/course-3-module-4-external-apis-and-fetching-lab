// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area=";

// Add event listener to the button to trigger fetch on click (only if element exists)
const fetchButton = document.getElementById('fetch-button');
if (fetchButton) {
  fetchButton.addEventListener('click', handleFetch);
}

// Main function to handle the fetch request
async function handleFetch() {
    // Move DOM element queries inside the function
    const stateInput = document.getElementById('state-input');
    const alertsDisplay = document.getElementById('alerts-display');
    const errorMessage = document.getElementById('error-message');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (!stateInput) return; // Prevent errors if input is missing

    const state = stateInput.value.trim().toUpperCase(); // Get and clean the input
    
    // BONUS: Input validation - ensure it's exactly 2 uppercase letters
    if (!isValidStateAbbr(state)) {
        displayError('Please enter a valid 2-letter state abbreviation (e.g., NY).', errorMessage);
        return; // Stop if invalid
    }
    
    // BONUS: Show loading spinner while fetching
    showLoadingSpinner(loadingSpinner);
    
    try {
        // Fetch the data
        const data = await fetchAlerts(state);
        
        // Display the alerts
        displayAlerts(data, alertsDisplay);
        
        // Clear any previous error
        clearError(errorMessage);
        
        // Clear the input field after success
        stateInput.value = '';
    } catch (error) {
        // Handle errors (network, API, etc.)
        displayError(error.message, errorMessage);
    } finally {
        // BONUS: Hide loading spinner after fetch completes
        hideLoadingSpinner(loadingSpinner);
    }
}

// BONUS: Function to validate state abbreviation (must be 2 uppercase letters)
function isValidStateAbbr(state) {
    const stateRegex = /^[A-Z]{2}$/; // Regex for exactly 2 uppercase letters
    return stateRegex.test(state);
}

// Function to fetch alerts from the API
async function fetchAlerts(state) {
    const response = await fetch(`${weatherApi}${state}`); // Build full URL
    
    if (!response.ok) {
        // Throw an error if the response isn't successful (e.g., invalid state or network issue)
        throw new Error(`Failed to fetch weather alerts for ${state}. Please check the state abbreviation and try again.`);
    }
    
    const data = await response.json();
    return data; // Return the JSON data
}

// Function to display the alerts
function displayAlerts(data, alertsDisplay) {
    if (!alertsDisplay) return; // Prevent errors if display is missing

    // Clear any previous display content
    alertsDisplay.innerHTML = '';
    
    // Create and display the summary message (e.g., "Current watches, warnings, and advisories for Minnesota: 11")
    const summary = document.createElement('h2');
    summary.textContent = `${data.title}: ${data.features.length}`;
    alertsDisplay.appendChild(summary);
    
    // If there are alerts, create a list of headlines
    if (data.features.length > 0) {
        const alertList = document.createElement('ul');
        data.features.forEach(feature => {
            const alertItem = document.createElement('li');
            alertItem.className = 'alert-item'; // For styling
            alertItem.textContent = feature.properties.headline; // Headline from each alert
            alertList.appendChild(alertItem);
        });
        alertsDisplay.appendChild(alertList);
    } else {
        // Handle case with no alerts
        const noAlerts = document.createElement('p');
        noAlerts.textContent = 'No active weather alerts for this state.';
        alertsDisplay.appendChild(noAlerts);
    }
}

// Function to display error messages (BONUS: with styling)
function displayError(message, errorMessage) {
    if (!errorMessage) return; // Prevent errors if error div is missing

    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden'); // Show by removing "hidden" class
    errorMessage.classList.add('error'); // Add CSS class for styling
}

// Function to clear error messages
function clearError(errorMessage) {
    if (!errorMessage) return; // Prevent errors if error div is missing

    errorMessage.textContent = '';
    errorMessage.classList.add('hidden'); // Hide by adding "hidden" class
    errorMessage.classList.remove('error'); // Remove CSS class
}

// BONUS: Functions for loading spinner
function showLoadingSpinner(loadingSpinner) {
    if (!loadingSpinner) return; // Prevent errors if spinner is missing

    loadingSpinner.style.display = 'block';
}

function hideLoadingSpinner(loadingSpinner) {
    if (!loadingSpinner) return; // Prevent errors if spinner is missing

    loadingSpinner.style.display = 'none';
}

// Export functions for testing
module.exports = { handleFetch, displayAlerts, displayError, clearError, isValidStateAbbr, fetchAlerts };