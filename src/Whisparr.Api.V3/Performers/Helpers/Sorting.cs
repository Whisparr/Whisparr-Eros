using NzbDrone.Core.Movies.Performers;

namespace Whisparr.Api.V3.Performers.Helpers
{
    public static class Sorting
    {
        public static object GetSortValue(Performer performer, string sortKey)
        {
            switch (sortKey.ToLowerInvariant())
            {
                case "name": return performer.Name;
                case "sortname": return performer.SortName;
                case "careerstart": return performer.CareerStart;
                case "careerend": return performer.CareerEnd;
                case "age": return performer.Age;
                case "country": return performer.Country;
                case "status": return performer.Status;
                case "gender": return performer.Gender;
                case "haircolor": return performer.HairColor;
                default: return performer.SortName;
            }
        }
    }
}
