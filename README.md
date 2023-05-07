# TypeScript

Simple scraping library with auto-retry of API with structure of `Bearer ${token}` in header.

## Logic flow

1. Fetch the access token api and store it
2. Fetch the API with access token in header
3. If the response status code is not 2xx, retry with `numberOfRetryBeforeRefetchAccessToken` times.
4. If the request failed with more than `numberOfRetryBeforeRefetchAccessToken` times, renew access token and try again with `numberOfAccessTokenRetry`.
5. If access token api failed `numberOfAccessTokenRetry` times or request failed with `numberOfAccessTokenRetry + accessToken == null ? 0 : 1` x `numberOfRetryBeforeRefetchAccessToken` times, throw an error.

## Usage
```
import Scraper from 'api-scaping';

for (let i = 0; i < 1000; i++) {
  const result = await Scraper.get(`some_uri/${i}/item`, {
    numberOfRetryBeforeRefetchAccessToken: 5,
    refetchAccessTokenUri,
    getAccessToken: (response) => response.accessToken,
    numberOfAccessTokenRetry: 5,
  });

  console.log('result', result);
}

```

### Method
| Name | parameters |
| --- | ----------- |
| get | uri - uri to fetch <br> opts - fetch options |
| post | uri - uri to fetch <br> opts - fetch options |

## Structure
- Code located in [`index.ts`](./src/index.ts)
- Tests located in [`index.test.ts`](./src/index.test.ts)

## Limitation
- Proxy can be implemented by passing requestConfig to Axios.
- Access Token API is only supported as get request. PR is welcomed.