import { createContext, useContext, useState, useEffect } from 'react';

const OffersContext = createContext([]);

export const OffersProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';

  useEffect(() => {
    fetch(`${baseUrl}/categoryOffers`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [baseUrl]);

  return <OffersContext.Provider value={offers}>{children}</OffersContext.Provider>;
};

// Returns the active offer for a given category string, or null
export const useOfferForCategory = (category) => {
  const offers = useContext(OffersContext);
  return offers.find((o) => o.active && o.category === category) ?? null;
};

export default OffersContext;
