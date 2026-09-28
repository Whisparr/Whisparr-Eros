import KeysMatching from 'typings/Helpers/KeysMatching';

function selectUniqueIds<T, K>(
  items: ReadonlyArray<T>,
  idProp: KeysMatching<T, K>
) {
  return items.reduce((acc: K[], item) => {
    if (item[idProp] && acc.indexOf(item[idProp] as K) === -1) {
      acc.push(item[idProp] as K);
    }

    return acc;
  }, []);
}

export default selectUniqueIds;
