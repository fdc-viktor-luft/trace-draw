import React, { useState } from 'react';
import { Drawing } from './Drawing';
import { Cropping } from './Cropping';
import { AddImage } from './AddImage';
import { useSub } from '../store';

export const Main: React.FC = () => {
    const { uploadedImageData } = useSub((s) => s);
    const [imageData, setImageData] = useState<string | undefined>();
    return (
        <main>
            {imageData ? (
                <Drawing imageData={imageData} />
            ) : uploadedImageData ? (
                <Cropping imageData={uploadedImageData} setImageData={setImageData} />
            ) : (
                <AddImage />
            )}
        </main>
    );
};
