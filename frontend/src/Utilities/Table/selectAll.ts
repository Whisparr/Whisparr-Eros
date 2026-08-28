import { SelectedState, SelectState } from 'Helpers/Hooks/useSelectState';

function selectAll(
  selectedState: SelectedState,
  selected: boolean
): SelectState {
  const newSelectedState = Object.keys(selectedState).reduce(
    (result: SelectedState, item) => {
      result[item] = selected;

      return result;
    },
    {}
  );

  return {
    allSelected: selected,
    allUnselected: !selected,
    lastToggled: null,
    selectedState: newSelectedState,
  };
}

export default selectAll;
