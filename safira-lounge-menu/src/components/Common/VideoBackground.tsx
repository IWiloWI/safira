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

  /* Force hardware acceleration on mobile */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1); /* 10% schwarzer Filter */

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
  const [shouldLoadVideo] = useState(true); // Load immediately for LCP optimization
  const [userInteracted, setUserInteracted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow'>('fast');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Load video mappings from server API
  const loadVideoMappingsFromServer = async () => {
    try {
      console.log('VideoBackground: Loading video mappings from server...');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const response = await fetch(`${API_BASE_URL}?action=get_video_mappings`);
      console.log('VideoBackground: Server response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('VideoBackground: Server response data:', data);

        if (data.status === 'success' && Array.isArray(data.mappings)) {
          const serverMappings: { [key: string]: string } = {};

          data.mappings.forEach((mapping: any) => {
            console.log('VideoBackground: Processing mapping:', mapping);
            // Clean up invalid mappings before using
            if (typeof mapping.video_path === 'string' &&
                !mapping.video_path.startsWith('blob:') &&
                mapping.video_path !== 'undefined' &&
                mapping.video_path !== 'null' &&
                mapping.video_path.trim() !== '') {
              serverMappings[mapping.category_id] = mapping.video_path;
              console.log(`VideoBackground: Added mapping ${mapping.category_id} -> ${mapping.video_path}`);
            } else {
              console.warn('VideoBackground: Skipped invalid mapping:', mapping);
            }
          });

          console.log('VideoBackground: Final server mappings:', serverMappings);
          console.log('VideoBackground: Total mappings loaded:', Object.keys(serverMappings).length);
          return serverMappings;
        } else {
          console.warn('VideoBackground: Server returned error or invalid format:', data);
        }
      } else {
        console.warn('VideoBackground: HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.warn('VideoBackground: Error response body:', errorText);
      }
    } catch (error) {
      console.error('VideoBackground: Network or parsing error:', error);
    }
    return {};
  };

  // Detect connection speed on mount
  useEffect(() => {
    // Detect connection speed using Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      // 'slow-2g', '2g', '3g' = slow, '4g' = fast
      const isSlow = ['slow-2g', '2g', '3g'].includes(effectiveType);
      setConnectionSpeed(isSlow ? 'slow' : 'fast');
      console.log('🌐 VideoBackground: Detected connection speed:', effectiveType, isSlow ? '(slow)' : '(fast)');
    } else {
      console.log('🌐 VideoBackground: Network Information API not available, assuming fast connection');
    }
  }, []);

  // Load video mappings on component mount
  useEffect(() => {
    const loadVideoMappings = async () => {
      // NO hardcoded mappings - ALL videos must be assigned via Video Manager
      const baseMappings = {};

      // First try to load from server API
      const serverMappings = await loadVideoMappingsFromServer();

      // If server fails, try localStorage as fallback (for backwards compatibility)
      let localStorageMappings = {};
      if (Object.keys(serverMappings).length === 0) {
        try {
          const rawSavedMappings = localStorage.getItem('videoMappings') || '{}';
          const savedMappings = JSON.parse(rawSavedMappings);
          console.log('VideoBackground: Fallback to localStorage:', savedMappings);

          // Clean up invalid mappings AND fix legacy key formats
          const cleanedMappings: { [key: string]: string } = {};
          Object.entries(savedMappings).forEach(([key, value]) => {
            if (typeof value === 'string' &&
                !value.startsWith('blob:') &&
                value !== 'undefined' &&
                value !== 'null' &&
                value.trim() !== '') {

              // FIX LEGACY KEY MIGRATION: subcat_subcat_8 -> 8, subcat_5 -> 5
              let finalKey = key;
              if (key.startsWith('subcat_subcat_')) {
                finalKey = key.replace('subcat_subcat_', '');
                console.info(`VideoBackground: Migrating legacy key ${key} -> ${finalKey}`);
              } else if (key.startsWith('subcat_')) {
                finalKey = key.replace('subcat_', '');
                console.info(`VideoBackground: Migrating legacy key ${key} -> ${finalKey}`);
              }

              cleanedMappings[finalKey] = value;
            } else {
              console.info(`VideoBackground: Removing invalid mapping for ${key}:`, value);
            }
          });

          localStorageMappings = cleanedMappings;
        } catch (error) {
          console.warn('VideoBackground: Failed to parse localStorage videoMappings:', error);
          localStorageMappings = {};
        }
      }

      // Priority: Server mappings > localStorage mappings > Base mappings
      const finalMappings = { ...baseMappings, ...localStorageMappings, ...serverMappings };
      console.log('VideoBackground: Final merged mappings:', finalMappings);

      setVideoMappings(finalMappings);
    };

    loadVideoMappings();
  }, []);

  // Dynamic fallback function - analyzes category names to assign appropriate videos
  const getSmartVideoFallback = useCallback((categoryId: string) => {
    console.log('🤖 VideoBackground: Smart fallback for category ID:', categoryId);

    // Try to find category in global context (if available)
    // This would need to be passed from parent or context, but for now we'll use name-based logic

    // If it's a numeric ID, we can't easily determine the name without context
    // So we'll use a smart default progression
    if (/^\d+$/.test(categoryId)) {
      const numericId = parseInt(categoryId);
      console.log('🤖 VideoBackground: Numeric ID detected:', numericId);

      // Smart defaults based on common patterns
      if (numericId <= 3) {
        // Main categories - use safe home video fallback
        return '/safira/videos/Home_Rosen_Background_2.mp4';
      } else {
        // Subcategories - rotate through EXISTING video files only
        const fallbackVideos = [
          '/safira/videos/Home_Rosen_Background_2.mp4',     // Safe fallback
          '/safira/videos/Home_Rosen_Background_2.mp4',     // Safe fallback
          '/safira/videos/Home_Rosen_Background_2.mp4',     // Safe fallback
          '/safira/videos/Home_Rosen_Background_2.mp4',     // Safe fallback
          '/safira/videos/Home_Rosen_Background_2.mp4',     // Safe fallback
          '/safira/videos/Home_Rosen_Background_2.mp4'      // Safe fallback
        ];

        const fallbackIndex = numericId % fallbackVideos.length;
        const selectedFallback = fallbackVideos[fallbackIndex];
        console.log(`🤖 VideoBackground: Using rotating fallback [${fallbackIndex}]:`, selectedFallback);
        return selectedFallback;
      }
    }

    // For named categories, analyze the name
    const categoryName = categoryId.toLowerCase();
    console.log('🤖 VideoBackground: Analyzing category name:', categoryName);

    // Smart name-based matching (using only EXISTING video files)
    if (categoryName.includes('shisha') || categoryName.includes('tabak') || categoryName.includes('hookah')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('cola') || categoryName.includes('soft') || categoryName.includes('limo')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('energy') || categoryName.includes('redbull') || categoryName.includes('monster')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('tea') || categoryName.includes('tee') || categoryName.includes('coffee') || categoryName.includes('kaffee') || categoryName.includes('hot') || categoryName.includes('heiß')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('juice') || categoryName.includes('saft') || categoryName.includes('smoothie')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('cocktail') || categoryName.includes('mixed') || categoryName.includes('wein') || categoryName.includes('sekt')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('bier') || categoryName.includes('beer') || categoryName.includes('lager')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('spirit') || categoryName.includes('whisky') || categoryName.includes('vodka') || categoryName.includes('gin')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }
    if (categoryName.includes('snack') || categoryName.includes('food') || categoryName.includes('essen')) {
      return '/safira/videos/Home_Rosen_Background_2.mp4'; // Safe fallback until proper video exists
    }

    // Ultimate fallback - use home video
    console.log('🤖 VideoBackground: No smart match found, using home fallback');
    return '/safira/videos/Home_Rosen_Background_2.mp4';
  }, []);

  const getVideoSource = useCallback((cat?: string) => {
    let targetCategory = cat || category;
    console.log('🎬 VideoBackground getVideoSource called with DATABASE ID:', targetCategory);
    console.log('🎬 VideoBackground current mappings:', videoMappings);
    console.log('🎬 VideoBackground prop category:', category, 'override cat:', cat);

    // Only disable video for specific cases, otherwise use fallback
    if (targetCategory === 'menus') {
      console.log('🎬 VideoBackground: Using home video for menus category');
      targetCategory = 'home'; // Use home video for menus
    }
    if (!targetCategory) {
      console.log('🎬 VideoBackground: No category provided, using home as fallback');
      targetCategory = 'home'; // Default fallback to home
    }

    // Don't use video if mappings aren't loaded yet
    if (Object.keys(videoMappings).length === 0) {
      console.log('🎬 VideoBackground: Video mappings not loaded yet');
      return null;
    }

    // PRIORITY: Use direct database ID mapping first
    let videoSource: string | null = videoMappings[targetCategory || ''];
    console.log('🎬 VideoBackground: Direct ID lookup for', targetCategory, ':', videoSource);

    // FALLBACK: Try legacy category mapping for backward compatibility
    if (!videoSource) {
      const categoryMapping: { [key: string]: string } = {
        'tee-kaffee': 'hot-drinks',  // Map old URL to new category name
        '1': 'shisha',               // Legacy main category mapping
        '2': 'beverages',
        '3': 'snacks'
      };

      const mappedCategory = categoryMapping[targetCategory || ''];
      if (mappedCategory) {
        videoSource = videoMappings[mappedCategory];
        console.log('🎬 VideoBackground: Legacy mapping', targetCategory, '->', mappedCategory, ':', videoSource);
      }
    }

    // SMART FALLBACK: Use intelligent fallback system
    if (!videoSource) {
      videoSource = getSmartVideoFallback(targetCategory || '');
      console.log('🎬 VideoBackground: Using smart fallback system');
    }

    console.log(`🎬 VideoBackground FINAL selected video for ${targetCategory}:`, videoSource);

    // Filter out blob URLs and invalid sources
    if (videoSource && (videoSource.startsWith('blob:') || videoSource === 'undefined' || videoSource === 'null')) {
      console.info('🎬 VideoBackground: Filtering out invalid video source:', videoSource, 'for category:', targetCategory);
      return null; // Return null when videos are not available
    }

    return videoSource;
  }, [category, videoMappings, getSmartVideoFallback]);

  const getFallbackVideo = () => {
    // Return null to disable video when files are missing
    // In production, this would return a valid fallback video path
    return null;
  };


  // Listen for video configuration changes (from VideoManager)
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

      // Update local video mappings immediately (VideoManager already saved to server)
      setVideoMappings(prev => {
        const updated = {
          ...prev,
          [changedCategory]: videoPath
        };
        console.log('VideoBackground updated mappings from VideoManager event:', updated);
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

  // Handle video changes - combines initial load and category changes
  useEffect(() => {
    console.log('🎬 VideoBackground useEffect triggered - category:', category);
    console.log('🎬 VideoBackground: Current mappings count:', Object.keys(videoMappings).length);
    console.log('🎬 VideoBackground: Current video:', currentVideo);

    // Only proceed if mappings are loaded
    if (Object.keys(videoMappings).length === 0) {
      console.log('🎬 VideoBackground: Mappings not loaded yet, skipping');
      return;
    }

    const newVideo = getVideoSource();
    console.log('🎬 VideoBackground: getVideoSource returned:', newVideo);
    console.log('🎬 VideoBackground: Checking video change from', currentVideo, 'to', newVideo);

    if (newVideo && newVideo !== currentVideo) {
      console.log('🎬 VideoBackground: ✅ Video CHANGING from', currentVideo, 'to', newVideo);
      // Reset error state for new video
      setHasError(false);

      // For initial load, set immediately
      if (!currentVideo) {
        console.log('🎬 VideoBackground: Initial load - setting video immediately');
        setCurrentVideo(newVideo);
      } else {
        // For transitions, use delay
        console.log('🎬 VideoBackground: Transition - delaying video change');
        const timer = setTimeout(() => {
          setCurrentVideo(newVideo);
          console.log('🎬 VideoBackground: ✅ Video actually switched to:', newVideo);
        }, 150); // Half of the transition duration

        // FIX: Cleanup timer on unmount
        return () => {
          clearTimeout(timer);
        };
      }
    } else if (!newVideo) {
      console.log('🎬 VideoBackground: ⚠️ No video found for category:', category);
    } else {
      console.log('🎬 VideoBackground: ❌ No video change needed, staying on:', currentVideo);
    }
  }, [category, videoMappings]); // Removed currentVideo from dependencies to prevent loops

  // FIX: Component unmount cleanup - TABLET-FRIENDLY (only pause, don't destroy)
  // Removing src and calling load() breaks autoplay on tablets due to strict autoplay policies
  useEffect(() => {
    return () => {
      console.log('🎬 VideoBackground: Component unmounting - pausing video (tablet-friendly)');
      if (videoRef.current) {
        const video = videoRef.current;
        // Only pause, don't remove src or reset element
        // This preserves autoplay token for tablets/mobile devices
        video.pause();
        console.log('🎬 VideoBackground: Video paused (keeping element alive)');
      }
    };
  }, []); // Empty deps - only run on unmount

  // Handle user interaction to enable autoplay - TABLET FIX
  // Re-establish listeners on each video change for tablet autoplay policy compliance
  useEffect(() => {
    const handleInteraction = () => {
      console.log('🎬 User interaction detected for video:', currentVideo);
      setUserInteracted(true);

      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(err => {
          console.error('🎬 Play failed even after user interaction:', err);
        });
      }
    };

    // Re-attach listeners whenever video changes (critical for tablets)
    // Tablets need fresh user interaction token after each navigation
    const events = ['click', 'touchstart', 'touchend', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [currentVideo]); // Re-run when video changes (tablet fix)

  // Handle video error and fallback
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const error = video.error;

    console.error('🎬 Video error for', category);
    console.error('🎬 Video source:', currentVideo);
    console.error('🎬 Error code:', error?.code, 'Message:', error?.message);
    console.error('🎬 Network state:', video.networkState);
    console.error('🎬 Ready state:', video.readyState);

    // Only try fallback once and only if we're not already on the fallback video
    if (!hasError && currentVideo !== getFallbackVideo()) {
      console.log('🎬 Falling back to default video');
      setHasError(true);
      setCurrentVideo(getFallbackVideo());
    } else {
      // If even the fallback fails, stop trying to avoid infinite loops
      console.error('🎬 Fallback video also failed, disabling video for category:', category);
      setCurrentVideo(null);
      setHasError(true);
    }
  };

  // Use fallback video while loading or if no video is set (no hardcoded fallback, use only Video Manager assignments)
  const rawVideo = currentVideo;

  // Convert relative paths to absolute URLs for proper video loading
  const videoToDisplay = rawVideo && rawVideo.startsWith('/')
    ? `${window.location.protocol}//${window.location.host}${rawVideo}`
    : rawVideo;

  // Only log once when video is missing (not on every render)
  if (!currentVideo && Object.keys(videoMappings).length > 0) {
    console.log('VideoBackground: No video mapping found for category:', category, '- using fallback');
  }

  return (
    <VideoContainer>
      <AnimatePresence mode="wait">
        {videoToDisplay && (
          <Video
            ref={videoRef}
            key={videoToDisplay}
            preload={connectionSpeed === 'slow' ? 'metadata' : 'auto'}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            crossOrigin="anonymous"
            data-lazy={!shouldLoadVideo}
            onError={handleVideoError}
            onLoadStart={() => {
              console.log('🎬 Video loading started for:', category);
              console.log('🎬 Video source:', videoToDisplay);
              console.log('🎬 User interacted:', userInteracted);
              console.log('🎬 Connection speed:', connectionSpeed);
              setIsBuffering(true);
            }}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              console.log('🎬 Video metadata loaded');
              console.log('🎬 Video duration:', video.duration);
              console.log('🎬 Video dimensions:', video.videoWidth, 'x', video.videoHeight);

              // Force play as soon as metadata is loaded
              video.play().catch(err => {
                console.warn('🎬 Autoplay prevented on metadata load:', err.name, err.message);
              });
            }}
            onCanPlay={(e) => {
              const video = e.currentTarget;
              console.log('🎬 Video can play for:', category);
              console.log('🎬 Video paused state:', video.paused);
              console.log('🎬 Video muted state:', video.muted);
              console.log('🎬 Video ready state:', video.readyState);
              setIsBuffering(false);

              // Force play on mobile devices
              video.play().catch(err => {
                console.warn('🎬 Autoplay prevented on canPlay, waiting for user interaction:', err.name, err.message);
              });
            }}
            onPlay={() => {
              console.log('🎬 ✅ Video is now playing for:', category);
              setIsBuffering(false);
            }}
            onPause={(e) => {
              console.log('🎬 ⏸️ Video paused for:', category);

              // TABLET FIX: Auto-resume if paused unexpectedly (not by user)
              // This helps tablets recover from autoplay blocks
              const video = e.currentTarget;
              if (video.readyState >= 3 && !document.hidden) {
                setTimeout(() => {
                  if (video.paused) {
                    console.log('🎬 Attempting auto-resume for tablet...');
                    video.play().catch(err =>
                      console.warn('🎬 Auto-resume failed:', err)
                    );
                  }
                }, 100);
              }
            }}
            onLoadedData={() => console.log('🎬 Video loaded successfully for:', category)}
            onStalled={(e) => {
              console.warn('🎬 Video stalled for:', category);
              // Try to resume playback if stalled
              const video = e.currentTarget;
              if (video.paused) {
                video.play().catch(err => console.warn('🎬 Resume failed:', err));
              }
            }}
            onSuspend={(e) => {
              console.warn('🎬 Video suspended for:', category);
              // Force resume if suspended - browser is pausing to save bandwidth
              const video = e.currentTarget;
              // Always try to resume, regardless of paused state
              if (video.readyState >= 2) { // Has enough data loaded
                setTimeout(() => {
                  video.play().catch(err => console.warn('🎬 Resume after suspend failed:', err));
                }, 50);
              }
            }}
            onWaiting={(e) => {
              console.warn('🎬 Video waiting for:', category, '- buffering...');
              setIsBuffering(true);
              // Continue playing when buffering completes
              const video = e.currentTarget;
              const resumePlay = () => {
                if (video.readyState >= 3) {
                  setIsBuffering(false);
                  video.play().catch(err => console.warn('🎬 Resume after buffering failed:', err));
                }
              };
              // FIX: Use {once: true} to auto-remove listener after first trigger
              video.addEventListener('canplay', resumePlay, { once: true });
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Multiple source formats for better compatibility */}
            {videoToDisplay.endsWith('.mov') ? (
              <>
                <source src={videoToDisplay} type="video/quicktime" />
                <source src={videoToDisplay} type="video/mp4; codecs=&quot;avc1.42E01E, mp4a.40.2&quot;" />
              </>
            ) : (
              <>
                <source src={videoToDisplay} type="video/mp4; codecs=&quot;avc1.42E01E, mp4a.40.2&quot;" />
                <source src={videoToDisplay} type="video/mp4" />
              </>
            )}
            Your browser does not support the video tag.
          </Video>
        )}
      </AnimatePresence>
      <Overlay />
    </VideoContainer>
  );
};

export default VideoBackground;