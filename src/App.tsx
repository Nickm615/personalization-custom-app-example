import { useAppContext } from "./contexts/AppContext";
import { PersonalizationPanel } from "./components/PersonalizationPanel/PersonalizationPanel";

const App = () => {
  const context = useAppContext();

  return (
    <PersonalizationPanel
      environmentId={context.environmentId}
      itemId={context.contentItemId}
      languageId={context.languageId}
    />
  );
};

export default App;
