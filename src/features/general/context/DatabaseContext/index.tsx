import {createContext, ReactNode, useState} from "react";
import Database from '../../api/Database';

export const DatabaseContext = createContext<{
    database: Database | null;
    setDatabase: (database: Database | null) => void;
} | null>(null);

export interface DatabaseContextProviderProps {
    children: ReactNode;
}

const DatabaseContextProvider = (props: DatabaseContextProviderProps) => {
    const [database, setDatabase] = useState<Database | null>(null);

    return (
        <DatabaseContext.Provider
            value={{ database, setDatabase }}
        >
            {props.children}
        </DatabaseContext.Provider>
    );
};

export default DatabaseContextProvider;
