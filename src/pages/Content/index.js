// Function to get all visible text from the page
function getPageText() {
  try {
    // First try to get the main article content
    const articleContent = document.querySelector('article, [role="main"], .article-content, .post-content');
    
    // Get all paragraphs and headings from either the article or the whole document
    const container = articleContent || document;
    const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, .post-content');
    
    let text = '';
    textElements.forEach(element => {
      // Skip if element is hidden or part of navigation/comments
      if (element.closest('nav, header, footer, .comments, .sidebar, script, style')) {
        return;
      }
      
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return;
      }
      
      text += ' ' + element.textContent;
    });

    // Clean and normalize the text
    text = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')  // Keep only letters and spaces
      .replace(/\s+/g, ' ')       // Normalize spaces
      .trim();

    // Split into words and filter
    const words = text.split(' ').filter(word => {
      // Only keep words that are:
      // - 2 or more characters
      // - Not in our stopwords list
      // - Not too long to be real words
      if (word.length < 2 || word.length > 20) return false;

      const stopwords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
      ]);

      return !stopwords.has(word);
    });

    console.log(`Found ${words.length} meaningful words`);
    return words.join(' ');
  } catch (error) {
    console.error('Error getting page text:', error);
    return '';
  }
}

// Initialize message listener when the script loads
const initialize = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getWordStats') {
      try {
        const pageText = getPageText();
        if (!pageText) {
          sendResponse({ error: 'No readable text found on page' });
          return true;
        }

        // Send text to background script for analysis
        chrome.runtime.sendMessage(
          { action: 'analyzeText', text: pageText },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Runtime error:', chrome.runtime.lastError);
              sendResponse({ error: 'Failed to analyze text' });
            } else {
              sendResponse(response);
            }
          }
        );
        return true;
      } catch (error) {
        console.error('Content script error:', error);
        sendResponse({ error: error.message });
        return true;
      }
    }
  });

  console.log('ZiphsLive content script initialized');
};

// Initialize immediately
initialize();
