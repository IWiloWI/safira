/**
 * Pagination controls component
 * Provides page navigation and items per page selection
 */

import React, { memo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
  padding: 20px 0;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageButton = styled(motion.button)<{ active?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => 
    props.active 
      ? 'linear-gradient(135deg, #FF41FB, #ff21f5)' 
      : props.disabled 
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 65, 251, 0.1)'
  };
  border: 2px solid ${props => 
    props.active 
      ? '#FF41FB' 
      : props.disabled 
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 65, 251, 0.3)'
  };
  border-radius: 8px;
  color: ${props => 
    props.disabled 
      ? 'rgba(255, 255, 255, 0.3)' 
      : 'white'
  };
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${props => 
      props.active 
        ? 'linear-gradient(135deg, #FF41FB, #ff21f5)' 
        : 'rgba(255, 65, 251, 0.2)'
    };
    border-color: #FF41FB;
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const NavButton = styled(PageButton)`
  width: auto;
  padding: 0 12px;
  gap: 8px;
`;

const EllipsisIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: rgba(255, 255, 255, 0.4);
`;

const PageInfo = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
`;

const ItemsPerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const ItemsPerPageSelect = styled.select`
  padding: 8px 12px;
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 8px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #FF41FB;
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const ProductPagination: React.FC<ProductPaginationProps> = memo(({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show pages 1-5 + ellipsis + last page
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first + ellipsis + current-1, current, current+1 + ellipsis + last
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    onItemsPerPageChange(newItemsPerPage);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationContainer>
      <ItemsPerPageContainer>
        <span>Items per page:</span>
        <ItemsPerPageSelect
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
        >
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </ItemsPerPageSelect>
      </ItemsPerPageContainer>

      <PaginationControls>
        <NavButton
          onClick={handlePrevious}
          disabled={currentPage === 1}
          whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
        >
          <FaChevronLeft />
          Previous
        </NavButton>

        {pageNumbers.map((page, index) => (
          page === 'ellipsis' ? (
            <EllipsisIndicator key={`ellipsis-${index}`}>
              <FaEllipsisH />
            </EllipsisIndicator>
          ) : (
            <PageButton
              key={page}
              active={page === currentPage}
              onClick={() => handlePageClick(page)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {page}
            </PageButton>
          )
        ))}

        <NavButton
          onClick={handleNext}
          disabled={currentPage === totalPages}
          whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
        >
          Next
          <FaChevronRight />
        </NavButton>
      </PaginationControls>

      <PageInfo>
        Showing {startItem}-{endItem} of {totalItems} items
      </PageInfo>
    </PaginationContainer>
  );
});

ProductPagination.displayName = 'ProductPagination';

export default ProductPagination;