import React, { useEffect, useRef, useState } from 'react';
import { DownloadButton } from './DownloadButton';

const FONT_HEIGHT = 60;
const LINE_WIDTH = 5;

type Coords = { x: number; y: number };
type UserEvents = { lines: { points: Coords[]; lineWidth: number }[]; texts: { text: string; coords: Coords }[] };

const convertToCoords = (e: React.MouseEvent): Coords => {
    const xRate = e.clientX / innerWidth;
    const yRate = e.clientY / innerWidth;

    const x = xRate * 1000;
    const y = yRate * 1000;

    return { x, y };
};

const getFont = (fontSize: number) => 'bolder ' + fontSize + 'px Tangerine';

const initDrawingContext = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = 'black';
    ctx.font = getFont(FONT_HEIGHT);
    return ctx;
};

export const Drawing: React.FC = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);
    const userEvents = useRef<UserEvents>({ lines: [], texts: [] });
    const drawingContext = useRef<CanvasRenderingContext2D>(null!);
    const [isPlaceText, setIsPlaceText] = useState(false);
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState(FONT_HEIGHT);
    const [lineWidth, setLineWidth] = useState(LINE_WIDTH);

    useEffect(() => {
        if (!drawingContext.current) {
            drawingContext.current = initDrawingContext(ref.current!);
        }
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        const coords = convertToCoords(e);

        if (isPlaceText) {
            userEvents.current.texts.at(-1)!.coords = coords;
            redraw();
        } else {
            isDrawing.current = true;

            userEvents.current.lines.push({ points: [coords], lineWidth });
            drawingContext.current.beginPath();
            drawingContext.current.moveTo(coords.x, coords.y);
        }
    };

    const onMouseUp = () => {
        isDrawing.current = false;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDrawing.current) {
            const coords = convertToCoords(e);
            userEvents.current.lines.at(-1)!.points.push(coords);
            drawingContext.current.lineTo(coords.x, coords.y);
            drawingContext.current.stroke();
        }
    };

    const onPlaceText = () => {
        setIsPlaceText(!isPlaceText);
        if (!isPlaceText && !userEvents.current.texts[0]) {
            userEvents.current.texts[0] = { coords: { x: 0, y: 0 }, text };
            redraw();
        }
    };

    const redraw = () => {
        drawingContext.current.clearRect(0, 0, ref.current!.width, ref.current!.height);
        drawingContext.current.beginPath();
        userEvents.current.lines.forEach(({ points, lineWidth }) => {
            drawingContext.current.lineWidth = lineWidth;
            drawingContext.current.moveTo(points[0].x, points[0].y);
            points.slice(1).forEach(({ x, y }) => {
                drawingContext.current.lineTo(x, y);
            });
            drawingContext.current.stroke();
        });
        drawingContext.current.lineWidth = lineWidth;
        userEvents.current.texts.forEach(({ coords: { x, y }, text }) => {
            drawingContext.current.fillText(text, x, y + fontSize);
        });
    };

    const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextText = e.target.value;
        setText(nextText);
        userEvents.current.texts.at(-1)!.text = nextText;
        redraw();
    };

    const onChangeFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextFontSize = +e.target.value;
        setFontSize(nextFontSize);
        drawingContext.current.font = getFont(nextFontSize);
        redraw();
    };

    const onChangeLineWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextLineWidth = +e.target.value;
        setLineWidth(nextLineWidth);
        drawingContext.current.lineWidth = nextLineWidth;
    };

    const revert = () => {
        userEvents.current.lines = userEvents.current.lines.slice(0, -1);
        redraw();
    };

    return (
        <>
            <canvas
                width={1000}
                height={1000}
                ref={ref}
                onMouseMove={onMouseMove}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            />
            <div className="buttons">
                {isPlaceText && <input autoFocus onChange={onChangeText} value={text} />}
                {isPlaceText && <input type="number" onChange={onChangeFontSize} value={fontSize} />}
                {!isPlaceText && <input type="number" onChange={onChangeLineWidth} value={lineWidth} />}
                <button onClick={onPlaceText}>{isPlaceText ? 'Draw' : 'Add Text'}</button>
                <button onClick={revert}>Revert</button>
                <DownloadButton />
            </div>
        </>
    );
};
