const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Lade Token aus Environment (wie in deiner index.js)
const token = process.env.token;
if (!token) {
    console.error('Token fehlt!');
    process.exit(1);
}

// Ersetze diese mit deinen echten Werten!
const clientId = '1454988979215798459';   // aus Discord Developer Portal > Deine App > General Information > Application ID
const guildId = '1454467039103291567';        // Rechtsklick auf deinen Server > "ID kopieren"

const commands = [];

// Genau wie in deiner index.js: Alle Commands aus Unterordnern laden
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNUNG] Command ${filePath} hat kein data oder execute`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`${commands.length} Commands werden registriert...`);

        // Das registriert die Commands NUR AUF DEINEM SERVER (schnell, erscheint sofort)
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('✅ Alle Commands erfolgreich registriert! In ein paar Sekunden/Minuten sollten sie in Discord erscheinen.');
    } catch (error) {
        console.error('❌ Fehler beim Registrieren:', error);
    }
})();
