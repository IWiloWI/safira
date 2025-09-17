import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUpload, FaPlay, FaPause, FaTrash, FaSave, FaEye } from 'react-icons/fa';

const VideoManagerContainer = styled.div`
  max-width: 1200px;
`;

const VideoManagerHeader = styled.div`
  margin-bottom: 40px;
`;

const VideoManagerTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const VideoManagerSubtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const CategoryCard = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF41FB;
    box-shadow: 0 10px 30px rgba(255, 65, 251, 0.2);
    transform: translateY(-5px);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.3rem;
  text-transform: uppercase;
  margin: 0;
`;

const PreviewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: rgba(255, 65, 251, 0.2);
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 8px;
  color: #FF41FB;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 65, 251, 0.3);
    border-color: #FF41FB;
  }
`;

const VideoPreview = styled.video`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
  border: 2px solid rgba(255, 65, 251, 0.3);
`;

const CurrentVideoInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const CurrentVideoName = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const VideoControls = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ variant?: 'primary' | 'danger' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'rgba(255, 65, 251, 0.2)';
      case 'danger': return 'rgba(244, 67, 54, 0.2)';
      case 'success': return 'rgba(76, 175, 80, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.variant) {
      case 'primary': return 'rgba(255, 65, 251, 0.4)';
      case 'danger': return 'rgba(244, 67, 54, 0.4)';
      case 'success': return 'rgba(76, 175, 80, 0.4)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  border-radius: 8px;
  color: ${props => {
    switch (props.variant) {
      case 'primary': return '#FF41FB';
      case 'danger': return '#f44336';
      case 'success': return '#4CAF50';
      default: return 'white';
    }
  }};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'primary': return 'rgba(255, 65, 251, 0.3)';
        case 'danger': return 'rgba(244, 67, 54, 0.3)';
        case 'success': return 'rgba(76, 175, 80, 0.3)';
        default: return 'rgba(255, 255, 255, 0.2)';
      }
    }};
    border-color: ${props => {
      switch (props.variant) {
        case 'primary': return '#FF41FB';
        case 'danger': return '#f44336';
        case 'success': return '#4CAF50';
        default: return 'white';
      }
    }};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const PreviewVideo = styled.video`
  max-width: 90%;
  max-height: 90%;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(255, 65, 251, 0.3);
`;

const ClosePreview = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #f44336;
    transform: scale(1.1);
  }
`;

interface VideoMapping {
  category: string;
  displayName: string;
  currentVideo: string;
}

const VideoManager: React.FC = () => {
  const [videoMappings, setVideoMappings] = useState<VideoMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: string }>({});

  // Available videos from public folder
  const availableVideos = [
    '/videos/Home_Rosen_Background.mp4',
    '/videos/shisha-background.mp4',
    '/videos/Juice-and-NightClub-FHD.mp4',
    '/videos/closeup-of-glass-of-cola-with-ice-rotating-2025-08-29-14-34-40-utc.mp4',
    '/videos/cup-of-tea-with-mint-4k-2025-08-29-06-05-12-utc.mp4',
    '/videos/redbull-background.mp4',
    '/videos/eistee-background.mp4'
  ];

  const categoryDisplayNames: { [key: string]: string } = {
    'home': 'Startseite',
    'shisha': 'Shisha',
    'softdrinks': 'Softdrinks',
    'eistee-energy': 'Eistee & Energy',
    'hot-drinks': 'Hot Drinks',
    'saefte': 'Säfte',
    'wein-sekt': 'Wein & Sekt',
    'bier': 'Bier',
    'cocktails-mocktails': 'Cocktails/Mocktails',
    'spirituosen': 'Spirituosen',
    'snacks': 'Snacks'
  };

  // Load video configuration with localStorage persistence
  useEffect(() => {
    const loadVideoConfig = () => {
      // Default video mappings
      const defaultVideoMapping: { [key: string]: string } = {
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

      // Load saved changes from localStorage
      const savedMappings = JSON.parse(localStorage.getItem('videoMappings') || '{}');
      console.log('VideoManager: Loaded from localStorage:', savedMappings);

      // Merge default with saved mappings
      const finalMapping = { ...defaultVideoMapping, ...savedMappings };

      const mappings = Object.entries(categoryDisplayNames).map(([category, displayName]) => ({
        category,
        displayName,
        currentVideo: finalMapping[category] || '/videos/Home_Rosen_Background.mp4'
      }));
      
      setVideoMappings(mappings);
      setIsLoading(false);
    };

    loadVideoConfig();
  }, []);

  const handleFileChange = async (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show temporary preview
      const tempUrl = URL.createObjectURL(file);
      setPendingChanges(prev => ({ ...prev, [category]: tempUrl }));
      
      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          // Replace temp URL with server URL
          setPendingChanges(prev => ({ ...prev, [category]: data.url }));
          console.log('Video uploaded successfully:', data.url);
        } else {
          alert('Fehler beim Upload des Videos');
          console.error('Upload failed:', response.statusText);
        }
      } catch (error) {
        alert('Fehler beim Upload des Videos');
        console.error('Upload error:', error);
      }
    }
  };

  const handleSaveChanges = (category: string) => {
    const newVideo = pendingChanges[category];
    if (!newVideo) return;

    // Update local state
    setVideoMappings(prev => 
      prev.map(mapping => 
        mapping.category === category 
          ? { ...mapping, currentVideo: newVideo }
          : mapping
      )
    );
    
    // Save to localStorage for persistence across page loads
    const currentMappings = JSON.parse(localStorage.getItem('videoMappings') || '{}');
    currentMappings[category] = newVideo;
    localStorage.setItem('videoMappings', JSON.stringify(currentMappings));
    console.log('VideoManager: Saved to localStorage:', currentMappings);
    
    // Remove from pending changes
    setPendingChanges(prev => {
      const { [category]: removed, ...rest } = prev;
      return rest;
    });

    console.log(`VideoManager: Video updated for category: ${category} to:`, newVideo);
    
    // Trigger immediate update for VideoBackground components
    const event = new CustomEvent('videoConfigChanged', { 
      detail: { category, videoPath: newVideo } 
    });
    console.log('VideoManager: Dispatching event:', event.detail);
    window.dispatchEvent(event);
  };

  const handleDiscardChanges = (category: string) => {
    setPendingChanges(prev => {
      const { [category]: removed, ...rest } = prev;
      return rest;
    });
  };

  const toggleVideoPlay = (category: string) => {
    const videoElement = document.getElementById(`video-${category}`) as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying[category]) {
        videoElement.pause();
        setIsPlaying(prev => ({ ...prev, [category]: false }));
      } else {
        videoElement.play();
        setIsPlaying(prev => ({ ...prev, [category]: true }));
      }
    }
  };

  const openPreview = (videoPath: string) => {
    setPreviewVideo(videoPath);
  };

  const closePreview = () => {
    setPreviewVideo(null);
  };

  const getCurrentVideo = (category: string) => {
    return pendingChanges[category] || videoMappings.find(m => m.category === category)?.currentVideo || '';
  };

  const getVideoFileName = (path: string) => {
    return path.split('/').pop()?.replace(/\.(mp4|mov)$/, '') || 'Unbekannt';
  };

  return (
    <VideoManagerContainer>
      <VideoManagerHeader>
        <VideoManagerTitle>Video-Manager</VideoManagerTitle>
        <VideoManagerSubtitle>
          Verwalten Sie Hintergrundvideos für jede Kategorie und Seite
        </VideoManagerSubtitle>
      </VideoManagerHeader>

      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#FF41FB',
          fontSize: '1.2rem',
          fontFamily: 'Aldrich, sans-serif'
        }}>
          Wird geladen...
        </div>
      ) : (
        <CategoryGrid>
          {videoMappings.map((mapping, index) => {
            const currentVideo = getCurrentVideo(mapping.category);
            const hasChanges = pendingChanges[mapping.category];
          
          return (
            <CategoryCard
              key={mapping.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CategoryHeader>
                <CategoryTitle>{mapping.displayName}</CategoryTitle>
                <PreviewButton onClick={() => openPreview(currentVideo)}>
                  <FaEye />
                  Vollbild
                </PreviewButton>
              </CategoryHeader>

              <VideoPreview
                id={`video-${mapping.category}`}
                src={currentVideo}
                muted
                loop
                playsInline
                onPlay={() => setIsPlaying(prev => ({ ...prev, [mapping.category]: true }))}
                onPause={() => setIsPlaying(prev => ({ ...prev, [mapping.category]: false }))}
                onLoadedData={() => {
                  // Reset play state when video loads
                  setIsPlaying(prev => ({ ...prev, [mapping.category]: false }));
                }}
              />

              <CurrentVideoInfo>
                <CurrentVideoName>
                  <strong>Aktuell:</strong> {getVideoFileName(currentVideo)}
                </CurrentVideoName>
                {hasChanges && (
                  <div style={{ 
                    color: '#4CAF50', 
                    fontSize: '0.8rem', 
                    marginTop: '5px',
                    fontFamily: 'Aldrich, sans-serif'
                  }}>
                    ● Nicht gespeicherte Änderungen
                  </div>
                )}
              </CurrentVideoInfo>

              <VideoControls>
                <ControlButton
                  onClick={() => toggleVideoPlay(mapping.category)}
                  variant="primary"
                >
                  {isPlaying[mapping.category] ? <FaPause /> : <FaPlay />}
                  {isPlaying[mapping.category] ? 'Pause' : 'Play'}
                </ControlButton>

                <select
                  style={{
                    padding: '10px',
                    background: 'rgba(255, 65, 251, 0.2)',
                    border: '2px solid rgba(255, 65, 251, 0.4)',
                    borderRadius: '8px',
                    color: 'white',
                    fontFamily: 'Aldrich, sans-serif',
                    fontSize: '0.8rem',
                    flex: 1,
                    minWidth: '120px',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPendingChanges(prev => ({ ...prev, [mapping.category]: e.target.value }));
                    }
                  }}
                  value={pendingChanges[mapping.category] || ''}
                >
                  <option value="" style={{ background: '#1a1a1a' }}>Video wählen...</option>
                  {availableVideos.map(video => (
                    <option key={video} value={video} style={{ background: '#1a1a1a' }}>
                      {video.split('/').pop()?.replace(/\.(mp4|mov)$/, '').replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>

                <ControlButton
                  as="label"
                  htmlFor={`file-${mapping.category}`}
                  variant="primary"
                >
                  <FaUpload />
                  Upload
                </ControlButton>

                {hasChanges && (
                  <>
                    <ControlButton
                      onClick={() => handleSaveChanges(mapping.category)}
                      variant="success"
                    >
                      <FaSave />
                      Speichern
                    </ControlButton>

                    <ControlButton
                      onClick={() => handleDiscardChanges(mapping.category)}
                      variant="danger"
                    >
                      <FaTrash />
                      Verwerfen
                    </ControlButton>
                  </>
                )}
              </VideoControls>

              <FileInput
                id={`file-${mapping.category}`}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(e) => handleFileChange(mapping.category, e)}
              />
            </CategoryCard>
          );
          })}
        </CategoryGrid>
      )}

      {previewVideo && (
        <PreviewModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePreview}
        >
          <ClosePreview onClick={closePreview}>
            ×
          </ClosePreview>
          <PreviewVideo
            src={previewVideo}
            autoPlay
            muted
            loop
            controls
            onClick={(e) => e.stopPropagation()}
          />
        </PreviewModal>
      )}
    </VideoManagerContainer>
  );
};

export default VideoManager;