require('dotenv').config();

module.exports = {
    tenantId: process.env.TENANT_ID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    targetEmail: process.env.TARGET_EMAIL,
    scope: process.env.GRAPH_SCOPE || 'https://graph.microsoft.com/.default',
    checkInterval: (process.env.CHECK_INTERVAL_MINUTES || 15) * 60 * 1000
};