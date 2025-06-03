const axios = require('axios');
const { grokApiToken } = require('./config');

const GROK_API_BASE_URL = 'https://api.x.ai/v1';

async function generateGrokReply(prompt) {
    try {
        const response = await axios.post(
            `${GROK_API_BASE_URL}/chat/completions`,
            {
                messages: [
                    { role: 'user', content: prompt }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${grokApiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        // Extract the assistant's reply from the response (OpenAI-style)
        if (
            response.data &&
            response.data.choices &&
            response.data.choices[0] &&
            response.data.choices[0].message &&
            response.data.choices[0].message.content
        ) {
            return response.data.choices[0].message.content;
        }
        return 'No reply from Grok.';
    } catch (error) {
        console.error('Error generating Grok reply:', error);
        throw error;
    }
}


module.exports = { generateGrokReply };