/**

 Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
 except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS"
 BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 License for the specific language governing permissions and limitations under the License.

 */

'use strict'

/**

 Backend API for elasticache-geospatial-public-bikes sample application.

 date: Jan 2017

 */

//----
const listSearchRadius      = process.env.SEARCH_RADIUS
const listSearchRadiusUnits = process.env.SEARCH_RADIUS_UNITS
const listResultCount       = process.env.RESULT_COUNT

//---- Shared Functions ----
const buildResponse = (statusCode, body) => {

  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  };

};


/**

 Retrieves all stations within specified distance of the passed coordinates.

 Sample request query string:

  latitude=41.8802596&longitude=-87.6346818

 */
module.exports.list = (event, context, callback) => {
  var coords  = event.queryStringParameters;

  if (! (coords.longitude || coords.latitude)) {
    callback(null, buildResponse( 400, { "message": "Missing required parameter: latitude / longitude" } ));
    return;
  }

  const redis  = require('redis');
  const client = redis.createClient({ host: process.env.ELASTICACHE_HOST,
                                      port: process.env.ELASTICACHE_PORT })
    client.on("error", (error) => { console.error('[ERROR] REDIS CONNECTION ERROR') });

    client.send_command('GEORADIUS',
      [ 'public-bikes:stations',
        coords.longitude,
        coords.latitude,
        listSearchRadius,
        listSearchRadiusUnits,
        'WITHDIST',
        'WITHCOORD',
        'COUNT',
        listResultCount ], (error, reply) => {
          client.quit();

          if (error) {
            console.error("[ERROR - checkins#create] DDB update: " + error);
            callback(null, buildResponse( 500, "Unable to find local stations" ));
            return;
          }

          var stations = reply.map( (r) => {
            return {
              name: r[0],
              distance: `${r[1]} ${listSearchRadiusUnits}`,
              coordinates: {
                latitude:  Number(r[2][1]),
                longitude: Number(r[2][0])
              } }
          });

          callback(null, buildResponse( 200, stations ));
        });
};

/**

 Retrieves listing of stations from public data sources and stores in
 DynamoDB.  A DynamoDB stream will populate the cache.

 */

//----
const getStationData = (url) => new Promise( (resolve, reject) => {
  const https   = require('https');
  const request = https.get(url, (response) => {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      reject(new Error("Could not load stations data, status code: " + response.statusCode));
    }

    const data = [];
    response.on( 'data', (chunk) => data.push(chunk) );
    response.on( 'end', () => {
      try {
        const json = JSON.parse(data.join(""));
        resolve(json);
      } catch (error) {
        reject(error)
      }
    });

  });

  request.on( 'error', (error) => reject(error) );

});

//----
const storeStationData = (data) => {
  //----
  const AWS   = require('aws-sdk');

  //----
  const ddb = new AWS.DynamoDB.DocumentClient();
  const tableName = process.env.TABLE_NAME;

  var params = { RequestItems: {} }
  params.RequestItems[tableName] = [];

  // we will only load the first 25 stations here, else
  // run into max size of single DDB batchWrite operation
  var maxIndex = Math.min(25, data.stationBeanList.length);

  for (var i = 0; i < maxIndex; i++) {
    var station = data.stationBeanList[i];
    var item = {
      PutRequest: {
        Item: {
          uuid:      station.city + "-" + station.id,
          name:      station.stationName,
          latitude:  station.latitude,
          longitude: station.longitude,
          address:   station.stAddress1,
          city:      station.city
        }
      }
    }

    params.RequestItems[tableName].push(item);
  };

  return ddb.batchWrite(params).promise();
};


module.exports.setup = (event, context, callback) => {
  const dataUrl = process.env.DATA_URL

  getStationData(dataUrl)
    .then( (data) => {
      return storeStationData(data);
    })
    .then( (result) => {
      console.log(result);
      callback(null, buildResponse( 200, { "message": "Setup complete" } ));
    })
    .catch( (error) => {
      console.error(error);
      callback(error);
    });
};



