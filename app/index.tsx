import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AI_OPPONENTS, AIKey, CourtKey, COURTS } from '../constants/courts';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCourt, setSelectedCourt] = useState<CourtKey>('default');
  const [selectedOpponent, setSelectedOpponent] = useState<AIKey>('basic');

  const court = COURTS[selectedCourt];

  const handlePlay = () => {
    router.push({
      pathname: '/game',
      params: { court: selectedCourt, opponent: selectedOpponent },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: court.floorColor }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>TENNIS{'\n'}PONG</Text>
        <Text style={styles.subtitle}>by Brooklyn Guo</Text>
      </View>

      {/* Court Preview */}
      <View style={[styles.courtPreview, { backgroundColor: court.courtColor }]}>
        <View style={styles.courtLines}>
          {/* Net line */}
          <View style={styles.netLine} />
          {/* Service lines */}
          <View style={styles.serviceLine} />
          <View style={[styles.serviceLine, { top: '65%' }]} />
          {/* Center mark */}
          <View style={styles.centerMark} />
        </View>
        <Text style={styles.courtLabel}>{court.label}</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Court Selector */}
        <Text style={styles.sectionTitle}>SELECT COURT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtRow}>
          {(Object.keys(COURTS) as CourtKey[]).map((key) => {
            const c = COURTS[key];
            const isSelected = selectedCourt === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedCourt(key)}
                style={[
                  styles.courtChip,
                  { backgroundColor: c.floorColor },
                  isSelected && styles.courtChipSelected,
                ]}
              >
                <View style={[styles.courtChipInner, { backgroundColor: c.courtColor }]} />
                <Text style={styles.courtChipLabel} numberOfLines={1}>
                  {c.label}
                </Text>
                {isSelected && <View style={styles.courtChipCheck} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Opponent Selector */}
        <Text style={styles.sectionTitle}>SELECT OPPONENT</Text>
        {AI_OPPONENTS.map((ai) => {
          const isSelected = selectedOpponent === ai.key;
          return (
            <TouchableOpacity
              key={ai.key}
              onPress={() => setSelectedOpponent(ai.key)}
              style={[
                styles.opponentRow,
                isSelected && { borderColor: '#CDEB34', borderWidth: 2 },
              ]}
            >
              <Text style={styles.opponentEmoji}>{ai.emoji}</Text>
              <View style={styles.opponentInfo}>
                <Text style={styles.opponentName}>{ai.label}</Text>
                <Text style={styles.opponentDesc}>{ai.description}</Text>
              </View>
              {isSelected && <View style={styles.selectedDot} />}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: '#CDEB34' }]}
          onPress={handlePlay}
          activeOpacity={0.85}
        >
          <Text style={styles.playButtonText}>PLAY</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  courtPreview: {
    marginHorizontal: 24,
    marginVertical: 12,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courtLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  netLine: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  serviceLine: {
    position: 'absolute',
    top: '32%',
    left: '20%',
    right: '20%',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  centerMark: {
    position: 'absolute',
    top: '10%',
    bottom: '10%',
    left: '50%',
    width: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  courtLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 16,
    marginBottom: 10,
  },
  courtRow: {
    marginBottom: 8,
  },
  courtChip: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 10,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  courtChipSelected: {
    borderWidth: 2.5,
    borderColor: '#CDEB34',
  },
  courtChipInner: {
    width: '100%',
    flex: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  courtChipLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  courtChipCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CDEB34',
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  opponentEmoji: {
    fontSize: 26,
    marginRight: 14,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  opponentDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CDEB34',
  },
  playButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 6,
  },
});