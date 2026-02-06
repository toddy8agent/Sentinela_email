const https = require('https');
const querystring = require('querystring');
const config = require('./config');

class AuthService {
    constructor() {
        this.token = null;
        this.tokenExpires = 0;
    }

    async getToken() {
        if (this.token && Date.now() < this.tokenExpires) {
            return this.token;
        }

        const postData = querystring.stringify({
            client_id: config.clientId,
            scope: config.scope,
            client_secret: config.clientSecret,
            grant_type: 'client_credentials'
        });

        const options = {
            hostname: 'login.microsoftonline.com',
            path: `/${config.tenantId}/oauth2/v2.0/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const data = JSON.parse(body);
                        this.token = data.access_token;
                        // Expira 1 minuto antes do real para segurança
                        this.tokenExpires = Date.now() + (data.expires_in * 1000) - 60000;
                        resolve(this.token);
                    } else {
                        reject(new Error(`Auth Failed: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
}

module.exports = new AuthService();