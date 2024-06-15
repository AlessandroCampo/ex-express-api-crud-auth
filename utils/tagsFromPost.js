const axios = require('axios');
require('dotenv').config();

const tagsFromPost = async (postContent) => {
    let foundTags = [];
    const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/text/topic_extraction",
        headers: {
            authorization: "Bearer " + process.env.EDEN_AI_KEY,
        },
        data: {
            providers: "openai",
            text: postContent,
            autodetect_language: true,
        },
    };
    try {
        const response = await axios.request(options);
        if (response && response.data && response.data.openai && response.data.openai.items) {
            foundTags = response.data.openai.items
                .filter(item => item.importance > 0.6)
                .map(item => item.category);
            console.log(foundTags); // Log the extracted tags
        } else {
            console.log('No relevant items found in the response.');
        }
        return foundTags;
    } catch (err) {
        console.error('API call error:', err.message);
        return [];
    }
};

module.exports = tagsFromPost
