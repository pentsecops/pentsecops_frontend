import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useChatbot } from '../../contexts/ChatbotContext';

interface TextHighlightTooltipProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function TextHighlightTooltip({ text, position, onClose }: TextHighlightTooltipProps) {
  const { openChat, setContextText } = useChatbot();

  const handleAskMore = () => {
    setContextText(text);
    openChat();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[9999] pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-500 p-3 max-w-xs">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                Selected Text
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 break-words">
                "{text}"
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              AI explanation will be available when connected to Ollama
            </p>
            <Button
              size="sm"
              onClick={handleAskMore}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Ask AI About This
            </Button>
          </div>
        </div>
        {/* Arrow pointing down */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-500"
        />
      </motion.div>
    </AnimatePresence>
  );
}
