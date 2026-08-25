import { createDetailsOptionsStore } from 'Components/detailsOptionsStore';

const { useOption, setView, setPosterOption } = createDetailsOptionsStore(
  'studio_details_options'
);

export const useStudioDetailsOption = useOption;
export const setStudioDetailsView = setView;
export const setStudioDetailsPosterOption = setPosterOption;
