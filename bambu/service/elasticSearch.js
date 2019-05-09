const elasticSearch = require('../helper/elasticsearch');

module.exports = {
    bulkIndex: (index, type, data) => {
        return new Promise((resolve, reject) => {
            let bulkData = [];
            let count = 1;
            data.forEach(element => {
                bulkData.push({
                    index: {
                        _index: index,
                        _type: type,
                        _id: count
                    }
                });

                bulkData.push(element);
                count++;
            });

            elasticSearch.bulk({
                body: bulkData
            })
                .then(response => {
                    let errorCount = 0;
                    response.items.forEach((item) => {
                        if (item.index && item.index.error) {
                            console.log(++errorCount, item.index.error);
                        }
                    });
                    console.log(
                        `Successfully indexed ${data.length - errorCount}
             out of ${data.length} items`
                    );

                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                })
        });
    },
    searchDocument: (data, cb) => {
        let queryString = [];
        Object.keys(data).forEach(key => {
            let q = { "match": { [key]: data[key] } };
            queryString.push(q);
        });

        console.log(queryString);
        let body = {
            size: 10,
            from: 0,
            query: {
                dis_max: {
                    queries: queryString
                }
            }
        };

        elasticSearch.search({
            index: 'person',
            body: body
        })
            .then(results => {
                cb(null, { maxScore: results.hits.max_score, data: results.hits.hits });
            })
            .catch(err => {
                console.log(err);
                cb(err);
            });
    }
}