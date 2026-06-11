import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      mt: 8,
      py: 3,
      borderTop: '1px solid #E8DDD9',
      backgroundColor: '#fff',
      textAlign: 'center',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
      <Link
        to="/return-policy"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.85rem',
          color: '#8C5E6B',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Return Policy
      </Link>
    </Box>
    <Typography
      sx={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.78rem',
        color: '#B8A4A8',
      }}
    >
      © {new Date().getFullYear()} Velvet Rose. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
