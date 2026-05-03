import React, { useState, useRef } from 'react';
import {
  View,
  SectionList,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Caption } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { MultiMonthPickerModal } from '@/components/ui/MultiMonthPickerModal';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { getMonthLabel } from '@/utils/dates';
import { emptyStates } from '@/constants/copy';
import { haptic } from '@/utils/haptics';
import { TransactionRow } from '@/components/ui/TransactionRow';

const SHEET_HEIGHT = Dimensions.get('window').height * 0.55;

function currentMonthEntry() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { format } = useCurrency();
  const insets = useSafeAreaInsets();
  const [selectedMonths, setSelectedMonths] = useState([currentMonthEntry()]);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [catPickerVisible, setCatPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categories = useCategories();
  const editSheetRef = useRef<AddExpenseSheetRef>(null);
  const catSheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const pill = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface2,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const { sections, total } = useTransactions({
    months: selectedMonths,
    categoryId: selectedCategoryId,
    searchQuery,
  });

  const openCatPicker = () => {
    haptic.light();
    setCatPickerVisible(true);
    Animated.timing(catSheetAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closeCatPicker = () => {
    Animated.timing(catSheetAnim, { toValue: SHEET_HEIGHT, duration: 220, useNativeDriver: true }).start(
      () => setCatPickerVisible(false)
    );
  };

  const toggleMonth = (month: number, year: number) => {
    setSelectedMonths(prev => {
      const exists = prev.some(m => m.month === month && m.year === year);
      if (exists) return prev.filter(m => !(m.month === month && m.year === year));
      return [...prev, { month, year }].sort((a, b) =>
        a.year !== b.year ? b.year - a.year : b.month - a.month
      );
    });
  };

  const monthLabel =
    selectedMonths.length === 0
      ? 'All time'
      : selectedMonths.length === 1
      ? getMonthLabel(selectedMonths[0].month, selectedMonths[0].year)
      : `${selectedMonths.length} months`;

  const selectedCat = categories.find(c => c.id === selectedCategoryId);

  const ListHeader = (
    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <Text style={{ fontSize: 34, fontFamily: Fonts.bold, color: colors.textPrimary, marginBottom: Spacing.md }}>
        Transactions
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.sm }}>
        <Pressable onPress={() => { haptic.light(); setMonthPickerVisible(true); }} style={pill}>
          <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textPrimary }}>{monthLabel}</Text>
          <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={openCatPicker}
          style={[pill, selectedCategoryId ? { borderColor: colors.primary } : {}]}
        >
          {selectedCat && <Text style={{ fontSize: 13 }}>{selectedCat.icon}</Text>}
          <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: selectedCategoryId ? colors.primary : colors.textPrimary }}>
            {selectedCat ? selectedCat.name : 'Category'}
          </Text>
          <Ionicons name="chevron-down" size={11} color={selectedCategoryId ? colors.primary : colors.textSecondary} />
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface2,
          borderRadius: Radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: Spacing.md,
          paddingVertical: 10,
          marginBottom: Spacing.sm,
        }}
      >
        <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: colors.textPrimary }}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text style={{ color: colors.textMuted, fontSize: 18, marginLeft: 8 }}>×</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState headline={emptyStates.transactions.headline} subtext={emptyStates.transactions.subtext} />
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: colors.background }}>
            <Caption>{title}</Caption>
          </View>
        )}
        renderItem={({ item, index }) => (
          <TransactionRow
            transaction={item}
            category={categories.find(c => c.id === item.categoryId)}
            index={index}
            onPress={() => { haptic.light(); editSheetRef.current?.presentEdit(item); }}
          />
        )}
        ListFooterComponent={
          sections.length > 0 ? (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <Caption>Total: {format(total)}</Caption>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 140 }}
        stickySectionHeadersEnabled
      />

      <Modal visible={catPickerVisible} transparent animationType="none" onRequestClose={closeCatPicker}>
        <Pressable
          onPress={closeCatPicker}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
        >
          <Pressable onPress={() => {}}>
            <Animated.View
              style={{
                transform: [{ translateY: catSheetAnim }],
                height: SHEET_HEIGHT,
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden',
              }}
            >
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 16, color: colors.textPrimary }}>
                  Filter by category
                </Text>
                {selectedCategoryId && (
                  <Pressable onPress={() => { haptic.light(); setSelectedCategoryId(undefined); closeCatPicker(); }}>
                    <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.primary }}>Clear</Text>
                  </Pressable>
                )}
              </View>

              <FlatList
                data={[{ id: '__all__', name: 'All categories', icon: '', color: '' }, ...categories]}
                keyExtractor={c => c.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
                renderItem={({ item }) => {
                  const isAll = item.id === '__all__';
                  const selected = isAll ? !selectedCategoryId : selectedCategoryId === item.id;
                  return (
                    <Pressable
                      onPress={() => {
                        haptic.light();
                        setSelectedCategoryId(isAll ? undefined : item.id);
                        closeCatPicker();
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: Spacing.md,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: selected ? `${colors.primary}14` : 'transparent',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {!isAll && <Text style={{ fontSize: 18 }}>{item.icon}</Text>}
                        <Text style={{ fontFamily: selected ? Fonts.semibold : Fonts.regular, fontSize: 15, color: selected ? colors.primary : colors.textPrimary }}>
                          {item.name}
                        </Text>
                      </View>
                      {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                    </Pressable>
                  );
                }}
              />
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      <MultiMonthPickerModal
        visible={monthPickerVisible}
        selectedMonths={selectedMonths}
        onToggle={toggleMonth}
        onClear={() => setSelectedMonths([])}
        onClose={() => setMonthPickerVisible(false)}
      />
      <AddExpenseSheet ref={editSheetRef} />
    </SafeAreaView>
  );
}
