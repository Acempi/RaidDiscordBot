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

// Haupt-Handler für Slash-Commands
client.on(Events.InteractionCreate, async interaction => {
    // 1. Slash-Commands
    if (interaction.isChatInputCommand()) {
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
    }

    // 2. Modal-Submit für Raid-Protokoll
    else if (interaction.isModalSubmit() && interaction.customId === 'raid_protokoll_modal') {
        await interaction.deferReply({ ephemeral: true }); // Nur der User sieht die Bestätigung

        const wer = interaction.fields.getTextInputValue('wer');
        const wann = interaction.fields.getTextInputValue('wann');
        const ziel = interaction.fields.getTextInputValue('ziel');
        const zusammenfassung = interaction.fields.getTextInputValue('zusammenfassung');
        const problematiken = interaction.fields.getTextInputValue('problematiken') || 'Keine';
        const notizen = interaction.fields.getTextInputValue('notizen') || 'Keine';
        const cooldown = interaction.fields.getTextInputValue('cooldown');

        // Deine Protokoll-Channel-ID
        const protokollChannelId = '1454507329591705730';

        const channel = interaction.guild.channels.cache.get(protokollChannelId);
        if (!channel) {
            return interaction.editReply({ content: '❌ Protokoll-Channel nicht gefunden! Admin informieren.' });
        }

        const { EmbedBuilder } = require('discord.js'); // EmbedBuilder hier laden (spart Speicher)

        const embed = new EmbedBuilder()
            .setTitle('📜 Raid-Protokoll')
            .setColor('#00AAFF')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: 'Wer', value: wer, inline: false },
                { name: 'Wann', value: wann, inline: true },
                { name: 'Ziel', value: ziel, inline: true },
                { name: 'Zusammenfassung', value: zusammenfassung, inline: false },
                { name: 'Problematiken', value: problematiken, inline: false },
                { name: 'Notizen', value: notizen, inline: false },
                { name: 'Cooldown bis', value: cooldown, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Erstellt von ${interaction.user.username}` });

        try {
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: '✅ Protokoll erfolgreich im Protokoll-Channel gepostet!' });
        } catch (error) {
            console.error('Fehler beim Posten des Protokolls:', error);
            await interaction.editReply({ content: '❌ Fehler beim Posten – Bot hat keine Rechte oder Channel-ID falsch?' });
        }
    }
});

// Bot starten
client.login(token);
