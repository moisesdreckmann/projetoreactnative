import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import TabRouter from './src/navigation/TabRouter.js';
import 'react-native-gesture-handler';
import { AuthUserProvider } from './src/context/AuthContextCarrinho.js'
import { AuthUserProvider as AuthUserProviderLogin  } from './src/context/AuthContextLogin.js'

function App() {
  return (
    <NavigationContainer>
      <AuthUserProviderLogin>
        <AuthUserProvider> 
          <TabRouter/>
        </AuthUserProvider>
      </AuthUserProviderLogin>
    </NavigationContainer>
  );
}

export default App;
