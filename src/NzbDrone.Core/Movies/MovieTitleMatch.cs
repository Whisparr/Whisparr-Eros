namespace NzbDrone.Core.Movies
{
    public class MovieTitleMatch
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string CleanTitle { get; set; }
        public ItemType ItemType { get; set; }
        public string ForeignId { get; set; }
    }
}
