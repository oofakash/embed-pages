const { MessageEmbed } = require('discord.js');

/**
 * properties used to determine how to embed pages should be constructed.
 * @typedef {Object} PageProperties
 * @prop {Array} pages - An array of message embed that will be in the embed pages.
 * @prop {Discord.TextChannel} channel - The channel the embed pages will be sent.
 * @prop {Number} [duration=60000] - The length the reaction collector will last.
 * @prop {Array<Snowflake>|String<Snowflake>|Function} [options] - The options users to the embed pages.
 * @prop {Boolean} [pageCounter=false] - Whether or not to have the page counter on the embed footer.
 */

class EmbedPages {
    /**
     * created the embed pages.
     * @param {PageProperties} properties - properties for the embed pages. 
     */
    constructor({
        pages,
        channel,
        duration,
        options,
        pageCounter,
    } = {}) {
        /**
         * list of pages for the embed pages.
         * @type {Array<Discord.MessageEmbed>}
         */
        this.pages = pages;

        /**
         * channel where the embed will be sent.
         * @type {Discord.TextChannel}
         */
        this.channel = channel;

        /**
         * amount of time in ms for which the collector will work.
         * @type {Number}
         */
        this.duration = duration || 1000 * 60;

        /**
         * restrict the usage to specific users or group
         * @type {Array<Snowflake>|String<Snowflake>|Function}
         */
        this.options = options;

        /**
         * whether to show the current-page/total-pages in the footer.
         * @type {Boolean}
         */
        this.pageCounter = pageCounter ?? false;

        /**
         * current page number
         * @type {Number}
         */
        this.currentPageNumber = 0;
    }

    /**
     * creates the embed & sends it.
     */
    createPages() {
        if (!this.pages[0]) throw new Error(`Tried to create embed pages with no pages in the pages array.`);
        if (this.pageCounter) this.pages[0].setFooter(`Page: 1/${this.pages.length}`);
        this.channel.send({ embed: this.pages[0] }).then(msg => {
            this.msg = msg;
            msg.react(`⬅️`).then(msg.react(`➡️`)).then(msg.react(`❌`)).catch(() => null);
            const filter = (reaction, user) => {
                if (user.bot) return false;
                if (!this.options) return true;
                else if (this.options instanceof Function) return this.options(user);
                else if (Array.isArray(this.options) && this.options.includes(user.id)) return true;
                else if (typeof this.options === `string` && this.options === user.id) return true;
            };
            const collector = msg.createReactionCollector(filter, { time: this.duration });
            collector.on(`collect`, (reaction, user) => {
                reaction.users.remove(user.id);
                switch (reaction.emoji.name) {
                    case `➡️`:
                        return this.nextPage();
                    case `⬅️`:
                        return this.previousPage();
                    case `❌`:
                        return this.endEmbed();
                }
            });
            collector.on(`end`, () => {
                this.endEmbed();
            });
        });
    }

    /**
     * switches to next page (edits the embed to the next embed)
     */
    nextPage() {
        if (!this.msg) throw new Error(`Tried to go to next page but embed pages havn't been created yet.`);
        this.currentPageNumber++;
        if (this.currentPageNumber >= this.pages.length) this.currentPageNumber = 0;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageCounter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    /**
     * switches to previous page (edits the embed to the previous embed)
     */
    previousPage() {
        if (!this.msg) throw new Error(`Tried to go to previous page but embed pages havn't been created yet.`);
        this.currentPageNumber--;
        if (this.currentPageNumber < 0) this.currentPageNumber = this.pages.length - 1;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageCounter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    /**
     * inserts a page to the embed pages.
     * @param {Discord.MessageEmbed} embed - embed that is inserted to the embed pages.
     */
    insertPage(embed) {
        if (!this.msg) throw new Error(`Tried to insert page before embed pages have even been created.`);
        if (!(embed instanceof MessageEmbed)) throw new Error(`Inserting embed is not a instance of a message embed.`);
        this.pages.push(embed);
        const currentEmbed = this.pages[this.currentPageNumber];
        if (this.pageCounter) currentEmbed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: currentEmbed });
    }

    /**
     * removes a page from the embed pages.
     * @param {Number} pageNumber - the page index that is removed.
     */
    removePage(pageNumber) {
        if (!this.msg) throw new Error(`Tried to remove page before embed pages have even been created.`);
        if (pageNumber < 0 || pageNumber > this.pages.length - 1) throw new Error(`Removing of page does not exist.`);
        this.pages.splice(pageNumber, 1);
        if (this.pages.length === this.currentPageNumber) {
            this.currentPageNumber--;
            const embed = this.pages[this.currentPageNumber];
            if (!embed) return this.delete();
            if (this.pageCounter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
            this.msg.edit({ embed: embed });
        }
        else {
            const embed = this.pages[this.currentPageNumber];
            if (this.pageCounter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
            this.msg.edit({ embed: embed });
        }
    }

    /**
     * switches to the specific page provided.
     * @param {Number} pageNumber - the page index that is turned to.
     */
    flipToPage(pageNumber) {
        if (!this.msg) throw new Error(`Tried to turn to page before embed pages have even been created.`);
        if (pageNumber < 0 || pageNumber > this.pages.length - 1) throw new Error(`Turning page does not exist.`);
        this.currentPageNumber = pageNumber;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageCounter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    /**
     * removes/deletes the embed pages.
     */
    delete() {
        if (!this.msg) throw new Error(`Something went wrong, couldn't delete as embed was not created`);
        this.msg.delete().catch(() => null);
    }

    /**
     * Removes all the reactions & flags the embed as inactive 
     */
    endEmbed() {
        if (!this.msg) throw new Error(`Embed does not exist - cannot remove reactions.`);
        this.msg.reactions.removeAll().catch(() => null);
    }
}

module.exports = EmbedPages;
