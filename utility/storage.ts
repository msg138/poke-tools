export const getSavedToken = (): string | null => {
    return JSON.parse(window.localStorage.getItem('api_token') || 'null');
};

export const saveToken = (token: string): void => {
    window.localStorage.setItem('api_token', JSON.stringify(token));
};
