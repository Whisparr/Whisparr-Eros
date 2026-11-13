using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using FluentMigrator;
using Newtonsoft.Json.Linq;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(248)]
    public class remove_trakt_metadata_links : NzbDroneMigrationBase
    {
        private const int TmdbLink = 0;
        private const int TraktLink = 2;

        protected override void MainDbUpgrade()
        {
            Execute.WithConnection(RemoveTraktMetadataLinks);
        }

        private void RemoveTraktMetadataLinks(IDbConnection conn, IDbTransaction tran)
        {
            var updated = new List<object>();

            using (var getNotificationsCmd = conn.CreateCommand())
            {
                getNotificationsCmd.Transaction = tran;
                getNotificationsCmd.CommandText = "SELECT \"Id\", \"Settings\" FROM \"Notifications\" WHERE \"Implementation\" IN ('Gotify', 'Pushcut', 'Telegram')";

                using (var reader = getNotificationsCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var id = reader.GetInt32(0);
                        var settings = Json.Deserialize<JObject>(reader.GetString(1));

                        if (settings["metadataLinks"] is not JArray links || links.All(l => l.Value<int>() != TraktLink))
                        {
                            continue;
                        }

                        var remaining = links.Select(l => l.Value<int>()).Where(l => l != TraktLink).ToList();

                        settings["metadataLinks"] = new JArray(remaining);

                        if (settings.Value<int?>("preferredMetadataLink") == TraktLink)
                        {
                            settings["preferredMetadataLink"] = remaining.Count > 0 ? remaining[0] : TmdbLink;
                        }

                        updated.Add(new
                        {
                            Settings = settings.ToJson(),
                            Id = id
                        });
                    }
                }
            }

            var updateSql = "UPDATE \"Notifications\" SET \"Settings\" = @Settings WHERE \"Id\" = @Id";
            conn.Execute(updateSql, updated, transaction: tran);
        }
    }
}
