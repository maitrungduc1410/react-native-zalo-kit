import React, { Component } from 'react';
import {
  Platform,
  SafeAreaView,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import ZaloKit from 'react-native-zalo-kit';

export default class App extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      userProfile: null,
      isAuthenticated: null,
      androidKey: '',
      loginStatus: null,
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      const key = await ZaloKit.getApplicationHashKey();
      console.log(key);
      this.setState({
        androidKey: key,
      });
    }
  }

  login = async () => {
    try {
      const data = await ZaloKit.login(ZaloKit.Constants.AUTH_VIA_APP_OR_WEB);
      console.log(data);
      this.setState({
        loginStatus: true,
      });
    } catch (error) {
      console.log(error);

      this.setState({
        loginStatus: false,
      });
    }
  };

  logout = () => {
    ZaloKit.logout();
    this.setState({
      userProfile: null,
      isAuthenticated: null,
      loginStatus: null,
    });
  };

  getUserProfile = async () => {
    try {
      const userProfile = await ZaloKit.getUserProfile();
      console.log(userProfile);
      this.setState({ userProfile });
    } catch (error: any) {
      console.log(error.toString());
    }
  };

  isAuthenticated = async () => {
    try {
      const isAuthenticated = await ZaloKit.isAuthenticated();
      this.setState({ isAuthenticated });
    } catch (error) {
      console.log(error);
      this.setState({ isAuthenticated: false });
    }
  };

  getUserFriendList = async () => {
    try {
      const friends = await ZaloKit.getUserFriendList(1, 10);
      console.log(friends);
    } catch (error) {
      console.log(error);
    }
  };

  getUserInvitableFriendList = async () => {
    try {
      const friends = await ZaloKit.getUserInvitableFriendList(1, 10);
      console.log(friends);
    } catch (error) {
      console.log(error);
    }
  };

  postFeed = async () => {
    try {
      const link = 'https://zing.vn';
      const message = 'Hello World';
      const post = await ZaloKit.postFeed(message, link);
      console.log(post);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  sendMessage = async () => {
    try {
      const friendId = '3303969417419981371';
      const link = 'https://zing.vn';
      const message = 'Hello World';
      const post = await ZaloKit.sendMessage(friendId, message, link);
      console.log(post);
    } catch (error) {
      console.log(error);
    }
  };

  inviteFriendUseApp = async () => {
    try {
      const friendIds = ['3303969417419981371'];
      const message = 'Hello World';
      const post = await ZaloKit.inviteFriendUseApp(friendIds, message);
      console.log(post);
    } catch (error) {
      console.log(error);
    }
  };

  sendMessageByApp = async () => {
    try {
      const feedData = {
        appName: 'DEMO RN APP',
        message: 'Hello World',
        link: 'https://zing.vn',
        linkTitle: 'LINK TITLE',
        linkSource: 'LINK SOURCE',
        linkDesc: 'LINK DESC',
        linkThumb: [
          'https://lh3.googleusercontent.com/dr8A58cYr-Mnz6mi5QCe6_I2yaCICVV0jL7fjrzWixn89HiA4BGW-KraR7yU4JappTs',
        ],
        others: {},
      };

      const data = await ZaloKit.sendMessageByApp(feedData);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  postFeedByApp = async () => {
    try {
      const feedData = {
        appName: 'DEMO RN APP',
        message: 'Hello World',
        link: 'https://zing.vn',
        linkTitle: 'LINK TITLE',
        linkSource: 'LINK SOURCE',
        linkDesc: 'LINK DESC',
        linkThumb: [
          'https://lh3.googleusercontent.com/dr8A58cYr-Mnz6mi5QCe6_I2yaCICVV0jL7fjrzWixn89HiA4BGW-KraR7yU4JappTs',
        ],
        others: {},
      };

      const data = await ZaloKit.postFeedByApp(feedData);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  register = async () => {
    try {
      const data = await ZaloKit.register();
      console.log(data, '.......');
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={'dark-content'} />
        <ScrollView contentContainerStyle={styles.container}>
          {Platform.OS === 'android' && (
            <Text>
              Android App Hash Key:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {this.state.androidKey}
              </Text>
            </Text>
          )}
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={this.login}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.rowText}>
              Status: <Text>{JSON.stringify(this.state.loginStatus)}</Text>
            </Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={this.isAuthenticated}
            >
              <Text style={styles.buttonText}>isAuthenticated</Text>
            </TouchableOpacity>
            <Text style={styles.rowText}>
              Status: <Text>{JSON.stringify(this.state.isAuthenticated)}</Text>
            </Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.getUserProfile}
            >
              <Text style={styles.buttonText}>Get User Profile</Text>
            </TouchableOpacity>
          </View>
          {this.state.userProfile && (
            <View style={styles.userInfo}>
              <View>
                <Text>
                  User ID: <Text>{this.state.userProfile.id}</Text>
                </Text>
              </View>
              <View>
                <Text>
                  Name: <Text>{this.state.userProfile.name}</Text>
                </Text>
              </View>
              <View>
                <Text>
                  Phone: <Text>{this.state.userProfile.phoneNumber}</Text>
                </Text>
              </View>
              <View>
                <Text>
                  Gender: <Text>{this.state.userProfile.gender}</Text>
                </Text>
              </View>
              <View>
                <Text>
                  DOB: <Text>{this.state.userProfile.birthday}</Text>
                </Text>
              </View>
              <View>
                <Image
                  style={{ width: 200, height: 200 }}
                  source={{
                    uri: this.state.userProfile.picture.data.url,
                  }}
                />
              </View>
            </View>
          )}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.logout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.getUserFriendList}
            >
              <Text style={styles.buttonText}>getUserFriendList</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.getUserInvitableFriendList}
            >
              <Text style={styles.buttonText}>getUserInvitableFriendList</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.postFeed}
            >
              <Text style={styles.buttonText}>postFeed</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.sendMessage}
            >
              <Text style={styles.buttonText}>sendMessageToFriend</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.inviteFriendUseApp}
            >
              <Text style={styles.buttonText}>inviteFriendUseApp</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.sendMessageByApp}
            >
              <Text style={styles.buttonText}>sendMessageByApp</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.postFeedByApp}
            >
              <Text style={styles.buttonText}>postFeedByApp</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={this.register}
            >
              <Text style={styles.buttonText}>register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    minWidth: 100,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
});
