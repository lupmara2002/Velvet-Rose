import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  TextField,
  InputAdornment,
  Collapse,
  Slide,
} from '@mui/material';
import {
  ArrowLeft,
  ArrowRight,
  ExpandLess,
  ExpandMore,
  Search,
} from '@mui/icons-material';
import axios from 'axios';
import { toTitleCase } from '../utils/text';

const ProductFilter = forwardRef(function ProductFilter(props, ref) {
  const {
    baseUrl,           
    token,             
    onFilter,
    showFilters,
    setShowFilters,
    initialFilters = {},
    refreshPrice,      
    refreshCategory,   
  } = props;

  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedBrands, setSelectedBrands] = useState(
    initialFilters.brand ? initialFilters.brand.split(',') : []
  );
  const [priceRange, setPriceRange] = useState(
    initialFilters.minPrice && initialFilters.maxPrice
      ? [Number(initialFilters.minPrice), Number(initialFilters.maxPrice)]
      : [0, 10000]
  );
  const [priceBounds, setPriceBounds] = useState([0, 700]);

  const [showCategorySection, setShowCategorySection] = useState(true);
  const [showPriceSection, setShowPriceSection] = useState(true);
  const [showBrandSection, setShowBrandSection] = useState(true);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchBrand, setSearchBrand] = useState('');

  const triggerFilter = useCallback((cat, brandArray, priceArr) => {
    const filtersObj = {};
    if (cat) filtersObj.category = cat;
    if (brandArray.length > 0) filtersObj.brand = brandArray.join(',');
    filtersObj.minPrice = priceArr[0].toString();
    filtersObj.maxPrice = priceArr[1].toString();
    onFilter?.(filtersObj);
  }, [onFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${baseUrl}/productFields?field=category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.values || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [baseUrl, token, refreshCategory]);

  useEffect(() => {
    const fetchPriceBounds = async () => {
      if (!selectedCategory) return;
      try {
        let url = `${baseUrl}/productFields?field=price&category=${encodeURIComponent(selectedCategory)}`;
        if (selectedBrands.length > 0) {
          url += `&brand=${selectedBrands.join(',')}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.values) {
          const newMin = Number(res.data.values.minPrice);
          const newMax = Number(res.data.values.maxPrice);
          if (priceBounds[0] !== newMin || priceBounds[1] !== newMax) {
            setPriceBounds([newMin, newMax]);
            setPriceRange([newMin, newMax]);
            triggerFilter(selectedCategory, selectedBrands, [newMin, newMax]);
          }
        }
      } catch (error) {
        console.error('Error fetching price boundaries:', error);
      }
    };
    fetchPriceBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, token, selectedCategory, refreshPrice]);

  useEffect(() => {
    const debounceHandler = setTimeout(() => {
      if (!selectedCategory) {
        setBrands([]);
        return;
      }
      const url =
        `${baseUrl}/productFields?field=brand` +
        `&category=${encodeURIComponent(selectedCategory)}` +
        `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
      axios
        .get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setBrands(res.data.values || []))
        .catch((error) => console.error('Error fetching brands:', error));
    }, 500);
    return () => clearTimeout(debounceHandler);
  }, [priceRange, selectedCategory, baseUrl, token]);

  useEffect(() => {
    const handler = setTimeout(() => {
      triggerFilter(selectedCategory, selectedBrands, priceRange);
    }, 500);
    return () => clearTimeout(handler);
  }, [selectedCategory, selectedBrands, priceRange, triggerFilter]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedBrands([]);
    triggerFilter(cat, [], priceRange);
  };

  const handleBrandChange = (evt) => {
    const brand = evt.target.name;
    const checked = evt.target.checked;
    const updatedBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand);
    setSelectedBrands(updatedBrands);
    triggerFilter(selectedCategory, updatedBrands, priceRange);
  };

  const handleSliderChange = (evt, newValue) => {
    setPriceRange(newValue);
  };

  const filteredBrands = brands.filter((brandObj) =>
    toTitleCase(brandObj._id).toLowerCase().includes(searchBrand.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: showFilters ? '300px' : '200px',
        background: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          mb: 1,
          border: showFilters ? 'none' : '2px solid',
          borderColor: '#8C5E6B'
        }}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Typography 
          variant="subtitle1"
          sx={{ 
            fontWeight: 'bold',
            pl: 2,
            fontFamily: "'Poppins', sans-serif",
            color: '#2D2A2E',
          }}
        >
          {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
        </Typography>
        {showFilters ? <ArrowLeft /> : <ArrowRight />}
      </Box>

      <Slide in={showFilters} direction="right" mountOnEnter unmountOnExit timeout={1000}>
        <Box ref={ref} sx={{ p: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                mb: 1,
              }}
              onClick={() => setShowCategorySection((prev) => !prev)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: "'Poppins', sans-serif" }}>
                CATEGORY
              </Typography>
              {showCategorySection ? <ExpandLess /> : <ExpandMore />}
            </Box>
            <Collapse in={showCategorySection}>
              <Box
                sx={{
                  mt: 1,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: '3px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                }}
              >
                {categories.map((catObj, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      mb: 0.5,
                      p: 0.5,
                      border: selectedCategory === catObj._id ? '1px solid #8C5E6B' : 'none',
                      borderRadius: '4px',
                    }}
                    onClick={() => handleCategoryClick(catObj._id)}
                  >
                    <Typography variant="body2">{toTitleCase(catObj._id)}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#8C5E6B' }}
                    >
                      {catObj.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>

          {selectedCategory && (
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setShowPriceSection((prev) => !prev)}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: "'Poppins', sans-serif" }}>
                  PRICE
                </Typography>
                {showPriceSection ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={showPriceSection}>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{priceRange[0]} Lei</Typography>
                    <Typography variant="body2">{priceRange[1]} Lei</Typography>
                  </Box>
                  <Slider
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    sx={{
                      mt: 1,
                      color: '#8C5E6B',
                      '& .MuiSlider-thumb': { backgroundColor: '#8C5E6B' },
                      '& .MuiSlider-track': { backgroundColor: '#8C5E6B' },
                    }}
                  />
                </Box>
              </Collapse>
            </Box>
          )}

          {selectedCategory && (
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setShowBrandSection((prev) => !prev)}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: "'Poppins', sans-serif" }}>
                  BRAND
                </Typography>
                {showBrandSection ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={showBrandSection}>
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="search brand"
                    size="small"
                    onChange={(e) => setSearchBrand(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    maxHeight: '360px',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': {
                      borderRadius: '3px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <FormGroup>
                    {filteredBrands.map((brandObj, idx) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            name={brandObj._id}
                            checked={selectedBrands.includes(brandObj._id)}
                            onChange={handleBrandChange}
                            sx={{
                              color: '#C9929D',
                              '&.Mui-checked': { color: '#8C5E6B' },
                            }}
                          />
                        }
                        label={
                          <span>
                            {toTitleCase(brandObj._id)}{' '}
                            <span
                              style={{
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              color: '#8C5E6B',
                              marginLeft: '4px',
                              }}
                            >
                              ({brandObj.count})
                            </span>
                          </span>
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      </Slide>
    </Box>
  );
});

export default ProductFilter;
