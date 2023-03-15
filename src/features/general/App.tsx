import DatabaseContextProvider from "./context/DatabaseContext";
import DatabaseLoader from "./components/DatabaseLoader";

const App = () => {
    return (
        <DatabaseContextProvider>
            <DatabaseLoader />
        </DatabaseContextProvider>
    );
};

export default App;
