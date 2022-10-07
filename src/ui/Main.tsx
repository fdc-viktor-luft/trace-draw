import React, { useState } from 'react';
import { Drawing } from './Drawing';

const readURL = (event: React.ChangeEvent<HTMLInputElement>, setImageData: (data: string) => void) => {
    const firstFile = event.target.files?.[0];
    if (firstFile) {
        const reader = new FileReader();

        reader.onload = (e) => {
            setImageData(e.target!.result as string);
        };

        reader.readAsDataURL(firstFile);
    }
};

export const Main: React.FC = () => {
    const [imageData, setImageData] = useState<string | undefined>();
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        readURL(e, setImageData);
    };
    return (
        <main>
            {imageData ? (
                <>
                    <img alt="uploaded image" src={imageData} />
                    <Drawing />
                </>
            ) : (
                <input type="file" onChange={onChange} />
            )}
        </main>
    );
};
