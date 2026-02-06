const outlook = require('./src/outlook.service');

async function main() {
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];

    try {
        switch (command) {
            case 'list':
                // Retorna JSON puro para eu (Toddy) ler
                const messages = await outlook.getUnreadMessages();
                console.log(JSON.stringify(messages, null, 2));
                break;

            case 'delete':
                if (!arg1) throw new Error('ID necessário');
                await outlook.deleteMessage(arg1);
                console.log(`🗑️ Deletado: ${arg1}`);
                break;

            case 'mark-read':
                if (!arg1) throw new Error('ID necessário');
                await outlook.markAsRead(arg1);
                console.log(`👁️ Marcado como lido: ${arg1}`);
                break;
            
            case 'move':
                if (!arg1 || !arg2) throw new Error('ID e FolderID necessários');
                await outlook.moveMessage(arg1, arg2);
                console.log(`📂 Movido: ${arg1} -> ${arg2}`);
                break;

            default:
                console.log('Comandos disponíveis: list, delete <id>, mark-read <id>, move <id> <folderId>');
        }
    } catch (e) {
        console.error('Erro:', e.message);
        process.exit(1);
    }
}

main();