/**
 * Medical Chat Screen
 * AI Health Assistant powered by Gemini
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Bot, User, Send, AlertTriangle, Plus } from 'lucide-react-native';
import { chatAPI } from '../services/api';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function MedicalChatScreen() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { createSession(); }, []);
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const createSession = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.createSession({ sessionType: 'symptom-check' });
      if (res.success) {
        setSessionId(res.data.session._id);
        setMessages(res.data.session.messages || []);
      }
    } catch (e) {
      console.error('Session creation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    const userMsg = input.trim();
    setInput('');
    setSending(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);

    try {
      const res = await chatAPI.sendMessage(sessionId, userMsg);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.message,
            timestamp: new Date(),
            metadata: res.data.analysis,
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const examplePrompts = [
    'I have a headache and fever',
    'I feel dizzy and nauseous',
    'I have chest pain',
    'I have been coughing for 3 days',
  ];

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Starting chat session...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Bot size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={createSession}>
          <Plus size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyChat}>
            <Bot size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyChatText}>
              Describe your symptoms or ask a health question
            </Text>
            <View style={styles.prompts}>
              {examplePrompts.map((p, i) => (
                <TouchableOpacity key={i} style={styles.promptChip} onPress={() => setInput(p)}>
                  <Text style={styles.promptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {/* Avatar */}
            <View style={[styles.avatar, msg.role === 'user' ? styles.userAvatar : styles.aiAvatar]}>
              {msg.role === 'user' ? <User size={14} color={COLORS.white} /> : <Bot size={14} color={COLORS.white} />}
            </View>
            <View style={[styles.msgContent, msg.role === 'user' ? styles.userMsgContent : styles.aiMsgContent]}>
              {/* Severity */}
              {msg.metadata?.severity && (
                <View style={[styles.severityBadge, msg.metadata.emergency && styles.emergencyBadge]}>
                  {msg.metadata.emergency && <AlertTriangle size={12} color={COLORS.red} />}
                  <Text style={[styles.severityText, msg.metadata.emergency && { color: COLORS.red }]}>
                    Severity: {msg.metadata.severity.toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[styles.msgText, msg.role === 'user' && { color: COLORS.white }]}>
                {msg.content}
              </Text>
              <Text style={[styles.timestamp, msg.role === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>

              {/* Emergency warning */}
              {msg.metadata?.emergency && (
                <View style={styles.emergencyBox}>
                  <AlertTriangle size={14} color={COLORS.red} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.emergencyTitle}>MEDICAL EMERGENCY DETECTED</Text>
                    <Text style={styles.emergencyText}>Please call emergency services immediately (108 in India)</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Typing indicator */}
        {sending && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <View style={[styles.avatar, styles.aiAvatar]}>
              <Bot size={14} color={COLORS.white} />
            </View>
            <View style={styles.aiMsgContent}>
              <View style={styles.typingDots}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your symptoms..."
          placeholderTextColor={COLORS.placeholder}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Send size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        ⚠️ Not a substitute for professional medical advice.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loaderText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40, height: 40, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted },
  newBtn: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
  },

  // Messages
  messages: { flex: 1, backgroundColor: COLORS.background },
  messagesContent: { padding: SPACING.xl, paddingBottom: 8 },
  emptyChat: { alignItems: 'center', paddingVertical: 40 },
  emptyChatText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12, textAlign: 'center', maxWidth: 240 },
  prompts: { marginTop: 20, gap: 8, width: '100%' },
  promptChip: {
    backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  promptText: { fontSize: 13, color: COLORS.textSecondary },

  // Bubble
  bubble: { flexDirection: 'row', marginBottom: SPACING.lg },
  userBubble: { flexDirection: 'row-reverse' },
  aiBubble: {},
  avatar: {
    width: 30, height: 30, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  userAvatar: { backgroundColor: COLORS.primary, marginLeft: 8 },
  aiAvatar: { backgroundColor: COLORS.emerald, marginRight: 8 },
  msgContent: { maxWidth: '78%' },
  userMsgContent: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    borderTopRightRadius: 4, padding: SPACING.md,
  },
  aiMsgContent: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderTopLeftRadius: 4, padding: SPACING.md, ...SHADOWS.sm,
  },
  msgText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  timestamp: { fontSize: 10, color: COLORS.textMuted, marginTop: 6 },

  // Severity
  severityBadge: {
    backgroundColor: COLORS.yellowLight, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  emergencyBadge: { backgroundColor: COLORS.redLight },
  severityText: { fontSize: 10, fontWeight: '800', color: '#D97706' },

  // Emergency
  emergencyBox: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.redLight,
    padding: SPACING.md, borderRadius: RADIUS.md, marginTop: 8, borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
  },
  emergencyTitle: { fontSize: 11, fontWeight: '800', color: COLORS.red },
  emergencyText: { fontSize: 11, color: '#991B1B', marginTop: 2 },

  // Typing dots
  typingDots: { flexDirection: 'row', gap: 4, padding: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  textInput: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: 10, fontSize: 14,
    color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 10, color: COLORS.textMuted, textAlign: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 4,
    backgroundColor: COLORS.card,
  },
});
