import React, { useEffect, useRef } from 'react';
import { Coords, getEventCoords, getNumber, TouchOrMouseEvent } from './common';
import { Store, useSub } from '../store';

type CroppingValues = { x: number; y: number; width: number; height: number; background: HTMLImageElement };

const getMinDim = (image: HTMLImageElement): number => Math.min(image.width, image.height);

const getLineWidth = (image: HTMLImageElement): number => {
    const minDim = getMinDim(image);
    return Math.floor(minDim / 200);
};

const restore = (ctx: CanvasRenderingContext2D, background: HTMLImageElement) => {
    ctx.clearRect(0, 0, background.width, background.height);
    ctx.drawImage(background, 0, 0);
};

const drawCoppingRect = (ctx: CanvasRenderingContext2D, { x, y, width, height, background }: CroppingValues) => {
    const lintWidth = getLineWidth(background);
    restore(ctx, background);

    ctx.lineWidth = lintWidth;
    ctx.strokeStyle = 'green';
    ctx.setLineDash([3 * lintWidth, 3 * lintWidth]);
    ctx.strokeRect(x, y, width, height);
};

const convertToCoords = (e: TouchOrMouseEvent, canvas: HTMLCanvasElement): Coords => {
    const { x: xEvent, y: yEvent } = getEventCoords(e);
    const { x: xCanvas, y: yCanvas, width, height } = canvas.getBoundingClientRect();

    const xRate = (xEvent - xCanvas) / width;
    const yRate = (yEvent - yCanvas) / height;

    const x = xRate * canvas.width;
    const y = yRate * canvas.height;

    return { x, y };
};

const getWidthAndHeight = (str: string): number => getNumber(str, 1000);

export type CroppingProps = { imageData: string; setImageData: (data: string) => void };

export const Cropping: React.FC<CroppingProps> = ({ imageData, setImageData }) => {
    const ref = useRef<HTMLCanvasElement>(null);
    const ctx = useRef<CanvasRenderingContext2D>(null!);
    const croppingValues = useRef<CroppingValues>(null!);
    const mouseEnterPos = useRef<Coords & { time: number; startWidth: number }>();
    const { widthAndHeight } = useSub((s) => s);

    const onMouseDown = (e: TouchOrMouseEvent) => {
        mouseEnterPos.current = {
            ...convertToCoords(e, ref.current!),
            time: Date.now(),
            startWidth: croppingValues.current.width,
        };
    };

    const onMouseMove = (e: TouchOrMouseEvent) => {
        if (mouseEnterPos.current) {
            const canvas = ref.current!;
            const { x } = convertToCoords(e, canvas);
            const { x: xStart, startWidth } = mouseEnterPos.current;

            const nextWidth = Math.max(canvas.width * 0.05, startWidth + x - xStart);
            croppingValues.current.width = nextWidth;
            croppingValues.current.height = nextWidth;
            drawCoppingRect(ctx.current, croppingValues.current);
        }
    };

    const onMouseUp = (e: TouchOrMouseEvent) => {
        if (mouseEnterPos.current) {
            const canvas = ref.current!;
            const { x, y } = convertToCoords(e, canvas);
            const { time } = mouseEnterPos.current;

            const wasClick = Date.now() - time < 200;

            const currentWidth = croppingValues.current.width;
            if (wasClick) {
                const nextX = x - currentWidth / 2;
                const nextY = y - currentWidth / 2;
                croppingValues.current.x = Math.min(Math.max(0, nextX), canvas.width - currentWidth);
                croppingValues.current.y = Math.min(Math.max(0, nextY), canvas.height - currentWidth);
                drawCoppingRect(ctx.current, croppingValues.current);
            }

            mouseEnterPos.current = undefined;
        }
    };

    useEffect(() => {
        const canvas = ref.current!;
        ctx.current = canvas.getContext('2d')!;
        const background = new Image();
        background.src = imageData;

        background.onload = () => {
            ctx.current.setLineDash([5, 15]);
            canvas.width = background.width;
            canvas.height = background.height;
            const minDim = getMinDim(background);
            croppingValues.current = { x: 0, y: 0, width: minDim, height: minDim, background };
            drawCoppingRect(ctx.current, croppingValues.current);
        };
    }, [imageData]);

    const onDone = () => {
        const canvas = ref.current!;
        const { x, y, width, height, background } = croppingValues.current;
        restore(ctx.current, background);
        const imageData = ctx.current.getImageData(x, y, width, height);

        ctx.current.clearRect(0, 0, canvas.width, canvas.width);

        canvas.width = width;
        canvas.height = height;

        ctx.current.putImageData(imageData, 0, 0);

        setImageData(ref.current!.toDataURL());
    };

    const onChangeWidthAndHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        Store.set({ widthAndHeight: getWidthAndHeight(next) });
    };

    return (
        <div className="cropping">
            <canvas
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
                    <label>
                        Width And Height in Pixels
                        <input type="number" onChange={onChangeWidthAndHeight} value={widthAndHeight} />
                    </label>
                    <button onClick={onDone}>Done</button>
                </div>
            </footer>
        </div>
    );
};
