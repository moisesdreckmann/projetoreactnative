import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImageResizer from 'react-native-image-resizer';

const FirestoreContext = createContext();

export const FirestoreProvider = ({ collectionName, children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsCollection = await firestore().collection(collectionName).get();
        const itemsData = itemsCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsData);
      } catch (error) {
        console.error(`Erro ao buscar ${collectionName}:`, error);
      }
    };

    fetchItems();
  }, [collectionName]);

  const uploadImageToFirebase = async (uri) => {
    try {
      // Redimensiona a imagem e a converte para PNG
      const resizedImage = await ImageResizer.createResizedImage(
        uri,
        150, // Largura
        200, // Altura
        'PNG', // Formato de compressão
        80 // Qualidade
      );
  
      // Define o caminho do arquivo no Firebase Storage, garantindo que seja um PNG
      const fileName = `foto.png`;  // define explicitamente o nome do arquivo como 'foto.png'
      const storageRef = storage().ref(`images/${fileName}`);
  
      // Faz o upload da imagem redimensionada
      await storageRef.putFile(resizedImage.uri);
  
      // Obtém a URL de download da imagem
      const downloadURL = await storageRef.getDownloadURL();
  
      console.log('URL da imagem:', downloadURL); // Verifique o URL aqui
      return downloadURL;
    } catch (error) {
      console.error('Erro ao redimensionar ou fazer upload da imagem:', error);
      throw error;
    }
  };
  
  const createItem = async (newItem) => {
    try {
      const docRef = await firestore().collection(collectionName).add(newItem);
      const newItemWithId = { id: docRef.id, ...newItem };
      setItems(prevItems => [...prevItems, newItemWithId]);
    } catch (error) {
      console.error(`Erro ao criar ${collectionName}:`, error);
    }
  };

  const updateItem = async (id, updatedItem) => {
    try {
      await firestore().collection(collectionName).doc(id).update(updatedItem);
      setItems(prevItems => prevItems.map(item => item.id === id ? { id, ...updatedItem } : item));
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName}:`, error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await firestore().collection(collectionName).doc(id).delete();
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error(`Erro ao deletar ${collectionName}:`, error);
    }
  };

  return (
    <FirestoreContext.Provider value={{ items, uploadImageToFirebase, createItem, updateItem, deleteItem }}>
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => useContext(FirestoreContext);
