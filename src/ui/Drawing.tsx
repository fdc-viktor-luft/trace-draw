import React, { useEffect, useRef, useState } from 'react';
import { DownloadButton } from './DownloadButton';
import { Coords, getEventCoords, getNumber, TouchOrMouseEvent } from './common';
import TextFieldsIcon from '../assets/images/text_fields.svg';
import { Store, useSub } from '../store';

const FONT_HEIGHT = 60;
const LINE_WIDTH = 5;

type UserEvents = {
    lines: { points: Coords[]; lineWidth: number; isRounded: boolean }[];
    texts: { text: string; coords: Coords }[];
};

const convertToCoords = (e: TouchOrMouseEvent): Coords => {
    const { x: xEvent, y: yEvent } = getEventCoords(e);
    const { widthAndHeight } = Store.get();

    const xRate = xEvent / innerWidth;
    const yRate = yEvent / innerWidth;

    const x = xRate * widthAndHeight;
    const y = yRate * widthAndHeight;

    return { x, y };
};

const getFont = (fontSize: number) => 'bolder ' + fontSize + 'px Tangerine';

const initDrawingContext = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.font = getFont(FONT_HEIGHT);
    return ctx;
};

const getFontSize = (str: string): number => getNumber(str, FONT_HEIGHT);
const getLineWidth = (str: string): number => getNumber(str, LINE_WIDTH);

export const Drawing: React.FC<{ imageData: string }> = ({ imageData }) => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);
    const userEvents = useRef<UserEvents>({ lines: [], texts: [] });
    const drawingContext = useRef<CanvasRenderingContext2D>(null!);
    const [isWhiteBackgroundJpeg, setIsWhiteBackgroundJpeg] = useState(false);
    const [isRounded, setIsRounded] = useState(true);
    const [isPlaceText, setIsPlaceText] = useState(false);
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState(String(FONT_HEIGHT));
    const [lineWidth, setLineWidth] = useState(String(LINE_WIDTH));
    const { widthAndHeight } = useSub((s) => s);

    useEffect(() => {
        if (!drawingContext.current) {
            drawingContext.current = initDrawingContext(ref.current!);
        }
    }, []);

    const onMouseDown = (e: TouchOrMouseEvent) => {
        const coords = convertToCoords(e);

        if (isPlaceText) {
            userEvents.current.texts.at(-1)!.coords = coords;
            redraw();
        } else {
            isDrawing.current = true;

            userEvents.current.lines.push({ points: [coords], lineWidth: getLineWidth(lineWidth), isRounded });
            drawingContext.current.beginPath();
            drawingContext.current.moveTo(coords.x, coords.y);
        }
    };

    const onMouseUp = () => {
        isDrawing.current = false;
    };

    const onMouseMove = (e: TouchOrMouseEvent) => {
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

    const redraw = (isWhiteBackgroundJpegChecked = isWhiteBackgroundJpeg) => {
        drawingContext.current.clearRect(0, 0, ref.current!.width, ref.current!.height);
        if (isWhiteBackgroundJpegChecked) {
            drawingContext.current.fillStyle = 'white';
            drawingContext.current.fillRect(0, 0, ref.current!.width, ref.current!.height);
        }
        userEvents.current.lines.forEach(({ points, lineWidth, isRounded }) => {
            drawingContext.current.beginPath();
            drawingContext.current.lineCap = isRounded ? 'round' : 'butt';
            drawingContext.current.lineWidth = lineWidth;
            drawingContext.current.moveTo(points[0].x, points[0].y);
            points.slice(1).forEach(({ x, y }) => {
                drawingContext.current.lineTo(x, y);
            });
            drawingContext.current.stroke();
        });
        drawingContext.current.lineWidth = getLineWidth(lineWidth);
        drawingContext.current.lineCap = isRounded ? 'round' : 'butt';
        userEvents.current.texts.forEach(({ coords: { x, y }, text }) => {
            drawingContext.current.fillStyle = 'black';
            drawingContext.current.fillText(text, x, y + getFontSize(fontSize));
        });
    };

    const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextText = e.target.value;
        setText(nextText);
        userEvents.current.texts.at(-1)!.text = nextText;
        redraw();
    };

    const onChangeFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextFontSize = e.target.value;
        setFontSize(nextFontSize);
        drawingContext.current.font = getFont(getFontSize(nextFontSize));
        redraw();
    };

    const onChangeLineWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextLineWidth = e.target.value;
        setLineWidth(nextLineWidth);
        drawingContext.current.lineWidth = getLineWidth(nextLineWidth);
    };

    const revert = () => {
        userEvents.current.lines = userEvents.current.lines.slice(0, -1);
        redraw();
    };

    const toggleIsWhiteBackgroundJpeg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextChecked = e.target.checked;
        setIsWhiteBackgroundJpeg(nextChecked);
        redraw(nextChecked);
    };

    const toggleIsRounded = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextChecked = e.target.checked;
        setIsRounded(nextChecked);
        drawingContext.current.lineCap = nextChecked ? 'round' : 'butt';
    };

    return (
        <>
            <div className={'canvas-bg'} style={{ backgroundImage: `url(${imageData})` }} />
            <canvas
                width={widthAndHeight}
                height={widthAndHeight}
                ref={ref}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                onMouseMove={onMouseMove}
                onTouchMove={onMouseMove}
                onMouseUp={onMouseUp}
                onTouchEnd={onMouseUp}
                onMouseLeave={onMouseUp}
            />
            <footer>
                <div className="buttons">
                    {isPlaceText && (
                        <label>
                            Text
                            <input autoFocus onChange={onChangeText} value={text} />
                        </label>
                    )}
                    {isPlaceText && (
                        <label>
                            Font Size
                            <input type="number" onChange={onChangeFontSize} value={fontSize} />
                        </label>
                    )}
                    {!isPlaceText && (
                        <label>
                            <input
                                type="checkbox"
                                onChange={toggleIsWhiteBackgroundJpeg}
                                checked={isWhiteBackgroundJpeg}
                            />
                            As Jpeg
                        </label>
                    )}
                    {!isPlaceText && (
                        <label>
                            <input type="checkbox" onChange={toggleIsRounded} checked={isRounded} />
                            Rounded
                        </label>
                    )}
                    {!isPlaceText && (
                        <label>
                            Line Width
                            <input type="number" onChange={onChangeLineWidth} value={lineWidth} />
                        </label>
                    )}
                    <button onClick={onPlaceText}>
                        {isPlaceText ? 'Draw' : <img src={TextFieldsIcon} alt="add text" />}
                    </button>
                    <button onClick={revert}>Revert</button>
                    <DownloadButton format={isWhiteBackgroundJpeg ? 'jpeg' : 'png'} />
                </div>
            </footer>
        </>
    );
};
