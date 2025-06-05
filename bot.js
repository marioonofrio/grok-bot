const { Client, GatewayIntentBits } = require('discord.js');
const { generateGrokReply } = require('./grokApi');
const { discordToken } = require('./config');

// In-memory history: { channelId: [ { role, content } ] }
const messageHistories = {};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    let shouldReply = false;
    let prompt = '';

    // 1. If the bot is mentioned
    if (message.mentions.has(client.user)) {
        prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
        shouldReply = true;
    }
    // 2. If the message is a reply to the bot
    else if (message.reference) {
        try {
            const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
            if (referencedMessage.author.id === client.user.id) {
                prompt = message.content.trim();
                shouldReply = true;
            }
        } catch (err) {
            // Could not fetch referenced message, ignore
        }
    }

    // --- Conversation history logic ---
    // Only keep history for channels where the bot is active
    if (!messageHistories[message.channel.id]) {
        messageHistories[message.channel.id] = [];
    }
    // Add the user's message to history
    if (shouldReply && prompt) {
        messageHistories[message.channel.id].push({ role: 'user', content: prompt });
    }

    if (shouldReply) {
        if (!prompt) {
            message.reply('You mentioned me! Please provide a prompt.');
        } else {
            try {
                // Use up to the last 10 messages for context
                const history = messageHistories[message.channel.id].slice(-10);

                const reply = await generateGrokReply(history);

                // Add the bot's reply to history
                messageHistories[message.channel.id].push({ role: 'assistant', content: reply });

                // Check if reply is a direct image URL
                const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
                const imageMatch = reply.match(imageRegex);

                if (imageMatch) {
                    await message.reply({
                        content: reply.replace(imageRegex, '').trim(),
                        embeds: [{
                            image: { url: imageMatch[1] }
                        }]
                    });
                } else if (reply.length <= 2000) {
                    message.reply(reply);
                } else {
                    for (let i = 0; i < reply.length; i += 2000) {
                        await message.reply(reply.slice(i, i + 2000));
                    }
                }
            } catch {
                message.reply('Failed to generate a reply from Grok.');
            }
        }
    }
});

client.login(discordToken);