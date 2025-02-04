console.log('This is the background page.');
console.log('Put the background scripts here.');

// Function to analyze text and create word frequency distribution
function analyzeText(text) {
  try {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Split into words
    const words = text.split(/\s+/);
    
    // Count frequencies
    const wordCount = {};
    words.forEach(word => {
      if (word) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Convert to array and sort by frequency
    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a);

    // Get top 100 words for the distribution
    const topWords = sortedWords.slice(0, 100);
    const frequencies = topWords.map(([, count]) => count);
    
    // Calculate Zipf's law accuracy
    const zipfAccuracy = calculateZipfAccuracy(frequencies);

    return {
      frequencies: frequencies,
      words: topWords.map(([word]) => word),
      zipfAccuracy: zipfAccuracy
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    return null;
  }
}

function calculateZipfAccuracy(frequencies) {
  try {
    // Get the first frequency (highest) as our baseline
    const f1 = frequencies[0];
    
    // Calculate expected frequencies according to Zipf's law
    const expectedFreqs = frequencies.map((_, i) => f1 / (i + 1));
    
    // Calculate correlation coefficient between actual and expected frequencies
    const n = frequencies.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      const x = Math.log(frequencies[i]);
      const y = Math.log(expectedFreqs[i]);
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    // Convert to percentage and ensure it's between 0-100
    const accuracy = Math.min(100, Math.max(0, correlation * 100));
    
    return Math.round(accuracy);
  } catch (error) {
    console.error('Error calculating Zipf accuracy:', error);
    return null;
  }
}

// Listen for content script installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ZiphsLive extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    try {
      const wordStats = analyzeText(request.text);
      if (!wordStats || !wordStats.frequencies.length) {
        sendResponse({ error: 'Failed to analyze text' });
      } else {
        sendResponse({ wordStats });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error.message });
    }
  }
  return true;
});

console.log('ZiphsLive background script loaded');
