const elasticSearch = require('elasticsearch');

const client = new elasticSearch.Client({
    host:process.env.ELASTICSEARCH_HOST,
    log:process.env.ELASTICSEARCH_LOG_LEVEL
});

module.exports = client;