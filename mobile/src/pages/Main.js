import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import api from '../services/api';

import logo from '../assets/logo.png';
import like from '../assets/like.png';
import dislike from '../assets/dislike.png';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ navigation }) {
  const id = navigation.getParam('user');
  const [users, setUsers] = useState([]);
  const [matchDev, setMatchDev] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      const response = await api.get('/devs', {
        headers: {
          user: id,
        },
      });

      setUsers(response.data);
    }

    loadUsers();
  }, [id]);

  useEffect(() => {
    const socket = io('http://192.168.1.7:3333', {
      query: { user: id },
    });

    socket.on('match', dev => {
      setMatchDev(dev);
    });
  }, [id]);

  async function handleLike() {
    const [user, ...rest] = users;

    await api.post(`/devs/${user._id}/likes`, null, {
      headers: {
        user: id,
      },
    });

    setUsers(rest);
  }

  async function handleDislike() {
    const [user, ...rest] = users;

    await api.post(`/devs/${user._id}/dislikes`, null, {
      headers: {
        user: id,
      },
    });

    setUsers(rest);
  }

  async function handleLogout() {
    await AsyncStorage.clear();
    navigation.navigate('Login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleLogout}>
        <Image style={styles.logo} source={logo} />
      </TouchableOpacity>
      <View style={styles.cardContainer}>
        {users.length === 0 ? (
          <Text style={styles.empty}>Acabou :(</Text>
        ) : (
          users.map((user, index) => (
            <View
              key={user._id}
              style={[styles.card, { zIndex: users.length - index }]}
            >
              <Image
                style={styles.avatar}
                source={{
                  uri: user.avatar,
                }}
              />

              <View style={styles.footer}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.bio} numberOfLines={3}>
                  {user.bio}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {users.length > 0 && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleDislike}>
            <Image source={dislike} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLike}>
            <Image source={like} />
          </TouchableOpacity>
        </View>
      )}

      {matchDev && (
        <View style={styles.matchContainer}>
          <Image style={styles.matchImage} source={itsamatch} />
          <Image style={styles.matchAvatar} source={{ uri: matchDev.avatar }} />
          <Text style={styles.matchName}>{matchDev.name}</Text>
          <Text style={styles.matchBio}>{matchDev.bio}</Text>
          <TouchableOpacity onPress={() => setMatchDev(null)}>
            <Text style={styles.closeMatch}>FECHAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  logo: {
    marginTop: 30,
  },
  empty: {
    alignSelf: 'center',
    color: '#999',
    fontWeight: 'bold',
    fontSize: 24,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'stretch',
    maxHeight: 500,
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 30,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    height: 300,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  nome: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bio: {
    marginTop: 5,
    lineHeight: 18,
    color: '#999',
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    marginHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    zIndex: -1,
  },
  matchContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 666,
  },
  matchImage: {
    height: 60,
    resizeMode: 'contain',
  },
  matchAvatar: {
    width: 160,
    height: 160,
    marginVertical: 30,
    borderRadius: 80,
    borderWidth: 5,
    borderColor: '#FFF',
  },
  matchName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  matchBio: {
    marginTop: 10,
    paddingHorizontal: 30,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  closeMatch: {
    marginTop: 30,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
