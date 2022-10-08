import React, { useState } from 'react';
import { Drawing } from './Drawing';
import { Cropping } from './Cropping';

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
    const [uploadedImageData, setUploadedImageData] = useState<string | undefined>();
    const [imageData, setImageData] = useState<string | undefined>();
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        readURL(e, setUploadedImageData);
    };
    return (
        <main>
            {imageData ? (
                <Drawing imageData={imageData} />
            ) : uploadedImageData ? (
                <Cropping imageData={uploadedImageData} setImageData={setImageData} />
            ) : (
                <input type="file" onChange={onChange} />
            )}
        </main>
    );
};
