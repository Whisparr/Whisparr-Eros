import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';

// Still reads the download clients slice: that section converts in its own PR,
// and pulling `GET /downloadclient` into a query here would fetch it twice --
// once into the slice the settings page still populates, once into the cache.
export default function useDownloadClientHostOptions() {
  return useSelector(
    createSelector(
      (state: AppState) => state.settings.downloadClients.items,
      (downloadClients) => {
        const hosts = downloadClients.reduce<Record<string, string[]>>(
          (acc, downloadClient) => {
            const name = downloadClient.name;
            const host = downloadClient.fields.find((field) => {
              return field.name === 'host';
            });

            if (host) {
              const hostValue = host.value as string;

              const group = (acc[hostValue] = acc[hostValue] || []);
              group.push(name);
            }

            return acc;
          },
          {}
        );

        return Object.keys(hosts).map((host) => {
          return {
            key: host,
            value: host,
            hint: `${hosts[host].join(', ')}`,
          };
        });
      }
    )
  );
}
