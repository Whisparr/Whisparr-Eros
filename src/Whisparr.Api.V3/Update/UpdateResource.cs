using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Update;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Update
{
    public class UpdateResource : RestResource
    {
        public Version Version { get; set; }

        public string Branch { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string FileName { get; set; }
        public string Url { get; set; }
        public bool Installed { get; set; }
        public DateTime? InstalledOn { get; set; }
        public bool Installable { get; set; }
        public bool Latest { get; set; }
        public UpdateChanges Changes { get; set; }
        public string Hash { get; set; }
    }

    public static class UpdateResourceMapper
    {
        public static UpdateResource ToResource(this UpdatePackage model)
        {
            if (model == null)
            {
                return null;
            }

            return new UpdateResource
            {
                Version = model.DotNetVersion,
                Branch = model.Branch,
                ReleaseDate = model.ReleaseDate,
                FileName = model.FileName,
                Url = model.Url,

                // Installed
                // Installable
                // Latest
                Changes = model.Changes,
                Hash = model.Hash,
            };
        }

        public static List<UpdateResource> ToResource(this IEnumerable<UpdatePackage> models)
        {
            return models
                .OrderByDescending(m => m?.DotNetVersion, Comparer<Version>.Create((a, b) =>
                {
                    if (a == null && b == null)
                    {
                        return 0;
                    }

                    if (a == null)
                    {
                        return -1;
                    }

                    if (b == null)
                    {
                        return 1;
                    }

                    return a.CompareTo(b);
                }))
                .Select(ToResource)
                .ToList();
        }
    }
}
