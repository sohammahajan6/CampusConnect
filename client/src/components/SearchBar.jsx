import React from 'react';
import { FaSearch, FaFilter, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({ searchQuery, handleSearch, toggleFilters, showFilters, filterRef, selectedFilters, handleFilterSelect, resetFilters }) => {
  return (
    <div className="search-filter-wrapper">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search for events, workshops, seminars..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div ref={filterRef} style={{ position: 'relative' }}>
        <button className="filter-btn" onClick={toggleFilters}>
          <FaFilter className="filter-icon" />
          <span>Filter</span>
        </button>

        {showFilters && (
          <div className="filter-dropdown show">
            <div className="filter-group">
              <div className="filter-group-title">
                <FaGraduationCap className="filter-group-icon" />
                Categories
              </div>
              <div className="filter-options">
                <div
                  className={`filter-option ${selectedFilters.categories.includes('technical') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('categories', 'technical')}
                >
                  Technical
                </div>
                <div
                  className={`filter-option ${selectedFilters.categories.includes('cultural') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('categories', 'cultural')}
                >
                  Cultural
                </div>
                <div
                  className={`filter-option ${selectedFilters.categories.includes('sports') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('categories', 'sports')}
                >
                  Sports
                </div>
                <div
                  className={`filter-option ${selectedFilters.categories.includes('workshop') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('categories', 'workshop')}
                >
                  Workshop
                </div>
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group-title">
                <FaBuilding className="filter-group-icon" />
                Departments
              </div>
              <div className="filter-options">
                <div
                  className={`filter-option ${selectedFilters.departments.includes('computer') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('departments', 'computer')}
                >
                  Computer
                </div>
                <div
                  className={`filter-option ${selectedFilters.departments.includes('it') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('departments', 'it')}
                >
                  IT
                </div>
                <div
                  className={`filter-option ${selectedFilters.departments.includes('mechanical') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('departments', 'mechanical')}
                >
                  Mechanical
                </div>
                <div
                  className={`filter-option ${selectedFilters.departments.includes('etc') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('departments', 'etc')}
                >
                  E&TC
                </div>
                <div
                  className={`filter-option ${selectedFilters.departments.includes('civil') ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect('departments', 'civil')}
                >
                  Civil
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button className="filter-action-btn filter-reset" onClick={resetFilters}>
                Reset
              </button>
              <button className="filter-action-btn filter-apply" onClick={toggleFilters}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
