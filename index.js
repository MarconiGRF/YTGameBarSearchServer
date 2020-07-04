
/**
 * This file represents Youtube Game Bar Overlay's Search Server. It anonymously makes searches on YouTube 
 * by the given term using TimeForANinja's node-ytsr lib, parsing its results to the minimal useful JSON
 * which will be returned to YTGBO.
 *
 * @author: Marconi Gomes (marconi.gomes7@gmail.com)
 */

const ytsr = require('ytsr');
const winston = require('winston');
var YTGBss = require('express')();
var http = require('http').createServer(YTGBss);


/**
 * Creates a Logger instance.
 */
const logger = winston.createLogger({
  level: 'http',
  format: winston.format.prettyPrint(),
  transports: [
    new winston.transports.File({ filename: 'status.log' }),
    new winston.transports.Console()
  ]
});;


/**
 * Listens for connections on port 54522.
 */
http.listen(54522, () => {
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
 * Handles legacy GET requests on /search route.
 * It makes the search by the term available on the request parameters.
 *
 * We can expect the following results:
 * 200 OK - The search was sucessful. The result will be returned to requester.
 * 400 BAD REQUEST - The request body wasn't in the expected format. The status code is returned.
 * 500 INTERNAL SERVER ERROR - Something went wrong with search. The status code is returned.
 */
YTGBss.get('/search/:term', (request, response, next) => {
  logger.log({ timestamp: new Date().toUTCString(), level: 'http', message: 'Got LEGACY GET search request...' });

  if (request.params.term !== undefined) {
    handleLegacySearch(request.params.term).then(function (parsedResults) {
      logger.log({ level: 'info', message: 'Sucess.' })
      response.send(parsedResults);
    }).catch(function (errorData) {
      next({ message: '500 INTERNAL SERVER ERROR', details: errorData });
    });
  }
  else {
    next({ message: '400 BAD REQUEST', details: 'Missing or malfunct body.' });
  }
});


/**
 * Uses the specified error handler.
 */
YTGBss.use(errorHandler);

/**
 * Handles the errors provided by the server, answering them accordingly to the client.
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
 * Searchs for YouTube's videos and playlists results using node-ytsr lib.
 *
 * @param {string} term The term to search results for.
 */
function handleSearch(term) {
  return new Promise((resolve, reject) => {
    let finalResults = [];
    let pageRef = "https://www.youtube.com/results?search_query=" + term;

    var searchOptions = {
      limit: 10,
      nextpageRef: pageRef
    };

    doSearch(searchOptions).then(function (videoResults) {
      for (let videoResult of videoResults) {
        finalResults.push(videoResult);
      }

      resolve(finalResults);
    }).catch(function (errorData) {
      reject(errorData);
    });
  });
}


/**
 * Searchs for YouTube's videos results using node-ytsr lib.
 *
 * @param {string} term The term to search results for.
 */
function handleLegacySearch(term) {
  return new Promise((resolve, reject) => {
    let finalResults = [];
    let videoRef = "https://www.youtube.com/results?search_query=" + term + "&sp=EgIQAQ%253D%253D";

    var searchOptions = {
      limit: 5,
      nextpageRef: videoRef
    };

    doLegacySearch(searchOptions).then(function (videoResults) {
      for (let videoResult of videoResults) {
        finalResults.push(videoResult);
      }

      resolve(finalResults);
    }).catch(function (errorData) {
      reject(errorData);
    });
  });
}

/**
 * 
 * @param {*} searchOptions 
 */
function doSearch(searchOptions) {
  return new Promise(function (resolve, reject) {
    ytsr(null, searchOptions, function (err, searchResults) {
      if (err) {
        reject(err);
      };

      let parsedResults = parseResults(searchResults.items);
      resolve(parsedResults);
    });
  })
}


function doLegacySearch(searchOptions) {
  return new Promise(function (resolve, reject) {
    ytsr(null, searchOptions, function (err, searchResults) {
      if (err) {
        reject(err);
      };

      let parsedResults = parseLegacyResults(searchResults.items);
      resolve(parsedResults);
    });
  })
}


/**
 * Parses and returns the search results with necessary information used by YTGBO.
 *
 * @param {Array} results
 */
function parseResults(results) {
  var parsedResults = [];

  for (let result of results) {
    var parsed = {};

    if (result.type == "video" || result.type == "playlist") {
      parsed.mediaType = result.type;
      parsed.mediaTitle = result.title;
      parsed.channelTitle = result.author.name;
      parsed.mediaUrl = result.link;

      parsedResults.push(parsed);
    }
  }

  return parsedResults;
}


/**
 * Parses and returns the search results with necessary information used by YTGBOs Legacy Version.
 *
 * @param {Array} results
 */
function parseLegacyResults(results) {
  var parsedResults = [];

  for (let result of results) {
    var parsed = {};

    parsed.videoTitle = result.title;
    parsed.channelTitle = result.author.name;
    parsed.mediaUrl = result.link;

    parsedResults.push(parsed);
  }

  return parsedResults;
}