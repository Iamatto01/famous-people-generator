// Wikipedia API integration
async function fetchPersonData(personName) {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(personName)}`
      );
      const data = await response.json();
      
      return {
        name: data.title,
        bio: data.extract,
        image: data.thumbnail?.source || 'placeholder.jpg',
        quote: "Famous quote placeholder" // Wikipedia doesn't provide quotes directly
      };
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  // Gemini API integration remains unchanged
  async function askGemini() {
    const question = document.getElementById('ai-question').value;
    const responseElement = document.getElementById('ai-response');
    
    responseElement.textContent = 'Thinking...';
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: question
            }]
          }]
        })
      });
  
      const data = await response.json();
      responseElement.textContent = data.candidates[0].content.parts[0].text;
    } catch (error) {
      responseElement.textContent = 'Error fetching response';
      console.error('Error:', error);
    }
  }
  
  // --- NEW: Use Wikidata SPARQL to fetch a random human with an image and Wikipedia article --- //
  async function fetchRandomFamousPerson() {
    const query = `
      SELECT ?person ?personLabel ?image ?article WHERE {
        ?person wdt:P31 wd:Q5.
        ?person wdt:P18 ?image.
        ?article schema:about ?person;
                 schema:inLanguage "en";
                 schema:isPartOf [ wikibase:wikiGroup "wikipedia" ].
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      ORDER BY RAND()
      LIMIT 1
    `;
    const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
    try {
      const response = await fetch(url);
      const data = await response.json();
      const bindings = data.results.bindings;
      if (bindings.length === 0) {
        throw new Error('No famous person found.');
      }
      const personData = bindings[0];
      // Extract the Wikipedia article URL and pull out the page title.
      // Example article URL: "https://en.wikipedia.org/wiki/Albert_Einstein"
      const articleUrl = personData.article.value;
      const title = articleUrl.substring(articleUrl.lastIndexOf('/wiki/') + 6);
      // Fetch detailed summary data from Wikipedia.
      const summaryData = await fetchPersonData(title);
      // Overwrite the image with the one from Wikidata (if available).
      summaryData.image = personData.image.value || summaryData.image;
      return summaryData;
    } catch (error) {
      console.error('Error fetching random famous person:', error);
    }
  }
  
  // Function to generate one random person card
  async function generateRandomPersonCard() {
    const container = document.getElementById('people-container');
    // Clear previous content if you want one card at a time:
    container.innerHTML = '';
    
    const data = await fetchRandomFamousPerson();
    if (!data) {
      container.innerHTML = '<p>Error fetching person data. Please try again.</p>';
      return;
    }
    
    // Create and populate the card element
    const card = document.createElement('div');
    card.className = 'person-card';
    card.innerHTML = `
      <img src="${data.image}" alt="${data.name}" class="person-image">
      <div class="card-content">
        <h2>${data.name}</h2>
        <p class="quote">${data.quote}</p>
        <p class="bio">${data.bio}</p>
      </div>
    `;
    
    container.appendChild(card);
  }
  
  // Listen for clicks on the "Generate Random Person" button
  document.getElementById('generate-random-btn').addEventListener('click', generateRandomPersonCard);
  
  // Initialize with one random card on page load
  generateRandomPersonCard();
  