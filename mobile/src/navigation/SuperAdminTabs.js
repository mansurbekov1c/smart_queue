import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTabBar from "../components/BottomTabBar";
import SuperAdminHomeScreen from "../screens/SuperAdminHomeScreen";
import SuperAdminStatsScreen from "../screens/SuperAdminStatsScreen";
import SuperAdminProfileScreen from "../screens/SuperAdminProfileScreen";

const Tab = createBottomTabNavigator();

export default function SuperAdminTabs() {
  return (
    <Tab.Navigator
      backBehavior="history"
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tab.Screen name="SuperAdminHome" component={SuperAdminHomeScreen} />
      <Tab.Screen name="SuperAdminStats" component={SuperAdminStatsScreen} />
      <Tab.Screen name="SuperAdminProfile" component={SuperAdminProfileScreen} />
    </Tab.Navigator>
  );
}
