const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid-mute')
        .setDescription('Server-mutet alle in einem Voice-Channel (außer Ausnahmen)')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers | PermissionFlagsBits.MoveMembers)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Der Voice-Channel')
                .setRequired(true)
                .addChannelTypes(2)) // Voice Channel
        .addRoleOption(option =>
            option
                .setName('ausnahme-rolle')
                .setDescription('Rolle, die nicht gemutet wird (z. B. Raid-Leitung)')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('ausnahme1')
                .setDescription('User, der nicht gemutet wird')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('ausnahme2')
                .setDescription('User, der nicht gemutet wird')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('ausnahme3')
                .setDescription('User, der nicht gemutet wird')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const voiceChannel = interaction.options.getChannel('channel');
        const ausnahmeRolle = interaction.options.getRole('ausnahme-rolle');
        const ausnahme1 = interaction.options.getUser('ausnahme1');
        const ausnahme2 = interaction.options.getUser('ausnahme2');
        const ausnahme3 = interaction.options.getUser('ausnahme3');

        const ausnahmen = new Set();
        if (ausnahme1) ausnahmen.add(ausnahme1.id);
        if (ausnahme2) ausnahmen.add(ausnahme2.id);
        if (ausnahme3) ausnahmen.add(ausnahme3.id);

        if (voiceChannel.type !== 2) {
            return interaction.editReply({ content: 'Bitte einen Voice-Channel auswählen!' });
        }

        const membersToMute = voiceChannel.members.filter(member => {
            if (ausnahmen.has(member.id)) return false;
            if (ausnahmeRolle && member.roles.cache.has(ausnahmeRolle.id)) return false;
            return true;
        });

        if (membersToMute.size === 0) {
            return interaction.editReply({ content: 'Niemand zum Muten – alle sind ausgenommen oder Channel leer.' });
        }

        let success = 0;
        let failed = 0;

        for (const member of membersToMute.values()) {
            try {
                await member.voice.setMute(true, `Raid-Mute von ${interaction.user.tag}`);
                success++;
            } catch (error) {
                console.error(`Konnte ${member.user.tag} nicht muten:`, error);
                failed++;
            }
        }

        await interaction.editReply({
            content: `✅ **${success}** Mitglieder in **${voiceChannel.name}** gemutet.\n` +
                     (failed > 0 ? `⚠️ **${failed}** fehlgeschlagen (Rechte fehlen?).` : '')
        });
    },
};
