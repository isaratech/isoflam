import React, {useEffect, useState} from 'react';
import {Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {useTranslation} from 'src/hooks/useTranslation';
import {isMobileDevice} from 'src/utils/mobileDetection';

interface MobileWarningProps {
    /**
     * Whether to show the warning automatically on mobile devices
     * @default true
     */
    autoShow?: boolean;
}

export const MobileWarning: React.FC<MobileWarningProps> = ({
                                                                autoShow = true
                                                            }) => {
    const {t} = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

    useEffect(() => {
        // Check if we should show the warning
        if (autoShow && !hasBeenDismissed && isMobileDevice()) {
            // Small delay to ensure the app is fully loaded
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [autoShow, hasBeenDismissed]);

    const handleContinue = () => {
        setIsOpen(false);
        setHasBeenDismissed(true);
        // Store in sessionStorage so it doesn't show again during this session
        sessionStorage.setItem('mobileWarningDismissed', 'true');
    };

    // Check sessionStorage on mount to see if warning was already dismissed
    useEffect(() => {
        const dismissed = sessionStorage.getItem('mobileWarningDismissed');
        if (dismissed === 'true') {
            setHasBeenDismissed(true);
        }
    }, []);

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleContinue}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    margin: 2,
                    maxHeight: 'calc(100vh - 32px)'
                }
            }}
        >
            <DialogTitle>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography variant="h6" component="span">
                        {t('Mobile Device Detected')}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Alert severity="warning" sx={{mb: 2}}>
                    <Typography variant="body1">
                        {t('This application currently works only on PC. For the best experience, please use a desktop or laptop computer.')}
                    </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary">
                    {t('You can continue to use the application, but some features may not work properly on mobile devices.')}
                </Typography>
            </DialogContent>

            <DialogActions sx={{px: 3, pb: 2}}>
                <Button
                    onClick={handleContinue}
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    {t('Continue Anyway')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};