# Scriptblox Proxy API

I created this API proxy because my script searcher website broke after Scriptblox updated their API and website. This proxy allows the API to work again for my script searcher.

## Endpoints

### 1. `/api/fetch`

Fetches all of the scripts from the Scriptblox API.

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

Request URL: `https://scriptblox-api-proxy.vercel.app/api/search?q=Arsenal`

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

### 3. `/api/info`

Fetches user information from the Scriptblox API.

- **Method:** `GET`
- **Description:** gets the info of an specific account when putting the username.

#### Request

- **Query Parameters:**
  - `username` (string): The username of the user (required).

#### Response

Returns a JSON object containing user data.

#### Example

Request URL: `https://scriptblox-api-proxy.vercel.app/api/info?username=YellowGreg`

```json
{
  "user": {
    "_id": "64d526aaafa696af4c6d5f20",
    "username": "YellowGreg",
    "verified": true,
    "role": "user",
    "profilePicture": "/images/photo/64d526aaafa696af4c6d5f20-1727043362341.jpg",
    "bio": "👋 Hi, I create basic & straightforward scripts that focus on simple useful features.",
    "createdAt": "2023-08-10T18:04:26.778Z",
    "lastActive": "2024-10-22T04:32:04.976Z",
    "discord": {
      "id": "773952016036790272",
      "username": "yellowgreg",
      "discriminator": "0"
    },
    "status": "offline",
    "id": "64d526aaafa696af4c6d5f20",
    "followingCount": 0,
    "followersCount": 6,
    "scriptCount": 9
  }
}
```

### 4. `/api/pfp`

Fetches the profile picture of a user from the Scriptblox API.

- **Method:** `GET`
- **Description:** Gets the profile picture(image) of a user, on their username.

#### Request

- **Query Parameters:**
  - `username` (string): The username of the user (required).

#### Response

Returns the profile picture as an image.

#### Example

Request URL: `https://scriptblox-api-proxy.vercel.app/api/pfp?username=YellowGreg`

- Returns an image response.

## Usage

This makes the HTTP requests to the API endpoints to fetch or search for scripts. Also note that it has a rate limits to avoid 429 errors due to too many requests.

## License

This API is free to use. I created it for my own script searcher website that had been broken.
