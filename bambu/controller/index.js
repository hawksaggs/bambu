const csvToJson = require('csvtojson');
const path = require('path');

const elasticSearchService = require('../service/elasticSearch');

module.exports = {
    indexDocument: (req, res) => {
        csvToJson()
            .fromFile(path.resolve('../data/data.csv'))
            .then((data) => {
                return elasticSearchService.bulkIndex('person', 'investor', data);
            })
            .then(function () {
                return res.status(200).send({
                    error: false,
                    message: 'Importing complete'
                });
            })
            .catch(function (err) {
                return res.status(400).send({
                    error: true,
                    message: 'Some error occured'
                });
            });
    },
    /**
     * Search document based on query parameter
     */
    searchDocument: (req, res) => {
        let results = elasticSearchService.searchDocument(req.query, function (err, data) {
            if (err) {
                return res.status(400).send({
                    error: true,
                    message: 'Some error occured'
                });
            }
            let responseData = [];
            if (data) {
                data.data.forEach(d => {
                    let resData = d._source;
                    resData['score'] = d._score / (data.maxScore > 0 ? data.maxScore : 1);
                    responseData.push(resData);
                });
            }
            return res.status(200).send({
                error: false,
                data: responseData
            });
        });
    }

}