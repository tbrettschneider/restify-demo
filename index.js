"use strict";

var restify = require('restify'),
    errors  = require('restify-errors'),
    osmosis = require('osmosis'),
    server = restify.createServer({handleUncaughtExceptions: true});

server.use(restify.plugins.bodyParser({
    requestBodyOnGet: true
}));

server.pre(function(req, res, next) {
    console.info('before route is determined!');
    return next();
});

server.use(function(req, res, next) {
    console.info('run for all routes!');
    return next();
});

server.post('/scraper', (req, res, next) => {
    handleRequest(req, res, next);
})

function handleRequest(req, res, next) {
    console.info('handle incoming request');

    var config = JSON.parse(req.body);
    var url = config.url;
    var selectors = config.selectors,
        opengraph = config.opengraph;
    osmosis
        .get(url)
        .set({
            title: 'title',
            description: 'meta[name="description"]@content',
            queryResults: osmosis.set(selectors),
            'opengraph': osmosis.set({
                'og:url': 'meta[property="og:url"]@content',
                'og:type': 'meta[property="og:type"]@content',
                'og:title': 'meta[property="og:title"]@content',
                'og:site_name': 'meta[property="og:site_name"]@content',
                'og:description': 'meta[property="og:description"]@content',
                'og:images': osmosis.set([
                    {
                        'og:image':'meta[property"og:image"]@content',
                        'og:image:type': 'meta[property="og:image:type"]@content',
                        'og:image:width': 'meta[property="og:image:width"]@content',
                        'og:image:height': 'meta[property="og:image:height"]@content'
                    }
                ])
            })
        })
        .data(function(result) {
            result.url = url;
            res.send(result);
            return next();
        })
}

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});