import React, { HTMLProps, useCallback, useState } from 'react';
import ReactSlider from 'react-slider';
import NumberInput from 'Components/Form/NumberInput';
import TextInput from 'Components/Form/TextInput';
import Label from 'Components/Label';
import Popover from 'Components/Tooltip/Popover';
import { kinds, tooltipPositions } from 'Helpers/Props';
import Quality from 'Quality/Quality';
import { InputChanged } from 'typings/inputs';
import formatBytes from 'Utilities/Number/formatBytes';
import roundNumber from 'Utilities/Number/roundNumber';
import translate from 'Utilities/String/translate';
import QualityDefinitionLimits from './QualityDefinitionLimits';
import { useManageQualityDefinitions } from './useQualityDefinitions';
import styles from './QualityDefinition.css';

const MIN = 0;
const MAX = 2000;
const MIN_DISTANCE = 1;

const slider = {
  min: MIN,
  max: roundNumber(Math.pow(MAX, 1 / 1.1)),
  step: 0.1,
};

// The preferred thumb parks three steps below the top when the size is
// unlimited, so that it stays distinguishable from the max thumb.
const SLIDER_PREFERRED_UNLIMITED = slider.max - 3;

function renderThumb(props: HTMLProps<HTMLDivElement>) {
  return <div {...props} className={styles.thumb} />;
}

function renderTrack(props: HTMLProps<HTMLDivElement>) {
  return <div {...props} className={styles.track} />;
}

function getValue(inputValue: number) {
  if (inputValue < MIN) {
    return MIN;
  }

  if (inputValue > MAX) {
    return MAX;
  }

  return roundNumber(inputValue);
}

function getSliderValue(value: number | null, defaultValue: number) {
  const sliderValue = value ? Math.pow(value, 1 / 1.1) : defaultValue;

  return roundNumber(sliderValue);
}

interface Size {
  minSize: number | null;
  maxSize: number | null;
  preferredSize: number | null;
}

interface QualityDefinitionProps {
  id: number;
  quality: Quality;
  title: string;
  minSize: number | null;
  maxSize: number | null;
  preferredSize: number | null;
  advancedSettings: boolean;
  updateDefinition: ReturnType<
    typeof useManageQualityDefinitions
  >['updateDefinition'];
}

function QualityDefinition({
  id,
  quality,
  title,
  minSize,
  maxSize,
  preferredSize,
  advancedSettings,
  updateDefinition,
}: Readonly<QualityDefinitionProps>) {
  const [sliderMinSize, setSliderMinSize] = useState(
    getSliderValue(minSize, slider.min)
  );
  const [sliderMaxSize, setSliderMaxSize] = useState(
    getSliderValue(maxSize, slider.max)
  );
  const [sliderPreferredSize, setSliderPreferredSize] = useState(
    getSliderValue(preferredSize, SLIDER_PREFERRED_UNLIMITED)
  );

  const handleTitleChange = useCallback(
    ({ value }: InputChanged<string>) => {
      updateDefinition(id, 'title', value);
    },
    [id, updateDefinition]
  );

  const handleSizeChange = useCallback(
    (size: Size) => {
      if (size.minSize !== minSize) {
        updateDefinition(id, 'minSize', size.minSize);
      }

      if (size.maxSize !== maxSize) {
        updateDefinition(id, 'maxSize', size.maxSize);
      }

      if (size.preferredSize !== preferredSize) {
        updateDefinition(id, 'preferredSize', size.preferredSize);
      }
    },
    [id, minSize, maxSize, preferredSize, updateDefinition]
  );

  const handleSliderChange = useCallback(
    (value: number | number[]) => {
      const [newMinSize, newPreferredSize, newMaxSize] = value as number[];

      setSliderMinSize(newMinSize);
      setSliderPreferredSize(newPreferredSize);
      setSliderMaxSize(newMaxSize);

      handleSizeChange({
        minSize: roundNumber(Math.pow(newMinSize, 1.1)),
        preferredSize:
          newPreferredSize === SLIDER_PREFERRED_UNLIMITED
            ? null
            : roundNumber(Math.pow(newPreferredSize, 1.1)),
        maxSize:
          newMaxSize === slider.max
            ? null
            : roundNumber(Math.pow(newMaxSize, 1.1)),
      });
    },
    [handleSizeChange]
  );

  // The slider is uncontrolled while dragging, so once the drag ends the thumbs
  // are pulled back onto whatever the pending change actually holds.
  const handleAfterSliderChange = useCallback(() => {
    setSliderMinSize(getSliderValue(minSize, slider.min));
    setSliderMaxSize(getSliderValue(maxSize, slider.max));
    setSliderPreferredSize(
      getSliderValue(preferredSize, SLIDER_PREFERRED_UNLIMITED)
    );
  }, [minSize, maxSize, preferredSize]);

  const handleMinSizeChange = useCallback(
    ({ value }: InputChanged<number | null>) => {
      const newMinSize = getValue(value ?? MIN);

      setSliderMinSize(getSliderValue(newMinSize, slider.min));

      handleSizeChange({ minSize: newMinSize, maxSize, preferredSize });
    },
    [maxSize, preferredSize, handleSizeChange]
  );

  const handlePreferredSizeChange = useCallback(
    ({ value }: InputChanged<number | null>) => {
      const newPreferredSize =
        value == null || value === MAX - MIN_DISTANCE ? null : getValue(value);

      setSliderPreferredSize(
        getSliderValue(newPreferredSize, SLIDER_PREFERRED_UNLIMITED)
      );

      handleSizeChange({ minSize, maxSize, preferredSize: newPreferredSize });
    },
    [minSize, maxSize, handleSizeChange]
  );

  const handleMaxSizeChange = useCallback(
    ({ value }: InputChanged<number | null>) => {
      const newMaxSize =
        value == null || value === MAX ? null : getValue(value);

      setSliderMaxSize(getSliderValue(newMaxSize, slider.max));

      handleSizeChange({ minSize, maxSize: newMaxSize, preferredSize });
    },
    [minSize, preferredSize, handleSizeChange]
  );

  const minBytes = (minSize ?? 0) * 1024 * 1024;
  const minSixty = `${formatBytes(minBytes * 60)}/${translate('HourShorthand')}`;

  const preferredBytes = (preferredSize ?? 0) * 1024 * 1024;
  const preferredSixty = preferredBytes
    ? `${formatBytes(preferredBytes * 60)}/${translate('HourShorthand')}`
    : translate('Unlimited');

  const maxBytes = maxSize && maxSize * 1024 * 1024;
  const maxSixty = maxBytes
    ? `${formatBytes(maxBytes * 60)}/${translate('HourShorthand')}`
    : translate('Unlimited');

  return (
    <div className={styles.qualityDefinition}>
      <div className={styles.quality}>{quality.name}</div>

      <div className={styles.title}>
        <TextInput
          name={`${id}.${title}`}
          value={title}
          onChange={handleTitleChange}
        />
      </div>

      <div className={styles.sizeLimit}>
        <ReactSlider
          className={styles.slider}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          minDistance={MIN_DISTANCE * 3}
          value={[sliderMinSize, sliderPreferredSize, sliderMaxSize]}
          withTracks={true}
          allowCross={false}
          snapDragDisabled={true}
          pearling={true}
          renderThumb={renderThumb}
          renderTrack={renderTrack}
          onChange={handleSliderChange}
          onAfterChange={handleAfterSliderChange}
        />

        <div className={styles.sizes}>
          <div>
            <Popover
              anchor={<Label kind={kinds.INFO}>{minSixty}</Label>}
              title={translate('MinimumLimits')}
              body={
                <QualityDefinitionLimits
                  bytes={minBytes}
                  message={translate('NoMinimumForAnyRuntime')}
                />
              }
              position={tooltipPositions.BOTTOM}
            />
          </div>

          <div>
            <Popover
              anchor={<Label kind={kinds.SUCCESS}>{preferredSixty}</Label>}
              title={translate('PreferredSize')}
              body={
                <QualityDefinitionLimits
                  bytes={preferredBytes}
                  message={translate('NoLimitForAnyRuntime')}
                />
              }
              position={tooltipPositions.BOTTOM}
            />
          </div>

          <div>
            <Popover
              anchor={<Label kind={kinds.WARNING}>{maxSixty}</Label>}
              title={translate('MaximumLimits')}
              body={
                <QualityDefinitionLimits
                  bytes={maxBytes}
                  message={translate('NoLimitForAnyRuntime')}
                />
              }
              position={tooltipPositions.BOTTOM}
            />
          </div>
        </div>
      </div>

      {advancedSettings ? (
        <div className={styles.megabytesPerMinute}>
          <div>
            {translate('Min')}

            <NumberInput
              className={styles.sizeInput}
              name={`${id}.min`}
              value={minSize || MIN}
              min={MIN}
              max={
                preferredSize
                  ? preferredSize - MIN_DISTANCE
                  : MAX - MIN_DISTANCE
              }
              step={0.1}
              isFloat={true}
              onChange={handleMinSizeChange}
            />
          </div>

          <div>
            {translate('Preferred')}

            <NumberInput
              className={styles.sizeInput}
              name={`${id}.preferred`}
              value={preferredSize || MAX - MIN_DISTANCE}
              min={MIN}
              max={maxSize ? maxSize - MIN_DISTANCE : MAX - MIN_DISTANCE}
              step={0.1}
              isFloat={true}
              onChange={handlePreferredSizeChange}
            />
          </div>

          <div>
            {translate('Max')}

            <NumberInput
              className={styles.sizeInput}
              name={`${id}.max`}
              value={maxSize || MAX}
              min={(minSize ?? 0) + MIN_DISTANCE}
              max={MAX}
              step={0.1}
              isFloat={true}
              onChange={handleMaxSizeChange}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default QualityDefinition;
