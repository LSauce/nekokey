import { useMisskeyApi } from '@/lib/contexts/MisskeyApiContext';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Note as NoteType } from 'misskey-js/built/entities';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface NoteProps {
  note: NoteType;
  onReply?: () => void;
}

export function Note({ note, onReply }: NoteProps) {
  const [isLiked, setIsLiked] = useState(!!note.myReaction);
  const [likeCount, setLikeCount] = useState(note.reactions?.['👍'] || 0);
  const { api } = useMisskeyApi();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return api?.request('notes/reactions/delete', {
          noteId: note.id,
        });
      } else {
        return api?.request('notes/reactions/create', {
          noteId: note.id,
          reaction: '👍',
        });
      }
    },
    onSuccess: () => {
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
    onError: () => {
      Alert.alert('操作失败', '请稍后重试');
    },
  });

  const renoteMutation = useMutation({
    mutationFn: () => {
      if (!api) throw new Error('API not initialized');
      return api.request('notes/create', {
        renoteId: note.id,
      });
    },
    onSuccess: () => {
      Alert.alert('转发成功');
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
    onError: () => {
      Alert.alert('转发失败', '请稍后重试');
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleRenote = () => {
    renoteMutation.mutate();
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={{ uri: note.user.avatarUrl || '' }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold">{note.user.name}</ThemedText>
          <ThemedText style={styles.username}>@{note.user.username}</ThemedText>
          <ThemedText style={styles.time}>
            {formatDistanceToNow(new Date(note.createdAt), { locale: zhCN, addSuffix: true })}
          </ThemedText>
        </View>

        <ThemedText style={styles.text}>{note.text}</ThemedText>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={onReply}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <ThemedText style={styles.actionText}>回复</ThemedText>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleRenote}>
            <Ionicons name="repeat-outline" size={20} color="#666" />
            <ThemedText style={styles.actionText}>转发</ThemedText>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#ff4081' : '#666'}
            />
            {likeCount > 0 && <ThemedText style={styles.actionText}>{likeCount}</ThemedText>}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    marginLeft: 4,
    color: '#666',
  },
  time: {
    marginLeft: 'auto',
    color: '#666',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
});
