import React, {useCallback, useMemo, useState} from 'react';
import {Card, Divider, Menu, Typography} from '@mui/material';
import {
  DataObject as ExportJsonIcon,
  DeleteOutline as DeleteOutlineIcon,
  FolderOpen as FolderOpenIcon,
  GitHub as GitHubIcon,
  ImageOutlined as ExportImageIcon,
  Info as InfoIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import {UiElement} from 'src/components/UiElement/UiElement';
import {IconButton} from 'src/components/IconButton/IconButton';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {exportAsJSON, modelFromModelStore} from 'src/utils';
import {useInitialDataManager} from 'src/hooks/useInitialDataManager';
import {useModelStore} from 'src/stores/modelStore';
import {useTranslation} from 'src/hooks/useTranslation';
import {MenuItem} from './MenuItem';

export const MainMenu = () => {
  const { t, language, changeLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const onSelectLanguage = useCallback((newLanguage: 'fr' | 'en') => {
    changeLanguage(newLanguage);
    uiStateActions.setIsMainMenuOpen(false);
  }, [changeLanguage, uiStateActions]);

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
          <MenuItem
              onClick={() => onSelectLanguage('fr')}
              Icon={
                <svg width="20" height="15" viewBox="0 0 3 2" style={{border: '1px solid #ccc'}}>
                  <rect width="1" height="2" fill="#002654"/>
                  <rect x="1" width="1" height="2" fill="#ffffff"/>
                  <rect x="2" width="1" height="2" fill="#ce1126"/>
                </svg>
              }
              selected={language === 'fr'}
          >
            Français
          </MenuItem>
          <MenuItem
              onClick={() => onSelectLanguage('en')}
              Icon={
                <svg width="20" height="12" viewBox="0 0 60 30" style={{border: '1px solid #ccc'}}>
                  <rect width="60" height="30" fill="#012169"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4"/>
                  <path d="M30,0 L30,30 M0,15 L60,15" stroke="#ffffff" strokeWidth="10"/>
                  <path d="M30,0 L30,30 M0,15 L60,15" stroke="#c8102e" strokeWidth="6"/>
                </svg>
              }
              selected={language === 'en'}
          >
            English
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
    </UiElement>
  );
};
