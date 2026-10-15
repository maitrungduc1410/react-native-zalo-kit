import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Constants,
  getAccessToken,
  getApplicationHashKey,
  getUserProfile,
  isAuthenticated,
  login,
  logout,
  refreshAccessToken,
  type IUserProfile,
  type IZaloAuthResponse,
  type LoginMethod,
} from 'react-native-zalo-kit';

function describeError(error: unknown): string {
  const { code, message } = (error ?? {}) as {
    code?: string;
    message?: string;
  };
  return code ? `[${code}] ${message}` : String(message ?? error);
}

function describeToken(token: IZaloAuthResponse): string {
  const expiresAt = token.expiresAt
    ? new Date(token.expiresAt).toLocaleString()
    : 'unknown';
  return `${token.accessToken.slice(0, 12)}… (expires in ${token.expiresIn}s, at ${expiresAt})`;
}

function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [androidKey, setAndroidKey] = useState('');
  const [status, setStatus] = useState('');
  const [profile, setProfile] = useState<IUserProfile | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setAndroidKey(getApplicationHashKey());
    }
  }, []);

  const run = async (label: string, action: () => Promise<string>) => {
    setStatus(`${label}…`);
    try {
      setStatus(`${label}: ${await action()}`);
    } catch (error) {
      console.warn(label, error);
      setStatus(`${label} failed: ${describeError(error)}`);
    }
  };

  const doLogin = (method: LoginMethod) =>
    run(`login(${method})`, async () => describeToken(await login(method)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {Platform.OS === 'android' && (
          <Text selectable>
            Android hash key: <Text style={styles.bold}>{androidKey}</Text>
          </Text>
        )}

        <View style={styles.row}>
          <Button
            title="Login (app or web)"
            onPress={() => doLogin(Constants.AUTH_VIA_APP_OR_WEB)}
          />
          <Button
            title="Login (app)"
            onPress={() => doLogin(Constants.AUTH_VIA_APP)}
          />
          <Button
            title="Login (web)"
            onPress={() => doLogin(Constants.AUTH_VIA_WEB)}
          />
        </View>

        <View style={styles.row}>
          <Button
            title="isAuthenticated"
            onPress={() =>
              run('isAuthenticated', async () =>
                String(await isAuthenticated())
              )
            }
          />
          <Button
            title="Access token"
            onPress={() =>
              run('getAccessToken', async () =>
                describeToken(await getAccessToken())
              )
            }
          />
          <Button
            title="Refresh token"
            onPress={() =>
              run('refreshAccessToken', async () =>
                describeToken(await refreshAccessToken())
              )
            }
          />
        </View>

        <View style={styles.row}>
          <Button
            title="Get profile"
            onPress={() =>
              run('getUserProfile', async () => {
                const result = await getUserProfile();
                setProfile(result);
                return result.name;
              })
            }
          />
          <Button
            title="Logout"
            onPress={() => {
              logout();
              setProfile(null);
              setStatus('Logged out');
            }}
          />
        </View>

        <Text selectable style={styles.status}>
          {status}
        </Text>

        {profile && (
          <View style={styles.profile}>
            <Text>ID: {profile.id}</Text>
            <Text>Name: {profile.name}</Text>
            {!!profile.picture?.data?.url && (
              <Image
                style={styles.avatar}
                source={{ uri: profile.picture.data.url }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    padding: 10,
    marginTop: 50,
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
  status: {
    marginVertical: 12,
  },
  profile: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 200,
    height: 200,
  },
});
