import React from 'react';
import {ToggleButton, ToggleButtonGroup} from '@mui/material';
import {TextFields as TextFieldsIcon} from '@mui/icons-material';

interface Props {
    value: number;
    onChange: (fontSize: number) => void;
}

const FONT_SIZE_LEVELS = [
    {value: 0.3, size: 12},
    {value: 0.6, size: 16},
    {value: 0.9, size: 20},
    {value: 1.2, size: 24},
    {value: 1.5, size: 28}
];

export const FontSizeSelector = ({value, onChange}: Props) => {
    // Find the closest font size level to the current value
    const currentLevel = FONT_SIZE_LEVELS.reduce((prev, curr) =>
        Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
    );

    return (
        <ToggleButtonGroup
            value={currentLevel.value}
            exclusive
            onChange={(e, newValue) => {
                if (newValue !== null) {
                    onChange(newValue);
                }
            }}
        >
            {FONT_SIZE_LEVELS.map((level) => (
                <ToggleButton
                    key={level.value}
                    value={level.value}
                    sx={{
                        minWidth: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TextFieldsIcon
                        sx={{
                            width: level.size,
                            height: level.size,
                            fontSize: level.size,
                            transition: 'all 0.2s ease'
                        }}
                    />
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};