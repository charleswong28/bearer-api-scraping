import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

let accessToken: string | null = null;
let accessTokenRetryCount = 0;

type RequestFunc<T> = (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;

type FetchOption<FetchResponse, AccessTokenResponse> = {
  numberOfRetryBeforeRefetchAccessToken?: number;
  refetchAccessTokenUri: string;
  refetchAccessTokenUriConfig?: AxiosRequestConfig<AccessTokenResponse>;
  getAccessToken: (response: AccessTokenResponse) => string;
  numberOfAccessTokenRetry?: number;
  requestConfig?: AxiosRequestConfig<FetchResponse>;
  minWaitTime?: number;
  maxWaitTime?: number;
  logger?: ((...data: any[]) => void)  | null | undefined;
};

const DEFAULT_OPTS = {
  numberOfRetryBeforeRefetchAccessToken: 5,
  numberOfAccessTokenRetry: 3,
  minWaitTime: 0,
  maxWaitTime: 0,
}

const resetAll = () => {
  accessToken = null;
  accessTokenRetryCount = 0;
}

const fetchAccessToken = async <FetchResponse, AccessTokenResponse>(options: FetchOption<FetchResponse, AccessTokenResponse>) => {
  try {
    accessToken = null;

    const response = await axios.get<{}, AccessTokenResponse>(options.refetchAccessTokenUri, options.refetchAccessTokenUriConfig);
    accessToken = options.getAccessToken(response);
  } catch (error) {
    options.logger?.(`Access token request failed #${accessTokenRetryCount + 1}: `, error);
  } finally {
    accessTokenRetryCount += 1;
  }
}

const fetch = async <AccessTokenResponse, FetchResponse>(func: RequestFunc<FetchResponse>, uri: string, opts: FetchOption<FetchResponse, AccessTokenResponse>) => {
  const options = { ...DEFAULT_OPTS, ...opts };

  let requestRetryCount = 0;
  accessTokenRetryCount = 0;
  do {
    if (
      accessToken == null || requestRetryCount >= options.numberOfRetryBeforeRefetchAccessToken
    ) {
      await fetchAccessToken<FetchResponse, AccessTokenResponse>(options);
      await new Promise((resolve) => setTimeout(resolve, Math.random() * (options.maxWaitTime - options.minWaitTime) + options.minWaitTime));
    }

    if (accessToken != null) {
      requestRetryCount = 0;
      do {
        try {
          const result = await func(uri, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ...(options.requestConfig?.headers || {}),
            },
            ...(options.requestConfig || {}),
          });

          return result;
        } catch (error) {
          options.logger?.(`Request failed #${requestRetryCount + 1} to ${uri}: `, error, );
        } finally {
          requestRetryCount += 1;
        }

        await new Promise((resolve) => setTimeout(resolve, Math.random() * (options.maxWaitTime - options.minWaitTime) + options.minWaitTime));
      } while (requestRetryCount < options.numberOfRetryBeforeRefetchAccessToken);
    }
  } while (accessTokenRetryCount < options.numberOfAccessTokenRetry);

  throw new Error('API request failed.');
}

const get = <AccessTokenResponse, FetchResponse>(uri: string, opts: FetchOption<FetchResponse, AccessTokenResponse>) => {
  return fetch<AccessTokenResponse, FetchResponse>(axios.get, uri, opts);
};

const post = <AccessTokenResponse, FetchResponse>(uri: string, opts: FetchOption<FetchResponse, AccessTokenResponse>) => {
  return fetch<AccessTokenResponse, FetchResponse>(axios.post, uri, opts);
};

export { get, post, resetAll };
