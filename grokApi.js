const axios = require('axios');
const { grokApiToken } = require('./config');

const GROK_API_BASE_URL = 'https://api.x.ai/v1';

async function generateGrokReply(prompt) {
    try {
        const response = await axios.post(
            `${GROK_API_BASE_URL}/chat/completions`,
            {
                model: "grok-3",
                messages: [
                    {
                        role: 'system',
                        content: `You are Grok, a clever and witty AI assistant inside a Discord server. 
You respond like a human who goes by the name Grok (user ID: vesperfungus820) when mentioned. 
Keep your tone fun, playful, and casual — you're part of the community.`
                    },
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