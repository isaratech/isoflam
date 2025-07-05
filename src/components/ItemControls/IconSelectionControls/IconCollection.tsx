import React, { useState, useEffect } from 'react';
import { Divider, Stack, Typography, Button, Box } from '@mui/material';
import {
  ExpandMore as ChevronDownIcon,
  ExpandLess as ChevronUpIcon
} from '@mui/icons-material';
import { Icon as IconI, IconSubcategoryState } from 'src/types';
import { Section } from 'src/components/ItemControls/components/Section';
import { IconGrid } from './IconGrid';
import { useTranslation } from 'src/hooks/useTranslation';

interface Props {
  id?: string;
  icons: IconI[];
  onClick?: (icon: IconI) => void;
  onMouseDown?: (icon: IconI) => void;
  isExpanded: boolean;
  subcategories?: (IconSubcategoryState & { icons: IconI[] })[];
}

export const IconCollection = ({
  id,
  icons,
  onClick,
  onMouseDown,
  isExpanded: _isExpanded,
  subcategories
}: Props) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(_isExpanded);
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Record<string, boolean>
  >({});

  // Initialize expanded state for subcategories
  useEffect(() => {
    if (subcategories) {
      const initialState: Record<string, boolean> = {};
      subcategories.forEach((subcategory) => {
        initialState[subcategory.id] = subcategory.isExpanded;
      });
      setExpandedSubcategories(initialState);
    }
  }, [subcategories]);

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Get icons without subcategory
  const iconsWithoutSubcategory = icons.filter((icon) => !icon.subcategory);

  return (
    <Section sx={{ py: 0 }}>
      <Button
        variant="text"
        fullWidth
        onClick={() => {
          return setIsExpanded(!isExpanded);
        }}
      >
        <Stack
          sx={{ width: '100%' }}
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="body2"
            color="text.secondary"
            textTransform="uppercase"
            fontWeight={600}
          >
            {id}
          </Typography>
          {isExpanded ? (
            <ChevronUpIcon color="action" />
          ) : (
            <ChevronDownIcon color="action" />
          )}
        </Stack>
      </Button>
      <Divider />

      {isExpanded && (
        <>
          {/* Display icons without subcategory */}
          {iconsWithoutSubcategory.length > 0 && (
            <IconGrid 
              icons={iconsWithoutSubcategory} 
              onMouseDown={onMouseDown} 
              onClick={onClick} 
            />
          )}

          {/* Display subcategories */}
          {subcategories && subcategories.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {subcategories.map((subcategory) => (
                <Box key={subcategory.id} sx={{ mb: 1 }}>
                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => toggleSubcategory(subcategory.id)}
                    sx={{ py: 1, pl: 2 }}
                  >
                    <Stack
                      sx={{ width: '100%' }}
                      direction="row"
                      spacing={2}
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        color="text.primary"
                        textTransform="capitalize"
                      >
                        {t(subcategory.id as any)}
                      </Typography>
                      {expandedSubcategories[subcategory.id] ? (
                        <ChevronUpIcon color="action" fontSize="small" />
                      ) : (
                        <ChevronDownIcon color="action" fontSize="small" />
                      )}
                    </Stack>
                  </Button>
                  {expandedSubcategories[subcategory.id] && (
                    <Box sx={{ pl: 2 }}>
                      <IconGrid 
                        icons={subcategory.icons} 
                        onMouseDown={onMouseDown} 
                        onClick={onClick} 
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Section>
  );
};
