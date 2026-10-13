import React, { useCallback } from 'react';
import { CalendarView } from 'Calendar/calendarViews';
import Button, { ButtonProps } from 'Components/Link/Button';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';

const getTitle = (view: CalendarView) => {
  switch (view) {
    case 'agenda':
      return translate('Agenda');
    case 'day':
      return translate('Day');
    case 'forecast':
      return translate('Forecast');
    case 'month':
      return translate('Month');
    case 'week':
      return translate('Week');
    default:
      return titleCase(view);
  }
};

interface CalendarHeaderViewButtonProps extends Omit<
  ButtonProps,
  'children' | 'onPress'
> {
  view: CalendarView;
  selectedView: CalendarView;
  onPress: (view: CalendarView) => void;
}

function CalendarHeaderViewButton({
  view,
  selectedView,
  onPress,
  ...otherProps
}: CalendarHeaderViewButtonProps) {
  const handlePress = useCallback(() => {
    onPress(view);
  }, [view, onPress]);

  return (
    <Button
      isDisabled={selectedView === view}
      {...otherProps}
      onPress={handlePress}
    >
      {getTitle(view)}
    </Button>
  );
}

export default CalendarHeaderViewButton;
