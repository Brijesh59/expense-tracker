import React, { useState, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H3, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import type { Category } from '@/db/types';

export interface CategoryFormSheetRef {
  present: (existing?: Category) => void;
  dismiss: () => void;
}

interface CategoryFormSheetProps {
  onSaved?: () => void;
}

const EMOJI_OPTIONS = [
  '🍔','🍕','🍜','🍣','☕','🧃','🍺','🛍️','👗','👟','💄',
  '🚕','🚌','✈️','🚂','⛽','🏠','⚡','💧','📱','💻','🎬',
  '🎮','🎵','📚','🏋️','💊','🏥','🐾','🌿','🎁','💸','📦',
  '🛒','🔧','🏦','💼','🎓','🌍','🏖️','🎨','🐱',
];

const COLOR_OPTIONS = [
  '#FF6B6B','#F59E6B','#F7DC6F','#4ECDC4','#7C6AF7',
  '#4FC3F7','#BA68C8','#81C784','#A1887F','#66BB6A',
  '#FF8A65','#4DB6AC','#9575CD','#F06292','#8888A8',
];

export const CategoryFormSheet = forwardRef<CategoryFormSheetRef, CategoryFormSheetProps>(
  ({ onSaved }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const addCategory = useLumaStore(s => s.addCategory);
    const updateCategory = useLumaStore(s => s.updateCategory);
    const deleteCategory = useLumaStore(s => s.deleteCategory);

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📦');
    const [color, setColor] = useState(Colors.primary);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useImperativeHandle(ref, () => ({
      present: (existing?: Category) => {
        if (existing) {
          setEditingCategory(existing);
          setName(existing.name);
          setIcon(existing.icon);
          setColor(existing.color);
        } else {
          setEditingCategory(null);
          setName('');
          setIcon('📦');
          setColor(Colors.primary);
        }
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const handleSave = useCallback(async () => {
      if (!name.trim() || saving) return;
      setSaving(true);
      haptic.medium();
      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, { name: name.trim(), icon, color });
        } else {
          await addCategory({ name: name.trim(), icon, color });
        }
        sheetRef.current?.dismiss();
        onSaved?.();
      } catch (e) {
        console.error('Category save error:', e);
      } finally {
        setSaving(false);
      }
    }, [name, icon, color, saving, editingCategory]);

    const handleDelete = useCallback(async () => {
      if (!editingCategory || deleting) return;
      setDeleting(true);
      haptic.warning();
      try {
        await deleteCategory(editingCategory.id);
        sheetRef.current?.dismiss();
        onSaved?.();
      } catch (e) {
        console.error('Category delete error:', e);
      } finally {
        setDeleting(false);
      }
    }, [editingCategory, deleting]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['85%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors.surface }}
        handleIndicatorStyle={{ backgroundColor: Colors.border, width: 40 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 40, paddingTop: 8 }}
        >
          <H3 style={{ marginBottom: Spacing.lg }}>
            {editingCategory ? 'Edit category' : 'New category'}
          </H3>

          {/* Preview */}
          <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: `${color}25`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: `${color}50`,
            }}>
              <Text style={{ fontSize: 32 }}>{icon}</Text>
            </View>
            <Caption style={{ marginTop: 6 }}>{name || 'Category name'}</Caption>
          </View>

          {/* Name */}
          <Caption style={{ marginBottom: 8 }}>Name</Caption>
          <View style={{
            backgroundColor: Colors.surface2,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.md,
            paddingVertical: 12,
            marginBottom: Spacing.lg,
          }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Dining, Gym, Pets..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
              style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary }}
            />
          </View>

          {/* Icon picker */}
          <Caption style={{ marginBottom: 10 }}>Icon</Caption>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg }}>
            {EMOJI_OPTIONS.map(e => (
              <Pressable
                key={e}
                onPress={() => { setIcon(e); haptic.light(); }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: icon === e ? `${color}25` : Colors.surface2,
                  borderWidth: 1.5,
                  borderColor: icon === e ? color : 'transparent',
                }}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          {/* Color picker */}
          <Caption style={{ marginBottom: 10 }}>Color</Caption>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.xl }}>
            {COLOR_OPTIONS.map(c => (
              <Pressable
                key={c}
                onPress={() => { setColor(c); haptic.light(); }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: color === c ? 3 : 0,
                  borderColor: Colors.textPrimary,
                  opacity: color === c ? 1 : 0.7,
                }}
              >
                {color === c && (
                  <Text style={{ color: '#fff', fontSize: 14, fontFamily: Fonts.bold }}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>

          <Button
            onPress={handleSave}
            disabled={!name.trim()}
            loading={saving}
            fullWidth
            size="lg"
          >
            {editingCategory ? 'Update category' : 'Add category'}
          </Button>

          {editingCategory && (
            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              style={{ alignItems: 'center', paddingVertical: Spacing.md }}
            >
              <Text style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: deleting ? Colors.textMuted : Colors.red,
              }}>
                {deleting ? 'Deleting...' : 'Delete category'}
              </Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);
