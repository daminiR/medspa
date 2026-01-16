import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48 - 16) / 2;

interface TreatmentPhoto {
  id: string;
  uri: string;
  type: 'before' | 'after';
  treatmentId: string;
  treatmentName: string;
  date: Date;
  notes?: string;
}

interface TreatmentPhotoSet {
  id: string;
  treatmentName: string;
  treatmentDate: Date;
  before?: TreatmentPhoto;
  after?: TreatmentPhoto;
  provider: string;
}

// Mock data - patient's transformation photos (differentiator!)
const MOCK_PHOTO_SETS: TreatmentPhotoSet[] = [
  {
    id: '1',
    treatmentName: 'Botox - Forehead',
    treatmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    provider: 'Dr. Sarah Chen',
    before: {
      id: 'b1',
      uri: 'https://via.placeholder.com/300x400',
      type: 'before',
      treatmentId: '1',
      treatmentName: 'Botox - Forehead',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    after: {
      id: 'a1',
      uri: 'https://via.placeholder.com/300x400',
      type: 'after',
      treatmentId: '1',
      treatmentName: 'Botox - Forehead',
      date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },
  },
  {
    id: '2',
    treatmentName: 'HydraFacial',
    treatmentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    provider: 'Emma Wilson',
    before: {
      id: 'b2',
      uri: 'https://via.placeholder.com/300x400',
      type: 'before',
      treatmentId: '2',
      treatmentName: 'HydraFacial',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    after: {
      id: 'a2',
      uri: 'https://via.placeholder.com/300x400',
      type: 'after',
      treatmentId: '2',
      treatmentName: 'HydraFacial',
      date: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000),
    },
  },
];

type ViewMode = 'grid' | 'timeline';

export default function PhotosScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [photoSets, setPhotoSets] = useState<TreatmentPhotoSet[]>(MOCK_PHOTO_SETS);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to add photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Navigate to photo upload flow
      router.push({
        pathname: '/photo/upload',
        params: { uri: result.assets[0].uri },
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      router.push({
        pathname: '/photo/upload',
        params: { uri: result.assets[0].uri },
      });
    }
  };

  const showAddPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Your Photos</Text>
          <Text style={styles.headerSubtitle}>Track your transformation</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'timeline' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={showAddPhotoOptions}
          >
            <LinearGradient
              colors={['#EC4899', '#DB2777']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
          />
        }
      >
        {/* Info Banner */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={['#FDF2F8', '#FCE7F3']}
            style={styles.infoBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.infoBannerIcon}>
              <Ionicons name="sparkles" size={20} color="#EC4899" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Your Private Gallery</Text>
              <Text style={styles.infoBannerText}>
                Only you and your provider can see these photos. Track your journey securely.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {photoSets.length > 0 ? (
          <>
            {/* Photo Sets */}
            {photoSets.map((photoSet, index) => (
              <Animated.View
                key={photoSet.id}
                entering={FadeIn.duration(400).delay(100 + index * 100)}
              >
                <View style={styles.photoSetCard}>
                  <View style={styles.photoSetHeader}>
                    <View>
                      <Text style={styles.photoSetTitle}>{photoSet.treatmentName}</Text>
                      <Text style={styles.photoSetMeta}>
                        {formatDate(photoSet.treatmentDate)} • {photoSet.provider}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push(`/photo/set/${photoSet.id}`)}
                    >
                      <Ionicons name="expand-outline" size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.photoCompare}>
                    {/* Before Photo */}
                    <TouchableOpacity
                      style={styles.photoContainer}
                      onPress={() => photoSet.before && router.push(`/photo/${photoSet.before.id}`)}
                    >
                      {photoSet.before ? (
                        <>
                          <View style={styles.photoPlaceholder}>
                            <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                          </View>
                          <View style={styles.photoLabel}>
                            <Text style={styles.photoLabelText}>Before</Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.addPhotoPlaceholder}>
                          <Ionicons name="add-circle-outline" size={32} color="#9CA3AF" />
                          <Text style={styles.addPhotoText}>Add Before</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Compare Arrow */}
                    <View style={styles.compareArrow}>
                      <Ionicons name="arrow-forward" size={20} color="#D1D5DB" />
                    </View>

                    {/* After Photo */}
                    <TouchableOpacity
                      style={styles.photoContainer}
                      onPress={() => photoSet.after && router.push(`/photo/${photoSet.after.id}`)}
                    >
                      {photoSet.after ? (
                        <>
                          <View style={styles.photoPlaceholder}>
                            <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                          </View>
                          <View style={[styles.photoLabel, styles.afterLabel]}>
                            <Text style={styles.photoLabelText}>After</Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.addPhotoPlaceholder}>
                          <Ionicons name="add-circle-outline" size={32} color="#9CA3AF" />
                          <Text style={styles.addPhotoText}>Add After</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Side-by-side Compare Button */}
                  {photoSet.before && photoSet.after && (
                    <TouchableOpacity
                      style={styles.compareButton}
                      onPress={() => router.push(`/photo/compare/${photoSet.id}`)}
                    >
                      <Ionicons name="git-compare-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.compareButtonText}>View Side-by-Side</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="images-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyStateTitle}>No photos yet</Text>
            <Text style={styles.emptyStateText}>
              Start documenting your transformation journey by adding your first before photo
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={showAddPhotoOptions}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Add First Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          <View style={styles.tipsList}>
            <TipItem icon="sunny-outline" text="Use natural lighting for best results" />
            <TipItem icon="phone-portrait-outline" text="Hold camera at eye level" />
            <TipItem icon="locate-outline" text="Use the same angle each time" />
            <TipItem icon="water-outline" text="Remove makeup for skin treatments" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TipItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tipItem}>
      <Ionicons name={icon as any} size={18} color="#8B5CF6" />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  photoSetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoSetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  photoSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  photoSetMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  photoCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  afterLabel: {
    backgroundColor: '#10B981',
  },
  photoLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  compareArrow: {
    padding: 4,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  compareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
