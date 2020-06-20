# Youtube GameBar Search Server
A simple server to implement YTGBO's Search feature, using node-ytsr library.

## Usage
* 1: Clone this repository.  
* 2: On repository's root, run `npm install`.  
* 3: To run the server, use: `node index.js`.  
* 4: Make any POST request on port `54522` with `/search` endpoint, composed by the following body:
  * 4.1: `{ "term": "your_search_term_here" }`.  
* 5: If the search was successful, server will return an `Object[5]`:
  * 5.1: Each `object` has these attributes: 
    ```
    {
      "videoTitle": "the_search_result_video_title",
      "channelTitle": "the_search_result_channel_title",
      "mediaUrl": "the_search_result_mediaUrl"
    }
    ```

## Tips
It is highly recommended to use the `pm2` process manager to recover from internal failures and automatize the service providing.

## Licensing
MIT License.
