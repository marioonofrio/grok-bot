const { Client, GatewayIntentBits } = require('discord.js');
const { generateGrokReply } = require('./grokApi');
const { discordToken } = require('./config');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const isMentioned = message.mentions.has(client.user);
    if (!isMentioned) return;

    let prompt = '';
    let context = [];

    try {
        // If message is a reply, walk up the thread to collect context
        if (message.reference?.messageId) {
            let currentMessage = await message.channel.messages.fetch(message.reference.messageId);
            while (currentMessage) {
                if (!currentMessage.author.bot) {
                    context.unshift(`${currentMessage.author.username}: ${currentMessage.content.trim()}`);
                }

                // Check if there's another message this one replied to
                if (currentMessage.reference?.messageId) {
                    currentMessage = await message.channel.messages.fetch(currentMessage.reference.messageId);
                } else {
                    break;
                }
            }
        }

        const cleanedPrompt = message.content.replace(`<@${client.user.id}>`, '').trim();
        context.push(`${message.author.username}: ${cleanedPrompt}`);

        prompt = context.join('\n');
    } catch (err) {
        console.error('Error building reply context thread:', err);
        prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    }

    if (!prompt.trim()) {
        return message.reply('You mentioned me! Please provide a prompt.');
    }

    try {
        const reply = await generateGrokReply(prompt);

        if (reply.length <= 2000) {
            await message.reply(reply);
        } else {
            for (let i = 0; i < reply.length; i += 2000) {
                await message.reply(reply.slice(i, i + 2000));
            }
        }
    } catch (err) {
        console.error('Grok error:', err);
        await message.reply('Failed to generate a reply from Grok.');
    }
});


client.login(discordToken);