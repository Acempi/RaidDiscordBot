const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid-protokoll')
        .setDescription('Erstellt ein Raid-Protokoll (Formular)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Optional: Nur für bestimmte Rollen/User

    async execute(interaction) {
        // Modal erstellen
        const modal = new ModalBuilder()
            .setCustomId('raid_protokoll_modal')
            .setTitle('Raid-Protokoll erstellen');

        // Alle Felder als Text-Inputs
        const werInput = new TextInputBuilder()
            .setCustomId('wer')
            .setLabel('Wer: (z. B. Namen der Teilnehmer oder Leitung)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const wannInput = new TextInputBuilder()
            .setCustomId('wann')
            .setLabel('Wann: (Datum und Uhrzeit des Raids)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const zielInput = new TextInputBuilder()
            .setCustomId('ziel')
            .setLabel('Welches Ziel?: (Boss, Gebiet etc.)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const zusammenfassungInput = new TextInputBuilder()
            .setCustomId('zusammenfassung')
            .setLabel('Zusammenfassung: (Was ist passiert? Ziel erreicht?)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const problematikenInput = new TextInputBuilder()
            .setCustomId('problematiken')
            .setLabel('Problematiken: (Wipes, Fehler, Lag etc.)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const notizenInput = new TextInputBuilder()
            .setCustomId('notizen')
            .setLabel('Notizen: (Sonstiges, Lob, Verbesserungsvorschläge)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const cooldownInput = new TextInputBuilder()
            .setCustomId('cooldown')
            .setLabel('Cooldown bis: (Uhrzeit + 1 Stunde)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Action Rows hinzufügen
        modal.addComponents(
            new ActionRowBuilder().addComponents(werInput),
            new ActionRowBuilder().addComponents(wannInput),
            new ActionRowBuilder().addComponents(zielInput),
            new ActionRowBuilder().addComponents(zusammenfassungInput),
            new ActionRowBuilder().addComponents(problematikenInput),
            new ActionRowBuilder().addComponents(notizenInput),
            new ActionRowBuilder().addComponents(cooldownInput)
        );

        // Modal anzeigen
        await interaction.showModal(modal);
    },
};

