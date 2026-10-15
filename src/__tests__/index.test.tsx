import { Platform } from 'react-native';
import NativeZaloKit from '../NativeZaloKit';
import {
  Constants,
  getAccessToken,
  getApplicationHashKey,
  login,
  refreshAccessToken,
} from '../index';

jest.mock('../NativeZaloKit', () => ({
  __esModule: true,
  default: {
    login: jest.fn(() => Promise.resolve({})),
    logout: jest.fn(),
    isAuthenticated: jest.fn(() => Promise.resolve(true)),
    getAccessToken: jest.fn(() => Promise.resolve({})),
    getUserProfile: jest.fn(() => Promise.resolve({})),
    getApplicationHashKey: jest.fn(() => 'hash'),
  },
}));

const native = NativeZaloKit as jest.Mocked<typeof NativeZaloKit>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('login', () => {
  it('defaults to app-or-web with web fallback', async () => {
    await login();
    expect(native.login).toHaveBeenCalledWith('AUTH_VIA_APP_OR_WEB', true);
  });

  it('does not fall back to web for app-only login unless asked', async () => {
    await login(Constants.AUTH_VIA_APP);
    expect(native.login).toHaveBeenLastCalledWith('AUTH_VIA_APP', false);

    await login(Constants.AUTH_VIA_APP, { fallbackToWeb: true });
    expect(native.login).toHaveBeenLastCalledWith('AUTH_VIA_APP', true);
  });

  it('lets callers disable fallback for app-or-web', async () => {
    await login(Constants.AUTH_VIA_APP_OR_WEB, { fallbackToWeb: false });
    expect(native.login).toHaveBeenLastCalledWith('AUTH_VIA_APP_OR_WEB', false);
  });
});

describe('access token', () => {
  it('does not force a refresh by default', async () => {
    await getAccessToken();
    expect(native.getAccessToken).toHaveBeenLastCalledWith(false);
  });

  it('forces a refresh when requested', async () => {
    await getAccessToken({ forceRefresh: true });
    expect(native.getAccessToken).toHaveBeenLastCalledWith(true);

    await refreshAccessToken();
    expect(native.getAccessToken).toHaveBeenLastCalledWith(true);
  });
});

describe('getApplicationHashKey', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('returns the native hash key on Android', () => {
    Platform.OS = 'android';
    expect(getApplicationHashKey()).toBe('hash');
  });

  it('throws on iOS', () => {
    Platform.OS = 'ios';
    expect(() => getApplicationHashKey()).toThrow(/only supported on Android/);
    expect(native.getApplicationHashKey).not.toHaveBeenCalled();
  });
});
