import { useState } from "react";
import { X, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTags } from "@/hooks/useTags";

interface TagInputProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

const TagInput = ({ selectedTags, onChange }: TagInputProps) => {
    const { tags, createTag } = useTags();
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<typeof tags>([]);

    const handleInputChange = (value: string) => {
        setInput(value);
        if (value.trim()) {
            const filtered = tags.filter(t =>
                t.name.toLowerCase().includes(value.toLowerCase()) &&
                !selectedTags.includes(t.name)
            ).slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const addTag = async (name: string) => {
        const formattedName = name.trim();
        if (!formattedName) return;

        if (!selectedTags.includes(formattedName)) {
            onChange([...selectedTags, formattedName]);

            // Ensure it exists in DB (optimistic)
            if (!tags.find(t => t.name === formattedName)) {
                await createTag(formattedName);
            }
        }
        setInput("");
        setSuggestions([]);
    };

    const removeTag = (tagToRemove: string) => {
        onChange(selectedTags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(input);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 flex items-center gap-1 bg-slate-800 text-slate-200 hover:bg-slate-700 pointer-events-none"
                    >
                        <span className="text-xs">#</span>
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 p-0.5 hover:bg-slate-600 rounded-full pointer-events-auto cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Hash className="w-4 h-4" />
                </div>
                <Input
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Voeg tags toe (druk op Enter)"
                    className="pl-9 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />

                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E293B] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        {suggestions.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => addTag(tag.name)}
                                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="w-3 h-3 text-slate-500 group-hover:text-slate-400" />
                                    {tag.name}
                                </div>
                                <span className="text-xs text-slate-600">{tag.usage_count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagInput;
