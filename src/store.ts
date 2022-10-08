import { createStore } from 'react-use-sub';

export type State = {
    uploadedImageData?: string;
    imageData?: string;
};

const [useSub, Store] = createStore<State>({});

export { useSub, Store };
