import React from 'react';

const download = () => {
    const link = document.createElement('a');
    link.download = 'test.png';
    link.href = document.querySelector('canvas')!.toDataURL();
    link.click();
};

export const DownloadButton: React.FC = () => <button onClick={download}>Download</button>;
