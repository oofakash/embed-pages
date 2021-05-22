const { token } = require(`../config/config.json`);
const { Client, MessageEmbed } = require(`discord.js`);
const EmbedPages = require(`../source/index`);
const client = new Client();

client.once(`ready`, () => console.log(`Logged in as: ${client.user.tag} <${client.user.id}>`));

client.on(`message`, async (message) => {
    if (message.content.startsWith(`embed`)) {

        const embedR = new MessageEmbed().setColor(`RED`).setDescription(`Red Embed`);
        const embedB = new MessageEmbed().setColor(`BLUE`).setDescription(`Blue Embed`);
        const embedG = new MessageEmbed().setColor(`GREEN`).setDescription(`Green Embed`);

        const pages = [
            embedR, 
            embedB, 
            embedG
        ];

        const embedPages = new EmbedPages({ 
            pages: pages, 
            channel: message.channel, 
            options: (user) => user.id === message.author.id,
            duration: 1000 * 60,
            pageCounter: true,
        });

        embedPages.createPages();
    }
});

client.login(token);