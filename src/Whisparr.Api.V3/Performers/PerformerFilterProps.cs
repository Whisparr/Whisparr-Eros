namespace Whisparr.Api.V3.Performers
{
    public static class PerformerFilterProps
    {
        public enum NumberOperators
        {
            Equal,
            NotEqual,
            GreaterThan,
            LessThan,
            GreaterThanOrEqual,
            LessThanOrEqual
        }

        public enum EqualityOperators
        {
            Equal,
            NotEqual
        }

        public enum ContainsOperators
        {
            Contains,
            DoesNotContain
        }
    }
}
