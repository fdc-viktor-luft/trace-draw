import React from 'react';
import { Store } from '../store';
import AddImageIcon from '../assets/images/add_image.svg';

const readURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    const firstFile = event.target.files?.[0];
    if (firstFile) {
        const reader = new FileReader();

        reader.onload = (e) => {
            Store.set({ uploadedImageData: e.target!.result as string });
        };

        reader.readAsDataURL(firstFile);
    }
};

export const AddImage: React.FC = () => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        readURL(e);
    };
    return (
        <div className="add-image">
            <label>
                <input type="file" onChange={onChange} />
                <span>Choose an image</span>
                <img src={AddImageIcon} alt="Add image" />
            </label>
        </div>
    );
};
