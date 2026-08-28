import { SelectedState } from 'Helpers/Hooks/useSelectState';

export default function areAllSelected(selectedState: SelectedState) {
  const keys = Object.keys(selectedState);

  // If selectedState is empty, nothing is selected
  if (keys.length === 0) {
    return {
      allSelected: false,
      allUnselected: true,
    };
  }

  let allSelected = true;
  let allUnselected = true;

  keys.forEach((key) => {
    if (selectedState[key]) {
      allUnselected = false;
    } else {
      allSelected = false;
    }
  });

  return {
    allSelected,
    allUnselected,
  };
}
