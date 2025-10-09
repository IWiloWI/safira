import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaUpload, FaPlay, FaPause, FaTrash, FaSave, FaEye, FaImage } from 'react-icons/fa';
import { getProducts } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  ResponsivePageTitle,
  ResponsiveMainContent,
  ResponsiveCardGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveLoadingContainer
} from '../../styles/AdminLayout';

// Get API URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';




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
  fallbackImage?: string;
  isMainCategory?: boolean;
  parentCategory?: string;
}

const VideoManager: React.FC = () => {
  const { pauseSessionMonitoring, resumeSessionMonitoring } = useAuth();

  const [videoMappings, setVideoMappings] = useState<VideoMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: string }>({});
  const [pendingFallbackImages, setPendingFallbackImages] = useState<{ [key: string]: string }>({});
  const [uploadingVideo, setUploadingVideo] = useState<{ [key: string]: boolean }>({});
  const [uploadingImage, setUploadingImage] = useState<{ [key: string]: boolean }>({});

  // Available videos - loaded dynamically from API
  const [availableVideos, setAvailableVideos] = useState<string[]>([]);

  // Cleanup blob URLs on component unmount or when pendingChanges updates
  useEffect(() => {
    return () => {
      // Revoke all blob URLs to prevent memory leaks
      Object.values(pendingChanges).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [pendingChanges]);

  // Load available videos from the server
  const loadAvailableVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?action=list_videos`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.videos) {
          const videoPaths = data.videos.map((video: any) => video.path);
          setAvailableVideos(videoPaths);
          console.log('VideoManager: Loaded', data.count, 'videos from server');
        }
      } else {
        console.error('Failed to load videos from server');
        // NO fallback videos - must be loaded from server
        setAvailableVideos([]);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      // NO fallback videos - must be loaded from server
      setAvailableVideos([]);
    }
  };

  // Load video mappings from server API
  const loadVideoMappings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?action=get_video_mappings`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const serverMappings: { [key: string]: { video: string, fallbackImage?: string } } = {};
          data.mappings.forEach((mapping: any) => {
            serverMappings[mapping.category_id] = {
              video: mapping.video_path,
              fallbackImage: mapping.fallback_image || ''
            };
          });
          console.log('VideoManager: Loaded video mappings from server:', serverMappings);
          return serverMappings;
        }
      }
    } catch (error) {
      console.error('VideoManager: Error loading video mappings from server:', error);
    }
    return {};
  };

  // Load video configuration with dynamic categories from API
  useEffect(() => {
    const loadVideoConfig = async () => {
      try {
        setIsLoading(true);

        // Load available videos first
        await loadAvailableVideos();

        // Load categories from API
        const apiData = await getProducts();
        const allCategories: any[] = [];

        // Always include home page
        allCategories.push({
          id: 'home',
          name: { de: 'Startseite', en: 'Home' },
          isMainCategory: true
        });

        // Add main categories and subcategories from API
        if (apiData.categories) {
          apiData.categories.forEach((category: any) => {
            // Add main category
            allCategories.push({
              id: category.id,
              name: category.name,
              isMainCategory: true
            });

            // Add subcategories if they exist
            if (category.subcategories && Array.isArray(category.subcategories)) {
              const parentCategoryName = typeof category.name === 'string'
                ? category.name
                : category.name?.de || category.id;

              category.subcategories.forEach((subcat: any) => {
                allCategories.push({
                  id: `subcat_${subcat.id}`,
                  name: subcat.name,
                  isMainCategory: false,
                  parentCategory: parentCategoryName
                });
              });
            }
          });
        }

        // If no API data, add common categories for video management
        if (!apiData.categories || apiData.categories.length === 0) {
          const fallbackCategories = [
            { id: 'shisha', name: { de: 'Shisha Tabak', en: 'Shisha Tobacco' } },
            { id: 'softdrinks', name: { de: 'Softdrinks', en: 'Soft Drinks' } },
            { id: 'hotdrinks', name: { de: 'Heißgetränke', en: 'Hot Drinks' } },
            { id: 'energy', name: { de: 'Energy Drinks', en: 'Energy Drinks' } },
            { id: 'snacks', name: { de: 'Snacks', en: 'Snacks' } },
            { id: 'desserts', name: { de: 'Desserts', en: 'Desserts' } }
          ];

          fallbackCategories.forEach(cat => {
            allCategories.push({
              id: cat.id,
              name: cat.name,
              isMainCategory: true
            });
          });
        }

        // NO hardcoded videos - all videos must be assigned via Video Manager
        const getDefaultVideoForCategory = (categoryName: string): string => {
          // Return empty string - no default videos, must be assigned via Video Manager
          return '';
        };

        // Load saved mappings from server API
        const savedMappings = await loadVideoMappings();

        // Create video mappings for active categories
        const mappings = allCategories.map(category => {
          const categoryKey = category.id.toString();
          const displayName = typeof category.name === 'string' ? category.name : category.name.de || category.name.en || categoryKey;
          const defaultVideo = getDefaultVideoForCategory(displayName);
          const savedMapping = savedMappings[categoryKey];

          return {
            category: categoryKey,
            displayName,
            currentVideo: savedMapping?.video || defaultVideo,
            fallbackImage: savedMapping?.fallbackImage || '',
            isMainCategory: category.isMainCategory,
            parentCategory: category.parentCategory
          };
        });

        console.log('VideoManager: Loaded dynamic categories:', mappings);
        setVideoMappings(mappings);

      } catch (error) {
        console.error('Failed to load categories for video manager:', error);
        // Fallback to basic home category - NO hardcoded video
        setVideoMappings([{
          category: 'home',
          displayName: 'Startseite',
          currentVideo: '', // NO hardcoded video - must be assigned via Video Manager
          isMainCategory: true
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoConfig();
  }, []);

  // File validation helper
  const validateVideoFile = (file: File): string | null => {
    const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
    const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
    const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi'];

    // Check file size
    if (file.size > MAX_SIZE) {
      return `Datei zu groß (max 100 MB). Ihre Datei: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Ungültiges Dateiformat: ${file.type || fileExtension}. Erlaubt: MP4, MOV, WebM, AVI`;
    }

    return null;
  };

  const handleFileChange = async (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateVideoFile(file);
    if (validationError) {
      alert(validationError);
      event.target.value = ''; // Clear file input
      return;
    }

    // Show temporary preview
    const tempUrl = URL.createObjectURL(file);
    setPendingChanges(prev => ({ ...prev, [category]: tempUrl }));

    // Set uploading state
    setUploadingVideo(prev => ({ ...prev, [category]: true }));

    // Pause session monitoring during upload
    pauseSessionMonitoring();

    // Upload to server
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('VideoManager: Uploading video for category:', category, 'File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('VideoManager: Session monitoring paused during upload');

      const response = await fetch(`${API_BASE_URL}?action=upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();

        // Revoke the temporary blob URL
        URL.revokeObjectURL(tempUrl);

        // Replace temp URL with server URL
        setPendingChanges(prev => ({ ...prev, [category]: data.videoUrl }));
        console.log('VideoManager: Video uploaded successfully:', data.videoUrl, 'Original filename:', data.originalFilename);

        // Clear uploading state
        setUploadingVideo(prev => ({ ...prev, [category]: false }));

        // Reload available videos to include the newly uploaded video
        await loadAvailableVideos();
      } else {
        // Revoke blob URL on error
        URL.revokeObjectURL(tempUrl);
        setPendingChanges(prev => {
          const { [category]: removed, ...rest } = prev;
          return rest;
        });
        setUploadingVideo(prev => ({ ...prev, [category]: false }));

        const errorText = await response.text();
        alert('Fehler beim Upload des Videos: ' + errorText);
        console.error('VideoManager: Upload failed:', response.statusText, errorText);
      }
    } catch (error: any) {
      // Revoke blob URL on error
      URL.revokeObjectURL(tempUrl);
      setPendingChanges(prev => {
        const { [category]: removed, ...rest } = prev;
        return rest;
      });
      setUploadingVideo(prev => ({ ...prev, [category]: false }));

      alert('Fehler beim Upload des Videos: ' + (error.message || 'Netzwerkfehler'));
      console.error('VideoManager: Upload error:', error);
    } finally {
      // Always resume session monitoring after upload
      resumeSessionMonitoring();
      console.log('VideoManager: Session monitoring resumed after upload');
    }
  };

  const handleFallbackImageChange = async (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (file.size > MAX_SIZE) {
      alert(`Bild zu groß (max 10 MB). Ihre Datei: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      event.target.value = '';
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`Ungültiges Bildformat: ${file.type}. Erlaubt: JPEG, PNG, WebP`);
      event.target.value = '';
      return;
    }

    // Show temporary preview
    const tempUrl = URL.createObjectURL(file);
    setPendingFallbackImages(prev => ({ ...prev, [category]: tempUrl }));

    // Set uploading state
    setUploadingImage(prev => ({ ...prev, [category]: true }));

    pauseSessionMonitoring();

    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'fallback_image');

    try {
      console.log('VideoManager: Uploading fallback image for category:', category);

      const response = await fetch(`${API_BASE_URL}?action=upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        URL.revokeObjectURL(tempUrl);
        setPendingFallbackImages(prev => ({ ...prev, [category]: data.imageUrl || data.videoUrl }));
        setUploadingImage(prev => ({ ...prev, [category]: false }));
        console.log('VideoManager: Fallback image uploaded successfully:', data.imageUrl || data.videoUrl);
      } else {
        URL.revokeObjectURL(tempUrl);
        setPendingFallbackImages(prev => {
          const { [category]: removed, ...rest } = prev;
          return rest;
        });
        setUploadingImage(prev => ({ ...prev, [category]: false }));
        alert('Fehler beim Upload des Bildes');
      }
    } catch (error: any) {
      URL.revokeObjectURL(tempUrl);
      setPendingFallbackImages(prev => {
        const { [category]: removed, ...rest } = prev;
        return rest;
      });
      setUploadingImage(prev => ({ ...prev, [category]: false }));
      alert('Fehler beim Upload des Bildes: ' + (error.message || 'Netzwerkfehler'));
    } finally {
      resumeSessionMonitoring();
    }
  };

  const handleSaveChanges = async (category: string) => {
    const newVideo = pendingChanges[category];
    const newFallbackImage = pendingFallbackImages[category];

    if (!newVideo && !newFallbackImage) return;

    // Check if upload is still in progress
    if (uploadingVideo[category]) {
      alert('Video-Upload läuft noch. Bitte warten Sie, bis der Upload abgeschlossen ist.');
      return;
    }

    if (uploadingImage[category]) {
      alert('Bild-Upload läuft noch. Bitte warten Sie, bis der Upload abgeschlossen ist.');
      return;
    }

    // Validate video path (reject blob URLs)
    if (newVideo && newVideo.startsWith('blob:')) {
      alert('Upload noch nicht abgeschlossen. Bitte warten Sie, bis der Upload fertig ist.');
      return;
    }

    if (newFallbackImage && newFallbackImage.startsWith('blob:')) {
      alert('Bild-Upload noch nicht abgeschlossen. Bitte warten Sie.');
      return;
    }

    try {
      console.log('VideoManager: Saving video mapping:', {
        category,
        videoPath: newVideo || 'unchanged',
        fallbackImage: newFallbackImage || 'unchanged'
      });

      // Send as JSON instead of FormData
      const response = await fetch(`${API_BASE_URL}?action=save_video_mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_id: category,
          video_path: newVideo || videoMappings.find(m => m.category === category)?.currentVideo || '',
          fallback_image: newFallbackImage || videoMappings.find(m => m.category === category)?.fallbackImage || ''
        })
      });

      // Get response text for better error debugging
      const responseText = await response.text();
      console.log('VideoManager: Save response:', responseText);

      if (!response.ok) {
        console.error('VideoManager: HTTP Error:', response.status, response.statusText);
        console.error('VideoManager: Response body:', responseText);
        alert(`Server-Fehler (${response.status}): ${responseText.substring(0, 200)}`);
        return;
      }

      const data = JSON.parse(responseText);

      if (data.status === 'success') {
        console.log('VideoManager: Successfully saved video mapping to server:', category);

        // Update local state only after successful server save
        setVideoMappings(prev =>
          prev.map(mapping =>
            mapping.category === category
              ? {
                  ...mapping,
                  currentVideo: newVideo || mapping.currentVideo,
                  fallbackImage: newFallbackImage || mapping.fallbackImage
                }
              : mapping
          )
        );

        // Remove from pending changes
        setPendingChanges(prev => {
          const { [category]: removed, ...rest } = prev;
          return rest;
        });

        setPendingFallbackImages(prev => {
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

        alert('Video-Zuweisung erfolgreich gespeichert!');
      } else {
        console.error('VideoManager: Failed to save video mapping:', data);
        alert('Fehler beim Speichern: ' + (data.message || data.error || 'Unbekannter Fehler'));
      }
    } catch (error: any) {
      console.error('VideoManager: Error saving video mapping:', error);
      alert('Fehler beim Speichern: ' + (error.message || 'Netzwerkfehler'));
    }
  };

  const handleDiscardChanges = (category: string) => {
    setPendingChanges(prev => {
      const { [category]: removed, ...rest } = prev;
      return rest;
    });
    setPendingFallbackImages(prev => {
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
    <ResponsiveMainContent>
      <ResponsivePageTitle style={{ textAlign: 'center', marginBottom: '10px' }}>
        Video-Manager
      </ResponsivePageTitle>
      <p style={{
        textAlign: 'center',
        marginBottom: '30px',
        fontFamily: 'Aldrich, sans-serif',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.1rem'
      }}>
        Verwalten Sie Hintergrundvideos für jede Kategorie und Seite
      </p>

      {isLoading ? (
        <ResponsiveLoadingContainer>
          <div className="loading-spinner">Wird geladen...</div>
        </ResponsiveLoadingContainer>
      ) : (
        <ResponsiveCardGrid>
          {videoMappings.map((mapping, index) => {
            const currentVideo = getCurrentVideo(mapping.category);
            const hasChanges = pendingChanges[mapping.category];
          
          return (
            <ResponsiveCard key={mapping.category}>
              <CategoryHeader>
                <div>
                  <CategoryTitle>{mapping.displayName}</CategoryTitle>
                  {!mapping.isMainCategory && mapping.parentCategory && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#41ABFF',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      Unterkategorie von: {typeof mapping.parentCategory === 'string' ? mapping.parentCategory : (mapping.parentCategory as any)?.de || 'Unknown'}
                    </div>
                  )}
                </div>
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
                  <strong>Video:</strong> {getVideoFileName(currentVideo)}
                  {uploadingVideo[mapping.category] && (
                    <span style={{ color: '#FFD700', marginLeft: '10px' }}>
                      ⏳ Upload läuft...
                    </span>
                  )}
                </CurrentVideoName>
                <CurrentVideoName style={{ marginTop: '8px' }}>
                  <strong>Fallback-Bild:</strong> {
                    (pendingFallbackImages[mapping.category] || mapping.fallbackImage)
                      ? getVideoFileName(pendingFallbackImages[mapping.category] || mapping.fallbackImage || '')
                      : 'Nicht gesetzt'
                  }
                  {uploadingImage[mapping.category] && (
                    <span style={{ color: '#FFD700', marginLeft: '10px' }}>
                      ⏳ Upload läuft...
                    </span>
                  )}
                </CurrentVideoName>
                {(hasChanges || pendingFallbackImages[mapping.category]) && (
                  <div style={{
                    color: uploadingVideo[mapping.category] || uploadingImage[mapping.category] ? '#FFD700' : '#4CAF50',
                    fontSize: '0.8rem',
                    marginTop: '5px',
                    fontFamily: 'Aldrich, sans-serif'
                  }}>
                    {uploadingVideo[mapping.category] || uploadingImage[mapping.category]
                      ? '⏳ Upload läuft - bitte warten...'
                      : '● Nicht gespeicherte Änderungen'
                    }
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
                      console.log('VideoManager: Video selected from dropdown:', e.target.value, 'for category:', mapping.category);
                      setPendingChanges(prev => {
                        const updated = { ...prev, [mapping.category]: e.target.value };
                        console.log('VideoManager: Updated pendingChanges:', updated);
                        return updated;
                      });
                    }
                  }}
                  value={pendingChanges[mapping.category] || currentVideo || ''}
                >
                  <option value="" style={{ background: '#1a1a1a' }}>
                    {availableVideos.length === 0 ? 'Keine Videos verfügbar' : 'Video wählen...'}
                  </option>
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
                  Video Upload
                </ControlButton>

                <ControlButton
                  as="label"
                  htmlFor={`fallback-${mapping.category}`}
                  variant="primary"
                >
                  <FaImage />
                  Fallback-Bild
                </ControlButton>

                {(hasChanges || pendingFallbackImages[mapping.category]) && (
                  <>
                    <ControlButton
                      onClick={() => handleSaveChanges(mapping.category)}
                      variant="success"
                      disabled={uploadingVideo[mapping.category] || uploadingImage[mapping.category]}
                    >
                      <FaSave />
                      {uploadingVideo[mapping.category] || uploadingImage[mapping.category] ? 'Upload läuft...' : 'Speichern'}
                    </ControlButton>

                    <ControlButton
                      onClick={() => handleDiscardChanges(mapping.category)}
                      variant="danger"
                      disabled={uploadingVideo[mapping.category] || uploadingImage[mapping.category]}
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
              <FileInput
                id={`fallback-${mapping.category}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={(e) => handleFallbackImageChange(mapping.category, e)}
              />
            </ResponsiveCard>
          );
          })}
        </ResponsiveCardGrid>
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
    </ResponsiveMainContent>
  );
};

export default VideoManager;