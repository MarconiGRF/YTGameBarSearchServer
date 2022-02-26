/**
 * This file represents YTGameBar Overlay's Search Server. It anonymously makes searches on the web
 * by the given term using TimeForANinja's node-ytsr lib, parsing its results to the minimal useful JSON
 * which will be returned to YTGBO.
 *
 * @author: Marconi Gomes (marconi.gomes7@gmail.com)
 */

const ytScraper = require('youtube-scrape/scraper')
const winston = require('winston');
const port = process.env.PORT || 3000;
var YTGBss = require('express')();
var http = require('http').createServer(YTGBss);


/**
 * Creates a Winston Logger instance.
 */
const logger = winston.createLogger({
    level: 'http',
    format: winston.format.prettyPrint(),
    transports: [
        new winston.transports.Console()
    ]
});


/**
 * Listens for connections on port 54522.
 */
http.listen(port, () => {
    logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Ready.' });
});


/**
 * Handles GET requests on /current/search route.
 * It makes the search by the term available on the request parameters.
 *
 * We can expect the following results:
 * 200 OK - The search was sucessful. The result will be returned to requester.
 * 400 BAD REQUEST - The request term wasn't found in the url. The status code is returned.
 * 500 INTERNAL SERVER ERROR - Something went wrong with search. The status code is returned.
 */
YTGBss.get('/current/search/:term', (request, response, next) => {
    logger.log({ timestamp: new Date().toUTCString(), level: 'http', message: 'Got GET search request...' });

    if (request.params.term !== undefined) {
        handleSearch(request.params.term).then(function (parsedResults) {
            logger.log({ level: 'info', message: 'Sucess.' })
            response.send(parsedResults);
        }).catch(function (errorData) {
            next({ message: '500 INTERNAL SERVER ERROR', details: errorData });
        });
    }
    else {
        next({ message: '400 BAD REQUEST', details: 'Missing request parameter.' });
    }
});


/**
 * Uses the specified error handler.
 */
YTGBss.use(errorHandler);

/**
 * Handles the errors provided by the server, answering them accordingly to the client.
 *
 * @param {*} error The error received from above layers.
 * @param {*} request The source request.
 * @param {*} response The response to be made.
 * @param {*} next The next function to be used.
 */
function errorHandler(error, request, response, next) {
    logger.log({ timestamp: new Date().toUTCString(), level: 'error', message: error.details })

    if (error.message.startsWith('500')) {
        response.status(500).send({ error: 'Internal Server Error!' })
    }
    else {
        response.status(400).send({ error: 'Bad request!' })
    }
}

/**
 * Parses and returns the search results with necessary information used by YTGBO new version.
 *
 * @param {Array} results
 */
function parseResults(results) {
    const parsedResults = [];

    results.forEach(result => {
        let parsed = {
            mediaType: result.content.type,
            mediaTitle: result.content.title,
            mediaUrl: result.content.url,
            thumbnail: result.content.thumbnail_src,
            channelTitle: result.uploader.username
        }
        parsedResults.push(parsed);
    })
    return parsedResults;
}

/**
 * Handles the search process by the given term.
 * It searchs asynchronously 5 video results and 3 playlist results, parsing and returning them
 * @param {*} term
 */
const handleSearch = async function(term) {
    const videoResults = handleVideoSearch(term).catch(errorData => { throw new Error(errorData) });
    const playlistResults = handlePlaylistSearch(term).catch(errorData => { throw new Error(errorData) });

    return Promise.all([videoResults, playlistResults]).then((results) => {
        return results[0].concat(results[1]);
    });
}

/**
 * Handles the video search for the given term, parses and returns the results.
 * @param {String} term - The term to be searched for video results.
 */
const handleVideoSearch = async function (term) {
    const searchResults = await ytScraper.youtube(term, 5, "video");

    return parseResults(searchResults.results);
}

/**
 * Handles the playlist search for the given term, parses and returns the results.
 * @param {String} term - The term to be searched for playlist results.
 */
const handlePlaylistSearch = async function (term) {
    const searchResults = await ytScraper.youtube(term, 3, "playlist");

    return parseResults(searchResults.results);
}