
import type { SelectableOption } from '@/data/api/AgentApiClient';

interface SelectableOptionsProps {
    options: SelectableOption[];
    onSelect: (value: string) => void;
}

/**
 * Selectable options component for clarification questions
 */
export const SelectableOptions: React.FC<SelectableOptionsProps> = ({ options, onSelect }) => {
    const { t } = useTranslation();

    return (
        <div className="selectable-options">
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onSelect(option.value)}
                    className="selectable-option"
                    type="button"
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};
