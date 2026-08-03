import React, { useState, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import type { Workspace } from '@/db/types';

export interface WorkspaceSheetRef {
  present: () => void;
  dismiss: () => void;
}

const RECOMMENDED_WORKSPACES = ['Personal', 'Household', 'Japan Trip', 'Business', 'Family Support'];

export const WorkspaceSheet = forwardRef<WorkspaceSheetRef>((_, ref) => {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const workspaces = useLumaStore(s => s.workspaces);
  const currentWorkspaceId = useLumaStore(s => s.currentWorkspaceId);
  const switchWorkspace = useLumaStore(s => s.switchWorkspace);
  const addWorkspace = useLumaStore(s => s.addWorkspace);
  const deleteWorkspace = useLumaStore(s => s.deleteWorkspace);

  const [mode, setMode] = useState<'picker' | 'create'>('picker');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const workspaceNames = workspaces.map(ws => ws.name.toLowerCase());
  const suggestions = RECOMMENDED_WORKSPACES.filter(
    name => !workspaceNames.includes(name.toLowerCase())
  );

  useImperativeHandle(ref, () => ({
    present: () => {
      setMode('picker');
      setNewName('');
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const handleSwitch = useCallback(async (ws: Workspace) => {
    if (ws.id === currentWorkspaceId) {
      sheetRef.current?.dismiss();
      return;
    }
    haptic.light();
    await switchWorkspace(ws.id);
    sheetRef.current?.dismiss();
  }, [currentWorkspaceId, switchWorkspace]);

  const handleCreate = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);
    haptic.success();
    const ws = await addWorkspace({ name: trimmed });
    await switchWorkspace(ws.id);
    setSaving(false);
    sheetRef.current?.dismiss();
  }, [newName, addWorkspace, switchWorkspace]);

  const handleCreateSuggestion = useCallback(async (name: string) => {
    if (saving) return;
    setSaving(true);
    haptic.success();
    const ws = await addWorkspace({ name });
    await switchWorkspace(ws.id);
    setSaving(false);
    sheetRef.current?.dismiss();
  }, [saving, addWorkspace, switchWorkspace]);

  const handleDelete = useCallback((ws: Workspace) => {
    if (workspaces.length <= 1) return;
    Alert.alert(
      `Delete "${ws.name}"?`,
      'All data in this workspace will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptic.warning();
            await deleteWorkspace(ws.id);
          },
        },
      ]
    );
  }, [workspaces.length, deleteWorkspace]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={mode === 'create' ? ['44%'] : ['46%']}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'picker' ? (
          <>
            {/* Header */}
            <View
              style={{
                paddingHorizontal: Spacing.md,
                paddingBottom: Spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 16, color: colors.textPrimary }}>
                Switch workspace
              </Text>
            </View>

            {/* Workspace rows */}
            {workspaces.map(ws => {
              const isActive = ws.id === currentWorkspaceId;
              return (
                <Pressable
                  key={ws.id}
                  onPress={() => handleSwitch(ws)}
                  onLongPress={() => handleDelete(ws)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: Spacing.md,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: isActive ? `${colors.primary}14` : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: isActive ? Fonts.semibold : Fonts.regular,
                      fontSize: 15,
                      color: isActive ? colors.primary : colors.textPrimary,
                    }}
                  >
                    {ws.name}
                  </Text>
                  {isActive && (
                    <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
                  )}
                </Pressable>
              );
            })}

            {/* New workspace row */}
            <Pressable
              onPress={() => setMode('create')}
              style={{
                paddingHorizontal: Spacing.md,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.textSecondary }}>
                Create workspace
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={{ paddingHorizontal: Spacing.md }}>
            <Text style={{ fontFamily: Fonts.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: Spacing.md, marginTop: Spacing.sm }}>
              Create workspace
            </Text>

            {suggestions.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md }}>
                {suggestions.map(name => (
                  <Pressable
                    key={name}
                    onPress={() => handleCreateSuggestion(name)}
                    disabled={saving}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: Radius.full,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface2,
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textPrimary }}>
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <BottomSheetTextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Business"
              placeholderTextColor={colors.textSecondary}
              maxLength={24}
              style={{
                backgroundColor: colors.surface2,
                borderRadius: Radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: Spacing.md,
                paddingVertical: 14,
                fontFamily: Fonts.regular,
                fontSize: 16,
                color: colors.textPrimary,
                marginBottom: Spacing.lg,
              }}
            />

            <Button
              onPress={handleCreate}
              disabled={!newName.trim() || saving}
              fullWidth
            >
              {saving ? 'Creating…' : 'Create workspace'}
            </Button>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

WorkspaceSheet.displayName = 'WorkspaceSheet';
