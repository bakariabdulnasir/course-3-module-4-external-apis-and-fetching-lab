/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
require('@testing-library/jest-dom');

// Import the functions directly (now that they're exported in index.js)
const { handleFetch } = require('../index.js');

describe('Weather Alerts App - Input clearing', () => {
  let container;
  let fetchMock;

  beforeEach(() => {
    // Set up fetch mock
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ title: "Weather Alerts", features: [] })
    });
    global.fetch = fetchMock;

    // Load the HTML
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    document.documentElement.innerHTML = html;
    container = document.body;

    // No need for jest.resetModules() or require('../index.js') here—functions are imported above
  });

  it('calls fetch with the correct state in the URL', async () => {
    const input = container.querySelector('#state-input'); // Direct query instead of @testing-library (simpler for tests)

    input.value = 'CA';

    // Call handleFetch directly (instead of button.click())
    await handleFetch();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://api.weather.gov/alerts/active?area=CA');
  });

  it('displays fetched alert data in the DOM after a successful fetch', async () => {
    const input = container.querySelector('#state-input');

    // Mock specific response for this test
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        title: "Weather Alerts",
        features: [
          { properties: { headline: "Flood warning in your area" } },
          { properties: { headline: "Tornado watch for the region" } }
        ]
      })
    });

    input.value = 'NY';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    const displayDiv = container.querySelector('#alerts-display');
    expect(displayDiv).toHaveTextContent('Weather Alerts: 2');
    expect(displayDiv).toHaveTextContent('Flood warning in your area');
    expect(displayDiv).toHaveTextContent('Tornado watch for the region');

    // Second part of the test (for MN)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        title: "Weather Alerts",
        features: [
          { properties: { headline: "Flood warning in your area" } },
          { properties: { headline: "Air quality alert in your area" } },
          { properties: { headline: "Severe thunderstorm warning in your area" } },
          { properties: { headline: "Tornado watch for the region" } }
        ]
      })
    });

    input.value = 'MN';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(displayDiv).toHaveTextContent('Weather Alerts: 4');
    expect(displayDiv).toHaveTextContent('Flood warning in your area');
    expect(displayDiv).toHaveTextContent('Air quality alert in your area');
    expect(displayDiv).toHaveTextContent('Severe thunderstorm warning in your area');
    expect(displayDiv).toHaveTextContent('Tornado watch for the region');
  });

  it('clears the input field after clicking fetch', async () => {
    const input = container.querySelector('#state-input');

    input.value = 'TX';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(input.value).toBe('');
  });

  it('displays an error message when fetch fails', async () => {
    const input = container.querySelector('#state-input');

    // Mock rejection
    fetchMock.mockRejectedValueOnce(new Error('Network failure'));

    input.value = 'ZZ';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    const errorDiv = container.querySelector('#error-message');
    expect(errorDiv).not.toHaveClass('hidden');
    expect(errorDiv).toHaveTextContent(/network failure/i);

    // Second rejection
    fetchMock.mockRejectedValueOnce(new Error('Other issue'));

    input.value = 'ZZ';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(errorDiv).not.toHaveClass('hidden');
    expect(errorDiv).toHaveTextContent(/other issue/i);
  });

  it('clears the error message after a successful fetch', async () => {
    const input = container.querySelector('#state-input');

    // First, simulate error
    fetchMock.mockRejectedValueOnce(new Error('Network issue'));

    input.value = 'ZZ';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    const errorDiv = container.querySelector('#error-message');
    expect(errorDiv).not.toHaveClass('hidden');
    expect(errorDiv).toHaveTextContent(/network issue/i);

    // Then, simulate success
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        title: "Weather Alerts",
        features: [
          { properties: { headline: "Heat advisory in your area" } }
        ]
      })
    });

    input.value = 'FL';
    await handleFetch();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(errorDiv).toHaveClass('hidden');
    expect(errorDiv.textContent).toBe('');
  });
});