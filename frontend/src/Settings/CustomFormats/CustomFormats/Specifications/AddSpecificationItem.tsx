import React, { useCallback } from 'react';
import Card from 'Components/Card';
import Button from 'Components/Link/Button';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import { sizes } from 'Helpers/Props';
import { CustomFormatSpecification } from 'typings/CustomFormat';
import translate from 'Utilities/String/translate';
import AddSpecificationPresetMenuItem from './AddSpecificationPresetMenuItem';
import styles from './AddSpecificationItem.css';

export interface SelectedSpecification {
  implementation: string;
  presetName?: string;
}

interface AddSpecificationItemProps {
  implementation: string;
  implementationName: string;
  infoLink?: string;
  presets?: CustomFormatSpecification[];
  onSpecificationSelect: (selected: SelectedSpecification) => void;
}

export default function AddSpecificationItem({
  implementation,
  implementationName,
  infoLink,
  presets,
  onSpecificationSelect,
}: Readonly<AddSpecificationItemProps>) {
  const handleSpecificationSelect = useCallback(() => {
    onSpecificationSelect({ implementation });
  }, [implementation, onSpecificationSelect]);

  // The preset menu items report the name they were built from, which is how
  // the picked preset is found again in `useSelectedSchema`'s lookup.
  const handlePresetSelect = useCallback(
    ({ name }: { name: string }) => {
      onSpecificationSelect({ implementation, presetName: name });
    },
    [implementation, onSpecificationSelect]
  );

  const hasPresets = !!presets && !!presets.length;

  return (
    <Card
      className={styles.specification}
      overlayClassName={styles.overlay}
      overlayContent={true}
      aria-label={translate('AddConditionImplementation', {
        implementationName,
      })}
      onPress={handleSpecificationSelect}
    >
      <div className={styles.name}>{implementationName}</div>

      <div className={styles.actions}>
        {hasPresets ? (
          <span>
            <Button size={sizes.SMALL} onPress={handleSpecificationSelect}>
              {translate('Custom')}
            </Button>

            <Menu className={styles.presetsMenu}>
              <Button className={styles.presetsMenuButton} size={sizes.SMALL}>
                {translate('Presets')}
              </Button>

              <MenuContent>
                {presets.map((preset, index) => {
                  return (
                    <AddSpecificationPresetMenuItem
                      key={index}
                      name={preset.name}
                      implementation={implementation}
                      onPress={handlePresetSelect}
                    />
                  );
                })}
              </MenuContent>
            </Menu>
          </span>
        ) : null}

        {infoLink ? (
          <Button to={infoLink} size={sizes.SMALL}>
            {translate('MoreInfo')}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
