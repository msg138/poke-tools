import {useContext} from "react";
import { DatabaseContext } from "./index";
import Database from "../../api/Database";

const useDatabaseContext = () => {
    return useContext(DatabaseContext) as {
        database: Database;
        setDatabase: (db: Database | null) => void;
    };
};

export default useDatabaseContext;
