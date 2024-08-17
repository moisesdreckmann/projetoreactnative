import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';

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

  const imagem = async (aluno, urlDevice) => {
    try {
       if (urlDevice !== '') {
        estudante.urlFoto = await sendImageToStorage(urlDevice, estudante);
         if (!estudante.urlFoto) {
          return false; //não deixa salvar ou atualizar se não realizar todos os passpos para enviar a imagem para o storage
         }
       }
      await firestore().collection('alunos').doc(aluno.uid).set(
        {
          nome: aluno.nome,
          curso: aluno.curso,
          urlFoto: aluno.urlFoto,
        },
        {merge: true},
      );
      return true;
    } catch (e) {
      console.error('AlunoProvider, save: ' + e);
      return false;
    }
  };

  return (
    <FirestoreContext.Provider value={{ items, imagem, createItem, updateItem, deleteItem }}>
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => useContext(FirestoreContext);
