import PaintWorkspace from './PaintWorkspace';
import PaintProvider from './providers/PaintProvider';
import ReplacementProvider from './providers/ReplacementProvider';
import SettingsProvider from './providers/SettingsProvider';

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
