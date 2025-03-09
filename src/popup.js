document.getElementById('generateButton').addEventListener('click', async () => {
    const prompt = document.getElementById('promptInput').value;
  
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        document.getElementById('response').textContent = data.error;
      } else {
        const subtasks = data.reply.join('\n');
        document.getElementById('response').textContent = subtasks;
  
        // Save the response to chrome.storage.sync
        chrome.storage.sync.set({ lastResponse: subtasks }, () => {
          console.log('Response saved to chrome.storage.sync');
        });
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('response').textContent = 'Failed to generate subtasks.';
    }
  });
  
  // Load the last saved response when the popup opens
  chrome.storage.sync.get('lastResponse', (data) => {
    if (data.lastResponse) {
      document.getElementById('response').textContent = data.lastResponse;
    }
  });