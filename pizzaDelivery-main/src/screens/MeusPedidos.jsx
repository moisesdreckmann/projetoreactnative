import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AuthUserContext } from '../context/AuthContextLogin'; // Verifique o caminho correto
import AsyncStorage from '@react-native-async-storage/async-storage';

const MeusPedidos = () => {
    const { userId: contextUserId } = useContext(AuthUserContext);
    const [userId, setUserId] = useState(contextUserId);
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUserIdFromStorage = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else if (!contextUserId) {
                    console.error('User ID não disponível.');
                    setError('User ID não disponível.');
                }
            } catch (error) {
                console.error('Erro ao obter User ID do AsyncStorage:', error);
                setError('Erro ao obter User ID.');
            }
        };

        getUserIdFromStorage();
    }, [contextUserId]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('Compras')
            .where('userId', '==', userId)
            .onSnapshot(
                (snapshot) => {
                    const pedidosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Ordena os pedidos pela data
                    pedidosData.sort((a, b) => new Date(b.data) - new Date(a.data));
                    setPedidos(pedidosData);
                    setLoading(false);
                },
                (error) => {
                    console.error('Erro ao buscar pedidos do usuário:', error);
                    setError('Erro ao buscar pedidos do usuário.');
                    setLoading(false);
                }
            );

        return () => unsubscribe(); // Clean up listener on component unmount
    }, [userId]);

    // Função para formatar a data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR'); // Formato dd/mm/yy
    };

    if (loading) {
        return <View style={styles.container}><Text>Carregando...</Text></View>;
    }

    if (error) {
        return <View style={styles.container}><Text>Erro: {error}</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meus Pedidos</Text>
            <FlatList
                data={pedidos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.dateText}>Data do Pedido: {formatDate(item.data)}</Text>
                        {item.itens && item.itens.length > 0 ? (
                            item.itens.map((produto, index) => (
                                <View key={index} style={styles.productContainer}>
                                    <Text style={styles.productText}>Nome do Item: {produto.nome || 'Nome não disponível'}</Text>
                                    <Text style={styles.productText}>Preço: {produto.preco ? produto.preco.toFixed(2) : 'Preço não disponível'}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.productText}>Itens não disponíveis</Text>
                        )}
                        <Text style={styles.totalText}>Total: {item.total || 'Total não disponível'}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FEEBE9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    itemContainer: {
        backgroundColor: '#EAA598', 
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productContainer: {
        backgroundColor: '#F5EEED', 
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    productText: {
        fontSize: 14,
        marginBottom: 4,
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
});

export default MeusPedidos;
