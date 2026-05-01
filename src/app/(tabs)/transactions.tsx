import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  SectionList,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H2, BodyMedium, Caption } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { useMonthStore } from '@/store/monthStore';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatAmount } from '@/utils/currency';
import { emptyStates } from '@/constants/copy';
import { haptic } from '@/utils/haptics';
import { stagger, springs } from '@/constants/animations';
import type { Transaction } from '@/db/types';
import type { Category } from '@/db/types';

function TransactionRow({
  transaction,
  category,
  index,
  onPress,
}: {
  transaction: Transaction;
  category: Category | undefined;
  index: number;
  onPress: () => void;
}) {
  const translateX = useSharedValue(-20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(index * stagger, withSpring(0, springs.snappy));
    opacity.value = withDelay(index * stagger, withTiming(1, { duration: 250 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: `${Colors.border}60`,
        }}
        onPress={onPress}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: category ? `${category.color}25` : Colors.surface2,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>{category?.icon ?? '📦'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <BodyMedium>{transaction.merchant || category?.name || 'Expense'}</BodyMedium>
          <Caption>{category?.name}</Caption>
        </View>
        <Text
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 15,
            color: Colors.textPrimary,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatAmount(transaction.amount)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function TransactionsScreen() {
  const { month, year } = useMonthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const categories = useCategories();
  const editSheetRef = useRef<AddExpenseSheetRef>(null);

  const { sections, total } = useTransactions({
    month,
    year,
    categoryId: selectedCategoryId,
    searchQuery,
  });

  const isEmpty = sections.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.sm,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <H2>Transactions</H2>
        <MonthSelector />
      </View>

      <View
        style={{
          marginHorizontal: Spacing.md,
          marginBottom: Spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surface2,
          borderRadius: Radius.sm,
          borderWidth: 1,
          borderColor: Colors.border,
          paddingHorizontal: Spacing.md,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: Colors.textMuted, marginRight: 8, fontSize: 15 }}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search merchant..."
          placeholderTextColor={Colors.textMuted}
          style={{ flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary }}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text style={{ color: Colors.textMuted, fontSize: 18, marginLeft: 8 }}>×</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 48 }}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: 4, gap: 8, flexDirection: 'row' }}
      >
        <Pressable
          onPress={() => { setSelectedCategoryId(undefined); haptic.light(); }}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: Radius.none,
            borderWidth: 1.5,
            borderColor: !selectedCategoryId ? Colors.primary : Colors.border,
            backgroundColor: !selectedCategoryId ? `${Colors.primary}18` : 'transparent',
          }}
        >
          <Text
            style={{
              fontFamily: !selectedCategoryId ? Fonts.semibold : Fonts.regular,
              fontSize: 13,
              color: !selectedCategoryId ? Colors.primary : Colors.textSecondary,
            }}
          >
            All
          </Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => { setSelectedCategoryId(cat.id === selectedCategoryId ? undefined : cat.id); haptic.light(); }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: Radius.none,
              borderWidth: 1.5,
              borderColor: selectedCategoryId === cat.id ? cat.color : Colors.border,
              backgroundColor: selectedCategoryId === cat.id ? `${cat.color}18` : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
            <Text
              style={{
                fontFamily: selectedCategoryId === cat.id ? Fonts.semibold : Fonts.regular,
                fontSize: 12,
                color: selectedCategoryId === cat.id ? cat.color : Colors.textSecondary,
              }}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isEmpty ? (
        <EmptyState
          headline={emptyStates.transactions.headline}
          subtext={emptyStates.transactions.subtext}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: Colors.background }}>
              <Caption>{title}</Caption>
            </View>
          )}
          renderItem={({ item, index }) => (
            <TransactionRow
              transaction={item}
              category={categories.find(c => c.id === item.categoryId)}
              index={index}
              onPress={() => {
                haptic.light();
                editSheetRef.current?.presentEdit(item);
              }}
            />
          )}
          ListFooterComponent={
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <Caption>Total: {formatAmount(total)}</Caption>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          stickySectionHeadersEnabled
        />
      )}

      <AddExpenseSheet ref={editSheetRef} />
    </SafeAreaView>
  );
}
