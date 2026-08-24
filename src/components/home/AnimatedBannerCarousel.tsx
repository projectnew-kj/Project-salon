import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Image, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  ctaAction?: string;
}

export const AnimatedBannerCarousel: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { colors } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = prevIndex === banners.length - 1 ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.bannerContainer, { backgroundColor: colors.surfaceSecondary }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.imageFallback, { backgroundColor: colors.primaryAccent }]}>
                <Text style={styles.fallbackTitle}>{item.title}</Text>
                {item.description ? <Text style={styles.fallbackSub}>{item.description}</Text> : null}
              </View>
            )}
            <View style={styles.overlay}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.bannerSub}>{item.description}</Text> : null}
            </View>
          </View>
        )}
      />

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: activeIndex === idx ? colors.primaryAccent : colors.border,
                  width: activeIndex === idx ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginVertical: 12 },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 16,
  },
  image: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, padding: 20, justifyContent: 'center' },
  fallbackTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  fallbackSub: { color: '#FFFFFF', fontSize: 13, marginTop: 4, opacity: 0.9 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bannerSub: { color: '#FFFFFF', fontSize: 12, opacity: 0.9, marginTop: 2 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, gap: 6 },
  dot: { height: 6, borderRadius: 3 },
});