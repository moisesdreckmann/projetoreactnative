import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, Image, StyleSheet, TouchableOpacity, Text, View, StatusBar } from 'react-native';
import logo from '../assets/logo.png';
import * as Animatable from 'react-native-animatable';
import firestore from '@react-native-firebase/firestore';

import pizza1 from '../assets/pizzas/pizza1.jpg';
import pizza2 from '../assets/pizzas/pizza2.webp';
import pizza3 from '../assets/pizzas/pizza3.jpg';
import pizza4 from '../assets/pizzas/pizza4.jpg';

import Produto from '../components/Produto.jsx';
import Carrinho from '../components/Carrinho.jsx';

import adicionarAoCarrinho from '../funcoes/AdicionarAoCarrinho.js';
import { useCarrinho } from '../funcoes/AdicionarAoCarrinho.js';
import Modal from '../funcoes/Modal.jsx';
import { AuthUserContext } from '../context/AuthContextCarrinho.js';
import { ReactNativeFirebase } from '@react-native-firebase/app';
import { firebase } from '@react-native-firebase/auth';

function Pizzas({ navigation, route }) {

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);

  const { adicionarAoCarrinho } = useContext(AuthUserContext);
  const [mostrarComida, setMostrarComida] = useState([]); 

  const getData = async () => {
    try {
      const comidasCollection = await firestore().collection('Comidas').get();
      const comidasData = comidasCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).map(comida => ({
        ...comida,
        valor: Number(comida.valor) // Garantir que o valor é um número
      }));
      setMostrarComida(comidasData);
    } catch (error) {
      console.error('Erro ao buscar comida:', error);
    }
  };
  
  
  useEffect(() => {
    getData();
  }, []);
  

  const openImage = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeImage = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  return (
    <View style={styles.container}>
        <StatusBar backgroundColor="#A60303" barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.header}>
                <Image source={logo} style={styles.logo}/>
            </View>

          {mostrarComida.map(comida => {
            return (
            <Produto
              key={comida.id}
              nome={comida.nome}
              descricao={comida.descricao}
              valor={comida.valor}
              imagem={pizza1}
              onPressImg={() => openImage(pizza1)}
              onPress={() => {

                adicionarAoCarrinho({
                  nome: comida.nome,
                  preco: comida.valor,
                  testID: comida.testeId,
                  imagem: pizza1
                }, navigation); 
                setShowAnimation(true);
              }}
              />
            );
          })}


        <Modal visible={modalVisible} image={selectedImage} onClose={closeImage} />
        </ScrollView>
      
        <Carrinho
            onPress={() => navigation.navigate('Carrinho', { items: carrinho })}
        />

        {showAnimation && (
        <Animatable.View animation="bounce" duration={500} style={styles.animation}>
            <Text style={styles.textAnimation}>Adicionado ao carrinho!</Text>
        </Animatable.View>
        )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEEBE9', 
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 30,
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  carrinho: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  animation: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FAA916',
    padding: 10,
    borderRadius: 10,
  },
  textAnimation: {
    color: 'white',
  }

});

export default Pizzas;
