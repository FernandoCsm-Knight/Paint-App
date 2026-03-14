import GraphProvider from './context/providers/GraphProvider';
import GraphSettingsProvider from './context/providers/GraphSettingsProvider';
import GraphWorkspace from './GraphWorkspace';

const GraphModule = () => {
    return (
        <GraphSettingsProvider>
            <GraphProvider>
                <GraphWorkspace />
            </GraphProvider>
        </GraphSettingsProvider>
    );
};

export default GraphModule;
