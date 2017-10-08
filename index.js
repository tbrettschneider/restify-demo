let restify = require('restify'),
    osmosis = require('osmosis'),
    bunyan = require('bunyan'),
    log = bunyan.createLogger({
        name: 'audit',
        stream: process.stdout
    }),
    server = restify.createServer({handleUncaughtExceptions: true});

server.on('after', restify.plugins.auditLogger({
    log: log,
    event: 'after',
    server: server
}));

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.bodyParser({requestBodyOnGet: true}));
server.use(restify.plugins.jsonp());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.authorizationParser());

server.post('/scraper', (req, res, next) => {
    log.info('handle incoming request');
    let reqBody = JSON.parse(req.body);
    osmosis
        .get(reqBody.url)
        .set({
            title: 'title',
            description: 'meta[name="description"]@content',
            queryResults: osmosis.set(reqBody.selectors)
        })
        .then(function(context, data, next, done) {
            if (reqBody.opengraph) {
                log.info('get opengraph data');
            }
            next(context, data);
        })
        .then(function(context, data, next, done) {
            data.url = context.request.href;
            res.send(data);
            done();
        })
        .log(log);
});

server.listen(8080, function() {
    log.info('%s listening at %s', server.name, server.url)
});

/*
if (opengraph) {
    osmosis.data({
        'opengraph': osmosis.set({
            'og:url': 'meta[property="og:url"]@content',
            'og:type': 'meta[property="og:type"]@content',
            'og:title': 'meta[property="og:title"]@content',
            'og:site_name': 'meta[property="og:site_name"]@content',
            'og:description': 'meta[property="og:description"]@content',
            'og:images': osmosis.set([
                {
                    'og:image': 'meta[property"og:image"]@content',
                    'og:image:type': 'meta[property="og:image:type"]@content',
                    'og:image:width': 'meta[property="og:image:width"]@content',
                    'og:image:height': 'meta[property="og:image:height"]@content'
                }
            ])
        })
    })
}
*/