import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Country, State, City } from 'country-state-city';

const ShippingAddressForm = ({ shippingAddress, setShippingAddress }) => {
  const [countries, setCountries] = useState([]); 
  const [states, setStates] = useState([]);        
  const [cities, setCities] = useState([]);         

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const sortedCountries = allCountries.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setCountries(sortedCountries);
  }, []);

  useEffect(() => {
    if (!shippingAddress.country) {
      setStates([]);
      return;
    }
    const stateList = State.getStatesOfCountry(shippingAddress.country); 
    setStates(stateList.sort((a, b) => a.name.localeCompare(b.name)));
  }, [shippingAddress.country]);

  useEffect(() => {
    if (!shippingAddress.country || !shippingAddress.state) {
      setCities([]);
      return;
    }
    const citiesList = City.getCitiesOfState(shippingAddress.country, shippingAddress.state); 
    setCities(citiesList.sort((a, b) => a.name.localeCompare(b.name)));
  }, [shippingAddress.country, shippingAddress.state]);

  const handleShippingChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      country: e.target.value,  
      state: '',
      city: ''
    });
  };

  const handleStateChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      state: e.target.value, 
      city: ''
    });
  };

  const handleCityChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      city: e.target.value
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Full Name"
        name="fullName"
        value={shippingAddress.fullName || ''}
        onChange={handleShippingChange}
        fullWidth
        required
      />
      <TextField
        label="Street"
        name="addressLine1"
        value={shippingAddress.addressLine1 || ''}
        onChange={handleShippingChange}
        fullWidth
        required
      />
      <FormControl fullWidth required>
        <InputLabel>Country</InputLabel>
        <Select
          value={shippingAddress.country || ''}
          label="Country"
          onChange={handleCountryChange}
        >
          {countries.map((country) => (
            <MenuItem key={country.isoCode} value={country.isoCode}>
              {country.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        required
        disabled={!shippingAddress.country || states.length === 0}
      >
        <InputLabel>State</InputLabel>
        <Select
          value={shippingAddress.state || ''}
          label="State"
          onChange={handleStateChange}
        >
          {states.map((state) => (
            <MenuItem key={state.isoCode} value={state.isoCode}>
              {state.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        required
        disabled={!shippingAddress.state || cities.length === 0}
      >
        <InputLabel>City</InputLabel>
        <Select
          value={shippingAddress.city || ''}
          label="City"
          onChange={handleCityChange}
        >
          {cities.map((city, index) => (
            <MenuItem key={index} value={city.name}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="ZIP"
        name="zip"
        value={shippingAddress.zip || ''}
        onChange={handleShippingChange}
        fullWidth
        required
      />
    </Box>
  );
};

export default ShippingAddressForm;
