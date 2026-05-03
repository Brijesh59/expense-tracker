import React, { useState, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { CURRENCY_LIST, type Currency, type CurrencyCode } from '@/utils/currency';

export interface CurrencyPickerSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface Props {
  selected: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
}

export const CurrencyPickerSheet = forwardRef<CurrencyPickerSheetRef, Props>(
  ({ selected, onSelect }, ref) => {
    const { colors } = useTheme();
    const sheetRef = useRef<BottomSheetModal>(null);
    const [query, setQuery] = useState('');

    useImperativeHandle(ref, () => ({
      present: () => { setQuery(''); sheetRef.current?.present(); },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const filtered = query.trim()
      ? CURRENCY_LIST.filter(
          c =>
            c.code.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase())
        )
      : CURRENCY_LIST;

    const handleSelect = useCallback(
      (code: CurrencyCode) => {
        onSelect(code);
        sheetRef.current?.dismiss();
      },
      [onSelect]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      []
    );

    const renderItem = useCallback(
      ({ item }: { item: Currency }) => {
        const isSelected = item.code === selected;
        return (
          <Pressable
            onPress={() => handleSelect(item.code)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.md,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: isSelected ? `${colors.primary}12` : 'transparent',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isSelected ? `${colors.primary}20` : colors.surface2,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: 13,
                  color: isSelected ? colors.primary : colors.textSecondary,
                }}
              >
                {item.symbol}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: isSelected ? Fonts.semibold : Fonts.medium,
                  fontSize: 15,
                  color: isSelected ? colors.primary : colors.textPrimary,
                }}
              >
                {item.code}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                {item.name}
              </Text>
            </View>

            {isSelected && (
              <Ionicons name="checkmark" size={18} color={colors.primary} />
            )}
          </Pressable>
        );
      },
      [selected, colors, handleSelect]
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['75%']}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border, width: 36 }}
      >
        {/* Header + search */}
        <View
          style={{
            paddingHorizontal: Spacing.md,
            paddingBottom: Spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
          }}
        >
          <Text style={{ fontFamily: Fonts.semibold, fontSize: 16, color: colors.textPrimary }}>
            Currency
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface2,
              borderRadius: 10,
              paddingHorizontal: 10,
              gap: 8,
            }}
          >
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <BottomSheetTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search currencies..."
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                fontFamily: Fonts.regular,
                fontSize: 15,
                color: colors.textPrimary,
                paddingVertical: 10,
              }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <BottomSheetFlatList
          data={filtered}
          keyExtractor={item => item.code}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.textMuted }}>
                No currencies found
              </Text>
            </View>
          }
        />
      </BottomSheetModal>
    );
  }
);
