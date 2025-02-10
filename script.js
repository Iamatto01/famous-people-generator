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

// Gemini API integration
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

// Generate person cards
async function generatePersonCards() {
    const container = document.getElementById('people-container');
    const famousPeople = ['Albert_Einstein', 'Marie_Curie', 'Nelson_Mandela']; // Add more names
    
    for (const person of famousPeople) {
        const data = await fetchPersonData(person);
        
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
}

// Initialize
generatePersonCards();
