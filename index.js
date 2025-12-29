const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Token aus Environment Variable laden (sicher für Hosting wie Render.com)
const token = process.env.token;
if (!token) {
    console.error('FEHLER: Bot-Token fehlt! Bitte in den Environment Variables "token" setzen.');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] // VoiceStates für Mute/Unmute nötig!
});

client.commands = new Collection();

// Pfad zum commands-Ordner
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Command geladen: /${command.data.name} aus ${filePath}`);
        } else {
            console.log(`[WARNING] Command bei ${filePath} fehlt "data" oder "execute".`);
        }
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Bot ist bereit! Eingeloggt als ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Kein Command gefunden: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Fehler beim Ausführen eines Commands:', error);

        const errorMessage = { content: 'Es ist ein Fehler beim Ausführen des Commands aufgetreten!', ephemeral: true };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Bot starten
client.login(token);
