using System;
using System.Text.Json;
using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;
using NzbDrone.Core.ImportLists.StashDB;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(017)]
    public class migrate_stashdb_enum_fields : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // Read all relevant rows into memory first, then update as needed (avoids holding SELECT open during UPDATE)
            Execute.WithConnection((conn, tran) =>
            {
                var importLists = new System.Collections.Generic.List<(int Id, System.Text.Json.Nodes.JsonObject SettingsObj)>();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "SELECT \"Id\", \"Settings\", \"Implementation\" FROM \"ImportLists\" WHERE \"Implementation\" LIKE 'StashDB%'";
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var id = reader.GetInt32(0);
                            var settingsJson = reader.GetString(1);

                            var settingsObj = System.Text.Json.Nodes.JsonNode.Parse(settingsJson) as System.Text.Json.Nodes.JsonObject;
                            importLists.Add((id, settingsObj));
                        }
                    }
                }

                foreach (var (id, settingsObj) in importLists)
                {
                    var changed = false;
                    changed |= ConvertEnumField(settingsObj, "sort", typeof(SceneSort), id);
                    changed |= ConvertEnumField(settingsObj, "studiosFilter", typeof(FilterModifier), id);
                    changed |= ConvertEnumField(settingsObj, "tagsFilter", typeof(FilterModifier), id);
                    changed |= ConvertEnumField(settingsObj, "filter", typeof(FavoriteFilter), id);

                    if (changed)
                    {
                        var newJson = settingsObj.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
                        using (var updateCmd = conn.CreateCommand())
                        {
                            updateCmd.CommandText = "UPDATE \"ImportLists\" SET \"Settings\" = @settings WHERE \"Id\" = @id";
                            var settingsParam = updateCmd.CreateParameter();
                            settingsParam.ParameterName = "@settings";
                            settingsParam.Value = newJson;
                            updateCmd.Parameters.Add(settingsParam);

                            var idParam = updateCmd.CreateParameter();
                            idParam.ParameterName = "@id";
                            idParam.Value = id;
                            updateCmd.Parameters.Add(idParam);

                            updateCmd.ExecuteNonQuery();
                        }
                    }
                }
            });
        }

        private static bool ConvertEnumField(object settings, string field, Type enumType, int id)
        {
            var obj = settings as System.Text.Json.Nodes.JsonObject;
            if (obj == null || !obj.ContainsKey(field))
            {
                return false;
            }

            var valueNode = obj[field];
            if (valueNode is System.Text.Json.Nodes.JsonValue jsonValue)
            {
                if (jsonValue.TryGetValue<string>(out var str))
                {
                    if (Enum.TryParse(enumType, str, true, out var enumValue))
                    {
                        obj[field] = (int)enumValue;
                        Console.WriteLine($"[Migration] ImportList Id={id} Field={field} Converted '{str}' to {(int)enumValue}");
                        return true;
                    }
                }
            }

            return false;
        }
    }
}
