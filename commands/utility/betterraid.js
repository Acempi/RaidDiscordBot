const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid-erstellen')
        .setDescription('Erstellt einen neuen Raid und pinged @everyone')
        
        // ZUERST alle erforderlichen Optionen
        .addUserOption(option =>
            option
                .setName('hauptleitung')
                .setDescription('Haupt-Raidleitung (erforderlich)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('startzeit')
                .setDescription('Uhrzeit des Raid-Starts (z. B. 20:00)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('ziel')
                .setDescription('Ziel des Raids (z. B. Bossname, Gebiet)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('datum')
                .setDescription('Datum des Raids (z. B. 01.01.2026)')
                .setRequired(true))
        
        // DANACH die optionalen Co-Leitungen
        .addUserOption(option =>
            option
                .setName('co1')
                .setDescription('Co-Leitung 1 (optional)')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('co2')
                .setDescription('Co-Leitung 2 (optional)')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('co3')
                .setDescription('Co-Leitung 3 (optional)')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('co4')
                .setDescription('Co-Leitung 4 (optional)')
                .setRequired(false)),

    async execute(interaction) {
        const hauptleitung = interaction.options.getUser('hauptleitung');
        const co1 = interaction.options.getUser('co1');
        const co2 = interaction.options.getUser('co2');
        const co3 = interaction.options.getUser('co3');
        const co4 = interaction.options.getUser('co4');

        const startzeit = interaction.options.getString('startzeit');
        const ziel = interaction.options.getString('ziel');
        const datum = interaction.options.getString('datum');

        // Alle Leitungen sammeln (nur die, die angegeben wurden)
        const leitungen = [hauptleitung];
        if (co1) leitungen.push(co1);
        if (co2) leitungen.push(co2);
        if (co3) leitungen.push(co3);
        if (co4) leitungen.push(co4);

        // Sichere Anzeige der User (verhindert "null")
        const leitungenText = leitungen.map(user => `${user}`).join(' • ');

        const embed = new EmbedBuilder()
            .setTitle('🗡️ NEUER RAID ANGEKÜNDIGT 🗡️')
            .setDescription('||@everyone||\nEin neuer Raid wurde erstellt! Meldet euch unten per Reaktion an.')
            .setColor('#FF4444')
            .addFields(
                { name: '📅 Datum', value: datum, inline: true },
                { name: '🕐 Startzeit', value: `${startzeit} Uhr`, inline: true },
                { name: '🎯 Ziel', value: ziel, inline: false },
                { name: leitungen.length === 1 ? '👤 Raid-Leitung' : '👥 Raid-Leitung', value: leitungenText, inline: false }
            )
            .addFields(
                { name: '✅ Anmeldung', value: ':green_square: = Dabei\n:yellow_square: = Vielleicht / Ersatz\n:red_square: = Abmelden', inline: false }
            )
            .addFields(
                { name: '📢 Regeln', value: 
                    '- PTS während des Raids aktiv\n' +
                    '- Nur Raid-Leitung + höchster CI-Rang dürfen sprechen (außer wichtige Meldungen)\n' +
                    '- Auf Befehle hören\n' +
                    '- Kein Chaos während Planung/Raid',
                inline: false }
            )
            .setFooter({ text: 'ℹ️ Die Raid-Leitung kann zusätzliche Regeln festlegen • Regelverstöße → Demote/Negativ' })
            .setTimestamp();

        try {
            const message = await interaction.reply({
                content: '||@everyone||',
                embeds: [embed],
                fetchReply: true
            });

            await message.react('🟩');
            await message.react('🟨');
            await message.react('🟥');

        } catch (err) {
            console.error("Fehler beim Erstellen des Raids:", err);
            await interaction.followUp({ content: 'Es ist ein Fehler aufgetreten!', ephemeral: true });
        }
    },
};
