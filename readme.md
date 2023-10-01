# Deprecation notice
This project is now deprecated due to the difficulty of interacting with _the video provider APIs_. The limited search quota is not enough to fullfil global usage of the app and because of this it lacks one of the core features of the app, the search feature. Unfortunately is not of my interest to maintain or update the project anymore. Feel free to clone, redistribute or share the project since it is not licensed in any form.


# YT GameBar Search Server
A simple server to implement [YTGBO](https://github.com/MarconiGRF/YTGameBarOverlay)'s Search feature, using [scrape](https://github.com/HermanFassett/youtube-scrape) library.

## Usage
* 1: Clone this repository.  
* 2: On repository's root, run `npm install`.  
* 3: To run the server, use: `node index.js`.  
* 4: Make any request to the server:
  * 4.1: A GET request with the following URL parameter is accepted:
    * 4.1.1: `http://server.address:54522/current/search/your_search_term_here`
  * 4.2: A GET request with the following URL parameter is accepted:
    * 4.2.1: `http://server.address:54522/search/your_search_term_here`
* 5: If the search was successful, server will return an `Object[]`:
  * 5.1: Each `object` has these attributes: 
    ```
    {
      "mediaType": "video_or_playlist",
      "mediaTitle": "the_search_result_video/playlist_title",
      "channelTitle": "the_search_result_channel_title",
      "mediaUrl": "the_search_result_video/playlist_url"
    }
    ```

## Tips
It is highly recommended to use the `pm2` process manager to recover from internal failures and automatize the service providing.

## Special Thanks
* [Guilhermeasper](https://github.com/guilhermeasper), for implementing playlists search capability.
* [HermanFassett](https://github.com/HermanFassett), for the open-source scrape library.

## Licensing
MIT License.
