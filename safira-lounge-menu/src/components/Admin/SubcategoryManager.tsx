/**
 * Subcategory Manager Component
 * Manages subcategories (regular categories) within main categories
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFolder,
  FaBoxes, FaCheck, FaArrowRight, FaLayerGroup, FaFilter,
  FaCheckSquare, FaSquare, FaTrashAlt
} from 'react-icons/fa';
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





const MainCategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 65, 251, 0.2);
`;

const MainCategoryIcon = styled.div`
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #FF41FB, #E91E63);
  border-radius: 15px;
  color: white;
  box-shadow: 0 5px 15px rgba(255, 65, 251, 0.3);
`;

const MainCategoryInfo = styled.div`
  flex: 1;
`;

const MainCategoryName = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.8rem;
  text-transform: uppercase;
  margin: 0 0 5px 0;
`;

const MainCategoryStats = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;



const SubcategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;


const SubcategoryInfo = styled.div`
  flex: 1;
`;

const SubcategoryName = styled.h4`
  font-family: 'Oswald', sans-serif;
  color: white;
  font-size: 1.1rem;
  text-transform: uppercase;
  margin: 0 0 3px 0;
`;

const SubcategoryId = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  margin: 0;
`;

const SubcategoryStats = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const StatItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  flex: 1;
`;

const StatValue = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: #E91E63;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  margin-top: 2px;
`;

const SubcategoryActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ProductsList = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 65, 251, 0.2);
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ProductsTitle = styled.h4`
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 0.9rem;
  margin: 0;
  text-transform: uppercase;
`;

const ProductsToggle = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    color: #FF41FB;
    background: rgba(255, 65, 251, 0.1);
  }
`;

const ProductItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${props => props.$selected ? 'rgba(255, 65, 251, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 6px;
  margin-bottom: 6px;
  border: 1px solid ${props => props.$selected ? 'rgba(255, 65, 251, 0.4)' : 'rgba(255, 65, 251, 0.1)'};
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    background: ${props => props.$selected ? 'rgba(255, 65, 251, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: rgba(255, 65, 251, 0.3);
    transform: translateY(-1px);
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  pointer-events: none;
`;

const ProductName = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ProductDetails = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin-top: 2px;
`;

const ProductRemoveButton = styled.button`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 4px;
  color: #f44336;
  cursor: pointer;
  padding: 6px 10px;
  font-size: 0.7rem;
  font-family: 'Aldrich', sans-serif;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: auto;
  z-index: 10;

  &:hover {
    background: rgba(244, 67, 54, 0.3);
    border-color: #f44336;
    transform: translateY(-1px);
  }
`;

const ProductCheckbox = styled.div`
  display: flex;
  align-items: center;
  color: #FF41FB;
  font-size: 0.9rem;
  margin-right: 10px;
  transition: all 0.3s ease;
  pointer-events: none;

  &:hover {
    color: #E91E63;
    transform: scale(1.1);
  }
`;

const SelectionControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: rgba(255, 65, 251, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 65, 251, 0.2);
`;

const SelectionButton = styled.button<{ $variant?: 'select' | 'danger' }>`
  background: ${props => 
    props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 65, 251, 0.2)'};
  border: 1px solid ${props => 
    props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.4)' : 'rgba(255, 65, 251, 0.4)'};
  border-radius: 4px;
  color: ${props => 
    props.$variant === 'danger' ? '#f44336' : '#FF41FB'};
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-family: 'Aldrich', sans-serif;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${props => 
      props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(255, 65, 251, 0.3)'};
    border-color: ${props => 
      props.$variant === 'danger' ? '#f44336' : '#FF41FB'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SelectionInfo = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-left: auto;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'products' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 12px;
  background: ${props => 
    props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.2)' : 
    props.$variant === 'products' ? 'rgba(233, 30, 99, 0.2)' :
    'rgba(255, 65, 251, 0.2)'};
  border: 2px solid ${props => 
    props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.4)' : 
    props.$variant === 'products' ? 'rgba(233, 30, 99, 0.4)' :
    'rgba(255, 65, 251, 0.4)'};
  border-radius: 6px;
  color: ${props => 
    props.$variant === 'danger' ? '#f44336' : 
    props.$variant === 'products' ? '#E91E63' :
    '#FF41FB'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.7rem;
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
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.8rem;
    flex-shrink: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Aldrich', sans-serif;
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
  max-width: 600px;
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

// Types
interface Category {
  id: string;
  name: {
    de: string;
    da: string;
    en: string;
    tr: string;
    it: string;
  };
  icon: string;
  parentPage?: string;
  items?: any[];
  isMainCategory?: boolean;
  subcategories?: Category[];
}

interface MainCategory {
  id: string;
  name: {
    de: string;
    da: string;
    en: string;
    tr: string;
    it: string;
  };
  icon: string;
  image: string;
  categoryIds: string[];
  order?: number;
  enabled?: boolean;
}

interface SubcategoryFormData {
  id?: string; // Optional since it's auto-generated for new subcategories
  name_de: string;
  name_en?: string; // Optional for create mode, required for edit mode
  name_tr?: string; // Optional for create mode, required for edit mode
  name_da?: string; // Optional for create mode, required for edit mode
  name_it?: string; // Optional for create mode, required for edit mode
  parentPage: string;
}


// This will be populated from the actual CategoryManager data
let mainCategories: Record<string, MainCategory> = {};

const SubcategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategoriesData, setMainCategoriesData] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name_de: '',
    parentPage: ''
  });
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Map<string, Set<string>>>(new Map());
  const [activeLanguages, setActiveLanguages] = useState<{code: string, name: string}[]>([]);

  useEffect(() => {
    loadCategories();
    loadActiveLanguages();
  }, []);

  const loadActiveLanguages = async () => {
    try {
      const { getActiveLanguages } = await import('../../services/api');
      const response = await getActiveLanguages();
      const languages = response.active_languages || [];
      setActiveLanguages(languages);
    } catch (error) {
      console.error('Failed to load active languages:', error);
      // Default to German if loading fails
      setActiveLanguages([{ code: 'de', name: 'Deutsch' }]);
    }
  };

  useEffect(() => {
    if (showModal && !editingSubcategory) {
      setFormData(prev => ({ ...prev, parentPage: selectedMainCategory }));
    }
  }, [selectedMainCategory, showModal, editingSubcategory]);

  const loadCategories = async () => {
    try {
      // Use the API service instead of direct fetch
      const { getProducts } = await import('../../services/api');
      const data = await getProducts();
      const categories = (data.categories || []) as any[];
      setCategories(categories);


      // Filter only main categories
      const mainCats = categories.filter((cat: any) => cat.isMainCategory === true);
      setMainCategoriesData(mainCats);

      // Update the global mainCategories object
      mainCategories = {};
      mainCats.forEach((cat: any) => {
        const categoryName = typeof cat.name === 'string' ? cat.name : cat.name?.de || cat.id;
        mainCategories[cat.id] = {
          id: cat.id,
          name: typeof cat.name === 'string'
            ? { de: cat.name, da: cat.name, en: cat.name, tr: cat.name, it: cat.name }
            : cat.name,
          icon: '📁', // Default icon
          image: cat.image || '/images/placeholder-category.jpg',
          categoryIds: [],
          order: cat.order || 1,
          enabled: cat.enabled !== false
        };
      });

      // Set first main category as selected if none selected
      if (!selectedMainCategory && mainCats.length > 0) {
        setSelectedMainCategory(mainCats[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubcategories = useMemo(() => {
    // Find the selected main category
    const selectedMainCat = categories.find(cat =>
      cat.id === selectedMainCategory && cat.isMainCategory === true
    );

    // Return subcategories from the main category if available
    if (selectedMainCat && selectedMainCat.subcategories) {
      return selectedMainCat.subcategories;
    }

    // Fallback: filter categories with parentPage matching selectedMainCategory
    return categories.filter(cat => {
      if (cat.parentPage) {
        return cat.parentPage === selectedMainCategory;
      }

      // Legacy fallback for existing categories without parentPage
      const defaultMappings: { [key: string]: string[] } = {
        'drinks': ['softdrinks', 'eistee-energy', 'tee-kaffee', 'saefte', 'cocktails-mocktails', 'spirituosen', 'wein-sekt', 'flaschenbier'],
        'shisha': ['shisha-standard', 'shisha-plus', 'shisha-traditionell'],
        'snacks': ['snacks-suess', 'snacks-herzhaft']
      };
      return defaultMappings[selectedMainCategory]?.includes(cat.id);
    });
  }, [categories, selectedMainCategory]);

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    setFormData({
      name_de: '',
      parentPage: selectedMainCategory
    });
    setShowModal(true);
  };

  const handleEditSubcategory = (subcategory: Category) => {
    // Debug: Log the subcategory data to see what translations we have
    console.log('Editing subcategory:', subcategory);
    console.log('Subcategory name translations:', subcategory.name);

    setEditingSubcategory(subcategory);
    setFormData({
      id: subcategory.id,
      name_de: subcategory.name.de || '',
      name_en: subcategory.name.en || subcategory.name.de || '',
      name_tr: subcategory.name.tr || subcategory.name.de || '',
      name_da: subcategory.name.da || subcategory.name.de || '',
      name_it: subcategory.name.it || subcategory.name.de || '',
      parentPage: subcategory.parentPage || selectedMainCategory
    });
    setShowModal(true);
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    const subcategory = categories.find((cat: Category) => cat.id === subcategoryId);
    const productCount = subcategory?.items?.length || 0;
    
    if (productCount > 0) {
      // Kategorie enthält Produkte - erweiterte Bestätigung
      const deleteWithProducts = window.confirm(
        `⚠️ Diese Unterkategorie enthält ${productCount} Produkt(e).\n\n` +
        `Möchten Sie die Kategorie UND alle zugewiesenen Produkte löschen?\n\n` +
        `⚠️ ACHTUNG: Alle Produkte in dieser Kategorie werden unwiderruflich gelöscht!\n\n` +
        `Klicken Sie "OK" um Kategorie + Produkte zu löschen\n` +
        `Klicken Sie "Abbrechen" um den Vorgang abzubrechen`
      );
      
      if (!deleteWithProducts) {
        return;
      }
    } else {
      // Kategorie ist leer - normale Bestätigung
      if (!window.confirm('Sind Sie sicher, dass Sie diese leere Unterkategorie löschen möchten?')) {
        return;
      }
    }

    try {
      const token = localStorage.getItem('adminToken');

      // Skip CSRF for PHP API - not implemented yet
      const csrfToken = 'php-api-no-csrf';

      if (productCount > 0) {
        // Erst alle Produkte löschen
        const deletePromises = subcategory?.items?.map(async (product: any) => {
          const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
          const productResponse = await fetch(`${API_URL}?action=update_product&category_id=${subcategoryId}&id=${product.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-csrf-token': csrfToken
            }
          });
          
          if (!productResponse.ok) {
            throw new Error(`Fehler beim Löschen von Produkt ${product.name}: ${productResponse.status}`);
          }
          
          return product;
        }) || [];
        
        // Warten auf alle Produkt-Löschungen
        await Promise.all(deletePromises);
        console.log(`${productCount} Produkte erfolgreich gelöscht`);
      }

      // Dann die Kategorie löschen via PHP API
      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const response = await fetch(`${API_URL}?action=delete_subcategory&id=${subcategoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        }
      });

      if (response.ok) {
        await loadCategories();
        
        // Benachrichtige andere Komponenten über Kategorieänderungen
        window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
          detail: { action: 'deleted', categoryId: subcategoryId } 
        }));
        
        const message = productCount > 0 
          ? `Unterkategorie und ${productCount} Produkt(e) erfolgreich gelöscht`
          : 'Unterkategorie erfolgreich gelöscht';
        alert(message);
      } else {
        const errorData = await response.json();
        alert(`Fehler beim Löschen der Unterkategorie: ${errorData.error || 'Unbekannter Fehler'}`);
      }
    } catch (error: unknown) {
      console.error('Error deleting subcategory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Netzwerkfehler';
      alert(`Fehler beim Löschen der Unterkategorie: ${errorMessage}`);
    }
  };

  const handleSaveSubcategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const subcategoryData = {
        // ID will be auto-generated by database for new subcategories
        ...(editingSubcategory && { id: editingSubcategory.id }),
        name: editingSubcategory ? {
          // For editing: send all languages
          de: formData.name_de,
          en: formData.name_en || formData.name_de,
          tr: formData.name_tr || formData.name_de,
          da: formData.name_da || formData.name_de,
          it: formData.name_it || formData.name_de
        } : {
          // For creating: only German (other languages will be auto-translated)
          de: formData.name_de
        },
        category_id: formData.parentPage, // Backend expects category_id instead of parentPage
        items: editingSubcategory?.items || []
      };

      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const action = editingSubcategory ? 'update_subcategory' : 'create_subcategory';
      const method = editingSubcategory ? 'PUT' : 'POST';

      // Skip CSRF for PHP API - not implemented yet
      const csrfToken = 'php-api-no-csrf';

      // Add category_id to URL for create_subcategory endpoint
      const categoryIdParam = !editingSubcategory ? `&category_id=${formData.parentPage}` : '';
      const response = await fetch(`${API_URL}?action=${action}${editingSubcategory ? `&id=${editingSubcategory.id}` : categoryIdParam}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify(subcategoryData)
      });

      if (response.ok) {
        setShowModal(false);
        await loadCategories();

        // Automatically translate the new subcategory to all active languages
        if (!editingSubcategory) {
          try {
            // Get active languages and trigger auto-translation
            const { getActiveLanguages, autoTranslateMissingContent } = await import('../../services/api');
            const activeLanguagesResponse = await getActiveLanguages();
            const activeLanguages = activeLanguagesResponse.active_languages || [];

            for (const lang of activeLanguages) {
              if (lang.code !== 'de') { // Skip German as it's the source
                await autoTranslateMissingContent(lang.code);
              }
            }
          } catch (translationError) {
            console.error('Auto-translation failed:', translationError);
            // Don't block the main flow, just log the error
          }
        }

        // Benachrichtige andere Komponenten über Kategorieänderungen
        window.dispatchEvent(new CustomEvent('categoriesUpdated', {
          detail: { action: editingSubcategory ? 'updated' : 'created', category: subcategoryData }
        }));

        alert(editingSubcategory ? 'Unterkategorie erfolgreich aktualisiert' : 'Unterkategorie erfolgreich erstellt');
      } else {
        alert('Fehler beim Speichern der Unterkategorie');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Fehler beim Speichern der Unterkategorie');
    }
  };

  const generateId = (name: string | undefined | null) => {
    // Handle null, undefined, or empty strings
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const toggleProductsList = (subcategoryId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  const handleRemoveProduct = async (subcategoryId: string, productId: string, productName: string) => {
    if (!window.confirm(`Sind Sie sicher, dass Sie das Produkt "${productName}" aus der Unterkategorie entfernen möchten?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      // Skip CSRF for PHP API - not implemented yet
      const csrfToken = 'php-api-no-csrf';

      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const response = await fetch(`${API_URL}?action=delete_product&category_id=${subcategoryId}&id=${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        }
      });

      if (response.ok) {
        await loadCategories();
        alert(`✅ Produkt "${productName}" erfolgreich entfernt`);
      } else {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Keep default error message if JSON parsing fails
        }
        alert(`❌ Fehler beim Entfernen des Produkts "${productName}":\n\n${errorMessage}`);
        console.error(`Failed to delete product ${productId}:`, response.status, errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error removing product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Netzwerkfehler';
      alert(`❌ Netzwerkfehler beim Entfernen des Produkts "${productName}":\n\n${errorMessage}`);
    }
  };

  const toggleProductSelection = (subcategoryId: string, productId: string) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      const categorySelection = newMap.get(subcategoryId) || new Set();
      
      if (categorySelection.has(productId)) {
        categorySelection.delete(productId);
      } else {
        categorySelection.add(productId);
      }
      
      if (categorySelection.size === 0) {
        newMap.delete(subcategoryId);
      } else {
        newMap.set(subcategoryId, categorySelection);
      }
      
      return newMap;
    });
  };

  const selectAllProducts = (subcategoryId: string, products: any[]) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      const allProductIds = new Set(products.map(p => p.id));
      newMap.set(subcategoryId, allProductIds);
      return newMap;
    });
  };

  const deselectAllProducts = (subcategoryId: string) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      newMap.delete(subcategoryId);
      return newMap;
    });
  };

  const removeSelectedProducts = async (subcategoryId: string) => {
    const selectedIds = selectedProducts.get(subcategoryId);
    if (!selectedIds || selectedIds.size === 0) return;

    const subcategory = categories.find(cat => cat.id === subcategoryId);
    const selectedProductsData = subcategory?.items?.filter(item => selectedIds.has(item.id)) || [];
    
    const productNames = selectedProductsData.map(p => p.name?.de || p.name || 'Unbenannt').join(', ');
    
    if (!window.confirm(
      `Sind Sie sicher, dass Sie ${selectedIds.size} ausgewählte Produkte entfernen möchten?\n\n` +
      `Produkte: ${productNames}\n\n` +
      `⚠️ Diese Aktion kann nicht rückgängig gemacht werden!`
    )) {
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    try {
      const token = localStorage.getItem('adminToken');

      // Skip CSRF for PHP API - not implemented yet
      const csrfToken = 'php-api-no-csrf';

      // Remove products sequentially to avoid overwhelming server
      for (const productId of Array.from(selectedIds)) {
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
          const response = await fetch(`${API_URL}?action=delete_product&category_id=${subcategoryId}&id=${productId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-csrf-token': csrfToken
            }
          });
          
          if (response.ok) {
            successCount++;
          } else {
            failureCount++;
            const product = selectedProductsData.find(p => p.id === productId);
            const productName = product?.name?.de || product?.name || productId;
            let errorMessage = `${productName}: HTTP ${response.status}`;
            
            try {
              const errorData = await response.json();
              if (errorData.error) {
                errorMessage = `${productName}: ${errorData.error}`;
              }
            } catch {
              // Keep default error message if JSON parsing fails
            }
            
            errors.push(errorMessage);
            console.error(`Failed to delete product ${productId}:`, errorMessage);
          }
        } catch (networkError) {
          failureCount++;
          const product = selectedProductsData.find(p => p.id === productId);
          const productName = product?.name?.de || product?.name || productId;
          const errorMessage = `${productName}: Netzwerkfehler`;
          errors.push(errorMessage);
          console.error(`Network error deleting product ${productId}:`, networkError);
        }
      }
      
      // Clear selection and reload if any products were successfully deleted
      if (successCount > 0) {
        deselectAllProducts(subcategoryId);
        await loadCategories();
      }
      
      // Show comprehensive result message
      if (failureCount === 0) {
        alert(`✅ Alle ${successCount} Produkte erfolgreich entfernt`);
      } else if (successCount === 0) {
        alert(
          `⚠️ Fehler: Kein Produkt konnte entfernt werden.\n\n` +
          `Fehlerdetails:\n${errors.join('\n')}`
        );
      } else {
        alert(
          `⚠️ Teilweise erfolgreich:\n\n` +
          `✅ ${successCount} Produkte erfolgreich entfernt\n` +
          `❌ ${failureCount} Produkte fehlgeschlagen\n\n` +
          `Fehlerdetails:\n${errors.join('\n')}`
        );
      }
    } catch (error: unknown) {
      console.error('Critical error in removeSelectedProducts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      alert(`Kritischer Fehler beim Entfernen der Produkte: ${errorMessage}`);
    }
  };

  const getSelectedCount = (subcategoryId: string) => {
    return selectedProducts.get(subcategoryId)?.size || 0;
  };

  const isProductSelected = (subcategoryId: string, productId: string) => {
    return selectedProducts.get(subcategoryId)?.has(productId) || false;
  };

  const areAllProductsSelected = (subcategoryId: string, products: any[]) => {
    const selected = selectedProducts.get(subcategoryId);
    return selected && selected.size === products.length && products.length > 0;
  };

  const currentMainCategory = mainCategoriesData.find(cat => cat.id === selectedMainCategory) || {
    id: selectedMainCategory,
    name: { de: 'Unbekannte Kategorie', da: 'Ukendt kategori', en: 'Unknown Category', tr: 'Bilinmeyen Kategori', it: 'Categoria Sconosciuta' },
    icon: '📁',
    image: '',
    categoryIds: [],
    order: 1,
    enabled: true
  };
  const totalProducts = filteredSubcategories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0);

  return (
    <ResponsiveMainContent>
      <ResponsivePageTitle style={{ textAlign: 'center', marginBottom: '10px' }}>
        Unterkategorie-Manager
      </ResponsivePageTitle>
      <p style={{
        textAlign: 'center',
        marginBottom: '30px',
        fontFamily: 'Aldrich, sans-serif',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '1.1rem'
      }}>
        Verwalten Sie die Unterkategorien innerhalb der Hauptkategorien
      </p>

      <ResponsiveCard style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          <ResponsiveFormGroup style={{ marginBottom: 0 }}>
            <ResponsiveLabel>
              <FaFilter style={{ marginRight: '10px', color: '#FF41FB' }} />
              Hauptkategorie filtern
            </ResponsiveLabel>
            <ResponsiveSelect
              value={selectedMainCategory}
              onChange={(e) => setSelectedMainCategory(e.target.value)}
            >
              {mainCategoriesData.map((category) => {
                const categoryName = typeof category.name === 'string' ? category.name : category.name?.de || category.id;
                return (
                  <option key={category.id} value={category.id}>
                    📁 {categoryName}
                  </option>
                );
              })}
            </ResponsiveSelect>
          </ResponsiveFormGroup>

          <ResponsiveButton onClick={handleAddSubcategory}>
            <FaPlus />
            Neue Unterkategorie
          </ResponsiveButton>
        </div>
      </ResponsiveCard>

      {isLoading ? (
        <ResponsiveLoadingContainer>
          <div className="loading-spinner">Wird geladen...</div>
        </ResponsiveLoadingContainer>
      ) : (
        <ResponsiveCard>
          <MainCategoryHeader>
            <MainCategoryIcon>
              📁
            </MainCategoryIcon>
            <MainCategoryInfo>
              <MainCategoryName>
                {typeof currentMainCategory.name === 'string' 
                  ? currentMainCategory.name 
                  : currentMainCategory.name?.de || currentMainCategory.id}
              </MainCategoryName>
              <MainCategoryStats>
                {filteredSubcategories.length} Unterkategorien • {totalProducts} Produkte gesamt
              </MainCategoryStats>
            </MainCategoryInfo>
          </MainCategoryHeader>

          {filteredSubcategories.length === 0 ? (
            <ResponsiveEmptyState>
              <div className="empty-icon">
                <FaLayerGroup />
              </div>
              <div className="empty-title">Keine Unterkategorien gefunden</div>
              <div className="empty-description">
                Keine Unterkategorien in dieser Hauptkategorie gefunden. Klicken Sie auf "Neue Unterkategorie", um eine hinzuzufügen.
              </div>
            </ResponsiveEmptyState>
          ) : (
            <ResponsiveCardGrid>
              {filteredSubcategories.map((subcategory, index) => (
                <ResponsiveCard key={subcategory.id}>
                  <SubcategoryHeader>
                    <SubcategoryInfo>
                      <SubcategoryName>{subcategory.name.de}</SubcategoryName>
                      <SubcategoryId>ID: {subcategory.id}</SubcategoryId>
                    </SubcategoryInfo>
                  </SubcategoryHeader>

                  <SubcategoryStats>
                    <StatItem>
                      <StatValue>{subcategory.items?.length || 0}</StatValue>
                      <StatLabel>Produkte</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{subcategory.items?.filter(item => item.available !== false).length || 0}</StatValue>
                      <StatLabel>Verfügbar</StatLabel>
                    </StatItem>
                  </SubcategoryStats>

                  <SubcategoryActions>
                    <ActionButton onClick={() => handleEditSubcategory(subcategory)}>
                      <FaEdit />
                      Bearbeiten
                    </ActionButton>
                    {subcategory.items && subcategory.items.length > 0 && (
                      <ActionButton 
                        $variant="products"
                        onClick={() => toggleProductsList(subcategory.id)}
                        title="Produkte anzeigen/verbergen"
                      >
                        <FaBoxes />
                        {expandedProducts.has(subcategory.id) ? 'Verbergen' : 'Produkte'}
                      </ActionButton>
                    )}
                    <ActionButton 
                      $variant="danger"
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                      title={subcategory.items && subcategory.items.length > 0 ? 
                        `Diese Unterkategorie hat ${subcategory.items.length} Produkte` : 
                        'Unterkategorie löschen'}
                    >
                      <FaTrash />
                      Löschen
                    </ActionButton>
                  </SubcategoryActions>

                  {expandedProducts.has(subcategory.id) && subcategory.items && subcategory.items.length > 0 && (
                    <ProductsList>
                      <ProductsHeader>
                        <ProductsTitle>Produkte ({subcategory.items.length})</ProductsTitle>
                        <ProductsToggle onClick={() => toggleProductsList(subcategory.id)}>
                          Verbergen
                        </ProductsToggle>
                      </ProductsHeader>
                      
                      <SelectionControls>
                        <SelectionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            areAllProductsSelected(subcategory.id, subcategory.items || []) ? 
                              deselectAllProducts(subcategory.id) : 
                              selectAllProducts(subcategory.id, subcategory.items || []);
                          }}
                        >
                          {areAllProductsSelected(subcategory.id, subcategory.items || []) ? 
                            <><FaCheckSquare /> Alle abwählen</> : 
                            <><FaSquare /> Alle auswählen</>
                          }
                        </SelectionButton>
                        
                        <SelectionButton
                          $variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedProducts(subcategory.id);
                          }}
                          disabled={getSelectedCount(subcategory.id) === 0}
                        >
                          <FaTrashAlt />
                          Ausgewählte entfernen ({getSelectedCount(subcategory.id)})
                        </SelectionButton>
                        
                        <SelectionInfo>
                          {getSelectedCount(subcategory.id)} von {subcategory.items?.length || 0} ausgewählt
                        </SelectionInfo>
                      </SelectionControls>
                      
                      {(subcategory.items || []).map((product: any) => (
                        <ProductItem 
                          key={product.id}
                          $selected={isProductSelected(subcategory.id, product.id)}
                          onClick={() => toggleProductSelection(subcategory.id, product.id)}
                          title={isProductSelected(subcategory.id, product.id) ? 
                            "Klicken zum Abwählen" : "Klicken zum Auswählen"}
                        >
                          <ProductCheckbox>
                            {isProductSelected(subcategory.id, product.id) ? 
                              <FaCheckSquare /> : <FaSquare />
                            }
                          </ProductCheckbox>
                          
                          <ProductInfo>
                            <ProductName>{product.name?.de || product.name || 'Unbenanntes Produkt'}</ProductName>
                            <ProductDetails>
                              {product.price && `${product.price}€`} • ID: {product.id}
                              {product.available === false && ' • Nicht verfügbar'}
                            </ProductDetails>
                          </ProductInfo>
                          
                          <ProductRemoveButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProduct(
                                subcategory.id, 
                                product.id, 
                                product.name?.de || product.name || 'Unbenanntes Produkt'
                              );
                            }}
                            title={`Einzelnes Produkt entfernen: ${product.name?.de || product.name || 'Unbenanntes Produkt'}`}
                          >
                            <FaTimes />
                            Entfernen
                          </ProductRemoveButton>
                        </ProductItem>
                      ))}
                    </ProductsList>
                  )}
                </ResponsiveCard>
              ))}
            </ResponsiveCardGrid>
          )}
        </ResponsiveCard>
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
                {editingSubcategory ? 'Unterkategorie bearbeiten' : 'Neue Unterkategorie'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <FormLabel>Hauptkategorie zuordnen</FormLabel>
              <FormSelect
                value={formData.parentPage}
                onChange={(e) => setFormData(prev => ({ ...prev, parentPage: e.target.value }))}
              >
                {mainCategoriesData.map((category) => {
                  const categoryName = typeof category.name === 'string' ? category.name : category.name?.de || category.id;
                  return (
                    <option key={category.id} value={category.id}>
                      📁 {categoryName}
                    </option>
                  );
                })}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Name (Deutsch)</FormLabel>
              <FormInput
                type="text"
                placeholder="z.B. Neue Unterkategorie"
                value={formData.name_de}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name_de: e.target.value
                }))}
              />
            </FormGroup>

            {/* Show additional language fields only when editing and for active languages */}
            {editingSubcategory && activeLanguages
              .filter(lang => lang.code !== 'de') // Exclude German as it's already shown
              .map(language => (
                <FormGroup key={language.code}>
                  <FormLabel>Name ({language.name})</FormLabel>
                  <FormInput
                    type="text"
                    placeholder={`z.B. ${formData.name_de}`}
                    value={formData[`name_${language.code}` as keyof SubcategoryFormData] as string || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [`name_${language.code}`]: e.target.value
                    }))}
                  />
                </FormGroup>
              ))}

            {/* Auto-translate button when editing */}
            {editingSubcategory && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <ModalButton
                  $variant="secondary"
                  onClick={async () => {
                    if (!formData.name_de) return;

                    try {
                      // Auto-translate missing fields
                      for (const language of activeLanguages) {
                        if (language.code !== 'de') {
                          // Always translate (force re-translation)
                          try {
                            const { translateText } = await import('../../services/api');
                            const result = await translateText(formData.name_de, [language.code as any]);
                            if (result[language.code]) {
                              setFormData(prev => ({
                                ...prev,
                                [`name_${language.code}`]: result[language.code]
                              }));
                            }
                          } catch (error) {
                            console.error(`Translation failed for ${language.code}:`, error);
                          }
                        }
                      }
                      alert('Übersetzungen wurden generiert!');
                    } catch (error) {
                      console.error('Auto-translation failed:', error);
                      alert('Fehler beim Übersetzen');
                    }
                  }}
                >
                  🤖 Auto Übersetzen
                </ModalButton>
              </div>
            )}

            <ModalActions>
              <ModalButton
                $variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Abbrechen
              </ModalButton>
              <ModalButton onClick={handleSaveSubcategory}>
                <FaSave />
                Speichern
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </ResponsiveMainContent>
  );
};

export default SubcategoryManager;