import React from 'react';
import {Stack} from '@mui/material';
import {Redo, Undo} from '@mui/icons-material';
import {useUndoRedo} from 'src/hooks/useUndoRedo';
import {useTranslation} from 'src/hooks/useTranslation';
import {IconButton} from 'src/components/IconButton/IconButton';
import {UiElement} from 'src/components/UiElement/UiElement';

export const UndoRedoControls = () => {
    const {undo, redo, canUndo, canRedo} = useUndoRedo();
    const {t} = useTranslation();

    return (
        <UiElement>
            <Stack direction="row">
                <IconButton
                    name={`${t('Undo')} (Ctrl+Z)`}
                    Icon={<Undo/>}
                    onClick={undo}
                    disabled={!canUndo}
                />
                <IconButton
                    name={`${t('Redo')} (Ctrl+Y)`}
                    Icon={<Redo/>}
                    onClick={redo}
                    disabled={!canRedo}
                />
            </Stack>
        </UiElement>
    );
};