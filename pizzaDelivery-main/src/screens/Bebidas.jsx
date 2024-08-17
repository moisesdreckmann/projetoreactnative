import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, Image, StyleSheet, Text, View, StatusBar } from 'react-native';
import logo from '../assets/logo.png';
import bebida1 from '../assets/bebidas/bebida1.png';
import bebida2 from '../assets/bebidas/bebida2.png';
import bebida3 from '../assets/bebidas/bebida3.png';
import Produto from '../components/Produto.jsx';
import Carrinho from '../components/Carrinho.jsx';
import adicionarAoCarrinho from '../funcoes/AdicionarAoCarrinho.js';
import Modal from '../funcoes/Modal.jsx';
import { AuthUserContext } from '../context/AuthContextCarrinho.js';
import firestore from '@react-native-firebase/firestore';
import * as Animatable from 'react-native-animatable';

function Bebidas({ navigation, carrinho, setCarrinho }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [mostrarBebida, setMostrarBebida] = useState([]); 

  const { adicionarAoCarrinho } = useContext(AuthUserContext);

  const getData = async () => {
    try {
      const bebidasCollection = await firestore().collection('Bebidas').get();
      const bebidasData = bebidasCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).map(bebida => ({
        ...bebida,
        valor: Number(bebida.valor) // Garantir que o valor é um número
      }));
      setMostrarBebida(bebidasData);
    } catch (error) {
      console.error('Erro ao buscar bebidas:', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  const openImage = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeImage = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
        <StatusBar backgroundColor="#A60303" barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.header}>
                <Image source={logo} style={styles.logo}/>
            </View>

          {mostrarBebida.map(bebida => (
            <Produto
              key={bebida.id}
              nome={bebida.nome}
              descricao={bebida.descricao}
              valor={bebida.valor}
              imagem={bebida1}
              onPressImg={() => openImage(bebida1)}
              onPress={() => {
                adicionarAoCarrinho({
                  nome: bebida.nome,
                  preco: bebida.valor,
                  testID: bebida.testeId,
                  imagem: bebida.imagem || bebida1
                }, navigation);
                setShowAnimation(true);
              }}
            />
          ))}

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
  },
});

export default Bebidas;
