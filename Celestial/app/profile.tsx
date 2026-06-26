import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
  Platform, Linking, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../store/authStore';
import { useSubscription } from '../hooks/useSubscription';
import { openBillingPortal, PLANS } from '../lib/stripe';
import { getZodiacSign, getZodiacInfo } from '../constants/zodiac';
import { calculateBirthChart } from '../lib/astrology';
import StarField from '../components/StarField';
import CosmicCard from '../components/CosmicCard';
import GlowButton from '../components/GlowButton';
import { Colors, FontSizes, Spacing, BorderRadius } from '../constants/theme';

// ── Major cities list (same as onboarding) ──────────────────────────────────
const CITIES = [
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA',
  'Phoenix, USA', 'Philadelphia, USA', 'San Antonio, USA', 'San Diego, USA',
  'Dallas, USA', 'San Jose, USA', 'Austin, USA', 'Jacksonville, USA',
  'Fort Worth, USA', 'Columbus, USA', 'Charlotte, USA', 'Indianapolis, USA',
  'San Francisco, USA', 'Seattle, USA', 'Denver, USA', 'Nashville, USA',
  'Oklahoma City, USA', 'El Paso, USA', 'Washington DC, USA', 'Boston, USA',
  'Las Vegas, USA', 'Portland, USA', 'Memphis, USA', 'Louisville, USA',
  'Baltimore, USA', 'Milwaukee, USA', 'Albuquerque, USA', 'Tucson, USA',
  'Fresno, USA', 'Sacramento, USA', 'Mesa, USA', 'Kansas City, USA',
  'Atlanta, USA', 'Miami, USA', 'Minneapolis, USA', 'New Orleans, USA',
  'Cleveland, USA', 'Raleigh, USA', 'Tampa, USA', 'Virginia Beach, USA',
  'Honolulu, USA', 'Anchorage, USA',
  'London, UK', 'Birmingham, UK', 'Glasgow, UK', 'Manchester, UK',
  'Edinburgh, UK', 'Leeds, UK', 'Liverpool, UK', 'Bristol, UK',
  'Toronto, Canada', 'Montreal, Canada', 'Vancouver, Canada', 'Calgary, Canada',
  'Ottawa, Canada', 'Edmonton, Canada',
  'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia',
  'Auckland, New Zealand', 'Wellington, New Zealand',
  'Paris, France', 'Berlin, Germany', 'Madrid, Spain', 'Rome, Italy',
  'Amsterdam, Netherlands', 'Vienna, Austria', 'Zurich, Switzerland',
  'Stockholm, Sweden', 'Oslo, Norway', 'Copenhagen, Denmark',
  'Warsaw, Poland', 'Prague, Czech Republic', 'Budapest, Hungary',
  'Athens, Greece', 'Istanbul, Turkey', 'Moscow, Russia',
  'Lisbon, Portugal', 'Dublin, Ireland',
  'Tokyo, Japan', 'Seoul, South Korea', 'Beijing, China', 'Shanghai, China',
  'Hong Kong', 'Singapore', 'Bangkok, Thailand', 'Kuala Lumpur, Malaysia',
  'Jakarta, Indonesia', 'Manila, Philippines', 'Ho Chi Minh City, Vietnam',
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Kolkata, India',
  'Dubai, UAE', 'Riyadh, Saudi Arabia', 'Cairo, Egypt', 'Lagos, Nigeria',
  'Nairobi, Kenya', 'Johannesburg, South Africa', 'Cape Town, South Africa',
  'Mexico City, Mexico', 'Bogota, Colombia', 'Lima, Peru',
  'Santiago, Chile', 'Buenos Aires, Argentina', 'Sao Paulo, Brazil',
  'Rio de Janeiro, Brazil',
];

// ── Helper: parse ISO date string back into MM/DD/YYYY parts ────────────────
function parseISODate(iso: string | undefined) {
  if (!iso) return { month: '', day: '', year: '' };
  const [y, m, d] = iso.split('-');
  return { month: m ?? '', day: d ?? '', year: y ?? '' };
}

export default function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuthStore();
  const { plan, isPremium, currentPeriodEnd } = useSubscription();
  const router = useRouter();
  const signInfo = profile?.sunSign ? getZodiacInfo(profile.sunSign) : null;

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const parsed = parseISODate(profile?.birthDate);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);
  const [year, setYear] = useState(parsed.year);
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? '');
  const [location, setLocation] = useState(profile?.birthLocation ?? '');
  const [locationQuery, setLocationQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const [portalError, setPortalError] = useState('');
  const [openingPortal, setOpeningPortal] = useState(false);

  const handleBillingPortal = async () => {
    setPortalError('');
    setOpeningPortal(true);
    const url = await openBillingPortal();
    if (url) Linking.openURL(url);
    else setPortalError('Could not open billing portal. Please contact support.');
    setOpeningPortal(false);
  };

  const handleSignOut = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to sign out?')
      : await new Promise<boolean>(resolve => {
          const Alert = require('react-native').Alert;
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Sign Out', style: 'destructive', onPress: () => resolve(true) },
          ]);
        });
    if (confirmed) { await signOut(); router.replace('/(auth)'); }
  };

  // ── Edit helpers ──────────────────────────────────────────────────────────
  const handleMonthChange = (t: string) => {
    const cleaned = t.replace(/\D/g, '').slice(0, 2);
    setMonth(cleaned);
    if (cleaned.length === 2) dayRef.current?.focus();
  };
  const handleDayChange = (t: string) => {
    const cleaned = t.replace(/\D/g, '').slice(0, 2);
    setDay(cleaned);
    if (cleaned.length === 2) yearRef.current?.focus();
  };

  const filteredCities = locationQuery.length >= 2
    ? CITIES.filter(c => c.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 8)
    : [];

  const getBirthDate = (): Date | null => {
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
    if (y < 1900 || y > 2025 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const date = new Date(y, m - 1, d);
    if (date.getMonth() + 1 !== m || date.getDate() !== d) return null;
    return date;
  };

  const toISO = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const openEdit = () => {
    // Pre-fill fields from current profile
    const p = parseISODate(profile?.birthDate);
    setMonth(p.month);
    setDay(p.day);
    setYear(p.year);
    setBirthTime(profile?.birthTime ?? '');
    setLocation(profile?.birthLocation ?? '');
    setLocationQuery('');
    setShowDropdown(false);
    setEditError('');
    setEditing(true);
  };

  const handleSave = async () => {
    setEditError('');
    const d = getBirthDate();
    const birthDateStr = d ? toISO(d) : (profile?.birthDate ?? undefined);
    const sunSign = d ? getZodiacSign(d.getMonth() + 1, d.getDate()) : (profile?.sunSign ?? 'Aries');
    const chart = d ? calculateBirthChart(d, birthTime || undefined, location || undefined) : null;

    setSaving(true);
    try {
      await updateProfile({
        birthDate: birthDateStr ?? '',
        birthTime: birthTime || undefined,
        birthLocation: location || undefined,
        sunSign,
        moonSign: chart?.moonSign ?? profile?.moonSign,
        risingSign: chart?.risingSign ?? profile?.risingSign,
      });
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0514', '#130D2B']} style={styles.container}>
      <StarField />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Avatar & Name */}
          <View style={styles.profileHero}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarEmoji}>{signInfo?.symbol ?? '✦'}</Text>
            </View>
            <Text style={styles.profileName}>{profile?.name ?? 'Cosmic Soul'}</Text>
            {signInfo && (
              <Text style={[styles.profileSign, { color: signInfo.color }]}>
                {signInfo.name} · {signInfo.element} Sign
              </Text>
            )}
          </View>

          {/* Cosmic Blueprint */}
          <CosmicCard style={styles.section} glow>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cosmic Blueprint</Text>
              {!editing && (
                <TouchableOpacity onPress={openEdit} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {editing ? (
              /* ── Edit Form ──────────────────────────────────────── */
              <View style={styles.editForm}>

                {/* Birth Date */}
                <Text style={styles.fieldLabel}>Birth Date</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateCell}>
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      value={month}
                      onChangeText={handleMonthChange}
                      placeholder="MM"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                    <Text style={styles.dateUnit}>Month</Text>
                  </View>
                  <Text style={styles.dateSep}>/</Text>
                  <View style={styles.dateCell}>
                    <TextInput
                      ref={dayRef}
                      style={[styles.input, styles.dateInput]}
                      value={day}
                      onChangeText={handleDayChange}
                      placeholder="DD"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                    <Text style={styles.dateUnit}>Day</Text>
                  </View>
                  <Text style={styles.dateSep}>/</Text>
                  <View style={[styles.dateCell, { flex: 1.6 }]}>
                    <TextInput
                      ref={yearRef}
                      style={[styles.input, styles.dateInput]}
                      value={year}
                      onChangeText={t => setYear(t.replace(/\D/g, '').slice(0, 4))}
                      placeholder="YYYY"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                      textAlign="center"
                    />
                    <Text style={styles.dateUnit}>Year</Text>
                  </View>
                </View>

                {/* Birth Time */}
                <Text style={styles.fieldLabel}>
                  Birth Time <Text style={styles.optionalTag}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={birthTime}
                  onChangeText={setBirthTime}
                  placeholder="HH:MM  (e.g. 14:30)"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={styles.hint}>Reveals your Rising sign — leave blank if unknown</Text>

                {/* Birth Location */}
                <Text style={styles.fieldLabel}>
                  Birth Location <Text style={styles.optionalTag}>(optional)</Text>
                </Text>
                {location ? (
                  <View style={styles.selectedCity}>
                    <Text style={styles.selectedCityText}>📍  {location}</Text>
                    <TouchableOpacity onPress={() => { setLocation(''); setLocationQuery(''); }}>
                      <Text style={styles.clearBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      value={locationQuery}
                      onChangeText={t => { setLocationQuery(t); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search city or country…"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {showDropdown && filteredCities.length > 0 && (
                      <View style={styles.dropdown}>
                        {filteredCities.map((city, i) => (
                          <TouchableOpacity
                            key={i}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setLocation(city);
                              setLocationQuery('');
                              setShowDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownText}>📍 {city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {editError ? <Text style={styles.errorMsg}>{editError}</Text> : null}

                {/* Save / Cancel */}
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
                    {saving
                      ? <ActivityIndicator color={Colors.text} size="small" />
                      : <Text style={styles.saveBtnText}>Save Changes</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ── Read-only display ──────────────────────────────── */
              <>
                {[
                  { label: 'Birth Date', value: profile?.birthDate ?? 'Not set' },
                  { label: 'Birth Time', value: profile?.birthTime ?? 'Not set' },
                  { label: 'Birth Location', value: profile?.birthLocation ?? 'Not set' },
                  { label: 'Sun Sign ☀️', value: profile?.sunSign ?? 'Not calculated' },
                  { label: 'Moon Sign 🌙', value: profile?.moonSign ?? 'Not calculated' },
                  { label: 'Rising Sign ↑', value: profile?.risingSign ?? 'Not calculated' },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{label}</Text>
                    <Text style={styles.dataValue}>{value}</Text>
                  </View>
                ))}
              </>
            )}
          </CosmicCard>

          {/* Subscription */}
          <CosmicCard style={styles.section} goldGlow={isPremium}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.planBadgeRow}>
              <View style={[styles.planBadge, { backgroundColor: isPremium ? Colors.accent + '20' : Colors.surface }]}>
                <Text style={[styles.planBadgeText, { color: isPremium ? Colors.accent : Colors.textMuted }]}>
                  {PLANS[plan]?.name ?? 'Free'} Plan
                </Text>
              </View>
              {currentPeriodEnd && (
                <Text style={styles.renewText}>
                  Renews {new Date(currentPeriodEnd).toLocaleDateString()}
                </Text>
              )}
            </View>
            {portalError ? <Text style={styles.errorMsg}>{portalError}</Text> : null}
            {isPremium ? (
              <GlowButton title={openingPortal ? 'Opening...' : 'Manage Billing'} onPress={handleBillingPortal}
                variant="outline" size="sm" disabled={openingPortal} />
            ) : (
              <GlowButton title="Upgrade to Premium" onPress={() => router.push('/pricing')} variant="gold" size="sm" />
            )}
          </CosmicCard>

          {/* Notifications */}
          <CosmicCard style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {[
              { key: 'notificationDaily' as const, label: 'Daily Horoscope', subtitle: 'Morning cosmic briefing' },
              { key: 'notificationMoon' as const, label: 'Moon Phase Updates', subtitle: 'New & full moon alerts' },
            ].map(({ key, label, subtitle }) => (
              <View key={key} style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>{label}</Text>
                  <Text style={styles.toggleSubtitle}>{subtitle}</Text>
                </View>
                <Switch
                  value={profile?.[key] ?? true}
                  onValueChange={val => updateProfile({ [key]: val })}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.text}
                />
              </View>
            ))}
          </CosmicCard>

          {/* Sign Out */}
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSizes.lg, color: Colors.text, fontFamily: 'PlayfairDisplay-Bold' },
  backBtn: { color: Colors.textSecondary, fontFamily: 'Inter-Regular', fontSize: FontSizes.base },
  scroll: { padding: Spacing.base, paddingBottom: 100, gap: Spacing.base },
  profileHero: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.surfaceLight, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 40 },
  profileName: { fontSize: FontSizes['2xl'], color: Colors.text, fontFamily: 'PlayfairDisplay-Bold' },
  profileSign: { fontSize: FontSizes.base, fontFamily: 'Inter-Medium' },
  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  sectionTitle: { fontSize: FontSizes.base, color: Colors.text, fontFamily: 'PlayfairDisplay-Bold' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.primary + '30', borderWidth: 1, borderColor: Colors.primary + '60' },
  editBtnText: { fontSize: FontSizes.sm, color: Colors.primary, fontFamily: 'Inter-Medium' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border + '40' },
  dataLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, fontFamily: 'Inter-Regular' },
  dataValue: { fontSize: FontSizes.sm, color: Colors.text, fontFamily: 'Inter-Medium' },
  // Edit form
  editForm: { gap: Spacing.sm },
  fieldLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, fontFamily: 'Inter-Medium', marginTop: Spacing.xs },
  optionalTag: { fontSize: FontSizes.xs, color: Colors.textMuted, fontFamily: 'Inter-Regular' },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, color: Colors.text, fontFamily: 'Inter-Regular', fontSize: FontSizes.base, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  dateCell: { flex: 1, alignItems: 'center', gap: 4 },
  dateInput: { paddingHorizontal: 4, width: '100%' },
  dateUnit: { fontSize: FontSizes.xs, color: Colors.textMuted, fontFamily: 'Inter-Regular' },
  dateSep: { color: Colors.textMuted, fontSize: FontSizes.lg, paddingTop: 8 },
  hint: { fontSize: FontSizes.xs, color: Colors.textMuted, fontFamily: 'Inter-Regular', marginTop: -4 },
  selectedCity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary + '60', borderRadius: BorderRadius.md, padding: Spacing.sm },
  selectedCityText: { color: Colors.text, fontFamily: 'Inter-Regular', fontSize: FontSizes.base },
  clearBtn: { color: Colors.textMuted, fontFamily: 'Inter-Regular', fontSize: FontSizes.base, paddingHorizontal: 8 },
  dropdown: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: -4 },
  dropdownItem: { padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border + '40' },
  dropdownText: { color: Colors.text, fontFamily: 'Inter-Regular', fontSize: FontSizes.sm },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { color: Colors.textMuted, fontFamily: 'Inter-Medium', fontSize: FontSizes.base },
  saveBtn: { flex: 2, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: Colors.text, fontFamily: 'Inter-SemiBold', fontSize: FontSizes.base },
  errorMsg: { color: '#F87171', fontFamily: 'Inter-Regular', fontSize: FontSizes.sm },
  // Subscription & notifications
  planBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  planBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  planBadgeText: { fontSize: FontSizes.sm, fontFamily: 'Inter-SemiBold' },
  renewText: { fontSize: FontSizes.xs, color: Colors.textMuted, fontFamily: 'Inter-Regular' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  toggleLabel: { fontSize: FontSizes.sm, color: Colors.text, fontFamily: 'Inter-Medium' },
  toggleSubtitle: { fontSize: FontSizes.xs, color: Colors.textMuted, fontFamily: 'Inter-Regular' },
  signOutBtn: { alignItems: 'center', paddingVertical: Spacing.base },
  signOutText: { color: Colors.error, fontFamily: 'Inter-Medium', fontSize: FontSizes.base },
});
