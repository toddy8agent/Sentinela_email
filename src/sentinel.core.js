const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../state.json');

class SentinelLogic {
    constructor() {
        this.loadState();
    }

    loadState() {
        try {
            if (fs.existsSync(STATE_FILE)) {
                this.processedIds = JSON.parse(fs.readFileSync(STATE_FILE)).processedIds || [];
            } else {
                this.processedIds = [];
            }
        } catch (e) {
            this.processedIds = [];
        }
    }

    saveState() {
        // Mantém apenas os últimos 1000 IDs para não crescer infinitamente
        if (this.processedIds.length > 1000) {
            this.processedIds = this.processedIds.slice(0, 1000);
        }
        fs.writeFileSync(STATE_FILE, JSON.stringify({ processedIds: this.processedIds }, null, 2));
    }

    isProcessed(id) {
        return this.processedIds.includes(id);
    }

    markProcessed(id) {
        this.processedIds.unshift(id);
        this.saveState();
    }

    analyze(message) {
        const from = message.from?.emailAddress?.name || "Desconhecido";
        const address = message.from?.emailAddress?.address?.toLowerCase() || "";
        const subject = message.subject || "(Sem Assunto)";
        const preview = message.bodyPreview || "";

        let category = 'INBOX';
        let action = 'NOTIFY'; // NOTIFY, IGNORE, ARCHIVE

        // Regras de Classificação
        if (address.includes('inter.co') || subject.includes('Pix') || from.includes('Salles')) {
            category = 'FINANCEIRO';
            action = 'LOG_ONLY';
        } 
        else if (
            address.includes('naoresponda') || 
            address.includes('noreply') || 
            subject.includes('Propaganda') ||
            from.includes('Wine') ||
            from.includes('Livelo') ||
            from.includes('Zuk') ||
            from.includes('EconoBlog')
        ) {
            category = 'MARKETING';
            action = 'IGNORE';
        }
        else if (from.includes('Angélica') || from.includes('HTMED') || subject.includes('Urgente')) {
            category = 'VIP';
            action = 'NOTIFY_URGENT';
        }

        return {
            id: message.id,
            from,
            subject,
            preview,
            category,
            action
        };
    }
}

module.exports = new SentinelLogic();