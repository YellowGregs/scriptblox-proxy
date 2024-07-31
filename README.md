# Scriptblox Proxy API
I made this api proxy since my script searcher website broke after scriptblox updated there api and website so i had to code a proxy to make the api work again.

## Endpoints

### 1. `/api/fetch`

Fetches a all of the scripts from the Scriptblox API.

- **Method:** `GET`
- **Description:** Retrieves a list of scripts available on Scriptblox.
- **Rate Limiting:** 1 request per second.

#### Request

No parameters required.

#### Response

Returns a JSON object containing script data.

#### Example

```json
{
  "result": {
    "totalPages": 719,
    "nextPage": 2,
    "max": 20,
    "scripts": [
      {
        "_id": "66aa72f69a9e4d48a6e2174d",
        "title": "Ro ghoul OP script",
        "game": {
          "gameId": 914010731,
          "name": "[AmonK2!!!] Ro-Ghoul [ALPHA]",
          "imageUrl": "https://tr.rbxcdn.com/f4c26efe0e79100320b6bce4c0b74fad/500/280/Image/Jpeg"
        },
        ...
      }
    ]
  }
}
```

### 2. `/api/search`

Searches for scripts from the query string.

- **Method:** `GET`
- **Description:** Searches the Scriptblox API for scripts matching the provided query.
- **Rate Limiting:** 1 request per second.

#### Request

- **Query Parameters:**
  - `q` (string): The search query (required).

#### Response

Returns a JSON object containing the search results.

#### Example

Request URL: `/api/search?q=Arsenal`

```json
{
  "result": {
    "totalPages": 21,
    "scripts": [
      {
        "_id": "66a72f6f69a9e4d48a6e2174d",
        "title": "Arsenal Thunder Client V2",
        "game": {
          "gameId": 286090429,
          "name": "Arsenal",
          "imageUrl": "/images/script/286090429-1715878469600.webp"
        },
        "script": "loadstring(game:HttpGet('https://rawscripts.net/raw/Arsenal-Thunder-Client-V2-12177'))()",
        "slug": "Arsenal-Thunder-Client-V2-12177",
        "verified": true,
        ...
      }
    ]
  }
}
```


## Usage

This makes the HTTP requests to the API endpoints to fetch or search for scripts. Also note that it has a rate limits to avoid 429 errors due to too many requests.

## Error Handling

- **429 Too Many Requests:** Occurs when requests are made too frequently. Please wait and try again later after like 5-10 seconds.
- **500 Internal Server Error:** Indicates an issue with the proxy server or the external API. Check the logs for more details.

## License

this is free to use I only made it for my own script searcher website that had been broken.

