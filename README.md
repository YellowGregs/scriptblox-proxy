# Scriptblox Proxy API

This proxy API was built to restore functionality to my script searcher website after Scriptblox updated their API and website. It now supports the new API parameters while still offering temporary legacy support during the migration period.

## Endpoints

### 1. `/api/fetch`

Fetches a list of scripts from the Scriptblox API.

- **Method:** `GET`
- **Description:** Retrieves all scripts available on Scriptblox. The endpoint now supports explicit parameters in place of the legacy `filters` parameter. Legacy filters are automatically mapped to the new parameters; however, you can pass the new parameters directly if desired.
- **Rate Limiting:** 1 request per second.

#### Request

_No additional parameters are required._  
instead, you can include:
- `page` (number, optional): Page number for pagination.
- `filters` (string, optional): Legacy filter value. Accepted values are:
  - `free` → mapped to `mode=free`
  - `paid` → mapped to `mode=paid`
  - `verified` → mapped to `verified=1`
  - `unverified` → mapped to `verified=0`
  - `newest` → mapped to `sortBy=createdAt&order=desc`
  - `oldest` → mapped to `sortBy=createdAt&order=asc`
  - `mostviewed` → mapped to `sortBy=views&order=desc`
  - `leastviewed` → mapped to `sortBy=views&order=asc`
  - `hot` → uses the dedicated trending endpoint

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

---

### 2. `/api/search`

Searches for scripts using a provided query string.

- **Method:** `GET`
- **Description:** Searches Scriptblox for scripts matching your query. In addition to the new parameters, the legacy `filters` parameter is supported and will be automatically mapped. You can also pass the new parameters (`mode`, `verified`, `sortBy`, `order`) directly.
- **Rate Limiting:** 1 request per second.

#### Request

- **Query Parameters:**
  - `q` (string, required): The search query.
  - `page` (number, optional): Page number for pagination.
  - `scriptName` (string, optional): Filter results by script name.
  - `mode` (string, optional): Filter results by mode (`free` or `paid`).
  - `filters` (string, optional): Legacy filter values (see `/api/fetch` for supported values).

#### Response

Returns a JSON object containing the search results.

#### Example

Request URL:  
```
https://scriptblox-api-proxy.vercel.app/api/search?q=Arsenal&page=1&mode=free
```

```json
{
  "result": {
    "totalPages": 47,
    "scripts": [
      {
        "_id": "667a72d2bdddf02d71072a9d",
        "title": "solaris.lol",
        "game": {
          "gameId": 301549746,
          "name": "Counter Blox",
          "imageUrl": "/images/script/301549746-1719300818355.webp"
        },
        "script": "loadstring(game:HttpGet(\"https://rawscripts.net/raw/Counter-Blox-Solaris-14633\"))()",
        "slug": "Counter-Blox-Solaris-14633",
        "verified": true,
        "key": false,
        "keyLink": "",
        "views": 268251,
        "scriptType": "free",
        "isUniversal": false,
        "isPatched": false,
        "visibility": "public",
        "createdAt": "2024-06-25T07:33:38.416Z",
        "updatedAt": "2025-02-14T18:59:02.332Z",
        "__v": 0,
        "matched": [
          "features",
          "tags"
        ]
      },
      ...
    ]
  }
}
```

---

### 3. `/api/info`

Fetches user information from the Scriptblox API.

- **Method:** `GET`
- **Description:** Retrieves account details for a specified username.
  
#### Request

- **Query Parameters:**
  - `username` (string, required): The username of the user.

#### Response

Returns a JSON object containing user data.

#### Example

Request URL:  
```
https://scriptblox-api-proxy.vercel.app/api/info?username=YellowGreg
```

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

---

### 4. `/api/pfp`

Fetches the profile picture of a user from the Scriptblox API.

- **Method:** `GET`
- **Description:** Retrieves the profile image of a user based on their username.
  
#### Request

- **Query Parameters:**
  - `username` (string, required): The username of the user.

#### Response

Returns the user's profile picture as an image response.

#### Example

Request URL:  
```
https://scriptblox-api-proxy.vercel.app/api/pfp?username=YellowGreg
```

---

## Usage

This proxy makes HTTP requests to the Scriptblox API endpoints to fetch or search for scripts. It also implements rate limiting (1 request per second) to help avoid hitting API rate limits, ensuring stable and reliable access even during peak usage.

## Legacy Support & Migration

The proxy has been updated to support the new API parameters introduced by Scriptblox. Legacy requests that still use the deprecated `filters` parameter are automatically translated to their new equivalents. This legacy mapping is temporary, allowing for a grace period during migration.

## License

This API is free to use. It was created to restore functionality to my script searcher website after the Scriptblox API changes disrupted my script searcher website.
