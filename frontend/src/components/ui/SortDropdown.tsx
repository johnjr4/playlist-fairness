import type { SortDropdownOption, SortingOption } from "../../utils/types/playlistPage";
import Dropdown, { type DropdownItem } from "./Dropdown";
import { FaSortAmountDown, FaSortAmountUpAlt } from "react-icons/fa";

interface SortDropdownProps {
    sortingOptions: SortDropdownOption[];
    value: SortingOption;
    onChange: (value: SortingOption) => void;
    className?: string;
    disabled?: boolean;
}

function optionsEqual(a: SortingOption, b: SortingOption) {
    return a.ascending === b.ascending && a.sortedOn === b.sortedOn;
}

function getRegularDropdownProps(sortingOptions: SortDropdownOption[], onChange: (value: SortingOption) => void, value: SortingOption): DropdownItem[] {
    return sortingOptions.map(o => {
        return {
            label: o.label,
            onClick: () => { onChange(o.option) },
            className: `${optionsEqual(o.option, value) ? 'text-dark-highlight' : undefined}`
        }
    });
}

function SortDropdown({ sortingOptions, value, onChange, className, disabled = false }: SortDropdownProps) {
    return (
        <Dropdown
            items={getRegularDropdownProps(sortingOptions, onChange, value)}
            hasCaret={false}
            buttonClassName={`${className}`}
            disabled={disabled}
        >
            <div className="w-full flex gap-0.5 items-center justify-center text-left">
                <div className="basis-4">
                    {!value.ascending ? <FaSortAmountDown /> : <FaSortAmountUpAlt />}
                </div>
                <div className="grow-1">
                    {sortingOptions.find(o => optionsEqual(o.option, value))?.label ?? 'Error'}
                </div>
            </div>
        </Dropdown>
    )
}

export default SortDropdown;