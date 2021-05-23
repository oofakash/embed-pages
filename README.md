# embed-pages
Package to create and navigate among embed pages using reactions.
Works with `<MessageEmbeds>` (discord.js v12) - might not work with `<RichEmbeds>`

Installation
```
npm install embed-pages
# OR
yarn add embed-pages
```

Example
```js
// get the messsage embed
const { MessageEmbed } = require('discord.js');
// get the embed-pages module
const EmbedPages = require('embed-pages');

// inside your run function..
async run(message, args) {

        // $optional, declare embed(s)
		let embedR = new MessageEmbed(), embedG = new MessageEmbed, embedB = new MessageEmbed();

        // create an array of embeds 
		const pages = [
			embedR, 
			embedG, 
			embedB
		];

        // define your embeds (simple color embeds)
		embedR.setColor('RED').setTitle('RED EMBED');
		embedG.setColor('GREEN').setTitle('GREEN EMBED');
		embedB.setColor('BLUE').setTitle('BLUE EMBED');

        // define embedpages with the properties, pages & channel are required.        
		const embedPages = new EmbedPages({
			pages: pages,
			channel: message.channel,
			duration: 1000 * 30,
			options: user => user.id === message.author.id,
            pageCounter: true
		});

        //create the embed pages and send it.
		embedPages.createPages();

	}

```
Preview of example code

![Preview](https://media.giphy.com/media/Gu3hF5JdqXoo6CvtkM/giphy.gif)

## Properties

| Property   | Type       | Info, `($)` marked are required. |
| ---------- | ---------- | ---------- |
| pages | Array\<MessageEmbeds> | Array of embeds for the embed pages. `($)` |
| channel | \<TextChannel> | Channel where the embed(s) are sent. `($)` |
| duration | Number | Time for which the reactions will work defaults to (1000 * 60ms) |
| options | Array\<Snowflake>Function | Limit how reactions work by using functions & methods |
| pageCounter | Boolean | Shows the `currentPage/totalPages` in the footer, default is false. |
------
## Methods

| Method | Parameters | Info |
| ------ | ------ | ------ |
| createPages() | NA | creates embed listens to reactions |
| nextPage() | NA | edits the embed to the following embed, switches to next embed |
| previousPage() | NA | edits the embed to previous embed, switch to previous embed |
| insertPage() | embed | adds/inserts a page in the embed-array (needs an embed) |
| removePage() | pageNum | removes a page from the embed-array (specify page number) |
| flipToPage() | pageNum | flips to a specified page |
| delete() | NA | deletes the entire embed-pagination |
| endEmbed() | NA | ends the embed by removing the reactions, runs when collector `ends` (timeout/user-reaction) |
------
