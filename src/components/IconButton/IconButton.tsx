import React, {useMemo} from 'react';
import {Box, Button, useTheme} from '@mui/material';
import Tooltip, {TooltipProps} from '@mui/material/Tooltip';

interface Props {
  name: string;
  Icon: React.ReactNode;
  isActive?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  tooltipPosition?: TooltipProps['placement'];
  disabled?: boolean;
}

export const IconButton = ({
  name,
  Icon,
  onClick,
  isActive = false,
  disabled = false,
  tooltipPosition = 'bottom'
}: Props) => {
  const theme = useTheme();
  const iconColor = useMemo(() => {
    if (disabled) {
        return 'grey.400';
    }

      if (isActive) {
      return 'grey.800';
    }

      return 'grey.600';
  }, [disabled, isActive]);

  return (
    <Tooltip
      title={name}
      placement={tooltipPosition}
      enterDelay={1000}
      enterNextDelay={1000}
      arrow
      sx={{ bgcolor: 'primary.main' }}
    >
      <Button
        variant="text"
        onClick={onClick}
        sx={{
          borderRadius: 0,
          height: theme.customVars.toolMenu.height,
          width: theme.customVars.toolMenu.height,
          maxWidth: '100%',
          minWidth: 'auto',
          bgcolor: isActive ? 'primary.light' : undefined,
          p: 0,
          m: 0
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            svg: {
              color: iconColor
            }
          }}
        >
          {Icon}
        </Box>
      </Button>
    </Tooltip>
  );
};
