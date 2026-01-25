using System.Collections.Generic;
using System.Linq;
using Microsoft.IdentityModel.Tokens;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Performers;

namespace NzbDrone.Core.Movies.Credits
{
    public interface ICreditRepository : IBasicRepository<Credit>
    {
        List<Credit> FindByMovieMetadataId(int movieId);
        List<Credit> GetPerformerMovies(string performerForeignId);
        void DeleteForMovies(List<int> movieIds);
    }

    public class CreditRepository : BasicRepository<Credit>, ICreditRepository
    {
        public CreditRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<Credit> FindByMovieMetadataId(int movieMetadataId)
        {
            var builder = new SqlBuilder(_database.DatabaseType)
               .LeftJoin<Credit, Performer>((m, p) => m.PerformerForeignId == p.ForeignId)
               .Where<Credit>(x => x.MovieMetadataId == movieMetadataId);

            return _database.QueryJoined<Credit, Performer>(
                builder,
                (credit, performer) =>
                {
                    // Temporary mapping until the data populates in credits
                    if (credit.Images.Count == 0 && performer?.Images.Count > 0)
                    {
                        credit.Images = performer.Images;
                    }

                    if (credit.PersonName.IsNullOrEmpty() && performer?.Name.IsNotNullOrWhiteSpace() == true)
                    {
                        credit.PersonName = performer.Name;
                    }

                    var creditPerformer = new CreditPerformer();

                    creditPerformer.Id = performer?.Id ?? 0;
                    creditPerformer.ForeignId = performer?.ForeignId;
                    creditPerformer.TpdbId = performer?.TpdbId;
                    creditPerformer.TmdbId = performer?.TmdbId ?? 0;
                    creditPerformer.Monitored = performer?.Monitored == true;
                    creditPerformer.MoviesMonitored = performer?.MoviesMonitored == true;

                    credit.Performer = creditPerformer;

                    return credit;
                }).ToList();
        }

        public List<Credit> GetPerformerMovies(string performerForeignId)
        {
            var builder = new SqlBuilder(_database.DatabaseType)
               .Join<Credit, Performer>((m, p) => m.PerformerForeignId == p.ForeignId)
               .Where<Credit>(x => x.PerformerForeignId == performerForeignId);

            return _database.QueryJoined<Credit, Performer>(
                builder,
                (credit, performer) =>
                {
                    var creditPerformer = new CreditPerformer();

                    creditPerformer.Id = performer?.Id ?? 0;
                    creditPerformer.ForeignId = performer?.ForeignId;
                    creditPerformer.TpdbId = performer?.TpdbId;
                    creditPerformer.TmdbId = performer?.TmdbId ?? 0;
                    creditPerformer.Monitored = performer?.Monitored == true;
                    creditPerformer.MoviesMonitored = performer?.MoviesMonitored == true;

                    credit.Performer = creditPerformer;

                    return credit;
                }).ToList();
        }

        public void DeleteForMovies(List<int> movieIds)
        {
            Delete(x => movieIds.Contains(x.MovieMetadataId));
        }
    }
}
