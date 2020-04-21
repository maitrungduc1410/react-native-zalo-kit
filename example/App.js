import React, { Component } from 'react'
import { SafeAreaView, Image, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import ZaloKit from 'react-native-zalo-kit'

export default class App extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
      userProfile: null,
      isAuthenticated: null,
      androidKey: '',
      loginStatus: null,
    }
  }

  async componentDidMount() {
    console.log(Constants)
    if (Platform.OS === 'android') {
      const key = await ZaloKit.getApplicationHashKey()

      this.setState({
        androidKey: key
      })
    }
  }

  login = async () => {
    try {
      await ZaloKit.login(ZaloKit.Constants.AUTH_VIA_APP_OR_WEB)

      this.setState({
        loginStatus: true
      })
    } catch (error) {
      console.log(error)

      this.setState({
        loginStatus: false
      })
    }
  }

  logout = () => {
    ZaloKit.logout()
    this.setState({
      userProfile: null,
      isAuthenticated: null,
      loginStatus: null,
    })
  }
  
  getUserProfile = async () => {
    try {
      const userProfile = await ZaloKit.getUserProfile()
      this.setState({ userProfile })
    } catch (error) {
      console.log(error)
    }
  }

  isAuthenticated = async () => {
    try {
      const isAuthenticated = await ZaloKit.isAuthenticated()
      this.setState({ isAuthenticated })
    } catch (error) {
      console.log(error)
      this.setState({ isAuthenticated: false })
    }
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.container}>
          {
            Platform.OS === 'android' && (
              <Text>Android App Hash Key: <Text style={{ fontWeight: 'bold' }}>{this.state.androidKey}</Text></Text>
            )
          }
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={this.login}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.rowText}>Status: <Text>{JSON.stringify(this.state.loginStatus)}</Text></Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={this.isAuthenticated}>
              <Text style={styles.buttonText}>isAuthenticated</Text>
            </TouchableOpacity>
            <Text style={styles.rowText}>Status: <Text>{JSON.stringify(this.state.isAuthenticated)}</Text></Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={this.getUserProfile}>
              <Text style={styles.buttonText}>Get User Profile</Text>
            </TouchableOpacity>
          </View>
          {
            this.state.userProfile && (
              <View style={styles.userInfo}>
                <View>
                  <Text>User ID: <Text>{this.state.userProfile.id}</Text></Text>
                </View>
                <View>
                  <Text>Name: <Text>{this.state.userProfile.name}</Text></Text>
                </View>
                <View>
                  <Text>Phone: <Text>{this.state.userProfile.phoneNumber}</Text></Text>
                </View>
                <View>
                  <Text>Gender: <Text>{this.state.userProfile.gender}</Text></Text>
                </View>
                <View>
                  <Text>DOB: <Text>{this.state.userProfile.birthday}</Text></Text>
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
            )
          }
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={this.logout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10
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
    marginVertical: 10
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    minWidth: 100,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
  },
  rowText: {
    flex: 1,
    textAlign: 'center'
  },
  userInfo: {
    alignItems: 'center'
  }
})
