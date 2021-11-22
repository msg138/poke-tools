import { useState } from 'react';

const useToggle = (defaultState = false): [boolean, () => void, () => void, () => void] => {
    const [state, setState] = useState(defaultState);

    const toggle = () => {
        setState((currentState) => !currentState);
    };

    const active = () => {
        setState(true);
    };

    const inactive = () => {
        setState(false);
    };

    return [state, toggle, active, inactive];
};

export default useToggle;

