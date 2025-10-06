import type { SortDropdownOption, SortingOption } from "../../utils/types/playlistPage";
import Dropdown, { type DropdownItem } from "./Dropdown";
import { FaSortAmountDown, FaSortAmountUpAlt } from "react-icons/fa";

interface SortDropdownProps {
    sortingOptions: SortDropdownOption[];
    value: SortingOption;
    onChange: (value: SortingOption) => void;
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

function SortDropdown({ sortingOptions, value, onChange }: SortDropdownProps) {
    return (
        <Dropdown
            items={getRegularDropdownProps(sortingOptions, onChange, value)}
            hasCaret={false}
            className="text-sm text-left"
        >
            {!value.ascending ? <FaSortAmountDown /> : <FaSortAmountUpAlt />}{sortingOptions.find(o => optionsEqual(o.option, value))?.label ?? 'Error'}
        </Dropdown>
    )
}

export default SortDropdown;