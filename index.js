const outlook = require('./src/outlook.service');
const sentinel = require('./src/sentinel.core');
const config = require('./src/config');

// Simple logging helper
function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function runCheck() {
    log('🤖 Sentinela: Iniciando varredura...');
    
    try {
        const messages = await outlook.getUnreadMessages();
        
        if (messages.length === 0) {
            log('Nenhum e-mail novo não lido.');
            return;
        }

        for (const msg of messages) {
            if (sentinel.isProcessed(msg.id)) continue;

            const analysis = sentinel.analyze(msg);
            
            // Marca como processado para não alertar de novo
            sentinel.markProcessed(msg.id);

            switch (analysis.action) {
                case 'NOTIFY_URGENT':
                    log(`🚨 ALERTA VIP: ${analysis.from} - ${analysis.subject}`);
                    // TODO: Integração WhatsApp
                    break;
                case 'NOTIFY':
                    log(`🔔 Novo E-mail: ${analysis.from} - ${analysis.subject}`);
                    break;
                case 'LOG_ONLY':
                    log(`💰 Financeiro (Arquivando): ${analysis.from} - ${analysis.subject}`);
                    await outlook.markAsRead(msg.id);
                    break;
                case 'IGNORE':
                    log(`🗑️ Deletando Spam/Mkt: ${analysis.from}`);
                    await outlook.deleteMessage(msg.id);
                    break;
            }
        }
    } catch (e) {
        console.error('Erro na execução do Sentinela:', e);
    }
}

// Se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--loop')) {
        log(`Iniciando loop de monitoramento a cada ${config.checkInterval / 60000} minutos.`);
        runCheck();
        setInterval(runCheck, config.checkInterval);
    } else {
        runCheck();
    }
}