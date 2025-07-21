import React from 'react';
import {Edit as EditIcon, Lock as ReadOnlyIcon} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {UiElement} from 'src/components/UiElement/UiElement';
import {IconButton} from 'src/components/IconButton/IconButton';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useTranslation} from 'src/hooks/useTranslation';
import {EditorModeEnum} from 'src/types';

export const ReadOnlyToggle = () => {
    const {t} = useTranslation();
    const uiStateStoreActions = useUiStateStore((state) => {
        return state.actions;
    });
    const editorMode = useUiStateStore((state) => {
        return state.editorMode;
    });

    const isReadOnly = editorMode === EditorModeEnum.EXPLORABLE_READONLY;

    const handleToggle = () => {
        const newMode = isReadOnly
            ? EditorModeEnum.EDITABLE
            : EditorModeEnum.EXPLORABLE_READONLY;
        uiStateStoreActions.setEditorMode(newMode);
    };

    return (
        <Stack direction="row" spacing={1}>
            <UiElement>
                <IconButton
                    name={isReadOnly ? t('Disable read-only mode') : t('Enable read-only mode')}
                    Icon={isReadOnly ? <ReadOnlyIcon/> : <EditIcon/>}
                    onClick={handleToggle}
                    isActive={isReadOnly}
                />
            </UiElement>
        </Stack>
    );
};