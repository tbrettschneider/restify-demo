var restify = require('restify'),
    osmosis = require('osmosis'),
    server = restify.createServer();

server.use(restify.plugins.bodyParser({
    requestBodyOnGet: true
}));

server.post('/scraper', (req, res, next) => {
    var config = JSON.parse(req.body);
    var url = config.url;
    var selectors = config.selectors;
    osmosis
    .get(url)
    .set({
        title: 'title',
        description: 'meta[name="description"]@content',
        queryResults: osmosis.set(selectors)
    })
    .data(function(result) {
        result.url = url;
        res.json(result);
    });
});

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});