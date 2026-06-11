import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const rules = [
  {
    title: '1. Return window',
    body: 'You may return most items within 30 days of delivery. To be eligible, the product must be unused, unopened, and in its original packaging.',
  },
  {
    title: '2. Non-returnable items',
    body: 'For hygiene reasons, the following cannot be returned: opened skincare, makeup, or fragrance products; items marked as final sale; and gift cards.',
  },
  {
    title: '3. Damaged or incorrect orders',
    body: 'If you received a damaged, defective, or wrong item, contact us within 7 days of delivery at maracosmetics12@gmail.com. We will arrange a free return and ship the correct item at no extra cost.',
  },
  {
    title: '4. How to initiate a return',
    body: 'Email maracosmetics12@gmail.com with your order number, the item(s) you wish to return, and a brief reason. Our team will respond within 2 business days with return instructions.',
  },
  {
    title: '5. Refund processing',
    body: 'Once we receive and inspect the returned item, we will issue a refund to your original payment method within 5–7 business days. You will receive a confirmation email when the refund is processed.',
  },
  {
    title: '6. Shipping costs',
    body: 'Return shipping costs are the customer\'s responsibility unless the return is due to our error (wrong or defective item). We recommend using a tracked shipping service, as we cannot be responsible for lost returns.',
  },
  {
    title: '7. Exchanges',
    body: 'We do not offer direct exchanges. If you need a different product, please return the original item (subject to the above conditions) and place a new order.',
  },
];

const ReturnPolicy = () => (
  <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        borderRadius: '16px',
        border: '1px solid #E8DDD9',
        backgroundColor: '#fff',
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          color: '#2D2A2E',
          mb: 1,
        }}
      >
        Return Policy
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Inter', sans-serif",
          color: '#6B6369',
          fontSize: '0.9rem',
          mb: 3,
        }}
      >
        Last updated: June 2025
      </Typography>

      <Divider sx={{ borderColor: '#E8DDD9', mb: 4 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        {rules.map((rule) => (
          <Box key={rule.title}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: '#2D2A2E',
                mb: 0.75,
              }}
            >
              {rule.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: '#5A4A52',
                fontSize: '0.92rem',
                lineHeight: 1.75,
              }}
            >
              {rule.body}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#E8DDD9', mt: 5, mb: 3 }} />

      <Typography
        sx={{
          fontFamily: "'Inter', sans-serif",
          color: '#6B6369',
          fontSize: '0.85rem',
          lineHeight: 1.7,
        }}
      >
        For any questions not covered here, please reach out to us at{' '}
        <a
          href="mailto:maracosmetics12@gmail.com"
          style={{ color: '#8C5E6B', textDecoration: 'none', fontWeight: 500 }}
        >
          maracosmetics12@gmail.com
        </a>
        . We are happy to help.
      </Typography>
    </Paper>
  </Container>
);

export default ReturnPolicy;
