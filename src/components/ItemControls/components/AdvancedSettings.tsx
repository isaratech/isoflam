import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  children: React.ReactNode;
}

export const AdvancedSettings = ({ children }: Props) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const handleChange = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Accordion
        expanded={expanded}
        onChange={handleChange}
        sx={{
          boxShadow: 'none',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="advanced-settings-content"
          id="advanced-settings-header"
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            minHeight: 48,
            '& .MuiAccordionSummary-content': {
              margin: '12px 0'
            }
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            textTransform="uppercase"
          >
            {t('Settings')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
      </Accordion>
    </Box>
  );
};