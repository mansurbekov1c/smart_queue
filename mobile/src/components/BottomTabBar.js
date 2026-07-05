import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { fonts, radius } from "../theme/typography";

const ICONS = {
  Home: ["home", "home-outline"],
  Search: ["search", "search-outline"],
  MyQueue: ["clipboard", "clipboard-outline"],
  Profile: ["person", "person-outline"],
  AdminHome: ["home", "home-outline"],
  AdminStats: ["bar-chart", "bar-chart-outline"],
  AdminProfile: ["person-circle", "person-circle-outline"],
  SuperAdminHome: ["home", "home-outline"],
  SuperAdminStats: ["bar-chart", "bar-chart-outline"],
  SuperAdminProfile: ["person-circle", "person-circle-outline"],
};

const LABEL_KEYS = {
  Home: "navHome",
  Search: "navSearch",
  MyQueue: "navQueue",
  Profile: "navProfile",
  AdminHome: "navHome",
  AdminStats: "navAdminStats",
  AdminProfile: "navProfile",
  SuperAdminHome: "navHome",
  SuperAdminStats: "navAdminStats",
  SuperAdminProfile: "navProfile",
};

export default function BottomTabBar({ state, navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.tabBarBg,
          borderColor: colors.tabBarBorder,
          bottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const [activeIcon, inactiveIcon] = ICONS[route.name] || ["ellipse", "ellipse-outline"];
        const color = focused ? colors.accent : colors.tabInactive;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(route.name)}
          >
            <Ionicons name={focused ? activeIcon : inactiveIcon} size={21} color={color} />
            <Text style={[styles.label, { color, fontFamily: focused ? fonts.bold : fonts.semibold }]}>
              {t(LABEL_KEYS[route.name])}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderRadius: radius.xxl,
    borderWidth: 1,
    shadowColor: "#1e3a5f",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  tab: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 2, paddingHorizontal: 8 },
  label: { fontSize: 10.5 },
});
