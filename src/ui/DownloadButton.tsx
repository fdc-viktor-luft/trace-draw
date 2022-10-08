import React from 'react';

type Format = 'jpeg' | 'png';

const download = (format: Format) => {
    const link = document.createElement('a');
    link.download = 'trace-draw.' + format;
    link.href = document.querySelector('canvas')!.toDataURL('image/' + format);
    link.click();
};

type DownloadButtonProps = { format: Format };

export const DownloadButton: React.FC<DownloadButtonProps> = ({ format }) => (
    <button onClick={() => download(format)}>Download</button>
);
