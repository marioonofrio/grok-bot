async function generateGrokReply(messages) {
    try {
        const response = await axios.post(
            `${GROK_API_BASE_URL}/chat/completions`,
            { messages },
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