import React, { useState, useRef } from 'react';
import {
  View,
  SectionList,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H2, Caption } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { MultiMonthPickerModal } from '@/components/ui/MultiMonthPickerModal';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatAmount } from '@/utils/currency';
import { getMonthLabel } from '@/utils/dates';
import { emptyStates } from '@/constants/copy';
import { haptic } from '@/utils/haptics';
import { TransactionRow } from '@/components/ui/TransactionRow';

function currentMonthEntry() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function TransactionsScreen() {
  const [selectedMonths, setSelectedMonths] = useState([currentMonthEntry()]);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const categories = useCategories();
  const editSheetRef = useRef<AddExpenseSheetRef>(null);

  const { sections, total } = useTransactions({
    months: selectedMonths,
    categoryId: selectedCategoryId,
    searchQuery,
  });

  const toggleMonth = (month: number, year: number) => {
    setSelectedMonths(prev => {
      const exists = prev.some(m => m.month === month && m.year === year);
      if (exists) {
        return prev.filter(m => !(m.month === month && m.year === year));
      }
      return [...prev, { month, year }].sort((a, b) =>
        a.year !== b.year ? b.year - a.year : b.month - a.month
      );
    });
  };

  const clearMonths = () => setSelectedMonths([]);

  const monthLabel =
    selectedMonths.length === 0
      ? 'All time'
      : selectedMonths.length === 1
      ? getMonthLabel(selectedMonths[0].month, selectedMonths[0].year)
      : `${selectedMonths.length} months`;

  const isEmpty = sections.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
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
        <Pressable
          onPress={() => { haptic.light(); setMonthPickerVisible(true); }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface2,
            borderRadius: Radius.full,
            paddingHorizontal: 12,
            paddingVertical: 5,
            gap: 5,
          }}
        >
          <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.textPrimary }}>
            {monthLabel}
          </Text>
          <Ionicons name="chevron-down" size={11} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Search bar */}
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

      {/* Category filter chips */}
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

      <MultiMonthPickerModal
        visible={monthPickerVisible}
        selectedMonths={selectedMonths}
        onToggle={toggleMonth}
        onClear={clearMonths}
        onClose={() => setMonthPickerVisible(false)}
      />
      <AddExpenseSheet ref={editSheetRef} />
    </SafeAreaView>
  );
}
