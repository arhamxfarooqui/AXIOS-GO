import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CPWing from '@/components/wings/CPWing';
import DevWing from '@/components/wings/DevWing';
import MLWing from '@/components/wings/MLWing';

import AICoach from '@/components/AICoach';

const WingPage = () => {
    const { wing_id } = useParams<{ wing_id: string }>();

    const renderWingContent = () => {
        switch (wing_id?.toLowerCase()) {
            case 'cp':
                return <CPWing />;
            case 'dev':
            case 'web':
                return <DevWing />;
            case 'ml':
                return <MLWing />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Domain Not Found</h2>
                        <p className="text-gray-400">The technical wing you are looking for is not available in Phase 1.</p>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto p-6 min-h-screen pt-24">
            <AnimatePresence mode="wait">
                <motion.div
                    key={wing_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="mb-8">
                        <h1 className="text-5xl font-extrabold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">
                            {wing_id} Wing
                        </h1>
                        <div className="h-1 w-24 bg-purple-600 mt-2 rounded-full" />
                    </div>

                    {renderWingContent()}

                    {wing_id?.toLowerCase() !== 'cp' && (
                        <div className="mt-16">
                            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-purple-600 pl-4">
                                Interactive Coaching
                            </h3>
                            <AICoach wing={wing_id} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WingPage;
