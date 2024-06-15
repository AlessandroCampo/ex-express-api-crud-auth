const axios = require('axios');
require('dotenv').config();

const topicFromText = async (text) => {
    const headers = {
        "X-TextRazor-Key": process.env.TEXTRAZOR_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-encoding": "gzip"
    };

    // Enhanced pre-process function
    // const preprocessText = (text) => {
    //     let processedText = text.toLowerCase();
    //     processedText = processedText.replace(/[^a-zA-Z0-9\s]/g, '');
    //     processedText = processedText.replace(/\s+/g, ' ').trim();
    //     return processedText;
    // };

    const processedText = text;

    const data = new URLSearchParams({
        text: processedText,
        extractors: 'topics,entities,phrases,words',
        classifiers: 'textrazor_mediatopics_2023Q1'
    });

    try {
        let response = await axios.post('https://api.textrazor.com', data, { headers });
        if (response.data && response.data.response) {
            const { topics, entities } = response.data.response;

            // Apply a confidence threshold
            const threshold = 0.8;
            const filteredTopics = (topics || []).filter(topic => topic.score >= threshold);

            // Enhanced entity filtering logic
            const getSpecificEntities = (entities) => {
                const specificTypes = ['MotorsportRacer', 'RacingDriver', 'FormulaOneRacer'];
                return entities.filter(entity => entity.type.some(type => specificTypes.includes(type)));
            };

            const specificEntities = getSpecificEntities(entities || []);

            if (specificEntities.length > 0) {
                console.log('Specific Entities:', specificEntities);
            } else {
                console.log('No specific entities found, falling back to generic entities');
                console.log('Generic Entities:', entities);
            }

            if (filteredTopics.length > 0) {
                console.log('Filtered Topics:', filteredTopics);
            } else {
                console.log('No significant topics found');
            }
        } else {
            console.log('No topics or entities found');
        }
    } catch (err) {
        console.error('API call error:', err);
    }
};

// Example usage
topicFromText('Charles  Leclerc wins  in  monaco');
