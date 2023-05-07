import { get, post, resetAll } from ".";
import axios from 'axios';

const successRequset = { result: "success" };

const failedRequset = 'API request failed.';

const successAccessToken = { result: { access_token: 'validAccessToken' } };

const failedAccessToken = 'Access token request failed.';

const getAccessToken = (response) => response?.result?.access_token;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Scraping API Get Test", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("get request with success", async () => {
    mockedAxios.get.mockResolvedValueOnce(successAccessToken).mockResolvedValueOnce(successRequset);

    await expect(get('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it("get request with failed request once", async () => {
    mockedAxios.get.mockRejectedValueOnce(failedRequset).mockResolvedValueOnce(successRequset);

    await expect(get('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it("get request with failed request more than 5 times but success after renewing access token", async () => {
    mockedAxios.get
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockResolvedValueOnce(successAccessToken)
      .mockResolvedValueOnce(successRequset);

    await expect(get('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
      numberOfRetryBeforeRefetchAccessToken: 5,
    })).resolves.toEqual(successRequset);
    expect(axios.get).toHaveBeenCalledTimes(7);
  });

  it("Should throw error when failed to renew access token more than 3 times", async () => {
    mockedAxios.get
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValue(failedAccessToken);

    await expect(get('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).rejects.toThrowError();

    expect(axios.get).toHaveBeenCalledTimes(8);
  });

  it("Should throw error when failed request with more than 20 fetches", async () => {
    /* Start with a successful call first */
    mockedAxios.get.mockResolvedValueOnce(successAccessToken).mockResolvedValueOnce(successRequset);

    await expect(get('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);

    expect(axios.get).toHaveBeenCalledTimes(2);

    /* Reset and test with a valid access token at start */
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockedAxios.get
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockResolvedValueOnce(successAccessToken)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockResolvedValueOnce(successAccessToken)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockResolvedValueOnce(successAccessToken)
      .mockRejectedValue(failedRequset);
    
    await expect(get('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).rejects.toThrowError();

    expect(axios.get).toHaveBeenCalledTimes(23);
  });
});

describe("Scraping API Post Test", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("get request with success", async () => {
    resetAll();

    mockedAxios.get.mockResolvedValue(successAccessToken);
    mockedAxios.post.mockResolvedValue(successRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("get request with failed request once", async () => {
    mockedAxios.get.mockResolvedValue(successAccessToken);
    mockedAxios.post.mockRejectedValueOnce(failedRequset).mockResolvedValue(successRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it("get request with failed request more than 5 times but success after renewing access token", async () => {
    mockedAxios.get.mockResolvedValue(successAccessToken);
    mockedAxios.post
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockRejectedValueOnce(failedRequset)
      .mockResolvedValueOnce(successRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);
    expect(axios.post).toHaveBeenCalledTimes(6);
  });

  it("Should throw error when failed to renew access token more than 3 times", async () => {
    mockedAxios.get.mockRejectedValue(failedAccessToken);
    mockedAxios.post.mockRejectedValue(failedRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).rejects.toThrowError();
    expect(axios.post).toHaveBeenCalledTimes(5);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it("Should throw error when failed request with more than 15 fetches", async () => {
    mockedAxios.get.mockResolvedValue(successAccessToken);
    mockedAxios.post.mockRejectedValue(failedRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).rejects.toThrowError();
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.post).toHaveBeenCalledTimes(15);
  });

  it("Should throw error when failed request with more than 15 fetches with previous success", async () => {
    resetAll();

    mockedAxios.get.mockResolvedValue(successAccessToken);
    mockedAxios.post.mockResolvedValue(successRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).resolves.toEqual(successRequset);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    jest.resetAllMocks();

    mockedAxios.get.mockResolvedValue(successAccessToken);
    mockedAxios.post.mockRejectedValue(failedRequset);

    await expect(post('https://example.com', {
      refetchAccessTokenUri: 'https://example.com/accessToken',
      getAccessToken,
    })).rejects.toThrowError();
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.post).toHaveBeenCalledTimes(20);
  });
});
