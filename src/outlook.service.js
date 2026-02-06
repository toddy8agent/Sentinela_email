const https = require('https');
const authService = require('./auth.service');
const config = require('./config');

class OutlookService {
    async request(method, endpoint, data = null) {
        const token = await authService.getToken();
        
        // Garante que o endpoint esteja codificado corretamente
        const path = `/v1.0/users/${config.targetEmail}${endpoint}`;
        // Encode URI Component não é ideal para path completo, melhor usar URL object se fosse url completa,
        // mas aqui o problema é provavel na query string passada em getUnreadMessages.
        // Vamos deixar o encode para quem chama ou usar encodeURI aqui.
        
        const options = {
            hostname: 'graph.microsoft.com',
            path: encodeURI(path), // Fix: Encode path to handle spaces/$ etc
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(body ? JSON.parse(body) : {});
                        } catch (e) {
                            resolve(body);
                        }
                    } else {
                        reject({ status: res.statusCode, body });
                    }
                });
            });

            req.on('error', reject);
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }

    async getUnreadMessages() {
        // Busca apenas não lidos, ordenados por data
        // Importante: encodeURI na chamada ou no request method.
        // O $filter e outros parâmetros do OData tem espaços e $ que o Node reclama.
        const query = '?$filter=isRead eq false&$orderby=receivedDateTime DESC&$top=20';
        const response = await this.request('GET', `/messages${query}`);
        return response.value || [];
    }

    async markAsRead(messageId) {
        await this.request('PATCH', `/messages/${messageId}`, { isRead: true });
    }
    
    async moveMessage(messageId, destinationId) {
         await this.request('POST', `/messages/${messageId}/move`, { destinationId });
    }

    async deleteMessage(messageId) {
        // Na API Graph, DELETE move para "Itens Excluídos" (Soft Delete)
        await this.request('DELETE', `/messages/${messageId}`);
    }
}

module.exports = new OutlookService();