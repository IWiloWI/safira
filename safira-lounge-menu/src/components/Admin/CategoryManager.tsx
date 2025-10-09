import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFolder, FaBoxes, FaCheck, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  ResponsivePageTitle,
  ResponsiveMainContent,
  ResponsiveCardGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveFormGroup,
  ResponsiveLabel,
  ResponsiveInput,
  ResponsiveSelect,
  ResponsiveLoadingContainer,
  ResponsiveEmptyState
} from '../../styles/AdminLayout';





const SortButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 10px;
`;

const SortButton = styled.button`
  background: rgba(255, 65, 251, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
    color: #FF41FB;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const CategoryIcon = styled.div`
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #FF41FB, #E91E63);
  border-radius: 12px;
  color: white;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.3rem;
  text-transform: uppercase;
  margin: 0 0 5px 0;
`;

const CategoryId = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
`;

const CategoryStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
`;

const StatLabel = styled.div`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
`;

const CategoryActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'products' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${props => 
    props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.2)' : 
    props.$variant === 'products' ? 'rgba(233, 30, 99, 0.2)' :
    'rgba(255, 65, 251, 0.2)'};
  border: 2px solid ${props => 
    props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.4)' : 
    props.$variant === 'products' ? 'rgba(233, 30, 99, 0.4)' :
    'rgba(255, 65, 251, 0.4)'};
  border-radius: 8px;
  color: ${props => 
    props.$variant === 'danger' ? '#f44336' : 
    props.$variant === 'products' ? '#E91E63' :
    '#FF41FB'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;

  &:hover {
    background: ${props => 
      props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.3)' : 
      props.$variant === 'products' ? 'rgba(233, 30, 99, 0.3)' :
      'rgba(255, 65, 251, 0.3)'};
    border-color: ${props => 
      props.$variant === 'danger' ? '#f44336' : 
      props.$variant === 'products' ? '#E91E63' :
      '#FF41FB'};
    transform: translateY(-2px);
  }

  svg {
    font-size: 0.85rem;
    flex-shrink: 0;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.5rem;
  text-transform: uppercase;
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(244, 67, 54, 0.2);
  border: 2px solid rgba(244, 67, 54, 0.4);
  border-radius: 8px;
  color: #f44336;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
    border-color: #f44336;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 8px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 8px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.3);
  }

  option {
    background: #1A1A2E;
    color: white;
  }
`;


const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 15px;
  background: ${props => 
    props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(145deg, #FF41FB, #E91E63)'};
  border: 2px solid ${props => 
    props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};
  border-radius: 8px;
  color: white;
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 65, 251, 0.3);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 65, 251, 0.5);
    border-radius: 4px;
  }
`;

const ProductCard = styled.div<{ selected: boolean; assigned: boolean }>`
  padding: 15px;
  background: ${props => props.selected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.selected ? '#4CAF50' : props.assigned ? '#FF9800' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: ${props => props.assigned && !props.selected ? 0.6 : 1};
  
  &:hover {
    background: ${props => props.selected ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

const ProductName = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const ProductInfo = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  
  span {
    color: #FF9800;
    font-weight: bold;
  }
`;

const CheckIcon = styled(FaCheck)`
  float: right;
  color: #4CAF50;
  font-size: 1.2rem;
`;

interface Category {
  id: string;
  name: {
    de: string;
    da: string;
    en: string;
  };
  description?: {
    de: string;
    da: string;
    en: string;
  };
  icon?: string;
  image?: string;
  parentPage?: string;
  isMainCategory?: boolean;
  items?: any[];
}

interface CategoryFormData {
  id: string;
  name_de: string;
  name_da: string;
  name_en: string;
  description_de: string;
  description_da: string;
  description_en: string;
  image: string;
  icon: string;
  parentPage: string;
  isMainCategory: boolean;
}


const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<CategoryFormData>({
    id: '',
    name_de: '',
    name_da: '',
    name_en: '',
    description_de: '',
    description_da: '',
    description_en: '',
    image: '',
    icon: 'fa-utensils',
    parentPage: '',
    isMainCategory: false
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Use the API service instead of direct fetch
      const { getProducts } = await import('../../services/api');
      const data = await getProducts();
      const categories = (data.categories || []) as Category[];
      setCategories(categories);

      // Collect all products from all categories
      const products: any[] = [];
      if (Array.isArray(categories)) {
        categories.forEach((cat: any) => {
          if (cat.items && Array.isArray(cat.items)) {
            cat.items.forEach((item: any) => {
              products.push({
                ...item,
                categoryId: cat.id,
                categoryName: cat.name
              });
            });
          }
        });
      }
      setAllProducts(products);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name_de: '',
      name_da: '',
      name_en: '',
      description_de: '',
      description_da: '',
      description_en: '',
      image: '',
      icon: 'fa-utensils',
      parentPage: '',
      isMainCategory: false
    });
    setImagePreview('');
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name_de: category.name.de,
      name_da: category.name.da,
      name_en: category.name.en,
      description_de: category.description?.de || '',
      description_da: category.description?.da || '',
      description_en: category.description?.en || '',
      image: category.image || '',
      icon: category.icon || 'fa-utensils',
      parentPage: category.parentPage || '',
      isMainCategory: category.isMainCategory || false
    });
    setImagePreview(category.image || '');
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        alert('Nicht angemeldet. Bitte anmelden.');
        return;
      }

      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const response = await fetch(`${API_URL}?action=delete_main_category&id=${categoryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadCategories();
        alert('Kategorie erfolgreich gelöscht!');
      } else {
        if (response.status === 400 && result.error?.includes('products')) {
          alert('⚠️ Diese Kategorie kann nicht gelöscht werden, da sie noch Produkte enthält.\n\nBitte löschen oder verschieben Sie zuerst alle Produkte aus dieser Kategorie.');
        } else {
          alert(`Fehler beim Löschen der Kategorie: ${result.error || 'Unbekannter Fehler'}`);
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Fehler beim Löschen der Kategorie: Netzwerkfehler');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = async () => {
    if (isSaving) return; // Prevent double clicks

    try {
      setIsSaving(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        alert('Nicht angemeldet. Bitte anmelden.');
        setIsSaving(false);
        return;
      }

      // Step 1: Upload image if new image was selected
      let imageUrl = formData.image || '';

      if (formData.image && formData.image.startsWith('data:image')) {
        // New image upload - process to responsive WebP
        try {
          const uploadResponse = await fetch('/api/endpoints/image-upload.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image: formData.image,
              name: formData.name_de || 'category'
            })
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResult.success) {
            imageUrl = uploadResult.url; // Use the 600w responsive image URL
            console.log('Image uploaded successfully:', uploadResult);
          } else {
            throw new Error(uploadResult.error || 'Image upload failed');
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          alert('Fehler beim Hochladen des Bildes. Kategorie wird ohne neues Bild gespeichert.');
          // Continue without new image
        }
      }

      // Step 2: Save category with image URL
      const categoryData = {
        name: {
          de: formData.name_de,
          da: formData.name_da,
          en: formData.name_en
        },
        description: {
          de: formData.description_de || '',
          da: formData.description_da || '',
          en: formData.description_en || ''
        },
        icon: formData.icon || 'fa-utensils',
        image: imageUrl
      };

      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const action = editingCategory ? 'update_main_category' : 'create_main_category';
      const url = editingCategory ? `${API_URL}?action=${action}&id=${editingCategory.id}` : `${API_URL}?action=${action}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowModal(false);
        await loadCategories();
        alert(editingCategory ? 'Kategorie erfolgreich aktualisiert!' : 'Kategorie erfolgreich erstellt!');
      } else {
        alert(`Fehler beim Speichern der Kategorie: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Fehler beim Speichern der Kategorie: Netzwerkfehler');
    } finally {
      setIsSaving(false);
    }
  };

  const generateId = (name: string) => {
    return name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleManageProducts = (category: Category) => {
    setEditingCategory(category);
    // Set currently selected products for this category
    const categoryProducts = category.items?.map(item => item.id) || [];
    setSelectedProducts(categoryProducts);
    setShowProductModal(true);
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSaveProducts = async () => {
    if (!editingCategory) return;

    try {
      const token = localStorage.getItem('adminToken');
      
      // Get the selected product objects
      const selectedProductObjects = allProducts
        .filter(p => selectedProducts.includes(p.id))
        .map(p => {
          // Remove category-specific info from product
          const { categoryId, categoryName, ...productData } = p;
          return productData;
        });

      const categoryData = {
        ...editingCategory,
        items: selectedProductObjects
      };

      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        await loadCategories();
        setShowProductModal(false);
        alert('Produkte erfolgreich aktualisiert');
      } else {
        alert('Fehler beim Aktualisieren der Produkte');
      }
    } catch (error) {
      console.error('Error updating products:', error);
      alert('Fehler beim Aktualisieren der Produkte');
    }
  };

  const moveCategoryUp = async (categoryId: string) => {
    const mainCategories = categories.filter(cat => cat.isMainCategory);
    const currentIndex = mainCategories.findIndex(cat => cat.id === categoryId);

    if (currentIndex <= 0) return;

    const newCategories = [...mainCategories];
    [newCategories[currentIndex - 1], newCategories[currentIndex]] =
    [newCategories[currentIndex], newCategories[currentIndex - 1]];

    await updateCategoryOrder(newCategories);
  };

  const moveCategoryDown = async (categoryId: string) => {
    const mainCategories = categories.filter(cat => cat.isMainCategory);
    const currentIndex = mainCategories.findIndex(cat => cat.id === categoryId);

    if (currentIndex >= mainCategories.length - 1) return;

    const newCategories = [...mainCategories];
    [newCategories[currentIndex], newCategories[currentIndex + 1]] =
    [newCategories[currentIndex + 1], newCategories[currentIndex]];

    await updateCategoryOrder(newCategories);
  };

  const updateCategoryOrder = async (orderedCategories: any[]) => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';

      const response = await fetch(`${API_URL}?action=update_category_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories: orderedCategories.map((item, index) => ({
            id: item.id,
            sortOrder: index + 1
          }))
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadCategories();
      } else {
        alert('Fehler beim Speichern der Reihenfolge');
      }
    } catch (error) {
      console.error('Error updating category order:', error);
      alert('Fehler beim Speichern der Reihenfolge');
    }
  };

  return (
    <ResponsiveMainContent>
      <ResponsivePageTitle style={{ textAlign: 'center', marginBottom: '10px' }}>
        Kategorie-Manager
      </ResponsivePageTitle>
      <p style={{
        textAlign: 'center',
        marginBottom: '30px',
        fontFamily: 'Aldrich, sans-serif',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.1rem'
      }}>
        Verwalten Sie alle Kategorien und Tabs für Ihr Menü
      </p>

      <ResponsiveButton
        onClick={handleAddCategory}
        style={{ marginBottom: '30px' }}
      >
        <FaPlus />
        Neue Kategorie hinzufügen
      </ResponsiveButton>

      {isLoading ? (
        <ResponsiveLoadingContainer>
          <div className="loading-spinner">Wird geladen...</div>
        </ResponsiveLoadingContainer>
      ) : (
        <>
          {(() => {
            const mainCategories = categories.filter(category => category.isMainCategory === true);
            if (mainCategories.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'rgba(255, 65, 251, 0.1)',
                  border: '2px dashed rgba(255, 65, 251, 0.3)',
                  borderRadius: '15px',
                  marginBottom: '30px'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📂</div>
                  <h3 style={{ 
                    color: '#FF41FB', 
                    fontFamily: 'Oswald, sans-serif', 
                    fontSize: '1.5rem',
                    marginBottom: '15px'
                  }}>
                    Keine Hauptkategorien vorhanden
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'Aldrich, sans-serif',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '20px'
                  }}>
                    Markieren Sie Kategorien als "Hauptkategorie" beim Bearbeiten, damit sie auf der Startseite angezeigt werden.
                  </p>
                  <div style={{
                    background: 'rgba(76, 175, 80, 0.2)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    marginTop: '20px'
                  }}>
                    <strong style={{ color: '#4CAF50' }}>💡 Tipp:</strong>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '8px' }}>
                      Bearbeiten Sie eine Kategorie und aktivieren Sie "Als Hauptkategorie" um sie hier anzuzeigen.
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <ResponsiveCardGrid>
                {mainCategories.map((category, index) => (
            <ResponsiveCard key={category.id}>
              <CategoryHeader>
                <CategoryIcon>
                  <FaFolder />
                </CategoryIcon>
                <CategoryInfo>
                  <CategoryName>{category.name.de}</CategoryName>
                  <CategoryId>ID: {category.id}</CategoryId>
                  <CategoryId style={{ color: '#E91E63', marginTop: '5px' }}>
                    {category.isMainCategory ? (
                      <strong style={{ color: '#4CAF50' }}>⭐ Hauptkategorie</strong>
                    ) : (
                      <>Unterkategorie von: {
                        categories.find(c => c.id === category.parentPage)?.name.de || category.parentPage || 'Keine'
                      }</>
                    )}
                  </CategoryId>
                </CategoryInfo>
              </CategoryHeader>

              <CategoryStats>
                <StatItem>
                  <StatValue>{category.items?.length || 0}</StatValue>
                  <StatLabel>Produkte</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{category.items?.filter(item => item.available !== false).length || 0}</StatValue>
                  <StatLabel>Verfügbar</StatLabel>
                </StatItem>
              </CategoryStats>

              <CategoryActions>
                <SortButtons>
                  <SortButton
                    onClick={() => moveCategoryUp(category.id)}
                    disabled={index === 0}
                    title="Nach oben verschieben"
                  >
                    <FaArrowUp />
                  </SortButton>
                  <SortButton
                    onClick={() => moveCategoryDown(category.id)}
                    disabled={index === mainCategories.length - 1}
                    title="Nach unten verschieben"
                  >
                    <FaArrowDown />
                  </SortButton>
                </SortButtons>
                <ActionButton onClick={() => handleEditCategory(category)}>
                  <FaEdit />
                  Bearbeiten
                </ActionButton>
                <ActionButton
                  $variant="products"
                  onClick={() => handleManageProducts(category)}
                >
                  <FaBoxes />
                  Produkte ({category.items?.length || 0})
                </ActionButton>
                <ActionButton
                  $variant="danger"
                  onClick={() => handleDeleteCategory(category.id)}
                  title={category.items && category.items.length > 0 ?
                    `Diese Kategorie hat ${category.items.length} Produkte` :
                    'Kategorie löschen'}
                >
                  <FaTrash />
                  Löschen
                </ActionButton>
              </CategoryActions>
            </ResponsiveCard>
                ))}
              </ResponsiveCardGrid>
            );
          })()}
        </>
      )}

      {showModal && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <FormLabel>Kategorie ID</FormLabel>
              <FormInput
                type="text"
                placeholder="z.B. neue-kategorie"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                disabled={!!editingCategory}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Name (Deutsch)</FormLabel>
              <FormInput
                type="text"
                placeholder="z.B. Neue Kategorie"
                value={formData.name_de}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    name_de: value,
                    id: prev.id || generateId(value)
                  }));
                }}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Name (Dänisch)</FormLabel>
              <FormInput
                type="text"
                placeholder="z.B. Ny Kategori"
                value={formData.name_da}
                onChange={(e) => setFormData(prev => ({ ...prev, name_da: e.target.value }))}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Name (Englisch)</FormLabel>
              <FormInput
                type="text"
                placeholder="z.B. New Category"
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>
                <input
                  type="checkbox"
                  checked={formData.isMainCategory}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isMainCategory: e.target.checked,
                    parentPage: e.target.checked ? '' : prev.parentPage 
                  }))}
                  style={{ marginRight: '10px' }}
                />
                Als Hauptkategorie (erscheint auf Startseite)
              </FormLabel>
            </FormGroup>

            {!formData.isMainCategory && (
              <FormGroup>
                <FormLabel>Unterkategorie von</FormLabel>
                <FormSelect
                  value={formData.parentPage}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentPage: e.target.value }))}
                >
                  <option value="">Kategorie wählen...</option>
                  {categories
                    .filter(cat => cat.isMainCategory)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name.de}
                      </option>
                    ))}
                </FormSelect>
              </FormGroup>
            )}

            {formData.isMainCategory && (
              <FormGroup>
                <FormLabel>Button-Bild für Startseite</FormLabel>
                {imagePreview && (
                  <div style={{ 
                    marginBottom: '10px', 
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Vorschau"
                      loading="lazy"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px'
                      }} 
                    />
                  </div>
                )}
                <FormInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ padding: '8px' }}
                />
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  marginTop: '5px' 
                }}>
                  Empfohlene Größe: 400x300px
                </p>
              </FormGroup>
            )}


            <ModalActions>
              <ModalButton
                $variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Abbrechen
              </ModalButton>
              <ModalButton onClick={handleSaveCategory} disabled={isSaving}>
                <FaSave />
                {isSaving ? 'Speichert...' : 'Speichern'}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Product Assignment Modal */}
      {showProductModal && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowProductModal(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px' }}
          >
            <ModalHeader>
              <ModalTitle>
                Produkte verwalten - {editingCategory?.name.de}
              </ModalTitle>
              <CloseButton onClick={() => setShowProductModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <FormLabel>
                Wählen Sie Produkte für diese Kategorie aus. 
                <span style={{ color: '#FF9800', marginLeft: '10px' }}>
                  Orange = Bereits in einer anderen Kategorie
                </span>
              </FormLabel>
              
              <ProductGrid>
                {allProducts.map(product => {
                  const isSelected = selectedProducts.includes(product.id);
                  const isAssignedElsewhere = product.categoryId !== editingCategory?.id && product.categoryId;
                  
                  return (
                    <ProductCard
                      key={product.id}
                      selected={isSelected}
                      assigned={isAssignedElsewhere}
                      onClick={() => {
                        if (isAssignedElsewhere && !isSelected) {
                          if (window.confirm(`"${product.name.de || product.name}" ist bereits in "${product.categoryName?.de || product.categoryId}" zugewiesen. Trotzdem hinzufügen?`)) {
                            handleProductToggle(product.id);
                          }
                        } else {
                          handleProductToggle(product.id);
                        }
                      }}
                    >
                      {isSelected && <CheckIcon />}
                      <ProductName>
                        {product.name.de || product.name || product.id}
                      </ProductName>
                      {isAssignedElsewhere && (
                        <ProductInfo>
                          Aktuell in: <span>{product.categoryName?.de || product.categoryId}</span>
                        </ProductInfo>
                      )}
                      {product.price && (
                        <ProductInfo>
                          Preis: {product.price}€
                        </ProductInfo>
                      )}
                    </ProductCard>
                  );
                })}
              </ProductGrid>
            </FormGroup>

            <div style={{ 
              padding: '15px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <strong>Ausgewählt: {selectedProducts.length} Produkte</strong>
            </div>

            <ModalActions>
              <ModalButton
                $variant="secondary"
                onClick={() => setShowProductModal(false)}
              >
                Abbrechen
              </ModalButton>
              <ModalButton onClick={handleSaveProducts}>
                <FaSave />
                Produkte speichern
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </ResponsiveMainContent>
  );
};

export default CategoryManager;