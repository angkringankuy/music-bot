const { Client, Util, MessageEmbed } = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
require("dotenv").config();
require("./server.js");

const bot = new Client({
    disableMentions: "all"
});

const PREFIX = process.env.PREFIX;
const youtube = new YouTube(process.env.YTAPI_KEY);
const queue = new Map();

bot.on("warn", console.warn);
bot.on("error", console.error);
bot.on("ready", () => console.log(`[READY] ${bot.user.tag} has been successfully booted up!`));
bot.on("shardDisconnect", (event, id) => console.log(`[SHARD] Shard ${id} disconnected (${event.code}) ${event}, trying to reconnect...`));
bot.on("shardReconnecting", (id) => console.log(`[SHARD] Shard ${id} reconnecting...`));

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.split(" ");
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
    const serverQueue = queue.get(message.guild.id);

    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "help" || command === "cmd") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor(bot.user.tag, bot.user.displayAvatarURL())
            .setDescription(`
__**Command list**__
> \`Penting (sebelum memakai bot thomas)\` > **\`ketik/copy kirim di Text Channel anda (pastikan owner server anda yang melakukan ini) -> [;prefix l] <- L kecil itu jangan sampai salah!\`**
-----------------------------------------------------
> \`cara cek ping\` > **\`ketik [lping]untuk all roles\`**
> \`cara req gambar anime\` > **\`ketik [lanime]untuk all roles\`**
> \`cara req gambar kucing\` > **\`ketik [lkucing]untuk all roles\`**
> \`cara cek trafik virus corona (negara)\` > **\`ketik [lcorona(negara)]untuk all roles\`**
-------------------------------------------------------
>  \`Cara req Lagu\` = **\`diawali l (prefix l)  <- \`** ->join Server Discord luxury (https://discord.gg/K474SRt) <-
> \`play\` -> **\`play atau singkatan -> (p) [title/url(judul/link)]\`**
> \`search\` -> **\`search atau singkatan -> (sc) [title(judul)]\`**
> \`skip\` -> **\`melewatkan music\`**
> \`stop\` -> **\`menyelesaikan dan menyelesainkan music (Bot Akan Disconect)\`**
> \`pause\` -> **\`memberhentikan music sementara dan bisa di -> resume\`**
> \`resume\` -> **\`menjalankan atau memutar kembali music ketika di -> pause\`**
> \`nowplaying\` -> **\`nowplaying atau singkatan (np) menditeksi lagu yang sedang di putar\`**
> \`queue\` -> **\`menditeksi list lagu yang sudah di request oleh anda\`**
> \`volume\` -> **\`menditeksi suara/volume bot\`**
> \`lyrics\` -> **\`memutar music dengan URL lyrics penting -> (Cantumkan nama dan judul music agar lebih detail) (beta)\`**
\`**
> \`🇮🇩\`, \`🇮🇩\`, \`🇮🇩\``)
            .setFooter("♛Thomas♛ (Luxury BOT)™", "");
        message.channel.send(helpembed);
    }
    if (command === "play" || command === "lyrics" || command === "p" || command === "ly") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("Maaf, kamu harus masuk ke voice channel dulu agar bisa play musik🔊");
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send("maaf, saya tidak bisa **`CONNECT`** karena tidak disetujui ☠☠");
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send("maaf, saya tidak bisa **`SPEAK`** karena tidak disetujui ☠☠");
        }
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send(`✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    var video = await youtube.getVideoByID(videos[0].id);
                    if (!video) return message.channel.send("🆘  **|**  I could not obtain any search results");
                } catch (err) {
                    console.error(err);
                    return message.channel.send("🆘  **|**  I could not obtain any search results");
                }
            }
            return handleVideo(video, message, voiceChannel);
        }
    }
    if (command === "search" || command === "sc") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("I'm sorry, but you need to be in a voice channel to play a music!");
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send("Sorry, but I need a **`CONNECT`** permission to proceed!");
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send("Sorry, but I need a **`SPEAK`** permission to proceed!");
        }
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send(`✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    let embedPlay = new MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor("Search results", message.author.displayAvatarURL())
                        .setDescription(`${videos.map(video2 => `**\`${++index}\`  |**  ${video2.title}`).join("\n")}`)
                        .setFooter("Please choose one of the following 10 results, this embed will auto-deleted in 15 seconds");
                    // eslint-disable-next-line max-depth
                    message.channel.send(embedPlay).then(m => m.delete({
                        timeout: 15000
                    }))
                    try {
                        var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                            max: 1,
                            time: 15000,
                            errors: ["time"]
                        });
                    } catch (err) {
                        console.error(err);
                        return message.channel.send("The song selection time has expired in 15 seconds, the request has been canceled.");
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return message.channel.send("🆘  **|**  I could not obtain any search results");
                }
            }
            response.delete();
            return handleVideo(video, message, voiceChannel);
        }

    } else if (command === "skip") {
        if (!message.member.voice.channel) return message.channel.send("I'm sorry, but you need to be in a voice channel to skip a music!");
        if (!serverQueue) return message.channel.send("There is nothing playing that I could skip for you");
        serverQueue.connection.dispatcher.end("[runCmd] Skip command has been used");
        return message.channel.send("⏭️  **|**  oke baik, kita ke music selanjutnya🎶");

    } else if (command === "stop") {
        if (!message.member.voice.channel) return message.channel.send("I'm sorry but you need to be in a voice channel to play music!");
        if (!serverQueue) return message.channel.send("There is nothing playing that I could stop for you");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end("[runCmd] Stop command has been used");
        return message.channel.send("⏹️  **|**  Deleting queues and leaving voice channel...");

    } else if (command === "volume" || command === "vol") {
        if (!message.member.voice.channel) return message.channel.send("HEY!!, kamu harus masuk ke channel kalo mau manggil aku🔥🔥");
        if (!serverQueue) return message.channel.send("Tidak ada lagu yang di putar🔊🔊 ");
        if (!args[1]) return message.channel.send(`The current volume is: **\`${serverQueue.volume}%\`**`);
        if (isNaN(args[1]) || args[1] > 100) return message.channel.send("Volume only can be set in a range of **\`1\`** - **\`100\`**");
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolume(args[1] / 100);
        return message.channel.send(`I set the volume to: **\`${args[1]}%\`**`);

    } else if (command === "nowplaying" || command === "np") {
        if (!serverQueue) return message.channel.send("🔥lagunya sedang diputar hey ⚠");
        return message.channel.send(`🎶  **|**  Now Playing: **\`${serverQueue.songs[0].title}\`**`);
      


    } else if (command === "queue" || command === "q") {
        if (!serverQueue) return message.channel.send("⚠⚠ antrian ngga ditermukan coy ⚠⚠");
        let embedQueue = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Song queue", message.author.displayAvatarURL())
            .setDescription(`${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}`)
            .setFooter(`• Now Playing: ${serverQueue.songs[0].title}`);
        return message.channel.send(embedQueue);

    } else if (command === "pause") {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send("⏸  **|** № 🔊 musicnya diberhentikan sementara✔ ");
        }
        return message.channel.send("✔ Tidak ada yang akan di hentikan✘✘");

    } else if (command === "resume") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.channel.send("▶  **|** 🔊🔊 music berjalan kembali😊 ✔️");
        }
        return message.channel.send("gaada music yang mau dilanjutkan 😭 ");
    } else if (command === "loop") {
        if (serverQueue) {
            serverQueue.loop = !serverQueue.loop;
            return message.channel.send(`🔁  **|**  Loop is **\`${serverQueue.loop === true ? "enabled" : "disabled"}\`**`);
        };
        return message.channel.send("gaada music yang mau diputar kemabali 🎧🎧");
    }
});

async function handleVideo(video, message, voiceChannel, playlist = false) {
    const serverQueue = queue.get(message.guild.id);
    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 100,
            playing: true,
            loop: false
        };
        queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`[ERROR] I could not join the voice channel, because: ${error}`);
            queue.delete(message.guild.id);
            return message.channel.send(`I could not join the voice channel, because: **\`${error}\`**`);
        }
    } else {
        serverQueue.songs.push(song);
        if (playlist) return;
        else return message.channel.send(`✅  **|**  **\`${song.title}\`** music sudah dimasukan ke antrian, dan akan diplay setelah lagu ini 👌 ✔`);
    }
    return;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        return queue.delete(guild.id);
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolume(serverQueue.volume / 100);

    serverQueue.textChannel.send({
        embed: {
            color: "BLUE",
            description: `🎶  **|**  Gua setelin musik lo: **\`${song.title}\`**`
        }
    });
}

//lyrick

bot.login(process.env.BOT_TOKEN);
