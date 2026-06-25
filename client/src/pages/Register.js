import { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import axios from 'axios';

const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    '& fieldset': { borderColor: '#E8DDD9' },
    '&:hover fieldset': { borderColor: '#C9929D' },
    '&.Mui-focused fieldset': { borderColor: '#8C5E6B' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#8C5E6B' },
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';

  const passwordChecks = useMemo(
    () => passwordRules.map((r) => ({ ...r, passed: r.test(formData.password) })),
    [formData.password]
  );
  const passwordValid = passwordChecks.every((c) => c.passed);
  const passwordHelperVisible = passwordFocused || (formData.password.length > 0 && !passwordValid);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passwordValid) {
      setError('Password does not meet all the security requirements.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${baseUrl}/register`, formData);
      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            padding: 5,
            marginTop: 10,
            borderRadius: '16px',
            border: '1px solid #E8DDD9',
            backgroundColor: '#fff',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              backgroundColor: '#F1F8F2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 56, color: '#3F8B5C' }} />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              color: '#2D2A2E',
              mb: 1.5,
            }}
          >
            Account created
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: '#5A4A52',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Welcome, <strong>{formData.username}</strong>. You can now sign in with{' '}
            <strong>{formData.email}</strong> and the password you just chose.
          </Typography>
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#8C5E6B',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: '10px',
              py: 1.3,
              '&:hover': { backgroundColor: '#6B4450' },
            }}
          >
            Go to sign in
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          padding: 5,
          marginTop: 10,
          borderRadius: '16px',
          border: '1px solid #E8DDD9',
          backgroundColor: '#fff',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: '#2D2A2E',
            mb: 3,
          }}
        >
          Create Account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
            sx={inputSx}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
            sx={inputSx}
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
            sx={inputSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {passwordHelperVisible && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: '#FBF7F5',
                border: '1px solid #F0E5E1',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  color: '#7A6B70',
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Password requirements
              </Typography>
              <Stack spacing={0.5}>
                {passwordChecks.map((c) => (
                  <Box
                    key={c.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    {c.passed ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#3F8B5C' }} />
                    ) : (
                      <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16, color: '#B8A4A8' }} />
                    )}
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.82rem',
                        color: c.passed ? '#3F8B5C' : '#5A4A52',
                      }}
                    >
                      {c.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !passwordValid || !formData.username || !formData.email}
            sx={{
              marginTop: 3,
              backgroundColor: '#8C5E6B',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: '10px',
              py: 1.3,
              '&:hover': { backgroundColor: '#6B4450' },
              '&.Mui-disabled': {
                backgroundColor: '#E0CFD4',
                color: '#fff',
              },
            }}
          >
            {submitting ? 'Creating account…' : 'Register'}
          </Button>

          <Typography
            sx={{
              mt: 2.5,
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem',
              color: '#5A4A52',
            }}
          >
            Already have an account?{' '}
            <RouterLink
              to="/login"
              style={{ color: '#8C5E6B', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign in
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
