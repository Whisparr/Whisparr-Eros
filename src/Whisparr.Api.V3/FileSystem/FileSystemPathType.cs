namespace Whisparr.Api.V3.FileSystem
{
    // Only the two values GET filesystem/type can return. FileSystemEntityType also has Parent and
    // Drive, which this endpoint never answers with and so should not advertise.
    public enum FileSystemPathType
    {
        File,
        Folder
    }
}
