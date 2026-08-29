import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  ctaAction?: string;
  ctaTargetId?: string;
}

type CarouselSlide = {
  id: string;
  image: string;
  title: string;
  description?: string;
  ctaAction?: string;
  ctaTargetId?: string;
};

export const AnimatedBannerCarousel: React.FC<{ banners: Banner[]; onPressBanner?: (banner: Banner) => void }> = ({ banners, onPressBanner }) => {
  const { colors } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<CarouselSlide>>(null);

  const slides = useMemo<CarouselSlide[]>(() => {
    return banners.flatMap((banner) =>
      (banner.images || []).filter(Boolean).map((image, imageIndex) => ({
        id: `${banner._id}-${imageIndex}`,
        image,
        title: banner.title,
        description: banner.description,
        ctaAction: banner.ctaAction,
        ctaTargetId: banner.ctaTargetId,
      }))
    );
  }, [banners]);

  useEffect(() => {
    setActiveIndex(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = prevIndex === slides.length - 1 ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: BANNER_WIDTH + 32, offset: (BANNER_WIDTH + 32) * index, index })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 32));
          setActiveIndex(Math.max(0, Math.min(index, slides.length - 1)));
        }}
        renderItem={({ item }) => {
          const matchingBanner = banners.find((banner) => item.id.startsWith(`${banner._id}-`));
          return (
            <TouchableOpacity
              activeOpacity={onPressBanner ? 0.9 : 1}
              onPress={() => matchingBanner && onPressBanner?.(matchingBanner)}
              style={styles.slideOuter}
            >
              <View style={[styles.bannerContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                <View style={styles.overlay}>
                  <Text style={styles.bannerTitle} numberOfLines={1}>{item.title}</Text>
                  {item.description ? <Text style={styles.bannerSub} numberOfLines={2}>{item.description}</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {slides.length > 1 && (
        <View style={styles.pagination}>
          {slides.map((slide, idx) => (
            <View
              key={slide.id}
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
  slideOuter: { width: BANNER_WIDTH + 32 },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 16,
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bannerSub: { color: '#FFFFFF', fontSize: 12, opacity: 0.9, marginTop: 2 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, gap: 6 },
  dot: { height: 6, borderRadius: 3 },
});
