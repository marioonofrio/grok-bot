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

    if (message.mentions.has(client.user)) {
        // Remove all mentions (user, role, etc.) from the message content
        prompt = message.content.replace(/<@!?[0-9]+>|<@&[0-9]+>/g, '').trim();
        shouldReply = true;
    } else if (message.reference) {
        // Walk up the reply chain and collect all messages
        let chain = [];
        let currentMsg = message;
        try {
            let grokInChain = false;
            while (currentMsg && currentMsg.reference) {            chain.unshift(refMsg.content.trim());
                const refMsg = await currentMsg.channel.messages.fetch(currentMsg.reference.messageId);
                if (refMsg.author.id === client.user.id) {
                    grokInChain = true;
                }
                // Only include messages from users (not bots)
                chain.unshift(refMsg.content.trim());
                currentMsg = refMsg;
            }
            // Add the current message's content
            chain.push(message.content.trim());
            prompt = chain.join('\n');
            if (grokInChain) {
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
                if (reply.length <= 2000) {
                    message.reply(reply);
                } else {
                    for (let i = 0; i < reply.length; i += 2000) {
                        await message.reply(reply.slice(i, i + 2000));
                    }
                }
            } catch (err) {
                console.error('Grok error:', err);
                message.reply('Failed to generate a reply from Grok.');
            }
        }
    }
});

client.login(discordToken);