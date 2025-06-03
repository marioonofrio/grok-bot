const { Client, GatewayIntentBits } = require('discord.js');
const { generateGrokReply } = require('./grokApi');
const { discordToken } = require('./config');

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

    if (shouldReply) {
        if (!prompt) {
            message.reply('You mentioned me! Please provide a prompt.');
        } else {
            try {
                const reply = await generateGrokReply(prompt);
                // Discord message limit is 2000 characters
                if (reply.length <= 2000) {
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