import { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Collapse } from '@mui/material';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { toTitleCase } from '../utils/text';

const OfferBanner = ({ baseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetch(`${baseUrl}/categoryOffers`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [baseUrl]);

  if (dismissed || offers.length === 0) return null;

  return (
    <Box
      sx={{
        mx: { xs: 2, sm: 4, md: 6 },
        mt: 3,
        mb: 1,
        borderRadius: '14px',
        border: '1px solid #E8DDD9',
        backgroundColor: '#FBF7F5',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          backgroundColor: '#8C5E6B',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: '0.92rem',
              color: '#fff',
              letterSpacing: '0.2px',
            }}
          >
            Active Offers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: '#fff', p: 0.5 }}>
            {expanded ? (
              <KeyboardArrowUpRoundedIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownRoundedIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: 'rgba(255,255,255,0.8)', p: 0.5, ml: 0.5 }}
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            aria-label="Close offers"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Offer chips */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {offers.map((offer) => (
            <Chip
              key={offer._id}
              icon={<LocalOfferRoundedIcon sx={{ fontSize: '16px !important', color: '#8C5E6B !important' }} />}
              label={
                <Typography
                  component="span"
                  sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: '#2D2A2E' }}
                >
                  <strong>{toTitleCase(offer.category)}</strong>
                  {' — buy '}
                  <strong>{offer.buyQty}</strong>
                  {', get '}
                  <strong>{offer.freeQty} free</strong>
                </Typography>
              }
              sx={{
                backgroundColor: '#fff',
                border: '1px solid #E8DDD9',
                borderRadius: '8px',
                height: 'auto',
                py: 0.75,
                px: 0.5,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default OfferBanner;
