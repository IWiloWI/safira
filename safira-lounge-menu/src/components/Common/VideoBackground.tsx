import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  z-index: -1;
  overflow: hidden;
  
  /* Mobile viewport fixes */
  @supports (-webkit-touch-callout: none) {
    /* iOS Safari */
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
`;

const Video = styled(motion.video)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8) contrast(1.2) saturate(1.1);
  position: absolute;
  top: 0;
  left: 0;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.25) 50%,
    rgba(0, 0, 0, 0.2) 100%
  );
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at 25% 75%,
      rgba(233, 30, 99, 0.06) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 75% 25%,
      rgba(255, 215, 0, 0.04) 0%,
      transparent 60%
    );
  }
`;

interface VideoBackgroundProps {
  category?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ category }) => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [videoMappings, setVideoMappings] = useState<{ [key: string]: string }>({});

  // Load video mappings on component mount
  useEffect(() => {
    const loadVideoMappings = () => {
      // Default mappings
      const defaultMappings = {
        'home': '/videos/Home_Rosen_Background.mp4',
        'shisha': '/videos/shisha-background.mp4',
        'softdrinks': '/videos/closeup-of-glass-of-cola-with-ice-rotating-2025-08-29-14-34-40-utc.mp4',
        'eistee-energy': '/videos/redbull-background.mp4',
        'hot-drinks': '/videos/cup-of-tea-with-mint-4k-2025-08-29-06-05-12-utc.mp4',
        'saefte': '/videos/Juice-and-NightClub-FHD.mp4',
        'wein-sekt': '/videos/Home_Rosen_Background.mp4',
        'bier': '/videos/redbull-background.mp4',
        'cocktails-mocktails': '/videos/Juice-and-NightClub-FHD.mp4',
        'spirituosen': '/videos/redbull-background.mp4',
        'snacks': '/videos/Home_Rosen_Background.mp4'
      };

      // Load saved mappings from localStorage
      const rawSavedMappings = localStorage.getItem('videoMappings') || '{}';
      let savedMappings = {};
      
      try {
        savedMappings = JSON.parse(rawSavedMappings);
        console.log('VideoBackground: Loaded from localStorage:', savedMappings);
        
        // Clean up invalid mappings (blob URLs, undefined, null)
        const cleanedMappings: { [key: string]: string } = {};
        Object.entries(savedMappings).forEach(([key, value]) => {
          if (typeof value === 'string' && 
              !value.startsWith('blob:') && 
              value !== 'undefined' && 
              value !== 'null' && 
              value.trim() !== '') {
            cleanedMappings[key] = value;
          } else {
            console.info(`VideoBackground: Removing invalid mapping for ${key}:`, value);
          }
        });
        
        savedMappings = cleanedMappings;
        
        // Save cleaned mappings back to localStorage
        if (Object.keys(cleanedMappings).length !== Object.keys(JSON.parse(rawSavedMappings)).length) {
          localStorage.setItem('videoMappings', JSON.stringify(cleanedMappings));
          console.info('VideoBackground: Cleaned and saved video mappings');
        }
      } catch (error) {
        console.warn('VideoBackground: Failed to parse localStorage videoMappings, using defaults:', error);
        savedMappings = {};
        localStorage.removeItem('videoMappings');
      }

      // Merge defaults with saved (cleaned)
      const finalMappings = { ...defaultMappings, ...savedMappings };
      console.log('VideoBackground: Final mappings:', finalMappings);
      
      setVideoMappings(finalMappings);
    };

    loadVideoMappings();
  }, []);

  const getVideoSource = useCallback((cat?: string) => {
    let targetCategory = cat || category;
    console.log('VideoBackground category:', targetCategory);
    console.log('VideoBackground current mappings:', videoMappings);
    
    // Only disable video for specific cases, otherwise use fallback
    if (targetCategory === 'menus') {
      console.log('VideoBackground: Using home video for menus category');
      targetCategory = 'home'; // Use home video for menus
    }
    if (!targetCategory) {
      console.log('VideoBackground: No category provided, using home as fallback');
      targetCategory = 'home'; // Default fallback to home
    }
    
    // Handle category name mapping (old URL vs new category names)
    const categoryMapping: { [key: string]: string } = {
      'tee-kaffee': 'hot-drinks'  // Map old URL to new category name
    };
    
    const mappedCategory = categoryMapping[targetCategory || ''] || targetCategory;
    console.log(`VideoBackground mapped ${targetCategory} to ${mappedCategory}`);
    
    // Don't use video if mappings aren't loaded yet
    if (Object.keys(videoMappings).length === 0) {
      console.log('VideoBackground: Video mappings not loaded yet');
      return null;
    }
    
    // Use video mappings, with specific fallback
    let videoSource: string | null = videoMappings[mappedCategory || ''];
    if (!videoSource && mappedCategory === 'shisha') {
      // Skip forcing shisha video when files are missing
      console.log('VideoBackground: Shisha video not available in development');
    }
    if (!videoSource) {
      videoSource = videoMappings['home'] || null;
    }
    
    console.log(`VideoBackground selected video for ${mappedCategory}:`, videoSource);
    
    // Filter out blob URLs and invalid sources
    if (videoSource && (videoSource.startsWith('blob:') || videoSource === 'undefined' || videoSource === 'null')) {
      console.info('VideoBackground: Filtering out invalid video source:', videoSource, 'for category:', mappedCategory);
      return null; // Return null when videos are not available
    }
    
    return videoSource;
  }, [category, videoMappings]);

  const getFallbackVideo = () => {
    // Return null to disable video when files are missing
    // In production, this would return a valid fallback video path
    return null;
  };


  // Listen for video configuration changes
  useEffect(() => {
    const handleVideoConfigChange = (event: any) => {
      console.log('VideoBackground received config change:', event.detail);
      const { category: changedCategory, videoPath } = event.detail;
      
      // Validate the video path before using it
      if (!videoPath || 
          videoPath.startsWith('blob:') || 
          videoPath === 'undefined' || 
          videoPath === 'null' || 
          typeof videoPath !== 'string' || 
          videoPath.trim() === '') {
        console.warn('VideoBackground: Ignoring invalid video path for category', changedCategory, ':', videoPath);
        return;
      }
      
      setVideoMappings(prev => {
        const updated = {
          ...prev,
          [changedCategory]: videoPath
        };
        console.log('VideoBackground updated mappings:', updated);
        return updated;
      });
      
      // If this is the current category, update the video immediately
      if (changedCategory === category) {
        console.log(`VideoBackground updating current video for ${category} to:`, videoPath);
        setCurrentVideo(videoPath);
        setHasError(false);
      }
    };

    window.addEventListener('videoConfigChanged', handleVideoConfigChange);
    
    return () => {
      window.removeEventListener('videoConfigChanged', handleVideoConfigChange);
    };
  }, [category]);

  // Set initial video - wait for mappings to load
  useEffect(() => {
    if (!currentVideo && Object.keys(videoMappings).length > 0) {
      const videoSrc = getVideoSource();
      if (videoSrc) {
        console.log('VideoBackground: Setting initial video:', videoSrc);
        setCurrentVideo(videoSrc);
        setHasError(false);
      }
    }
  }, [currentVideo, getVideoSource, videoMappings]);

  // Handle video changes with smooth transition
  useEffect(() => {
    // Only proceed if mappings are loaded
    if (Object.keys(videoMappings).length === 0) return;
    
    const newVideo = getVideoSource();
    console.log('VideoBackground: Checking video change from', currentVideo, 'to', newVideo);
    
    if (newVideo !== currentVideo) {
      console.log('VideoBackground: Changing video to', newVideo);
      // Reset error state for new video
      setHasError(false);
      // Delay video change for smooth transition
      const timer = setTimeout(() => {
        setCurrentVideo(newVideo);
      }, 150); // Half of the transition duration
      return () => clearTimeout(timer);
    }
  }, [category, currentVideo, getVideoSource, videoMappings]);

  // Handle video error and fallback
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video error for', category, ':', e);
    console.error('Video source:', currentVideo);
    
    // Only try fallback once and only if we're not already on the fallback video
    if (!hasError && currentVideo !== getFallbackVideo()) {
      console.log('Falling back to default video');
      setHasError(true);
      setCurrentVideo(getFallbackVideo());
    } else {
      // If even the fallback fails, stop trying to avoid infinite loops
      console.error('Fallback video also failed, disabling video for category:', category);
      setCurrentVideo(null);
      setHasError(true);
    }
  };

  // Don't render anything if there's no video to show
  if (!currentVideo) {
    console.log('VideoBackground: No video to display for category:', category);
    return null;
  }

  return (
    <VideoContainer>
      <AnimatePresence mode="wait">
        <Video
          key={currentVideo}
          autoPlay 
          muted 
          loop 
          playsInline 
          onError={handleVideoError}
          onLoadStart={() => console.log('Video loading started for:', category, 'Source:', currentVideo)}
          onCanPlay={() => console.log('Video can play for:', category)}
          onLoadedData={() => console.log('Video loaded successfully for:', category)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {currentVideo.endsWith('.mov') ? (
            <source src={currentVideo} type="video/quicktime" />
          ) : (
            <source src={currentVideo} type="video/mp4" />
          )}
        </Video>
      </AnimatePresence>
      <Overlay />
    </VideoContainer>
  );
};

export default VideoBackground;