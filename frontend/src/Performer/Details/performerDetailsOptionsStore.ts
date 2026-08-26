import { createDetailsOptionsStore } from 'Components/detailsOptionsStore';

const { useOption, setView, setPosterOption } = createDetailsOptionsStore(
  'performer_details_options'
);

export const usePerformerDetailsOption = useOption;
export const setPerformerDetailsView = setView;
export const setPerformerDetailsPosterOption = setPosterOption;
