import React, { useState, useCallback, useMemo } from 'react';
import {
  Menu,
  Typography,
  Divider,
  Card,
  MenuItem as MuiMenuItem,
  Menu as MuiMenu
} from '@mui/material';
import {
  Menu as MenuIcon,
  GitHub as GitHubIcon,
  DataObject as ExportJsonIcon,
  ImageOutlined as ExportImageIcon,
  FolderOpen as FolderOpenIcon,
  DeleteOutline as DeleteOutlineIcon,
  Info as InfoIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { UiElement } from 'src/components/UiElement/UiElement';
import { IconButton } from 'src/components/IconButton/IconButton';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { exportAsJSON, modelFromModelStore } from 'src/utils';
import { useInitialDataManager } from 'src/hooks/useInitialDataManager';
import { useModelStore } from 'src/stores/modelStore';
import { useTranslation } from 'src/hooks/useTranslation';
import { MenuItem } from './MenuItem';

export const MainMenu = () => {
  const { t, language, changeLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = useState<null | HTMLElement>(null);
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });
  const isMainMenuOpen = useUiStateStore((state) => {
    return state.isMainMenuOpen;
  });
  const mainMenuOptions = useUiStateStore((state) => {
    return state.mainMenuOptions;
  });
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const initialDataManager = useInitialDataManager();

  const onToggleMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      uiStateActions.setIsMainMenuOpen(true);
    },
    [uiStateActions]
  );

  const gotoUrl = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const { load } = initialDataManager;

  const onOpenModel = useCallback(async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (!file) {
        throw new Error('No file selected');
      }

      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        const modelData = JSON.parse(e.target?.result as string);
        load(modelData);
      };
      fileReader.readAsText(file);

      uiStateActions.resetUiState();
    };

    await fileInput.click();
    uiStateActions.setIsMainMenuOpen(false);
  }, [uiStateActions, load]);

  const onExportAsJSON = useCallback(async () => {
    exportAsJSON(model);
    uiStateActions.setIsMainMenuOpen(false);
  }, [model, uiStateActions]);

  const onExportAsImage = useCallback(() => {
    uiStateActions.setIsMainMenuOpen(false);
    uiStateActions.setDialog('EXPORT_IMAGE');
  }, [uiStateActions]);

  const onShowCredits = useCallback(() => {
    uiStateActions.setIsMainMenuOpen(false);
    uiStateActions.setDialog('CREDITS');
  }, [uiStateActions]);

  const { clear } = initialDataManager;

  const onClearCanvas = useCallback(() => {
    clear();
    uiStateActions.setIsMainMenuOpen(false);
  }, [uiStateActions, clear]);
  
  const onOpenLanguageMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchorEl(event.currentTarget);
  }, []);

  const onCloseLanguageMenu = useCallback(() => {
    setLanguageMenuAnchorEl(null);
  }, []);

  const onSelectLanguage = useCallback((newLanguage: 'fr' | 'en') => {
    changeLanguage(newLanguage);
    onCloseLanguageMenu();
  }, [changeLanguage, onCloseLanguageMenu]);

  const sectionVisibility = useMemo(() => {
    return {
      actions: Boolean(
        mainMenuOptions.find((opt) => {
          return opt.includes('ACTION') || opt.includes('EXPORT');
        })
      ),
      links: Boolean(
        mainMenuOptions.find((opt) => {
          return opt.includes('LINK');
        })
      ),
      version: Boolean(mainMenuOptions.includes('VERSION'))
    };
  }, [mainMenuOptions]);

  if (mainMenuOptions.length === 0) {
    return null;
  }

  return (
    <UiElement>
      <IconButton
        Icon={<MenuIcon />}
        name={t('Main menu')}
        onClick={onToggleMenu}
      />

      <Menu
        anchorEl={anchorEl}
        open={isMainMenuOpen}
        onClose={() => {
          uiStateActions.setIsMainMenuOpen(false);
        }}
        elevation={0}
        sx={{
          mt: 2
        }}
        MenuListProps={{
          sx: {
            minWidth: '250px',
            py: 0
          }
        }}
      >
        <Card sx={{ py: 1 }}>
          {mainMenuOptions.includes('ACTION.OPEN') && (
            <MenuItem onClick={onOpenModel} Icon={<FolderOpenIcon />}>
              {t('Open')}
            </MenuItem>
          )}

          {mainMenuOptions.includes('EXPORT.JSON') && (
            <MenuItem onClick={onExportAsJSON} Icon={<ExportJsonIcon />}>
              {t('Export as JSON')}
            </MenuItem>
          )}

          {mainMenuOptions.includes('EXPORT.PNG') && (
            <MenuItem onClick={onExportAsImage} Icon={<ExportImageIcon />}>
              {t('Export as image')}
            </MenuItem>
          )}

          {mainMenuOptions.includes('ACTION.CLEAR_CANVAS') && (
            <MenuItem onClick={onClearCanvas} Icon={<DeleteOutlineIcon />}>
              {t('Clear the canvas')}
            </MenuItem>
          )}

          {sectionVisibility.links && (
            <>
              <Divider />

              {mainMenuOptions.includes('LINK.GITHUB') && (
                <MenuItem
                  onClick={() => {
                    return gotoUrl(`${REPOSITORY_URL}`);
                  }}
                  Icon={<GitHubIcon />}
                >
                  {t('GitHub')}
                </MenuItem>
              )}

              {mainMenuOptions.includes('LINK.CREDITS') && (
                <MenuItem onClick={onShowCredits} Icon={<InfoIcon />}>
                  {t('Credits')}
                </MenuItem>
              )}
            </>
          )}

          {/* Language Selection */}
          <Divider />
          <MenuItem onClick={onOpenLanguageMenu} Icon={<LanguageIcon />}>
            {t('Language')}
          </MenuItem>

          {sectionVisibility.version && (
            <>
              <Divider />

              {mainMenuOptions.includes('VERSION') && (
                <MenuItem>
                  <Typography variant="body2" color="text.secondary">
                    Isoflam v{PACKAGE_VERSION}
                  </Typography>
                </MenuItem>
              )}
            </>
          )}
        </Card>
      </Menu>

      {/* Language Selection Menu */}
      <MuiMenu
        anchorEl={languageMenuAnchorEl}
        open={Boolean(languageMenuAnchorEl)}
        onClose={onCloseLanguageMenu}
        elevation={0}
        sx={{ mt: 2 }}
      >
        <Card sx={{ py: 1 }}>
          <MuiMenuItem 
            onClick={() => onSelectLanguage('fr')}
            selected={language === 'fr'}
          >
            {t('French')}
          </MuiMenuItem>
          <MuiMenuItem 
            onClick={() => onSelectLanguage('en')}
            selected={language === 'en'}
          >
            {t('English')}
          </MuiMenuItem>
        </Card>
      </MuiMenu>
    </UiElement>
  );
};
