import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function FadeInView({ children, style, duration = 260 }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
  }, []);

  return <Animated.View style={[{ flex: 1, opacity }, style]}>{children}</Animated.View>;
}
