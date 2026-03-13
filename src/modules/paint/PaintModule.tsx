import PaintProvider from './context/providers/PaintProvider';
import ReplacementProvider from './context/providers/ReplacementProvider';
import SettingsProvider from './context/providers/SettingsProvider';
import PaintWorkspace from './PaintWorkspace';


const PaintModule = () => {
    return (
        <PaintProvider>
            <ReplacementProvider>
                <SettingsProvider>
                    <PaintWorkspace />
                </SettingsProvider>
            </ReplacementProvider>
        </PaintProvider>
    );
};

export default PaintModule;
