import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const lastPhoto = useSelector((state: RootState) => state.camera.lastPhoto);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Camera App!</Text>
      <Button
        title="Go to Camera"
        onPress={() => navigation.navigate('Camera')}
      />
      {lastPhoto && (
        <Image
          source={{ uri: lastPhoto }}
          style={styles.image}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default HomeScreen;