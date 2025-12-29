const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid-unmute')
        .setDescription('Entmutet alle Mitglieder in einem Voice-Channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers | PermissionFlagsBits.MoveMembers)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Der Voice-Channel')
                .setRequired(true)
                .addChannelTypes(2)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const voiceChannel = interaction.options.getChannel('channel');

        if (voiceChannel.type !== 2) {
            return interaction.editReply({ content: 'Bitte einen Voice-Channel auswählen!' });
        }

        const members = voiceChannel.members;

        if (members.size === 0) {
            return interaction.editReply({ content: 'Der Channel ist leer.' });
        }

        let success = 0;
        let failed = 0;

        for (const member of members.values()) {
            try {
                await member.voice.setMute(false, `Raid-Unmute von ${interaction.user.tag}`);
                success++;
            } catch (error) {
                console.error(`Konnte ${member.user.tag} nicht entmuten:`, error);
                failed++;
            }
        }

        await interaction.editReply({
            content: `✅ **${success}** Mitglieder in **${voiceChannel.name}** entmutet.\n` +
                     (failed > 0 ? `⚠️ **${failed}** fehlgeschlagen.` : '')
        });
    },
};
