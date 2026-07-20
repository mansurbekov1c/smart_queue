import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTabBar from "../components/BottomTabBar";
import AdminPanelScreen from "../screens/AdminPanelScreen";
import AdminStatsScreen from "../screens/AdminStatsScreen";
import AdminProfileScreen from "../screens/AdminProfileScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      backBehavior="history"
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tab.Screen name="AdminHome" component={AdminPanelScreen} />
      <Tab.Screen name="AdminStats" component={AdminStatsScreen} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}
