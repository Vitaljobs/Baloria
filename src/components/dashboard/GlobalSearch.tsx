import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import QuestionDetailModal from "./QuestionDetailModal";

const GlobalSearch = () => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const { search, results, loading, clear } = useSearch();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                search(query);
            } else {
                clear();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search, clear]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div ref={wrapperRef} className="relative w-full max-w-sm hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Zoeken..."
                        className="w-full h-9 pl-9 pr-8 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery("");
                                clear();
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {isOpen && (query.trim() || results.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full mt-2 w-full rounded-xl border border-slate-800 bg-[#0F172A] shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center p-6 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span className="text-xs">Zoeken...</span>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-3 pb-2 mb-2 border-b border-slate-800">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resultaten</span>
                                    </div>
                                    {results.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => {
                                                setSelectedQuestionId(result.id);
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-800/50 transition-colors flex items-start gap-3 group"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: `${result.theme_color}20`, color: result.theme_color }}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                                                    {result.question.replace(/(<([^>]+)>)/gi, "")}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                        {result.theme}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {formatDistanceToNow(new Date(result.created_at), { locale: nl, addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : query.length > 2 ? (
                                <div className="p-6 text-center text-slate-500 text-sm">
                                    Geen resultaten gevonden voor "{query}"
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <QuestionDetailModal
                isOpen={!!selectedQuestionId}
                onClose={() => setSelectedQuestionId(null)}
                questionId={selectedQuestionId}
            />
        </>
    );
};

export default GlobalSearch;
