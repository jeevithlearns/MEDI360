/**
 * App Navigator
 * Bottom tab navigation with nested stacks
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard, UtensilsCrossed, Dumbbell,
  Stethoscope, MessageCircle,
} from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import FoodTrackingScreen from '../screens/FoodTrackingScreen';
import ExerciseTrackingScreen from '../screens/ExerciseTrackingScreen';
import WeightGoalScreen from '../screens/WeightGoalScreen';
import HealthProfileScreen from '../screens/HealthProfileScreen';
import MedicalChatScreen from '../screens/MedicalChatScreen';
import MedicalHubScreen from '../screens/MedicalHubScreen';
import PrescriptionUploadScreen from '../screens/PrescriptionUploadScreen';
import MedicineReminderScreen from '../screens/MedicineReminderScreen';
import DrugSafetyScreen from '../screens/DrugSafetyScreen';

import { COLORS, RADIUS } from '../theme';

const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();
const MedicalStack = createNativeStackNavigator();

// ── Dashboard Stack ──
function DashboardStackNavigator() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashStack.Screen name="WeightGoal" component={WeightGoalScreen} />
      <DashStack.Screen name="HealthProfile" component={HealthProfileScreen} />
    </DashStack.Navigator>
  );
}

// ── Medical Stack ──
function MedicalStackNavigator() {
  return (
    <MedicalStack.Navigator screenOptions={{ headerShown: false }}>
      <MedicalStack.Screen name="MedicalHub" component={MedicalHubScreen} />
      <MedicalStack.Screen name="MedicineReminder" component={MedicineReminderScreen} />
      <MedicalStack.Screen name="PrescriptionUpload" component={PrescriptionUploadScreen} />
      <MedicalStack.Screen name="DrugSafety" component={DrugSafetyScreen} />
    </MedicalStack.Navigator>
  );
}

// ── Main Tab Navigator ──
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = 22;
          switch (route.name) {
            case 'Dashboard':
              return <LayoutDashboard size={iconSize} color={color} />;
            case 'Food':
              return <UtensilsCrossed size={iconSize} color={color} />;
            case 'Exercise':
              return <Dumbbell size={iconSize} color={color} />;
            case 'MedicalTab':
              return <Stethoscope size={iconSize} color={color} />;
            case 'Chat':
              return <MessageCircle size={iconSize} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Food"
        component={FoodTrackingScreen}
        options={{ tabBarLabel: 'Food' }}
      />
      <Tab.Screen
        name="Exercise"
        component={ExerciseTrackingScreen}
        options={{ tabBarLabel: 'Exercise' }}
      />
      <Tab.Screen
        name="MedicalTab"
        component={MedicalStackNavigator}
        options={{ tabBarLabel: 'Medical' }}
      />
      <Tab.Screen
        name="Chat"
        component={MedicalChatScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
    </Tab.Navigator>
  );
}
