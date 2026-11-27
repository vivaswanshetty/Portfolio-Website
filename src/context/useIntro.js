import { createContext, useContext } from 'react';

export const IntroContext = createContext(null);

export const useIntro = () => {
    const ctx = useContext(IntroContext);
    if (!ctx) {
        throw new Error('useIntro must be used within an IntroProvider');
    }
    return ctx;
};
