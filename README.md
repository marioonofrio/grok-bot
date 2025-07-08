# Grok Discord Bot

Grok is a conversational Discord bot powered by x.ai (Grok API). It responds when directly mentioned and remembers conversation context through reply chains. Built with discord.js and designed to act like a natural part of the community.

## Features

- Responds only when @mentioned
- Thread-based memory using reply chains
- Uses Grok-3 model from x.ai API

## Getting Started

To add Grok to your server, click the link below:

[Invite Grok to your Discord server](https://discord.com/oauth2/authorize?client_id=1377438933071429733)

Once Grok is added, you can @mention it in any channel and it will respond with helpful, witty replies based on the conversation context.

## Project Structure

```
grok-bot/
├── bot.js             # Main Discord bot logic
├── grokApi.js         # Grok API wrapper using axios
├── config.js          # Loads env variables
├── .env
├── .gitignore
└── README.md
```
