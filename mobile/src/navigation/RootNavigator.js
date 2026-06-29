import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import MainTabs from "./MainTabs";
import AdminTabs from "./AdminTabs";
import PlaceDetailScreen from "../screens/PlaceDetailScreen";
import DisplayScreen from "../screens/DisplayScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: "fade" }} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ animation: "fade" }} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="Display" component={DisplayScreen} />
    </Stack.Navigator>
  );
}
