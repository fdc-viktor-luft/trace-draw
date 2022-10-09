import { createStore } from 'react-use-sub';

export type State = {
    uploadedImageData?: string;
    imageData?: string;
    widthAndHeight: number;
};

const [useSub, Store] = createStore<State>({ widthAndHeight: 1000 });

export { useSub, Store };
