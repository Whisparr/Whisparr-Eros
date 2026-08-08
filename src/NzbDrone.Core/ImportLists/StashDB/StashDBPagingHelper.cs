namespace NzbDrone.Core.ImportLists.StashDB
{
    internal static class StashDBPagingHelper
    {
        public static int GetPageCount(int itemCount, int pageSize)
        {
            var pageCount = itemCount / pageSize;

            return itemCount % pageSize == 0 ? pageCount : pageCount + 1;
        }
    }
}
