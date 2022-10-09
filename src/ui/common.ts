import React from 'react';

export type TouchOrMouseEvent = React.TouchEvent | React.MouseEvent;

export type Coords = { x: number; y: number };

export const getEventCoords = (e: TouchOrMouseEvent): Coords => {
    const x = 'touches' in e ? (e.touches[0] as any).pageX : e.pageX;
    const y = 'touches' in e ? (e.touches[0] as any).pageY : e.pageY;

    return { x, y };
};

export const getNumber = (str: string, fallback: number): number => {
    if (!str) return fallback;
    const num = +str;
    if (isNaN(num)) return fallback;
    return num;
};
