import React, { useState } from 'react';
import { ScrollView, Image, StyleSheet, TouchableOpacity, Text, View, StatusBar, TextInput, Button, ToastAndroid } from 'react-native';
import logo from '../assets/logo.png';
import Produto from '../components/Produto';
import { useFirestore } from '../context/ContextFirestore';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

function Pizzas({ navigation }) {
  const { items: comidas, createItem: createComida, updateItem: updateComida, deleteItem: deleteComida, uploadImageToFirebase } = useFirestore('Comidas');
  const [selectedImage, setSelectedImage] = useState(null);
  const [newComida, setNewComida] = useState({ nome: '', descricao: '', valor: '', imageUri: '' });
  const [selectedComida, setSelectedComida] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageSelection = async (type) => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 1,
      };
  
      let response;
      if (type === 'camera') {
        response = await launchCamera(options);
      } else {
        response = await launchImageLibrary(options);
      }
  
      if (response.didCancel) {
        ToastAndroid.show('Você cancelou a seleção.', ToastAndroid.LONG);
      } else if (response.errorCode) {
        ToastAndroid.show('Erro ao selecionar a imagem.', ToastAndroid.LONG);
      } else {
        const path = response.assets[0].uri;
        const imageUrl = await uploadImageToFirebase(path);
        
        if (!imageUrl) throw new Error('Falha no upload da imagem');
  
        if (isEditing && selectedComida) {
          const updatedComida = { ...selectedComida, imageUri: imageUrl };
          setSelectedComida(updatedComida);  // Atualiza o estado imediatamente
          await updateComida(updatedComida.id, updatedComida);  // Atualiza no Firestore
        } else {
          setNewComida({ ...newComida, imageUri: imageUrl });
        }
      }
    } catch (error) {
      console.error("Erro na seleção ou upload de imagem: ", error);
      ToastAndroid.show('Erro ao processar a imagem. Tente novamente.', ToastAndroid.LONG);
    }
  };

  const handleCreateComida = async () => {
    try {
      await createComida({ ...newComida, valor: parseFloat(newComida.valor) || 0 });
      setNewComida({ nome: '', descricao: '', valor: '', imageUri: '' });
    } catch (error) {
      console.error('Erro ao criar comida:', error);
    }
  };

  const handleUpdateComida = async () => {
    if (selectedComida) {
      try {
        await updateComida(selectedComida.id, { ...selectedComida, valor: parseFloat(selectedComida.valor) || 0 });
        setSelectedComida(null);
        setIsEditing(false);
      } catch (error) {
        console.error('Erro ao atualizar comida:', error);
      }
    }
  };

  const handleDeleteComida = async (id) => {
    try {
      await deleteComida(id);
    } catch (error) {
      console.error('Erro ao deletar comida:', error);
    }
  };

  const startEditing = (comida) => {
    setSelectedComida(comida);
    setIsEditing(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#A60303" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
        </View>

        {comidas.map(comida => (
          <View key={comida.id} style={styles.comidaContainer}>
            <View style={styles.header}>
              <Image
                source={{
                  uri: comida.imageUri || 'https://firebasestorage.googleapis.com/v0/b/ipizza-aec6e.appspot.com/o/foto.png?alt=media&token=61e34d50-662a-4f90-b476-3f3f7c4ca5fc',
                }}
                style={styles.image}
              />
            </View>
            <Produto
              nome={comida.nome}
              descricao={comida.descricao}
              valor={Number(comida.valor) || 0}
            />
            <TouchableOpacity style={styles.button} onPress={() => startEditing(comida)}>
              <Text style={styles.buttonText}>Alterar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteComida(comida.id)}>
              <Text style={styles.buttonText}>Deletar</Text>
            </TouchableOpacity>
            {isEditing && selectedComida && selectedComida.id === comida.id && (
              <>
                <TouchableOpacity style={styles.button} onPress={() => handleImageSelection('camera')}>
                  <Text style={styles.buttonText}>Tirar Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleImageSelection('library')}>
                  <Text style={styles.buttonText}>Escolher da Galeria</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      {!isEditing && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={newComida.nome}
            onChangeText={(text) => setNewComida({ ...newComida, nome: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={newComida.descricao}
            onChangeText={(text) => setNewComida({ ...newComida, descricao: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Valor"
            keyboardType="numeric"
            value={newComida.valor}
            onChangeText={(text) => setNewComida({ ...newComida, valor: text })}
          />
          <Button title="Criar Comida" onPress={handleCreateComida} />
        </View>
      )}

      {selectedComida && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={selectedComida.nome}
            onChangeText={(text) => setSelectedComida({ ...selectedComida, nome: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={selectedComida.descricao}
            onChangeText={(text) => setSelectedComida({ ...selectedComida, descricao: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Valor"
            keyboardType="numeric"
            value={selectedComida.valor.toString()}
            onChangeText={(text) => setSelectedComida({ ...selectedComida, valor: text })}
          />
          <Button title="Salvar Alterações" onPress={handleUpdateComida} />
        </View>
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
  formContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  comidaContainer: {
    marginBottom: 20,
  },
  image: {
    width: 325,
    height: 150,
    resizeMode: 'cover',
  },
});

export default Pizzas;
